---
name: deppfellow
description: An observatory plate atlas for a public wiki of notes on agents and memory.
colors:
  plate: "#05070c"
  plate-edge: "#0a0d15"
  rule: "#1b2230"
  rule-strong: "#2a3446"
  bone: "#e8eef7"
  star: "#9fb6d9"
  iris: "#5683da"
  ember: "#ff8964"
typography:
  note:
    fontFamily: "Spectral, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.55
  title:
    fontFamily: "Spectral, ui-serif, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Archivo Narrow Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.09em"
rounded:
  none: "0"
spacing:
  row: "1.25rem"
  band: "1.25rem"
  section: "4rem"
components:
  rule-band:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.star}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "1.25rem 2.5rem"
  category-link:
    textColor: "{colors.star}"
    typography: "{typography.label}"
  category-link-hover:
    textColor: "{colors.iris}"
  plate-row:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.bone}"
    typography: "{typography.title}"
    padding: "1.25rem 0.75rem"
  plate-row-hover:
    textColor: "{colors.iris}"
  recency-mark:
    backgroundColor: "{colors.ember}"
    size: "6px"
---

# Design System: deppfellow

## Overview

**Creative North Star: "Plates and Declinations"**

The site is an observatory plate atlas: a working catalogue of dated observations, printed on a near-black plate, ruled like a table and measured like an instrument. The world was chosen in a direction round and locked in ADR-0013; the home composition is the Plate Stack, locked in the surface brief.

**Key Characteristics:**
- A near-black plate (`#05070c`) with no surface fills, no cards, and no shadows. Structure is carried by hairlines and by stacked paper edges.
- Two voices only: a reading serif and a condensed grotesque for labels, dates and counts.
- One accent per view. Ember (`#ff8964`) marks recency and nothing else; iris (`#5683da`) belongs to interaction.
- Numbers are set in tabular figures, so a column of dates reads as a column.
- Motion is a single mechanical step, never a glide.

## Colors

The palette is monochrome plus one lived accent. It refuses both the warm-paper blog default and the neon-on-black variant of it: the plate is cold and flat, and the only warm colour in the system is the mark of something new.

- **Plate** (`#05070c`): the ground of every page. Never lightened for a section; there are no section fills.
- **Plate edge** (`#0a0d15`): the sheet behind the sheet, used only by the stacked edges under a list and as the row hover fill.
- **Rule** (`#1b2230`) and **rule strong** (`#2a3446`): hairlines that draw the catalogue. Rules are always `1px`; nothing heavier exists in the system.
- **Bone** (`#e8eef7`): reading text and the site name.
- **Star** (`#9fb6d9`): secondary ink for dates, category links, section headings and legends.
- **Iris** (`#5683da`): interaction only, plus the keyboard focus ring.
- **Ember** (`#ff8964`): the recency mark.

**The Two-Ink Rule.** Prose is bone, metadata is star, and nothing else receives colour. If a third ink appears in body copy, the hierarchy has failed.

**The One Ember Rule.** Ember appears once per view and only as a mark of recency. Two ember marks in one viewport means one of them is wrong.

## Typography

Two faces, no third. Spectral (`400`, `600`) carries everything read in sentences; Archivo Narrow carries every label, date, count and legend, always in caps with `0.09em` tracking. Spectral was chosen over Source Serif 4, Newsreader, Literata and EB Garamond in a specimen pass at real sizes on the plate ground: it is the only one of the five whose wedge serifs and low contrast read as measured and cold rather than editorial or bookish, and the only one that holds its weight on near-black without turning soft.

The ramp as used: note `1.5rem / 1.55`, title `1.25rem / 1.35`, label `0.8125rem / 1.2`. Scale steps are small and deliberate; the serif at reading size is the page's largest voice, and the world supplies no display size on purpose.

**The Two-Voice Rule.** Serif for sentences, condensed caps for identifiers. A label in the serif face or a sentence in the label face is a defect in either direction.

**The Tabular Rule.** Every number that can be compared with another number is set in tabular figures (`font-variant-numeric: tabular-nums`), including dates, counts and legends.

## Layout

A single container of `1100px` with `24px` gutters (`40px` above the small breakpoint). Prose holds a `65ch` measure; lists hold the container, so dates form a true column.

