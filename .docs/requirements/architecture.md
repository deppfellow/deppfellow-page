# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Analysis of 16 FRs indicates a system divided into two distinct interaction models:
1.  **Public (Read):** Standard Server-Side Django.
2.  **Admin (Write):**
    *   **Discovery:** **Alpine.js** (UI) + **HTMX** (Search).
    *   **Editor:** **HTMX** (Server-Side Preview) + **Alpine.js** (UI).
    *   **Rich Content:** **python-markdown** (Standard Lib compatible) extension engine.

**Non-Functional Requirements:**
1.  **Performance:** Sub-1s LCP via Nginx Caching.
2.  **Simplicity:** Strict "Server Source of Truth".
3.  **Reliability:** Zero-data-loss architecture via Streaming Replication.

**Scale & Complexity:**
-   **Low Complexity.**
-   Components: Django, SQLite, HTMX/Alpine, Nginx, **Litestream**.

### Technical Constraints & Dependencies

-   **Backend:** Django.
-   **Database:** SQLite (WAL Mode).
-   **Frontend:** HTMX + Alpine Only.
-   **Content Engine:** **python-markdown**.
-   **Storage:** Local filesystem (Media) + **Litestream** (DB Backup -> S3/Compatible).

### Cross-Cutting Concerns Identified

1.  **Editor Fidelity:** Preview matches Public render 100% (Single Source).
2.  **Latency Acceptance:** Editor preview has network delay.
3.  **Disaster Recovery:** **Litestream** sidecar container in Docker Compose to stream WAL frames to object storage.

## Starter Template Evaluation

### Primary Technology Domain

Type: **Server-Side Web Application (Hypermedia-Driven)** defined by `Django` + `HTMX`.

### Starter Options Considered

1.  **`pydanny/cookiecutter-django`**: The industry standard, but **REJECTED**.
    *   *Reason:* Too heavy. Includes Celery, Mailhog, and complex Docker setups by default. Violates "Simplicity".
2.  **`django-htmx-alpine-starter` (Various GitHub repos)**: **REJECTED**.
    *   *Reason:* Most force TailwindCSS (violating `web_app_dev` rules) or huge JS bundles.
3.  **Custom "Kura" Scaffold**: **SELECTED**.
    *   *Reason:* We need a specific, non-standard stack: Vanilla CSS (No build step), Litestream (Sidecar), and SQLite WAL.

### Selected Approach: Custom "Kura" Scaffold

**Rationale for Selection:**
No public starter perfectly matches the "No-Build-Step + Litestream + Vanilla CSS" requirement. Building a minimal scaffold ensures 100% understanding of the architecture and zero technical debt.

**Initialization Plan (Implementation Task):**

```bash
# Initialize project with uv
mkdir kura && cd kura
uv init

# Add dependencies
uv add django django-htmx django-litestream markdown

# Initialize Django project
uv run django-admin startproject config .
mkdir -p apps/core templates/partials static/css static/js
```

**Architectural Decisions Provided by Scaffold:**

**Language & Runtime:**
*   **Manager:** `uv` (Modern, fast Python package manager).
*   **Python:** 3.12+ (Type Hinting enabled).
*   **Django:** 5.x (Latest LTS).

**Styling Solution:**
*   **Vanilla CSS:** Located in `static/css/base.css` (No pre-processors).
*   **Methodology:** Semantic HTML + CSS Variables.

**Testing & QA:**
*   **Runner:** `uv run python manage.py test`.
*   **Linting:** `ruff` (integrated via `uv` dev dependencies).

**Code Organization:**
*   `apps/`: Implementation logic.
*   `templates/partials/`: HTMX fragments.
*   `static/vendor/`: Vendor JS committed to repo (No npm).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1.  **Framework Stack:** Django + HTMX + Alpine (No React/Node).
2.  **Data Persistence:** SQLite + Litestream (No Postgres/RDS).
3.  **API Strategy:** Pure Django Views (No DRF).

**Important Decisions (Shape Architecture):**
1.  **CSS Architecture:** Vanilla CSS + Variables (No Tailwind).
2.  **Content Engine:** `python-markdown` (No MDX).

**Deferred Decisions (Post-MVP):**
1.  **RSS/Syndication:** Post-launch feature.
2.  **Public API:** Only if requested by third-party integrations later.

### Data Architecture

*   **Database Engine:** SQLite 3.45+ (via Docker image).
*   **Configuration:** `journal_mode=WAL` (Write-Ahead Logging) enabled.
*   **Backup/Recovery:** **Litestream** sidecar replicating to S3-compatible storage.
*   **Validation:** Standard Django `Forms` / `Models`. "Thick Models" pattern for business logic.

### Authentication & Security

*   **Auth Model:** Custom `AbstractUser` (Future-proofing) but strictly using Django's persistent session based auth.
*   **Admin Access:** Standard Django Admin `/admin/`.
*   **Rate Limiting:** **Nginx-level** (`limit_req_zone`) for `/admin` and Search endpoints to protect the application server.

### API & Communication Patterns

