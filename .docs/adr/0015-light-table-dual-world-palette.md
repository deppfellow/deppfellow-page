---
status: accepted
date: 2026-09-26
---

# ADR-0015: Light table - a dual-world palette

## Context

ADR-0013 locked one lighting of the plate world, the near-black plate. Visitors who read on paper had no second world, and the small-width band collapse (spec `deppfellow-light-table`) landed at the same time, so the second world had to arrive without redesigning the first. D-14 ruled the relationship early - the dark world stays default and unchanged, and the light table extends the same visual world rather than reversing it.

Two standing constraints framed the work. The palette had to pass a WCAG contrast check per role (small text `4.5:1`, UI marks `3:1`), with any forced change landing as a log amendment and never as a silent swap; the pass later amended the approved light hairlines (D-15 amending D-05). And ADR-0002's performance contract held that ordinary pages stay script-free.

## Decision

The site renders in two worlds from one set of token slots in `src/styles/global.css`.

**The light table.** The light world is the plate held against cold light - a cold paper ground with cold ink, the same two typographic voices and the same rules as the dark world. The cold-not-warm refusal is constitutive - never cream, never ivory, never a warm paper ground - because the system already refuses the warm-paper blog default in its dark form; a warm light world would be a different product. Prose ink becomes a near-black cold blue; star, rule and plate-edge darken for legibility; the Two-Ink and One Ember rules carry over unchanged, with iris staying interaction-only and ember staying the single recency mark.

**Same-slot tokens.** A `data-theme="light"` attribute on `<html>` redefines the eight colour custom properties and `color-scheme`; component code is untouched and reads the same slots in either world. The dark values remain the fallback when the attribute is absent, so the dark world needs no attribute at all. Pagefind's one hard-coded white (`--pf-mark`) became a world-dependent token on the same pattern.

**System-first, persisted.** A first visit follows `prefers-color-scheme`; while the visitor is on the system default, live OS changes are followed. A manual choice is two-state - light or dark, no third "system" state - and persists in `localStorage`, suppressing live changes. An inline head script applies the stored or system choice before first paint, so no page flashes the wrong world; the switch itself is instant under the One-Step Rule.

**ADR-0002 superseded in part.** ADR-0015 supersedes in part ADR-0002's line that ordinary pages stay script-free (spec `deppfellow-light-table` D-09/D-13). The two sanctioned scripts are the head pre-paint script and the band script; both are tiny and scoped, no framework runtime ships, and ADR-0002 carries its superseded-by marker.

## Considered Options

- Warm or cream paper for the light world - declined. The refusal is the system's identity; cold paper keeps the two worlds one product.
- A third "system" state on the toggle - declined. Two states keep the control honest; the system preference governs only while no manual choice is stored.
- Per-page or per-section theme overrides - declined. The world is a property of the visitor, not of the page.
- A second token set for the light values, with separate light properties or duplicated component styles - declined. Same-slot redefinition leaves component code untouched and keeps every rule world-independent by construction.
- Serving the choice from per-request HTML or a cookie round-trip - declined. The site is static; the pre-paint script is smaller than any round trip and removes the wrong-world flash entirely.

## Consequences

- `DESIGN.md` carries both palettes and both component sets; `global.css` remains the token source of record and wins on divergence.
- The sun/moon line icon is the single icon in the vocabulary, recorded in `DESIGN.md` as the deliberate exception; a second icon is a defect, not a precedent.
- Every page ships the pre-paint script and every band page the band script; the script whitelist (spec `deppfellow-shipping` D-17, extended by D-09) is the enforcement, and ADR-0002's ~100ms client budget still governs any future script.
- The light hairlines hold a hard `3:1` floor (rule `#7f8ca1`, rule-strong `#748096`, D-15 amending D-05); the dark hairlines stay as shipped. Any future value change repeats the contrast pass and lands as a log amendment.
- Theme switches are instant and transition-free by design; the band holds every transition off until the flipped world has painted.
- ADR-0002's other lines - the client budget, the CDN TTFB acceptance, the LCP guardrail - stand unchanged.
