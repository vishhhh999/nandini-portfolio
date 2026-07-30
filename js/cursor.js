/* ============================================================
   CURSOR — white difference-blend circle + editorial label
   Desktop fine pointers only. The blend circle inverts what
   sits under it (x-ray effect) and expands over interactives.
   ============================================================ */

(function initCursor() {
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (!fine || typeof MOTION_OK === "undefined" || !MOTION_OK) return;

  const blend = document.getElementById("cursor-blend");
  const label = document.getElementById("cursor-label");
  if (!blend || !label) return;

  const bX = gsap.quickTo(blend, "x", { duration: 0.12, ease: "power3.out" });
  const bY = gsap.quickTo(blend, "y", { duration: 0.12, ease: "power3.out" });
  const lX = gsap.quickTo(label, "x", { duration: 0.35, ease: "power3.out" });
  const lY = gsap.quickTo(label, "y", { duration: 0.35, ease: "power3.out" });

  window.addEventListener(
    "pointermove",
    (e) => {
      bX(e.clientX);
      bY(e.clientY);
      lX(e.clientX);
      lY(e.clientY);
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

  // X-ray expand over interactive elements
  const grow = () => gsap.to(blend, { scale: 4.5, duration: 0.25, ease: "power3.out" });
  const shrink = () => gsap.to(blend, { scale: 1, duration: 0.25, ease: "power3.out" });
  document.querySelectorAll("a, button, [role='tab']").forEach((el) => {
    el.addEventListener("pointerenter", grow);
    el.addEventListener("pointerleave", shrink);
  });
})();
