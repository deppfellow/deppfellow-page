---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - ".docs/bmad-output/planning-artifacts/prds/prd-deppfellow-page-2026-05-31/prd.md"
  - ".docs/bmad-output/planning-artifacts/architecture.md"
  - ".docs/bmad-output/planning-artifacts/sprint-change-proposal-2026-06-20.md"
  - ".docs/bmad-output/planning-artifacts/sprint-change-proposal-2026-06-21.md"
  - ".docs/bmad-output/planning-artifacts/research/technical-fastapi-for-current-project-research-2026-06-20.md"
  - ".docs/bmad-output/project-context.md"
contextDocuments:
  - ".docs/.planning_archived/sprint-status.yaml"
  - ".docs/bmad-output/implementation-artifacts/*.md"
extractionStatus: "confirmed"
status: "complete"
updated: "2026-06-21"
---

# deppfellow-page - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for deppfellow-page, decomposing the requirements from the PRD, available embedded UX requirements, Architecture requirements, approved sprint changes, FastAPI research, project context, and legacy sprint-planning context into implementable stories.

## Implementation Canon

- FastAPI, Astro, SQLite, npm, and uv are the current implementation source of truth.
- Existing Go story files are stale conflict artifacts and must not be used as implementation source unless a story explicitly migrates their intent into FastAPI terms.
- FastAPI owns SQLite, write APIs, auth, uploaded media, rendered HTML generation, and ContentRenderer behavior.
- Astro owns public routes, layouts, static/prerendered page generation, and approved Preact islands; Astro never imports SQLite or backend models directly.
- Public content renders from canonical published records exposed by FastAPI read APIs. Slugs and public URLs must be stable before authoring, threaded log, or search stories depend on them.
- Editor preview is on-demand through the FastAPI renderer. Live/debounced preview and client-side Markdown rendering are out of scope unless architecture is reopened.
- Image processing, WebP conversion, dimensions, and optional CSS-only LQIP metadata are generated at upload/build time, never on reader request paths. Public pages only consume stored image metadata.
- Search indexes only published canonical records returned by FastAPI. Drafts, private content, and direct SQLite reads are forbidden in search generation.

## Requirements Inventory

### Functional Requirements

FR1: The author can write Markdown in a split-pane editor at `/admin/editor` for new posts and `/admin/editor/:slug` for editing posts, with Markdown source on the left, rendered preview on the right, preview-on-demand through a preview button or keyboard shortcut, shared ContentRenderer output parity with published pages, and standard Markdown shortcuts.

FR2: Math expressions in Markdown render correctly in both editor preview and published pages, including inline `$E=mc^2$` and block `$$E=mc^2$$` syntax, with backend math wrappers, conditional KaTeX loading only on pages containing math, and SRI integrity hashes if KaTeX is loaded from a CDN.

FR3: Code blocks render with server-side syntax highlighting using Pygments and a dark theme matching the site palette, language labels display above labeled code blocks, and common languages such as TypeScript, Python, Markdown, and shell highlight correctly in preview and published pages.

FR4: The author can save posts as drafts or publish them; draft posts are hidden from public API endpoints, visible only to the authenticated author in the editor, and can move between draft and published status.

FR5: Posts render with editorial typography, including Cormorant serif headlines, prose body styling, a stable `max-w-prose` / 65ch article measure, `lh`-based vertical rhythm, first-paragraph drop caps, accent-bordered italic blockquotes, bone-colored underlined links with accent-red hover state, and inline code styling.

FR6: Content pages, including post detail pages, category index pages, and tag pages, are pre-rendered at build time where possible, use FastAPI read endpoints during build, and are served by Caddy without backend contact at reader request time.

FR7: Log entries are posts in the Log category and can reference the previous log entry through `previous_id`, forming sequential chains with previous/next chain context on detail pages and `previous_id = NULL` for the first entry in a chain.

FR8: Inline `[[Log-N]]` cross-references in Markdown render as clickable links to the correct log entry URL with display text such as `Log-42`.

FR9: The Log timeline supports infinite scroll through a Preact LogFeed island that loads initial entries, appends additional entries through paginated API calls, shows loading state, and uses Intersection Observer near the bottom of the feed.

FR10: Header navigation displays the permanent Article, Project, and Log categories, each linking to a category index page, while custom categories appear on the index page alongside the permanent categories.

FR11: Posts can have multiple tags in a many-to-many relationship, tags are normalized before storage and lookup, `/tags` lists available tags, and `/tags/:slug` lists posts filtered by tag.

FR12: Invalid URLs display a 404 page with "Page not found" and a link back to the home page.

FR13: The author can log in with a password and access protected admin/editor routes through HTTP-only cookie sessions; unauthenticated users are redirected from `/admin/*`, the cookie uses `HttpOnly`, `Secure` in production, and `SameSite=Strict`, and there is no registration or multi-user management.

FR14: The author can drag and drop images in the editor, upload them to the FastAPI API, convert them to WebP with a maximum upload size of 10MB, store them in backend-managed media storage with width/height and optional CSS-only LQIP metadata, expose them via `/media/:filename`, and insert Markdown image syntax at the cursor position.

FR15: Readers can search content client-side through MiniSearch using a build-time generated index, with search results appearing as the user types and search accessible from a header search icon or dedicated `/search` page.

### NonFunctional Requirements

NFR1: Public page load time must have median latency under 100ms and p99 latency under 200ms.

NFR2: Average JavaScript shipped per page must stay under 15KB, with hydration limited to the Editor, LogFeed, and Search islands unless architecture is reopened.

NFR3: The author must be able to go from intent-to-write to published post in under 60 seconds, excluding writing time.

NFR4: Editor preview and published pages must use the same backend-owned ContentRenderer path so Markdown, math, code highlighting, and log reference output remain identical.

NFR5: Reader request paths must avoid request-time Markdown rendering, image processing, and unnecessary backend contact where pages can be static or prerendered.

NFR6: The backend must remain operationally simple for a low-end VPS using Docker Compose, Caddy, FastAPI/Uvicorn, SQLite WAL, and local upload storage.

