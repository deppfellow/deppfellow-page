# Kura - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Kura, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitors can view the Home page with Bio, Pinned Projects, and Recent Posts.
FR2: Visitors can read full blog posts with syntax highlighting.
FR3: Visitors can view a dedicated "Post Index" with infinite scroll capabilities.
FR4: Visitors can view a dedicated "Portfolio Index" with project cards.
FR5: Visitors can click Pinned Projects to view details instantly.
FR6: Visitors can trigger a Command Palette via `Cmd+K` or search icon (Client-side hydration).
FR7: Visitors can filter posts by title or tag within the Command Palette.
FR8: Visitors can navigate using keyboard shortcuts (Next/Prev post).
FR9: Owner can log in via a secure session-based authentication (Django Std Lib).
FR10: Owner can see "Edit" buttons on posts when logged in (Contextual Admin).
FR11: Owner can edit post content (Enhanced `python-markdown`) and Metadata (Title, Date, Tags) in a split-pane view.
FR12: Owner can upload images directly into the editor (drag & drop or select).
FR13: Owner can "Save" changes to update the live site immediately (No build step).
FR15: System renders SEO-friendly HTML for all public pages (Server-Side default).
FR16: System hydrates only specific interactive elements (Search, Editor) to minimize TTI.

### NonFunctional Requirements

NFR1: Largest Contentful Paint must occur within **1.0 second** on 3G Fast.
NFR2: Cumulative Layout Shift must be **0.00** (Strict prevention of font/image jumps).
NFR3: Initial JavaScript Payload must be **< 200KB** (gzip).
NFR4: Must score **100/100** in Lighthouse Performance.
NFR5: Use **SQLite** for zero-latency reads (ADR-002).
NFR6: Deploy via Docker Compose on **VPS** to ensure filesystem persistence (ADR-003).
NFR7: Frontend build step must remain under 60 seconds.
NFR8: Must pass **WCAG AA** automated audit.
NFR9: SQLite file must automatically backup to remote storage (e.g., S3) hourly.
NFR10: All user input (Enhanced `python-markdown`/Search) must be sanitized to prevent XSS.

### Additional Requirements

- Create a custom "Kura" scaffold using `uv` and `django-admin` (Architecture).
- Stack: Django + HTMX + Alpine.js (No React/Node) (Architecture).
- Database: SQLite 3.45+ (WAL Mode) (Architecture).
- Backup: Litestream sidecar container (Architecture).
- Styling: Vanilla CSS + Variables (No Tailwind) (Architecture).
- Content Engine: `python-markdown`, not MDX (Architecture).
- Observability: Sentry for errors, Nginx access logs for analytics (Architecture).
- Structure: Specific directory structure (apps/, templates/partials/, static/vendor/) (Architecture).
- Naming Conventions: Snake_case for Python/DB, CamelCase for Alpine UI state (Architecture).
- Editor Fidelity: Preview matches Public render 100% (Architecture).

### FR Coverage Map

FR1: Epic 1 - Home Page
FR2: Epic 1 - Blog Post Detail
FR3: Epic 1 - Post Index
FR4: Epic 1 - Portfolio Index
FR5: Epic 1 - Pinned Projects
FR6: Epic 2 - Command Palette
FR7: Epic 2 - Search Filtering
FR8: Epic 2 - Keyboard Navigation
FR9: Epic 3 - Authentication
FR10: Epic 3 - Contextual Edit Button
FR11: Epic 3 - Split-Pane Editor
FR12: Epic 3 - Image Upload
FR13: Epic 3 - Live Save
FR15: Epic 1 - SEO HTML (Core Capability)
FR16: Epic 2 - Interactive Hydration (Core Capability)

## Epic List

### Epic 1: Public Portfolio & Blog Experience
**Goal:** Establish the core value proposition: a lightning-fast, SEO-optimized portfolio and blog that communicates "Instant Identity" to recruiters and developers.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR15.

### Story 1.1: Core Scaffold & Home Page
As a **Visitor**,
I want **to see the Home Page with Bio and Identity**,
So that **I immediately understand who the owner is**.

**Acceptance Criteria:**

**Given** a fresh repository
**When** `uv sync` and `manage.py runserver` are run
**Then** the app starts without errors
**And** the styling uses the Vanilla CSS variables defined in architecture

**Given** a visitor lands on `/`
**Then** they see the "Bio" section and "Social Links"
**And** the LCP is under 1.0s (verified via DevTools)

### Story 1.2: Unified Post Model & Blog Index
As a **Visitor**,
I want **to scroll through an infinite list of recent thoughts**,
So that **I can consume content without clicking pages**.

**Acceptance Criteria:**

**Given** I am on the Blog Index
**When** I scroll to the bottom
**Then** the next 10 posts load automatically (Infinite Scroll via HTMX `revealed` trigger)
**And** HTMX request ensures only one 'Load More' request is in-flight at a time
**And** when the last post is loaded, the trigger is replaced with an 'End of Content' message
**And** utilize `htmx-history-elt` or similar to ensure scroll position is restored strictly when navigating back
**And** the **Unified Post Model** is created with: `title`, `slug`, `tags`, `content`, `published_at`, `edited_at`, `is_published`, `is_project`, `is_pinned`
**And** Model includes explicit validation constraints (e.g., Projects MUST have an image, Posts MUST have a date)

**Given** the Blog Index loads
**Then** it filters for `is_project=False` (or appropriate filter for "Blog Only" posts)

### Story 1.3: Post/Project Detail View
As a **Visitor**,
I want **to read the full markdown content of a post or project**,
So that **I can understand the details**.

