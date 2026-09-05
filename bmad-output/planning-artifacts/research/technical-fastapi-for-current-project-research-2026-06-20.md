---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - ".docs/bmad-output/project-context.md"
  - ".docs/bmad-output/planning-artifacts/prds/prd-deppfellow-page-2026-05-31/prd.md"
  - ".docs/bmad-output/planning-artifacts/architecture.md"
  - ".docs/bmad-output/planning-artifacts/epics.md"
workflowType: 'research'
lastStep: 6
research_type: 'technical'
research_topic: 'FastAPI for deppfellow-page backend architecture'
research_goals: 'Assess FastAPI as a replacement for the current Go sidecar decision, with emphasis on performance, developer experience, library support, integration with Astro, SQLite, Markdown rendering, image upload, auth, deployment, and BMad document refactoring.'
user_name: 'Deppfellow'
date: '2026-06-20'
web_research_enabled: true
source_verification: true
current_step_status: 'complete'
---

# Research Report: Technical

**Date:** 2026-06-20
**Author:** Deppfellow
**Research Type:** Technical

---

## Research Overview

This research evaluates whether the deppfellow-page backend architecture should change from the current Go sidecar decision to a Python FastAPI sidecar while preserving the product goals: fast public reading, low-friction authoring, SQLite persistence, server-side Markdown rendering, image upload, single-user auth, and an Astro frontend with minimal JavaScript.

The current BMad artifacts are Go-specific in the PRD, architecture, epics, implementation stories, and project context. This report treats FastAPI as the proposed backend decision and identifies stack, integration, rendering, and operational changes required before refactoring those documents.

Sources were verified against current official documentation where possible: FastAPI, SQLAlchemy, Alembic, SQLite, KaTeX, mdit-py-plugins, markdown-it-py, Pydantic, Uvicorn, Astro, MiniSearch, Pillow, pytest, uv, Ruff, and HTTPX.

---

## Technical Research Scope Confirmation

**Research Topic:** FastAPI for deppfellow-page backend architecture

**Research Goals:** Assess FastAPI as a replacement for the current Go sidecar decision, with emphasis on performance, developer experience, library support, integration with Astro, SQLite, Markdown rendering, image upload, auth, deployment, and BMad document refactoring.

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Project-specific interpretation against the existing BMad context

**Scope Confirmed:** 2026-06-20

---

## Technology Stack Analysis

### Programming Languages

**Recommendation:** Use Python for the backend and keep TypeScript for the Astro frontend.

FastAPI is technically suitable because the backend is content, authoring, and API-heavy rather than raw-throughput-heavy. Python improves development velocity for Markdown rendering, image processing, scripting, admin workflows, and tests. Go remains stronger for raw request throughput, memory efficiency, and single-binary deployment, but those advantages do not dominate this project if public pages are prerendered, rendered HTML is cached, and image processing happens at upload time.

Use Python 3.12+ or 3.13+ with explicit type hints, Pydantic models, Ruff, pytest, and CI checks to recover much of the discipline that the current Go documents tried to enforce through static typing and simple binaries.

**Performance interpretation:** Go is the better low-level runtime. FastAPI is "fast enough" for the expected product shape if expensive work is not done on reader request paths.

**Confidence:** High.

**Sources:**

- FastAPI features: https://fastapi.tiangolo.com/features/
- Pydantic docs: https://pydantic.dev/docs/validation/latest/get-started/

### Development Frameworks and Libraries

**Recommendation:** Use FastAPI as the backend web framework.

FastAPI supports the core backend requirements:

- Pydantic request and response validation
- automatic OpenAPI and Swagger UI documentation
- dependency injection for settings, database sessions, auth, and service objects
- CORS middleware
- file upload handling
- response cookies and security utilities
- Starlette features such as sessions, cookies, streaming responses, static files, background tasks, and testing support

Recommended backend dependency set:

```text
fastapi[standard]
uvicorn
pydantic-settings
sqlalchemy
alembic
pyjwt or python-jose
pwdlib or passlib[argon2/bcrypt]
markdown-it-py
mdit-py-plugins
pygments
pillow
pytest
httpx
ruff
uv
```

For Markdown parsing, prefer `markdown-it-py` plus `mdit-py-plugins`. `markdown-it-py` follows CommonMark baseline parsing and has plugin support. Python-Markdown is mature and extensible, but its own documentation says it is not a CommonMark implementation, which is a mismatch for predictable modern Markdown behavior.

For syntax highlighting, replace Go Chroma with Pygments. Preserve the architectural rule: highlighting is server-side and no client-side highlighter is shipped for article pages.

**Confidence:** High.

**Sources:**

- FastAPI features: https://fastapi.tiangolo.com/features/
- markdown-it-py: https://markdown-it-py.readthedocs.io/en/latest/
- Python-Markdown: https://python-markdown.github.io/
- Pygments docs: https://pygments.org/docs/

### Database and Storage Technologies

**Recommendation:** Keep SQLite. Use SQLAlchemy 2 and Alembic.

SQLite remains appropriate because the product is single-author, low-ops, VPS-friendly, and mostly read-heavy. The important boundary remains: only the backend writes to SQLite. Astro should not install SQLite libraries or write to the database.

Recommended database stack:

- SQLAlchemy 2 for SQL and ORM access
- Alembic for migrations
- SQLite WAL mode
- short transactions
- explicit indexes for slugs, status, published dates, categories, tags, and sessions
- rendered HTML cached in the `posts` table at save or publish time

SQLAlchemy 2 documents SQLite-specific pooling and thread behavior. Alembic supports SQLite migrations, but SQLite table-altering migrations often require batch mode, which creates a temporary table, copies data, drops the original, and renames the temporary table.

**SQLite performance rule:** WAL mode improves read/write concurrency, but SQLite still has one writer at a time. FastAPI async does not remove that database constraint.

**Confidence:** High, with migration caveat.

**Sources:**

- SQLAlchemy SQLite docs: https://docs.sqlalchemy.org/en/20/dialects/sqlite.html
- Alembic SQLite batch migrations: https://alembic.sqlalchemy.org/en/latest/batch.html
- SQLite WAL: https://www.sqlite.org/wal.html

### Mathematical Notation Decision

**Decision:** Use the FastAPI ContentRenderer to detect math syntax, then use KaTeX on the frontend to render it visually.

Recommended flow:

```text
Markdown source
  -> FastAPI ContentRenderer
  -> markdown-it-py + mdit-py-plugins texmath
  -> HTML with math nodes/classes
  -> Astro renders post.html with set:html
  -> KaTeX renders math in browser
```

Supported authoring delimiters:

```md
Inline: $E = mc^2$

Block:
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Safer inline alternative:
\(E = mc^2\)

Safer block alternative:
\[
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\]
```

The PRD already expects `$...$` and `$$...$$`, so those should remain supported. Also support `\(...\)` and `\[...\]` because KaTeX auto-render defaults favor those forms and they reduce ambiguity in prose.

Do not render math from raw Markdown in a separate client-side editor renderer. The editor preview must call the same FastAPI render endpoint used for persisted HTML.

Key tests:

- `$E=mc^2$` becomes inline math
- `$$...$$` becomes block math
- `\(...\)` and `\[...\]` render correctly
- code blocks containing `$` are not treated as math
- prose such as `$5`, `cost is $10`, shell prompts, and escaped dollars are not incorrectly rendered as math

**Confidence:** High.

**Sources:**

