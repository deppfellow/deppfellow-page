---
status: accepted
date: 2026-09-10
---

# Visual design deferred to a dedicated design grilling

This grilling owns architecture and behavior only. Visual identity - the choice between the `huly` and `vividco` style references in `.docs/references/`, typography, fonts (Neue Montreal is a paid typeface; a substitute such as Inter or General Sans is the likely self-hosted answer), and the header/nav shape - is decided in a separate design grilling that follows this session.

## Consequences

- The design grilling starts from the locked architecture: zero-JS ordinary pages, header nav as global recovery path, per-language subtrees later.
- `.docs/references/DESIGN.huly.md` and `DESIGN.vividco.md` are references only until the design grilling promotes one into tokens and components.
