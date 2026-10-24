import io
import os
import json
import base64
import csv
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfgen import canvas as pdf_canvas
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.admin.views.decorators import staff_member_required
from django.conf import settings
from django.utils import timezone
from .models import RSVP, GuestPhoto


def index(request):
    """
    Renders the luxury wedding invitation page for Terrence & Lina.
    Passes live statistics and wedding metadata into the template context.
    """
    all_rsvps = RSVP.objects.all().order_by('-id')
    total_responses = all_rsvps.count()
    attending_rsvps = [r for r in all_rsvps if r.is_attending]
    declined_count = total_responses - len(attending_rsvps)

    guest_photos = GuestPhoto.objects.all().order_by('-id')[:12]

    context = {
        'groom_name': 'Terrence Masimba Svosve',
        'groom_short': 'Terrence',
        'groom_phone': '0772936488',
        'bride_name': 'Lina Yeukaishe Mutsopotsi',
        'bride_short': 'Lina',
        'bride_phone': '077777777###',
        'wedding_date_display': 'Friday, 1 January 2027',
        'wedding_time_display': '9:00 AM – 6:00 PM (0900hrs – 1800hrs)',
        'rsvp_contacts': [
            {'name': 'Mr T. Mponda', 'phone': '0774544229', 'wa': '263774544229'},
            {'name': 'Mr S. Nhidza', 'phone': '0788263371', 'wa': '263788263371'},
            {'name': 'Mrs Hlatywayo', 'phone': '0772486907', 'wa': '263772486907'},
            {'name': 'Mrs Dube', 'phone': '0780908860', 'wa': '263780908860'},
        ],
        'venue_name': 'Munondo eleven',
        'venue_address': 'Munondo eleven, Hatfield, Harare, Zimbabwe',
        'dress_code': 'All shades of purple & Men to wear smart formal',
        'scripture_verse': '“I have found the one whom my soul loves”',
        'scripture_reference': 'Song of Solomon 3:4',
        'stats': {
            'total_responses': total_responses,
            'attending_count': len(attending_rsvps),
            'declined_count': declined_count,
        },
        'guest_photos': guest_photos,
    }
    return render(request, 'invitation/index.html', context)


def api_rsvps(request):
    """
    GET /api/rsvps
    Returns all RSVPs along with aggregate stats.
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    rsvps = RSVP.objects.all().order_by('-id')
    total_responses = rsvps.count()
    attending_qs = [r for r in rsvps if r.is_attending]
    declined_count = total_responses - len(attending_qs)

    data = []
    for r in rsvps:
        data.append({
            'id': r.id,
            'name': r.name,
            'phone': r.phone,
            'email': r.email or '',
            'attending': r.attending,
            'created_at': r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
        })

    return JsonResponse({
        'success': True,
        'rsvps': data,
        'stats': {
            'total_responses': total_responses,
            'attending_count': len(attending_qs),
            'declined_count': declined_count
        }
    })


@csrf_exempt
def api_rsvp(request):
    """
    POST /api/rsvp
    Creates a new RSVP record.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        if request.content_type and 'application/json' in request.content_type:
            data = json.loads(request.body.decode('utf-8'))
        else:
            data = request.POST.dict()
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Invalid request data: {str(e)}'}, status=400)

    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip()
    attending = (data.get('attending') or 'yes').strip().lower()

    if not name or not phone:
        return JsonResponse({'success': False, 'error': 'Name and phone number are required.'}, status=400)

    rsvp = RSVP.objects.create(
        name=name,
        phone=phone,
        email=email if email else None,
        attending=attending,
        guest_count=1,
        guest_names='',
        notes='',
        created_at=timezone.now()
    )

    return JsonResponse({
        'success': True,
        'message': 'RSVP recorded successfully! Thank you for celebrating with us.',
        'id': rsvp.id
    })


