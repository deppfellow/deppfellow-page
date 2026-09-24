---
td: td-2a7cd5
type: feature
priority: P1
ownership: agent-owned
blocked-by: T5, T6
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T8
---

# T8: Render Projects and Logs detail pages

Delivered behavior: `/projects/<slug>/` and `/logs/<date>/` render full note bodies with the same metadata treatment as Articles.

## Objective

ADR-0003 routes all three categories to detail pages, and RSS links for Projects must resolve somewhere real. This closes the click-through holes left by the list surfaces.

## Interface Contract

Routes: `src/pages/projects/[...slug].astro` and `src/pages/logs/[...date].astro` (new).

- Both reuse the T6 reading-page body component (header, 65ch resolved body, footer).
- Header: `h1` title; description-lede when a summary resolves; metadata line with ISO `created` (Logs: also the log's own date) and chip-linked tags.
- Logs additionally render the prev/next chain by `created`; Projects render a Back link to `/projects/`.
- A Logs route uses the note's `created` date as the URL segment, consistent with T4's `created` ordering.
- No FAB on these routes (FAB is Article-only).
- The reading-page h1 renders at title scale (`text-title` on the reading-page h1 class only; the `--text-title` and `--text-note` tokens are unchanged). (D-48)

## Examples

| URL                              | Renders                          |
| -------------------------------- | -------------------------------- |
| `/projects/wikilink-resolution/` | h1, lede, date, tags, body, back |
| `/logs/2026-09-09/`              | h1, date, tags, body, prev/next  |
| oldest log                       | next only                        |
| unknown slug                     | 404 (T10)                        |

## Setup

- `WIKI_PATH=fixtures/vault npm run build`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/logs/2026-09-11/index.html
```

## Acceptance Criteria

- L-AC-01 — Every fixture Project and Log yields a detail route; the counts match the index row counts. (REQ-18)
- L-AC-02 — A Logs detail route's path segment equals its `created` date. (REQ-18, REQ-17)
- L-AC-03 — Logs detail pages contain a prev/next chain resolving to existing routes; the oldest omits the absent neighbour. (REQ-14, REQ-18)
- L-AC-04 — Detail page bodies are 65ch and contain no unrendered wikilink brackets. (REQ-11, REQ-04)
- L-AC-05 — No FAB element appears on Project or Log detail pages. (REQ-12)
- L-AC-06 — The reading-page h1 renders at the title scale, not the body note scale; list surfaces and the body measure are unaffected. (D-48)

## Specification Coverage

REQ-18, REQ-11, REQ-14.

## Preserved Invariants

- List surfaces unchanged; Articles reading page unchanged apart from the h1 title-scale class (L-AC-06).

## Out of Scope

- RSS (T11), tag pages (T9), FAB on non-Article pages.