NFR7: SQLite must be owned only by FastAPI, use WAL mode, keep transactions short, use explicit indexes for core lookups, and start with one backend worker until measurement justifies change.

NFR8: API responses must preserve the consistent JSON envelope: success responses use `{ "ok": true, "data": ... }`; error responses use `{ "ok": false, "error": "machine_code", "message": "Human readable message" }`.

NFR9: Authentication must use same-origin production routing, HTTP-only cookies, endpoint-level authorization dependencies, strong password/session token storage, and login throttling or backoff.

NFR10: Python dependency management must use `uv` and `uv.lock`; frontend dependency management must use npm and the root `package-lock.json`; mixed dependency workflows and mixed frontend lockfiles are not allowed.

NFR11: Backend quality gates must include `uv run ruff format --check`, `uv run ruff check`, and `uv run pytest`; frontend quality gates must include `npm run check` and `npm run build`.

NFR12: Renderer behavior changes must be protected by golden tests covering Markdown, math delimiters, code highlighting, `[[Log-N]]` cross-references, sanitizer behavior, and false positives such as currency and dollar signs in code blocks.

NFR13: Deployment must fail fast if migrations fail, expose a health endpoint that checks app, database connectivity, and upload directory health, and avoid destructive production commands such as `docker compose down -v`.

NFR14: Logs must avoid sensitive data while supporting diagnosis of uptime, HTTP status distribution, latency, failed logins, render errors, upload errors, migration failures, and SQLite lock/database errors.

### Additional Requirements

- Use Astro Minimal Template plus a manually structured FastAPI/uv backend as the starter approach; avoid full-stack FastAPI templates, generic Python cookiecutters as the primary starter, Bun as the default frontend toolchain, and any revival of Go/Chi/goose/goldmark/Chroma.
- Initialize the root workspace with npm workspaces for `apps/frontend`, use Astro with Preact, Tailwind v4, MiniSearch, Nano Stores, and Node LTS, and lock frontend dependencies with npm.
- Initialize `apps/backend` with `uv`, Python 3.14 per the architecture document, FastAPI, pydantic-settings, SQLAlchemy 2, Alembic, PyJWT or equivalent auth tooling, markdown-it-py, mdit-py-plugins, Pygments, Pillow, python-multipart, pytest, HTTPX, and Ruff.
- Organize the backend as a FastAPI modular monolith with `app/main.py`, `app/api/routes`, `app/core`, `app/db`, `app/db/repositories`, `app/domain/services`, `app/renderer`, `app/media`, and `tests`.
- Organize the frontend with `src/pages`, `src/components`, `src/islands`, `src/stores`, `src/lib`, and `src/styles`, with posts coming from FastAPI rather than Astro content collections.
- Use SQLAlchemy 2 repositories and Alembic migrations for SQLite, including WAL mode and Alembic batch-mode guidance for table alterations.
- Preserve the domain model: `posts` as the primary content table, categories and many-to-many tags, log entries as posts in the Log category, `previous_id` for sequential log chains, stored rendered HTML/excerpts, image metadata rows, and backend-owned sessions.
- Implement FastAPI `APIRouter` modules for health, posts, categories, tags, auth, render, uploads, and search.
- Keep route functions thin: validate request data, call services/repositories/renderers, and return explicit Pydantic response models inside the shared response envelope.
- Implement domain-specific exceptions in services/repositories and convert them through shared FastAPI exception handlers, returning safe messages while logging internal details server-side.
- Use same-origin `/api/*` browser requests in production, `API_URL` for Astro build-time/SSR fetches, explicit local-development CORS allowlists, and `credentials: "include"` in the shared frontend API client for authenticated requests.
- Implement the backend-owned ContentRenderer as a service shared by preview and publish flows; do not add a client-side Markdown parser for preview.
- Support CommonMark/GFM-compatible Markdown behavior, footnotes, typographic replacements, math handling, Pygments code highlighting, sanitizer policy, and `[[Log-N]]` cross-reference handling in the renderer.
- Support `$...$`, `$$...$$`, `\(...\)`, and `\[...\]` math delimiters while testing code-block and currency false positives.
- Use KaTeX CSS/runtime only when math content exists, with self-hosting or CDN SRI if loaded externally.
- Process images at upload time using Pillow/libwebp, extract width/height, generate required variants or CSS-only LQIP metadata if implemented, and never process images on reader request paths.
- Generate the MiniSearch index from FastAPI published content data during or adjacent to Astro build, preserving the static client-side search approach.
- Deploy with Docker Compose services for Caddy, Astro Node frontend, and FastAPI/Uvicorn backend; Caddy routes `/api/*` and media paths to FastAPI and all other routes to Astro.
- Run Alembic migrations before backend app startup or as an explicit release step, and document backup procedures for SQLite and uploads.
- Add scripts or Makefile targets for local development, build, checks, migrations, smoke tests, SQLite backup, and Docker workflows, wrapping npm for frontend and uv for backend.
- Add CI that installs with `npm ci` and `uv sync --locked --all-extras --dev`, then runs frontend checks/build and backend Ruff/pytest checks.
- Add backend tests under `tests/api`, `tests/db`, and `tests/renderer`, using temporary SQLite fixtures, upload directories, environment overrides, seeded content, FastAPI dependency overrides, TestClient or HTTPX, and golden renderer fixtures.
- Add frontend verification first through type/build checks, then targeted browser checks only for critical public render, editor preview parity, login/write, upload, and search workflows if needed.
- Regenerate or update project context and sprint status after the FastAPI epics are accepted so future implementation agents do not follow stale Go-specific instructions.
- Run a final planning-artifact consistency search for stale `Go`, `Chi`, `goose`, `goldmark`, `Chroma`, and `go test` language before implementation begins.
- Preserve the planning fidelity from the archived Go-era sprint plan while translating implementation details to FastAPI; do not copy Go-specific story names or acceptance criteria.
- Epic 0 must explicitly scaffold the project and make the initial scaffold reviewable before feature implementation begins.
- Epic 1 must cover foundation and public content display after scaffolding exists.
- Epic 2 must cover authentication and protected route boundaries.
- Epic 3 must cover writing, editing, preview, draft, publish, and image upload workflows.
- Epic 4 must cover threaded log continuity.
- Epic 5 must cover search and discovery.
- Epic 6 must cover deployment, testing, CI, smoke checks, performance, accessibility, backup, and operational readiness.
- Each epic must end with explicit test and verification coverage for that epic scope.
- New FastAPI-era story files have not yet been created; existing files in `.docs/bmad-output/implementation-artifacts` are legacy story artifacts and may be used only as granularity references.

