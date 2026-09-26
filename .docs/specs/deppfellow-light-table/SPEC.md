---
document_type: specification
initiative_slug: deppfellow-light-table
contract_status: approved # derived, never hand-edited
created_at: 2026-09-26 # fixed at first derivation
updated_at: 2026-09-26 # last derivation date
---

# deppfellow-light-table — the light world and the collapsed band

## Objective

Give the site a second, cold-paper rendering of the plate design system - the light table - chosen per visitor (system preference first, manual toggle, persisted), and collapse the small-width rule band into a Menu trigger that opens a FAB-style panel of every control. The design-contract documents are amended so both worlds are the contract, not an exception.

> **Light table** - the site's light world: the plate held against cold light - a cold paper ground with cold ink, the same two typographic voices and the same rules as the dark world, never warm and never cream.
> **Theme toggle** - the band's sun/moon control. It always names its destination: a sun while dark, a moon while light.
> **Rule band** - the site's global navigation header: a `1px` hairline-bounded band; site name left; category links (with tabular counts), the theme toggle, and where provided Search at the right. Below the small breakpoint it collapses to the site name plus a Menu trigger.
> **Scales** - the condensed-cap label voice (`Archivo Narrow`, `0.09em` tracking, tabular numerals); the Menu trigger is set in it.

## Repository Context

Astro 7.3.2 + Tailwind CSS 4.3.3, static output, `unified()` Markdown processor (ADR-0014). All design tokens are custom properties in `src/styles/global.css` (`@theme` + base layer) with `color-scheme: dark` on `html`; `DESIGN.md` front matter and `.impeccable/design.json` mirror them, and `global.css` wins on divergence. `src/components/RuleBand.astro` renders the band on all nine page templates (Search on home + the three category indexes only). `src/layouts/Base.astro` owns the `<head>`. `src/components/HeadingIndex.astro` is the house expandable-control pattern (label trigger, hairline stack panel, Escape, one-step motion). Pagefind is themed through `--pf-*` custom properties already mapped to the tokens, with one hard-coded white (`--pf-mark: #ffffff`). td project state lives at `.todos/`; the project verification skill is `.pi/skills/verify-deppfellow-page`.

## Confirmed Requirements

### The light world

- REQ-01 — The site renders in two worlds, the dark plate and the light table, from one set of token slots in `src/styles/global.css`; light-table values: plate `#f3f5f9`, plate-edge `#e8ecf2`, rule `#7f8ca1` and rule-strong `#748096` (amended from D-05 by D-15), bone `#0c1220`, star `#4d6087`, iris `#3a6bce`, ember `#e0612e`; component code reads the same slots in either world. ({D-02, D-05, D-15})
- REQ-02 — In the light world `color-scheme` flips, text selection becomes iris-mix over ink text, the hard-coded white `--pf-mark` becomes a world-dependent token, and every Pagefind `--pf-*` mapping follows the world automatically. ({D-06})
- REQ-03 — A WCAG contrast pass validates each light-table value against its role (small text 4.5:1, UI marks 3:1); any forced value change is reported back and lands as a log amendment before merge. ({D-05})

### Theme model

- REQ-04 — First visit follows `prefers-color-scheme`; live OS changes are followed while the visitor is on system default; a manual choice persists in `localStorage` and suppresses live changes. ({D-01, D-06})
- REQ-05 — The stored (or system-default) choice applies before first paint via an inline head script; no page flashes the wrong world. ({D-01})
- REQ-06 — Switching worlds is instant: no fade, no transition - the One-Step Rule. ({D-06})

### Theme toggle

- REQ-07 — The band carries a sun/moon line icon toggle (16px, `1.5px` stroke, `currentColor`, no fill) with destination semantics - sun while dark, moon while light - and an accessible name stating the action. ({D-04, D-10})
- REQ-08 — The toggle sits left of Search where Search renders (home + three category indexes) and is the last item on the band's right everywhere else (reading pages, tag pages, 404). ({D-04})

