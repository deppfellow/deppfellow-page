# ADR-0014: Toolchain baseline - Astro 7 on the unified Markdown processor

## Status

Accepted (2026-09-13)

## Context

The site was scaffolded on Astro 5.13/5.18 against a then-current release. By the time the build was planned, Astro 7.3.2 was current. The gap was two majors, and the two majors moved something this project depends on.

Three v6/v7 changes land on this codebase:

1. **Astro 7 makes the Sätteri Markdown processor the default**, replacing the remark/rehype pipeline. The reading-page resolution pass (ADR-0005 / spec slice T5) is designed as a remark/rehype pass: wikilink resolution against the vault registry, `_assets/` image rewriting, footnotes, task lists, and KaTeX math. Sätteri changes the plugin API entirely.
2. **Astro 6 removed the legacy content collections API.** The project already uses the Content Layer API with a custom loader, so this change does not apply - but only by prior design, not by luck we can rely on elsewhere.
3. **Astro 7 defaults `compressHTML` to `'jsx'`**, stripping markup whitespace by JSX rules. On a typography-led design, whitespace between inline elements can be load-bearing.

The cost of migrating is time-sensitive in one direction: the expensive piece (the Markdown pass) was still unbuilt. Migrating before T1 is dispatched is a version bump; migrating after T5/T6 land means rewriting the resolution pass and re-verifying every surface.

## Decision

**Pin the toolchain to Astro 7.3.2, Tailwind CSS 4.3.3, and `@tailwindcss/vite` 4.3.3.**

**Pin `@astrojs/markdown-remark` and set `markdown.processor: unified()` explicitly**, keeping the remark/rehype plugin model that T5's resolution pass is designed against. Sätteri integration is deferred; the project takes the documented "stay on the unified pipeline" path.

**Adopt a rule for markup spacing: inter-element spacing is declared in classes, never inherited from source whitespace.** `compressHTML: 'jsx'` makes layout text-node-whitespace-dependent markup a latent bug. The codebase already uses explicit `flex ... gap-*`/`ml-*` spacing; the RuleBand label/count pair was changed from a bare inline `<span>` to `inline-flex items-baseline` to conform, since whitespace did not survive the switch.

## Considered and declined

- **Stay on Astro 5.** Rejected: two majors of drift compound, the project is maintained long-term, and v5 receives no feature work. The one hard part (the Markdown pass) was unbuilt, so this was the cheapest possible moment.
- **Adopt Sätteri now.** Rejected: it is the newer, faster processor, but it requires porting every remark/rehype plugin to a newer and less-documented plugin API for no functional gain here. `unified()` is a documented, supported path; Sätteri can be adopted later behind the same resolution-pass contract.
- **Upgrade to Astro 6 as an intermediate step.** Rejected: no benefit, since the v6 changes (legacy collections, Tailwind integration removal, `import.meta.env` coercion) do not apply to this codebase. Going straight to 7 avoids a second migration.
- **Rely on the default processor and adapt T5 to Sätteri.** Rejected: it makes an unbuilt, critical-path slice responsible for validating a new plugin API at the same time.

## Consequences

- **`unified()` becomes a load-bearing dependency.** `@astrojs/markdown-remark` must stay in step with Astro. If it diverges, the fallback is porting the pass to Sätteri - a known, bounded cost.
- **Markdown processing is not the v7 default**, so the config is intentionally non-default and carries a comment saying why. Removing `markdown.processor` silently switches processors and would break T5's plugin assumptions.
- **The whitespace rule is now enforced by review**, not by tooling. It catches a class of regression the Rust compiler does not.
- **Upgrade verification is empirical**: the frozen-build comparison showed Astro 5 and Astro 7 rendering identical output (0 differing pixels at 1440x900 and 390x844), computed geometry matching to two decimals, and byte-identical Tailwind CSS.
- **Version pins are declared once**, in `package.json`; the spec's "Repository Context" mirrors them rather than restating a policy.

## Verification evidence

- `astro@7.3.2`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `@astrojs/markdown-remark@7.3.1` installed; build passes in 2.57s.
- Custom Content Layer loader and `renderMarkdown` continue to work under Astro 7 - 19 fixture notes loaded and rendered, ABOUT body present in `dist/index.html`.
- Frozen Astro 5 vs Astro 7 builds, served on separate ports, captured with a deterministic tool: 0 differing pixels at both viewports; nav link width 81.52px and span offset 1021.84px identical; CSS byte-identical.
- The capture tool gained `Input.dispatchMouseEvent` cursor parking, because residual hover state otherwise made captures non-deterministic (the nav link showed iris hover in some runs).
