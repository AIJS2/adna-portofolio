// =======================================================
// ===== BAGIAN 1: LOGIKA LOADING SCREEN (CACHED & SMOOTH) =====
// =======================================================
window.addEventListener("load", function () {
  const loaderWrapper = document.getElementById("loader-wrapper");
  
  // Cek apakah user sudah pernah melihat intro di sesi ini (dengan try-catch untuk Incognito mode)
  let hasSeenIntro = false;
  try {
    hasSeenIntro = sessionStorage.getItem("adna_seen_intro") === "true";
  } catch (e) {
    hasSeenIntro = false;
  }
  
  if (hasSeenIntro && loaderWrapper) {
    loaderWrapper.classList.add("fast-hide");
    document.body.classList.add("is-visible");
    return;
  }

  // Jika pertama kali: jalankan animasi intro smooth & cinematic (~5.2s)
  const line = document.querySelector(".unfolding-line");
  const brandName = "ADNA.";
  const textContainer = document.createElement("div");
  textContainer.className = "loader-text";
  
  brandName.split("").forEach((char) => {
    const charSpan = document.createElement("span");
    charSpan.className = "char";
    charSpan.textContent = char;
    textContainer.appendChild(charSpan);
  });
  
  if (line) line.appendChild(textContainer);
  const chars = document.querySelectorAll(".loader-text .char");
  
  setTimeout(() => {
    if (line) line.classList.add("is-unfolded");
  }, 100);
  
  setTimeout(() => {
    chars.forEach((char, index) => {
      setTimeout(() => {
        char.classList.add("is-visible");
      }, index * 100);
    });
  }, 1200);
  
  setTimeout(() => {
    chars.forEach((char, index) => {
      setTimeout(() => {
        char.classList.remove("is-visible");
      }, index * 90);
    });
  }, 2800);
  
  setTimeout(() => {
    if (line) line.classList.remove("is-unfolded");
  }, 3800);
  
  setTimeout(() => {
    if (loaderWrapper) loaderWrapper.classList.add("is-exiting");
  }, 4500);
  
  setTimeout(() => {
    if (loaderWrapper) loaderWrapper.classList.add("hidden");
    try {
      sessionStorage.setItem("adna_seen_intro", "true");
    } catch (e) {
      // Silent fail jika private mode
    }
  }, 5200);
});

