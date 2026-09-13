---
td: td-a7bf5e
type: feature
priority: P3
ownership: agent-owned
blocked-by: None
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T13
---

# T13: Add the client-side Markdown import page

Delivered behavior: `/import` reads a local `.md` in the browser and hands it to Obsidian via an `obsidian://` URI, with clipboard fallback past a pinned size cap.

## Objective

ADR-0001's import convenience: the author picks a file, chooses a category, and lands it in the vault without the site ever writing anywhere. The exact URI string is this ticket's to fix (Q-01/D-35).

## Interface Contract

Route: `src/pages/import.astro` (new), script-scoped to this page only.

- Controls: `<input type="file" accept=".md,text/markdown">`, a category selector limited to the **registry-listed** categories, and a filename field pre-filled from the chosen file.
- On submit: read the file client-side (no network write), build `obsidian://new?vault=<vault>&file=<category/filename>&content=<encoded>`, and navigate to it.
- Past a **60KB encoded** payload cap, do not attempt the URI; instead copy the Markdown to the clipboard and show the fallback state.
- Clipboard fallback is also offered when the URI navigation cannot be confirmed.
- The page makes no network request with file content; nothing is uploaded.
- A rule-band Import anchor links here from every page, shipping no script.

## Examples

| Input | Result |
| --- | --- |
| 2KB file, category `Articles` | navigates to `obsidian://new?...file=Articles/<name>` |
| 200KB file | clipboard holds the markdown; fallback notice shown; no navigation |
| category not in registry | not selectable |
| no file chosen | submit disabled |

## Setup

- `WIKI_PATH=fixtures/vault npm run build`; open `/import` against a served build or dev server.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && grep -q 'obsidian://' dist/import/index.html
```

## Acceptance Criteria

- L-AC-01 — `/import` builds, contains the file input and an `obsidian://new` reference, and is the only route besides `/search` and reading pages carrying a script. (REQ-24, D-31)
- L-AC-02 — The category selector offers exactly the registry-listed categories. (REQ-24)
- L-AC-03 — A payload over 60KB encoded takes the clipboard path and performs no URI navigation. (REQ-24)
- L-AC-04 — No network request carrying file content is made (verified by request inspection during the session). (REQ-25)
- L-AC-05 — The rule band on built pages contains an Import anchor to `/import`. (REQ-24)

## Specification Coverage

REQ-24, REQ-25.

## Preserved Invariants

- No other page gains a script.
- The vault is never written to.

## Out of Scope

- Server-side upload, vault write-back, drag-and-drop, multi-file import.
