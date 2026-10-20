"""
Django settings for wedding_project project.
Wedding of Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi
Friday, 1 January 2027 | Munondo eleven, Hatfield
"""

from pathlib import Path
from django.templatetags.static import static
from django.urls import reverse_lazy
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-wedding-terrence-and-lina-svosve-mutsopotsi-2027'

DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'unfold',                      # django-unfold must come BEFORE django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'invitation.apps.InvitationConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'wedding_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
            ],
        },
    },
]

WSGI_APPLICATION = 'wedding_project.wsgi.application'

# Database
# Connects to the wedding SQLite database preserving all existing guest RSVPs

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'wedding_rsvp.db',
    }
}

# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Africa/Harare'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images, Audio)

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (Guest picture uploads)

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Login redirect for protected pages (dashboard)
LOGIN_URL = '/admin/login/'

# ─────────────────────────────────────────────────────────────────────
# UNFOLD ADMIN CONFIGURATION
# Modern admin theme for Terrence & Lina's wedding management
# ─────────────────────────────────────────────────────────────────────

UNFOLD = {
    "SITE_TITLE": "Terrence & Lina's Wedding",
    "SITE_HEADER": "💍 Terrence & Lina",
    "SITE_SUBHEADER": "Wedding RSVP & Guest Management · 1 January 2027",
    "SITE_URL": "/",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "THEME": "dark",
    "COLORS": {
        "primary": {
            "50": "#f5f3ff",
            "100": "#ede9fe",
            "200": "#ddd6fe",
            "300": "#c4b5fd",
            "400": "#a78bfa",
            "500": "#8b5cf6",
            "600": "#7c3aed",
            "700": "#6d28d9",
            "800": "#5b21b6",
            "900": "#4c1d95",
            "950": "#2e1065",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Wedding Management",
                "separator": True,
                "items": [
                    {
                        "title": "Guest RSVPs",
                        "icon": "how_to_reg",
                        "link": reverse_lazy("admin:invitation_rsvp_changelist"),
                    },
                    {
                        "title": "Guest Photos",
                        "icon": "photo_library",
                        "link": reverse_lazy("admin:invitation_guestphoto_changelist"),
                    },
                ],
            },
            {
                "title": "Quick Links",
                "separator": True,
                "items": [
                    {
                        "title": "Wedding Dashboard",
                        "icon": "dashboard",
                        "link": reverse_lazy("invitation:dashboard"),
                    },
                    {
                        "title": "Wedding Invitation",
                        "icon": "home",
                        "link": "/",
                    },
                    {
                        "title": "Export CSV (Excel)",
                        "icon": "download",
                        "link": reverse_lazy("invitation:api_export_csv"),
                    },
                ],
            },
            {
                "title": "Administration",
                "separator": True,
                "items": [
                    {
                        "title": "Users",
                        "icon": "people",
                        "link": reverse_lazy("admin:auth_user_changelist"),
                    },
                    {
                        "title": "Groups",
                        "icon": "group_work",
                        "link": reverse_lazy("admin:auth_group_changelist"),
                    },
                ],
            },
        ],
    },
}
