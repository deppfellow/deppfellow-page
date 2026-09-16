---
td: td-bffd30
type: feature
priority: P0
ownership: human-owned
blocked-by: None
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T1
---

# T1: Migrate the content model from `origin` to `description` with defined summary precedence

Delivered behavior: Notes load with `description` (not `origin`), summaries resolve by a defined precedence, and one malformed note never fails the whole build.

## Objective

Every downstream surface (lists, reading ledes, RSS summaries) reads one summary field. Today the loader reads a retired `origin` field and derives summaries from a `## Goal` section, and a bad note throws for the whole build. After this ticket: `description` > `## Objective` > omit, per-note skip with a logged warning, and fixtures that prove it.

> Amended D-43 (2026-09-16): the summary fallback heading is `## Objective` (renamed from `## Goal`).

## Interface Contract

Module: `src/lib/vault.ts` (existing), `src/content.config.ts` (existing), `fixtures/vault/**` (existing).

- `parseNote()` exposes `description: string | undefined` and no longer exposes `origin`.
- Summary resolution order for any note: front-matter `description`; else the first `## Objective` section's full body, with all whitespace runs collapsed to single spaces and trimmed; else `undefined`. 'Single line' describes the OUTPUT shape, not a first-line truncation: a multi-paragraph Objective body is flattened into one line.
- Wrong-typed front matter is malformed. Reject, do not coerce: `created` must be a string or a Date (a number is malformed, because gray-matter parses bare YAML dates to a Date and an integer would silently coerce to an unrelated epoch date); `tags`, when present, must be an array of strings; `description`, when present, must be a string. `parseNote` throws on any of these and `readNotes` routes it through the same `skipped` path with its warning.
- A note whose front matter fails validation (missing/unparseable `created`, wrong types) is **excluded** from the returned collection and reported on the `skipped` list with `{ path, reason }`. The build continues. `skipped` is the single reporting list: language-suffixed files appear there too, with reason `language-suffixed (deferred, ADR-0004)`.
- A note missing only `description` is **not** malformed; it loads with `description: undefined`.
- The loader emits a warning line per skipped note containing the repo-relative path.
- Zero parseable notes in a content-bearing run throws (feeds the T15 gate); a fixture-only run with zero notes is legal.

## Examples

| Input front matter | Result |
| --- | --- |
| `description: "Short summary"` + `## Objective` section | summary = `"Short summary"` |
| no `description`, `## Objective` body present | summary = Objective body, trimmed |
| neither | `description: undefined`, note still loads |
| `created: not-a-date` | note skipped, warning `skipped .../<note>.md: invalid created`, build continues |
| `origin: agent` only | ignored; `origin` is never read |

## Setup

- `fixtures/vault` contains at least: one note with both fields, one with only Objective, one with neither, one malformed.
- Commands run from repo root with `WIKI_PATH=fixtures/vault`.

## Gate

```sh
set -eo pipefail
WIKI_PATH=fixtures/vault npm run build 2>&1 | tee /tmp/t1-gate.log
grep -q 'skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created' /tmp/t1-gate.log
test -f dist/index.html
```

The original `grep -q 'description' dist/index.html` was removed as a false positive: it matches the Base layout's `<meta name="description">` and proves nothing about note summaries. The gate now proves the build succeeds, the loader ran, and the malformed note was skipped with a repo-relative warning.

## Acceptance Criteria

- L-AC-01 — `grep -rn "origin" src/lib/vault.ts src/content.config.ts` returns no front-matter read of `origin`. (REQ-01)
- L-AC-02 — A fixture with both `description` and `## Objective` yields the `description` value as the note's resolved `summary` (loader-level; the rendered Projects row is T3's `td-d84081` L-AC-02). (REQ-02)
- L-AC-03 — A fixture with neither renders with no summary line and does not fail the build. (REQ-02)
- L-AC-04 — A malformed fixture is absent from the loaded collection while every good fixture is loaded, and the warning names its repo-relative path. The literal `dist/` wording is T2/T3's surface and is not testable in T1 (only `dist/index.html` is emitted). (REQ-03)
- L-AC-05 — A non-empty `## Objective` body spanning multiple paragraphs flattens to one line containing all of it; the text after the first blank line is not dropped. (REQ-02)
- Known deferred edge case, OUT OF SCOPE for T1 (product decision, session ses_2946c4): an **empty** `## Objective` heading followed by another heading over-consumes the separating blank line, so `## Objective` / `## Notes` / text yields the summary `"## Notes text"` instead of omitting. The base code was also wrong here (it yielded `"## Notes"`). No fixture has an empty `## Objective`, so current build output is unaffected. Also deferred in the same regex: a `##` inside a fenced code block within an Objective body is treated as a section boundary. Both ride with the downstream summary-surface tickets (T2/T3).
- L-AC-06 — A numeric `created` (e.g. an integer or epoch millis) is malformed and lands on `skipped` like any wrong type; it must not silently coerce to a date. (REQ-03)

## Specification Coverage

REQ-01, REQ-02, REQ-03.

## Preserved Invariants

- The category registry boundary (`_schema/categories.md`) still gates which folders render.
- Existing home page output (`/`) still builds with ABOUT.md and 10 latest Articles.
- Language-suffixed files remain skipped.

## Out of Scope

- Any rendering of wikilinks/images (T5) and any list-surface layout work (T2/T3/T4).
- Changing the `created`/`tags` field names.