@csrf_exempt
def api_rsvp_detail(request, rsvp_id):
    """
    DELETE /api/rsvp/<int:rsvp_id>
    Deletes an RSVP entry.
    """
    if request.method == 'DELETE':
        try:
            rsvp = RSVP.objects.get(id=rsvp_id)
            rsvp.delete()
            return JsonResponse({'success': True, 'message': f'RSVP {rsvp_id} deleted.'})
        except RSVP.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'RSVP not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def api_export_csv(request):
    """
    GET /api/export-csv
    Exports all RSVPs as a downloadable CSV with UTF-8 BOM for Microsoft Excel compatibility.
    """
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="wedding_guest_rsvp_terrence_and_lina.csv"'

    # Write UTF-8 BOM so Excel opens special characters and emojis cleanly
    response.write('\ufeff')

    writer = csv.writer(response, quoting=csv.QUOTE_ALL)
    writer.writerow([
        "ID", "Full Name", "Phone", "Email", "Attending",
        "Date RSVPed"
    ])

    for r in RSVP.objects.all().order_by('id'):
        date_str = r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
        writer.writerow([
            r.id,
            r.name,
            r.phone,
            r.email or '',
            r.attending,
            date_str
        ])

    return response


# ──────────────────────────────────────────────
# PDF EXPORT HELPERS
# ──────────────────────────────────────────────

