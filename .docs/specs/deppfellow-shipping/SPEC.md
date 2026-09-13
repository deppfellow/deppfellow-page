---
document_type: specification
initiative_slug: deppfellow-shipping
contract_status: approved
created_at: 2026-09-12
updated_at: 2026-09-13
---

# deppfellow-shipping — end-to-end site build and shipping

## Objective

Close the path from "home page only" to a fully shipping site at the domain root: the four content surfaces (Articles, Projects, Logs indexes and their detail pages), the full ADR-0005 rendering pipeline, search, RSS and sitemap, tag pages, the client-side Markdown import, and the GitHub Actions build-and-deploy pipeline that serves it, including the wiki-side publish trigger.

> **Rule band** — the site's global navigation header: a `1px` hairline-bounded band with the site name left and the category links (with tabular counts) right, plus Search and Import controls. Never floating, never shadowed.
> **Reading page** — the full note view: the h1 is the title and is never named again.
> **FAB** — the reading-page index control, collapsed bottom-right, expanding to an h2/h3 heading list (h1 excluded).
> **Chip-linking** — rendering a tag as a small square label-caps anchor to `/tags/<tag>`; a typographic mark, not a filled pill.

## Repository Context

Astro 7.3.2 + Tailwind CSS 4.3.3, static output, on the `unified()` Markdown processor (ADR-0014). Content loads at build from the `deppfellow-wiki` vault through `WIKI_PATH`: CI shallow-clones the wiki's default branch; local development falls back to a sibling checkout or `fixtures/vault`. The loader enforces the category registry in `_schema/categories.md` as the publication boundary. Current state: only `/` exists; public categories are empty; td epic `td-093602` with 18 issues.

## Confirmed Requirements

### Content model

- REQ-01 — Article and Project front matter provides `description`, `created`, `tags`; the retired `origin` field is not rendered. ({C-01})
- REQ-02 — Summary precedence for Projects index rows, reading-page ledes, and RSS summaries: front-matter `description` > `## Goal` section > omit. A note with neither renders without a summary. ({D-20, D-33})
- REQ-03 — Malformed front matter is a per-note skip with a logged warning; a single bad note never fails the whole build. ({D-20, D-33})

### Rendering pipeline

- REQ-04 — Wikilinks resolve against the vault tree and the registry; a link to an unlisted or private target degrades to plain text and never leaks the target. ({D-18, D-32})
- REQ-05 — Images resolve from `_assets/` through the build-time sharp pipeline. ({D-32})
- REQ-06 — Footnotes, task-list checkboxes, and inline `#tags` render per ADR-0005's V1 scope. ({D-32})
- REQ-07 — The MVP demonstration shows core Markdown, callouts, and math working together; every other element is rendered but secondary. ({C-03})
- REQ-08 — Math renders at build time (KaTeX); no client-side math engine ships. ({D-13})
- REQ-09 — The JSON agent catalog's wikilink-graph neighbors come from the same resolution pass as the reading page; there is one pass, not two. ({D-18})

### Article reading page

- REQ-10 — The reading page renders title, a 65ch description-lede, then `created` date and chip-linked tags. ({D-11, D-30})
- REQ-11 — Body markdown renders at 65ch including core Markdown, callouts, math, tables, fenced code (hairline frame), and blockquotes. ({D-13})
- REQ-12 — The reading page carries a FAB: collapsed bottom-right, expanding to an in-page index of h2 and h3 only; h1 is never listed. The FAB is the single permitted script exception on reading pages. ({D-02, D-17})
- REQ-13 — FAB edge cases are specified: a page with no h2/h3 renders no FAB; heading anchors account for scroll offset; the control is a keyboard-operable disclosure with focus return and Escape to close. ({D-26})
- REQ-14 — The footer offers a Back link, and prev/next chained by `created` within the category. ({D-04})

### List surfaces

