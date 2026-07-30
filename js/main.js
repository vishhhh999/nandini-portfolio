/* ============================================================
   MAIN — motion gate, Lenis, loader, nav, tabs
   ============================================================ */

// One switch decides whether the site runs its full physics.
// Coarse pointers and reduced-motion users get the honest,
// instant version of the same page.
const MOTION_OK =
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  typeof gsap !== "undefined";

const DESKTOP = window.matchMedia("(min-width: 992px) and (pointer: fine)").matches;

if (MOTION_OK) document.documentElement.classList.add("motion-ok");

/* ---- Lenis smooth scroll (desktop only) ------------------- */

let lenis = null;
if (MOTION_OK && DESKTOP && typeof Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", () => {
    if (window.ScrollTrigger) ScrollTrigger.update();
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links route through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64 });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

/* ---- Loader ----------------------------------------------- */

(function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  if (!MOTION_OK) {
    loader.remove();
    return;
  }

  // Split loader name into chars
  const nameEl = document.getElementById("loader-name");
  nameEl.innerHTML = nameEl.textContent
    .split("")
    .map((c) => `<span class="char">${c}</span>`)
    .join("");

  const countEl = document.getElementById("loader-count");
  const state = { n: 0 };
  document.body.style.overflow = "hidden";

  const tl = gsap.timeline({
    onComplete() {
      loader.classList.add("is-done");
      document.body.style.overflow = "";
      loader.remove();
      document.dispatchEvent(new CustomEvent("site:ready"));
    },
  });

  tl.to(nameEl.querySelectorAll(".char"), {
    y: 0,
    duration: 0.5,
    stagger: 0.04,
    ease: "power3.out",
  })
    .to(
      state,
      {
        n: 100,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate() {
          countEl.textContent = String(Math.round(state.n)).padStart(2, "0");
        },
      },
      "<"
    )
    .to(loader, {
      yPercent: -100,
      duration: 0.7,
      ease: "power4.inOut",
      delay: 0.15,
    });
})();

// No loader? Fire ready immediately so animations still bind.
if (!MOTION_OK) {
  document.addEventListener("DOMContentLoaded", () =>
    document.dispatchEvent(new CustomEvent("site:ready"))
  );
}

/* ---- Nav scroll + polarity state -------------------------- */

(function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---- Tabs (ARIA + arrow keys + GSAP crossfade) ------------ */

(function initTabs() {
  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));

  function select(tab, focus = true) {
    tabs.forEach((t, i) => {
      const active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
      const panel = panels[i];
      if (active) {
        panel.hidden = false;
        if (MOTION_OK) {
          gsap.fromTo(
            panel,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
          );
          gsap.fromTo(
            panel.querySelectorAll(".ph"),
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out", overwrite: true }
          );
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }
        if (panel.querySelector("#growth-chart")) {
          document.dispatchEvent(new CustomEvent("chart:draw"));
        }
      } else {
        panel.hidden = true;
      }
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(tab);
      let next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next);
      }
    });
  });
})();

/* ---- FAQ accordion ---------------------------------------- */

(function initFaq() {
  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      panel.classList.toggle("is-open", !open);
    });
  });
})();

/* ---- Contact form → pre-filled Gmail compose -------------- */

(function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const TO = "hello@nandinib.com"; // TODO: confirm this inbox

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    // Minimal validation with real feedback
    let bad = null;
    if (!name) bad = [form.name, "Add your name."];
    else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad = [form.email, "Add a valid email."];
    else if (!msg) bad = [form.message, "Add a message."];

    [form.name, form.email, form.message].forEach((f) => f.removeAttribute("aria-invalid"));
    if (bad) {
      bad[0].setAttribute("aria-invalid", "true");
      status.textContent = bad[1];
      bad[0].focus();
      return;
    }
    status.textContent = "";

    const su = encodeURIComponent(`Let's Connect — ${name}`);
    const body = encodeURIComponent(`Hey Nandini,\n\n${msg}\n\n— ${name}\n${email}`);
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO}&su=${su}&body=${body}`;

    // Gmail compose in a new tab; mailto fallback if blocked
    const win = window.open(gmail, "_blank", "noopener");
    if (!win) window.location.href = `mailto:${TO}?subject=${su}&body=${body}`;
  });
})();

/* ---- Back to top ------------------------------------------ */

(function initToTop() {
  const btn = document.getElementById("to-top");
  if (!btn) return;

  const onScroll = () =>
    btn.classList.toggle("is-visible", window.scrollY > window.innerHeight);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    const mark = document.querySelector(".nav-mark");
    if (mark) mark.focus();
  });
})();

/* ---- Ticker: duplicate track for a seamless loop ---------- */

(function initTicker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;
  track.innerHTML += track.innerHTML; // second copy; keyframes end at -50%
})();
