# Backgrounds, SVG animation, Canvas 2D, Lottie and Rive
> Load when: building any non-WebGL visual layer - hero/section backgrounds (mesh, aurora, grain, grids, beams), animated borders, SVG line drawing / morphing / filters / beams along paths, Canvas 2D particle or dot fields, confetti, or choosing and wiring Lottie / dotLottie / Rive.
> Stack assumptions: React 19 / Next 16 App Router + TS, Tailwind 4 optional (recipes are plain CSS so they drop into any stack). gsap 3.15 (all plugins free: DrawSVG, MorphSVG, MotionPath), @gsap/react 2.1, motion 13 (`motion/react`). WebGL/shader backgrounds live in `webgl-shaders-3d.md`; scroll choreography in `scroll-gsap.md` and `scroll-css-native.md`; palettes/surfaces in `color-surfaces.md`.

## Contents
- [Decision guide](#decision-guide)
- [Shared tokens](#shared-tokens)
- CSS backgrounds
  - [1. Layered radial mesh gradient](#1-layered-radial-mesh-gradient)
  - [2. Aurora blobs](#2-aurora-blobs)
  - [3. Grain noise overlay](#3-grain-noise-overlay)
  - [4. Dot grid and line grid with radial fade](#4-dot-grid-and-line-grid-with-radial-fade)
  - [5. Retro perspective grid](#5-retro-perspective-grid)
  - [6. Spotlight beams with conic-gradient](#6-spotlight-beams-with-conic-gradient)
  - [7. Animated conic border](#7-animated-conic-border)
  - [8. Border beam along the edge](#8-border-beam-along-the-edge)
  - [9. Shimmer sweep](#9-shimmer-sweep)
  - [10. Glass panel](#10-glass-panel)
  - [11. Noise gradient text](#11-noise-gradient-text)
  - [12. Morphing blob](#12-morphing-blob)
  - [13. Gradient banding fixes](#13-gradient-banding-fixes)
- SVG
  - [14. Stroke drawing](#14-stroke-drawing)
  - [15. Shape morphing](#15-shape-morphing)
  - [16. Gooey filter](#16-gooey-filter)
  - [17. Turbulence displacement](#17-turbulence-displacement)
  - [18. Mask and clip reveals](#18-mask-and-clip-reveals)
  - [19. Beams traveling along paths](#19-beams-traveling-along-paths)
  - [20. Objects along a curve with MotionPathPlugin](#20-objects-along-a-curve-with-motionpathplugin)
  - [21. Hand-drawn annotations](#21-hand-drawn-annotations)
  - [22. Animated icons](#22-animated-icons)
  - [23. Circuit pattern background](#23-circuit-pattern-background)
  - [24. Layered SVG waves](#24-layered-svg-waves)
- Canvas 2D
  - [25. useCanvas2D hook](#25-usecanvas2d-hook)
  - [26. Starfield and particle drift](#26-starfield-and-particle-drift)
  - [27. Constellation network](#27-constellation-network)
  - [28. Flickering grid](#28-flickering-grid)
  - [29. Interactive spring dot grid](#29-interactive-spring-dot-grid)
  - [30. Meteors](#30-meteors)
  - [31. Sparkles](#31-sparkles)
  - [32. Flow field](#32-flow-field)
  - [33. Click ripple](#33-click-ripple)
  - [34. Confetti](#34-confetti)
  - [35. Falling glyphs matrix](#35-falling-glyphs-matrix)
  - [36. OffscreenCanvas in a worker](#36-offscreencanvas-in-a-worker)
- Lottie, dotLottie, Rive
  - [Choosing: CSS/SVG vs Lottie vs Rive](#choosing-csssvg-vs-lottie-vs-rive)
  - [37. dotLottie player](#37-dotlottie-player)
  - [38. Scroll-synced Lottie](#38-scroll-synced-lottie)
  - [39. Rive with data binding](#39-rive-with-data-binding)
- [Background taste](#background-taste)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide
| Goal / feel | Technique | Cost (CSS / JS gz / GPU) | Recipe |
|---|---|---|---|
| Soft premium color field behind hero | Layered radial gradients, static | CSS only, 0 KB, one paint | [1](#1-layered-radial-mesh-gradient) |
| Color field that breathes | Aurora blobs moved by `transform` | CSS, compositor only | [2](#2-aurora-blobs) |
| "Print" texture, kills banding | feTurbulence data-URI tile on fixed pseudo | CSS, rasterized once | [3](#3-grain-noise-overlay) |
| Technical / dev-tool feel (Vercel, Linear) | Dot or line grid + radial mask | CSS, one paint | [4](#4-dot-grid-and-line-grid-with-radial-fade) |
| Synthwave, "launch", infinite road | rotateX plane + translate loop | CSS, compositor | [5](#5-retro-perspective-grid) |
| Stage light from top (Aceternity Lamp) | conic-gradient + mask | CSS | [6](#6-spotlight-beams-with-conic-gradient) |
| Rotating rainbow/brand border | `@property` angle + conic, padding-box/border-box | CSS, small repaint | [7](#7-animated-conic-border) |
| Comet of light running around a card | `offset-path: rect()` + ring mask | CSS | [8](#8-border-beam-along-the-edge) |
| Loading / "new" highlight | translateX sweep pseudo | CSS, compositor | [9](#9-shimmer-sweep) |
| Floating UI over color | `backdrop-filter` panel | CSS, expensive when backdrop animates | [10](#10-glass-panel) |
| Textured display word | background-clip text + noise | CSS | [11](#11-noise-gradient-text) |
| Organic lava-lamp shape | border-radius keyframes (or flubber) | CSS, repaint of one box | [12](#12-morphing-blob) |
| Line art that draws itself | `pathLength="1"` + dashoffset / DrawSVG | CSS or GSAP ~0 KB extra | [14](#14-stroke-drawing) |
| Icon/shape A becomes B | MorphSVG / flubber (17 KB) | JS | [15](#15-shape-morphing) |
| Liquid merge of blobs/menu items | Gooey SVG filter | CPU filter, keep area small | [16](#16-gooey-filter) |
| Water/heat wobble on image | feTurbulence + feDisplacementMap | Very expensive animated | [17](#17-turbulence-displacement) |
| Image reveal wipe / iris | clip-path inset / SVG mask | CSS or GSAP attr | [18](#18-mask-and-clip-reveals) |
| Integration diagram with data pulses (Magic UI Animated Beam) | measured path + dash comet | CSS + small React | [19](#19-beams-traveling-along-paths) |
| Object follows a curve / scroll route | MotionPathPlugin | GSAP | [20](#20-objects-along-a-curve-with-motionpathplugin) |
| Marker-pen emphasis on words | rough-notation (3 KB) | JS | [21](#21-hand-drawn-annotations) |
| Hamburger to X, check draw | SVG path transforms / pathLength | CSS / Motion | [22](#22-animated-icons) |
| Hardware / AI-infra texture | SVG pattern tile + dash pulses | CSS | [23](#23-circuit-pattern-background) |
| Section divider that moves | Periodic SVG path translated -50% | CSS, compositor | [24](#24-layered-svg-waves) |
| Hundreds of moving points | Canvas 2D + shared hook | JS 1-3 KB, main thread | [25](#25-usecanvas2d-hook)-[36](#36-offscreencanvas-in-a-worker) |
| Designer-authored illustration loop | dotLottie (JS 32 KB + WASM 484 KB gz) or lottie-web light (45 KB) | JS | [37](#37-dotlottie-player) |
| Interactive stateful illustration (toggles, characters) | Rive (canvas-lite WASM 351 KB gz, webgl2 885 KB gz) | JS + WASM | [39](#39-rive-with-data-binding) |
| Fluid/iridescent/silk/"shader" look (React Bits Aurora, Silk, Iridescence, Threads, Beams, Galaxy...) | WebGL | GPU | see `webgl-shaders-3d.md` |

Which popular library backgrounds are NOT WebGL (so they belong here): Magic UI Dot Pattern, Grid Pattern, Animated Grid Pattern, Flickering Grid (canvas 2D), Particles (canvas 2D), Meteors (CSS), Ripple (CSS), Border Beam (CSS offset-path), Shine Border (CSS mask), Animated Beam (SVG), Noise Texture (SVG); React Bits Dot Grid (canvas 2D + GSAP Inertia), Waves (canvas 2D + Perlin), ShapeGrid / former Squares (canvas 2D), Letter Glitch (canvas 2D), Grid Motion (GSAP DOM); Aceternity Aurora Background (CSS), Background Beams (SVG), Meteors (CSS), Wavy Background (canvas 2D + simplex-noise), Spotlight (SVG blur). WebGL ones (leave to `webgl-shaders-3d.md`): React Bits Aurora, Silk, Iridescence, Threads, Beams, Galaxy, Plasma, Liquid Chrome, Light Rays, Balatro, Dark Veil, Orb, Particles (OGL), Hyperspeed, Grainient, Soft Aurora; Magic UI Retro Grid now renders WebGL with a CSS fallback (because the CSS version aliases at the horizon), Magic UI Light Rays and Warp Background.

## Shared tokens
Every recipe below reads these. Put them once in `globals.css`.

```css
/* app/globals.css */
:root {
  --bg-dur-ambient: 40s;   /* ambient drift: 20-60s reads "alive", <12s reads "busy" */
  --bg-dur-loop: 6s;       /* beams, sweeps, border comets */
  --bg-dur-draw: 1.4s;     /* line drawing */
  --ease-drift: cubic-bezier(0.45, 0.05, 0.55, 0.95); /* sine in-out, for alternate loops */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
  --grain-opacity: 0.06;
}
@media (prefers-color-scheme: dark) {
  :root { --grain-opacity: 0.09; }
}
```

## Recipes

### 1. Layered radial mesh gradient
**Looks like:** 3-4 soft color pools bleeding into an off-white or near-black base, the "Stripe / Framer hero" color field without WebGL; optionally the pools drift slowly.  
**Use when / avoid when:** hero or CTA band that needs warmth without imagery. Avoid the default slop palette (violet + cyan + pink on #000); derive pools from the brand hue with 30-60 degree hue offsets and similar lightness. Keep it static unless motion carries meaning; a static mesh + grain already reads premium. True animated Stripe-style mesh is a shader, see `webgl-shaders-3d.md`.  
**Stack:** CSS (`@property` for drift)

```css
/* styles/mesh.css */
@property --mesh-x1 { syntax: "<percentage>"; inherits: false; initial-value: 18%; }
@property --mesh-y1 { syntax: "<percentage>"; inherits: false; initial-value: 22%; }
@property --mesh-x2 { syntax: "<percentage>"; inherits: false; initial-value: 82%; }
@property --mesh-y2 { syntax: "<percentage>"; inherits: false; initial-value: 18%; }
@property --mesh-x3 { syntax: "<percentage>"; inherits: false; initial-value: 55%; }
@property --mesh-y3 { syntax: "<percentage>"; inherits: false; initial-value: 92%; }

.mesh {
  --mesh-base: oklch(97% 0.012 250);
  --mesh-c1: oklch(78% 0.13 250);   /* brand hue */
  --mesh-c2: oklch(82% 0.11 205);   /* brand - 45deg */
  --mesh-c3: oklch(85% 0.09 300);   /* brand + 50deg, lower chroma */
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(in oklab 55% 60% at var(--mesh-x1) var(--mesh-y1), var(--mesh-c1), transparent 70%),
    radial-gradient(in oklab 45% 55% at var(--mesh-x2) var(--mesh-y2), var(--mesh-c2), transparent 70%),
    radial-gradient(in oklab 70% 55% at var(--mesh-x3) var(--mesh-y3), var(--mesh-c3), transparent 72%),
    var(--mesh-base);
}

/* Dark variant: pools must be darker and lower chroma or text contrast dies */
.mesh--dark {
  --mesh-base: oklch(16% 0.02 265);
  --mesh-c1: oklch(42% 0.12 265);
  --mesh-c2: oklch(38% 0.10 215);
  --mesh-c3: oklch(36% 0.09 320);
}

/* Optional drift: animates registered properties -> main-thread repaint each frame.
   Fine for one hero on desktop; pause offscreen (see Gotchas) */
@media (prefers-reduced-motion: no-preference) {
  .mesh--drift {
    animation: mesh-drift var(--bg-dur-ambient) var(--ease-drift) infinite alternate;
  }
}
@keyframes mesh-drift {
  50% { --mesh-x1: 32%; --mesh-y1: 38%; --mesh-x2: 70%; --mesh-y2: 30%; --mesh-x3: 45%; --mesh-y3: 80%; }
  100% { --mesh-x1: 22%; --mesh-y1: 12%; --mesh-x2: 88%; --mesh-y2: 36%; --mesh-x3: 62%; --mesh-y3: 96%; }
}
```

**Tune:** pool size 40-75% (smaller = more "blobby", larger = more haze); fade stop `transparent 65-75%`; chroma 0.08-0.14 in light mode, 0.08-0.12 at L 35-45% in dark mode; drift 30-60s, travel under 15 percentage points.  
**A11y/perf:** static by default; drift only under `no-preference`. Registered-property animation repaints the whole box every frame: never on a `position: fixed` full-page layer on mobile; prefer [2](#2-aurora-blobs) when you want motion. Add [3](#3-grain-noise-overlay) on top to kill banding.

### 2. Aurora blobs
**Looks like:** 3 large blurred color blobs slowly orbiting behind content, northern-lights haze.  
**Use when / avoid when:** landing heroes, auth screens, empty states. The classic slop version is violet/indigo/cyan at 80% opacity full-screen behind centered white text; use brand hues, 35-55% opacity, confine to the top 60vh, and fade out with a mask. Do NOT copy Aceternity's `AuroraBackground` as-is: it animates `background-position` of a layer with `filter: blur() invert()` and `mix-blend-mode: difference`, which repaints and re-filters a full-screen layer every frame.  
**Stack:** CSS (transform only)

```tsx
// components/fx/Aurora.tsx
import type { CSSProperties } from "react";

type AuroraProps = { colors?: [string, string, string]; className?: string };

export function Aurora({
  colors = ["oklch(70% 0.15 250)", "oklch(75% 0.13 190)", "oklch(72% 0.12 310)"],
  className = "",
}: AuroraProps) {
  return (
    <div className={`aurora ${className}`} aria-hidden="true">
      {colors.map((c, i) => (
        <span key={i} className={`aurora__blob aurora__blob--${i + 1}`} style={{ "--c": c } as CSSProperties} />
      ))}
    </div>
  );
}
```

```css
/* styles/aurora.css */
.aurora {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  contain: strict;              /* isolates layout/paint from the page */
  mask-image: linear-gradient(to bottom, #000 40%, transparent 95%);
}
.aurora__blob {
  position: absolute;
  width: 55vmax;
  aspect-ratio: 1;
  border-radius: 50%;
  /* closest-side falloff = soft edge WITHOUT filter: blur. Cheapest possible blob. */
  background: radial-gradient(closest-side, var(--c), transparent);
  opacity: 0.5;
  will-change: transform;
  animation: aurora-a var(--bg-dur-ambient) var(--ease-drift) infinite alternate;
}
.aurora__blob--1 { top: -25vmax; left: -10vmax; }
.aurora__blob--2 { top: -20vmax; right: -15vmax; animation-name: aurora-b; animation-duration: calc(var(--bg-dur-ambient) * 1.3); }
.aurora__blob--3 { top: 5vmax; left: 25vw; animation-name: aurora-c; animation-duration: calc(var(--bg-dur-ambient) * 0.8); }

@keyframes aurora-a { to { transform: translate3d(18vw, 10vh, 0) scale(1.15) rotate(20deg); } }
@keyframes aurora-b { to { transform: translate3d(-22vw, 14vh, 0) scale(0.9) rotate(-25deg); } }
@keyframes aurora-c { to { transform: translate3d(-10vw, -8vh, 0) scale(1.25); } }

@media (prefers-reduced-motion: reduce) {
  .aurora__blob { animation: none; }
}
/* Stronger haze: a STATIC blur is rasterized once and then only composited while transform animates.
   Never animate the blur radius. */
.aurora--hazy .aurora__blob { filter: blur(40px); }
```

**Tune:** blob size 40-70vmax; opacity 0.35-0.6 (light bg) / 0.25-0.45 (dark bg); duration 30-60s with the three blobs at different durations (x0.8, x1, x1.3) so the pattern never visibly repeats; translation 10-25vw.  
**A11y/perf:** transform-only = compositor thread, survives main-thread jank. 3 layers of 55vmax each costs GPU memory (~3 full-screen textures); on low-end Android drop to 2 blobs via `@media (max-width: 640px)`. Reduced motion freezes blobs in place (still pretty). No `mix-blend-mode` on these unless the container is small.

### 3. Grain noise overlay
**Looks like:** fine film/paper grain over the whole page; flat gradients suddenly look printed and expensive, banding disappears.  
**Use when / avoid when:** almost any gradient, glass or dark UI. Avoid visible "dirty" grain on data-dense product UI and on text-heavy docs; if you can see grain at arm's length, it is too strong.  
**Stack:** CSS (inline SVG `feTurbulence` as a data-URI background tile)

```css
/* styles/grain.css */
.grain::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: var(--grain-opacity);
  /* 256px tile, grayscale fractal noise. Encoded: < > as %3C %3E, # as %23, % as %25 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
}

/* Richer, more "analog" variant: blend instead of plain alpha.
   Blending a fixed full-viewport layer costs a composite of everything under it on scroll; use on desktop only. */
@media (pointer: fine) and (min-width: 1024px) {
  .grain--blend::after { mix-blend-mode: soft-light; opacity: calc(var(--grain-opacity) * 3); }
}

/* Animated film grain: jitter the tile with steps(). Only for cinematic / editorial directions. */
@media (prefers-reduced-motion: no-preference) {
  .grain--film::after {
    inset: -50%;
    animation: grain-jitter 0.9s steps(6) infinite;
  }
}
@keyframes grain-jitter {
  0% { transform: translate(0, 0); }
  20% { transform: translate(-8%, 5%); }
  40% { transform: translate(6%, -9%); }
  60% { transform: translate(-4%, 11%); }
  80% { transform: translate(9%, 3%); }
  100% { transform: translate(-2%, -6%); }
}
```

```tsx
// app/layout.tsx (excerpt) - apply once at the root
<body className="grain">{children}</body>
```

**Tune:** `baseFrequency` 0.65 (coarse, analog) to 0.9 (fine, digital); `numOctaves` 2-4 (more = no visible gain past 4); opacity 0.04-0.07 on light, 0.07-0.12 on dark with normal blend; with `soft-light` 0.15-0.3; tile 200-300px (smaller tiles show repetition).  
**A11y/perf:** the SVG filter is rasterized once into a tile, so static grain is effectively free. Never put `filter: url(#noise)` on a live element (re-runs turbulence every paint). Film jitter uses `steps()` on transform (compositor) and is disabled under reduced motion. Keep `pointer-events: none` or you will block every click.

### 4. Dot grid and line grid with radial fade
**Looks like:** hairline graph-paper grid or dot matrix that fades out radially from the top center (Vercel, Linear, Supabase, most dev-tool heroes).  
**Use when / avoid when:** developer tools, infra, AI products, docs heroes. It is a 2023-2025 cliche when combined with centered pill badge + gradient headline; make it bespoke by aligning the grid to your actual layout columns (cell = column width / N), highlighting a few cells that relate to content, or using it only inside one bento card.  
**Stack:** CSS

```css
/* styles/grid-bg.css */
.bg-lines,
.bg-dots {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  --grid-size: 48px;                                     /* use integers: fractional sizes shimmer */
  --grid-ink: color-mix(in oklab, currentColor 9%, transparent);
  mask-image: radial-gradient(ellipse 65% 55% at 50% 0%, #000 35%, transparent 100%);
}

.bg-lines {
  background-image:
    linear-gradient(to right, var(--grid-ink) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-ink) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
  background-position: calc(50% - 0.5px) -1px;          /* center a line on the page axis */
}

.bg-dots {
  --grid-size: 22px;
  /* 1px solid core + 0.5px antialias ring = crisp dot at DPR 1 and 2 */
  background-image: radial-gradient(circle, var(--grid-ink) 1px, transparent 1.5px);
  background-size: var(--grid-size) var(--grid-size);
  background-position: center top;
}

/* Variant: fade from center (for sections), and a denser "major line" every 4 cells */
.bg-lines--center { mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 100%); }
.bg-lines--major {
  background-image:
    linear-gradient(to right, color-mix(in oklab, currentColor 14%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, currentColor 14%, transparent) 1px, transparent 1px),
    linear-gradient(to right, var(--grid-ink) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-ink) 1px, transparent 1px);
  background-size:
    calc(var(--grid-size) * 4) calc(var(--grid-size) * 4),
    calc(var(--grid-size) * 4) calc(var(--grid-size) * 4),
    var(--grid-size) var(--grid-size),
    var(--grid-size) var(--grid-size);
}
```

**Tune:** line ink 6-12% of text color (above 14% it fights text); cell 32-64px lines, 16-28px dots; mask ellipse 50-75% wide, solid core 25-45%.  
**A11y/perf:** static, one paint. For a cursor-highlight cell, overlay a second copy of the grid in the accent color masked by `radial-gradient(160px at var(--mx) var(--my), #000, transparent)` and update `--mx/--my` on `pointermove` (pointer: fine only). For random cells lighting up, use [28](#28-flickering-grid) or Magic UI `AnimatedGridPattern` (SVG rects) rather than hundreds of animated DOM nodes.

### 5. Retro perspective grid
**Looks like:** neon grid floor receding to a horizon, scrolling toward the viewer (synthwave, Vercel Ship, launch pages).  
**Use when / avoid when:** launch events, gaming, music, "future" campaigns. Avoid for serious B2B; it screams template when paired with purple glow. Make it bespoke with a single brand color, a sun/logo at the horizon, and slow speed.  
**Stack:** CSS (translate loop, not background-position)

```tsx
// components/fx/RetroGrid.tsx
export function RetroGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`retro ${className}`} aria-hidden="true">
      <div className="retro__tilt">
        <div className="retro__floor" />
      </div>
      <div className="retro__horizon" />
    </div>
  );
}
```

```css
/* styles/retro-grid.css */
.retro {
  --retro-cell: 60px;
  --retro-angle: 65deg;
  --retro-line: oklch(75% 0.17 330 / 0.55);
  --retro-speed: 1.2s;                         /* time to travel ONE cell */
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  perspective: 200px;
  pointer-events: none;
}
.retro__tilt { position: absolute; inset: 0; transform: rotateX(var(--retro-angle)); }
.retro__floor {
  position: absolute;
  top: calc(var(--retro-cell) * -1);
  left: -200%;
  width: 500%;
  height: 300vh;
  transform-origin: 50% 0;
  background-image:
    linear-gradient(to right, var(--retro-line) 1px, transparent 0),
    linear-gradient(to bottom, var(--retro-line) 1px, transparent 0);
  background-size: var(--retro-cell) var(--retro-cell);
  will-change: transform;
}
@media (prefers-reduced-motion: no-preference) {
  /* Translating by exactly one cell loops seamlessly; animating background-position would repaint every frame */
  .retro__floor { animation: retro-run var(--retro-speed) linear infinite; }
}
@keyframes retro-run { to { transform: translate3d(0, var(--retro-cell), 0); } }

/* Fog at the horizon hides the moire/aliasing that dense far lines produce */
.retro__horizon {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--page-bg, #000) 0%, var(--page-bg, #000) 8%, transparent 45%);
}
```

**Tune:** angle 60-75deg (lower = floor fills more of the screen); perspective 150-300px; cell 40-80px; speed 0.8-2s per cell; line alpha 0.3-0.6.  
**A11y/perf:** compositor-only animation. CSS 3D grids alias badly near the horizon (Magic UI moved its Retro Grid to WebGL with this CSS as fallback for that reason); the horizon fog is mandatory. Reduced motion shows a still floor.

### 6. Spotlight beams with conic-gradient
**Looks like:** a cone of light falling from the top center onto the headline (Aceternity "Lamp"), optionally slowly sweeping; or multiple thin god-rays.  
**Use when / avoid when:** a single dramatic section intro, pricing reveal, dark product launch. Avoid stacking it with aurora + grid + particles (the 2024 AI-template trifecta).  
**Stack:** CSS (`@property` for sweep)

```css
/* styles/spotlight.css */
@property --beam-rot { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

.spotlight {
  --beam: oklch(85% 0.08 230);
  --beam-width: 36deg;                    /* cone opening */
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* conic 0deg points up, 180deg points down. Centered on 180 + rotation. */
  background: conic-gradient(
    from calc(180deg - var(--beam-width) / 2 + var(--beam-rot)) at 50% -8%,
    transparent 0deg,
    color-mix(in oklab, var(--beam) 38%, transparent) calc(var(--beam-width) * 0.5),
    transparent var(--beam-width)
  );
  mask-image: radial-gradient(ellipse 70% 75% at 50% 0%, #000 20%, transparent 80%);
}
@media (prefers-reduced-motion: no-preference) {
  .spotlight--sweep { animation: beam-sweep 14s var(--ease-drift) infinite alternate; }
}
@keyframes beam-sweep { from { --beam-rot: -10deg; } to { --beam-rot: 10deg; } }

/* God-rays: repeating conic from a point above the viewport */
.rays {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: repeating-conic-gradient(
    from 150deg at 50% -30%,
    color-mix(in oklab, var(--beam, white) 10%, transparent) 0deg 2deg,
    transparent 2deg 7deg
  );
  mask-image: linear-gradient(to bottom, #000, transparent 70%);
}
```

**Tune:** cone 24-50deg; peak alpha 25-45%; origin 5-15% above the box top so the apex is not visible; sweep +/-6-12deg over 10-20s.  
**A11y/perf:** sweep repaints one gradient (cheap). A static `filter: blur(12px)` on `.rays` softens aliasing of hard ray edges; do not animate it.

### 7. Animated conic border
**Looks like:** a card or button whose 1px border has a moving highlight or full rainbow rotating around it.  
**Use when / avoid when:** ONE featured element (recommended plan, primary CTA, "new" badge). Every card rotating = casino. Slow it down (4-8s) and keep 70% of the ring neutral.  
**Stack:** CSS (`@property <angle>`; three techniques, cheapest first)

```css
/* styles/conic-border.css */
@property --border-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

/* A) Two-background trick: no mask, no pseudo. Best default. */
.conic-card {
  --card-bg: oklch(18% 0.01 265);
  --ring-a: oklch(80% 0.15 250);
  --ring-b: oklch(85% 0.12 180);
  border: 1px solid transparent;
  border-radius: 16px;
  background:
    linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
    conic-gradient(from var(--border-angle),
      oklch(40% 0.02 265) 0deg 250deg,
      var(--ring-a) 290deg,
      var(--ring-b) 330deg,
      oklch(40% 0.02 265) 360deg) border-box;
}
@media (prefers-reduced-motion: no-preference) {
  .conic-card { animation: border-turn 6s linear infinite; }
}
@keyframes border-turn { to { --border-angle: 360deg; } }

/* B) Ring on a pseudo-element with mask-composite: works over transparent / glass cards */
.conic-ring { position: relative; border-radius: 16px; }
.conic-ring::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;                                   /* ring thickness */
  border-radius: inherit;
  background: conic-gradient(from var(--border-angle), transparent 0 70%, oklch(80% 0.15 250) 85%, transparent);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
  animation: border-turn 6s linear infinite;
}

/* C) Compositor-only: rotate an oversized conic square behind an inset surface (for big cards / low-end) */
.conic-spin { position: relative; overflow: hidden; border-radius: 16px; padding: 1px; isolation: isolate; }
.conic-spin::before {
  content: "";
  position: absolute;
  inset: -100%;                                   /* big enough to cover corners while rotating */
  z-index: -2;
  background: conic-gradient(transparent 0 75%, oklch(80% 0.15 250), transparent);
  animation: spin 6s linear infinite;
}
.conic-spin > .conic-spin__surface { border-radius: 15px; background: var(--card-bg, #111); height: 100%; }
@keyframes spin { to { transform: rotate(1turn); } }
@media (prefers-reduced-motion: reduce) {
  .conic-ring::before, .conic-spin::before { animation: none; }
}
```

**Tune:** duration 4-8s (below 3s feels like a loading spinner); highlight arc 15-30% of the circle; ring 1px (cards) to 2px (buttons).  
**A11y/perf:** A and B repaint a small box per frame (fine for a few elements). C is compositor-only but the rotating square is 9x the card area in GPU memory. `@property` is Baseline since July 2024; without it, the angle does not interpolate (border just sits still), which is an acceptable fallback. `mask-composite` unprefixed: Chrome 120, Firefox 53, Safari 15.4.

### 8. Border beam along the edge
**Looks like:** a short comet of light running around the rounded border of a card (Magic UI Border Beam), following corners exactly.  
**Use when / avoid when:** a single hero screenshot frame or featured card. It is overused on every Magic UI template card; one per page max.  
**Stack:** CSS (`offset-path: rect()`: Chrome 116, Firefox 122, Safari 18)

```tsx
// components/fx/BorderBeam.tsx
import type { CSSProperties } from "react";

type BorderBeamProps = { size?: number; duration?: number; from?: string; to?: string; width?: number };

export function BorderBeam({ size = 80, duration = 6, from = "oklch(80% 0.16 60)", to = "oklch(70% 0.2 300)", width = 1 }: BorderBeamProps) {
  return (
    <span
      aria-hidden="true"
      className="border-beam"
      style={{ "--beam-size": `${size}px`, "--beam-dur": `${duration}s`, "--beam-from": from, "--beam-to": to, "--beam-w": `${width}px` } as CSSProperties}
    >
      <span className="border-beam__comet" />
    </span>
  );
}
```

```css
/* styles/border-beam.css - parent needs position: relative and a border-radius */
.border-beam {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--beam-w);
  pointer-events: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);  /* show only the ring */
}
.border-beam__comet {
  position: absolute;
  width: var(--beam-size);
  aspect-ratio: 1;
  /* offset-rotate defaults to auto: the square turns with the path, so "to left" is always the tail */
  background: linear-gradient(to left, var(--beam-from), var(--beam-to), transparent);
  offset-path: rect(0 auto auto 0 round var(--beam-size));
  animation: beam-travel var(--beam-dur) linear infinite;
}
@keyframes beam-travel { from { offset-distance: 0%; } to { offset-distance: 100%; } }

@supports not (offset-path: rect(0 auto auto 0)) {
  .border-beam { display: none; }               /* fall back to a static border or recipe 7 */
}
@media (prefers-reduced-motion: reduce) {
  .border-beam__comet { animation: none; offset-distance: 12%; opacity: 0.6; }
}
```

**Tune:** comet size 50-120px; duration 5-10s; ring width 1-1.5px; two beams with opposite direction via `animation-direction: reverse` and `animation-delay: calc(var(--beam-dur) / -2)` for symmetry.  
**A11y/perf:** a small element moving; negligible cost. The rect() round value should roughly equal the card radius or the comet cuts corners.

### 9. Shimmer sweep
**Looks like:** a diagonal band of light passing across a button, badge, skeleton, or text every few seconds.  
**Use when / avoid when:** skeleton loaders, one "new" badge, one CTA. Constant shimmer on multiple elements feels like an ad banner; use a long pause between sweeps.  
**Stack:** CSS

```css
/* styles/shimmer.css */
.shimmer { position: relative; overflow: hidden; isolation: isolate; }
.shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.28) 50%, transparent 70%);
  transform: translateX(-120%);
  pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
  /* 60% of the cycle is the sweep, 40% is rest: reads as a glint, not a strobe */
  .shimmer::after { animation: shimmer-sweep 3.2s var(--ease-in-out-cubic) infinite; }
}
@keyframes shimmer-sweep { 60%, 100% { transform: translateX(120%); } }

/* Text variant (Magic UI Animated Shiny Text): moves background-position = repaint of the text box, fine for one line */
.shiny-text {
  --shiny-w: 120px;
  --shiny-base: color-mix(in oklab, currentColor 55%, transparent);  /* dimmed text */
  --shiny-hi: currentColor;                                          /* full-strength glint */
  background: linear-gradient(110deg,
    var(--shiny-base) calc(50% - var(--shiny-w) / 2),
    var(--shiny-hi) 50%,
    var(--shiny-base) calc(50% + var(--shiny-w) / 2)) no-repeat;
  background-size: 250% 100%;
  background-position: 100% 0;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
@media (prefers-reduced-motion: no-preference) {
  .shiny-text { animation: shiny-move 4s linear infinite; }
}
@keyframes shiny-move { from { background-position: 100% 0; } to { background-position: 0% 0; } }
```

**Tune:** band angle 100-115deg; highlight alpha 0.15-0.35 (dark UI can go higher); sweep 0.8-1.4s of a 3-6s cycle.  
**A11y/perf:** the pseudo sweep is compositor-only. Skeleton shimmer should stop the moment data arrives (remove the class) and under reduced motion fall back to a static tint.

### 10. Glass panel
**Looks like:** translucent frosted panel with a crisp 1px top highlight floating over a colorful background (visionOS, macOS sidebars, Linear dialogs).  
**Use when / avoid when:** nav bars, floating toolbars, modals over rich imagery. Glass over a flat white page is just gray. Glass everywhere is the 2021 Dribbble cliche; use it for 1-2 layers of hierarchy.  
**Stack:** CSS

```css
/* styles/glass.css */
.glass {
  --glass-tint: oklch(98% 0.01 250 / 0.55);   /* dark mode: oklch(22% 0.02 265 / 0.55) */
  --glass-edge: rgb(255 255 255 / 0.18);
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"),
    var(--glass-tint);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid var(--glass-edge);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 0 rgb(255 255 255 / 0.25),      /* top specular edge */
    0 1px 2px rgb(0 0 0 / 0.08),
    0 12px 32px -12px rgb(0 0 0 / 0.35);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { --glass-tint: oklch(98% 0.01 250 / 0.92); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass { --glass-tint: oklch(98% 0.01 250 / 0.96); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
```

**Tune:** blur 12-24px (above 30px just looks gray); `saturate(140-180%)` keeps colors behind lively; tint alpha 0.45-0.7; edge alpha 0.1-0.25.  
**A11y/perf:** backdrop-filter recomputes whenever pixels behind change: glass over an animated aurora or video blurs every frame; keep panels small and few, never on long scrolling lists on mobile. Check text contrast against the brightest possible backdrop, not the average. `prefers-reduced-transparency` support is Chromium-only as of 2026; treat it as a bonus.

### 11. Noise gradient text
**Looks like:** big display word filled with a gradient that has visible grain, like a risograph print.  
**Use when / avoid when:** one display headline or big numeral. Not for body or UI text.  
**Stack:** CSS

```css
/* styles/grain-text.css */
.grain-text {
  color: oklch(60% 0.15 30);                                    /* fallback + a11y color */
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
    linear-gradient(in oklch 120deg, oklch(70% 0.19 35), oklch(62% 0.2 350) 55%, oklch(55% 0.16 290));
  background-size: 180px 180px, 100% 100%;
  background-blend-mode: overlay, normal;                        /* grain modulates the gradient */
}
@supports (background-clip: text) or (-webkit-background-clip: text) {
  .grain-text {
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
```

**Tune:** overlay (strong) vs soft-light (subtle); frequency 0.6-0.9; gradient hue span under 90deg for taste.  
**A11y/perf:** static; contrast must be checked on the darkest AND lightest gradient stop. Selection color disappears with transparent fill: add `::selection { -webkit-text-fill-color: currentColor; }` if needed.

### 12. Morphing blob
**Looks like:** a gradient shape slowly wobbling between organic forms, lava-lamp style.  
**Use when / avoid when:** avatar frames, playful brands, a single accent behind a portrait. Three blobs everywhere = 2019 template.  
**Stack:** CSS (border-radius morph); for true path morphing see [15](#15-shape-morphing)

```css
/* styles/blob.css */
.blob {
  width: min(28rem, 70vw);
  aspect-ratio: 1;
  background: linear-gradient(in oklch 135deg, oklch(78% 0.14 150), oklch(70% 0.15 230));
  border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
}
@media (prefers-reduced-motion: no-preference) {
  .blob {
    /* border-radius repaints (small box: fine); rotate is compositor and hides the loop */
    animation:
      blob-morph 16s var(--ease-drift) infinite alternate,
      blob-turn 48s linear infinite;
  }
}
@keyframes blob-morph {
  33% { border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%; }
  66% { border-radius: 28% 72% 44% 56% / 49% 40% 60% 51%; }
  100% { border-radius: 55% 45% 35% 65% / 62% 38% 62% 38%; }
}
@keyframes blob-turn { to { rotate: 1turn; } }
```

**Tune:** keep each corner pair summing to 100% on each axis for smooth shapes; 12-20s morph; never faster than 8s.  
**A11y/perf:** repaint of one element per frame; do not use on a full-bleed element. Generate shapes with fffuel "blobby" or Haikei if you need exact SVG paths.

### 13. Gradient banding fixes
**Looks like:** the fix for visible stair-step rings in long, low-contrast gradients (dark hero glows are the worst offender).  
**Use when / avoid when:** any gradient spanning more than ~400px with a lightness change under ~10%; any dark "glow" section.  
**Stack:** CSS

```css
/* styles/banding.css */
.glow-hero {
  background:
    /* 1. Dither layer: noise at 3-5% breaks 8-bit steps into invisible grain */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E"),
    /* 2. Perceptual interpolation: no gray/dead mid-zone, smoother lightness ramp */
    radial-gradient(in oklab 90% 70% at 50% -10%, oklch(38% 0.09 265), oklch(16% 0.02 265) 70%);
  background-size: 128px 128px, auto;
}

/* 3. Hue-walk for vivid two-color gradients (Josh Comeau's "gray dead zone" fix) */
.vivid { background: linear-gradient(to right, #facc15, #3b82f6); }
@supports (background: linear-gradient(in oklch, red, blue)) {
  .vivid { background: linear-gradient(to right in oklch, #facc15, #3b82f6); }
}
```

**Tune:** dither opacity 0.03-0.06 (lower on light backgrounds); widen the lightness range or shorten the gradient if bands persist; `in oklab` for neutral ramps, `in oklch` (optionally `longer hue`) for rainbow walks.  
**A11y/perf:** static. Gradient color-space interpolation: Chrome 111, Safari 16.2, Firefox 127 (Baseline 2024). Blurring a banded gradient with `filter: blur()` does not remove banding; noise does.

### 14. Stroke drawing
**Looks like:** an outline, signature, route or underline drawing itself from start to end; on scroll it can track progress exactly (the long squiggle that runs down a page).  
**Use when / avoid when:** diagrams, logos, hand-drawn accents, timelines. Avoid drawing every icon on a page; one drawn element per viewport is the ceiling.  
**Stack:** CSS | CSS scroll-driven | GSAP DrawSVG

```html
<!-- pathLength="1" normalizes the length: dasharray/dashoffset become 0..1 regardless of real length -->
<svg class="draw" viewBox="0 0 240 60" fill="none" aria-hidden="true">
  <path pathLength="1" d="M4 40 C 40 8, 80 8, 110 34 S 180 58, 236 18" />
</svg>
```

```css
/* styles/draw.css */
.draw path {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

/* A) Play once when a class is added (IntersectionObserver or on mount) */
@media (prefers-reduced-motion: no-preference) {
  .draw path { stroke-dasharray: 1; stroke-dashoffset: 1; }
  .draw.is-in path { animation: draw-in var(--bg-dur-draw) var(--ease-in-out-cubic) forwards; }
}
/* the opacity step hides the round-cap dot that shows at the path start while offset = 1 */
@keyframes draw-in {
  0% { stroke-dashoffset: 1; opacity: 0; }
  2% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

/* B) Scroll-driven: drawn by the element's own visibility. Chrome 115+, Safari 26+, Firefox behind a flag
   (not Baseline in 2026). Unsupported browsers see the finished line, a safe default. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .draw--scroll path {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation: draw-scroll linear both;
      animation-timeline: view();
      animation-range: entry 20% cover 55%;
    }
  }
}
@keyframes draw-scroll { to { stroke-dashoffset: 0; } }
```

```tsx
// components/fx/DrawOnView.tsx - GSAP version: stagger, scrub, partial segments, "live" lengths
"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger);

type Props = { children: ReactNode; scrub?: boolean; className?: string };

/** Mark paths/lines/polylines inside children with data-draw. */
export function DrawOnView({ children, scrub = false, className }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-draw]",
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration: 1.4,
            ease: "power2.inOut",
            stagger: 0.12,
            scrollTrigger: scrub
              ? { trigger: root.current, start: "top 80%", end: "bottom 40%", scrub: 0.6 }
              : { trigger: root.current, start: "top 75%", once: true },
          },
        );
      });
      // reduced motion: nothing runs, the SVG simply stays fully drawn
    },
    { scope: root, dependencies: [scrub] },
  );

  return <div ref={root} className={className}>{children}</div>;
}
```

**Tune:** duration 0.9-1.8s for logos, 2-3s for long routes; `power2.inOut` or `--ease-in-out-cubic` (linear looks mechanical); stagger 0.08-0.15s; scrub 0.4-1. DrawSVG extras: `drawSVG: "40% 60%"` draws a middle segment, tween to `"100% 100%"` to make the line "leave"; append `live` (`"0% 100% live"`) if the path resizes mid-tween; `DrawSVGPlugin.getLength(el)` for manual math.  
**A11y/perf:** dashoffset animation repaints only the SVG (cheap). Reduced motion keeps the finished drawing. DrawSVG caveats from the docs: a stroke must be set; Firefox may stop 1-2% short (use `"102%"`); iOS Safari draws `<rect>` strokes wrong (convert to `<path>`); cannot reach inside `<use>`; multi-segment paths draw oddly, split them. Above the fold, prefer the CSS version: GSAP's `from` state applies after hydration, so SSR HTML flashes the finished line first.

### 15. Shape morphing
**Looks like:** one SVG shape fluidly becomes another: play to pause, logo mark to wordmark, a blob cycling through organic forms.  
**Use when / avoid when:** state changes (icons), brand moments, hero blob. Morphing shapes with very different topology without tuning gives melted-plastic mid-frames.  
**Stack:** GSAP MorphSVG (best quality, free since 3.13) | flubber 0.4 (17 KB gz) + Motion for React-driven loops

```tsx
// components/fx/PlayPauseMorph.tsx
"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, MorphSVGPlugin);

const PLAY = "M8 5v14l11-7z";
const PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z";

export function PlayPauseMorph({ onToggle }: { onToggle?: (playing: boolean) => void }) {
  const [playing, setPlaying] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const { contextSafe } = useGSAP();

  const toggle = contextSafe(() => {
    const next = !playing;
    setPlaying(next);
    onToggle?.(next);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(pathRef.current, {
      morphSVG: { shape: next ? PAUSE : PLAY, map: "complexity" },
      duration: reduce ? 0 : 0.35,
      ease: "power2.inOut",
    });
  });

  return (
    <button type="button" aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} onClick={toggle}>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        {/* the d prop never changes, so React never overwrites GSAP's morphed value */}
        <path ref={pathRef} d={PLAY} fill="currentColor" />
      </svg>
    </button>
  );
}
```

Types: prefer `npm i -D @types/flubber` (exists on npm, checked 2026-09-27). Only if you cannot add it, declare the module yourself (never both, the declarations collide):
```ts
// types/flubber.d.ts
declare module "flubber" {
  type Shape = string | [number, number][];
  export function interpolate(
    from: Shape,
    to: Shape,
    options?: { maxSegmentLength?: number | false; string?: boolean },
  ): (t: number) => string;
}
```

```tsx
// components/fx/MorphLoop.tsx - cycles through N closed paths: eased morph, then hold
"use client";
import { useEffect, useMemo } from "react";
import { interpolate } from "flubber";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

type Props = { shapes: string[]; hold?: number; morph?: number; className?: string };

export function MorphLoop({ shapes, hold = 2.2, morph = 0.9, className }: Props) {
  const progress = useMotionValue(0);
  const reduce = useReducedMotion();
  const steps = useMemo(
    () => shapes.map((s, i) => interpolate(s, shapes[(i + 1) % shapes.length], { maxSegmentLength: 4 })),
    [shapes],
  );
  const d = useTransform(progress, (v) => {
    const i = Math.floor(v) % shapes.length;
    return steps[i](v - Math.floor(v));
  });

  useEffect(() => {
    if (reduce || shapes.length < 2) return;
    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;
    const wait = (s: number) => new Promise((r) => setTimeout(r, s * 1000));
    (async () => {
      let i = 0;
      while (!cancelled) {
        await wait(hold);
        if (cancelled) break;
        controls = animate(progress, i + 1, { duration: morph, ease: [0.65, 0, 0.35, 1] });
        await controls;
        i = (i + 1) % shapes.length;
        progress.set(i); // wrap: end of the last step equals shape 0, so no visible jump
      }
    })();
    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [reduce, shapes.length, hold, morph, progress]);

  return <motion.path d={d} className={className} />;
}

// Usage: it returns a bare <path>, so render it INSIDE an <svg> (outside one, React warns
// "The tag <path> is unrecognized" and nothing draws). All shapes share the svg's viewBox.
// <svg viewBox="0 0 100 100" className="size-40 text-orange-500" aria-hidden="true">
//   <MorphLoop className="fill-current" shapes={["M10 10 H90 V90 H10 Z", "M50 5 L95 90 H5 Z"]} />
// </svg>
```

**Tune:** MorphSVG `type: "rotational"` for organic shapes that twist badly in linear mode; `shapeIndex: "log"` once to find the best start point, then hard-code the number (skips runtime calculation); `map: "complexity"` for multi-subpath icons; `smooth: "auto"` adds points to low-poly shapes. flubber `maxSegmentLength` 2-6 (lower = smoother, slower). Morph 0.3-0.5s for icons, 0.8-1.4s for blobs.  
**A11y/perf:** path `d` interpolation repaints one path per frame (cheap under ~500 points; for heavy morphs MorphSVG can `render` to canvas). Reduced motion: icons swap instantly (duration 0), loops stay on the first shape. Convert `<circle>/<rect>` first with `MorphSVGPlugin.convertToPath()`. CSS `d: path()` transitions only interpolate when both paths have identical command lists and are not reliable across engines; use JS.

### 16. Gooey filter
**Looks like:** separate circles melt into each other like mercury when close (Lucas Bebber's Codrops "Creative Gooey Effects").  
**Use when / avoid when:** a FAB menu that spills items, pagination dots, a playful loader, cursor blobs. Never on text (it eats letterforms) or large areas.  
**Stack:** SVG filter + CSS transforms

```tsx
// components/fx/GooeyMenu.tsx
"use client";
import { useState, type CSSProperties } from "react";

type Item = { label: string; icon: string; href: string };

export function GooeyMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="goo-menu" data-open={open} aria-label="Quick actions">
      {/* filter region extended so blurred blobs are not clipped */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="goo" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <div className="goo-menu__blobs" aria-hidden="true">
        <span className="goo-menu__blob" />
        {items.map((it, i) => (
          <span key={it.href} className="goo-menu__blob goo-menu__blob--child" style={{ "--i": i + 1 } as CSSProperties} />
        ))}
      </div>
      {/* real, unfiltered, accessible controls sit on top of the blobs */}
      <button type="button" className="goo-menu__toggle" aria-expanded={open} aria-label={open ? "Close actions" : "Open actions"} onClick={() => setOpen((o) => !o)}>
        +
      </button>
      {items.map((it, i) => (
        <a key={it.href} href={it.href} className="goo-menu__item" style={{ "--i": i + 1 } as CSSProperties} inert={!open} aria-label={it.label}>
          <span aria-hidden="true">{it.icon}</span>
        </a>
      ))}
    </nav>
  );
}
```

```css
/* styles/goo-menu.css */
.goo-menu { --size: 56px; --gap: 68px; position: fixed; right: 24px; bottom: 24px; width: var(--size); height: var(--size); }
/* the filtered box is padded upward so the spilled blobs stay inside the filter region */
.goo-menu__blobs { position: absolute; inset: calc(var(--gap) * -3.5) -20px -20px -20px; filter: url(#goo); pointer-events: none; }
.goo-menu__blob,
.goo-menu__item,
.goo-menu__toggle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  transition: transform 0.5s var(--ease-out-expo), opacity 0.3s linear;
}
.goo-menu__blob { right: 20px; bottom: 20px; background: oklch(62% 0.2 265); }
.goo-menu__item,
.goo-menu__toggle { right: 0; bottom: 0; display: grid; place-items: center; color: white; background: transparent; border: 0; font-size: 1.25rem; }
.goo-menu__item { opacity: 0; pointer-events: none; }
.goo-menu[data-open="true"] .goo-menu__blob--child,
.goo-menu[data-open="true"] .goo-menu__item { transform: translateY(calc(var(--i) * var(--gap) * -1)); }
.goo-menu[data-open="true"] .goo-menu__item { opacity: 1; pointer-events: auto; transition-delay: calc(var(--i) * 40ms); }
@media (prefers-reduced-motion: reduce) {
  .goo-menu__blob, .goo-menu__item { transition-duration: 0.01ms; }
}
```

**Tune:** `stdDeviation` 8-12 (larger = more merge distance); matrix alpha row `0 0 0 18..22 -7..-10` (multiplier sharpens the edge, offset erodes it); blob spacing 60-80px so they separate fully at rest.  
**A11y/perf:** the filter re-rasterizes its whole region every frame while anything inside moves: keep the filtered box under ~300x300px. Links and buttons live outside the filter so focus rings and glyphs stay crisp. Safari runs SVG filters on HTML on the CPU: test there first.

### 17. Turbulence displacement
**Looks like:** an image or word wobbles as if seen through water or heat haze; on hover a ripple washes through.  
**Use when / avoid when:** short hover moments on one image, a glitchy transition. Continuous full-screen liquid belongs in a shader (`webgl-shaders-3d.md`). This is the most expensive recipe in this file.  
**Stack:** SVG filter + GSAP attr tween

```tsx
// components/fx/LiquidImage.tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function LiquidImage({ src, alt, id = "liquid" }: { src: string; alt: string; id?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  const wobble = contextSafe((on: boolean) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(dispRef.current, { attr: { scale: on ? 28 : 0 }, duration: on ? 0.6 : 0.9, ease: on ? "power2.out" : "power3.inOut" });
    if (on) {
      gsap.fromTo(turbRef.current, { attr: { baseFrequency: "0.012 0.03" } }, { attr: { baseFrequency: "0.02 0.05" }, duration: 1.2, ease: "sine.inOut" });
    }
  });

  return (
    <div
      ref={root}
      className="liquid"
      onPointerEnter={(e) => e.pointerType === "mouse" && wobble(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && wobble(false)}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ filter: `url(#${id})` }} />
    </div>
  );
}
```

```html
<!-- Ambient (always-on) variant with SMIL: only for small elements such as a logo or a 200px badge -->
<filter id="heat">
  <feTurbulence type="turbulence" baseFrequency="0.02 0.08" numOctaves="1" result="t">
    <animate attributeName="baseFrequency" dur="10s" values="0.02 0.08;0.03 0.11;0.02 0.08" repeatCount="indefinite" />
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="6" />
</filter>
```

**Tune:** anisotropic `baseFrequency "x y"` (x lower than y) gives water streaks; `numOctaves` 1-2 only; `scale` 6-12 for heat haze, 20-40 for a hover splash; always extend the filter region or edges get clipped.  
**A11y/perf:** animating `baseFrequency` recomputes noise for every pixel every frame on the CPU; tweening only `scale` over a static turbulence is cheaper. Budget: under 400x400px and only while hovered. Even `scale="0"` keeps the filter pipeline active: remove the `filter` style when idle if the image is large. Reduced motion and touch: no wobble. SMIL `<animate>` ignores reduced motion, so render the `<animate>` element only when `matchMedia` allows.

### 18. Mask and clip reveals
**Looks like:** images wipe in from one edge, an iris opens on a photo, or a cursor "flashlight" reveals a hidden layer.  
**Use when / avoid when:** editorial image entrances, case-study covers, before/after reveals. Scrubbing clip-path on full-screen layers on low-end phones stutters; prefer time-based reveals there.  
**Stack:** CSS clip-path | CSS mask | SVG `<mask>` + GSAP

```css
/* styles/reveal.css */
/* A) Wipe with clip-path inset, triggered by .is-in (IntersectionObserver) */
.wipe { overflow: hidden; clip-path: inset(0 0 0 0); }
@media (prefers-reduced-motion: no-preference) {
  .wipe { clip-path: inset(0 100% 0 0); transition: clip-path 1.1s var(--ease-out-expo); }
  .wipe.is-in { clip-path: inset(0 0 0 0); }
  .wipe > img { scale: 1.15; transition: scale 1.6s var(--ease-out-expo); }  /* counter-zoom sells it */
  .wipe.is-in > img { scale: 1; }
}

/* B) Cursor flashlight: hidden layer masked by a radial gradient at the pointer */
@property --r { syntax: "<length>"; inherits: false; initial-value: 0px; }
.flashlight { position: relative; }
.flashlight__hidden {
  position: absolute;
  inset: 0;
  mask-image: radial-gradient(circle var(--r) at var(--mx, 50%) var(--my, 50%), #000 60%, transparent 100%);
  transition: --r 0.4s var(--ease-out-expo);
}
@media (pointer: fine) {
  .flashlight:hover .flashlight__hidden { --r: 180px; }
}
```

```tsx
// components/fx/Flashlight.tsx - pointer tracking writes CSS vars directly (no React state per move)
"use client";
import { useRef, type PointerEvent, type ReactNode } from "react";

export function Flashlight({ base, hidden }: { base: ReactNode; hidden: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} className="flashlight" onPointerMove={onMove}>
      {base}
      <div className="flashlight__hidden" aria-hidden="true">{hidden}</div>
    </div>
  );
}
```

```tsx
// components/fx/IrisReveal.tsx - SVG mask circle grows from center (GSAP attr tween)
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function IrisReveal({ src, alt, maskId = "iris-mask" }: { src: string; alt: string; maskId?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const circle = useRef<SVGCircleElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(circle.current, { attr: { r: 0 } }, {
        attr: { r: 1000 },                    // > half-diagonal of 1600x900
        duration: 1.3,
        ease: "power3.inOut",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    });
  }, { scope: root });
  return (
    <svg ref={root} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt} className="block h-auto w-full">
      <defs>
        <mask id={maskId}>
          <rect width="1600" height="900" fill="black" />
          <circle ref={circle} cx="800" cy="450" r="1000" fill="white" />
        </mask>
      </defs>
      <image href={src} width="1600" height="900" preserveAspectRatio="xMidYMid slice" mask={`url(#${maskId})`} />
    </svg>
  );
}
```

**Tune:** wipe 0.9-1.3s expo-out with a 1.1-1.2 counter-scale; flashlight radius 140-220px with a 40% soft edge; iris 1.1-1.5s `power3.inOut`.  
**A11y/perf:** the iris markup ships fully revealed (r=1000) so no-JS and reduced-motion users see the image. Clip-path on a single image is fine; on a pinned, scrubbed full-screen section test on a mid Android. Flashlight is `pointer: fine` only; on touch show the hidden layer statically or behind a toggle.

### 19. Beams traveling along paths
**Looks like:** curved connectors between logo nodes with a bright pulse traveling from source to destination (Magic UI Animated Beam "integrations" diagram).  
**Use when / avoid when:** explaining data flow (sources to product to outputs). As decoration with no meaning it is noise; keep pulses slow and sequential so the eye can follow causality.  
**Stack:** React measurement + SVG + CSS dash comet

How Magic UI does it: measures `getBoundingClientRect()` of container/from/to (ResizeObserver on the container), builds `M start Q midX,(startY - curvature) end`, draws a faint base path plus a second path stroked with a `gradientUnits="userSpaceOnUse"` linearGradient whose `x1/x2` Motion animates (10%->110%, 0%->100%, ease-out-expo, repeat Infinity). Limitation: the highlight slides along the X axis, not along the path, so vertical or S-curved beams look wrong. The dash comet below travels along true arc length.

```tsx
// components/fx/Beam.tsx
"use client";
import { useEffect, useId, useState, type CSSProperties, type RefObject } from "react";

type BeamProps = {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;   // px, positive bends up
  duration?: number;    // s per pulse
  delay?: number;       // s, stagger beams so pulses read in sequence
  reverse?: boolean;
  colors?: [string, string];
};

export function Beam({
  containerRef, fromRef, toRef, curvature = 0, duration = 3.2, delay = 0, reverse = false,
  colors = ["oklch(80% 0.15 60)", "oklch(70% 0.2 300)"],
}: BeamProps) {
  const gid = `beam-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [geom, setGeom] = useState({ d: "", w: 0, h: 0, sx: 0, ex: 0 });

  useEffect(() => {
    const c = containerRef.current;
    const a = fromRef.current;
    const b = toRef.current;
    if (!c || !a || !b) return;
    const update = () => {
      const cr = c.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const sx = ar.left - cr.left + ar.width / 2;
      const sy = ar.top - cr.top + ar.height / 2;
      const ex = br.left - cr.left + br.width / 2;
      const ey = br.top - cr.top + br.height / 2;
      setGeom({ d: `M ${sx},${sy} Q ${(sx + ex) / 2},${sy - curvature} ${ex},${ey}`, w: cr.width, h: cr.height, sx, ex });
    };
    update();
    const ro = new ResizeObserver(update);
    [c, a, b].forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  if (!geom.d) return null;
  return (
    <svg className="beam" width={geom.w} height={geom.h} viewBox={`0 0 ${geom.w} ${geom.h}`} fill="none" aria-hidden="true">
      <defs>
        {/* userSpaceOnUse: an objectBoundingBox gradient on a perfectly straight (zero-height bbox) path renders nothing */}
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={reverse ? geom.ex : geom.sx} x2={reverse ? geom.sx : geom.ex} y1={0} y2={0}>
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <path d={geom.d} className="beam__base" />
      <path
        d={geom.d}
        pathLength={1}
        className="beam__pulse"
        stroke={`url(#${gid})`}
        style={{ "--beam-dur": `${duration}s`, "--beam-delay": `${delay}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties}
      />
    </svg>
  );
}
```

```css
/* styles/beam.css */
.beam { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.beam__base { stroke: color-mix(in oklab, currentColor 14%, transparent); stroke-width: 2; }
.beam__pulse {
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 0.18 0.82;      /* 18% of the path is lit */
  stroke-dashoffset: 0.18;          /* starts just before the path start */
  opacity: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .beam__pulse { animation: beam-pulse var(--beam-dur) var(--ease-in-out-cubic) var(--beam-delay) infinite; }
}
@keyframes beam-pulse {
  0% { stroke-dashoffset: 0.18; opacity: 1; }
  70% { stroke-dashoffset: -1; opacity: 1; }         /* travelled past the end */
  71%, 100% { stroke-dashoffset: -1; opacity: 0; }   /* rest before the next pulse */
}
```

**Tune:** comet length 0.12-0.25; 2.5-4s per pulse; stagger delays so inputs fire before outputs (inputs 0s, hub 1s, outputs 1.6s); curvature 40-120px for fan-in layouts.  
**A11y/perf:** dashoffset is a cheap repaint of one path. Reduced motion shows the static connectors, which still explain the diagram. Put `role="img"` and an `aria-label` describing the flow on the diagram container.

### 20. Objects along a curve with MotionPathPlugin
**Looks like:** a dot, plane or product travels along a route while the route draws behind it, synced to scroll (timeline or journey sections).  
**Use when / avoid when:** storytelling timelines, logistics/travel, "how it works" steps. Avoid for decoration without narrative.  
**Stack:** GSAP MotionPathPlugin + DrawSVG + ScrollTrigger

```tsx
// components/fx/RouteJourney.tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, MotionPathPlugin, DrawSVGPlugin, ScrollTrigger);

const ROUTE = "M40 60 C 300 20, 420 260, 640 220 S 980 40, 1160 180 S 1100 420, 760 460 S 260 520, 120 420";

export function RouteJourney() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const onPath = { path: "#route-drawn", align: "#route-drawn", alignOrigin: [0.5, 0.5] as [number, number], autoRotate: true };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // park the traveler on the path start before scrolling begins (otherwise it sits at the SVG origin)
      gsap.set("#traveler", { motionPath: { ...onPath, start: 0, end: 0 } });
      const tl = gsap.timeline({
        defaults: { ease: "none" }, // scrubbed timelines stay linear; scrub supplies the smoothing
        scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom 40%", scrub: 0.8 },
      });
      tl.fromTo("#route-drawn", { drawSVG: "0%" }, { drawSVG: "100%" }, 0)
        .to("#traveler", { motionPath: onPath }, 0);
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      // static end state: full route, traveler parked at the destination
      gsap.set("#traveler", { motionPath: { ...onPath, start: 1, end: 1 } });
    });
  }, { scope: root });

  return (
    <div ref={root} className="relative">
      <svg viewBox="0 0 1200 560" className="h-auto w-full" fill="none" aria-hidden="true">
        <path d={ROUTE} stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="4 8" />
        <path id="route-drawn" d={ROUTE} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <g id="traveler">
          <circle r="10" fill="currentColor" />
          <path d="M-4 -5 L6 0 L-4 5 Z" fill="var(--page-bg, #fff)" />
        </g>
      </svg>
    </div>
  );
}
```

**Tune:** `autoRotate: true` (or a number such as `90` if the artwork points up); `alignOrigin [0.5, 0.5]`; `start/end` 0-1 to use part of a path; `curviness` 0.5-1.5 when `path` is an array of points; scrub 0.5-1.  
**A11y/perf:** transforms only on the traveler. CSS alternative `offset-path: path("...")` + `offset-distance` works for simple cases, but `path()` coordinates are CSS px and do not scale with an SVG viewBox; GSAP `align` handles nested transforms and responsive scaling. `MotionPathHelper` (free) lets you edit the path visually in dev.

### 21. Hand-drawn annotations
**Looks like:** a marker circle, underline, highlight or box sketched around words as they scroll into view (rough-notation).  
**Use when / avoid when:** 1-3 key phrases per page in editorial/product copy. Every paragraph annotated = kindergarten.  
**Stack:** rough-notation 0.5 (3 KB gz)

```tsx
// components/fx/Annotate.tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { annotate } from "rough-notation";

type Config = Parameters<typeof annotate>[1];

export function Annotate({ children, config, delay = 0 }: { children: ReactNode; config: Config; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = annotate(el, { animationDuration: 800, strokeWidth: 2, padding: 4, ...config, animate: !reduce });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      timer = setTimeout(() => a.show(), delay);
      io.disconnect();
    }, { threshold: 0.8 });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
      a.remove();
    };
  }, [config, delay]);

  return <span ref={ref}>{children}</span>;
}
```

```tsx
// usage: define configs outside the component so the effect does not re-run each render
const CIRCLE = { type: "circle", color: "oklch(65% 0.2 30)", padding: 8 } as const;
const MARK = { type: "highlight", color: "oklch(92% 0.12 95)", multiline: true, iterations: 1 } as const;

<p>We cut cold starts by <Annotate config={CIRCLE}>83%</Annotate> and <Annotate config={MARK} delay={600}>kept the bill flat</Annotate>.</p>
```

**Tune:** types `underline | box | circle | highlight | strike-through | crossed-off | bracket`; `iterations` 1 (clean) or 2 (default, sketchier); `animationDuration` 500-1000ms; `padding` 2-10; sequence several with `annotationGroup([a1, a2]).show()`.  
**A11y/perf:** decorative SVG is inserted next to the element; the text is untouched. `highlight` draws behind text, so check contrast against the highlight color. Calling `show()` again re-measures after layout shifts (web fonts); to replay, `hide()` then `show()`.

### 22. Animated icons
**Looks like:** hamburger lines rotate into an X; a check mark draws itself; Lucide-animated / animated-icons style hover motion.  
**Use when / avoid when:** nav toggles, success states, hover affordance on a small set of icons. Animating every icon in a dense toolbar is fidgety.  
**Stack:** CSS transforms on SVG paths | Motion `pathLength`

```tsx
// components/ui/MenuToggle.tsx
"use client";
export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="menu-toggle" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={onToggle}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <path className="menu-toggle__l1" d="M4 7h16" />
        <path className="menu-toggle__l2" d="M4 12h16" />
        <path className="menu-toggle__l3" d="M4 17h16" />
      </svg>
    </button>
  );
}
```

```css
/* styles/menu-toggle.css */
.menu-toggle path {
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  transform-box: fill-box;          /* origin relative to each line's own box */
  transform-origin: center;
  transition: transform 0.35s var(--ease-out-expo), opacity 0.2s linear;
}
.menu-toggle[aria-expanded="true"] .menu-toggle__l1 { transform: translateY(5px) rotate(45deg); }
.menu-toggle[aria-expanded="true"] .menu-toggle__l2 { opacity: 0; transform: scaleX(0.2); }
.menu-toggle[aria-expanded="true"] .menu-toggle__l3 { transform: translateY(-5px) rotate(-45deg); }
@media (prefers-reduced-motion: reduce) {
  .menu-toggle path { transition-duration: 0.01ms; }
}
```

```tsx
// components/ui/CheckDraw.tsx - Motion's pathLength handles pathLength=1 + dasharray for you
"use client";
import { motion, useReducedMotion } from "motion/react";

export function CheckDraw({ done }: { done: boolean }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : { pathLength: { duration: 0.35, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.05 } }}
      />
    </svg>
  );
}
```

**Tune:** icon transitions 200-400ms; offset lines by exactly the gap (5px here) so the X centers; hover wiggles (animated-icons style) at 300-500ms, triggered by the parent button's hover, not the icon's.  
**A11y/perf:** the accessible name changes with state (`aria-label`, `aria-expanded`); never rely on the shape alone. Transforms on tiny SVGs are trivially cheap.

### 23. Circuit pattern background
**Looks like:** faint PCB traces with pads covering a section, a few traces lighting up with traveling pulses (AI infra, hardware, security).  
**Use when / avoid when:** infra/devtools/hardware brands. It becomes wallpaper if pulses are constant and everywhere; use 3-6 pulses on a staggered, slow cycle.  
**Stack:** CSS (tile used as a mask so it follows the theme) + SVG dash pulses

```css
/* styles/circuit.css */
.circuit {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* the tile is a MASK; color comes from --trace, so one asset serves light and dark themes */
  background: var(--trace, color-mix(in oklab, currentColor 16%, transparent));
  mask-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' fill='none' stroke='%23000' stroke-width='1'%3E%3Cpath d='M0 24h32l12 12v60M96 60H64L52 48V0M24 96V76l8-8h12M72 0v16l8 8h16'/%3E%3Ccircle cx='32' cy='24' r='2.5'/%3E%3Ccircle cx='64' cy='60' r='2.5'/%3E%3Ccircle cx='44' cy='68' r='2.5'/%3E%3Ccircle cx='80' cy='24' r='2.5'/%3E%3C/svg%3E"),
    radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%);
  mask-size: 96px 96px, 100% 100%;
  mask-repeat: repeat, no-repeat;
  mask-composite: intersect;              /* tile AND radial fade */
}
.circuit-pulses { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
.circuit-pulses path {
  fill: none;
  stroke: var(--pulse, oklch(80% 0.16 160));
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-dasharray: 0.08 0.92;
  stroke-dashoffset: 0.08;
  opacity: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .circuit-pulses path { animation: circuit-pulse 7s linear infinite; animation-delay: var(--d, 0s); }
}
@keyframes circuit-pulse {
  0% { stroke-dashoffset: 0.08; opacity: 0.9; }
  45% { stroke-dashoffset: -1; opacity: 0.9; }
  46%, 100% { stroke-dashoffset: -1; opacity: 0; }
}
```

```html
<!-- Pulse traces: hand-placed long routes, independent of the tile -->
<div class="circuit" aria-hidden="true"></div>
<svg class="circuit-pulses" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <path pathLength="1" d="M0 120h260l40 40v180h320l30-30h550" style="--d:0s" />
  <path pathLength="1" d="M1200 80H880l-40 40v200l-30 30H420" style="--d:1.8s" />
  <path pathLength="1" d="M140 600V420l40-40h300l40-40V0" style="--d:3.1s" />
  <path pathLength="1" d="M1200 520H900l-50-50V300h-220" style="--d:4.6s" />
</svg>
```

**Tune:** tile 80-120px; trace ink 10-18%; pulse length 0.05-0.12; cycle 6-10s with ~45% travel and the rest idle; generate richer tiles with fffuel or Haikei and paste them into the data URI.  
**A11y/perf:** static tile + 4 cheap dashoffset repaints. Reduced motion leaves the calm static pattern.

### 24. Layered SVG waves
**Looks like:** 2-3 translucent wave bands rolling slowly at the bottom of a hero or as a section divider (Haikei-style layered waves, animated).  
**Use when / avoid when:** playful, travel, ocean/wellness, kids. Too literal for most SaaS; a single static wave divider is usually enough.  
**Stack:** CSS transform loop on a periodic path

```tsx
// components/fx/Waves.tsx
// The path spans 2400 units = two identical 1200-unit periods with matching tangents at the seam,
// so translating the layer by -50% loops seamlessly.
const WAVE = "M0 40 C200 0 400 0 600 40 S1000 80 1200 40 S1600 0 1800 40 S2200 80 2400 40 V120 H0 Z";

export function Waves({ className = "" }: { className?: string }) {
  return (
    <div className={`waves ${className}`} aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <svg key={n} className={`waves__layer waves__layer--${n}`} viewBox="0 0 2400 120" preserveAspectRatio="none">
          <path d={WAVE} />
        </svg>
      ))}
    </div>
  );
}
```

```css
/* styles/waves.css */
.waves { position: relative; height: clamp(80px, 12vw, 160px); overflow: hidden; }
.waves__layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;                     /* two periods wide: one visible, one to scroll into */
  will-change: transform;
}
.waves__layer path { fill: var(--wave, oklch(70% 0.1 220)); }
.waves__layer--1 { height: 100%; opacity: 0.35; }
.waves__layer--2 { height: 80%; opacity: 0.55; }
.waves__layer--3 { height: 60%; opacity: 1; }
@media (prefers-reduced-motion: no-preference) {
  .waves__layer--1 { animation: wave-roll 22s linear infinite; }
  .waves__layer--2 { animation: wave-roll 16s linear infinite reverse; }
  .waves__layer--3 { animation: wave-roll 11s linear infinite; }
}
@keyframes wave-roll { to { transform: translate3d(-50%, 0, 0); } }
```

**Tune:** amplitude via the control-point Y values (0 and 80 here, about 40 units); 10-25s per layer with different durations; the reversed middle layer adds depth.  
**A11y/perf:** compositor-only. For noise-driven, non-periodic waves use canvas (React Bits Waves, Aceternity Wavy Background) with the noise setup from [32](#32-flow-field).

### 25. useCanvas2D hook
**Looks like:** nothing by itself; it is the shared engine for recipes 26-35: DPR-correct backing store, ResizeObserver, pause offscreen (IntersectionObserver) and in hidden tabs (visibilitychange), reduced-motion static frame, optional FPS cap and pointer tracking without React re-renders.  
**Use when / avoid when:** any canvas background. Do not copy library canvases that `setState` on every mousemove (Magic UI Particles re-renders React per pointer move) or never pause offscreen.  
**Stack:** Canvas 2D + React

```ts
// hooks/use-canvas-2d.ts
"use client";
import { useEffect, useRef } from "react";

export type Pointer = { x: number; y: number; active: boolean };
export type CanvasFrame = {
  ctx: CanvasRenderingContext2D;
  width: number;   // CSS px (the context is pre-scaled by dpr)
  height: number;  // CSS px
  dpr: number;
  time: number;    // s since the loop started (0 in a static frame)
  dt: number;      // s since the previous frame, clamped (0 in a static frame)
  pointer: Pointer; // CSS px relative to the canvas
};
type Base = Omit<CanvasFrame, "time" | "dt">;

export type UseCanvas2DOptions = {
  draw: (f: CanvasFrame) => void;         // called every frame while running; responsible for clearing
  setup?: (f: Base) => void;               // mount + every resize: (re)build particles here
  drawStatic?: (f: Base) => void;          // reduced-motion frame; defaults to draw() with dt = 0
  maxDpr?: number;                         // cap backing-store size (2 is plenty; 1.5 for full-screen on mobile)
  fps?: number;                            // cap for ambient effects (24-30 halves the cost)
  trackPointer?: boolean;                  // only on (pointer: fine) devices
};

export function useCanvas2D({ draw, setup, drawStatic, maxDpr = 2, fps, trackPointer = false }: UseCanvas2DOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fns = useRef({ draw, setup, drawStatic });
  useEffect(() => {
    fns.current = { draw, setup, drawStatic };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canTrack = trackPointer && window.matchMedia("(pointer: fine)").matches;
    const pointer: Pointer = { x: -9999, y: -9999, active: false };
    const minFrameMs = fps ? 1000 / fps - 1 : 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let start = 0;
    let last = 0;
    let inView = false;
    let pageVisible = !document.hidden;

    const base = (): Base => ({ ctx, width, height, dpr, pointer });
    const paintStatic = () => {
      if (!width || !height) return;
      const f = fns.current;
      if (f.drawStatic) f.drawStatic(base());
      else f.draw({ ...base(), time: 0, dt: 0 });
    };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      width = w;
      height = h;
      canvas.width = Math.round(w * dpr);   // resets ALL context state
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px from here on
      fns.current.setup?.(base());
      if (!raf) paintStatic();                // resizing cleared the bitmap
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (minFrameMs && last && t - last < minFrameMs) return;
      if (!start) start = t;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      fns.current.draw({ ...base(), time: (t - start) / 1000, dt });
    };

    const sync = () => {
      const run = inView && pageVisible && !reduce.matches;
      if (run && !raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (!run && reduce.matches) paintStatic();
    };

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onPointerOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;              // still inside the document
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { rootMargin: "120px" });
    io.observe(canvas);
    const onVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", sync);
    if (canTrack) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerout", onPointerOut);
    }
    resize();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, [maxDpr, fps, trackPointer]);

  return canvasRef;
}
```

```tsx
// usage pattern shared by recipes 26-35
<canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
```

**Tune:** `maxDpr` 2 (1.5 for full-viewport layers on phones, 1 for blurry/soft effects); `fps` 24-30 for flicker/matrix/ambient drift, uncapped for pointer-reactive effects; IO `rootMargin` 100-200px so the loop is warm before it scrolls in.  
**A11y/perf:** the canvas is `aria-hidden` and `pointer-events: none`; pointer tracking listens on `window` instead. Hot loops mutate arrays and objects in place on purpose (allocation per frame causes GC hitches); keep React state out of the loop. Canvas 2D runs on the main thread: if the page also has heavy scroll JS, move the effect to a worker ([36](#36-offscreencanvas-in-a-worker)).

### 26. Starfield and particle drift
**Looks like:** hundreds of tiny points at different depths drifting slowly upward with a faint twinkle; parallax sells depth.  
**Use when / avoid when:** space/AI/night themes, behind a dark hero. With pure black + white dots + centered gradient headline it is the stock "AI startup" look; tint the stars with the brand hue, keep density low, and fade at the edges with a mask.  
**Stack:** Canvas 2D (recipe 25)

```tsx
// components/fx/Starfield.tsx
"use client";
import { useRef } from "react";
import { useCanvas2D } from "@/hooks/use-canvas-2d";

type Star = { x: number; y: number; z: number; phase: number };
type Props = { density?: number; rgb?: string; speed?: number; className?: string };

export function Starfield({ density = 1, rgb = "226 232 255", speed = 10, className = "" }: Props) {
  const stars = useRef<Star[]>([]);
  const canvasRef = useCanvas2D({
    maxDpr: 2,
    setup: ({ width, height }) => {
      const count = Math.min(700, Math.round(((width * height) / 4500) * density));
      stars.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() ** 2,               // squared: most stars far (small, slow), a few near
        phase: Math.random() * Math.PI * 2,
      }));
    },
    draw: ({ ctx, width, height, time, dt }) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgb(${rgb})`;
      for (const s of stars.current) {
        s.y -= (0.15 + s.z) * speed * dt;    // parallax: near stars move faster
        if (s.y < -2) {
          s.y = height + 2;
          s.x = Math.random() * width;
        }
        const size = 0.5 + s.z * 1.5;
        ctx.globalAlpha = (0.2 + 0.8 * s.z) * (0.7 + 0.3 * Math.sin(time * 1.6 + s.phase));
        ctx.fillRect(s.x, s.y, size, size);  // fillRect is far cheaper than arc() for tiny points
      }
      ctx.globalAlpha = 1;
    },
  });
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,#000_40%,transparent_85%)] ${className}`}
    />
  );
}
```

**Tune:** density 0.6-1.4 (one star per ~3-6k px^2); speed 4-20 px/s (above 30 reads as "warp", a different effect); twinkle amplitude 0.2-0.35 at 1-2 rad/s; size 0.5-2px.  
**A11y/perf:** ~600 fillRects per frame is trivial. Never use `shadowBlur` for glow (it is the slowest Canvas 2D operation); draw a second, larger, low-alpha square instead or pre-render a glow sprite to an offscreen canvas and `drawImage` it. Reduced motion shows one still frame.

### 27. Constellation network
**Looks like:** slowly drifting nodes connected by lines whose opacity falls with distance; the cursor acts as a node that attracts nearby points (particles.js "links" look).  
**Use when / avoid when:** networks, graph/data, "connected" products, but it is a 2015 particles.js cliche: keep node count low, lines very faint (max 15-25% alpha), and tie color to the brand.  
**Stack:** Canvas 2D (recipe 25)

```tsx
// components/fx/Constellation.tsx
"use client";
import { useRef } from "react";
import { useCanvas2D } from "@/hooks/use-canvas-2d";

type Node = { x: number; y: number; vx: number; vy: number };
const LINK = 130;          // px, max link distance
const POINTER_LINK = 180;  // px
const BUCKETS = 4;         // alpha buckets: one stroke() per bucket instead of one per line

export function Constellation({ color = "#94a3b8", maxAlpha = 0.22, className = "" }: { color?: string; maxAlpha?: number; className?: string }) {
  const nodes = useRef<Node[]>([]);
  const canvasRef = useCanvas2D({
    trackPointer: true,
    setup: ({ width, height }) => {
      const count = Math.min(140, Math.round((width * height) / 12000));
      nodes.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18,
      }));
    },
    draw: ({ ctx, width, height, dt, pointer }) => {
      const list = nodes.current;
      ctx.clearRect(0, 0, width, height);

      for (const n of list) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          if (dx * dx + dy * dy < POINTER_LINK * POINTER_LINK) {
            n.x += dx * 0.8 * dt;              // gentle pull toward the cursor
            n.y += dy * 0.8 * dt;
          }
        }
      }

      const paths = Array.from({ length: BUCKETS }, () => new Path2D());
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const k = Math.min(BUCKETS - 1, Math.floor((1 - Math.sqrt(d2) / LINK) * BUCKETS));
            paths[k].moveTo(a.x, a.y);
            paths[k].lineTo(b.x, b.y);
          }
        }
        if (pointer.active) {
          const dx = a.x - pointer.x;
          const dy = a.y - pointer.y;
          if (dx * dx + dy * dy < POINTER_LINK * POINTER_LINK) {
            paths[BUCKETS - 1].moveTo(a.x, a.y);
            paths[BUCKETS - 1].lineTo(pointer.x, pointer.y);
          }
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      paths.forEach((p, k) => {
        ctx.globalAlpha = ((k + 1) / BUCKETS) * maxAlpha;
        ctx.stroke(p);
      });

      const dots = new Path2D();
      for (const n of list) {
        dots.moveTo(n.x + 1.6, n.y);
        dots.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      }
      ctx.globalAlpha = Math.min(1, maxAlpha * 3);
      ctx.fillStyle = color;
      ctx.fill(dots);
      ctx.globalAlpha = 1;
    },
  });
  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
```

**Tune:** nodes 60-140 (O(n^2) links: 140 nodes = ~10k distance checks per frame, fine; above ~250 use a spatial grid); link distance 100-160px; line alpha 0.12-0.25; speed 8-25 px/s.  
**A11y/perf:** batching into 4 alpha buckets turns hundreds of `stroke()` calls into 4. Touch devices get the ambient version (no pointer). Reduced motion: one still frame.

### 28. Flickering grid
**Looks like:** a field of tiny squares randomly changing opacity, like a slow LED matrix (Magic UI Flickering Grid, used on many AI/infra landing pages).  
**Use when / avoid when:** texture inside a bento card, footer, or hero edge with a mask. Full-screen and high-contrast it becomes TV static; keep max opacity low.  
**Stack:** Canvas 2D (recipe 25), FPS-capped

```tsx
// components/fx/FlickeringGrid.tsx
"use client";
import { useRef } from "react";
import { useCanvas2D } from "@/hooks/use-canvas-2d";

type Props = { cell?: number; gap?: number; flicker?: number; maxOpacity?: number; color?: string; className?: string };

export function FlickeringGrid({ cell = 4, gap = 6, flicker = 0.3, maxOpacity = 0.3, color = "currentColor", className = "" }: Props) {
  const grid = useRef({ cols: 0, rows: 0, alpha: new Float32Array(0), fill: "#888" });
  const canvasRef = useCanvas2D({
    fps: 24,                                     // flicker does not need 60 fps
    setup: ({ ctx, width, height }) => {
      const step = cell + gap;
      const cols = Math.ceil(width / step);
      const rows = Math.ceil(height / step);
      const alpha = new Float32Array(cols * rows);
      for (let i = 0; i < alpha.length; i++) alpha[i] = Math.random() * maxOpacity;
      // resolve currentColor / CSS vars once per resize, so the grid follows the theme
      grid.current = { cols, rows, alpha, fill: getComputedStyle(ctx.canvas).color };
    },
    draw: ({ ctx, width, height, dt }) => {
      const { cols, rows, alpha, fill } = grid.current;
      const step = cell + gap;
      const chance = flicker * dt;               // probability per cell per frame, frame-rate independent
      for (let i = 0; i < alpha.length; i++) {
        if (Math.random() < chance) alpha[i] = Math.random() * maxOpacity;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = fill;                      // one fillStyle, vary globalAlpha (no per-cell string building)
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          ctx.globalAlpha = alpha[x * rows + y];
          ctx.fillRect(x * step, y * step, cell, cell);
        }
      }
      ctx.globalAlpha = 1;
    },
  });
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ color }}
      className={`pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)] ${className}`}
    />
  );
}
```

**Tune:** cell 2-5px, gap 4-8px; flicker 0.1-0.5 changes/cell/s; maxOpacity 0.15-0.35; fps 15-30.  
**A11y/perf:** Magic UI's version builds an `rgba()` string per cell per frame; the `globalAlpha` approach avoids that garbage. A 1440x900 area at 10px pitch = ~13k fillRects at 24 fps, fine on desktop; on phones cap the canvas height or raise the pitch. Reduced motion: static random grid.

### 29. Interactive spring dot grid
**Looks like:** an even dot matrix whose dots get pushed away from the cursor and spring back with a little overshoot, brightening near the pointer (React Bits Dot Grid, Rauno-style playgrounds).  
**Use when / avoid when:** playful hero, portfolio intro, product with a "physical" feel. Not behind reading text; the motion competes.  
**Stack:** Canvas 2D (recipe 25) with a damped spring; React Bits does the same with GSAP InertiaPlugin + `elastic.out(1,0.75)` returns and a click shockwave

```tsx
// components/fx/SpringDotGrid.tsx
"use client";
import { useRef } from "react";
import { useCanvas2D } from "@/hooks/use-canvas-2d";

type Props = { gap?: number; radius?: number; influence?: number; push?: number; stiffness?: number; damping?: number; color?: string; activeColor?: string; className?: string };

export function SpringDotGrid({
  gap = 28, radius = 1.6, influence = 140, push = 6000, stiffness = 180, damping = 14,
  color = "rgb(148 163 184 / 0.45)", activeColor = "rgb(99 102 241)", className = "",
}: Props) {
  const s = useRef({ n: 0, hx: new Float32Array(0), hy: new Float32Array(0), ox: new Float32Array(0), oy: new Float32Array(0), vx: new Float32Array(0), vy: new Float32Array(0), settled: false });

  const canvasRef = useCanvas2D({
    trackPointer: true,
    setup: ({ width, height }) => {
      const cols = Math.floor(width / gap);
      const rows = Math.floor(height / gap);
      const n = cols * rows;
      const offX = (width - (cols - 1) * gap) / 2;
      const offY = (height - (rows - 1) * gap) / 2;
      const hx = new Float32Array(n);
      const hy = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        hx[i] = offX + (i % cols) * gap;
        hy[i] = offY + Math.floor(i / cols) * gap;
      }
      s.current = { n, hx, hy, ox: new Float32Array(n), oy: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n), settled: false };
    },
    draw: ({ ctx, width, height, dt, pointer }) => {
      const st = s.current;
      if (st.settled && !pointer.active) return;       // idle: keep the last frame, skip all work
      let energy = 0;
      const base = new Path2D();
      const hot = new Path2D();
      for (let i = 0; i < st.n; i++) {
        let ax = -stiffness * st.ox[i] - damping * st.vx[i];
        let ay = -stiffness * st.oy[i] - damping * st.vy[i];
        const x = st.hx[i] + st.ox[i];
        const y = st.hy[i] + st.oy[i];
        let near = false;
        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < influence) {
            const f = (1 - d / influence) ** 2 * push;  // quadratic falloff = soft edge
            ax += (dx / d) * f;
            ay += (dy / d) * f;
            near = d < influence * 0.6;
          }
        }
        st.vx[i] += ax * dt;                            // semi-implicit Euler: stable for springs
        st.vy[i] += ay * dt;
        st.ox[i] += st.vx[i] * dt;
        st.oy[i] += st.vy[i] * dt;
        energy += Math.abs(st.ox[i]) + Math.abs(st.oy[i]) + Math.abs(st.vx[i]) * 0.1;
        const p = near || Math.abs(st.ox[i]) + Math.abs(st.oy[i]) > 3 ? hot : base;
        const px = st.hx[i] + st.ox[i];
        const py = st.hy[i] + st.oy[i];
        p.moveTo(px + radius, py);
        p.arc(px, py, radius, 0, Math.PI * 2);
      }
      st.settled = energy < 0.5 * Math.max(1, st.n / 100);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.fill(base);
      ctx.fillStyle = activeColor;
      ctx.fill(hot);
    },
    drawStatic: ({ ctx, width, height }) => {
      const st = s.current;
      const p = new Path2D();
      for (let i = 0; i < st.n; i++) {
        p.moveTo(st.hx[i] + radius, st.hy[i]);
        p.arc(st.hx[i], st.hy[i], radius, 0, Math.PI * 2);
      }
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.fill(p);
    },
  });
  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
```

**Tune:** stiffness 120-260 and damping 10-20 (damping below 2*sqrt(stiffness) = bouncy; at it = no overshoot); push 3000-9000 (max displacement is roughly push / stiffness px); influence 100-200px; gap 20-36px.  
**A11y/perf:** typed arrays + two batched fills; the loop idles when settled. Pointer: fine only; touch users see a static grid. Reduced motion draws `drawStatic`.

### 30. Meteors
**Looks like:** thin streaks with a fading tail shooting diagonally across a dark card or hero at random intervals (Magic UI / Aceternity Meteors).  
**Use when / avoid when:** a dark card or small hero accent. Full-screen meteor showers behind body copy distract; 8-15 meteors with long random delays.  
**Stack:** CSS transforms (cheaper than canvas for under ~40 streaks; above that reuse recipe 26's loop and draw lines)

```tsx
// components/fx/Meteors.tsx
"use client";
import { useEffect, useState, type CSSProperties } from "react";

type Props = { count?: number; angle?: number; className?: string };

export function Meteors({ count = 12, angle = 135, className = "" }: Props) {
  // random values are generated after mount so server and client HTML match
  const [styles, setStyles] = useState<CSSProperties[]>([]);
  useEffect(() => {
    setStyles(
      Array.from({ length: count }, () => ({
        "--angle": `${angle}deg`,
        left: `${Math.round(Math.random() * 130)}%`,        // some start right of the box and fly in
        animationDelay: `${(Math.random() * 8).toFixed(2)}s`,
        animationDuration: `${(4 + Math.random() * 6).toFixed(2)}s`,
      }) as CSSProperties),
    );
  }, [count, angle]);
  return (
    <div className={`meteors ${className}`} aria-hidden="true">
      {styles.map((style, i) => <span key={i} className="meteor" style={style} />)}
    </div>
  );
}
```

```css
/* styles/meteors.css */
.meteors { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.meteor {
  --meteor: oklch(92% 0.03 250);
  position: absolute;
  top: -5%;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--meteor);
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.08);
  opacity: 0;
  /* +x axis of the rotated element = travel direction; 135deg = toward bottom-left */
  transform: rotate(var(--angle));
}
.meteor::before {                    /* tail extends behind the head (toward -x) and fades out */
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  width: 70px;
  height: 1px;
  transform: translateY(-50%);
  background: linear-gradient(to left, var(--meteor), transparent);
}
@media (prefers-reduced-motion: no-preference) {
  .meteor { animation: meteor-fly linear infinite; }
}
@keyframes meteor-fly {
  0% { transform: rotate(var(--angle)) translateX(0); opacity: 0; }
  5% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: rotate(var(--angle)) translateX(700px); opacity: 0; }
}
```

**Tune:** angle 120-150deg (steep = rain, shallow = shooting star); travel 500-900px; duration 4-10s with long random delays (the pause is what makes them special); tail 50-90px.  
**A11y/perf:** transform + opacity only. Reduced motion: meteors stay invisible (opacity 0), which is the right static state for an ambient flourish.

### 31. Sparkles
**Looks like:** four-point star glints popping in and out around a headline or across a dark band (Aceternity SparklesCore look without the 30+ KB tsparticles engine).  
**Use when / avoid when:** celebrating one word or a launch band. For fewer than ~10 sparkles around a word, use DOM/SVG sparkles (Josh Comeau's `Sparkles` pattern) instead of a canvas.  
**Stack:** Canvas 2D (recipe 25)

```tsx
// components/fx/SparkleField.tsx
"use client";
import { useRef } from "react";
import { useCanvas2D } from "@/hooks/use-canvas-2d";

type Spark = { x: number; y: number; size: number; life: number; ttl: number };
type Props = { density?: number; color?: string; minSize?: number; maxSize?: number; className?: string };

function addStar(p: Path2D, x: number, y: number, r: number) {
  // concave 4-point star: quadratic curves pulled through the center
  p.moveTo(x, y - r);
  p.quadraticCurveTo(x, y, x + r, y);
  p.quadraticCurveTo(x, y, x, y + r);
  p.quadraticCurveTo(x, y, x - r, y);
  p.quadraticCurveTo(x, y, x, y - r);
}

export function SparkleField({ density = 1, color = "#fde68a", minSize = 2, maxSize = 7, className = "" }: Props) {
  const sparks = useRef<Spark[]>([]);
  const spawn = (w: number, h: number, s: Spark) => {
    s.x = Math.random() * w;
    s.y = Math.random() * h;
    s.size = minSize + Math.random() ** 3 * (maxSize - minSize);   // mostly small, a few big
    s.ttl = 0.8 + Math.random() * 1.6;
    s.life = 0;
  };
  const canvasRef = useCanvas2D({
    setup: ({ width, height }) => {
      const count = Math.min(160, Math.round(((width * height) / 9000) * density));
      sparks.current = Array.from({ length: count }, () => {
        const s = { x: 0, y: 0, size: 0, life: 0, ttl: 1 };
        spawn(width, height, s);
        s.life = Math.random() * s.ttl;                                // desync the first cycle
        return s;
      });
    },
    draw: ({ ctx, width, height, dt }) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (const s of sparks.current) {
        s.life += dt;
        if (s.life >= s.ttl) spawn(width, height, s);
        const t = s.life / s.ttl;
        const k = Math.sin(Math.PI * t);                                // 0 -> 1 -> 0
        const p = new Path2D();
        addStar(p, s.x, s.y, s.size * k);
        ctx.globalAlpha = k;
        ctx.fill(p);
      }
      ctx.globalAlpha = 1;
    },
    drawStatic: ({ ctx, width, height }) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      const p = new Path2D();
      for (const s of sparks.current) addStar(p, s.x, s.y, s.size * 0.7);
      ctx.fill(p);
      ctx.globalAlpha = 1;
    },
  });
  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
```

**Tune:** lifetime 0.8-2.4s; sizes 2-8px with a cubic bias toward small; density 0.5-1.5; warm white/gold reads "magic", brand hue reads "tech".  
**A11y/perf:** ~100 small fills per frame. Reduced motion shows a static constellation of glints. Place it behind a mask (`mask-image: radial-gradient(...)`) so glints cluster around the focal word.

### 32. Flow field
**Looks like:** thousands of hair-thin particles streaming along an invisible noise field, leaving silky trails (generative-art hero, Tyler Hobbs style lines).  
**Use when / avoid when:** generative/creative brands, AI/data art headers, 404 pages. Too busy behind text; use it in a band with the headline beside it, or at 20-40% opacity.  
**Stack:** Canvas 2D (recipe 25) + simplex-noise 4 (4 KB gz)

```tsx
// components/fx/FlowField.tsx
"use client";
import { useRef } from "react";
import { createNoise3D } from "simplex-noise";
import { useCanvas2D, type CanvasFrame } from "@/hooks/use-canvas-2d";

type P = { x: number; y: number; px: number; py: number; age: number; maxAge: number };
type Props = { color?: string; density?: number; scale?: number; speed?: number; fade?: number; className?: string };

export function FlowField({ color = "rgb(148 163 184)", density = 1, scale = 0.0018, speed = 60, fade = 0.04, className = "" }: Props) {
  const noise = useRef<ReturnType<typeof createNoise3D> | null>(null);
  const parts = useRef<P[]>([]);

  const reset = (p: P, w: number, h: number) => {
    p.x = p.px = Math.random() * w;
    p.y = p.py = Math.random() * h;
    p.age = 0;
    p.maxAge = 80 + Math.random() * 160;
  };

  const step = ({ ctx, width, height }: Pick<CanvasFrame, "ctx" | "width" | "height">, time: number, dt: number) => {
    const n3 = noise.current!;
    ctx.beginPath();
    for (const p of parts.current) {
      const a = n3(p.x * scale, p.y * scale, time * 0.05) * Math.PI * 2;
      p.px = p.x;
      p.py = p.y;
      p.x += Math.cos(a) * speed * dt;
      p.y += Math.sin(a) * speed * dt;
      p.age += 1;
      if (p.age > p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        reset(p, width, height);
        continue;
      }
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.55;
    ctx.stroke();                                  // one stroke for all segments
    ctx.globalAlpha = 1;
  };

  const canvasRef = useCanvas2D({
    maxDpr: 1.5,
    setup: ({ width, height }) => {
      noise.current ??= createNoise3D();
      const count = Math.min(1600, Math.round(((width * height) / 900) * density));
      parts.current = Array.from({ length: count }, () => {
        const p = { x: 0, y: 0, px: 0, py: 0, age: 0, maxAge: 0 };
        reset(p, width, height);
        return p;
      });
    },
    draw: (f) => {
      const { ctx, width, height } = f;
      // fade old trails while keeping the canvas transparent (fillRect with an alpha color would tint it)
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgb(0 0 0 / ${fade})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      step(f, f.time, f.dt || 1 / 60);
    },
    drawStatic: (f) => {
      // reduced motion: simulate ~3s at once and leave the finished drawing
      f.ctx.clearRect(0, 0, f.width, f.height);
      for (let i = 0; i < 180; i++) step(f, 0, 1 / 60);
    },
  });
  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
```

**Tune:** `scale` 0.001-0.004 (lower = broad, calm currents); speed 30-120 px/s; fade 0.02-0.08 (lower = longer silky trails); particles 600-1600; time factor 0.02-0.1 so the field itself evolves slowly.  
**A11y/perf:** one `stroke()` per frame; `destination-out` fade keeps the layer transparent over any background. Cap DPR at 1.5: thin trails look the same and cost 44% less fill. The static frame is a finished artwork, not a blank.

### 33. Click ripple
**Looks like:** concentric rings expand and fade from wherever the user clicks on a section (sonar / water drop).  
**Use when / avoid when:** playful hero, "tap anywhere" moments, interactive demos. Not on forms or reading areas where clicks are for text selection.  
**Stack:** Canvas 2D (recipe 25)

```tsx
// components/fx/ClickRipple.tsx
"use client";
import { useEffect, useRef } from "react";
import { useCanvas2D } from "@/hooks/use-canvas-2d";

type Ring = { x: number; y: number; age: number };
const DURATION = 1.4;              // s
const ECHOES = [0, 0.12, 0.24];    // s delays for concentric rings
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export function ClickRipple({ color = "rgb(99 102 241)", maxRadius = 220, className = "" }: { color?: string; maxRadius?: number; className?: string }) {
  const rings = useRef<Ring[]>([]);
  const canvasRef = useCanvas2D({
    draw: ({ ctx, width, height, dt }) => {
      ctx.clearRect(0, 0, width, height);
      if (!rings.current.length) return;
      ctx.strokeStyle = color;
      for (const r of rings.current) {
        r.age += dt;
        for (const delay of ECHOES) {
          const t = (r.age - delay) / DURATION;
          if (t <= 0 || t >= 1) continue;
          ctx.globalAlpha = (1 - t) * 0.6;
          ctx.lineWidth = 2 * (1 - t) + 0.5;
          ctx.beginPath();
          ctx.arc(r.x, r.y, easeOut(t) * maxRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      rings.current = rings.current.filter((r) => r.age < DURATION + ECHOES[ECHOES.length - 1]);
    },
    drawStatic: ({ ctx, width, height }) => ctx.clearRect(0, 0, width, height),
  });

  useEffect(() => {
    const host = canvasRef.current?.parentElement;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onDown = (e: PointerEvent) => {
      if (reduce.matches || rings.current.length > 8) return;
      const r = canvasRef.current!.getBoundingClientRect();
      rings.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, age: 0 });
    };
    host.addEventListener("pointerdown", onDown);
    return () => host.removeEventListener("pointerdown", onDown);
  }, [canvasRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
```

**Tune:** duration 1-1.8s; max radius 150-300px; 2-3 echoes 0.1-0.15s apart; ring alpha 0.4-0.7.  
**A11y/perf:** purely decorative; the listener sits on the parent section, so real controls inside still receive their clicks. Capped at 8 simultaneous ripples. Reduced motion: no ripples.

### 34. Confetti
**Looks like:** a burst of paper confetti from a button, or side cannons for a big success moment.  
**Use when / avoid when:** genuine achievements (purchase, signup, milestone), once per event. Never on page load or on routine actions.  
**Stack:** canvas-confetti 1.9 (6 KB gz, loaded on demand)

```ts
// lib/confetti.ts
import type { Options } from "canvas-confetti";

const PALETTE = ["#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];

/** Burst from an element. Loads the library only when first used. */
export async function burstFrom(el: HTMLElement, opts: Options = {}) {
  const { default: confetti } = await import("canvas-confetti");
  const r = el.getBoundingClientRect();
  return confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 38,
    gravity: 1.1,
    ticks: 220,
    scalar: 0.9,
    origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
    colors: PALETTE,
    disableForReducedMotion: true,   // resolves immediately for reduced-motion users
    zIndex: 100,
    ...opts,
  });
}

/** Two side cannons firing for durationMs. */
export async function sideCannons(durationMs = 1500) {
  const { default: confetti } = await import("canvas-confetti");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const end = performance.now() + durationMs;
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: PALETTE });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: PALETTE });
    if (performance.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
```

```tsx
// usage in a client component
<button onClick={(e) => void burstFrom(e.currentTarget)}>Claim</button>
```

**Tune:** particleCount 50-150; spread 50-90 (360 for a firework); startVelocity 30-50; `scalar` 0.7-1.2; brand-derived palette of 3-5 colors; `shapes: ["circle"]` for a softer, less party feel; `confetti.shapeFromText({ text: "*", scalar })` for custom glyphs.  
**A11y/perf:** `disableForReducedMotion: true` on every call (default is false). Pair with a real text confirmation (toast, `aria-live`) since confetti carries no information. For a scoped canvas use `confetti.create(canvas, { resize: true, useWorker: true })`; with `useWorker` the library takes ownership of the canvas (it transfers control), so create it once per canvas element or StrictMode's double effect will throw.

### 35. Falling glyphs matrix
**Looks like:** columns of characters raining down with bright heads and fading trails (The Matrix; React Bits Letter Glitch is the static-grid cousin).  
**Use when / avoid when:** hacker/security/terminal themes, 404s, a loading interstitial. It is a heavy cliche: tint it with the brand, lower the opacity, slow it down, or use the site's own vocabulary as the glyph set.  
**Stack:** Canvas 2D (recipe 25), FPS-capped

```tsx
// components/fx/GlyphRain.tsx
"use client";
import { useRef } from "react";
import { useCanvas2D } from "@/hooks/use-canvas-2d";

const GLYPHS = "アイウエオカキクケコサシスセソ0123456789ABCDEF<>/{}";
const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

type Props = { fontSize?: number; color?: string; headColor?: string; fade?: number; className?: string };

export function GlyphRain({ fontSize = 16, color = "rgb(34 197 94)", headColor = "rgb(220 252 231)", fade = 0.09, className = "" }: Props) {
  const drops = useRef(new Float32Array(0));
  const canvasRef = useCanvas2D({
    fps: 20,                                         // the classic look is choppy on purpose
    maxDpr: 1.5,
    setup: ({ ctx, width, height }) => {
      const cols = Math.ceil(width / fontSize);
      drops.current = Float32Array.from({ length: cols }, () => -Math.floor(Math.random() * (height / fontSize)));
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";
    },
    draw: ({ ctx, width, height }) => {
      ctx.globalCompositeOperation = "destination-out";          // fade trails, keep transparency
      ctx.fillStyle = `rgb(0 0 0 / ${fade})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      const d = drops.current;
      for (let i = 0; i < d.length; i++) {
        const y = d[i] * fontSize;
        if (y >= 0) {
          ctx.fillStyle = color;
          ctx.fillText(pick(), i * fontSize, y - fontSize);       // body glyph just above the head
          ctx.fillStyle = headColor;
          ctx.fillText(pick(), i * fontSize, y);                 // bright head
        }
        d[i] += 1;
        if (y > height && Math.random() > 0.975) d[i] = 0;
      }
    },
    drawStatic: ({ ctx, width, height }) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (let x = 0; x < width; x += fontSize) {
        for (let y = 0; y < height; y += fontSize) {
          ctx.globalAlpha = Math.random() * 0.35;
          ctx.fillText(pick(), x, y);
        }
      }
      ctx.globalAlpha = 1;
    },
  });
  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
```

**Tune:** font 12-20px; fps 15-24; fade 0.05-0.12 (trail length); reset chance 0.97-0.99 (column desync).  
**A11y/perf:** `fillText` is the slowest primitive used here; the FPS cap and DPR 1.5 keep it cheap. `ctx.font` is set in `setup` because resizing the canvas resets context state. Never put body text over it without a solid or heavily blurred panel.

### 36. OffscreenCanvas in a worker
**Looks like:** the same effect as recipe 26, but rendered off the main thread so scroll libraries, hydration and React work cannot make it stutter (and it cannot make them stutter).  
**Use when / avoid when:** heavy canvases (thousands of particles, flow fields) on pages that also run GSAP/Lenis or heavy React. Not needed for light effects; pointer interactivity requires posting pointer coordinates to the worker.  
**Stack:** OffscreenCanvas + module Worker (`transferControlToOffscreen` and 2D context in workers: Chrome 69, Firefox 105, Safari 16.4)

```tsx
// components/fx/WorkerStarfield.tsx
"use client";
import { useEffect, useRef } from "react";

export function WorkerStarfield({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !("transferControlToOffscreen" in HTMLCanvasElement.prototype)) return; // fallback: render <Starfield/>
    // Create the canvas imperatively: transferControlToOffscreen() works once per element,
    // and React StrictMode runs effects twice in dev.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    host.appendChild(canvas);
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker(new URL("../../workers/starfield.worker.ts", import.meta.url), { type: "module" });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    worker.postMessage({ type: "init", canvas: offscreen, width: host.clientWidth, height: host.clientHeight, dpr, reduce }, [offscreen]);

    const ro = new ResizeObserver(([entry]) => {
      worker.postMessage({ type: "resize", width: entry.contentRect.width, height: entry.contentRect.height, dpr });
    });
    ro.observe(host);
    let inView = false;
    const setRunning = () => worker.postMessage({ type: "run", value: inView && !document.hidden });
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      setRunning();
    }, { rootMargin: "120px" });
    io.observe(host);
    document.addEventListener("visibilitychange", setRunning);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", setRunning);
      worker.terminate();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className={`pointer-events-none absolute inset-0 ${className}`} />;
}
```

```ts
// workers/starfield.worker.ts
type Msg =
  | { type: "init"; canvas: OffscreenCanvas; width: number; height: number; dpr: number; reduce: boolean }
  | { type: "resize"; width: number; height: number; dpr: number }
  | { type: "run"; value: boolean };

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let w = 0;
let h = 0;
let reduce = false;
let running = false;
let raf = 0;
let last = 0;
let stars: { x: number; y: number; z: number }[] = [];

// requestAnimationFrame exists in dedicated workers in current engines; fall back to a timer
const tick = (cb: (t: number) => void): number =>
  typeof self.requestAnimationFrame === "function" ? self.requestAnimationFrame(cb) : (setTimeout(() => cb(performance.now()), 16) as unknown as number);
const cancel = (id: number) => (typeof self.cancelAnimationFrame === "function" ? self.cancelAnimationFrame(id) : clearTimeout(id));

function resize(width: number, height: number, dpr: number) {
  if (!canvas || !ctx) return;
  w = width;
  h = height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.min(3000, Math.round((w * h) / 1200));
  stars = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() ** 2 }));
  draw(0);
}

function draw(dt: number) {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgb(226 232 255)";
  for (const s of stars) {
    s.y -= (0.15 + s.z) * 12 * dt;
    if (s.y < -2) {
      s.y = h + 2;
      s.x = Math.random() * w;
    }
    ctx.globalAlpha = 0.2 + 0.8 * s.z;
    const size = 0.5 + s.z * 1.5;
    ctx.fillRect(s.x, s.y, size, size);
  }
  ctx.globalAlpha = 1;
}

function loop(t: number) {
  const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
  last = t;
  draw(dt);
  raf = tick(loop);
}

function setRunning(value: boolean) {
  const next = value && !reduce;
  if (next === running) return;
  running = next;
  if (running) {
    last = 0;
    raf = tick(loop);
  } else {
    cancel(raf);
  }
}

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  if (m.type === "init") {
    canvas = m.canvas;
    ctx = canvas.getContext("2d");
    reduce = m.reduce;
    resize(m.width, m.height, m.dpr);
  } else if (m.type === "resize") {
    resize(m.width, m.height, m.dpr);
  } else {
    setRunning(m.value);
  }
};
```

**Tune:** same values as recipe 26; worker canvases comfortably handle 3-5x the particle count of main-thread ones before the GPU raster becomes the limit.  
**A11y/perf:** the main thread only posts resize/visibility messages. Next 16 (Turbopack and webpack) bundles `new Worker(new URL("./x.ts", import.meta.url), { type: "module" })` natively. A strict CSP needs `worker-src 'self'`. Pointer effects: forward `{x, y}` from a passive `pointermove` listener with `postMessage`, at most once per frame.

### Choosing: CSS/SVG vs Lottie vs Rive
Runtime sizes measured from the npm tarballs on 2026-09-26 (gzip -9).

| Need | Pick | Why | Runtime cost (gz) |
|---|---|---|---|
| UI micro-interactions: toggles, icon swaps, loaders, line draws | CSS/SVG code (recipes 14-24) | zero runtime, themeable with CSS vars, crisp, accessible, reduced-motion trivial | 0 KB |
| Designer-made illustration loop from After Effects, not interactive | dotLottie (`.lottie`) | zipped JSON + assets (smaller files), theming, markers, worker renderer | JS 32 KB + WASM 484 KB (fetched from jsDelivr unless self-hosted) |
| Same, but you cannot afford a WASM download | lottie-web 5.13 `lottie_light` (SVG renderer) | pure JS, no WASM | 45 KB (full build with canvas/html renderers + expressions: 74 KB) |
| Scroll-scrubbed illustration | dotLottie `setFrame()` or lottie-web `goToAndStop(frame, true)` | frame-accurate seeking | as above |
| Interactive, stateful illustration (character follows cursor, physical toggles, onboarding) | Rive (`@rive-app/react-webgl2` 4.35, or `react-canvas-lite`) | state machines + data binding, tiny `.riv` files (typically 5-100 KB) | canvas-lite: JS 92 KB + WASM 351 KB; canvas: 99 KB + 786 KB; webgl2 (Rive's recommended default, vector feathering): WASM 885 KB |
| Photoreal/3D render, heavy particles, long cinematic loop | `<video autoplay muted loop playsinline>` (AV1/H.264 + poster) | hardware decode, near-zero CPU | 0 KB |
| A dozen animated icons | CSS/Motion (recipe 22) | one Lottie per icon = a dozen canvases + JSON parses | 0-5 KB |

Budgets: Lottie icon JSON under 20 KB, hero illustration under 150 KB gz; over ~300 KB, or with embedded raster images, export video instead. Load any WASM runtime lazily (`next/dynamic(..., { ssr: false })` inside a client component, below the fold) and never on the critical path for one decorative loop. Every Lottie/Rive instance is a canvas: more than ~6 playing at once is a smell. Rive webgl2 shares one WebGL context across all its canvases by default (`useOffscreenRenderer`).

### 37. dotLottie player
**Looks like:** a designer's After Effects animation (illustration loop, empty state, success check) playing crisply at any size.  
**Use when / avoid when:** illustrations the team authors in AE or Lottie Creator. Avoid Lottie for things CSS does in 10 lines (spinners, checkmarks, hover icons): you pay ~500 KB of WASM for a spinner.  
**Stack:** @lottiefiles/dotlottie-react 0.19 (wraps dotlottie-web 0.80)

```tsx
// components/media/LottiePlayer.tsx
"use client";
import { useEffect, useState } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";

type Props = { src: string; label?: string; loop?: boolean; staticFrame?: "first" | "last"; className?: string };

export function LottiePlayer({ src, label, loop = true, staticFrame = "last", className }: Props) {
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!player) return;
    const apply = () => {
      if (reduce) {
        player.pause();
        player.setFrame(staticFrame === "last" ? player.totalFrames - 1 : 0); // meaningful still, not a blank
      } else if (!player.isPlaying) {
        player.play();
      }
    };
    if (player.isLoaded) apply();
    player.addEventListener("load", apply);
    return () => player.removeEventListener("load", apply);
  }, [player, reduce, staticFrame]);

  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={!reduce}
      renderConfig={{ autoResize: true, freezeOnOffscreen: true }} // freeze = pause rendering while offscreen (default true)
      dotLottieRefCallback={setPlayer}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
```

```ts
// app/providers/lottie-wasm.ts - self-host the WASM (CSP, privacy, no third-party CDN on the critical path)
// copy node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm to /public/wasm/ on every upgrade
"use client";
import { setWasmUrl } from "@lottiefiles/dotlottie-react";
setWasmUrl("/wasm/dotlottie-player.wasm");
```

**Tune:** `speed` 0.8-1.2; `mode` `"bounce"` for breathing loops; `segment [start, end]` or `marker` to play a named section (intro once, then loop a segment); `renderConfig.devicePixelRatio` 1-1.5 for large canvases; `useFrameInterpolation={false}` keeps the stepped AE frame rate (right for hand-drawn/cel styles).  
**A11y/perf:** reduced motion pauses on a chosen meaningful frame. Canvas has no text: provide `aria-label` when it conveys meaning, otherwise hide it. For heavy files use `DotLottieWorkerReact` (same props, renders in a worker). Events available: `load`, `loadError`, `play`, `pause`, `complete`, `loop`, `frame`, `freeze`, `unfreeze`, `ready`, state-machine events.

### 38. Scroll-synced Lottie
**Looks like:** an illustration that advances frame-by-frame as the user scrolls through a pinned section (Apple-style product explainer, but vector).  
**Use when / avoid when:** a 2-4 step explanation with one illustration. Scrubbing 10 MB of Lottie across a 600vh section is a video's job (see `scroll-gsap.md` for image-sequence and video scrubbing).  
**Stack:** dotLottie + Motion `useScroll` (GSAP alternative in Tune)

```tsx
// components/media/ScrollLottie.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

type Props = { src: string; label: string; length?: string };

export function ScrollLottie({ src, label, length = "300vh" }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [player, setPlayer] = useState<DotLottie | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const seek = useCallback(
    (p: number) => {
      if (!player?.isLoaded) return;
      const t = reduce ? 1 : Math.min(1, Math.max(0, p));
      player.setFrame(t * (player.totalFrames - 1));
    },
    [player, reduce],
  );

  useMotionValueEvent(scrollYProgress, "change", seek);

  useEffect(() => {
    if (!player) return;
    const onLoad = () => seek(scrollYProgress.get()); // sync the first frame to the current scroll position
    if (player.isLoaded) onLoad();
    player.addEventListener("load", onLoad);
    return () => player.removeEventListener("load", onLoad);
  }, [player, seek, scrollYProgress]);

  return (
    <section ref={sectionRef} style={{ height: reduce ? "auto" : length }} className="relative">
      <div className="sticky top-0 grid h-svh place-items-center">
        <DotLottieReact
          src={src}
          autoplay={false}
          loop={false}
          dotLottieRefCallback={setPlayer}
          role="img"
          aria-label={label}
          className="aspect-square w-[min(80vw,640px)]"
        />
      </div>
    </section>
  );
}
```

**Tune:** section length 200-400vh (about 100vh per story beat); offsets `["start start", "end end"]` for pinned playback, `["start end", "end start"]` to play while passing through; GSAP version: `ScrollTrigger.create({ trigger, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (self) => player.setFrame(self.progress * (player.totalFrames - 1)) })`. lottie-web version: `anim.goToAndStop(frame, true)` with `autoplay: false`.  
**A11y/perf:** `setFrame` renders on demand, no RAF loop while idle; fractional frames render smoothly with frame interpolation (default on). Reduced motion collapses the tall section and shows the final frame. Pair each story beat with real text in the DOM; the illustration is supplementary.

### 39. Rive with data binding
**Looks like:** an interactive vector illustration or control that reacts with authored physics and states: a toggle that squashes, a mascot whose eyes follow the cursor, a progress character.  
**Use when / avoid when:** interactivity is the point and a designer owns the `.riv` file. Do not use Rive for static illustrations (SVG) or simple loops (Lottie/CSS).  
**Stack:** @rive-app/react-webgl2 4.35 (or `@rive-app/react-canvas-lite` for the smallest runtime when the file uses no text/layout/audio/scripting)

```tsx
// components/media/RiveSwitch.tsx
"use client";
import { useEffect, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModelInstanceBoolean,
  useViewModelInstanceNumber,
} from "@rive-app/react-webgl2";

// Contract agreed with the designer: artboard "Switch", state machine "State Machine 1",
// default view model with booleans "isOn" and "reduceMotion" and a number "hover" (0-100).
type Props = { on: boolean; onChange: (on: boolean) => void; label: string; src?: string };

export function RiveSwitch({ on, onChange, label, src = "/rive/switch.riv" }: Props) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const { rive, RiveComponent } = useRive(
    {
      src,
      artboard: "Switch",
      stateMachines: "State Machine 1",
      autoplay: true,
      autoBind: true,                         // bind the default view model instance
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      shouldDisableRiveListeners: true,       // the React <button> owns interaction
      isTouchScrollEnabled: true,             // touch drags on the canvas still scroll the page
    },
    { shouldUseIntersectionObserver: true },  // stop rendering while offscreen
  );

  const vmi = rive?.viewModelInstance ?? null;
  const { value: isOn, setValue: setIsOn } = useViewModelInstanceBoolean("isOn", vmi);
  const { setValue: setReduceMotion } = useViewModelInstanceBoolean("reduceMotion", vmi);
  const { setValue: setHover } = useViewModelInstanceNumber("hover", vmi);

  useEffect(() => {
    if (isOn !== null && isOn !== on) setIsOn(on);    // React state is the source of truth
  }, [on, isOn, setIsOn]);
  useEffect(() => {
    if (vmi) setReduceMotion(reduce);                  // the .riv swaps to instant transitions
  }, [vmi, reduce, setReduceMotion]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      onPointerEnter={() => setHover(100)}
      onPointerLeave={() => setHover(0)}
      className="relative h-12 w-20 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <RiveComponent aria-hidden="true" className="absolute inset-0" />
    </button>
  );
}
```

**Tune:** `Fit.Contain` for icons/controls, `Fit.Cover` for backgrounds, `Fit.Layout` for Rive layouts that should reflow; pass `useDevicePixelRatio` / `customDevicePixelRatio` in the options object to cap DPR on big canvases; number inputs 0-100 are easier for designers to reason about than 0-1.  
**A11y/perf:** the semantics live on the native `<button role="switch">`; the canvas is decorative. State machine inputs (`useStateMachineInput`) still work but are marked deprecated in rive-react 4.35 in favor of data binding; author new files with view models. `canvas-lite` silently drops text, layout, audio and scripting: verify the file in that runtime before shipping it. Preload the `.riv` with `<link rel="preload" as="fetch" crossorigin>` when it is above the fold.

## Background taste

**Background vs content.** A background has a contrast budget. Squint test: blur a screenshot to ~20px; if the background shapes are more prominent than the headline block, it is competing. Rules that hold up:
- One moving layer per viewport. Aurora OR particles OR beams, never all three. Motion elsewhere on the page (hover, scroll reveals) already spends attention.
- Ambient loops: 20-60s cycles, small travel. Anything under ~8s per cycle reads as a screensaver.
- Backgrounds should live in a ~10-15% lightness band around the page color; accents (beams, glints) may exceed it only in small areas far from text.
- Stop the show after the hero: pause everything offscreen (recipe 25 does it for canvas; for CSS toggle `animation-play-state: paused` via an IntersectionObserver class) and keep reading sections still.

**Contrast safety on busy backgrounds.** WCAG minimums (4.5:1 body, 3:1 for 24px+ or 18.66px+ bold) must hold against the worst pixel under the text in every frame of an animation, not the average.

```css
/* styles/text-safety.css */
/* 1) Quiet zone: carve the effect away from the headline area */
.bg-effect--quiet { mask-image: radial-gradient(ellipse 38% 26% at 50% 42%, transparent 0 55%, #000 100%); }

/* 2) Scrim: a gradient between effect and text (cheap, reliable) */
.scrim::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, color-mix(in oklab, var(--page-bg) 0%, transparent), var(--page-bg) 85%);
  pointer-events: none;
}

/* 3) Local halo for display text over imagery (not a hard drop shadow) */
.halo-text { text-shadow: 0 1px 2px rgb(0 0 0 / 0.35), 0 0 24px rgb(0 0 0 / 0.35); }
```

**What screams "2024 AI template"** (seen across countless Magic UI / Aceternity starters): near-black page + purple/indigo aurora or top-center white radial glow; dot grid with radial fade; animated beams or meteors; a shimmering "New: v2 is live" pill with a rotating gradient border; gradient-clipped headline; glass bento cards with border beams; sparkles around one word. Each piece is fine alone; together they are a fingerprint.

**Making it bespoke:**
- Derive the palette from the product or brand imagery, not "violet to cyan". One hue family with 30-60deg offsets, moderate chroma.
- Tie the background to the product's own material: a code tool gets a grid aligned to monospace cells; logistics gets routes (recipe 20); audio gets waveforms; finance gets tick marks; hardware gets traces (recipe 23).
- Use asymmetry: glow off-center, grids that stop at a column edge, beams from a corner. Centered radial glows are the default.
- Motion with meaning: drive it by scroll progress, data or interaction instead of a blind loop (a beam that fires when a step completes beats one that fires every 3s).
- Texture over glow: grain (recipe 3), real photography, paper, halftone or dithering read as crafted; glows read as generated.
- Light mode deserves its own treatment: auroras on white turn muddy; use low-chroma pastels, 6-8% grid ink and a tinted off-white base (not #fff).
- Dark mode: avoid pure #000 with glows (banding, OLED smear); use oklch 14-18% lightness with a slight hue, plus dither.

## Gotchas
- **Animating `filter: blur()` (or blurring a layer whose content animates) repaints every frame.** Blur once, statically, and move the layer with `transform`; or skip the filter and use `radial-gradient(closest-side, color, transparent)` falloff (recipe 2). Aceternity's Aurora Background and Background Gradient Animation both animate under a full-screen blur: expect jank on laptops on battery.
- **`@property`/`background-position` animations run on the main thread and repaint the box.** Fine for a card or a hero on desktop, bad as a `position: fixed` full-page layer on phones. Prefer transform-based motion for anything full-bleed.
- **CSS animations keep running offscreen.** Add an IntersectionObserver that toggles a class setting `animation-play-state: paused` on the effect root (and its descendants via `.is-paused * { animation-play-state: paused; }`).
- **Fixed grain + `mix-blend-mode` makes scrolling expensive** on low-end devices (every scroll frame re-blends the viewport). Use normal blending at low opacity; reserve blend modes for desktop.
- **SVG data URIs break silently** if `#` is not encoded (`%23`), `%` is not encoded (`%25`), or double quotes clash with the CSS string. Use single quotes inside the SVG and `url("...")` outside.
- **Filters/masks/gradients defined in an SVG with `display: none` do not render in Firefox (and are flaky elsewhere).** Hide the defs SVG with `width="0" height="0" style="position:absolute"` instead.
- **Duplicate SVG ids** (a component rendered twice, each defining `id="goo"`) make every instance point at the first definition; if that one unmounts, the others lose the effect. Pass unique ids; if you derive them from `useId()`, strip characters that are invalid inside `url(#...)` (see recipe 19).
- **Blurry canvas** means the backing store is CSS-sized. Size `canvas.width/height` by DPR and use `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`; calling `ctx.scale(dpr, dpr)` on every resize compounds the scale.
- **Setting `canvas.width` resets the whole 2D context** (transform, font, lineCap, globalAlpha). Re-apply state in `setup` after every resize (recipe 35 sets the font there).
- **`Math.random()` during render causes hydration mismatches** for server-rendered decorative elements (meteor positions, star lists). Generate random layouts in `useEffect` (recipe 30) or inside the canvas setup.
- **React StrictMode runs effects twice in dev:** `transferControlToOffscreen()` throws the second time, and canvas-confetti with `useWorker: true` owns its canvas. Create such canvases imperatively inside the effect and remove them in cleanup (recipe 36).
- **React overwrites GSAP-animated SVG attributes** (`d`, `r`, `scale`) whenever the corresponding prop changes. Keep those props constant and let GSAP own the value (recipes 15, 18).
- **Round linecaps show a dot at the path start** while a `pathLength="1"` path is fully hidden by dashoffset. Add an opacity step at 0-2% of the draw keyframes, or use `butt` caps while hidden.
- **Firefox DrawSVG stops 1-2% short** on some paths: tween to `"102%"`. iOS Safari mis-draws `<rect>` strokes: convert to `<path>`.
- **`animation-timeline` is not Baseline in 2026** (Chrome 115+, Safari 26+, Firefox behind a flag). Wrap scroll-driven CSS in `@supports (animation-timeline: view())` and make the unsupported state the finished state.
- **`offset-path: rect()` needs Safari 18+** (Chrome 116, Firefox 122). Gate with `@supports` and fall back to a static border or the conic border (recipe 7).
- **Glass inside a parent with `opacity < 1`, `filter`, `mask` or `mix-blend-mode`** blurs only within that parent (it becomes the backdrop root), so glass "pops" when a fade-in finishes. Animate the glass element itself, or enter with transform only.
- **Grids shimmer on 125%/150% Windows scaling** when cell sizes or positions are fractional. Use integer px cells and 1px lines; for dots, a 1px core with a 0.5px antialias ring.
- **SMIL `<animate>` ignores `prefers-reduced-motion`.** Render the `<animate>` element conditionally from JS.
- **dotLottie fetches its ~484 KB (gz) WASM from jsDelivr by default.** Strict CSP (`connect-src`) or offline builds fail with `loadError`. Self-host with `setWasmUrl()` and copy the `.wasm` from `node_modules` on every upgrade; `DotLottie.preload()` (from `@lottiefiles/dotlottie-web`) or a versioned `<link rel="preload" as="fetch" crossorigin>` removes it from the first-animation critical path.
- **Rive canvases eat touch scroll on mobile** when the file has listeners: set `isTouchScrollEnabled: true`. `@rive-app/react-canvas-lite` drops text/layout/audio/scripting and the affected content just does not appear.
- **GSAP plugin imports:** since 3.13 every plugin ships in the public `gsap` package (`import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"`); delete old `gsap-trial` dependencies and private-registry `.npmrc` tokens from legacy projects.
- **canvas-confetti types** come from `@types/canvas-confetti`; `disableForReducedMotion` defaults to `false`, so set it on every call.
- **Library backgrounds that `setState` per pointer move** (Magic UI Particles) or never pause offscreen re-render React at 60-120 Hz. Wrap or rewrite on recipe 25.

## Sources
- https://github.com/magicuidesign/magicui (apps/www/registry/magicui: animated-beam, border-beam, retro-grid, flickering-grid, meteors, particles, ripple, shine-border, noise-texture, light-rays; apps/www/registry.json keyframes)
- https://github.com/DavidHDev/react-bits (src/ts-tailwind/Backgrounds: all 57 backgrounds classified by renderer; DotGrid, Waves, ShapeGrid, LetterGlitch, DotField read in full)
- https://ui.aceternity.com/components/aurora-background and https://ui.aceternity.com/registry/{aurora-background,background-beams,meteors,sparkles,wavy-background,spotlight,background-gradient-animation}.json
- https://css-tricks.com/grainy-gradients/
- https://www.joshwcomeau.com/css/make-beautiful-gradients/
- https://www.joshwcomeau.com/react/rainbow-button/
- https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/
- https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/
- https://gsap.com/docs/v3/Plugins/MotionPathPlugin/
- https://github.com/LottieFiles/dotlottie-web (packages/react/README.md, packages/react/src, packages/web/README.md, packages/web/src/types.ts, event-manager.ts, dotlottie.ts)
- https://docs.lottiefiles.com/en/runtimes/distributions/react
- https://rive.app/docs/runtimes/react/react
- https://rive.app/docs/runtimes/web/canvas-vs-webgl
- https://github.com/rive-app/rive-react (README, src/types.ts, src/index.ts, src/hooks/useStateMachineInput.ts, useViewModel*.ts)
- https://github.com/rough-stuff/rough-notation (README)
- https://github.com/catdad/canvas-confetti (README)
- https://github.com/veltman/flubber (README)
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset-path
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline
- https://github.com/mdn/browser-compat-data (css/properties/offset-path.json, animation-timeline.json, mask-composite.json; css/types/gradient.json; api/OffscreenCanvas.json; api/HTMLCanvasElement.json)
- npm registry tarballs measured locally (gzip -9): @rive-app/canvas, canvas-lite, webgl2 2.43.1; @lottiefiles/dotlottie-web 0.80.0; lottie-web 5.13.0; canvas-confetti 1.9.4; rough-notation 0.5.1; flubber 0.4.2; simplex-noise 4.0.3. Versions: @lottiefiles/dotlottie-react 0.19.16, @rive-app/react-webgl2 and react-canvas 4.35.0.

