---
td: td-9206eb
type: feature
priority: P1
ownership: agent-owned
blocked-by: T1
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T2
---

# T2: Render the Articles index as date-and-title ruled rows

Delivered behavior: `/articles/` lists Articles newest-first with a tabular date and a title only.

## Objective

Articles is the site's front room. Per the Morg reference the index stays austere: no descriptions, no tags, no excerpts - the reader picks by date and title.

## Interface Contract

Route `/articles/` (`src/pages/articles/index.astro`, new).

- Rows: one per published Article, ordered by `created` descending.
- Each row exposes exactly: an ISO `YYYY-MM-DD` date (tabular/label typography) and the title, linked to `/articles/<slug>/`.
- No description, tags, excerpt, or image in the row.
- Empty category (no Articles) renders a single explanatory line, not a broken layout.
- Reuses the existing plate row vocabulary (`PlateRow`) and rule-band chrome.

## Examples

| Built state | `/articles/` contains                                       |
| ----------- | ----------------------------------------------------------- |
| 12 Articles | 12 rows, dates descending, each linking `/articles/<slug>/` |
| 1 Article   | 1 row                                                       |
| 0 Articles  | explanatory line, HTTP 200, no `<table>`/broken markup      |

## Setup

- `WIKI_PATH=fixtures/vault npm run build` produces `dist/articles/index.html`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/articles/index.html
```

## Acceptance Criteria

- L-AC-01 — `dist/articles/index.html` exists and contains one row per fixture Article. (REQ-15)
- L-AC-02 — No description text of any fixture Article appears on the index. (REQ-15)
- L-AC-03 — Row dates are monotonically descending and formatted `YYYY-MM-DD`. (REQ-15)
- L-AC-04 — Every row's link resolves to an existing `/articles/<slug>/` route. (REQ-15)

## Specification Coverage

REQ-15.

## Preserved Invariants

- Home page unchanged.
- Rule band and category counts unchanged.

## Out of Scope

- Article detail rendering (T6), tag chips (T9), search (T12).
