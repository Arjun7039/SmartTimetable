# smarttimetable/forms.py
from django import forms

class SubjectForm(forms.Form):
    subject = forms.CharField(label='Subject Name', max_length=100)
    teacher = forms.CharField(label='Teacher Name', max_length=100)
    hours = forms.IntegerField(label='Max Hours Per Week', min_value=1)

class BranchSubjectsForm(forms.Form):
    branch = forms.CharField(label='Branch', max_length=50)
    semester = forms.CharField(label='Semester', max_length=20)  # New field added
    subjects = forms.Field(widget=forms.HiddenInput())  # We'll handle subjects dynamically in views/templates