- REQ-15 — `/articles/` renders Articles as ruled rows with date and title only. ({D-03})
- REQ-16 — `/projects/` renders Projects as date, title, and short description. ({D-01, D-11})
- REQ-17 — `/logs/` renders date groups newest-first; each row shows date, an excerpt, and chip-linked tags. ({D-10, D-30})
- REQ-18 — Detail pages ship for all three categories: `/articles/<slug>`, `/projects/<slug>`, `/logs/<date>`. ({D-21})
- REQ-19 — `/tags/<tag>` pages generate from the secondary axis and are reachable from chip-links on reading pages and log rows. ({D-01, D-30})
- REQ-20 — A minimal 404 renders the rule band, a not-found line, and a home link. ({D-01})

### Search, feed, and sitemap

- REQ-21 — A dedicated `/search` page runs the Pagefind index, reachable from a Search control in the rule band. Home and list pages stay script-free. ({D-05, D-08, D-23})
- REQ-22 — `/rss.xml` covers Articles and Projects only, newest-first by `created`, capped at 50, absolute links, `description` as the item summary. ({D-09})
- REQ-23 — `sitemap.xml` generates per build with absolute root URLs. ({D-24})

### Import

- REQ-24 — A rule-band Import control lands on `/import`: `<input type="file">` reads a local `.md` client-side, opens the `obsidian://` URI with vault, category, filename, and encoded content, and falls back to clipboard copy past a pinned ~60KB encoded cap. ({D-07, D-12, D-27})
- REQ-25 — Import never writes back; manual `git push` remains the publication step. ({D-07})

### Shipping pipeline

- REQ-26 — One `build.yml` on the default branch: shallow-clones the wiki's default branch explicitly as `WIKI_PATH`, runs `astro build` under the registry boundary, then deploys `dist/` to GitHub Pages. ({D-06, D-25, D-34})
- REQ-27 — A wiki-side workflow fires `repository_dispatch` at the site repo on push, authenticated by a fine-grained PAT or GitHub App token (`contents: write` on the site repo) held as a wiki-repo secret. The workflow file and rotation docs are agent-owned (T16); creating the token, storing the secret, and the live test dispatch are human-owned (T17). ({D-28, D-39})
- REQ-28 — The deploy gate asserts against a build-emitted manifest (routes + loader Article count), not grep of HTML strings. The required route set is every registered category index, `rss.xml`, `/search`, `404.html`, and `sitemap.xml`; any missing route fails the job. Zero Articles warns but does not fail until first content lands. ({D-14, D-22, D-29, D-38})
- REQ-29 — The repo rename to `deppfellow.github.io` and Pages-from-Actions enablement are human-owned GitHub-settings actions, sequenced before any ticket that bakes absolute URLs. ({D-19})
- REQ-30 — The agent interface (JSON catalog and `llms.txt`) ships per ADR-0006, sharing the resolution pass. ({D-01, D-18})

## Scenarios

- SPEC-AC-01 — A visitor opens `/articles/<slug>/` for a note with a `## Heading`, a callout, and `$x^2$`: the page shows title, description-lede, chip-linked tags, rendered math, no raw `[[brackets]]`, and a FAB that expands to list the `## Heading`. ({D-02, D-13, D-18, D-30})
- SPEC-AC-02 — A note contains `[[A Private Note]]` pointing at an unlisted target; the built page shows plain text, with no URL, slug, or title of the target anywhere in the HTML. ({D-18})
- SPEC-AC-03 — A visitor opens a tag chip on a reading page; it lands on `/tags/<tag>` listing that tag's notes across categories. ({D-30})
- SPEC-AC-04 — A visitor opens `/articles/`, `/projects/`, and `/logs/`; each reflects its pinned pattern with no overflow at 390px, and a Projects row shows date, title, and description. ({D-03, D-10, D-11})
- SPEC-AC-05 — A Projects row links to `/projects/<slug>`, which renders; a Logs row links to `/logs/<date>`, which renders with its prev/next chain. ({D-21})
- SPEC-AC-06 — A visitor opens `/search` via the rule-band control and finds a published note; home and list pages still show no page script. ({D-05, D-23})
- SPEC-AC-07 — `/rss.xml` contains Articles and Projects, no Logs, newest-first, every `<link>` absolute and resolving to a real page. ({D-09, D-21})
- SPEC-AC-08 — The author opens `/import`, selects a local `.md` and a registry-listed category: small files open the `obsidian://` URI; a file past ~60KB encoded copies Markdown to the clipboard instead. Nothing is uploaded. ({D-12, D-27})
- SPEC-AC-09 — A wiki push fires the dispatch; the site workflow clones the wiki default branch, builds, passes the gate, and the deploy reflects the pushed note. A route-missing build produces no deploy. A zero-Article build warns and still deploys the shell. ({D-06, D-28, D-29})
- SPEC-AC-10 — A note with malformed front matter among good notes: the build succeeds, the good notes publish, and the bad note is skipped with a logged warning. ({D-20})

