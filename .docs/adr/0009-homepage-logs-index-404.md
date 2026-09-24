---
status: accepted
date: 2026-09-10
---

# Homepage, logs index, and 404

**Homepage.** Site name, a brief paragraph of two to three sentences read from `ABOUT.md` at the wiki's root, and the latest 10 Articles - and nothing else: Projects and Logs appear only on their own pages. Editing `ABOUT.md` changes the home paragraph with no site-code change. Category links live in the header rule band, not the homepage body. Composition: Plate Stack (ADR-0013, surface brief).

**Logs index.** `/logs/` is a plain static page rendering all logs, each log page showing its chained `previous` link. No island, no JSON feed, zero JavaScript - the LogFeed infinite-scroll island is revisited only when the page's weight is actually felt (roughly a year of daily logs).

**404.** Minimal: the header nav plus one line ("that page does not exist") and a link home. The nav is already the recovery path on every page; Pagefind search lives in the header, one click away. Bad wikilink targets never reach 404 (they degrade at build time per ADR-0005); the 404 page exists for genuine dead URLs.

## Consequences

- `ABOUT.md` is a wiki-root meta file, not a category note: it is build input for the homepage paragraph and is not rendered as a note page.
- The homepage and logs index inherit the zero-JS rule from ADR-0002.
