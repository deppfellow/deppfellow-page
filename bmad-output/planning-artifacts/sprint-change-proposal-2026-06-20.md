---
workflow: bmad-correct-course
project: deppfellow-page
date: 2026-06-20
status: approved
change_scope: moderate
mode: batch
approved_at: 2026-06-20
---

# Sprint Change Proposal: FastAPI Backend Course Correction

## 1. Issue Summary

The project backend implementation decision should change from a Go sidecar to a FastAPI sidecar before new implementation begins.

The trigger is the technical research completed on 2026-06-20 in:

`.docs/bmad-output/planning-artifacts/research/technical-fastapi-for-current-project-research-2026-06-20.md`

That research concludes FastAPI better fits this content-heavy, solo-author project because it lowers implementation friction for Markdown rendering, image processing, request/response validation, API documentation, tests, admin workflows, and Python ecosystem tooling while preserving the original performance strategy.

This proposal uses the user's clean-slate instruction: ignore current Go code and treat the next implementation pass as a new implementation from corrected planning artifacts.

## 2. Impact Analysis

### Epic Impact

Epic 0 changes from Go sidecar setup to FastAPI backend setup.

Epic 1 changes renderer and read API stories from goldmark, Chroma, and Go handlers to markdown-it-py, mdit-py-plugins, Pygments, and FastAPI routers/services.

Epic 2 changes authentication implementation details from Go middleware to FastAPI dependencies/middleware and Python password/session tooling.

Epic 3 changes preview, upload, write, draft, and publish APIs from Go handlers to FastAPI routers/services.

Epic 4 changes log cross-reference rendering from a goldmark extension to a Python renderer/parser component.

Epic 5 changes search build data source wording from Go API to FastAPI API while preserving MiniSearch.

Epic 6 changes testing from `go test`, `httptest`, store tests, and renderer tests to `pytest`, FastAPI TestClient/HTTPX, SQLAlchemy repository tests, Alembic migration tests, and golden renderer fixtures.

### Story Impact

The following story groups require direct edits:

- Story 0.2: rename and rewrite as FastAPI Backend Scaffold.
- Story 0.3: replace goose migration acceptance criteria with Alembic migration criteria.
- Story 0.5: update Makefile targets from Go commands to `uv`/FastAPI commands.
- Story 0.6: update environment-loading criteria from Go startup to FastAPI settings.
- Story 0.7: update Docker Compose backend service from Go binary to FastAPI/Uvicorn.
- Story 0.8: replace `respondJSON` helper with a shared response-envelope/error pattern.
- Story 0.9: replace Go CORS middleware with FastAPI CORS middleware.
- Story 0.10: replace Go sidecar health wording with FastAPI health endpoint wording.
- Story 1.1: replace Go/goldmark/Chroma renderer with FastAPI-owned Python renderer.
- Story 1.2: replace Go read-only endpoints with FastAPI read-only routers.
- Story 1.7, 1.8, 1.11: replace Go API references with FastAPI API references.
- Story 2.1, 2.3: replace JWT/bcrypt Go implementation details with Python auth tooling and FastAPI dependency checks.
- Story 3.2 through 3.7: replace ContentRenderer implementation details while preserving behavior.
- Story 4.1 through 4.4: replace Go API/renderer references with FastAPI API/renderer references.
- Story 5.1 through 5.3: replace Go API references with FastAPI API references.
- Story 6.1, 6.5, 6.6, 6.7, 6.8: rewrite backend build and test criteria for Python/FastAPI.

### Artifact Conflicts

The PRD conflicts with the new technical decision wherever it names Go, goldmark, Chroma, or the Go API as product requirements rather than implementation details.

The architecture document is substantially incompatible with the new backend decision because it treats Go as a locked stack choice and defines Go-specific directory structure, commands, dependency setup, migrations, testing, handler patterns, and deployment assumptions.

The epics document is substantially incompatible with the new backend decision because most backend-related acceptance criteria point to Go-specific libraries, files, commands, or test strategies.

The project context document is incompatible as an agent implementation guide because it tells future agents to implement Go, use goose/goldmark/Chroma, follow Go idioms, and avoid Python Markdown tooling.

No UX design artifact was found in the planning artifact set, so no UX document update is required.

### Technical Impact

The backend stack changes to:

- FastAPI for API framework
- Uvicorn/ASGI for runtime
- Pydantic and pydantic-settings for schemas and configuration
- SQLAlchemy 2 for database access
- Alembic for migrations
- markdown-it-py and mdit-py-plugins for Markdown rendering
- Pygments for syntax highlighting
- Pillow/libwebp for image processing
- pytest, HTTPX, FastAPI TestClient, Ruff, and uv for testing/tooling

