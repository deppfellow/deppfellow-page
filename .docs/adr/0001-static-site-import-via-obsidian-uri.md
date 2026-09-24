---
status: accepted
date: 2026-09-10
---

# Static site, no backend; import via Obsidian URI handoff

The site is build-time static site generation only: no backend server, no database, no auth, no forms, no on-site editor. The only publication act is a `git push` from the vault (Obsidian).

A single write-adjacent convenience exists: an "Import Markdown" button that reads a `.md` file from the user's disk in the browser (FileReader, nothing uploaded), then opens `obsidian://new?vault=deppfellow-wiki&name=<Category>/<filename>&content=<markdown>` to create the note inside the chosen category folder of the local vault. A copy-to-clipboard button sits beside it for files too large for a URI (roughly above 30-60KB encoded).

## Considered Options

- GitHub API commit from a form with a PAT baked into the page - rejected: a public page holding a write token is a leak.
- Client-side editor that downloads a `.md` file for manual vault placement - rejected: clunkier than the URI handoff for the same result.
- Upload endpoint to a server - rejected: reopens the backend the architecture retired.

## Consequences

- The import button is a personal convenience on the author's machine; a visitor clicking it writes into their own vault or does nothing. Harmless by construction.
- The wiki ADR-0001 is adopted as this repo's ground rule, not treated as an external reference.
