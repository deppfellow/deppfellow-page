# Story 2.1: Command Palette UI (Alpine.js Modal)

**Status:** Backlog -> In Progress

## Tasks
- [ ] Create UI Modal Partial using Alpine.js (`templates/partials/search/_modal.html`)
- [ ] Implement `Cmd+K` / `Ctrl+K` keyboard shortcut logic
- [ ] Implement `Esc` close logic
- [ ] Implement History API integration (pushState/popstate)
- [ ] Add Search button to header (`templates/partials/_header.html`)
- [ ] Style the modal (`static/css/search.css`)
- [ ] Verify implementation with E2E tests

## Technical Details
- **Trigger:** `window` keydown listener managed by Alpine.js.
- **State:** `isOpen` boolean in Alpine component.
- **Transitions:** Alpine `x-transition` for smooth fade/scale.
- **History:** `window.history.pushState({modal: 'search'}, '')` on open.

## UX Considerations
- Backdrop blur for focus.
- Autofocus on the search input.
- Click outside to close.