*   **Strategy:** **HTML-over-the-wire**.
*   **Endpoints:** Standard Django Views (`def view(request):`).
*   **Response Type:**
    *   Full Page: `render(request, 'page.html')`
    *   HTMX Partial: `render(request, 'partials/fragment.html')`
*   **JSON usage:** Strictly limited to non-HTML data (e.g., if a chart needs raw data points), using `JsonResponse`.

### Frontend Architecture

*   **Build Pipeline:** **None.**
*   **Dependencies:** `htmx.min.js` and `alpine.min.js` stored in `static/vendor/`.
*   **State Management:**
    *   **Server:** Source of Truth (Database).
    *   **Client (Ephemeral):** Alpine.js `x-data` for UI state (e.g., `isOpen`, `activeTab`).
*   **Styling:** Native CSS nesting and variables.

### Infrastructure & Deployment

*   **Containerization:** `Docker Compose`.
    *   Service 1: `app` (Django + Gunicorn).
    *   Service 2: `proxy` (Nginx + Cache).
    *   Service 3: `litestream` (Sidecar for DB).
*   **Deployment Target:** Single VPS (e.g., Hetzner/DigitalOcean).

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database & Python (Strict `snake_case`):**
*   **Tables/Models:** `snake_case` (e.g., `user_profile`, `blog_post`).
*   **Fields/Variables:** `snake_case` (e.g., `created_at`, `is_published`).
*   **Foreign Keys:** `target_id` (e.g., `author_id`).

**Frontend State (Hybrid):**
*   **UI State (Alpine):** `camelCase` (e.g., `isOpen`, `activeTab`, `toggleMenu()`).
*   **Data Props (from DB):** `snake_case` (Raw mapping).
    *   *Why:* To avoid error-prone mapping layers. If Django sends `{'user_id': 1}`, Alpine receives `user_id`.

**HTMX Partials:**
*   **Location:** `templates/partials/{app_name}/`
*   **Naming:** `_{snake_case}.html` (Prefix `_` indicates fragment).
    *   *Example:* `templates/partials/blog/_comment_list.html`

### Structure Patterns

**Project Organization:**
*   **Apps:** All feature modules live in `kura/apps/`.
*   **Tests:** Co-located in `kura/apps/{app_name}/tests/`.
*   **Partials:** Grouped by app in `templates/partials/`.

**File Structure Examples:**
*   `kura/apps/blog/views.py` (Standard Views)
*   `kura/apps/blog/hx_views.py` (HTMX-specific partial views - Separation of Concerns).
*   `static/css/base.css` (Global styles).

### Format Patterns

**API/HTMX Responses:**
*   **Success:** HTTP 200 + HTML Fragment.
*   **Validation Error:** HTTP 200 (with form errors rendered) OR HTTP 422.
    *   *Pattern:* Retarget the form container with the HTML including error messages.
*   **Empty State:** Return empty string (HTTP 204 No Content).

### Communication Patterns

**Data Interface (Django -> Alpine):**
*   **Pattern:** "Data as Props".
    *   *Good:* `<div x-data="editor({ content: '{{ post.content|escapejs }}' })">`
    *   *Bad:* Fetching JSON on load to hydrate state.

**Loading States:**
*   **Pattern:** `hx-indicator`.
    *   Use `.htmx-indicator { display: none; }` and `.htmx-request .htmx-indicator { display: inline; }`.

### Enforcement Guidelines

**All AI Agents MUST:**
1.  **Never** introduce a build step (No `npm install`, no `webpack`).
2.  **Always** use `_` prefix for HTMX partial templates.
3.  **Always** use `hx-views.py` for endpoints that return partials (keep `views.py` for full pages).

