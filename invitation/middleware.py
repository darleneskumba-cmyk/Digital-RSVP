"""
IP Whitelist Middleware
=======================
Blocks every device that is NOT in ALLOWED_CLIENT_IPS from accessing
the wedding invitation site.

To add your phone or another trusted device:
  1. Find its IP address (Settings -> Wi-Fi -> tap your network -> IP address).
  2. Add it to ALLOWED_CLIENT_IPS in wedding_project/settings.py.

To temporarily disable the block, set
  IP_WHITELIST_ENABLED = False   in settings.py.
"""

from django.conf import settings
from django.http import HttpResponseForbidden


def _get_client_ip(request):
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


class IPWhitelistMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        enabled = getattr(settings, "IP_WHITELIST_ENABLED", True)

        if enabled:
            allowed_ips = getattr(settings, "ALLOWED_CLIENT_IPS", [])
            client_ip = _get_client_ip(request)

            if client_ip not in allowed_ips:
                return HttpResponseForbidden(
                    "<html><body style='font-family:sans-serif;text-align:center;"
                    "padding-top:10vh;background:#0d0d0d;color:#ccc;'>"
                    "<h2 style='color:#8b5cf6'>Lock Access Restricted</h2>"
                    "<p>This page is private.<br>"
                    "If you believe this is an error, please contact the site owner.</p>"
                    "</body></html>",
                    content_type="text/html",
                )

        return self.get_response(request)
