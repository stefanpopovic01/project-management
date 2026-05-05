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

    REQUIRED_FIELDS = ['email'] 

    def save(self, *args, **kwargs):
      if self.first_name and self.last_name:
          self.initials = f"{self.first_name[0]}{self.last_name[0]}".upper()
      elif not self.initials:
          self.initials = self.username[:2].upper()
                
      super().save(*args, **kwargs)

    def __str__(self):
        return self.email
    

"""
REF: AbstractUser vs. models.Model

1. WHAT IS AbstractUser?
   - It is a "ready-to-use" template provided by Django's auth system.
   - It includes all the fields a standard user needs (username, password, email, 
     first_name, last_name, is_staff, is_active, date_joined).
   - It allows you to add your custom fields (like 'position' or 'company') 
     without rebuilding the authentication logic from scratch.

2. DIFFERENCE FROM models.Model:
   - models.Model: A "blank slate." You have to define every single column 
     manually. If you used this for a User, you would also have to manually 
     write the logic for password hashing, login sessions, and permissions.
   - AbstractUser: A "pre-configured" model. It inherits from Django's 
     internal 'AbstractBaseUser' and 'PermissionsMixin', giving you access 
     to built-in security features and the Django Admin login out-of-the-box.

3. WHY USE IT?
   - Security: You don't want to handle raw passwords. AbstractUser uses 
     PBKDF2 hashing by default.
   - Integration: Django's built-in apps (Admin, Password Reset, Auth 
     Middleware) expect a user that follows this specific structure.
"""