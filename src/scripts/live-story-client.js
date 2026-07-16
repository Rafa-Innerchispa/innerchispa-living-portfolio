import {
  MAX_PAYLOAD_BYTES,
  computeConnectionState,
  isSafePublicUrl,
  normalizeSnapshot,
  payloadSize,
  pickLocalized,
  sanitizeText,
  validateSnapshot,
} from '../lib/build-story-contract.js';

const COPY = {
  en: {
    live: 'Live · verified public feed', stale: 'Stale · last valid snapshot', fallback: 'Fallback · sanitized demonstration', unavailable: 'Unavailable',
    updated: 'Verified', next: 'Next action', why: 'Why this matters', observable: 'Observable contribution', noBilling: 'Program reward · not API billing',
  },
  es: {
    live: 'Live · feed público verificado', stale: 'Desactualizado · último snapshot válido', fallback: 'Fallback · demostración sanitizada', unavailable: 'No disponible',
    updated: 'Verificado', next: 'Siguiente acción', why: 'Por qué importa', observable: 'Contribución observable', noBilling: 'Recompensa del programa · no es facturación API',
  },
};

export function setSafeText(element, value) {
  element.textContent = sanitizeText(value ?? '');
  return element;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) setSafeText(node, text);
  return node;
}

function formatTimestamp(value, language) {
  try {
    return new Intl.DateTimeFormat(language === 'es' ? 'es-EC' : 'en-US', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
    }).format(new Date(value)) + ' UTC';
  } catch {
    return sanitizeText(value);
  }
}

function replaceList(id, children) {
  const node = document.getElementById(id);
  if (node) node.replaceChildren(...children);
}

function render(snapshot, state, language) {
  const t = COPY[language] || COPY.en;
  const project = snapshot.projects.find((item) => item.id === snapshot.current.projectId);
  const hackathon = snapshot.hackathons.find((item) => item.id === snapshot.current.hackathonId);
  const agents = new Map(snapshot.agents.map((item) => [item.id, item]));

  const connection = document.getElementById('story-connection');
  if (connection) {
    connection.dataset.state = state;
    setSafeText(connection.querySelector('[data-connection-label]'), t[state]);
  }
  setSafeText(document.getElementById('story-source'), pickLocalized(snapshot.source.label, language));
  setSafeText(document.getElementById('story-verified'), `${t.updated} ${formatTimestamp(snapshot.lastVerifiedAt, language)}`);
  setSafeText(document.getElementById('story-headline'), pickLocalized(snapshot.current.headline, language));
  setSafeText(document.getElementById('story-summary'), pickLocalized(snapshot.current.summary, language));
  setSafeText(document.getElementById('story-why-label'), t.why);
  setSafeText(document.getElementById('story-why'), pickLocalized(snapshot.current.whyItMatters, language));
  setSafeText(document.getElementById('story-next-label'), t.next);
  setSafeText(document.getElementById('story-next'), pickLocalized(snapshot.current.nextAction, language));
  setSafeText(document.getElementById('story-project'), project ? pickLocalized(project.name, language) : '—');
  setSafeText(document.getElementById('story-hackathon'), hackathon ? pickLocalized(hackathon.name, language) : '—');

  replaceList('story-agents', snapshot.agents.map((agent, index) => {
    const row = element('article', 'agent-row');
    row.style.setProperty('--delay', `${index * 55}ms`);
    const identity = element('div', 'agent-identity');
    identity.append(element('span', 'agent-mark', agent.name.slice(0, 1)), element('div'));
    setSafeText(identity.lastChild, agent.name);
    identity.lastChild.append(element('small', '', `${agent.provider} · ${pickLocalized(agent.role, language)}`));
    const contribution = element('p', '', pickLocalized(agent.contribution, language));
    contribution.prepend(element('span', 'sr-only', `${t.observable}: `));
    row.append(identity, contribution, element('span', `agent-state state-${agent.status}`, agent.status));
    return row;
  }));

  replaceList('story-activity', snapshot.activityEvents.slice(0, 8).map((event, index) => {
    const row = element('article', 'activity-row');
    row.style.setProperty('--delay', `${index * 45}ms`);
    const rail = element('div', `activity-symbol type-${event.type}`, event.type === 'commit' ? '↗' : event.type === 'test' ? '✓' : event.type === 'next_action' ? '→' : '◆');
    const body = element('div', 'activity-body');
    const meta = element('div', 'activity-meta', `${event.type.replace('_', ' ')} · ${formatTimestamp(event.occurredAt, language)}`);
    body.append(meta, element('h3', '', pickLocalized(event.title, language)), element('p', '', pickLocalized(event.summary, language)));
    const names = event.agentIds.map((id) => agents.get(id)?.name).filter(Boolean).join(' + ');
    body.append(element('small', '', names));
    row.append(rail, body);
    return row;
  }));

  replaceList('story-milestones', snapshot.milestones.map((milestone) => {
    const row = element('li', `milestone-item milestone-${milestone.status}`);
    row.append(element('span', 'milestone-dot'), element('div'));
    row.lastChild.append(element('strong', '', pickLocalized(milestone.title, language)), element('p', '', pickLocalized(milestone.verification, language)));
    row.append(element('small', '', milestone.status.replace('_', ' ')));
    return row;
  }));

  replaceList('story-evidence', snapshot.evidence.map((evidence) => {
    const item = element('article', 'evidence-item');
    item.append(element('span', 'evidence-type', evidence.type), element('div'));
    const title = evidence.url ? element('a', '', pickLocalized(evidence.label, language)) : element('strong', '', pickLocalized(evidence.label, language));
    if (evidence.url) {
      title.href = evidence.url;
      title.target = '_blank';
      title.rel = 'noopener noreferrer';
    }
    item.lastChild.append(title, element('p', '', pickLocalized(evidence.summary, language)));
    return item;
  }));

  replaceList('story-rewards', snapshot.rewardAccounts.map((reward) => {
    const item = element('article', 'reward-row');
    const heading = element('div', 'reward-heading');
    heading.append(element('strong', '', reward.provider), element('span', `reward-status status-${reward.status}`, reward.status));
    item.append(heading, element('h3', '', pickLocalized(reward.program, language)), element('div', 'reward-value', pickLocalized(reward.displayValue, language)), element('p', '', pickLocalized(reward.note, language)), element('small', '', t.noBilling));
    return item;
  }));
}

