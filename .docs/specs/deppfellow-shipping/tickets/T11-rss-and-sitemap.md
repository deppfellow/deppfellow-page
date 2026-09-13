---
td: td-533f29
type: feature
priority: P2
ownership: agent-owned
blocked-by: T1
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T11
---

# T11: Generate rss.xml and sitemap.xml

Delivered behavior: The build emits an RSS feed of Articles and Projects and a sitemap of every public route, both with absolute root URLs.

## Objective

ADR-0010's feed and ADR-0011's sitemap. Both are machine-facing surfaces that must bake the domain-root address correctly, which is why they sit behind the T17 sequencing note.

## Interface Contract

Endpoints: `src/pages/rss.xml.ts` and `src/pages/sitemap.xml.ts` (new) → `dist/rss.xml`, `dist/sitemap.xml`.

- RSS items: Articles and Projects only (never Logs), ordered by `created` descending, capped at 50.
- Each item: absolute `<link>` to the note's canonical route, `<title>`, `<pubDate>` from `created`, `<description>` from the resolved summary when present (element omitted when absent).
- `<link>` and `<guid>` use the domain-root absolute URL (no path prefix).
- Sitemap lists every generated public route (category indexes, detail pages, tag pages, home) as absolute URLs; `rss.xml`, `404.html`, and `search` are excluded.
- Both are static output with no runtime dependency.

## Examples

| State | Output |
| --- | --- |
| 12 Articles + 3 Projects + 4 Logs | 15 RSS items, newest first; no Logs |
| a note without description | item omits `<description>` |
| 60 eligible notes | exactly 50 items |
| any build | sitemap contains every detail route, no `/404` |

## Setup

- `WIKI_PATH=fixtures/vault npm run build`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && grep -q '<rss' dist/rss.xml && grep -q '<urlset' dist/sitemap.xml
```

## Acceptance Criteria

- L-AC-01 — `dist/rss.xml` parses as RSS and contains every fixture Article and Project, and no Log entry. (REQ-22)
- L-AC-02 — Items are ordered by `created` descending and capped at 50. (REQ-22)
- L-AC-03 — Every RSS `<link>` is absolute and resolves to an existing built route. (REQ-22, REQ-18)
- L-AC-04 — `dist/sitemap.xml` lists every generated detail and index route as an absolute URL and omits 404/search. (REQ-23)

## Specification Coverage

REQ-22, REQ-23.

## Preserved Invariants

- Existing routes unchanged.

## Out of Scope

- RSS for Logs, sitemap indexes, Atom/JSON feeds, pagination beyond the cap.
