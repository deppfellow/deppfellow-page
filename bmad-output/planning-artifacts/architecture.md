---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-06-20'
regeneratedFrom: '.docs/bmad-output/planning-artifacts/archive/architecture-go-legacy-2026-05-31.md'
backendDecision: 'FastAPI'
inputDocuments:
  - ".docs/bmad-output/planning-artifacts/prds/prd-deppfellow-page-2026-05-31/prd.md"
  - ".docs/bmad-output/planning-artifacts/briefs/brief-deppfellow-page-2026-05-31/brief.md"
  - ".docs/bmad-output/planning-artifacts/sprint-change-proposal-2026-06-20.md"
  - ".docs/bmad-output/planning-artifacts/research/technical-fastapi-for-current-project-research-2026-06-20.md"
  - ".docs/bmad-output/planning-artifacts/epics.md"
  - ".docs/bmad-output/project-context.md"
project_name: 'deppfellow-page'
user_name: 'Deppfellow'
date: '2026-06-20'
updated: '2026-06-21'
---

# Architecture Decision Document

_This document is being regenerated from the updated PRD and approved FastAPI sprint change proposal. The previous Go architecture is archived at `.docs/bmad-output/planning-artifacts/archive/architecture-go-legacy-2026-05-31.md`._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines 15 functional requirements across 7 feature groups:

| Group | FRs | Architectural Impact |
|-------|-----|---------------------|
| Writing Experience | FR-1 to FR-4 | Preact editor island, FastAPI render endpoint, draft/publish API, auth dependency |
| Content Display | FR-5 to FR-6 | Astro SSG/prerendered pages, editorial typography, build-time API fetches |
| Threaded Log | FR-7 to FR-9 | SQLite chain model, log cross-reference renderer, SSR/infinite-scroll surface |
| Content Organization | FR-10 to FR-12 | Category/tag schema, static category/tag routes, 404 page |
| Authentication | FR-13 | Single-user password auth, HttpOnly cookie sessions, FastAPI auth dependencies |
| Image Upload | FR-14 | FastAPI upload route, Pillow/WebP processing, media storage, size limits |
| Search | FR-15 | Build-time MiniSearch index sourced from FastAPI data |

The product behavior remains stable from the previous architecture: a fast personal journal, Markdown-first writing, threaded log continuity, category/tag browsing, single-user auth, image uploads, and client-side search. The implementation substrate changes from Go to FastAPI.

**Non-Functional Requirements:**

- Page load time: median under 100ms, p99 under 200ms.
- JavaScript budget: average under 15KB/page.
- Writing friction: author can publish in under 60 seconds excluding writing time.
- Rendering correctness: editor preview and published pages must use the same backend renderer.
- Backend simplicity: solo-author system, no multi-user, comments, OAuth, external DB, or realtime collaboration.
- Operational simplicity: Docker Compose on low-end VPS, Caddy reverse proxy, SQLite persistence.

### Scale & Complexity

- Primary domain: Full-stack web application.
- Complexity level: Medium.
- Estimated architectural components: 8.
  - Caddy reverse proxy
  - Astro Node frontend
  - FastAPI backend
  - SQLite database
  - Python ContentRenderer
  - Preact islands
  - MiniSearch build index
  - Media upload/processing pipeline

The project is not high-scale, multi-tenant, or compliance-heavy. Its complexity comes from correctness boundaries: rendering parity, static/dynamic route split, low JavaScript, SQLite write discipline, and preserving authoring speed.

### Technical Constraints & Dependencies

1. The approved backend stack is FastAPI, not Go.
2. The frontend remains Astro + Preact + Tailwind v4.
3. SQLite remains the database, owned only by the backend.
4. Caddy remains the production reverse proxy.
5. Public content pages should be static or prerendered where possible.
6. Dynamic surfaces are limited to admin/editor, log infinite scroll, auth, uploads, and search interactions.
7. The ContentRenderer must be backend-owned and shared by preview and persisted/published output.
8. Image processing, dimension extraction, and optional LQIP metadata generation must happen at upload/build time, not reader request time.
9. Search remains client-side MiniSearch with a build-time index.
10. The stale Go architecture, epics, and project context are conflict artifacts and must be regenerated or updated before implementation resumes.

### Cross-Cutting Concerns Identified

