import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  FeedValidationError,
  computeConnectionState,
  isSafePublicUrl,
  normalizeSnapshot,
  sanitizeText,
  stableStringify,
  validateSnapshot,
} from '../src/lib/build-story-contract.js';
import { setSafeText } from '../src/scripts/live-story-client.js';

const fixture = JSON.parse(await readFile(new URL('../src/data/build-story-fallback.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(fixture);

test('checked-in fallback satisfies the public contract', () => {
  assert.equal(validateSnapshot(fixture), true);
  assert.equal(normalizeSnapshot(fixture).source.kind, 'fallback');
});

test('rejects malformed states and duplicate identifiers', () => {
  const invalid = clone();
  invalid.projects[0].status = 'secretly-thinking';
  invalid.agents.push(structuredClone(invalid.agents[0]));
  assert.throws(() => validateSnapshot(invalid), (error) => {
    assert.ok(error instanceof FeedValidationError);
    assert.match(error.message, /status is invalid/);
    assert.match(error.message, /duplicate id/);
    return true;
  });
});

test('rejects secrets, credential-shaped fields and oversized payloads', () => {
  const withSecret = clone();
  withSecret.current.summary.en = 'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123';
  withSecret.apiKey = 'not-allowed';
  assert.throws(() => validateSnapshot(withSecret), /possible secret|forbidden sensitive field/);

  const oversized = clone();
  oversized.current.summary.en = 'x'.repeat(600_000);
  assert.throws(() => validateSnapshot(oversized), /payload exceeds/);
});

test('accepts only public credential-free HTTPS evidence URLs', () => {
  assert.equal(isSafePublicUrl('https://github.com/example/project/commit/abc123'), true);
  assert.equal(isSafePublicUrl('http://example.com/evidence'), false);
  assert.equal(isSafePublicUrl('https://user:pass@example.com/evidence'), false);
  assert.equal(isSafePublicUrl('https://192.168.1.4/private'), false);
  assert.equal(isSafePublicUrl('https://example.com/evidence?token=abc'), false);

  const invalid = clone();
  invalid.evidence[0].url = 'http://127.0.0.1/private';
  assert.throws(() => validateSnapshot(invalid), /safe public HTTPS URL/);
});

test('normalization sanitizes hostile text and serialization is deterministic', () => {
  const hostile = clone();
  hostile.current.headline.en = '<img src=x onerror=alert(1)>\u202E';
  const normalized = normalizeSnapshot(hostile);
  assert.equal(normalized.current.headline.en, '‹img src=x onerror=alert(1)›');
  assert.equal(stableStringify(normalized), stableStringify(normalizeSnapshot(hostile)));
  assert.equal(sanitizeText('safe\u0000 text'), 'safe text');
});

test('DOM-safe writer uses textContent and never parses hostile markup', () => {
  const fakeElement = { textContent: '' };
  const hostile = '<script>globalThis.compromised = true</script>';
  setSafeText(fakeElement, hostile);
  assert.equal(fakeElement.textContent, '‹script›globalThis.compromised = true‹/script›');
  assert.equal(globalThis.compromised, undefined);
});

test('connection freshness reports live, stale, fallback and unavailable honestly', () => {
  const live = clone();
  live.source.kind = 'live';
  live.source.label = { en: 'Verified public endpoint', es: 'Endpoint público verificado' };
  live.lastVerifiedAt = '2026-07-16T12:00:00Z';
  assert.equal(computeConnectionState(live, new Date('2026-07-16T12:04:59Z')), 'live');
  assert.equal(computeConnectionState(live, new Date('2026-07-16T12:05:01Z')), 'stale');
  assert.equal(computeConnectionState(live, new Date('2026-07-16T12:01:00Z'), { transportOk: false }), 'stale');
  assert.equal(computeConnectionState(fixture), 'fallback');
  assert.equal(computeConnectionState(null), 'unavailable');
});
