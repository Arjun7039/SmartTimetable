import os
import django
from mongoengine import connect

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartapp.settings')
django.setup()

from smarttimetable.models import Branch

# Connect to MongoDB (same as in apps.py)
connect(
    db='timetabledb',
    host='mongodb://localhost:27017/smarttimetable_db',
    alias='default'
)

print("--- ALL BRANCHES IN DATABASE ---")
for b in Branch.objects:
    print(f"Branch: '{b.branch_name}', Semester: '{b.semester}', Subjects Count: {len(b.subjects)}")
    for s in b.subjects:
        print(f"  - {s.subject} ({s.teacher})")
print("--------------------------------")
