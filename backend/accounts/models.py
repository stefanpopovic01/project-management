from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db import models

class User(AbstractUser):

    email = models.EmailField(unique=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    initials = models.CharField(max_length=2, blank=True, null=True)

    image = models.ImageField(upload_to='avatars/', blank=True, null=True)
    skills = ArrayField(
        models.CharField(max_length=100, blank=True),
        size=10,
        null=True,
        blank=True
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    following = models.ManyToManyField('self', through='Follow', symmetrical=False, related_name='followers')

    REQUIRED_FIELDS = ['email'] 

    def save(self, *args, **kwargs):
      if self.first_name and self.last_name:
          self.initials = f"{self.first_name[0]}{self.last_name[0]}".upper()
      elif not self.initials:
          self.initials = self.username[:2].upper()
                
      super().save(*args, **kwargs)

    def __str__(self):
        return self.email

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following_relationships', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='follower_relationships', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_followers')
        ]

    def __str__(self):
        return f"{self.follower} follows {self.following}"