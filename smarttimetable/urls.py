from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('timetable_input/', views.timetable_input, name='timetable_input'),
    path('select-semester/', views.select_semester, name='select_semester'),
    path('subject-count/', views.subject_count, name='subject_count'),         # Count input
    path('subject-input/', views.subject_input, name='subject_input'),         # Details input
    path('generate/', views.generate_timetable, name='generate_timetable'),
    path('download-pdf/', views.download_pdf, name='download_pdf'),
    path('export-excel/', views.export_excel, name='export_excel'),
    path('edit-subjects/', views.edit_subjects, name='edit_subjects'),
    path('create-branch/', views.create_branch, name='create_branch'),

    # API Endpoints
    path('api/branches/', views.api_get_branches, name='api_get_branches'),
    path('api/branches/<str:branch_name>/', views.api_delete_branch, name='api_delete_branch'),
    path('api/subjects/', views.api_get_subjects, name='api_get_subjects'),
    path('api/generate/', views.api_generate_timetable, name='api_generate_timetable'),
    path('api/download-pdf/', views.api_download_pdf, name='api_download_pdf'),
]
