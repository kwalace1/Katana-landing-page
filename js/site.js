(() => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const dropdown = document.querySelector(".nav-item--dropdown");

  const setTopBarHeight = () => {
    if (!header) return;
    document.documentElement.style.setProperty("--top-bar-height", `${header.offsetHeight}px`);
  };

  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    setTopBarHeight();
  };

  if (navToggle && header) {
    navToggle.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  if (dropdown) {
    const trigger = dropdown.querySelector(".nav-link");
    trigger?.addEventListener("click", (event) => {
      if (window.matchMedia("(max-width: 860px)").matches) {
        event.preventDefault();
        dropdown.classList.toggle("is-open");
      }
    });
  }

  const page = document.body.dataset.page || "";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const nav = link.dataset.nav;
    const productPages = ["products", "business", "veyah", "personal"];
    const isActive =
      nav === page ||
      (nav === "products" && productPages.includes(page));
    link.classList.toggle("is-active", Boolean(isActive));
    if (isActive) link.setAttribute("aria-current", "page");
  });

  const productSelect = document.getElementById("product");
  if (productSelect) {
    const wanted = new URLSearchParams(window.location.search).get("product");
    if (wanted && [...productSelect.options].some((option) => option.value === wanted)) {
      productSelect.value = wanted;
    }
  }

  const initReveal = () => {
    const els = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px 40px 0px" }
    );
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        obs.observe(el);
      }
    });
  };

  const setStatus = (el, message, type) => {
    if (!el) return;
    el.hidden = !message;
    el.textContent = message || "";
    el.classList.remove("is-success", "is-error");
    if (type) el.classList.add(type === "error" ? "is-error" : "is-success");
  };

  const waitlistForm = document.getElementById("join");
  if (waitlistForm) {
    const emailInput = document.getElementById("waitlist-email");
    const submit = document.getElementById("waitlist-submit");
    const status = document.getElementById("waitlist-status");
    waitlistForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailInput?.value.trim() || "";
      if (!email) {
        setStatus(status, "Please enter your email address.", "error");
        emailInput?.focus();
        return;
      }
      if (submit) submit.disabled = true;
      setStatus(status, "Submitting...", null);
      try {
        const product = waitlistForm.dataset.product || "business";
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, product }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
        setStatus(status, data.message || "You're on the list. We'll be in touch soon.", "success");
        if (emailInput) emailInput.value = "";
      } catch (error) {
        setStatus(status, error.message || "Something went wrong. Please try again.", "error");
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const status = document.getElementById("contact-status");
    const submit = document.getElementById("contact-submit");
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(contactForm);
      const payload = {
        name: String(form.get("name") || "").trim(),
        email: String(form.get("email") || "").trim(),
        company: String(form.get("company") || "").trim(),
        product: String(form.get("product") || "").trim(),
        message: String(form.get("message") || "").trim(),
        waitlist: form.get("waitlist") === "on",
      };
      if (!payload.name || !payload.email || !payload.message) {
        setStatus(status, "Please fill in your name, email, and message.", "error");
        return;
      }
      if (submit) submit.disabled = true;
      setStatus(status, "Sending...", null);
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
        setStatus(status, data.message || "Thanks — we'll be in touch shortly.", "success");
        contactForm.reset();
      } catch (error) {
        setStatus(status, error.message || "Something went wrong. Please try again.", "error");
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  const primeVideo = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("muted", "");
  };

  const tryPlayVideo = (video) => {
    primeVideo(video);
    const play = video.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  };

  const playVisibleAutoplayVideos = () => {
    document.querySelectorAll("video[autoplay]").forEach((video) => {
      if (video.closest(".feature-card-media")) return;
      tryPlayVideo(video);
    });
  };

  playVisibleAutoplayVideos();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) playVisibleAutoplayVideos();
  });
  window.addEventListener("pageshow", playVisibleAutoplayVideos);
  document.addEventListener("touchstart", playVisibleAutoplayVideos, { once: true, passive: true });
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) continue;
        if (video.closest(".feature-card-media")) continue;
        tryPlayVideo(video);
      }
    }, { threshold: 0.2 });
    document.querySelectorAll("video[autoplay]").forEach((video) => videoObserver.observe(video));
  }

  const featureTrack = document.querySelector(".feature-track");
  const featureSlides = featureTrack ? Array.from(featureTrack.querySelectorAll(".feature-card")) : [];
  const featureTabs = Array.from(document.querySelectorAll(".feature-tab"));
  const featurePrev = document.querySelector(".feature-nav-prev");
  const featureNext = document.querySelector(".feature-nav-next");
  const featureProgressBar = document.querySelector(".feature-progress__bar");
  let featureIndex = 0;
  let featureAutoTimerId = null;
  let featureAutoAbort = null;
  const FEATURE_IMAGE_AUTO_MS = 5000;

  const playFeatureVideo = (video) => {
    tryPlayVideo(video);
  };

  const stopFeatureAutoScroll = () => {
    if (featureAutoTimerId !== null) {
      window.clearTimeout(featureAutoTimerId);
      featureAutoTimerId = null;
    }
    if (featureAutoAbort) {
      featureAutoAbort.abort();
      featureAutoAbort = null;
    }
  };

  const getActiveFeatureVideo = () =>
    featureSlides[featureIndex]?.querySelector(".feature-card-media video") ?? null;

  const syncFeatureVideoPlayback = () => {
    featureSlides.forEach((slide, slideIndex) => {
      slide.querySelectorAll(".feature-card-media video").forEach((video) => {
        if (slideIndex === featureIndex) {
          video.currentTime = 0;
          playFeatureVideo(video);
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    });
  };

  const advanceFeatureCarousel = () => {
    stopFeatureAutoScroll();
    setActiveFeature(featureIndex + 1);
  };

  const scheduleFeatureAutoScroll = () => {
    stopFeatureAutoScroll();
    if (featureSlides.length <= 1) return;
    const video = getActiveFeatureVideo();
    if (video) {
      if (!(Number.isFinite(video.duration) && video.duration > 0)) {
        video.addEventListener("loadedmetadata", () => scheduleFeatureAutoScroll(), { once: true });
        return;
      }
      featureAutoAbort = new AbortController();
      video.addEventListener("ended", () => advanceFeatureCarousel(), {
        once: true,
        signal: featureAutoAbort.signal,
      });
      featureAutoTimerId = window.setTimeout(advanceFeatureCarousel, video.duration * 1000 + 500);
      return;
    }
    featureAutoTimerId = window.setTimeout(advanceFeatureCarousel, FEATURE_IMAGE_AUTO_MS);
  };

  const setActiveFeature = (index) => {
    if (!featureTrack || featureSlides.length === 0) return;
    featureIndex = ((index % featureSlides.length) + featureSlides.length) % featureSlides.length;
    featureTrack.style.transform = `translateX(-${featureIndex * 100}%)`;
    featureTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === featureIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    if (featureProgressBar) {
      featureProgressBar.style.width = `${((featureIndex + 1) / featureSlides.length) * 100}%`;
    }
    syncFeatureVideoPlayback();
    scheduleFeatureAutoScroll();
  };

  featureTabs.forEach((tab, index) => tab.addEventListener("click", () => setActiveFeature(index)));
  featurePrev?.addEventListener("click", () => setActiveFeature(featureIndex - 1));
  featureNext?.addEventListener("click", () => setActiveFeature(featureIndex + 1));
  if (featureTrack && featureSlides.length > 0) setActiveFeature(0);

  const enterVideoFullscreen = (video) => {
    if (typeof video.requestFullscreen === "function") {
      return video.requestFullscreen();
    }
    if (typeof video.webkitRequestFullscreen === "function") {
      return video.webkitRequestFullscreen();
    }
    if (typeof video.webkitEnterFullscreen === "function") {
      video.webkitEnterFullscreen();
    }
    return undefined;
  };

  document.querySelectorAll("[data-video-fullscreen]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const video = document.getElementById(trigger.dataset.videoFullscreen);
      if (!video) return;
      tryPlayVideo(video);
      const play = video.play();
      const goFullscreen = () => {
        const fullscreen = enterVideoFullscreen(video);
        if (fullscreen && typeof fullscreen.catch === "function") {
          fullscreen.catch(() => {});
        }
      };
      if (play && typeof play.then === "function") {
        play.then(goFullscreen).catch(goFullscreen);
        return;
      }
      goFullscreen();
    });
  });

  initReveal();
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", syncHeader);
})();
