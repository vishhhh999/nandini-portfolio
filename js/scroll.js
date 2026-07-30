/* ============================================================
   SCROLL — nav polarity swap + placeholder growth chart
   ============================================================ */

/* ---- Nav flips with the band underneath it ---------------- */

(function initPolaritySwap() {
  const nav = document.getElementById("nav");
  const inkBands = document.querySelectorAll(".band--ink, .footer");
  if (!nav || !inkBands.length) return;

  if (typeof MOTION_OK !== "undefined" && MOTION_OK && window.ScrollTrigger) {
    inkBands.forEach((band) => {
      ScrollTrigger.create({
        trigger: band,
        start: "top 64px",
        end: "bottom 64px",
        onToggle(self) {
          nav.classList.toggle("on-ink", self.isActive);
        },
      });
    });
  } else {
    // No-motion fallback: IntersectionObserver, cheap and correct
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries.some((e) => e.isIntersecting);
        nav.classList.toggle("on-ink", active);
      },
      { rootMargin: "-64px 0px -85% 0px" }
    );
    inkBands.forEach((b) => observer.observe(b));
  }
})();

/* ---- Growth chart — placeholder spline, DPR aware --------- */
/* Decorative (aria-hidden). Redraws when its tab opens.       */

(function initChart() {
  const canvas = document.getElementById("growth-chart");
  if (!canvas) return;

  function draw() {
    const wrap = canvas.parentElement;
    if (!wrap || wrap.offsetWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.offsetWidth;
    const h = 240;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent-inv").trim() || "#9FBFF0";
    const lineCol = "rgba(242, 220, 219, 0.12)";

    // Grid hairlines
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Placeholder trajectory (shape only, no fake data claim)
    const pts = [0.82, 0.74, 0.78, 0.6, 0.52, 0.56, 0.38, 0.3, 0.34, 0.18].map(
      (v, i, arr) => [ (w / (arr.length - 1)) * i, v * h ]
    );

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2;
      const yc = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    ctx.stroke();

    // End point
    const [ex, ey] = pts[pts.length - 1];
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(ex, ey, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  document.addEventListener("chart:draw", draw);
  window.addEventListener("resize", draw, { passive: true });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", draw);
  } else {
    draw();
  }
})();
