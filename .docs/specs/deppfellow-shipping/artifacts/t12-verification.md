# T12 verification record (td-3ba9ec)

Round 1 of the recast contract (band modal + scoped logs searchbox). Verdict:
**approved**.

Worktree under review:
`/home/deppfellow/workspace/projects/deppfellow-page/.git/subagents/run_mufen9a0_2o30em/task_1`
(branch `subagents/run_mufen9a0_2o30em/task_1`, HEAD `28ba827`, PR #18 against dev, CI SUCCESS).
The route-based v1 (PR #17) is superseded and was ignored.

Tier-2 checks were authored blind from the recast T12 contract
(`.docs/specs/deppfellow-shipping/tickets/T12-search-page.md`: Objective, Interface Contract,
Examples, Setup, Gate, L-AC-01..06, Preserved Invariants) before reading any diff, branch
content, or prior artifact.

## Clean room

- Detached clean room `/tmp/t12-clean`: `git archive 28ba827` of the branch worktree (no
  `node_modules` leak), `npm ci` exit 0 from the committed lock (`/tmp/t12-install.log`).
- Baseline clean room `/tmp/t12-base`: `git archive ec497cf` (dev HEAD), `npm ci` + build exit 0
  (`/tmp/t12-base-install.log`, `/tmp/t12-base-build.log`).
- All builds cleared `node_modules/.astro` first. Pagefind 1.5.2 resolved from the lock.
- Behavioral checks: served `dist/` over local HTTP and drove the built pages in headless
  Chrome (Chromium 149) over CDP, real click/type against the upgraded custom elements, in a
  detached `/tmp` clean room (`/tmp/t12-cdp-eval.mjs`, `/tmp/t12-logsbox-keys.mjs`).

## Checks run and evidence

| Check           | Command                                                                | Result                                                                                                |
| --------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Fresh install   | `npm ci` in /tmp/t12-clean                                             | exit 0, 526 pkgs (`/tmp/t12-install.log`)                                                             |
| Ticket Gate     | `rm -rf node_modules/.astro && WIKI_PATH=fixtures/vault npm run build` | exit 0; `Loaded 21 notes` + exact skip warning; 26 pages; Pagefind bundle built (`/tmp/t12-gate.log`) |
| Typecheck       | `npm run check` / `npx tsc --noEmit -p tsconfig.json`                  | 0 errors / exit 0 (`/tmp/t12-check.log`, `/tmp/t12-tsc.log`)                                          |
| Gate script     | `npm run gate`                                                         | exit 1 on exactly `/rss.xml`, `/sitemap.xml`; `/search/` dropped (`/tmp/t12-gate-mjs.log`)            |
| Base gate (dev) | base clean room `npm run gate`                                         | exit 1 on `/rss.xml`, `/search/`, `/sitemap.xml` (`/tmp/t12-base-gate.log`)                           |
| Format / lint   | `npm run format:check` / `npm run lint`                                | both exit 0 (`/tmp/t12-format.log`, `/tmp/t12-lint.log`)                                              |
| Home regression | plate rows + ABOUT in `dist/index.html`                                | 10 `<li class="plate-row`; `survived being re-read` present                                           |

## L-AC results

- **L-AC-01 PASS** - `dist/pagefind/` present (`pagefind.js`, `pagefind-component-ui.js/.css`,
  `wasm.en.pagefind`, `pagefind-entry.json`); `dist/search/` absent (`/tmp/t12-gate.log`).
- **L-AC-02 PASS** - `pagefind-modal-trigger` in exactly `dist/index.html`,
  `dist/articles/index.html`, `dist/projects/index.html`, `dist/logs/index.html`; 0 of the 21
  note-detail pages contain it; 404 none. Static markup is a custom element with no `href`
  (`RuleBand.astro:49`); upgraded DOM is `<button class="pf-trigger-btn" type="button">` with
  `href=null` (`/tmp/t12-lac04.log`), computed typography/color identical to the band label links
  (computed-style probe, `/tmp/t12-styles.log`).
- **L-AC-03 PASS** - all 21 note-detail pages ship 0 `<script>` (`grep -c '<script'` = 0 across
  `/articles/*/`, `/logs/*/`, `/projects/*/`). The article FAB (T7) is not landed on this base, so
  the "sole exception" is absent and the stronger assertion holds. No `pagefind-component-ui`
  reference on any detail page.
- **L-AC-04 PASS** - headless modal (real trigger click + typed input) on home:
  `recency tax` -> one result `href="/articles/memory-layers-for-long-horizon-agents/"`,
  li `.result-item` > `a.rule-row`, no default `.pf-result-card`; `one ember mark` -> no result
  (raw Pagefind `one ember mark` does return `/logs/2026-09-10/`, so the modal type filter is what
  excludes it) (`/tmp/t12-lac04.log`, `/tmp/t12-scope.log`).
- **L-AC-05 PASS** - headless `/logs/` searchbox typed `one ember mark` -> exactly one row
  `href="/logs/2026-09-10/"` (`a.rule-row`, date `2026-09-10`); `recency tax` -> no result, so no
  article/project leaks (`/tmp/t12-lac05.log`, `/tmp/t12-lac06.log`).
- **L-AC-06 PASS** - modal rows render from the `text/pagefind-template` producing
  `li.result-item > a.rule-row` with `.rule-row-date` + `.rule-row-title`; searchbox rows render
  `div.pf-searchbox-results > a.rule-row` with the same date/title spans. Zero default
  `.pf-result-card` rows observed in either surface (`/tmp/t12-lac04.log`, `/tmp/t12-lac06.log`).

## Preserved invariants

- Note detail pages script-free (see L-AC-03).
- Home layout unchanged apart from the band control: 10 plate rows and the ABOUT body intact;
  no route added or removed. `diff` of the built page set is empty.
- Fixture contract numbers hold: `Loaded 21 notes from`; exact warning
  `skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created` (`/tmp/t12-gate.log`).
- Page set unchanged: branch 26 pages vs base 26 pages, identical
  (`/tmp/t12-pages.txt`, `/tmp/t12-base-pages.txt`, `diff` clean). No `/search` route in either.
- Per-instance scope verified on the built DOM: modal `searchFilters = {type:{any:[article,project]}}`,
  searchbox `searchFilters = {type:[log]}` (`/tmp/t12-lac04.log`, `/tmp/t12-lac05.log`).
- Copy pinned: band label `Search`, modal placeholder `Search articles and projects`, logs
  searchbox placeholder `Search logs`.

## Non-blocking observations (not contract violations)

- The Interface Contract parenthetical names `configureInstance` for per-instance config; the
  worker instead sets `manager.getInstance(name).searchFilters`, documented at
  `src/components/RuleBand.astro:63` and in the ticket handoff: `configureInstance` in
  `@pagefind/component-ui` 1.5.2 cannot express result filters (it forwards to `getInstance`'s
  option bag, which has no filter field). Verified against `component-ui.mjs:3014`.
  `searchFilters` is the property the library's own search path reads (`component-ui.mjs:2804`),
  and the behavioral scope ACs pass, so the mechanism deviation does not change the contract.
- Pagefind indexes 20 of the 21 marked pages: `filters()` reports article 14 / project 3 / log 3.
  The missing log is `/logs/2026-09-09/`, whose `data-pagefind-body` region is empty (fixture has
  a heading and no prose), so Pagefind skips it. The mark is present and the fixture is outside
  the pinned phrases; index content-scope tuning is explicitly Out of Scope. Reported, not a finding.
- `RuleBand` configures the `pf-logs` instance on pages without a searchbox; `getInstance` creates
  it harmlessly (`/tmp/t12-instances.log`). No console error.
