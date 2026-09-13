---
td: td-9a444b
type: feature
priority: P0
ownership: agent-owned
blocked-by: T5
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T6
---

# T6: Render the Article reading page with metadata header and 65ch body

Delivered behavior: `/articles/<slug>/` renders title, description-lede, date and chip-linked tags, the 65ch resolved body, and a back link with prev/next.

## Objective

The one surface with no external reference and the most unknowns. It must demonstrate the MVP block (core Markdown + callouts + math) while carrying the full body.

## Interface Contract

Route `/articles/<slug>/` (`src/pages/articles/[...slug].astro`, new).

- Header order: `h1` title; description-lede paragraph (only when a summary resolves); a metadata line with ISO `created` date and chip-linked tags.
- Body: the T5-resolved markdown at a 65ch measure, including core Markdown, callouts, math, tables, fenced code (hairline frame), blockquotes.
- Footer: a Back link to `/articles/` and prev/next links chained by `created` within Articles; first/last articles omit the absent neighbour rather than rendering a dead link.
- The `h1` is the title and is not repeated in the body or elsewhere.
- No page script is required for this ticket (the FAB arrives in T7).

## Examples

| URL | Renders |
| --- | --- |
| `/articles/memory-layers/` with description | h1, lede, date, tags, body, back + prev/next |
| a note with no description | h1, date, tags (no lede) |
| oldest note | back link + next only |
| a `$x^2$` body | rendered math markup, no literal `$` |

## Setup

- `WIKI_PATH=fixtures/vault npm run build` then serve `dist/`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/articles/memory-layers/index.html
```

## Acceptance Criteria

- L-AC-01 — The page contains the note title exactly once as an `h1`. (REQ-10)
- L-AC-02 — The description-lede appears when a summary resolves and is absent otherwise. (REQ-10)
- L-AC-03 — Body text renders at a 65ch measure (computed `max-inline-size` within 1ch of 65ch). (REQ-11)
- L-AC-04 — Callout, math, table, fenced-code, and blockquote fixtures each render their expected element. (REQ-07, REQ-11, REQ-08)
- L-AC-05 — No literal `[[`, `]]`, or unrendered `$` appears in built HTML of the fixture note. (REQ-04, REQ-08)
- L-AC-06 — Prev/next links resolve to existing article routes; the oldest/first article omits the absent neighbour. (REQ-14)

## Specification Coverage

REQ-07, REQ-08, REQ-10, REQ-11, REQ-14.

## Preserved Invariants

- List surfaces and home unchanged.
- Registry boundary intact.

## Out of Scope

- The FAB (T7), Projects/Logs detail routes (T8), tag pages (T9).