## Constraint

- Home and list pages are script-free. JavaScript is permitted only on dedicated script-scoped surfaces (`/search`, `/import`) and as the reading page's FAB control; no framework runtime ships; scripts stay small and scoped (narrows ADR-0002; D-16, D-31).

## Non-goals

- Multilingual rendering and the language fallback flow (ADR-0004; language-suffixed files are ignored).
- Logs in RSS; JSON log feeds; the LogFeed infinite-scroll island.
- Server-side or persisted import; the site never writes to the vault.
- Automatic slug forwarding on vault renames (a rename is new content; D-15).
- Client-side math engines.
- Authored raster components; the plate world ships as typography and rules.
- A sitemap index / multi-file sitemap (single `sitemap.xml` only).

## Implementation Decisions

- Content migration: `origin` → `description` in `src/lib/vault.ts`, `src/content.config.ts`, and `fixtures/vault`; `description` > `## Goal` > omit; per-note skip with a warning.
- Resolution pass: one build-time pass in the markdown pipeline producing wikilink URLs plus the graph neighbors consumed by both the reading page and the JSON catalog.
- Math: KaTeX at build via Astro's markdown pipeline.
- Reading page: reuses `RuleBand`/`PlateRow` vocabulary; FAB is an Astro component with a small scoped script (disclosure semantics, focus return, Escape).
- Tags: square label-caps anchors, no pills or fills.
- Search: Pagefind indexer as a build post-step; `/search` mounts the Pagefind UI; entry link in the rule band.
- Import: `/import` with `<input type="file">`, `obsidian://new`, 60KB encoded cap, clipboard fallback.
- Pipeline: `.github/workflows/build.yml` (receiver, default branch) plus a wiki-repo dispatch workflow; build emits a routes/Article-count manifest for the gate.
- Gate: manifest assertions fail on missing routes; zero Articles warns only.

## Testing/Seam Decisions

- Machine-checkable only: `astro build` success; manifest assertions for routes and Article count; fixture assertions for `description` presence and `origin` absence; a leak check that a private wikilink target's slug/title never appears in built HTML; a script-count check in whitelist mode (permitted only on `/search`, `/import`, reading pages).
- Every check is greppable, executable, or session-visible; no prose re-reading.

## Governing References

