(() => {
  const { animate, createTimeline, stagger } = (typeof anime !== 'undefined' ? anime : window.anime);

  const sealBtn = document.getElementById("wax-seal-btn");
  const overlay = document.getElementById("envelope-overlay");
  const stage   = document.getElementById("envelope-stage");
  const wash    = document.getElementById("white-wash");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!sealBtn || !overlay) return;

  const finish = () => {
    overlay.style.display = "none";
    if (wash) wash.style.display = "none";
    document.body.classList.remove("locked-scroll");
    document.querySelectorAll(".hero-item").forEach(el => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  };

  // Gentle idle pulse on the 3D wax seal until it's tapped
  const idle = (reduced || !animate) ? null : animate(sealBtn, {
    scale: [1, 1.04],
    duration: 1600,
    ease: "inOutSine",
    alternate: true,
    loop: true,
  });

  let opened = false;
  const openTransition = () => {
    if (opened) return;
    opened = true;
    sealBtn.disabled = true;
    if (idle) idle.cancel();

    // Start background romantic wedding music
    try {
      const audio = document.getElementById("weddingAudio");
      if (audio) {
        audio.volume = 0.6;
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            if (window.syncMusicButtonUI) window.syncMusicButtonUI();
          }).catch(() => {});
        }
      }
    } catch (e) {}

    if (reduced || !createTimeline) {
      finish();
      return;
    }

    const tl = createTimeline({ onComplete: finish });

    tl
      // 1. Press the wax seal into the envelope, then let it lift & fade
      .add(sealBtn, { scale: 0.92, duration: 160, ease: "outQuad" }, 0)
      .add(sealBtn, { scale: 1.25, y: -16, opacity: 0, duration: 420, ease: "inOutQuad" }, 160)
      .add(".tap-hint", { opacity: 0, duration: 250, ease: "linear" }, 0)

      // 2. Flap hinges open in 3D perspective at top edge
      .add("#env-flap", { rotateX: [0, 180], duration: 950, ease: "inOutCubic" }, 260)

      // 3. Letter slides up out of the pocket
      .add("#env-letter", { y: ["14%", "-24%"], duration: 850, ease: "outCubic" }, 650)

      // 4. Camera pushes into the envelope while a white wash fills the screen
      .add(stage, { scale: [1, 1.35], duration: 800, ease: "inQuad" }, 1250)
      .add(wash,  { opacity: [0, 1], duration: 600, ease: "inQuad" }, 1450)

      // 5. Swap envelope for wedding hero underneath the wash
      .call(() => {
        overlay.style.display = "none";
        window.scrollTo(0, 0);
      }, 2060)

      // 6. Wash fades out, hero image settles, wedding details stagger in
      .add(wash, { opacity: [1, 0], duration: 800, ease: "outQuad" }, 2100)
      .add(".hero-backdrop-crisp, #hero-bg", { scale: [1.18, 1], duration: 2200, ease: "outCubic" }, 2100)
      .add(".hero-item", {
        opacity: [0, 1],
        y: [28, 0],
        duration: 900,
        delay: stagger ? stagger(180) : 0,
        ease: "outCubic",
      }, 2500);
  };

  sealBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openTransition();
  });

  overlay.addEventListener("click", () => {
    openTransition();
  });
})();