1. **Renderer Consistency** - Editor preview and published pages must call the same FastAPI ContentRenderer path.
2. **SQLite Ownership** - Astro must never access SQLite directly; all data access flows through FastAPI.
3. **Build-Time API Availability** - Astro SSG pages and search index generation require the FastAPI API during build.
4. **Performance Budget** - Public reader paths must avoid request-time Markdown rendering, image processing, and unnecessary hydration.
5. **Response Contract Consistency** - FastAPI routes should preserve `{ ok, data }` and `{ ok, error, message }` envelopes with Pydantic schemas.
6. **Auth Boundary** - Admin/editor/write routes require HttpOnly cookie sessions and FastAPI dependencies.
7. **Article Readability** - Public article bodies must keep a stable `max-w-prose` / 65ch measure with `lh`-based rhythm, while code blocks and intentional media breakouts remain controlled exceptions.
8. **Image Placeholder Discipline** - CSS-only LQIP is the approved placeholder direction for MVP; BlurHash/base83 and canvas/client decoders are deferred unless an image pipeline requirement justifies them.
9. **Planning Artifact Drift** - The existing epics and project context still contain Go-specific rules and will mislead implementation agents unless corrected.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application based on the updated PRD and approved FastAPI sprint change proposal.

The frontend remains an Astro content site with selective Preact islands. The backend becomes a FastAPI sidecar that owns API routes, auth, SQLite access, Markdown rendering, image processing, and search-index data.

### Starter Options Considered

**Option 1: Astro Minimal Template + Manual FastAPI/uv Backend**

Use Astro's official minimal starter for the frontend and initialize the backend as a focused FastAPI project with `uv`.

This fits the product because the app has two intentionally separate runtimes:

- Astro owns public routes, layouts, SSG/prerendering, and Preact islands.
- FastAPI owns data, writes, auth, rendering, uploads, and API contracts.

**Option 2: Full Stack FastAPI Template**

Rejected for MVP. It provides more full-stack scaffolding than this project needs and would likely introduce assumptions around frontend, auth, database, and deployment that conflict with the Astro-first architecture.

**Option 3: Generic Python Cookiecutter/uv Template**

Rejected as the primary starter. Generic Python templates help with packaging and tooling, but they do not encode the project's important architectural boundaries: FastAPI routers, SQLite ownership, renderer services, media pipeline, and Astro build-time API needs.

**Option 4: Bun Frontend Toolchain**

Rejected as the default. Bun is fast and viable for personal greenfield work, but the deployment contract becomes more specific: `oven/bun:1`, `bun.lock`, `bun install --frozen-lockfile`, `bun run` commands everywhere, and a required Astro production smoke test inside the Bun container. Since the project prioritizes low-friction Docker deployment and predictable future agent behavior, npm + Node LTS is the default.

### Selected Starter: Astro Minimal Template + Manual FastAPI/uv Backend

**Rationale for Selection:**

This gives the project the least misleading foundation.

The Astro minimal starter avoids content-collection or blog-theme assumptions. That matters because posts live in SQLite, not Markdown files. Astro should fetch rendered content from FastAPI at build time or request time.

The FastAPI backend should be manually structured around this domain rather than generated from a large template. Official FastAPI guidance supports splitting larger apps into Python packages and router modules, which maps cleanly to routes for posts, auth, render, uploads, search, categories, tags, and health.

`uv` is the backend dependency authority. It creates and maintains `pyproject.toml`, `.python-version`, `.venv`, and `uv.lock`, avoiding mixed Python dependency workflows.

npm + Node LTS is the frontend dependency/runtime authority. It aligns with Astro's documented install path and keeps Docker deployment predictable for the Astro Node server.

**Initialization Commands:**