- KaTeX autorender and renderToString docs: https://github.com/katex/katex/blob/main/docs/autorender.md
- KaTeX API docs: https://github.com/katex/katex/blob/main/docs/api.md
- mdit-py-plugins texmath docs and fixtures: https://github.com/executablebooks/mdit-py-plugins

### Development Tools and Platforms

**Recommendation:** Use `uv` for Python dependency and environment management.

`uv` gives fast installs, project management, lockfiles, Python version management, workspaces, Docker integrations, and a pip-compatible interface. It fits this project better than loose `pip + requirements.txt` because the BMad implementation workflow needs reproducible setup and clear dependency state.

Recommended toolchain:

```text
uv
ruff format
ruff check
pytest
httpx
pyright or mypy, optional but recommended
```

**Confidence:** High.

**Sources:**

- uv docs: https://docs.astral.sh/uv/
- pytest docs: https://docs.pytest.org/en/stable/
- Ruff docs: https://docs.astral.sh/ruff/
- HTTPX docs: https://www.python-httpx.org/

### Cloud Infrastructure and Deployment

**Recommendation:** Keep Docker Compose with Caddy, Astro Node, and FastAPI/Uvicorn.

Recommended routing:

```text
Caddy
  /api/*      -> FastAPI
  /uploads/*  -> FastAPI or static upload volume route
  /*          -> Astro
```

Use Uvicorn in the FastAPI container. Start with one worker for SQLite simplicity. Measure before increasing workers. Uvicorn supports multiple workers, but each worker is a process with its own connections and memory. More workers can improve read/API concurrency, but they do not remove SQLite single-writer behavior.

**Confidence:** Medium-High.

**Sources:**

- FastAPI deployment: https://fastapi.tiangolo.com/deployment/
- Uvicorn deployment: https://www.uvicorn.org/deployment/

### Technology Adoption Trends

The proposed migration pattern is:

```text
Backend: Go -> FastAPI
Router: Chi -> FastAPI APIRouter
Validation: Go structs/manual checks -> Pydantic request/response models
Migrations: goose -> Alembic
Database access: database/sql -> SQLAlchemy 2
Markdown: goldmark -> markdown-it-py + mdit-py-plugins
Syntax highlighting: Chroma -> Pygments
Image processing: Go imaging/cwebp -> Pillow/libwebp
Testing: go test/httptest -> pytest/FastAPI TestClient/HTTPX
Deployment: Go binary -> Uvicorn ASGI app in Docker
```

The strongest technical reason to switch is not raw performance. It is lower implementation friction while preserving enough performance through prerendering, caching, WAL, and precomputed rendered HTML.

Performance rules to carry into the architecture:

- public article/project/tag/category pages should be static or prerendered where possible
- Markdown should render on save or publish, not every reader request
- images should process on upload, not reader request
- SQLite should use WAL, short transactions, and explicit indexes
- API responses should use explicit Pydantic schemas
- benchmark real project routes before optimizing framework choice

---

## Integration Patterns Analysis

### API Design Patterns

**Recommendation:** Use REST over HTTP with explicit response envelopes and modular FastAPI routers.

The existing architecture already uses REST endpoints and a consistent response envelope. FastAPI supports modular routing through `APIRouter`, including route prefixes, tags, dependencies, and shared responses. This maps cleanly to project modules:

```text
app/api/routes/health.py
app/api/routes/posts.py
app/api/routes/categories.py
app/api/routes/tags.py
app/api/routes/auth.py
app/api/routes/render.py
app/api/routes/uploads.py
app/api/routes/search.py
```

Preserve the existing API envelope:

```json
{ "ok": true, "data": {} }
{ "ok": false, "error": "not_found", "message": "Post not found" }
```

Use Pydantic response models for the payloads inside the envelope, not raw dictionaries everywhere.

GraphQL, gRPC, and webhooks are not recommended for MVP. They add integration surface without solving a current product need.

**Confidence:** High.

**Sources:**

- FastAPI APIRouter docs via Context7: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- FastAPI features: https://fastapi.tiangolo.com/features/

### Communication Protocols

**Recommendation:** Use HTTP/HTTPS only for MVP.

Communication paths:

```text
Astro build-time frontmatter -> FastAPI internal HTTP
Astro SSR frontmatter        -> FastAPI internal HTTP
Preact islands               -> FastAPI same-origin /api/*
Caddy                        -> reverse proxy for /api/* and /uploads/*
```

WebSockets are not needed for MVP. The editor preview uses an on-demand HTTP POST to `/api/render` when the author clicks the preview button or uses the preview keyboard shortcut; it does not auto-run on a debounce while typing. LogFeed infinite scroll can use paginated GET requests. Search can load a static serialized MiniSearch index.

Server-Sent Events and queues are also not needed unless a later version adds long-running import jobs, live publishing progress, or real-time admin feedback.

**Confidence:** High.

**Sources:**

- FastAPI features and Starlette features: https://fastapi.tiangolo.com/features/
- Astro server output and prerender docs via Context7: https://docs.astro.build/

### Data Formats and Standards

**Recommendation:** Use JSON for API responses, multipart form data for image uploads, and static JSON for search indexes.

Data patterns:

- JSON request and response bodies for CRUD, auth, render, health, categories, tags
- multipart form uploads using FastAPI `UploadFile`
- static `search.json` or serialized MiniSearch index generated during Astro build
- ISO 8601 strings for datetimes
- snake_case JSON fields to match SQLite columns and existing project conventions

FastAPI supports file upload handling with `UploadFile`. MiniSearch supports fuzzy search, prefix search, field boosting, filtering, and JSON serialization/loading, which fits the build-time client-side search requirement.

**Confidence:** High.

**Sources:**

- FastAPI UploadFile docs via Context7: https://fastapi.tiangolo.com/tutorial/request-files/
- MiniSearch docs via Context7: https://github.com/lucaong/minisearch

### System Interoperability Approaches

**Recommendation:** Preserve the sidecar boundary: Astro never touches SQLite directly.

The correct interoperability rule remains:

```text
FastAPI owns data writes and database access.
Astro owns HTML routes, layouts, and public rendering.
Preact islands own narrow interactive surfaces.
Caddy owns external routing.
```

Astro can access environment variables and fetch backend data in frontmatter. With `output: 'server'`, Astro routes are SSR by default; static public pages must explicitly export `prerender = true`.

FastAPI should expose a small stable API rather than allowing frontend code to depend on database details.

**Confidence:** High.

**Sources:**

- Astro SSR adapter/prerender docs via Context7: https://docs.astro.build/
- FastAPI dependency injection and OpenAPI docs: https://fastapi.tiangolo.com/features/

### Microservices Integration Patterns

**Recommendation:** Do not introduce microservices.

This product should remain a two-app sidecar deployment:

```text
frontend: Astro Node server
backend: FastAPI ASGI server
proxy: Caddy
database: SQLite file mounted only into backend
```

API gateway, service mesh, service discovery, circuit breakers, distributed tracing, and saga patterns are not appropriate for MVP. Caddy is sufficient as a reverse proxy and TLS/routing boundary.

**Confidence:** High.

### Event-Driven Integration

**Recommendation:** Avoid external event infrastructure for MVP.

Potential background-style work:

- image resize/WebP conversion
- LQIP generation
- search index rebuild trigger
- rendered HTML regeneration

For MVP, run these synchronously at save/upload time unless measurement shows unacceptable author latency. FastAPI BackgroundTasks can help with non-critical work, but for durable background jobs a separate queue would eventually be needed. Do not add Redis/Celery/RQ until there is a demonstrated need.

