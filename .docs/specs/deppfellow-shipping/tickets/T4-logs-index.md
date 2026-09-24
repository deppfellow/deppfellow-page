---
td: td-a0a097
type: feature
priority: P1
ownership: agent-owned
blocked-by: T1
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T4
---

# T4: Render the Logs index as date groups with excerpts and chip-linked tags

Delivered behavior: `/logs/` shows logs newest-first as a flat ruled list in the 65ch measure; each row pairs a created-date cell with its excerpt and tags across a vertical hairline.

## Objective

Logs are the dated working record. The reader scans by group and reads a bite of each entry (Rasyid reference), then clicks through or follows a tag.

## Interface Contract

Route `/logs/` (`src/pages/logs/index.astro`, new).

- The page is a single flat list ordered by `created` descending. No date-group headings and no bordered container elements wrap the rows; rows separate by the plain hairline row rhythm only.
- Row anatomy: a two-column grid - the left cell is the log's `created` ISO date, a vertical hairline separates it from the content column, and the content column holds the excerpt and chip-linked tags only. Rows render no title element (the date is the log's title).
- The date cell is the row's anchor: its label and `href` both use the `created` date (`/logs/<created>/`), never the filename slug.
- Below the small breakpoint the row stacks date-above-content and the vertical rule disappears (DESIGN.md row rhythm); nothing shrinks and nothing is hidden.
- The Logs index content column holds the 65ch prose measure (D-49: the list-holds-container exemption does not apply to this page).
- Excerpt = the first paragraph of the note body, truncated at 240 characters with an ellipsis if longer; a note with no body paragraph shows no excerpt element.
- Tags render as square label-caps anchors to `/tags/<tag>/` (chip-linking, D-30).
- Ordering uses `created`, not the filename date (they can diverge for after-midnight notes).
- Empty category renders an explanatory line.
- Fixture scope: 2026-09-10 keeps a short body paragraph; 2026-09-07 gains a body paragraph over 240 characters (ellipsis path); 2026-09-09 body is the `# ` heading only (no excerpt element); 2026-09-08 sets `created: 2026-09-11` so its row groups under 2026-09-11, not its filename date. Build count stays 21 loaded / 22 found / 1 skipped.

## Examples

| Log state                                       | Row renders                                                                               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| body paragraph 500 chars                        | created-date cell, 240-char excerpt with ellipsis, tags; no title                         |
| body only a heading                             | created-date cell, no excerpt, tags                                                       |
| `created: 2026-09-02`, filename `2026-09-01.md` | listed at its `created` position; its cell shows 2026-09-02 and links `/logs/2026-09-02/` |
| 0 logs                                          | explanatory line                                                                          |

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
- L-AC-04 — Ordering is by `created`, not the filename date: the divergent fixture sits at its `created` position (2026-09-11, newest). (REQ-17)
- L-AC-05 — No row renders a title element; each row's date cell is an anchor whose label and `href` use the `created` date, and the divergent fixture anchors `/logs/2026-09-11/`. (REQ-17)
- L-AC-06 — The Logs index content column is constrained to the 65ch prose measure. (REQ-17, D-49)
- L-AC-07 — The list renders flat: no bordered container wraps the rows and no date-group heading elements exist. (REQ-17, D-50)

## Specification Coverage

REQ-17, REQ-19.

## Preserved Invariants

- Home page, Articles and Projects indexes unchanged.

## Out of Scope

- Log detail rendering (T8), tag page generation (T9).
