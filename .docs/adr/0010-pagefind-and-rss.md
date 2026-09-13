---
status: accepted
date: 2026-09-10
---

# Pagefind and RSS included

**Pagefind** (human search): after the build, an indexer walks the built HTML and ships a small search UI that lazy-loads only when the search box is opened. Article pages stay zero-JS, so the performance contract (ADR-0002) holds. Agent search stays the JSON catalog (ADR-0006).

**RSS**: one static XML feed at `/rss.xml`, generated per build, English-only like the rest of the MVP.

## Consequences

- Both are build outputs with no runtime component; either can be removed as easily as it was added.
- Pagefind's index does add files to the deployment, but they load on demand only.