**Confidence:** Medium.

**Sources:**

- FastAPI features include in-process background tasks: https://fastapi.tiangolo.com/features/

### Integration Security Patterns

**Recommendation:** Single-user cookie auth with same-origin production routing.

Security pattern:

- password login endpoint
- password hash stored in env/config or DB, not plaintext
- signed JWT or server-side session token in HttpOnly cookie
- Secure cookie in production
- SameSite=Strict or Lax depending on editor flow
- CORS enabled only for local development origins
- production requests same-origin through Caddy
- validate Origin on write endpoints if CORS is enabled

FastAPI supports security tools, cookies, dependency injection for auth checks, and CORS middleware. Keep auth simple because the PRD explicitly excludes multi-user registration and OAuth.

**Confidence:** High.

**Sources:**

- FastAPI security/auth features: https://fastapi.tiangolo.com/features/
- FastAPI CORS middleware docs via Context7: https://fastapi.tiangolo.com/tutorial/cors/

---

## Interim Decision

FastAPI is a sound replacement for the current Go sidecar decision if the project preserves its performance architecture:

- static or prerendered public pages
- backend-owned SQLite
- cached rendered HTML
- server-side Markdown and syntax highlighting
- upload-time image processing
- minimal hydrated JavaScript
- Caddy reverse proxy

The switch should be documented as an architectural decision, not a minor implementation substitution. It affects PRD wording, architecture diagrams, epics, story names, sprint status, project context rules, test rules, Dockerfiles, Makefile commands, and all Go-specific implementation artifacts.

The frontend stack does not need a corresponding major change.

---

## Architectural Patterns and Design

### System Architecture Patterns

**Recommendation:** Use a small layered sidecar architecture, not microservices.

The target architecture should be:

```text
Caddy reverse proxy
  ├── /api/*      -> FastAPI backend
  ├── /uploads/*  -> FastAPI or static upload route
  └── /*          -> Astro frontend

Astro frontend
  ├── prerendered public content pages
  ├── SSR only where needed
  └── Preact islands for Editor, LogFeed, Search

FastAPI backend
  ├── REST API routers
  ├── auth/session handling
  ├── ContentRenderer
  ├── upload/image processing
  ├── SQLAlchemy repositories/services
  └── SQLite data ownership
```

This is closest to an N-tier/layered architecture: presentation, API/application, and data tiers with clear responsibilities. Microsoft describes N-tier architecture as separating responsibilities into logical layers and physical tiers. For this project, physical tiers are Caddy, Astro, FastAPI, and the SQLite volume, but the domain is too small to justify microservices.

Microservices are explicitly not recommended for MVP. Microsoft notes that microservices improve independent deployment and agility, but add complexity around service discovery, data consistency, transaction management, interservice communication, testing, and governance. Those costs are not justified for a single-author publishing site.

**Source:**

- Microsoft Azure Architecture Center, N-tier architecture: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier
- Microsoft Azure Architecture Center, Microservices architecture: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices

### Design Principles and Best Practices

**Recommendation:** Use a modular monolith inside the FastAPI backend.

The backend should have clear internal modules but deploy as one ASGI service:

```text
apps/backend/
  app/
    main.py
    core/
      config.py
      security.py
      errors.py
    api/
      routes/
        auth.py
        posts.py
        categories.py
        tags.py
        render.py
        uploads.py
        search.py
        health.py
    domain/
      models.py
      schemas.py
      services/
    db/
      session.py
      repositories/
      migrations/
    renderer/
      markdown.py
      math.py
      logrefs.py
    media/
      images.py
      lqip.py
    tests/
```

Use FastAPI `APIRouter` for route modularity and dependency injection for shared concerns such as settings, database sessions, current user, renderer, and repositories. Keep business logic out of route functions where possible. Route functions should parse inputs, call service functions, and return explicit response schemas.

The current Go architecture's useful design principle remains valid: the ContentRenderer is the single source of truth. The implementation language changes, but the boundary should not.

**Source:**

- FastAPI bigger applications / APIRouter docs: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- FastAPI dependency injection feature docs: https://fastapi.tiangolo.com/features/

### Scalability and Performance Patterns

**Recommendation:** Optimize architecture around static reads and precomputed work.

The important performance pattern is not "FastAPI beats Go." It does not. The important pattern is that FastAPI should stay off the hot reader path whenever possible:

- prerender public article, project, category, and tag pages
- cache rendered Markdown HTML in SQLite
- render Markdown on save/publish, not every GET request
- process images at upload time
- generate resized variants/LQIP at upload time
- generate or refresh MiniSearch index from backend data at build time
- keep reader pages low-JS through Astro and Preact islands

SQLite WAL remains important. SQLite documents that WAL improves concurrency because readers do not block writers and writers do not block readers, but WAL still has constraints, including same-host operation. This matches the Docker Compose deployment well and argues against multiple backend containers writing to the same SQLite file across hosts.

Use one Uvicorn worker initially. Uvicorn supports multiple worker processes, but for SQLite-backed MVP, more workers should be introduced only after measurement. More workers can improve HTTP concurrency, but they do not remove SQLite write contention.

**Source:**

- SQLite WAL documentation: https://www.sqlite.org/wal.html
- Uvicorn deployment documentation: https://www.uvicorn.org/deployment/
- Astro server/prerender docs: https://docs.astro.build/

### Integration and Communication Patterns

**Recommendation:** Use REST JSON plus same-origin browser integration.

Core communication:

```text
Astro build-time fetch -> FastAPI internal URL
Astro SSR fetch        -> FastAPI internal URL
Preact island fetch    -> same-origin /api/*
FastAPI response       -> JSON envelope
Upload flow            -> multipart/form-data UploadFile
Search flow            -> static serialized MiniSearch JSON
```

Avoid direct SQLite reads from Astro. The backend API is the integration contract. This keeps the content model, draft filtering, auth, and rendering behavior in one place.

The Strangler Fig pattern is useful as an analogy for refactoring the BMad docs and implementation plan: keep stable external routes and concepts while replacing the backend implementation decision. Microsoft describes Strangler Fig as an incremental migration pattern using a facade/proxy to redirect functionality to the new system while preserving client-facing behavior. In this project, Caddy and the `/api/*` contract can play that stabilizing role.

**Source:**

- Microsoft Azure Architecture Center, Strangler Fig pattern: https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig
- FastAPI APIRouter and CORS docs: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Astro environment/fetch docs: https://docs.astro.build/

### Security Architecture Patterns

**Recommendation:** Same-origin cookie auth with strict endpoint-level authorization.

Security architecture:

- Caddy terminates HTTPS in production
- FastAPI receives same-origin requests behind Caddy
- local development uses explicit CORS allowlist
- login sets an HttpOnly Secure cookie in production
- write/admin endpoints depend on `current_user`
- protected endpoints validate auth every request
- login has throttling/backoff
- password hash is strong and never stored plaintext
- JWTs, if used, must verify signature and claims explicitly

OWASP REST guidance states secure REST services should use HTTPS and that non-public REST services must perform access control at each endpoint. OWASP JWT guidance also emphasizes integrity protection and claim verification. OWASP authentication guidance recommends minimum password strength controls and login throttling/account lockout to reduce brute-force risk.

For this project, OAuth remains unnecessary because there is only one author. Use simple password authentication with strong storage and rate limiting.

**Source:**

- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- FastAPI security features: https://fastapi.tiangolo.com/features/

### Data Architecture Patterns

