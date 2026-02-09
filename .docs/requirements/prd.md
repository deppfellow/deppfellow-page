# Product Requirements Document: Kura

## Executive Summary
Kura is a high-performance **Personal Siteblog & Portfolio** designed to demonstrate full-stack mastery through its architecture. Unlike typical static sites, Kura is a **living web application** that combines the speed and SEO of server-side Django with the rich interactivity of React "Islands" (ADR-001).

**Core Differentiator:** "Instant Identity." A recruiter landing on the site understands who the user is and what they can do within 3 seconds, with page transitions so fast (Sub-1s LCP) they feel local.

---

## Success Criteria

### User Success (Visitor)
*   **Instant Identity:** Visitors understand *exactly* who you are and what you do within **3 seconds** of landing.
*   **Zero-Friction Discovery:** Visitors can find any specific post or topic in **< 3 clicks/keypresses** (via Cmd+K or Sidebar).
*   **Perceived Speed:** Page transitions feel "instant" (approx. 100ms response).

### Business Success (Owner)
*   **Technical Authority:** The site itself serves as the primary portfolio piece, demonstrating architectural intent (Hybrid App, Monorepo, SQLite optimization).
*   **Workflow Velocity:** Publishing a thought takes minimal friction (Markdown -> Live).

### Technical Success Targets
*   **Performance:** Sub-1s initial load time (LCP) on 3G networks.
*   **Optimization:** 100/100 Lighthouse Performance Score.
*   **Efficiency:** Initial JavaScript Bundle size kept strictly **< 200KB**.

---

## User Journeys

### 1. The "Seconds-to-Decision" Recruiter
*   **Context:** Arrives via LinkedIn with 10 tabs open. Skimming for competence.
*   **Action:** Lands on Home. Instantly sees "Bio + Pinned Projects". No scrolling needed.
*   **Climax:** Clicks a Pinned Project. Transition is *instant* (100ms). She notices the speed.
*   **Resolution:** "Okay, this isn't a template. He knows performance." Bookmarks to contact later.

### 2. The "Deep-Dive" Developer
*   **Context:** Lands on a specific blog post from Google search.
*   **Action:** Finishes reading, wants to explore more content on "Django".
*   **Climax:** hits `Cmd+K`. The search palette opens instantly (React Island). Types "Djan...". Results filter in real-time.
*   **Resolution:** Navigates to the next post without touching the mouse.

### 3. The "Flash of Inspiration" Owner
*   **Context:** Reading own post and spots a typo or wants to add a diagram.
*   **Action:** Already logged in. No need for `/admin`. Clicks "Edit" floating action button.
*   **Climax:** Screen splits. Editor (React Island) on left, Live Preview (MDX) on right. Fixes typo.
*   **Resolution:** Hits "Save". Updates are live immediately.

---

## Product Scope & Strategy

### MVP Strategy: "The Experience is the Product"
We are building an **Experience MVP**. The content capability is standard (Blog), but the *delivery mechanism* (Speed, Design, Interaction) is the product value.

### Phase 1: MVP (Must-Ship)
*   **Engine:** `Django` Monorepo + `SQLite` (ADR-002).
*   **Architecture:** Hybrid "Islands" (Django HTML + React Embeds) (ADR-001).
*   **Infrastructure:** VPS with Docker Compose (ADR-003).
*   **Public Features:** Home (Bio/Pinned), Blog Index (Infinite), Post Detail, Command-K Search.
*   **Admin Features:** Frontend "Edit-in-place" Overlay (MDX).

### Phase 2: Growth (Post-Launch)
*   RSS Feed / Sitemap generation.
*   "Share Draft" secret links.
*   Interactive "Code Playground" components in runs.

### Phase 3: Vision (Future)
*   Fully decoupled "Digital Garden" with bi-directional backlinks.

---

## Functional Requirements

### 1. Public Experience (Visitor)
*   **FR-01:** Visitors can view the Home page with Bio, Pinned Projects, and Recent Posts.
*   **FR-02:** Visitors can read full blog posts with syntax highlighting.
*   **FR-03:** Visitors can view a dedicated "Post Index" with infinite scroll capabilities.
*   **FR-04:** Visitors can view a dedicated "Portfolio Index" with project cards.
*   **FR-05:** Visitors can click Pinned Projects to view details instantly.

### 2. Discovery & Navigation (React Islands)
*   **FR-06:** Visitors can trigger a Command Palette via `Cmd+K` or search icon (Client-side hydration).
*   **FR-07:** Visitors can filter posts by title or tag within the Command Palette.
*   **FR-08:** Visitors can navigate using keyboard shortcuts (Next/Prev post).

### 3. Owner Management (Auth & Admin)
*   **FR-09:** Owner can log in via a secure session-based authentication (Django Std Lib).
*   **FR-10:** Owner can see "Edit" buttons on posts when logged in (Contextual Admin).
*   **FR-11:** Owner can edit post content (MDX) and Metadata (Title, Date, Tags) in a split-pane view.
*   **FR-12:** Owner can upload images directly into the editor (drag & drop or select).
*   **FR-13:** Owner can "Save" changes to update the live site immediately (No build step).

### 4. Technical System Capabilities
*   **FR-15:** System renders SEO-friendly HTML for all public pages (Server-Side default).
*   **FR-16:** System hydrates only specific interactive elements (Search, Editor) to minimize TTI.

---

## Non-Functional Requirements & Architecture

### Performance (Critical Reference: ADR-001, ADR-002)
*   **NFR-01 (LCP):** Largest Contentful Paint must occur within **1.0 second** on 3G Fast.
*   **NFR-02 (CLS):** Cumulative Layout Shift must be **0.00** (Strict prevention of font/image jumps).
*   **NFR-03 (Bundle):** Initial JavaScript Payload must be **< 200KB** (gzip).
*   **NFR-04 (Score):** Must score **100/100** in Lighthouse Performance.

### Architecture & Maintainability
*   **NFR-05 (Database):** Use **SQLite** for zero-latency reads (ADR-002).
*   **NFR-06 (Deployment):** Deploy via Docker Compose on **VPS** to ensure filesystem persistence (ADR-003).
*   **NFR-07 (Complexity):** Frontend build step must remain under 60 seconds.
*   **NFR-08 (Accessibility):** Must pass **WCAG AA** automated audit.

### Security
*   **NFR-09 (Backup):** SQLite file must automatically backup to remote storage (e.g., S3) hourly.
*   **NFR-10 (Sanitization):** All user input (MDX/Search) must be sanitized to prevent XSS.
