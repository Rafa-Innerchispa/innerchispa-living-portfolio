# InnerChispa Astro site

The public InnerChispa story: a bilingual corporate site and a reusable **Live Build Story** for observable hackathon work.

The current lead story is RalphiIA QuoteOps at OpenAI Build Week 2026. Later events—including GitLab—use the same JSON contract instead of requiring a new page.

## Local development

Astro 5 requires Node `18.20.8`, `20.3+`, or `22+`. Node 20 is recommended.

```bash
npm ci
npm test
npm run story:generate
npm run dev
npm run build
npm run preview -- --host 127.0.0.1 --port 4327
```

This staging build uses the `/staging-web` base path, so its local preview is at `http://127.0.0.1:4327/staging-web/`.

## Live feed configuration

The browser checks feeds in order every 15 seconds. Configure one or more comma-separated public JSON endpoints at build time:

```bash
PUBLIC_BUILD_STORY_FEED_URLS="https://example.org/public/build-story.json" npm run build
```

The checked-in `public/data/build-story.json` is always the final fallback. Invalid responses never replace the last valid snapshot.

See [docs/LIVE_BUILD_STORY.md](docs/LIVE_BUILD_STORY.md) for the feed schema, privacy boundary, deterministic publisher, status rules and Antigravity handoff.

## Main structure

- `src/pages/index.astro` — editorial homepage
- `src/pages/historia-en-vivo.astro` — Live Build Story experience
- `src/lib/build-story-contract.js` — shared browser/Node validation and sanitization
- `src/scripts/live-story-client.js` — safe renderer and refresh lifecycle
- `src/data/build-story-fallback.json` — realistic sanitized demonstration
- `scripts/generate-build-story.mjs` — deterministic JSON publisher
- `tests/build-story-contract.test.js` — contract and hostile-input tests
- `src/data/published_content.json` — preserved project/hackathon inventory

No script in this repository deploys, publishes, shells into another host, or modifies private infrastructure.
