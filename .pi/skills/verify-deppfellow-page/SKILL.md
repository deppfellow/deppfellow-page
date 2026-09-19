---
description: Project verification skill for deppfellow-page.
---

# verify-deppfellow-page

Generated once per project (2026-09-14, on demand after T1's legacy-process closure).
Every verifier for every ticket in this repo drives this skill; the skill maps
features to the checks that prove them. Map drift is `maintain-verification-skill`'s
job, never a ticket's.

Maintained 2026-09-19 after the T0 stream (70902ce..e0ff772): the baseline reset
deleted the unit suite, the home page and content layer landed, and the capture /
pixel-diff tooling arrived. Every claim below was re-proven against dev HEAD
(e0ff772) on 2026-09-19 unless marked otherwise.

## Verifier role (read first)

You are a fresh-context verifier on a different model family than the worker.
You never implement. You author tier-2 checks blind from the ticket contract
(Objective, Interface Contract, L-ACs, Preserved Invariants) BEFORE reading
the diff or prior review verdicts, then execute. Findings cite the contract;
anything it does not cover is out of scope, not a finding. Verdict vocabulary:
`approved` | `changes_requested` (enumerated contract violations only) |
`blocked` (cannot verify). PARTIAL does not exist.

## Environment

- Work in your isolated git worktree, branched from the dev HEAD you are
  verifying. Never run installs or builds in the main checkout.
- Node >= 24 (type stripping lets `node --test` run `*.test.ts` directly).
- Fresh-install reproducibility is part of every verdict: start from
  `npm ci` (the committed lock is the user-facing environment). A gate that
  only passes with uncommitted or prompt-installed packages is a finding.
- Bound every command with `timeout N` (default 120s; installs and builds
  get an explicit cap). Search only your worktree and `/tmp` - never
  `find /`, never parent directories. A missing artifact is a reported gap,
  not a search job. The same command failing twice means stop and report.
- Fresh-install checks run in a DETACHED clean room: copy the worktree to
  `/tmp/<ticket>-clean` and `npm ci` there. Worktrees nested under the main
  checkout leak the parent's `node_modules` into TS module resolution -
  proven 2026-09-15 when a worktree tsc "passed" by resolving the main
  checkout's uncommitted `@types/node` (see /tmp/t1-r1-contamination.log).
- Content-honest builds clear the Astro content store first: a warm
  `node_modules/.astro/data-store.json` silently re-renders notes and ABOUT
  that no longer exist in the vault (proven 2026-09-19). `rm -rf
  node_modules/.astro` before any build whose output you assert on.

## Command map

| Check | Command | Passes when |
| --- | --- | --- |
| Fresh install | `npm ci` | exits 0 from the committed lock alone |
| Typecheck | `npm run check` | astro check exits clean (0 errors; `@astrojs/check` and `@types/node` are committed since T0) |
| Ticket Gate | `rm -rf node_modules/.astro && WIKI_PATH=fixtures/vault npm run build 2>&1 \| tee /tmp/<ticket>-gate.log` | build exits 0; log contains `Loaded 21 notes from` and `skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created`; `dist/index.html` exists with 10 `<li class="plate-row` rows and the ABOUT body (grep `survived being re-read`) |
| Diff typing | `npx tsc --noEmit -p tsconfig.json` | no errors |
| Visual capture | `npm run preview -- --port 4321 &` then `node scripts/review-capture.mjs http://127.0.0.1:4321/ /tmp/<ticket>-shots` | `desktop.png` (1440x900) and `mobile.png` (390x844 @2x) written; needs Chrome at `CHROME_PATH` (default `~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`) |
| Pixel diff | `node scripts/pixel-diff.mjs a.png b.png [diff.png]` | exit 0 with `0 differing pixels` when the images match; otherwise prints the count and writes the highlighted `diff.png` |

tee every run to `/tmp/<ticket>-<check>.log` and cite the paths in your
approval reason. Evidence or it did not happen.

There is no lint or format gate: `npm run lint` and `npm run format:check`
exist but are red on dev HEAD (see Known items). Do not cite them as passing.

## Feature map

| Feature | Proven by | Expected |
| --- | --- | --- |
| Content loader `parseNote`/`readNotes`/`readAbout`/`vaultRoot` (`src/lib/vault.ts`) | Ticket Gate log + `fixtures/vault/**` | loads 21 fixture notes (22 found, 1 skipped); summary source is front-matter `description` else `undefined` - there is NO Objective handling on dev; `origin` never read; unset `WIKI_PATH` throws `No vault found. Set WIKI_PATH to the vault checkout.` |
| Malformed front matter rejection | Ticket Gate log | missing/unparseable `created` (a number included) and wrong-typed `tags` skip the note via `{path, reason}`; warning is `skipped <repo-relative path>: <reason>`; build continues; all notes failing throws. Wrong-typed `description` currently coerces to `undefined` without a skip - the T1 contract turns that into a rejection |
| Summary precedence fixtures | `wikilink-resolution` (description + `## Objective`), `objective-only` (`## Objective` only), `bare-note` (neither) | these fixtures are T1/T2/T3 INPUTS: precedence and Objective flattening are not implemented on dev, so never assert them against current source; only `bare-note` loads with `description: undefined` today |
| Category registry boundary | `_schema/categories.md` + Ticket Gate + `dist/index.html` | only registered folders render; nav counts Articles 14 / Projects 03 / Logs 04 sum to the 21 loaded notes; language-suffixed files would skip with reason `language-suffixed (deferred, ADR-0004)` but NO fixture exercises that path - code-only claim, not build-proven |
| Home page (`src/pages/index.astro`, `src/layouts/Base.astro`, `src/components/PlateRow.astro`, `src/components/RuleBand.astro`) | Ticket Gate: `dist/index.html` | ABOUT body renders; exactly 10 latest Articles as plate rows with `<time>` dates; Base layout hardcodes `<meta name="description">`, which proves NOTHING about note summaries; a missing ABOUT.md passes the gate silently on a fresh build (known blindness) |
| Content layer (`src/content.config.ts`) | Ticket Gate log | `Loaded N notes from` is the only affirmative load signal; loader skips are warn-and-continue but a zod/`parseData` failure is build-FATAL; missing ABOUT.md is a silently empty meta collection; loaders never clear store entries, so stale entries survive warm builds (clear the store, see Environment) |
| Capture + pixel-diff tooling (`scripts/review-capture.mjs`, `scripts/pixel-diff.mjs`, `scripts/capture-references.mjs`) | Visual capture + Pixel diff command rows | CDP screenshots of the preview server with forced dark scheme and parked pointer; pixel-diff is the pass/fail visual gate; `capture-references.mjs` collects remote design-reference packs under `.docs/references/packs` |
| Toolchain (T0) | `npm run check` + Ticket Gate + Diff typing | Astro 7.3.2, Tailwind 4.3.3, `@astrojs/markdown-remark` 7.3.1 with `processor: unified()` pinned (ADR-0014), TypeScript 6.0.3 - all resolvable from the committed lock |

## Known items (2026-09-19 maintenance)

- No unit suite exists. `src/lib/vault.test.ts` was deleted with the agent
  baseline reset (3e92276) and tests are T1-owned until that ticket lands.
  The archived suite targeted a dead API (`note.summary`, `## Goal`, throw on
  bad description) - do not restore it as-is.
- A style linter now exists and is RED on dev HEAD: `npm run lint` fails with
  762 errors (632 `no-undef`, dominated by `.agents/` tooling the eslint
  ignores do not exclude) and `npm run format:check` flags 91 files, mostly
  the same `.agents/` tree. Product gap, reported 2026-09-19; becomes a gate
  only when it is green.
- The generation-time fresh-install failure is RESOLVED: `@types/node` and
  `@astrojs/check` are committed, and a detached clean room passes
  `npm ci` + `npm run check` (proven 2026-09-19).
- Content-layer staleness: the `deppfellow-vault`/`deppfellow-about` loaders
  never clear store entries, so a warm `node_modules/.astro/data-store.json`
  silently re-renders a deleted ABOUT.md (proven 2026-09-19). Cleared-store
  builds are the verifier norm; fixing the staleness is a product gap,
  reported, not documented as expected behavior.
- The committed t0-shots references predate e0ff772 and differ by 586 pixels
  on desktop. Recapture before using them as a visual baseline.
- Known Deferred, documented on T1 and OUT OF SCOPE everywhere: empty `## Objective`
  over-consumption and `##` inside a fenced code block inside an Objective body.
  Both are unreachable until T1 lands the Objective path.
- Rendering surfaces (index rows, reading page, tags, RSS, search) are
  owned by their own tickets (T2-T14). Verify only what your ticket's contract
  covers plus preserved invariants.

## Recording

Precondition: the orchestrator runs `td review` BEFORE you are dispatched -
you arrive with the ticket `in_review` and only record. If the status is
wrong, report back; never self-transition: running `td review` yourself
marks your session involved, and td's governance guard then blocks your own
attestation ("cannot approve: you were involved" - hit for real on
2026-09-15, /tmp/t1-r1-approve.log).

```sh
TD_CONTEXT_ID=ver-<ticket>-<round> td -w <main-repo-root> session --new
TD_CONTEXT_ID=ver-<ticket>-<round> td -w <main-repo-root> approve <ticket-id> --record-only \
  --reason "<verdict; findings cite contract lines; evidence paths /tmp/*.log>"
```

Non-approving verdicts add `--decision changes_requested`. Round cap 2: a
second `changes_requested` with the disagreement unresolved parks the ticket
blocked with both writeups - escalate, never a third round.
