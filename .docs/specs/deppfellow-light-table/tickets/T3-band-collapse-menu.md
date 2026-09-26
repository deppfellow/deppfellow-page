---
td: td-fe506c
type: feature
priority: P2
ownership: agent-owned
blocked-by: T2
spec: .docs/specs/deppfellow-light-table/SPEC.md §Ticket Decomposition slice T3
---

# T3: Band collapse below 640px with FAB-style Menu panel

Delivered behavior: below 640px the band collapses to the site name plus a Menu trigger; the panel opens every control FAB-style; without JavaScript the band stays exactly today's.

## Objective

When this ticket closes, a phone-width visitor gets the whole band's content through one Menu disclosure that behaves like the reading-page FAB, a visitor with scripts blocked loses nothing, and desktop is untouched apart from T2's toggle.

## Interface Contract

- Collapsed presentation applies only when both hold: viewport below 640px AND `<html data-enhanced>` present (the T1 script marker). Markup renders today's wrapped band by default; CSS keyed on the marker performs the collapse.
- Collapsed band row: site name left; a "Menu" trigger right, set in Scales caps, styled like the FAB trigger (plate ground, `1px` rule-strong border, iris hover, iris border + bone text when open).
- Panel: server-rendered by `RuleBand.astro`, `hidden` by default; when open it is the full container width, drops from the band, bounded by a `1px` hairline with the two plate-edge stacked edges stepping 3px and 6px below. Row order: the three category links with their two-digit counts, then Search (only on the four search-carrying templates), then a theme row - the T2 icon plus a destination word ("Light" while dark, "Dark" while light).
- Disclosure semantics mirror the FAB: `aria-expanded` / `aria-controls` / `hidden`; Escape closes and returns focus to the trigger; outside click closes; any activation - category link, Search, theme row - closes the panel (navigation proceeds; the Pagefind modal opens over the closed panel; the world change is visible after close).
- One mechanical step for open/close; no glide, no fade.
- At 640px and above, or without `data-enhanced`, the band renders exactly the T2 state - no Menu trigger, no panel.

## Examples

- 390px, enhanced: band shows "deppfellow" + "Menu"; opening lists Articles 14 / Projects 03 / Logs 04 (fixture counts), then Search, then the theme row; tapping Articles navigates and the panel is closed on arrival.
- 390px, menu open: Escape closes and refocuses the trigger; a click on the page body closes; tapping the theme row closes the panel and the page visibly changes world.
- 390px, scripts blocked: no Menu trigger anywhere, all category links visible wrapped, every destination reachable.
- 768px: band identical to T2's - no Menu.

## Setup

- Same environment as T1/T2; live drives at 390px and 768px viewports per the verification skill's visual-capture row.

## Gate

```sh
npm run lint && rm -rf node_modules/.astro && WIKI_PATH=fixtures/vault timeout 300 npm run build && grep -c 'data-enhanced' dist/index.html && grep -c 'aria-controls' dist/index.html
```

Build exits 0; both greps hit in the built home page (enhancement marker and disclosure wiring present).

Verification skill: `.pi/skills/verify-deppfellow-page/SKILL.md` - feature-map rows "Category indexes", "Search"; command-map row "Visual capture" (`mobile.png` at 390px, `desktop.png` at 1440px).

## Acceptance Criteria

- L-AC-01 — 390px live drive, enhanced: band shows site name + Menu trigger; inline category links and search trigger are not visible in the band row (SPEC-AC-04; REQ-09).
- L-AC-02 — Open panel lists, in order: category rows with two-digit counts, Search (search-carrying templates only), theme row with icon + destination word (SPEC-AC-04; REQ-10).
- L-AC-03 — Category tap navigates with the panel closed on arrival; Escape closes with focus returned; outside click closes; theme-row tap closes with the world visibly changed; Search tap opens the modal over the closed panel (SPEC-AC-04, SPEC-AC-05; REQ-11).
- L-AC-04 — Scripts blocked at 390px: no Menu trigger, category links visible and wrapped as today, all destinations reachable (SPEC-AC-06; REQ-12).
- L-AC-05 — 768px live drive: band identical to the T2 state, no Menu trigger, no panel (SPEC-AC-07; REQ-09).
- L-AC-06 — Open/close applies one mechanical step; no glide or fade on panel or trigger (REQ-10; One-Step Rule).

## Specification Coverage

REQ-09, REQ-10, REQ-11, REQ-12. Every REQ listed here appears in the Spec's coverage table mapped to T3, and every REQ mapped to T3 appears here.

## Preserved Invariants

- The reading-page FAB is unaffected, including its own Escape/outside-click handling and its band-height measurement: with the collapsed band, anchor `scroll-margin-top` still clears the true band height on resize.
- The logs index searchbox (not a band element) is untouched.
- Search modal contents, filters, and keyboard behavior unchanged; only its entry point can now live inside the panel.
- Non-enhanced rendering matches today's band at every width (the no-JS contract is additive-free).
- Detail pages still carry no body scripts beyond the FAB; the band script rides on band templates per the D-09 whitelist.

## Out of Scope

- Theme resolution and persistence mechanics (T1/T2); the panel's theme row reuses the T2 control.
- `DESIGN.md` / ADR-0015 documentation (T4).
- Any redesign of the desktop band or of the FAB itself.
