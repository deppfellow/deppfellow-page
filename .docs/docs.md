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

## 3. Django Request/Response Lifecycle (The "Plumbing")

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
```