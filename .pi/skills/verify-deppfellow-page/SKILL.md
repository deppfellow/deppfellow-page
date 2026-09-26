---
name: verify-deppfellow-page
description: Project verification skill for deppfellow-page.
---

# verify-deppfellow-page

Generated once per project (2026-09-14, on demand after T1's legacy-process closure).
Every verifier for every ticket in this repo drives this skill; the skill maps
features to the checks that prove them. Map drift is `maintain-verification-skill`'s
job, never a ticket's.

Maintained 2026-09-26 after the light-table wave (98e840a..0f251e8; PRs
#27-#31): the light-table world (dual-world tokens, pre-paint theme
resolution, band toggle with persistence) and the collapsed band (Menu
trigger and panel below 640px) landed, with the design-contract docs. Every
claim the wave touched was re-proven against dev HEAD (0f251e8) by a
clean-room fixture build plus live browser drives on 2026-09-26 - the two
new feature-map rows below, the built-HTML script whitelist (49/49 pages
carry the head pre-paint script and the band script), the contrast gate in
both directions, the unit suites, the manifest gate, and a pixel-diff of
the band against a 98e840a reference build; untouched rows keep their
2026-09-24 proofs.

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
  that no longer exist in the vault (proven 2026-09-19, still true - the
  loaders never clear the store). `rm -rf node_modules/.astro` before any
  build whose output you assert on.
- `npm run build` runs Astro then Pagefind (`astro build && pagefind --site
  dist`), so a build needs the pagefind binary from devDependencies; plain
  `npm ci` provides it.

## Command map

| Check | Command | Passes when |
| --- | --- | --- |
| Fresh install | `npm ci` | exits 0 from the committed lock alone |
| Typecheck | `npm run check` | astro check exits clean (0 errors) |
| Ticket Gate build | `rm -rf node_modules/.astro && WIKI_PATH=fixtures/vault timeout 300 npm run build 2>&1 \| tee /tmp/<ticket>-gate.log` | build exits 0; log contains `Loaded 21 notes from` and `skipped fixtures/vault/Articles/broken-note/broken-note.md: invalid created`; the Pagefind step prints `Indexed 20 pages` (the heading-only log fixture indexes no body); `dist/` holds 49 HTML pages |
| Manifest gate | `npm run gate` | prints `Gate passed: 6 required routes present, 14 Articles.` (requires each registry category route plus `/rss.xml`, `/404.html`, `/sitemap.xml` in `dist/manifest.json`). CI does NOT run this - ci.yml greps the build log instead, and build.yml runs it on deploy; a verifier asserts it explicitly |
| Unit suites | `node --test src/lib/vault.test.ts src/lib/resolve.test.mjs src/lib/urls.test.ts src/lib/excerpt.test.mjs` | all pass (41 tests on 0f251e8). No npm script wires them; run them explicitly. Also asserts the fixture contract at repo scale (21/1, precedence fixtures) |
| Diff typing | `npx tsc --noEmit -p tsconfig.json` | no errors |
| Visual capture | `npm run preview -- --port 4321 &` then `node scripts/review-capture.mjs http://127.0.0.1:4321/ /tmp/<ticket>-shots` | `desktop.png` (1440 CSS px, dpr 1) and `mobile.png` (390 CSS px, dpr 2) written; log lines report overflowX false, body font Spectral 18px, and first `<ol li time>` row. Needs Chrome at `CHROME_PATH` (default `~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`, verified 2026-09-24) |
| Pixel diff | `node scripts/pixel-diff.mjs a.png b.png [diff.png]` | exit 0 with `0 differing pixels` on identical inputs; nonzero exit with a count and a highlighted `diff.png` on same-size mismatches; exit 1 with a size-mismatch message (no diff.png) when dimensions differ |

tee every run to `/tmp/<ticket>-<check>.log` and cite the paths in your
approval reason. Evidence or it did not happen.

`npm run lint` and `npm run format:check` are required CI steps and green on
dev HEAD. Cite them as passing only after running them in your clean room.

## Feature map

Fixture build state (every row below assumes it): 21 notes load, 22 found,
1 skipped; 49 HTML pages = 21 note details + home + 3 category indexes + 404
+ 23 tag pages; plus rss.xml, sitemap.xml, catalog.json, llms.txt, 21 raw
endpoints, manifest.json, and the pagefind bundle.

| Feature | Proven by | Expected |
| --- | --- | --- |
| Content loader `parseNote`/`readNotes`/`readAbout`/`vaultRoot` (`src/lib/vault.ts`) | Ticket Gate build log + `node --test src/lib/vault.test.ts` | loads 21 fixture notes (22 found, 1 skipped); unset `WIKI_PATH` throws `No vault found. Set WIKI_PATH to the vault checkout.`; `origin` front matter is never read; registry missing or empty aborts the build; every note skipped throws `No parseable notes` |
| Malformed front matter rejection | Ticket Gate build log + vault tests | missing/unparseable/numeric `created` (`invalid created`), wrong-typed `tags` (`invalid tags`), and present-but-non-string `description` (`invalid description`) all skip the note with warning `skipped <repo-relative path>: <reason>`; build continues; all notes failing throws. Language-suffixed files skip pre-parse (`language-suffixed (deferred, ADR-0004)`) - code-only, no fixture exercises it |
| Summary and excerpt | vault tests + excerpt tests + built HTML | summary precedence: non-blank front-matter `description` > flattened one-line `## Objective` > `undefined`; `wikilink-resolution` (description wins), `objective-only` (flattened Objective), `bare-note` (undefined) prove it at repo scale. `excerpt()` (`src/lib/excerpt.ts`) takes the first non-heading, non-fenced paragraph, caps at 240 chars with `…` - Logs rows only, never the loader's `summary` |
| Category registry boundary | `_schema/categories.md` + Ticket Gate + `dist/index.html` | only registered folders render; nav counts Articles 14 / Projects 03 / Logs 04 (two-digit padded, tabular numerals) sum to the 21 loaded notes |
| Home page (`src/pages/index.astro`, `src/layouts/Base.astro`, `src/components/PlateRow.astro`) | Ticket Gate: `dist/index.html` | ABOUT body renders (missing ABOUT.md still passes silently - known blindness); exactly 10 latest Articles as plate rows, created-desc with slug tiebreak; `<meta name="description">` is the static `SITE_DESCRIPTION` from `src/lib/site.ts` (an overridable Base prop) and proves nothing about note summaries |
| Rendering pipeline (`astro.config.mjs` pins `unified()` per ADR-0014, `src/lib/resolve.ts`, `src/lib/callouts.ts`) | resolve tests + built detail HTML | wikilinks resolve slug-first then title; unlisted/private targets degrade to plain text and never leak; `![[name]]` embeds resolve from `_assets` into Astro's image pipeline (hashed `/_astro/*.webp` output; missing embed degrades to alt text); inline `#tags` rewrite to `/tags/<normalized>/` but skip headings and code; `[!type]` blockquotes promote to `aside.callout`; remark-math + rehype-katex render math at build (KaTeX CSS on every detail page, no client engine); footnotes and task-list checkboxes pass through; fences render as plain `<pre>` in a CSS hairline frame (`syntaxHighlight: false`); the config and content layers share resolve state only through the `globalThis.__deppfellowResolve` bridge, and ABOUT renders without a context (no wikilink rewriting) |
| Detail routes and header contract (`src/pages/articles/[...slug].astro`, `src/pages/projects/[...slug].astro`, `src/pages/logs/[...date].astro`) | Ticket Gate dist walk + built detail HTML | Articles and Projects route by front-matter slug, Logs by `created` date - the divergent fixture (filename 2026-09-08, `created: 2026-09-11`) serves only at `/logs/2026-09-11/`; every detail carries h1 title (`text-title`, `data-pagefind-meta="title"`), summary lede only when a summary exists, ISO `<time>` (`data-pagefind-meta="date"`), chip-linked tags; body inside `note measure` (65ch); `<meta name="description">` equals the note summary when present |
| Prev/next chaining | built article + log HTML | articles and logs only (projects have a back link only); ordered `created` ascending with slug tiebreak, scoped to the category; article hrefs slug-keyed, log hrefs created-date-keyed; first/last pages render one empty side; `aria-label` neighbours nav |
| FAB heading index (`src/components/HeadingIndex.astro`) | built article HTML + a live browser drive | renders on article pages with at least one h2/h3 (fixture: memory-layers, bare-note, objective-only carry it; a-smart-camera-monitor-rebuilt has none); lists h2/h3 only, h1 excluded, h3 indented; `aria-expanded`/`aria-controls`/`hidden` disclosure; Escape closes and returns focus to the trigger (re-proven live 2026-09-26); FAB detail pages ship 3 `<script>`s (head pre-paint + band + FAB), non-FAB details 2 (head pre-paint + band) |
| Category indexes (`src/pages/articles/index.astro`, `src/pages/projects/index.astro`, `src/pages/logs/index.astro`, `src/components/LogRow.astro`) | Ticket Gate: built index HTML | `/articles/`: 14 title-only plate rows (date + title, no description). `/projects/`: 3 rows with date + title + summary (td-orchestration renders title-only - no summary). `/logs/`: flat list of 4 `LogRow`s, newest-first with no group headings or containers; each row's only anchor is the created-date cell (`/logs/<created>/`, never the filename slug), a vertical hairline splits date from a 65ch content column, no title element, excerpt <=240 chars (the long fixture ends at exactly 240 with `…`, the heading-only fixture has no excerpt), chip-linked tags; below `sm` the row stacks and the rule disappears; empty category renders its fallback line |
| Tag pages and chip normalization (`src/pages/tags/[tag].astro`, `src/lib/urls.ts`, `src/lib/resolve.ts` `tagPages`) | Ticket Gate: `dist/tags/` + sitemap | exactly 23 routes on the fixture vault (22 front-matter slugs + inline `#WikiGraph` from wikilink-resolution's body); one shared `normalizeTag` sits behind chip hrefs, inline-tag rewrites, route generation, and the sitemap, so no chip href dangles; `/tags/agents/` lists 9 notes across all three categories; h1 keeps first-seen casing (`Agent Memory`, `WikiGraph`); tag pages carry no `data-pagefind-body` and ship exactly 2 `<script>`s (head pre-paint + band) |
| Theme worlds: dark plate and light table (`src/styles/global.css`, `src/layouts/Base.astro`, `scripts/contrast-check.mjs`) | Ticket Gate built CSS + built HTML greps + live theme-matrix drive + `node scripts/contrast-check.mjs` | `html[data-theme="light"]` redefines the eight slots - plate `#f3f5f9`, plate-edge `#e8ecf2`, rule `#7f8ca1`, rule-strong `#748096` (D-15 hairlines), bone `#0c1220`, star `#4d6087`, iris `#3a6bce`, ember `#e0612e` - flips `color-scheme` to light, and re-mixes `::selection` to iris-mix ground with ink text (dark fallback: white text on iris-mix); the block ships in the CSS chunk all 49 pages load. `--pf-mark` is world-dependent via `--world-mark` (`#ffffff` dark, bone ink `rgb(12, 18, 32)` light), proven live on the pagefind modal; every other `--pf-*` mapping follows the slots. The inline pre-paint script sits first in every page head (49/49, before any stylesheet): storage key `deppfellow-theme` beats `prefers-color-scheme`, a garbage stored value is treated as absent, `data-enhanced` is always set when JS runs, a stored `light`/`dark` choice suppresses live OS changes, and on system default live OS flips apply without reload (all proven live 2026-09-26). The contrast gate enforces bone/star 4.5:1 and iris/ember 3:1 in both worlds plus light rule/rule-strong 3:1, prints the dark hairlines as frozen notes, and exits 1 on a mutated floor (negative-tested) |
| Band Menu: sub-640px collapse, Menu trigger and panel (`src/components/RuleBand.astro`) | Live drives at 390px/768px + built HTML greps + `scripts/pixel-diff.mjs` vs a 98e840a reference build | Collapse only under `html[data-enhanced]` below 640px (breakpoint `max-width: 639.98px`, byte-identical between CSS source and band script; built CSS minifies it to `width<=639.98px`); no-JS renders the pre-initiative band pixel-identical at 390px and 1440px (0 differing pixels), and above 640px the sole addition is the toggle (0 differing pixels with it removed). The Menu trigger is Scales caps with computed-style parity to the FAB trigger (Archivo Narrow 13px uppercase 0.09em, plate ground, 1px solid rule-strong, radius 0). The panel lists category rows with two-digit counts, then Search (panel Search row markup on exactly the 4 search templates), then the theme row of toggle icon plus destination word (`Light` while dark); exactly one `#theme-toggle` per page, re-parented between band nav and theme row by the script; the trigger carries `aria-expanded`/`aria-controls` and the panel starts `hidden`. Closes on activation (category link navigates with the panel closed on arrival), Escape (refocuses the trigger), outside click, and theme-row activation (world flips, panel closes). Script whitelist re-proven by counting `<script>` in built HTML: home 5 (pre-paint, Pagefind UI, result template, filter wiring, band), FAB detail 3, every other detail, 404, and tag page 2 |
| Search (`pagefind` postbuild, `src/components/RuleBand.astro`, `src/pages/logs/index.astro`) | built HTML + a live browser drive | band Search trigger on exactly home + the 3 category indexes, with the theme toggle sitting immediately left of it in the band nav (proven by DOM order and x-coordinates at 768px); the modal searches articles and projects only ("recency tax" returns the memory-layers article); the logs searchbox between heading and first row searches logs only ("ember" returns `/logs/2026-09-10/` only) and renders ruled-row results; `data-pagefind-body` + `type:article|project|log` filters sit on the 21 detail templates but only 20 pages index (the heading-only log's body region is empty); home, 404, tag pages, and all chrome stay unindexed; detail pages ship no search scripts |
| RSS (`src/pages/rss.xml.ts`) | Ticket Gate: `dist/rss.xml` | exactly 17 items (14 Articles + 3 Projects; Logs excluded), created-desc with slug tiebreak, capped at 50; `guid isPermaLink="true"` equals the absolute `<link>`; `<description>` present iff the note has a summary (16 of 17 fixture items); content type `application/rss+xml` |
| Sitemap (`src/pages/sitemap.xml.ts`) | Ticket Gate: `dist/sitemap.xml` | 48 locs = 49 HTML pages minus 404; includes the 23 tag locs (same `tagPages` helper as the routes, so they match by construction); excludes raw, catalog.json, llms.txt; all locs absolute against `site` |
| Agent interface (`src/pages/catalog.json.ts`, `src/pages/llms.txt.ts`, `src/pages/raw/[...path].ts`) | Ticket Gate: dist artifacts | catalog: 21 entries oldest-first with absolute `route` and `rawMarkdownUrl`, `description` key omitted when absent, symmetric `neighbors` with `direction: outgoing|incoming` (wikilink-resolution <-> memory-layers proves both directions from one resolution pass); llms.txt: catalog, category counts (14/3/4), and raw-scheme sections; raw: exactly 21 `text/markdown` files, front matter stripped but the `# Title` line retained, none for the skipped broken-note |
| Route manifest and gate (`src/lib/manifest.ts`, `scripts/gate.mjs`) | `npm run gate` + `dist/manifest.json` | manifest carries `categories` [Articles, Projects, Logs], `articles: 14`, `articleFiles: 15`, sorted routes covering every HTML/XML page plus tag pages but NOT raw/catalog/llms; gate fails loudly on a missing required route and warns `deploying the shell (staged gate, D-29)` on a zero-Article vault with files present |
| 404 page (`src/pages/404.astro`) | Ticket Gate: `dist/404.html` (gate-required) | rule band renders, one centered section with a decorative `aria-hidden` mono `404` and one sentence carrying a home link; no `search` prop; 2 `<script>`s (head pre-paint + band) |
| Toolchain and CI (`package.json`, `.github/workflows/ci.yml`, `.github/workflows/build.yml`) | `npm ci` + full suite | Astro 7.3.2, Tailwind 4.3.3, `@astrojs/markdown-remark` 7.3.1 with `processor: unified()` pinned (ADR-0014), TypeScript 6.0.3, pagefind 1.5.2, katex - all from the committed lock; ci.yml order: npm ci, lint, format:check, check, tsc, then the gate build with `WIKI_PATH` from job env and three log greps (21 notes, exact skip line, dist/index.html); build.yml owns deploy and runs `npm run gate`; `node scripts/contrast-check.mjs` enforces the D-15 contrast floors as a repo check - it is not wired into ci.yml or package.json |

## Known items (2026-09-24 maintenance)

- The unit suites exist (`node --test`, 41 tests) but nothing gates them:
  no npm script, no ci.yml step. Reported as a product gap 2026-09-24;
  verifiers run them explicitly. Fragility: `resolve.test.mjs` imports
  `unified`, which is not a direct dependency - it resolves only through
  astro's hoisted transitive deps, so a lockfile or hoisting change can
  break the suite without any direct-dependency edit.
- `npm run gate` runs on deploy (build.yml) but not in ci.yml, and the
  gate's `REQUIRED_STATIC` omits catalog.json, llms.txt, and /raw/. Both
  reported 2026-09-24; a verifier who needs those artifacts gated asserts
  them explicitly.
- The T1-era deferred summary edge cases are now reachable and broken on
  dev (proven live 2026-09-24 against `parseNote`): an empty `## Objective`
  before the next `##` section over-consumes that section into the summary
  (returns `## Real body` for a whitespace-only Objective), and a `##`
  inside a fenced block inside an Objective truncates the summary and leaks
  the fence opener into the summary. Known Deferred on T1, reported;
  not expected behavior - a ticket contract may turn either into a fix.
- Content-layer staleness: the loaders never clear store entries, so a warm
  `node_modules/.astro/data-store.json` silently re-renders deleted notes
  or ABOUT (proven 2026-09-19). Cleared-store builds stay the verifier
  norm; fixing the staleness remains a reported product gap.
- Pagefind indexes 20 of the 21 marked detail pages because the
  heading-only log fixture (2026-09-09) has an empty body region. Contract
  satisfied; scope tuning is a recorded T12 follow-up.
- The committed t0-shots references predate the shipping wave and differ
  from current dev. Recapture before using them as a visual baseline.
- Search scope: the modal indexes article and project bodies only, the
  logs searchbox logs only, and home/404/tags/chrome stay out of the index
  (D-54). Extend the search-carrying page set only by pilot decision.

## Recording

Precondition: the orchestrator runs `td review` BEFORE you are dispatched -
you arrive with the ticket `in_review` and only record. If the status is
wrong, report back; never self-transition: running `td review` yourself
marks your session involved, and td's governance guard then blocks your own
attestation ("cannot approve: you were involved" - hit for real on
2026-09-15, /tmp/t1-r1-approve.log; the T9 round hit the inverse sequencing
miss on 2026-09-24, E-18 - approve was rejected while the ticket was still
in_progress, so the verdict went through a scribe with --reviewed-by).

```sh
TD_CONTEXT_ID=ver-<ticket>-<round> td -w <main-repo-root> session --new
TD_CONTEXT_ID=ver-<ticket>-<round> td -w <main-repo-root> approve <ticket-id> --record-only \
  --reason "<verdict; findings cite contract lines; evidence paths /tmp/*.log>"
```

Non-approving verdicts add `--decision changes_requested`. Round cap 2: a
second `changes_requested` with the disagreement unresolved parks the ticket
blocked with both writeups - escalate, never a third round (the T4 cap-2
override on 2026-09-24 was the user's explicit call, D-50, not a precedent).
