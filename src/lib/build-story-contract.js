export const SCHEMA_VERSION = '1.0.0';
export const MAX_PAYLOAD_BYTES = 512 * 1024;

const COLLECTIONS = ['projects', 'hackathons', 'agents', 'activityEvents', 'milestones', 'evidence', 'rewardAccounts'];
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const STATES = {
  project: new Set(['discovery', 'building', 'testing', 'paused', 'shipped']),
  hackathon: new Set(['upcoming', 'active', 'submitted', 'complete']),
  agent: new Set(['active', 'waiting', 'complete']),
  activity: new Set(['commit', 'test', 'milestone', 'evidence', 'next_action']),
  milestone: new Set(['planned', 'in_progress', 'blocked', 'complete']),
  reward: new Set(['available', 'pending', 'earned', 'expired']),
  rewardCategory: new Set(['hackathon_credit', 'prize', 'grant']),
  source: new Set(['live', 'fallback']),
};

const FORBIDDEN_KEY = /^(?:secret|token|password|passwd|authorization|api[_-]?key|access[_-]?key|private[_-]?key|credential|cookie)$/i;
const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-|live-)?[A-Za-z0-9_-]{16,}\b/,
  /\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{16,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bBearer\s+[A-Za-z0-9._~+\/-]{12,}={0,2}\b/i,
  /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/[^\s/]+:[^\s@]+@/i,
  /\b(?:password|passwd|secret|api[_-]?key)\s*[:=]\s*[^\s,;]{6,}/i,
];

export class FeedValidationError extends Error {
  constructor(errors) {
    super(`Invalid build-story snapshot:\n- ${errors.join('\n- ')}`);
    this.name = 'FeedValidationError';
    this.errors = errors;
  }
}

export function payloadSize(value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return new TextEncoder().encode(serialized).byteLength;
}

export function sanitizeText(value) {
  return String(value)
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, '')
    .replaceAll('<', '‹')
    .replaceAll('>', '›')
    .trim();
}

export function pickLocalized(value, language = 'en') {
  if (!value || typeof value !== 'object') return '';
  return sanitizeText(value[language] || value.en || value.es || '');
}

export function scanForSecrets(value, path = '$', findings = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForSecrets(entry, `${path}[${index}]`, findings));
    return findings;
  }
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (FORBIDDEN_KEY.test(key)) findings.push(`${path}.${key}: forbidden sensitive field name`);
      scanForSecrets(entry, `${path}.${key}`, findings);
    }
    return findings;
  }
  if (typeof value === 'string') {
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(`${path}: possible secret or credential`);
        break;
      }
    }
  }
  return findings;
}

