---
status: accepted
date: 2026-08-24
---

# Write-direct; ingest pipeline deferred

Notes are written directly into the vault (humans into category folders, agents into `Private/Drafts/`). A raw-source ingest pipeline — capture sources, propose syntheses, approve into wiki pages — was designed in the legacy page-project plan but deferred. Decision: write-direct now; the Sources layer can slot in later without restructuring, because it feeds the same vault as an upstream stage rather than replacing the writing model.

## Consequences

- No capture/quarantine/approval machinery exists today; when the ingest need becomes real, its glossary terms (Raw Source, Proposed Synthesis) come out of retirement and get ADRs of their own.
- Agents author drafts in `Private/Drafts/<Category>/` and never edit public notes in place — promotion is a human-confirmed move.
