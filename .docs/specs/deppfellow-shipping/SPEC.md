---
document_type: specification
initiative_slug: deppfellow-shipping
contract_status: draft
created_at: 2026-09-12
updated_at: 2026-09-12
---

# deppfellow-shipping — end-to-end site build and shipping

## Objective

Close the path from "home page only" to a fully shipping site at the domain root: the four content surfaces (Articles, Projects, Logs indexes and the Article reading page), search, RSS, the client-side Markdown import, and the GitHub Actions build-and-deploy pipeline that serves it. Everything is bound by the settled ADRs 0001-0013; this spec adds only the decisions the interview settled and decomposes them into vertical, demoable slices.

> **Rule band** — the site's global navigation header: a `1px` hairline-bounded band with the site name left and the category links (with tabular counts) right. It is never floating or shadowed.
> **Reading page** — the full article view; the h1 is the title and is never named again.
> **FAB** — the reading-page index control, collapsed bottom-right, expanding to an h2/h3 heading list (h1 excluded).

## Repository Context

Astro 5 + Tailwind CSS v4, static output, zero-framework. Content is loaded at build from the `deppfellow-wiki` vault through `WIKI_PATH` (CI shallow-clones it at HEAD; local falls back to sibling or fixtures). The loader enforces the category registry in `_schema/categories.md` as the publication boundary. Current state: only `/` exists (`fixtures/vault` for development; public categories empty). No td state; spec + ticket files only.

## Confirmed Requirements

### Content model

- REQ-01 — Article and Project front matter provides `description`, `created`, `tags`; the retired `origin` field is not rendered. ({C-01, D-11})
- REQ-02 — The Article description renders as a 65ch lede on the reading page and as the summary on Projects index rows; never on the Articles index and never in the FAB. ({D-03, D-11})

### Article reading page

- REQ-03 — The reading page renders title, a 65ch description-lede, then `created` date and tags. ({D-04, D-11})
- REQ-04 — The reading page renders the markdown at 65ch, including core Markdown, Obsidian callouts, math, tables, fenced code (hairline frame), and blockquotes. ({D-13})
- REQ-05 — The MVP demonstration shows core Markdown, callouts, and math working together; all other elements are rendered but secondary. ({C-03})
- REQ-06 — Math is rendered at build time (KaTeX, per ADR-0005); no client-side math engine ships, so the reading page stays script-free. ({D-13})
- REQ-07 — The reading page carries a FAB: collapsed at the bottom-right by default, expanding to an in-page index of h2 and h3 headings only; h1 (the title) is never listed. ({D-02})
- REQ-08 — The reading page footer offers a Back-to-Articles link, tags as plain text (not links), and prev/next chained by `created` within the category. ({D-04})

### List surfaces

- REQ-09 — `/articles/` renders the latest Articles as ruled rows with date and title only, per the Morg reference. ({D-03})
- REQ-10 — `/projects/` renders Projects as date, title, and short description, per the Armin reference. ({D-01, D-11})
- REQ-11 — `/logs/` renders date groups newest-first, each log row showing date, an excerpt, and its tags; site-side prev/next ordering derives from `created`. ({D-10})
- REQ-12 — Tag pages are generated per the registry/secondary axis at `/tags/<tag>` (ADR-0008). ({D-01})
- REQ-13 — A minimal 404 page renders the rule band plus a not-found line and a home link (ADR-0010). ({D-01})

### Search and feed

- REQ-14 — A dedicated `/search` page runs the Pagefind index; home, list, and reading pages carry no page script. ({D-05, D-08})
- REQ-15 — `/rss.xml` covers Articles and Projects only (Logs excluded), ordered by `created` newest-first, capped at 50, absolute links, with the `description` as the item summary. ({D-09})

### Import

- REQ-16 — A rule-band Import control lands on a dedicated `/import` page: `<input type="file">` reads a local `.md` client-side (no upload), opens the `obsidian://` URI with vault, category, filename, and encoded content, and offers a clipboard-copy fallback for length limits. ({D-07, D-12})
- REQ-17 — Import never writes back; the manual `git push` remains the publication step. ({D-07})

