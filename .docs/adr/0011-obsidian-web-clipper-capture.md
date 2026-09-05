---
status: accepted
date: 2026-08-25
---

# Raw capture via the Obsidian Web Clipper

Capturing raw text from the internet (blogs, Reddit, Twitter, YouTube) is done with the **Obsidian Web Clipper**, not a custom script. The Clipper saves each clip straight into `Private/Sources/<Category>/` (e.g. `Article/`, `Reddit/`, `Twitter/`, `YouTube/`) with a consistent front-matter it controls (`title`, `author`, `published`, `source`, `ContentType`, `fetched`, `processed`, `tags`). This supersedes ADR-0010; the custom capture script and skill were removed.

## Consequences

- No scripted capture tooling exists; the Clipper is the single capture path. `Private/Sources/` is the raw layer.
- A Raw Source is captured, not authored: it never carries `origin` or `category`, and is never hand-edited.
- `processed: false` (Clipper field) marks a source not yet synthesized; the agent flips it to `true` after producing a draft in `Private/Drafts/<Category>/`.
- The compile stage (agent reads a Raw Source and proposes a synthesis into `Private/Drafts/`) remains unbuilt — this ADR covers capture only.
