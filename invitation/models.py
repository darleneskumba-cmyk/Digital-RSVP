from django.db import models
from django.utils import timezone


class RSVP(models.Model):
    ATTENDING_CHOICES = [
        ('yes', 'Joyfully Attending'),
        ('no', 'Regretfully Declining'),
    ]

    name = models.CharField(max_length=255, verbose_name="Guest Name")
    phone = models.CharField(max_length=100, verbose_name="Phone / WhatsApp")
    email = models.EmailField(blank=True, null=True, verbose_name="Email Address")
    attending = models.CharField(
        max_length=20,
        choices=ATTENDING_CHOICES,
        default='yes',
        verbose_name="Attendance Status"
    )
    guest_count = models.IntegerField(default=1, verbose_name="Guest Count")
    guest_names = models.TextField(blank=True, null=True, default='', verbose_name="Accompanying Guest Names")

    notes = models.TextField(blank=True, null=True, default='', verbose_name="Wishes & Blessings for Couple")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="RSVP Date")

    class Meta:
        db_table = 'rsvps'
        ordering = ['-id']
        verbose_name = 'RSVP'
        verbose_name_plural = 'Guest RSVPs'

    def __str__(self):
        status = "Attending" if self.attending.lower() == 'yes' else "Declined"
        return f"{self.name} - {status} ({self.guest_count} guests)"

    @property
    def is_attending(self):
        return self.attending.lower() == 'yes'


class GuestPhoto(models.Model):
    filename = models.CharField(max_length=255, verbose_name="File Name")
    uploader_name = models.CharField(max_length=255, blank=True, null=True, default='Guest', verbose_name="Uploaded By")
    caption = models.TextField(blank=True, null=True, default='', verbose_name="Memory Caption / Blessing")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Uploaded At")

    class Meta:
        db_table = 'guest_photos'
        ordering = ['-id']
        verbose_name = 'Guest Photo'
        verbose_name_plural = 'Guest Photos'

    def __str__(self):
        return f"Photo {self.filename} by {self.uploader_name or 'Guest'}"
