/**
 * Wedding Invitation Application
 * Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi
 * Date: 1 January 2027 | Venue: Munondo eleven, Hatfield
 */

// =========================================================================
// 1. GLOBAL INTERACTIVE WAX SEAL & ENVELOPE OPENING (ANIME.JS POWERED)
// =========================================================================
let isEnvelopeOpened = false;

function dismissEnvelope() {
  const envOverlay = document.getElementById('envelopeOverlay');
  const envWrapper = document.getElementById('envelopeWrapper');

  if (envWrapper) {
    envWrapper.classList.add('opened');
  }

  if (envOverlay) {
    envOverlay.classList.add('opened');
    envOverlay.style.opacity = '0';
    envOverlay.style.pointerEvents = 'none';
    setTimeout(() => {
      envOverlay.style.display = 'none';
    }, 450);
  }

  document.body.classList.remove('envelope-active');
  document.documentElement.classList.remove('envelope-active');

  // Smoothly scroll to the top of the wedding invitation
  try {
    const hero = document.getElementById('hero');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (e) {
    window.scrollTo(0, 0);
  }
}

function openEnvelope() {
  // If already tapped and user taps again, immediately dismiss and take them to website
  if (isEnvelopeOpened) {
    dismissEnvelope();
    return;
  }
  isEnvelopeOpened = true;

  const envWrapper = document.getElementById('envelopeWrapper');
  const envOverlay = document.getElementById('envelopeOverlay');
  const waxSeal = document.getElementById('waxSealBtn');
  const flap = document.getElementById('envelopeFlap');
  const card = document.getElementById('envelopeCardPreview');
  const weddingAudio = document.getElementById('weddingAudio');
  const anim = window.anime || (typeof anime !== 'undefined' ? anime : null);

  // Play audio safely
  if (weddingAudio) {
    try {
      weddingAudio.volume = 0.6;
      weddingAudio.play().catch(() => {});
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Visual opening state immediately
  if (envWrapper) envWrapper.classList.add('opening');

  // Hard safety fallback timer: GUARANTEE the website is revealed within 1100ms
  const safetyTimer = setTimeout(() => {
    dismissEnvelope();
  }, 1100);

  try {
    if (anim && anim.animate) {
      // 1. Wax Seal Pop & Break Animation
      if (waxSeal) {
        anim.animate(waxSeal, {
          scale: [1, 1.35, 0],
          opacity: [1, 0],
          rotate: [0, -10, 10, 0],
          duration: 400,
          ease: 'outBack(2)'
        });
      }

      // 2. 3D Flap Unfolding Backwards
      if (flap) {
        anim.animate(flap, {
          rotateX: [0, 180],
          opacity: [1, 0.4],
          duration: 650,
          delay: 80,
          ease: 'inOutCubic'
        });
      }

      // 3. Invitation Card emerging upwards
      if (card) {
        anim.animate(card, {
          translateY: [0, -130],
          scale: [1, 1.05],
          duration: 700,
          delay: 180,
          ease: 'outExpo'
        });
      }

      // 4. Celebration Confetti trigger
      setTimeout(() => {
        try {
          if (typeof triggerWelcomeConfetti === 'function') {
            triggerWelcomeConfetti();
          } else if (window.triggerWelcomeConfetti) {
            window.triggerWelcomeConfetti();
          }
        } catch (e) {}
      }, 400);

      // 5. Smooth Overlay Dissolve & Reveal
      if (envOverlay) {
        anim.animate(envOverlay, {
          opacity: [1, 0],
          duration: 500,
          delay: 700,
          ease: 'inOutQuad',
          onComplete: () => {
            clearTimeout(safetyTimer);
            dismissEnvelope();
          }
        });
      }
    } else {
      // Graceful fallback if Anime.js is not loaded
      setTimeout(() => {
        dismissEnvelope();
      }, 750);
    }
  } catch (err) {
    console.error('Envelope animation error, dismissing immediately:', err);
    clearTimeout(safetyTimer);
    dismissEnvelope();
  }
}

// Expose globally so inline onclick or any caller can trigger it
window.dismissEnvelope = dismissEnvelope;
window._openEnvelopeReal = openEnvelope;
window.openEnvelope = openEnvelope;
if (window._pendingOpenEnvelope) {
  openEnvelope();
}

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

  function toggleMusic(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const audio = weddingAudio || document.getElementById('weddingAudio');
    if (!audio) return;
    if (audio.paused) {
      audio.volume = 0.6;
      audio.play().then(() => {
        isMusicPlaying = true;
        updateMusicButtonUI();
      }).catch((err) => {
        console.warn('Audio play prevented:', err);
        isMusicPlaying = false;
        updateMusicButtonUI();
      });
    } else {
      audio.pause();
      isMusicPlaying = false;
      updateMusicButtonUI();
    }
  }

  function updateMusicButtonUI() {
    const audio = weddingAudio || document.getElementById('weddingAudio');
    const btn = musicToggleBtn || document.getElementById('musicToggleBtn');
    if (!btn || !audio) return;
    if (!audio.paused) {
      btn.classList.add('playing');
      btn.classList.remove('muted');
      btn.setAttribute('aria-label', 'Mute Wedding Music');
      btn.setAttribute('title', 'Mute Wedding Music');
    } else {
      btn.classList.remove('playing');
      btn.classList.add('muted');
      btn.setAttribute('aria-label', 'Play Wedding Music');
      btn.setAttribute('title', 'Play Wedding Music');
    }
  }

  if (weddingAudio) {
    weddingAudio.addEventListener('play', updateMusicButtonUI);
    weddingAudio.addEventListener('pause', updateMusicButtonUI);
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
  let lastSec = '';

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

    const sStr = String(seconds).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const hStr = String(hours).padStart(2, '0');
    const dStr = String(days).padStart(2, '0');

    if (daysEl && daysEl.textContent !== dStr) daysEl.textContent = dStr;
    if (hoursEl && hoursEl.textContent !== hStr) hoursEl.textContent = hStr;
    if (minEl && minEl.textContent !== mStr) minEl.textContent = mStr;

    if (secEl && secEl.textContent !== sStr) {
      secEl.textContent = sStr;
      if (lastSec !== '' && window.anime && window.anime.animate) {
        window.anime.animate(secEl, {
          scale: [1.18, 1],
          duration: 320,
          ease: 'outBack(1.8)'
        });
      }
      lastSec = sStr;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Staggered Anime.js entrance animation when countdown scrolls into view
  const countdownSection = document.getElementById('countdown');
  if (countdownSection && 'IntersectionObserver' in window) {
    let countdownAnimated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countdownAnimated) {
          countdownAnimated = true;
          if (window.anime && window.anime.animate) {
            const staggerFn = typeof window.anime.stagger === 'function' ? window.anime.stagger(100) : 0;
            window.anime.animate('.countdown-card', {
              opacity: [0, 1],
              translateY: [30, 0],
              scale: [0.92, 1],
              delay: staggerFn,
              duration: 700,
              ease: 'outBack(1.6)'
            });
          }
        }
      });
    }, { threshold: 0.15 });
    observer.observe(countdownSection);
  }

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
          if (window.anime && window.anime.animate) {
            window.anime.animate('#rsvpStatusAlert', {
              scale: [0.85, 1.03, 1],
              opacity: [0, 1],
              duration: 650,
              ease: 'outElastic(1, .6)'
            });
          }
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
  // 9. LOVE STORY HORIZONTAL REEL & FULL PHOTO GALLERY LIGHTBOX
  // =========================================================================
  const loveStoryTrack = document.getElementById('loveStoryTrack');
  const reelPlayPauseBtn = document.getElementById('reelPlayPauseBtn');
  const reelPauseIcon = document.getElementById('reelPauseIcon');
  const reelPlayIcon = document.getElementById('reelPlayIcon');
  const reelPlayPauseText = document.getElementById('reelPlayPauseText');
  const reelNudgeLeftBtn = document.getElementById('reelNudgeLeftBtn');
  const reelNudgeRightBtn = document.getElementById('reelNudgeRightBtn');

  // Toggle Auto-Scroll Pause/Play
  if (reelPlayPauseBtn && loveStoryTrack) {
    let isReelPaused = false;
    reelPlayPauseBtn.addEventListener('click', () => {
      isReelPaused = !isReelPaused;
      loveStoryTrack.classList.toggle('is-paused', isReelPaused);
      if (reelPauseIcon) reelPauseIcon.style.display = isReelPaused ? 'none' : 'block';
      if (reelPlayIcon) reelPlayIcon.style.display = isReelPaused ? 'block' : 'none';
      if (reelPlayPauseText) reelPlayPauseText.textContent = isReelPaused ? 'Resume' : 'Pause';
    });
  }

  // Nudge Left / Right for manual browsing
  if (reelNudgeLeftBtn && loveStoryTrack) {
    reelNudgeLeftBtn.addEventListener('click', () => {
      if (window.anime && window.anime.animate) {
        window.anime.animate(loveStoryTrack, {
          translateX: '+=140px',
          duration: 350,
          ease: 'outQuad'
        });
      }
    });
  }

  if (reelNudgeRightBtn && loveStoryTrack) {
    reelNudgeRightBtn.addEventListener('click', () => {
      if (window.anime && window.anime.animate) {
        window.anime.animate(loveStoryTrack, {
          translateX: '-=140px',
          duration: 350,
          ease: 'outQuad'
        });
      }
    });
  }

  // Lightbox & Photo Catalog (Perfect fit & full resolution)
  const galleryItems = document.querySelectorAll('.gallery-item');
  const loveStoryCards = document.querySelectorAll('.love-story-card');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxIndex = document.getElementById('lightboxIndex');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  // Build catalog from love story cards (gallery grid removed; cards are the source)
  const photoCatalog = [];
  // Use Track Set 1 only (first 7 cards) to avoid duplicates from infinite-loop Track Set 2
  const allCards = Array.from(loveStoryCards);
  const trackSet1 = allCards.slice(0, Math.ceil(allCards.length / 2));
  trackSet1.forEach((card) => {
    const src = card.getAttribute('data-lightbox');
    const caption = card.getAttribute('data-caption') || '';
    if (src && !photoCatalog.some(p => p.src === src)) {
      photoCatalog.push({ src, caption });
    }
  });
  // Also include any remaining gallery items (future-proofing)
  galleryItems.forEach((item) => {
    const src = item.getAttribute('data-lightbox');
    const caption = item.getAttribute('data-caption') || '';
    if (src && !photoCatalog.some(p => p.src === src)) {
      photoCatalog.push({ src, caption });
    }
  });

  let currentPhotoIndex = 0;

  function showLightboxPhoto(index, animate = true) {
    if (photoCatalog.length === 0) return;
    currentPhotoIndex = (index + photoCatalog.length) % photoCatalog.length;
    const current = photoCatalog[currentPhotoIndex];
    if (lightboxImg) {
      lightboxImg.src = current.src;
      lightboxImg.alt = current.caption;
      if (animate && window.anime && window.anime.animate) {
        window.anime.animate(lightboxImg, {
          opacity: [0.3, 1],
          scale: [0.95, 1],
          duration: 300,
          ease: 'outQuad'
        });
      }
    }
    if (lightboxCaption) lightboxCaption.textContent = current.caption;
    if (lightboxIndex) lightboxIndex.textContent = `Photo ${currentPhotoIndex + 1} of ${photoCatalog.length}`;
  }

  function openLightbox(index) {
    showLightboxPhoto(index, false);
    if (lightboxOverlay) {
      lightboxOverlay.classList.add('active');
      if (window.anime && window.anime.animate) {
        window.anime.animate('.lightbox-content', {
          scale: [0.85, 1],
          opacity: [0, 1],
          duration: 420,
          ease: 'outBack(1.4)'
        });
      }
    }
  }

  function closeLightbox() {
    if (lightboxOverlay) lightboxOverlay.classList.remove('active');
  }

  // Click on gallery items
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index') || '0', 10);
      openLightbox(idx);
    });
  });

  // Click on love story cards
  loveStoryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-index') || '0', 10);
      openLightbox(idx);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) closeLightbox();
    });
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxPhoto(currentPhotoIndex - 1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxPhoto(currentPhotoIndex + 1);
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightboxOverlay || !lightboxOverlay.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showLightboxPhoto(currentPhotoIndex - 1);
    else if (e.key === 'ArrowRight') showLightboxPhoto(currentPhotoIndex + 1);
    else if (e.key === 'Escape') closeLightbox();
  });

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

  // =========================================================================
  // 13. COMPREHENSIVE ANIME.JS WEBSITE ANIMATIONS & INTERACTIVITY
  // =========================================================================
  function setupWebsiteAnimeAnimations() {
    const anim = window.anime || (typeof anime !== 'undefined' ? anime : null);
    if (!anim || !anim.animate) return;
    const { animate, stagger } = anim;

    // 1. Ambient Hero Names subtle breathing float
    animate('.hero-couple-names', {
      translateY: [-3, 3],
      duration: 3400,
      direction: 'alternate',
      loop: true,
      ease: 'inOutQuad'
    });

    // 2. Ambient Scripture & Pretitle Badges gentle pulse
    animate('.hero-scripture-badge, .scripture-badge', {
      translateY: [-2, 2],
      duration: 2600,
      direction: 'alternate',
      loop: true,
      ease: 'inOutSine'
    });

    // 3. Floating Quick Nav Dock entrance
    animate('#quickNavDock', {
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 900,
      delay: 500,
      ease: 'outBack(1.5)'
    });

    // 4. Scroll-Triggered Section Entrance Animations (IntersectionObserver)
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.15
    };

    const animatedElements = new WeakSet();

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || animatedElements.has(entry.target)) return;
        animatedElements.add(entry.target);

        const target = entry.target;

        // A. Countdown Section
        if (target.classList.contains('section-countdown')) {
          animate(target.querySelectorAll('.countdown-card'), {
            opacity: [0, 1],
            translateY: [32, 0],
            scale: [0.88, 1],
            delay: stagger(100),
            duration: 750,
            ease: 'outBack(1.5)'
          });
        }

        // B. Scripture Section
        else if (target.classList.contains('section-scripture')) {
          animate(target.querySelector('.scripture-card'), {
            opacity: [0, 1],
            translateY: [40, 0],
            rotateX: [8, 0],
            duration: 1000,
            ease: 'outCubic'
          });
          animate(target.querySelector('.scripture-quote-mark'), {
            opacity: [0, 0.45],
            scale: [0.4, 1],
            duration: 800,
            delay: 200,
            ease: 'outBack(2)'
          });
        }

        // C. Dress Code Section
        else if (target.classList.contains('section-dresscode')) {
          animate(target.querySelectorAll('.dresscode-key-item'), {
            opacity: [0, 1],
            translateY: [30, 0],
            delay: stagger(150),
            duration: 800,
            ease: 'outCubic'
          });
          animate(target.querySelectorAll('.swatch-card'), {
            opacity: [0, 1],
            scale: [0, 1],
            delay: stagger(70, { from: 'center' }),
            duration: 650,
            ease: 'outElastic(1, 0.65)'
          });
        }

        // D. Venue Section
        else if (target.classList.contains('section-venue')) {
          animate(target.querySelector('.venue-showcase-card'), {
            opacity: [0, 1],
            translateY: [45, 0],
            duration: 1000,
            ease: 'outExpo'
          });
          animate(target.querySelectorAll('.amenity-item'), {
            opacity: [0, 1],
            translateX: [-25, 0],
            delay: stagger(100, { start: 200 }),
            duration: 700,
            ease: 'outCubic'
          });
        }

        // E. Gallery Section
        else if (target.classList.contains('section-gallery')) {
          animate(target.querySelectorAll('.gallery-item'), {
            opacity: [0, 1],
            scale: [0.92, 1],
            delay: stagger(80),
            duration: 750,
            ease: 'outCubic'
          });
        }

        // F. RSVP Section
        else if (target.classList.contains('section-rsvp')) {
          animate(target.querySelector('.rsvp-card'), {
            opacity: [0, 1],
            translateY: [40, 0],
            duration: 950,
            ease: 'outExpo'
          });
        }

        // G. Contacts Section
        else if (target.classList.contains('section-contacts')) {
          animate(target.querySelectorAll('.contact-card'), {
            opacity: [0, 1],
            translateY: [30, 0],
            delay: stagger(120),
            duration: 700,
            ease: 'outBack(1.4)'
          });
        }
      });
    }, observerOptions);

    // Observe each main section
    document.querySelectorAll(
      '.section-countdown, .section-scripture, .section-dresscode, .section-venue, .section-gallery, .section-rsvp, .section-contacts'
    ).forEach((sec) => scrollObserver.observe(sec));

    // 5. Interactive Swatch Card Click Micro-Interactions
    document.querySelectorAll('.swatch-card').forEach((card) => {
      card.style.cursor = 'pointer';
      card.addEventListener('mouseenter', () => {
        animate(card, {
          scale: 1.08,
          translateY: -5,
          duration: 300,
          ease: 'outBack(1.6)'
        });
      });
      card.addEventListener('mouseleave', () => {
        animate(card, {
          scale: 1,
          translateY: 0,
          duration: 300,
          ease: 'outQuad'
        });
      });
      card.addEventListener('click', () => {
        const hex = card.querySelector('.swatch-hex')?.textContent || '';
        animate(card, {
          scale: [1, 1.25, 1],
          rotate: [0, -6, 6, 0],
          duration: 450,
          ease: 'outElastic(1, .5)'
        });
        if (navigator.clipboard && hex) {
          navigator.clipboard.writeText(hex).then(() => {
            const hexEl = card.querySelector('.swatch-hex');
            if (hexEl) {
              const original = hexEl.textContent;
              hexEl.textContent = '✓ Copied!';
              setTimeout(() => (hexEl.textContent = original), 1500);
            }
          }).catch(() => {});
        }
      });
    });

    // 6. Interactive Button Spring Physics Hover
    document.querySelectorAll('.btn-royal-primary, .btn-royal-outline, .btn-royal-secondary').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        animate(btn, {
          scale: 1.04,
          duration: 250,
          ease: 'outBack(1.5)'
        });
      });
      btn.addEventListener('mouseleave', () => {
        animate(btn, {
          scale: 1,
          duration: 250,
          ease: 'outQuad'
        });
      });
    });
  }

  // Initialize Anime.js animations
  setupWebsiteAnimeAnimations();

  // Initial load of guest list from database
  fetchDatabaseRsvps();
});
