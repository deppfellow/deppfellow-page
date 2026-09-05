---
title: "PRD: Depp's Personal Website"
status: final
created: 2026-05-31
updated: 2026-06-21
---

# PRD: Depp's Personal Website
*Working title — confirm.*

## 0. Document Purpose

This PRD defines the requirements for a personal journaling website built for a solo author who writes and shares publicly. It's structured with a Glossary anchoring domain vocabulary, Features grouping functional requirements with stable IDs, and Non-Goals preventing scope creep. Assumptions are tagged inline with `[ASSUMPTION: ...]` and indexed at the end.

This PRD builds on the product brief at `.docs/bmad-output/planning-artifacts/briefs/brief-deppfellow-page-2026-05-31/brief.md` and research docs at `.planning/research/`. No UI/UX design exists yet — the interface will be simple and improved iteratively.

## 1. Vision

A personal journal where writing is the product. The author writes Markdown in a split-pane editor, requests a rendered preview when needed, verifies that preview against the exact published output path, and publishes in one click. Math formulas render correctly via KaTeX. Code blocks render with syntax highlighting via Pygments. Pages load in under 100ms because they're pre-rendered static HTML.

The threaded log is the heart of the site — a chronological journal where entries chain together and cross-reference each other, creating a browsable timeline of thought. Readers can follow chains of reasoning or browse by category and tags.

This replaces a Django+HTMX/Alpine.js implementation that worked but made writing painful. The new stack (FastAPI, Astro, SQLite) is chosen for one reason — it stays out of the way.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** I want to write and publish a journal entry quickly, without friction between thinking and publishing.
- **Functional:** I want math formulas and code blocks to render correctly in my published writing.
- **Functional:** I want readers to browse my journal chronologically and follow chains of thought.
- **Emotional:** I want my writing space to feel like mine — dark, editorial, intentional.
- **Contextual:** I want the site to load fast for both me and visitors, even on a cheap VPS.

### 2.2 Non-Users (v1)

- Multi-user teams or collaborators
- Commenters or community members
- Mobile native app users
- Users who need WYSIWYG editing

### 2.3 Key User Journeys

- **UJ-1. Deppfellow writes and publishes a journal entry.**
  The author opens the editor, writes Markdown with math formulas and code blocks, requests a preview through the preview button or keyboard shortcut, verifies that the rendered preview matches the published output exactly, and publishes. The entry appears in the threaded log with a link to the previous entry.

- **UJ-2. A reader browses the journal timeline.**
  A visitor arrives at the site, sees recent entries on the index page, and scrolls through the infinite-scrolling log timeline. They click a cross-reference `[[Log-42]]` and follow the chain of thought.

- **UJ-3. A reader discovers content by category or tag.**
  A visitor clicks "Article" in the header, sees all articles listed with dates and excerpts, clicks one, and reads it with editorial typography. They click a tag at the bottom and see all posts with that tag.

## 3. Glossary

- **Post** — A single content unit (article, project, or log entry). Has title, slug, body (Markdown), html (rendered), excerpt, category, tags, and draft/published status.
- **Log Entry** — A Post in the Log category. Each references the previous entry via `previous_id`, forming sequential chains.
- **Category** — Top-level content classification. Three permanent: Article, Project, Log. Custom categories can be added.
- **Tag** — Topic-level taxonomy. Many-to-many relationship with Posts. Used for filtering.
- **ContentRenderer** — FastAPI-owned Python pipeline that converts Markdown to HTML using markdown-it-py, mdit-py-plugins, Pygments highlighting, math wrapping, and log cross-reference handling.
- **Threaded Log** — The chronological timeline of Log entries, browsable via infinite scroll, with sequential chains and cross-references.
- **Split-Pane Editor** — In-browser Markdown editor with an on-demand rendered preview. Left pane: Markdown source. Right pane: rendered HTML preview matching published output after the author requests preview.
- **Preact Island** — Interactive component hydrated on the client. Used only where interactivity is needed (editor, log feed, search). Minimal JS footprint.
- **SSG (Static Site Generation)** — Pages pre-rendered at build time by fetching the FastAPI API. Zero JS shipped for content pages.

## 4. Features

### 4.1 Writing Experience (Editor)

**Description:** The author's primary interface for creating and editing content. A split-pane Markdown editor with renderer-backed on-demand preview. The preview must match the published output exactly — same ContentRenderer, same typography, same math and code rendering — and must not auto-run while the author types. This is the most-used feature and the #1 priority. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: Split-Pane Markdown Editor

The author can write Markdown in a split-pane editor with a rendered preview panel. The editor is accessible at `/admin/editor` (new post) and `/admin/editor/:slug` (edit post). Preview is requested on demand through a preview button or keyboard shortcut. Realizes UJ-1.

