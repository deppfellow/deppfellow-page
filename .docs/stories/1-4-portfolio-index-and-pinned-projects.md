# Story 1.4: Portfolio Index & Pinned Projects - Implementation Tasks

**Goal**: Implement a dedicated Portfolio Index and display Pinned Projects on the Home page.
**Status**: Done

## 1. Update Home View
**File**: `apps/core/views.py`

Fetch pinned projects to display on the landing page.

```python
from apps.blog.models import Post

def home(request):
    pinned_projects = Post.objects.filter(
        is_project=True,
        is_pinned=True,
        is_published=True,
    ).order_by('-published_at')

    return render(request, 'core/home.html', {
        'pinned_projects': pinned_projects
    })
```

## 2. Update Home Template
**File**: `templates/core/home.html`

Add the pinned projects section with grid-based cards.

```html
<section class="pinned-project-section">
    <h2 class="section-title">Projects</h2>
    <div class="project-grid">
        {% for project in pinned_projects %}
        <div class="project-card">
            {% if project.image %}
            <div class="project-image-container">
                <img src="{{ project.image.url }}" alt="{{ project.title }}" class="project-image">
            </div>
            {% endif %}

            <div class="project-content">
                <h3>{{ project.title }}</h3>
                {% if project.tags.all %}
                <div class="project-tags">
                    {% for tag in project.tags.all %}
                    <span class="tag">#{{ tag.name }}</span>
                    {% endfor %}
                </div>
                {% endif %}

                <small>{{ project.content|truncatewords:20 }}</small>
                <div class="project-know-more">
                    <a href="{{ project.get_absolute_url }}">Know more ➞</a>
                </div>
            </div>
        </div>
        {% endfor %}
    </div>
</section>
```

## 3. Create Project Index View
**File**: `apps/blog/views.py`

```python
def project_index(request):
    projects = Post.objects.filter(
        is_project=True,
        is_published=True,
    ).order_by('-published_at')

    return render(request, 'blog/project_index.html', {
        'projects': projects,
    })
```

## 4. Setup URLs
**File**: `apps/core/urls.py`

Mount the projects index at the top-level `/projects/`.

```python
from apps.blog import views as blog_views

urlpatterns = [
    path('', views.home, name="home"),
    path('projects/', blog_views.project_index, name='project_index'),
]
```

## 5. Create Project Index Template
**File**: `templates/blog/project_index.html`

Uses a vertical list (row-based) layout for better readability and detail.

## 6. Styling
**Files**: `static/css/home.css` (Grid cards), `static/css/projects.css` (Row-based list)

## 7. Breadcrumbs Refinement
**File**: `templates/blog/post_detail.html`

Differentiates between Blog and Project roots.

```html
{% if post.is_project %}
    <a href="{% url 'project_index' %}">Projects</a>
{% else %}
    <a href="{% url 'post_list' %}">Blog</a>
{% endif %}
```
