# T12 verification (td-3ba9ec) - round 1

Verdict: **approved**

Worktree under review: `/home/deppfellow/workspace/projects/deppfellow-page/.git/subagents/run_muf4jqel_5vfj1x/task_1`
(branch `subagents/run_muf4jqel_5vfj1x/task_1`, HEAD e496ca1). Checks run on the committed branch state.

Tier-2 checks were authored blind from the T12 contract (Objective, Interface Contract, L-AC-01..04,
Preserved Invariants) before reading the diff.

## Environment

- Detached clean room: `git archive HEAD` of the branch worktree -> `/tmp/t12-clean` (no `node_modules`
  leak; verified absent). `npm ci` exit 0 from the committed lock (`/tmp/t12-clean-install.log`).
- Baseline clean room: `git archive 6054728` (dev HEAD, pre-T12) -> `/tmp/t12-base`, `npm ci` + build
  (`/tmp/t12-base-build.log`).
- All builds cleared `node_modules/.astro` first.
- Pagefind 1.5.2 resolved from lock (`package-lock.json:7465`).

## Checks run and evidence

| Check | Command | Result |
| --- | --- | --- |
| Fresh install | `npm ci` in /tmp/t12-clean | exit 0, 523 pkgs (`/tmp/t12-clean-install.log`) |
| Ticket Gate | `rm -rf node_modules/.astro && WIKI_PATH=fixtures/vault npm run build` | exit 0; `Loaded 21 notes`; exact skip warning `skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created`; 26 pages built (`/tmp/t12-gate.log`) |
| Typecheck | `npm run check` / `npx tsc --noEmit -p tsconfig.json` | 0 errors / exit 0 (`/tmp/t12-check.log`, `/tmp/t12-tsc.log`) |
| Gate script | `npm run gate` | exit 1 on pre-existing T10/T11 routes only (`/rss.xml`, `/404.html`, `/sitemap.xml`); `/search` NOT reported missing (`/tmp/t12-gate-script.log`) |
| Home regression | plate rows + ABOUT in `dist/index.html` | 10 `<li class="plate-row`; `survived being re-read` present |

## L-AC results

- **L-AC-01 PASS** - `dist/search/index.html` exists; `dist/pagefind/` contains the bundle
  (`pagefind.js`, `pagefind-component-ui.js/.css`, `wasm.en.pagefind`, `pagefind-entry.json`
  `page_count:26`, 26 fragment files). Build log: `26 page(s) built`.
- **L-AC-02 PASS** - every built HTML under `dist/` (26 files) contains `<a href="/search" ...>Search</a>`
  in the rule band; engine count of pages lacking it = 0. Anchor is a plain `<a>`.
- **L-AC-03 PASS** - `grep -c '<script' dist/index.html` = 0; `dist/articles/index.html` = 0. No pagefind
  reference in any non-`/search` HTML. Reading/detail pages (`/articles/<slug>/`, `/projects/<slug>/`,
  `/logs/<date>/`) also have 0 scripts - preserved invariant holds (FAB not landed yet, which is fine).
- **L-AC-04 PASS** - served clean-room `dist/` and drove `/search` in headless Chrome:
  - `Pagefind.search("deterministic build is a claim")` -> `resultCount:1`,
    url `/articles/deterministic-builds-beat-cached-ones/`, title `Deterministic Builds Beat Cached Ones`.
  - Component-UI interaction (typed into `pagefind-input`, waited, read `pagefind-results`) -> link
    href `/articles/deterministic-builds-beat-cached-ones/`.
  - Result route exists: `dist/articles/deterministic-builds-beat-cached-ones/index.html`.
  - Evidence: `/tmp/t12-search-test.log`.

## Preserved invariants

- Reading pages carry no page script (0 `<script>` on sampled detail pages).
- Home layout unchanged apart from the band control. Pixel diff (clean vs dev baseline):
  - desktop 1175 differing px, bbox `[883,25,1229,33]` - the rule-band row only.
  - mobile image is 56 device px (28 CSS px) taller because the new Search control wraps onto its own
    line at 390px; everything below is a uniform vertical shift. No horizontal overflow
    (`scrollWidth == clientWidth`). This change is the new band control itself, so within contract scope.
  - Evidence: `/tmp/t12-diff-desktop.png`, `/tmp/t12-bbox.mjs`.

## Non-blocking observations (not contract violations)

- Pagefind reports `Did not find a data-pagefind-body element ... Indexing all <body> elements`, so
  rule-band/nav text on every page enters the index. The contract only requires an index over the
  output, so this is a quality note for a later ticket, not a violation.

## Classification

`approved`. All four L-ACs, the Gate, fresh-install reproducibility, and both Preserved Invariants pass.
