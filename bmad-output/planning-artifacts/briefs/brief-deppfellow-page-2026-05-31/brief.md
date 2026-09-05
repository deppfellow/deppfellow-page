---
title: "Product Brief: Depp's Personal Website"
status: draft
created: 2026-05-31
updated: 2026-06-21
---

# Product Brief: Depp's Personal Website

## Executive Summary

A personal journal built for one person who writes and wants to share that writing with the world. The author's experience — how it feels to write, edit, and publish — is the primary design constraint. Visitors get a fast, beautifully typeset reading experience as a consequence of that same obsession with craft.

This replaces a Django+HTMX/Alpine.js implementation that worked but made writing painful: monolithic HTML templates, messy state management, no component model. The new stack (Go backend, Astro frontend, SQLite) is chosen for one reason — it stays out of the way. Sub-100ms page loads, minimal JavaScript, dark-first editorial design with Cormorant serif. The differentiator is a threaded log: a chronological journal where entries chain together and cross-reference each other, creating a browsable timeline of thought.

## The Problem

The author has things to write and wants to share them. Current tools get in the way:

- **Writing feels like coding.** The previous Django implementation required navigating monolithic HTML templates and Alpine.js state management to publish a thought. The gap between "I want to write" and "I've published" was too wide.
- **Performance is an afterthought.** Most personal site frameworks ship megabytes of JavaScript for what should be a static page. The author and visitors both suffer.
- **Content disappears into feeds.** Blog posts scroll away. There's no sense of continuity — no way to browse a timeline of connected thoughts.

The cost: the author writes less. The journal stays empty.

## The Solution

A personal journaling site where the writing experience is the product. The author writes Markdown in a split-pane editor with renderer-backed on-demand preview. Content renders to beautifully typeset HTML with editorial typography — serif headlines, prose body, syntax-highlighted code blocks. Pages load in under 100ms because they're pre-rendered static HTML served by Caddy.

The threaded log is the heart of the site. Each log entry references the previous one, forming sequential chains. Inline `[[Log-42]]` cross-references create a web of connected thought. Readers can browse an infinite-scrolling timeline or follow chains of reasoning.

Three permanent categories organize content: Article (long-form), Project (work showcase), Log (the running journal). Custom categories can be added for specialized collections. Tags provide topic-level filtering.

## What Makes This Different

This is not a portfolio site with a blog bolted on. It's a journal that happens to be public.

- **Writing experience is the #1 priority.** Every technical decision serves the author's ability to write and publish quickly. The split-pane editor, the Markdown-first workflow, and the on-demand preview path all exist to reduce the friction between thinking and publishing without rendering on every keystroke.
- **Performance is a hard constraint, not a nice-to-have.** Sub-100ms target (200ms hard cap) and minimal-to-zero JavaScript bundle are non-negotiable. These aren't vanity metrics — they're the difference between "I'll check what they wrote" and "I'll check later." The Go+Astro+SQLite stack was chosen specifically because it can deliver this on a 2-core, 2GB VPS. Every feature decision must preserve these constraints.
- **The threaded log creates continuity.** Unlike traditional blog posts that exist in isolation, log entries form chains. Cross-references (`[[Log-42]]`) create a browsable knowledge graph. This is journaling as a thinking tool, not just publishing.
- **Dark-first editorial design.** Cormorant serif, ink/bone palette, grain texture. Not a generic theme — a deliberate aesthetic that treats reading as an experience.

## Who This Serves

**Primary: The Author (Deppfellow)**
A solo writer who journals publicly. Needs to go from thought to published post in seconds, not minutes. Writes in Markdown. Values craft over features. Wants a space that feels like theirs, not a template.

**Secondary: Readers/Visitors**
People who follow the author's writing. They want fast access to beautifully typeset content. They browse by category, filter by tags, and follow log chains. They don't care about the tech stack — they care about the reading experience.

## Success Criteria

1. **Writing friction is minimal.** The author can go from "I want to write" to published post in under 60 seconds (excluding writing time).
2. **Pages load in under 100ms (200ms hard cap).** Non-negotiable constraint. Both author and visitors experience instant page loads. Measured at the network level, not synthetic benchmarks. Minimal-to-zero JavaScript bundle — Preact islands only where interactivity is genuinely needed.
3. **The log creates browsable continuity.** Readers can follow chains of thought through cross-references and sequential entries.
4. **The design feels intentional.** Dark-first editorial typography with Cormorant serif creates a reading experience that's distinct from generic blog themes.
5. **The system is maintainable.** Solo author can manage the entire stack — Go API, Astro frontend, SQLite database, Docker deployment — without external dependencies or services.

## Scope

### In v1

- Markdown-to-HTML rendering with editorial typography (GFM, footnotes, syntax highlighting, math)
- Three permanent categories: Article, Project, Log
- Threaded log with sequential chains and `[[Log-42]]` cross-references
- Single-user auth for content creation
- Split-pane Markdown editor with renderer-backed on-demand preview
- Dark-first design with Cormorant serif, ink/bone palette, grain texture
- Sub-100ms page loads via SSG pre-rendering
- Client-side search (Pagefind or MiniSearch)
- Docker deployment on low-end VPS

### Explicitly Out

- Multi-user auth or registration
- Comments system (may revisit with giscus later)
- Real-time collaboration
- Full-text database search
- Mobile native app
- OAuth/social login
- Admin dashboard (the editor IS the admin)
- Internationalization

## Vision

If this succeeds, it becomes the author's primary writing home — the place where all thoughts, projects, and journal entries live. The threaded log grows into a substantial body of connected writing that readers can explore like a wiki.

In 2-3 years, the site could support:
- RSS feeds for syndication
- Rich tag-based discovery
- Log chain visualization (graph view of cross-references)
- Custom OG image generation for social sharing
- A public API for programmatic access to the author's corpus

The tech stack (Go+Astro+SQLite) is deliberately boring and maintainable. It should still be running in 5 years with minimal intervention.

---

*Draft: 2026-05-31*
*Updated: 2026-06-21 with renderer-backed on-demand preview decision*
*Created via: bmad-product-brief*
