---
td: td-0f037e
type: feature
priority: P1
ownership: agent-owned
blocked-by: None
spec: .docs/specs/deppfellow-light-table/SPEC.md §Ticket Decomposition slice T1
---

# T1: Light-world token foundation and pre-paint theme resolution

Delivered behavior: the site renders in either world from one token set, with the world resolved before first paint on every page.

## Objective

When this ticket closes, `<html>` carries `data-theme="light"` exactly when the light world is resolved, every surface (band, lists, search modal, KaTeX, code frames, FAB, 404) reads the same custom-property slots in both worlds, and a runnable contrast check guards the shipped palette. No visible control exists yet - the world is reachable only by storage/media query/attribute, which is what makes T2's toggle a thin client.

## Interface Contract

- Both worlds are declared in `src/styles/global.css` on the same custom-property slots. The light world applies iff `<html data-theme="light">`; attribute absent renders the dark world with computed values identical to today's. Light values are D-05's as amended by D-15: plate `#f3f5f9`, plate-edge `#e8ecf2`, rule `#7f8ca1`, rule-strong `#748096`, bone `#0c1220`, star `#4d6087`, iris `#3a6bce`, ember `#e0612e`.
- `color-scheme` is `dark` with the attribute absent and `light` under the attribute.
- `::selection`: dark world unchanged (iris 55% mix over plate, white text); light world iris-mix over ink text.
- `--pf-mark` becomes a world-dependent token (white in the dark world, the ink slot in the light world); every other `--pf-*` mapping keeps pointing at token slots so Pagefind follows the world automatically.
- `src/layouts/Base.astro` `<head>` carries an inline pre-paint script on every page: world = `localStorage["deppfellow-theme"]` (`"light"` | `"dark"`), else `matchMedia("(prefers-color-scheme: light)")`; sets `data-theme="light"` iff light, removes the attribute otherwise; a garbage stored value is treated as absent. The same script always sets `data-enhanced` on `<html>` - the script-capable marker T3's no-JS gate keys on.
- With no stored choice, a `matchMedia` listener follows live OS changes; a stored choice suppresses the listener.
- Switching worlds applies no transition or animation to any element (One-Step Rule; REQ-06).
- No visible control is added anywhere on any page.
- `scripts/contrast-check.mjs` (node, no new dependencies): computes WCAG contrast for the shipped role pairs from the values in `global.css` - prose/ground (bone/plate) and metadata/ground (star/plate) at 4.5:1, interaction/ground (iris/plate) and mark/ground (ember/plate) at 3:1, in BOTH worlds as hard floors; the light-world hairline pairs rule/plate and rule-strong/plate at 3:1 as hard floors (D-15), with the dark-world hairline pairs printed informationally only (dark is frozen byte-identical). Prints each pair with its ratio, exits nonzero naming the failing pairs when a hard floor is missed. A value that must change is escalated to the orchestrator for a log amendment - never applied silently.

## Examples

- `localStorage["deppfellow-theme"] = "light"` on a dark-OS machine: every page paints light on first paint, `html[data-theme="light"]` present in the served HTML's DOM before styles apply.
- Stored `"dark"`, OS light: dark page, attribute absent.
- Stored `"banana"`: treated as absent - system default.
- OS flips light to dark live with no stored key: page follows without reload.
- Error: contrast-check run against a scratch copy with `star` lightened to `#7d94bd` exits nonzero and names `star/plate 4.5:1` as failing.

## Setup

- `npm ci` from the committed lock.
- Content-honest build: `rm -rf node_modules/.astro` first, then `WIKI_PATH=fixtures/vault npm run build`.
- For live drives: `npm run preview -- --port 4321 &` with Chrome at `CHROME_PATH` (see verification skill command map).

## Gate

```sh
npm run lint && npm run format:check && rm -rf node_modules/.astro && WIKI_PATH=fixtures/vault timeout 300 npm run build && node scripts/contrast-check.mjs && grep -c 'deppfellow-theme' dist/index.html
```

Build exits 0 with the fixture contract lines; contrast-check exits 0; the grep finds the pre-paint script key in built HTML.

Verification skill: `.pi/skills/verify-deppfellow-page/SKILL.md` - command-map rows "Ticket Gate build" and "Visual capture"; feature-map rows "Toolchain and CI", "Home page".

## Acceptance Criteria

- L-AC-01 — Built HTML of home, one category index, one reading page, and 404 each contain the inline theme-resolution script in `<head>` (SPEC-AC-01; REQ-05).
- L-AC-02 — Live drive: setting `data-theme="light"` on `<html>` flips every surveyed surface to the D-05 values as amended by D-15, with `color-scheme: light`; removing it restores dark computed values identical to pre-T1 (SPEC-AC-03; REQ-01, REQ-02).
- L-AC-03 — Resolution order proven in a live drive: stored value beats media query; garbage stored value falls back to system; with no stored key a live OS flip is followed without reload (SPEC-AC-01; REQ-04).
- L-AC-04 — Light-world selection is iris-mix with ink text, and built CSS resolves `--pf-mark` per world (white in dark, ink in light) (REQ-02).
- L-AC-05 — `scripts/contrast-check.mjs` exits 0 on shipped values, and exits nonzero naming the failing pair on a deliberately degraded scratch copy (REQ-03).
- L-AC-06 — No `<style>`/attribute introduces a transition or animation tied to world switching (REQ-06).

## Specification Coverage

REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06. Every REQ listed here appears in the Spec's coverage table mapped to T1, and every REQ mapped to T1 appears here.

## Preserved Invariants

- Fixture build contract: 21 notes loaded (22 found, 1 skipped with the exact warning), 49 HTML pages, manifest gate green.
- Dark world (attribute absent) is presentationally byte-identical to pre-T1: no token value, selection, scrollbar, or caret change.
- Reading pages keep the FAB as their only body script; the head theme script rides along everywhere per the D-09 whitelist extension. The verification skill's script-count feature-map rows are amended by `maintain-verification-skill`, never by this ticket.
- Pagefind modal and logs searchbox behavior unchanged; only their colors follow the world.

## Out of Scope

- The visible toggle control (T2) and the Menu panel (T3).
- `DESIGN.md`, ADR-0015, and `.impeccable/design.json` (T4 / never).
- Any Pagefind behavior change beyond colors following tokens.
- Re-deriving or adjusting any dark-world value.
