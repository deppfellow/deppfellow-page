---
td: td-ad2df5
type: chore
priority: P1
ownership: human-owned
blocked-by: None
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T17
---

# T17: GitHub settings actions - repo rename, Pages enablement, dispatch token

Delivered behavior: The repo is `deppfellow/deppfellow.github.io`, Pages serves the Actions artifact at the domain root, and the wiki-repo dispatch token exists and is proven live.

## Objective

ADR-0011's address decision plus the human half of D-28's dispatch secret (split out at pre-flight, D-39). These are GitHub settings actions, not code, and the rename must happen before any ticket bakes absolute root URLs.

## Delivered behavior

(see above)

## Steps (human)

1. Rename the repository to `deppfellow/deppfellow.github.io` and update the local remote.
2. Set Pages source to **GitHub Actions**.
3. Create a fine-grained PAT (or GitHub App token) with `contents: write` + `metadata: read` scoped to the site repo; store it as a secret in the `deppfellow-wiki` repo, and record the rotation date.
4. Run one manual test dispatch (T16's workflow) and confirm a site workflow run appears.

## Out of Scope

- Any code change; any workflow file; any content authoring.
- Custom-domain DNS setup (not part of this epic).
