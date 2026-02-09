# Story 1.1: Core Scaffold & Home Page - Implementation Tasks

**Goal**: Complete the Home Page content to match the "Instant Identity" requirement.
**Status**: In Progress

## 1. Update Bio Section
**File**: `templates/core/home.html`

Replace the existing placeholder content in the `{% block content %}` with the following structure.
Ensure you use semantic HTML (e.g., `<section>`, `<h1>`, `<p>`).

**Content to Use**:
> **Yo, Deppfellow Here!**
> "Here, I dump all my notes, archive, and documentations, beside serving as my profile page. I'll write all reports, resources, even my random thoughs that whatever catches my fancy. It's like my personal warehouse but I made it public. You might found something useful, interesting, or even junks. Wanna exchange ideas? DM me at @fidrafif on X"

## 2. Implement Social Links
**File**: `templates/core/home.html`

Add a section for social links below the bio. Use a clean list structure or a flexbox container.

**Links**:
-   **GitHub**: `https://github.com/deppfellow`
-   **Twitter/X**: `https://x.com/fidrafif`
-   **LinkedIn**: `#` (Placeholder)

**Suggested HTML Structure**:
```html
<div class="social-links">
    <a href="https://github.com/deppfellow" target="_blank">GitHub</a>
    <a href="https://x.com/fidrafif" target="_blank">Twitter/X</a>
    <a href="#" target="_blank">LinkedIn</a>
</div>
```

## 3. Apply Minimal Styling
**File**: `static/css/base.css`

Add styles to ensure the bio and social links look minimal and clean, matching the design aesthetic.

**Requirements**:
-   Start with `variables.css` colors (`var(--text-primary)`, `var(--accent)`).
-   Ensure good spacing between the heading, bio text, and social links (use `gap` or `margin`).
-   Social links should be clearly clickable (hover effects).

## 4. Verification
1.  Run the server: `python manage.py runserver`
2.  Visit `http://127.0.0.1:8000/`
3.  Check:
    -   Bio text is correct.
    -   Links work and open in new tabs (`target="_blank"`).
    -   Responsive layout (looks good on mobile).
