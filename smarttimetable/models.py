from django.db import models
from mongoengine import Document, StringField, IntField, ListField, EmbeddedDocument, EmbeddedDocumentField

# Embedded subject document
class Subject(EmbeddedDocument):
    subject = StringField(required=True)
    teacher = StringField(required=True)
    hours = IntField(required=True)
    type = StringField(required=True, choices=['theory', 'lab'])  # Added this field

# Main branch document with semester support
class Branch(Document):
    branch_name = StringField(required=True)
    semester = StringField(required=True)
    subjects = ListField(EmbeddedDocumentField(Subject))

    meta = {
        'collection': 'branch',
        'indexes': [
            {'fields': ['branch_name', 'semester'], 'unique': True}
        ]
    }
