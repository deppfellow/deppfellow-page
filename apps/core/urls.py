from django.urls import path

from . import views
from apps.blog import views as blog_views

urlpatterns = [
    path('', views.home, name="home"),
    path('projects/', blog_views.project_index, name='project_index'),
]