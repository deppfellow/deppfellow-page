---
td: td-725cf5
type: feature
priority: P2
ownership: human-owned
blocked-by: T1, T4
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T9
---

# T9: Generate chip-linked tag pages

Delivered behavior: `/tags/<tag>/` lists every note carrying that tag across categories, reachable from the chips on reading pages and log rows.

## Objective

Tags are the site's secondary axis. ADR-0008 promised the loop; the council found the pages orphaned, and D-30 restored chip-linking. This ticket makes tag pages reachable and useful.

## Interface Contract

Route: `src/pages/tags/[tag].astro` (new), generated per distinct tag across all published notes.

- Each page lists the tag's notes across all categories: ISO date, title linked to the note's canonical route, and a category label.
- Ordering: `created` descending.
- The page's `h1` is the tag name.
- Tag slugs are normalized (lowercase, spaces to `-`); the same normalization is used by chip-links so links always match generated routes.
- A tag with a single note still generates a valid page.
- Every chip generated in T4 (log rows) and T6/T8 (reading pages) resolves to a generated route.

## Examples

| Tag                                          | Page                                               |
| -------------------------------------------- | -------------------------------------------------- |
| `agents` on 3 notes across Articles and Logs | `/tags/agents/` with 3 rows, category labels shown |
| `synthesis` on 1 note                        | `/tags/synthesis/` with 1 row                      |
| tag `Agent Memory`                           | route `/tags/agent-memory/`; chip href matches     |

## Setup

- Fixtures include one tag on multiple notes across two categories, and one tag with a single note.
- `WIKI_PATH=fixtures/vault npm run build`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/tags/agents/index.html
```

## Acceptance Criteria

- L-AC-01 — Every distinct fixture tag produces a `/tags/<slug>/` route. (REQ-19)
- L-AC-02 — A tag page lists exactly the notes carrying it, across categories, with category labels. (REQ-19)
- L-AC-03 — Every chip `href` emitted in T4/T6/T8 has a corresponding generated tag route (no dead chips). (REQ-19, SPEC-AC-03)
- L-AC-04 — Tag normalization is identical between generation and chip-link emission. (REQ-19)

## Specification Coverage

REQ-19.

## Preserved Invariants

- List surfaces and reading pages unchanged except for chip link targets.
- Registry boundary intact.

## Out of Scope

- Tag clouds, tag indexes/listing pages, per-category tag filtering.
