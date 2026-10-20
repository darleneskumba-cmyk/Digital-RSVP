from django.urls import path
from . import views

app_name = 'invitation'

urlpatterns = [
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/rsvps', views.api_rsvps, name='api_rsvps'),
    path('api/rsvp', views.api_rsvp, name='api_rsvp'),
    path('api/rsvp/<int:rsvp_id>', views.api_rsvp_detail, name='api_rsvp_detail'),
    path('api/export-csv', views.api_export_csv, name='api_export_csv'),
    path('api/photos', views.api_photos, name='api_photos'),
    path('api/upload-photo', views.api_upload_photo, name='api_upload_photo'),
]
