---
status: accepted
date: 2026-08-24
---

# Pure static site — no backend

The legacy `deppfellow-page` plan centered on a FastAPI + SQLite backend whose main job was the on-site write path (auth, editor, uploads, draft/publish state). Phase 2 moved authoring into the Obsidian vault, making `git push` the publication act; with the write path gone, no remaining job needs request-time computation. Decision: the site is build-time static site generation (SSG) only — no backend server, no database, no auth. A server may be added later, but only when a concrete request-time need appears, and additively (behind the same URLs), never as a prerequisite.

## Considered Options

- Keep FastAPI as a read-only content API — rejected: every remaining job (render, catalog, search index, log feed) is build-time work.
- Keep the full legacy plan — rejected: ~80% of its rules served the dead write path.

## Consequences

- No request-time features (live search API, comments, gated pages) until a backend is deliberately reintroduced.
- The single-renderer preview guarantee is gone regardless — Obsidian is the authoring surface, so preview parity was already lost when authoring moved into the vault.
- Site maintenance collapses to a build pipeline; attack surface is near zero.
