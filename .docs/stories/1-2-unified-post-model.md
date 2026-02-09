# Story 1.2: Unified Post Model & Blog Index - Implementation Tasks

**Goal**: Create the content structure (Models) and the Blog Index with infinite scroll.
**Status**: In Progress

## 1. Define Models
**File**: `apps/blog/models.py`

Implement the `Tag` and `Post` models.

```python
from django.db import models
from django.utils import timezone
from django.urls import reverse

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField(help_text="Markdown content")
    tags = models.ManyToManyField(Tag, blank=True)
    
    # Meta fields
    published_at = models.DateTimeField(null=True, blank=True)
    edited_at = models.DateTimeField(auto_now=True)
    
    # Status fields
    is_published = models.BooleanField(default=False)
    is_project = models.BooleanField(default=False, help_text="Is this a portfolio project?")
    is_pinned = models.BooleanField(default=False, help_text="Pin to home page?")
    
    # Project specific
    image = models.ImageField(upload_to='projects/', blank=True, null=True)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        # We will implement the detail view in Story 1.3
        return reverse('post_detail', kwargs={'slug': self.slug})
```

## 2. Create Migrations
Run the following commands in your terminal:

```bash
python manage.py makemigrations
python manage.py migrate
```

## 3. Register in Admin
**File**: `apps/blog/admin.py`

```python
from django.contrib import admin
from .models import Post, Tag

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'is_project', 'published_at')
    list_filter = ('is_published', 'is_project', 'tags')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'content')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
```

## 4. Implement Blog Index View
**File**: `apps/blog/views.py`

Use standard Django Pagination and `django-htmx`.

```python
from django.shortcuts import render
from django.core.paginator import Paginator
from .models import Post

def post_list(request):
    # Get only published blog posts (not projects)
    posts = Post.objects.filter(is_published=True, is_project=False)
    
    paginator = Paginator(posts, 10) # 10 posts per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    if request.htmx:
        template = 'partials/blog/_post_list.html'
    else:
        template = 'blog/index.html'
        
    return render(request, template, {'page_obj': page_obj})
```

## 5. Configure URLs
**File**: `apps/blog/urls.py` (Create this file)

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list, name='post_list'),
]
```

**File**: `config/urls.py`
Include `apps.blog.urls`.

```python
from django.urls import path, include
# ...
urlpatterns = [
    # ...
    path('blog/', include('apps.blog.urls')),
]
```

## 6. Create Templates
**File**: `templates/blog/index.html`

```html
{% extends "base.html" %}

{% block title %}Blog - Deppfellow Page{% endblock %}

{% block content %}
<section>
    <h1>Blog</h1>
    <div id="post-list">
        {% include "partials/blog/_post_list.html" %}
    </div>
</section>
{% endblock %}
```

**File**: `templates/partials/blog/_post_list.html`

```html
{% for post in page_obj %}
<article class="post-preview">
    <h2><a href="#">{{ post.title }}</a></h2>
    <small>{{ post.published_at|date:"F j, Y" }}</small>
    <p>{{ post.content|truncatewords:30 }}</p>
</article>
{% endfor %}

<!-- Infinite Scroll Trigger -->
{% if page_obj.has_next %}
<div hx-get="?page={{ page_obj.next_page_number }}"
     hx-trigger="revealed"
     hx-target="this"
     hx-swap="outerHTML">
     Loading more generic thoughts...
</div>
{% endif %}
```

## 7. Verification
1.  Access Admin (`/admin/`) and create some dummy posts.
2.  Go to `/blog/`.
3.  Verify list appears.
4.  (Optional) Create >10 posts to test infinite scroll.
