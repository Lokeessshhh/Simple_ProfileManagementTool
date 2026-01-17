from rest_framework import serializers
from .models import Profile, Project, Skill, Work

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'profile', 'name']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'profile', 'title', 'description', 'links']

class WorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Work
        fields = ['id', 'profile', 'company', 'role', 'start_date', 'end_date', 'description']

class ProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    work = WorkSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'name', 'email', 'education', 'github', 'linkedin', 'portfolio', 'skills', 'projects', 'work']
