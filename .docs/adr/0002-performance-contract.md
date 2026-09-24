---
status: accepted
date: 2026-09-10
---

# Performance contract: client-side budget, CDN TTFB accepted

The stated goal "average 100ms, max 250ms" is not measurable as a full cold navigation: DNS, TCP, and TLS handshakes plus CDN time-to-first-byte alone exceed 250ms on any host, and no static host can change that physics. The honest contract:

- **Client-side budget**: once HTML arrives, the page is fully rendered within ~100ms, enforced by shipping zero JavaScript on ordinary pages. This is the lever the project actually controls.
- **Minor, scoped JavaScript** (narrowing, spec deppfellow-shipping D-16): ordinary pages stay script-free; a page-loading script is acceptable only on dedicated script-scoped enhancement surfaces (/search, /import) and only when small and scoped. No framework runtime ever ships; the constraint is "not bloated", not "zero" (supersedes the absolute reading of the budget line above).
- **Server side**: accepted at CDN speed (GitHub Pages / Fastly, ~100-250ms TTFB), not part of the budget.
- **Tracked field metric**: Largest Contentful Paint at the 75th percentile on mobile, as the user-facing guardrail.

## Consequences

- Every island or script added later must justify itself against the ~100ms client budget.
- Warm revisits land near the original 100/250ms numbers; cold navigations will not, by physics, and that is accepted.
