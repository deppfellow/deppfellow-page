---
status: accepted
date: 2026-08-24
---

# Daily chained logs with explicit `previous`

Logs are one per day, filename `YYYY-MM-DD.md`, chained newest→previous by an explicit `previous` front-matter link to the latest earlier log, omitted entirely (not empty) on the first log. Dates could in principle derive the order, and the original template's `previous: ""` made a first log indistinguishable from a forgotten chain — the contradiction the Phase 1 review caught. Decision: keep the explicit chain; the empty-string form is forbidden. A log may also wikilink any earlier log for topical references; those are ordinary links, not chain links.

## Considered Options

- Derive order purely from dates — rejected: an explicit link makes a broken chain lint-detectable and survives renames/date typos; the site scrolls to a *referenced* log, which needs a real target, not an inferred one.

## Consequences

- Lint rule: exactly one log per date; `previous`, when present, must point to the latest earlier-dated log.
- The site renders logs as one infinite scroll with the `previous` chain defining the feed order.
