# 💍 The Wedding of Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi

> **Scripture:** *“I have found the one whom my soul loves”* — Song of Solomon 3:4  
> **Date:** Friday, 1 January 2027 (10:00 AM – 6:00 PM / 1000hrs – 1800hrs)  
> **Venue:** Munondo Eleven, Hatfield, Harare, Zimbabwe  
> **Dress Code:** All shades of purple & Men to wear smart formal  
> **Contacts:** Groom (Terrence): `0772936488` | Bride (Lina): `077777777###`

---

## ✨ Features & Highlights

1. **Interactive 3D Wax Seal Envelope Opening (TikTok Reference Style)**:
   - Embossed Royal Purple & Champagne Gold wax seal with the couple's monogram **T & L** framed by laurel wreaths.
   - On tap/click, the wax seal shines, the flap unseals with 3D perspective, romantic background music (*Turning Page*) begins playing, and the invitation card slides upward and unfolds into view.
2. **Romantic Background Music Player**:
   - Floating music button with wave pulses, mute/unmute toggle, and automatic volume management.
3. **Live Countdown Timer**:
   - Real-time countdown to **1 January 2027 at 10:00 AM** showing Days, Hours, Minutes, and Seconds.
4. **Holy Scripture Section**:
   - Grand presentation of **Song of Solomon 3 vs 4** with gold foil dividers and couple reflection text.
5. **Dress Code & Color Palette Guide**:
   - Interactive color swatch palette for *All Shades of Purple* (Royal Plum, Deep Amethyst, Regal Violet, Velvet Mulberry, Lavender Blossom, Lilac Mist).
   - Style guidance for *Men's Smart Formal* (suits, blazers, tuxedos) and women's attire.
6. **Wedding Schedule & Timeline**:
   - Structured visual order of events from **1000hrs to 1800hrs**:
     - 10:00 AM: Guest Arrival & Welcome Refreshments
     - 11:00 AM: Holy Matrimony Ceremony & Exchange of Vows
     - 12:30 PM: Confetti Toss & Family Photos
     - 02:00 PM: Grand Wedding Luncheon Banquet
     - 03:30 PM: Speeches, Cake Cutting & First Dance
     - 05:00 PM: Music, Dancing & Celebration
     - 06:00 PM: Sparkler Farewell & Send-Off
7. **Munondo Eleven Venue Spotlight & Maps Navigation**:
   - Venue photos, address, parking details, and one-click navigation to Google Maps and Apple Maps.
8. **Photo Gallery & Guest Photo Drop ("Pictures: to send")**:
   - High-resolution gallery with lightbox viewing.
   - Interactive photo upload portal allowing guests to send photos directly to the server database or via WhatsApp.
9. **Interactive RSVP System & Persistent SQLite Database**:
   - Full RSVP form capturing guest name, phone/WhatsApp, email, attendance status, guest count, dietary preferences, and blessings/wishes.
   - Saves directly to SQLite database (`wedding_rsvp.db`) on the server.
   - Offline fallback to browser local storage if opened as a local file.
10. **RSVP Database Management & Admin Dashboard**:
    - Live KPI counters (Total Responses, Attending Guests Count, Declined Count).
    - Search and filter guests by name, phone, or attendance status.
    - One-click **Download CSV (Excel)** button for caterers and event planners.
    - Delete and manage RSVPs.
11. **Direct One-Tap Contact Buttons**:
    - One-click call and WhatsApp chat buttons for Terrence (Groom) and Lina (Bride).
12. **Add to Calendar**:
    - 1-click generation of `.ics` calendar file for Apple Calendar, Google Calendar, and Outlook.

---

## Production deployment (Ubuntu / AWS Lightsail)

The development server launched by `manage.py runserver` is for local testing only. On a production server, install the dependencies in a virtual environment and configure `/etc/wedding-invitation.env`, including:

```ini
DJANGO_SECRET_KEY=<a-long-random-secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=tl.digital-rsvp.co.zw
DJANGO_CSRF_TRUSTED_ORIGINS=https://tl.digital-rsvp.co.zw
```

Then run migrations and `collectstatic`.

Use the systemd unit in `deploy/wedding-invitation.service` to run Gunicorn and the Nginx site config in `deploy/nginx-site.conf` to serve the app, static files, and uploaded media. The Nginx configuration includes `tl.digital-rsvp.co.zw` and the current server IP. In your DNS provider, create an `A` record for host `tl` pointing to the server's public IPv4 address (currently `16.171.60.194`), or create a `CNAME` for `tl` pointing to `digital-rsvp.co.zw` if that is how the apex is configured. Set `DJANGO_ALLOWED_HOSTS=tl.digital-rsvp.co.zw,16.171.60.194` in the environment file if you want both the subdomain and direct-IP access. Allow inbound TCP ports 80 and 443 in the Lightsail firewall; Gunicorn uses a private Unix socket, so port 8000 does not need to be open.

After the DNS record resolves to the server, issue and configure a TLS certificate for the subdomain with Certbot's Nginx plugin:

```bash
sudo certbot --nginx -d tl.digital-rsvp.co.zw
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart wedding-invitation
```

Keep the production secret, SQLite database, and uploaded guest photos out of source control and back up persistent data. The existing repository already tracks `wedding_rsvp.db`; adding it to `.gitignore` does not untrack it, so remove it from Git tracking and review repository history before pushing further changes.

---

## 🚀 How to Run

### Method 1: Double-Click Launcher (Recommended)
Simply double-click `start_server.bat`. It will start the Python server on port `8000` and automatically open `http://localhost:8000` in your web browser.

### Method 2: Command Line
Open PowerShell or Terminal in this directory:
```powershell
python server.py
```
Then visit: [http://localhost:8000](http://localhost:8000)

---

## 📂 Project Directory Structure

```
wedding-invitation/
├── index.html              # Main wedding invitation page
├── style.css               # Luxury responsive stylesheet (Purple & Gold theme)
├── app.js                  # Interactive logic, countdown, audio, RSVP & admin
├── server.py               # Python backend with SQLite database API
├── wedding_rsvp.db         # Persistent SQLite database storing all guest RSVPs
├── start_server.bat        # Windows 1-click launcher
├── assets/
│   ├── audio/
│   │   └── turning-page.mp3 # Romantic wedding instrumental audio
│   ├── images/
│   │   ├── wax_seal_tl.jpg  # Embossed T&L monogram royal purple wax seal
│   │   ├── couple_hero.jpg  # Hero wedding couple portrait
│   │   ├── couple_photo_1.jpg # Garden wisteria photo
│   │   ├── couple_photo_2.jpg # Evening celebration photo
│   │   └── venue_munondo.jpg # Munondo Eleven venue setup
│   └── uploads/             # Guest uploaded pictures & memories
└── README.md
```
