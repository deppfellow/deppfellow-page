## 1. Django Request/Response Lifecycle (The "Plumbing")

Understanding how a request from a browser reaches your template is crucial for debugging and architectural planning.

### The Trace (Step-by-Step)

1.  **Incoming Request**: A user types `127.0.0.1:8000/`.
2.  **Root URL Configuration**: Django checks `ROOT_URLCONF` in `settings.py` (points to `config/urls.py`).
3.  **URL Matching (Global)**: Django matches the empty string `''` in `config/urls.py`:
    ```python
    path('', include('apps.core.urls')),
    ```
4.  **URL Matching (App-Specific)**: Django enters `apps/core/urls.py` and finds:
    ```python
    path('', views.home, name='home'),
    ```
5.  **View Execution**: The `home` function in `apps/core/views.py` is called.
6.  **Template Selection**: The view calls `render(request, 'core/home.html')`.
7.  **Template Inheritance (The Sandwich)**:
    *   Django opens `home.html`.
    *   It sees `{% extends "base.html" %}` and loads `base.html` as the skeleton.
    *   It injects the `{% block content %}` from `home.html` into the reserved slot in `base.html`.
8.  **Final Response**: The assembled HTML is sent back to the browser.

### The "Why"
This separation of concerns allows for:
*   **DRY (Don't Repeat Yourself)**: Global layout (Navbar, CSS imports) lives in `base.html`.
*   **Modular Routing**: Each app manages its own URLs, keeping the project organized even as it grows.
*   **Server as Source of Truth**: The logic happens in Python, and the final HTML is deterministic and server-rendered.


## 2. End-to-End Testing with Playwright

Playwright is used to test features that require a real browser environment (like Alpine.js interactions, Command Palette shortcuts, and HTMX swaps).

### Installation & Setup

1.  **Add Dependencies**:
    ```bash
    uv add --dev pytest-playwright pytest-django
    ```
2.  **Install Browsers**:
    ```bash
    uv run playwright install chromium
    ```

### Directory Structure

Tests are organized in a dedicated directory to keep the root clean:
- `tests/conftest.py`: Global configuration and browser fixtures.
- `tests/e2e/`: Actual test files (e.g., `test_sanity.py`, `test_search.py`).

### Running Tests

To run all End-to-End tests:
```bash
uv run pytest tests/e2e/
```

### Why Playwright?
Unlike Standard Django `TestCase` (which only tests Python logic), Playwright:
*   **Verifies JavaScript**: Validates that Alpine.js models open and close.
*   **Tests HTMX Swaps**: Ensures that partial HTML fragments are correctly swapped into the DOM.
*   **Simulates User Experience**: Tests keyboard shortcuts (like `Cmd+K`) and mobile responsiveness.

## 3. Django Template Search Path

> Related: Story 1.3

Understanding where Django looks for templates is the key to preventing `TemplateNotFound` errors.

### The Search Algorithm

When you call `render(request, 'path/to/template.html')`, Django searches in this order:

1.  **Project DIRS**: Any directories listed in `TEMPLATES['DIRS']` in `settings.py` (usually the root `templates/` folder).
2.  **App Templates**: If not found in the root, Django checks each app folder listed in `INSTALLED_APPS` for a `templates/` subdirectory (e.g., `apps/blog/templates/`).

### Organization Best Practices

*   **Full Pages**: Keep main view templates in the app-specific folder (e.g., `templates/blog/post_detail.html`).
*   **Partials**: Store re-usable snippets in a dedicated `partials/` folder.
*   **Referencing**: If a file is in a subfolder, you **must** include that subfolder in the string: `render(request, 'partials/blog/my_snippet.html')`.