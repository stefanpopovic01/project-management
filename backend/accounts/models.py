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

    # Defines relationship with itself. 'self' - User model is related to it self.
    # without throught Django creates hidden table and with it we say to Django use Follow table for connection
    # symetrical=False, by default it's symetrical=True, which means that if A is related to B, automatically B is related to A
    # Without related_name Django would give me something unpractical like: user.user_set.all() and now we've got something like alice.following.all()
    # and reverse bob.followers.all()

    REQUIRED_FIELDS = ['email'] 
    #This is for creating superuser in terminal, beside default username and password, Django will ask for email as well

    def save(self, *args, **kwargs):
      if self.first_name and self.last_name:
          self.initials = f"{self.first_name[0]}{self.last_name[0]}".upper()
      elif not self.initials:
          self.initials = self.username[:2].upper()
                
      super().save(*args, **kwargs)

    # Whenever new user is created or something saved in DB this function will be called

    def __str__(self):
        return self.email

    # Without this user object would look like <User: User object (1)> and now it looks like user email - more helpfull

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following_relationships', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='follower_relationships', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    # models.CASCADE if User gets deleted them inside other person following and followers get deleted as well

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_followers')
        ]

    # Meta is an inner class that configures how model behaves at db level. 
    # We put ordering, table name, constraints here..
    # The combination of followers and following must be unique, we cannot have double follows in db
    # name= is just a name of constraint in the db


    def __str__(self):
        return f"{self.follower} follows {self.following}"