**Consequences (testable):**
- Editor loads with a two-pane layout: Markdown source on the left, rendered preview on the right.
- Preview updates only when the author clicks the preview button or uses the preview keyboard shortcut.
- Preview does not auto-run while the author types.
- Preview rendering uses the same ContentRenderer as published pages — identical output.
- Editor supports standard Markdown shortcuts (bold, italic, heading, link, code block).

**Out of Scope:**
- WYSIWYG editing — Markdown is the writing format.
- Rich text toolbar — keyboard shortcuts and Markdown syntax are sufficient.

#### FR-2: Math Formula Rendering

Math expressions in Markdown render correctly in both the editor preview and published pages. Inline math `$E=mc^2$` renders inline. Block math `$$E=mc^2$$` renders as a display block. Realizes UJ-1.

**Consequences (testable):**
- ContentRenderer wraps inline math in `<span class="math">` and block math in `<div class="math-block">`.
- KaTeX CSS/JS loads only on pages containing math content (conditional loading).
- Math renders correctly in the editor preview and published pages.
- KaTeX CDN tags include SRI integrity hashes.

#### FR-3: Code Block Rendering

Code blocks render with syntax highlighting in a dark theme matching the site palette. Language labels display above code blocks when specified. Realizes UJ-1.

**Consequences (testable):**
- ContentRenderer uses Pygments with a dark syntax-highlighting theme matching the site palette.
- Code blocks display language labels via CSS `::before` on `[data-language]`.
- Code blocks render correctly in the editor preview and published pages.
- Language detection works for common languages (TypeScript, Python, Markdown, shell, etc.).

#### FR-4: Draft and Publish Workflow

The author can save a post as draft (hidden from public) or publish it. Draft posts are visible only to the authenticated author. Realizes UJ-1.

**Consequences (testable):**
- Editor has "Save Draft" and "Publish" buttons.
- Draft posts are not returned by public API endpoints (`is_draft = 0` filter).
- Draft posts are visible to the authenticated author in the editor.
- Author can change a post's status from draft to published and vice versa.

### 4.2 Content Display

**Description:** The reading experience for visitors. Posts render with editorial typography — serif headlines, prose body, syntax-highlighted code blocks, math formulas. Pages load in under 100ms via SSG pre-rendering. Realizes UJ-2, UJ-3.

**Functional Requirements:**

#### FR-5: Editorial Typography

Posts render with editorial typography: Cormorant serif headlines, prose body constrained to a stable reading measure, drop caps, blockquotes with accent borders, underlined links, inline code styling, and predictable vertical rhythm. Realizes UJ-2.

**Consequences (testable):**
- ProseWrapper component renders HTML with `.prose` class and Tailwind Typography overrides.
- Article body content always uses `max-w-prose` or an equivalent `max-width: 65ch` reading measure.
- Paragraphs, headings, lists, figures, captions, and article metadata use `lh`-based spacing where text rhythm is the sizing driver.
- Drop cap appears on first paragraph via CSS `.prose > p:first-of-type::first-letter`.
- Blockquotes have 2px left accent border and italic styling.
- Links are underlined in bone color, with accent red on hover.

#### FR-6: SSG Page Generation

All content pages (post detail, category index, tag pages) are pre-rendered at build time. Pages load in under 100ms with zero JavaScript shipped. Validates SM-1.

**Consequences (testable):**
- Post detail pages use `export const prerender = true` with `getStaticPaths`.
- Category index pages fetch posts from the FastAPI API at build time.
- Tag pages fetch filtered posts from the FastAPI API at build time.
- Static pages are served by Caddy with no backend contact at runtime.

### 4.3 Threaded Log

**Description:** The differentiator. Log entries form sequential chains via `previous_id`. Inline `[[Log-N]]` cross-references create a web of connected thought. The log supports infinite scroll via a Preact island. Realizes UJ-2.

**Functional Requirements:**

#### FR-7: Sequential Chain Model

Each Log entry references the previous entry via `previous_id`, forming a sequential chain. Entries display chain context (links to previous/next). Realizes UJ-2.

**Consequences (testable):**
- Log entries have a `previous_id` foreign key referencing another Log entry.
- Log detail pages display links to previous and next entries in the chain.
- The first entry in a chain has `previous_id = NULL`.

#### FR-8: Cross-References

Inline `[[Log-N]]` cross-references in Markdown render as clickable links with formatted display text. Realizes UJ-2.

**Consequences (testable):**
- ContentRenderer parses `[[Log-N]]` syntax and renders as `<a href="/log/slug">Log-N</a>`.
- Cross-references link to the correct log entry by ID.
- Display text shows the log entry number (e.g., "Log-42").

