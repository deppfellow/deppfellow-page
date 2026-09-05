---
status: accepted
date: 2026-08-24
---

# Three-repo topology; the site never sees private content

Phase 2 needs a home for the site's frontend and build logic, separate from the vault. Decision: three repositories. `deppfellow-page` (public) holds the site code, the GitHub Actions build, and Pages hosting; `deppfellow-wiki` (public) holds the public layer exactly as committed today; a nested private repo inside the vault holds `Private/` and `.docs/` (ADR-0003, unchanged). The site build clones only the *public* wiki repo — private content is physically absent from the build environment.

## Considered Options

- Two repos — whole vault private, site build reads it via a stored token — rejected: the entire vault (drafts included) would sit inside the build machine, and a build-code bug could silently leak `Private/Personal/`; leaking under the chosen topology requires committing to the public repo, a deliberate and visible act. It would also rewrite the Phase 1 semantics of "public layer" (from *committed to GitHub* to *registry-listed*) and remove the public-wiki-on-GitHub browsing surface.

## Consequences

- Repo URLs and remotes are set at creation; changing topology later is real migration work.
- The site build needs no secrets — no PAT, no private clone.
- Frontend implementation decisions are recorded in `deppfellow-page`'s own `.docs/`; the wiki's ADRs remain the constitution.
