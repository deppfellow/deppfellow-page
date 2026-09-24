---
status: accepted
date: 2026-09-10
---

# Category-first routing; per-article directories; flat logs

URLs are category-first and flat after the category: `/articles/<slug>`, `/projects/<slug>`, `/logs/<date>`. A post is one basename; translations are suffixed siblings of the same basename.

Vault file layout:

- `Articles/<name>/<name>.md` - one directory per article, bare file is canonical, e.g. `Articles/agentic-memory/agentic-memory.md`, `agentic-memory.id.md`.
- `Projects/<name>/<name>.md` - same scheme.
- `Logs/YYYY-MM-DD.md` - flat, no per-day directories, because Obsidian's Daily Notes plugin writes flat and cannot create directories.

Build rules:

- Slug = per-article directory name; for bare files (logs), slug = filename.
- Grouping is directory-based when a directory exists, filename-based when not; both shapes are handled.
- The category registry (`_schema/categories.md` in the wiki) is the publication boundary; only listed categories render.
- Basenames stay unique vault-wide so Obsidian wikilinks resolve naturally.
