---
status: accepted
date: 2026-08-24
---

# Agent entry point is a static catalog, not a live API

The site must be queryable by AI agents: given the site URL, an agent should land on an entry file (`llms.md`), discover what public content exists, search it, fetch article raw markdown, and follow the wikilink graph to neighboring articles. Decision: this whole agent surface is static build output — `llms.md` (entry point), a catalog file (JSON index of public notes with title, summary, tags, date, raw URL, and graph neighbors), and raw markdown files per note. An agent with a fetch tool is its own search engine over the catalog. MCP or a live search endpoint is deferred until the catalog outgrows agent-side scanning or ranked server-side search becomes a real requirement.

## Considered Options

- MCP server / live search endpoint — rejected for now: adds a running server purely to answer queries an agent can already answer by fetching the catalog.
- Static catalog — accepted: four kinds of build output, testable, free, hostable anywhere.

## Consequences

- The catalog doubles as the search index; its size is the scale limit of this decision.
- Introducing a backend search later is additive: serve better answers behind the same URLs the catalog already points to.
- Graph neighbors in the catalog are derived from wikilinks at build time, so the catalog depends on the build-time wikilink resolution decision.