async function fetchSnapshot(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const announced = Number(response.headers.get('content-length') || 0);
    if (announced > MAX_PAYLOAD_BYTES) throw new Error('payload too large');
    const raw = await response.text();
    if (payloadSize(raw) > MAX_PAYLOAD_BYTES) throw new Error('payload too large');
    const parsed = JSON.parse(raw);
    validateSnapshot(parsed);
    return normalizeSnapshot(parsed);
  } finally {
    clearTimeout(timer);
  }
}

export function startLiveStory(root, fallbackSnapshot) {
  if (!root) return () => {};
  validateSnapshot(fallbackSnapshot);
  let language = localStorage.getItem('preferred-lang') === 'es' ? 'es' : 'en';
  let current = normalizeSnapshot(fallbackSnapshot);
  let connectionState = 'fallback';
  let stopped = false;
  const configured = JSON.parse(root.dataset.feedUrls || '[]');
  const urls = [...new Set(configured.filter((url) => {
    if (typeof url !== 'string' || url.length >= 2048) return false;
    if (url.startsWith('/') && !url.startsWith('//') && !url.includes('..')) return true;
    return isSafePublicUrl(url);
  }))];

  try {
    const cached = JSON.parse(localStorage.getItem('innerchispa:last-valid-story') || 'null');
    if (cached) {
      validateSnapshot(cached);
      if (cached.source.kind === 'live') current = normalizeSnapshot(cached);
    }
  } catch {
    localStorage.removeItem('innerchispa:last-valid-story');
  }
  connectionState = computeConnectionState(current, new Date(), { transportOk: false });
  render(current, connectionState, language);

  async function refresh() {
    for (const url of urls) {
      try {
        const incoming = await fetchSnapshot(url);
        if (stopped) return;
        if (incoming.source.kind === 'fallback' && current.source.kind === 'live') {
          connectionState = computeConnectionState(current, new Date(), { transportOk: false });
          render(current, connectionState, language);
          return;
        }
        current = incoming;
        if (incoming.source.kind === 'live') localStorage.setItem('innerchispa:last-valid-story', JSON.stringify(incoming));
        connectionState = computeConnectionState(current);
        render(current, connectionState, language);
        return;
      } catch {
        // Try the next configured public source. Invalid data never replaces current.
      }
    }
    if (!stopped) {
      connectionState = computeConnectionState(current, new Date(), { transportOk: false });
      render(current, connectionState, language);
    }
  }

  const languageHandler = (event) => {
    language = event.detail?.language === 'es' ? 'es' : 'en';
    render(current, connectionState, language);
  };
  window.addEventListener('innerchispa:language', languageHandler);
  refresh();
  const interval = window.setInterval(refresh, 15000);
  return () => {
    stopped = true;
    clearInterval(interval);
    window.removeEventListener('innerchispa:language', languageHandler);
  };
}
