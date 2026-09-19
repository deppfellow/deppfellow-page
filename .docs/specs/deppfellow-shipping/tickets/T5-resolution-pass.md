---
td: td-7e73c8
type: feature
priority: P0
ownership: agent-owned
blocked-by: T1
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T5
---

# T5: Build the single resolution pass for wikilinks, assets, footnotes, task lists, and inline tags

Delivered behavior: One build-time pass resolves `[[wikilinks]]` registry-bound, rewrites `_assets/` images, and renders footnotes, task lists, and inline tags; it also emits the graph neighbors the agent catalog consumes.

## Objective

ADR-0005's V1 scope. This pass is load-bearing twice: it renders the reading page and it produces the wikilink graph the JSON catalog needs, so T6/T8/T14 all depend on it. A private target must never leak.

## Interface Contract

Module: `src/lib/resolve.ts` (new), wired into the markdown pipeline used by `src/content.config.ts`.

- `[[Note Title]]` and `[[Note Title|label]]` resolve against the vault tree **and** the category registry:
  - target is a published note → anchor to that note's canonical route (`/articles/<slug>/`, `/projects/<slug>/`, or `/logs/<date>/`), rendering `label` or the note title.
  - target is unlisted/private/missing → render the label (or title) as **plain text**. No URL, no slug, no title, no "missing" marker for the private target.
- `![[image.png]]` and standard `![](path)` resolve files under `_assets/` through Astro's image pipeline; a missing asset renders alt text and no `<img>`.
- Footnotes (`[^1]`) produce a linked footnote list; task lists (`- [x]`) render checkboxes; inline `#tags` render as chip-links.
- The pass exports `graphNeighbors: { title, route, direction }[]` per note for the catalog.
- Output is registry-safe: the pass only ever emits routes for notes inside registered categories.

## Examples

| Input                                              | Output                                                         |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `[[Memory Layers]]` where the note is published    | `<a href="/articles/memory-layers/">Memory Layers</a>`         |
| `[[Private Draft Notes]]` where target is unlisted | `Private Draft Notes` as text; target string absent from HTML  |
| `[[Memory Layers\|how memory is layered]]`         | `<a href="/articles/memory-layers/">how memory is layered</a>` |
| `![[plate.png]]` with `_assets/plate.png`          | `<img>` with a hashed build asset                              |
| `![[missing.png]]`                                 | alt text only                                                  |
| `- [x] done`                                       | checked checkbox input                                         |

## Setup

- `fixtures/vault` contains a published note with two wikilinks (one public, one unlisted target), one image reference, one footnote, one task list, one inline tag.
- `WIKI_PATH=fixtures/vault npm run build`.

## Gate

```sh
node --test src/lib/resolve.test.mjs
```

The worker authors this test (tier-1 steering): it imports the resolve pass directly and asserts the mapping table above, including the unlisted-target case. It is runnable after this ticket alone, with no dependence on any reading-page route.

## Acceptance Criteria

- L-AC-01 — A published wikilink becomes an anchor to the target's real route in built HTML. (REQ-04)
- L-AC-02 — For an unlisted wikilink target, the target's slug and title appear nowhere in any built HTML file. (REQ-04, SPEC-AC-02)
- L-AC-03 — An `_assets/` image reference renders an `<img>` with a build-hashed source; a missing asset yields no `<img>`. (REQ-05)
- L-AC-04 — Footnote, task-list, and inline-tag fixtures each render their expected element. (REQ-06)
- L-AC-05 — The pass emits `graphNeighbors` containing the published wikilink target for the fixture note. (REQ-09)

## Specification Coverage

REQ-04, REQ-05, REQ-06, REQ-09.

## Preserved Invariants

- Home page and list surfaces continue to build.
- The registry boundary is not widened by resolution.

## Out of Scope

- Reading-page layout and metadata (T6).
- Catalog/llms.txt route generation (T14) - this ticket only emits the neighbors.
- Client-side rendering of any kind.
