# Live Build Story architecture

## Purpose

Live Build Story explains what InnerChispa is building through public, observable work. It is a storytelling surface—not an operations console and not a mirror of agent conversations.

The browser receives one sanitized snapshot containing projects, hackathons, agent contributions, activity, milestones, evidence, program rewards and freshness metadata. OpenAI Build Week and RalphiIA QuoteOps lead the current snapshot; another event becomes the lead by changing references in data, not Astro structure.

## Data path

```text
observable artifacts
  → trusted sanitizer/publisher
  → contract validation
  → deterministic public JSON snapshot
  → public HTTPS endpoint
  → browser validation
  → DOM-safe rendering
```

The checked-in fallback takes the same path through the validator and generator. The site renders it immediately so the experience works without internal infrastructure.

### Files

| Concern | File |
| --- | --- |
| Contract, sanitizer, URL policy, freshness logic | `src/lib/build-story-contract.js` |
| Checked-in source fallback | `src/data/build-story-fallback.json` |
| Generated static fallback | `public/data/build-story.json` |
| Safe refresh and rendering | `src/scripts/live-story-client.js` |
| Deterministic publisher | `scripts/generate-build-story.mjs` |
| Automated coverage | `tests/build-story-contract.test.js` |

## Feed contract 1.0.0

Top-level fields:

- `schemaVersion`: exactly `1.0.0`.
- `snapshotId`: stable lowercase identifier for this snapshot.
- `generatedAt`, `lastVerifiedAt`: ISO timestamps supplied by the publisher. Generation never invents a current time.
- `source.kind`: `live` or `fallback`; the UI never guesses.
- `source.label`: English and Spanish disclosure.
- `freshness`: `refreshEverySeconds` must be `15`; `staleAfterSeconds` is `30..86400`.
- `current`: references the lead `projectId` and `hackathonId`, plus localized headline, summary, rationale and next action.
- `projects`: reusable project records and their hackathon references.
- `hackathons`: event records with dates, state and project references.
- `agents`: provider, public role, observable contribution, state and last observation.
- `activityEvents`: verified commits, tests, milestones, evidence or next actions.
- `milestones`: planned, in-progress, blocked or complete checkpoints with verification text.
- `evidence`: public commits, tests, artifacts or reviews; URLs are optional.
- `rewardAccounts`: hackathon credits, prizes or grants only.
- `system.latestEventId`: explicit freshness anchor.

Every user-facing narrative field is `{ "en": "…", "es": "…" }`. All collection records have unique IDs. References must resolve inside the same snapshot.

## Honest connection states

- **live**: a valid `source.kind: live` snapshot arrived and `lastVerifiedAt` is within its freshness window.
- **stale**: the most recent valid live snapshot is old or the refresh transport failed. It remains visible rather than disappearing.
- **fallback**: the checked-in sanitized demonstration is visible. This is explicitly labeled even if its local fetch succeeds.
- **unavailable**: no valid snapshot exists. The bundled fallback makes this unusual, but the state logic is tested.

The browser tries configured sources in order every 15 seconds. It limits response size, parses JSON, validates the entire graph and only then swaps the rendered snapshot. A valid live response is cached locally. Bad JSON, bad references, secrets, unsafe URLs and network failures cannot erase the last valid view.

## Privacy and security model

### Allowed

- commit identifiers and public commit links;
- test counts and pass/fail outcomes without private fixtures;
- artifact names and public review links;
- milestone state and an evidence-based summary;
- an agent's scoped, observable contribution;
- a public next action;
- hackathon credit, grant or prize status where approved for publication.

### Never allowed

- chain-of-thought, hidden reasoning, prompts or scratchpads;
- raw ChatGPT, Codex, Antigravity, Gemini or other agent messages;
- access tokens, API keys, passwords, cookies or credential fields;
- private keys, credential-bearing URLs or connection strings;
- customer PII, customer records, emails, WhatsApp content or attachments;
- staff-payment data or private financial operations;
- private/LAN addresses, hostnames, service topology or unsafe infrastructure details;
- API invoice, usage or billing balances disguised as rewards.

The contract rejects secret-shaped values and sensitive field names, non-HTTPS evidence links, credentials in URLs, private hosts, token-like query parameters, duplicate IDs, unknown references, invalid enum values and payloads over 512 KiB. `rewardAccounts[].notBilling` must be `true` and the category must be `hackathon_credit`, `prize` or `grant`.

All dynamic feed strings reach the page through `textContent`. The client does not use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval` or `document.write`. Control/bidirectional characters are removed and angle brackets are converted to harmless visible characters.

## Publishing an observable event

1. Start from a trusted sanitized JSON snapshot—not a raw log export.
2. Add only the observable result. Example: “7 contract tests passed,” not the prompt, conversation or private reasoning used to create them.
3. Add an evidence record only when the link is public, credential-free HTTPS. Evidence may omit a URL.
4. Use a new unique ID and resolve all agent/project/hackathon/evidence references.
5. Set `lastVerifiedAt` to the time a human or trusted verification job observed the evidence.
6. Run the generator:

   ```bash
   npm run story:generate -- path/to/sanitized-input.json public/data/build-story.json
   ```

7. Run `npm test` and `npm run build`.
8. Review the generated diff before any separate, approved publishing process.

The generator reads JSON and writes one deterministic, key-sorted JSON file. Output is restricted to `public/data/*.json`; it contains no shell, SSH, SCP, hosting or deployment behavior. The same input produces the same bytes.

## Configuring a live source

At Astro build time:

```bash
PUBLIC_BUILD_STORY_FEED_URLS="https://public.example/feed.json,https://backup.example/feed.json" npm run build
```

Endpoints must provide CORS access to the site origin, return the exact contract, remain below 512 KiB and contain `source.kind: live`. Do not embed authentication in a public website. If an endpoint needs authentication, place a separately reviewed sanitizing public publisher in front of it; the browser must never receive internal credentials.

## Antigravity integration handoff

Antigravity owns staging backfill, rebuild and deployment. After parent verification:

1. Cherry-pick or merge the verified commit into Antigravity's owned staging flow.
2. Preserve the `/staging-web` base path or adjust it deliberately for the target environment.
3. Select an owner-approved, CORS-enabled public feed endpoint.
4. Verify the publisher emits only this contract and has no path back to raw conversations or private stores.
5. Build with `PUBLIC_BUILD_STORY_FEED_URLS` set to that endpoint.
6. Confirm all four connection states and ES/EN behavior in staging.
7. Replace demonstration timestamps/events with newly verified public evidence.
8. Obtain Rafael's approval before deployment, domain/hosting changes, or publication of any reward amount currently marked undisclosed.

This repository intentionally contains no deployment automation and makes no hosting changes.
