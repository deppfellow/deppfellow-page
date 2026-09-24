# T8 verification record (td-2a7cd5)

Round 1. Verifier session `ses_79bac0` on `neuralwatt/deepseek-v4.1-flash` (per D-51/D-52; different family than the worker `zai/glm-5.3-flash`). Verdict: **approved**.

Worker branch `subagents/run_muf0tdks_j7sec6/task_1`, commits `a130ff3` (logs detail), `ca97bc0` (projects detail), `7998f1d` (h1 rider). Diff scope exactly 3 files: `src/pages/logs/[...date].astro` (new), `src/pages/projects/[...slug].astro` (new), `src/pages/articles/[...slug].astro` (one h1 class).

## Clean room

`/tmp/t8-clean`, git archive of the branch, `npm ci` exit 0. Gate PASS: 25 pages, "Loaded 21 notes" with the exact skip warning for `fixtures/vault/Articles/broken-note/broken-note.md` ("invalid created"), `dist/logs/2026-09-11/index.html` present (`/tmp/t8-gate.log`).

## Per-L-AC evidence

| L-AC    | Result | Evidence                                                                                                                                           |
| ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| L-AC-01 | PASS   | 3 project + 4 log detail routes; counts match index rows (articles 14 / projects 3 / logs 4 = 21)                                                  |
| L-AC-02 | PASS   | `/logs/2026-09-11/` exists (divergent fixture `2026-09-08.md`, `created: 2026-09-11`); `/logs/2026-09-08/` absent                                  |
| L-AC-03 | PASS   | `/logs/2026-09-09/` prev `/logs/2026-09-07/` next `/logs/2026-09-10/`; `/logs/2026-09-07/` next only; `/logs/2026-09-11/` prev only                |
| L-AC-04 | PASS   | measure 65ch (`global.css:83`); 0 unrendered `[[` on all 7 new routes; wikilink body renders title, labelled-slug, and degrade-to-plain-text cases |
| L-AC-05 | PASS   | no FAB markup on new routes                                                                                                                        |
| L-AC-06 | PASS   | articles h1 `text-title` (dev had `text-note`); `--text-title`/`--text-note` untouched; only 3 files changed                                       |

Metadata PASS: `td-orchestration` renders no lede (no description/Objective), `bench-tools` renders its Objective lede, ISO `<time>` element, TagChip hrefs `/tags/<tag>/`, Projects footer Back to `/projects/`. Preserved invariants PASS: home ABOUT and `/articles/` index render; list surfaces untouched.

Suite PASS (clean room): `format:check`, `lint`, `npm run check` (0 errors), `tsc --noEmit` all exit 0.

## Verifier notes, non-blocking

- Lint/format green in the clean room because `.agents/` is untracked and absent from the archive; matches the verify skill's red-on-dev-HEAD caveat, not a regression.
- Out-of-scope confirmed, not treated as findings: the logs index anchor `/logs/2026-09-08/` (T4 surface, pre-existing on dev where all 4 row hrefs are dead pre-T8; T8 reduces dead links to that one; owned by T4's unlanded round-2/3 work); the h1 rider carve-out (D-48/D-52).
- Astro would fail loudly if two logs ever shared a `created` date (duplicate route params). Contract silent; fail-loud accepted.
