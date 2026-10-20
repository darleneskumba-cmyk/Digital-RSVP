"""
URL configuration for wedding_project project.
Wedding of Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Custom Admin Site Header & Titles
admin.site.site_header = "💍 Terrence & Lina's Wedding Admin Portal"
admin.site.site_title = "Wedding RSVP & Guest Management"
admin.site.index_title = "Welcome to the Wedding Administration"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('invitation.urls')),
]

# Serve media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
