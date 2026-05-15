from django.apps import AppConfig
import os
from mongoengine import connect

class SmarttimetableConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'smarttimetable'

    def ready(self):
        # Use environment variable for MongoDB connection
        mongodb_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/smarttimetable_db')
        
        try:
            from mongoengine import connection
            if 'default' not in connection._connections:
                connect(
                    host=mongodb_uri,
                    alias='default'
                )
                print(f"✅ Successfully connected to MongoDB")
            else:
                print("ℹ️ MongoDB already connected")
        except Exception as e:
            print(f"❌ MongoDB Connection Error: {e}")