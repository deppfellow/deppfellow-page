# deppfellow-page

The public site that renders the public projection of the `deppfellow-wiki` vault: a read-only observatory-plate catalog of Articles, Projects, and Logs, built once at push time and served at the domain root.

## Language

**Rule band**:
The site's global navigation header - a `1px` hairline-bounded band carrying the site name at the left and, at the right, the three category links (with tabular counts), the theme toggle, and where provided the Search control. Below the small breakpoint it collapses to the site name plus a Menu trigger that opens those controls in a panel. It is never a floating or shadowed header.
_Avoid_: header, nav bar, toolbar, hamburger

**Plate**:
A single dated entry in a list, rendered as a ruled row spanning the full container width: a tabular date, a title, and optionally a short description.
_Avoid_: card, row (as a noun), entry

**Plate stack**:
The home page's signature composition: a bordered stack of the latest ten Articles with two hairline paper edges stepping below it, the observer's note resting on top.
_Avoid_: feed, timeline, list of posts

**Observer's note**:
The opening paragraph on the home page, rendered from `ABOUT.md` at the vault root at a `65ch` measure.
_Avoid_: about blurb, intro text, tagline

**Scales**:
The condensed-cap typographic voice (`Archivo Narrow`, `0.09em` tracking, tabular numerals) used for dates, counts, legend items, category links and section headings - never for prose.
_Avoid_: the small caps, the technical font, the label font

**Article description**:
The one or two sentence summary carried in an article's front matter under `description`. It appears on index and tag listings, never as an editorial preview.
_Avoid_: excerpt, lede, origin

**Reading page**:
The full article view: title and metadata, the rendered markdown at `65ch`, and a quiet paper-edge close. The h1 is the title and is never named again.
_Avoid_: article detail, post page

**Light table**:
The site's light world: the plate held against cold light - a cold paper ground with cold ink, the same two typographic voices and the same rules as the dark world, never warm and never cream. Chosen per visitor by the theme toggle; a visitor without a stored choice follows the system preference.
_Avoid_: light mode, day theme, white mode

**Theme toggle**:
The band's sun/moon control. It always names its destination: a sun while dark, a moon while light.
_Avoid_: dark mode switch, colour scheme picker

**Floating action button (FAB)**:
The reading-page index control. Collapsed as a small square at the bottom right by default; clicking expands it into an in-page heading list covering `h2` and `h3` only. The `h1` (the title) is excluded.
_Avoid_: table of contents, contents pane, TOC

**Recency mark**:
The single `6px` ember square beside the newest entry's date, taught once by a legend in the section heading row.
_Avoid_: the orange dot, the new badge
