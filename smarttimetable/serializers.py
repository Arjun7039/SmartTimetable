from rest_framework import serializers
from .models import Branch, Subject

class SubjectSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=100)
    teacher = serializers.CharField(max_length=100)
    hours = serializers.IntegerField()
    type = serializers.ChoiceField(choices=['theory', 'lab'])

class BranchSerializer(serializers.Serializer):
    branch_name = serializers.CharField(max_length=100)
    semester = serializers.CharField(max_length=100)
    subjects = SubjectSerializer(many=True)

    def create(self, validated_data):
        # We handle upsert manually in the view for MongoEngine
        return validated_data