- ADR-0002 Performance contract (narrowed by D-16/D-31: scoped JS on /search, /import, reading-page FAB)
- ADR-0003 Routing and file layout
- ADR-0005 Rendering fidelity scope (full V1 scope restored by D-32)
- ADR-0006 Agent interface
- ADR-0007 Content source and publish trigger (amended: cross-repo dispatch requires a secret, D-28)
- ADR-0008 Tag pages (chip-linking stands, D-30)
- ADR-0009 Homepage, logs index, 404
- ADR-0010 Pagefind and RSS
- ADR-0011 Site address: domain root (renames and Pages enablement human-owned, D-19)
- ADR-0013 Visual world: Plates and Declinations
- ADR-0014 Toolchain baseline: Astro 7 on the unified Markdown processor ({D-40})
- CONTEXT.md glossary (Rule band, Plate, Plate stack, Observer's note, Scales, Article description, Reading page, FAB, Recency mark)
- Council party log: `.docs/specs/deppfellow-shipping/party-20260912-194437.md`

## Ticket Decomposition

| Slice | Delivered behavior | Ownership | Blocked-by |
| --- | --- | --- | --- |
| T0 (td-a53be3) | Toolchain: Astro 7.3.2 + Tailwind 4.3.3 on `unified()`; deterministic capture. | agent-owned | None |
| T1 (td-bffd30) | Content model: `description` > `## Goal` > omit; per-note skip with logged warning; fixtures migrated. | agent-owned | T0 |
| T2 (td-9206eb) | `/articles/` ruled rows, date + title only. | agent-owned | T1 |
| T3 (td-d84081) | `/projects/` rows: date, title, description. | agent-owned | T1 |
| T4 (td-a0a097) | `/logs/` date-grouped rows: excerpt + chip-linked tags, `created` ordering. | agent-owned | T1 |
| T5 (td-7e73c8) | Resolution pass: wikilinks (registry-bound, degrade-to-plain-text), `_assets/` images, footnotes, task lists, inline tags; emits graph neighbors. | agent-owned | T1 | | T6 (td-9a444b) | Reading page: metadata header, 65ch markdown (core + callouts + math + tables/code/blockquote), back + prev/next. | agent-owned | T5 |
| T7 (td-99e20f) | FAB: collapsed bottom-right, h2/h3 index, disclosure semantics, empty-index and keyboard behavior. | agent-owned | T6 |
| T8 (td-2a7cd5) | Detail pages for Projects and Logs (`/projects/<slug>`, `/logs/<date>`). | agent-owned | T5, T6 |
| T9 (td-725cf5) | `/tags/<tag>` pages; reachable from chip-links. | agent-owned | T1, T4 |
| T10 (td-a0f467) | Minimal 404: rule band, not-found line, home link. | agent-owned | None |
| T11 (td-533f29) | `/rss.xml` (Articles + Projects, cap 50, absolute links) and `sitemap.xml`. | agent-owned | T1 |
| T12 (td-3ba9ec) | `/search` Pagefind surface + rule-band entry; home and lists stay script-free. | agent-owned | T2, T3, T4 |
| T13 (td-a7bf5e) | `/import` Obsidian handoff: file pick, category select, 60KB cap, clipboard fallback. | agent-owned | None |
| T14 (td-074b0f) | Agent interface: JSON catalog + `llms.txt`, graph neighbors from the shared pass. | agent-owned | T5 |
| T15 (td-4cbeb1) | GitHub Actions `build.yml`: wiki clone at default branch, build, manifest gate, Pages deploy. | agent-owned | T1, T10, T11, T12 |
| T16 (td-51defc) | Wiki-side dispatch workflow file + setup/rotation docs (same `event_type` as T15). | agent-owned | T15 |
| T17 (td-ad2df5) | GitHub settings (human): repo rename, Pages-from-Actions, dispatch token creation/secret/test dispatch. | human-owned | None |

REQ coverage: T0 → ADR-0014; T1 → REQ-01/02/03; T5 → REQ-04/05/06/09; T6 → REQ-07/08/10/11/14; T7 → REQ-12/13; T2 → REQ-15; T3 → REQ-16; T4 → REQ-17; T8 → REQ-18; T9 → REQ-19; T10 → REQ-20; T12 → REQ-21; T11 → REQ-22/23; T13 → REQ-24/25; T15 → REQ-26/28; T16 → REQ-27; T17 → REQ-29; T14 → REQ-30.

## Open Questions & Accepted Risks

- Q-01 — Exact Pagefind generated page files and the precise `obsidian://new` URI string are fixed by ticket contracts (owner: worker; revisit: rejected contract). Resolved: D-35.
- Q-02 (council F2) — Dispatch trigger model. Resolved: D-28 (owned token) via D-36.
- Q-03 (council F4) — Tag link policy. Resolved: D-30 (chip-linked) via D-37.
- Q-04 (council F5) — Zero-Article gate behavior. Resolved: D-29 (staged) via D-38.
- Precondition events E-01 (slug confirmed, log created), E-02 (derivation gate: frontier empty, human confirmed), E-03 (spec approved, td initialized), and E-04 (T0 toolchain upgrade verified) map through this spec's existence, the council party log, and the td ledger.
- Accepted risk — The public wiki is empty today; the staged gate deploys the shell and warns on zero Articles. A silent regression that empties the published vault would warn rather than fail until the first Article exists.
- Accepted risk — The renames/Pages actions in T17 are manual GitHub settings; if deferred, absolute URLs baked by T11/T15 become wrong after the fact.
