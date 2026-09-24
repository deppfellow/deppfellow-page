---
td: td-4cbeb1
type: chore
priority: P1
ownership: agent-owned
blocked-by: T1, T10, T11, T12
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T15
---

# T15: Add the GitHub Actions build, gate, and Pages deploy workflow

Delivered behavior: One workflow clones the wiki, builds under the registry boundary, asserts the route manifest, and deploys to Pages.

## Objective

The pipeline that turns a push into a live site. It must fail on a broken build and never deploy a missing route, while tolerating an empty vault until content lands (D-29).

## Interface Contract

File: `.github/workflows/build.yml` (new), committed to the default branch.

- Triggers: `push` to the site repo, `workflow_dispatch`, and `repository_dispatch` of the site's event type (fired by T16).
- Checkout: clones the wiki repo's **default branch** explicitly (the dispatch event carries no ref) using `WIKI_PATH`.
- Build: installs deps, runs the build that produces `dist/`.
- Gate: asserts a build-emitted manifest listing the required routes - every registered category index, `rss.xml`, `search`, `404.html`, `sitemap.xml`. Any missing route fails the job and no deploy runs.
- Article count: zero Articles emits a warning annotation but does not fail; a content-bearing run that parses zero Articles fails.
- Deploy: GitHub Pages via the standard artifact action, only after the gate passes.
- Permissions follow least privilege for Pages deploy.

## Examples

| State                             | Behavior                                  |
| --------------------------------- | ----------------------------------------- |
| all routes present, 5 Articles    | gate passes, deploy runs                  |
| `sitemap.xml` missing             | gate fails, no deploy, job exits non-zero |
| empty vault, shell routes present | warning annotation, deploy runs           |
| wiki unreachable                  | job fails before build                    |

## Setup

- Requires the repo's Pages source set to GitHub Actions (T17) for the deploy step to succeed.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/manifest.json
```

## Acceptance Criteria

- L-AC-01 — `.github/workflows/build.yml` exists, is valid YAML, and declares the three triggers. (REQ-26)
- L-AC-02 — The workflow checks out the wiki default branch explicitly and builds with `WIKI_PATH`. (REQ-26, REQ-34/D-34)
- L-AC-03 — The gate fails on a missing required route (demonstrated by deleting one route and observing failure). (REQ-28)
- L-AC-04 — Zero Articles produces a warning and still deploys; a content-bearing zero-parse run fails. (REQ-28, D-29)
- L-AC-05 — The build emits the route manifest the gate consumes. (REQ-28)

## Specification Coverage

REQ-26, REQ-28.

## Preserved Invariants

- Local development is unaffected (`WIKI_PATH` fallback still works).
- Broken builds never blank the live site (Pages keeps the last good deploy).

## Out of Scope

- The wiki-side dispatch workflow and secret (T16), the repo rename and Pages source setting (T17).
