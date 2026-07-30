/* ============================================================
   CURSOR — accent dot + editorial label
   Desktop fine pointers only. Never replaces the native
   cursor; it annotates it.
   ============================================================ */

(function initCursor() {
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (!fine || typeof MOTION_OK === "undefined" || !MOTION_OK) return;

  const dot = document.getElementById("cursor-dot");
  const label = document.getElementById("cursor-label");
  if (!dot || !label) return;

  const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
  const labX = gsap.quickTo(label, "x", { duration: 0.35, ease: "power3.out" });
  const labY = gsap.quickTo(label, "y", { duration: 0.35, ease: "power3.out" });

  window.addEventListener(
    "pointermove",
    (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      labX(e.clientX);
      labY(e.clientY);
    },
    { passive: true }
  );

  // Label states from data-cursor attributes
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("pointerenter", () => {
      label.textContent = el.dataset.cursor;
      label.classList.add("is-on");
    });
    el.addEventListener("pointerleave", () => label.classList.remove("is-on"));
  });

  // Dot grows over links and buttons
  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("pointerenter", () => gsap.to(dot, { scale: 2.5, duration: 0.2 }));
    el.addEventListener("pointerleave", () => gsap.to(dot, { scale: 1, duration: 0.2 }));
  });
})();
