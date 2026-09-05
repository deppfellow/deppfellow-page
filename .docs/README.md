# Documentation

This directory contains durable project guidance, operational procedures, completed reports, agent policy, and project handoffs.

## Categories

| Directory | Purpose | Primary question |
| --- | --- | --- |
| `agents/` | Agent workflow and delivery policy | How must an agent work in this repository? |
| `guides/` | Stable conceptual and educational material | Why does this design work? |
| `handoffs/` | Active, backlog, and archived project state | What work is approved, active, or complete? |
| `reports/` | Completed investigations with dated evidence and conclusions | What happened, and what did the evidence show? |
| `runbooks/` | Repeatable operating, diagnosis, migration, and recovery procedures | What exact steps should an operator follow? |
| `scratch/` | Temporary notes and optional local Markdown issue tracking | What is still being explored? |

`scratch/` is created only when temporary work exists. Durable conclusions must move to a guide, runbook, report, handoff, or architecture decision.

## Maintenance rules

1. Put procedures with prerequisites, commands, verification, and rollback in `runbooks/`.
2. Put explanations, architecture walkthroughs, and learning material in `guides/`.
3. Put completed experiments and incident evidence in `reports/`.
4. Keep unresolved and disposable notes in `scratch/`.
5. Update links when moving a durable document.
6. Keep commands explicit about whether they read state or change state.
7. Record version and host assumptions when a document depends on them.
