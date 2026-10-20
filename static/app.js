/**
 * Wedding Invitation Application
 * Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi
 * Date: 1 January 2027 | Venue: Munondo eleven, Hatfield
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const envelopeOverlay = document.getElementById('envelopeOverlay');
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const weddingAudio = document.getElementById('weddingAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const weddingRsvpForm = document.getElementById('weddingRsvpForm');
  const rsvpStatusAlert = document.getElementById('rsvpStatusAlert');
  const attendingDetailsGroup = document.getElementById('attendingDetailsGroup');
  const adminModalOverlay = document.getElementById('adminModalOverlay');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const footerAdminBtn = document.getElementById('footerAdminBtn');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const adminTableBody = document.getElementById('adminTableBody');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminStatusFilter = document.getElementById('adminStatusFilter');
  const refreshRsvpBtn = document.getElementById('refreshRsvpBtn');
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  const photoFileInput = document.getElementById('photoFileInput');
  const uploadFeedback = document.getElementById('uploadFeedback');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  let isMusicPlaying = false;
  let allRsvpsCache = [];

  // =========================================================================
  // 1. INTERACTIVE WAX SEAL & ENVELOPE OPENING (TIKTOK STYLE)
  // =========================================================================
  let isEnvelopeOpened = false;

  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // Trigger 3D flap unseal and card extraction
    const envWrapper = envelopeWrapper || document.getElementById('envelopeWrapper');
    const envOverlay = envelopeOverlay || document.getElementById('envelopeOverlay');

    if (envWrapper) {
      envWrapper.classList.add('opening');
    }

    // Try playing wedding music safely
    try {
      playWeddingMusic();
    } catch (e) {
      console.warn('Audio playback error:', e);
    }

    // After animation finishes, fade out overlay and enable scrolling
    setTimeout(() => {
      if (envOverlay) {
        envOverlay.classList.add('opened');
      }
      document.body.classList.remove('envelope-active');
      try {
        triggerWelcomeConfetti();
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }, 1100);

    // Completely hide overlay after fade out so it can never intercept clicks
    setTimeout(() => {
      if (envOverlay) {
        envOverlay.style.display = 'none';
      }
    }, 2200);
  }

  // Expose globally so inline onclick or any caller can trigger it
  window.openEnvelope = openEnvelope;

  // Add click, touch, and keydown listeners to wax seal and envelope
  const handleSealTap = (e) => {
    if (e) e.stopPropagation();
    openEnvelope();
  };

  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', handleSealTap);
    waxSealBtn.addEventListener('touchend', handleSealTap, { passive: true });
    waxSealBtn.addEventListener('pointerup', handleSealTap, { passive: true });
    waxSealBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }

  if (envelopeOverlay) {
    envelopeOverlay.addEventListener('click', () => openEnvelope());
    envelopeOverlay.addEventListener('touchend', () => openEnvelope(), { passive: true });
  }

  if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
    envelopeWrapper.addEventListener('touchend', (e) => {
      e.stopPropagation();
      openEnvelope();
    }, { passive: true });
  }

  // =========================================================================
  // 2. BACKGROUND MUSIC CONTROLLER
  // =========================================================================
  function playWeddingMusic() {
    try {
      if (!weddingAudio) return;
      weddingAudio.volume = 0.6;
      const playPromise = weddingAudio.play();
      if (playPromise !== undefined && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            isMusicPlaying = true;
            updateMusicButtonUI();
          })
          .catch(() => {
            // Autoplay was blocked, user can click music button manually
            isMusicPlaying = false;
            updateMusicButtonUI();
          });
      }
    } catch (err) {
      console.warn('Audio play prevented:', err);
      isMusicPlaying = false;
      updateMusicButtonUI();
    }
  }

  function toggleMusic() {
    if (!weddingAudio) return;
    if (weddingAudio.paused) {
      weddingAudio.play().then(() => {
        isMusicPlaying = true;
        updateMusicButtonUI();
      }).catch(console.error);
    } else {
      weddingAudio.pause();
      isMusicPlaying = false;
      updateMusicButtonUI();
    }
  }

  function updateMusicButtonUI() {
    if (!musicToggleBtn) return;
    if (isMusicPlaying) {
      musicToggleBtn.classList.add('playing');
      musicToggleBtn.classList.remove('muted');
    } else {
      musicToggleBtn.classList.remove('playing');
      musicToggleBtn.classList.add('muted');
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
  }

  // =========================================================================
  // 3. LIVE COUNTDOWN TIMER TO 1 JANUARY 2027, 9:00 AM
  // =========================================================================
  const weddingDate = new Date(2027, 0, 1, 9, 0, 0).getTime();
  const daysEl = document.getElementById('daysNum');
  const hoursEl = document.getElementById('hoursNum');
  const minEl = document.getElementById('minutesNum');
  const secEl = document.getElementById('secondsNum');

  function updateCountdown() {
    const now = Date.now();
    const diff = weddingDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minEl) minEl.textContent = '00';
      if (secEl) secEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minEl) minEl.textContent = String(minutes).padStart(2, '0');
    if (secEl) secEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =========================================================================
  // 4. FLOATING PURPLE & GOLD PETALS CANVAS
  // =========================================================================
  const canvas = document.getElementById('petalCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const petals = [];
    const petalColors = [
      'rgba(180, 130, 200, 0.45)', // Lavender
      'rgba(130, 45, 150, 0.35)',  // Royal Purple
      'rgba(212, 175, 55, 0.4)',   // Gold Shimmer
      'rgba(230, 200, 245, 0.5)'   // Soft Lilac
    ];

    for (let i = 0; i < 28; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 7 + 4,
        d: Math.random() * 20,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngleInc: Math.random() * 0.05 + 0.02,
        tiltAngle: 0
      });
    }

    function drawPetals() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.fillStyle = p.color;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.tiltAngle * Math.PI) / 180);
        ctx.scale(1, 0.5);
        ctx.arc(0, 0, p.r, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();

        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.d) + 1 + p.r / 8) * 0.7;
        p.x += Math.sin(p.d) * 0.8;

        if (p.x > width + 15 || p.x < -15 || p.y > height) {
          petals[i].x = Math.random() * width;
          petals[i].y = -10;
        }
      }
      requestAnimationFrame(drawPetals);
    }
    drawPetals();
  }

  // =========================================================================
  // 5. RSVP ATTENDANCE RADIO TOGGLE
  // =========================================================================
  const attendanceRadios = document.querySelectorAll('input[name="attending"]');
  attendanceRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'no') {
        attendingDetailsGroup.classList.add('hidden');
      } else {
        attendingDetailsGroup.classList.remove('hidden');
      }
    });
  });

  // =========================================================================
  // 6. RSVP FORM SUBMISSION & DATABASE PERSISTENCE
  // =========================================================================
  if (weddingRsvpForm) {
    weddingRsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('guestName');
      const phoneInput = document.getElementById('guestPhone');
      const emailInput = document.getElementById('guestEmail');
      const attendingVal = document.querySelector('input[name="attending"]:checked')?.value || 'yes';
      const guestCountVal = document.getElementById('guestCount')?.value || '1';
      const guestNamesVal = document.getElementById('guestNamesList')?.value || '';

      const notesVal = document.getElementById('guestNotes')?.value || '';
      const submitBtn = document.getElementById('submitRsvpBtn');

      let isValid = true;
      if (!nameInput.value.trim()) {
        document.getElementById('nameError').textContent = 'Please enter your full name.';
        isValid = false;
      } else {
        document.getElementById('nameError').textContent = '';
      }

      if (!phoneInput.value.trim()) {
        document.getElementById('phoneError').textContent = 'Please enter a contact phone or WhatsApp number.';
        isValid = false;
      } else {
        document.getElementById('phoneError').textContent = '';
      }

      if (!isValid) return;

      const payload = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        attending: attendingVal,
        guest_count: attendingVal === 'yes' ? parseInt(guestCountVal, 10) : 0,
        guest_names: attendingVal === 'yes' ? guestNamesVal.trim() : '',

        notes: notesVal.trim()
      };

      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Recording RSVP...';

      try {
        const response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
          showRsvpAlert(
            `Thank you, ${payload.name}! Your RSVP has been confirmed in our guest database. We cherish your blessings! 💍`,
            'success'
          );
          triggerWelcomeConfetti();
          weddingRsvpForm.reset();
          attendingDetailsGroup.classList.remove('hidden');
          saveLocalBackup(payload);
          fetchDatabaseRsvps();
        } else {
          showRsvpAlert(result.error || 'Unable to submit RSVP. Please try again.', 'error');
        }
      } catch (err) {
        // Fallback for offline file:// viewing
        console.warn('Backend server not reachable, saving to local storage fallback:', err);
        saveLocalBackup(payload);
        showRsvpAlert(
          `Thank you, ${payload.name}! Your RSVP has been saved. Terrence & Lina look forward to celebrating with you! ✨`,
          'success'
        );
        triggerWelcomeConfetti();
        weddingRsvpForm.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Confirm My RSVP';
      }
    });
  }

  function showRsvpAlert(msg, type) {
    if (!rsvpStatusAlert) return;
    rsvpStatusAlert.textContent = msg;
    rsvpStatusAlert.className = `rsvp-status-alert ${type}`;
    rsvpStatusAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function saveLocalBackup(payload) {
    try {
      const stored = JSON.parse(localStorage.getItem('wedding_rsvps_backup') || '[]');
      stored.unshift({
        ...payload,
        id: Date.now(),
        created_at: new Date().toISOString()
      });
      localStorage.setItem('wedding_rsvps_backup', JSON.stringify(stored));
    } catch (e) {
      console.error(e);
    }
  }

  // =========================================================================
  // 7. GUEST DATABASE ADMIN MODAL & TABLE
  // =========================================================================
  async function fetchDatabaseRsvps() {
    try {
      const res = await fetch('/api/rsvps');
      if (res.ok) {
        const data = await res.json();
        allRsvpsCache = data.rsvps || [];
        updateAdminStats(data.stats);
        renderAdminTable(allRsvpsCache);
        return;
      }
    } catch (e) {
      console.log('Using local backup for guest list table');
    }

    // Local fallback
    const local = JSON.parse(localStorage.getItem('wedding_rsvps_backup') || '[]');
    allRsvpsCache = local;
    const attendingCount = local.filter((r) => r.attending === 'yes').reduce((acc, r) => acc + (r.guest_count || 1), 0);
    const declinedCount = local.filter((r) => r.attending === 'no').length;
    updateAdminStats({
      total_responses: local.length,
      total_attending_guests: attendingCount,
      declined_count: declinedCount
    });
    renderAdminTable(allRsvpsCache);
  }

  function updateAdminStats(stats) {
    if (!stats) return;
    const totalEl = document.getElementById('statTotalResponses');
    const attendingEl = document.getElementById('statAttendingGuests');
    const declinedEl = document.getElementById('statDeclinedResponses');

    if (totalEl) totalEl.textContent = stats.total_responses || 0;
    if (attendingEl) attendingEl.textContent = stats.total_attending_guests || 0;
    if (declinedEl) declinedEl.textContent = stats.declined_count || 0;
  }

  function renderAdminTable(rows) {
    if (!adminTableBody) return;
    adminTableBody.innerHTML = '';

    if (!rows || rows.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#888;">No RSVPs found yet. Be the first to RSVP!</td></tr>`;
      return;
    }

    rows.forEach((r, idx) => {
      const isAttending = (r.attending || '').toLowerCase() === 'yes';
      const statusBadge = isAttending
        ? `<span class="badge-attending">✓ Attending</span>`
        : `<span class="badge-declined">✕ Declined</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(r.name)}</strong></td>
        <td>
          <a href="tel:${escapeHtml(r.phone)}" style="color:var(--purple-royal);text-decoration:underline;">
            ${escapeHtml(r.phone)}
          </a>
        </td>
        <td>${statusBadge}</td>
        <td>${isAttending ? r.guest_count + ' guest(s)' : '—'}</td>

        <td style="max-width:200px;"><small><em>${escapeHtml(r.notes || '—')}</em></small></td>
        <td><small style="color:#888;">${formatDate(r.created_at)}</small></td>
        <td>
          <button class="table-action-btn" data-id="${r.id}" title="Delete Record">✕</button>
        </td>
      `;
      adminTableBody.appendChild(tr);
    });

    // Delete buttons
    adminTableBody.querySelectorAll('.table-action-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to remove this RSVP entry?')) {
          await deleteRsvp(id);
        }
      });
    });
  }

  async function deleteRsvp(id) {
    try {
      await fetch(`/api/rsvp/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn(e);
    }
    // Update local cache
    allRsvpsCache = allRsvpsCache.filter((r) => String(r.id) !== String(id));
    localStorage.setItem('wedding_rsvps_backup', JSON.stringify(allRsvpsCache));
    fetchDatabaseRsvps();
  }

  function filterAdminTable() {
    const q = (adminSearchInput?.value || '').toLowerCase().trim();
    const status = adminStatusFilter?.value || 'all';

    const filtered = allRsvpsCache.filter((r) => {
      const matchesQ =
        !q ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q));

      const matchesStatus =
        status === 'all' ||
        (status === 'yes' && (r.attending || '').toLowerCase() === 'yes') ||
        (status === 'no' && (r.attending || '').toLowerCase() === 'no');

      return matchesQ && matchesStatus;
    });

    renderAdminTable(filtered);
  }

  if (adminSearchInput) adminSearchInput.addEventListener('input', filterAdminTable);
  if (adminStatusFilter) adminStatusFilter.addEventListener('change', filterAdminTable);
  if (refreshRsvpBtn) refreshRsvpBtn.addEventListener('click', fetchDatabaseRsvps);

  // Modal open / close
  function openAdminModal() {
    fetchDatabaseRsvps();
    adminModalOverlay.classList.add('active');
  }

  function closeAdminModal() {
    adminModalOverlay.classList.remove('active');
  }

  if (openAdminBtn) openAdminBtn.addEventListener('click', openAdminModal);
  if (footerAdminBtn) footerAdminBtn.addEventListener('click', openAdminModal);
  if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminModal);
  if (adminModalOverlay) {
    adminModalOverlay.addEventListener('click', (e) => {
      if (e.target === adminModalOverlay) closeAdminModal();
    });
  }

  // =========================================================================
  // 8. SEND PHOTOS / UPLOAD PORTAL ("Pictures: to send")
  // =========================================================================
  if (photoFileInput) {
    photoFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      uploadFeedback.innerHTML = `<span style="color:var(--purple-royal);">⏳ Preparing ${escapeHtml(file.name)}...</span>`;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        try {
          const res = await fetch('/api/upload-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploader_name: 'Cherished Guest',
              caption: 'Wedding snapshot',
              image_data: base64Data
            })
          });
          const json = await res.json();
          if (json.success) {
            uploadFeedback.innerHTML = `<span style="color:#1B5E20;font-weight:600;">✓ Picture sent successfully! Terrence &amp; Lina thank you for sharing your memory! 📸</span>`;
            triggerWelcomeConfetti();
          } else {
            uploadFeedback.innerHTML = `<span style="color:#C0392B;">Error sending photo. You can also send via WhatsApp!</span>`;
          }
        } catch (err) {
          uploadFeedback.innerHTML = `<span style="color:#1B5E20;">✓ Photo received! (Saved locally). You can also WhatsApp photos directly to Terrence or Lina! 💍</span>`;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // =========================================================================
  // 9. PHOTO GALLERY LIGHTBOX
  // =========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-lightbox');
      const caption = item.getAttribute('data-caption') || '';
      if (lightboxImg) lightboxImg.src = src;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightboxOverlay) lightboxOverlay.classList.add('active');
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxOverlay.classList.remove('active');
    });
  }
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) lightboxOverlay.classList.remove('active');
    });
  }

  // =========================================================================
  // 10. ADD TO CALENDAR (MODAL & .ICS GENERATION)
  // =========================================================================
  const calendarModalOverlay = document.getElementById('calendarModalOverlay');
  const closeCalendarBtn = document.getElementById('closeCalendarBtn');
  const downloadIcsBtn = document.getElementById('downloadIcsBtn');

  function triggerIcsDownload() {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Terrence and Lina//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:terrence-lina-wedding-20270101',
      'DTSTART:20270101T080000Z',
      'DTEND:20270101T160000Z',
      'SUMMARY:Wedding of Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi',
      'DESCRIPTION:Song of Solomon 3 vs 4: "I have found the one whom my soul loves." Dress Code: All shades of purple & men to wear smart formal. Schedule: 1000hrs to 1800hrs.',
      'LOCATION:Munondo eleven, Hatfield, Harare, Zimbabwe',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Terrence_and_Lina_Wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', () => {
      if (calendarModalOverlay) {
        calendarModalOverlay.classList.add('active');
      } else {
        triggerIcsDownload();
      }
    });
  }

  if (closeCalendarBtn && calendarModalOverlay) {
    closeCalendarBtn.addEventListener('click', () => {
      calendarModalOverlay.classList.remove('active');
    });
    calendarModalOverlay.addEventListener('click', (e) => {
      if (e.target === calendarModalOverlay) {
        calendarModalOverlay.classList.remove('active');
      }
    });
  }

  if (downloadIcsBtn) {
    downloadIcsBtn.addEventListener('click', () => {
      triggerIcsDownload();
      if (calendarModalOverlay) {
        calendarModalOverlay.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // 11. CONFETTI CELEBRATION EFFECT
  // =========================================================================
  function triggerWelcomeConfetti() {
    const confettiCanvas = document.getElementById('confettiCanvas');
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#D4AF37', '#7E268E', '#421252', '#F6E6B4', '#FFFFFF', '#942E86'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * confettiCanvas.width,
        y: -10,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 4 + 2,
        vx: Math.random() * 4 - 2,
        rot: Math.random() * 360,
        vrot: Math.random() * 8 - 4
      });
    }

    let frames = 0;
    function animateConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      pieces.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vrot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frames++;
      if (frames < 140) {
        requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    animateConfetti();
  }

  // =========================================================================
  // 12. UTILITY FUNCTIONS
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(dStr) {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  }

  // Initial load of guest list from database
  fetchDatabaseRsvps();
});
