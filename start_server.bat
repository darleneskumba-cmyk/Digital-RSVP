@echo off
title 💍 Terrence & Lina Wedding Server (Django)
echo =========================================================================
echo  💒 Starting Django Wedding Invitation & RSVP Database Server
echo  Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi
echo  Friday, 1 January 2027 | Munondo eleven, Hatfield
echo =========================================================================
echo.
cd /d "%~dp0"
start "" http://127.0.0.1:8000/
python manage.py runserver 8000
pause
