# Story 1.3 Implementation Journal

Documenting the implementation of the "Post/Project Detail View".

## Summary
- **Goal**: Implement a detailed view for blog posts and projects.
- **Key Features**:
    - Single view handling both types via unified model.
    - Server-side Markdown rendering using `python-markdown`.
    - Integrated syntax highlighting support (`codehilite`).
    - Slug-based URL routing for SEO.
    - Breadcrumbs and styled tag pills.

## Technical Challenges & Solutions

### 1. Template Discovery Fail
- **Problem**: `TemplateNotFound` when placing the template in `partials/blog/`.
- **Solution**: Moved the file to `templates/blog/` to match the view's request and standardized the organization. Full pages belong in the app's template folder; snippets belong in `partials/`.

### 2. Markdown Rendering
- **Problem**: Need to render Markdown to HTML safely.
- **Solution**: Used the `markdown` library in the view. Added `|safe` in the template to tell Django to trust the generated HTML.

### 3. Many-to-Many UX (The "Ghost Tags" Mystery)
- **Problem**: Tags added via shell or selected in admin were "disappearing" or not appearing in the frontend.
- **Root Cause**: The default Django Admin widget for M2M is a standard select box which requires `Ctrl/Cmd+Click` to keep multiple selections. Saving without doing this cleared previous tags.
- **Solution**: Implemented `filter_horizontal = ('tags',)` in `PostAdmin`. This provides a two-column interface that makes it explicit which tags are linked.

## Architectural Decisions
- **get_absolute_url**: Used the model's canonical URL method instead of hardcoding `{% url %}` tags. This improves maintainability (DRY) and integrates better with Django's admin.
- **Islands of Styling**: Created `post_detail.css` to keep the detail view styling isolated from the global `base.css`.
- **Breadcrumbs**: Implemented server-side breadcrumbs for better navigation and SEO hierarchy.