```bash
# Root workspace
npm init -y
npm pkg set workspaces='["apps/frontend"]'

# Frontend
npm create astro@latest apps/frontend -- --template minimal
cd apps/frontend
npm install @astrojs/preact preact @preact/signals nanostores @nanostores/preact
npm install @astrojs/node @astrojs/sitemap tailwindcss @tailwindcss/vite minisearch
npm install -D typescript @astrojs/check prettier

# Backend
mkdir -p apps/backend
cd apps/backend
uv init
uv add "fastapi[standard]" pydantic-settings sqlalchemy alembic pyjwt markdown-it-py mdit-py-plugins pygments pillow python-multipart
uv add --dev pytest httpx ruff
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**

- TypeScript for the Astro frontend.
- Python 3.14 for the FastAPI backend.
- FastAPI ASGI runtime served with `fastapi run app/main.py` in production.
- npm remains the frontend package manager.
- `uv` is the only Python package/project manager.

**Styling Solution:**

- Tailwind CSS v4 through the Vite plugin.
- CSS-first tokens in the frontend stylesheet.
- No Tailwind JS config unless a later requirement proves it necessary.

**Build Tooling:**

- Astro/Vite for frontend build.
- Node LTS runtime for the Astro Node server.
- `npm ci` for frontend dependency installation in CI and Docker.
- `uv sync --locked` for backend dependency installation.
- Alembic for database migrations.
- Docker Compose remains the deployment topology with Caddy, frontend, and backend services.

**Testing Framework:**

- `@astrojs/check` for frontend type validation.
- `pytest` for backend tests.
- FastAPI TestClient or HTTPX for API tests.
- Ruff for Python formatting/linting.
- Golden renderer fixtures for Markdown, math, code highlighting, and `[[Log-N]]` cross-reference behavior.

**Code Organization:**

```text
/
├── apps/
│   ├── frontend/
│   │   ├── astro.config.mjs
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── islands/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── stores/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── public/
│   └── backend/
│       ├── pyproject.toml
│       ├── uv.lock
│       ├── alembic.ini
│       ├── app/
│       │   ├── main.py
│       │   ├── core/
│       │   ├── api/routes/
│       │   ├── db/
│       │   ├── domain/
│       │   ├── renderer/
│       │   └── media/
│       └── tests/
├── docker-compose.yml
└── Caddyfile
```

**Development Experience:**

- Astro dev server for frontend.
- `uv run fastapi dev app/main.py` for backend development.
- `uv run pytest`, `uv run ruff check`, and `uv run ruff format` for backend verification.
- Root Makefile should wrap common commands once scaffolding exists.

**Bun Assessment:**

Bun remains acceptable as a future frontend toolchain switch only if it becomes the exclusive frontend package manager and runtime contract:

- Commit `bun.lock`.
- Do not commit `package-lock.json`.
- Use `bun install --frozen-lockfile`.
- Use `bun run` for all frontend scripts.
- Base the frontend Docker image on `oven/bun:1`.
- Add a deployment smoke test proving the Astro production server starts and SSR/static routes work inside the Bun container.

Until that trade-off is explicitly reopened, frontend implementation uses npm + Node LTS.

**Note:** Project initialization using these commands should be the first implementation story after architecture, epics, and project context are updated for FastAPI.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Backend: FastAPI modular monolith.
- Frontend: Astro server output with prerendered public pages.
- Data: SQLite owned only by FastAPI.
- Migrations: Alembic.
- ORM/repository layer: SQLAlchemy 2.
- Auth: single-user opaque session cookie, not OAuth or multi-user auth.
- Renderer: FastAPI-owned Python ContentRenderer.
- Deployment: Docker Compose with Caddy, Astro Node, FastAPI/Uvicorn.
- Package managers: npm for frontend, uv for backend.

**Important Decisions (Shape Architecture):**

- Search: MiniSearch build-time client index.
- Editor preview: FastAPI `/api/render` endpoint.
- Syntax highlighting: Pygments.
- Math: backend math wrapping plus frontend KaTeX.
- Image processing: Pillow/WebP plus dimensions at upload time.
- Image placeholders: CSS-only LQIP metadata with solid-color fallback; no BlurHash/base83 runtime for MVP.
- API format: REST with `{ ok, data }` and `{ ok, error, message }`.

**Deferred Decisions (Post-MVP):**

- Search filtering/highlighting.
- RSS, sitemap, OG images.
- View transitions.
- Log graph visualization.
- Multiple FastAPI workers; start with one worker because SQLite is the write bottleneck.

### Data Architecture

Use SQLite with SQLAlchemy 2 repositories and Alembic migrations.

The schema keeps the existing product model:

- `posts` is the primary content table.
- Log entries are posts in the Log category.
- `previous_id` models sequential log chains.
- Tags are many-to-many via `post_tags`.
- Rendered HTML and excerpts are stored after backend rendering.
- Images are files with metadata rows.
- Sessions are backend-owned.

SQLite rules:

- Enable WAL mode.
- Keep transactions short.
- Only FastAPI mounts and writes the SQLite volume.
- Astro must never import SQLite libraries or read the DB directly.
- Alembic migrations are forward-only once applied to production.
- SQLite table-altering migrations use Alembic batch-mode patterns when needed.

### Authentication & Security

Use single-user password auth with server-side opaque sessions.

Decision:

- Login verifies one configured author password hash.
- Successful login creates a random session token.
- Store only a hashed session token server-side.
- Browser receives an HttpOnly cookie.
- Cookie is `Secure` in production and `SameSite=Strict`.
- Admin/write routes use FastAPI dependencies such as `require_current_user`.
- Local dev may use explicit CORS allowlist; production is same-origin through Caddy.
- Add login throttling/backoff.

Rationale:

- Easier revocation than stateless JWT.
- Matches single-author scope.
- Avoids OAuth and multi-user complexity.

### API & Communication Patterns

Use REST JSON over HTTP.

Core routes:

- Public: posts, categories, tags, health, rendered public content data.
- Authenticated: auth, editor/write APIs, render preview, uploads, search rebuild.

Response contract:

- Success: `{ "ok": true, "data": ... }`
- Error: `{ "ok": false, "error": "code", "message": "human text" }`

FastAPI implementation:

- Use `APIRouter` modules.
- Use Pydantic request/response schemas.
- Route functions stay thin: validate, call service/repository, return envelope.
- Use `UploadFile` for image uploads.
- Keep OpenAPI enabled for internal development, but do not treat it as a public API commitment for MVP.

### Frontend Architecture

Use Astro with `output: 'server'` and Node adapter standalone mode.

Rules:

- Public content pages use `export const prerender = true` where possible.
- Dynamic routes remain SSR only when required: admin/editor, log feed, auth-dependent surfaces.
- Preact islands are limited to Editor, LogFeed, and Search.
- Use Nano Stores only for cross-island state.
- Use local Preact state/signals for island-local state.
- Use `set:html` only with trusted backend-rendered post HTML.
- npm and Node v24 LTS are the frontend runtime/package baseline.

### Infrastructure & Deployment

Use three-service Docker Compose:

- `caddy`: public entrypoint, TLS, reverse proxy.
- `frontend`: Astro Node standalone server.
- `backend`: FastAPI through Uvicorn / `fastapi run app/main.py`.

Deployment rules:

- Backend runs Alembic migrations before app startup or as an explicit release step.
- Backend mounts SQLite and uploads volumes.
- Frontend never mounts SQLite.
- Caddy routes `/api/*` and media/upload paths to FastAPI.
- Start with one FastAPI worker.
- Health endpoint checks app, DB connectivity, and upload directory.
- `docker compose down -v` remains forbidden for production.

### Runtime Versions

Verified on 2026-06-20:

- Python: use Python 3.14 for new backend work.
- FastAPI: current PyPI release is 0.138.0 and supports Python 3.10-3.14.
- Node: use Node v24 LTS for frontend Docker/runtime.
- Astro: use current `npm create astro@latest` minimal template and lock exact versions in `package-lock.json`.
- Backend dependencies are locked through `uv.lock`.

### Decision Impact Analysis

**Implementation Sequence:**

1. Regenerate project context and epics to remove Go-specific instructions.
2. Scaffold npm/Astro frontend and uv/FastAPI backend.
3. Add SQLite, SQLAlchemy models, repositories, and Alembic.
4. Implement response envelope, errors, config, and health.
5. Implement ContentRenderer with golden tests.
6. Implement read APIs and SSG fetches.
7. Implement auth and protected write APIs.
8. Implement editor preview/write/upload flows.
9. Implement log chain/cross-reference behavior.
10. Implement MiniSearch build index.
11. Add Docker Compose, Caddy, CI, smoke tests, and backup guidance.

**Cross-Component Dependencies:**

- Astro build depends on FastAPI read APIs.
- Editor preview depends on ContentRenderer.
- Public rendering depends on stored backend-rendered HTML.
- Search depends on published content API output.
- Uploads depend on backend media storage and public routing.
- Auth gates all write/admin routes.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 8 areas where AI agents could make incompatible choices:

- database naming
- API naming
- Python/FastAPI module boundaries
- Astro/Preact file organization
- response envelope formats
- validation and error handling
- state management
- testing structure

### Naming Patterns

**Database Naming Conventions:**

- Tables: `snake_case` plural, e.g. `posts`, `categories`, `tags`, `post_tags`, `images`, `sessions`.
- Columns: `snake_case`, e.g. `published_at`, `category_id`, `previous_id`.
- Foreign keys: `{singular_table}_id`, e.g. `post_id`, `tag_id`, `category_id`.
- Indexes: `idx_{table}_{column}`, e.g. `idx_posts_slug`, `idx_post_tags_post_id`.
- Alembic revisions: concise slug names, e.g. `001_initial_schema`, `002_add_sessions`.

**API Naming Conventions:**

- Routes use plural nouns: `/api/posts`, `/api/categories`, `/api/tags`.
- FastAPI path params use `{slug}` / `{id}` syntax.
- Query params use `snake_case`, e.g. `category_slug`, `page_size`, `published_only`.
- Admin/write routes stay under `/api/admin/*` or protected route groups.
- Upload/media public paths use one convention: `/media/{filename}`.

**Code Naming Conventions:**

- Python modules: `snake_case.py`, e.g. `post_service.py`, `content_renderer.py`.
- Python functions/variables: `snake_case`.
- Python classes/Pydantic schemas: `PascalCase`, e.g. `PostRead`, `PostCreate`.
- Astro components: `PascalCase.astro`, e.g. `PostCard.astro`.
- Preact islands: `PascalCase.tsx`, e.g. `Editor.tsx`.
- TypeScript utilities/stores: `camelCase.ts`, e.g. `apiClient.ts`, `authStore.ts`.

### Structure Patterns

**Backend Organization:**

- `app/main.py` creates the FastAPI app and includes routers.
- `app/api/routes/` contains route modules only.
- `app/core/` contains config, security, errors, and response helpers.
- `app/db/` contains session setup, SQLAlchemy models, and migrations.
- `app/db/repositories/` contains database access.
- `app/domain/services/` contains business logic.
- `app/domain/schemas.py` or feature schema modules contain Pydantic models.
- `app/renderer/` contains Markdown, math, syntax highlighting, and log-reference logic.
- `app/media/` contains image validation, WebP conversion, dimensions, and optional CSS-only LQIP metadata generation.

**Frontend Organization:**

- `src/pages/` owns routing.
- `src/components/` contains static Astro components.
- `src/islands/` contains hydrated Preact islands only.
- `src/stores/` contains Nano Stores for cross-island state.
- `src/lib/` contains API clients and shared browser utilities.
- `src/styles/` contains Tailwind v4 CSS and design tokens.
- `ProseWrapper.astro` owns article `max-w-prose` / 65ch measure, `lh`-based rhythm, image placeholder classes, and named breakout escape hatches.
- No content collections for posts; content comes from FastAPI.

**Test Organization:**

- Backend tests live under `apps/backend/tests/`.
- API tests: `tests/api/`.
- Renderer golden tests: `tests/renderer/`.
- DB/repository/migration tests: `tests/db/`.
- Frontend checks use `npm run check` and targeted UI tests only when needed.

### Format Patterns

**API Response Formats:**

- Success envelope: `{ "ok": true, "data": ... }`
- Error envelope: `{ "ok": false, "error": "machine_code", "message": "Human readable message" }`
- Error codes use `snake_case`, e.g. `not_found`, `validation_error`, `unauthorized`.
- Datetimes are ISO 8601 strings.
- JSON fields use `snake_case`.
- Empty successful deletes return either `204 No Content` or `{ "ok": true, "data": null }`; choose per route and document in tests.

**Validation Format:**

- Request bodies use Pydantic models.
- Route handlers do not accept raw dicts except for truly dynamic payloads.
- Slugs are normalized in service/domain logic, not scattered across routes.
- Upload validation checks content type, size, dimensions, and extension before writing final files.

### Communication Patterns

**Backend-to-Frontend:**

- Astro and Preact call FastAPI through a shared frontend API utility.
- Browser requests use same-origin `/api/*` in production.
- Build-time Astro fetches use `API_URL`.
- All authenticated browser requests include credentials.

**State Management:**

- Nano Stores only for cross-island state: auth state, search modal/query.
- Preact local state/signals for editor-local and log-feed-local state.
- Do not use localStorage for auth tokens.
- Server remains the source of truth for draft/published status.

### Process Patterns

**Error Handling Patterns:**

- Raise domain-specific exceptions from services/repositories.
- Convert exceptions to envelope responses in shared FastAPI exception handlers.
- Do not handcraft inconsistent error dicts in each route.
- Log internal details server-side; return safe user-facing messages.
- Auth failures return `401`; missing resources return `404`; validation failures return `400` or FastAPI validation semantics consistently.

**Loading State Patterns:**

- Islands expose local `loading`, `error`, and `data` state.
- Loading UI is local to the island, not global.
- Failed editor save/publish keeps unsaved Markdown in the client state.
- Retry buttons call the same API utility path as the original request.

**Renderer Patterns:**

- The renderer is a service, not a route helper.
- Preview and publish use the same renderer entry point.
- Renderer tests use golden fixtures.
- Do not add a client-side Markdown parser for preview.
- Math, code, and `[[Log-N]]` behavior must be tested together because they can interfere.

### Enforcement Guidelines

**All AI Agents MUST:**

- Use npm for frontend commands and uv for backend commands.
- Preserve the API envelope.
- Keep SQLite access inside FastAPI only.
- Put route logic in routers, business rules in services, DB logic in repositories.
- Use Pydantic schemas for API boundaries.
- Use SQLAlchemy models/repositories for persistence.
- Use Alembic for schema changes.
- Add or update renderer golden tests for Markdown behavior changes.
- Keep Preact hydration limited to Editor, LogFeed, and Search unless architecture is reopened.

**Pattern Enforcement:**

- Backend verification: `uv run ruff format --check`, `uv run ruff check`, `uv run pytest`.
- Frontend verification: `npm run check`, `npm run build`.
- Architecture violations should be corrected in the story that introduces them, not deferred.
- If a story needs a new pattern, update architecture or project context before implementation proceeds.

### Pattern Examples

**Good Examples:**

- `app/api/routes/posts.py` defines route functions and delegates to `PostService`.
- `app/db/repositories/post_repository.py` owns SQLAlchemy post queries.
- `app/domain/services/post_service.py` handles slug normalization, draft/publish rules, and renderer calls.
- `app/renderer/content_renderer.py` is used by both publish and preview flows.
- `src/lib/apiClient.ts` wraps `fetch` with `credentials: "include"`.

**Anti-Patterns:**

- Importing SQLite or SQLAlchemy from Astro.
- Returning raw FastAPI dicts with inconsistent shapes.
- Creating `postService.ts` in the frontend to duplicate backend rules.
- Adding `marked`, `markdown-it`, or another client-side Markdown renderer for preview.
- Mixing `npm` and `bun` lockfiles.
- Running Alembic migrations by editing production SQLite manually.
- Adding Preact islands for static content.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
deppfellow-page/
├── README.md
├── package.json
├── package-lock.json
├── Makefile
├── docker-compose.yml
├── Caddyfile
├── .env.example
├── .gitignore
├── .editorconfig
├── .github/
│   └── workflows/
│       └── ci.yml
├── .docs/
│   └── bmad-output/
│       └── planning-artifacts/
│           └── architecture.md
├── apps/
│   ├── frontend/
│   │   ├── package.json
│   │   ├── astro.config.mjs
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Header.astro
│   │   │   │   ├── Footer.astro
│   │   │   │   ├── PostCard.astro
│   │   │   │   ├── ProseWrapper.astro
│   │   │   │   └── TagList.astro
│   │   │   ├── islands/
│   │   │   │   ├── Editor.tsx
│   │   │   │   ├── LogFeed.tsx
│   │   │   │   └── Search.tsx
│   │   │   ├── layouts/
│   │   │   │   └── BaseLayout.astro
│   │   │   ├── lib/
│   │   │   │   ├── apiClient.ts
│   │   │   │   └── content.ts
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── 404.astro
│   │   │   │   ├── login.astro
│   │   │   │   ├── admin/
│   │   │   │   │   └── editor/
│   │   │   │   │       ├── index.astro
│   │   │   │   │       └── [slug].astro
│   │   │   │   ├── articles/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [slug].astro
│   │   │   │   ├── projects/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [slug].astro
│   │   │   │   ├── log/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [slug].astro
│   │   │   │   └── tags/
│   │   │   │       ├── index.astro
│   │   │   │       └── [slug].astro
│   │   │   ├── stores/
│   │   │   │   ├── authStore.ts
│   │   │   │   └── searchStore.ts
│   │   │   └── styles/
│   │   │       └── input.css
│   │   └── public/
│   │       ├── fonts/
│   │       └── favicon.svg
│   └── backend/
│       ├── pyproject.toml
│       ├── uv.lock
│       ├── .python-version
│       ├── alembic.ini
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py
│       │   ├── api/
│       │   │   ├── __init__.py
│       │   │   └── routes/
│       │   │       ├── __init__.py
│       │   │       ├── auth.py
│       │   │       ├── posts.py
│       │   │       ├── categories.py
│       │   │       ├── tags.py
│       │   │       ├── render.py
│       │   │       ├── uploads.py
│       │   │       ├── search.py
│       │   │       └── health.py
│       │   ├── core/
│       │   │   ├── __init__.py
│       │   │   ├── config.py
│       │   │   ├── errors.py
│       │   │   ├── responses.py
│       │   │   └── security.py
│       │   ├── db/
│       │   │   ├── __init__.py
│       │   │   ├── session.py
│       │   │   ├── models.py
│       │   │   ├── repositories/
│       │   │   │   ├── post_repository.py
│       │   │   │   ├── category_repository.py
│       │   │   │   ├── tag_repository.py
│       │   │   │   ├── image_repository.py
│       │   │   │   └── session_repository.py
│       │   │   └── migrations/
│       │   │       ├── env.py
│       │   │       └── versions/
│       │   ├── domain/
│       │   │   ├── __init__.py
│       │   │   ├── schemas.py
│       │   │   └── services/
│       │   │       ├── auth_service.py
│       │   │       ├── post_service.py
│       │   │       ├── category_service.py
│       │   │       ├── tag_service.py
│       │   │       ├── upload_service.py
│       │   │       └── search_service.py
│       │   ├── renderer/
│       │   │   ├── __init__.py
│       │   │   ├── content_renderer.py
│       │   │   ├── markdown.py
│       │   │   ├── math.py
│       │   │   ├── code_highlight.py
│       │   │   └── logrefs.py
│       │   └── media/
│       │       ├── __init__.py
│       │       ├── images.py
│       │       └── lqip.py
│       └── tests/
│           ├── api/
│           ├── db/
│           ├── renderer/
│           │   └── fixtures/
│           └── conftest.py
└── scripts/
    ├── smoke-frontend.sh
    ├── smoke-backend.sh
    └── backup-sqlite.sh
```

### Architectural Boundaries

**API Boundaries:**

- Browser and Astro communicate with FastAPI only through `/api/*`.
- Public content endpoints expose published content only.
- Admin/write endpoints require authenticated session dependencies.
- Uploads use multipart form data through FastAPI.
- No frontend code imports backend models, SQLAlchemy, or SQLite.

**Component Boundaries:**

- Astro `.astro` components render static structure and server-fetched content.
- Preact islands own only interactive surfaces: Editor, LogFeed, Search.
- Nano Stores are only for cross-island UI state.
- API access is centralized in `src/lib/apiClient.ts`.
- Article readability rules stay centralized in `ProseWrapper.astro` and `src/styles/input.css`; individual pages must not hand-roll prose width.
- Article images must reserve dimensions and may receive CSS-only placeholder variables; baseline placeholder behavior must not require JavaScript.

**Service Boundaries:**

- FastAPI route modules do request/response handling only.
- Domain services own business rules.
- Repositories own SQLAlchemy persistence.
- Renderer modules own Markdown-to-HTML behavior.
- Media modules own upload/image processing, dimensions, and optional CSS-only LQIP metadata.

**Data Boundaries:**

- SQLite volume is mounted only into `backend`.
- Rendered HTML is persisted by backend services.
- Astro receives rendered content through API responses.
- Upload files are written by backend and exposed through Caddy/FastAPI media routing.
- Image placeholder metadata flows with rendered content/media metadata; Astro renders it as CSS custom properties without a client decoder.

### Requirements to Structure Mapping

| FR | Feature | Backend Location | Frontend Location |
|----|---------|------------------|-------------------|
| FR-1 | Split-pane editor | `routes/render.py`, `post_service.py` | `pages/admin/editor/`, `islands/Editor.tsx` |
| FR-2 | Math rendering | `renderer/math.py`, `content_renderer.py` | `ProseWrapper.astro`, KaTeX loading |
| FR-3 | Code highlighting | `renderer/code_highlight.py` | `ProseWrapper.astro` |
| FR-4 | Draft/publish | `routes/posts.py`, `post_service.py` | `Editor.tsx` |
| FR-5 | Editorial typography and 65ch reading measure | none | `ProseWrapper.astro`, `styles/input.css` |
| FR-6 | SSG page generation | read APIs | `articles/`, `projects/`, `tags/` |
| FR-7 | Sequential chain | `post_repository.py`, `post_service.py` | `log/[slug].astro` |
| FR-8 | Cross-references | `renderer/logrefs.py` | rendered via `set:html` |
| FR-9 | Infinite scroll | paginated posts API | `LogFeed.tsx` |
| FR-10 | Category navigation | `routes/categories.py` | `Header.astro` |
| FR-11 | Tag filtering | `routes/tags.py`, `tag_repository.py` | `pages/tags/` |
| FR-12 | 404 page | none | `pages/404.astro` |
| FR-13 | Auth | `routes/auth.py`, `security.py`, `auth_service.py` | `login.astro`, admin pages |
| FR-14 | Image upload, dimensions, CSS-only LQIP metadata | `routes/uploads.py`, `media/images.py` | `Editor.tsx`, `ProseWrapper.astro` |
| FR-15 | Search | `routes/search.py`, `search_service.py` | `Search.tsx`, build index |

### Integration Points

**Internal Communication:**

- Astro build-time: `API_URL` -> FastAPI read endpoints.
- Astro SSR: server-side fetch -> FastAPI read/auth endpoints.
- Preact islands: same-origin `/api/*` via `apiClient.ts`.
- FastAPI services: services call repositories and renderer, routes call services.

**External Integrations:**

- No external SaaS is required for MVP.
- KaTeX assets may be self-hosted or loaded conditionally with SRI if CDN is used.
- Docker Compose and Caddy are the deployment boundary.

**Data Flow:**

1. Author writes Markdown in `Editor.tsx`.
2. Preview calls `POST /api/render`.
3. Save/publish calls protected posts API.
4. FastAPI service renders Markdown and stores raw Markdown plus HTML.
5. Astro fetches published content during build or SSR.
6. Public pages render stored HTML with `set:html`.
7. Search index is generated from published FastAPI content data.

### File Organization Patterns

**Configuration Files:**

- Root `.env.example` documents shared deployment variables.
- Backend settings live in `app/core/config.py`.
- Frontend build env uses Astro/Vite environment conventions.
- Docker and Caddy config stay at repo root.
- CI lives in `.github/workflows/ci.yml`.

**Source Organization:**

- Frontend and backend remain separate under `apps/`.
- Shared contracts are documented in architecture, not imported across runtimes.
- Backend modules are organized by responsibility, not by route alone.

**Test Organization:**

- Backend tests mirror architecture boundaries: API, DB, renderer.
- Renderer fixtures are stored under `tests/renderer/fixtures/`.
- Frontend verification starts with type/build checks; browser tests can be added for critical flows.

**Asset Organization:**

- Frontend static assets live in `apps/frontend/public/`.
- Uploaded media lives in backend-managed storage volume, not frontend `public/`.
- Fonts are self-hosted under frontend `public/fonts/`.
- Uploaded image metadata stores width, height, generated WebP filename, and optional CSS-only LQIP values.
- CSS-only LQIP renders through static CSS/custom properties on the image element or wrapper; unsupported advanced CSS must fall back to a solid dominant/neutral color.
- Progressive JPEG may be used as an export/encoding optimization, but it does not replace reserved dimensions or CSS placeholder behavior.
- BlurHash/base83 is deferred until the project has enough dynamic or high-volume image handling to justify a decoder and metadata pipeline.

### Development Workflow Integration

**Development Server Structure:**

- `make dev` runs Astro and FastAPI together.
- Frontend command wraps `npm run dev`.
- Backend command wraps `uv run fastapi dev app/main.py`.

**Build Process Structure:**

- Backend dependencies install with `uv sync --locked`.
- Frontend dependencies install with `npm ci`.
- Astro build requires FastAPI health/read APIs available.
- Search index generation happens during or adjacent to Astro build.

**Deployment Structure:**

- Backend image runs Alembic migrations and FastAPI.
- Frontend image runs Astro Node standalone server.
- Caddy routes public traffic and owns TLS.
- Volumes persist SQLite, uploads, and backups.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

The architecture is coherent: Astro + FastAPI + SQLite + Caddy fit the sidecar model, and npm/Node plus uv/FastAPI keep frontend and backend tooling separate. The choices preserve the original performance strategy while replacing Go-specific backend implementation.

**Pattern Consistency:**

The implementation patterns support the decisions: FastAPI routers, services, repositories, Pydantic schemas, Alembic migrations, npm frontend commands, and uv backend commands are consistently defined.

**Structure Alignment:**

The project structure supports the architecture. Frontend, backend, tests, renderer, media, data access, and deployment boundaries are explicit.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

All 15 FRs are mapped to concrete backend and frontend locations.

**Non-Functional Requirements Coverage:**

Performance is addressed through prerendered pages, stored rendered HTML, upload-time image processing, minimal islands, and MiniSearch build-time indexing. Security is addressed through same-origin routing, HttpOnly cookies, protected dependencies, and backend-only SQLite access.

### Implementation Readiness Validation ✅

**Decision Completeness:**

Critical backend, frontend, data, auth, rendering, deployment, and tooling decisions are documented.

**Structure Completeness:**

The directory tree is specific enough for AI agents to scaffold consistently.

**Pattern Completeness:**

Naming, response formats, state management, error handling, renderer behavior, testing, and anti-patterns are documented.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps:**

- Existing `epics.md` still contains Go-specific stories and must be regenerated before implementation.
- Existing `project-context.md` still contains Go-specific agent rules and must be regenerated before implementation.

**Minor Corrections Applied:**

- Standardize backend runtime wording to Python 3.14.
- Use one npm workspace lockfile at repository root; do not create a nested frontend lockfile.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION, after epics and project context are regenerated from this architecture.

**Confidence Level:** High.

**Key Strengths:**

- Clear runtime split: Astro renders, FastAPI owns data and writes.
- Renderer source-of-truth is preserved.
- SQLite ownership is explicit.
- AI-agent conflict points are documented.
- Deployment path stays Docker Compose and Caddy, avoiding platform expansion.

**Areas for Future Enhancement:**

- Add RSS, sitemap, OG images, and search highlighting after MVP.
- Revisit Bun only if local frontend speed becomes more valuable than deployment predictability.
- Consider multiple FastAPI workers only after measuring SQLite behavior.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow the architecture exactly.
- Use npm for frontend and uv for backend.
- Do not revive Go/goldmark/Chroma/goose decisions.
- Do not let Astro access SQLite.
- Keep renderer behavior covered by golden tests.
- Regenerate epics and project context before implementation starts.

**First Implementation Priority:**

Regenerate `epics.md`, `project-context.md`, and sprint status around FastAPI before code implementation begins.
