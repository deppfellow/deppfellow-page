# Reference anatomy

Measured evidence for the design grilling. Captured from the live sites on 2026-09-12 with `scripts/capture-references.mjs` (CDP, `prefers-color-scheme: dark` emulated, desktop 1440 and mobile 390).

Raw evidence per source: `packs/<slug>/{desktop,mobile}.{png,json}` plus `packs/capture-report.json`.

## Design profile

Two profiles, each with an extracted Tailwind v4 token file:

| Profile | Source of               | Tokens                                                                                                                                                                                                                                                                                                                   | Contributes                                                                                                             |
| ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Planhat | `css/style.planhat.css` | obsidian `#000000`, paper-white `#ffffff`, deep-ink `#121211`, graphite `#575551`, warm-stone `#958d7e`, ember-tag `#e8552b`; Geigy LL Duplex Var (fallback Inter); scale 10 to 113px; spacing 4 to 120px                                                                                                                | Cinematic monochrome editorial: quiet authority, generous whitespace, confidence to leave large page areas nearly empty |
| Huly    | `css/style.huly.css`    | void `#090a0c`, obsidian-canvas `#303236`, charcoal-card `#111111`, slate-edge `#4a4b50`, iron-veil `#6b6c6d`, smoke `#95979e`, ash `#a9a9aa`, frost `#d1d1d1`, linen `#e5e5e7`, snow `#ffffff`, electric-iris `#5683da`, ember-pulse `#ff8964`, molasses `#5a250a`; Inter/Esbuild; scale 11 to 80px; spacing 4 to 240px | Cosmic Midnight color ambient: near-black canvas, electric blue, ember pulse for contrast                               |

Both profiles converge on the same move: a monochrome canvas with one warm accent. Planhat calls it ember tag (`#e8552b`, burnt orange), Huly calls it ember pulse (`#ff8964`, coral) alongside electric iris blue (`#5683da`). The accent is the only chromatic voice in either system.

**Project level decisions for this site:** article measure 65ch, reader centred.

## Pattern 1 - Index page (brief paragraphs)

Source: `lucumr-about` (lucumr.pocoo.org/about/), user capture `img/armin-ref.1.png`.

- Content column 800px, which is **73ch** at 17px Merriweather. Generous, single column, no sidebar.
- Body: Merriweather serif 17px / 25px (1.47).
- `h1`: Lora 52px / 56px, weight 500 (mobile 42px). Not a display size; authority comes from the serif and the space around it.
- Palette: deep navy canvas with an illustrated blob band; headings `#1b3156`, body black, muted `#7b8894`, links `#115ca1` (and `#66b3ff` on the dark variant).
- Prose carries the page: several paragraphs, inline underlined links, one small floated portrait.
- Footer includes a `copy as / view markdown` affordance, the raw-markdown surface for agents.
- Mobile: heading 42px, portrait shrinks but stays floated, nav wraps to two lines, measure drops to ~49ch.

## Pattern 2 - Articles list (datetime + title only)

Source: `morg-timeline` (morg.systems/78550a77), user capture `img/morg-ref.1.png`.

- White card 702px wide inside a grey canvas, 14px padding, 1px `#d4d4d5` border. The card is **69.8ch** wide at 14px.
- Card header: `Full Timeline` at 28px / 36px Merriweather weight 700 sitting on a 10% grey band, with a filter chip below it.
- Rows: no separators, no descriptions. Date in a **fixed 84px column** in Roboto Mono 14px, then the title at 14px Libre Franklin weight 700, underlined, coloured `#767676` (deliberately quiet, not a bright link blue).
- Density is the point: row stride 19px against a 20px line-height, 134 rows in one view. Purely scannable archive.
- Mobile: card fills the width, measure drops to ~36ch, date and title still share one line.

## Pattern 3 - Projects list (datetime, title, short description)

Source: `lucumr-index` (lucumr.pocoo.org/), user capture `img/armin-ref.2.png`.

- Container 800px. Each entry is a block: date first, then title and description on the same line.
- Date: 120px wide column, Merriweather 14px **italic**, colour `#aec3d6` (muted blue-grey).
- Title: Merriweather 17px, `#66b3ff`, underlined. Description follows immediately after an em dash in the same run of text, so title and summary read as one sentence.
- Vertically loose: 25px between entries, 112px row stride. Contrast with pattern 2 is deliberate: this list makes room, morg's does not.
- Mobile: the two-column structure survives; the date stays left and the title plus description wrap in the narrow column.

## Pattern 4 - Logs (brief linked text, newest first)

Source: `rasyidanaf-notes` (rasyidanaf.com/notes/), user capture `img/rasyidanaf-ref.1.png`.

- `main` 1000px with 96px side padding, so 808px of content; the entry column is 619px (**64.5ch**), main measure 84ch. Never full bleed.
- Body: JetBrains Mono 16px / 24px. `h1` `notes`: IBM Plex Mono 40px / 60px weight 700 (mobile 30.4px), underlined.
- Grouping: a **date group header** (`03 SEPT 2026`, uppercase mono) per day, then one or more entries under it, separated by hairline rules.
- Entry anatomy: meta line `16:35 UTC+7 NOTE` at ~12px weight 600 in muted `#404a59`; bold title; 2 to 3 line excerpt ending in an ellipsis; `[tags]` chips as literal bracketed text; right-aligned `read more ->`.
- The dark variant is the intended look: near-black canvas, off-white text, green accent on the active nav item in mobile.
- Mobile: nav collapses to `[menu]` / `[dark]`, and **the date column collapses into a full-width section header**; entries stack and read as a continuous feed. That collapse is the key responsive move for our Logs page.

## Gaps

Not yet referenced, decide or defer in the design grilling:

- **Post detail page** (the reading surface itself): measure is decided at 65ch, but not typeface, rhythm, heading scale, code/callout styling, or the footer.
- **Tag pages** (`/tags/<tag>`): no reference chosen.
- **Header and navigation**: referenced only as `[menu]`/`[dark]` collapse; the locked architecture says the nav is the recovery path on every page, so it needs its own pass.
- **404 page**, **search UI** (Pagefind opens in place), and **empty states** (a category with nothing published yet).

## Re-running the capture

```bash
node scripts/capture-references.mjs
```

Attaches to Chrome DevTools on `127.0.0.1:9222` and launches the cached Chrome for Testing if nothing is listening. Targets and viewports are declared at the top of the file.