**Recommendation:** Keep a unified posts table and backend-owned SQLite.

The existing data model remains sound:

- `posts` is the core content table
- log entries are posts in the Log category
- `previous_id` models sequential log chains
- tags remain many-to-many
- rendered HTML and excerpt are stored/generated by the backend renderer
- images are stored as files with metadata in SQLite
- sessions or auth tokens are backend-owned

The important data architecture change is tooling:

```text
goose SQL migrations -> Alembic migrations
database/sql stores  -> SQLAlchemy repositories
Go structs           -> SQLAlchemy models + Pydantic schemas
```

Alembic should be configured with SQLite batch mode for table alterations. Schema changes should remain forward-only once applied to production.

**Source:**

- SQLAlchemy SQLite docs: https://docs.sqlalchemy.org/en/20/dialects/sqlite.html
- Alembic batch migrations: https://alembic.sqlalchemy.org/en/latest/batch.html

### Deployment and Operations Architecture

**Recommendation:** Keep the three-service Docker Compose topology, replacing only the backend service internals.

Target deployment:

```text
services:
  backend:
    FastAPI + Uvicorn
    mounts SQLite data volume
    mounts upload volume
    runs Alembic migrations before app start, or as explicit release step

  frontend:
    Astro Node standalone server
    receives API_URL for build-time and SSR fetches

  caddy:
    public entrypoint
    routes /api/* and /uploads/*
    serves TLS in production
```

Operational rules:

- only backend mounts SQLite read-write
- never mount SQLite into Astro
- health endpoint verifies app, DB, upload directory, and optionally WAL size
- startup should fail if DB migrations fail
- backups should use SQLite backup tooling or filesystem-safe strategy
- `docker compose down -v` remains forbidden in production

Uvicorn process management supports workers, but SQLite should keep the MVP conservative. Start with one backend worker, benchmark, then scale vertically or introduce read-focused caching before adding architectural complexity.

**Source:**

- FastAPI deployment docs: https://fastapi.tiangolo.com/deployment/
- Uvicorn deployment docs: https://www.uvicorn.org/deployment/
- SQLite WAL docs: https://www.sqlite.org/wal.html

### Architectural Decision Summary

Use **Astro + FastAPI + SQLite** as a layered sidecar system:

```text
Frontend architecture: Astro server output, prerendered public routes, Preact islands
Backend architecture: FastAPI modular monolith
Data architecture: SQLite owned only by FastAPI
Rendering architecture: FastAPI ContentRenderer, stored rendered HTML, KaTeX frontend rendering
Deployment architecture: Docker Compose with Caddy reverse proxy
Security architecture: same-origin HttpOnly cookie auth
Search architecture: MiniSearch static client index from backend data
```

This architecture preserves the original product's performance thesis while replacing the part that creates developer friction: Go backend implementation.

---

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies

**Recommendation:** Treat the change as a targeted backend replatform, not a full-stack rewrite.

The adoption strategy should be:

```text
Keep:
  Astro frontend
  Preact islands
  Tailwind v4
  MiniSearch
  SQLite data model
  Caddy reverse proxy
  REST API boundary
  public URL behavior

Replace:
  Go/Chi backend
  goose migrations
  goldmark renderer
  Chroma highlighting
  Go test/tooling assumptions

With:
  FastAPI/APIRouter backend
  Alembic migrations
  markdown-it-py + mdit-py-plugins renderer
  Pygments highlighting
  pytest/Ruff/uv tooling
```

This is closest to a replatform/refactor decision. AWS migration guidance recommends iterative and progressive migration planning, prioritizing low-risk and low-complexity workloads first, and choosing migration strategy by balancing business drivers, technical principles, cost, and benefit. For this project, the low-risk migration wave is the backend implementation decision and BMad documentation layer, because the external product behavior can remain stable.

Do not use a big-bang product rewrite. The first adoption milestone should be documentation consistency and API contract preservation. The second should be a FastAPI scaffold with health, config, routing, database session, and test harness. Feature implementation should then move by vertical slices: renderer, read APIs, auth, editor/write APIs, uploads, search, Docker.

**Source:**

- AWS Prescriptive Guidance, prioritization and migration strategy: https://docs.aws.amazon.com/prescriptive-guidance/latest/application-portfolio-assessment-guide/prioritization-and-migration-strategy.html
- Microsoft Azure Architecture Center, Strangler Fig pattern: https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig

### Development Workflows and Tooling

**Recommendation:** Use `uv` as the single Python project manager and keep the frontend workflow unchanged.

Backend workflow:

```text
uv sync --locked --all-extras --dev
uv run ruff format
uv run ruff check
uv run pytest
uv run alembic upgrade head
uv run fastapi dev app/main.py
```

Production Docker workflow:

```text
uv sync --locked
uv run alembic upgrade head
uv run fastapi run app/main.py
```

The important implementation rule is to avoid mixed Python dependency conventions. Do not combine loose `pip install`, unmanaged `requirements.txt`, Poetry, and `uv.lock` in the same backend. Use one lockfile-backed workflow so the BMad stories, CI, Dockerfile, and local commands all agree.

FastAPI documentation supports modular app structure through `APIRouter`, including prefixes, tags, dependencies, and router-level responses. Use this for posts, categories, tags, auth, render, uploads, search, and health. Shared dependencies should provide settings, database sessions, current user, renderer, and repository/service objects.

DORA guidance for continuous integration emphasizes small batches, automated builds, automated tests on each change, fast feedback, and fixing broken builds immediately. For this project, CI should not be elaborate. It should be strict enough to catch drift:

```text
frontend:
  npm run check
  npm run build

backend:
  uv sync --locked --all-extras --dev
  uv run ruff format --check
  uv run ruff check
  uv run pytest
```

**Source:**

- FastAPI bigger applications / APIRouter docs: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- uv project, Docker, and GitHub Actions documentation: https://docs.astral.sh/uv/
- DORA continuous integration capability: https://dora.dev/capabilities/continuous-integration/
- GitHub Actions documentation: https://docs.github.com/en/actions/get-started/understand-github-actions

### Testing and Quality Assurance

**Recommendation:** Make rendering and API contract tests the quality spine of the migration.

FastAPI's developer experience is only a benefit if behavior is pinned down with tests. The highest-risk areas are not route wiring; they are content rendering, math behavior, syntax highlighting, slug/date/category/tag semantics, auth cookies, upload validation, and SQLite migrations.

Required backend test groups:

```text
tests/api/
  test_health.py
  test_posts_read.py
  test_posts_write.py
  test_auth.py
  test_uploads.py
  test_search.py

tests/renderer/
  test_markdown_gfm.py
  test_math.py
  test_code_highlight.py
  test_log_xrefs.py
  test_sanitization.py

tests/db/
  test_migrations.py
  test_repositories.py
```

Golden tests are mandatory for the renderer. They should cover:

- `$...$`, `$$...$$`, `\(...\)`, and `\[...\]`
- code blocks containing dollar signs
- currency text such as `$5` and `cost is $10`
- fenced code with language labels
- `[[Log-N]]` references
- unsafe HTML rejection or sanitization behavior
- stored rendered HTML consistency

Use pytest fixtures for temporary SQLite files, upload directories, environment overrides, and seeded content. Pytest's built-in fixtures such as `tmp_path`, `monkeypatch`, and logging capture support this cleanly. FastAPI's dependency injection also makes it practical to override database sessions and settings in tests.

