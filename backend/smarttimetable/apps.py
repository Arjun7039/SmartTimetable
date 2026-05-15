from django.apps import AppConfig
import os

class SmarttimetableConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'smarttimetable'

    def ready(self):
        # Database connection is now handled in settings.py for better reliability during deployment
        pass