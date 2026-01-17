from django.db import models

class Profile(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(db_index=True)
    education = models.CharField(max_length=100)
    
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)

    def __str__(self):
        return self.name

class Skill(models.Model):
    profile = models.ForeignKey(Profile, related_name='skills', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, db_index=True)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=['profile', 'name'], name='idx_skill_profile_name'),
        ]

class Project(models.Model):
    profile = models.ForeignKey(Profile, related_name="projects", on_delete=models.CASCADE)
    title = models.CharField(max_length=100, db_index=True)
    description = models.TextField()
    links = models.URLField(blank=True)

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            models.Index(fields=['profile', 'title'], name='idx_project_profile_title'),
        ]

class Work(models.Model):
    profile = models.ForeignKey(Profile, related_name="work", on_delete=models.CASCADE)
    company = models.CharField(max_length=100, db_index=True)
    role = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.role} at {self.company}"

    class Meta:
        indexes = [
            models.Index(fields=['profile', 'start_date'], name='idx_work_profile_start'),
        ]