### UX Design Requirements

UX-DR1: Implement a dark-first editorial reading system with Cormorant serif headlines, prose body styling, first-paragraph drop caps, accent-bordered italic blockquotes, bone-colored underlined links, accent-red hover states, and inline code styling.

UX-DR2: Implement `ProseWrapper.astro` and Tailwind Typography overrides so backend-rendered HTML displays consistently across article, project, log, editor preview, math, code, blockquote, link, inline-code, and image contexts.

UX-DR3: Article prose content must use `max-w-prose` or equivalent `max-width: 65ch`; paragraph, heading, figure, caption, and metadata spacing should use `lh` units where text rhythm is the sizing driver.

UX-DR4: Implement `Header.astro` with permanent Article, Project, and Log category navigation plus search access, using category data fetched from FastAPI at build time where appropriate.

UX-DR5: Implement an editor UI that keeps Markdown source and rendered preview visible in a two-pane layout, preserves unsaved Markdown after save/publish/preview failures, exposes local loading/error states, and avoids WYSIWYG or rich toolbar complexity.

UX-DR6: Preview interaction must be explicit and on demand through a button or keyboard shortcut; the UI must not imply live/debounced preview behavior for MVP.

UX-DR7: Implement LogFeed loading, empty, error, retry, and append states locally inside the Preact island without global loading UI.

UX-DR8: Implement Search UI as a narrow Preact island with type-as-you-search feedback while preserving the JavaScript budget and avoiding server-side search queries.

UX-DR9: Implement a clear 404 page with "Page not found" and a home link.

UX-DR10: Keep static reading pages unhydrated except where math rendering requires conditional KaTeX assets.

UX-DR11: Uploaded images must reserve layout space using stored dimensions and may use CSS-only LQIP metadata with a solid dominant/neutral color fallback; do not add a BlurHash/base83 client decoder for MVP unless architecture is reopened.

### FR Coverage Map

FR1: Epic 3 - split-pane Markdown editor and renderer-backed preview.

FR2: Epic 1 - math rendering in public/editor-compatible renderer.

FR3: Epic 1 - Pygments code rendering in public/editor-compatible renderer.

FR4: Epic 3 - draft and publish workflow.

FR5: Epic 1 - editorial typography and prose system.

FR6: Epic 1 - SSG/prerendered content pages.

FR7: Epic 4 - sequential log chain model.

FR8: Epic 4 - log cross-reference rendering.

FR9: Epic 4 - infinite scroll log timeline.

FR10: Epic 1 - category navigation.

FR11: Epic 1 - tag filtering.

FR12: Epic 1 - 404 page.

FR13: Epic 2 - single-user authentication and protected boundaries.

FR14: Epic 3 - image upload with WebP conversion and media insertion.

FR15: Epic 5 - client-side search.

## Epic List

### Epic 0: Project Scaffold And Reviewable Foundation

The project has a clean FastAPI/Astro/npm/uv scaffold that is reviewable before feature work starts, with stale Go guidance quarantined and basic verification commands available.

**FRs covered:** Enables all FRs; no direct product FR completed yet.

### Epic 1: Foundation And Public Content Display

Readers can view polished public article/project pages, category/tag pages, rendered Markdown, math, code, editorial typography, and clear 404 behavior from FastAPI-backed content.

**FRs covered:** FR2, FR3, FR5, FR6, FR10, FR11, FR12

### Epic 2: Authentication And Protected Author Boundary

The author can log in securely and protected admin/write routes are inaccessible to unauthenticated visitors.

**FRs covered:** FR13

### Epic 3: Writing, Editing, And Publishing

The author can write Markdown, request renderer-backed preview, save drafts, publish/unpublish posts, edit existing content, and upload images in the editor flow.

**FRs covered:** FR1, FR4, FR14

### Epic 4: Threaded Log Continuity

Readers can browse chronological log entries, follow previous/next chains, and open `[[Log-N]]` references rendered by the shared backend renderer.

**FRs covered:** FR7, FR8, FR9

### Epic 5: Search And Discovery

Readers can search published content through a static MiniSearch index and access search from public navigation without leaking drafts or expanding server-side search scope.

**FRs covered:** FR15, supports FR10/FR11 discovery

### Epic 6: Deployment, Testing, And Operational Readiness

The finished MVP can be checked, tested, built, deployed, smoke-tested, backed up, and operated through Docker Compose, Caddy, CI, migrations, health checks, and documented commands.

**FRs covered:** Cross-cutting validation for all FRs

## Epic 0: Project Scaffold And Reviewable Foundation

The project has a clean FastAPI/Astro/npm/uv scaffold that is reviewable before feature work starts, with stale Go guidance quarantined and basic verification commands available.

### Story 0.1: Planning Artifact Alignment And Legacy Guardrails

As a developer,
I want the project planning artifacts to clearly identify FastAPI as the source of truth,
So that implementation agents do not follow stale Go-era stories or architecture.

**Acceptance Criteria:**

**Given** the project has legacy Go-era implementation artifacts
**When** the planning artifacts are prepared for new implementation
**Then** current planning documents identify FastAPI, Astro, SQLite, npm, and uv as the active implementation direction
**And** legacy Go story files are treated as historical granularity references only
**And** stale Go-specific terms such as Chi, goose, goldmark, Chroma, and `go test` are not used as current implementation guidance
**And** current implementation docs include a compact FastAPI/Astro canon for stack, rendering ownership, auth model, preview model, and stale-artifact handling
**And** the active sprint status can be regenerated from the new epic/story list.

