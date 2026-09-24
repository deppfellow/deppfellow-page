---
status: accepted
date: 2026-09-10
---

# Rendering fidelity scope for v1

The renderer imitates Obsidian; divergence is a standing bug class, not an architecture change. V1 must render correctly:

- Wikilinks, resolved against the vault tree and the category registry; private, unlisted, or missing targets degrade to plain text or a non-leaking placeholder - never a 404, never a private title.
- YAML front-matter.
- Images from the vault's `_assets/`, through Astro's build-time image pipeline (sharp).
- Inline `#tags`, task-list checkboxes, footnotes.
- Obsidian callouts (`> [!note]` blocks) - one styled blockquote, cheap and common in wiki writing.
- Math, via KaTeX rendered at build time - no client-side math engine ever ships.

Deferred until the writing actually uses them, then added build-time-only: embeds (`![[note]]` transclusion), Mermaid diagrams, `%%comments%%`. Unsupported features degrade to plain text.

## Consequences

- Each accepted feature is build code plus golden tests at build time (boundary behavior especially).
- Math rendering is build-time so the performance contract (ADR-0002) survives.