### Shipping pipeline

- REQ-18 — One `build.yml` shallow-clones the wiki at HEAD as `WIKI_PATH`, runs `astro build` under the registry boundary, then deploys `dist/` to GitHub Pages. Wiki pushes fire it via `repository_dispatch`; site-repo pushes run it directly on `push`. ({D-06})
- REQ-19 — A deploy gate fails the job before deploy if any registered category index, `rss.xml`, `/search`, or `404.html` is absent, or if the loader read no Article. ({D-14})
- REQ-20 — The site is served at the domain root (`deppfellow.github.io`), per ADR-0011. ({D-01})
- REQ-21 — The agent interface (JSON catalog and llms.txt, ADR-0006) ships alongside the human surfaces. ({D-01})

## Scenarios

- SPEC-AC-01 — A visitor opens `/articles/<slug>/` for a note containing a `## Heading`, `> callout`, and `$x^2$`; the page shows the metadata header, the expanded markdown with heading, callout, and rendered math, no page-level script, and a FAB that expands to list the `## Heading`. ({D-02, D-13})
- SPEC-AC-02 — A visitor opens the FAB on a long article; it shows h2 and h3 only, never the title; clicking an entry scrolls to that heading. ({D-02})
- SPEC-AC-03 — A visitor opens `/articles/`, `/projects/`, and `/logs/`; each reflects its pinned pattern (date+title, date+title+description, date-grouped excerpt+tags) with no layout overflow at 390px. ({D-03, D-10, D-11})
- SPEC-AC-04 — A visitor opens `/search` and types a phrase found in a published note; the Pagefind results list returns it with a working link, while reading pages show no script. ({D-05, D-08})
- SPEC-AC-05 — A visitor loads `/rss.xml`; it contains Articles and Projects (no Logs), newest-first, and every `<link>` is absolute. ({D-09})
- SPEC-AC-06 — The author opens `/import`, selects a local `.md`, picks a registry-listed category; the page opens the `obsidian://` URI with the category path and content, or copies it to the clipboard when the URI exceeds limits; nothing is uploaded. ({D-12})
- SPEC-AC-07 — A wiki push fires `repository_dispatch`; the workflow clones HEAD, builds under the registry boundary, passes the gate, and the Pages deploy reflects the pushed note. A gate failure produces no deploy. ({D-06, D-14})
- SPEC-AC-08 — Opening a dead URL returns the branded 404 with the rule band and a home link. ({D-01})

## Constraint

- Ordinary pages (home, lists, reading) are script-free; JavaScript is acceptable only on dedicated script-scoped surfaces (`/search`, `/import`) and must be small and scoped, with no framework runtime (narrows ADR-0002; D-16).

## Non-goals

- Multilingual rendering and the language fallback flow (deferred per ADR-0004; language-suffixed files are ignored and logged).
- Log entries in RSS; JSON log feeds; the LogFeed infinite-scroll island (revisited only when log volume demands).
- Server-side or persisted import; the site never writes to the vault.
- Automatic slug-forwarding on vault renames (a rename is new content per D-15).
- Client-side math engines; all math is build-time (ADR-0005).
- Image-generation or authored raster components; the plate world ships as typography and rules.

## Implementation Decisions

- Content migration: replace `origin` with `description` in the loader, note schema, and fixtures (src/lib/vault.ts, src/content.config.ts, fixtures/vault). Old drafts carrying `origin` map nothing; only `description` renders.
- Reading-page composition: extend the existing `PlateRow`/`RuleBand` vocabulary; the FAB and prev/next are Astro components with a tiny scoped inline script for the FAB toggle and heading scroll.
- Math: KaTeX rendered at build via Astro's markdown pipeline; no runtime script.
- Search: run the Pagefind indexer as a build post-step; `/search` mounts the Pagefind UI.
- Import: `/import` is a script-scoped page using `<input type="file">` and `obsidian://new` with a clipboard-copy fallback.
- Pipeline: `.github/workflows/build.yml` handles clone, build, gate, and deploy; `repository_dispatch` from the wiki repo.
- Deploy gate: a grep/shell check over `dist/` (route presence) plus a loader Article-count assertion, run before `actions/deploy-pages`.