**Anti-Patterns:**
*   ❌ Creating a REST API serializer for an internal feature.
*   ❌ Using `camelCase` for database fields in Python.
*   ❌ putting logic in `templatetags` that belongs in the View.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
kura/
├── manage.py
├── pyproject.toml              # uv dependency definition
├── config/                     # Django Project Config
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                       # Feature Modules (Domain Logic)
│   ├── core/                   # Shared mixins, utils
│   ├── blog/                   # Blog Engine
│   │   ├── models.py
│   │   ├── views.py            # Full Page Views
│   │   ├── hx_views.py         # HTMX Partial Views (Strict Separation)
│   │   ├── services.py         # Business Logic (Thick Service Layer)
│   │   └── tests/
│   ├── portfolio/              # Projects Showcase
│   └── search/                 # Command Palette Logic
├── lib/                        # Custom Library Code
│   ├── markdown_ext/           # Custom Python-Markdown Extensions
│   └── litestream/             # Litestream Config Wrappers
├── templates/
│   ├── base.html               # Main Layout (CSS Imports)
│   ├── includes/               # Standard Django Includes (Header/Footer)
│   └── partials/               # HTMX FRAGMENTS ONLY
│       ├── blog/
│       │   ├── _post_list.html
│       │   └── _editor_preview.html
│       └── search/
│           └── _results.html
├── static/
│   ├── css/
│   │   ├── variables.css       # Design Tokens
│   │   └── base.css            # Global Styles
│   ├── js/
│   │   └── app.js              # Alpine Components
│   └── vendor/                 # Committed libs (htmx.min.js, alpine.min.js)
├── docker/
│   ├── Dockerfile
│   ├── litestream.yml          # Replication Config
│   └── nginx/
│       └── default.conf        # Caching Rules
└── docker-compose.yml
```

### Architectural Boundaries

**API Boundaries:**
*   **Public Web:** Standard Django Views (Return HTML Pages).
*   **HTMX Internal:** `hx_views.py` (Return HTML Fragments). *Strictly internal use only.*
*   **No Public JSON API:** Except for potential health checks.

**Component Boundaries:**
*   **Django <-> Alpine:** One-way data flow via "Data Props" (Django renders `x-data` attributes).
*   **Django <-> HTMX:** Server-driven state. HTMX requests trigger server logic which returns new HTML state.

**Service Boundaries:**
*   **Service Layer Pattern:** Business logic (Search, Markdown parsing) lives in `services.py` or `lib/`. Views are thin translation layers.

**Data Boundaries:**
*   **Database:** SQLite file managed by Django ORM.
*   **Replication:** Litestream sidecar process (Docker) manages backups. Django implementation is unaware of S3.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
*   **Blog Engine:** `apps/blog/`
*   **Command Palette:** `apps/search/` + `templates/partials/search/`
*   **Live Editor:** `apps/blog/hx_views.py` (Preview logic) + `templates/partials/blog/_editor_preview.html`

**Cross-Cutting Concerns:**
*   **Markdown Parsing:** `lib/markdown_ext/`
*   **Styling:** `static/css/` (Global tokens)
*   **Auth:** `apps/core/` (User model) or `apps/users/` if separated.

### Integration Points

**Internal Communication:**
*   **Views -> Services:** Direct Python function calls.
*   **HTMX -> Views:** HTTP POST/GET requests.

**External Integrations:**
*   **S3-Compatible Storage:** Litestream connects via ENV variables (Hidden from App).

**Data Flow:**
1.  User Interacts (Browser/Alpine)
2.  HTMX Request -> Nginx -> Gunicorn -> Django
3.  Django View -> Service -> DB
4.  Django View renders Template Partial
5.  Response -> Browser (Swap HTML)

### File Organization Patterns

**Configuration Files:**
*   **Django:** `config/settings/`
*   **Deps:** `pyproject.toml`
*   **Docker:** `docker/` folder keeps root clean.

**Source Organization:**
*   **Domain Logic:** `apps/`
*   **Infrastructure Code:** `lib/`

**Test Organization:**
*   **Unit/Integration:** Co-located in `apps/{app}/tests/`.
*   **E2E:** `tests/e2e/` (if using Playwright/Selenium later) or `apps/core/tests/test_flows.py`.

**Asset Organization:**
*   **Local Dev:** Served by Django `runserver`.
*   **Production:** Collected to `staticfiles` volume, served by Nginx.

## Observability Strategy

*   **Logs:** Standard Output (12-Factor). Managed by Docker Logging Driver (json-file).
*   **Errors:** **Sentry** (Free Tier) to capture unhandled 500s.
    *   *Constraint:* Must be configured via `SENTRY_DSN` env var.
    *   *Fallback:* If DSN not present, log tracebacks to stderr only.
*   **Analytics:** Server-side Nginx Access Logs (No JS trackers).

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
*   **Tech Stack:** Django + HTMX + Alpine is a known, stable stack. It eliminates the routing issues of React Hybrids.
*   **Data Layer:** SQLite WAL + Litestream is the standard for high-performance, single-node persistence.
*   **Pattern Alignment:** "Snake_case" for Python/DB and "Data Props" for Alpine limits context-switching friction.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
*   **Public (FR-01 to FR-05):** Covered by standard Django Views (`apps/blog/views.py`).
*   **Discovery (FR-06 to FR-08):** Covered by `apps/search` + Alpine Modal + HTMX Search Endpoint.
*   **Admin (FR-09 to FR-13):** Covered by Django Auth + `apps/blog/hx_views.py` (Live Preview Editor).

**Non-Functional Requirements Coverage:**
*   **Performance:** Addressed by Nginx Caching, Zero-Build CSS, and removal of React (Bundle Size < 50KB vs < 200KB target).
*   **Complexity:** Build time is 0s (Python only).
*   **Security:** Addressed by Litestream (Backup) and Django Templates (Auto-escaping).

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
1.  **Zero-Build Pipeline:** Eliminates entire category of "Webpack/Vite" bugs.
2.  **Single-Language Logic:** All business logic is Python. JS is purely cosmetic.
3.  **Production-Grade Persistence:** Litestream provides stronger guarantees than ad-hoc cron jobs.

### Implementation Handoff

**First Implementation Priority:**
Initialize the scaffold:
```bash
mkdir kura && cd kura
uv init
uv add django django-htmx django-litestream markdown
uv run django-admin startproject config .
```