DORA test automation guidance emphasizes fast feedback and building quality into the delivery lifecycle rather than pushing verification into a late manual phase. For this project, the fast test layer should run on every change. End-to-end browser checks can remain smaller and focus on critical workflows: public article render, editor preview parity, login/write flow, upload flow, and search.

**Source:**

- DORA test automation capability: https://dora.dev/capabilities/test-automation/
- pytest fixtures documentation: https://docs.pytest.org/en/stable/reference/fixtures.html
- FastAPI testing and dependency patterns: https://fastapi.tiangolo.com/

### Deployment and Operations Practices

**Recommendation:** Keep Docker Compose with Caddy, Astro, and FastAPI/Uvicorn; add only minimal operational discipline.

The deployment topology should stay:

```text
caddy
  -> frontend: Astro Node server
  -> backend: FastAPI/Uvicorn
backend
  -> SQLite volume
  -> uploads volume
```

DORA deployment automation guidance recommends storing deployment scripts and configuration in version control, using the same deployment process across environments, separating environment-specific configuration from packages, running database migrations as a deployment task, and smoke-testing after deploy. That maps cleanly to this project:

```text
build backend image
build frontend image
run Alembic migrations
start services
check /api/health
check frontend route
check Caddy proxy path
```

Operational requirements:

- one FastAPI worker initially
- SQLite WAL enabled
- backend-only SQLite write access
- structured JSON logs or consistently parseable text logs
- health endpoint checks app, DB, and upload directory
- explicit migration step with failure stopping startup/deploy
- backup procedure for SQLite and uploads
- no `docker compose down -v` in production

Monitoring should stay practical. DORA distinguishes monitoring as predefined health signals and observability as the ability to debug unknown issues. For MVP, track uptime, HTTP status distribution, latency, failed logins, render errors, upload errors, migration failures, and SQLite lock/database errors. Avoid noisy cause-based alerting; symptom-based alerts are more useful for a solo-operated site.

**Source:**

- Docker Compose production documentation: https://docs.docker.com/compose/how-tos/production/
- DORA deployment automation capability: https://dora.dev/capabilities/deployment-automation/
- DORA monitoring and observability capability: https://dora.dev/capabilities/monitoring-and-observability/
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- Python logging documentation: https://docs.python.org/3/howto/logging.html

### Team Organization and Skills

**Recommendation:** Optimize for solo-developer comprehension and predictable maintenance.

The switch to FastAPI is beneficial if it lowers day-to-day friction. The required skill set becomes:

```text
Python typing and Pydantic models
FastAPI routing and dependency injection
SQLAlchemy 2 query/session patterns
Alembic migration discipline, especially SQLite batch mode
pytest fixture design
Markdown rendering and sanitizer behavior
Pillow/libwebp image processing
Docker Compose and Caddy routing
Astro build-time/SSR fetch behavior
```

This is broader than "just use Python," but it is more aligned with the project's content-heavy behavior than Go's lower-level implementation work. The key organizational rule is that the backend should be boring and documented. Route files, service files, repository files, renderer modules, and tests should be obvious enough that future story work does not require rediscovering architecture.

Frontend discrepancy assessment:

- Keep Astro. It is already aligned with static/prerendered public content, low JavaScript, and Preact islands.
- Do not switch to Next.js/React full app. It would increase JavaScript and operational complexity without solving the backend friction.
- Do not return to Django templates. The project brief explicitly moved away from that authoring/development experience.
- Do not adopt a headless CMS. The backend is the content service.

**Source:**

- FastAPI documentation: https://fastapi.tiangolo.com/
- Astro documentation: https://docs.astro.build/
- DORA continuous integration capability: https://dora.dev/capabilities/continuous-integration/

### Cost Optimization and Resource Management

**Recommendation:** Preserve the original low-ops VPS cost model.

FastAPI should not trigger a move to Kubernetes, managed databases, Redis, background job systems, search servers, or object storage for MVP. The cost-effective architecture remains:

```text
2-core / 2GB VPS
Docker Compose
Caddy
Astro Node server
FastAPI/Uvicorn
SQLite WAL
local uploads volume
static MiniSearch index
```

Cost controls:

- render Markdown on save/publish, not reader request
- process images at upload time, not reader request
- avoid Redis/Celery until background durability is proven necessary
- avoid PostgreSQL until SQLite write limits are observed
- avoid external search services; MiniSearch remains sufficient
- avoid client-side syntax highlighter bundles
- keep one backend worker until measured otherwise

The most important resource constraint is SQLite write behavior, not FastAPI's raw HTTP speed. WAL, short transactions, indexes, cached rendered HTML, and static public pages will matter more than framework microbenchmarks.

**Source:**

- SQLite WAL documentation: https://www.sqlite.org/wal.html
- Uvicorn deployment documentation: https://www.uvicorn.org/deployment/
- Docker Compose production documentation: https://docs.docker.com/compose/how-tos/production/

### Risk Assessment and Mitigation

| Risk | Impact | Mitigation |
|---|---:|---|
| Backend rewrite expands into platform rewrite | High | Freeze Astro, SQLite, Caddy, public URLs, and API envelope |
| Old Go assumptions remain in BMad docs | High | Refactor PRD, architecture, epics, sprint status, and project context together |
| API contract drift breaks Astro builds | High | Add contract tests and keep route names/envelopes stable |
| Renderer output diverges | High | Add golden tests for Markdown, math, code, log refs, sanitizer behavior |
| FastAPI blamed for SQLite write contention | Medium | WAL, short transactions, one worker initially, benchmark DB paths separately |
| Python dependency drift | Medium | Use `uv.lock`; no mixed dependency workflow |
| Alembic SQLite migrations fail late | Medium | Test migrations against disposable and copied SQLite DBs; use batch mode when needed |
| Image processing blocks requests | Medium | Process at upload time; measure large image path |
| Cookie auth/CORS mismatch | Medium | Same-origin production; explicit dev CORS allowlist; endpoint-level auth dependencies |
| Math notation ambiguity | Medium | Support `$`, `$$`, `\(`, `\[`; test code/currency false positives |

Subagent pressure testing reinforced the same risk pattern: the migration succeeds only if the external contract and performance architecture stay stable while the implementation language changes.

**Source:**

- DORA continuous integration capability: https://dora.dev/capabilities/continuous-integration/
- DORA monitoring and observability capability: https://dora.dev/capabilities/monitoring-and-observability/
- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html

## Technical Research Recommendations

### Implementation Roadmap

1. **Decision refactor:** Update BMad PRD, architecture, epics, sprint status, and project context from Go to FastAPI.
2. **Backend scaffold:** Create FastAPI app structure, `APIRouter` modules, settings, health, DB session, and test harness.
3. **Database layer:** Configure SQLAlchemy 2, Alembic, SQLite WAL, repository/service boundaries, and migration tests.
4. **Renderer layer:** Implement ContentRenderer with Markdown, math notation, Pygments, log refs, and sanitizer policy.
5. **Read API parity:** Implement posts, categories, tags, projects, log feed, and search data endpoints.
6. **Write/admin API:** Implement auth, editor save/publish, render preview, upload, and session behavior.
7. **Frontend integration:** Keep Astro fetch behavior stable; update `API_URL` wording from Go API to FastAPI backend.
8. **Deployment:** Replace backend Dockerfile internals with uv + FastAPI/Uvicorn + Alembic migration path.
9. **Performance verification:** Benchmark public reads, render-on-save, upload processing, search index generation, and DB write paths.
10. **Final doc consistency pass:** Search all BMad artifacts for stale `Go`, `Chi`, `goose`, `goldmark`, `Chroma`, and `go test` language.

