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

  // Section reveals — fade + rise, never scale
  gsap.utils.toArray(".band .will-reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      }
    );
  });

  // Index rows + timeline items stagger in
  [".index-row", ".timeline-item", ".ph"].forEach((sel) => {
    gsap.utils.toArray(sel).forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: (i % 6) * 0.05,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });
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