**Acceptance Criteria:**

**Given** I click a Blog Post title OR a Project Card
**Then** I am navigated to the Detail View
**And** the Markdown content is rendered server-side
**And** this single view handles both "Posts" and "Projects" (since usage is identical)

### Story 1.4: Portfolio Index & Pinned Projects
As a **Visitor**,
I want **to see a dedicated Portfolio and Pinned items**,
So that **I can focus on the work samples**.

**Acceptance Criteria:**

**Given** I am on the Home Page
**Then** I see the Pinned Section showing posts where `is_project=True` AND `is_pinned=True`

**Given** I am on the Portfolio Index
**Then** I see all posts where `is_project=True`
**And** clicking a Project Card takes me to the detail view (Story 1.3)

### Epic 2: Instant Discovery & Navigation
**Goal:** Eliminate friction in content discovery by implementing the "Command-K" palette and keyboard navigation, demonstrating the "Islands Architecture" concept using **HTMX & Alpine.js** (Zero-Build hydration).
**FRs covered:** FR6, FR7, FR8, FR16.

### Story 2.1: Command Palette UI (Alpine.js Modal)
As a **Visitor**,
I want **to press `Cmd+K` to open a search palette**,
So that **I can find content instantly from anywhere**.

**Acceptance Criteria:**

**Given** I am on any page
**When** I press `Cmd+K` (or `Ctrl+K`)
**Then** the Search Modal opens
**And** the modal has an `autofocus` input field

**When** I press `Esc` or click the overlay
**Then** the modal closes
**And** there is a visible "Search" icon in the UI that also triggers the modal (Mobile accessibility)
**And** the modal pushes a history state when opened, so the 'Back' button closes the modal naturally

### Story 2.2: HTMX Search Engine
As a **Visitor**,
I want **to see results filter in real-time as I type**,
So that **I get immediate feedback**.

**Acceptance Criteria:**

**Given** the Search Modal is open
**When** I type "Django"
**Then** the results list updates via an HTMX request to `/search/`
**And** the search logic queries the **Unified Post Model** (searching titles and tags)
**And** the interaction is debounced (e.g., 300ms) to prevent server overload
**And** using arrow keys highlights results (managed by Alpine)

> **Rationale:** Use HTMX to reuse server-side templates (DRY). Do NOT create a JSON endpoint.

### Story 2.3: Keyboard Navigation & Accessibility
As a **Power User**,
I want **to navigate the site using keyboard shortcuts**,
So that **I can browse efficiently**.

**Acceptance Criteria:**

**Given** I am viewing a post
**When** I press `j` (Next) or `k` (Prev)
**Then** I am navigated to the adjacent post

**Given** I am on the Home/Index
**When** I press `Enter` on a focused project card
**Then** it opens
**And** the Search Modal is fully navigable via Keyboard (Tab/Arrows)

### Epic 3: Owner Content Management
**Goal:** Empower the owner to maintain the site effortlessly with a "Live Editor" experience using Server-Side Preview (HTMX), proving that a complex admin interface isn't needed for a personal site.
**FRs covered:** FR9, FR10, FR11, FR12, FR13.

### Story 3.1: Authentication & Contextual Admin
As an **Owner**,
I want **to log in and see admin controls on the live site**,
So that **I can manage content without a separate dashboard**.

**Acceptance Criteria:**

**Given** I navigate to `/login/`
**Then** I see a standard login form

**When** I log in successfully
**Then** I am redirected to the Home Page
**And** my session is long-lived (e.g., 2 weeks) to avoid frequent re-logins (Pre-mortem fix)
**And** sensitive actions (Publish/Delete) require 'Sudo Mode' password re-entry if > 4 hours since last active

**And** when viewing a Post, I see a floating "Edit" button
**And** when on the Index, I see a "New Post" button

### Story 3.2: The "Live Editor UI" (Split-Pane)
As an **Owner**,
I want **to write in Markdown and see the HTML result immediately**,
So that **I can catch formatting errors instantly**.

**Acceptance Criteria:**

**Given** I click "Edit" on a post
**Then** the **Live Editor Overlay** opens
**And** it shows a Split-Pane view: Textarea (Left) and Preview (Right)

**When** I type in the textarea
**Then** the Preview updates automatically (Triggered via `keyup changed delay:500ms` -> HTMX POST `/preview/`)
**And** `hx-sync` is used to abort previous preview requests if a new one starts (Last-Write-Wins)
**And** the Preview renders using the exact same CSS/Markdown engine as the public view
**And** preview generation is paused if content length > 50k characters (Performance guard)

> **Rationale:** Use Server-Side preview to ensure 100% parity with custom Python-Markdown extensions. Do NOT use client-side rendering.

### Story 3.3: Editor Actions (Save & Uploads)
As an **Owner**,
I want **to save my work and include images easily**,
So that **I can publish rich content fast**.

**Acceptance Criteria:**

**Given** the Editor is open
**When** I click "Save"
**Then** the content is persisted to the DB via HTMX
**And** a success notification appears without reloading the page
**And** if 'Save' fails (network/server error), a persistent error toast appears, and content REMAINS in the textarea (Never clear on error)

**When** I **Drag & Drop** OR **Paste** an image into the textarea
**Then** it is uploaded to the server (Pre-mortem fix)
**And** file size is validated client-side (Max 5MB) before upload starts
**And** server validates the actual file header (magic numbers), not just the extension
**And** the resulting Markdown `![image](/media/...)` is inserted into the text automatically at the cursor position


