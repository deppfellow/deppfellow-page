---
td: td-3ba9ec
type: feature
priority: P2
ownership: agent-owned
blocked-by: T2, T3, T4
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T12
---

# T12: Add Pagefind search as a band modal plus a scoped logs searchbox

Delivered behavior: a Search control in the rule band opens a Pagefind modal that finds article and project notes only; the logs index carries its own searchbox that finds logs only; every note detail page stays script-free.

## Objective

ADR-0010's human search, recast by the pilot (D-54) from the route version (PR #17, closed superseded, unmerged) to an overlay. The reading experience stays zero-JavaScript (D-08/D-23); the script policy narrows from "dedicated `/search` surface" to "search-carrying home and index pages plus the Component UI bundle".

## Interface Contract

- Search surfaces: `RuleBand` gains a Search trigger (`pagefind-modal-trigger`, styled as the band's label links) on exactly home, `/articles/`, `/projects/`, `/logs/`. No note detail page mounts it. The trigger is a button, not an anchor; it ships no href.
- `pagefind-modal` markup and the Component UI bundle load on those same pages; the search index itself fetches lazily on first search.
- Note detail pages (`/articles/<slug>/`, `/logs/<date>/`, `/projects/<slug>/`) ship no scripts; the article reading page's FAB remains its sole exception (REQ-12 unchanged).
- Index scope: each note content template marks its content region `data-pagefind-body` and declares `data-pagefind-filter="type"` with value `article`, `project`, or `log`. Pages without the mark (home, 404, band/nav chrome, tag pages) stay out of the index.
- The modal instance is configured to search type `article` and `project` only; the logs searchbox instance searches type `log` only (per-instance config, `configureInstance` from `@pagefind/component-ui`).
- The logs searchbox (`pagefind-searchbox`) sits between the `/logs/` heading and the first date group. Both the band trigger and the searchbox appear on `/logs/`.
- Results render through custom ruled-row templates in DESIGN.md's language (date plus title, plate tokens) in both surfaces; modal and searchbox chrome theme via Component UI CSS variables. No default-styled result rows.
- The `/search` route is deleted; `scripts/gate.mjs` `REQUIRED_STATIC` drops `/search/`.
- The build post-step remains: `astro build && pagefind --site dist`.
- Copy: band label `Search`; modal placeholder `Search articles and projects`; logs searchbox placeholder `Search logs`.

## Examples

| Action | Result |
| --- | --- |
| open home or any index, click band `Search` | modal opens in place; no page navigation |
| type a phrase from a fixture article in the modal | result linking to that article's route |
| type a phrase unique to a fixture log in the modal | no log result |
| on `/logs/`, type that same log phrase in the searchbox | result linking to that log's route |
| open `/articles/<slug>/` | no Search trigger; no script beyond the FAB |
| build | Pagefind bundle present in output; `dist/search/` absent |

## Setup

- `pagefind` and `@pagefind/component-ui` as devDependencies; wiring in `package.json` build script or `astro.config.mjs`.
- The closed branch `subagents/run_muf4jqel_5vfj1x/task_1` (PR #17) holds reusable pagefind wiring and a ruled-row result template; reuse is allowed, the route file is not.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -d dist/pagefind && test ! -e dist/search
```

## Acceptance Criteria

- L-AC-01 - The Pagefind bundle is present in the build output and `dist/search/` does not exist. (REQ-21)
- L-AC-02 - Built home and the three index pages contain the band Search trigger; no built note detail page contains it. (REQ-21, REQ-23)
- L-AC-03 - Built note detail pages contain no `<script>` except the article reading page's FAB. (REQ-21, D-31 as recast)
- L-AC-04 - A modal query for the fixture article-only phrase `recency tax` returns `/articles/memory-layers-for-long-horizon-agents/`; a modal query for a fixture log-only phrase returns no log. (REQ-21)
- L-AC-05 - The logs searchbox query for the fixture log-only phrase `one ember mark` returns the 2026-09-10 log route and no article or project result. (REQ-21)
- L-AC-06 - Modal and searchbox results render with the ruled-row template (date plus title), not Component UI default rows. (DESIGN.md)

## Specification Coverage

REQ-21 (as recast), REQ-28 route-set amendment (drops `/search/`).

## Preserved Invariants

- Note detail pages remain script-free (article FAB excepted).
- Home layout unchanged apart from the band Search control.
- Fixture build contract numbers hold: Loaded 21 notes, exact skip warning "skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created"; page count 25 (the `/search` route is gone, no page added).

## Out of Scope

- Search on note detail pages; custom keyboard shortcuts; search analytics; tag-page indexing; index content-scope tuning beyond the type filter; DESIGN.md formal amendment (maintainer follow-up).
