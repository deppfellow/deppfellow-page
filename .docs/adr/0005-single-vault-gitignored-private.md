---
status: accepted
date: 2026-08-24
---

# One vault, gitignored Private/

The wiki could have been split into separate human and agent vaults, or separate public/private vaults. Decision: one Obsidian vault — a single graph and a single search index — with `Private/` gitignored so the public git repo carries only the public layer. Visibility is a layer inside one vault, not a vault split.

## Considered Options

- Multiple vaults (public/private, human/AI) — rejected: no shared graph, no shared search, duplicated structure, and Obsidian supports only one vault per folder tree anyway.

## Consequences

- The same note can move between layers (draft → promote) without leaving the vault.
- "Public" means *committed to GitHub*, not *shown on site* — the site renders only registry-listed categories (ADR-0006).
- `Private/` had no version history until the dual-repo decision (ADR-0003) resolved it.