### Technology Stack Recommendations

Final recommended stack:

```text
Frontend:
  Astro 6
  Preact islands
  Tailwind v4
  Nano Stores
  MiniSearch
  KaTeX CSS/runtime for math display

Backend:
  Python 3.12+ or 3.13+
  FastAPI
  Uvicorn
  Pydantic / pydantic-settings
  SQLAlchemy 2
  Alembic
  markdown-it-py
  mdit-py-plugins
  Pygments
  Pillow/libwebp
  pytest
  HTTPX or FastAPI TestClient
  Ruff
  uv

Infrastructure:
  Docker Compose
  Caddy
  SQLite WAL
  local uploads volume
```

Rejected for MVP:

- Go backend, due to developer friction for this project
- Next.js/full React app, due to unnecessary frontend change and higher JS/ops cost
- Django template monolith, due to prior negative authoring/development experience
- PostgreSQL, Redis, Celery, Kubernetes, or managed search, due to premature operational complexity

### Skill Development Requirements

Minimum skills before implementation:

- FastAPI route structure and dependency injection
- Pydantic request/response models
- SQLAlchemy 2 sessions and query patterns
- Alembic migration workflow with SQLite caveats
- pytest fixtures and golden tests
- Markdown parsing extension behavior
- KaTeX delimiter behavior and false-positive handling
- Docker Compose service wiring and health checks

### Success Metrics and KPIs

Technical success metrics:

- public content pages remain below the PRD latency target
- static/prerendered pages do not call backend at reader request time
- `astro build` succeeds with FastAPI running
- renderer golden tests pass for Markdown, math, code, and log refs
- API contract tests pass for all Astro-facing endpoints
- `uv sync --locked`, `ruff`, and `pytest` pass in CI
- Alembic migrations run cleanly on fresh and existing SQLite databases
- image upload produces expected variants without reader-path processing
- no stale Go-specific implementation decisions remain in BMad docs

Developer experience success metrics:

- backend local setup is one documented command path
- adding a route requires only router/schema/service/test changes
- rendering changes are covered by fixture-based tests
- documentation and stories name FastAPI concepts consistently

The final technical decision is to proceed with **FastAPI as the backend sidecar** while preserving the current frontend and deployment architecture.

---

# FastAPI Backend Decision for deppfellow-page: Comprehensive Technical Research

## Executive Summary

This research concludes that deppfellow-page should change its backend implementation decision from Go to **Python FastAPI** while preserving the current frontend and deployment architecture: **Astro + Preact islands + SQLite + Caddy**.

The recommendation is not based on FastAPI outperforming Go at the runtime level. Go remains the stronger choice for raw throughput, memory efficiency, static binaries, and low-level operational simplicity. The recommendation is based on project fit: this product is a content-heavy, single-author publishing system where the most important backend work is Markdown rendering, math notation handling, syntax highlighting, image processing, SQLite access, admin APIs, tests, and documentation-driven implementation. FastAPI gives better developer ergonomics and library fit for those tasks while remaining fast enough if the existing performance architecture is preserved.

The core performance thesis remains unchanged: public reader paths should be static or prerendered wherever possible; rendered Markdown HTML should be generated on save/publish rather than reader request; images should be processed on upload; SQLite should run in WAL mode with short transactions; JavaScript should remain minimal through Astro and Preact islands.

**Key Technical Findings:**

- FastAPI is a sound backend sidecar replacement for this project, but not because it beats Go in raw performance.
- Astro should remain the frontend framework. No frontend framework migration is recommended.
- SQLite remains appropriate for the expected single-author, read-heavy workload.
- The ContentRenderer boundary is still critical and should move from Go/goldmark/Chroma to FastAPI/markdown-it-py/Pygments.
- Mathematical notation should be parsed consistently through the backend renderer and displayed with KaTeX-compatible frontend rendering.
- The largest migration risk is stale Go-specific assumptions in BMad documents, not FastAPI itself.

**Technical Recommendations:**

- Adopt FastAPI as the backend sidecar.
- Keep Astro, Preact islands, Tailwind, MiniSearch, SQLite, Docker Compose, and Caddy.
- Use `uv`, Ruff, pytest, SQLAlchemy 2, Alembic, markdown-it-py, mdit-py-plugins, Pygments, Pillow, and KaTeX.
- Refactor BMad PRD, architecture, epics, sprint status, and project context together.
- Add renderer golden tests and API contract tests before or alongside feature implementation.

## Table of Contents

1. Technical Research Introduction and Methodology
2. Technical Landscape and Architecture Analysis
3. Implementation Approaches and Best Practices
4. Technology Stack Evolution and Current Trends
5. Integration and Interoperability Patterns
6. Performance and Scalability Analysis
7. Security and Compliance Considerations
8. Strategic Technical Recommendations
9. Implementation Roadmap and Risk Assessment
10. Future Technical Outlook and Innovation Opportunities
11. Technical Research Methodology and Source Verification
12. Technical Appendices and Reference Materials

## 1. Technical Research Introduction and Methodology

### Technical Research Significance

The backend stack decision matters because deppfellow-page has a hard performance target and a solo-maintainer constraint. The previous Go decision optimized runtime simplicity and raw performance, but the user has identified Go implementation as high-friction. If that friction slows content and feature work, the stack is failing a core product requirement: the system must stay out of the author's way.

FastAPI is technically significant here because it provides modern Python type hints, Pydantic validation, OpenAPI documentation, dependency injection, testing support, security utilities, and Starlette/ASGI integration. Official FastAPI documentation describes support for OpenAPI, automatic docs, validation, security, dependency injection, background tasks, CORS, cookies/sessions, and HTTPX-based testing.

**Technical Importance:** FastAPI can preserve the API sidecar architecture while reducing backend implementation friction.

**Business Impact:** Lower implementation friction improves the chance that the personal publishing system is actually maintained and extended.

**Source:**

- FastAPI features: https://fastapi.tiangolo.com/features/
- DORA continuous integration: https://dora.dev/capabilities/continuous-integration/

### Technical Research Methodology

This research combined local BMad artifact inspection with current source verification. It reviewed the existing PRD, architecture, epics, sprint/project context, and Go-specific implementation assumptions, then compared them against current official documentation and architecture guidance.

**Technical Scope:**

- backend framework decision
- frontend stack discrepancy assessment
- Markdown/math/syntax rendering
- SQLite data ownership
- API and integration patterns
- testing and quality strategy
- deployment and operations
- BMad document refactor impact

**Data Sources:**

- official FastAPI, Astro, SQLite, SQLAlchemy, Alembic, uv, pytest, Ruff, KaTeX, Docker, Uvicorn, and OWASP documentation
- DORA engineering capability guidance
- AWS and Microsoft migration architecture guidance
- current project BMad artifacts

**Analysis Framework:**

- preserve product behavior and performance boundaries
- minimize migration scope
- compare developer experience against operational cost
- identify stale-document risks
- separate raw runtime performance from system-level performance

### Technical Research Goals and Objectives

**Original Technical Goals:** Assess FastAPI as a replacement for the current Go sidecar decision, with emphasis on performance, developer experience, library support, integration with Astro, SQLite, Markdown rendering, image upload, auth, deployment, and BMad document refactoring.

**Achieved Technical Objectives:**

