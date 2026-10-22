import os
import json
import base64
import csv
from datetime import datetime
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
    total_attending_guests = sum(r.guest_count for r in attending_rsvps)
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
            'attending_rsvps': len(attending_rsvps),
            'total_attending_guests': total_attending_guests,
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
    total_attending_guests = sum(r.guest_count for r in attending_qs)
    declined_count = total_responses - len(attending_qs)

    data = []
    for r in rsvps:
        data.append({
            'id': r.id,
            'name': r.name,
            'phone': r.phone,
            'email': r.email or '',
            'attending': r.attending,
            'guest_count': r.guest_count,
            'guest_names': r.guest_names or '',

            'notes': r.notes or '',
            'created_at': r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
        })

    return JsonResponse({
        'success': True,
        'rsvps': data,
        'stats': {
            'total_responses': total_responses,
            'attending_rsvps': len(attending_qs),
            'total_attending_guests': total_attending_guests,
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

    try:
        guest_count = int(data.get('guest_count', 1))
    except (ValueError, TypeError):
        guest_count = 1

    guest_names = (data.get('guest_names') or '').strip()

    notes = (data.get('notes') or '').strip()

    if not name or not phone:
        return JsonResponse({'success': False, 'error': 'Name and phone number are required.'}, status=400)

    rsvp = RSVP.objects.create(
        name=name,
        phone=phone,
        email=email if email else None,
        attending=attending,
        guest_count=guest_count,
        guest_names=guest_names,

        notes=notes,
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
        "Total Guests", "Guest Names",
        "Message/Wishes", "Date RSVPed"
    ])

    for r in RSVP.objects.all().order_by('id'):
        date_str = r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
        writer.writerow([
            r.id,
            r.name,
            r.phone,
            r.email or '',
            r.attending,
            r.guest_count,
            r.guest_names or '',

            r.notes or '',
            date_str
        ])

    return response


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
    total_guests = sum(r.guest_count for r in attending)
    declined = total_responses - len(attending)
    photos = GuestPhoto.objects.all().order_by('-id')

    context = {
        'rsvps': rsvps,
        'total_responses': total_responses,
        'attending_count': len(attending),
        'total_guests': total_guests,
        'declined_count': declined,
        'photos': photos,
    }
    return render(request, 'invitation/dashboard.html', context)
