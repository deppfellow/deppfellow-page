from django.db import models
from django.utils import timezone
from django.urls import reverse

# Create your models here.
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models. SlugField(max_length=50, unique=True)

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
    is_project = models.BooleanField(default=False, help_text="True for projects, False for blog posts")
    is_pinned = models.BooleanField(default=False, help_text="Show in pinned section of homepage")

    image = models.ImageField(upload_to='projects/', blank=True, null=True)

    class Meta:
        ordering = ['-published_at']
    
    def __str__(self):
        return self.title

    def get_absolute_url(self):
        """Return canonical URL for this post."""
        return reverse('post_detail', kwargs={'slug':self.slug})
