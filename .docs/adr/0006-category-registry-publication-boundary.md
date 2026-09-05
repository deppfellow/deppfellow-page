---
status: accepted
date: 2026-08-24
---

# Category registry as the publication boundary

A category is a top-level folder, but the folder-name convention alone proved dangerous: any new top-level folder (e.g. a future `Archive/`) would silently become an auto-published category. Decision: a top-level folder is *eligible* as a category if its name has no leading `.` or `_`, but it is *published* only if listed in `_schema/categories.md` — the machine-readable registry the site build reads. Naming convention makes eligibility; the registry is the publication boundary.

## Considered Options

- Pure naming convention (no registry) — rejected in the Phase 1 adversarial review: new folders silently auto-publish.
- Registry with no convention — rejected: the `_`/`.` prefix rule already cleanly excludes scaffolding folders (`_schema/`, `_templates/`, `_assets/`, `.docs/`).

## Consequences

- Adding a category is a two-step act: create the folder, register it — deliberate, never accidental.
- The site build must read `_schema/categories.md`; an unlisted eligible folder renders nowhere.
- `llms.md`/catalog generation (ADR-0002) derives from the same registry, so agent-visible and human-visible content can never diverge.
