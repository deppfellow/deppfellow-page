---
td: td-d84081
type: feature
priority: P1
ownership: human-owned
blocked-by: T1
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T3
---

# T3: Render the Projects index with date, title, and description

Delivered behavior: `/projects/` lists Projects newest-first with date, title, and short description.

## Objective

Projects need the one-line "what this is" that Articles deliberately omit (Armin reference). The description field introduced in T1 supplies it.

## Interface Contract

Route `/projects/` (`src/pages/projects/index.astro`, new).

- Rows: one per published Project, ordered by `created` descending.
- Each row exposes: ISO date, title linked to `/projects/<slug>/`, and the resolved summary (`description` > Objective > omit, D-43).
- A Project with no resolvable summary renders date + title only (no empty element).
- Empty category renders an explanatory line.

## Examples

| Project state | Row renders |
| --- | --- |
| description present | date, title, description |
| only `## Objective` | date, title, Objective-derived summary |
| neither | date, title |
| 0 Projects | explanatory line |

## Setup

- `WIKI_PATH=fixtures/vault npm run build` produces `dist/projects/index.html`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/projects/index.html
```

## Acceptance Criteria

- L-AC-01 — `dist/projects/index.html` exists with one row per fixture Project. (REQ-16)
- L-AC-02 — A fixture Project with `description` shows that text in its row. (REQ-16, REQ-02)
- L-AC-03 — A fixture Project with neither summary source renders date + title with no empty description node. (REQ-02)
- L-AC-04 — Row dates are descending `YYYY-MM-DD`. (REQ-16)

## Specification Coverage

REQ-16, REQ-02.

## Preserved Invariants

- Home page and Articles index unchanged.

## Out of Scope

- Project detail rendering (T8), RSS (T11).