- Confirmed FastAPI is appropriate for the backend sidecar.
- Confirmed Go remains stronger for raw runtime performance, but FastAPI is sufficient under the project architecture.
- Confirmed Astro should remain the frontend framework.
- Mapped Go-specific decisions to FastAPI equivalents.
- Defined math notation handling through backend parsing and KaTeX-compatible rendering.
- Identified required BMad document updates and implementation roadmap.

## 2. Technical Landscape and Architecture Analysis

### Current Technical Architecture Patterns

The recommended architecture is a layered sidecar system:

```text
Caddy
  /api/*      -> FastAPI backend
  /uploads/*  -> FastAPI or static upload route
  /*          -> Astro frontend

Astro
  prerendered/static public routes
  SSR where needed
  Preact islands for editor, log feed, search

FastAPI
  REST routers
  auth/session handling
  ContentRenderer
  upload/image processing
  SQLAlchemy repositories/services
  SQLite ownership
```

This is not a microservices architecture. It is a small N-tier sidecar deployment with clear presentation, API/application, and data boundaries. Microsoft architecture guidance notes that microservices bring deployment independence but also data consistency, communication, governance, and testing complexity. That complexity is not justified for this MVP.

**Source:**

- Microsoft N-tier architecture: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier
- Microsoft microservices architecture: https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices

### System Design Principles and Best Practices

The backend should be a modular monolith. Route functions should stay thin; renderer, media, database, auth, and domain behavior should live in dedicated modules.

Recommended backend shape:

```text
apps/backend/
  app/
    main.py
    core/
    api/routes/
    domain/
    db/
    renderer/
    media/
    tests/
```

FastAPI's `APIRouter` and dependency injection match this structure well. Shared dependencies should provide settings, database sessions, current user, repositories, and renderer instances.

**Source:**

- FastAPI bigger applications: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- FastAPI features: https://fastapi.tiangolo.com/features/

## 3. Implementation Approaches and Best Practices

### Current Implementation Methodologies

The migration should be a targeted backend replatform:

```text
Go/Chi        -> FastAPI/APIRouter
goose         -> Alembic
database/sql  -> SQLAlchemy 2
goldmark      -> markdown-it-py + mdit-py-plugins
Chroma        -> Pygments
Go imaging    -> Pillow/libwebp
go test       -> pytest
Go binary     -> Uvicorn ASGI app in Docker
```

AWS migration guidance supports iterative migration planning and choosing strategy based on business drivers, technical principles, costs, and benefits. For this project, the correct unit of migration is the backend implementation and BMad documentation decision, not the whole platform.

**Source:**

- AWS migration strategy guidance: https://docs.aws.amazon.com/prescriptive-guidance/latest/application-portfolio-assessment-guide/prioritization-and-migration-strategy.html

### Implementation Framework and Tooling

Use one Python workflow:

```text
uv sync --locked --all-extras --dev
uv run ruff format
uv run ruff check
uv run pytest
uv run alembic upgrade head
uv run fastapi dev app/main.py
```

Use `uv.lock` as the dependency authority. Avoid mixed `pip`, unmanaged `requirements.txt`, Poetry, and uv conventions.

**Source:**

- uv documentation: https://docs.astral.sh/uv/
- Ruff documentation: https://docs.astral.sh/ruff/
- pytest documentation: https://docs.pytest.org/en/stable/

## 4. Technology Stack Evolution and Current Trends

### Current Technology Stack Landscape

The recommended stack is:

```text
Frontend:
  Astro 6
  Preact islands
  Tailwind v4
  Nano Stores
  MiniSearch
  KaTeX

Backend:
  Python 3.12+ or 3.13+
  FastAPI
  Uvicorn
  Pydantic / pydantic-settings
  SQLAlchemy 2
  Alembic
  markdown-it-py
  mdit-py-plugins
  Pygments
  Pillow/libwebp
  pytest
  Ruff
  uv

Infrastructure:
  Docker Compose
  Caddy
  SQLite WAL
  local uploads volume
```

Astro remains the correct frontend choice because public content pages benefit from static/prerendered output and low JavaScript. A move to Next.js or a full React app would increase client/runtime complexity without addressing the backend friction that triggered this research.

**Source:**

- Astro on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- FastAPI features: https://fastapi.tiangolo.com/features/

### Technology Adoption Patterns

The adoption should be phased:

1. documentation decision refactor
2. FastAPI scaffold
3. database/migration layer
4. ContentRenderer
5. read API parity
6. write/admin APIs
7. uploads/search/auth
8. Docker and CI
9. performance verification

This keeps the frontend and deployment surface stable while the backend implementation changes.

## 5. Integration and Interoperability Patterns

### Current Integration Approaches

The integration contract remains REST over HTTP:

```text
Astro build-time fetch -> FastAPI internal URL
Astro SSR fetch        -> FastAPI internal URL
Preact island fetch    -> same-origin /api/*
FastAPI response       -> JSON envelope
Upload flow            -> multipart/form-data
Search flow            -> static MiniSearch JSON
```

Astro must not read SQLite directly. FastAPI owns data writes and database access. Caddy owns external routing.

**Source:**

- FastAPI APIRouter docs: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Astro documentation: https://docs.astro.build/

### Interoperability Standards and Protocols

Use JSON for APIs, multipart form data for uploads, ISO 8601 datetimes, snake_case JSON fields, and same-origin browser requests in production. GraphQL, gRPC, queues, service discovery, and service mesh patterns are rejected for MVP.

## 6. Performance and Scalability Analysis

### Performance Characteristics and Optimization

Go is the stronger raw performance runtime. The project should acknowledge that directly. FastAPI is acceptable because the application should not put heavy work on public reader request paths.

Performance rules:

- public content pages static or prerendered where possible
- render Markdown on save/publish
- cache rendered HTML in SQLite
- process images at upload time
- keep search index static/client-side
- use one Uvicorn worker initially
- benchmark before increasing workers

FastAPI documentation describes it as one of the fastest Python frameworks and based on Starlette/ASGI. That is sufficient for this workload, but it does not erase Go's runtime advantages.

**Source:**

- FastAPI features: https://fastapi.tiangolo.com/features/
- Uvicorn deployment: https://www.uvicorn.org/deployment/

### Scalability Patterns and Approaches

SQLite remains acceptable because the site is single-author and read-heavy. SQLite WAL improves read/write concurrency, but SQLite still has one writer at a time. If the project later needs multi-author collaboration, heavy concurrent writes, or multiple backend replicas writing to one database, PostgreSQL should be reconsidered.

**Source:**

- SQLite WAL: https://www.sqlite.org/wal.html
- SQLAlchemy SQLite docs: https://docs.sqlalchemy.org/en/20/dialects/sqlite.html

## 7. Security and Compliance Considerations

### Security Best Practices and Frameworks

Use simple same-origin cookie auth:

- Caddy terminates HTTPS
- FastAPI sets HttpOnly Secure cookies in production
- write/admin endpoints depend on current-user dependency
- production uses same-origin routing through Caddy
- development CORS uses an explicit allowlist
- login throttling/backoff protects the single author account
- JWTs, if used, verify signature and claims

OWASP REST guidance emphasizes HTTPS and endpoint-level access control for non-public REST services. OWASP authentication guidance supports strong authentication controls and throttling/lockout patterns.

**Source:**

- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- FastAPI security features: https://fastapi.tiangolo.com/features/

### Compliance and Regulatory Considerations

No special regulatory compliance driver is visible in the current product scope. The important compliance-like discipline is operational hygiene: no secrets in Astro client bundles, no direct backend exposure to the internet, structured logs without sensitive data, backup procedures, and forward-only migrations in production.