## Testing/Seam Decisions

- Every check is executable or session-visible: `astro build` success, `find dist -name '*.html'` route presence, `grep` for `rss.xml`/`search`/`404`, fixture content assertions in the loader (`description` present, `origin` absent), and a built-page script-count check limited to `/search` and `/import`.

## Governing References

- ADR-0002 Performance contract (now narrowed by D-16: minor scoped JS allowed on /search, /import)
- ADR-0003 Routing and file layout
- ADR-0005 Rendering fidelity scope (KaTeX build-time math, callouts, wikilink degradation)
- ADR-0006 Agent interface (llms.txt, JSON catalog)
- ADR-0007 Content source and publish trigger (WIKI_PATH, registry boundary)
- ADR-0008 Tag pages
- ADR-0009 Homepage, logs index, 404
- ADR-0010 Pagefind and RSS
- ADR-0011 Site address: domain root
- ADR-0013 Visual world: Plates and Declinations
- CONTEXT.md glossary (Rule band, Plate, Plate stack, Observer's note, Scales, Article description, Reading page, FAB, Recency mark)

## Ticket Decomposition

Coverage map (vertical slices, each demoable on its own):

| Slice | Delivered behavior | Ownership | Blocked-by |
| --- | --- | --- | --- |
| T1 | Content model migrated: loader/schema/fixtures use `description`, retired `origin`; summaries flow to lists and ledes. | agent-owned | None |
| T2 | `/articles/` renders Article ruled rows, date + title only (Morg). | agent-owned | T1 |
| T3 | `/projects/` renders Project rows: date, title, description (Armin). | agent-owned | T1 |
| T4 | `/logs/` renders date-grouped excerpt+tag rows (Rasyid), `created` ordering. | agent-owned | T1 |
| T5 | Reading page: metadata header (title, description-lede, date, tags), 65ch markdown (core+callouts+math, tables/code/bq), Back + prev/next by `created`. | agent-owned | T1 |
| T6 | Reading-page FAB (h2/h3 index, collapsed bottom-right) + heading scroll, scoped script. | agent-owned | T5 |
| T7 | Generated `/tags/<tag>` pages from the secondary axis. | agent-owned | T1 |
| T8 | Minimal branded 404 (rule band + not-found + home link, ADR-0010). | agent-owned | None |
| T9 | `/rss.xml` static feed, Articles + Projects (no Logs), newest-first, cap 50, abs links, description summary. | agent-owned | T1 |
| T10 | `/search` Pagefind surface + build index post-step; home/lists/reading stay script-free. | agent-owned | T2, T3, T4, T5 |
| T11 | `/import` Obsidian handoff: file pick, category, `obsidian://new`, clipboard fallback, no upload. | agent-owned | None |
| T12 | GitHub Actions `build.yml`: clone wiki at HEAD, build, deploy gate, Pages deploy; `repository_dispatch` + push triggers; domain-root serving (ADR-0011). | agent-owned | T1, T9, T10, T8 |
| T13 | Agent interface (llms.txt + JSON catalog) shipped per ADR-0006. | agent-owned | T1 |

REQ coverage table: see per-slice Specification Coverage in each ticket; every REQ-xx maps to the slices above (T1 → REQ-01/02; T5 → REQ-03..06, 08; T6 → REQ-07; T2 → REQ-09; T3 → REQ-10; T4 → REQ-11; T7 → REQ-12; T8 → REQ-13; T10 → REQ-14; T9 → REQ-15; T11 → REQ-16/17; T12 → REQ-18..20; T13 → REQ-21).

## Open Questions & Accepted Risks

- Q-01 — Exact Pagefind generated page files and the precise `obsidian://new` URI string are fixed by the ticket contracts, not this interview (owner: worker; revisit condition: rejected contract).
- Accepted risk — The public wiki categories are empty today; the build runs against `fixtures/vault` until real content lands. The deploy gate treats "no Article read" as a failure, so an accidentally-empty public vault fails the pipeline instead of shipping a hollow site.
