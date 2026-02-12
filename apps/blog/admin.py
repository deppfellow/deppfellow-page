from django.contrib import admin
from .models import Tag, Post

# Register your models here.
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'is_project', 'published_at')
    list_filter = ('is_published', 'is_project', 'tags')
    filter_horizontal = ('tags',)  # Added this for better M2M management
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'content')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}