The header is a rule band: bounded by a hairline above and below, site name left, category links and their counts right. Lists are ruled rows inside a bordered stack, with a section rule and a legend above them.

Row rhythm: `20px` vertical padding per row, one hairline between rows, and no gaps. On narrow screens the two-column row collapses to a stacked date-above-title pair; nothing shrinks and nothing is hidden.

**The Measure Rule.** Prose never exceeds `65ch`, at any viewport. Lists are exempt because their job is alignment, not reading.

**The Rule-Band Rule.** Navigation is always a band bounded by hairlines, never a floating or shadowed header.

## Elevation & Depth

Flat by design. There are no shadows, no blurs, and no gradients; depth exists only as two stacked edges that step `3px` and `6px` below a list, each drawn as a hairline rectangle in `--color-plate-edge`. That single device says "a stack of sheets" without faking a material.

**The Flat-Plate Rule.** No element casts a shadow. If something must lift, it steps (as the stacked edges do) or it changes ink.

## Shapes

Square corners everywhere (`0` radius). Rectangles are the plate's own shape; there is no rounded container in the system, and pills, circles and soft cards are out of vocabulary.

**The Square Rule.** Nothing is rounded, at any size, for any state.

## Components

**Rule band.** The header: hairline above and below, site name in bone at `0.9375rem` with `0.22em` tracking, category links in star with tabular counts at 70% star. Hover moves a link to iris.

**Stack.** A bordered list container (`1px` rule) with two hairline edge layers offset below it. The stack is the list's signature; a bare unordered list is not the component.

**Plate row.** One dated entry: a tabular date column (`9rem` above the small breakpoint, stacked below it), the title in the serif at `1.25rem`, `20px` vertical padding, one hairline above. Hover moves the title to iris and steps it `2px` with `steps(2, end)` over `120ms`; focus-visible draws a `1px` iris ring at `3px` offset. The row never becomes a card.

**Recency mark.** A `6px` ember square sits beside the date of the newest entry, taught once by a legend in the section heading row. State is a mark, not a hue change.

**Section heading row.** A hairline, then the section name in label caps at star on the left and a legend on the right, `40px` below the rule.

**Observer's note.** The markdown note from `ABOUT.md`, set at `1.5rem / 1.55` in bone with a `65ch` measure; its paragraphs take `1.1em` bottom margin and nothing else.

**The Ruled Row Rule.** Lists are ruled rows, never cards and never nested containers. Every row spans the container so that columns align down the page.

**The One-Step Rule.** Motion is one mechanical step: `120ms` with `steps(2, end)` and a `3px` overshoot that settles at `2px`. Nothing glides, nothing fades in, and `prefers-reduced-motion` removes it entirely.

## Build Baseline

**Toolchain.** Astro `7.3.2`, Tailwind CSS `4.3.3` (via `@tailwindcss/vite`), static output. The Markdown processor is pinned to `unified()` (`@astrojs/markdown-remark`) because the reading-page resolution pass is a remark/rehype pipeline; Astro 7's default is Sätteri. See ADR-0014.

**Markup spacing.** Astro 7 compresses HTML by JSX rules, so whitespace between inline elements is not reliable. Inter-element spacing is declared in classes (`gap-*`, `ml-*`, or an explicit `inline-flex`), never inherited from source whitespace.

**Tokens.** The single source is `src/styles/global.css` (`@theme`). The front matter above and `.impeccable/design.json` mirror it; if they diverge, `global.css` is correct.

## Do's and Don'ts

### Do
- **Do** carry structure with `1px` hairlines and `20px` row rhythm instead of fills, cards or shadows.
- **Do** set dates, counts and legends in Archivo Narrow caps with tabular figures (`0.09em` tracking).
- **Do** hold prose to `65ch` and let lists hold the full container so their columns align.
- **Do** keep ember to a single recency mark per view and iris to interaction and focus.
- **Do** stack two hairline plate edges below a list when a list needs to feel like a stack of sheets.

### Don't
- **Don't** introduce a third typeface, a display size, or a second accent colour.
- **Don't** round a corner, add a shadow, or use a gradient anywhere in the system.
- **Don't** turn a list row into a card, a chip, or a nested surface.
- **Don't** put colour on body copy or use ember as decoration; it means "new" or it does not appear.
- **Don't** add a kicker, eyebrow, or decorative label above a heading; the heading speaks for itself.
