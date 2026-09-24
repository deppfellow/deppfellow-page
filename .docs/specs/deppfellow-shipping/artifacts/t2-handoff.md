DONE

**Shipped**: `src/pages/articles/index.astro` (new, commit `c58ba09` on `wt/td-9206eb-articles-index`) - `/articles/` renders one `PlateRow` per published Article, newest-first by `created` (slug-ascending tiebreak for determinism), inside the bordered stack with the two stacked plate edges, under a rule-band page heading ("Articles" / legend "Newest first"). Empty category renders the single line "No articles published yet." Rule band and category counts reuse the exact home-page wiring. No description, tags, excerpt, image, or recency mark in rows; date formatting stays in `PlateRow` (`toISOString().slice(0, 10)`), spacing declared in classes per D-40.

**Commits**: `c58ba09 feat(articles): render the index as date-and-title ruled rows` (single commit; only `src/pages/articles/index.astro` staged; dist/ and .pi/ untouched).

**Checks** (mission order, all green): format OK (normalized the new file only) - format:check "All matched files use Prettier code style!" - lint clean - `astro check` 0 errors/0 warnings/0 hints - `tsc --noEmit` clean - fixture build green (16 pages), `dist/articles/index.html` exists.

**Contract evidence**: L-AC-01: 14 `plate-row` rows = 14 loaded fixture Articles. L-AC-02: fixture description strings absent from the index HTML. L-AC-03: dates `2026-09-11` → `2026-05-02`, monotonically descending, ISO `YYYY-MM-DD`. L-AC-04: every row href resolves to a built `dist/articles/<slug>/index.html`. Loader contract intact: `Loaded 21 notes`, exact `broken-note: invalid created` skip warning. 0-Articles example verified against a scratch vault in /tmp (build exit 0, one explanatory line, no `<table>`, zero rows). Home unchanged: still 10 rows, ABOUT body present, counts 14/03/04.

REMAINING

None.

DECISIONS

- No recency mark and no "Most recent" legend on the index: the contract says each row exposes exactly date + title and out-of-scope is strict; ember stays a home-page device. The section heading uses the design's heading-row shape with an ordering legend ("Newest first") instead.
- Tiebreak on equal `created`: slug ascending (localeCompare), matching the reading page's deterministic sort convention; two fixtures share `2026-09-11` and the order is stable across builds.
- `<title>` is plain "Articles" (home is plain "deppfellow"; reading page is the note title - no site-name suffix pattern exists to follow).
- Page heading is an `h1` in label caps (aria-labelled section) so the document outline is valid; the design's heading-row component supplies the visual.

UNCERTAIN

- `npm run check` required an explicit `WIKI_PATH=fixtures/vault` in this environment: non-interactive shells do not load `.envrc`, and `astro check` loads the content layer, so unset `WIKI_PATH` throws. AGENTS.md's check list does not spell this out for `check` (it does for build) - worth a docs note, not a code change.
- The verify skill's feature map still describes pre-T6 state on two points (it says lint/format:check are red on dev, and "no Objective handling") that contradicts current dev HEAD; per the skill's own rule that is maintainer drift, not a ticket finding - flagging it for the orchestrator.
- The 0-Articles and 1-Article example rows were exercised via scratch vaults, not committed fixtures; the verifier can reproduce the probe with any registry-only vault.
