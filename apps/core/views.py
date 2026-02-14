from django.shortcuts import render
from apps.blog.models import Post

# Create your views here.
def home(request):
    pinned_projects = Post.objects.filter(
        is_project=True,
        is_pinned=True,
        is_published=True,
    ).order_by('-published_at')

    return render(request, 'core/home.html', {
        'pinned_projects': pinned_projects
    })