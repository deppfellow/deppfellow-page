# Story 1.4 Implementation Details

## Overview
This story established a clear separation between blog content and portfolio projects, while reusing the `Post` model for architectural simplicity.

## Key Decisions

### Top-Level Routing
Instead of `blog/projects/`, we opted for a cleaner `projects/` route. This was achieved by importing the `project_index` view into `apps/core/urls.py`. This decision keeps URLs intuitive for users while maintaining code cohesion in the `blog` app.

### Layout Divergence
- **Home Page**: Uses a `grid` layout (`project-grid`) to showcase pinned projects visually in a compact format.
- **Projects Index**: Uses a `flex-column` layout (`project-list`) with row-based cards on desktop to provide more space for descriptions and detail.

### UI Refinements
- **CSS Reset**: Implemented a modern universal reset in `base.css` to eliminate browser inconsistencies and enable precise layout control.
- **Sticky Footer in Cards**: Used `flex: 1` and `margin-top: auto` on "Know more" links to ensure they always align at the bottom of cards regardless of text length.
- **Dynamic Breadcrumbs**: Updated the post detail template to detect if the current content is a project or a post, ensuring the breadcrumb path reflects the correct context.

## Technical Debt / Follow-ups
- Image field handling: Ensure a default image or placeholder is used if `project.image` is null.
- SEO: Basic titles and meta descriptions are in place, but could be enhanced per project.
