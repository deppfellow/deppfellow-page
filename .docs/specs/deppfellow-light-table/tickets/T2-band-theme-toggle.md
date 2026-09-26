---
td: td-6d0813
type: feature
priority: P2
ownership: agent-owned
blocked-by: T1
spec: .docs/specs/deppfellow-light-table/SPEC.md §Ticket Decomposition slice T2
---

# T2: Band theme toggle with destination semantics

Delivered behavior: a sun/moon toggle in the rule band switches the world, persists the choice, and always names its destination.

## Objective

When this ticket closes, every band page carries a keyboard-operable button that flips the world instantly, writes the persisted key T1 defined, and shows - by icon and accessible name - the world pressing it will reach. Placement follows page type: left of Search where Search renders, last on the right elsewhere.

## Interface Contract

- `RuleBand.astro` renders the toggle inside the band `nav` on every template that uses the band.
- Icon: inline SVG line drawing, 16px, `1.5px` stroke, `currentColor`, no fill. Sun while dark; moon while light. No icon font, no external asset.
- Destination semantics: the accessible name is "Switch to light theme" while dark and "Switch to dark theme" while light; icon and accessible name swap together on toggle, never out of sync.
- Placement: immediately left of the `pagefind-modal-trigger` where `search` is set; otherwise the last item inside the band `nav`.
- Click behavior: swaps the world via the T1 attribute mechanism, writes `localStorage["deppfellow-theme"]` to the newly resolved value, no page reload; the switch applies with no transition or animation.
- Native `<button>`; visible `:focus-visible` ring per the global focus style; hover recolors to iris like every band trigger. No new dependencies, no new files beyond the component and its scoped script.

## Examples

- Dark home page: click → page flips to light instantly, icon becomes a moon, accessible name becomes "Switch to dark theme", `localStorage["deppfellow-theme"]` is `"light"`; a full reload keeps light.
- Reading page (`/articles/<slug>/`, no Search): the toggle is the last item in the nav, after the Logs link.
- Keyboard: Tab reaches the toggle in band order; Enter toggles; the focus ring is visible throughout.
- Edge: toggling twice returns to the starting world and restores the stored key to its original value.

## Setup

- Same environment as T1 (`npm ci`, content-honest fixture build, preview server for live drives).

## Gate

```sh
npm run lint && rm -rf node_modules/.astro && WIKI_PATH=fixtures/vault timeout 300 npm run build && grep -o 'Switch to [a-z]* theme' dist/index.html | sort -u && grep -o 'Switch to [a-z]* theme' dist/articles/memory-layers-for-long-horizon-agents/index.html | sort -u
```

Build exits 0; the greps show exactly one destination-label form per page in the default (dark) render.

Verification skill: `.pi/skills/verify-deppfellow-page/SKILL.md` - feature-map rows "Home page", "Search" (trigger placement), command-map row "Visual capture" for the toggle drive.

## Acceptance Criteria

- L-AC-01 — Home built HTML: the toggle button appears before the `pagefind-modal-trigger` inside the band nav (SPEC-AC-07; REQ-08).
- L-AC-02 — Reading-page built HTML: the toggle is the last element inside the band nav (SPEC-AC-07; REQ-08).
- L-AC-03 — Live drive: click round-trip swaps worlds instantly with no transition, icon and accessible name swap together, storage updates, and a reload persists the choice (SPEC-AC-02; REQ-04, REQ-06, REQ-07).
- L-AC-04 — DOM audit: sun while dark / moon while light at 16px stroke-drawn in `currentColor`; aria-label names the destination (REQ-07).
- L-AC-05 — The toggle markup is present in all nine built page templates that render the band (REQ-08).
- L-AC-06 — Toggle is a native `<button>`, reachable and operable by keyboard alone, with a visible focus ring (REQ-07).

## Specification Coverage

REQ-07, REQ-08. Every REQ listed here appears in the Spec's coverage table mapped to T2, and every REQ mapped to T2 appears here.

## Preserved Invariants

- Band layout, content, and order above 640px are unchanged apart from the inserted toggle.
- The search modal opens exactly as before from the band trigger; category links and their two-digit counts are untouched.
- No transition or animation is introduced on `html`, `body`, or world-carrying elements.
- Detail pages still ship no body scripts beyond the FAB (the head theme script from T1 is the sanctioned exception).

## Out of Scope

- The world-resolution mechanics themselves (T1 owns the attribute, storage reading, and media-query fallback); T2 only writes the storage key on toggle.
- The Menu panel and its theme row (T3).
- `DESIGN.md` / ADR-0015 documentation (T4).
