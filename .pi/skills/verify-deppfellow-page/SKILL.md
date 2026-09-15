# verify-deppfellow-page

Project verification skill for deppfellow-page. Generated once per project
(2026-09-14, on demand after T1's legacy-process closure). Every verifier for
every ticket in this repo drives this skill; the skill maps features to the
checks that prove them. Map drift is `maintain-verification-skill`'s job,
never a ticket's.

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

## Command map

| Check | Command | Passes when |
| --- | --- | --- |
| Fresh install | `npm ci` | exits 0 from the committed lock alone |
| Typecheck | `npm run check` | astro check exits clean (requires `@astrojs/check` committed, see Known items) |
| Unit suite | `node --test src/lib/vault.test.ts` | all tests pass (19 as of 2026-09-14; a change in count needs a contract reason) |
| Ticket Gate | `WIKI_PATH=fixtures/vault npm run build 2>&1 \| tee /tmp/<ticket>-gate.log` | build completes, `grep -q 'skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created' /tmp/<ticket>-gate.log`, `test -f dist/index.html` |
| Diff typing | `npx tsc --noEmit -p tsconfig.json` | no errors |

tee every run to `/tmp/<ticket>-<check>.log` and cite the paths in your
approval reason. Evidence or it did not happen.

## Feature map

| Feature | Proven by | Expected |
| --- | --- | --- |
| Content loader `parseNote`/`readNotes` (`src/lib/vault.ts`) | unit suite + `fixtures/vault/**` + Gate log | `description` > `## Goal` (flattened to one line) > `undefined`; `origin` never read |
| Malformed front matter rejection | unit suite (wrong-typed tags/description/created, numeric created) + `broken-note` fixture | excluded from collection, `skipped` list carries `{path, reason}`, repo-relative warning in Gate log, build continues |
| Summary precedence fixtures | `a-smart-camera-*` (both fields), `goal-only`, `bare-note` | description wins; Goal body flattened incl. text after first blank line; neither loads with `description: undefined` |
| Category registry boundary | `_schema/categories.md` + build output | only registered folders render; language-suffixed files skipped with reason `language-suffixed (deferred, ADR-0004)` |
| Home page (`src/pages/index.astro`) | Gate: `dist/index.html` exists | ABOUT.md + 10 latest Articles build. `<meta name="description">` from Base layout proves NOTHING about note summaries |
| Toolchain (T0) | `npm run check` + build | Astro 7.3.x, Tailwind 4.3.x, unified processor, versions resolvable from the committed lock |

## Known items at generation time (2026-09-14)

- Fresh `npm ci` + `npm run check` currently FAILS: `@types/node` and
  `@astrojs/check` sit uncommitted in the working tree, absent from the
  committed lock (TS2307 on `node:*` imports; astro check prompt-installs
  transiently). Reopened T1's fix round is expected to commit both. If the
  check still fails on a clean checkout after T1 closes, that is a regression
  and a finding.
- No repo style linter exists, by design (briefing: lint config is a
  next-spec ticket). Style findings are out of scope; the lint gate activates
  "when one exists".
- Known Deferred, documented on T1 and OUT OF SCOPE everywhere: empty `## Goal`
  over-consumption (`## Goal` / `## Notes` / text yields `## Notes ...`) and
  `##` inside a fenced code block inside a Goal body treated as a boundary.
  Both ride with the T2/T3 summary-surface tickets.
- Rendering surfaces (index rows, reading page, tags, RSS, search) are owned
  by their own tickets (T2-T14). Verify only what your ticket's contract
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
