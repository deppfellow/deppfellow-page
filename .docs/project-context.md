> **RETIRED — 2026-08-24.** Authoring moved into the Obsidian vault (`deppfellow-wiki`), which deleted the on-site write path this document was built around. The surviving architectural decisions now live as ADRs in the wiki's `.docs/adr/`; the wiki's `.docs/PHASES.md` records the current plan. Do not use this file as implementation guidance.

---

---
project_name: 'deppfellow-page'
user_name: 'Deppfellow'
date: '2026-06-21'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 207
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

Verified 2026-06-21. Use the current stable FastAPI architecture from the PRD, architecture, and epics. Existing Go backend files are stale conflict artifacts, not implementation guidance.

### Runtime Baselines

| Technology | Version / Baseline | Role | Agent Notes |
|-----------|---------------------|------|-------------|
| Python | 3.14.6 | Backend runtime | Use Python 3.14 for new backend work. |
| Node.js | >=24.16.x; latest LTS 24.17.0 | Frontend runtime | Keep `engines.node` and Docker aligned to Node 24 LTS. |
| npm | Bundled with Node 24.x | Frontend package manager | Use npm and the root `package-lock.json`; do not introduce Bun by default. |
| SQLite | 3.53.2 | Database | Owned only by FastAPI; enable WAL; start with one backend worker. |
| Caddy | 2.x stable | Reverse proxy | Pin the Docker image during deployment work; route `/api/*` and media paths to FastAPI. |

### Backend Packages

| Package | Latest Stable | Role | Agent Notes |
|---------|---------------|------|-------------|
| FastAPI | 0.138.0 | API framework | Modular monolith with routers, services, repositories, dependencies, and Pydantic schemas. |
| SQLAlchemy | 2.0.51 | Data access | Use SQLAlchemy 2 style through repositories; route handlers must not query directly. |
| Alembic | 1.18.4 | Migrations | Forward-only in production; use batch mode for SQLite table alterations. |
| pydantic-settings | 2.14.2 | Config | Centralize env parsing under `app/core/`. |
| PyJWT | 2.13.0 | Auth tooling | Architecture prefers opaque server-side sessions; use JWT only if that decision is reopened. |
| markdown-it-py | 4.2.0 | Markdown rendering | Backend-owned ContentRenderer source of truth. |
| mdit-py-plugins | 0.6.1 | Markdown extensions | Use for footnotes and compatible Markdown extensions. |
| Pygments | 2.20.0 | Syntax highlighting | Server-side highlighting; replaces old Chroma guidance. |
| Pillow | 12.2.0 | Image processing | Convert uploads to WebP, extract dimensions, and optionally generate CSS-only LQIP metadata at upload/build time; never on reader request paths. |
| python-multipart | 0.0.32 | Upload parsing | Required for FastAPI upload routes. |
| pytest | 9.1.1 | Backend tests | Use with HTTPX/TestClient and temporary SQLite/upload fixtures. |
| HTTPX | 0.28.1 | API testing/client | Use for FastAPI tests where appropriate. |
| Ruff | 0.15.18 | Python lint/format | Required backend quality gate. |

### Frontend Packages

| Package | Latest Stable | Role | Agent Notes |
|---------|---------------|------|-------------|
| Astro | 6.4.8 | Frontend framework | Use `output: 'server'`; prerender public pages where possible. |
| @astrojs/node | 10.1.4 | Astro Node adapter | Use standalone mode for production frontend service. |
| @astrojs/preact | 5.1.5 | Preact integration | Hydrate only approved islands. |
| Preact | 10.29.2 | Interactive islands | Editor, LogFeed, and Search only unless architecture is reopened. |
| @preact/signals | 2.9.2 | Island-local state | Do not use for cross-island state. |
| Nano Stores | 1.3.0 | Cross-island state | Auth/search state only; no auth tokens in storage. |
| @nanostores/preact | 1.1.0 | Preact bindings | Use only when an island consumes a Nano Store. |
| Tailwind CSS | 4.3.1 | Styling | CSS-first via `@tailwindcss/vite`; no `tailwind.config.js` by default. |
| @tailwindcss/vite | 4.3.1 | Tailwind Vite plugin | Keep Tailwind configured through Vite and CSS directives. |
| MiniSearch | 7.2.0 | Client-side search | Build index from FastAPI published-content data; Astro never reads SQLite. |
| @astrojs/check | 0.9.9 | Frontend type checks | Required frontend quality gate. |
| TypeScript | 6.0.3 | Frontend type checking | Keep strict Astro config. |