#### FR-9: Infinite Scroll

The Log timeline supports infinite scroll via a Preact island using Intersection Observer. Realizes UJ-2.

**Consequences (testable):**
- LogFeed Preact island loads initial entries and appends more on scroll.
- Loading indicator shows while fetching more entries.
- Intersection Observer triggers fetch when the user scrolls near the bottom.

### 4.4 Content Organization

**Description:** Three permanent categories (Article, Project, Log) in header navigation. Custom categories visible on index page. Tags for topic-level filtering. 404 page for invalid URLs. Realizes UJ-3.

**Functional Requirements:**

#### FR-10: Category Navigation

Header navigation displays three permanent categories: Article, Project, Log. Each links to a category index page. Realizes UJ-3.

**Consequences (testable):**
- Header renders category links fetched from the FastAPI API at build time.
- Category index pages list all posts in that category.
- Custom categories (non-permanent) appear on the index page alongside permanent ones.

#### FR-11: Tag Filtering

Posts can have multiple tags. Readers can filter content by tag via `/tags/:slug` pages. Tag slug normalization ensures consistent matching. Realizes UJ-3.

**Consequences (testable):**
- Tags are stored in a many-to-many relationship with posts.
- Tag index page (`/tags`) lists all available tags.
- Tag pages (`/tags/:slug`) show posts filtered by that tag.
- Tag slugs are normalized (lowercase, trimmed) before storage and lookup.

#### FR-12: 404 Page

Invalid URLs display a 404 page with "Page not found" and a link back to the home page.

**Consequences (testable):**
- Visiting a non-existent URL shows the 404 page.
- 404 page contains a "Back to home" link.

### 4.5 Authentication

**Description:** Single-user password-based auth for content creation. HTTP-only cookie sessions. Auth middleware protects admin routes. No multi-user support.

**Functional Requirements:**

#### FR-13: Single-User Authentication

The author can log in with a password and access the editor. Sessions are stored in HTTP-only cookies. Realizes UJ-1.

**Consequences (testable):**
- Login page accepts a password and sets an HTTP-only session cookie.
- Auth middleware redirects unauthenticated users from `/admin/*` routes.
- Session cookie has `HttpOnly`, `Secure` (in production), and `SameSite=Strict` flags.
- Only one user exists — no registration or user management.

### 4.6 Image Upload

**Description:** The author can upload images via drag-and-drop in the editor. Images are converted to WebP format (max 10MB), enriched with dimensions and optional CSS-only LQIP metadata, and inserted as Markdown image syntax.

**Functional Requirements:**

#### FR-14: Image Upload with WebP Conversion

The author can upload images via drag-and-drop in the editor. Images are converted to WebP format, stored in the `media/` directory, enriched with display dimensions and optional CSS-only LQIP metadata, and inserted as Markdown image syntax. Realizes UJ-1.

**Consequences (testable):**
- Drag-and-drop in the editor triggers image upload to the FastAPI API.
- Images are converted to WebP format before storage.
- Image metadata includes width and height so public pages reserve layout space before image decode.
- CSS-only LQIP is the approved placeholder strategy when placeholders are implemented: no BlurHash/canvas runtime and no request-time placeholder generation.
- Placeholder rendering must degrade to a solid dominant/neutral color if advanced CSS support is unavailable.
- Maximum upload size is 10MB.
- Uploaded images are accessible via `/media/:filename`.
- Markdown image syntax is inserted at the cursor position in the editor.

### 4.7 Search

**Description:** Client-side search against a build-time index. Readers can search content without server-side queries.

**Functional Requirements:**

#### FR-15: Client-Side Search

Readers can search content via MiniSearch on the client. The search index is built at build time.

**Consequences (testable):**
- Search index is generated during `astro build`.
- Search results appear as the user types (fuzzy matching).
- Search is accessible via a search icon in the header or a dedicated `/search` page.

## 5. Non-Goals (Explicit)

- **Multi-user auth or registration** — Solo author site. No multi-user scenario exists.
- **Comments system** — Adds moderation burden, spam risk, performance cost. May add giscus later.
- **Real-time collaboration** — Single author, no concurrent editing.
- **Full-text database search** — Client-side search indexes static HTML at build time.
- **WYSIWYG rich text editor** — Markdown is the preferred writing format.
- **Headless CMS integration** — The backend API is the content service.
- **Admin dashboard** — The split-pane editor IS the admin.
- **OAuth / social login** — Single-user auth is sufficient.
- **Mobile native app** — Web-first responsive design covers all devices.
- **External database (Postgres)** — SQLite handles single-author patterns on low-end VPS.
- **Notification system** — RSS is the notification system for readers.
- **Internationalization** — Single-language (English) site.
- **Client-side SPA routing** — SSG + View Transitions provides SPA feel with MPA simplicity.
- **Rich UI/UX design in v1** — Simple interface first, improved iteratively later.

