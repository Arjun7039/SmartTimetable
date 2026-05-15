from django.shortcuts import render, redirect
from django.http import HttpResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Branch, Subject
from .serializers import BranchSerializer, SubjectSerializer
from .timetable_generator import generate_timetable_logic
import io
import json
import xlsxwriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

@api_view(['POST'])
def api_download_pdf(request):
    data = request.data
    branch = data.get('branch', 'Timetable')
    semester = data.get('semester', '')
    time_slots = data.get('time_slots', [])
    timetable = data.get('timetable', [])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    elements = []

    # Add Title
    from reportlab.lib.styles import getSampleStyleSheet
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    from reportlab.platypus import Paragraph, Spacer
    elements.append(Paragraph(f"Timetable for {branch} - {semester}", title_style))
    elements.append(Spacer(1, 20))

    # Prepare table data
    headers = ["Day"] + time_slots
    table_data = [headers]
    
    for day_row in timetable:
        row = [day_row['day']]
        for slot in time_slots:
            content = day_row['slots'].get(slot, '—')
            row.append(content)
        table_data.append(row)

    # Create table
    t = Table(table_data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(t)
    doc.build(elements)
    
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')

# --- API VIEWS FOR REACT FRONTEND ---

@api_view(['GET'])
def api_get_branches(request):
    try:
        branches = Branch.objects.only('branch_name')
        branch_names = sorted(list(set(b.branch_name for b in branches)))
        return Response(branch_names)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
def api_delete_branch(request, branch_name):
    Branch.objects(branch_name__iexact=branch_name).delete()
    return Response({"status": "deleted"})

@api_view(['GET'])
def api_get_subjects(request):
    branch_name = (request.query_params.get('branch') or '').strip()
    semester = (request.query_params.get('semester') or '').strip()
    
    all_branch_entries = Branch.objects(branch_name__iexact=branch_name)
    
    target_branch = None
    max_subjects = -1
    
    for b in all_branch_entries:
        if b.semester is None: continue
        
        db_sem = str(b.semester).strip()
        req_sem = str(semester).strip()
        db_sem_clean = db_sem.lower().replace("st", "").replace("nd", "").replace("rd", "").replace("th", "").replace("semester", "").strip()
        req_sem_clean = req_sem.lower().replace("st", "").replace("nd", "").replace("rd", "").replace("th", "").replace("semester", "").strip()
        
        if db_sem.lower() == req_sem.lower() or db_sem_clean == req_sem_clean:
            if len(b.subjects) > max_subjects:
                target_branch = b
                max_subjects = len(b.subjects)
            
    if target_branch:
        subjects = [
            {'subject': s.subject, 'teacher': s.teacher, 'hours': s.hours, 'type': s.type}
            for s in target_branch.subjects
        ]
        return Response(subjects)
    
    return Response([])

@api_view(['POST'])
def api_generate_timetable(request):
    branch_name = (request.data.get('branch') or '').strip()
    semester = (request.data.get('semester') or '').strip()
    subjects_data = request.data.get('subjects')

    if not subjects_data:
        return Response({"error": "No subjects provided"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate each subject has the required data
    validated_subjects = []
    for s in subjects_data:
        name = (s.get('subject') or '').strip()
        teacher = (s.get('teacher') or '').strip()
        hours = s.get('hours')
        type_ = s.get('type')
        
        if not name or not teacher or hours is None:
            return Response({"error": f"Incomplete data for subject '{name or 'Unknown'}'. All fields are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        validated_subjects.append({
            'subject': name,
            'teacher': teacher,
            'hours': int(hours),
            'type': type_ or 'theory'
        })

    try:
        # Save to MongoDB
        subject_docs = [
            Subject(subject=s['subject'], teacher=s['teacher'], hours=s['hours'], type=s['type'])
            for s in validated_subjects
        ]
        
        if not branch_name or not semester:
            return Response({"error": "Branch name and semester are required"}, status=status.HTTP_400_BAD_REQUEST)

        Branch.objects(branch_name=branch_name, semester=semester).modify(
            upsert=True, 
            new=True, 
            set__subjects=subject_docs
        )

        # Generate timetable
        headers, table = generate_timetable_logic(validated_subjects)

        # Prepare JSON-friendly timetable
        time_slots = ["8-9", "9-10", "10-11", "11-12", "12-1", "1:30-2", "2-3", "3-4", "4-5"]
        
        formatted_timetable = []
        for row in table:
            day_data = {
                "day": row[0],
                "slots": {}
            }
            for i, cell in enumerate(row[1:]):
                if i < len(time_slots):
                    day_data["slots"][time_slots[i]] = cell
            formatted_timetable.append(day_data)

        return Response({
            "branch": branch_name,
            "semester": semester,
            "time_slots": time_slots,
            "timetable": formatted_timetable
        })
    except Exception as e:
        return Response({"error": f"Backend processing error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- EXISTING TEMPLATE VIEWS ---

def home(request):
    return render(request, 'index.html')

def timetable_input(request):
    branches = Branch.objects.only('branch_name')
    if request.method == 'POST':
        branch_name = request.POST.get('branch')
        request.session['branch'] = branch_name
        return redirect('select_semester')
    return render(request, 'branch_input.html', {'branches': branches})

def select_semester(request):
    if request.method == 'POST':
        semester = request.POST.get('semester')
        request.session['semester'] = semester
        return redirect('subject_count')
    return render(request, 'select_semester.html')

def subject_count(request):
    if request.method == 'POST':
        subject_count = int(request.POST.get('subject_count', 0))
        lab_count = int(request.POST.get('lab_count', 0))
        request.session['subject_count'] = subject_count
        request.session['lab_count'] = lab_count
        return redirect('subject_input')
    return render(request, 'subject_count.html')

def subject_input(request):
    subject_count = request.session.get('subject_count', 0)
    lab_count = request.session.get('lab_count', 0)

    if request.method == 'POST':
        subjects = []
        for i in range(subject_count):
            name = request.POST.get(f'subject_{i}')
            teacher = request.POST.get(f'subject_teacher_{i}')
            hours = int(request.POST.get(f'subject_hours_{i}'))
            subjects.append({'subject': name, 'teacher': teacher, 'hours': hours, 'type': 'theory'})

        for i in range(lab_count):
            name = request.POST.get(f'lab_{i}')
            teacher = request.POST.get(f'lab_teacher_{i}')
            hours = int(request.POST.get(f'lab_hours_{i}'))
            subjects.append({'subject': name, 'teacher': teacher, 'hours': hours, 'type': 'lab'})

        request.session['subjects'] = subjects
        branch_name = request.session.get('branch')
        subject_docs = [
            Subject(subject=s['subject'], teacher=s['teacher'], hours=s['hours'], type=s['type'])
            for s in subjects
        ]
        Branch.objects(branch_name=branch_name).modify(upsert=True, new=True, set__subjects=subject_docs)
        return redirect('generate_timetable')

    context = {
        'subject_count': subject_count,
        'lab_count': lab_count,
        'subject_range': range(subject_count),
        'lab_range': range(lab_count),
    }
    return render(request, 'subject_input.html', context)

def generate_timetable(request):
    subjects = request.session.get('subjects')
    branch = request.session.get('branch', '')
    semester = request.session.get('semester', '')

    if not subjects:
        return HttpResponse("Invalid Request: No subject data found.")

    headers, table = generate_timetable_logic(subjects)
    time_slots = ["8-9", "9-10", "10-11", "11-12", "12-1", "1:30-2", "2-3", "3-4", "4-5"]

    days = []
    timetable = {}

    for row in table:
        day = row[0]
        days.append(day)
        timetable[day] = {}
        for slot in time_slots:
            timetable[day][slot] = "—"
        for i, cell in enumerate(row[1:]):
            if i < len(time_slots):
                slot = time_slots[i]
                timetable[day][slot] = cell

    context = {
        'branch': branch,
        'semester': semester,
        'days': days,
        'time_slots': time_slots,
        'timetable': timetable
    }
    return render(request, 'display_timetable.html', context)

def download_pdf(request):
    subjects = request.session.get('subjects')
    headers, table = generate_timetable_logic(subjects)

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)
    y = 800
    p.setFont("Helvetica-Bold", 14)
    p.drawString(100, y, "Smart Timetable")
    y -= 30

    p.setFont("Helvetica", 10)
    p.drawString(50, y, ' | '.join(headers))
    y -= 20

    for row in table:
        p.drawString(50, y, ' | '.join(cell.replace('\n', ' ') for cell in row))
        y -= 20
        if y < 40:
            p.showPage()
            y = 800

    p.showPage()
    p.save()
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename="timetable.pdf")

@csrf_exempt
def export_excel(request):
    subjects = request.session.get('subjects')
    headers, table = generate_timetable_logic(subjects)

    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet("Timetable")
    header_format = workbook.add_format({'bold': True, 'bg_color': '#0072ff', 'color': 'white'})

    for col_num, header in enumerate(headers):
        worksheet.write(0, col_num, header, header_format)

    for row_num, row_data in enumerate(table, start=1):
        for col_num, cell_data in enumerate(row_data):
            worksheet.write(row_num, col_num, cell_data.replace('\n', ' '))

    workbook.close()
    output.seek(0)
    return FileResponse(output, as_attachment=True, filename='timetable.xlsx')

def edit_subjects(request):
    branch_name = request.session.get('branch')
    if not branch_name:
        return redirect('timetable_input')

    branch = Branch.objects(branch_name=branch_name).first()
    subjects = branch.subjects if branch else []

    if request.method == 'POST':
        updated_subjects = []
        count = int(request.POST.get('subject_count', 0))

        for i in range(count):
            name = request.POST.get(f'subject_{i}')
            teacher = request.POST.get(f'teacher_{i}')
            hours = int(request.POST.get(f'hours_{i}'))
            updated_subjects.append(Subject(subject=name, teacher=teacher, hours=hours, type='theory'))

        Branch.objects(branch_name=branch_name).update_one(set__subjects=updated_subjects)
        request.session['subjects'] = [{'subject': s.subject, 'teacher': s.teacher, 'hours': s.hours, 'type': s.type} for s in updated_subjects]
        messages.success(request, "Subjects updated successfully!")
        return redirect('generate_timetable')

    return render(request, 'edit_subjects.html', {'subjects': subjects})

def create_branch(request):
    if request.method == 'POST':
        branch_name = request.POST.get('branch_name').strip()
        if Branch.objects(branch_name=branch_name).first():
            messages.error(request, f"Branch '{branch_name}' already exists!")
        else:
            Branch(branch_name=branch_name, subjects=[]).save()
            messages.success(request, f"Branch '{branch_name}' created successfully!")
            return redirect('timetable_input')

    return render(request, 'create_branch.html')