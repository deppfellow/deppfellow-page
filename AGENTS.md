# Deppfellow Page

Site-facing repository for the personal site, rendering articles from the wiki-facing repository.
The project local wiki is in `/mnt/c/Users/%USERPROFILE%/Documents/vaults/deppfellow-wiki`.

## Checks (CI-enforced)

`.github/workflows/ci.yml` runs the full suite on every push and every PR, and the same checks are required before any work is called done. Run the suite locally before opening a PR:

```sh
npm run format        # rewrites files; always run this before the read-only check
npm run format:check
npm run lint
npm run check
npx tsc --noEmit -p tsconfig.json
WIKI_PATH=fixtures/vault npm run build
```

- `WIKI_PATH` points the build at a vault. The committed `.envrc` defaults it to `fixtures/vault` via direnv, but non-interactive shells may not load `.envrc`, so pass it explicitly.
- `npm run format` mutates files. `format:check` is the read-only gate CI enforces.

## Verification

Every ticket verification drives `.pi/skills/verify-deppfellow-page`. That skill owns the feature map and the gate definitions. Map drift is a maintainer's job, never a ticket's.

## Contract numbers

- A fixture build loads 21 notes (22 found, 1 skipped by design). CI asserts the count and the exact skip warning; changing either needs a contract reason in the ticket.
- There is no unit suite yet. Tests are T1-owned.
