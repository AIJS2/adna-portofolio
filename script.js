// =======================================================
// ===== BAGIAN 1: LOGIKA LOADING SCREEN (TETAP SAMA) =====
// =======================================================
window.addEventListener("load", function () {
  // ... (kode loading screen kamu tidak berubah) ...
  const loaderWrapper = document.getElementById("loader-wrapper");
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
      }, index * 100);
    });
  }, 3200);
  setTimeout(() => {
    if (line) line.classList.remove("is-unfolded");
  }, 4200);
  setTimeout(() => {
    if (loaderWrapper) loaderWrapper.classList.add("is-exiting");
  }, 5000);
  setTimeout(() => {
    if (loaderWrapper) loaderWrapper.classList.add("hidden");
  }, 5800);
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
  const pageTitles = ["SLIDE TO EXPLORE", "ABOUT", "PORTFOLIO", "CONTACT"];
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
        "transform 1.3s cubic-bezier(0.7, 0, 0.3, 1)";
      pageContainer.style.transform = `translateX(${-targetIndex * 100}vw)`;

      setTimeout(() => {
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

        isTransitioning = false;
      }, 1300);
    }, 500);
  }

  pages[0].classList.add("active");
  document.body.classList.add("is-visible");
  document.body.classList.add("on-page-0");

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
});