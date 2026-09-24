---
td: td-99e20f
type: feature
priority: P2
ownership: agent-owned
blocked-by: T6
spec: .docs/specs/deppfellow-shipping/SPEC.md §Ticket Decomposition slice T7
---

# T7: Add the reading-page FAB heading index

Delivered behavior: The reading page carries a disclosure FAB, collapsed bottom-right, expanding to an h2/h3 index with keyboard support and no FAB when there are no headings.

## Objective

Long notes need in-page navigation without a permanent sidebar. The FAB is the one permitted script on a reading page; it must behave as a proper disclosure widget.

## Interface Contract

Component: `src/components/HeadingIndex.astro` (new), used by the T6 reading page.

- Rendered only when the note has at least one `h2` or `h3`. No headings → no FAB in the DOM.
- Collapsed by default, fixed bottom-right; the trigger is a button exposing `aria-expanded` and `aria-controls`.
- Expanded shows a list of the note's `h2` and `h3` entries in document order; `h1` is never listed; each is an anchor to the heading's `id`.
- `h3` entries are visually nested under their parent `h2`.
- Keyboard: Enter/Space toggles; Escape closes and returns focus to the trigger; Tab order is natural.
- Anchored heading scroll accounts for the sticky offset so the heading is not hidden under the rule band.
- Headings receive stable `id`s (slugger config named in the component or pipeline).
- Script is scoped to this component only; no global runtime.

## Examples

| Note                      | FAB                                           |
| ------------------------- | --------------------------------------------- |
| three h2, two h3          | renders; expanding lists 5 entries, h3 nested |
| one h2                    | renders; expanding lists 1 entry              |
| only body paragraphs      | no FAB element present                        |
| Escape pressed while open | closes, focus on trigger                      |

## Setup

- A fixture note with at least three `h2` and two `h3`; `WIKI_PATH=fixtures/vault npm run build`.

## Gate

```sh
WIKI_PATH=fixtures/vault npm run build && grep -q 'aria-expanded' dist/articles/memory-layers-for-long-horizon-agents/index.html
```

## Acceptance Criteria

- L-AC-01 — A fixture with headings produces a FAB element with `aria-expanded="false"` initially; a fixture without headings produces no FAB element. (REQ-12, REQ-13)
- L-AC-02 — The expanded list contains exactly the note's h2/h3 headings in document order and never the h1 title. (REQ-12)
- L-AC-03 — Each FAB entry's `href` matches an existing element `id` in the page. (REQ-12)
- L-AC-04 — The FAB script is present only on reading pages (whitelist script-count check). (REQ-12)

## Specification Coverage

REQ-12, REQ-13.

## Preserved Invariants

- Home and list pages remain script-free.
- Reading-page body rendering unchanged.

## Out of Scope

- Scroll-spy or active-section highlighting.
- A persistent sidebar variant.