class _NumberedCanvas(pdf_canvas.Canvas):
    """ReportLab canvas that adds page numbers and decorative gold lines."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_decorations(num_pages)
            super().showPage()
        super().save()

    def _draw_decorations(self, page_count):
        w, h = A4
        self.saveState()
        # Gold rule at top & bottom
        self.setStrokeColor(colors.HexColor('#d4af37'))
        self.setLineWidth(1)
        self.line(28, h - 22, w - 28, h - 22)
        self.line(28, 28, w - 28, 28)
        # Footer text
        self.setFont('Helvetica', 7)
        self.setFillColor(colors.HexColor('#6b21a8'))
        self.drawString(28, 14, 'Terrence & Lina Wedding — Confidential RSVP Directory')
        self.drawRightString(w - 28, 14, f'Page {self._pageNumber} of {page_count}')
        self.restoreState()


def _generate_rsvps_pdf_response(queryset, filename='wedding_guest_rsvp.pdf'):
    """
    Builds a styled A4 PDF of the given RSVP queryset and returns an HttpResponse.
    """
    buf = io.BytesIO()
    w, h = A4
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=28,
        rightMargin=28,
        topMargin=36,
        bottomMargin=48,
        title='Terrence & Lina Wedding — RSVP Guest List',
        author='Wedding Organizer',
    )

    styles = getSampleStyleSheet()
    PURPLE_DARK = colors.HexColor('#3b0764')
    PURPLE      = colors.HexColor('#7c3aed')
    PURPLE_SOFT = colors.HexColor('#f3e8ff')
    GOLD        = colors.HexColor('#d4af37')
    GOLD_DARK   = colors.HexColor('#b8860b')
    GREY        = colors.HexColor('#64748b')
    WHITE       = colors.white
    RED_SOFT    = colors.HexColor('#fef2f2')
    GREEN_SOFT  = colors.HexColor('#f0fdf4')
    RED_TEXT    = colors.HexColor('#991b1b')
    GREEN_TEXT  = colors.HexColor('#166534')

    title_style = ParagraphStyle(
        'WeddingTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=PURPLE_DARK,
        alignment=1,  # centre
        spaceAfter=2,
    )
    subtitle_style = ParagraphStyle(
        'WeddingSubtitle',
        fontName='Helvetica',
        fontSize=10,
        textColor=GREY,
        alignment=1,
        spaceAfter=0,
    )
    section_label = ParagraphStyle(
        'SectionLabel',
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=PURPLE,
        spaceBefore=6,
        spaceAfter=2,
    )
    cell_style = ParagraphStyle(
        'CellStyle',
        fontName='Helvetica',
        fontSize=8,
        textColor=colors.HexColor('#1e1b4b'),
        leading=10,
    )

    rsvps = list(queryset.order_by('id'))
    total = len(rsvps)
    attending = sum(1 for r in rsvps if r.attending and r.attending.lower() == 'yes')
    declined  = total - attending

    story = []

    # ── Header ──────────────────────────────
    story.append(Paragraph('💍 TERRENCE &amp; LINA', title_style))
    story.append(Paragraph('Wedding RSVP Guest Directory · 1 January 2027', subtitle_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width='100%', thickness=1, color=GOLD, spaceAfter=8))

    # ── Summary KPI row ──────────────────────
    from datetime import date as _date
    generated = _date.today().strftime('%d %B %Y')
    kpi_data = [
        [
            Paragraph(f'<font size=18><b>{total}</b></font><br/><font size=7 color="#64748b">Total Responses</font>', cell_style),
            Paragraph(f'<font size=18 color="#166534"><b>{attending}</b></font><br/><font size=7 color="#64748b">Attending</font>', cell_style),
            Paragraph(f'<font size=18 color="#991b1b"><b>{declined}</b></font><br/><font size=7 color="#64748b">Declined</font>', cell_style),
            Paragraph(f'<font size=9 color="#64748b">Generated</font><br/><font size=8><b>{generated}</b></font>', cell_style),
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[(w - 56) / 4] * 4, rowHeights=[36])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), PURPLE_SOFT),
        ('BACKGROUND', (1, 0), (1, 0), GREEN_SOFT),
        ('BACKGROUND', (2, 0), (2, 0), RED_SOFT),
        ('BACKGROUND', (3, 0), (3, 0), colors.HexColor('#fffbeb')),
        ('ALIGN',      (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN',     (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [6]),
        ('BOX',        (0, 0), (0, 0), 0.5, PURPLE),
        ('BOX',        (1, 0), (1, 0), 0.5, colors.HexColor('#16a34a')),
        ('BOX',        (2, 0), (2, 0), 0.5, colors.HexColor('#dc2626')),
        ('BOX',        (3, 0), (3, 0), 0.5, GOLD),
        ('LEFTPADDING',  (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#e9d5ff'), spaceAfter=6))

    # ── Guest Table ──────────────────────────
    story.append(Paragraph('GUEST RSVP DIRECTORY', section_label))

    # Header row
    usable_w = w - 56
    col_widths = [24, usable_w * 0.24, usable_w * 0.18, usable_w * 0.26, usable_w * 0.18, usable_w * 0.14]

    header_para = lambda t: Paragraph(f'<b>{t}</b>', ParagraphStyle('H', fontName='Helvetica-Bold', fontSize=7.5, textColor=WHITE, leading=10))
    table_data = [
        [
            header_para('#'),
            header_para('Full Name'),
            header_para('Phone / WhatsApp'),
            header_para('Email'),
            header_para('Status'),
            header_para('Date RSVPed'),
        ]
    ]

    for i, r in enumerate(rsvps, 1):
        is_yes   = r.attending and r.attending.lower() == 'yes'
        status   = Paragraph(
            f'<font color="{"#166534" if is_yes else "#991b1b"}"><b>{"✓ Attending" if is_yes else "✕ Declined"}</b></font>',
            ParagraphStyle('Status', fontName='Helvetica-Bold', fontSize=7.5, leading=10)
        )
        date_str = r.created_at.strftime('%d %b %Y %H:%M') if r.created_at else '—'
        row_bg   = colors.HexColor('#faf5ff') if i % 2 == 0 else WHITE
        table_data.append([
            Paragraph(str(i), cell_style),
            Paragraph(r.name or '—', cell_style),
            Paragraph(r.phone or '—', cell_style),
            Paragraph(r.email or '—', cell_style),
            status,
            Paragraph(date_str, cell_style),
        ])

    if not rsvps:
        table_data.append([Paragraph('—', cell_style)] * 6)

    guest_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    row_count = len(table_data)

    ts = TableStyle([
        # Header styling
        ('BACKGROUND',    (0, 0), (-1, 0), PURPLE_DARK),
        ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
        ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',      (0, 0), (-1, 0), 7.5),
        ('TOPPADDING',    (0, 0), (-1, 0), 6),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        # Body padding
        ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE',      (0, 1), (-1, -1), 7.5),
        ('TOPPADDING',    (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 5),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 5),
        # Grid
        ('GRID',          (0, 0), (-1, -1), 0.4, colors.HexColor('#e9d5ff')),
        ('LINEBELOW',     (0, 0), (-1, 0), 1.2, GOLD),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN',         (0, 0), (0, -1), 'CENTER'),
    ])
    # Alternating row colours
    for row_idx in range(1, row_count):
        bg = colors.HexColor('#faf5ff') if row_idx % 2 == 0 else WHITE
        ts.add('BACKGROUND', (0, row_idx), (-1, row_idx), bg)

    guest_table.setStyle(ts)
    story.append(guest_table)

    doc.build(story, canvasmaker=_NumberedCanvas)

    pdf_bytes = buf.getvalue()
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


def api_export_pdf(request):
    """
    GET /api/export-pdf
    Exports all RSVPs as a beautifully styled downloadable PDF.
    """
    return _generate_rsvps_pdf_response(
        RSVP.objects.all(),
        filename='wedding_guest_rsvp_terrence_and_lina.pdf'
    )


def api_photos(request):
    """
    GET /api/photos
    Returns list of guest uploaded photos.
    """
    photos = GuestPhoto.objects.all().order_by('-id')
    data = []
    for p in photos:
        data.append({
            'id': p.id,
            'filename': p.filename,
            'uploader_name': p.uploader_name or 'Guest',
            'caption': p.caption or '',
            'created_at': p.created_at.strftime('%Y-%m-%d %H:%M:%S') if p.created_at else ''
        })
    return JsonResponse({'success': True, 'photos': data})


@csrf_exempt
def api_upload_photo(request):
    """
    POST /api/upload-photo
    Uploads a guest photo (base64 JSON payload or multipart file).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    try:
        uploader = 'Guest'
        caption = ''
        filename = f"guest_{int(datetime.now().timestamp())}.jpg"
        filepath = os.path.join(upload_dir, filename)

        if request.content_type and 'application/json' in request.content_type:
            data = json.loads(request.body.decode('utf-8'))
            uploader = (data.get('uploader_name') or 'Guest').strip()
            caption = (data.get('caption') or '').strip()
            base64_img = data.get('image_data') or ''

            if ',' in base64_img:
                _, base64_data = base64_img.split(',', 1)
            else:
                base64_data = base64_img

            img_bytes = base64.b64decode(base64_data)
            with open(filepath, 'wb') as f:
                f.write(img_bytes)
        elif 'image' in request.FILES:
            uploaded_file = request.FILES['image']
            uploader = request.POST.get('uploader_name', 'Guest')
            caption = request.POST.get('caption', '')
            ext = os.path.splitext(uploaded_file.name)[1] or '.jpg'
            filename = f"guest_{int(datetime.now().timestamp())}{ext}"
            filepath = os.path.join(upload_dir, filename)
            with open(filepath, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
        else:
            return JsonResponse({'success': False, 'error': 'No image data provided'}, status=400)

        photo = GuestPhoto.objects.create(
            filename=filename,
            uploader_name=uploader,
            caption=caption,
            created_at=timezone.now()
        )

        return JsonResponse({
            'success': True,
            'filename': filename,
            'id': photo.id
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@staff_member_required
def dashboard(request):
    """
    Dedicated Wedding Organizer Dashboard view with live analytics.
    """
    rsvps = RSVP.objects.all().order_by('-id')
    total_responses = rsvps.count()
    attending = [r for r in rsvps if r.is_attending]
    declined = total_responses - len(attending)
    photos = GuestPhoto.objects.all().order_by('-id')

    context = {
        'rsvps': rsvps,
        'total_responses': total_responses,
        'attending_count': len(attending),
        'declined_count': declined,
        'photos': photos,
    }
    return render(request, 'invitation/dashboard.html', context)