The following architectural decisions remain stable:

- Astro frontend
- Preact islands only where interaction is needed
- Tailwind v4
- SQLite owned only by the backend
- Caddy reverse proxy
- REST API boundary
- Same response envelope
- Server-side Markdown rendering as the source of truth
- Rendered HTML cached or stored before reader requests
- Upload-time image processing
- Client-side MiniSearch index
- Docker Compose deployment on a low-end VPS

## 3. Recommended Approach

Use Direct Adjustment.

Because the implementation is being treated as clean slate, rollback is not needed. The correct next step is to update planning artifacts before implementation resumes.

Effort estimate: Medium.

Risk level: Medium.

Timeline impact: lower than continuing with Go and switching later; higher than a simple wording edit because PRD, architecture, epics, and project context must be updated together.

The MVP remains achievable. The backend replatform does not require reducing product scope if expensive work remains outside reader request paths.

## 4. Detailed Change Proposals

### PRD Changes

Section: Vision

OLD:

```text
The new stack (Go, Astro, SQLite) is chosen for one reason - it stays out of the way.
```

NEW:

```text
The new stack (FastAPI, Astro, SQLite) is chosen for one reason - it stays out of the way.
```

Rationale: The backend technology changes while the product vision remains stable.

Section: Glossary

OLD:

```text
ContentRenderer - Go-side pipeline that converts Markdown to HTML using goldmark with extensions (GFM, Footnote, Typographer, Chroma highlighting, math wrapping).
```

NEW:

```text
ContentRenderer - FastAPI-owned Python pipeline that converts Markdown to HTML using markdown-it-py, mdit-py-plugins, Pygments highlighting, math wrapping, and log cross-reference handling.
```

Rationale: Preserve the single renderer source-of-truth requirement while replacing implementation libraries.

Section: Functional Requirements

OLD:

```text
ContentRenderer uses Chroma with `github-dark` theme for syntax highlighting.
```

NEW:

```text
ContentRenderer uses Pygments with a dark syntax-highlighting theme matching the site palette.
```

Rationale: Chroma is Go-specific; Pygments is the Python equivalent.

Section: Functional Requirements

OLD:

```text
Category index pages fetch posts from Go API at build time.
Tag pages fetch filtered posts from Go API at build time.
Static pages served by Caddy with no Go contact at runtime.
```

NEW:

```text
Category index pages fetch posts from the FastAPI API at build time.
Tag pages fetch filtered posts from the FastAPI API at build time.
Static pages are served by Caddy with no backend contact at runtime.
```

Rationale: Keep the build-time API boundary and static runtime behavior while removing Go-specific wording.

### Epic Changes

Story: 0.2

OLD:

```text
Story 0.2: Go Sidecar Scaffold

I want a Go backend with Chi router and internal packages,
So that the API server has a clean, idiomatic structure.
```

NEW:

```text
Story 0.2: FastAPI Backend Scaffold

I want a FastAPI backend with modular routers and a clear application structure,
So that the API server has a clean, idiomatic structure.
```

Rationale: Replace the backend scaffold story with the new selected framework.

Story: 0.2 Acceptance Criteria

OLD:

```text
Then cmd/server/main.go exists with Chi router setup
And internal/ packages exist: handler, middleware, migrations, model, renderer, store
And go.mod has dependencies: chi, cors, goldmark, sqlite3, jwt, bcrypt, imaging
```

NEW:

```text
Then apps/backend/app/main.py exposes a FastAPI app object
And app/api/routes modules exist for health, posts, categories, tags, auth, render, uploads, and search
And app/core, app/db, app/domain, app/renderer, and app/media packages exist
And pyproject.toml has dependencies for fastapi[standard], pydantic-settings, sqlalchemy, alembic, markdown-it-py, mdit-py-plugins, pygments, pillow, pytest, httpx, ruff, and uv
```

Rationale: Establish FastAPI-native structure and tooling.

Story: 0.3

OLD:

```text
I want the database schema managed by goose migrations,
```

NEW:

```text
I want the database schema managed by Alembic migrations,
```

Rationale: Alembic is the Python migration tool that fits SQLAlchemy 2.

Story: 1.1

OLD:

```text
Given the Go sidecar with goldmark
When I render Markdown through ContentRenderer
Then GFM, Footnote, Typographer extensions are active
And code blocks are highlighted with Chroma github-dark theme
```

NEW:

```text
Given the FastAPI backend renderer
When I render Markdown through ContentRenderer
Then CommonMark/GFM-compatible behavior, footnotes, typographic replacements, math handling, and log cross-reference handling are active
And code blocks are highlighted with Pygments using a dark theme matching the site palette
```

