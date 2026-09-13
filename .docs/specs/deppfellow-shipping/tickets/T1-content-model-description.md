---
td: td-bffd30
type: feature
priority: P0
ownership: agent-owned
blocked-by: None
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T1
---

# T1: Migrate the content model from `origin` to `description` with defined summary precedence

Delivered behavior: Notes load with `description` (not `origin`), summaries resolve by a defined precedence, and one malformed note never fails the whole build.

## Objective

Every downstream surface (lists, reading ledes, RSS summaries) reads one summary field. Today the loader reads a retired `origin` field and derives summaries from a `## Goal` section, and a bad note throws for the whole build. After this ticket: `description` > `## Goal` > omit, per-note skip with a logged warning, and fixtures that prove it.

## Interface Contract

Module: `src/lib/vault.ts` (existing), `src/content.config.ts` (existing), `fixtures/vault/**` (existing).

- `parseNote()` exposes `description: string | undefined` and no longer exposes `origin`.
- Summary resolution order for any note: front-matter `description`; else the first `## Goal` section body (trimmed, single line); else `undefined`.
- A note whose front matter fails validation (missing/unparseable `created`, wrong types) is **excluded** from the returned collection and reported on a `skipped` list with `{ path, reason }`. The build continues.
- A note missing only `description` is **not** malformed; it loads with `description: undefined`.
- The loader emits a warning line per skipped note containing the repo-relative path.
- Zero parseable notes in a content-bearing run throws (feeds the T15 gate); a fixture-only run with zero notes is legal.

## Examples

| Input front matter | Result |
| --- | --- |
| `description: "Short summary"` + `## Goal` section | summary = `"Short summary"` |
| no `description`, `## Goal` body present | summary = Goal body, trimmed |
| neither | `description: undefined`, note still loads |
| `created: not-a-date` | note skipped, warning `skipped .../<note>.md: invalid created`, build continues |
| `origin: agent` only | ignored; `origin` is never read |

## Setup

- `fixtures/vault` contains at least: one note with both fields, one with only Goal, one with neither, one malformed.
- Commands run from repo root with `WIKI_PATH=fixtures/vault`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && grep -q 'description' dist/index.html
```

## Acceptance Criteria

- L-AC-01 — `grep -rn "origin" src/lib/vault.ts src/content.config.ts` returns no front-matter read of `origin`. (REQ-01)
- L-AC-02 — A fixture with both `description` and `## Goal` yields the `description` value in the Projects row output. (REQ-02)
- L-AC-03 — A fixture with neither renders with no summary line and does not fail the build. (REQ-02)
- L-AC-04 — A malformed fixture is absent from `dist/` while every good fixture is present, and the warning names its path. (REQ-03)

## Specification Coverage

REQ-01, REQ-02, REQ-03.

## Preserved Invariants

- The category registry boundary (`_schema/categories.md`) still gates which folders render.
- Existing home page output (`/`) still builds with ABOUT.md and 10 latest Articles.
- Language-suffixed files remain skipped.

## Out of Scope

- Any rendering of wikilinks/images (T5) and any list-surface layout work (T2/T3/T4).
- Changing the `created`/`tags` field names.
