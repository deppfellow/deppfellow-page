---
status: accepted
date: 2026-09-10
---

# Content source and publish trigger

**Content source.** The build clones the public wiki repo at HEAD (`--depth 1`) - what readers see always matches the latest pushed commit, with no pin to bump and no staleness. Local development reads the actual vault through the `WIKI_PATH` environment variable; same content-loader code, different source path. Default is `../deppfellow-wiki` relative to the site repo; if unset and missing, the build fails immediately with a one-line instruction, never a silent empty site. The publication boundary (registry-listed categories only) is enforced identically in CI and local dev, so local preview shows exactly what would ship.

## Considered Options

- Git submodule pinning the wiki commit - rejected: every wiki push needs a second site-repo commit, and forgetting it stalls publishing silently.
- npm/Git dependency - rejected: same staleness problem with more machinery.

**Publish trigger.** The wiki repo carries a small workflow that fires a `repository_dispatch` at the site repo on every push; the site workflow clones, builds, and deploys to GitHub Pages. Pushes to the site repo trigger the workflow directly. Broken builds never blank the live site - Pages keeps serving the last good deploy. No secrets: the wiki is public, so the clone takes no token.

## Considered Options

- Scheduled rebuild (e.g. every 15 minutes, skip if HEAD unchanged) - rejected: minutes of publish lag and wasted runs.
- Manual "Run workflow" button - rejected: a hand at a button for every publish.

## Consequences

- Publish lag is seconds; the dispatch workflow is ~10 lines and fails loudly.
- Dev preview shows the site renderer's output, not Obsidian's live preview (accepted standing divergence).