export function isSafePublicUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '0.0.0.0' || host === '::1' || host.endsWith('.local')) return false;
    if (/^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host)) return false;
    for (const key of url.searchParams.keys()) {
      if (/(?:token|secret|key|signature|credential)/i.test(key)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function add(errors, condition, message) {
  if (!condition) errors.push(message);
}

function validDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && /T/.test(value);
}

function validId(value) {
  return typeof value === 'string' && ID_PATTERN.test(value);
}

function validateLocalized(value, path, errors, max = 600) {
  add(errors, value && typeof value === 'object' && !Array.isArray(value), `${path} must be a localized object`);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  for (const language of ['en', 'es']) {
    add(errors, typeof value[language] === 'string' && value[language].trim().length > 0, `${path}.${language} is required`);
    if (typeof value[language] === 'string') add(errors, value[language].length <= max, `${path}.${language} is too long`);
  }
}

function validateIds(items, collection, errors) {
  const ids = new Set();
  for (const [index, item] of items.entries()) {
    const path = `${collection}[${index}]`;
    add(errors, item && typeof item === 'object' && !Array.isArray(item), `${path} must be an object`);
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    add(errors, validId(item.id), `${path}.id is invalid`);
    if (ids.has(item.id)) errors.push(`${collection} contains duplicate id '${item.id}'`);
    ids.add(item.id);
  }
  return ids;
}

export function validateSnapshot(input, { maxBytes = MAX_PAYLOAD_BYTES } = {}) {
  const errors = [];
  add(errors, input && typeof input === 'object' && !Array.isArray(input), 'root must be an object');
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new FeedValidationError(errors);

  add(errors, payloadSize(input) <= maxBytes, `payload exceeds ${maxBytes} bytes`);
  errors.push(...scanForSecrets(input));
  add(errors, input.schemaVersion === SCHEMA_VERSION, `schemaVersion must be ${SCHEMA_VERSION}`);
  add(errors, validId(input.snapshotId), 'snapshotId is invalid');
  add(errors, validDate(input.generatedAt), 'generatedAt must be an ISO timestamp');
  add(errors, validDate(input.lastVerifiedAt), 'lastVerifiedAt must be an ISO timestamp');
  add(errors, input.source && STATES.source.has(input.source.kind), 'source.kind must be live or fallback');
  if (input.source) validateLocalized(input.source.label, 'source.label', errors, 120);
  add(errors, input.freshness && Number.isInteger(input.freshness.staleAfterSeconds) && input.freshness.staleAfterSeconds >= 30 && input.freshness.staleAfterSeconds <= 86400, 'freshness.staleAfterSeconds must be 30..86400');
  add(errors, input.freshness && input.freshness.refreshEverySeconds === 15, 'freshness.refreshEverySeconds must be 15');

  for (const collection of COLLECTIONS) add(errors, Array.isArray(input[collection]), `${collection} must be an array`);
  if (errors.some((error) => error.endsWith('must be an array'))) throw new FeedValidationError(errors);

  const ids = Object.fromEntries(COLLECTIONS.map((name) => [name, validateIds(input[name], name, errors)]));
  add(errors, input.current && typeof input.current === 'object', 'current must be an object');
  if (input.current) {
    add(errors, ids.projects.has(input.current.projectId), 'current.projectId references an unknown project');
    add(errors, ids.hackathons.has(input.current.hackathonId), 'current.hackathonId references an unknown hackathon');
    for (const field of ['headline', 'summary', 'whyItMatters', 'nextAction']) validateLocalized(input.current[field], `current.${field}`, errors);
  }

  for (const [index, item] of input.projects.entries()) {
    const path = `projects[${index}]`;
    validateLocalized(item.name, `${path}.name`, errors, 160);
    validateLocalized(item.summary, `${path}.summary`, errors);
    add(errors, STATES.project.has(item.status), `${path}.status is invalid`);
    add(errors, Array.isArray(item.hackathonIds) && item.hackathonIds.every((id) => ids.hackathons.has(id)), `${path}.hackathonIds contains an unknown id`);
    add(errors, Array.isArray(item.tags) && item.tags.length <= 12 && item.tags.every((tag) => typeof tag === 'string' && tag.length <= 40), `${path}.tags is invalid`);
  }
  for (const [index, item] of input.hackathons.entries()) {
    const path = `hackathons[${index}]`;
    validateLocalized(item.name, `${path}.name`, errors, 160);
    validateLocalized(item.summary, `${path}.summary`, errors);
    add(errors, STATES.hackathon.has(item.status), `${path}.status is invalid`);
    add(errors, validDate(item.startsAt) && validDate(item.endsAt), `${path} dates are invalid`);
    add(errors, Array.isArray(item.projectIds) && item.projectIds.every((id) => ids.projects.has(id)), `${path}.projectIds contains an unknown id`);
  }
  for (const [index, item] of input.agents.entries()) {
    const path = `agents[${index}]`;
    validateLocalized(item.role, `${path}.role`, errors, 200);
    validateLocalized(item.contribution, `${path}.contribution`, errors);
    add(errors, typeof item.name === 'string' && item.name.length <= 80, `${path}.name is invalid`);
    add(errors, typeof item.provider === 'string' && item.provider.length <= 80, `${path}.provider is invalid`);
    add(errors, STATES.agent.has(item.status), `${path}.status is invalid`);
    add(errors, validDate(item.lastObservedAt), `${path}.lastObservedAt is invalid`);
  }
  for (const [index, item] of input.evidence.entries()) {
    const path = `evidence[${index}]`;
    validateLocalized(item.label, `${path}.label`, errors, 200);
    validateLocalized(item.summary, `${path}.summary`, errors);
    add(errors, ['commit', 'test', 'artifact', 'review'].includes(item.type), `${path}.type is invalid`);
    add(errors, validDate(item.observedAt), `${path}.observedAt is invalid`);
    if (item.url != null) add(errors, isSafePublicUrl(item.url), `${path}.url is not a safe public HTTPS URL`);
  }
  for (const [index, item] of input.activityEvents.entries()) {
    const path = `activityEvents[${index}]`;
    validateLocalized(item.title, `${path}.title`, errors, 200);
    validateLocalized(item.summary, `${path}.summary`, errors);
    add(errors, STATES.activity.has(item.type), `${path}.type is invalid`);
    add(errors, validDate(item.occurredAt), `${path}.occurredAt is invalid`);
    add(errors, item.verified === true, `${path}.verified must be true`);
    add(errors, Array.isArray(item.agentIds) && item.agentIds.every((id) => ids.agents.has(id)), `${path}.agentIds contains an unknown id`);
    add(errors, !item.projectId || ids.projects.has(item.projectId), `${path}.projectId is unknown`);
    add(errors, !item.hackathonId || ids.hackathons.has(item.hackathonId), `${path}.hackathonId is unknown`);
    add(errors, Array.isArray(item.evidenceIds) && item.evidenceIds.every((id) => ids.evidence.has(id)), `${path}.evidenceIds contains an unknown id`);
  }
  for (const [index, item] of input.milestones.entries()) {
    const path = `milestones[${index}]`;
    validateLocalized(item.title, `${path}.title`, errors, 200);
    validateLocalized(item.verification, `${path}.verification`, errors);
    add(errors, STATES.milestone.has(item.status), `${path}.status is invalid`);
    add(errors, ids.projects.has(item.projectId), `${path}.projectId is unknown`);
    add(errors, ids.hackathons.has(item.hackathonId), `${path}.hackathonId is unknown`);
    add(errors, validDate(item.updatedAt), `${path}.updatedAt is invalid`);
  }
  for (const [index, item] of input.rewardAccounts.entries()) {
    const path = `rewardAccounts[${index}]`;
    validateLocalized(item.program, `${path}.program`, errors, 200);
    validateLocalized(item.displayValue, `${path}.displayValue`, errors, 160);
    validateLocalized(item.note, `${path}.note`, errors);
    add(errors, typeof item.provider === 'string' && item.provider.length <= 80, `${path}.provider is invalid`);
    add(errors, STATES.rewardCategory.has(item.category), `${path}.category is invalid`);
    add(errors, STATES.reward.has(item.status), `${path}.status is invalid`);
    add(errors, item.notBilling === true, `${path}.notBilling must be true`);
    add(errors, validDate(item.updatedAt), `${path}.updatedAt is invalid`);
  }
  add(errors, input.system && typeof input.system === 'object', 'system must be an object');
  if (input.system) {
    add(errors, typeof input.system.publicFeedName === 'string' && input.system.publicFeedName.length <= 100, 'system.publicFeedName is invalid');
    add(errors, ids.activityEvents.has(input.system.latestEventId), 'system.latestEventId is unknown');
  }
  if (errors.length) throw new FeedValidationError(errors);
  return true;
}

function sanitizeDeep(value, key = '') {
  if (Array.isArray(value)) return value.map((item) => sanitizeDeep(item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, sanitizeDeep(child, childKey)]));
  if (typeof value === 'string' && key !== 'url') return sanitizeText(value);
  return value;
}

export function normalizeSnapshot(input) {
  validateSnapshot(input);
  const clean = sanitizeDeep(structuredClone(input));
  clean.activityEvents.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id));
  clean.milestones.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
  clean.evidence.sort((a, b) => b.observedAt.localeCompare(a.observedAt) || a.id.localeCompare(b.id));
  for (const name of ['projects', 'hackathons', 'agents', 'rewardAccounts']) clean[name].sort((a, b) => a.id.localeCompare(b.id));
  return clean;
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  return value;
}

export function stableStringify(value) {
  return `${JSON.stringify(sortKeys(value), null, 2)}\n`;
}

export function computeConnectionState(snapshot, now = new Date(), { transportOk = true } = {}) {
  if (!snapshot) return 'unavailable';
  if (snapshot.source?.kind === 'fallback') return 'fallback';
  const verifiedAt = Date.parse(snapshot.lastVerifiedAt);
  const staleAfter = (snapshot.freshness?.staleAfterSeconds || 300) * 1000;
  if (!transportOk || Number.isNaN(verifiedAt) || now.getTime() - verifiedAt > staleAfter) return 'stale';
  return 'live';
}
