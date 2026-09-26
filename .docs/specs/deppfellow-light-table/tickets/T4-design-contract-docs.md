---
td: td-7cac08
type: task
priority: P2
ownership: agent-owned
blocked-by: T1, T2, T3
spec: .docs/specs/deppfellow-light-table/SPEC.md §Ticket Decomposition slice T4
---

# T4: Design-contract documentation - DESIGN.md dual-world amendment and ADR-0015

Delivered behavior: `DESIGN.md` and ADR-0015 carry the dual-world contract - both palettes, both component sets, every rule restated to hold in either world.

## Objective

When this ticket closes, the design contract documents what shipped: the light-table values beside the dark ones, the theme toggle and Menu trigger as first-class components, the icon exception on record, and an ADR that lets a future reader reconstruct why the light world is cold paper and why scripts grew by two tiny ones.

## Interface Contract

- `DESIGN.md` front matter: the `colors` map carries both values per token (dark and light-table) in the established format; `components` gains entries for the theme toggle (line icon, destination semantics) and the Menu trigger/panel (Scales caps, hairline stack, one-step disclosure).
- `DESIGN.md` body: a dual-world section stating the light-table concept, the cold-not-warm refusal, and the system-first persisted two-state theme model; the sun/moon icon recorded as the single icon exception to the no-icon vocabulary; every existing rule - Two-Ink, One Ember, Flat-Plate, Square, One-Step, Rule-Band, Measure, Ruled Row, Tabular, Two-Voice - restated so it holds in either world; the Rule band component section documents toggle placement (left of Search where Search renders, last otherwise) and the sub-640px collapse with the no-JS fallback.
- ADR-0015 at `.docs/adr/0015-light-table-dual-world-palette.md`, front matter `status: accepted`, `date: 2026-09-26`, house ADR structure (decision, context, considered options, consequences), recording: the light-table concept; the cold-not-warm refusal; system-first + persisted choice; the same-slot token strategy; and the supersedes citation - ADR-0015 supersedes in part ADR-0002's "ordinary pages stay script-free" line (spec `deppfellow-light-table` D-09/D-13).
- No code changes: `src/styles/global.css` is untouched and remains the token source of record; the docs mirror it.

## Examples

- `grep -qi 'f3f5f9' .docs/DESIGN.md` → hit (plate light value present in front matter).
- `grep -qi 'in either world' .docs/DESIGN.md` → hit (rules restated).
- `test -f .docs/adr/0015-light-table-dual-world-palette.md` → true, with `status: accepted` front matter and the ADR-0002 supersedes citation in the body.
- Edge: if any light value differs from `global.css` at review time, the doc is wrong - `global.css` wins and the doc gets fixed, never the reverse.

## Setup

- No build needed beyond the docs gates; work from the T1-T3 merged state so documented behavior matches shipped behavior.

## Gate

```sh
npm run format:check && npm run lint && grep -qi 'f3f5f9' .docs/DESIGN.md && grep -qi 'in either world' .docs/DESIGN.md && grep -qi 'single icon exception' .docs/DESIGN.md && test -f .docs/adr/0015-light-table-dual-world-palette.md && grep -qi 'supersedes' .docs/adr/0015-light-table-dual-world-palette.md
```

Verification skill: none - no driveable surface (docs-only ticket).

## Acceptance Criteria

- L-AC-01 — `DESIGN.md` front matter carries both values for all eight color tokens, matching `global.css` exactly (REQ-13).
- L-AC-02 — `DESIGN.md` body has the dual-world section (concept, cold-not-warm refusal, system-first persisted model) and every listed rule is stated to hold in either world (REQ-13; D-02, D-07).
- L-AC-03 — The sun/moon line icon is recorded in `DESIGN.md` as the single icon exception, and the theme toggle + Menu trigger/panel have component entries (REQ-13; D-03, D-04, D-10, D-11).
- L-AC-04 — ADR-0015 exists at the contracted path, `status: accepted`, covering concept, refusal, theme model, same-slot strategy, and the ADR-0002 supersedes citation (REQ-13; D-13).
- L-AC-05 — `npm run format:check` and `npm run lint` pass on the changed docs.

## Specification Coverage

REQ-13. Every REQ listed here appears in the Spec's coverage table mapped to T4, and every REQ mapped to T4 appears here.

## Preserved Invariants

- `CONTEXT.md` is untouched - its Light table, Theme toggle, and Rule band entries were updated in session and are already correct.
- ADR-0002 already carries its `superseded-by` front-matter marker (applied at quiz-gate resolution, D-13); T4 must not re-edit it.
- `global.css` is untouched; where doc and CSS ever disagree, CSS wins per the existing contract note.
- All other ADRs and `.docs/` content are read-only for this ticket.

## Out of Scope

- `.impeccable/design.json` - a generated mirror left to its own tooling; the documented divergence rule (global.css wins) covers it.
- Any code, test, or CI change.
- Re-litigating settled decisions - the log is the source; this ticket only writes the contract prose.
