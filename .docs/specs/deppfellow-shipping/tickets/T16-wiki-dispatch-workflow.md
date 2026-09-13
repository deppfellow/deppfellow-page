---
td: td-51defc
type: chore
priority: P1
ownership: agent-owned
blocked-by: T15
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T16
---

# T16: Add the wiki-side dispatch workflow and its token setup

Delivered behavior: A push to the wiki repo fires the site build via `repository_dispatch`, authenticated by a scoped token stored as a wiki-repo secret, with setup, rotation, and a test dispatch.

## Objective

The publish trigger's sender half. The council proved this was unowned and that ADR-0007's "no secrets" was false for cross-repo dispatch; D-28 owns it. Without this, pushes to the wiki never rebuild the site.

Scope note (pre-flight recast, D-39): this ticket delivers the **workflow file and its documentation**. Creating the token, storing the secret, and proving a live dispatch are human GitHub actions and live in T17.

## Interface Contract

Artifacts: a workflow file in the `deppfellow-wiki` repo (`.github/workflows/notify-site.yml`) and a documented secret setup.

- Trigger: `push` to the wiki's default branch.
- Action: create a `repository_dispatch` on the site repo with a stable `event_type` matching T15's receiver.
- Auth: a fine-grained PAT (`contents: write` on the site repo, `metadata: read`) or a GitHub App token, stored as a wiki-repo secret. The token is never echoed or logged.
- The dispatch uses the same `event_type` string T15 listens for; the pair is asserted in this ticket's docs.
- Setup documentation covers: creating the token, storing the secret, rotation/expiry, and the failure mode (an expired secret means the dispatch silently stops firing).
- A test dispatch step proves the loop: run the wiki workflow manually and observe a site workflow run.

## Examples

| Action | Result |
| --- | --- |
| push to wiki default branch | site workflow run appears |
| missing/expired secret | workflow fails loudly at the dispatch step (not silent) |
| manual test dispatch | site workflow run appears, evidenced in the ticket log |

## Setup

- The wiki repo exists and is the one referenced by T15's clone.
- The site repo's Pages and default branch are configured per T17/T15.

## Gate

```sh
yq '.on.push' "${WIKI_PATH}/.github/workflows/notify-site.yml" && grep -q "$(grep -oE "types: \[?[a-z-]+\]?" .github/workflows/build.yml | grep -oE '[a-z-]+$')" "${WIKI_PATH}/.github/workflows/notify-site.yml"
```

The worker writes the workflow into the wiki checkout reachable via `WIKI_PATH` and runs the gate against it. If no writable wiki checkout exists in the session, the ticket is **held back**, not thinned.

## Acceptance Criteria

- L-AC-01 — The wiki-side workflow exists at `${WIKI_PATH}/.github/workflows/notify-site.yml` and targets the same `event_type` T15 declares. (REQ-27)
- L-AC-02 — The workflow reads the token from a named secret and fails loudly when it is absent (asserted by the workflow's `if`/error step in the file). (REQ-27)
- L-AC-03 — Setup/rotation documentation exists and names the token scope explicitly. (REQ-27)

## Specification Coverage

REQ-27.

## Preserved Invariants

- The wiki repo's content and public visibility are unchanged.
- Failing to dispatch never corrupts the vault.

## Out of Scope

- The site-side receiver workflow (T15), repo renames (T17), PAT rotation automation.