### Story 0.2: Root Workspace Scaffold

As a developer,
I want a root workspace with stable project-level files and commands,
So that frontend and backend work can be coordinated from one repository boundary.

**Acceptance Criteria:**

**Given** a clean implementation workspace
**When** the root scaffold is created
**Then** the repository contains root `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `.editorconfig`, `README.md`, and `Makefile`
**And** npm workspaces include `apps/frontend`
**And** root scripts or Make targets wrap common frontend and backend commands without introducing Bun, Poetry, Pipenv, or loose pip workflows
**And** root documentation states that FastAPI owns data access and Astro never reads SQLite directly.

### Story 0.3: Astro Frontend Starter Scaffold

As a developer,
I want the Astro frontend starter initialized under the approved workspace,
So that public and admin UI work has a predictable foundation.

**Acceptance Criteria:**

**Given** the root workspace exists
**When** the frontend scaffold is created
**Then** `apps/frontend` uses the Astro minimal starter
**And** frontend dependencies are installed and locked through npm
**And** Astro is configured for server output with the Node adapter direction documented for later deployment work
**And** Preact, Nano Stores, Tailwind v4, MiniSearch, TypeScript, and Astro checking dependencies are present as planned
**And** initial frontend source folders exist for `pages`, `components`, `islands`, `lib`, `stores`, and `styles`.

### Story 0.4: FastAPI Backend Starter Scaffold

As a developer,
I want the FastAPI backend initialized with uv and the approved module boundaries,
So that API, renderer, database, media, and service work has a predictable foundation.

**Acceptance Criteria:**

**Given** the root workspace exists
**When** the backend scaffold is created
**Then** `apps/backend` is initialized with `uv`, `pyproject.toml`, `.python-version`, and `uv.lock`
**And** `apps/backend/app/main.py` exposes a FastAPI app object
**And** backend packages exist for `app/api/routes`, `app/core`, `app/db`, `app/db/repositories`, `app/domain/services`, `app/renderer`, and `app/media`
**And** planned backend dependencies include FastAPI, pydantic-settings, SQLAlchemy, Alembic, markdown-it-py, mdit-py-plugins, Pygments, Pillow, python-multipart, pytest, HTTPX, and Ruff
**And** no Go backend scaffold is created or revived.

### Story 0.5: Shared Response, Config, And Health Baseline

As a developer,
I want the backend scaffold to expose configuration, response envelopes, and a health route,
So that future feature stories start from consistent API behavior.

**Acceptance Criteria:**

**Given** the FastAPI backend scaffold exists
**When** the baseline API support is added
**Then** backend settings are centralized under `app/core/config.py` using pydantic-settings
**And** success responses can use the `{ ok: true, data: ... }` envelope
**And** error responses can use the `{ ok: false, error, message }` envelope
**And** a health route exists under the FastAPI routes package
**And** the health response uses the shared envelope shape
**And** route handlers stay thin and do not introduce direct SQLAlchemy access.

### Story 0.6: Alembic And SQLite Baseline

As a developer,
I want the backend to have an Alembic and SQLite baseline,
So that later content, auth, media, and log stories can add schema incrementally.

**Acceptance Criteria:**

**Given** the FastAPI backend scaffold exists
**When** database tooling is initialized
**Then** Alembic is configured under `apps/backend`
**And** SQLite connection/session setup lives under `app/db`
**And** database initialization enables or documents WAL and foreign-key behavior
**And** migrations are prepared to use Alembic rather than goose or hand-edited production schema changes
**And** no product tables are created before a story needs them, except minimal migration infrastructure required to prove Alembic works.

### Story 0.7: Scaffold Verification And Epic 0 Test Coverage

As a developer,
I want scaffold-level verification commands and tests,
So that Epic 0 can be reviewed before feature implementation begins.

**Acceptance Criteria:**

**Given** the root, frontend, and backend scaffolds exist
**When** scaffold verification runs
**Then** backend verification commands are available for Ruff format check, Ruff lint, and pytest
**And** frontend verification commands are available for Astro check and build
**And** at least one backend test verifies the health route response envelope
**And** at least one frontend check/build path can run against the scaffold
**And** local smoke verification proves Astro, FastAPI, and SQLite can boot together through documented commands
**And** the README or Makefile documents the expected local verification commands
**And** Epic 0 is reviewable without requiring Epic 1 content features.

## Epic 1: Foundation And Public Content Display

Readers can view polished public article/project pages, category/tag pages, rendered Markdown, math, code, editorial typography, and clear 404 behavior from FastAPI-backed content.

### Story 1.1: Published Content Schema And Read Models

As a reader,
I want published posts, categories, and tags represented consistently,
So that public pages can be generated from reliable backend-owned content data.

**Acceptance Criteria:**

**Given** the FastAPI backend scaffold and Alembic baseline exist
**When** the published content schema is added
**Then** SQLite includes tables for posts, categories, tags, and post-tag relationships
**And** post records support title, slug, Markdown body, rendered HTML, excerpt, category, draft/published status, and published timestamp
**And** tags support normalized slugs and many-to-many post relationships
**And** the canonical public URL/slug model is established before authoring, threaded log, or search stories depend on it
**And** Alembic can create the schema from scratch
**And** SQLAlchemy models and repositories are added only for the content tables needed by this story
**And** Astro does not access SQLite directly.

### Story 1.2: Published Content Read APIs

As a reader,
I want published content available through stable read APIs,
So that public Astro pages can build from FastAPI data.

**Acceptance Criteria:**

**Given** published content tables and repositories exist
**When** public read endpoints are implemented
**Then** FastAPI exposes published-only read routes for posts, categories, and tags
**And** draft posts are excluded from all public read responses
**And** responses use `{ ok: true, data: ... }` envelopes with Pydantic response models
**And** missing resources return safe error envelopes
**And** route handlers call services/repositories rather than querying SQLAlchemy directly.

### Story 1.3: Backend ContentRenderer Baseline

As a reader,
I want Markdown posts to render into safe, consistent HTML with math and code support,
So that technical writing displays correctly on public pages.

**Acceptance Criteria:**

**Given** Markdown source content exists
**When** the backend ContentRenderer renders content
**Then** Markdown renders through markdown-it-py and approved plugins
**And** math syntax supports `$...$`, `$$...$$`, `\(...\)`, and `\[...\]` wrappers
**And** code blocks are highlighted with Pygments and language labels when specified
**And** unsafe HTML is handled according to the sanitizer policy
**And** renderer output can report whether math assets are required
**And** renderer logic lives in backend renderer modules, not FastAPI route helpers or frontend code.

### Story 1.4: Editorial Prose System And Static Layout

As a reader,
I want public writing to display with the approved editorial style,
So that articles, projects, and logs feel polished and readable.

**Acceptance Criteria:**

**Given** the Astro frontend scaffold exists
**When** the public prose system is implemented
**Then** `ProseWrapper.astro` centralizes backend-rendered HTML styling
**And** article body content uses `max-w-prose` or equivalent 65ch measure
**And** headings, paragraphs, lists, figures, captions, and metadata use appropriate `lh`-based rhythm
**And** first-paragraph drop caps, accent-bordered blockquotes, underlined links, and inline code styling are present
**And** public image rendering consumes stored width, height, and optional CSS-only LQIP metadata without generating placeholders on reader request paths
**And** code blocks and intentional media breakouts use named escape-hatch classes
**And** ordinary reading pages do not hydrate unnecessary Preact islands.

### Story 1.5: Static Public Post Pages

As a reader,
I want article and project detail pages to load as static or prerendered pages,
So that public reading remains fast and dependable.

**Acceptance Criteria:**

**Given** published content read APIs and the prose system exist
**When** Astro builds public article and project pages
**Then** public detail pages are prerendered where possible using FastAPI read APIs
**And** rendered backend HTML is displayed through `ProseWrapper.astro`
**And** pages conditionally load math assets only when rendered content requires math
**And** content fetch failures fail the build clearly where prerendered content is required
**And** reader request paths avoid request-time Markdown rendering.

### Story 1.6: Category And Tag Browsing

As a reader,
I want to browse posts by permanent categories and tags,
So that I can discover writing by type and topic.

**Acceptance Criteria:**

**Given** published content read APIs exist
**When** category and tag browsing pages are implemented
**Then** the header includes Article, Project, and Log category links
**And** category pages list published posts for that category
**And** `/tags` lists available normalized tags
**And** `/tags/:slug` lists published posts for the selected tag
**And** custom categories can appear on the index page without breaking permanent navigation
**And** category/tag pages fetch data from FastAPI, not SQLite.

### Story 1.7: Public 404 And Reader Failure States

As a reader,
I want invalid URLs and missing content to fail clearly,
So that the site feels reliable even when something cannot be found.

**Acceptance Criteria:**

**Given** the public frontend routes exist
**When** a reader visits an invalid URL
**Then** Astro displays a 404 page with "Page not found" and a home link
**And** missing post/category/tag data does not render broken content
**And** public error states avoid leaking backend internals
**And** the 404 route follows the same visual language as public reading pages.

### Story 1.8: Epic 1 Content Display Test Coverage

As a developer,
I want focused tests and verification for public content display,
So that Epic 1 can be reviewed before auth and writing workflows begin.

**Acceptance Criteria:**

**Given** Epic 1 content display features exist
**When** verification runs
**Then** backend tests cover published-only read APIs, draft exclusion, response envelope shape, and missing-resource errors
**And** renderer golden tests cover Markdown, math delimiters, code highlighting, sanitizer behavior, and currency/code false positives
**And** frontend checks/build verify public route generation from FastAPI data
**And** smoke verification covers backend health and at least one public frontend route
**And** public reading pages remain within the no-unnecessary-hydration expectation.

## Epic 2: Authentication And Protected Author Boundary

The author can log in securely and protected admin/write routes are inaccessible to unauthenticated visitors.

### Story 2.1: Single-User Session Data Model

As the author,
I want backend-owned sessions for a single author account,
So that authentication state is managed securely without client-side tokens.

**Acceptance Criteria:**

**Given** the content database baseline exists
**When** session persistence is added
**Then** SQLite includes only the auth/session tables or fields needed for single-user login
**And** session tokens are stored server-side or verifiable without exposing raw secrets
**And** password/session configuration is read through backend settings, not ad hoc environment reads
**And** Alembic can migrate the auth/session schema from scratch
**And** no registration, multi-user profile, OAuth, or role-management schema is introduced.

### Story 2.2: Password Login And Logout API

As the author,
I want to log in and log out with my password,
So that I can start and end authenticated writing sessions safely.

**Acceptance Criteria:**

**Given** session persistence exists
**When** the login endpoint receives a valid password
**Then** FastAPI creates a valid author session and sets an HTTP-only cookie
**And** the cookie uses `SameSite=Strict` and uses `Secure` in production
**And** invalid login attempts return safe error envelopes without leaking sensitive details
**And** login throttling or backoff is applied
**And** session expiry behavior is defined and enforced
**And** logout invalidates the active session and clears the cookie
**And** responses use the shared envelope shape.

### Story 2.3: Current Author Dependency And Protected API Boundary

As the author,
I want protected API routes to require my active session,
So that write and admin capabilities cannot be used anonymously.

**Acceptance Criteria:**

**Given** login sessions exist
**When** protected FastAPI dependencies are added
**Then** a reusable current-author dependency validates the session cookie
**And** invalid, missing, or expired sessions are rejected safely
**And** protected write-route stubs or boundaries can require the dependency
**And** public read routes remain accessible without authentication
**And** draft/private content is not returned by public read endpoints
**And** route handlers do not duplicate auth-check logic.

### Story 2.4: Protected Admin Route Boundary In Astro

As the author,
I want admin pages to redirect unauthenticated visitors,
So that the editor surface is not publicly accessible.

**Acceptance Criteria:**

**Given** session validation exists in the backend
**When** Astro admin route boundaries are implemented
**Then** unauthenticated visitors are redirected away from `/admin/*` pages
**And** authenticated requests use same-origin `/api/*` with credentials included
**And** browser API access is centralized in `src/lib/apiClient.ts`
**And** auth state does not store raw session tokens in localStorage, sessionStorage, or Nano Stores
**And** the login page and admin redirects avoid leaking backend internals.

### Story 2.5: Epic 2 Authentication Test Coverage

As a developer,
I want focused tests for authentication and protected boundaries,
So that auth behavior is reviewable before writing workflows begin.

**Acceptance Criteria:**

**Given** Epic 2 authentication features exist
**When** verification runs
**Then** backend tests cover valid login, invalid login, logout, missing session, expired/invalid session, and protected dependency behavior
**And** cookie flags are asserted for production-relevant settings where practical
**And** public read APIs remain accessible and draft-excluding
**And** frontend checks cover unauthenticated admin redirect behavior where practical
**And** no test relies on client-side stored auth tokens.

## Epic 3: Writing, Editing, And Publishing

The author can write Markdown, request renderer-backed preview, save drafts, publish/unpublish posts, edit existing content, and upload images in the editor flow.

### Story 3.1: Protected Post Write API

As the author,
I want protected APIs for creating and updating post content,
So that editor actions can save writing through FastAPI safely.

**Acceptance Criteria:**

**Given** authentication and published content models exist
**When** protected post write endpoints are implemented
**Then** authenticated requests can create and update post title, slug, Markdown body, excerpt, category, tags, and draft/published status
**And** unauthenticated requests are rejected by the shared auth dependency
**And** post write logic uses services/repositories rather than direct route queries
**And** writes preserve the shared response envelope
**And** public read APIs continue to exclude drafts.

### Story 3.2: Split-Pane Editor Shell

As the author,
I want a focused split-pane Markdown editor,
So that I can write source Markdown while keeping a rendered preview area available.

**Acceptance Criteria:**

**Given** protected admin routing exists
**When** the editor shell is implemented at `/admin/editor`
**Then** the page renders Markdown source and preview panes
**And** editor state remains local to the Editor island
**And** loading, empty, dirty, saving, and error states are visible locally
**And** the editor avoids WYSIWYG and rich toolbar scope creep
**And** unsaved Markdown remains in the editor after local UI errors.

### Story 3.3: Renderer-Backed On-Demand Preview

As the author,
I want to request preview only when I choose,
So that preview stays accurate without interrupting writing or rendering on every typing pause.

**Acceptance Criteria:**

**Given** the split-pane editor shell and ContentRenderer exist
**When** the author clicks the preview button or uses the preview keyboard shortcut
**Then** the editor sends the current Markdown to the protected or author-safe FastAPI render endpoint
**And** preview does not auto-run while typing
**And** preview uses the same ContentRenderer path as publishing
**And** math, code blocks, sanitizer behavior, and typography-compatible HTML match published output
**And** preview errors preserve the current unsaved Markdown.

### Story 3.4: Draft Save And Edit Existing Drafts

As the author,
I want to save unfinished posts as drafts and reopen them later,
So that writing can continue without becoming public.

**Acceptance Criteria:**

**Given** protected post write APIs and the editor shell exist
**When** the author saves a draft
**Then** FastAPI stores raw Markdown, rendered HTML, metadata, category, tags, and draft status
**And** the saved draft is visible to the authenticated author for editing
**And** the saved draft remains excluded from public read APIs, category pages, tag pages, and search data
**And** save failures preserve the current Markdown in the editor
**And** editing an existing draft loads the current stored Markdown and metadata.

### Story 3.5: Publish And Unpublish Workflow

As the author,
I want to publish posts and return them to draft later,
So that I control when writing becomes public.

**Acceptance Criteria:**

**Given** draft save and edit flows exist
**When** the author publishes a post
**Then** FastAPI renders Markdown through the shared ContentRenderer and marks the post published
**And** the post becomes available through public read endpoints for Astro builds
**And** the author can change a published post back to draft
**And** status changes are reflected consistently in public and authenticated views
**And** publish failures preserve the current Markdown in the editor
**And** the intent-to-publish flow remains compatible with the <60 second target excluding writing time.

### Story 3.6: Editor Image Upload With WebP Conversion

As the author,
I want to drag and drop images into the editor,
So that visual content can be added without leaving the writing flow.

**Acceptance Criteria:**

**Given** the authenticated editor is open
**When** the author drops a supported image file into the editor
**Then** the editor uploads it to a protected FastAPI upload route
**And** files over 10MB or invalid image types are rejected safely
**And** valid images are converted to WebP at upload time using Pillow/libwebp
**And** stored image metadata includes filename, width, height, and optional CSS-only LQIP values
**And** stored media is exposed through `/media/:filename` or the approved media route
**And** Markdown image syntax is inserted at the cursor position
**And** image processing does not occur on reader request paths.

### Story 3.7: Edit Published Posts

As the author,
I want to edit an already published post,
So that published writing can be corrected without creating duplicate content.

**Acceptance Criteria:**

**Given** publish workflow exists
**When** the author opens `/admin/editor/:slug` for a published post
**Then** the editor loads the stored Markdown and metadata for that post
**And** saving updates the existing post rather than creating a duplicate
**And** publishing after edits re-renders through the shared ContentRenderer
**And** public APIs reflect the updated published content after save/publish
**And** failures preserve the current editor contents.

### Story 3.8: Epic 3 Writing And Upload Test Coverage

As a developer,
I want focused tests for writing, preview, publishing, and uploads,
So that Epic 3 can be reviewed before threaded log work begins.

**Acceptance Criteria:**

**Given** Epic 3 writing features exist
**When** verification runs
**Then** backend tests cover protected create/update, draft exclusion, publish/unpublish, preview renderer parity, and error envelopes
**And** upload tests cover invalid type, over-10MB rejection, valid WebP conversion, safe filename/path behavior, and width/height metadata
**And** frontend checks cover editor state preservation on preview/save/publish failure where practical
**And** renderer tests prove preview and publish use the same rendering path
**And** public APIs still exclude drafts after write operations.

## Epic 4: Threaded Log Continuity

Readers can browse chronological log entries, follow previous/next chains, and open `[[Log-N]]` references rendered by the shared backend renderer.

### Story 4.1: Sequential Log Entry Model

As a reader,
I want log entries to preserve their chronological chain,
So that I can follow the author's thinking from one entry to the next.

**Acceptance Criteria:**

**Given** the post model exists
**When** log chain support is added
**Then** Log entries are represented as posts in the Log category
**And** each Log entry can reference a previous Log entry through `previous_id`
**And** the first entry in a chain can have `previous_id = NULL`
**And** repository/service logic prevents invalid previous-entry references
**And** repository/service logic prevents circular chain references
**And** chain ordering is deterministic for previous/next navigation and timeline display
**And** required indexes support efficient previous/next chain lookup
**And** draft or unpublished log entries are excluded from public chain queries.

### Story 4.2: Log Detail Chain Navigation

As a reader,
I want log detail pages to show previous and next entry links,
So that I can move through the chain without returning to the index.

**Acceptance Criteria:**

**Given** Log entries can reference previous entries
**When** a reader opens a public Log detail page
**Then** the page displays a previous link when a published previous entry exists
**And** the page displays a next link when a published next entry exists
**And** missing previous/next entries do not break page rendering
**And** unpublished or draft log entries do not appear in public chain navigation
**And** navigation data is fetched from FastAPI, not SQLite directly.

### Story 4.3: Log Cross-Reference Rendering

As a reader,
I want `[[Log-N]]` references inside posts to become working links,
So that I can follow related thoughts directly from the text.

**Acceptance Criteria:**

**Given** the backend ContentRenderer exists
**When** Markdown contains `[[Log-N]]` syntax
**Then** the renderer resolves the referenced published Log entry
**And** renders a clickable link with display text such as `Log-42`
**And** unresolved, invalid, or unpublished references render safely without breaking the post
**And** missing parent or missing referenced log entries have deterministic fallback rendering
**And** references inside code blocks or math contexts are not incorrectly transformed
**And** cross-reference behavior is shared by preview and publish rendering.

### Story 4.4: Public Log Timeline Page

As a reader,
I want a chronological Log index,
So that I can browse recent entries as a timeline.

**Acceptance Criteria:**

**Given** published Log entries exist
**When** the Log index page is built or rendered
**Then** the page lists Log entries in chronological order
**And** each entry includes enough summary information to choose what to read
**And** the initial page avoids unnecessary hydration beyond the LogFeed island
**And** public APIs return only published Log entries
**And** empty state rendering is clear when no published Log entries exist.

### Story 4.5: Infinite Scroll LogFeed

As a reader,
I want older Log entries to load as I scroll,
So that I can continue browsing the timeline without manual pagination.

**Acceptance Criteria:**

**Given** the public Log timeline page exists
**When** the reader scrolls near the bottom
**Then** the LogFeed Preact island uses Intersection Observer to fetch the next page of entries
**And** loading, empty, error, and retry states are local to the island
**And** newly loaded entries append without replacing existing entries
**And** repeated fetches stop when no more entries are available
**And** the implementation stays within the JavaScript budget
**And** fetched entries come from published-only FastAPI endpoints.

### Story 4.6: Epic 4 Threaded Log Test Coverage

As a developer,
I want focused tests for log chains, cross-references, and timeline loading,
So that Epic 4 can be reviewed before search work begins.

**Acceptance Criteria:**

**Given** Epic 4 threaded log features exist
**When** verification runs
**Then** backend tests cover valid previous chains, first-entry null previous links, invalid previous references, next/previous lookup, and draft exclusion
**And** renderer golden tests cover valid `[[Log-N]]`, missing references, unpublished references, and syntax inside math/code contexts
**And** API tests cover published-only paginated log timeline responses
**And** frontend checks cover LogFeed loading, append, error, retry, and no-more-results behavior where practical
**And** public log pages avoid unnecessary hydration outside LogFeed.

## Epic 5: Search And Discovery

Readers can search published content through a static MiniSearch index and access search from public navigation without leaking drafts or expanding server-side search scope.

### Story 5.1: Published Search Data Endpoint

As a reader,
I want search data to include only published content,
So that private drafts never appear in search results.

**Acceptance Criteria:**

**Given** published content APIs exist
**When** the search data endpoint is implemented
**Then** FastAPI returns only published content needed for search indexing
**And** draft posts are excluded
**And** response payloads use the shared `{ ok, data }` envelope
**And** the endpoint includes enough fields for title, excerpt, category, tags, URL, and searchable body text
**And** search data ordering is deterministic for equivalent relevance inputs
**And** route handlers use services/repositories rather than direct SQLAlchemy access.

### Story 5.2: Build-Time MiniSearch Index Generation

As a reader,
I want search to load quickly without server-side search queries,
So that discovery preserves the site's static performance model.

**Acceptance Criteria:**

**Given** the search data endpoint exists
**When** Astro builds the frontend
**Then** MiniSearch index data is generated from FastAPI published-content data
**And** the generated search asset is available to the frontend search UI
**And** the build fails clearly if required search data cannot be fetched
**And** search index generation does not require Astro to access SQLite directly
**And** draft content is absent from the generated asset.

### Story 5.3: Search Interface And Results

As a reader,
I want to type a query and see matching content,
So that I can find posts by title, excerpt, tag, category, or body text.

**Acceptance Criteria:**

**Given** a generated MiniSearch index is available
**When** the reader opens search and types a query
**Then** the Search Preact island loads the static index
**And** results update as the user types
**And** each result links to the correct public URL
**And** result ordering is deterministic for equal-score matches
**And** empty-query, no-results, loading, and error states are handled locally
**And** the island remains within the JavaScript budget
**And** search does not issue server-side query requests for ordinary reader searches.

### Story 5.4: Search Access From Public Navigation

As a reader,
I want search to be easy to access from public pages,
So that discovery is available without disrupting reading.

**Acceptance Criteria:**

**Given** the Search island exists
**When** the public header or dedicated `/search` page is rendered
**Then** readers can access search from the header search entry or `/search` route
**And** search access does not hydrate unrelated static reading content
**And** keyboard and pointer interaction paths are supported
**And** public navigation still preserves Article, Project, and Log category links
**And** search access remains consistent across public content pages.

### Story 5.5: Epic 5 Search Test Coverage

As a developer,
I want focused tests for search data, generated indexes, and search UI behavior,
So that Epic 5 can be reviewed before final deployment readiness.

**Acceptance Criteria:**

**Given** Epic 5 search features exist
**When** verification runs
**Then** backend tests cover published-only search data, draft exclusion, and response envelope shape
**And** build verification proves the MiniSearch asset is generated from FastAPI data
**And** generated search assets do not include draft content
**And** frontend checks cover loading, query, results, empty, no-results, and error states where practical
**And** public page JavaScript remains within the documented budget.

## Epic 6: Deployment, Testing, And Operational Readiness

The finished MVP can be checked, tested, built, deployed, smoke-tested, backed up, and operated through Docker Compose, Caddy, CI, migrations, health checks, and documented commands.

### Story 6.1: Docker Compose Runtime Topology

As an operator,
I want the MVP to run through the approved Docker Compose topology,
So that deployment matches the architecture used during planning.

**Acceptance Criteria:**

**Given** frontend and backend application builds exist
**When** Docker Compose deployment files are added
**Then** Compose defines services for Caddy, Astro Node frontend, and FastAPI/Uvicorn backend
**And** the backend service owns SQLite and upload volumes
**And** the frontend service does not mount or access SQLite
**And** environment variables are documented through `.env.example`
**And** runtime environment variables required by frontend, backend, database, uploads, sessions, and Caddy are documented with ownership
**And** production configuration starts with one FastAPI worker.

### Story 6.2: Caddy Routing And Media Delivery

As a reader,
I want public traffic routed correctly,
So that pages, APIs, and media load through one production entrypoint.

**Acceptance Criteria:**

**Given** Docker Compose services exist
**When** Caddy routing is configured
**Then** Caddy routes `/api/*` to FastAPI
**And** media/upload paths route to the approved backend/media delivery path
**And** all other public routes go to the Astro frontend
**And** TLS/reverse-proxy assumptions are documented for VPS deployment
**And** Caddy routing does not expose SQLite or internal backend files.

### Story 6.3: Migration And Startup Safety

As an operator,
I want deployment to fail fast when migrations or storage checks fail,
So that bad releases do not start in a partially broken state.

**Acceptance Criteria:**

**Given** Alembic migrations and deployment services exist
**When** the backend starts in deployment mode
**Then** migrations run before app startup or through an explicit documented release step
**And** the exact migration command path is documented for local, CI, and deployment contexts
**And** migration failures stop the release or backend startup clearly
**And** health checks include app status, database connectivity, and upload directory accessibility
**And** logs report migration, DB, and upload errors without leaking secrets
**And** production guidance forbids destructive cleanup commands such as `docker compose down -v`.

### Story 6.4: CI Quality Gate

As a developer,
I want CI to run the project quality gates,
So that regressions are caught before deployment.

**Acceptance Criteria:**

**Given** frontend and backend verification commands exist
**When** CI runs
**Then** frontend dependencies install with `npm ci`
**And** backend dependencies install with `uv sync --locked --all-extras --dev` or the project-approved locked equivalent
**And** CI runs frontend checks/build
**And** CI runs backend Ruff format check, Ruff lint, and pytest
**And** CI does not run stale Go checks or depend on Go-specific tooling.

### Story 6.5: Smoke Tests And Release Verification

As an operator,
I want smoke tests for the deployed app,
So that I can verify the release before treating it as healthy.

**Acceptance Criteria:**

**Given** deployment services can start
**When** smoke verification runs
**Then** smoke checks cover FastAPI health
**And** smoke checks cover at least one public Astro route
**And** smoke checks cover Caddy routing for frontend and `/api/*` paths
**And** smoke checks can be run locally or in CI without destructive side effects
**And** failures report actionable diagnostics.

### Story 6.6: Backup And Restore Guidance

As an operator,
I want documented backup and restore procedures,
So that SQLite data and uploaded media can be recovered.

**Acceptance Criteria:**

**Given** SQLite and upload volumes exist
**When** backup guidance is added
**Then** documentation explains how to back up SQLite safely
**And** documentation explains how to back up uploaded media
**And** restore guidance identifies required ordering for database and media files
**And** backup scripts or Make targets avoid destructive defaults
**And** production docs warn against volume deletion commands.

### Story 6.7: Performance And Accessibility Verification

As a reader,
I want the production site to remain fast and usable,
So that the MVP preserves its public reading goals.

**Acceptance Criteria:**

**Given** public pages and deployment smoke checks exist
**When** final verification runs
**Then** public page latency assumptions are checked or documented with a repeatable measurement path
**And** public JavaScript budget expectations are checked or documented
**And** basic accessibility checks cover navigation, reading pages, login, editor, search, and 404 paths where practical
**And** math/code/media rendering does not create obvious layout instability
**And** any unmet performance or accessibility findings are documented as release risks.

### Story 6.8: Final Artifact Consistency And Epic 6 Test Coverage

As a developer,
I want final planning and implementation artifacts to be internally consistent,
So that future agents can continue without reintroducing stale architecture.

**Acceptance Criteria:**

**Given** all MVP epics have been implemented
**When** final consistency validation runs
**Then** planning and implementation artifacts are searched for stale current-guidance references to Go, Chi, goose, goldmark, Chroma, Bun, and `go test`
**And** any remaining references are either corrected or explicitly marked historical/archive context
**And** sprint status can be regenerated from the final epic/story list
**And** all epic-level verification commands are documented in one place
**And** final verification includes static public route build checks and backend API test pass status
**And** Epic 6 review confirms that deployment, CI, smoke, backup, performance, and accessibility checks are represented.
