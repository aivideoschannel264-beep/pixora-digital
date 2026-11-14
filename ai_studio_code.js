/* ==========================================================================
   PIXORA DIGITAL — INTERACTIVE ENGINE & ROUTING
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initAnimatedCanvas();
  initNavigationAndRouting();
  initPortfolioFilters();
  initCurrencyToggle();
  initUrbanThreadDemoModal();
  initInquiryForm();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});

/* 1. Animated Constellation Canvas Background */
function initAnimatedCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height, particles;
  const mouse = { x: null, y: null };

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(Math.floor((width * height) / 22000), 65);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      r: Math.random() * 1.8 + 0.8,
      color: Math.random() > 0.5 ? "rgba(168, 85, 247, 0.7)" : "rgba(34, 211, 238, 0.7)"
    }));
  };

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 135) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 135) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - mdist / 160) * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  };

  resize();
  draw();
}

/* 2. Multi-Page SPA Routing + Smooth Section Scroll */
function initNavigationAndRouting() {
  const pages = document.querySelectorAll(".page-view");
  const navLinks = document.querySelectorAll(".nav-link[data-route]");
  const mainNav = document.getElementById("main-nav");
  const mobileToggle = document.getElementById("mobile-toggle");

  const validRoutes = ["home", "about", "services", "portfolio"];

  function switchPage(route, scrollToTop = true) {
    if (!validRoutes.includes(route)) route = "home";

    pages.forEach((page) => {
      page.classList.toggle("active", page.dataset.page === route);
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.route === route);
    });

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Close mobile menu if open
    mainNav.classList.remove("open");
    mobileToggle.setAttribute("aria-expanded", "false");
  }

  // Handle route clicks
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const targetRoute = el.dataset.route;
      history.pushState(null, "", `#${targetRoute}`);
      switchPage(targetRoute);
    });
  });

  // Handle shared section smooth scroll (Pricing, Inquiry)
  document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const targetEl = document.getElementById(el.dataset.scroll);
      if (targetEl) {
        mainNav.classList.remove("open");
        mobileToggle.setAttribute("aria-expanded", "false");
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Mobile Menu Toggle
  mobileToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Hash navigation support
  const handleHash = () => {
    const hash = window.location.hash.replace("#", "");
    if (validRoutes.includes(hash)) {
      switchPage(hash, false);
    }
  };
  window.addEventListener("hashchange", handleHash);
  handleHash();
}

/* 3. Portfolio Category Filter */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });
}

/* 4. Pricing Currency Switcher (USD / PKR) & Plan Pre-fill */
function initCurrencyToggle() {
  const currBtns = document.querySelectorAll(".curr-btn");
  const priceVals = document.querySelectorAll(".price-val");

  currBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const currency = btn.dataset.currency;

      priceVals.forEach((el) => {
        el.textContent = currency === "PKR" ? el.dataset.pkr : el.dataset.usd;
      });
    });
  });

  // Pre-fill Inquiry Form when selecting a package or service
  document.querySelectorAll(".select-plan-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const budgetSelect = document.getElementById("project-budget");
      budgetSelect.value = btn.dataset.plan;
      document.getElementById("inquiry-section").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll(".service-select-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("project-service").value = btn.dataset.service;
      document.getElementById("inquiry-section").scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* 5. Interactive URBAN THREAD Demo Modal */
function initUrbanThreadDemoModal() {
  const modal = document.getElementById("urban-demo-modal");
  const closeBtn = document.getElementById("close-urban-demo");
  const openTriggers = document.querySelectorAll(".open-urban-demo");
  const lookTabs = document.querySelectorAll(".urban-tab");
  const inquireUrbanBtn = document.getElementById("inquire-like-urban");

  const looksData = {
    obsidian: {
      title: "OBSIDIAN UTILITY CAPSULE",
      desc: "Technical ripstop silhouettes engineered with architectural tailoring, reflective seams, and kinetic comfort. Designed as a flagship editorial showcase by Pixora Digital.",
      fabric: "3L Gore-Tex Matte",
      palette: "Carbon / Violet",
      badge: "LOOK 01",
      code: "UT-01 // SHELL JACKET",
      bg: "linear-gradient(145deg, #1b1033, #0b1b29)"
    },
    cyber: {
      title: "CYBER MIST TECH-FLEECE",
      desc: "Minimalist heavyweight jersey layered with iridescent cyan hardware and modular cargo geometry for urban nightscapes.",
      fabric: "480GSM French Terry",
      palette: "Slate / Electric Cyan",
      badge: "LOOK 02",
      code: "UT-02 // MODULAR HOODIE",
      bg: "linear-gradient(145deg, #072230, #161029)"
    },
    monolith: {
      title: "MONOLITH TAILORED SHELL",
      desc: "Structured oversized trench and pleated parachute trousers bringing Tokyo street silhouettes into an ultra-clean digital lookbook.",
      fabric: "Japanese Nylon Twill",
      palette: "Pitch Black / Chrome",
      badge: "LOOK 03",
      code: "UT-03 // FIELD TRENCH",
      bg: "linear-gradient(145deg, #171722, #090910)"
    }
  };

  const openModal = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openTriggers.forEach((btn) => btn.addEventListener("click", openModal));
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  lookTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      lookTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const data = looksData[tab.dataset.look];
      if (!data) return;

      document.getElementById("urban-look-title").textContent = data.title;
      document.getElementById("urban-look-desc").textContent = data.desc;
      document.getElementById("urban-spec-fabric").textContent = data.fabric;
      document.getElementById("urban-spec-palette").textContent = data.palette;
      document.getElementById("urban-look-badge").textContent = data.badge;
      document.getElementById("urban-garment-code").textContent = data.code;
      document.getElementById("urban-lookbook-card").style.background = data.bg;
    });
  });

  inquireUrbanBtn.addEventListener("click", () => {
    closeModal();
    document.getElementById("project-service").value = "Custom Business Website";
    document.getElementById("project-details").value =
      "I loved the Urban Thread editorial showcase and want a custom brand website with a similar aesthetic.";
    document.getElementById("inquiry-section").scrollIntoView({ behavior: "smooth" });
  });
}

/* 6. Customer Inquiry Form Validation & Submission */
function initInquiryForm() {
  const form = document.getElementById("inquiry-form");
  const feedback = document.getElementById("form-feedback");
  const submitBtn = document.getElementById("submit-inquiry-btn");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.className = "form-feedback";
    feedback.textContent = "";

    const name = document.getElementById("client-name").value.trim();
    const email = document.getElementById("client-email").value.trim();
    const service = document.getElementById("project-service").value;
    const details = document.getElementById("project-details").value.trim();

    if (!name || !email || !service || !details) {
      feedback.classList.add("error");
      feedback.textContent = "Please complete all required fields marked with *.";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      feedback.classList.add("error");
      feedback.textContent = "Please enter a valid work email address.";
      return;
    }

    // Simulate clean async agency submission
    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = "Sending Inquiry...";

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "Send Project Inquiry";
      feedback.classList.add("success");
      feedback.textContent = `Thank you, ${name}! Your inquiry for "${service}" has been received. Pixora Digital will reply within 24 hours.`;
      form.reset();
    }, 850);
  });
}