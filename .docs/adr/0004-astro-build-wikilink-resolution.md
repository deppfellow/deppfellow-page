---
status: accepted
date: 2026-08-24
---

# Astro build pipeline owns rendering and wikilink resolution

With the backend gone (ADR-0001), the site build must render vault Markdown to HTML and resolve Obsidian `[[wikilinks]]` into URLs. Decision: rendering lives in the Astro build pipeline (remark + a wikilink resolution step). Wikilinks resolve against the vault file tree and obey the category registry (`_schema/categories.md`): a link pointing into `Private/`, an unlisted folder, or a non-existent note degrades gracefully — plain text or a non-leaking placeholder — never a 404, never a private title. The same resolution pass computes graph neighbors for the agent catalog (ADR-0002), so link resolution and the catalog share one source of truth.

## Considered Options

- Pre-build script converting vault Markdown to standard Markdown before a generic renderer — rejected: two tools, two formats, and the publication-boundary rule must survive the conversion step.

## Consequences

- The site renderer must imitate Obsidian's rendering well enough that authors are not surprised; divergence is a rendering-fidelity bug, not a reason to reintroduce a server.
- Boundary behavior (private, unlisted, missing targets) needs golden tests at build time.
- Neighbor derivation and wikilink resolution can never drift apart — they are one pass.