### Target Monorepo Layout

```
deppfellow-page/
├── apps/
│   ├── frontend/       # Astro project (SSG/SSR, Preact islands)
│   └── backend/        # FastAPI app managed by uv
├── package.json        # Root workspace config
├── package-lock.json   # npm lockfile
├── docker-compose.yml  # 3 services: caddy, frontend, backend
└── Caddyfile           # Reverse proxy routing
```

### Critical Version Constraints

1. **FastAPI replaces Go.** Do not implement new backend work in Go, Chi, goose, goldmark, or Chroma.
2. **uv is the backend dependency authority.** Do not mix pip, Poetry, or Pipenv workflows into the backend project.
3. **npm is the frontend dependency authority.** Do not add Bun unless the architecture decision is explicitly reopened.
4. **Node baseline is `>=24.16.x`.** Latest verified LTS is 24.17.0; keep frontend Docker/runtime on Node 24 LTS.
5. **Astro uses `output: 'server'`.** Public pages should use `export const prerender = true` where possible.
6. **Tailwind v4 is CSS-first.** Use `@theme` and `@source`; do not add `tailwind.config.js` by default.
7. **FastAPI must run during Astro build.** SSG pages and MiniSearch data are fetched from FastAPI, never from SQLite directly.
8. **SQLite is backend-owned.** Only FastAPI mounts/writes the DB volume; Astro never imports SQLite libraries.

### Top Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Agents follow current Go files | Treat Go scaffold as stale conflict artifact; use approved FastAPI planning docs. |
| FastAPI or Astro versions drift | Install latest stable intentionally, commit `uv.lock` and `package-lock.json`, and run full checks. |
| Astro reads SQLite directly | Force all content data through FastAPI read APIs. |
| SSG build has empty content | Add build-time FastAPI health/data checks before `astro build`. |
| Tailwind misses island files | Keep `@source` coverage for all frontend `src/` paths, including `.tsx` islands. |
| Search leaks drafts | Generate MiniSearch data only from published FastAPI endpoints. |
| Uploads slow reader paths | Process with Pillow/WebP at upload time only. |

## Critical Implementation Rules

### Language-Specific Rules

**Python / FastAPI Backend:**
- New backend code is Python only; existing Go code is stale conflict context.
- Python modules use `snake_case.py`; functions and variables use `snake_case`; classes and Pydantic schemas use `PascalCase`.
- Use modern Python 3.14 typing syntax where clear: `str | None`, `list[PostRead]`, `dict[str, Any]`.
- Route handlers must stay thin: validate input, call a service/repository/renderer, return a response envelope.
- Raise domain-specific exceptions from services/repositories; convert them through shared FastAPI exception handlers.
- Log internal errors server-side; return safe `{ ok, error, message }` responses to clients.
- Pydantic models define API boundaries; do not accept raw `dict` payloads unless the payload is intentionally dynamic.
- SQLAlchemy access belongs in repositories, not route handlers or frontend code.
- Config belongs in `app/core/config.py` via `pydantic-settings`; do not read environment variables ad hoc across modules.
- Use `uv` for dependency and command execution; do not mix backend package managers.

**TypeScript / Astro / Preact Frontend:**
- Keep TypeScript strict through `astro/tsconfigs/strict`.
- Astro components use `PascalCase.astro`; Preact islands use `PascalCase.tsx`; utilities/stores use `camelCase.ts`.
- Prefer `interface` for object-shaped API contracts unless a union, mapped type, or primitive alias is required.
- Centralize browser API calls in `src/lib/apiClient.ts`; authenticated requests must include credentials.
- Browser requests use same-origin `/api/*`; build-time/SSR fetches use configured `API_URL`.
- Use `set:html` only with trusted backend-rendered HTML from FastAPI.
- Do not add client-side Markdown parsing for preview; preview calls the FastAPI renderer.
- `@preact/signals` is island-local only; Nano Stores are only for cross-island state.
- Never store auth tokens in `localStorage`, `sessionStorage`, or Nano Stores.

