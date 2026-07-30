# Nandini Bhattacharya — Portfolio

Single-page portfolio. Static site, no build step. Deploys as-is to Vercel.

## Direction statement

```
CORE IDEA:  Soft palette, hard cuts. A warm blush editorial identity
            that moves with cinematic precision.
SIGNATURE:  Polarity-flip rhythm — full-bleed blush sections cut to
            warm-ink sections as the depth and pacing system.
            No shadows, no glass. Contrast IS the drama.
REGISTER:   Warm, precise, kinetic.
ANTI:       No glassmorphism, no particle soup, no card-grid soup,
            no fabricated metrics.
```

## System rules (do not break these while iterating)

- **Accent `#2F5DA8` has one job:** interactive elements (links, buttons,
  active tab, focus rings, cursor dot). It never decorates.
- **Radius grammar is binary:** `0px` for frames and panels, pill for
  interactive elements. No in-between values.
- **No box-shadows anywhere.** Depth comes from the blush/ink polarity
  flips and hairline borders.
- **Type:** Clash Display (headlines only, weight 500/600) +
  Satoshi (everything else). Two families, fixed roles.
- All text colors are WCAG AA verified against their canvas.

## Stack

- Vanilla HTML/CSS/JS
- GSAP 3 + ScrollTrigger (CDN)
- Lenis smooth scroll (CDN, desktop fine-pointer only)
- Fonts via Fontshare (Clash Display, Satoshi)

## Motion policy

One switch (`MOTION_OK` in `js/main.js`) gates all physics:

| Condition | Result |
|---|---|
| `prefers-reduced-motion: reduce` | No loader, no Lenis, no cursor, no reveals. Full content, instant. |
| Coarse pointer / < 992px | No Lenis, no custom cursor. Reveals and counters stay. |
| Desktop, motion allowed | Everything: loader, Lenis, cursor labels, char reveals. |

## Run locally

```
npx serve .
```

Any static server works. Opening `index.html` directly also works.

## Deploy

Push to GitHub, import in Vercel, framework preset "Other", no build
command, output directory `/`. Done.

## TODO before launch (blocking)

1. Replace all `.ph` placeholder frames with real work
   (aspect ratios are already set per format: 4:5, 9:16, 1:1, 16:9).
2. Fill `.metric-slot` values with **verified** numbers only, with
   account context. Delete any metric Nandini can't back up.
3. Resume: real company names, fill or explain the 2018–2020 gap,
   reconcile "6 yrs" with the timeline.
4. Awards row: name the actual awards or delete the row.
5. Add `og:image` (1200×630) and a favicon.
6. Confirm `hello@nandinib.com` is a live inbox.