### Band collapse

- REQ-09 — Below 640px the band shows the site name plus a "Menu" trigger in Scales caps matching the FAB trigger style; above 640px the band is unchanged apart from the toggle. ({D-03})
- REQ-10 — The open menu panel is full-width, drops from the band, hairline-bounded with plate-edge stacked edges, listing the category rows with counts, then Search, then a theme row of icon plus destination word. ({D-03, D-11})
- REQ-11 — The panel closes on any activation (category link, Search, theme toggle), on Escape, and on outside click. ({D-08})
- REQ-12 — Without JavaScript the band renders exactly as today (links visible, wrapped); the collapse is gated on a script-set `<html>` attribute. ({D-12})

### Contracts and docs

- REQ-13 — `DESIGN.md` carries the light-table values and a dual-world section with every existing rule holding "in either world" plus the toggle icon recorded as the single icon exception; ADR-0015 "Light table: a dual-world palette" records the concept, the cold-not-warm refusal, the system-first persisted choice, and the same-slot token strategy. ({D-07})

## Scenarios

- SPEC-AC-01 — A first visit with the OS in light mode paints the home page in the light table on first paint with no dark flash; with the OS in dark mode it paints dark. ({D-01})
- SPEC-AC-02 — Pressing the toggle swaps worlds instantly, the choice survives a full page reload, and the icon flips to name the new destination. ({D-01, D-04, D-06})
- SPEC-AC-03 — In the light world the search modal, KaTeX formulas, callouts, code frames, and stacked list edges all render legibly from the same token slots, and selection highlight is iris-mix with ink text. ({D-05, D-06})
- SPEC-AC-04 — At 390px the band shows site name + Menu; opening it lists the three categories with counts, then Search, then the theme row; tapping a category navigates with the panel closed. ({D-03, D-08, D-11})
- SPEC-AC-05 — With the menu open, Escape closes it, an outside click closes it, and toggling the theme closes it with the page visibly changed. ({D-08})
- SPEC-AC-06 — With scripts blocked at 390px the band shows all category links wrapped, no Menu trigger, and the site remains fully navigable. ({D-12})
- SPEC-AC-07 — Above 640px on a reading page (no Search) the band shows name, categories, then the toggle last; on home the toggle sits left of Search. ({D-04})

## Constraint

- Scripts: the theme pre-paint inline script and the band menu script are the only scripts added to pages that previously shipped none; both stay tiny and scoped, no framework runtime ever ships, and reading pages keep the FAB alongside them. ({D-09}; narrows ADR-0002 in the D-16 spirit, resolved D-13.)
- The plate stays flat in both worlds: no shadows, no gradients, no rounded corners; the sun/moon icon is the single icon in the vocabulary. ({D-04, D-10})
- The Two-Ink Rule and the One Ember Rule hold in both worlds: prose one ink, metadata another; ember is a single recency mark per view; iris stays interaction-only. ({D-02})

## Non-goals

- A third "system" toggle state, scheduled auto-switching, or per-page/per-section theme overrides.
- Warm or cream paper; any new typeface, display size, or icon beyond the sun/moon pair.
- Redesigning the dark world, or changing the band's content and order above 640px beyond inserting the toggle.
- New search behavior; Pagefind follows the tokens, nothing more.

## Implementation Decisions

