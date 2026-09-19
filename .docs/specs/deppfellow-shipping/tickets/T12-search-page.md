---
td: td-3ba9ec
type: feature
priority: P2
ownership: human-owned
blocked-by: T2, T3, T4
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T12
---

# T12: Add the Pagefind search page with a rule-band entry

Delivered behavior: `/search` runs a Pagefind index over the built site, reachable from a Search control in the rule band; home and list pages stay script-free.

## Objective

ADR-0010's human search, moved to its own route so the reading and list surfaces stay script-free (D-08/D-23). It must be discoverable, which the council flagged as missing.

## Interface Contract

Route: `src/pages/search.astro` (new) plus a build post-step running the Pagefind indexer over `dist/`.

- Build step: after `astro build`, Pagefind indexes the output and writes its bundle into the site output.
- `/search` mounts the Pagefind UI; the generated Pagefind files are the exact artifact set for this route.
- The rule band gains a Search control (plain anchor) to `/search` on every page; the anchor itself ships no script.
- Scripts load only on `/search`; home, list, and reading pages carry no Pagefind script.
- Search results link to real built routes.

## Examples

| Action                                            | Result                                                 |
| ------------------------------------------------- | ------------------------------------------------------ |
| build                                             | Pagefind bundle present in output; `/search` mounts it |
| open `/search`, type a phrase from a fixture note | result with a working link                             |
| open `/articles/`                                 | no Pagefind script tag                                 |
| rule band on any page                             | Search anchor present                                  |

## Setup

- `WIKI_PATH=fixtures/vault npm run build` must run the Pagefind post-step (wired in `package.json` build script or `astro.config.mjs`).

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/search/index.html && ls dist/pagefind/ >/dev/null
```

## Acceptance Criteria

- L-AC-01 — `dist/search/index.html` exists and the Pagefind bundle is present in the build output. (REQ-21)
- L-AC-02 — The rule band in built pages contains an anchor to `/search`. (REQ-21, REQ-23)
- L-AC-03 — `dist/articles/index.html` and `dist/index.html` contain no `<script>` element. (REQ-21, D-31)
- L-AC-04 — A Pagefind query for a fixture-only phrase returns at least one result linking to an existing route. (REQ-21)

## Specification Coverage

REQ-21.

## Preserved Invariants

- Reading pages remain free of page scripts except the FAB (T7).
- Home layout unchanged apart from the new band control.

## Out of Scope

- Inline header search widget, search analytics, query highlighting beyond Pagefind defaults.
