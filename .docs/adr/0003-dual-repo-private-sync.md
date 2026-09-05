---
status: accepted
date: 2026-08-24
---

# Dual-repo private sync

Phase 1 accepted a limitation: `Private/`, `.docs/`, and `.tmp/` are gitignored, so drafts and design docs had no version history and never reached other machines — GitHub holds only the public half of the vault. Decision: a second, private git repo nested inside the vault covers `Private/` and `.docs/` (the outer repo already gitignores these paths, so the two repos cannot collide). This resolves the Phase 1 limitation instead of accepting it.

## Consequences

- Drafts and design docs (including these ADRs) get version history and cross-machine sync.
- Cost: a second remote and an occasional second `git push`; the outer public repo must keep its gitignore entries forever or it will leak the private repo's contents.
