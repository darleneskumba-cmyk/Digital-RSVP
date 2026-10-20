import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import action as unfold_action
from .models import RSVP, GuestPhoto


@admin.action(description="📥 Export Selected RSVPs to CSV (Excel)")
def export_rsvps_to_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="wedding_guest_rsvp_selection.csv"'
    response.write('\ufeff')
    writer = csv.writer(response, quoting=csv.QUOTE_ALL)
    writer.writerow([
        "ID", "Guest Name", "Phone", "Email", "Attending",
        "Total Guests", "Guest Names",
        "Wishes / Notes", "Date RSVPed"
    ])
    for r in queryset.order_by('id'):
        writer.writerow([
            r.id,
            r.name,
            r.phone,
            r.email or '',
            r.attending,
            r.guest_count,
            r.guest_names or '',

            r.notes or '',
            r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
        ])
    return response


@admin.action(description="✓ Mark selected guests as Attending")
def mark_attending(modeladmin, request, queryset):
    updated = queryset.update(attending='yes')
    modeladmin.message_user(request, f"{updated} guest(s) marked as attending.")


@admin.action(description="✕ Mark selected guests as Declined")
def mark_declined(modeladmin, request, queryset):
    updated = queryset.update(attending='no')
    modeladmin.message_user(request, f"{updated} guest(s) marked as declined.")


@admin.register(RSVP)
class RSVPAdmin(ModelAdmin):
    # Unfold-specific
    warn_unsaved_form = True
    list_filter_submit = True

    list_display = (
        'id',
        'name',
        'phone',
        'status_badge',
        'guest_count',

        'short_notes',
        'created_at',
    )
    list_display_links = ('id', 'name')
    list_filter = ('attending', 'created_at')
    search_fields = ('name', 'phone', 'email', 'notes', 'guest_names')
    actions = [export_rsvps_to_csv, mark_attending, mark_declined]
    ordering = ('-id',)

    fieldsets = (
        ('Guest Information', {
            'fields': ('name', 'phone', 'email'),
            'classes': ['wide'],
        }),
        ('RSVP & Attendance Details', {
            'fields': ('attending', 'guest_count', 'guest_names'),
            'classes': ['wide'],
        }),
        ('Personal Message', {
            'fields': ('notes',),
            'classes': ['wide'],
        }),
        ('Record Metadata', {
            'fields': ('created_at',),
            'classes': ['collapse'],
        }),
    )
    readonly_fields = ('created_at',)

    @admin.display(description="Status", ordering="attending")
    def status_badge(self, obj):
        if obj.is_attending:
            return format_html(
                '<span style="background-color: #2e7d32; color: white; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 11px;">✓ Attending ({})</span>',
                obj.guest_count
            )
        return format_html(
            '<span style="background-color: #c62828; color: white; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 11px;">✕ Declined</span>'
        )

    @admin.display(description="Blessings / Message")
    def short_notes(self, obj):
        if not obj.notes:
            return "—"
        return obj.notes[:45] + "..." if len(obj.notes) > 45 else obj.notes


@admin.register(GuestPhoto)
class GuestPhotoAdmin(ModelAdmin):
    # Unfold-specific
    warn_unsaved_form = True

    list_display = ('id', 'uploader_name', 'caption_preview', 'photo_preview', 'created_at')
    search_fields = ('uploader_name', 'caption', 'filename')
    readonly_fields = ('created_at', 'photo_preview')
    ordering = ('-id',)

    @admin.display(description="Caption")
    def caption_preview(self, obj):
        if not obj.caption:
            return "—"
        return obj.caption[:50] + "..." if len(obj.caption) > 50 else obj.caption

    @admin.display(description="Preview")
    def photo_preview(self, obj):
        if obj.filename:
            return format_html(
                '<a href="/media/uploads/{}" target="_blank"><img src="/media/uploads/{}" style="max-height: 50px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" /></a>',
                obj.filename, obj.filename
            )
        return "No photo"