- Same-slot tokens: a world attribute on `<html>` (e.g. `data-theme="light"`) redefines the eight color custom properties and `color-scheme`; component code is untouched. ({D-02, D-05})
- Pre-paint: an inline script in `Base.astro`'s head reads a `localStorage` key (e.g. `deppfellow-theme`), falls back to `matchMedia('(prefers-color-scheme: light)')`, and sets the attribute before paint; a `matchMedia` listener follows live OS changes while on system default. ({D-01, D-06})
- Toggle: an inline SVG line icon in `RuleBand.astro`; the band script toggles the attribute, writes `localStorage`, and swaps icon and accessible name together. ({D-04, D-10})
- Menu: `RuleBand.astro` server-renders the panel markup; the collapsed presentation applies only under the script-set `<html>` attribute (no-JS = today's wrapped band); the disclosure script mirrors the FAB (`aria-expanded`/`aria-controls`, hidden panel, Escape, outside click, close-on-activate). ({D-03, D-08, D-12})
- `--pf-mark` becomes a token mapped to the bone slot (white in the dark world, ink in the light world). ({D-06})
- Contrast pass: a small node script computes WCAG ratios for each role pair from `global.css` values; failures are reported and resolved by log amendment before merge. ({D-05})

## Testing/Seam Decisions

- `.pi/skills/verify-deppfellow-page` is the verifier's driving instrument: its command map gates the fixture build (21 notes / 1 skip contract), unit suites, visual capture at 1440px/390px, and live browser drives. This initiative's scenarios land as new feature-map rows ("Theme worlds", "Band Menu"), added through `maintain-verification-skill`, never per-ticket.
- Machine checks: the full CI suite (format, lint, check, tsc, fixture build); grep of built HTML for the pre-paint script in every page's `<head>`; grep of `global.css` for the eight light-table values; the script whitelist extended - the theme pre-paint script and band menu script permitted on band pages, detail pages carrying only FAB + band scripts, everything else unchanged (shipping D-17 whitelist, extended by D-09).
- Session-visible checks (live drive): toggle round-trip with reload persistence; menu open, activate, and close semantics at 390px; scripts-blocked render at 390px.

## Governing References

- ADR-0002 Performance contract (ordinary-pages script-free line superseded in part by ADR-0015; {D-09, D-13})
- ADR-0013 Visual world: Plates and Declinations (ruled extended, not reversed; {D-14})
- ADR-0015 Light table: a dual-world palette (authored by T4; {D-02, D-07})
- `DESIGN.md` (amended by T4); `CONTEXT.md` (Light table, Theme toggle, Rule band entries, updated in session)
- `.pi/skills/verify-deppfellow-page` (verifier instrument)
- Gate events E-01 (slug confirmed), E-02 (derivation gate: frontier empty, human confirmed), E-03 (council skipped by human instruction), and E-04 (spec approved at the quiz gate) map through this spec's existence and the decision log.

## Ticket Decomposition

| Slice          | Delivered behavior                                                                                                                     | Ownership   | Blocked-by |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------- |
| T1 (td-0f037e) | Light-world token foundation: dual-world slots in `global.css`, `color-scheme`/selection/`--pf-mark`, pre-paint script, contrast pass. | agent-owned | None       |
| T2 (td-6d0813) | Theme toggle in the band: line icon, destination semantics, placement, persistence write, band script.                                 | agent-owned | T1         |
| T3 (td-fe506c) | Band collapse below 640px: Menu trigger, panel (categories, Search, theme row), enhancement gate, closure semantics.                   | agent-owned | T2         |
| T4 (td-7cac08) | Design-contract docs: `DESIGN.md` dual-world amendment + ADR-0015.                                                                     | agent-owned | T1, T2, T3 |

REQ coverage: T1 → REQ-01/02/03/04/05/06; T2 → REQ-07/08; T3 → REQ-09/10/11/12; T4 → REQ-13.

## Open Questions & Accepted Risks

- Q-01 — Resolved: D-13 (ADR-0002 narrowing accepted at the quiz gate; ADR-0002 carries the superseded-by marker).
- ADR-0013 extension reading — Resolved: D-14 (ruled extended, not reversed, at the quiz gate).
- Accepted risk — the contrast pass may force palette deltas from D-05; the light table's visual character may shift slightly. Resolution is a log amendment before merge, never a silent value change. Resolved: D-15 amended rule and rule-strong (human-approved hard 3:1 light-world hairline floor).
- Accepted risk — the sun/moon icon breaks the no-icon band vocabulary (deliberate, D-04); if the DESIGN.md amendment does not record it as the single exception, more icons will creep in.
