# Story 1.1 & 1.2 Implementation Journal

Documenting the development journey of the "Core Scaffold & Home Page" and "Unified Post Model & Blog Index" stories.

## Summary of Completed Stories

### Story 1.1: Core Scaffold & Home Page
- **Goal**: Establish the base site structure and a professional landing page.
- **Key Features**: 
    - Full-width hero image with rounded borders.
    - Personal bio and social link buttons.
    - Responsive navigation bar (Home, Projects, Blogs).
    - Design tokens (colors, spacing) centralized in `variables.css`.

### Story 1.2: Unified Post Model & Blog Index
- **Goal**: Implement a content model for both blogs and projects, with a paginated index.
- **Key Features**:
    - Single `Post` model with `is_project` flag.
    - Infinite scroll using HTMX (`hx-trigger="revealed"`).
    - Reusable header partial for site-wide consistency.
    - Specialized admin configuration for content management.

---

## Technical Challenges & Solutions

### 1. TemplateSyntaxError at `/`: Invalid block tag 'static'
- **Problem**: Child templates extending `base.html` failed when using the `{% static %}` tag, even if the parent loaded it.
- **Root Cause**: Django template tags are scoped to the file they are in; they are not inherited.
- **Solution**: Always add `{% load static %}` at the top of every child template that needs to reference static assets.

### 2. CSS Changes Not Reflecting (Ghost Styling)
- **Problem**: Styles added to `base.css` were not appearing in the browser, even after standard refreshes.
- **Root Cause**: Aggressive browser caching of `.css` files.
- **Solution**: 
    - Enable **"Disable cache"** in Chrome DevTools (Network tab) during development.
    - For production-level cache busting, use `ManifestStaticFilesStorage` or append version strings (e.g., `?v=1.1`).

### 3. Infinite Scroll: Duplicate Content & Rapid Fetching
- **Problem**: Initial load immediately fetched multiple pages, and scrolling to the end resulted in duplicate posts.
- **Root Cause**: The HTMX trigger `div` was placed **inside** the `{% for %}` loop in `_post_list.html`, causing 10 triggers (one per post) to fire simultaneously.
- **Solution**: Move the `{% if page_obj.has_next %}` trigger block **outside and after** the `{% for %}` loop in the partial template.

### 4. AttributeError: 'WSGIRequest' object has no attribute 'htmx'
- **Problem**: Accessing `request.htmx` in the view caused a crash.
- **Root Cause**: `django_htmx.middleware.HtmxMiddleware` was omitted from the `MIDDLEWARE` list in `settings.py`.
- **Solution**: Registering the middleware ensures the `.htmx` property is attached to every request.

---

## Architectural Decisions

### Reusable Header Partial
- **Decision**: Extracted Header and Navigation into `templates/partials/_header.html`.
- **Benefit**: Ensures any change to the site header (like adding a new link) only needs to happen in one file, keeping both Home and Blog pages perfectly in sync.

### HTMX Infinite Scroll Strategy
- **Decision**: Used `hx-swap="outerHTML"` on the trigger div itself.
- **Benefit**: Each new page provides its own trigger for the *next* page, replacing itself. This creates a clean, recursive flow without complex JavaScript state management.