## 8. Strategic Technical Recommendations

### Technical Strategy and Decision Framework

Proceed with FastAPI if these constraints remain binding:

- external API contract stays stable
- frontend stack stays Astro
- SQLite remains backend-owned
- public reads stay prerendered/static where possible
- renderer behavior is covered with golden tests
- BMad docs are refactored together

Do not proceed if the migration expands into a whole-platform rewrite. The value is backend implementation ergonomics, not novelty.

### Competitive Technical Advantage

The advantage is a publishing system that is fast for readers and low-friction for the author. FastAPI improves the author's implementation loop while Astro preserves reader performance.

## 9. Implementation Roadmap and Risk Assessment

### Technical Implementation Framework

Recommended implementation roadmap:

1. Update decision records and BMad docs.
2. Create FastAPI scaffold and health endpoint.
3. Set up uv, Ruff, pytest, SQLAlchemy, and Alembic.
4. Implement SQLite session/WAL/migrations.
5. Implement ContentRenderer with Markdown, math, Pygments, log refs, and sanitizer policy.
6. Implement read APIs and contract tests.
7. Implement auth, editor write APIs, render preview, uploads, and search.
8. Update Docker Compose backend service.
9. Verify Astro build-time fetches against FastAPI.
10. Run performance checks and stale-Go documentation search.

### Technical Risk Management

| Risk | Impact | Mitigation |
|---|---:|---|
| Backend migration becomes platform rewrite | High | Freeze Astro, SQLite, Caddy, URLs, API envelope |
| Stale Go decisions remain in docs | High | Search/refactor PRD, architecture, epics, sprint status, context |
| API drift breaks Astro | High | Contract tests for Astro-facing endpoints |
| Renderer output diverges | High | Golden tests for Markdown, math, code, log refs |
| SQLite contention misdiagnosed as FastAPI issue | Medium | WAL, short transactions, one worker initially |
| Dependency drift | Medium | `uv.lock` only |
| Alembic/SQLite migration issues | Medium | migration tests and SQLite batch mode |
| Image processing blocks request path | Medium | upload-time processing only |
| CORS/auth mismatch | Medium | same-origin production and explicit dev allowlist |

**Source:**

- DORA continuous integration: https://dora.dev/capabilities/continuous-integration/
- DORA deployment automation: https://dora.dev/capabilities/deployment-automation/
- DORA monitoring and observability: https://dora.dev/capabilities/monitoring-and-observability/

## 10. Future Technical Outlook and Innovation Opportunities

### Emerging Technology Trends

Near term, the most useful improvements are not new platforms. They are better tests, better renderer fixtures, better build checks, and better documentation consistency.

Medium term, the project may consider:

- PostgreSQL if multi-user or high-write workloads appear
- durable background jobs if image/import/render work becomes slow
- OpenTelemetry if debugging production behavior becomes hard
- static asset CDN only if traffic justifies it

Long term, the system should remain boring: simple deployment, minimal JavaScript, stable content model, and documented data/rendering boundaries.

### Innovation and Research Opportunities

Potential future experiments:

- content import/export format
- richer authoring tools while preserving server-rendered output
- better graph views for `[[Log-N]]` references
- selective static rebuilds
- renderer fixture corpus for regression testing

## 11. Technical Research Methodology and Source Verification

### Comprehensive Technical Source Documentation

Primary sources used:

- FastAPI: https://fastapi.tiangolo.com/features/
- FastAPI bigger applications: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Astro docs: https://docs.astro.build/
- SQLite WAL: https://www.sqlite.org/wal.html
- SQLAlchemy SQLite: https://docs.sqlalchemy.org/en/20/dialects/sqlite.html
- Alembic batch migrations: https://alembic.sqlalchemy.org/en/latest/batch.html
- uv: https://docs.astral.sh/uv/
- pytest: https://docs.pytest.org/en/stable/
- Ruff: https://docs.astral.sh/ruff/
- Uvicorn: https://www.uvicorn.org/deployment/
- KaTeX: https://katex.org/
- OWASP REST Security: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP Authentication: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- DORA CI: https://dora.dev/capabilities/continuous-integration/
- DORA deployment automation: https://dora.dev/capabilities/deployment-automation/
- DORA observability: https://dora.dev/capabilities/monitoring-and-observability/
- AWS migration strategy: https://docs.aws.amazon.com/prescriptive-guidance/latest/application-portfolio-assessment-guide/prioritization-and-migration-strategy.html
- Microsoft Strangler Fig: https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig

### Technical Research Quality Assurance

Confidence levels:

- FastAPI suitability: High
- Astro frontend retention: High
- SQLite for MVP: High
- FastAPI versus Go raw performance: High
- math notation approach: High
- one-worker initial Uvicorn recommendation: Medium-High
- long-term scaling limits: Medium, because they depend on real traffic and authoring behavior

Research limitation: no project-specific benchmark was run during this research workflow. The recommendation depends on preserving static/prerendered reader paths and measuring actual FastAPI routes during implementation.

## 12. Technical Appendices and Reference Materials

### Detailed Technical Data Tables

| Current Go Decision | FastAPI Decision |
|---|---|
| Go sidecar | Python FastAPI sidecar |
| Chi router | FastAPI `APIRouter` |
| Go structs/manual validation | Pydantic models |
| goose migrations | Alembic migrations |
| `database/sql` | SQLAlchemy 2 |
| goldmark | markdown-it-py + mdit-py-plugins |
| Chroma | Pygments |
| Go image tooling | Pillow/libwebp |
| `go test` | pytest |
| Go binary | Uvicorn ASGI app |

| Frontend Option | Decision |
|---|---|
| Astro + Preact islands | Keep |
| Next.js / full React | Reject for MVP |
| Django templates | Reject based on prior friction |
| Headless CMS | Reject; FastAPI is content service |

### Technical Resources and References

Implementation resources to keep close during build:

- FastAPI tutorial and reference
- SQLAlchemy SQLite dialect docs
- Alembic batch migration docs
- markdown-it-py and mdit-py-plugins docs
- KaTeX auto-render/API docs
- Astro SSR/prerender docs
- OWASP REST/auth/logging cheat sheets
- DORA delivery capability guides

## Technical Research Conclusion

### Summary of Key Technical Findings

FastAPI is the better backend decision for this project because the limiting factor is implementation friction and content-tooling fit, not raw request throughput. Go remains stronger at low-level runtime performance, but the architecture already protects public performance through static/prerendered pages, cached rendered HTML, upload-time processing, SQLite WAL, and minimal JavaScript.

### Strategic Technical Impact Assessment

The backend decision change should improve developer velocity and reduce maintenance friction while preserving the original product experience. The main strategic cost is documentation and implementation consistency: every Go-specific BMad assumption must be updated.

### Next Steps Technical Recommendations

1. Refactor BMad documents from Go to FastAPI.
2. Create a new architecture decision record for FastAPI.
3. Update epics and stories to use FastAPI, SQLAlchemy, Alembic, markdown-it-py, Pygments, pytest, Ruff, and uv.
4. Implement a FastAPI scaffold with health, config, DB, and tests.
5. Build renderer golden tests before expanding feature work.

**Technical Research Completion Date:** 2026-06-20
**Research Period:** current comprehensive technical analysis
**Source Verification:** Current source verification completed with official documentation and architecture references
**Technical Confidence Level:** High for MVP decision; benchmark validation still required during implementation

This technical research document serves as the decision basis for refactoring deppfellow-page BMad planning artifacts from Go to FastAPI.
