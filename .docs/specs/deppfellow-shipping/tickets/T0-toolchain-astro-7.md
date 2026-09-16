---
td: td-a53be3
type: chore
priority: P0
ownership: human-owned
blocked-by: None
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T0
---

# T0: Upgrade the toolchain to Astro 7.3.2 and Tailwind 4.3.3 on the unified processor

Delivered behavior: The site builds on Astro 7.3.2 and Tailwind 4.3.3 with the unified Markdown processor pinned, rendering identically to the Astro 5 build.

## Objective

Remove two majors of drift before the Markdown resolution pass (T5) is written against a pipeline the newer Astro replaces by default (ADR-0014). This ticket is a prerequisite for T1, not a parallel workstream.

## Interface Contract

Files: `package.json` (versions), `astro.config.mjs` (`markdown.processor`).

- `astro` pinned at `^7.3.2`; `tailwindcss` and `@tailwindcss/vite` at `^4.3.3`.
- `@astrojs/markdown-remark` added, and `markdown.processor: unified()` set explicitly, with a comment naming ADR-0014 and T5. Removing this line silently switches to Sätteri and breaks T5's plugin model.
- `output: "static"`, `build.format: "directory"`, `site`, and the Tailwind Vite plugin are unchanged.
- Spacing between inline elements is declared via classes, never left to source whitespace, because Astro 7 defaults `compressHTML` to `'jsx'`.
- `scripts/review-capture.mjs` parks the cursor off-canvas before capture so screenshots are deterministic.
- The build completes and emits the same route set as before the upgrade.

## Examples

| Check | Expected |
| --- | --- |
| build | succeeds; 2 pages; loader loads 19 fixture notes |
| ABOUT body | present in `dist/index.html` (proves `renderMarkdown` under a custom loader) |
| page scripts | `0` on `/` |
| nav geometry | link width 81.52px, count span offset 1021.84px at 1440px |
| pixels | 0 differing pixels vs the frozen Astro 5 build at 1440x900 and 390x844 |

## Setup

- `WIKI_PATH=fixtures/vault npm run build`.
- For comparison: freeze each `dist/` and serve the two on separate ports; a single `astro preview` serves the live output and cannot host both.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && node -e "const p=require('./package.json');const assert=require('assert');assert(p.dependencies.astro.startsWith('^7.'),'astro not v7');assert(p.devDependencies.tailwindcss.startsWith('^4.3'),'tailwind not 4.3');assert(p.dependencies['@astrojs/markdown-remark'],'markdown-remark missing');" && grep -q 'unified()' astro.config.mjs && grep -q 'deppfellow is a personal wiki' dist/index.html
```

## Acceptance Criteria

- L-AC-01 — `astro` resolves to 7.3.2 or later in the 7.x line; `tailwindcss` and `@tailwindcss/vite` resolve to 4.3.3. (ADR-0014)
- L-AC-02 — `astro.config.mjs` sets `markdown.processor` to `unified()` and `@astrojs/markdown-remark` is a declared dependency. (ADR-0014)
- L-AC-03 — The build succeeds and the custom loader still returns both `body` and `rendered` (ABOUT text appears in built HTML). (ADR-0014)
- L-AC-04 — `dist/index.html` contains zero `<script>` elements. (D-31)
- L-AC-05 — A frozen-build pixel comparison against the Astro 5 build shows zero differing pixels at 1440x900 and 390x844. (ADR-0014)
- L-AC-06 — No component relies on source whitespace for inter-element spacing: the RuleBand category links use an explicit layout class. (ADR-0014)

## Specification Coverage

ADR-0014; enables REQ-04 and REQ-08 (the resolution pass and build-time math this ticket preserves the plugin model for).

## Preserved Invariants

- Home page output, token rules, fonts, and zero-script behavior are unchanged.
- The category registry boundary and vault resolution are unchanged.
- Node.js remains compatible (v24 supports both).

## Out of Scope

- Sätteri adoption (declined for now; revisit behind T5's contract).
- The `/specimen` route and specimen-only font packages (housekeeping, separate).
- Any content-surface work (T1-T17).
