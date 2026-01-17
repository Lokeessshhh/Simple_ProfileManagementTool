from django.conf import settings
from django.core.cache import cache
from django.db.models import Count
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Profile, Project, Skill, Work
from .serializers import ProfileSerializer, ProjectSerializer, SkillSerializer, WorkSerializer


CACHE_TIMEOUT = getattr(settings, "API_CACHE_TIMEOUT", 120)


def _make_cache_key(request, prefix):
    return f"{prefix}:{request.get_full_path()}"


def _invalidate_cache():
    cache.clear()


@api_view(['GET'])
def health(request):
    return Response({"status": "ok"})


@api_view(['GET', 'POST'])
def profiles(request):
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'profiles')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        queryset = Profile.objects.prefetch_related('skills', 'projects', 'work').all()
        serializer = ProfileSerializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    serializer = ProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        _invalidate_cache()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def profile_detail(request, pk):
    profile = get_object_or_404(Profile.objects.prefetch_related('skills', 'projects', 'work'), pk=pk)
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'profile-detail')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        serializer = ProfileSerializer(profile)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    if request.method in ['PUT', 'PATCH']:
        serializer = ProfileSerializer(profile, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            _invalidate_cache()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    profile.delete()
    _invalidate_cache()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def skills(request):
    queryset = Skill.objects.select_related('profile').all()
    profile_id = request.GET.get('profile')
    if profile_id:
        queryset = queryset.filter(profile_id=profile_id)
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'skills')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        serializer = SkillSerializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        _invalidate_cache()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def skill_detail(request, pk):
    skill = get_object_or_404(Skill, pk=pk)
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'skill-detail')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        serializer = SkillSerializer(skill)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    if request.method in ['PUT', 'PATCH']:
        serializer = SkillSerializer(skill, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            _invalidate_cache()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    skill.delete()
    _invalidate_cache()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def projects(request):
    queryset = Project.objects.select_related('profile').all()
    skill_name = request.GET.get('skill')
    if skill_name:
        queryset = queryset.filter(profile__skills__name__icontains=skill_name).distinct()
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'projects')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        serializer = ProjectSerializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    serializer = ProjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        _invalidate_cache()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def project_detail(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'project-detail')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        serializer = ProjectSerializer(project)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    if request.method in ['PUT', 'PATCH']:
        serializer = ProjectSerializer(project, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            _invalidate_cache()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    project.delete()
    _invalidate_cache()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def work(request):
    queryset = Work.objects.select_related('profile').all()
    profile_id = request.GET.get('profile')
    if profile_id:
        queryset = queryset.filter(profile_id=profile_id)
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'work')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        serializer = WorkSerializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    serializer = WorkSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        _invalidate_cache()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def work_detail(request, pk):
    work_item = get_object_or_404(Work, pk=pk)
    if request.method == 'GET':
        cache_key = _make_cache_key(request, 'work-detail')
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        serializer = WorkSerializer(work_item)
        cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
        return Response(serializer.data)
    if request.method in ['PUT', 'PATCH']:
        serializer = WorkSerializer(work_item, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            _invalidate_cache()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    work_item.delete()
    _invalidate_cache()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def top_skills(request):
    cache_key = _make_cache_key(request, 'top-skills')
    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)
    skills = Skill.objects.values('name').annotate(count=Count('id')).order_by('-count')
    data = list(skills)
    cache.set(cache_key, data, CACHE_TIMEOUT)
    return Response(data)


@api_view(['GET'])
def search(request):
    query = request.GET.get('q') or request.GET.get('query')
    if not query:
        return Response([])
    cache_key = _make_cache_key(request, 'search')
    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)
    projects = Project.objects.filter(title__icontains=query)
    serializer = ProjectSerializer(projects, many=True)
    cache.set(cache_key, serializer.data, CACHE_TIMEOUT)
    return Response(serializer.data)