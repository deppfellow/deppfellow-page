---
status: accepted
date: 2026-09-10
---

# Tag pages as the second grouping axis

Tags are the second grouping axis after category, and Obsidian tags are vault-global, so tag pages are global across categories: one generated page per unique tag at `/tags/<tag>`, listing every public post carrying that tag with its category labeled. Tag chips on post pages and listing cards link there.

## Considered Options

- Per-category tag pages (`/articles/tag/<tag>`) - rejected: Obsidian tags ignore folders, so global pages match authoring reality at the same build cost.
- Tags as inert metadata - rejected: tags exist on the notes; the pages are pure build output at this scale.

## Consequences

- Tags come from front-matter (`tags: []`), shared across translations of a post.
- Tags only exist on public notes, so tag pages cannot leak anything.
