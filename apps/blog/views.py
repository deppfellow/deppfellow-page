import markdown

from django.shortcuts import get_object_or_404
from django.shortcuts import render
from django.core.paginator import Paginator
from .models import Post

# Create your views here.
def post_list(request):
    posts = Post.objects.filter(is_published=True, is_project=False)

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    if request.htmx:
        template = 'partials/blog/_post_list.html'
    else:
        template = 'blog/index.html'

    return render(request, template, {'page_obj': page_obj})

def post_detail(request, slug):
    # post = get_object_or_404(Post, slug=slug, is_published=True)
    post = get_object_or_404(Post.objects.prefetch_related('tags'), slug=slug, is_published=True)

    html_content = markdown.markdown(
        post.content,
        extensions=['fenced_code', 'codehilite', 'tables']
    )

    return render(request, 'blog/post_detail.html', {
        'post': post,
        'html_content': html_content
    })

def project_index(request):
    projects = Post.objects.filter(
        is_project=True,
        is_published=True,
    ).order_by('-published_at')

    return render(request, 'blog/project_index.html', {
        'projects': projects,
    })