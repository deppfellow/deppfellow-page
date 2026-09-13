# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static site generation) with Tailwind CSS v4, TypeScript. User-specified in the project brief, not delegated. Deploy target: GitHub Pages at the domain root (`https://deppfellow.github.io/`), built in GitHub Actions (ADR-0007, ADR-0011).

## Users

**Primary: human readers.** Someone arriving at a post - often from a search result, a shared link, or the RSS feed - who wants to read long-form writing (Articles), follow ongoing project work (Projects), or browse dated entries (Logs). Job: understand the piece and find their way to related material without friction.

**Secondary: the author.** Re-reads, browses, and curates his own public corpus, and occasionally imports a markdown file from the site into his local vault (ADR-0001).

**Secondary: AI agents.** Discover the Public Projection through `llms.txt` and the JSON catalog, fetch raw markdown, and walk the wikilink graph (ADR-0006).

Humans are first-order on the reading surfaces; the agent path is deliberate and equal in coverage, not in visual presentation.

## Product Purpose

Display the Public Projection of the deppfellow LLM Wiki: the notes in the categories listed in the wiki's `_schema/categories.md` registry - Articles, Projects, Logs by default, extensible.

The wiki is a single Obsidian vault that acts as a shared memory layer for its author and his AI agents. The site is its read-only public face. Success means: a fast, quiet, zero-JavaScript reading experience over that content; publishing that costs one `git push`; and nothing private ever reaching the build environment.

## Positioning

The site has no content store, no authoring surface, and no request-time computation. Its content is a git repository whose push is the publish act, and the same wikilink-resolution pass that renders human pages also generates the machine-facing catalog. A neighboring static blog can copy the appearance; it cannot truthfully claim the mechanism - one graph, one build, no database, published by commit.

## Operating Context

- **Authoring happens in Obsidian**, in a vault tracked by git. The author writes by hand; agents draft into `Private/Drafts/<Category>/`, and a human promotes drafts into public category folders.
- **Publishing** is a push to the public wiki repo, which fires a `repository_dispatch` at the site repo; the site build clones the wiki at HEAD, builds, and deploys (ADR-0007).
- **The category registry** (`_schema/categories.md`) is the publication boundary: a top-level folder renders only if registered; `Private/`, `_schema/`, `_templates/`, `_assets/` never render (ADR-0003).
- **Local development** reads the actual vault through the `WIKI_PATH` environment variable, with the same boundary enforcement as CI (ADR-0007).
- **Note templates** in `_templates/` define front-matter: `origin`, `created`, `tags`; Logs are `YYYY-MM-DD.md` and chain via a `previous` link; Projects carry `Status`, `Goal`, `Notes`.
- **`ABOUT.md`** at the wiki root supplies the homepage paragraph; editing that one file changes it (ADR-0009).
- The canonical glossary is the wiki's `.docs/CONTEXT.md` (Vault, Layer, Category, Log, Promote, Publish, Public Projection, Agent Interface, Catalog, Neighbor). This document references it rather than restating it.

## Capabilities and Constraints

**Confirmed capabilities.** Category-first routing, flat after the category: `/articles/<slug>`, `/projects/<slug>`, `/logs/<date>` (ADR-0003). Generated tag pages at `/tags/<tag>` as the second grouping axis (ADR-0008). Homepage: site name, a paragraph from `ABOUT.md`, the latest 10 Articles, category links in the header; Projects and Logs appear only on their own pages (ADR-0009). Static logs index with no island. Pagefind search that lazy-loads only when opened, and RSS at `/rss.xml` (ADR-0010). `llms.txt`, JSON catalog, and raw markdown for agents (ADR-0006). Minimal 404 page. Markdown rendering scope: wikilinks with graceful degradation, front-matter, `_assets/` images through Astro's image pipeline, inline tags, checkboxes, footnotes, callouts, and math via build-time KaTeX (ADR-0005).

**Constraints.** Static site generation only: no backend, no database, no auth, no comments, no on-site editor (ADR-0001). Zero JavaScript on ordinary pages; the ~100ms client-side render budget is the acceptance test for any script (ADR-0002). Served from GitHub Pages at the domain root. Language support is deferred: English only in v1, `.id.md`/`.ja.md` siblings ignored by the build, with the subtree design recorded for later enablement (ADR-0004). Logs stay flat files to keep Obsidian's Daily Notes automation working.

**Undecided.** Typefaces are provisional until the type pass (currently Source Serif 4 for reading, Archivo Narrow for labels and data). The article reading page and the dressing of the content surfaces are not yet composed.

## Brand Commitments

- Name: **deppfellow**; address `deppfellow.github.io`.
- Visual world: **Plates and Declinations**, an observatory plate atlas (ADR-0013). The style references under `.docs/references/` remain evidence for palette and character, not the system itself.
- Architecture authority is this repo's `.docs/adr/`; the wiki's ADRs are reference material, not binding here.
- Authoring voice, as recorded in his own agent guidelines: plain language, jargon defined on first use, no em dashes.

## Evidence on Hand

- The real content corpus is the wiki vault. Public category folders exist with little published content today; substantially more writing sits in `Private/Drafts/`, including project work with subfolders and ADRs of its own.
- The vault's own ADRs, `_schema/`, `_templates/`, and `.docs/CONTEXT.md` are real and authoritative inputs.
- **Absent, and not to be fabricated:** testimonials, press, customer logos, analytics, usage numbers, benchmarks, pricing. There is one author and no institutional claims.
- **Content dependency:** `ABOUT.md` does not exist at the wiki root yet; the homepage paragraph has no source until it is written.

## Product Principles

1. **The vault is the only content authority.** The site holds no state and owns no content. Anything that would make the site a second place to edit is out of scope.
2. **One pass, two audiences.** Rendering, wikilink resolution, the catalog, `llms.txt`, and raw markdown come from a single build pass, so the human and agent views of the wiki cannot diverge.
3. **Reading is the default; interactivity pays rent.** Ordinary pages ship no JavaScript. Every script must justify itself against the client render budget.
4. **The vault's boundaries are law.** Only registry-listed categories render, and private content is physically absent from the build environment.
5. **Structure beats decoration.** Category, then tag, then post. The header nav is the recovery path on every page, including dead ends.

## Accessibility & Inclusion

Target **WCAG 2.2 AA**: color contrast (a real risk on the eventual dark palette), full keyboard navigation, visible focus, correct semantics and document structure, and `prefers-reduced-motion` support. No product-specific user need was established beyond this standard.