**SQL / SQLite:**
- Tables use plural `snake_case`: `posts`, `categories`, `tags`, `post_tags`, `images`, `sessions`.
- Columns use `snake_case`: `published_at`, `category_id`, `previous_id`.
- Foreign keys use `{singular_table}_id`: `post_id`, `tag_id`, `category_id`.
- Indexes use `idx_{table}_{column}` or `idx_{table}_{purpose}`.
- Migrations are Alembic revisions, not goose SQL files.
- Production migrations are forward-only; never hand-edit production SQLite schema/data as a migration substitute.
- Use Alembic batch mode for SQLite table alterations when needed.

### Framework-Specific Rules

**Astro:**
- `astro.config.mjs` uses `output: 'server'` with `@astrojs/node` standalone mode and `server.host = true` for containers.
- In server output mode, public static routes must explicitly export `const prerender = true`.
- Dynamic admin/auth surfaces can remain SSR; public post/category/tag pages should be prerendered where possible.
- Use `getStaticPaths` for prerendered dynamic content routes fed by FastAPI read APIs.
- Astro components render static HTML by default; do not add client directives unless the component is one of the approved islands.
- Use Preact islands only for `Editor`, `LogFeed`, and `Search`; ordinary reading pages must not hydrate.
- Use `set:html` only for backend-rendered HTML that has passed the ContentRenderer sanitizer policy.

**FastAPI:**
- Build `apps/backend/app/main.py` as the application entry point and include routers from `app/api/routes/`.
- Keep route modules grouped by domain: `health`, `posts`, `categories`, `tags`, `auth`, `render`, `uploads`, `search`.
- Use FastAPI dependencies for auth/session boundaries, database session injection, and reusable request context.
- Use shared exception handlers for domain errors; do not repeat error-envelope construction inside each route.
- Public read routes return published content only; admin/write routes require authenticated dependencies.
- Keep OpenAPI useful for internal development, but do not treat it as a public API contract for MVP.
- Production runs via FastAPI/Uvicorn, with one backend worker until SQLite concurrency is deliberately revisited.

**SQLAlchemy 2 / Alembic:**
- Define declarative models with SQLAlchemy 2 `Mapped[...]` and `mapped_column(...)` style.
- Create one session dependency/unit-of-work boundary per request or service operation.
- Use explicit transaction scopes: `with session.begin():` for ORM work, `with engine.begin():` for Core migration/support scripts.
- Repositories receive a session and own queries; they do not create global sessions internally.
- Services coordinate repositories and renderer/media operations; they own commit/rollback decisions where multi-step changes must be atomic.
- Alembic owns schema changes; do not call `Base.metadata.create_all()` outside tests or local throwaway setup.
- SQLite WAL, foreign keys, and pragmatic DB setup belong in one DB initialization path, not scattered across repositories.

**Preact / Nano Stores:**
- `Editor.tsx` owns editor-local draft, preview, saving, and error state locally.
- `LogFeed.tsx` owns pagination/loading/retry state locally and uses Intersection Observer.
- `Search.tsx` loads the static MiniSearch asset and owns query/results state locally unless a cross-island search trigger is needed.
- Nano Stores are only for cross-island UI state; never use them for raw auth/session secrets.
- `@preact/signals` is allowed for island-local state, not as a global app store.

**Tailwind CSS v4:**
- Configure Tailwind through CSS: `@import "tailwindcss";`, `@theme`, and `@source`.
- Use `@tailwindcss/vite` in Astro/Vite config; do not add PostCSS or Tailwind JS config by default.
- Put project tokens in `src/styles/input.css`; avoid scattering literal colors when a token exists.
- Ensure `@source` covers all frontend source paths that contain classes, including `.astro` and `.tsx` files.
- Article prose must use `max-w-prose` or explicit `max-width: 65ch`; do not replace article measure with viewport-scaled widths.
- Use `lh` units for prose rhythm where text spacing is the driver: paragraphs, headings, figures, captions, and article metadata.
- Keep article width/rhythm rules centralized in `ProseWrapper.astro` and `src/styles/input.css`; do not duplicate per page.
- If a legacy JS config becomes unavoidable, it must be explicitly loaded with `@config`; do not assume v4 auto-detects it.