## 6. MVP Scope

### 6.1 In Scope

- Split-pane Markdown editor with renderer-backed on-demand preview
- Math formula rendering (KaTeX, conditional loading)
- Code block rendering (Pygments, dark theme matching the site palette)
- Draft/publish workflow
- Threaded log with sequential chains and cross-references
- Infinite scroll for log timeline
- Three permanent categories (Article, Project, Log) in header
- Custom categories visible on index
- Tag filtering with many-to-many model
- Single-user auth with HTTP-only cookie sessions
- Image upload with WebP conversion, dimensions, and optional CSS-only LQIP metadata
- Dark-first editorial design (Cormorant serif, ink/bone palette)
- Article reading layout with `max-w-prose` / `65ch` measure and `lh`-based vertical rhythm
- SSG page generation (sub-100ms target, 200ms hard cap)
- Minimal JavaScript (Preact islands only for editor, log feed, search)
- 404 page
- Docker deployment on low-end VPS

### 6.2 Out of Scope for MVP

- **RSS feeds** — Deferred to v2. Readers can bookmark for now.
- **SEO meta tags / OG images** — Deferred to v2. Not critical for personal journal.
- **View transitions** — Deferred to v2. SPA-like navigation not essential for MVP.
- **Grain texture overlay** — Deferred to v2. Aesthetic polish, not functional.
- **Sitemap generation** — Deferred to v2. Manual submission to search engines works.
- **Log entry editing/deletion** — Deferred to v2. Author can edit via editor.
- **Log chain reordering** — Deferred to v2. Sequential order is sufficient.
- **Search filters by category/tag** — Deferred to v2. Basic search is sufficient.
- **Search result highlighting** — Deferred to v2.

## 7. Success Metrics

**Primary:**
- **SM-1**: Page load time — median < 100ms, p99 < 200ms. Validates FR-6.
- **SM-2**: Writing friction — author can go from "I want to write" to published post in < 60 seconds (excluding writing time). Validates FR-1, FR-4.
- **SM-3**: Math rendering correctness — all math formulas in test content render correctly. Validates FR-2.
- **SM-4**: Code block rendering correctness — all code blocks render with correct syntax highlighting. Validates FR-3.

**Counter-metrics (do not optimize):**
- **SM-C1**: JavaScript bundle size — must stay under 15KB per page average. Do not optimize for feature count at the expense of bundle size.
- **SM-C2**: Editor complexity — do not add editor features that increase complexity beyond Markdown + preview. The editor is a writing tool, not an IDE.

## 8. Open Questions

1. **Pagination:** Show all posts or paginate? User previously rejected pagination for MVP, but this may need revisiting if post count grows significantly.
2. **Editor preview trigger:** Resolved for MVP. Preview calls the FastAPI render endpoint on demand through a preview button or keyboard shortcut. Client-side Markdown rendering and auto-run/debounced preview are out of scope unless the architecture is reopened.
3. **Log chain structure:** Strict sequential chains only, or support branching (one entry referencing multiple previous entries)? Current design is strict sequential.
4. **LQIP automation timing:** Start with manually stored CSS placeholder metadata, then add build/upload-time generation only when image volume justifies it.

## 9. Assumptions Index

- **[ASSUMPTION: FR-2]** KaTeX auto-render extension supports `$...$` and `$$...$$` delimiters.
- **[ASSUMPTION: FR-3]** The selected Pygments dark theme provides sufficient contrast against `--color-surface-elevated`.
- **[ASSUMPTION: FR-6]** SSG pages can fetch from the FastAPI API at build time in the Docker environment.
- **[ASSUMPTION: FR-5]** `max-w-prose` remains equivalent to the desired 65ch article measure for Tailwind-based prose layouts.
- **[ASSUMPTION: FR-8]** `[[Log-N]]` syntax is unambiguous and doesn't conflict with other Markdown extensions.
- **[ASSUMPTION: FR-15]** MiniSearch can index static HTML at build time and provide fuzzy matching within the JavaScript budget.
- **[ASSUMPTION: FR-14]** WebP conversion can be done in Python using Pillow/libwebp without adding request-path processing cost.
- **[ASSUMPTION: FR-14]** CSS-only LQIP provides enough perceived polish for MVP without adopting BlurHash/base83 decoding or extra placeholder image requests.

---

*Draft: 2026-05-31*
*Updated: 2026-06-21 with approved article layout, CSS-only LQIP decision, and renderer-backed on-demand preview decision*
