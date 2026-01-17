from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health),
    path('profiles/', views.profiles),
    path('profiles/<int:pk>/', views.profile_detail),
    path('skills/', views.skills),
    path('skills/<int:pk>/', views.skill_detail),
    path('projects/', views.projects),
    path('projects/<int:pk>/', views.project_detail),
    path('work/', views.work),
    path('work/<int:pk>/', views.work_detail),
    path('skills/top/', views.top_skills),
    path('search/', views.search),
]