**ContentRenderer:**
- The renderer is a backend service, not a FastAPI route helper and not frontend code.
- Preview, draft save, publish, and search-index preparation use the same renderer entry point.
- Math, code highlighting, sanitizer behavior, and `[[Log-N]]` resolution must be tested together because syntax interactions can collide.
- KaTeX assets load only for rendered content that actually contains math markers/metadata.

### Testing Rules

**Backend Quality Gates:**
- Backend checks are `uv run ruff format --check`, `uv run ruff check`, and `uv run pytest`.
- Do not use `go test` for new backend work; existing Go tests are stale conflict artifacts.
- Backend tests live under `apps/backend/tests/`, not beside implementation files.
- Test groups mirror architecture boundaries: `tests/api/`, `tests/db/`, `tests/renderer/`.
- Use `tests/conftest.py` for temporary SQLite DBs, upload directories, environment overrides, seeded content, and FastAPI dependency overrides.

**API Tests:**
- Use FastAPI TestClient or HTTPX.
- Every endpoint test should assert the shared envelope shape: success `{ ok, data }`, error `{ ok, error, message }`.
- Public read API tests must prove drafts are excluded.
- Protected route tests must cover unauthenticated, authenticated, and invalid/expired session cases.
- Upload tests must cover invalid type, over-10MB rejection, valid WebP conversion, and safe filename/path behavior.

**Database / Migration Tests:**
- Alembic must be able to create the schema from scratch against a temporary SQLite DB.
- Repository tests use temporary SQLite fixtures, not production/dev database files.
- Test SQLite pragmas that matter to behavior: WAL mode and foreign keys.
- Test core constraints: unique slugs, tag normalization, category references, `previous_id` log chains, and draft/published filters.
- Do not use `Base.metadata.create_all()` as a substitute for migration tests.

**Renderer Tests:**
- Renderer behavior changes require golden tests under `tests/renderer/fixtures/`.
- Golden fixtures must cover Markdown, footnotes, typography replacements, sanitizer behavior, math, code highlighting, and `[[Log-N]]`.
- Math tests must include `$...$`, `$$...$$`, `\(...\)`, `\[...\]`, currency false positives, and dollar signs inside code blocks.
- Log reference tests must cover valid references, missing references, unpublished references, and references inside math/code contexts.
- Preview and publish paths must be tested against the same renderer entry point.

**Frontend Verification:**
- Frontend quality gates are `npm run check` and `npm run build`.
- Public reading pages should remain static/unhydrated except approved math assets and approved islands.
- Astro build tests/smoke checks must fail clearly when FastAPI content APIs are unavailable.
- Browser/e2e tests are targeted only for critical flows: public render, login/write boundary, preview parity, upload, log infinite scroll, and search.
- Search verification must prove draft content is absent from generated MiniSearch data.

**Smoke / Deployment Tests:**
- Add smoke checks for FastAPI health, at least one public Astro route, and Caddy routing once Docker Compose exists.
- Health checks must include app status, DB connectivity, and upload directory accessibility.
- Deployment verification must not use destructive commands such as `docker compose down -v`.

### Code Quality & Style Rules

**Formatting / Linting:**
- Backend formatting is Ruff-owned: `uv run ruff format --check` must pass before delivery.
- Backend linting is Ruff-owned: `uv run ruff check` must pass before delivery.
- Frontend type/build quality is Astro/npm-owned: `npm run check` and `npm run build` must pass before delivery.
- Do not introduce ESLint, Prettier, or extra formatters unless a story explicitly adds that toolchain.
- Do not format or rewrite stale Go files while migrating unless the story is specifically removing/replacing them.

**Backend Organization:**
- `app/api/routes/` contains route modules only; no SQLAlchemy queries or renderer internals in routes.
- `app/core/` owns config, security, errors, and response helpers.
- `app/db/` owns sessions, models, migrations, and repositories.
- `app/domain/services/` owns business rules: slug normalization, draft/publish state, auth decisions, and cross-repository workflows.
- `app/renderer/` owns Markdown, math, code highlighting, sanitizer, and log-reference logic.
- `app/media/` owns image validation, WebP conversion, dimensions, media filenames, and optional CSS-only LQIP metadata.

