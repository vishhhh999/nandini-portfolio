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
  gsap.set(".index-row, .timeline-item, .panel:not([hidden]) .ph", { opacity: 0, y: 20 });
  ScrollTrigger.batch(".index-row, .timeline-item, .panel:not([hidden]) .ph", {
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
