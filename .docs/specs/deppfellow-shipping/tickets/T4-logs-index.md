---
td: td-a0a097
type: feature
priority: P1
ownership: human-owned
blocked-by: T1
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T4
---

# T4: Render the Logs index as date groups with excerpts and chip-linked tags

Delivered behavior: `/logs/` shows log groups newest-first, each row with date, excerpt, and tag links.

## Objective

Logs are the dated working record. The reader scans by group and reads a bite of each entry (Rasyid reference), then clicks through or follows a tag.

## Interface Contract

Route `/logs/` (`src/pages/logs/index.astro`, new).

- Groups: keyed by the log's `created` date, newest group first; within a group, newest first.
- Each row exposes: ISO date, title linked to `/logs/<date>/`, an excerpt, and chip-linked tags.
- Excerpt = the first paragraph of the note body, truncated at 240 characters with an ellipsis if longer; a note with no body paragraph shows no excerpt element.
- Tags render as square label-caps anchors to `/tags/<tag>/` (chip-linking, D-30).
- Ordering uses `created`, not the filename date (they can diverge for after-midnight notes).
- Empty category renders an explanatory line.

## Examples

| Log state | Row renders |
| --- | --- |
| body paragraph 500 chars | date, title link, 240-char excerpt with ellipsis, tags |
| body only a heading | date, title link, no excerpt, tags |
| `created: 2026-09-02`, filename `2026-09-01.md` | grouped under 2026-09-02 |
| 0 logs | explanatory line |

## Setup

- `WIKI_PATH=fixtures/vault npm run build` produces `dist/logs/index.html`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/logs/index.html
```

## Acceptance Criteria

- L-AC-01 — `dist/logs/index.html` exists; every fixture log appears exactly once. (REQ-17)
- L-AC-02 — No excerpt exceeds 240 characters. (REQ-17)
- L-AC-03 — Each tag on a row is an anchor whose `href` is `/tags/<tag>/`. (REQ-17, REQ-19)
- L-AC-04 — A fixture whose `created` differs from its filename date is grouped by `created`. (REQ-17)

## Specification Coverage

REQ-17, REQ-19.

## Preserved Invariants

- Home page, Articles and Projects indexes unchanged.

## Out of Scope

- Log detail rendering (T8), tag page generation (T9).
