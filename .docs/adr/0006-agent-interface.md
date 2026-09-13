---
status: accepted
date: 2026-09-10
---

# Agent interface: llms.txt, JSON catalog, raw markdown

The site serves a machine-facing surface built from the same wikilink-resolution pass as the human pages, so agent-visible and human-visible content cannot diverge:

- `llms.txt` at the domain root: the machine-oriented entry point telling an arriving agent what the Public Projection offers and where each part lives.
- A JSON catalog: one entry per public note - metadata, a raw-markdown URL, and wikilink-graph neighbors (both directions).
- Raw `.md` files served alongside rendered pages.

Private, unlisted, or missing targets never appear in any of the three.

## Considered Options

- Defer to later - rejected: the surface is nearly free once the resolution pass exists, the wiki is explicitly a shared human-agent memory, and deferring means reworking the build later.
- Only `llms.txt` pointing at GitHub - rejected: the catalog is what makes the projection walkable without scraping HTML.

## Consequences

- If the catalog outgrows agent-side scanning (ranked/semantic search needs), it is revisited then, per the wiki's ADR-0002 reasoning, which this ADR adopts as ground.
