from django.apps import AppConfig
from mongoengine import connect, disconnect, connection

class SmarttimetableConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'smarttimetable'

    def ready(self):
        # Improved connection logic for Django autoreload
        try:
            from mongoengine import connection
            if 'default' not in connection._connections:
                connect(
                    host='mongodb://localhost:27017/smarttimetable_db',
                    alias='default'
                )
                print("✅ Successfully connected to smarttimetable_db")
            else:
                print("ℹ️ MongoDB already connected")
        except Exception as e:
            print(f"❌ MongoDB Connection Error: {e}")