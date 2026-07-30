/* ============================================================
   ANIMATIONS — hero entrance, scroll reveals, counters
   All gated behind MOTION_OK. Without motion, content is
   simply visible; counters render final values.
   ============================================================ */

(function initAnimations() {
  // Static fallback: print final stat values, done.
  if (typeof MOTION_OK === "undefined" || !MOTION_OK) {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("[data-count]").forEach((el) => {
        el.textContent = el.dataset.count + (el.dataset.suffix || "");
      });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Split hero name lines into chars (aria handled in HTML:
  // parent has aria-label, lines are aria-hidden).
  document.querySelectorAll(".hero-name .line").forEach((line) => {
    line.innerHTML = line.textContent
      .split("")
      .map((c) => `<span class="char" style="transform:translateY(110%)">${c}</span>`)
      .join("");
  });

  // Hero entrance — waits for the loader curtain
  document.addEventListener("site:ready", () => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(".hero-name .char", {
      y: 0,
      duration: 0.8,
      stagger: 0.025,
    }).to(
      ".hero .will-reveal",
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
      "-=0.4"
    );
    tl.eventCallback("onComplete", () =>
      document.dispatchEvent(new CustomEvent("hero:done"))
    );
  });

  // Section reveals — batched, fire once, then self-destruct.
  // One batch observer instead of one ScrollTrigger per element:
  // this is the difference between ~6 triggers and ~45.
  const revealBatch = (targets) =>
    gsap.fromTo(
      targets,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out", overwrite: true }
    );

  ScrollTrigger.batch(".band .will-reveal", {
    start: "top 85%",
    once: true,
    onEnter: revealBatch,
  });

  // Rows, timeline items and the initially-visible gallery.
  // Hidden tab panels are excluded: their frames animate when
  // the tab opens (see main.js), not via scroll triggers that
  // would compute positions for hidden elements.
  const BATCH = ".index-row, .timeline-item, .stack-tile, .faq-item, .panel:not([hidden]) .ph";
  gsap.set(BATCH, { opacity: 0, y: 20 });
  ScrollTrigger.batch(BATCH, {
    start: "top 90%",
    once: true,
    onEnter: revealBatch,
  });

  // Stat counters
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const state = { n: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter() {
        gsap.to(state, {
          n: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate() {
            el.textContent = Math.round(state.n) + suffix;
          },
        });
      },
    });
  });
})();

/* ---- Hero name: cursor-proximity lift --------------------- */
/* Chars near the pointer rise; the wave follows the hand.
   Desktop fine pointers only, armed after the entrance ends. */

(function initHeroProximity() {
  if (typeof MOTION_OK === "undefined" || !MOTION_OK) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const hero = document.getElementById("hero");
  const name = document.getElementById("hero-name");
  if (!hero || !name) return;

  let chars = [];
  let lifts = [];
  let centers = [];
  let armed = false;

  function measure() {
    chars = Array.from(name.querySelectorAll(".char"));
    lifts = chars.map((c) => gsap.quickTo(c, "y", { duration: 0.3, ease: "power3.out" }));
    centers = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  }

  document.addEventListener("hero:done", () => {
    measure();
    armed = true;
  });
  window.addEventListener("resize", () => armed && measure(), { passive: true });

  const SIGMA = 90;   // falloff radius in px
  const LIFT = -18;   // max rise in px

  hero.addEventListener(
    "pointermove",
    (e) => {
      if (!armed) return;
      for (let i = 0; i < chars.length; i++) {
        const dx = e.clientX - centers[i].x;
        const dy = e.clientY - centers[i].y;
        const d2 = dx * dx + dy * dy;
        lifts[i](LIFT * Math.exp(-d2 / (2 * SIGMA * SIGMA)));
      }
    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    if (!armed) return;
    lifts.forEach((l) => l(0));
  });
})();