**Frontend Organization:**
- `src/pages/` owns Astro routes.
- `src/components/` contains static Astro components only.
- `src/components/ProseWrapper.astro` owns article reading measure, prose rhythm, backend-rendered HTML styling, image placeholder classes, and named breakout escape hatches.
- `src/islands/` contains hydrated Preact components only.
- `src/lib/` contains API clients and shared frontend utilities.
- `src/stores/` contains Nano Stores only when state crosses island boundaries.
- `src/styles/input.css` owns Tailwind v4 tokens and global style layers.
- Do not use Astro content collections for posts; content comes from FastAPI.

**Naming Conventions:**
- API routes use plural nouns: `/api/posts`, `/api/categories`, `/api/tags`.
- Admin/write APIs stay under `/api/admin/*` or protected route groups.
- Query params and JSON fields use `snake_case`.
- Error codes use `snake_case`: `not_found`, `validation_error`, `unauthorized`.
- Datetimes are ISO 8601 strings.
- Alembic revision names are concise and ordered, e.g. `001_initial_schema`, `002_add_sessions`.

**Documentation / Comments:**
- Keep comments sparse; explain invariants, security boundaries, renderer edge cases, and migration hazards.
- Add comments when a rule is easy to violate, such as math delimiter false positives or SQLite batch-mode migration constraints.
- Put architecture decisions in `.docs/bmad-output/planning-artifacts/architecture.md` or this context file, not scattered source comments.
- Update this file when a story introduces a durable implementation rule.

**API Contract Style:**
- Preserve success envelope `{ "ok": true, "data": ... }`.
- Preserve error envelope `{ "ok": false, "error": "machine_code", "message": "Human readable message" }`.
- Use explicit Pydantic response models for stable API shapes.
- Choose either `204 No Content` or `{ "ok": true, "data": null }` for empty deletes per route and lock it in tests.

### Development Workflow Rules

**Dependency Workflow:**
- Frontend dependencies are installed with `npm ci` from the root `package-lock.json`.
- Backend dependencies are installed with `uv sync --locked`; commit `uv.lock`.
- Do not create nested frontend lockfiles under `apps/frontend/`.
- Do not mix npm with Bun, pnpm, or yarn unless the architecture decision is explicitly reopened.
- Do not mix uv with Poetry, Pipenv, or ad hoc pip workflows.

**Local Development:**
- `make dev` should run Astro and FastAPI together once the FastAPI scaffold exists.
- Frontend dev command wraps `npm run dev`.
- Backend dev command wraps `uv run fastapi dev app/main.py`.
- Astro build-time content fetches require FastAPI health/read APIs to be available.
- Use same-origin `/api/*` for browser requests; use `API_URL` for Astro build/SSR fetches.

**Build / CI Workflow:**
- CI installs frontend with `npm ci`.
- CI installs backend with `uv sync --locked --all-extras --dev`.
- CI runs frontend checks/build and backend Ruff/pytest checks.
- CI should fail on stale Go implementation guidance only if the current story is expected to remove or replace the stale Go scaffold.
- Search index generation runs during or adjacent to Astro build and must fail clearly if FastAPI search data cannot be fetched.

**Migration Workflow:**
- Alembic migrations run before backend app startup or as an explicit release step.
- Never edit an applied migration; add a new migration.
- Never edit production SQLite manually as a substitute for a migration.
- SQLite table alterations require Alembic batch-mode patterns.
- Migration failure must block deployment.

**Docker / Deployment Workflow:**
- Production topology is Docker Compose with `caddy`, `frontend`, and `backend` services.
- Caddy owns TLS and routes `/api/*` plus media paths to FastAPI; all other routes go to Astro.
- Backend image runs Alembic migrations and FastAPI/Uvicorn.
- Frontend image runs Astro Node standalone server on Node 24 LTS.
- Volumes persist SQLite, uploads, and backups.
- Never run `docker compose down -v` in production.