// =======================================================
// ===== BAGIAN 2: LOGIKA UTAMA DENGAN SEMUA PERBAIKAN =====
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  const pageContainer = document.querySelector(".page-container");
  const pages = document.querySelectorAll(".page");
  const slider = document.querySelector(".slider");
  const handle = document.querySelector(".slider-handle");
  const sliderLabel = document.querySelector(".slider-label");
  const mobilePageButtons = document.querySelectorAll(".mobile-page-button");
  const mobilePageIndicator = document.querySelector(".mobile-page-indicator");
  const navLinks = document.querySelectorAll(".navbar a, .logo, .cta-link");
  const teaserTextEl = document.querySelector(".teaser-text");
  let teaserSpans = []; // Siapkan array untuk menyimpan span huruf

  if (teaserTextEl) {
    const text = teaserTextEl.textContent;
    teaserTextEl.innerHTML = ""; // Kosongkan
    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.innerHTML = char === " " ? "&nbsp;" : char;
      teaserTextEl.appendChild(span);
      teaserSpans.push(span); // Masukkan span ke array
    });
  }

  const totalPages = 4;
  const pageTitles = ["START HERE", "WHO IS ADNA", "EXPERIMENTS", "SAY HI"];
  const pageNavTitles = ["START", "ABOUT", "PROJECTS", "CONTACT"];
  let currentPageIndex = 0;
  let isTransitioning = false;

  let handleX = 0,
    velocityX = 0,
    restingX = 0;
  let isDragging = false,
    dragStartX = 0;
  const springStiffness = 0.08,
    friction = 0.85;

  // ===== FUNGSI ANIMASI HURUF BARU =====
  const charAnimationDelay = 30; // Jeda antar huruf (dalam milidetik)

  function animateCharsIn() {
    teaserSpans.forEach((span, index) => {
      setTimeout(() => {
        span.classList.add("is-visible");
      }, index * charAnimationDelay);
    });
  }

  function animateCharsOut() {
    // Dibalik, agar huruf terakhir hilang duluan
    teaserSpans.forEach((span, index) => {
      setTimeout(() => {
        span.classList.remove("is-visible");
      }, index * charAnimationDelay);
    });
  }
  // ===== AKHIR FUNGSI ANIMASI HURUF =====

  function goToPage(targetIndex) {
    if (targetIndex < 0 || targetIndex >= totalPages) return;
    if (targetIndex === currentPageIndex || isTransitioning) return;
    isTransitioning = true;
    const direction = targetIndex > currentPageIndex ? "forward" : "backward";
    pageContainer.dataset.direction = direction;
    pages[targetIndex].classList.remove("is-entering", "enter-from-forward", "enter-from-backward");
    pages[targetIndex].classList.add("is-entering", `enter-from-${direction}`);
    pages[currentPageIndex].classList.add("is-leaving");

    // Logika animasi keluar
    if (currentPageIndex === 2) { // Jika kita meninggalkan halaman Bridge (Portfolio)
      animateCharsOut();
    }
    pages[currentPageIndex].classList.remove("active");
    document.body.classList.remove("is-visible");

    const sliderWidth = slider.offsetWidth,
      handleWidth = handle.offsetWidth;
    restingX = (targetIndex / (totalPages - 1)) * (sliderWidth - handleWidth);

    setTimeout(() => {
      pageContainer.style.transition =
        "transform 1.15s cubic-bezier(0.76, 0, 0.24, 1)";
      pageContainer.style.transform = `translateX(${-targetIndex * 100}vw)`;

      setTimeout(() => {
        pages[currentPageIndex].classList.remove("is-leaving");
        currentPageIndex = targetIndex;
        
        // Logika animasi masuk
        if (currentPageIndex === 2) { // Jika kita tiba di halaman Bridge (Portfolio)
          animateCharsIn();
        }
        pages[currentPageIndex].classList.add("active");
        
        if (currentPageIndex === 0) {
          document.body.classList.add("is-visible");
        }

        for (let i = 0; i < totalPages; i++) {
          document.body.classList.remove(`on-page-${i}`);
        }
        document.body.classList.add(`on-page-${currentPageIndex}`);
        updateMobilePageNav();

        setTimeout(() => {
          pages[currentPageIndex].classList.remove("is-entering", "enter-from-forward", "enter-from-backward");
        }, 1250);
        isTransitioning = false;
      }, 1150);
    }, 500);
  }

  function updateMobilePageNav() {
    if (mobilePageIndicator) {
      mobilePageIndicator.textContent = `${String(currentPageIndex + 1).padStart(2, "0")} — ${pageNavTitles[currentPageIndex]}`;
    }

    mobilePageButtons.forEach((button) => {
      const direction = Number(button.dataset.mobileDirection);
      button.disabled =
        (direction < 0 && currentPageIndex === 0) ||
        (direction > 0 && currentPageIndex === totalPages - 1);
    });
  }

  pages[0].classList.add("active");
  document.body.classList.add("is-visible");
  document.body.classList.add("on-page-0");
  updateMobilePageNav();

  mobilePageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.mobileDirection);
      goToPage(currentPageIndex + direction);
    });
  });

  // --- LOGIKA SLIDER DESKTOP ---
  slider.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX - handleX;
    pageContainer.style.transition = "none";
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    pageContainer.style.transform = `translateX(${-currentPageIndex * 100}vw)`;
    const progress = handleX / (slider.offsetWidth - handle.offsetWidth);
    const closestPage = Math.round(progress * (totalPages - 1));
    goToPage(closestPage);
  });

  window.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const targetX = e.clientX - dragStartX;
      handleX = Math.max(
        0,
        Math.min(targetX, slider.offsetWidth - handle.offsetWidth)
      );
    }
  });

  // --- LOGIKA NAVIGASI LINK ---
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetIndex = parseInt(link.dataset.target, 10);
      goToPage(targetIndex);
    });
  });

  // --- EFEK PARALLAX DI HALAMAN ABOUT ---
  const aboutPage = document.querySelector("#about-page");
  if (aboutPage) {
    const profileRight = aboutPage.querySelector(".profile-right");
    const bgText = aboutPage.querySelector(".background-text");
    aboutPage.addEventListener("mousemove", (e) => {
      if (isDragging || currentPageIndex !== 1) return;
      const rect = aboutPage.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      if (profileRight)
        profileRight.style.transform = `rotateY(${-mouseX * 10}deg) rotateX(${
          mouseY * 10
        }deg)`;
      if (bgText)
        bgText.style.transform = `translateX(${-mouseX * 40}px) translateY(${
          -mouseY * 40
        }px)`;
    });
    aboutPage.addEventListener("mouseleave", () => {
      if (profileRight)
        profileRight.style.transform = `rotateY(0deg) rotateX(0deg)`;
      if (bgText) bgText.style.transform = `translateX(0px) translateY(0px)`;
    });
  }

  // ===== LOGIKA NAVIGASI KEYBOARD UNTUK DESKTOP =====
  window.addEventListener('keydown', (e) => {
    if (isTransitioning) return;
    if (e.key === 'ArrowRight') {
      goToPage(currentPageIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      goToPage(currentPageIndex - 1);
    }
  });

  // ===== LOGIKA NAVIGASI GESER UNTUK MOBILE =====
  function isMobile() {
    return window.innerWidth <= 768;
  }
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;
  pageContainer.addEventListener('touchstart', (e) => {
    if (!isMobile() || isDragging) return;
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  pageContainer.addEventListener('touchend', (e) => {
    if (!isMobile() || isDragging) return;
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  });
  function handleSwipe() {
    const distance = touchEndX - touchStartX;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      goToPage(currentPageIndex + 1);
    } else if (isRightSwipe) {
      goToPage(currentPageIndex - 1);
    }
  }

  // --- ANIMASI SLIDER ---
  function animateSlider() {
    if (!isDragging) {
      const force = (restingX - handleX) * springStiffness;
      velocityX = (velocityX + force) * friction;
      handleX += velocityX;
    }
    handle.style.transform = `translateX(${handleX}px) translateY(-50%)`;
    const progress = handleX / (slider.offsetWidth - handle.offsetWidth);
    if (isFinite(progress)) {
      const closestPage = Math.round(progress * (totalPages - 1));
      if (sliderLabel) sliderLabel.textContent = pageTitles[closestPage];
    }
    requestAnimationFrame(animateSlider);
  }
  animateSlider();

  // ===== LOGIKA PROJECT DETAIL MODAL OVERLAY =====
  const projectsData = {
    "1": {
      category: "PERSONAL BRANDING",
      status: "IN PROGRESS",
      title: "ADNA Portfolio Lab",
      desc: "A playful personal portfolio experiment built around horizontal navigation, editorial typography, and a deliberately imperfect visual personality.",
      tags: ["Vanilla JS", "CSS3 Animations", "UI/UX Design", "Responsive Layout"],
      highlights: [
        "Custom horizontal navigation with keyboard and touch gesture support.",
        "Interactive 3D tilt photo presentation using CSS perspective transforms.",
        "A session-cached loading animation that stays out of the way on return visits.",
        "Responsive layouts tuned for both desktop experiments and mobile swiping."
      ],
      liveUrl: "https://github.com/AIJS2/adna-portofolio",
      codeUrl: "https://github.com/AIJS2/adna-portofolio"
    },
    "2": {
      category: "INTERFACE EXPERIMENT",
      status: "CONCEPT",
      title: "Digital Playground",
      desc: "A concept space for testing modular layouts, visual systems, and interface ideas before they become too serious.",
      tags: ["Frontend", "Visual Systems", "Layout Experiments", "Interaction"],
      highlights: [
        "Small interface studies built with plain HTML, CSS, and JavaScript.",
        "Visual direction that prioritizes personality without losing hierarchy.",
        "A sandbox for testing layout rhythm, type pairings, and interaction patterns.",
        "Ideas stay intentionally lightweight so they are easy to reshape."
      ],
      liveUrl: null,
      codeUrl: null
    },
    "3": {
      category: "MOTION STUDY",
      status: "PLAYGROUND",
      title: "Interaction & Motion Lab",
      desc: "A collection of small experiments exploring gesture, spring physics, character reveals, and micro-interactions.",
      tags: ["Creative Code", "CSS Motion", "Gesture", "Micro-Interactions"],
      highlights: [
        "Spring-and-friction motion for a slider that feels responsive instead of rigid.",
        "Character-by-character reveal animations for small moments of surprise.",
        "Touch gesture listeners that make the horizontal layout usable on mobile.",
        "A lightweight playground for testing motion before polishing the details."
      ],
      liveUrl: null,
      codeUrl: null
    }
  };

  const projectModal = document.getElementById("project-modal");
  const modalCloseBtn = document.querySelector(".modal-close");
  const projectCards = document.querySelectorAll(".project-card");

  function openProjectModal(projectId) {
    const data = projectsData[projectId];
    if (!data || !projectModal) return;

    const numElem = document.getElementById("modal-project-num");
    if (numElem) numElem.textContent = projectId.padStart(2, '0');

    document.getElementById("modal-category").textContent = data.category;
    document.getElementById("modal-status").textContent = data.status;
    document.querySelector(".modal-visual-number").textContent = projectId.padStart(2, "0");
    document.getElementById("modal-rail-number").textContent = projectId.padStart(2, "0");
    document.querySelector(".modal-sheet").className = `modal-sheet modal-project-${projectId}`;
    document.getElementById("modal-title").textContent = data.title;
    document.getElementById("modal-desc").textContent = data.desc;
    document.getElementById("modal-state-copy").textContent =
      data.status === "IN PROGRESS"
        ? "An ongoing experiment."
        : data.status === "CONCEPT"
          ? "A place for ideas to breathe."
          : "A playground for motion studies.";
    
    const tagsContainer = document.getElementById("modal-tags");
    tagsContainer.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join("");

    const highlightsContainer = document.getElementById("modal-highlights");
    highlightsContainer.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join("");

    const liveBtn = document.getElementById("modal-live-link");
    const codeBtn = document.getElementById("modal-code-link");
    if (liveBtn) {
      liveBtn.href = data.liveUrl || "#";
      liveBtn.hidden = !data.liveUrl;
    }
    if (codeBtn) {
      codeBtn.href = data.codeUrl || "#";
      codeBtn.hidden = !data.codeUrl;
    }

    projectModal.classList.add("active");
  }

  function closeProjectModal() {
    if (projectModal) projectModal.classList.remove("active");
  }

  projectCards.forEach(card => {
    card.addEventListener("click", () => {
      const projectId = card.dataset.projectId;
      if (projectId) openProjectModal(projectId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeProjectModal);
  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProjectModal();
  });

  // ===== LOGIKA INTERACTIVE CONTACT CHOICE CHIPS & DYNAMIC MAILER =====
  const contactChips = document.querySelectorAll(".contact-chips .chip");
  const contactBtn = document.getElementById("contact-button");
  const formSubject = document.getElementById("form-subject");
  const formMessage = document.getElementById("form-message");
  let activeSubject = "Project Inquiry: UI/UX Design";

  contactChips.forEach(chip => {
    chip.addEventListener("click", () => {
      contactChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const subject = chip.dataset.subject;
      const label = chip.dataset.label;
      
      if (subject) {
        activeSubject = subject;
        if (formSubject) formSubject.value = subject;
      }
      if (contactBtn && label) {
        const span = contactBtn.querySelector("span");
        if (span) span.textContent = `I read your mind (${label})`;
        else contactBtn.textContent = `I read your mind (${label})`;
      }
      if (formMessage && label) {
        formMessage.placeholder = `Tell me about your ${label} project or thoughts...`;
      }
    });
  });

  if (contactBtn) {
    contactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const u = contactBtn.dataset.user || "aiziznor";
      const d = contactBtn.dataset.domain || "gmail.com";
      window.location.href = `mailto:${u}@${d}?subject=${encodeURIComponent(activeSubject)}`;
    });
  }

  // --- NETLIFY AJAX FORM SUBMISSION ---
  const contactForm = document.querySelector('.simple-form');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // 1. Validasi keberadaan script reCAPTCHA
      if (typeof grecaptcha === 'undefined') {
        if (errorMsg) {
          errorMsg.innerHTML = '<p>Gagal memuat sistem verifikasi keamanan. Silakan muat ulang (refresh) halaman.</p>';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // 2. Validasi token reCAPTCHA (wajib dicentang sebelum request dikirim)
      const recaptchaResponse = typeof grecaptcha.getResponse === 'function' ? grecaptcha.getResponse() : '';
      if (!recaptchaResponse || recaptchaResponse.trim() === '') {
        if (errorMsg) {
          errorMsg.innerHTML = "<p>Silakan centang 'Saya bukan robot' terlebih dahulu.</p>";
          errorMsg.style.display = 'block';
        }
        return;
      }

      // Bersihkan pesan error jika validasi lolos
      if (errorMsg) errorMsg.style.display = 'none';

      const submitBtn = contactForm.querySelector('.simple-submit');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>SENDING...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
      }

      const formData = new FormData(contactForm);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Submit failed with status: ${res.status}`);
        }
        contactForm.style.display = 'none';
        if (errorMsg) errorMsg.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      }).catch(err => {
        console.error('Contact form submission error:', err);
        if (errorMsg) {
          errorMsg.innerHTML = '<p>Maaf, pesan gagal terkirim. Silakan coba lagi atau kirim pesan langsung via email.</p>';
          errorMsg.style.display = 'block';
        }
        if (window.grecaptcha && typeof grecaptcha.reset === 'function') {
          grecaptcha.reset();
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      });
    });
  }

  // A small signature interaction for the playful portfolio identity.
  const logo = document.querySelector(".page .logo");
  let logoClickCount = 0;
  let logoClickTimeout;
  if (logo) {
    logo.addEventListener("click", () => {
      logoClickCount += 1;
      clearTimeout(logoClickTimeout);
      logoClickTimeout = setTimeout(() => {
        logoClickCount = 0;
      }, 1500);

      if (logoClickCount === 5) {
        logoClickCount = 0;
        document.body.classList.toggle("chaos-mode");
        logo.setAttribute(
          "aria-label",
          document.body.classList.contains("chaos-mode")
            ? "Turn off chaos mode"
            : "Turn on chaos mode"
        );
      }
    });
  }
});