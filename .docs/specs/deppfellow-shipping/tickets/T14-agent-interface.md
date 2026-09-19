---
td: td-074b0f
type: feature
priority: P2
ownership: human-owned
blocked-by: T5
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T14
---

# T14: Ship the agent interface (JSON catalog and llms.txt)

Delivered behavior: The build emits `llms.txt` and a JSON catalog carrying titles, routes, raw-markdown URLs, and wikilink-graph neighbors.

## Objective

ADR-0006's agent-facing surface. It reuses the T5 resolution pass rather than re-deriving links, which is why it blocks on T5.

## Interface Contract

Artifacts: `dist/llms.txt` and `dist/catalog.json` (or equivalent static paths documented in the ticket's implementation).

- `llms.txt`: an entry point naming the site, the categories, and the paths to the catalog and raw Markdown.
- Catalog: one entry per published note with `title`, `route`, `category`, `created`, `tags`, `description` (when present), `rawMarkdownUrl`, and `neighbors` (from T5's `graphNeighbors`, both directions).
- Every `route` and `rawMarkdownUrl` is absolute at the domain root.
- Raw Markdown is served for each published note (the vault file body), and only for published notes.
- Registry boundary applies: no unlisted note appears in the catalog or raw endpoints.

## Examples

| Input                           | Output                                       |
| ------------------------------- | -------------------------------------------- |
| 12 Articles, 3 Projects, 4 Logs | catalog with 19 entries, each with neighbors |
| a note linking another          | both notes list each other in `neighbors`    |
| an unlisted note                | absent from catalog and raw endpoints        |

## Setup

- `WIKI_PATH=fixtures/vault npm run build`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && test -f dist/llms.txt && test -f dist/catalog.json
```

## Acceptance Criteria

- L-AC-01 — `dist/llms.txt` and `dist/catalog.json` exist. (REQ-30)
- L-AC-02 — Catalog entry count equals the published note count; no unlisted note appears. (REQ-30)
- L-AC-03 — Every catalog `route` and `rawMarkdownUrl` is absolute and resolves to built output. (REQ-30, REQ-23)
- L-AC-04 — A fixture wikilink appears in both notes' `neighbors` lists. (REQ-09, REQ-30)

## Specification Coverage

REQ-30, REQ-09.

## Preserved Invariants

- Human surfaces unchanged; registry boundary intact.

## Out of Scope

- Full-text agent search (Pagefind is human-facing), sitemap changes, embedding generation.