**Operational Workflow:**
- Health endpoint must check app status, DB connectivity, and upload directory accessibility.
- Logs must avoid sensitive data while covering status, latency, failed login, render, upload, migration, and SQLite lock/database errors.
- Backup workflow must include SQLite and uploaded media.
- Smoke checks should cover FastAPI health, at least one public Astro route, and Caddy routing after Docker Compose exists.

**Planning Artifact Workflow:**
- Treat the current Go scaffold and old Go context as stale until replaced.
- Before implementation resumes, search planning artifacts for stale `Go`, `Chi`, `goose`, `goldmark`, `Chroma`, and `go test` guidance.
- If a story introduces a durable new convention, update architecture or project context in the same milestone.

### Critical Don't-Miss Rules

#### Anti-Patterns to Avoid

**Architecture Anti-Patterns:**
- Do not revive Go, Chi, goose, goldmark, Chroma, `go test`, `go.mod`, or Go `internal/` patterns for new backend work.
- Do not treat existing Go backend files as source-of-truth architecture; they are stale conflict artifacts.
- Do not use a full-stack FastAPI template, generic cookiecutter, or framework-generated layout that conflicts with the approved folder structure.
- Do not let Astro import SQLite, SQLAlchemy, backend models, or repository code.
- Do not add PostgreSQL, OAuth, comments, realtime collaboration, WYSIWYG, or multi-user auth for MVP.

**Rendering / Content Gotchas:**
- Do not add `marked`, frontend `markdown-it`, `remark`, Shiki, or any client-side preview renderer.
- Preview and publish must share the same FastAPI ContentRenderer path.
- Renderer output must be sanitized before `set:html`; never trust raw author Markdown as HTML.
- Math delimiters must not render inside code blocks or ordinary currency text.
- `[[Log-N]]` references must not resolve inside code or math contexts.
- Footnote IDs need collision protection on aggregate pages.
- Drafts must never appear in public APIs, prerendered pages, category/tag pages, or search data.

**Security Rules:**
- Auth uses HttpOnly cookies; never put session secrets or tokens in `localStorage`, `sessionStorage`, Nano Stores, or rendered HTML.
- Production cookies must be `Secure` and `SameSite=Strict`.
- Validate `Origin` on write endpoints where applicable.
- Uploads must reject unsafe paths, unsupported types, and files over 10MB.
- Serve uploaded media from backend-managed storage; do not write uploads into frontend `public/`.
- Store image width/height metadata so public pages reserve space before image decode.
- CSS-only LQIP is the approved placeholder direction; do not add BlurHash/base83 canvas decoding or client placeholder JS unless architecture is reopened.
- CSS-only LQIP must have a solid dominant/neutral color fallback for browsers that do not support advanced CSS decoding.
- Logs must not include passwords, raw session tokens, cookie values, or full uploaded file contents.

**Performance Gotchas:**
- Public reader routes must avoid request-time Markdown rendering and request-time image processing.
- Ordinary reading pages should ship no Preact hydration.
- Average JavaScript per page must stay under the 15KB target; adding an island requires architectural justification.
- Image conversion, dimension extraction, and optional LQIP metadata generation happen at upload/build time.
- Progressive JPEG may be used as an encoding optimization, but it does not replace reserved dimensions or CSS placeholder behavior.
- MiniSearch uses a build-time static index; do not add server-side search queries for MVP.
- Astro build must fail clearly if FastAPI content/search data is unavailable.

**Data / Operations Gotchas:**
- SQLite is the only MVP database; do not introduce external DB infrastructure.
- Start with one FastAPI worker; revisit only after measuring SQLite behavior.
- Enable WAL and foreign keys in the central DB setup path.
- Alembic migration failure blocks startup/deploy.
- Never run `docker compose down -v` in production.
- Backup both SQLite and uploaded media, not just the database.
- Caddy must sit in front of frontend/backend in production; do not expose FastAPI directly as the public site.

**Planning Consistency Rules:**
- If PRD, architecture, epics, and project context disagree, stop and resolve the artifact conflict before coding.
- Run a stale-language search for `Go`, `Chi`, `goose`, `goldmark`, `Chroma`, and `go test` before implementation resumes.
- Update this context when a new durable convention is introduced.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Treat current Go backend files as stale until a story explicitly replaces them
- Update this file when durable new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-06-21
