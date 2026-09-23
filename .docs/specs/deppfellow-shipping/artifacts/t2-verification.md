VERDICT: approved

REASON:
T2 is met. Exactly one file changed in the reviewed range: `src/pages/articles/index.astro` (new, 63 lines) against dev base `26e3d22`. I verified the Interface Contract, all L-ACs, Preserved Invariants, and the tier-2 gate blind against the contract before reading the diff. No contract violation found.

Check suite (run in this worktree, WIKI_PATH set where the content layer demands it, as CI does):

- `npm run format:check` - exit 0, "All matched files use Prettier code style!"
- `npm run lint` - exit 0, no eslint output.
- `npm run check` - exit 0 with `WIKI_PATH=fixtures/vault`: 14 files, 0 errors, 0 warnings, 0 hints. Note: without `WIKI_PATH` it exits 1 (`No vault found`), which is pre-existing content-layer behavior and matches CI, which sets `WIKI_PATH: fixtures/vault` at job level.
- `npx tsc --noEmit -p tsconfig.json` - exit 0 after `astro check`/sync generated `.astro/types.d.ts`. The first bare run exited 2 with `Cannot find module 'astro:content'` because generated types were absent; that is a command-ordering artifact, not a source defect. CI runs `check` before `tsc` for the same reason.
- `WIKI_PATH=fixtures/vault npm run build && test -f dist/articles/index.html` - exit 0; page built.

Loader contract (tier-2, cleared `node_modules/.astro` first): log contains exactly `Loaded 21 notes from .../fixtures/vault` and the single skip `skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created`.

AC evidence against built output:

- L-AC-01: `dist/articles/index.html` exists. `grep -o '<li class="plate-row'` gives 14 rows, equal to the 14 loaded fixture Articles (15 files, 1 broken-note skipped). Example table says 12 but the binding clause is "one per fixture Article"; 14 is correct.
- L-AC-02: parses every fixture Article's front-matter `description` and its `## Objective` body, normalizes whitespace, and greps the built index: zero leaks. No `<img>`, no excerpt/tag content. The single `description` token on the page is the Base layout's hardcoded `<meta name="description">`, unrelated to note summaries.
- L-AC-03: 14 `<time>` values, all `YYYY-MM-DD`: 2026-09-11, 2026-09-11, 2026-09-08, 2026-09-01, 2026-08-24, 2026-08-15, 2026-08-04, 2026-07-27, 2026-07-16, 2026-07-02, 2026-06-19, 2026-06-05, 2026-05-21, 2026-05-02. Monotonically non-increasing (a single tie at the top broke by slug), which satisfies "descending".
- L-AC-04: all 14 row hrefs resolved to existing files under `dist/articles/<slug>/index.html` (missing_routes=0).
- Empty category: scratch vault in `/tmp` with an empty `Articles/` folder built successfully (exit 0). `/articles/index.html` renders the single line `No articles published yet.`, 0 rows, 0 `<table>`, 0 `<time>`. Static page exists, so it serves 200. No broken markup.

Preserved Invariants:

- Home page unchanged: only `index.astro` was added, so `src/pages/index.astro` and its dependencies are untouched. Built `dist/index.html` has 10 plate rows, the ABOUT body marker `survived being re-read`, and rule-band counts Articles 14 / Projects 03 / Logs 04, identical on `/articles/`.
- Rule band and category counts unchanged: the new page reuses `RuleBand.astro`; counts shown are 14/03/04.

Tier-2 skill results: Ticket Gate, typecheck, diff typing, and home-page assertions all pass as above. The skill's Known-items claim that lint/format are red on dev HEAD no longer holds; both are green here.

Notes (not findings, outside contract scope):

- Fresh-install reproducibility (`npm ci` in a detached `/tmp` clean room) could not be completed: the box is netless, some tarballs are not in cache, and npm fails with `EAI_AGAIN registry.npmjs.org`. The committed lock is unchanged by this ticket and node_modules is installed, so this is an environment limitation, not a T2 defect.
- The box `/tmp` is per-invocation ephemeral, so log files do not survive between bash calls. Each assertion above was reproduced in a single consolidated run and its output is quoted inline.
- Scope-creep guard: the page recomputes rule-band `links` locally rather than sharing the home page's helper, and adds an "Articles" h1 plus a "Newest first" label. The contract does not constrain header chrome or helper reuse, so this is out of scope and not a finding.

EVIDENCE:
Log paths written during the runs: `/tmp/t2-formatcheck.log`, `/tmp/t2-lint.log`, `/tmp/t2-check-wiki.log`, `/tmp/t2-tsc2.log`, `/tmp/t2-final-gate.log`, `/tmp/t2-empty-build.log`, `/tmp/t2-clean-npmci.log`. The box `/tmp` is per-invocation ephemeral, so these files are not retained; the same commands and their exit statuses are reproduced inline in the REASON above. Built artifacts inspected in-tree: `dist/articles/index.html`, `dist/index.html` (gitignored, not committed).
