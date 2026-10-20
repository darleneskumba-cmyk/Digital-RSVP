"""
Wedding Invitation & RSVP Server
Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi
January 1, 2027 | Munondo eleven, Hatfield
"""

import http.server
import socketserver
import os
import sys
import json
import sqlite3
import urllib.parse
from datetime import datetime
import base64

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "wedding_rsvp.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "assets", "uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rsvps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            attending TEXT NOT NULL,
            guest_count INTEGER DEFAULT 1,
            guest_names TEXT,
            dietary TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS guest_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            uploader_name TEXT,
            caption TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM rsvps')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO rsvps (name, phone, email, attending, guest_count, guest_names, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            "Kudzai & Chipo Moyo",
            "+263 77 123 4567",
            "kudzai@example.com",
            "yes",
            2,
            "Kudzai Moyo, Chipo Moyo",
            "Congratulations Terrence & Lina! So overjoyed to witness your holy union on New Year's Day!"
        ))
    conn.commit()
    conn.close()

init_db()

class WeddingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_json(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/rsvps':
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM rsvps ORDER BY id DESC')
            rows = [dict(row) for row in cursor.fetchall()]
            
            total_responses = len(rows)
            attending_rsvps = [r for r in rows if r['attending'].lower() in ('yes', 'attending', 'true')]
            total_attending_guests = sum(r.get('guest_count', 1) for r in attending_rsvps)
            declined_count = total_responses - len(attending_rsvps)
            
            conn.close()
            self._send_json({
                "success": True,
                "rsvps": rows,
                "stats": {
                    "total_responses": total_responses,
                    "attending_rsvps": len(attending_rsvps),
                    "total_attending_guests": total_attending_guests,
                    "declined_count": declined_count
                }
            })
            return

        elif path == '/api/export-csv':
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, phone, email, attending, guest_count, guest_names, notes, created_at FROM rsvps ORDER BY id ASC')
            rows = cursor.fetchall()
            conn.close()

            csv_lines = ['"ID","Full Name","Phone","Email","Attending","Total Guests","Guest Names","Message/Wishes","Date RSVPed"']
            for r in rows:
                escaped = [str(x or '').replace('"', '""') for x in r]
                csv_lines.append(f'"{escaped[0]}","{escaped[1]}","{escaped[2]}","{escaped[3]}","{escaped[4]}","{escaped[5]}","{escaped[6]}","{escaped[7]}","{escaped[8]}","{escaped[9]}"')
            
            csv_content = '\ufeff' + '\r\n'.join(csv_lines)
            csv_bytes = csv_content.encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'text/csv; charset=utf-8')
            self.send_header('Content-Disposition', 'attachment; filename="wedding_guest_rsvp_terrence_and_lina.csv"')
            self.send_header('Content-Length', str(len(csv_bytes)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(csv_bytes)
            return

        elif path == '/api/photos':
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM guest_photos ORDER BY id DESC')
            photos = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self._send_json({"success": True, "photos": photos})
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/rsvp':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
            except Exception as e:
                self._send_json({"success": False, "error": "Invalid JSON"}, 400)
                return

            name = (data.get('name') or '').strip()
            phone = (data.get('phone') or '').strip()
            email = (data.get('email') or '').strip()
            attending = (data.get('attending') or 'yes').strip().lower()
            try:
                guest_count = int(data.get('guest_count', 1))
            except:
                guest_count = 1
            guest_names = (data.get('guest_names') or '').strip()

            notes = (data.get('notes') or '').strip()

            if not name or not phone:
                self._send_json({"success": False, "error": "Name and phone number are required."}, 400)
                return

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO rsvps (name, phone, email, attending, guest_count, guest_names, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (name, phone, email, attending, guest_count, guest_names, notes))
            new_id = cursor.lastrowid
            conn.commit()
            conn.close()

            self._send_json({
                "success": True,
                "message": "RSVP recorded successfully! Thank you for celebrating with us.",
                "id": new_id
            })
            return

        elif path == '/api/upload-photo':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                uploader = (data.get('uploader_name') or 'Guest').strip()
                caption = (data.get('caption') or '').strip()
                base64_img = data.get('image_data') or ''
                
                if ',' in base64_img:
                    header, base64_data = base64_img.split(',', 1)
                else:
                    base64_data = base64_img

                img_bytes = base64.b64decode(base64_data)
                filename = f"guest_{int(datetime.now().timestamp())}.jpg"
                filepath = os.path.join(UPLOAD_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(img_bytes)

                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO guest_photos (filename, uploader_name, caption)
                    VALUES (?, ?, ?)
                ''', (filename, uploader, caption))
                conn.commit()
                conn.close()

                self._send_json({"success": True, "filename": filename})
                return
            except Exception as e:
                self._send_json({"success": False, "error": str(e)}, 400)
                return

        self._send_json({"error": "Not Found"}, 404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith('/api/rsvp/'):
            try:
                rsvp_id = int(path.split('/')[-1])
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute('DELETE FROM rsvps WHERE id = ?', (rsvp_id,))
                conn.commit()
                conn.close()
                self._send_json({"success": True, "message": f"RSVP {rsvp_id} deleted."})
                return
            except Exception as e:
                self._send_json({"success": False, "error": str(e)}, 400)
                return
        self._send_json({"error": "Not Found"}, 404)

def run():
    sys.stdout.reconfigure(encoding='utf-8')
    for try_port in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", try_port), WeddingHTTPRequestHandler) as httpd:
                print("===========================================================")
                print(f"[+] Terrence & Lina Wedding Server Running on:")
                print(f"    http://localhost:{try_port}")
                print(f"    Serving: {BASE_DIR}")
                print(f"    Database: {DB_PATH}")
                print("===========================================================")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError:
            continue

if __name__ == '__main__':
    run()
