/**
 * Wedding Invitation Application
 * Terrence Masimba Svosve & Lina Yeukaishe Mutsopotsi
 * Date: 1 January 2027 | Venue: Munondo eleven, Hatfield
 */

// Envelope transition is handled by transition.js

function initWeddingApp() {
  // Elements

  const weddingAudio = document.getElementById('weddingAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const weddingRsvpForm = document.getElementById('weddingRsvpForm');
  const rsvpStatusAlert = document.getElementById('rsvpStatusAlert');
  const attendingDetailsGroup = document.getElementById('attendingDetailsGroup');
  const adminModalOverlay = document.getElementById('adminModalOverlay');
  const footerAdminBtn = document.getElementById('footerAdminBtn');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const adminTableBody = document.getElementById('adminTableBody');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminStatusFilter = document.getElementById('adminStatusFilter');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const topbarLinks = document.getElementById('topbarLinks');
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

  function setTopbarMenuOpen(isOpen) {
    if (!mobileMenuToggle || !topbarLinks) return;
    mobileMenuToggle.classList.toggle('is-open', isOpen);
    topbarLinks.classList.toggle('is-open', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    mobileMenuToggle.title = isOpen ? 'Close menu' : 'Open menu';
  }

  if (mobileMenuToggle && topbarLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      setTopbarMenuOpen(mobileMenuToggle.getAttribute('aria-expanded') !== 'true');
    });
    topbarLinks.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) setTopbarMenuOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.luxury-topbar')) setTopbarMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
        setTopbarMenuOpen(false);
        mobileMenuToggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) setTopbarMenuOpen(false);
    });
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

  function update() {
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

  update();
  setInterval(update, 1000);

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
  // 5. RSVP ATTENDANCE RADIO TOGGLE
  // =========================================================================
  // Guest count & additional guests removed per user request

  // =========================================================================
  // 6. RSVP FORM SUBMISSION & DATABASE PERSISTENCE
  // =========================================================================
  async function handleRsvpSubmit(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    const nameInput = document.getElementById('guestName');
    const phoneInput = document.getElementById('guestPhone');
    const emailInput = document.getElementById('guestEmail');
    const attendingChecked = document.querySelector('input[name="attending"]:checked');
    const attendingVal = attendingChecked ? attendingChecked.value : 'yes';
    const submitBtn = document.getElementById('submitRsvpBtn');

    let isValid = true;
    if (!nameInput || !nameInput.value.trim()) {
      const nameError = document.getElementById('nameError');
      if (nameError) nameError.textContent = 'Please enter your full name.';
      if (nameInput) nameInput.focus();
      isValid = false;
    } else {
      const nameError = document.getElementById('nameError');
      if (nameError) nameError.textContent = '';
    }

    if (!phoneInput || !phoneInput.value.trim()) {
      const phoneError = document.getElementById('phoneError');
      if (phoneError) phoneError.textContent = 'Please enter a contact phone or WhatsApp number.';
      if (isValid && phoneInput) phoneInput.focus();
      isValid = false;
    } else {
      const phoneError = document.getElementById('phoneError');
      if (phoneError) phoneError.textContent = '';
    }

    if (!isValid) return false;

    const payload = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput ? emailInput.value.trim() : '',
      attending: attendingVal
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Recording RSVP...';
    }

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        showRsvpAlert(
          `🎉 YOU HAVE SUCCESSFULLY RSVPed! 🎉\n\nThank you, ${payload.name}! Your RSVP has been confirmed and saved to our database. We look forward to celebrating with you on 1 January 2027! 💍`,
          'success'
        );
        if (weddingRsvpForm) weddingRsvpForm.reset();
        saveLocalBackup(payload);
        fetchDatabaseRsvps();
      } else {
        showRsvpAlert(result.error || 'Unable to submit RSVP. Please try again.', 'error');
      }
    } catch (err) {
      console.warn('Network issue, saved locally:', err);
      saveLocalBackup(payload);
      showRsvpAlert(
        `🎉 YOU HAVE SUCCESSFULLY RSVPed! 🎉\n\nThank you, ${payload.name}! Your RSVP has been confirmed. Terrence & Lina look forward to celebrating with you! 💍`,
        'success'
      );
      if (weddingRsvpForm) weddingRsvpForm.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Confirm My RSVP';
      }
    }
    return false;
  }

  window.handleRsvpSubmit = handleRsvpSubmit;

  if (weddingRsvpForm) {
    weddingRsvpForm.addEventListener('submit', handleRsvpSubmit);
  }
  const submitRsvpBtn = document.getElementById('submitRsvpBtn');
  if (submitRsvpBtn) {
    submitRsvpBtn.addEventListener('click', handleRsvpSubmit);
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
    const attendingCount = local.filter((r) => r.attending === 'yes').length;
    const declinedCount = local.filter((r) => r.attending === 'no').length;
    updateAdminStats({
      total_responses: local.length,
      attending_count: attendingCount,
      declined_count: declinedCount
    });
    renderAdminTable(allRsvpsCache);
  }

  window.fetchDatabaseRsvps = fetchDatabaseRsvps;

  function updateAdminStats(stats) {
    if (!stats) return;
    const totalEl = document.getElementById('statTotalResponses');
    const attendingEl = document.getElementById('statAttendingGuests');
    const declinedEl = document.getElementById('statDeclinedResponses');

    if (totalEl) totalEl.textContent = stats.total_responses || 0;
    if (attendingEl) attendingEl.textContent = stats.attending_count ?? stats.attending_rsvps ?? stats.total_attending_guests ?? 0;
    if (declinedEl) declinedEl.textContent = stats.declined_count || 0;
  }

  function renderAdminTable(rows) {
    if (!adminTableBody) return;
    adminTableBody.innerHTML = '';

    if (!rows || rows.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#888;">No RSVPs found yet. Be the first to RSVP!</td></tr>`;
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
        (r.phone && r.phone.toLowerCase().includes(q));

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
  // 9. 3D PHOTO SLIDESHOW & LIGHTBOX
  // =========================================================================
  const photoSlides = Array.from(document.querySelectorAll('.photo-slide'))
    .sort((first, second) => Number(first.dataset.slideIndex) - Number(second.dataset.slideIndex));
  const photoSlideCount = document.getElementById('photoSlideCount');
  const photoSlideProgress = document.getElementById('photoSlideProgress');
  const photoSlidePrevious = document.getElementById('photoSlidePrevious');
  const photoSlideNext = document.getElementById('photoSlideNext');
  const photoSlideToggle = document.getElementById('photoSlideToggle');
  const lightboxIndex = document.getElementById('lightboxIndex');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const slidePositions = ['is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next', 'is-hidden'];
  const photoCatalog = photoSlides.map((slide) => ({
    src: slide.dataset.lightbox,
    caption: slide.dataset.caption || ''
  }));
  const progressButtons = photoSlides.map((slide, index) => {
    const button = document.createElement('button');
    button.className = 'photo-slide-dot';
    button.type = 'button';
    button.setAttribute('aria-label', `Show photo ${index + 1}`);
    button.title = `Show photo ${index + 1}`;
    button.addEventListener('click', () => showPhotoSlide(index));
    photoSlideProgress?.appendChild(button);
    return button;
  });

  let activeSlideIndex = 0;
  let activeLightboxIndex = 0;
  let slideshowTimer = null;
  let slideshowPlaying = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showPhotoSlide(index) {
    if (photoSlides.length === 0) return;
    activeSlideIndex = (index + photoSlides.length) % photoSlides.length;
    const middle = Math.floor(photoSlides.length / 2);

    photoSlides.forEach((slide, slideIndex) => {
      let offset = (slideIndex - activeSlideIndex + photoSlides.length) % photoSlides.length;
      if (offset > middle) offset -= photoSlides.length;
      const position = offset === 0 ? 'is-active'
        : offset === -1 ? 'is-prev'
          : offset === 1 ? 'is-next'
            : offset === -2 ? 'is-far-prev'
              : offset === 2 ? 'is-far-next'
                : 'is-hidden';

      slide.classList.remove(...slidePositions);
      slide.classList.add(position);
      slide.setAttribute('aria-hidden', String(Math.abs(offset) > 2));
      slide.tabIndex = Math.abs(offset) > 2 ? -1 : 0;
    });

    progressButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeSlideIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    if (photoSlideCount) {
      photoSlideCount.textContent = `${String(activeSlideIndex + 1).padStart(2, '0')} / ${String(photoSlides.length).padStart(2, '0')}`;
    }
  }

  function updateSlideshowPlayback() {
    if (slideshowTimer) window.clearInterval(slideshowTimer);
    slideshowTimer = null;
    if (photoSlideToggle) {
      photoSlideToggle.textContent = slideshowPlaying ? 'Pause' : 'Play';
      photoSlideToggle.setAttribute('aria-label', `${slideshowPlaying ? 'Pause' : 'Play'} slideshow`);
      photoSlideToggle.title = `${slideshowPlaying ? 'Pause' : 'Play'} slideshow`;
    }
    if (slideshowPlaying && photoSlides.length > 1 && !document.hidden) {
      slideshowTimer = window.setInterval(() => showPhotoSlide(activeSlideIndex + 1), 5200);
    }
  }

  function showLightboxPhoto(index, animate = true) {
    if (photoCatalog.length === 0) return;
    activeLightboxIndex = (index + photoCatalog.length) % photoCatalog.length;
    const photo = photoCatalog[activeLightboxIndex];
    if (lightboxImg) {
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.caption;
      if (animate && window.anime && window.anime.animate) {
        window.anime.animate(lightboxImg, {
          opacity: [0.3, 1],
          scale: [0.95, 1],
          duration: 300,
          ease: 'outQuad'
        });
      }
    }
    if (lightboxCaption) lightboxCaption.textContent = photo.caption;
    if (lightboxIndex) lightboxIndex.textContent = `Photo ${activeLightboxIndex + 1} of ${photoCatalog.length}`;
  }

  function openPhotoLightbox(index) {
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

  function closePhotoLightbox() {
    if (lightboxOverlay) lightboxOverlay.classList.remove('active');
  }

  photoSlides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      if (index !== activeSlideIndex) {
        showPhotoSlide(index);
        updateSlideshowPlayback();
      } else {
        openPhotoLightbox(index);
      }
    });
  });
  photoSlidePrevious?.addEventListener('click', () => showPhotoSlide(activeSlideIndex - 1));
  photoSlideNext?.addEventListener('click', () => showPhotoSlide(activeSlideIndex + 1));
  photoSlideToggle?.addEventListener('click', () => {
    slideshowPlaying = !slideshowPlaying;
    updateSlideshowPlayback();
  });
  photoSlides[0]?.parentElement?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showPhotoSlide(activeSlideIndex - 1);
    if (event.key === 'ArrowRight') showPhotoSlide(activeSlideIndex + 1);
  });
  document.addEventListener('visibilitychange', updateSlideshowPlayback);

  if (lightboxClose) lightboxClose.addEventListener('click', closePhotoLightbox);
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (event) => {
      if (event.target === lightboxOverlay) closePhotoLightbox();
    });
  }
  lightboxPrev?.addEventListener('click', (event) => {
    event.stopPropagation();
    showLightboxPhoto(activeLightboxIndex - 1);
  });
  lightboxNext?.addEventListener('click', (event) => {
    event.stopPropagation();
    showLightboxPhoto(activeLightboxIndex + 1);
  });
  window.addEventListener('keydown', (event) => {
    if (!lightboxOverlay?.classList.contains('active')) return;
    if (event.key === 'ArrowLeft') showLightboxPhoto(activeLightboxIndex - 1);
    else if (event.key === 'ArrowRight') showLightboxPhoto(activeLightboxIndex + 1);
    else if (event.key === 'Escape') closePhotoLightbox();
  });

  showPhotoSlide(0);
  updateSlideshowPlayback();

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

    // 3. Scroll-Triggered Section Entrance Animations (IntersectionObserver)
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
          }).catch(() => { });
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
}

// Ensure execution whether DOM is loading or already parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWeddingApp);
} else {
  initWeddingApp();
}
