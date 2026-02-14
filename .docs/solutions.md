## 1. 404 Not Found GET /static/\*

Django doesn't know where to look for "global" static files that aren't inside an app's folder. Since the `static/` file have its own directory, we should explicitly tell Django to include root folder in its search path.

1. Update `config/settings.py`

```python
# config/settings.py

STATIC_URL = 'static/'

# This is the missing piece:
# It tells Django to look for static files in your root 'static' folder
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
```

2. Verify File Locations

Ensure the files are placed exactly where `base.html` (or any root template you've defined) expects. Which in this case, `kura/static/css/*.css` and `kura/static/vendor/*.min.js`.

3. Check `base.html` Logic

Ensure you're using `{% static %}` template correctly so Django generates the right URLs.

```html
{% load static %}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Page - Personal site and Blog" />
    <title>{% block title %}Deppfellow Page{% endblock %}</title>

    <!-- CSS -->
    <link rel="stylesheet" href="{% static 'css/variables.css' %}" />
    <link rel="stylesheet" href="{% static 'css/base.css' %}" />

    <!-- HTMX -->
    <script src="{% static 'vendor/htmx.min.js' %}" defer></script>

    <!-- AlpineJS -->
    <script src="{% static 'vendor/alpine.min.js' %}" defer></script>
  </head>
  <body>
    ...
  </body>
</html>
```

### The 'Why'

By default, Django only look static file inside `static/` folder within each registered app. Since your architecture places global assets (vendor libs and design tokens) in a shared root directory, STATICFILES_DIRS is mandatory to bridge that gap.

## 2. 500 AttributeError: 'WSGIRequest' object has no attribute 'htmx'

`AttributeError: 'WSGIRequest' object has no attribute 'htmx'` occurs because the HTMX Middleware is missing from your configuration. Even though `django_htmx` is in your `INSTALLED_APPS`, the middleware is what actually attaches the `.htmx` property to the `request` object.

1) Fix the Middleware

Add `'django_htmx.middleware.HtmxMiddleware'` to `MIDDLEWARE` list in `config/settings.py`.
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_htmx.middleware.HtmxMiddleware', # Add this line here!
]
```

## 3. Error loading shared libraries: libasound.so.2 (Playwright)

When running Playwright tests or using the browser tools, you might encounter an error like `BrowserType.launch: error while loading shared libraries: libasound.so.2: cannot open shared object file: No such file or directory`.

This happens because the underlying Chromium browser requires specific system-level libraries (like sound or graphics drivers) that are not pre-installed on some Linux distributions or WSL.

### Solution

Run the following command to automatically install all missing system dependencies required by Playwright:

```bash
uv run playwright install-deps
```

> [!NOTE]
> This command requires `sudo` privileges as it installs packages via the system package manager (e.g., `apt-get`).

## 4. 404 TemplateDoesNotExist at /blog/<slug>/

> Related: Story 1.3

This happens when the template path provided to `render()` doesn't exactly match the file's location inside a `templates/` directory.

### The Fix

1.  **Verify Location**: Ensure the file exists (e.g., `templates/blog/post_detail.html`).
2.  **Check the Path String**: In your view, make sure the string exactly matches the relative path from the `templates/` root. 
    *   *Incorrect*: `render(request, 'post_detail.html')`
    *   *Correct*: `render(request, 'blog/post_detail.html')`

## 5. M2M Tags "Disappearing" in Django Admin

> Related: Story 1.3

When using the default multi-select widget for Many-to-Many fields (like `tags`), any save operation that doesn't include the previous tags (via `Ctrl+Click`) will overwrite them, causing them to "disappear" from the database.

### The "Senior" Solution

Instead of relying on user behavior, update the UI to be "fail-safe" by using `filter_horizontal` in your `ModelAdmin`.

1.  **Update `admin.py`**:
    ```python
    @admin.register(Post)
    class PostAdmin(admin.ModelAdmin):
        filter_horizontal = ('tags',)
    ```

This changes the widget into a two-column interface where selected items stay visible in the "Chosen" column, preventing accidental deletions.

## 6. [2026-02-12] TemplateSyntaxError with Model Methods

> Related: Story 1.4

### Bug
When attempting to call `project.get_absolute_url` in a template, a `TemplateSyntaxError` was thrown: "Invalid block tag on line 20: 'project.get_absolute_url', expected 'empty' or 'endfor'."

### Solution
In Django templates, model methods and variables must be wrapped in double curly braces `{{ }}` for rendering. The error occurred because it was wrapped in logic tags `{% %}` which Django interpreted as a non-existent template tag.

**Incorrect:**
`{% project.get_absolute_url %}`

**Correct:**
`{{ project.get_absolute_url }}`

## 7. [2026-02-14] Card Layout: Excessive Empty Space at Bottom

> Related: Story 1.4 (Pinned Projects Grid)

### Bug
Card elements in the grid had inconsistent heights and large gaps of white space at the bottom, especially when an image was absent or content was short. This was caused by a fixed `min-height: 30dvh` in the `project-card` class.

### Solution
1. **Remove Fixed Height**: Delete `min-height` or fixed `height` properties from the card container to let content define the intrinsic height.
2. **Use Flexbox for Content**: Set the card to `display: flex; flex-direction: column;`.
3. **Sticky Footers**: Set `flex: 1` on the main content area and `margin-top: auto` on the bottom element (like "Know more") to ensure it always sticks to the bottom-left of the card regardless of text length.