Rationale: Preserve renderer behavior while aligning libraries to Python.

Story: 6.5, 6.6, 6.7

OLD:

```text
Handler tests use httptest.
Store tests use Go store layer tests.
Renderer tests validate goldmark and Chroma.
```

NEW:

```text
API tests use pytest with FastAPI TestClient or HTTPX.
Repository tests use temporary SQLite fixtures and SQLAlchemy sessions.
Renderer tests use golden fixtures for markdown-it-py, mdit-py-plugins, Pygments, math handling, sanitization, and [[Log-N]] handling.
```

Rationale: Move the quality spine to Python/FastAPI tooling.

### Architecture Changes

Section: Locked Stack

OLD:

```text
Go + Astro + Preact + Tailwind v4 + SQLite
```

NEW:

```text
FastAPI + Astro + Preact + Tailwind v4 + SQLite
```

Rationale: Update the primary backend decision.

Section: Backend Structure

OLD:

```text
apps/backend/
  cmd/server/main.go
  internal/handler
  internal/middleware
  internal/migrations
  internal/model
  internal/renderer
  internal/store
  go.mod
```

NEW:

```text
apps/backend/
  pyproject.toml
  uv.lock
  alembic.ini
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
    db/
      session.py
      models.py
      repositories/
      migrations/
    domain/
      schemas.py
      services/
    renderer/
      markdown.py
      math.py
      logrefs.py
    media/
      images.py
      lqip.py
  tests/
```

Rationale: Use a modular FastAPI monolith rather than Go internal packages.

Section: Deployment

OLD:

```text
backend service runs Go compiled binary
```

NEW:

```text
backend service runs FastAPI through Uvicorn using `fastapi run app/main.py`
```

Rationale: Align production runtime with FastAPI's ASGI deployment model.

Section: Migrations

OLD:

```text
goose SQL migrations applied via Go binary
```

NEW:

```text
Alembic migrations applied before app startup or as an explicit release step, with SQLite batch-mode guidance for table alterations
```

Rationale: Preserve migration discipline with Python tooling.

### Project Context Changes

The project context should be regenerated rather than patched line by line. It currently functions as an implementation rules file for Go and would mislead future agents.

Required replacements:

- Go rules become Python/FastAPI rules.
- `go.mod`/`go.sum` become `pyproject.toml`/`uv.lock`.
- `go test ./...` becomes `uv run pytest`.
- `gofmt`, `goimports`, `golangci-lint` become `ruff format`, `ruff check`, and optional type checking.
- `goose` becomes Alembic.
- `goldmark` becomes markdown-it-py and mdit-py-plugins.
- `Chroma` becomes Pygments.
- `respondJSON` becomes a shared response-envelope helper or error response utility in FastAPI.
- Go `internal/` package structure becomes FastAPI `app/` package structure.
- Go-specific anti-patterns are removed.
- New anti-patterns are added: unmanaged `pip install`, mixed dependency managers, direct SQLite access from Astro, raw dict response drift, route logic that bypasses services/repositories, and renderer divergence.

## 5. Implementation Handoff

Scope classification: Moderate.

Route to:

- Architect: regenerate architecture around FastAPI, SQLAlchemy 2, Alembic, Pydantic, Uvicorn, and uv.
- Product Owner / Developer: update epics and sprint status to reflect FastAPI stories.
- Developer: begin implementation only after corrected artifacts are accepted.

### Success Criteria

- No planning artifact names Go as the selected backend.
- PRD keeps product behavior stable while removing Go-specific implementation requirements.
- Epics contain FastAPI, Alembic, pytest, Ruff, and uv acceptance criteria.
- Architecture defines a FastAPI modular monolith, SQLAlchemy repositories, Alembic migrations, Pydantic schemas, Uvicorn runtime, and Docker Compose deployment.
- Project context gives future agents FastAPI implementation rules, not Go rules.
- The API contract, SQLite ownership, ContentRenderer source-of-truth rule, static/prerendered reader paths, and low-JavaScript frontend architecture remain intact.

### Approval

Approved by Deppfellow on 2026-06-20.

### Final Routing

This proposal is approved for implementation planning. Because the change scope is Moderate, route next work to Product Owner / Developer for backlog reorganization and to Architect for architecture regeneration before Developer implementation begins.

The existing sprint status file still contains the previous Go-oriented story IDs. Do not mechanically update those statuses until the epics have been rewritten with the FastAPI story names and acceptance criteria.

### Recommended Next Step

Regenerate architecture, epics, project context, and sprint status around the approved FastAPI backend decision before starting implementation.
