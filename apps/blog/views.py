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