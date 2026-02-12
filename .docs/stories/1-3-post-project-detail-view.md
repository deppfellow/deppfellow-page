# Story 1.3: Post/Project Detail View - Implementation Tasks

**Goal**: Implement the detailed full-page view for both blog posts and portfolio projects with Markdown rendering and breadcrumbs.
**Status**: Done

## 1. Update Views
**File**: `apps/blog/views.py`

Fetch the post by slug, prefetch tags for efficiency, and render Markdown server-side.

```python
import markdown
from django.shortcuts import render, get_object_or_404
from .models import Post

def post_detail(request, slug):
    # Fetch only published posts, prefetch related tags
    post = get_object_or_404(Post.objects.prefetch_related('tags'), slug=slug, is_published=True)
    
    # Render Markdown to HTML
    html_content = markdown.markdown(
        post.content,
        extensions=['fenced_code', 'codehilite', 'tables']
    )
    
    return render(request, 'blog/post_detail.html', {
        'post': post,
        'html_content': html_content
    })
```

## 2. Update URLs
**File**: `apps/blog/urls.py`

Add the slug-based detail path.

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('<slug:slug>/', views.post_detail, name='post_detail'),
]
```

## 3. Update Admin Configuration
**File**: `apps/blog/admin.py`

Enhance Many-to-Many management with `filter_horizontal`.

```python
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'is_project', 'published_at')
    list_filter = ('is_published', 'is_project', 'tags')
    filter_horizontal = ('tags',)  # Added for better M2M selection
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'content')
```

## 4. Create Detail Template
**File**: `templates/blog/post_detail.html`

Implement breadcrumbs, title, metadata (date/tags), and safely render the HTML content.

```html
{% extends "base.html" %}
{% load static %}

{% block title %}{{ post.title }} - Deppfellow{% endblock %}

{% block extra_css %}
<link rel="stylesheet" href="{% static 'css/component.css' %}">
<link rel="stylesheet" href="{% static 'css/post_detail.css' %}">
{% endblock extra_css %}

{% block content %}
<section class="container">
    {% include 'partials/_header.html' %}
    
    <article class="post-detail">
        <nav class="post-breadcrumb">
            <a href="{% url 'home' %}">Home</a>
            <span class="separator">▸</span>
            <a href="{% url 'post_list' %}">Blog</a>
            <span class="separator">▸</span>
            <span>{{ post.title|truncatechars:30 }}</span>
        </nav>

        <header class="post-header">
            <h1>{{ post.title }}</h1>
            <div class="post-meta">
                <div class="post-date">{{ post.published_at|date:"F j, Y" }}</div>
                {% if post.tags.all %}
                <div class="post-tags">
                    {% for tag in post.tags.all %}
                    <span class="post-tag">#{{ tag.name }}</span>
                    {% endfor %}
                </div>
                {% endif %}
            </div>
        </header>

        <div class="post-content">
            {{ html_content|safe }}
        </div>
    </article>
</section>
{% endblock %}
```

## 5. Update List Partial
**File**: `templates/partials/blog/_post_list.html`

Link post titles to their detail pages using the model's canonical URL.

```html
{% for post in page_obj %}
<article class="post-preview">
    <h2><a href="{{ post.get_absolute_url }}">{{ post.title }}</a></h2>
    ...
</article>
{% endfor %}
```

## 6. Create Detail CSS
**File**: `static/css/post_detail.css`

Style the breadcrumbs, metadata sidebar, and tag pills.

```css
.post-meta {
    border-left: 4px solid var(--accent);
    display: flex;
    flex-direction: column;
    padding-left: 1rem;
}

.post-tag {
    background: rgba(37, 99, 235, 0.1);
    color: var(--accent);
    border-radius: 20px;
    padding: 0.2rem 0.7rem;
}
```

## 7. Verification
1.  Navigate to `/blog/`.
2.  Click a post title to reach `/blog/<slug>/`.
3.  Verify tags appear (linked via shell or search).
4.  Verify breadcrumbs navigate correctly.
