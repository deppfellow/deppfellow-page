---
status: accepted
date: 2026-09-10
---

# Site address: domain root via deppfellow.github.io

The repo is renamed from `deppfellow/deppfellow-page` to `deppfellow/deppfellow.github.io` so GitHub Pages serves the site at the domain root: `https://deppfellow.github.io/articles/...`. The alternative kept a `/deppfellow-page/` prefix baked into every URL, including the catalog's raw-markdown URLs and RSS links.

## Consequences

- Done now, while the repo is empty: GitHub Pages does not redirect renamed repos, so the cost of renaming later is every shipped URL.
- All generated URLs (pages, catalog, `llms.txt`, RSS, sitemap) assume the root address from the start.
