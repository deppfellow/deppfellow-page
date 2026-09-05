# Deppfellow LLM Wiki

The design language for the deppfellow LLM Wiki — a single Obsidian vault that serves as a shared memory layer for the user and their AI agents.

## Language

**Vault**:
The one Obsidian folder that holds all content — a single graph and a single search index.
_Avoid_: workspace (that word names a different axis), brain

**Layer**:
The visibility tier of content: `public` (committed to GitHub) or `private` (gitignored, never reaches GitHub). Note: public ≠ site-displayed — the site renders only Articles, Projects, and Logs.
_Avoid_: scope, zone

**Workspace**:
The editing-authority axis: human-only space (`Private/Personal/`, where the AI is forbidden) vs AI-shared space (the AI maintains the whole wiki and authors into `Private/Drafts/`). Every note carries a provenance marker.
_Avoid_: vault, layer

**Category**:
The content-type bucket a note belongs to, expressed as a top-level folder. Mutually exclusive — exactly one per note. A top-level folder counts as a category only if its name has no leading `.` or `_` and it is listed in the public category registry (`_schema/categories.md`). Current set: Articles, Projects, Logs (extensible).
_Avoid_: tag, type, topic

**Log**:
A dated, short-to-medium markdown entry — at most one per day — chained to the entry with the latest earlier date (a `previous` link, omitted on the first log); it may wikilink any earlier log. Displayed newest-first as an infinite scroll on the site.
_Avoid_: post, journal entry

**Provenance**:
A record of who authored a note (human or AI).
_Avoid_: author, origin

**Raw Source**:
A captured, untouched note under `Private/Sources/<Category>/` holding external text (blog, Reddit, Twitter, YouTube) clipped by the Obsidian Web Clipper. Carries Clipper front-matter (`title`, `author`, `published`, `source`, `ContentType`, `fetched`, `processed`, `tags`) — never `origin` or `category`.
_Avoid_: clip, snapshot

**Draft**:
An AI-authored note in `Private/Drafts/`, not yet promoted to a public category.
_Avoid_: WIP, scratch

**Promote**:
The act of moving a finished draft from `Private/Drafts/` into a public category folder.
_Avoid_: publish (that word names the site-side act, below)

**Publish**:
The act of making a public note appear on the site. Automatic: a push to the public repo triggers a site rebuild; there is no separate publish step.
_Avoid_: promote (that names the vault-side move)

**Public Projection**:
The read-only subset of the Vault that the site displays: the notes in categories listed in the registry.
_Avoid_: vault mirror, public vault, bidirectional copy

**Agent Interface**:
The machine-facing, read-only surface of the site through which agents discover, search, fetch, and walk the Public Projection.
_Avoid_: API (mechanism-specific), MCP server

**Entry Point**:
The machine-oriented front page of the site that tells an arriving agent what the Public Projection offers and where to find each part.
_Avoid_: sitemap, homepage

**Catalog**:
The build-generated index of the Public Projection — one entry per public note, with metadata, a raw-markdown URL, and neighbors. Doubles as the agent search index.
_Avoid_: sitemap, database

**Neighbor**:
A note connected to another by a wikilink, in either direction; exposed in the Catalog so agents can walk the graph.
_Avoid_: related post, backlink (one direction only)
