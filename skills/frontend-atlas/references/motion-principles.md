# Motion Principles: tokens, timing, choreography, taste
> Load when: choosing easings/durations/springs, writing a motion token file, orchestrating an intro or state change, deciding WHETHER something should animate, or giving a site a coherent motion personality.
> Stack assumptions: React 19 / Next 16 App Router + TS, gsap 3.15 + @gsap/react 2.1 (useGSAP), motion 13.4 (`motion/react`), lenis 1.3. Plain CSS first wherever CSS can do it.

Scroll mechanics live in `scroll-gsap.md` and `scroll-css-native.md`; component behaviours in `interactions.md`; route transitions in `page-transitions.md`; perf/a11y rules in `performance-a11y.md`. This file is the physics and taste layer they all share.

## Contents
- [Decision guide](#decision-guide)
- [1. Easing token library (CSS custom properties)](#1-easing-token-library-css-custom-properties)
- [2. Ease mapping: CSS -> GSAP -> Motion (shared TS module)](#2-ease-mapping-css---gsap---motion-shared-ts-module)
- [3. Springs and bounces in pure CSS with linear()](#3-springs-and-bounces-in-pure-css-with-linear)
- [4. Motion springs: physics params vs visualDuration/bounce](#4-motion-springs-physics-params-vs-visualdurationbounce)
- [5. Springs vs curves: choosing](#5-springs-vs-curves-choosing)
- [6. Duration system: distance, size, frequency, enter vs exit](#6-duration-system-distance-size-frequency-enter-vs-exit)
- [7. Stagger math with total-time caps](#7-stagger-math-with-total-time-caps)
- [8. Timeline overlap and position parameters](#8-timeline-overlap-and-position-parameters)
- [9. Orchestrating a hero intro (GSAP, Motion, CSS)](#9-orchestrating-a-hero-intro-gsap-motion-css)
- [10. Pop-in without scale(0), origin-aware](#10-pop-in-without-scale0-origin-aware)
- [11. Interruptible: transitions vs keyframes](#11-interruptible-transitions-vs-keyframes)
- [12. Frequency rule and tooltip delays](#12-frequency-rule-and-tooltip-delays)
- [13. Press feedback](#13-press-feedback)
- [14. Blur-masked crossfade (icon and label swaps)](#14-blur-masked-crossfade-icon-and-label-swaps)
- [15. clip-path reveals and hold-to-confirm](#15-clip-path-reveals-and-hold-to-confirm)
- [16. State changes: layout / FLIP](#16-state-changes-layout--flip)
- [17. Choreography rules](#17-choreography-rules)
- [18. Disney's 12 principles mapped to UI](#18-disneys-12-principles-mapped-to-ui)
- [19. Perceived-performance tricks](#19-perceived-performance-tricks)
- [20. Scroll motion taste and the motion budget](#20-scroll-motion-taste-and-the-motion-budget)
- [21. Motion personality presets](#21-motion-personality-presets)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide

| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| Consistent feel across CSS, GSAP, Motion | One token file + shared TS ease module | CSS 0 / JS <1 kb | [1](#1-easing-token-library-css-custom-properties), [2](#2-ease-mapping-css---gsap---motion-shared-ts-module) |
| Element enters the screen | ease-out (quint/expo), 150-300 ms UI, 600-1200 ms editorial | CSS | [1](#1-easing-token-library-css-custom-properties), [6](#6-duration-system-distance-size-frequency-enter-vs-exit) |
| Element moves on screen A -> B | ease-in-out (cubic/quart) or zero-bounce spring | CSS / Motion | [5](#5-springs-vs-curves-choosing) |
| Physical, "alive", gesture release | Spring with velocity (stiffness/damping) | Motion ~ JS | [4](#4-motion-springs-physics-params-vs-visualdurationbounce) |
| Spring feel with zero JS | `linear()` spring token + fallback | CSS | [3](#3-springs-and-bounces-in-pure-css-with-linear) |
| Many items appear | Stagger with capped total | GSAP / Motion / CSS `--i` | [7](#7-stagger-math-with-total-time-caps) |
| Page-load hero | One timeline, overlapping, <= 1.6 s total | GSAP + SplitText | [9](#9-orchestrating-a-hero-intro-gsap-motion-css) |
| Popover / menu / tooltip | scale 0.96 + opacity from trigger origin | CSS | [10](#10-pop-in-without-scale0-origin-aware) |
| Rapid toggles (toasts, tabs, hover) | CSS transitions, not keyframes | CSS | [11](#11-interruptible-transitions-vs-keyframes) |
| Keyboard / high-frequency action | No animation | 0 | [12](#12-frequency-rule-and-tooltip-delays) |
| Swap icon/label without a visible seam | opacity + scale + blur(2-4px) | CSS filter (small area only) | [14](#14-blur-masked-crossfade-icon-and-label-swaps) |
| Reveal without layout shift | clip-path inset() | Paint (composited in Chromium) | [15](#15-clip-path-reveals-and-hold-to-confirm) |
| Grid <-> list, expand card, shared element | FLIP (GSAP Flip / Motion `layout`) | JS | [16](#16-state-changes-layout--flip) |
| Scroll storytelling | Motion budget + one signature moment | depends | [20](#20-scroll-motion-taste-and-the-motion-budget) |
| Whole-site personality | Preset token block | CSS | [21](#21-motion-personality-presets) |

## Recipes

### 1. Easing token library (CSS custom properties)
**Looks like:** Every transition on the site shares the same few curves, so motion feels authored rather than assembled from defaults.  
**Use when / avoid when:** Always, as the first file of any animated project. The AI-slop version is one `ease-in-out 0.3s` everywhere, or a different random cubic-bezier per component. Pick 2-3 curves per site (an enter curve, a move curve, an exit curve) and stop.  
**Stack:** CSS (Tailwind 4 `@theme` variant below)
```css
/* motion-tokens.css : import once, globally */
:root {
  /* ---------- Durations ---------- */
  --dur-0: 0ms;
  --dur-micro: 100ms;      /* press, toggle knob, color */
  --dur-fast: 150ms;       /* hover, tooltip, small fade */
  --dur-base: 200ms;       /* dropdown, popover, small move */
  --dur-moderate: 300ms;   /* dialog, toast, card expand */
  --dur-slow: 450ms;       /* drawer, large panel */
  --dur-slower: 700ms;     /* section reveal, route change */
  --dur-cinematic: 1200ms; /* hero lines, image reveals */

  /* ---------- Decelerate (enter). easings.net approximations ---------- */
  --ease-out-sine:  cubic-bezier(0.61, 1, 0.88, 1);
  --ease-out-quad:  cubic-bezier(0.5, 1, 0.89, 1);
  --ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-circ:  cubic-bezier(0, 0.55, 0.45, 1);
  --ease-out-back:  cubic-bezier(0.34, 1.56, 0.64, 1);   /* ~10% overshoot */

  /* ---------- Accelerate (exit that leaves the screen) ---------- */
  --ease-in-quad:  cubic-bezier(0.11, 0, 0.5, 0);
  --ease-in-cubic: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-in-quart: cubic-bezier(0.5, 0, 0.75, 0);
  --ease-in-quint: cubic-bezier(0.64, 0, 0.78, 0);
  --ease-in-expo:  cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-circ:  cubic-bezier(0.55, 0, 1, 0.45);
  --ease-in-back:  cubic-bezier(0.36, 0, 0.66, -0.56);

  /* ---------- In-out (on-screen A -> B moves, page transitions) ---------- */
  --ease-in-out-sine:  cubic-bezier(0.37, 0, 0.63, 1);
  --ease-in-out-quad:  cubic-bezier(0.45, 0, 0.55, 1);
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
  --ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1);
  --ease-in-out-expo:  cubic-bezier(0.87, 0, 0.13, 1);
  --ease-in-out-circ:  cubic-bezier(0.85, 0, 0.15, 1);

  /* ---------- Material 3 (m3.material.io tokens) ---------- */
  --ease-m3-standard:          cubic-bezier(0.2, 0, 0, 1);
  --ease-m3-standard-decel:    cubic-bezier(0, 0, 0, 1);
  --ease-m3-standard-accel:    cubic-bezier(0.3, 0, 1, 1);
  --ease-m3-emphasized-decel:  cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-m3-emphasized-accel:  cubic-bezier(0.3, 0, 0.8, 0.15);
  --ease-m3-legacy:            cubic-bezier(0.4, 0, 0.2, 1);
  /* M3 "emphasized" is a 2-segment path; cubic fallback first, exact linear() below */
  --ease-m3-emphasized:        cubic-bezier(0.2, 0, 0, 1);

  /* ---------- Apple-ish ---------- */
  --ease-ios-sheet:   cubic-bezier(0.32, 0.72, 0, 1); /* Vaul / Ionic sheet, pair with 500ms */
  --ease-ca-default:  cubic-bezier(0.25, 0.1, 0.25, 1); /* = CSS `ease`, CAMediaTimingFunction default */
  --ease-motion-default: cubic-bezier(0.25, 0.1, 0.35, 1); /* Motion's default tween */

  /* ---------- Semantic aliases: components use ONLY these ---------- */
  --ease-enter: var(--ease-out-quint);
  --ease-exit: var(--ease-in-cubic);
  --ease-move: var(--ease-in-out-cubic);
  --ease-emphasis: var(--ease-out-expo);
}

@supports (transition-timing-function: linear(0, 1)) {
  :root {
    /* Exact M3 emphasized path, sampled (22 stops) */
    --ease-m3-emphasized: linear(0, 0.002 1.6%, 0.008 3.2%, 0.033 6.3%, 0.073 9%, 0.128 11.4%, 0.192 13.3%, 0.271 15%, 0.544 18.3%, 0.659 20.6%, 0.717 22.4%, 0.765 24.6%, 0.807 27.2%, 0.844 30.3%, 0.883 34.9%, 0.915 40.6%, 0.942 47.2%, 0.963 54.9%, 0.98 64.1%, 0.991 74.2%, 0.998 86.3%, 1);
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    /* keep fades, kill travel: components multiply distances by this */
    --motion-distance-scale: 0;
    --dur-cinematic: 300ms;
    --dur-slower: 250ms;
  }
}
```
Tailwind 4 (CSS-first) exposes the same tokens as utilities (`ease-enter`, `duration-base`):
```css
@import "tailwindcss";
@theme {
  --ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-exit: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-move: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
  --default-transition-duration: 200ms;           /* what bare `transition` utilities use */
  --default-transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
```
**Tune:** out-quint vs out-expo is the main taste dial: quint is "confident UI", expo is "editorial whoosh" (more of the travel happens in the first 20%). in-out-quart (0.76,0,0.24,1) is the classic agency page-transition curve; in-out-cubic is calmer.  
**A11y/perf:** Easing is free; what matters is what you animate (see `performance-a11y.md#1-property-cost-table`). The reduced-motion block keeps timing tokens sane rather than zeroing them, so opacity fades still read.

Tailwind 4 note: Tailwind 4 ships `--ease-in`, `--ease-out`, `--ease-in-out` theme variables (namespace `--ease-*` -> `ease-*` utilities). Durations are not a theme namespace, so use `duration-[var(--dur-base)]` or plain CSS for them.

### 2. Ease mapping: CSS -> GSAP -> Motion (shared TS module)
**Looks like:** A GSAP hero, a Motion dropdown and a CSS hover all decelerate the same way.  
**Use when / avoid when:** Any project mixing libraries. GSAP's `power*` eases are the exact polynomial; the CSS cubic-beziers are approximations, so for pixel-identical feel register the CSS values as CustomEases.  
**Stack:** GSAP | Motion | CSS

| Family (Penner) | CSS token | GSAP name (exact math) | Motion |
|---|---|---|---|
| Linear | `linear` | `"none"` | `"linear"` |
| Sine out | `--ease-out-sine` | `"sine.out"` | `[0.61, 1, 0.88, 1]` |
| Quad out | `--ease-out-quad` | `"power1.out"` (GSAP default ease) | `[0.5, 1, 0.89, 1]` |
| Cubic out | `--ease-out-cubic` | `"power2.out"` | `[0.33, 1, 0.68, 1]` |
| Quart out | `--ease-out-quart` | `"power3.out"` | `[0.25, 1, 0.5, 1]` |
| Quint out | `--ease-out-quint` | `"power4.out"` | `[0.22, 1, 0.36, 1]` |
| Expo out | `--ease-out-expo` | `"expo.out"` | `[0.16, 1, 0.3, 1]` |
| Circ out | `--ease-out-circ` | `"circ.out"` | `"circOut"` or `[0, 0.55, 0.45, 1]` |
| Back out | `--ease-out-back` | `"back.out(1.7)"` (param = overshoot, 1.70158 default) | `"backOut"` or `[0.34, 1.56, 0.64, 1]` |
| Cubic in-out | `--ease-in-out-cubic` | `"power2.inOut"` | `[0.65, 0, 0.35, 1]` |
| Quart in-out | `--ease-in-out-quart` | `"power3.inOut"` | `[0.76, 0, 0.24, 1]` |
| Expo in-out | `--ease-in-out-expo` | `"expo.inOut"` | `[0.87, 0, 0.13, 1]` |
| Cubic in | `--ease-in-cubic` | `"power2.in"` | `[0.32, 0, 0.67, 0]` |
| Anticipate | n/a | `"back.in(1.7)"` then out | `"anticipate"` |
| Elastic / bounce | `linear()` (recipe 3) | `"elastic.out(1, 0.3)"`, `"bounce.out"` | spring with `bounce` |
| Steps | `steps(6, end)` | `"steps(6)"` | `steps(6)` from `motion` |
| CSS keywords | `ease-out` = (0,0,0.58,1) | n/a | `"easeOut"` is also (0,0,0.58,1): weak, avoid for enters |

GSAP mapping is by exponent: power1 = t^2 (quad), power2 = t^3 (cubic), power3 = t^4 (quart), power4 = t^5 (quint). Motion's named `easeIn/easeOut/easeInOut` equal the CSS keywords (0.42,0,1,1 / 0,0,0.58,1 / 0.42,0,0.58,1), which are too soft for premium enters; pass arrays.

```ts
// lib/motion-tokens.ts : single source of truth for JS libraries
export const EASE = {
  enter: [0.22, 1, 0.36, 1],        // out-quint
  emphasis: [0.16, 1, 0.3, 1],      // out-expo
  move: [0.65, 0, 0.35, 1],         // in-out-cubic
  page: [0.76, 0, 0.24, 1],         // in-out-quart
  exit: [0.32, 0, 0.67, 0],         // in-cubic
  sheet: [0.32, 0.72, 0, 1],        // iOS sheet (Vaul)
} as const satisfies Record<string, readonly [number, number, number, number]>;

export const DUR = {
  micro: 0.1, fast: 0.15, base: 0.2, moderate: 0.3, slow: 0.45, slower: 0.7, cinematic: 1.2,
} as const;

export const cssBezier = (e: readonly [number, number, number, number]) =>
  `cubic-bezier(${e.join(", ")})`;
```
```ts
// lib/gsap-eases.ts : register once on the client
"use client";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { EASE, DUR } from "./motion-tokens";

let registered = false;
export function registerEases() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(CustomEase);
  for (const [name, e] of Object.entries(EASE)) {
    CustomEase.create(name, e.join(","));   // "0.22,1,0.36,1" string form is accepted
  }
  gsap.defaults({ ease: "enter", duration: DUR.slow });
  registered = true;
}
// usage: gsap.to(el, { y: 0, ease: "emphasis" })
```
```tsx
// Motion: pass arrays straight through
"use client";
import { motion } from "motion/react";
import { EASE, DUR } from "@/lib/motion-tokens";

export function FadeUp({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: DUR.slower, ease: EASE.enter }}
    >
      {children}
    </motion.div>
  );
}
```
**Tune:** If GSAP tweens feel "stickier" than CSS ones, you are comparing `power4.out` (true t^5) with the looser `cubic-bezier(0.22,1,0.36,1)`; the CustomEase route removes the mismatch.  
**A11y/perf:** CustomEase precomputes lookup points on create, so create at startup, never inside a tween.

### 3. Springs and bounces in pure CSS with linear()
**Looks like:** A dialog or card settles with a real spring (tiny overshoot, natural decay) using only a CSS transition.  
**Use when / avoid when:** Enter/settle animations that are rarely interrupted (dialogs, toasts, cards, toggles). Avoid for gesture-driven or rapidly retargeted motion: a CSS spring has a fixed duration and does not carry velocity when interrupted, it just restarts from the current value (Josh Comeau). Use Motion there (recipe 4).  
**Stack:** CSS
```css
/* Generated from damped-spring physics (mass 1), simplified with RDP, 3-decimal rounding.
   Each token has a matching duration: the curve is only correct with ITS duration. */
:root {
  /* fallbacks for engines without linear() */
  --spring-smooth: cubic-bezier(0.22, 1, 0.36, 1);  --spring-smooth-dur: 500ms;
  --spring-snappy: cubic-bezier(0.22, 1, 0.36, 1);  --spring-snappy-dur: 400ms;
  --spring-gentle: cubic-bezier(0.34, 1.2, 0.64, 1); --spring-gentle-dur: 600ms;
  --spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1); --spring-bouncy-dur: 700ms;
}
@supports (transition-timing-function: linear(0, 1)) {
  :root {
    /* stiffness 171, damping 26.2 (zeta 1.0, no overshoot) = Motion {visualDuration: 0.4, bounce: 0} */
    --spring-smooth: linear(0, 0.006 1.3%, 0.022 2.7%, 0.084 5.7%, 0.459 18.3%, 0.631 25.3%, 0.697 28.7%, 0.757 32.3%, 0.807 36%, 0.848 39.7%, 0.888 44.3%, 0.92 49.3%, 0.945 54.7%, 0.965 61%, 0.978 67.7%, 0.988 75.7%, 1);
    --spring-smooth-dur: 650ms;
    /* stiffness 224, damping 25.4 (zeta 0.85, 0.6% overshoot) = Motion {visualDuration: 0.35, bounce: 0.15} */
    --spring-snappy: linear(0, 0.005 1.3%, 0.025 3%, 0.097 6.3%, 0.514 19.7%, 0.688 26.3%, 0.811 32.7%, 0.859 36%, 0.901 39.7%, 0.936 43.7%, 0.964 48.3%, 0.984 53.3%, 0.997 59%, 1.004 65%, 1.006 72.7%, 1);
    --spring-snappy-dur: 540ms;
    /* stiffness 110, damping 16.8 (zeta 0.8, 1.5% overshoot) = Motion {visualDuration: 0.5, bounce: 0.2} */
    --spring-gentle: linear(0, 0.005 1.3%, 0.025 3%, 0.098 6.3%, 0.528 19.7%, 0.71 26.3%, 0.775 29.3%, 0.836 32.7%, 0.885 36%, 0.927 39.7%, 0.961 43.7%, 0.984 47.7%, 1.001 52.3%, 1.011 57.7%, 1.015 68.7%, 1);
    --spring-gentle-dur: 770ms;
    /* stiffness 110, damping 13.6 (zeta 0.65, 6.8% overshoot) = Motion {visualDuration: 0.5, bounce: 0.35} */
    --spring-bouncy: linear(0, 0.008 1.3%, 0.03 2.7%, 0.12 5.7%, 0.622 17%, 0.817 22.3%, 0.892 25%, 0.951 27.7%, 0.996 30.3%, 1.029 33%, 1.048 35.3%, 1.06 37.7%, 1.067 40.3%, 1.068 43%, 1.059 48.3%, 1.017 62.7%, 1.002 71%, 0.995 83%, 1);
    --spring-bouncy-dur: 940ms;
    /* stiffness 135, damping 11.6 (zeta 0.5, 16% overshoot): stickers, toggles, playful brands only */
    --spring-playful: linear(0, 0.007 1%, 0.037 2.3%, 0.133 4.7%, 0.719 14%, 0.943 18.3%, 1.02 20.3%, 1.079 22.3%, 1.121 24.3%, 1.148 26.3%, 1.158 27.7%, 1.163 29.3%, 1.161 31%, 1.153 32.7%, 1.129 35.7%, 1.049 43.3%, 1.016 47%, 0.991 51%, 0.977 55.3%, 0.975 62%, 0.996 75.7%, 1.003 83%, 1.004 92.3%, 1);
    --spring-playful-dur: 1050ms;
  }
}

.card {
  transition: transform var(--spring-snappy-dur) var(--spring-snappy);
}
.card:hover { transform: translateY(-4px); }

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
  .card:hover { transform: none; }
}
```
Generator you can run anywhere (Node, browser console) to make a new token with the exact Motion mapping:
```js
// spring-to-linear.mjs : node spring-to-linear.mjs 0.4 0.1
const [vd = 0.4, bounce = 0] = process.argv.slice(2).map(Number);
const root = (2 * Math.PI) / (vd * 1.2);           // Motion 13.4 visualDuration mapping
const k = root * root;
const c = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(k);
const w0 = Math.sqrt(k), z = c / (2 * Math.sqrt(k));
const x = (t) => {
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};
let T = 0;
for (let t = 0; t < 10; t += 0.001) if (Math.abs(x(t) - 1) > 0.002) T = t;
const pts = Array.from({ length: 301 }, (_, i) => [i / 300, i === 300 ? 1 : x((T * i) / 300)]);
const rdp = (p, eps) => {
  if (p.length < 3) return p;
  const [a, b] = [p[0], p[p.length - 1]];
  let dmax = 0, idx = 0;
  for (let i = 1; i < p.length - 1; i++) {
    const d = Math.abs((b[1] - a[1]) * p[i][0] - (b[0] - a[0]) * p[i][1] + b[0] * a[1] - b[1] * a[0]) /
      Math.hypot(b[1] - a[1], b[0] - a[0]);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= eps) return [a, b];
  return rdp(p.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(p.slice(idx), eps));
};
const s = rdp(pts, 0.0025);
const stops = s.map(([u, v], i) =>
  i === 0 ? "0" : i === s.length - 1 ? "1" : `${+v.toFixed(3)} ${+(u * 100).toFixed(1)}%`);
console.log(`linear(${stops.join(", ")})  /* duration ${Math.round(T * 1000)}ms */`);
```
GUI alternative: Jake Archibald and Adam Argyle's generator (linear-easing-generator.netlify.app) takes a JS easing function or an SVG path, with "simplify" and "round" sliders, and has Spring / Bounce / Material emphasized presets. Easing Wizard (easingwizard.com) exposes stiffness/damping/mass directly. Open Props ships ready tokens `--ease-spring-1..5` and `--ease-bounce-1..5`.  
**Tune:** 20-40 stops is plenty (each spring costs about 1 kB uncompressed, so keep them in variables, never inline per rule). Overshoot above ~7% reads as "toy"; keep it for playful brands. Always ship the matching duration token.  
**A11y/perf:** Support: Chrome/Edge 113, Firefox 112, Safari 17.2 (Baseline since Dec 2023). Bouncy overshoot on large elements is a vestibular trigger: swap to `--spring-smooth` or a fade under reduced motion.

### 4. Motion springs: physics params vs visualDuration/bounce
**Looks like:** Motion's springs that feel identical to iOS, Material 3 Expressive, or Framer defaults, chosen on purpose instead of by accident.  
**Use when / avoid when:** Anything interruptible or gesture-driven (drag release, toggles, layout changes, `whileHover`/`whileTap`). Avoid bare `type: "spring"` with no params: that is stiffness 100 / damping 10 / mass 1 (damping ratio 0.5), a slow wobble that screams "default".  
**Stack:** Motion
```tsx
"use client";
import { motion, MotionConfig, type Transition } from "motion/react";

/** Two ways to define a spring (Motion 13.4):
 *  1. Time-defined: { visualDuration, bounce } -> easy to coordinate with tweens.
 *     NOTE (motion-dom source, v13.4.4): time-defined springs RESET inherited velocity to 0.
 *  2. Physics-defined: { stiffness, damping, mass } -> carries velocity on interruption.
 *     If stiffness/damping/mass are set, duration/bounce are ignored. */
export const SPRING = {
  // UI: fast, no visible overshoot
  snappy: { type: "spring", visualDuration: 0.25, bounce: 0.1 },
  // Default for layout / shared-element moves
  smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
  // Something the user "throws" (drag release): physics form keeps velocity
  release: { type: "spring", stiffness: 380, damping: 31, mass: 1 },   // M3 Expressive default spatial
  // Playful: toggles, stickers, success ticks
  bouncy: { type: "spring", visualDuration: 0.5, bounce: 0.35 },
} as const satisfies Record<string, Transition>;

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative h-7 w-12 rounded-full bg-neutral-300 data-[on=true]:bg-emerald-500"
      data-on={on}
    >
      <motion.span
        layout
        transition={SPRING.snappy}
        className="absolute top-1 size-5 rounded-full bg-white shadow"
        style={{ left: on ? "calc(100% - 1.5rem)" : "0.25rem" }}
      />
    </button>
  );
}

// Site-wide default + reduced motion in one place
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig transition={SPRING.smooth} reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
```
Conversions (mass 1; zeta = damping ratio):

| From | To Motion `stiffness` | To Motion `damping` |
|---|---|---|
| Motion `{visualDuration: v, bounce: b}` | `(2*PI / (1.2*v))^2` | `2 * (1 - b) * sqrt(stiffness)` |
| Material/Compose `(stiffness k, dampingRatio z)` | `k` | `2 * z * sqrt(k)` |
| SwiftUI `(response r, dampingFraction f)` | `(2*PI / r)^2` | `4*PI*f / r` |
| SwiftUI `(duration d, bounce b)` (approx) | `(2*PI / d)^2` | `2 * (1 - b) * sqrt(stiffness)` |
| Any (stiffness, damping, mass) -> zeta | | `zeta = damping / (2*sqrt(stiffness*mass))` |

Reference springs (stiffness / damping, mass 1):

| Name | stiffness | damping | zeta | Feel |
|---|---|---|---|---|
| Motion bare `type:"spring"` | 100 | 10 | 0.50 | wobbly, slow: never ship unintentionally |
| Motion default for x/y/rotate (no transition given) | 500 | 25 | 0.56 | quick with visible overshoot |
| Motion default for scale | 550 | 30 | 0.64 | (critically damped when animating to 0) |
| Motion default for opacity/colors | tween 0.3 s, ease [0.25, 0.1, 0.35, 1] | | | |
| M3 Standard fast / default / slow spatial | 1400 / 700 / 300 | 67.3 / 47.6 / 31.2 | 0.9 | Material "calm" |
| M3 Standard effects (opacity, color) fast / default / slow | 3800 / 1600 / 800 | 123 / 80 / 56.6 | 1.0 | no bounce |
| M3 Expressive spatial fast / default / slow | 800 / 380 / 200 | 33.9 / 31.2 / 22.6 | 0.6 / 0.8 / 0.8 | lively, visible bounce |
| SwiftUI `.spring()` default (response 0.55, 0.825) | 130.5 | 18.8 | 0.825 | iOS default |
| SwiftUI `.smooth` (0.5 s, bounce 0) | 158 | 25.1 | 1.0 | Apple "smooth" |
| SwiftUI `.snappy` (0.5 s, bounce 0.15) | 158 | 21.4 | 0.85 | Apple "snappy" |
| SwiftUI `.bouncy` (0.5 s, bounce 0.3) | 158 | 17.6 | 0.7 | Apple "bouncy" |

**Tune:** Pick by size/distance like Material does: small component (switch, checkbox) -> fast; card/popover -> default; full-screen/page -> slow. `bounce` 0 for anything carrying text; 0.1-0.2 for UI chrome; 0.3+ only for playful accents. `restDelta`/`restSpeed` defaults end the animation early enough; lower them only for huge distances where the tail visibly snaps.  
**A11y/perf:** `MotionConfig reducedMotion="user"` disables transform and layout animations for users with the OS setting while keeping opacity/color. Springs run on the main thread in JS (except where Motion hands a pre-baked `linear()` to WAAPI), so a busy main thread stutters them; keep heavy work out of the animation window.

### 5. Springs vs curves: choosing

| Situation | Use | Why |
|---|---|---|
| Enter/exit, fixed start and end, not interrupted | Bezier curve (out-quint/expo) | Predictable duration, easy to sequence in timelines |
| Anything the user can interrupt or retarget (hover in/out fast, toggles, tabs indicator) | Spring (Motion) or CSS transition | Retargets from current value; physics spring also keeps velocity |
| Drag / swipe release, throw, momentum | Physics spring (stiffness/damping) with gesture velocity | Only physics springs inherit velocity (time-defined ones reset it in Motion 13.4) |
| Scroll-scrubbed motion | `ease: "none"` (linear) on the tween, smoothing via `scrub: <seconds>` | Easing inside a scrubbed tween fights the scroll |
| Page/route transitions, curtains | In-out curve (quart/expo) | Symmetric acceleration reads as deliberate, cinematic |
| Timeline choreography (hero intro) | Curves; springs only on the final settle | Springs have unknown end time for overlaps unless time-defined |
| Numbers / counters | out-expo or spring zeta 1 | No overshoot on numeric values (99 -> 101 -> 100 looks like a bug) |
| Looping ambient (float, pulse) | sine in-out, yoyo | Springs don't loop naturally |

Rules of thumb:
- **Springs for things you touch, curves for things that happen to you.** (Rauno: "Great interactions are modeled after properties from the real world, like interruptibility.")
- Curves in timelines, springs on gestures and layout.
- Josh Comeau: the best springs usually do not visibly bounce; high-friction "buttery" springs are the default, bouncy is the exception.

### 6. Duration system: distance, size, frequency, enter vs exit
**Looks like:** Small things move quickly, big things take a beat longer, nothing feels sluggish, and dismissals are faster than arrivals.  
**Use when / avoid when:** Every project. The slop tell is one duration (usually 300 ms or 500 ms) for everything from a checkbox to a full-screen overlay, or 800 ms dropdowns "because it looks smooth".  
**Stack:** CSS tokens + TS helper

| Element | Travel / size | Enter | Exit | Curve |
|---|---|---|---|---|
| Press / `:active` | none | 100 ms | 150 ms release | out-quad |
| Hover color / background | none | 150 ms | 200-250 ms (slower out is fine) | `ease` / out-cubic |
| Tooltip | small | 120-150 ms after delay | 100 ms | out-quint |
| Dropdown, select, popover | < 400 px | 150-220 ms (Emil: 180 ms beats 400 ms) | 100-150 ms | out-quint |
| Toast | ~360 px | 300-400 ms (Sonner: 400 ms `ease`) | 200 ms | ease / out-cubic |
| Dialog / modal | 400-640 px | 200-300 ms | 150-200 ms | out-quint (scale 0.96 -> 1) |
| Drawer / sheet | full height | 400-500 ms (Vaul: 500 ms iOS curve) | 300 ms | `--ease-ios-sheet` |
| Accordion / expand | content height | 200-300 ms | 200 ms | in-out-cubic |
| Route / page transition | viewport | 400-700 ms | 250-400 ms | in-out-quart / expo |
| Section reveal on scroll | 16-40 px | 600-900 ms | none (don't replay) | out-quint / out-expo |
| Hero intro (once per session) | viewport | 1.0-1.6 s TOTAL | n/a | out-expo |

Distance-aware helper (grows with the square root of distance, like Material's size-based spring speeds):
```ts
// lib/duration.ts
/** seconds; 100px -> 0.26s, 400px -> 0.40s, 1000px -> 0.56s */
export function durationFor(
  distancePx: number,
  { min = 0.15, max = 0.6, base = 0.12, perSqrtPx = 0.014 } = {},
): number {
  const d = base + perSqrtPx * Math.sqrt(Math.abs(distancePx));
  return Math.min(max, Math.max(min, d));
}

/** exits: 60-75% of the enter duration */
export const exitFor = (enterSeconds: number) => Math.max(0.1, enterSeconds * 0.7);
```
Enter vs exit rules:
- **Exit faster than enter** (0.6-0.75x). The user already decided; the leaving element is in their way.
- Exits that stay on screen (popover closing into its trigger) still use ease-out; exits that **leave the screen** (drawer sliding away, page leaving) use ease-in / accelerate (M3 `emphasized-accelerate`).
- Emil Kowalski: UI animations usually stay under 300 ms; ease-out for elements entering or exiting because it responds instantly at the start.
- Exits never stagger (or stagger in reverse at 15-20 ms). Everything leaves together.
- Opacity can finish before transform: on enter, fade over the first 50-60% of the move so the element is legible while it settles.

**Tune:** `perSqrtPx` 0.010 (snappy product) to 0.020 (editorial). `max` 0.6 for UI; lift to 1.2 only for cinematic hero/page moments.  
**A11y/perf:** Long durations delay interactivity; never block pointer events for the duration of an enter animation. Under reduced motion, keep durations but set distances to 0 (fade only).

### 7. Stagger math with total-time caps
**Looks like:** A list cascades in 40-60 ms steps; a 40-item grid still finishes in half a second instead of crawling for 2.4 s.  
**Use when / avoid when:** Lists, grids, split text, nav items. Avoid staggering exits, and avoid staggering items the user is waiting to click (search results, table rows after filter): show them together.  
**Stack:** TS helper, GSAP, Motion, CSS

Total time = `delayFirst + each * (n - 1) + duration`. Cap the spread, not the per-item value, so 3 items and 40 items both feel right.
```ts
// lib/stagger.ts
export function staggerEach(count: number, { each = 0.06, maxSpread = 0.5 } = {}): number {
  if (count <= 1) return 0;
  return Math.min(each, maxSpread / (count - 1));
}
```
GSAP: `stagger.amount` always spreads the full amount (3 items with `amount: 0.5` get 0.25 s gaps, too slow), so compute `each` instead:
```ts
const items = gsap.utils.toArray<HTMLElement>(".card");
gsap.from(items, {
  y: 24,
  autoAlpha: 0,
  duration: 0.7,
  ease: "power4.out",
  stagger: { each: staggerEach(items.length), from: "start" },  // "center" | "edges" | "random" | index
});
// 2D grid, ripple from the clicked tile (index 7):
gsap.from(".tile", { scale: 0.96, autoAlpha: 0, duration: 0.5, stagger: { each: 0.03, grid: "auto", from: 7 } });
```
Motion (variants; `delayChildren: stagger()` is the current API and replaces `staggerChildren`):
```tsx
"use client";
import { motion, stagger, type Variants } from "motion/react";
import { staggerEach } from "@/lib/stagger";

export function CardList({ items }: { items: { id: string; title: string }[] }) {
  const list: Variants = {
    hidden: {},
    show: { transition: { delayChildren: stagger(staggerEach(items.length), { startDelay: 0.1 }) } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };
  return (
    <motion.ul variants={list} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
      {items.map((i) => (
        <motion.li key={i.id} variants={item}>{i.title}</motion.li>
      ))}
    </motion.ul>
  );
}
```
CSS (no JS). `sibling-index()` ships in Chrome 138 / Safari 26.2 / Firefox 154; keep a `--i` fallback:
```css
.stagger > * {
  --each: min(60ms, calc(500ms / max(1, var(--n, 8) - 1)));
  animation: rise 600ms var(--ease-out-quint) both;
  animation-delay: calc(var(--i, 0) * var(--each));
}
@supports (width: calc(sibling-index() * 1px)) {
  .stagger > * { animation-delay: calc((sibling-index() - 1) * var(--each)); }
}
@keyframes rise { from { opacity: 0; transform: translateY(16px); } }
@keyframes fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .stagger > * { animation-name: fade; animation-delay: 0ms; }
}
```
```tsx
<ul className="stagger" style={{ "--n": items.length } as React.CSSProperties}>
  {items.map((it, i) => (
    <li key={it.id} style={{ "--i": i } as React.CSSProperties}>{it.title}</li>
  ))}
</ul>
```
| Unit | each | cap spread |
|---|---|---|
| characters | 15-30 ms | 400-600 ms |
| words | 30-60 ms | 500-700 ms |
| lines (masked) | 70-120 ms | 500-800 ms |
| cards / list items | 40-80 ms | 400-600 ms |
| grid tiles | 25-40 ms from center or clicked tile | 600 ms |
| menu items on open | 30-50 ms | 300 ms |
| exits | 0 (together) or 15-20 ms reversed | 150 ms |

**Tune:** `each` 0.04-0.08 s is the premium band; below 0.02 reads as simultaneous, above 0.12 reads as slow. Ease the distribution (`stagger: { each, ease: "power1.in" }`) when a long list should accelerate.  
**A11y/perf:** Character stagger on long headings creates hundreds of animated nodes; split by lines or words for anything over ~30 characters. Under reduced motion, drop stagger delays (one fade).

### 8. Timeline overlap and position parameters
**Looks like:** Elements hand off to each other: the next starts while the previous is still settling, so the sequence reads as one gesture instead of a slideshow.  
**Use when / avoid when:** Any multi-element sequence. Strictly sequential steps (each waits for the last to finish) is the most common reason an intro feels slow and amateur.  
**Stack:** GSAP | Motion

GSAP position parameter cheat sheet:

| Position | Meaning |
|---|---|
| (omitted) | end of timeline |
| `1.2` | absolute time 1.2 s |
| `"+=0.3"` / `"-=0.3"` | gap / overlap relative to the end of the timeline |
| `"<"` / `">"` | start / end of the most recently added animation |
| `"<0.2"` / `">-0.1"` | 0.2 s after previous start / 0.1 s before previous end |
| `"<25%"` | 25% into the previous animation |
| `"-=25%"` | overlap by 25% of the inserted animation's duration |
| `"intro"` / `"intro+=0.4"` | label / offset from label (`tl.addLabel("intro", 0.5)`) |

```ts
const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "expo.out" } });
tl.from(".a", { yPercent: 100 })
  .from(".b", { y: 20, autoAlpha: 0 }, "<0.15")   // hand-off: starts 0.15s after .a starts
  .addLabel("details", ">-0.4")                   // 0.4s before .b ends
  .from(".c", { autoAlpha: 0 }, "details")
  .from(".d", { x: -12, autoAlpha: 0 }, "details+=0.08");
```
Motion `animate()` sequence (`at` accepts a number, `"+0.2"`, `"-0.2"`, `"<"`, or a label string placed in the array):
```ts
import { animate, stagger } from "motion";

animate([
  [".a", { y: ["100%", "0%"] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1] }],
  [".b", { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, at: "-0.65" }],
  "details",
  [".c", { opacity: [0, 1] }, { duration: 0.4, at: "details" }],
  [".d li", { opacity: [0, 1], x: [-12, 0] }, { duration: 0.4, delay: stagger(0.04), at: "<" }],
]);
```
Overlap math: with out-expo an element covers ~80% of its travel in the first ~25% of its duration, so the next element can start at `"<0.15"` to `"<0.25"` of a 0.8-1 s tween. With in-out curves, overlap less (start the next at 50-60%).  
**Tune:** Hand-off offset 20-40% of the previous duration. Total sequence <= 1.6 s for anything on the critical path.  
**A11y/perf:** Under reduced motion, `tl.progress(1)` (jump to end state) or build a fade-only timeline in the `gsap.matchMedia()` reduce branch (recipe 9).

### 9. Orchestrating a hero intro (GSAP, Motion, CSS)
**Looks like:** Frame 1 already shows the hero image (so LCP is not blocked). The image slowly settles from 1.08 scale while headline lines slide up out of masks in 80 ms steps, the sub-copy and CTA rise just behind them, and nav/meta fade in last. Interactive from the first frame, done in ~1.4 s.  
**Use when / avoid when:** Landing pages and portfolios, once per session. Avoid replaying it on every client-side navigation, avoid gating it behind a preloader (see `page-transitions.md` and `performance-a11y.md#8-lcp-preloaders-and-entrance-animations`), avoid animating every word of body copy.  
**Stack:** GSAP + SplitText (primary), Motion `useAnimate` (alternative), CSS-only (fallback / no-JS)

Worked timeline (seconds):

| t | Element | Motion | Duration / ease |
|---|---|---|---|
| 0.00 | media (largest, leads) | scale 1.08 -> 1 (never hidden) | 1.8 / expo.out |
| 0.10 | headline lines | yPercent 100 -> 0 inside line masks, stagger 0.08 | 1.0 / expo.out |
| ~0.45 | sub-copy | y 16 -> 0, autoAlpha 0 -> 1 | 0.7 / power4.out |
| ~0.57 | CTA | y 12 -> 0, autoAlpha 0 -> 1 | 0.6 / power4.out |
| ~0.67 | nav + meta | autoAlpha only, stagger 0.04 | 0.5 / none |

Anti-FOUC guard (root layout): hide intro elements only while JS is expected, with a failsafe.
```tsx
// app/layout.tsx (excerpt)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('intro-pending');setTimeout(function(){d.classList.remove('intro-pending')},2500)})();",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```
```css
/* globals.css */
html.intro-pending [data-intro] { visibility: hidden; }
.hero { position: relative; min-height: 100svh; display: grid; align-content: end; padding: 6vw; }
.hero-frame { position: absolute; inset: 0; overflow: hidden; z-index: -1; }
.hero-media, .hero-media img { width: 100%; height: 100%; object-fit: cover; }
.hero-title { font-size: clamp(2.75rem, 8vw, 8rem); line-height: 0.95; }
```
GSAP version:
```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, SplitText);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { reduce } = ctx.conditions as { motion: boolean; reduce: boolean };

          if (reduce) {
            // Reduce, don't remove: one calm fade, no travel, no scale.
            gsap.fromTo("[data-intro]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "none" });
            document.documentElement.classList.remove("intro-pending");
            return;
          }

          SplitText.create("[data-intro='title']", {
            type: "lines",
            mask: "lines",      // wraps each line in an overflow-clipping parent
            autoSplit: true,    // re-splits on font load / resize; the returned tl is time-synced
            onSplit(self) {
              const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
              tl.from("[data-intro='media']", { scale: 1.08, duration: 1.8 }, 0)
                .from(self.lines, { yPercent: 100, duration: 1.0, stagger: 0.08 }, 0.1)
                .from("[data-intro='copy']", { y: 16, autoAlpha: 0, duration: 0.7, ease: "power4.out" }, "<0.35")
                .from("[data-intro='cta']", { y: 12, autoAlpha: 0, duration: 0.6, ease: "power4.out" }, "<0.12")
                .from("[data-intro='chrome'] > *", { autoAlpha: 0, duration: 0.5, stagger: 0.04, ease: "none" }, "<0.1");
              return tl;
            },
          });
          // from() tweens rendered their start state synchronously above, so no flash:
          document.documentElement.classList.remove("intro-pending");
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="hero">
      <div className="hero-frame">
        <div data-intro="media" className="hero-media">
          <img src="/hero.jpg" alt="" fetchPriority="high" decoding="async" />
        </div>
      </div>
      <nav data-intro="chrome" aria-label="Primary">
        <a href="#work">Work</a> <a href="#about">About</a> <a href="#contact">Contact</a>
      </nav>
      <h1 data-intro="title" className="hero-title">Interfaces that move with intent</h1>
      <p data-intro="copy">Independent design engineer building fast, tactile web experiences.</p>
      <a data-intro="cta" href="#work">See selected work</a>
    </section>
  );
}
```
Motion version (core Motion has no SplitText, so author the lines; `aria-label` on the heading plus `aria-hidden` lines keeps screen readers reading one sentence):
```tsx
"use client";
import { useEffect } from "react";
import { stagger, useAnimate, useReducedMotion } from "motion/react";

const EXPO = [0.16, 1, 0.3, 1] as const;
const QUINT = [0.22, 1, 0.36, 1] as const;

export function HeroMotion({ lines, copy }: { lines: string[]; copy: string }) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const reduce = useReducedMotion();

  useEffect(() => {
    const controls = reduce
      ? animate("[data-intro]", { opacity: [0, 1] }, { duration: 0.4 })
      : animate([
          ["[data-intro='media']", { scale: [1.08, 1] }, { duration: 1.8, ease: EXPO, at: 0 }],
          ["[data-line]", { y: ["100%", "0%"] }, { duration: 1, ease: EXPO, delay: stagger(0.08), at: 0.1 }],
          ["[data-intro='copy']", { opacity: [0, 1], y: [16, 0] }, { duration: 0.7, ease: QUINT, at: "-0.9" }],
          ["[data-intro='cta']", { opacity: [0, 1], y: [12, 0] }, { duration: 0.6, ease: QUINT, at: "-0.55" }],
        ]);
    document.documentElement.classList.remove("intro-pending");
    return () => controls.stop();
  }, [animate, reduce]);

  return (
    <section ref={scope} className="hero">
      <div className="hero-frame">
        <div data-intro="media" className="hero-media"><img src="/hero.jpg" alt="" fetchPriority="high" /></div>
      </div>
      <h1 data-intro="title" className="hero-title" aria-label={lines.join(" ")}>
        {lines.map((l) => (
          <span key={l} aria-hidden="true" style={{ display: "block", overflow: "clip", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span data-line style={{ display: "block" }}>{l}</span>
          </span>
        ))}
      </h1>
      <p data-intro="copy">{copy}</p>
      <a data-intro="cta" href="#work">See selected work</a>
    </section>
  );
}
```
CSS-only version (works without JS, zero FOUC risk; use when the intro is simple):
```css
@media (prefers-reduced-motion: no-preference) {
  .hero-media { animation: hero-settle 1.8s var(--ease-out-expo) both; }
  .hero-line > span { display: block; animation: hero-line 1s var(--ease-out-expo) both;
    animation-delay: calc(100ms + var(--i) * 80ms); }
  .hero-copy { animation: hero-rise 0.7s var(--ease-out-quint) 0.45s both; }
  .hero-cta { animation: hero-rise 0.6s var(--ease-out-quint) 0.57s both; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-copy, .hero-cta, .hero-line > span { animation: hero-fade 0.4s ease both; }
}
.hero-line { display: block; overflow: clip; padding-bottom: 0.08em; margin-bottom: -0.08em; }
@keyframes hero-settle { from { transform: scale(1.08); } }
@keyframes hero-line { from { transform: translateY(100%); } }
@keyframes hero-rise { from { opacity: 0; transform: translateY(16px); } }
@keyframes hero-fade { from { opacity: 0; } }
```
**Tune:** Media scale 1.05-1.12 (above 1.15 reads as a zoom effect); line stagger 0.06-0.1; total 1.0-1.6 s. If the page has a preloader, the intro must start the instant it lifts and the preloader must be < 1 s.  
**A11y/perf:** Media is never at opacity 0 (keeps LCP measurable). SplitText's default `aria: "auto"` puts `aria-label` on the heading and `aria-hidden` on the line/word/char children (it does not preserve nested links or semantics inside the split element). Animate only transform/opacity; the mask wrapper uses overflow clip, not clip-path.

### 10. Pop-in without scale(0), origin-aware
**Looks like:** A menu grows out of the button that opened it: from 96% scale and transparent, anchored at the trigger, in under 200 ms.  
**Use when / avoid when:** Popovers, dropdowns, context menus, tooltips, select lists. Dialogs/modals are not anchored, so they keep `transform-origin: center`. Never animate from `scale(0)`: nothing in the real world appears from a point (Emil uses 0.93-0.95+; tooltips can start at 0.97).  
**Stack:** CSS (Radix / Base UI / native popover), Motion
```css
/* Radix: Presence waits for animationend, so use keyframes keyed on data-state */
.menu-content {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  animation: pop-in var(--dur-base) var(--ease-out-quint);
}
.menu-content[data-state="closed"] {
  animation: pop-out 120ms var(--ease-out-cubic) forwards;
}
@keyframes pop-in  { from { opacity: 0; transform: scale(0.96); } }
@keyframes pop-out { to   { opacity: 0; transform: scale(0.98); } }
@keyframes fade-only { from { opacity: 0; } }

/* Base UI: exposes --transform-origin and data-starting-style / data-ending-style,
   which lets you use (interruptible) transitions instead of keyframes */
.bui-popup {
  transform-origin: var(--transform-origin);
  transition: opacity 180ms var(--ease-out-quint), transform 180ms var(--ease-out-quint);
}
.bui-popup[data-starting-style],
.bui-popup[data-ending-style] { opacity: 0; transform: scale(0.96); }

@media (prefers-reduced-motion: reduce) {
  .menu-content { animation-name: fade-only; }
  .bui-popup[data-starting-style], .bui-popup[data-ending-style] { transform: none; }
}
```
Radix per-component variables: `--radix-dropdown-menu-content-transform-origin`, `--radix-popover-content-transform-origin`, `--radix-tooltip-content-transform-origin`, `--radix-select-content-transform-origin`, `--radix-context-menu-content-transform-origin`, `--radix-hover-card-content-transform-origin`. Native `[popover]` + `@starting-style` version: see `css-modern.md`.

Motion version when you own positioning (menu under a button, left-aligned):
```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";

export function Menu({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "top left", position: "absolute", top: "calc(100% + 6px)", left: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```
**Tune:** start scale 0.95-0.97 (larger panels closer to 0.98), `y` offset 4-8 px toward the trigger, 150-220 ms.  
**A11y/perf:** Focus moves into the menu immediately on open (never wait for the animation). Transform/opacity only; never animate a menu's `height`.

### 11. Interruptible: transitions vs keyframes
**Looks like:** Hover a card in and out quickly and it reverses smoothly from wherever it is; add five toasts rapidly and the stack glides instead of jumping.  
**Use when / avoid when:** Anything the user can toggle faster than the animation duration. Emil (Sonner): with keyframes, toasts added quickly made older ones "jump into their new position"; transitions "can be interrupted and retargeted". Keyframes are fine for one-shot enters (page load, reveal once).  
**Stack:** CSS | GSAP | Motion
```css
/* Transition: retargets from the current value mid-flight */
.toast {
  transform: translateY(calc(var(--index) * -14px)) scale(calc(1 - var(--index) * 0.05));
  opacity: calc(1 - var(--index) * 0.15);
  transition: transform 400ms ease, opacity 400ms ease;   /* Sonner's values */
}
.toast[data-mounted="false"] { transform: translateY(100%); opacity: 0; }
```
```tsx
// mount-then-transition (what Sonner does): render with data-mounted=false, flip to true next frame
"use client";
import { useEffect, useState } from "react";

export function Toast({ index, children }: { index: number; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <li className="toast" data-mounted={mounted} style={{ "--index": index } as React.CSSProperties}>
      {children}
    </li>
  );
}
```
GSAP equivalents: one paused tween driven by `play()` / `reverse()` (reverses from current progress), `gsap.quickTo()` for values retargeted every pointer move, or `overwrite: "auto"` on repeated `gsap.to()` calls.
```ts
const lift = gsap.to(card, { y: -6, duration: 0.35, ease: "power3.out", paused: true });
card.addEventListener("pointerenter", () => lift.play());
card.addEventListener("pointerleave", () => lift.reverse());
```
Motion: every `animate` / `whileHover` / `layout` change is interruptible and starts from the current value; physics springs also keep velocity (recipe 4).  
**Tune:** Hover enter 200-350 ms; a slightly slower exit feels relaxed.  
**A11y/perf:** In Sonner-style stacks, set a CSS var per item instead of writing transforms from JS each frame. Vaul's lesson: while dragging, write `transform` directly on the element; updating a CSS variable consumed by children forced style recalculation of the whole subtree.

### 12. Frequency rule and tooltip delays
**Looks like:** The command palette opened with Cmd+K appears instantly; the same palette opened by clicking gets a 150 ms fade. The first tooltip waits, the next ones appear with no delay and no animation.  
**Use when / avoid when:** Always ask "how many times a day will someone see this?" (Emil: Raycast has no open animation because it is used hundreds of times a day; keyboard-initiated actions should never animate). Rauno: "When so commonly executed, the interaction novelty is also diminished."  
**Stack:** CSS | React

| Frequency | Examples | Budget |
|---|---|---|
| Hundreds / day | keyboard shortcuts, command palette via keys, typing, arrow-key list navigation, tab switching by key | none |
| Tens / day | menus, dropdowns, hover states, tabs by click | 100-200 ms, subtle, opacity/scale only |
| Occasional | dialogs, toasts, drawers, route changes | 200-400 ms standard |
| Rare | onboarding, success, first-visit hero, 404 | room for delight, 600-1500 ms |

```tsx
"use client";
import { useEffect, useState } from "react";

export function CommandPalette({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setInstant(true);             // keyboard-initiated -> no animation
        setOpen((o) => !o);
      }
      if (e.key === "Escape") { setInstant(true); setOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button type="button" onClick={() => { setInstant(false); setOpen(true); }}>Search</button>
      <div className="palette" data-open={open} data-instant={instant} role="dialog" aria-modal="true" aria-label="Command palette" inert={!open}>
        {children}
      </div>
    </>
  );
}
```
```css
.palette { opacity: 0; transform: scale(0.98); pointer-events: none;
  transition: opacity 150ms var(--ease-out-quint), transform 150ms var(--ease-out-quint); }
.palette[data-open="true"] { opacity: 1; transform: none; pointer-events: auto; }
.palette[data-instant="true"] { transition-duration: 0ms; }

/* Radix Tooltip: Provider delayDuration defaults to 700ms, skipDelayDuration to 300ms.
   Content gets data-state="delayed-open" (first) or "instant-open" (while skipping). */
.tooltip[data-state="delayed-open"] { animation: tip-in 150ms var(--ease-out-quint); }
.tooltip[data-state="instant-open"] { animation: none; }
@keyframes tip-in { from { opacity: 0; transform: scale(0.97); } }
```
**Tune:** Tooltip open delay 300-700 ms (400-500 feels responsive without accidental triggers), skip window 300 ms. Hover-intent delay for mega-menus 100-150 ms open, 200-300 ms close grace.  
**A11y/perf:** `inert` on the closed palette keeps its controls out of the tab order (React 19 accepts the boolean prop). Keyboard focus must also open tooltips (Radix does), and `Escape` closes instantly.

### 13. Press feedback
**Looks like:** Buttons dip to 97% the instant the pointer goes down and spring back on release; the UI feels like it is listening.  
**Use when / avoid when:** Every clickable button and icon button (Emil: `scale: 0.97` on `:active`). Avoid on text links, on large cards (use 0.99 or a shadow change) and on anything inside a scrolling list on touch (press state flickers during scroll).  
**Stack:** CSS | Motion
```css
.btn {
  transition: transform 160ms var(--ease-out-quad), background-color 150ms ease;
}
.btn:active {
  transform: scale(0.97);
  transition-duration: 80ms;            /* go down fast, come back softer */
}
.btn:disabled:active { transform: none; }
```
```tsx
<motion.button whileTap={{ scale: 0.97 }} transition={{ type: "spring", visualDuration: 0.15, bounce: 0 }}>
  Save
</motion.button>
```
**Tune:** 0.95-0.98 for buttons, 0.99 for cards. Down 60-100 ms, up 150-200 ms.  
**A11y/perf:** Transform only. A 3% press is not a vestibular trigger, so it can stay under reduced motion; it is feedback, not decoration.

### 14. Blur-masked crossfade (icon and label swaps)
**Looks like:** A copy icon morphs into a check: the outgoing icon shrinks and blurs while the new one sharpens in its place, so you never see two crisp icons overlapping.  
**Use when / avoid when:** Swapping small things in place: icons, button labels, status text, number units. Emil: "use blur when nothing else works" (about 2 px, combined with scale) to hide the double-exposure of a crossfade. Never blur large areas, full sections or anything scrubbed.  
**Stack:** Motion | CSS
```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const swap = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(4px)" },
};

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button type="button" onClick={onCopy} aria-label="Copy to clipboard" className="grid size-8 place-items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "check" : "copy"}
          variants={swap}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }}
          style={{ display: "grid" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {copied ? (
              <path d="M20 6 9 17l-5-5" />
            ) : (
              <>
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </>
            )}
          </svg>
        </motion.span>
      </AnimatePresence>
      <span role="status" className="sr-only">{copied ? "Copied" : ""}</span>
    </button>
  );
}
```
CSS-only (both states rendered, stacked in one grid cell):
```css
.swap { display: grid; }
.swap > * {
  grid-area: 1 / 1;
  transition: opacity 180ms var(--ease-out-quint), transform 180ms var(--ease-out-quint), filter 180ms var(--ease-out-quint);
}
.swap[data-state="a"] > .b,
.swap[data-state="b"] > .a { opacity: 0; transform: scale(0.6); filter: blur(4px); }
@media (prefers-reduced-motion: reduce) {
  .swap[data-state="a"] > .b, .swap[data-state="b"] > .a { transform: none; filter: none; }
}
```
**Tune:** blur 2-4 px for icons, 4-8 px for a short word; scale 0.5-0.8 for icons (tiny area, so this does not break the "no scale(0)" rule); 150-250 ms.  
**A11y/perf:** Blur is a filter: fine on a 16-100 px element, janky on large or many elements. Announce the new state via a live region, since an icon swap is invisible to screen readers.

### 15. clip-path reveals and hold-to-confirm
**Looks like:** An image unrolls from the top edge without any layout shift; a destructive button fills with red from left to right while you hold it, and drains back if you let go.  
**Use when / avoid when:** Reveals where you want a hard edge (images, color blocks, before/after sliders, text-mask comparisons). Emil's list: comparison sliders, text masks, image reveals, tabs color swap, hold-to-delete. Prefer `inset()`/`circle()`; `polygon()` only interpolates between polygons with the same point count.  
**Stack:** CSS | React
```css
/* Image reveal (Emil's values) */
.reveal { clip-path: inset(0 0 100% 0); }
.reveal[data-in="true"] {
  clip-path: inset(0 0 0 0);
  transition: clip-path 1s cubic-bezier(0.77, 0, 0.175, 1);   /* in-out-quart */
}
@media (prefers-reduced-motion: reduce) {
  .reveal { clip-path: none; opacity: 0; transition: opacity 400ms ease; }
  .reveal[data-in="true"] { opacity: 1; }
}

/* Hold to confirm */
.hold { position: relative; display: grid; border-radius: 999px; overflow: hidden; }
.hold > span { grid-area: 1 / 1; padding: 0.75rem 1.25rem; }
.hold-fill {
  background: #e5484d; color: #fff;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out-quint);           /* release: drain fast */
}
.hold[data-holding="true"] .hold-fill {
  clip-path: inset(0 0 0 0);
  transition: clip-path var(--hold, 2000ms) linear;            /* hold: linear = honest progress */
}
```
```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export function HoldToConfirm({ onConfirm, holdMs = 2000, label = "Hold to delete" }: {
  onConfirm: () => void; holdMs?: number; label?: string;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);
  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => { setHolding(false); onConfirm(); }, holdMs);
  };
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return (
    <button
      type="button"
      className="hold"
      data-holding={holding}
      style={{ "--hold": `${holdMs}ms` } as React.CSSProperties}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={cancel}
    >
      <span>{label}</span>
      <span className="hold-fill" aria-hidden="true">{label}</span>
    </button>
  );
}
```
Trigger `data-in` with an IntersectionObserver or `whileInView`, or go zero-JS with scroll-driven animations (`scroll-css-native.md`).  
**Tune:** reveal 0.8-1.2 s in-out-quart for editorial, 0.5 s out-quint for product UI; hold 1.2-2 s.  
**A11y/perf:** clip-path does not affect layout (no CLS). Chromium now composites clip-path and background-color CSS/WAAPI animations (runtime flags `CompositeClipPathAnimation`, `CompositeBGColorAnimation` are stable); Safari and Firefox repaint the clipped layer each frame, and JS-driven per-frame clip-path updates (GSAP, scroll scrub) repaint everywhere. Keep them on image-sized areas, not full-viewport scrubs. The hold fill is progress feedback, so keep it under reduced motion.

### 16. State changes: layout / FLIP
**Looks like:** Switching grid to list, every card glides to its new slot; a tab pill slides to the active tab; a thumbnail expands into the detail view instead of cutting.  
**Use when / avoid when:** The same object exists before and after (object permanence). Avoid when the content changes identity (new search results): crossfade instead. The slop version: fading everything out and back in on filter change, or animating `width/height/top/left` per frame.  
**Stack:** Motion `layout`/`layoutId` | GSAP Flip

Principles:
1. Animate from where it was to where it is (FLIP: First, Last, Invert, Play), using transforms only.
2. Siblings pushed by the change must animate too, otherwise they teleport and the eye loses the thread.
3. Size changes are scale transforms: children get distorted. Give children `layout` too (Motion corrects scale), use `layout="position"` for text blocks, set `borderRadius`/`boxShadow` via `style` so Motion can correct them.
4. Duration by distance (recipe 6): 0.3-0.5 s, in-out or a zero-bounce spring. Stagger large reflows by 10-20 ms.
5. Keep text crisp: crossfade text that changes size rather than scaling it.
```tsx
"use client";
import { LayoutGroup, motion } from "motion/react";

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <LayoutGroup id="tabs">
      <div role="tablist" className="flex gap-1 rounded-full bg-neutral-100 p-1">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={active === t}
            onClick={() => onChange(t)}
            className="relative rounded-full px-3 py-1.5 text-sm"
          >
            {active === t && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 bg-neutral-900"
                style={{ borderRadius: 999 }}
                transition={{ type: "spring", visualDuration: 0.3, bounce: 0.15 }}
              />
            )}
            <span className={active === t ? "relative text-white" : "relative text-neutral-600"}>{t}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
```
GSAP Flip in React (capture state BEFORE the state change, animate after React commits):
```tsx
"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, Flip);

export function LayoutSwitcher({ items }: { items: { id: string; title: string }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const [mode, setMode] = useState<"grid" | "list">("grid");

  const toggle = () => {
    flipState.current = Flip.getState(".flip-item", { props: "borderRadius" });
    setMode((m) => (m === "grid" ? "list" : "grid"));
  };

  useGSAP(
    () => {
      if (!flipState.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      Flip.from(flipState.current, {
        duration: reduce ? 0 : 0.5,
        ease: "power3.inOut",
        stagger: reduce ? 0 : 0.015,
        absolute: true,      // take items out of flow during the flip (avoids reflow fights in grids)
        nested: true,
      });
      flipState.current = null;
    },
    { dependencies: [mode], scope: root },   // useGSAP runs in a layout effect: before paint
  );

  return (
    <div ref={root}>
      <button type="button" onClick={toggle} aria-pressed={mode === "list"}>Toggle layout</button>
      <ul className={mode === "grid" ? "grid grid-cols-3 gap-4" : "flex flex-col gap-2"}>
        {items.map((it) => (
          <li key={it.id} className="flip-item rounded-xl bg-neutral-100 p-4">{it.title}</li>
        ))}
      </ul>
    </div>
  );
}
```
**Tune:** 0.35-0.6 s; `power3.inOut` or spring `{visualDuration: 0.4, bounce: 0}`; stagger 0.01-0.02.  
**A11y/perf:** Motion layout animations are automatically disabled by `MotionConfig reducedMotion="user"`; the Flip example snaps with duration 0. Height `auto` expansion without FLIP: `grid-template-rows: 0fr -> 1fr` or `interpolate-size` (Chromium only), see `css-modern.md`.

### 17. Choreography rules
**Looks like:** Motion that reads as one intention: the most important thing moves first, everything travels in a consistent direction, and nothing competes.  
**Use when / avoid when:** Any scene with 3+ moving elements.  
**Stack:** Principles (apply in any library)

1. **Lead with the largest / most important element.** Media or headline first, supporting copy 0.1-0.35 s later, chrome (nav, meta, badges) last. Hierarchy of motion = hierarchy of content.
2. **One direction per scene.** Everything in a reveal enters from the same side (usually from below, 12-24 px). Mixed directions look like a demo reel.
3. **Direction follows causality.** Menus grow from their trigger; next/forward comes from the right (or below), back from the left; dismissed things leave the way they came.
4. **Consistent spatial model site-wide.** Decide once: "deeper" = scale up / slide left, "back" = scale down / slide right. Page transitions, drawers and modals must agree.
5. **Group, then stagger.** At most 2-3 levels: section -> group -> items. Never stagger 40 things individually across a whole page.
6. **Overlap hand-offs** by 20-40% (recipe 8); never strictly sequential.
7. **Small distances.** UI reveals 8-24 px; editorial line masks 100% of line height; never slide paragraphs 100+ px.
8. **Opacity leads, transform settles.** Fade completes by ~60% of the move.
9. **Exits are quiet:** together, faster, less distance than the enter.
10. **Stillness after arrival.** No idle float/pulse near text the user is reading. Ambient motion lives in backgrounds, at low amplitude, and pauses offscreen.
11. **One focal motion at a time** (staging). If a toast, a counter and a background shader all move at once, nothing reads.
12. **Stable anchors.** Keep the page's structural lines (nav, grid gutters, headline baseline) still while content moves; the eye needs a fixed reference.

### 18. Disney's 12 principles mapped to UI
**Looks like:** The classic animation principles (Thomas and Johnston, "The Illusion of Life", 1981), translated into values that are appropriate for interfaces, where restraint beats exaggeration.  
**Use when / avoid when:** Use as a critique checklist. Most principles apply at 10-20% of the strength a cartoon uses.  
**Stack:** Any

| Principle | UI translation | Concrete values |
|---|---|---|
| Squash and stretch | Press dip, drag stretch on sliders/pills, jelly toggles (playful only) | scale 0.97 press; stretch scaleX <= 1.05 during fast drags |
| Anticipation | Tiny wind-up before a big move; hover lift that promises a click | `back.in(1.2)` 80-120 ms or Motion `"anticipate"`; hover y -2 to -4 px |
| Staging | One focal action at a time; dim or blur the backdrop behind a modal | backdrop 150-200 ms; nothing else animates while a dialog opens |
| Straight ahead vs pose to pose | Procedural/physics (springs, cursor followers) vs keyframed timelines | springs for gestures, timelines for intros |
| Follow-through and overlapping action | Children settle after their container; small spring overshoot; staggered hand-offs | stagger 40-80 ms; bounce 0.1-0.2 on containers only |
| Slow in and slow out | Easing: out for enters, in for leaving, in-out for on-screen moves | recipe 1 tokens |
| Arcs | Diagonal moves follow a curve (FAB -> sheet, card -> detail) | animate x and y with different eases (below) |
| Secondary action | Icon rotates as menu opens; shadow deepens as a card lifts | chevron rotate 180 deg with the same duration; shadow on a pseudo-element's opacity |
| Timing | Duration scales with size, distance and frequency | recipe 6 |
| Exaggeration | Reserve for the single signature moment; UI stays literal | rotation <= 3-6 deg, scale 0.95-1.05 outside the signature moment |
| Solid drawing | Consistent light, shadow direction and perspective across 3D tilts | one `perspective` (800-1200 px) for the whole page |
| Appeal | Coherent personality: one preset, applied everywhere | recipe 21 |

Arc trick (x and y with different eases trace a curve):
```ts
gsap.timeline()
  .to(fab, { x: 240, duration: 0.5, ease: "power1.inOut" }, 0)
  .to(fab, { y: -180, duration: 0.5, ease: "power2.in" }, 0);
```
Shadow as secondary action without animating `box-shadow` (paint-heavy):
```css
.card { position: relative; transition: transform 250ms var(--ease-out-quint); }
.card::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: -1;
  box-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.35);
  opacity: 0; transition: opacity 250ms var(--ease-out-quint);
}
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-4px); }
  .card:hover::after { opacity: 1; }
}
```

### 19. Perceived-performance tricks
**Looks like:** The site feels faster than it measures: every input is acknowledged instantly and waiting is disguised or shortened.  
**Use when / avoid when:** Always, especially on data-heavy product UI. Avoid spinners that flash for 80 ms.  
**Stack:** Principles + small snippets

| Trick | How | Values |
|---|---|---|
| Acknowledge in < 100 ms | `:active` press state, instant hover, optimistic UI | press within the same frame |
| Start motion at input time, not at data time | Open the drawer/page shell immediately; stream content in | shell 0 ms, content fade 150-200 ms |
| Delay loaders, then keep them | Show a spinner only if waiting > 300-500 ms; once shown keep it >= 500 ms to avoid a flash | `delay 400ms`, `min 500ms` |
| Skeletons over spinners for known layouts | Skeleton matches final layout (no CLS), subtle shimmer or none | shimmer 1.5-2 s linear, low contrast |
| Optimistic updates | Apply the change, reconcile later (React 19 `useOptimistic`) | roll back with a shake/toast on failure |
| Exits faster than enters | The user's next target appears sooner | exit 0.6-0.75x |
| Ease-out on anything the user triggers | Big change happens in the first frames | out-quint / out-expo |
| Prefetch on intent | Next `<Link>` prefetch, or prefetch on `pointerenter` / `pointerdown` | route transition feels 0-latency |
| Decode before reveal | `await img.decode()` before fading an image in, so the fade is not of a blank box | fade 300-500 ms |
| Progress that never stalls | Indeterminate progress that decelerates toward 90%, then completes quickly | NProgress-style trickle |

```ts
// hooks/use-delayed-flag.ts : delay-then-min-duration loader
"use client";
import * as React from "react";

export function useDelayedFlag(active: boolean, delay = 400, minVisible = 500) {
  const [visible, setVisible] = React.useState(false);
  const shownAt = React.useRef(0);
  React.useEffect(() => {
    let t: number | undefined;
    if (active) {
      t = window.setTimeout(() => { shownAt.current = performance.now(); setVisible(true); }, delay);
    } else if (visible) {
      const left = Math.max(0, minVisible - (performance.now() - shownAt.current));
      t = window.setTimeout(() => setVisible(false), left);
    }
    return () => window.clearTimeout(t);
  }, [active, delay, minVisible, visible]);
  return visible;
}
// usage: const showSpinner = useDelayedFlag(isPending);
```

### 20. Scroll motion taste and the motion budget
**Looks like:** Scrolling stays the user's; a few well-placed reveals and one memorable moment, instead of every block flying in from a different direction.  
**Use when / avoid when:** Any long-scroll marketing page or portfolio. Implementation lives in `scroll-gsap.md` / `scroll-css-native.md`; this is the taste layer.  
**Stack:** Principles + values

Parallax and scrub values that read as premium:

| Parameter | Premium range | Cheap / broken |
|---|---|---|
| Background image parallax | image 110-120% of its frame, `yPercent` -8 to +8 over the frame's viewport travel | whole sections moving at 0.5x (content overlaps, gaps appear) |
| Layer speed ratio (ScrollSmoother `data-speed`) | 0.85-1.15 for content, 0.7-0.9 for backgrounds | < 0.5 or > 1.5 on anything with text |
| Max parallax displacement | 40-120 px on desktop, 0-40 px on mobile | 300+ px |
| `scrub` (ScrollTrigger) | `true` for progress-critical pins; 0.3-1 (seconds of catch-up) for decorative | > 1.5: feels disconnected and laggy |
| Lenis `lerp` | 0.08-0.12 (default 0.1) | < 0.06 feels drunk and delays reading; syncTouch on mobile |
| Reveal trigger | element top at 80-90% of viewport, play once | re-animating on every scroll up |
| Reveal distance | 16-40 px, 0.6-0.9 s, out-quint/expo | 100 px slides + 1.5 s + bounce |

```ts
// Tasteful image parallax (inside an overflow-hidden frame; image is 116% tall)
gsap.utils.toArray<HTMLElement>("[data-parallax-img]").forEach((img) => {
  gsap.fromTo(img, { yPercent: -8 }, {
    yPercent: 8,
    ease: "none",
    scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 },
  });
});
```
Scroll-jacking consensus:
- NN/g usability testing (2023): scrolljacking caused disorientation for most participants; guidance: only if it progressively discloses valuable information, keep a sane scroll rate, include normal-scrolling sections, never change scroll direction, keep text minimal inside it, avoid it on mobile, and keep it below the fold.
- Practitioners on r/webdev and r/web_design are blunt: "ScrollJacking is interfaceJacking" (200+ upvotes); agency sites get it because awards juries notice "flashy, novel and slickly produced" things "even if they're actually fiddly and obnoxious to use"; it "forces the user to wait/slow down" while normal scrolling "lets the user browse as fast as they'd like"; it is "always bad when it changes the normal rate of scrolling, or overshoots/undershoots to somewhere the user didn't intend".
- Therefore: smooth scroll (Lenis) at default lerp is acceptable because it keeps native scroll and scroll rate; **section snapping, wheel-to-slide, and vertical-to-horizontal hijacks are the complaints**. If you pin, keep each pin <= 1.5-2 viewport heights of scroll, make the progress visible, and let the content be readable in any frame.

Motion budget per page (starting point):

| Budget item | Allowance |
|---|---|
| Signature moment | exactly 1 (hero intro OR one pinned story OR one WebGL scene), the only place exaggeration is allowed |
| Reveal patterns | <= 3 kinds (e.g. line-mask headings, fade-up blocks, image clip reveal), each used consistently |
| Pinned sections | 0-2, none above the fold, none on mobile unless trivial |
| Ambient/looping motion visible at once | <= 1 (marquee OR shader OR floating shapes), paused offscreen, with a pause control if > 5 s |
| Hover effects | 1 family (e.g. all cards lift 4 px); cursor effects only on pointer: fine |
| Total intro before interactivity | 0 ms (content interactive from first paint); visual intro <= 1.6 s |

The "one signature moment" rule: pick the single interaction people will remember (a WebGL hero, a scrubbed product reveal, a kinetic headline) and make everything else calm so it lands. Awwwards sites that feel expensive are mostly quiet pages with one loud idea.

### 21. Motion personality presets
**Looks like:** Swapping one attribute on `<html>` changes the whole site's motion character coherently.  
**Use when / avoid when:** Pick one per brand at the start; do not mix presets across pages. Pair with the matching direction in `aesthetic-directions.md`.  
**Stack:** CSS tokens (+ GSAP/Motion defaults mirrored in TS)

| Preset | Durations (UI / reveal) | Easing | Stagger | Distance | What moves | Never moves |
|---|---|---|---|---|---|---|
| Swiss precise | 160 / 500 ms | out-quart, in-out-cubic | 40 ms | 12 px, masks | headline lines, rules drawing (scaleX), counters | rotation, parallax, blur, overshoot |
| Luxury slow | 350 / 1400 ms | out-expo, in-out-quart | 120 ms | 24 px + image scale 1.1 -> 1 | large images, slow crossfades, letter-spaced titles by line | bounce, snappy hovers, char-by-char text, cursor gimmicks |
| Playful springy | spring 0.3-0.5 s | springs bounce 0.3-0.5 | 50 ms | 24 px + rotate 3-6 deg | stickers, icons, buttons (tap 0.94), illustrations | body text, page transitions with bounce |
| Tech snappy (Linear, Vercel, Raycast) | 140 / 450 ms | out-quint, spring bounce 0 | 25 ms | 6 px + blur 4 px on small items | panels, menus, numbers (NumberFlow), subtle gradient borders | parallax, long intros, preloaders |
| Editorial cinematic | 300 / 1200 ms | out-expo, in-out-quart (pages 900 ms) | 90 ms (lines) | 100% line masks, clip reveals | big type, full-bleed images, one pinned story | bouncy springs, hover wiggles |
| Brutal instant | 0-60 ms | `steps()` / linear | 0 | hard cuts | color inversions, marquees (linear), instant swaps | fades, blur, springs, easing curves |
| Organic calm (wellness) | 400 / 900 ms | in-out-sine, out-cubic | 80 ms | 12 px, slow blob morphs | backgrounds (6-12 s loops), soft fades | hard cuts, back/elastic overshoot |

```css
/* Defaults (Swiss) + overrides via <html data-motion="..."> */
:root {
  --m-dur-ui: 160ms; --m-dur-reveal: 500ms;
  --m-ease-enter: var(--ease-out-quart); --m-ease-move: var(--ease-in-out-cubic);
  --m-stagger: 40ms; --m-distance: 12px; --m-reveal-scale: 1;
}
:root[data-motion="luxury"] {
  --m-dur-ui: 350ms; --m-dur-reveal: 1400ms;
  --m-ease-enter: var(--ease-out-expo); --m-ease-move: var(--ease-in-out-quart);
  --m-stagger: 120ms; --m-distance: 24px; --m-reveal-scale: 1.02;
}
:root[data-motion="playful"] {
  --m-dur-ui: var(--spring-bouncy-dur); --m-dur-reveal: var(--spring-bouncy-dur);
  --m-ease-enter: var(--spring-bouncy); --m-ease-move: var(--spring-gentle);
  --m-stagger: 50ms; --m-distance: 24px; --m-reveal-scale: 0.96;
}
:root[data-motion="tech"] {
  --m-dur-ui: 140ms; --m-dur-reveal: 450ms;
  --m-ease-enter: var(--ease-out-quint); --m-ease-move: var(--spring-smooth);
  --m-stagger: 25ms; --m-distance: 6px; --m-reveal-scale: 1;
}
:root[data-motion="editorial"] {
  --m-dur-ui: 300ms; --m-dur-reveal: 1200ms;
  --m-ease-enter: var(--ease-out-expo); --m-ease-move: var(--ease-in-out-quart);
  --m-stagger: 90ms; --m-distance: 40px; --m-reveal-scale: 1;
}
:root[data-motion="brutal"] {
  --m-dur-ui: 0ms; --m-dur-reveal: 60ms;
  --m-ease-enter: steps(2, end); --m-ease-move: linear;
  --m-stagger: 0ms; --m-distance: 0px; --m-reveal-scale: 1;
}
:root[data-motion="organic"] {
  --m-dur-ui: 400ms; --m-dur-reveal: 900ms;
  --m-ease-enter: var(--ease-out-cubic); --m-ease-move: var(--ease-in-out-sine);
  --m-stagger: 80ms; --m-distance: 12px; --m-reveal-scale: 1;
}
@media (prefers-reduced-motion: reduce) {
  :root { --m-distance: 0px; --m-reveal-scale: 1; --m-stagger: 0ms; }
}

/* Consumers read only --m-* tokens */
.m-reveal {
  opacity: 0;
  transform: translateY(var(--m-distance)) scale(var(--m-reveal-scale));
  transition: opacity var(--m-dur-reveal) var(--m-ease-enter), transform var(--m-dur-reveal) var(--m-ease-enter);
  transition-delay: calc(var(--i, 0) * var(--m-stagger));
}
.m-reveal[data-in="true"] { opacity: 1; transform: none; }
.m-ui { transition: all var(--m-dur-ui) var(--m-ease-enter); transition-property: transform, opacity, background-color, color; }
```
```ts
// lib/motion-presets.ts : mirror for GSAP / Motion
export const PRESETS = {
  swiss:     { ui: 0.16, reveal: 0.5, ease: [0.25, 1, 0.5, 1],   stagger: 0.04, distance: 12, spring: { type: "spring", visualDuration: 0.3, bounce: 0 } },
  luxury:    { ui: 0.35, reveal: 1.4, ease: [0.16, 1, 0.3, 1],   stagger: 0.12, distance: 24, spring: { type: "spring", visualDuration: 0.6, bounce: 0 } },
  playful:   { ui: 0.3,  reveal: 0.6, ease: [0.34, 1.56, 0.64, 1], stagger: 0.05, distance: 24, spring: { type: "spring", visualDuration: 0.45, bounce: 0.4 } },
  tech:      { ui: 0.14, reveal: 0.45, ease: [0.22, 1, 0.36, 1], stagger: 0.025, distance: 6, spring: { type: "spring", visualDuration: 0.25, bounce: 0 } },
  editorial: { ui: 0.3,  reveal: 1.2, ease: [0.16, 1, 0.3, 1],   stagger: 0.09, distance: 40, spring: { type: "spring", visualDuration: 0.5, bounce: 0 } },
  brutal:    { ui: 0,    reveal: 0.06, ease: [0, 0, 1, 1],       stagger: 0, distance: 0, spring: { type: "tween", duration: 0 } },
  organic:   { ui: 0.4,  reveal: 0.9, ease: [0.37, 0, 0.63, 1],  stagger: 0.08, distance: 12, spring: { type: "spring", visualDuration: 0.7, bounce: 0.1 } },
} as const;
export type PresetName = keyof typeof PRESETS;
// GSAP:   gsap.defaults({ duration: PRESETS[p].reveal, ease: CustomEase.create(p, PRESETS[p].ease.join(",")) })
// Motion: <MotionConfig transition={PRESETS[p].spring} reducedMotion="user">
```
**Tune:** Change only durations and one easing first; distance is the second dial; stagger third.  
**A11y/perf:** The reduced-motion block zeroes travel, scale and stagger for every preset while keeping fades.

## Gotchas
- **Bare `type: "spring"` in Motion** is stiffness 100 / damping 10 (zeta 0.5): a slow wobble. Always pass `visualDuration`+`bounce` or tuned physics.
- **Motion time-defined springs drop velocity** (v13.4.4 source resets inherited velocity for `duration`/`visualDuration`/`bounce` springs). For drag-release and gesture continuity use `stiffness/damping/mass`.
- **Motion's `ease: "easeOut"` is the weak CSS keyword curve** (0, 0, 0.58, 1). Pass `[0.22, 1, 0.36, 1]` or a token array.
- **`linear()` spring with the wrong duration** looks broken (cut-off wobble or slow-motion). Keep each curve and its `-dur` token together.
- **GSAP `stagger.amount` on short lists** makes 3 items crawl; use a capped `each` (recipe 7).
- **Animating from `scale(0)`** reads as a cartoon pop; start at 0.93-0.97.
- **`transform-origin: center` on anchored popovers** makes them grow from nowhere; use the library's origin variable.
- **Keyframes for toggled UI** jump when re-triggered mid-animation; use transitions (recipe 11).
- **Same duration for enter and exit** makes dismissals feel sluggish; exits 0.6-0.75x.
- **Strictly sequential timelines** add 40-60% to intro length; overlap with `"<0.15"`-style positions.
- **Line masks cut descenders** (g, y, p) when the mask is overflow-clipped exactly to line-height; pad the mask `padding-bottom: 0.08em; margin-bottom: -0.08em`.
- **Split text before fonts load** yields wrong line breaks; use SplitText `autoSplit: true` (re-splits on font load and resize) and build tweens in `onSplit`.
- **Hover transforms on touch** stick after tap; gate hover motion with `@media (hover: hover) and (pointer: fine)`.
- **Hidden-until-JS content** without a failsafe disappears when JS fails; use the `intro-pending` class plus timeout (recipe 9).
- **Replaying reveals on scroll up** reads as cheap and fatigues; play once.
- **Bounce on text or numbers** looks like a rendering bug; overshoot only on containers and icons.
- **Blur and box-shadow animations on large areas** drop frames; blur small elements only and animate a pseudo-element's opacity for shadows.
- **Too many "signature" effects**: the second loud effect halves the impact of the first. One per page.

## Sources
- https://emilkowal.ski/ui/great-animations
- https://emilkowal.ski/ui/you-dont-need-animations
- https://emilkowal.ski/ui/7-practical-animation-tips
- https://emilkowal.ski/ui/building-a-toast-component
- https://emilkowal.ski/ui/building-a-drawer-component
- https://emilkowal.ski/ui/the-magic-of-clip-path
- https://animations.dev/
- https://rauno.me/craft/interaction-design
- https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/
- https://www.joshwcomeau.com/animation/linear-timing-function/
- https://motion.dev/docs/react-transitions
- https://motion.dev/docs/react-accessibility
- https://github.com/motiondivision/motion/blob/v13.4.4/packages/motion-dom/src/animation/generators/spring.ts
- https://github.com/motiondivision/motion/blob/main/packages/motion-dom/src/animation/utils/default-transitions.ts
- https://github.com/motiondivision/motion/blob/main/packages/motion-utils/src/easing/ease.ts
- https://gsap.com/docs/v3/Eases/
- https://gsap.com/docs/v3/Eases/CustomEase/
- https://gsap.com/docs/v3/Plugins/SplitText/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
- https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt
- https://developer.chrome.com/docs/css-ui/css-linear-easing-function
- https://github.com/jakearchibald/linear-easing-generator (tool: https://linear-easing-generator.netlify.app/)
- https://github.com/argyleink/open-props/blob/main/src/props.easing.js
- https://github.com/ai/easings.net/blob/master/src/easings.yml
- https://github.com/radix-ui/primitives/blob/main/packages/react/tooltip/src/tooltip.tsx
- https://developer.apple.com/documentation/SwiftUI/Animation/spring(response:dampingFraction:blendDuration:)
- https://github.com/darkroomengineering/lenis/blob/v1.3.26/README.md
- https://www.nngroup.com/articles/scrolljacking-101/
- https://www.reddit.com/r/webdev/comments/162e6a0/whats_the_deal_with_agency_websites_and_scroll/
- https://www.reddit.com/r/web_design/comments/cpz436/scrolljacking_is_interfacejacking/
- https://www.reddit.com/r/web_design/comments/uw8qo1/scrolljacking_with_sections_that_span_the_whole/
- https://www.reddit.com/r/webdev/comments/cj7ccz/it_scrolljacking_bad/
- https://www.reddit.com/r/web_design/comments/34olag/quickest_way_to_get_me_off_of_your_site/
- https://chromium.googlesource.com (runtime_enabled_features.json5: CompositeClipPathAnimation, CompositeBGColorAnimation status "stable")
- MDN browser-compat-data 8.1.3 (2026-09-24) for linear(), sibling-index(), transition-behavior support
