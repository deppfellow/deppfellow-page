---
status: accepted
date: 2026-09-10
---

# Languages deferred; subtree design recorded for later enablement

The MVP renders English only. Language-suffixed vault files (`agentic-memory.id.md`, `agentic-memory.ja.md`) are ignored by the build: no language UI, no language URLs, no fallback machinery for content that does not exist yet. The site's language codes are ISO (`en`, `id`, `ja`); `jp` was rejected because it is not a valid language code and would ship a wrong `lang` attribute site-wide.

The enablement design, agreed in this grilling and recorded so a later session starts from this map instead of re-grilling:

- One URL subtree per language: English unprefixed (`/articles/<slug>`), others prefixed (`/ja/articles/<slug>`), matching Astro's built-in i18n routing.
- Global language selector in the header: writes the choice to `localStorage` and navigates to the same page in the chosen subtree. Only the root `/` carries a tiny redirect script honoring the saved choice, then browser language, so ordinary pages stay zero-JS.
- Per-article language chips are plain links to sibling translations; links never write storage, so they cannot override the global state.
- A chip for a missing language is a same-page anchor revealing an inline "No translation yet" notice rendered at build time: no request, no JavaScript.
- Listings always show every post; a missing translation renders the canonical body with a "not yet translated" hint inside the browsed language's chrome.
- Each translation file carries its own complete front-matter (own title, own `created`, shared tags); the build groups siblings by basename.
- Adding a locale is additive: enable the locale, generate its subtree, add the switcher.

## Consequences

- Nothing user-visible is lost today; the vault has no translated content yet.
- The dev/build publication boundary applies unchanged: suffixed files under registry-listed categories are public vault content, just not site-rendered yet.
