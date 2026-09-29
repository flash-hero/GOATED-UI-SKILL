# Performance and Accessibility for Animated Sites
> Load when: an animated page janks, drops frames, hurts LCP/INP/CLS, needs reduced-motion or WCAG handling, or before shipping ANY page with scroll, WebGL, split text, smooth scroll, marquees or page transitions (run the QA checklist at the end).
> Stack assumptions: React 19 / Next 16 App Router + TS, gsap 3.15 + @gsap/react, motion 13.4 (`motion/react`), lenis 1.3.26, three 0.186 / R3F 9, Playwright for QA. Vanilla equivalents given where cheap.

Motion taste and tokens: `motion-principles.md`. Scroll mechanics: `scroll-gsap.md`, `scroll-css-native.md`. Route-change focus/announcements and preloader patterns: `page-transitions.md`. WebGL internals: `webgl-shaders-3d.md`.

## Contents
- [Decision guide](#decision-guide)
- Performance
  - [1. Property cost table](#1-property-cost-table)
  - [2. Expensive effects: filter, backdrop-filter, clip-path, mask, box-shadow, blur](#2-expensive-effects-filter-backdrop-filter-clip-path-mask-box-shadow-blur)
  - [3. will-change strategy and layer explosion](#3-will-change-strategy-and-layer-explosion)
  - [4. contain and content-visibility](#4-contain-and-content-visibility)
  - [5. One RAF loop (gsap.ticker drives Lenis and everything else)](#5-one-raf-loop-gsapticker-drives-lenis-and-everything-else)
  - [6. Pause offscreen work, cap DPR](#6-pause-offscreen-work-cap-dpr)
  - [7. Low-end and data-saver detection: motion tiers](#7-low-end-and-data-saver-detection-motion-tiers)
  - [8. LCP, preloaders and entrance animations](#8-lcp-preloaders-and-entrance-animations)
  - [9. CLS from animations and font loading](#9-cls-from-animations-and-font-loading)
  - [10. INP: scroll and pointer handlers without jank](#10-inp-scroll-and-pointer-handlers-without-jank)
- Measuring
  - [11. DevTools workflow](#11-devtools-workflow)
  - [12. Long Animation Frames observer](#12-long-animation-frames-observer)
  - [13. Playwright motion QA](#13-playwright-motion-qa)
  - [14. Lighthouse caveats](#14-lighthouse-caveats)
- Accessibility
  - [15. Reduced motion: reduce, don't remove](#15-reduced-motion-reduce-dont-remove)
  - [16. Reduced-motion code for every layer (CSS, GSAP, Motion, Lenis, user toggle)](#16-reduced-motion-code-for-every-layer-css-gsap-motion-lenis-user-toggle)
  - [17. WCAG 2.2 criteria and vestibular triggers](#17-wcag-22-criteria-and-vestibular-triggers)
  - [18. Pause controls for marquees, carousels, video](#18-pause-controls-for-marquees-carousels-video)
  - [19. Transparency, contrast, forced colors](#19-transparency-contrast-forced-colors)
  - [20. Focus, inert and aria-busy around animation](#20-focus-inert-and-aria-busy-around-animation)
  - [21. Smooth scroll vs anchors, find-in-page, keyboard](#21-smooth-scroll-vs-anchors-find-in-page-keyboard)
  - [22. Split text accessibility](#22-split-text-accessibility)
  - [23. Touch, hover and coarse pointers](#23-touch-hover-and-coarse-pointers)
  - [24. Route-change announcements](#24-route-change-announcements)
- [QA checklist before shipping](#qa-checklist-before-shipping)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide

| Symptom / goal | Technique | Cost | Recipe |
|---|---|---|---|
| Choppy animation | Animate transform/opacity only; check paint flashing | 0 | [1](#1-property-cost-table), [11](#11-devtools-workflow) |
| Frosted glass header lags while scrolling | Smaller blur radius/area, solid fallback, reduced-transparency | CSS | [2](#2-expensive-effects-filter-backdrop-filter-clip-path-mask-box-shadow-blur), [19](#19-transparency-contrast-forced-colors) |
| GPU memory spikes, mobile tab crashes | Remove blanket `will-change`, cap DPR | CSS / JS | [3](#3-will-change-strategy-and-layer-explosion), [6](#6-pause-offscreen-work-cap-dpr) |
| Long page, slow style/layout | `content-visibility: auto` below the fold | CSS | [4](#4-contain-and-content-visibility) |
| Lenis + ScrollTrigger + canvas stutter / drift | Single ticker | ~0 kb | [5](#5-one-raf-loop-gsapticker-drives-lenis-and-everything-else) |
| Battery drain, fans spin on idle page | Pause loops/WebGL offscreen and in hidden tabs | ~0.5 kb | [6](#6-pause-offscreen-work-cap-dpr) |
| Old phones choke on WebGL | Motion tiers from device hints + FPS probe | ~1 kb | [7](#7-low-end-and-data-saver-detection-motion-tiers) |
| Bad LCP after adding an intro/preloader | Never hide the LCP element; preloader < 1 s, first visit only | 0 | [8](#8-lcp-preloaders-and-entrance-animations) |
| CLS from reveals or web fonts | transform-only reveals, `next/font` metric fallbacks | 0 | [9](#9-cls-from-animations-and-font-loading) |
| Poor INP on pages with cursor/scroll effects | passive listeners, rAF batching, no read/write thrash, yield | 0 | [10](#10-inp-scroll-and-pointer-handlers-without-jank) |
| Need proof, not vibes | LoAF observer, Playwright traces + throttled frame probe | dev only | [12](#12-long-animation-frames-observer), [13](#13-playwright-motion-qa) |
| Reduced motion | Substitute fades; one preference source for CSS/GSAP/Motion/Lenis | ~0 | [15](#15-reduced-motion-reduce-dont-remove), [16](#16-reduced-motion-code-for-every-layer-css-gsap-motion-lenis-user-toggle) |
| Marquee / auto carousel / looping video | Pause button + pause offscreen (WCAG 2.2.2) | ~0.5 kb | [18](#18-pause-controls-for-marquees-carousels-video) |
| Split headings read letter by letter | SplitText `aria: "auto"` on headings only, or sr-only copy | 0 | [22](#22-split-text-accessibility) |
| Hover effects on phones | `(hover: hover) and (pointer: fine)` gates | CSS | [23](#23-touch-hover-and-coarse-pointers) |

## Recipes

### 1. Property cost table
**Looks like:** Animations that hold 60/120 fps on a mid-range phone because every frame only touches the compositor.  
**Use when / avoid when:** Choosing what to animate for every effect. The slop version animates `top/left/width/height/margin`, `box-shadow` or `filter: blur()` on big sections "because it looked fine on my M-series Mac".  
**Stack:** CSS | any JS library

Rendering pipeline per frame: **JS -> Style -> Layout -> Paint -> Composite**. Changing a property re-runs its stage and every stage after it. Budget: 16.7 ms per frame at 60 Hz (8.3 ms at 120 Hz), and the browser needs part of that, so aim for < 8-10 ms of your own work.

| Property animated | Stages re-run | Verdict |
|---|---|---|
| `transform` (and individual `translate` / `scale` / `rotate`), `opacity` | Composite (when the element has its own layer) | Default choice. CSS/WAAPI transform/opacity animations can run off the main thread entirely |
| `filter` (blur, brightness, saturate...) | Composite-animatable in Chromium, but GPU cost grows with area x radius | OK on small elements; costly full-screen |
| `clip-path` (`inset()`, `circle()`, `ellipse()`, `polygon()` with same point count) | Chromium composites CSS/WAAPI clip-path animations (runtime flag `CompositeClipPathAnimation` = stable); Safari/Firefox: Paint | OK for image-sized reveals |
| `background-color` | Chromium composites CSS/WAAPI animations (`CompositeBGColorAnimation` = stable); others: Paint | OK, small-to-medium areas |
| `color`, `border-color`, `outline`, `box-shadow`, `background-position`, gradients, `text-shadow` | Paint | Small areas, short durations only |
| `mask-image` / `mask-position` / `mask-size` | Paint (mask layer) | OK on one element; avoid scrubbed full-screen masks |
| `backdrop-filter` | GPU re-filters whatever is behind, every frame the backdrop changes | Small sticky bars only |
| `width`, `height`, `padding`, `margin`, `top/left/right/bottom`, `inset`, `font-size`, `line-height`, `border-width`, `grid-template-*`, `flex-basis` | Layout -> Paint -> Composite (and every descendant/sibling that reflows) | Avoid per frame. Use FLIP (`motion-principles.md#16-state-changes-layout--flip`) |
| CSS custom properties driving other props | Style recalc for every element that inherits the variable, then whatever the consumer triggers | Register with `@property { inherits: false }` and set on the element itself |
| SVG geometry (`d`, `r`, `points`, `stroke-dashoffset`) | Paint of the SVG | Fine for icon-sized SVG; avoid huge SVG scenes scrubbed |

Library behaviour that matters:
- **GSAP** writes inline styles every tick on the main thread. transform/opacity are still composite-cheap, but a blocked main thread stalls them. `force3D: "auto"` (default) uses a 3D transform during the tween (own layer) and drops back to 2D at the end to release memory.
- **Motion 13.4** hands `opacity`, `clipPath`, `filter`, `backgroundColor` and the full `transform` string to WAAPI (hardware accelerated, off the main thread) unless you use `onUpdate`, `repeatDelay`, `repeatType: "mirror"`, `damping: 0` or inertia. The shorthands `x`, `y`, `scale`, `rotate` run on Motion's JS frameloop (composite-cheap, but main-thread-timed).
- **CSS transitions/animations** of transform/opacity: compositor thread, survive main-thread jank. Best for always-on loops.

**Tune:** If an effect needs a paint-heavy property, reduce area (animate a small child), duration, and simultaneity (one at a time).  
**A11y/perf:** The same property rules apply under reduced motion: an opacity crossfade is the cheapest possible substitution.

### 2. Expensive effects: filter, backdrop-filter, clip-path, mask, box-shadow, blur
**Looks like:** Frosted headers, blurred glows, masked reveals and soft shadows that still scroll at full frame rate.  
**Use when / avoid when:** Use the matrix below. The AI-slop combo is a full-viewport `backdrop-filter: blur(40px)` glass card stacked over an animated gradient mesh, over a WebGL canvas, all scrubbed.  
**Stack:** CSS

| Effect | Fine | Janky | Fix |
|---|---|---|---|
| `filter: blur()` animated | icons, labels, <= 300 x 300 px, <= 8 px radius, one-shot | full sections, radius > 20 px, scrubbed on scroll, many at once | animate opacity between a sharp and a pre-blurred copy; blur a downscaled image |
| Static large blur (glow blobs) | pre-rendered PNG/WebP, or a radial-gradient | live `filter: blur(120px)` on big divs that also move | bake the glow into an image or use `radial-gradient()` |
| `backdrop-filter` | sticky nav bar, small popovers, blur 8-20 px | full-screen overlays over moving/video/WebGL content; nested glass inside glass | solid/translucent fallback on low tier and under `prefers-reduced-transparency`; keep area small |
| `clip-path` reveal | images/cards, `inset()`/`circle()`, CSS/WAAPI-driven | full-viewport clip scrubbed by JS every frame (repaints), polygon with many points | CSS or WAAPI timing; scale a masked child instead |
| `mask-image` gradient fades | static edge fades on marquees/lists | animated `mask-position` over large areas | animate an overlay gradient's opacity/transform instead |
| `box-shadow` animation | tiny elements, 150 ms hovers | cards grid all animating shadow on hover | animate `opacity` of a pseudo-element that carries the shadow |
| `mix-blend-mode` | cursor dot, one headline | large blended layers over video/WebGL (forces extra compositing) | limit to small layers; test on Safari |
| Stacked effects | one expensive effect per element | blur + backdrop + blend + shadow on one scrolling element | choose one |

```css
/* Frosted header done responsibly */
.site-header {
  position: sticky; top: 0;
  background: rgb(255 255 255 / 0.92);            /* fallback = also the reduced-transparency look */
}
@supports (backdrop-filter: blur(12px)) {
  .site-header {
    background: rgb(255 255 255 / 0.6);
    backdrop-filter: saturate(1.4) blur(12px);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .site-header { background: rgb(255 255 255 / 0.96); backdrop-filter: none; }
}
:root[data-motion-tier="lite"] .site-header { backdrop-filter: none; background: rgb(255 255 255 / 0.96); }

/* Shadow lift without animating box-shadow */
.card { position: relative; transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1); }
.card::after {
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  box-shadow: 0 24px 48px -16px rgb(0 0 0 / 0.35);
  opacity: 0; transition: opacity 250ms cubic-bezier(0.22, 1, 0.36, 1);
}
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-4px); }
  .card:hover::after { opacity: 1; }
}

/* Blur-in without animating filter on a big element: crossfade a pre-blurred copy */
.hero-img { display: grid; overflow: hidden; }
.hero-img img { grid-area: 1 / 1; width: 100%; }
.hero-img .blurred { filter: blur(24px); transform: scale(1.05); transition: opacity 600ms ease; }
.hero-img[data-loaded="true"] .blurred { opacity: 0; }
```
**Tune:** backdrop blur 8-16 px is the premium band; above 24 px it costs more and looks muddier. Glows: use a 64-128 px wide pre-blurred image upscaled by CSS (bilinear upscaling already looks blurry and costs nothing).  
**A11y/perf:** Backdrop and translucent layers reduce text contrast: verify contrast over the busiest part of the background, and honor `prefers-reduced-transparency` (Chrome 118+; Safari/Firefox not yet, so the fallback background must itself be readable).

### 3. will-change strategy and layer explosion
**Looks like:** Smooth first frames of an animation with no GPU memory bloat.  
**Use when / avoid when:** Apply `will-change` just before a known, imminent, expensive animation, or permanently only on a handful of always-animating elements (marquee track, cursor dot, WebGL canvas wrapper). Never `* { will-change: transform }` or on every card in a grid.  
**Stack:** CSS | JS

Layer memory is roughly `width x height x DPR^2 x 4 bytes`: a full-screen layer at 1920x1080 and DPR 2 is ~33 MB. Fifty "promoted" cards in a grid can exhaust mobile GPU memory, causing checkerboarding, flicker, or a crashed tab.
```css
/* Good: permanent, few elements */
.marquee-track, .cursor-dot { will-change: transform; }

/* Good: promote only during interaction */
@media (hover: hover) and (pointer: fine) {
  .gallery:hover .tile { will-change: transform; }
}
```
```ts
// Good: add right before, remove after (JS-driven one-shot)
function animateWithHint(el: HTMLElement, run: () => Promise<unknown>) {
  el.style.willChange = "transform, opacity";
  return run().finally(() => { el.style.willChange = "auto"; });
}
// e.g. animateWithHint(panel, () => panel.animate([{ transform: "translateX(100%)" }, { transform: "none" }], { duration: 400, easing: "cubic-bezier(0.32,0.72,0,1)" }).finished);
```
Diagnose with DevTools **Layers** panel (3D view, memory estimate and "compositing reasons" per layer) and Rendering > **Layer borders**.  
**Tune:** Fewer than ~20-30 simultaneously promoted layers on mobile is a reasonable ceiling; each full-screen layer counts a lot more than a small one.  
**A11y/perf:** `will-change: transform` creates a containing block for fixed-position descendants and a stacking context; a `position: fixed` child of a promoted parent stops being fixed to the viewport. Same for `transform`, `filter`, `contain: paint`.

### 4. contain and content-visibility
**Looks like:** A long portfolio page with 40 sections that loads and restyles quickly, because offscreen sections are skipped until needed.  
**Use when / avoid when:** Long, mostly static below-the-fold sections. Avoid on sections involved in pinned/scrubbed ScrollTrigger ranges (their placeholder size shifts start/end positions until rendered) and on anything above the fold.  
**Stack:** CSS
```css
.section-offscreen {
  content-visibility: auto;              /* skip layout/paint while offscreen */
  contain-intrinsic-size: auto 900px;    /* placeholder; `auto` remembers the real size once rendered */
}
.widget { contain: layout paint; }       /* isolate a frequently-updating component (ticker, counter) */
.card-grid > * { contain: content; }     /* = layout paint style */
```
Support: `content-visibility` Chrome 85, Firefox 125, Safari 18 (the `auto` value in Safari 26). `contain-intrinsic-size` Chrome 83, Firefox 107, Safari 17.  
**Tune:** Set `contain-intrinsic-size` close to the real section height to keep the scrollbar honest. If a ScrollTrigger lives below such sections, call `ScrollTrigger.refresh()` after `contentvisibilityautostatechange` fires or give them exact intrinsic sizes.  
**A11y/perf:** Content under `content-visibility: auto` stays in the DOM and accessibility tree and remains findable with find-in-page; `content-visibility: hidden` does not. `contain: paint` clips overflow (focus rings and shadows can be cut off).

### 5. One RAF loop (gsap.ticker drives Lenis and everything else)
**Looks like:** Smooth scroll, scroll-linked tweens, the cursor follower and the WebGL scene all update in the same frame, so nothing drifts or double-renders.  
**Use when / avoid when:** Any page combining Lenis with GSAP or with custom per-frame code. Avoid separate `requestAnimationFrame` loops per component (each one is another callback per frame and they can run out of order with the scroll position).  
**Stack:** GSAP + Lenis (Motion `frame` variant below)
```tsx
// components/smooth-scroll.tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);          // every Lenis scroll event updates ScrollTrigger
  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000); // gsap time is seconds
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);           // no catch-up jumps between Lenis and GSAP
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true, lerp: 0.1 }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
```
Put all other per-frame work on the same ticker instead of new rAF loops:
```ts
// lib/frame-work.ts : per-frame work shares GSAP's ticker; each returns its cleanup
import gsap from "gsap";

export function mountCursorFollower(dot: HTMLElement) {
  const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3" });   // quickTo batches into the ticker
  const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3" });
  const onMove = (e: PointerEvent) => { xTo(e.clientX); yTo(e.clientY); };
  window.addEventListener("pointermove", onMove, { passive: true });
  return () => window.removeEventListener("pointermove", onMove);
}

/** three.js / OGL / canvas: render from the ticker instead of renderer.setAnimationLoop */
export function driveFromTicker(render: (timeSeconds: number, deltaMs: number) => void) {
  const tick = (time: number, deltaTime: number) => render(time, deltaTime);
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}
// usage: const stop = driveFromTicker(() => renderer.render(scene, camera));
```
Motion-first projects drive Lenis from Motion's frameloop instead:
```tsx
"use client";
import { useEffect, useRef } from "react";
import { cancelFrame, frame } from "motion/react";
import { ReactLenis, type LenisRef } from "lenis/react";

export function MotionLenis({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  useEffect(() => {
    const update = ({ timestamp }: { timestamp: number }) => lenisRef.current?.lenis?.raf(timestamp);
    frame.update(update, true);            // keepAlive: runs every frame
    return () => cancelFrame(update);
  }, []);
  return <ReactLenis root ref={lenisRef} options={{ autoRaf: false }}>{children}</ReactLenis>;
}
```
**Tune:** Lenis `lerp` 0.08-0.12; keep `syncTouch` off (native touch scrolling is better and cheaper). R3F: prefer `frameloop="demand"` + `invalidate()` for mostly static scenes (see `webgl-shaders-3d.md`).  
**A11y/perf:** Lenis 1.3.26 honors `prefers-reduced-motion` by default (`respectReducedMotion: true`: lerp forced to 1, `scrollTo`/anchors instant, preference picked up live). Lenis limitations: Safari capped at 60 fps (30 in Low Power Mode), no CSS scroll-snap (use `lenis/snap`), wheel events inside iframes are not smoothed.

### 6. Pause offscreen work, cap DPR
**Looks like:** The shader hero, marquee and looping video stop consuming CPU/GPU the moment they leave the viewport or the tab is hidden, and resume seamlessly.  
**Use when / avoid when:** Every infinite animation, canvas, video and WebGL scene. Browsers throttle rAF in hidden tabs, but not offscreen-but-visible-tab work, and CSS infinite animations keep compositing offscreen in some engines.  
**Stack:** IntersectionObserver + visibilitychange (React hook), CSS, three.js/R3F
```ts
// hooks/use-active-when-visible.ts
"use client";
import { useEffect } from "react";

/** Calls onChange(true) when the element is near the viewport AND the tab is visible. onChange must be stable (useCallback). */
export function useActiveWhenVisible(
  ref: React.RefObject<Element | null>,
  onChange: (active: boolean) => void,
  rootMargin = "200px 0px",
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const emit = () => onChange(inView && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; emit(); }, { rootMargin });
    io.observe(el);
    document.addEventListener("visibilitychange", emit);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", emit);
      onChange(false);
    };
  }, [ref, onChange, rootMargin]);
}
```
```tsx
// Usage: GSAP timeline, CSS loop, video, WebGL
"use client";
import { useCallback, useRef } from "react";
import { useActiveWhenVisible } from "@/hooks/use-active-when-visible";

export function LoopingBits({ tl }: { tl: gsap.core.Timeline }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onChange = useCallback((active: boolean) => {
    if (active) tl.play(); else tl.pause();
    if (ref.current) ref.current.dataset.paused = String(!active);           // CSS loops
    const v = videoRef.current;
    if (v) { if (active) void v.play().catch(() => {}); else v.pause(); }
  }, [tl]);
  useActiveWhenVisible(ref, onChange);
  return (
    <div ref={ref} className="loops">
      <div className="marquee-track"><span>Design</span><span>Motion</span><span>Code</span></div>
      <video ref={videoRef} muted loop playsInline preload="metadata" poster="/poster.jpg" src="/loop.mp4" />
    </div>
  );
}
```
```css
[data-paused="true"] * { animation-play-state: paused !important; }
```
three.js and R3F:
```ts
import * as THREE from "three";

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));   // DPR cap: 1.5 for full-screen shaders, 2 for product 3D
  return renderer;
}
// pause/resume: renderer.setAnimationLoop(active ? loop : null)  (or remove the gsap.ticker callback)
```
```tsx
// R3F: DPR range + adaptive DPR on sustained frame drops
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";

export function Scene({ children }: { children: React.ReactNode }) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas dpr={[1, dpr]} frameloop="always" gl={{ antialias: false, powerPreference: "high-performance" }}>
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      {children}
    </Canvas>
  );
}
```
(`PerformanceMonitor` needs continuous frames; for mostly static scenes use `frameloop="demand"` + `invalidate()` and drop the monitor.)  
**Tune:** `rootMargin` 100-300 px so loops restart just before they enter. DPR cap 1-1.5 for full-screen fragment shaders (fill-rate bound), 2 for detailed 3D objects; render fullscreen noise/blur passes at half resolution.  
**A11y/perf:** Offscreen pausing is also a WCAG 2.2.2 helper but not a substitute for a visible pause control (recipe 18). Under reduced motion render a single static frame of the shader.

### 7. Low-end and data-saver detection: motion tiers
**Looks like:** A flagship phone gets the WebGL hero and smooth scroll; a 3 GB Android on Save-Data gets a poster image, CSS fades and native scroll; reduced-motion users get fades only.  
**Use when / avoid when:** Any page with WebGL, video backgrounds, heavy scroll scenes. Avoid user-agent sniffing; combine hints and a real frame-rate probe.  
**Stack:** TS (client), CSS attribute hooks

| Signal | API | Support (2026) | Notes |
|---|---|---|---|
| Reduced motion | `matchMedia("(prefers-reduced-motion: reduce)")` | all | the only universal one |
| CPU cores | `navigator.hardwareConcurrency` | Chrome 37, Firefox 48, Safari 15.4 | coarse; may be clamped for privacy |
| RAM | `navigator.deviceMemory` | Chromium only | bucketed (0.25 ... 8) |
| Save-Data | `navigator.connection.saveData` / `Save-Data` request header | Chromium only | honor it: skip video/WebGL |
| Network | `navigator.connection.effectiveType` | Chromium only | `slow-2g` / `2g` / `3g` / `4g` |
| Reduced data | `@media (prefers-reduced-data: reduce)` | behind a flag only (Chrome) | write it, don't rely on it |
| Pointer | `(pointer: coarse)`, `(hover: none)` | all | touch-first, usually weaker GPU |
| Actual performance | rAF frame-time probe | all | the most honest signal |

```ts
// lib/motion-tier.ts
export type MotionTier = "full" | "lite" | "minimal";

type NavHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function detectMotionTier(): MotionTier {
  if (typeof window === "undefined") return "lite";                      // SSR-safe default
  const mq = (q: string) => window.matchMedia(q).matches;
  if (mq("(prefers-reduced-motion: reduce)")) return "minimal";

  const nav = navigator as NavHints;
  const saveData = nav.connection?.saveData === true || mq("(prefers-reduced-data: reduce)");
  const slowNet = ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "");
  const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  if (saveData || slowNet || (lowCpu && lowMem)) return "lite";
  return "full";
}

/** Measure real frame times for ~1s; downgrade if the device can't hold ~45fps idle. */
export function probeFrameRate(durationMs = 1000): Promise<number> {
  return new Promise((resolve) => {
    const deltas: number[] = [];
    let last = performance.now();
    const start = last;
    const tick = (now: number) => {
      deltas.push(now - last);
      last = now;
      if (now - start < durationMs) requestAnimationFrame(tick);
      else {
        deltas.sort((a, b) => a - b);
        resolve(deltas[Math.floor(deltas.length / 2)] ?? 16.7);          // median frame time (ms)
      }
    };
    requestAnimationFrame(tick);
  });
}

export async function applyMotionTier(): Promise<MotionTier> {
  let tier = detectMotionTier();
  if (tier === "full") {
    const median = await probeFrameRate();
    if (median > 22) tier = "lite";                                    // < ~45 fps while idle
  }
  document.documentElement.dataset.motionTier = tier;
  return tier;
}
```
```css
/* Default markup is the lite experience (poster image); full tier upgrades */
.hero-webgl { display: none; }
:root[data-motion-tier="full"] .hero-webgl { display: block; }
:root[data-motion-tier="full"] .hero-poster { visibility: hidden; }
```
| Tier | Gets |
|---|---|
| full | WebGL/shaders, Lenis, scrubbed pins, char-level split text, video backgrounds |
| lite | poster images instead of WebGL/video, native scroll, CSS/IO reveals, line-level split, DPR 1 |
| minimal | fades only, no parallax, no autoplay, static first frame of shaders |

**Tune:** Probe once per session (store in `sessionStorage`), after the intro, not during it. Use `onDecline` from drei's `PerformanceMonitor` to downgrade live.  
**A11y/perf:** Never lazy-load the WebGL bundle on the lite tier (`next/dynamic` with the tier check), so weak devices also skip the download.

### 8. LCP, preloaders and entrance animations
**Looks like:** The hero is visibly on screen within the first paint, even though it animates; any preloader is brief, first-visit-only and never the reason LCP is 3 s.  
**Use when / avoid when:** Every landing page. The slop version: a 3 s counter preloader over `opacity: 0` content, replayed on every visit.  
**Stack:** Principles + CSS/JS

Facts that drive the rules:
- Chrome ignores paints at `opacity: 0` for LCP (since M86). An element faded in from 0 may not become an LCP candidate until it is repainted, which can report a much later LCP (DebugBear); Firefox behaves differently. Chrome 130+ also excludes fully transparent text (no shadow/stroke) from LCP.
- `visibility: hidden` content is not painted, so LCP waits for the reveal.
- LCP is about when the largest element's pixels are painted, so a preloader overlay that covers already-painted content is less harmful than content that is withheld; verify in a trace.
- Safari 26.2 added LCP and Event Timing (INP) APIs, so field data now includes WebKit too.

Rules:
1. **Never hide the LCP element** (hero image, hero heading). Animate it with transform/scale/clip from a visible state, or start opacity at >= 0.1 if a fade is essential.
2. **Preloaders only when something truly must load** (WebGL scene, large sequence). Target < 1 s, show real progress, and skip on repeat visits (`sessionStorage`) and under reduced motion.
3. **Render real HTML underneath** the preloader (SSR), and remove the overlay with transform/clip-path, never by fading in the page from 0.
4. **Start the intro at first paint**, not after `window.load` or all images.
5. **Preload the hero asset**: `fetchPriority="high"` on the LCP `<img>`; do not lazy-load it.
6. **SEO**: text inside hidden/clipped wrappers is still in the HTML and indexable; what hurts is poor LCP/INP/CLS and content that only exists after interaction.

```tsx
// First-visit-only preloader gate (client), with reduced-motion skip
"use client";
import { useEffect, useState } from "react";

export function usePreloaderOnce(key = "intro-seen") {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = sessionStorage.getItem(key) === "1"; } catch { /* storage blocked */ }
    if (!seen && !reduce) {
      setShow(true);
      try { sessionStorage.setItem(key, "1"); } catch { /* storage blocked */ }
    }
  }, [key]);
  return show;
}
```
Full preloader recipes: `page-transitions.md`.  
**Tune:** preloader 0 ms (best) to 1000 ms max; intro visuals complete <= 1.6 s; LCP element painted in the first frame.  
**A11y/perf:** A preloader must not trap focus or block screen readers: mark it `aria-hidden="true"` if decorative, keep the page content in the DOM, and never `inert` the whole page for longer than the preloader actually runs.

### 9. CLS from animations and font loading
**Looks like:** Reveals and accordions that never nudge surrounding content, and headlines that do not re-wrap when the web font arrives.  
**Use when / avoid when:** Every page with entrance animations or custom fonts.  
**Stack:** CSS | Next `next/font`

- **Transforms do not create layout shifts.** Reveals using `translate`/`scale`/`opacity`/`clip-path` are CLS-free. Animating `height`, `margin`, `top`, `padding` or inserting content above the fold shifts layout.
- **Input exclusion is only 500 ms.** Shifts within 500 ms of a discrete input (click, tap, key) are excluded from CLS, but a 700 ms `height` animation after a click keeps shifting after the window closes and counts. Keep layout-affecting expansions < 500 ms, or use FLIP/`grid-template-rows` with content placed so nothing above moves.
- **Reserve space** for anything that animates in: set dimensions (`width`/`height` or `aspect-ratio`) on images/video/canvas; never toggle `display: none -> block` for reveal effects.
- **Fonts:** `next/font` self-hosts and generates a fallback `@font-face` with `size-adjust`/ascent overrides (`adjustFontFallback` is on by default), which removes most swap shifts. For self-managed fonts use `font-display: swap` plus metric overrides, or `optional` for body text on perf-critical pages.
- **Split text and fonts:** splitting before the font loads measures fallback-font lines; SplitText `autoSplit: true` re-splits on font load and resize. Manual splitters: `await document.fonts.ready` first.
- **Scroll is NOT an excluding input, and default GSAP pins emit layout shifts.** Measured 2026-09-27 in Chromium (Edge, headless, real wheel input, gsap 3.15) on one 100vh section pinned for 200%: `pin: true` (default `pinType: "fixed"` on the body scroller) logged layout-shift entries of 0.75 at pin and 1.0 at unpin (1.75 per pinned section, all counted by `web-vitals`/CrUX); `pin: true, pinType: "transform"` logged 0; CSS `position: sticky` + a scrubbed ScrollTrigger without `pin` logged 0. A page with two default pins scored CLS 3.4 in the same harness. Choose deliberately:
  - Sticky-able layouts (stacked cards, sticky split, pinned hero with scrubbed media): use CSS `position: sticky` inside a tall track and scrub with ScrollTrigger (no `pin`). 0 CLS, compositor-smooth. Remember sticky dies under any `overflow: hidden/auto` ancestor (use `overflow: clip`).
  - GSAP-only pins (horizontal galleries needing pinSpacing math, nested pins): `pinType: "transform"` is 0 CLS, but GSAP's forum documents vibration when scrolling runs on the compositor thread (native scroll, including phones with Lenis `syncTouch: false`). With Lenis driving desktop wheel scroll in the same rAF it is steady; test on a real trackpad and a phone before shipping.
  - Or accept the fixed pin and its CLS when the site is a showcase where field CLS does not matter; never on SEO-critical marketing pages.

```css
/* Metric-matched fallback when not using next/font */
@font-face {
  font-family: "Display Fallback";
  src: local("Arial");
  size-adjust: 104%;
  ascent-override: 92%;
  descent-override: 24%;
  line-gap-override: 0%;
}
.display { font-family: "Display", "Display Fallback", system-ui, sans-serif; }
```
```ts
// Manual split after fonts are ready
export async function splitWhenReady(el: HTMLElement, split: (el: HTMLElement) => void) {
  if (document.fonts?.status !== "loaded") await document.fonts.ready;
  split(el);
}
```
**Tune:** Measure the fallback metric overrides once (tools such as Capsize / Fontaine / next/font do it for you).  
**A11y/perf:** A reveal that fades content in from 0 is still CLS-free, but it is an LCP risk (recipe 8).

### 10. INP: scroll and pointer handlers without jank
**Looks like:** Clicking a button on a page full of cursor, magnetic and scroll effects still paints the response in under 200 ms.  
**Use when / avoid when:** Any page with scroll/pointer listeners, cursor followers, magnetic buttons, or heavy click handlers (opening a menu that builds a timeline). INP "good" is <= 200 ms at the 75th percentile.  
**Stack:** DOM APIs, GSAP

Rules:
1. **Passive listeners** for `scroll`, `wheel`, `touchstart`, `touchmove` unless you must `preventDefault` (non-passive wheel/touch listeners block scrolling; DevTools Rendering > "Scrolling performance issues" highlights them).
2. **Never read layout after writing styles in the same frame** (`getBoundingClientRect`, `offsetWidth`, `scrollHeight` after a style write forces synchronous layout). Cache rects on resize (`ResizeObserver`) and only write transforms per frame.
3. **Batch high-frequency input to rAF.** `pointermove` can fire faster than frames; store the latest value and apply once per frame (`gsap.quickTo` / `quickSetter` do this).
4. **IntersectionObserver instead of scroll listeners** for reveals and "is visible" logic.
5. **Yield before heavy work in event handlers** so the visual response paints first.
6. **Pre-build expensive timelines** (SplitText, Flip states) at idle, not on click.

```ts
// lib/pointer.ts : magnetic effect with cached rect, rAF-batched writes, no thrash
import gsap from "gsap";

export function magnetic(el: HTMLElement, strength = 0.3) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  let rect = el.getBoundingClientRect();
  const ro = new ResizeObserver(() => { rect = el.getBoundingClientRect(); });
  ro.observe(el);
  const onScroll = () => { rect = el.getBoundingClientRect(); };          // rect changes with scroll
  const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
  const onMove = (e: PointerEvent) => {
    xTo((e.clientX - (rect.left + rect.width / 2)) * strength);            // reads cached values only
    yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const onLeave = () => { xTo(0); yTo(0); };
  el.addEventListener("pointermove", onMove, { passive: true });
  el.addEventListener("pointerleave", onLeave, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    ro.disconnect();
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("scroll", onScroll);
  };
}
```
```ts
// lib/yield.ts : scheduler.yield() (Chrome 129+, Firefox 142+) with fallback
type SchedulerLike = { yield?: () => Promise<void> };
export function yieldToMain(): Promise<void> {
  const s = (globalThis as { scheduler?: SchedulerLike }).scheduler;
  if (s?.yield) return s.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// usage in a click handler: paint the pressed/open state first, then do the heavy part
export async function onOpenMenu(setOpen: (v: boolean) => void, buildHeavyTimeline: () => void) {
  setOpen(true);
  await yieldToMain();
  buildHeavyTimeline();
}
```
**Tune:** Keep any single event handler < 50 ms; split work > 50 ms with `yieldToMain()`.  
**A11y/perf:** Everything here also helps keyboard users: heavy `keydown` handlers on the document (shortcut managers, text scramblers) are frequent INP culprits.

### 11. DevTools workflow
**Looks like:** A repeatable 5-minute audit that finds the actual cause of jank instead of guessing.  
**Use when / avoid when:** Before shipping and whenever something "feels heavy".  
**Stack:** Chrome DevTools (Edge identical)

1. **Throttle realistically.** Performance panel > Capture settings > CPU: 4x (mid-tier) and 6x (low-end phone), or **Calibrate** to create low-/mid-tier mobile presets for your machine. DevTools may also suggest a preset from field data. Throttling is relative to your CPU and cannot emulate a mobile GPU; test on a real mid-range Android too.
2. **Record the real interaction:** load + intro, a full scroll through the page, open/close menu, a page transition.
3. **Read the Frames track:** dropped (red) and partially presented (yellow) frames. In the Main track look for long tasks (red corner), purple Layout and green Paint blocks recurring every frame during scroll: that is a non-composited animation or layout thrash. "Forced reflow" warnings point at read-after-write code.
4. **Insights sidebar:** LCP breakdown, INP by phase (input delay / processing / presentation), CLS culprits, and non-composited animations.
5. **Rendering tab** (Command menu: "Show Rendering"):
   - Paint flashing (green = repaint): scrolling should flash almost nothing.
   - Layout shift regions (purple).
   - Layer borders (orange/olive layers, cyan tiles) to spot layer explosions.
   - Frame rendering stats: live FPS/frame overlay with dropped/partial frames and GPU memory.
   - Scrolling performance issues: highlights elements with slow scroll/wheel/touch handlers.
   - Emulate CSS media features: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors`, `prefers-reduced-transparency`.
6. **Layers panel:** memory per layer and compositing reasons.
7. **Animations panel:** slow playback to 25% / 10% to judge easing and choreography, scrub CSS/WAAPI animations, and inspect their timing.
8. Annotate your own phases so they show in the trace:
```ts
performance.mark("intro:start");
tl.eventCallback("onComplete", () => {
  performance.mark("intro:end");
  performance.measure("intro", "intro:start", "intro:end");   // appears in the Timings track
});
```
**Tune:** Pass criteria: no red frames during scroll at 4x; no recurring Layout/Paint per frame during scroll; long tasks < 50 ms after the intro.  
**A11y/perf:** Always repeat the recording with reduced motion emulated: the reduced path must be at least as fast and must still show all content.

### 12. Long Animation Frames observer
**Looks like:** Field or dev-time attribution of which script (file + function + invoker) made a frame late, including forced style/layout time.  
**Use when / avoid when:** Diagnosing INP and jank from third-party or animation code. Chromium only (Chrome/Edge 123+; not in Firefox or Safari), so treat it as a sample.  
**Stack:** PerformanceObserver (`long-animation-frame`)
```ts
// lib/loaf.ts : log frames that took > 50ms of blocking-ish work, with script attribution
type LoAFScript = {
  sourceURL: string; sourceFunctionName: string; invoker: string; invokerType: string;
  duration: number; forcedStyleAndLayoutDuration: number;
};
type LoAFEntry = PerformanceEntry & {
  blockingDuration: number; renderStart: number; styleAndLayoutStart: number;
  firstUIEventTimestamp: number; scripts: LoAFScript[];
};

export function observeLongAnimationFrames(report: (summary: Record<string, unknown>) => void) {
  if (!PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")) return () => {};
  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LoAFEntry[]) {
      if (entry.blockingDuration < 50) continue;
      report({
        start: Math.round(entry.startTime),
        duration: Math.round(entry.duration),
        blocking: Math.round(entry.blockingDuration),
        styleAndLayout: Math.round(entry.startTime + entry.duration - entry.styleAndLayoutStart),
        scripts: entry.scripts.map((s) => ({
          src: s.sourceURL, fn: s.sourceFunctionName, invoker: s.invoker, type: s.invokerType,
          ms: Math.round(s.duration), forcedLayoutMs: Math.round(s.forcedStyleAndLayoutDuration),
        })),
      });
    }
  });
  po.observe({ type: "long-animation-frame", buffered: true });
  return () => po.disconnect();
}
// dev usage: observeLongAnimationFrames((s) => console.table(s.scripts)); remove logging for production RUM
```
Fields: `duration`, `blockingDuration` (sum of task time beyond 50 ms), `renderStart`, `styleAndLayoutStart`, `firstUIEventTimestamp`, `scripts[]` with `sourceURL`, `sourceFunctionName`, `invoker` (e.g. `Window.requestAnimationFrame`), `invokerType` (`user-callback`, `event-listener`, `resolve-promise`...), `forcedStyleAndLayoutDuration` (layout thrash).  
**Tune:** In production send only the worst entries (top N by blockingDuration) to your RUM endpoint; the `web-vitals` library's attribution build also links INP to LoAF entries.  
**A11y/perf:** High `forcedStyleAndLayoutDuration` inside `requestAnimationFrame` invokers is the signature of scroll/pointer effects reading layout each frame (recipe 10).

### 13. Playwright motion QA
**Looks like:** CI that proves the page renders with reduced motion, holds frame times under throttling, and records video/traces of the motion for review.  
**Use when / avoid when:** Any animated site worth protecting from regressions.  
**Stack:** @playwright/test (Chromium for CDP-based checks)
```ts
// playwright.config.ts (excerpt)
import { defineConfig } from "@playwright/test";
export default defineConfig({
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",                           // trace viewer: filmstrip + DOM snapshots
    video: { mode: "retain-on-failure", size: { width: 1280, height: 720 } },
  },
});
```
```ts
// tests/motion.spec.ts
import { test, expect } from "@playwright/test";

test("reduced motion: content visible, no transformed intro leftovers", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // every [data-intro] element ends fully visible and untransformed
  await expect
    .poll(async () =>
      page.$$eval("[data-intro]", (els) =>
        els.every((el) => {
          const cs = getComputedStyle(el);
          return cs.visibility !== "hidden" && Number(cs.opacity) > 0.99 && (cs.transform === "none" || cs.transform === "matrix(1, 0, 0, 1, 0, 0)");
        }),
      ),
    )
    .toBe(true);
  await context.close();
});

test("scroll at 4x CPU throttle keeps p95 frame time under 34ms", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "CDP throttling is Chromium-only");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/");
  await page.waitForTimeout(2000);                                 // let the intro finish

  await page.evaluate(() => {
    const w = window as unknown as { __frames: number[]; __probe: boolean };
    w.__frames = []; w.__probe = true;
    let last = performance.now();
    const tick = (now: number) => { w.__frames.push(now - last); last = now; if (w.__probe) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await page.mouse.move(640, 360);
  for (let i = 0; i < 40; i++) {                                   // real wheel input exercises Lenis + ScrollTrigger
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(60);
  }
  const frames = await page.evaluate(() => {
    const w = window as unknown as { __frames: number[]; __probe: boolean };
    w.__probe = false;
    return w.__frames.slice(5).sort((a, b) => a - b);
  });
  const p95 = frames[Math.floor(frames.length * 0.95)];
  expect(p95).toBeLessThan(34);                                    // ~30fps floor on a throttled CPU
});

test("visual snapshot with animations settled", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity),
  );
  await expect(page).toHaveScreenshot("home.png", { animations: "disabled", fullPage: true });
});

test("deterministic mid-intro frame via fake clock (JS-driven animations)", async ({ page }) => {
  await page.clock.install();                                      // fakes timers, rAF, performance.now, Date
  await page.goto("/");
  await page.clock.runFor(600);                                    // GSAP/Motion JS timelines advance 600ms
  await page.screenshot({ path: "test-results/intro-600ms.png" });
});
```
**Tune:** Thresholds: p95 frame < 34 ms at 4x on CI hardware, < 20 ms unthrottled. Use `trace` filmstrips to review choreography frame by frame.  
**A11y/perf:** Add an axe pass (`@axe-core/playwright`) on both motion modes; CSS animations are not controlled by `page.clock` (use `animations: "disabled"` for screenshots).

### 14. Lighthouse caveats
**Looks like:** Knowing what a green score does and does not prove about an animated site.  
**Use when / avoid when:** Reporting performance; never as the only check.  
**Stack:** Lighthouse / PageSpeed Insights

- Lab navigation mode measures one simulated load: it does not scroll, hover or click, so it never sees scroll jank, cursor effects or INP (TBT is only a proxy). Use **timespan / user-flow** mode or the Performance panel for interactions.
- "Avoid non-composited animations" only sees CSS/WAAPI animations; GSAP or JS-driven style changes are invisible to it (and a clean result does not mean your JS animation is composited).
- Preloaders and intros show up as poor LCP/Speed Index in lab and field; lab LCP under simulated throttling can differ from real devices both ways.
- Scores vary run to run (network, extensions, CPU): compare medians of 3-5 runs, in an incognito profile.
- Field data (CrUX / RUM with `web-vitals`) is the ground truth for LCP, INP and CLS (CLS accumulates during scrolling in the field, which lab load-only runs miss).

### 15. Reduced motion: reduce, don't remove
**Looks like:** With the OS setting on, the site still feels designed: content crossfades in with the same timing, nothing slides, zooms, spins or parallaxes, and nothing is missing.  
**Use when / avoid when:** Always. The two failure modes: ignoring the setting entirely, or deleting animations so aggressively that content which starts at `opacity: 0` never appears. Val Head (Smashing): "substituting the potentially triggering effect with a safer effect for reduced motion is the best way to preserve as much of the content's intent and usability as possible." WebKit: "Only remove the animations you know to be vestibular triggers."  
**Stack:** Principles (code in recipe 16)

| Full motion | Reduced-motion substitute |
|---|---|
| Slide / fly-in reveals (translate) | Opacity fade, same trigger, 200-400 ms |
| Scale/zoom intros, Ken Burns, zooming page transitions | Static image; crossfade 150-250 ms |
| Parallax, multi-speed layers, scroll-scrubbed transforms | Layers static and aligned; no scrub |
| Pinned scroll stories | Unpinned: steps stacked vertically, each fully visible |
| Horizontal scroll hijack | Native vertical stack or a normal overflow-x list |
| Smooth scroll (Lenis) | Native scroll (Lenis does this automatically) |
| Page transitions (slides, curtains, 3D) | Crossfade or instant swap |
| Autoplaying video, marquee, carousel, animated backgrounds | Paused with poster and a Play control |
| Text scramble, typewriter, char stagger | Final text immediately, or one fade |
| Cursor followers, magnetic buttons, tilt | Off (native cursor, static buttons) |
| WebGL ambient shader | One static rendered frame (or poster) |
| Hover lift/tilt | Color, underline or shadow change only |
| Springs with bounce | Short no-overshoot tween |
| Loading spinners, progress fills, hold-to-confirm | Keep (essential feedback); a slow pulse is fine |
| Blinking/flashing | Remove outright |

Rules:
1. **Default state = visible.** Anything hidden before its animation must have a reduced path that ends visible.
2. **Keep timing, swap the property.** Opacity and color changes are not "motion animation" in WCAG terms.
3. **Honor it at every layer**: CSS, GSAP, Motion, Lenis, WebGL loops, video autoplay, `scroll-behavior`.
4. **Listen for changes live** (the user can toggle the OS setting while the page is open).
5. **Offer an in-page toggle** on motion-heavy sites (persisted), because many affected users never find the OS setting (Marcy Sutton's pattern: OS preference + stored override + visible control).

### 16. Reduced-motion code for every layer (CSS, GSAP, Motion, Lenis, user toggle)
**Looks like:** One source of truth: the OS preference, optionally overridden by a site toggle, drives CSS tokens, GSAP branches, Motion config and smooth scroll.  
**Use when / avoid when:** Every animated project; paste as-is.  
**Stack:** CSS | React | GSAP | Motion | Lenis

1) Pre-paint attribute (root layout `<head>`), so CSS knows the stored override before first paint:
```tsx
<script
  dangerouslySetInnerHTML={{
    __html:
      "(function(){try{var p=localStorage.getItem('motion-pref');if(p==='reduce'||p==='full')document.documentElement.dataset.motionPref=p}catch(e){}})();",
  }}
/>
```
2) CSS tokens: components multiply travel by `--motion`, so reduced mode keeps fades:
```css
:root { --motion: 1; }
@media (prefers-reduced-motion: reduce) { :root { --motion: 0; } }
:root[data-motion-pref="reduce"] { --motion: 0; }
:root[data-motion-pref="full"] { --motion: 1; }            /* explicit opt-in beats the OS query (higher specificity) */

.reveal {
  opacity: 0;
  transform: translateY(calc(24px * var(--motion)));
  transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal[data-in="true"] { opacity: 1; transform: none; }

@media (prefers-reduced-motion: no-preference) {
  html:not(.lenis) { scroll-behavior: smooth; }              /* never unconditional smooth scroll */
}
```
Optional blunt safety net (catches third-party CSS animations; it also shortens your intentional fades, so use it only in addition to the token approach, never instead):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
3) One hook for JS (SSR-safe, live-updating, merges OS setting and stored override):
```ts
// lib/motion-pref.ts
"use client";
import { useSyncExternalStore } from "react";

export type MotionPref = "system" | "reduce" | "full";
const KEY = "motion-pref";
const listeners = new Set<() => void>();
const query = () => window.matchMedia("(prefers-reduced-motion: reduce)");

export function getMotionPref(): MotionPref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "reduce" || v === "full" ? v : "system";
  } catch {
    return "system";
  }
}

export function setMotionPref(pref: MotionPref) {
  try {
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch { /* storage blocked: still apply for this page view */ }
  if (pref === "system") delete document.documentElement.dataset.motionPref;
  else document.documentElement.dataset.motionPref = pref;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mql = query();
  mql.addEventListener("change", cb);
  return () => { listeners.delete(cb); mql.removeEventListener("change", cb); };
}
const getSnapshot = () => {
  const p = getMotionPref();
  return p === "reduce" || (p === "system" && query().matches);
};

/** true = reduce motion. Server snapshot is false; client corrects on hydration before any effect animates. */
export function useShouldReduceMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
export const useMotionPrefValue = () =>
  useSyncExternalStore(subscribe, getMotionPref, () => "system" as MotionPref);
```
4) GSAP: branch inside `gsap.matchMedia()`, and rebuild when the site toggle changes:
```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMotionPrefValue } from "@/lib/motion-pref";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Reveals({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pref = useMotionPrefValue();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { osReduce: "(prefers-reduced-motion: reduce)", isDesktop: "(min-width: 800px)" },
        (ctx) => {
          const { osReduce, isDesktop } = ctx.conditions as { osReduce: boolean; isDesktop: boolean };
          const reduce = pref === "reduce" || (pref === "system" && osReduce);

          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
            gsap.from(el, {
              autoAlpha: 0,
              y: reduce ? 0 : 40,                       // reduce: same fade, no travel
              duration: reduce ? 0.4 : 0.9,
              ease: reduce ? "none" : "expo.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          });

          if (!reduce && isDesktop) {
            gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
              gsap.fromTo(el, { yPercent: -8 }, {
                yPercent: 8, ease: "none",
                scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 },
              });
            });
          }
        },
      );
    },
    { scope, dependencies: [pref], revertOnUpdate: true },   // toggle -> revert everything, rebuild
  );

  return <div ref={scope}>{children}</div>;
}
```
5) Motion: global config plus explicit values where Motion cannot infer intent:
```tsx
"use client";
import { MotionConfig, motion, useScroll, useTransform } from "motion/react";
import { useMotionPrefValue, useShouldReduceMotion } from "@/lib/motion-pref";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pref = useMotionPrefValue();
  // "user": transform + layout animations disabled for OS-reduced users; opacity/colors still animate
  const reducedMotion = pref === "reduce" ? "always" : pref === "full" ? "never" : "user";
  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}

export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const reduce = useShouldReduceMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div style={{ overflow: "hidden" }}>
      <motion.img src={src} alt={alt} style={{ y: reduce ? 0 : y, scale: 1.16 }} />
    </div>
  );
}
```
Note: Motion's own `useReducedMotion()` reads only the OS setting; use the merged hook when you offer a site toggle. `MotionConfig reducedMotion` does not stop `useScroll`-driven style values, which is why the parallax sets `y` to 0 explicitly.

6) Lenis: honors the OS setting automatically (`respectReducedMotion: true`, lerp forced to 1, `scrollTo` and anchors instant). For the site toggle, mount it as a sibling so toggling never remounts page content:
```tsx
"use client";
import { ReactLenis } from "lenis/react";
import { useShouldReduceMotion } from "@/lib/motion-pref";

export function MaybeLenis() {
  const reduce = useShouldReduceMotion();
  return reduce ? null : <ReactLenis root options={{ anchors: true, lerp: 0.1, autoRaf: true }} />;
}
// layout: <body><MaybeLenis />{children}</body>   (use the gsap.ticker variant from recipe 5 with GSAP)
```
7) The visible toggle:
```tsx
"use client";
import { setMotionPref, useShouldReduceMotion } from "@/lib/motion-pref";

export function MotionToggle() {
  const reduce = useShouldReduceMotion();
  return (
    <button type="button" aria-pressed={reduce} onClick={() => setMotionPref(reduce ? "full" : "reduce")}>
      Reduce motion
    </button>
  );
}
```
**Tune:** Keep reduced fades at 200-400 ms, never 0 (a hard pop is jarring too).  
**A11y/perf:** Test with DevTools > Rendering > Emulate `prefers-reduced-motion: reduce` and with Playwright `reducedMotion: "reduce"` (recipe 13).

### 17. WCAG 2.2 criteria and vestibular triggers
**Looks like:** A motion-rich site that passes an accessibility audit.  
**Use when / avoid when:** Reference while designing; the A/AA rows are legal baselines in many jurisdictions (EAA in the EU since June 2025, ADA/Section 508 in the US).  
**Stack:** Standards

| SC | Level | Requirement | What it means for animated sites |
|---|---|---|---|
| 2.2.2 Pause, Stop, Hide | A | Moving, blinking or scrolling content that starts automatically, lasts more than 5 s, and is shown alongside other content needs a way to pause, stop or hide it | Marquees, auto carousels, looping background video, ambient canvas/shader loops, animated counters that keep ticking: add a pause control (recipe 18) |
| 2.3.1 Three Flashes or Below Threshold | A | Nothing flashes more than 3 times in any 1 s period (unless below the general and red flash thresholds) | Glitch effects, strobe/invert hovers, flicker shaders, rapid page-transition flashes. Keep flashes <= 3/s and small (under about 25% of a 10-degree visual field, roughly 341 x 256 px at 1024 x 768); avoid saturated red flashes |
| 2.3.2 Three Flashes | AAA | No flashes more than 3/s at all | |
| 2.3.3 Animation from Interactions | AAA | "Motion animation triggered by interaction can be disabled, unless the animation is essential" | Scroll-triggered movement, parallax, hover motion. Motion animation = adding steps to create an illusion of movement; color, blur and opacity changes that don't alter position/size/shape are not motion animation. Techniques: C39 (CSS `prefers-reduced-motion`), SCR40 (JS) |
| 2.1.1 Keyboard | A | All functionality via keyboard | Drag-only carousels, hover-only reveals, cursor-only interactions need key equivalents |
| 2.4.7 Focus Visible | AA | Focus indicator visible | Don't animate focus rings away; don't hide outlines on animated buttons |
| 2.4.11 Focus Not Obscured (Minimum) | AA (new in 2.2) | Focused element not entirely hidden by author content | Sticky/animated headers and cookie bars covering focused items: `scroll-padding-top` |
| 2.5.8 Target Size (Minimum) | AA (new in 2.2) | Targets at least 24 x 24 CSS px (with exceptions) | Tiny magnetic dots, carousel bullets |
| 4.1.3 Status Messages | AA | Status changes announced without moving focus | "Copied", toast confirmations, filter result counts after animated layout changes |
| 1.4.3 / 1.4.11 Contrast | AA | 4.5:1 text, 3:1 UI | Text over video/WebGL/glass must meet contrast in every frame |

Vestibular triggers (WebKit "Responsive design for motion", Val Head):
- **Scaling and zooming** (illusion of moving through space): zoom intros, dolly-zoom page transitions.
- **Spinning / vortex** effects.
- **Multi-speed or multi-directional movement**: parallax is the classic trigger.
- **Plane shifting**: 2D planes moving in 3D (card flips, 3D carousels, perspective scroll).
- **Peripheral motion**: horizontal movement at the edges of vision (marquees, side-scrolling backgrounds).
- **Motion the user did not initiate or cannot control**: scroll-jacking, autoplay, motion that continues after input stops (long smooth-scroll inertia).
- Size matters: the larger the moving area relative to the viewport, the stronger the effect.

### 18. Pause controls for marquees, carousels, video
**Looks like:** A logo marquee with a small, visible pause button; it also pauses on hover and keyboard focus, and starts paused under reduced motion.  
**Use when / avoid when:** Any auto-moving content longer than 5 s (WCAG 2.2.2). Pausing on hover alone is not enough (keyboard and touch users can't hover).  
**Stack:** React + CSS
```tsx
"use client";
import { useEffect, useState } from "react";

export function Marquee({ items, label = "Clients" }: { items: string[]; label?: string }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  return (
    <section className="marquee" aria-label={label} data-paused={paused}>
      <button type="button" className="marquee-toggle" onClick={() => setPaused((p) => !p)}>
        {paused ? "Play" : "Pause"}<span className="sr-only"> {label} animation</span>
      </button>
      <div className="marquee-viewport">
        <ul className="marquee-track">
          {items.map((i) => <li key={i}>{i}</li>)}
        </ul>
        <ul className="marquee-track" aria-hidden="true">
          {items.map((i) => <li key={`dup-${i}`}>{i}</li>)}
        </ul>
      </div>
    </section>
  );
}
```
```css
.marquee { position: relative; }
.marquee-viewport {
  display: flex; overflow: hidden;
  mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
}
.marquee-track {
  display: flex; flex-shrink: 0; min-width: 100%; justify-content: space-around;
  gap: 3rem; padding-right: 3rem; margin: 0; list-style: none;
  animation: marquee 30s linear infinite;
}
@keyframes marquee { to { transform: translateX(-100%); } }
.marquee[data-paused="true"] .marquee-track,
.marquee:focus-within .marquee-track { animation-play-state: paused; }
@media (hover: hover) { .marquee:hover .marquee-track { animation-play-state: paused; } }
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; flex-wrap: wrap; }
  .marquee-track[aria-hidden="true"], .marquee-toggle { display: none; }
}
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```
Auto-rotating carousels (WAI-ARIA APG carousel pattern): a pause/play button as the first control, rotation stops on hover and on keyboard focus inside, the slide container has `aria-live="off"` while rotating and `"polite"` when stopped, each slide `role="group"` with `aria-roledescription="slide"` and `aria-label="3 of 5"`. Component code: `interactions.md`.

Background video: do not ship `autoPlay` in SSR HTML if you need to respect reduced motion (it starts before hydration); play from an effect instead:
```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export function AmbientVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && ref.current) ref.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play().then(() => setPlaying(true)); else { v.pause(); setPlaying(false); }
  };
  return (
    <div className="ambient">
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />
      <button type="button" onClick={toggle}>{playing ? "Pause background video" : "Play background video"}</button>
    </div>
  );
}
```
**Tune:** Marquee speed 20-40 s per loop for logos (faster reads as noise); keep the toggle small but >= 24 x 24 px.  
**A11y/perf:** Pause offscreen too (recipe 6). The duplicated track is `aria-hidden` so screen readers hear the list once.

### 19. Transparency, contrast, forced colors
**Looks like:** Glass UI turns solid for users who ask for less transparency, borders strengthen for high-contrast users, and Windows High Contrast users still see every control and focus ring.  
**Use when / avoid when:** Any site using glassmorphism, gradient text, low-contrast "subtle" UI, box-shadow focus rings or background images for meaning.  
**Stack:** CSS

Support (MDN BCD 2026-09): `prefers-reduced-transparency` Chrome 118+ only (Firefox behind a flag, no Safari); `prefers-contrast` Chrome 96, Firefox 101, Safari 14.1; `forced-colors` Chrome 89, Firefox 89, Safari 16; `prefers-reduced-data` flag-only.
```css
/* Less transparency: solid surfaces, no backdrop blur */
@media (prefers-reduced-transparency: reduce) {
  .glass { background: var(--surface-solid, #fff); backdrop-filter: none; }
  .overlay-scrim { background: rgb(0 0 0 / 0.85); }
}

/* More contrast: stronger borders and text, no shimmer/low-contrast effects */
@media (prefers-contrast: more) {
  :root { --text-muted: #1a1a1a; --border-subtle: #000; }
  .glass { background: var(--surface-solid, #fff); backdrop-filter: none; border: 1px solid currentColor; }
  .skeleton { animation: none; }
}

/* Forced colors (Windows High Contrast): the UA replaces colors and removes box-shadows */
.btn:focus-visible {
  outline: 2px solid transparent;           /* invisible normally, becomes a real outline in forced colors */
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--ring, #6366f1);
}
@media (forced-colors: active) {
  .gradient-text { background: none; color: CanvasText; -webkit-text-fill-color: currentColor; }
  .btn { border: 1px solid ButtonText; }
  .card { border: 1px solid CanvasText; }
  .icon-only svg { fill: currentColor; stroke: currentColor; }
}
```
**Tune:** Gradient text (`background-clip: text` + transparent fill) is the most common forced-colors failure: always provide the solid-color override.  
**A11y/perf:** Every solid fallback should be the same color you use for the low-tier/performance fallback (recipe 2), so one code path serves both.

### 20. Focus, inert and aria-busy around animation
**Looks like:** Opening the menu moves focus into it instantly while it animates; closed/offscreen panels can't be tabbed into; during a route transition the old page is inert and the new one receives focus.  
**Use when / avoid when:** Menus, drawers, dialogs, overlays, route transitions, pinned sections, reveal-on-scroll content.  
**Stack:** React + DOM

Rules:
1. **Move focus at the start of the enter animation**, not in `onComplete`. Screen reader and keyboard users should never wait for decoration.
2. **Hidden UI must be unreachable**: `opacity: 0` and `transform: translateX(100%)` leave controls focusable and clickable. Closed menus/drawers get `inert` (or `visibility: hidden`, which GSAP's `autoAlpha` sets).
3. **Reveal-on-scroll content is the opposite case**: use opacity (not `visibility: hidden` / `display: none`) so it stays in the accessibility tree and find-in-page, and reveal it immediately if it receives focus.
4. **During route transitions**: `inert` + `aria-busy="true"` on the outgoing `<main>`, then remove both, update `document.title`, and focus the new page's `<h1 tabindex="-1">` (or rely on the router announcer, recipe 24).
5. **Focus rings appear instantly** (no transition on `outline`); a 100 ms `outline-offset` transition is the maximum.
6. **Sticky or animated headers must not cover focus** (WCAG 2.4.11): `scroll-padding-top`.
7. **Pinned/scrubbed sections**: tabbing into an element the browser scrolls it into view, which moves the scrub. Keep not-yet-visible steps `inert` or make each step's content visible when focused.
```tsx
"use client";
import { useEffect, useRef } from "react";

export function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      panel.current?.querySelector<HTMLElement>("a, button, input, [tabindex]:not([tabindex='-1'])")?.focus(); // immediately
    } else {
      returnTo.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (open && e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div ref={panel} className="drawer" data-open={open} inert={!open} role="dialog" aria-modal="true" aria-label="Menu">
      {children}
    </div>
  );
}
```
```css
.drawer { position: fixed; inset: 0 0 0 auto; width: min(420px, 100vw); transform: translateX(100%);
  transition: transform 500ms cubic-bezier(0.32, 0.72, 0, 1); }
.drawer[data-open="true"] { transform: none; }
@media (prefers-reduced-motion: reduce) {
  .drawer { transform: none; opacity: 0; transition: opacity 200ms ease; }
  .drawer[data-open="true"] { opacity: 1; }
}
html { scroll-padding-top: var(--header-h, 80px); }
```
```ts
// Route transition skeleton (framework-agnostic)
export async function swapPage(main: HTMLElement, leave: () => Promise<void>, render: () => Promise<void>, enter: () => Promise<void>) {
  main.inert = true;
  main.setAttribute("aria-busy", "true");
  await leave();
  await render();                                   // new DOM + document.title updated here
  main.inert = false;
  main.removeAttribute("aria-busy");
  main.querySelector<HTMLElement>("h1")?.setAttribute("tabindex", "-1");
  main.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  await enter();                                    // decoration continues after focus has moved
}
```
**Tune:** Drawer 400-500 ms enter, 300 ms exit; focus at t = 0.  
**A11y/perf:** For full dialog semantics prefer the native `<dialog>` element or Radix/Base UI (focus trap, `Escape`, return focus) and only animate them.

### 21. Smooth scroll vs anchors, find-in-page, keyboard
**Looks like:** Anchor links glide (or jump, under reduced motion) and land below the sticky header; Ctrl/Cmd+F finds and scrolls to text; Space, Page Down and arrow keys scroll normally.  
**Use when / avoid when:** Every site with smooth scroll or in-page navigation. Avoid transform-based "virtual scroll" wrappers (older Locomotive/ScrollSmoother-style setups that translate the whole page) unless you verify anchors, sticky and find-in-page yourself; Lenis keeps native scroll, which is why it is the default choice.  
**Stack:** CSS | Lenis
```css
html { scroll-padding-top: var(--header-h, 80px); }       /* anchors land below the sticky header */
@media (prefers-reduced-motion: no-preference) {
  html:not(.lenis) { scroll-behavior: smooth; }            /* Lenis manages its own; lenis.css disables CSS smooth under Lenis */
}
```
```ts
// Lenis: anchors are blocked by default; enable them (with offset) or handle skip links yourself
import Lenis from "lenis";

export function initLenis() {
  const lenis = new Lenis({ autoRaf: true, anchors: { offset: -80 }, stopInertiaOnNavigate: true });
  // Skip link: after scrolling, move focus so the next Tab continues from the target
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const id = a.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
  return lenis;   // call lenis.destroy() on teardown
}
```
Find-in-page and hidden content:

| Hiding technique | Findable (Ctrl/Cmd+F) | In a11y tree | Use for |
|---|---|---|---|
| `opacity: 0` | yes | yes | scroll reveals (preferred) |
| `visibility: hidden` / GSAP `autoAlpha: 0` | no | no | closed menus/overlays, pre-intro FOUC guard |
| `display: none` | no | no | truly absent UI |
| `content-visibility: auto` (offscreen) | yes | yes | long pages (recipe 4) |
| `hidden="until-found"` | yes (auto-expands, fires `beforematch`) | no until revealed | accordions, "read more" (Chrome 102, Firefox 148, Safari 26.2) |
| `clip-path: inset(100%)` / overflow masks | yes (text exists) | yes | line-mask reveals |

Keyboard: Lenis smooths wheel input only; keyboard scrolling stays native. Never intercept Space/arrow keys for section snapping; full-page snap libraries break keyboard, find-in-page and zoom expectations.  
**Tune:** Lenis anchor `offset` = negative header height; `scroll-margin-top` on specific targets when headers vary.  
**A11y/perf:** Under reduced motion Lenis makes anchor and `scrollTo` jumps instant automatically; CSS smooth scroll is already guarded by the media query above.

### 22. Split text accessibility
**Looks like:** A heading animated letter by letter that a screen reader still announces as one normal sentence, with no stutter, lost links or duplicated text.  
**Use when / avoid when:** Any SplitText/manual splitting. Avoid splitting body paragraphs with links, and avoid character splits for connected scripts (Arabic, Persian, Urdu) and complex shaping (Devanagari, Thai): splitting breaks letter joining and shaping. Split those by words/lines only.  
**Stack:** GSAP SplitText | manual React

What GSAP SplitText (3.13+, free) does (verified on gsap.com docs):
- `aria: "auto"` (default): adds `aria-label` with the element's `textContent` to the split element and `aria-hidden` to every line/word/char element. It "will not honor the semantics or functionality of nested elements" (links, `<em>`, `<abbr>` inside are flattened for assistive tech).
- `aria: "hidden"`: everything `aria-hidden` (use with your own visually-hidden copy).
- `aria: "none"`: no attributes.
- `autoSplit: true` re-splits on font load/resize; create animations in `onSplit` and return them so they're cleaned up and time-synced. `revert()` restores the original DOM.

The ARIA catch: `aria-label` is only reliably announced on elements whose role supports naming. Headings (`h1`-`h6`), links and buttons are fine; on `<p>`, `<div>`, `<span>` (paragraph/generic roles) ARIA 1.2 prohibits naming, and some screen readers ignore it, which leaves the text silent because the children are hidden. Therefore:

| Element being split | Safe setup |
|---|---|
| `h1`-`h6`, `a`, `button` | SplitText default `aria: "auto"` |
| `p`, `div`, `span` (lines or words only) | `aria: "hidden"` + a visually hidden copy (below), or `aria: "none"` for line/word splits (spans read normally in most screen readers; test VoiceOver) |
| Text containing links | don't char-split; line-split with `aria: "none"` so the real `<a>` stays exposed, or animate the block as a whole |
| After a one-shot intro | `split.revert()` on complete, restoring copy/paste, translation tools and selection |

```tsx
// Manual split with an accessible copy (works for any element type)
export function SplitWords({ text, as: Tag = "p", className }: { text: string; as?: "p" | "h1" | "h2" | "h3" | "span"; className?: string }) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="word-mask">
            <span className="word" style={{ "--i": i } as React.CSSProperties}>{w}</span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
```
```css
.word-mask { display: inline-block; overflow: clip; padding-bottom: 0.08em; margin-bottom: -0.08em; vertical-align: top; }
.word { display: inline-block; }
@media (prefers-reduced-motion: no-preference) {
  .word { animation: word-up 800ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: calc(var(--i) * 40ms); }
}
@keyframes word-up { from { transform: translateY(100%); } }
```
```ts
// SplitText on a paragraph: hide the split, provide one readable copy
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

export function splitParagraph(p: HTMLElement) {
  const copy = document.createElement("span");
  copy.className = "sr-only";
  copy.textContent = p.textContent ?? "";
  // aria: "hidden" puts aria-hidden on the split element itself AND its children,
  // so the readable copy must live OUTSIDE it (a sibling), not inside.
  const split = SplitText.create(p, { type: "lines", mask: "lines", aria: "hidden" });
  p.before(copy);
  const tween = gsap.from(split.lines, { yPercent: 100, duration: 0.9, stagger: 0.08, ease: "expo.out" });
  return () => { tween.kill(); split.revert(); copy.remove(); };
}
```
**Tune:** Chars only for short display lines (< 30 characters); words or lines otherwise.  
**A11y/perf:** Test with VoiceOver (macOS/iOS) and NVDA: the heading should read once, in one go. Large char splits also cost layout: hundreds of inline-block spans per heading.

### 23. Touch, hover and coarse pointers
**Looks like:** On phones there are no stuck hover states, no invisible custom cursor, no info hidden behind hover, and drag gestures don't fight vertical scrolling.  
**Use when / avoid when:** Every hover/cursor/magnetic/tilt effect.  
**Stack:** CSS | GSAP matchMedia
```css
/* Hover effects only where hover exists and the pointer is precise */
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-4px); }
  .link:hover .underline { transform: scaleX(1); }
}
/* Touch: give press feedback instead */
@media (hover: none) {
  .card:active { transform: scale(0.99); }
}
/* Custom cursor only for fine pointers and full motion */
.cursor { display: none; }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .cursor { display: block; }
}
/* Horizontal drag carousels: keep vertical page scroll working */
.carousel-track { touch-action: pan-y; }
/* Minimum target size (WCAG 2.5.8): 24px; 44px for primary touch actions */
.icon-btn { min-width: 44px; min-height: 44px; }
```
```ts
// GSAP: register pointer-only effects in a matchMedia branch so they clean up on device/setting change
import gsap from "gsap";

export function registerPointerEffects(root: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    const cards = root.querySelectorAll<HTMLElement>(".tilt");
    const cleanups: Array<() => void> = [];
    cards.forEach((card) => {
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
      gsap.set(card, { transformPerspective: 900 });
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 8);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      };
      const leave = () => { rx(0); ry(0); };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); });
    });
    return () => cleanups.forEach((c) => c());   // matchMedia reverts tweens itself; we remove listeners
  });
  return () => mm.revert();
}
```
Rules: nothing essential lives only in a hover state (tooltips must also open on focus and tap); hybrid laptops can report `pointer: fine` with touch as a secondary input (`any-pointer: coarse`), so press states must work too; don't hide the native cursor (`cursor: none`) without a custom cursor that follows at 1:1 speed (a lagging cursor dot is an accessibility and usability problem).  
**Tune:** Tilt <= 8 deg; magnetic strength 0.2-0.4.  
**A11y/perf:** The tilt reads `getBoundingClientRect` in `pointermove`; for many cards, cache rects as in `performance-a11y.md#10-inp-scroll-and-pointer-handlers-without-jank`.

### 24. Route-change announcements
**Looks like:** After a client-side navigation with a fancy transition, a screen reader announces the new page and focus is at a sensible place.  
**Use when / avoid when:** Any SPA-style transition (Next App Router, Swup, Barba, View Transitions).  
**Stack:** Pointer

- Next.js ships a built-in route announcer for client navigations (it reads `document.title`, falling back to the first `h1`, then the path). Make sure your transition updates the title when the new content is in place, not before.
- Custom routers (Barba, hand-rolled View Transitions) need their own polite live region plus focus management; Swup has an official a11y plugin.
- Keep the outgoing page `inert` + `aria-busy` during the swap and focus the new `h1` (recipe 20).
- Full patterns, including View Transitions API and reduced-motion variants: `page-transitions.md`.

## QA checklist before shipping
Performance
- [ ] Only transform/opacity animate on scroll and on anything looping; paint flashing shows (almost) nothing while scrolling.
- [ ] No `filter`/`backdrop-filter`/`clip-path`/`box-shadow` animations on large areas or scrubbed by scroll; glass limited to small sticky bars.
- [ ] `will-change` only on a handful of always-animating elements; Layers panel shows no layer explosion.
- [ ] One ticker: Lenis, ScrollTrigger, cursor and WebGL share `gsap.ticker` (or Motion `frame`); no stray rAF loops.
- [ ] Loops, marquees, videos and WebGL pause offscreen and in hidden tabs; DPR capped (<= 1.5 for full-screen shaders).
- [ ] Motion tier applied: lite devices / Save-Data get posters, native scroll, no WebGL download.
- [ ] LCP element visible in the first paint (not `opacity: 0`, not behind a long preloader); preloader < 1 s and first-visit only.
- [ ] CLS ~0 while scrolling through all reveals; fonts via `next/font` or metric-matched fallbacks; split text re-splits after font load.
- [ ] Scroll/pointer listeners passive; no layout reads in per-frame handlers; handlers < 50 ms (yield if needed).
- [ ] Performance recording at 4x and 6x CPU: no red frames during scroll, long tasks < 50 ms after the intro.
- [ ] LoAF observer clean in dev during the main flows; Playwright frame-probe test passes.
- [ ] Tested on one real mid-range Android and one iPhone (Safari: Lenis capped at 60 fps, backdrop-filter cost).

Accessibility
- [ ] Reduced motion (OS setting and site toggle): every element ends visible; slides/zooms/parallax/pins replaced by fades or static; Lenis native; autoplay off.
- [ ] Toggling reduced motion while the page is open updates behaviour (listeners, `revertOnUpdate`).
- [ ] Anything moving > 5 s has a visible pause control (marquees, carousels, video, ambient canvas).
- [ ] No flashing > 3 per second; glitch/strobe effects small and slow.
- [ ] Keyboard: all interactions reachable; focus moves into menus/dialogs at t = 0; closed panels `inert`; focus visible and not covered by sticky headers.
- [ ] Split headings read as one sentence (VoiceOver + NVDA); paragraphs use the sr-only pattern; no char splits on Arabic/Indic scripts.
- [ ] Anchors land below the header; find-in-page finds revealed-on-scroll text; Space/Page Down scroll normally.
- [ ] Hover/cursor/tilt effects gated to `(hover: hover) and (pointer: fine)`; touch gets press feedback; targets >= 24 px.
- [ ] `prefers-reduced-transparency`, `prefers-contrast: more` and `forced-colors: active` checked via DevTools emulation (gradient text and focus rings survive).
- [ ] Text over video/WebGL/glass meets 4.5:1 in its worst frame.
- [ ] Route changes announced and focus placed after transitions.
- [ ] axe (Playwright) passes in both motion modes.

## Gotchas
- **Content hidden until JS runs** (`opacity: 0` in CSS, revealed by GSAP) disappears when JS fails or reduced-motion code skips the tween. Always give the reduced branch an end state and use a failsafe class with timeout (`motion-principles.md#9-orchestrating-a-hero-intro-gsap-motion-css`).
- **`autoAlpha`/`visibility: hidden` on scroll reveals** hides content from screen readers reading ahead and from find-in-page. Use plain `opacity` for reveals; reserve visibility for UI that is truly closed.
- **Opacity-0 menus stay clickable and focusable**: add `inert` or `visibility: hidden` when closed.
- **Fading the LCP element from 0** can make Chrome record LCP late (or at a later repaint). Keep it visible and animate transform, or start at 0.1.
- **Height animations started by a click** count toward CLS once they run past the 500 ms input window.
- **`will-change` / `transform` on an ancestor** breaks `position: fixed` children (they become fixed to that ancestor).
- **`content-visibility: auto` before pinned ScrollTriggers** shifts start/end positions once sections render; refresh or avoid.
- **Two rAF loops** (Lenis `autoRaf: true` plus `gsap.ticker` driving `lenis.raf`) double-step the scroll: pick one (`autoRaf: false` when GSAP drives it).
- **`lagSmoothing` left on with Lenis** makes ScrollTrigger jump after a hitch; set `gsap.ticker.lagSmoothing(0)` in that setup.
- **Motion `x/y/scale` shorthands are not WAAPI-accelerated** (they run on Motion's JS frameloop); for animations that must survive main-thread work use `transform` strings or CSS.
- **Lighthouse "no non-composited animations" is blind to JS-driven styles**; a clean audit doesn't prove GSAP code is cheap.
- **`deviceMemory`/`connection` are Chromium-only**: Safari and Firefox users fall through to your defaults, so defaults must be safe.
- **`prefers-reduced-transparency` is Chromium-only** and `prefers-reduced-data` is flag-only; the non-matching fallback must already be acceptable.
- **SplitText `aria: "auto"` on a `<p>` or `<div>`** relies on `aria-label` on a role that prohibits naming; some screen readers read nothing. Headings only, or the sr-only pattern.
- **Character-splitting Arabic** breaks letter joining; word/line splits only.
- **`autoPlay` video in SSR HTML** starts before your reduced-motion check hydrates; start playback from an effect.
- **Pause-on-hover only** fails WCAG 2.2.2 for keyboard and touch users; ship a button.
- **CSS `scroll-behavior: smooth` without a media query** animates anchor jumps for reduced-motion users, and fights Lenis if both are active.
- **`cursor: none` with a lagging custom cursor** makes precise clicking hard; follow 1:1 (lerp only the decorative ring) and restore the native cursor on touch and reduced motion.
- **Throttled DevTools CPU does not throttle the GPU**: fill-rate problems (full-screen shaders, big blurs) only show up on real devices.

## Sources
- https://web.dev/articles/animations-guide
- https://developer.chrome.com/blog/hardware-accelerated-animations
- https://raw.githubusercontent.com/chromium/chromium/refs/heads/main/third_party/blink/renderer/platform/runtime_enabled_features.json5 (CompositeBGColorAnimation, CompositeClipPathAnimation: status "stable")
- https://developer.chrome.com/docs/devtools/rendering/performance
- https://developer.chrome.com/docs/devtools/performance/reference
- https://developer.chrome.com/docs/web-platform/long-animation-frames
- https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/lcp.md
- https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/2024_10_lcp.md
- https://www.debugbear.com/blog/opacity-animation-poor-lcp
- https://github.com/darkroomengineering/lenis/blob/v1.3.26/README.md
- https://github.com/darkroomengineering/lenis/blob/v1.3.26/packages/react/README.md
- https://motion.dev/docs/react-accessibility
- https://github.com/motiondivision/motion/blob/v13.4.4/packages/motion-dom/src/animation/waapi/utils/accelerated-values.ts
- https://github.com/motiondivision/motion/blob/v13.4.4/packages/motion-dom/src/animation/waapi/supports/waapi.ts
- https://gsap.com/docs/v3/Plugins/SplitText/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- https://www.w3.org/TR/WCAG22/ (2.2.2, 2.3.1, 2.4.11, 2.5.8 criterion text)
- https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/
- https://webkit.org/blog/7551/responsive-design-for-motion/
- https://emilkowal.ski/ui/building-a-drawer-component (CSS variable vs direct transform during drag)
- https://www.nngroup.com/articles/scrolljacking-101/
- MDN browser-compat-data 8.1.3 (published 2026-09-24): support versions for LoAF, scheduler.yield, content-visibility, prefers-reduced-transparency, prefers-reduced-data, deviceMemory, saveData, hidden=until-found, LCP/Event Timing in Safari 26.2
