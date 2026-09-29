# Interactions: hover, cursor, micro-interactions, component behaviours
> Load when: building hover states, custom cursors, magnetic/tilt/spotlight effects, button and link feedback, tabs/accordion/popover/tooltip/toast/drawer behaviour, drag/swipe/reorder, dock magnification, hold-to-confirm, copy/like/toggle/checkbox/stepper feedback, skeletons, hover intent, command palette feel.
> Stack assumptions: React 19.3 / Next 16 App Router + TS, `motion` 13.4 (`motion/react`), `gsap` 3.15 + `@gsap/react` 2.1 (all plugins free: Draggable, InertiaPlugin, Observer), `sonner` 2.0, `vaul` 1.1, `@number-flow/react` 0.6, `canvas-confetti` 1.9, `cmdk` 1.1. Plain CSS first wherever it is enough; vanilla JS given for the cursor and magnetic recipes. Easing/duration philosophy lives in `motion-principles.md`; perf/a11y audits in `performance-a11y.md`; anchor positioning, `@starting-style`, popover API details in `css-modern.md`; library-grade component catalogues (Magic UI, Aceternity, React Bits) in `component-recipes.md`.

## Contents
- [Decision guide](#decision-guide)
- [Recipes](#recipes)
  - [0. Shared tokens and hooks](#0-shared-tokens-and-hooks)
  - [1. Custom cursor with trailing ring](#1-custom-cursor-with-trailing-ring)
  - [2. Magnetic elements](#2-magnetic-elements)
  - [3. Hover image reveal and image trail](#3-hover-image-reveal-and-image-trail)
  - [4. Button hover and press system](#4-button-hover-and-press-system)
  - [5. Link underlines](#5-link-underlines)
  - [6. 3D tilt card with glare](#6-3d-tilt-card-with-glare)
  - [7. Spotlight glow card grid](#7-spotlight-glow-card-grid)
  - [8. Tabs indicator and nav hover highlight](#8-tabs-indicator-and-nav-hover-highlight)
  - [9. Accordion popover and tooltip timing](#9-accordion-popover-and-tooltip-timing)
  - [10. Toasts and drawers](#10-toasts-and-drawers)
  - [11. Dock magnification](#11-dock-magnification)
  - [12. Drag inertia swipe cards and reorder](#12-drag-inertia-swipe-cards-and-reorder)
  - [13. Micro-interaction kit](#13-micro-interaction-kit)
  - [14. Loading feedback hover intent and command palette](#14-loading-feedback-hover-intent-and-command-palette)
  - [15. Image hover treatments](#15-image-hover-treatments)
- [Feel tuning table](#feel-tuning-table)
- [Taste verdicts](#taste-verdicts)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide
Rule zero (Emil Kowalski / Rauno Freiberg): frequency decides motion. Things used 100+ times a day (command palette toggle, keyboard shortcuts, context menus) get no animation; things used tens of times (hover, list nav) get 100-200 ms or nothing; occasional surfaces (modals, drawers, toasts) get standard motion; rare moments (first like, onboarding, success) can get delight.

| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| "Premium studio portfolio" pointer presence | Dot + lagging ring, contextual labels ("View", "Drag") | JS ~0 kb extra with GSAP (quickTo); 2 fixed layers | [1](#1-custom-cursor-with-trailing-ring) |
| CTA that "notices" the pointer | Magnetic pull + inner text parallax, elastic or spring return | GSAP quickTo or Motion springs, 1 layer | [2](#2-magnetic-elements) |
| Editorial project index (list of names) | Floating preview image follows cursor, image stack slides per row | GSAP quickTo + CSS transitions | [3](#3-hover-image-reveal-and-image-trail) |
| Playful gallery/landing hero | Image trail spawning on distance threshold | GSAP timeline pool, N img layers | [3](#3-hover-image-reveal-and-image-trail) |
| Buttons that feel physical | `:active` scale .97 in 160 ms + one hover idea (fill sweep OR text roll OR arrow nudge) | CSS only (sweep: 20 lines WAAPI) | [4](#4-button-hover-and-press-system) |
| Async submit | Idle -> spinner -> check morph, stable width | Motion AnimatePresence popLayout | [4](#4-button-hover-and-press-system) |
| Nav/body links | scaleX underline grow-left/exit-right; multi-line `background-size` underline | CSS only | [5](#5-link-underlines) |
| Product card with depth | 3D tilt max 6-10 deg + glare, spring back | CSS vars + 30 lines JS, or Motion | [6](#6-3d-tilt-card-with-glare) |
| Dark SaaS feature grid (Linear/Vercel) | Spotlight: parent tracks pointer, radial-gradient fill + masked border | CSS vars + 1 listener; paint cost per card | [7](#7-spotlight-glow-card-grid) |
| Tabs / segmented control / nav hover pill | Motion `layoutId` indicator; clip-path duplicate for perfect color sync | Motion (layout), or CSS anchor positioning | [8](#8-tabs-indicator-and-nav-hover-highlight) |
| Accordion, dropdown, tooltip | `grid-template-rows` 0fr->1fr or `::details-content`; origin-aware scale .95; tooltip delay group | CSS first, tiny hook | [9](#9-accordion-popover-and-tooltip-timing) |
| Notifications, mobile sheets | Use `sonner` / `vaul`; mechanics explained for custom builds | libs ~10-15 kb | [10](#10-toasts-and-drawers) |
| macOS-style icon bar | Dock magnification: distance -> size via useTransform + spring | Motion | [11](#11-dock-magnification) |
| Throwable / swipeable / sortable | GSAP Draggable + Inertia, Motion drag, swipe stack, `Reorder` | GSAP ~35 kb w/ plugins, Motion | [12](#12-drag-inertia-swipe-cards-and-reorder) |
| Destructive confirm, copy, like, toggle, checkbox, stepper, input feedback | Hold-to-confirm clip-path, icon morph, burst, spring switch, SVG draw, NumberFlow, floating label, shake | Mostly CSS; Motion for icon swaps | [13](#13-micro-interaction-kit) |
| Loading / perceived speed | Skeleton shimmer w/ show-delay, `useOptimistic`, hover intent, rubber-band, cmdk | CSS + small hooks | [14](#14-loading-feedback-hover-intent-and-command-palette) |
| Image grids | Scale-in-frame, grayscale->color, clip reveal, duotone | CSS only | [15](#15-image-hover-treatments) |
| Liquid/distortion image hover | WebGL displacement | GPU, see `webgl-shaders-3d.md` | - |

## Recipes

### 0. Shared tokens and hooks
**Looks like:** Nothing by itself; every recipe below reads these tokens and hooks so tuning happens in one place.  
**Use when / avoid when:** Always include once per project. Avoid sprinkling raw `cubic-bezier()` and ms values in components.  
**Stack:** CSS + React
```css
/* app/globals.css */
:root {
  /* curves (Emil Kowalski's set + Vaul/Ionic drawer curve) */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* UI enter/exit, hover */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* on-screen movement, indicators */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* sheets, drawers (iOS feel) */
  --ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);  /* editorial reveals */
  /* spring as CSS (k=400, c=30: ~450 ms, 2.7% overshoot), generated by simulation */
  --spring-snappy: linear(0, 0.063, 0.202, 0.358, 0.521, 0.665, 0.783, 0.873, 0.937, 0.978, 1.005, 1.02, 1.026, 1.026, 1.024, 1.02, 1.015, 1.011, 1.008, 1.005, 1.003, 1.001, 1, 1, 1);
  --spring-snappy-dur: 450ms;
  /* durations */
  --dur-press: 160ms;
  --dur-hover: 200ms;
  --dur-tooltip: 125ms;
  --dur-popover: 200ms;
  --dur-modal: 250ms;
  --dur-drawer: 500ms;
  --dur-reveal: 600ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-reveal: 0ms; --spring-snappy: ease; }
}
```
```ts
// lib/interaction.ts
"use client";
import { useCallback, useSyncExternalStore } from "react";

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

/** true only for mouse/trackpad users; false on SSR and on touch */
export const useCanHover = () => useMediaQuery(FINE_POINTER);
export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_MOTION);

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);
```
**Tune:** Keep UI transitions under 300 ms; only drawers (500 ms) and editorial reveals exceed it. `linear()` springs are fixed-duration approximations: use them for CSS state changes, use real springs (Motion) for anything pointer-driven or interruptible.  
**A11y/perf:** In CSS, gate hover motion with `@media (hover: hover) and (pointer: fine)`; touch devices fire sticky `:hover` on tap. Motion users: wrap the app in `<MotionConfig reducedMotion="user">` so transform/layout animations are disabled for reduced-motion users while opacity still animates.

### 1. Custom cursor with trailing ring
**Looks like:** Native cursor hidden; a 6 px dot tracks the pointer almost 1:1 while a 36 px hairline ring trails with ~0.5 s ease. Over links the ring swells; over `[data-cursor="view"]` it fills and shows "View"; over inputs it disappears and the native I-beam returns. Famous from Cuberto, Locomotive, most Awwwards studio sites.  
**Use when / avoid when:** Portfolios, studio sites, galleries, campaign microsites where the cursor carries meaning (labels, drag hints). Avoid on docs, dashboards, e-commerce checkout, long-read content, and any site whose audience includes low-vision users relying on OS cursor size (custom cursors ignore OS cursor scaling). The AI-slop version: a ring that lags on every page for no reason, `mix-blend-mode: difference` on a white site, plus the native cursor still visible. If the cursor never changes state, you do not need one.  
**Stack:** GSAP (`quickTo`) + CSS states. Motion and vanilla variants below.
```tsx
// components/cursor/CustomCursor.tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCanHover, usePrefersReducedMotion } from "@/lib/interaction";

gsap.registerPlugin(useGSAP);

type CursorState = "default" | "link" | "view" | "drag" | "label" | "hidden";
const DEFAULT_LABEL: Partial<Record<CursorState, string>> = { view: "View", drag: "Drag" };
const INTERACTIVE =
  "[data-cursor], a[href], button, [role='button'], summary, label, select, input, textarea, [contenteditable='true'], iframe";
const NATIVE_CURSOR =
  "input:not([type='checkbox'], [type='radio'], [type='range'], [type='button'], [type='submit']), textarea, [contenteditable='true'], iframe";

function resolveState(target: EventTarget | null): { state: CursorState; label: string } {
  const el = target instanceof Element ? target.closest<HTMLElement>(INTERACTIVE) : null;
  if (!el) return { state: "default", label: "" };
  if (el.matches(NATIVE_CURSOR)) return { state: "hidden", label: "" };
  const explicit = el.dataset.cursor as CursorState | undefined;
  if (explicit) return { state: explicit, label: el.dataset.cursorLabel ?? DEFAULT_LABEL[explicit] ?? "" };
  return { state: "link", label: "" };
}

export function CustomCursor({ blend = false }: { blend?: boolean }) {
  const canHover = useCanHover(); // false on SSR and touch: render nothing, keep native cursor
  if (!canHover) return null;
  return <CursorLayer blend={blend} />;
}

function CursorLayer({ blend }: { blend: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const dot = el.querySelector<HTMLElement>("[data-part='dot']")!;
      const ring = el.querySelector<HTMLElement>("[data-part='ring']")!;
      const label = el.querySelector<HTMLElement>("[data-part='label']")!;
      const html = document.documentElement;
      html.classList.add("has-custom-cursor");

      const ringDur = reduced ? 0.05 : 0.5; // reduced motion: no decorative lag
      const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
      const ringX = gsap.quickTo(ring, "x", { duration: ringDur, ease: "power3" });
      const ringY = gsap.quickTo(ring, "y", { duration: ringDur, ease: "power3" });

      let shown = false;
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const { clientX: x, clientY: y } = e;
        if (!shown) {
          // first move: start AT the pointer (second arg = start value), never fly in from 0,0
          dotX(x, x); dotY(y, y); ringX(x, x); ringY(y, y);
          el.dataset.visible = "true";
          shown = true;
          return;
        }
        dotX(x); dotY(y); ringX(x); ringY(y);
      };
      const onOver = (e: PointerEvent) => {
        const { state, label: text } = resolveState(e.target);
        el.dataset.state = state;
        label.textContent = text;
      };
      const onDown = () => el.toggleAttribute("data-pressed", true);
      const onUp = () => el.toggleAttribute("data-pressed", false);
      const onHide = () => { el.dataset.visible = "false"; shown = false; };

      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      html.addEventListener("pointerleave", onHide);
      window.addEventListener("blur", onHide);
      return () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        html.removeEventListener("pointerleave", onHide);
        window.removeEventListener("blur", onHide);
        html.classList.remove("has-custom-cursor");
      };
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="cursor" data-state="default" data-visible="false" data-blend={blend || undefined} aria-hidden="true">
      <div className="cursor__pos" data-part="ring">
        <div className="cursor__ring" />
        <span className="cursor__label" data-part="label" />
      </div>
      <div className="cursor__pos" data-part="dot">
        <div className="cursor__dot" />
      </div>
    </div>
  );
}
```
```css
/* GSAP owns transform on .cursor__pos; CSS owns scale on the children. Never let both own the same node. */
@media (hover: hover) and (pointer: fine) {
  html.has-custom-cursor,
  html.has-custom-cursor :where(a, button, [role="button"], summary, label, select, [data-cursor]) { cursor: none; }
  html.has-custom-cursor :where(input, textarea, [contenteditable="true"]) { cursor: text; }
}
.cursor {
  --cursor-color: #111; --cursor-label-color: #fff;
  --ring-s: 1; --dot-s: 1; --press: 1;
  position: fixed; inset: 0; z-index: 2147483000; pointer-events: none;
  opacity: 0; transition: opacity 200ms var(--ease-out);
}
.cursor[data-visible="true"] { opacity: 1; }
.cursor[data-state="hidden"] { opacity: 0; }
.cursor[data-state="link"] { --ring-s: 1.6; --dot-s: 0; }
.cursor:is([data-state="view"], [data-state="drag"], [data-state="label"]) { --ring-s: 2.6; --dot-s: 0; }
.cursor[data-pressed] { --press: 0.8; }
.cursor__pos { position: absolute; top: 0; left: 0; will-change: transform; }
.cursor__dot, .cursor__ring, .cursor__label { position: absolute; translate: -50% -50%; }
.cursor__dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--cursor-color);
  scale: calc(var(--dot-s) * var(--press)); transition: scale 200ms var(--ease-out);
}
.cursor__ring {
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--cursor-color);
  scale: calc(var(--ring-s) * var(--press));
  transition: scale 400ms var(--ease-out), background-color 200ms ease;
}
.cursor:is([data-state="view"], [data-state="drag"], [data-state="label"]) .cursor__ring { background: var(--cursor-color); }
.cursor__label {
  font: 500 11px/1 system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--cursor-label-color); white-space: nowrap;
  opacity: 0; scale: 0.6; transition: opacity 150ms ease, scale 300ms var(--ease-out);
}
.cursor:is([data-state="view"], [data-state="drag"], [data-state="label"]) .cursor__label { opacity: 1; scale: 1; }
/* Inverting variant: blend on the ROOT fixed layer (a blended child inside a z-indexed parent blends with nothing) */
.cursor[data-blend] { mix-blend-mode: difference; --cursor-color: #fff; --cursor-label-color: #000; }
```
```html
<!-- usage: mount once in app/layout.tsx; opt elements in by attribute -->
<a href="/work/aurora" data-cursor="view">Aurora</a>
<div class="carousel" data-cursor="drag"></div>
<button data-cursor="label" data-cursor-label="Play reel">...</button>
```
Motion variant (ring via springs, no GSAP):
```tsx
"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";
import { useCanHover } from "@/lib/interaction";

export function SpringCursor() {
  const canHover = useCanHover();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });
  useEffect(() => {
    if (!canHover) return;
    const move = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [canHover, x, y]);
  if (!canHover) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <motion.div className="absolute left-0 top-0 size-1.5 -translate-1/2 rounded-full bg-black" style={{ x, y }} />
      <motion.div className="absolute left-0 top-0 size-9 -translate-1/2 rounded-full border border-black" style={{ x: ringX, y: ringY }} />
    </div>
  );
}
```
Vanilla (no framework, GSAP from CDN or npm):
```js
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring");
  const [dx, dy] = ["x", "y"].map((p) => gsap.quickTo(dot, p, { duration: 0.1, ease: "power3" }));
  const [rx, ry] = ["x", "y"].map((p) => gsap.quickTo(ring, p, { duration: 0.5, ease: "power3" }));
  addEventListener("pointermove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener("pointerover", (e) => {
    ring.dataset.state = e.target.closest("a,button,[data-cursor]") ? "link" : "default";
  });
}
```
**Tune:** dot duration 0.08-0.15 s (any more feels laggy, and users read lag as "slow site"); ring 0.35-0.6 s `power3` (Olivier Larose's gallery: cursor 0.5 s, label 0.45 s, preview 0.8 s, all `power3`); Motion spring for ring stiffness 400-600 / damping 35-45 / mass 0.5-0.8; hover swell 1.5-1.8x, labelled state 2.4-3x; state transitions 300-400 ms `--ease-out`. Cuberto's `mouse-follower` defaults: `speed: 0.55`, `ease: "expo.out"`, `stickDelta: 0.15`.  
**A11y/perf:** Render nothing unless `(hover: hover) and (pointer: fine)`; the native cursor is never hidden on touch. Keep `cursor: text` on inputs and hide the custom layer there. Only transform/opacity/scale animate; no `left/top` tweening (Larose's demo tweens `left/top` - fine for a tutorial, not for production). `aria-hidden` on the layer. Reduced motion: remove ring lag (`duration` ~0.05) but keep state feedback. Never block clicks: `pointer-events: none` on the whole layer.

### 2. Magnetic elements
**Looks like:** As the pointer approaches a round CTA or icon, the button drifts toward it (30-40% of the offset) and its label drifts further (parallax), then snaps back with a soft wobble on leave. Codrops "Magnetic Buttons" (2020), Olivier Larose's `Magnetic` wrapper, Dennis Snellenberg's portfolio.  
**Use when / avoid when:** 1-3 hero CTAs, social icons, a floating menu button. Avoid on dense UI (tables, forms, nav with 8 items): targets that move are harder to hit (Fitts's law) and the whole page starts to feel like jelly. Never magnetize text links inside paragraphs.  
**Stack:** GSAP quickTo (vanilla-friendly) or Motion springs.
```tsx
// components/fx/Magnetic.tsx
"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/interaction";

gsap.registerPlugin(useGSAP);

type MagneticProps = {
  children: ReactNode;
  strength?: number;      // fraction of pointer offset applied to the element
  innerStrength?: number; // extra drift for [data-magnetic-inner]
  field?: number;         // px the invisible hit zone extends past the element
  ease?: string;
};

export function Magnetic({ children, strength = 0.35, innerStrength = 0.15, field = 24, ease = "elastic.out(1, 0.3)" }: MagneticProps) {
  const zone = useRef<HTMLSpanElement>(null);   // static: measuring a moving element causes jitter
  const target = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!matchMedia(FINE_POINTER).matches || matchMedia(REDUCED_MOTION).matches) return;
      const z = zone.current!, t = target.current!;
      const inner = t.querySelector<HTMLElement>("[data-magnetic-inner]");
      const vars = { duration: 1, ease };
      const xTo = gsap.quickTo(t, "x", vars), yTo = gsap.quickTo(t, "y", vars);
      const ixTo = inner ? gsap.quickTo(inner, "x", vars) : null;
      const iyTo = inner ? gsap.quickTo(inner, "y", vars) : null;

      const onMove = (e: PointerEvent) => {
        const r = z.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * strength); yTo(dy * strength);
        ixTo?.(dx * innerStrength); iyTo?.(dy * innerStrength);
      };
      const onLeave = () => { xTo(0); yTo(0); ixTo?.(0); iyTo?.(0); };
      z.addEventListener("pointermove", onMove);
      z.addEventListener("pointerleave", onLeave);
      return () => { z.removeEventListener("pointermove", onMove); z.removeEventListener("pointerleave", onLeave); };
    },
    { scope: zone },
  );

  return (
    <span ref={zone} className="magnetic" style={{ padding: field, margin: -field }}>
      <span ref={target} className="magnetic__target">{children}</span>
    </span>
  );
}
```
```css
.magnetic { display: inline-block; }
.magnetic__target { display: inline-block; will-change: transform; }
```
```tsx
// usage: label drifts extra = depth
<Magnetic>
  <a href="/contact" className="cta-round"><span data-magnetic-inner>Get in touch</span></a>
</Magnetic>
```
Motion version (follow is smooth AND return overshoots, because a spring does both):
```tsx
"use client";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const SPRING = { stiffness: 150, damping: 15, mass: 0.1 };

export function MagneticSpring({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  return (
    <div onPointerMove={onMove} onPointerLeave={() => { x.set(0); y.set(0); }} className="inline-block">
      <motion.div style={{ x, y }}>{children}</motion.div>
    </div>
  );
}
```
Vanilla:
```js
document.querySelectorAll("[data-magnetic]").forEach((zone) => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const t = zone.firstElementChild;
  const xTo = gsap.quickTo(t, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
  const yTo = gsap.quickTo(t, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
  zone.addEventListener("pointermove", (e) => {
    const r = zone.getBoundingClientRect();
    xTo((e.clientX - r.left - r.width / 2) * 0.35);
    yTo((e.clientY - r.top - r.height / 2) * 0.35);
  });
  zone.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
});
```
**Tune:** `strength` 0.2-0.4 (Codrops uses 0.3 with a trigger radius of 0.7x width; above 0.5 the target escapes the pointer). Inner parallax 0.1-0.2 for text (Codrops moves text by -0.6x the button offset for a counter-drift variant). Elastic `elastic.out(1, 0.3)` 1 s = playful; for corporate/premium use `power3.out` 0.5-0.6 s (no wobble). Motion spring 150/15/0.1 (lively) or 200/20/0.5 (calmer).  
**A11y/perf:** Gate on fine pointer + reduced motion (return early = static button). Measure the static zone, not the moving element. Keyboard focus must not move the element. One quickTo pair per element; avoid 30 magnetic items each measuring on every move.

### 3. Hover image reveal and image trail
**Looks like:** (a) An index of project names in large type; hovering a row reveals a floating preview that follows the cursor with lag, scales in from 0, tilts with pointer velocity, and slides vertically to the hovered project's image (Olivier Larose "Awwwards project gallery", Codrops `ImageRevealHover`). (b) Moving the mouse across a hero spawns a trail of images that land at the cursor, then shrink and fade (Codrops `ImageTrailEffects`, 2019, still copied everywhere).  
**Use when / avoid when:** (a) Studio work index, case-study list, menu of articles with strong photography. (b) Hero or 404 page of an image-rich brand; one section maximum. Avoid both on touch-first audiences (no hover: link rows must work without the preview) and on lists whose images are weak or inconsistent in ratio.  
**Stack:** GSAP quickTo + CSS transitions (a); GSAP timeline pool (b).
```tsx
// components/work/HoverRevealList.tsx
"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/interaction";

gsap.registerPlugin(useGSAP);

type Item = { title: string; href: string; src: string; meta: string };

export function HoverRevealList({ items }: { items: Item[] }) {
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      if (!matchMedia(FINE_POINTER).matches) return;
      const reduced = matchMedia(REDUCED_MOTION).matches;
      const el = preview.current!;
      gsap.set(el, { xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(el, "x", { duration: reduced ? 0.01 : 0.8, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: reduced ? 0.01 : 0.8, ease: "power3" });
      const rTo = gsap.quickTo(el, "rotation", { duration: 0.6, ease: "power3" });
      let lastX = 0;
      const onMove = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        if (!reduced) rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4)); // velocity tilt
        lastX = e.clientX;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="reveal-list" onPointerLeave={() => setActive(null)}>
      <ul>
        {items.map((it, i) => (
          <li key={it.href} onPointerEnter={() => setActive(i)}>
            <a href={it.href} className="reveal-list__row" data-dim={active !== null && active !== i ? "" : undefined}>
              <span className="reveal-list__title">{it.title}</span>
              <span className="reveal-list__meta">{it.meta}</span>
            </a>
          </li>
        ))}
      </ul>
      <div ref={preview} className="reveal-preview" data-open={active !== null || undefined} aria-hidden="true">
        <div className="reveal-preview__slider" style={{ translate: `0 ${(active ?? 0) * -100}%` }}>
          {items.map((it) => (
            <img key={it.src} src={it.src} alt="" loading="eager" decoding="async" />
          ))}
        </div>
      </div>
    </div>
  );
}
```
```css
.reveal-list__row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding-block: 2rem; border-top: 1px solid color-mix(in oklab, currentColor 15%, transparent);
  transition: opacity 300ms var(--ease-out), translate 400ms var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .reveal-list__row[data-dim] { opacity: 0.35; }
  .reveal-list__row:hover { translate: 0.5rem 0; }
}
.reveal-preview {
  position: fixed; top: 0; left: 0; z-index: 20; pointer-events: none;
  width: clamp(220px, 22vw, 380px); aspect-ratio: 4 / 5; overflow: hidden; border-radius: 4px;
  scale: 0; transition: scale 400ms cubic-bezier(0.32, 0, 0.67, 0); /* exit: ease-in */
}
.reveal-preview[data-open] { scale: 1; transition: scale 400ms cubic-bezier(0.76, 0, 0.24, 1); }
.reveal-preview__slider { height: 100%; transition: translate 500ms cubic-bezier(0.76, 0, 0.24, 1); }
.reveal-preview__slider img { display: block; width: 100%; height: 100%; object-fit: cover; }
@media (hover: none) { .reveal-preview { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .reveal-preview, .reveal-preview[data-open] { transition: opacity 200ms ease; scale: 1; opacity: 0; }
  .reveal-preview[data-open] { opacity: 1; }
  .reveal-preview__slider { transition: none; }
}
```
Image trail (distance-threshold pool, port of Codrops demo 1 to GSAP 3):
```tsx
// components/fx/ImageTrail.tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/interaction";

gsap.registerPlugin(useGSAP);

export function ImageTrail({ images, threshold = 100 }: { images: string[]; threshold?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!matchMedia(FINE_POINTER).matches || matchMedia(REDUCED_MOTION).matches) return;
      const box = root.current!;
      const imgs = gsap.utils.toArray<HTMLImageElement>(".trail__img", box);
      const mouse = { x: 0, y: 0 }, cache = { x: 0, y: 0 }, last = { x: 0, y: 0 };
      let index = 0, z = 1, primed = false;

      const onMove = (e: PointerEvent) => {
        const r = box.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        if (!primed) { Object.assign(cache, mouse); Object.assign(last, mouse); primed = true; }
      };
      const tick = () => {
        cache.x = gsap.utils.interpolate(cache.x, mouse.x, 0.1);
        cache.y = gsap.utils.interpolate(cache.y, mouse.y, 0.1);
        if (Math.hypot(mouse.x - last.x, mouse.y - last.y) < threshold) return;
        const img = imgs[index];
        const w = img.offsetWidth, h = img.offsetHeight;
        gsap.killTweensOf(img);
        gsap.timeline()
          .set(img, { opacity: 1, scale: 1, zIndex: ++z, x: cache.x - w / 2, y: cache.y - h / 2 }, 0)
          .to(img, { duration: 0.9, ease: "expo.out", x: mouse.x - w / 2, y: mouse.y - h / 2 }, 0)
          .to(img, { duration: 1, ease: "power1.out", opacity: 0 }, 0.4)
          .to(img, { duration: 1, ease: "quint.out", scale: 0.2 }, 0.4);
        index = (index + 1) % imgs.length;
        Object.assign(last, mouse);
      };
      box.addEventListener("pointermove", onMove, { passive: true });
      gsap.ticker.add(tick);
      return () => { box.removeEventListener("pointermove", onMove); gsap.ticker.remove(tick); };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="trail">
      {images.map((src) => (
        <img key={src} className="trail__img" src={src} alt="" decoding="async" />
      ))}
    </div>
  );
}
```
```css
.trail { position: relative; overflow: hidden; height: 100svh; isolation: isolate; }
.trail__img {
  position: absolute; top: 0; left: 0; width: clamp(140px, 14vw, 240px); aspect-ratio: 3 / 4;
  object-fit: cover; opacity: 0; pointer-events: none; will-change: transform, opacity;
}
```
Variant (Olivier Larose "mouse image gallery"): accumulate `Math.abs(e.movementX) + Math.abs(e.movementY)` and place an image every 150 px, keep max 8 visible, hide the oldest; cheaper (no ticker) but no lerped "landing" motion.  
**Tune:** Preview follow 0.6-0.9 s `power3` (slower than the cursor ring so the two layers separate); velocity tilt factor 0.3-0.5 clamped to 6-10 deg; slider 500 ms `cubic-bezier(0.76, 0, 0.24, 1)`; scale-in 400 ms. Trail threshold 80-150 px (lower = denser, busier), pool 8-15 images, lerp 0.1, fade starts at 0.4 s.  
**A11y/perf:** Preview images are decorative (`alt=""`); every row is a real `<a>` that works without hover. Preload preview images (hidden `<img loading="eager">`) or the first hover pops in blank. Use `position: fixed` for the preview; if an ancestor has a transform (GSAP ScrollSmoother content wrapper, a `motion.div` with `layout`), `fixed` becomes relative to it: portal the preview to `document.body`. Trail is disabled for reduced motion and touch (render the images as a static collage instead).

### 4. Button hover and press system
**Looks like:** A consistent family: every pressable shrinks to 0.97 on press; the primary CTA gets ONE signature hover (fill sweeping in from the side the pointer entered, or the label rolling up to reveal a duplicate, or an arrow nudging right); secondary buttons only shift color. Async buttons morph idle -> spinner -> check without changing width.  
**Use when / avoid when:** Press feedback everywhere (it is the cheapest "feels native" win). Pick one hover signature per brand; stacking sweep + shine + glow + magnet on one button is the AI-slop tell. Shine sweeps and rotating gradient borders belong on a single marketing CTA, not on toolbar buttons.  
**Stack:** CSS (sweep via WAAPI; morph via Motion).

4a. Press feedback (all buttons):
```css
.btn {
  transition: scale var(--dur-press) var(--ease-out), background-color var(--dur-hover) ease, color var(--dur-hover) ease;
  touch-action: manipulation;              /* no double-tap zoom delay */
  -webkit-tap-highlight-color: transparent;
}
.btn:active:not(:disabled, [aria-disabled="true"]) { scale: 0.97; }
@media (prefers-reduced-motion: reduce) { .btn:active { scale: 1; filter: brightness(0.94); } }
```

4b. Text roll (duplicate label slides up; per-letter stagger optional). CSS only:
```tsx
import type { CSSProperties } from "react";

export function RollButton({ label, stagger = true }: { label: string; stagger?: boolean }) {
  const chars = Array.from(label);
  const renderLine = (hidden: boolean) => (
    <span className="roll__line" aria-hidden={hidden || undefined}>
      {stagger
        ? chars.map((c, i) => (
            <span key={i} className="roll__char" style={{ "--i": i } as CSSProperties}>{c === " " ? "\u00A0" : c}</span>
          ))
        : <span className="roll__char">{label}</span>}
    </span>
  );
  return (
    <button className="btn roll" aria-label={label}>
      <span className="roll__mask">{renderLine(false)}{renderLine(true)}</span>
    </button>
  );
}
```
```css
.roll__mask { display: grid; overflow: hidden; padding-block: 0.12em; margin-block: -0.12em; /* keep descenders */ }
.roll__line { grid-area: 1 / 1; display: block; }
.roll__line:last-child { translate: 0 110%; }
.roll__char { display: inline-block; white-space: pre; transition: translate 500ms var(--ease-out); transition-delay: calc(var(--i, 0) * 14ms); }
@media (hover: hover) and (pointer: fine) {
  .roll:hover .roll__line:first-child .roll__char { translate: 0 -110%; }
  .roll:hover .roll__line:last-child .roll__char { translate: 0 -110%; }
}
.roll:focus-visible .roll__line .roll__char { translate: 0 -110%; }
@media (prefers-reduced-motion: reduce) { .roll__char { transition: none; } }
```
Note: `.roll__line:last-child` sits 110% below; its chars move -110% on hover, landing at 0. With `stagger={false}` the whole label is one `.roll__char`, so the same CSS moves it as a block.

4c. Arrow nudge and loop-through arrow:
```css
.btn .icon { transition: translate var(--dur-hover) var(--ease-out); }
@media (hover: hover) and (pointer: fine) { .btn:hover .icon { translate: 3px 0; } }

/* loop-through: arrow exits right, twin enters from left */
.arrow-swap { display: inline-grid; overflow: hidden; }
.arrow-swap > svg { grid-area: 1 / 1; transition: translate 350ms var(--ease-out); }
.arrow-swap > svg:last-child { translate: -150% 0; }
@media (hover: hover) and (pointer: fine) {
  .btn:hover .arrow-swap > svg:first-child { translate: 150% 0; }
  .btn:hover .arrow-swap > svg:last-child { translate: 0 0; }
}
```

4d. Fill sweep from the entry edge (exits toward the leave edge). WAAPI so interruptions start from the current position:
```tsx
"use client";
import { useRef, type PointerEvent, type ReactNode } from "react";

type Edge = "top" | "right" | "bottom" | "left";
const OFF: Record<Edge, string> = { top: "0 -101%", right: "101% 0", bottom: "0 101%", left: "-101% 0" };

function nearestEdge(e: PointerEvent<HTMLElement>): Edge {
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  return Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : y > 0 ? "bottom" : "top";
}

export function SweepButton({ children }: { children: ReactNode }) {
  const fill = useRef<HTMLSpanElement>(null);
  const run = (to: string, from?: string) => {
    const el = fill.current;
    if (!el) return;
    const current = from ?? getComputedStyle(el).translate; // read BEFORE cancelling
    el.getAnimations().forEach((a) => a.cancel());
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.animate([{ translate: current === "none" ? "0 0" : current }, { translate: to }], {
      duration: reduced ? 0 : 450,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      fill: "forwards",
    });
  };
  return (
    <button
      className="btn sweep"
      onPointerEnter={(e) => e.pointerType === "mouse" && run("0 0", OFF[nearestEdge(e)])}
      onPointerLeave={(e) => e.pointerType === "mouse" && run(OFF[nearestEdge(e)])}
      onFocus={() => run("0 0", OFF.bottom)}
      onBlur={() => run(OFF.bottom)}
    >
      <span ref={fill} className="sweep__fill" aria-hidden="true" />
      <span className="sweep__label">{children}</span>
    </button>
  );
}
```
```css
.sweep { position: relative; overflow: hidden; isolation: isolate; color: var(--fg); background: transparent; border: 1px solid currentColor; }
.sweep__fill { position: absolute; inset: 0; z-index: -1; background: var(--fg); translate: -101% 0; }
.sweep__label { transition: color 250ms ease; }
.sweep:is(:hover, :focus-visible) .sweep__label { color: var(--bg); }
```
Circle variant (Olivier Larose "Rounded" button): a 150%-wide circle parked at `top: 100%` rises to `top: -25%` over 0.4 s `power3.in`, then exits to `top: -150%` in 0.25 s; same idea with `translate` instead of `top` for production.

4e. Shine sweep (one pass per hover, no reverse on leave):
```css
.shine { position: relative; overflow: hidden; }
.shine::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 35%, rgb(255 255 255 / 0.45) 50%, transparent 65%);
  translate: -110% 0;            /* no transition in base state: snaps back invisibly on leave */
}
@media (hover: hover) and (pointer: fine) {
  .shine:hover::after { translate: 110% 0; transition: translate 750ms var(--ease-in-out); }
}
@media (prefers-reduced-motion: reduce) { .shine:hover::after { transition: none; translate: -110% 0; } }
```

4f. Border gradient glow (rotating conic border, registered custom property):
```css
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
.glow-border {
  --bg: #0b0b0c; --accent: #8b5cf6;
  border: 1px solid transparent; border-radius: 999px;
  background:
    linear-gradient(var(--bg), var(--bg)) padding-box,
    conic-gradient(from var(--angle), rgb(255 255 255 / 0.12) 0 60%, var(--accent) 75%, rgb(255 255 255 / 0.12) 90%) border-box;
}
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .glow-border:hover { animation: glow-spin 2.5s linear infinite; }
}
@keyframes glow-spin { to { --angle: 360deg; } }
```
Animating a custom property repaints the element every frame (not compositor-only): fine for one button, not for a grid of 20 cards.

4g. Loading -> success morph (stable width, content swaps with a short blur-slide):
```tsx
"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Status = "idle" | "loading" | "success";
const MIN_LOADING_MS = 450;   // avoid spinner flicker on fast responses
const SUCCESS_HOLD_MS = 1600;

export function AsyncButton({ action, label = "Save changes" }: { action: () => Promise<void>; label?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const run = async () => {
    if (status !== "idle") return;
    setStatus("loading");
    const started = performance.now();
    try {
      await action();
      const wait = MIN_LOADING_MS - (performance.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      setStatus("success");
      setTimeout(() => setStatus("idle"), SUCCESS_HOLD_MS);
    } catch {
      setStatus("idle"); // surface the error next to the form, not inside the button
    }
  };
  return (
    <button className="btn btn-primary async-btn" onClick={run} aria-busy={status === "loading"} aria-disabled={status !== "idle"}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className="async-btn__content"
          initial={{ opacity: 0, y: 14, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(2px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          {status === "idle" && label}
          {status === "loading" && <span className="spinner" role="img" aria-label="Saving" />}
          {status === "success" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" role="img" aria-label="Saved">
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.05 }} />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```
```css
.async-btn { display: inline-grid; place-items: center; min-width: 9.5rem; overflow: hidden; }
.async-btn__content { display: inline-flex; align-items: center; gap: 0.5rem; }
.spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent; animation: spin 600ms linear infinite; }
@keyframes spin { to { rotate: 360deg; } }
```

4h. Disabled states:
```css
.btn:disabled, .btn[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; scale: 1; }
.btn:disabled *, .btn[aria-disabled="true"] * { pointer-events: none; } /* kills hover signatures */
```
Prefer `aria-disabled="true"` + guard in the handler when the button must stay focusable (so a tooltip can explain why it is disabled); `disabled` removes it from tab order and suppresses pointer events entirely.  
**Tune:** press scale 0.95-0.98 (0.97 default), 100-160 ms `--ease-out`; hover color 150-200 ms `ease`; text roll 400-550 ms with 10-20 ms per-char stagger; sweep 400-500 ms; shine 600-900 ms `--ease-in-out`; icon swap spring `duration 0.3, bounce 0`; minimum loading 300-500 ms (Vercel guidelines), success hold 1.2-2 s.  
**A11y/perf:** Every hover signature also fires on `:focus-visible`. Keep label text in the DOM once for screen readers (duplicate lines `aria-hidden`). Only translate/scale/opacity animate; `filter: blur(2px)` on tiny content during a 300 ms swap is fine, never on large areas. iOS Safari only applies `:active` if the page has a touch listener: add `document.addEventListener("touchstart", () => {}, { passive: true })` once, or rely on the `:active` styles in 4a being non-critical.

### 5. Link underlines
**Looks like:** (a) Nav link: a 1 px line grows from the left on hover and leaves to the right on mouse-out. (b) Body link that wraps across lines: underline sweeps line by line. (c) Quiet editorial link: faint thin underline darkens and moves closer to the text on hover.  
**Use when / avoid when:** (a) single-line nav/footer links only (a pseudo-element underline breaks on wrapped links). (b) links inside paragraphs. (c) docs, blogs, anything text-heavy; the calmest option. Avoid removing the underline from body links entirely (links must be identifiable without color).  
**Stack:** CSS
```css
/* (a) grow from left, exit right */
.link-a { position: relative; text-decoration: none; }
.link-a::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -0.1em; height: 1px; background: currentColor;
  scale: 0 1; transform-origin: right center; transition: scale 450ms var(--ease-out);
}
.link-a:focus-visible::after { scale: 1 1; transform-origin: left center; }
@media (hover: hover) and (pointer: fine) {
  .link-a:hover::after { scale: 1 1; transform-origin: left center; }
}
/* (a2) always underlined; on hover the line exits right and re-draws from the left */
.link-redraw::after { scale: 1 1; transform-origin: left center; }
@media (hover: hover) and (pointer: fine) {
  .link-redraw:hover::after { animation: redraw 700ms var(--ease-in-out); }
}
@keyframes redraw {
  0%    { scale: 1 1; transform-origin: right center; }
  50%   { scale: 0 1; transform-origin: right center; }
  50.1% { scale: 0 1; transform-origin: left center; }
  100%  { scale: 1 1; transform-origin: left center; }
}

/* (b) multi-line safe: background-size on an INLINE element sweeps across line boxes */
.link-b {
  text-decoration: none; padding-bottom: 0.08em;
  background: linear-gradient(currentColor 0 0) no-repeat 100% 100% / 0% 1px; /* parked right: leaves rightward */
  transition: background-size 400ms var(--ease-out);
}
.link-b:is(:hover, :focus-visible) { background-position: 0% 100%; background-size: 100% 1px; } /* grows from left */
/* highlighter variant: linear-gradient(transparent 60%, var(--hl) 0) with background-size 0% 100% -> 100% 100% */

/* (c) decoration properties are animatable */
.link-c {
  text-decoration-line: underline; text-decoration-thickness: 1px; text-underline-offset: 0.3em;
  text-decoration-color: color-mix(in oklab, currentColor 35%, transparent);
  transition: text-decoration-color 200ms ease, text-underline-offset 200ms ease, text-decoration-thickness 200ms ease;
}
.link-c:is(:hover, :focus-visible) { text-decoration-color: currentColor; text-underline-offset: 0.18em; text-decoration-thickness: 2px; }
@media (prefers-reduced-motion: reduce) {
  .link-a::after, .link-b { transition-duration: 0ms; }
  .link-redraw:hover::after { animation: none; }
}
```
**Tune:** grow 350-500 ms `--ease-out`; redraw 600-800 ms `--ease-in-out`; underline offset 0.2-0.35em at rest; thickness 1px -> 2px max (thickness snaps to device pixels, so the color + offset change is what reads as smooth).  
**A11y/perf:** `scale` on a pseudo is compositor-only; `background-size` repaints only the link. Body-text links keep an underline or a non-color cue (WCAG 1.4.1). `text-decoration-thickness` / `text-underline-offset`: Chrome 89+, Firefox 70+, Safari 12.1+.

### 6. 3D tilt card with glare
**Looks like:** A card rotates toward the pointer (max ~8 deg) with perspective, lifts slightly, and a soft radial highlight slides across it like light on laminated paper; on leave it springs back flat. Apple TV posters, Vercel Ship tickets, React Bits `TiltedCard` / `GlareHover`.  
**Use when / avoid when:** One hero object: a ticket, a card mock, a book or album cover, a single product shot. Avoid on grids of text cards, pricing tables, blog lists (text on a rotating plane is harder to read), and never above ~12 deg. "Tilt on every card" is a top-5 AI-slop tell.  
**Stack:** Motion springs (primary); CSS vars + JS (lightweight).
```tsx
// components/fx/TiltCard.tsx
"use client";
import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const MAX_TILT = 8; // deg
const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5); // pointer position 0..1 across the card
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), SPRING);
  const scale = useSpring(1, SPRING);
  const glareOpacity = useSpring(0, { stiffness: 300, damping: 30 });
  const gx = useTransform(px, (v) => v * 100);
  const gy = useTransform(py, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.35), transparent 55%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    scale.set(1.03);
    glareOpacity.set(1);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); scale.set(1); glareOpacity.set(0); };

  return (
    <div className="tilt-stage" onPointerMove={onMove} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <motion.div className={`tilt-card ${className}`} style={{ rotateX, rotateY, scale, transformPerspective: 900 }}>
        {children}
        <motion.div aria-hidden className="tilt-card__glare" style={{ background: glare, opacity: glareOpacity }} />
      </motion.div>
    </div>
  );
}
```
```css
.tilt-stage { display: inline-block; }   /* static hit area: measuring the rotating card makes edges jitter */
.tilt-card { position: relative; border-radius: 16px; overflow: hidden; will-change: transform; }
.tilt-card__glare { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; }
```
Vanilla / CSS-var variant (asymmetric transition: fast while hovering, slow settle on leave):
```js
document.querySelectorAll(".tilt").forEach((card) => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    card.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    card.style.setProperty("--gx", `${x * 100}%`);
    card.style.setProperty("--gy", `${y * 100}%`);
  });
  card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
});
```
```css
.tilt {
  transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 700ms var(--ease-out);
  background-image: radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgb(255 255 255 / 0.18), transparent 50%);
}
.tilt:hover { transition-duration: 120ms; } /* tracks the pointer; the long settle only happens on leave */
```
**Tune:** max tilt 5-10 deg (React Bits defaults to 14: too much for UI); perspective 800-1200 px (lower = more distortion); hover scale 1.02-1.04; spring stiffness 150-250 / damping 18-30 (React Bits uses 100 / 30 / mass 2 for a heavy, slow card); glare alpha 0.2-0.4 with `soft-light` or `overlay`.  
**A11y/perf:** Disabled for touch and reduced motion (card stays flat and clickable). Depth parallax (children with `translateZ`) needs `transform-style: preserve-3d` on the card AND no `overflow: hidden` on it (overflow flattens 3D): clip the glare with its own rounded wrapper instead. Text on a tilted plane blurs during motion: keep copy outside the tilting layer or cap tilt at 5 deg.

### 7. Spotlight glow card grid
**Looks like:** Dark bento/feature grid. A soft light follows the pointer: the hovered card's surface brightens under the cursor, and the 1 px borders of ALL nearby cards light up where the light would fall, even across the gaps. Linear feature pages, Vercel, Magic UI `MagicCard`, Aceternity card spotlight.  
**Use when / avoid when:** Dark-theme SaaS/dev-tool marketing grids of 3-12 cards. Weak on light themes (white glow on white does nothing; use a tinted accent at low alpha or skip). Avoid on dashboards and lists; never combine with tilt and animated gradient borders on the same cards.  
**Stack:** CSS (`mask-composite`) + one pointer listener on the parent.
```tsx
// components/fx/SpotlightGrid.tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { FINE_POINTER } from "@/lib/interaction";

export function SpotlightGrid({ children }: { children: ReactNode }) {
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = grid.current;
    if (!el || !matchMedia(FINE_POINTER).matches) return;
    let cards: HTMLElement[] = [];
    let rects: DOMRect[] = [];
    let frame = 0, px = 0, py = 0;
    const measure = () => {
      cards = Array.from(el.querySelectorAll<HTMLElement>("[data-spot]"));
      rects = cards.map((c) => c.getBoundingClientRect());
    };
    const paint = () => {
      frame = 0;
      cards.forEach((c, i) => {
        c.style.setProperty("--x", `${px - rects[i].left}px`); // on the card that uses it, not on the parent
        c.style.setProperty("--y", `${py - rects[i].top}px`);
      });
    };
    const onMove = (e: PointerEvent) => {
      if (!rects.length) measure();
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const invalidate = () => { rects = []; };
    el.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);
  return <div ref={grid} className="spot-grid">{children}</div>;
}
// usage: <SpotlightGrid><article data-spot className="spot-card">...</article></SpotlightGrid>
```
```css
.spot-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
.spot-card {
  --x: -9999px; --y: -9999px; --spot: 255 255 255;
  position: relative; isolation: isolate; border-radius: 16px; padding: 1.5rem;
  background: #0c0c0e; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
}
.spot-card > * { position: relative; z-index: 1; }
/* border light: gradient painted over the whole card, masked down to a 1px ring */
.spot-card::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; z-index: 0; pointer-events: none;
  background: radial-gradient(360px circle at var(--x) var(--y), rgb(var(--spot) / 0.5), transparent 45%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  opacity: 0; transition: opacity 400ms ease;
}
/* surface light: only on the hovered card */
.spot-card::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: 0; pointer-events: none;
  background: radial-gradient(600px circle at var(--x) var(--y), rgb(var(--spot) / 0.06), transparent 40%);
  opacity: 0; transition: opacity 400ms ease;
}
@media (hover: hover) and (pointer: fine) {
  .spot-grid:hover .spot-card::before { opacity: 1; }
  .spot-card:hover::after { opacity: 1; }
}
```
**Tune:** border light radius 300-450 px at alpha 0.35-0.6; surface light 500-800 px at 0.04-0.1; fade 300-500 ms. Magic UI's "orb" mode adds `useSpring` (stiffness 250, damping 30, mass 0.6) on the position so the light lags slightly.  
**A11y/perf:** Pure decoration. Each move repaints two pseudo-elements per card (paint, not layout): fine for 12 cards; never on `backdrop-filter` cards (repainting blur behind 12 cards drops frames). Writes are rAF-batched and rects cached (invalidated on scroll/resize). Unprefixed `mask-composite`: Chrome 120+, Firefox 53+, Safari 15.4+; keep the `-webkit-` pair for older engines.

### 8. Tabs indicator and nav hover highlight
**Looks like:** (a) Segmented control/tabs: a pill glides between options with a slight spring. (b) Vercel-style nav: a translucent highlight slides between items as you move along the nav and fades out when you leave it. (c) Emil Kowalski's clip-path tabs: active text color and pill change in perfect sync because a duplicate "active" row is revealed by an animated `clip-path`.  
**Use when / avoid when:** Any tab set of 2-6 options, top nav, filter chips. Avoid bounce > 0.25 on productivity UI; if users hammer arrow keys through tabs, make the indicator 150 ms or instant.  
**Stack:** Motion `layoutId` (a, b); CSS clip-path (c); CSS anchor positioning alternative.
```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

type Tab = { id: string; label: string };
const INDICATOR = { type: "spring", bounce: 0.15, duration: 0.4 } as const;

// (a) the indicator lives INSIDE the active trigger; Motion animates it between triggers
export function Segmented({ tabs, value, onChange }: { tabs: Tab[]; value: string; onChange: (id: string) => void }) {
  const layoutId = `${useId()}-pill`; // unique per instance, or two tab sets fight over one indicator
  return (
    <div role="tablist" className="seg">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className="seg__tab" onClick={() => onChange(t.id)}>
          {value === t.id && <motion.span layoutId={layoutId} className="seg__pill" transition={INDICATOR} />}
          <span className="seg__label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// (b) hover highlight that travels between nav items
export function HoverNav({ items }: { items: { href: string; label: string }[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const layoutId = `${useId()}-hover`;
  return (
    <nav className="hnav" onPointerLeave={() => setHovered(null)}>
      {items.map((it) => (
        <a key={it.href} href={it.href} className="hnav__item"
          onPointerEnter={() => setHovered(it.href)} onFocus={() => setHovered(it.href)} onBlur={() => setHovered(null)}>
          <AnimatePresence>
            {hovered === it.href && (
              <motion.span layoutId={layoutId} className="hnav__hl"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }} />
            )}
          </AnimatePresence>
          <span className="hnav__label">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
```
```css
.seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 999px; background: rgb(0 0 0 / 0.06); }
.seg__tab, .hnav__item { position: relative; padding: 0.45rem 0.9rem; border-radius: 999px; }
.seg__pill { position: absolute; inset: 0; border-radius: 999px; background: #fff; box-shadow: 0 1px 2px rgb(0 0 0 / 0.12); }
.hnav { display: flex; }
.hnav__hl { position: absolute; inset: 0; border-radius: 8px; background: rgb(0 0 0 / 0.06); }
.seg__label, .hnav__label { position: relative; z-index: 1; transition: color 200ms ease; }
```
(c) clip-path duplicate (no color-timing mismatch, no Motion):
```tsx
"use client";
import { useLayoutEffect, useRef, useState } from "react";

export function ClipTabs({ tabs, value, onChange }: { tabs: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  const row = useRef<HTMLDivElement>(null);
  const [clip, setClip] = useState("inset(0 100% 0 0 round 999px)");
  useLayoutEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => {
      const active = el.querySelector<HTMLElement>(`[data-id="${value}"]`);
      if (!active) return;
      const W = el.offsetWidth, left = active.offsetLeft, right = W - (left + active.offsetWidth);
      setClip(`inset(0 ${((right / W) * 100).toFixed(2)}% 0 ${((left / W) * 100).toFixed(2)}% round 999px)`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);
  return (
    <div className="ctabs">
      <div ref={row} className="ctabs__row" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} data-id={t.id} role="tab" aria-selected={t.id === value} className="ctabs__tab" onClick={() => onChange(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="ctabs__row ctabs__row--active" aria-hidden="true" style={{ clipPath: clip }}>
        {tabs.map((t) => <span key={t.id} className="ctabs__tab">{t.label}</span>)}
      </div>
    </div>
  );
}
```
```css
.ctabs { position: relative; display: inline-block; }
.ctabs__row { position: relative; display: flex; gap: 4px; }
.ctabs__tab { padding: 0.45rem 0.9rem; border-radius: 999px; color: #666; }
.ctabs__row--active { position: absolute; inset: 0; pointer-events: none; transition: clip-path 250ms var(--ease-in-out); }
.ctabs__row--active .ctabs__tab { background: #111; color: #fff; }
@media (prefers-reduced-motion: reduce) { .ctabs__row--active { transition: none; } }
```
CSS-only hover pill with anchor positioning (Chrome 125+, Firefox 147+, Safari 26+; details in `css-modern.md`):
```css
.nav { position: relative; display: flex; }
.nav a:is(:hover, :focus-visible) { anchor-name: --hovered; }
.nav__pill {
  position: absolute; position-anchor: --hovered; border-radius: 8px; background: rgb(0 0 0 / 0.06);
  left: anchor(left); right: anchor(right); top: anchor(top); bottom: anchor(bottom);
  opacity: 0; transition: left 250ms var(--ease-out), right 250ms var(--ease-out), opacity 150ms ease;
}
.nav:has(a:hover, a:focus-visible) .nav__pill { opacity: 1; }
```
**Tune:** indicator spring `duration 0.3-0.45, bounce 0-0.2`; nav hover highlight `bounce: 0`, 0.25-0.3 s; clip-path 200-300 ms `--ease-in-out`.  
**A11y/perf:** Use Radix/Base UI Tabs for roving tabindex and arrow keys and put the indicator inside the active trigger. Layout animations measure only on change. `<MotionConfig reducedMotion="user">` makes the pill jump instead of glide. Two instances on one page need unique `layoutId`s (`useId`) or separate `<LayoutGroup id>`s.

### 9. Accordion popover and tooltip timing
**Looks like:** Accordions open to natural height with a quick ease-out (no JS measuring); menus scale out of their trigger from 0.95 (never from 0); the first tooltip waits ~600 ms, then neighbouring tooltips open instantly with no animation while you sweep across a toolbar.  
**Use when / avoid when:** Always; these are baseline behaviours. Keep accordion durations 200-300 ms (height animation is layout work every frame). Context menus and command menus opened hundreds of times a day: instant or opacity-only 100 ms.  
**Stack:** CSS + a tiny React component.
```tsx
// 9a. Accordion: grid-template-rows 0fr -> 1fr animates to content height in every modern browser
"use client";
import { useId, useState, type ReactNode } from "react";

export function AccordionItem({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="acc" data-open={open || undefined}>
      <h3>
        <button className="acc__trigger" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
          {title}
          <svg className="acc__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </h3>
      <div id={panelId} className="acc__panel" inert={!open}>
        <div className="acc__clip"><div className="acc__body">{children}</div></div>
      </div>
    </div>
  );
}
```
```css
.acc__panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 250ms var(--ease-out); }
.acc[data-open] .acc__panel { grid-template-rows: 1fr; }
.acc__clip { overflow: hidden; min-height: 0; }          /* no padding here, or it cannot collapse to 0 */
.acc__body { padding-block: 0 1rem; opacity: 0; translate: 0 -4px; transition: opacity 200ms ease, translate 250ms var(--ease-out); }
.acc[data-open] .acc__body { opacity: 1; translate: 0 0; }
.acc__icon { transition: rotate 250ms var(--ease-out); }
.acc[data-open] .acc__icon { rotate: 180deg; }
@media (prefers-reduced-motion: reduce) { .acc__panel, .acc__body, .acc__icon { transition: none; } }
```
```css
/* 9b. Native <details>: ::details-content (Chrome 131+, Firefox 143+, Safari 18.4+) + interpolate-size
   (Chromium 129+ only; Firefox/Safari open instantly, an acceptable fallback). */
:root { interpolate-size: allow-keywords; }
details::details-content {
  block-size: 0; overflow: clip;
  transition: block-size 250ms var(--ease-out), content-visibility 250ms allow-discrete;
}
details[open]::details-content { block-size: auto; }
/* exclusive accordion without JS: give each <details> the same name="faq" */
```
```css
/* 9c. Origin-aware dropdown/popover. Radix exposes the origin var, and its exit waits for animationend:
   use @keyframes (not transitions) with Radix. Base UI: --transform-origin + [data-starting-style]/[data-ending-style]. */
.menu-content { transform-origin: var(--radix-dropdown-menu-content-transform-origin); }
.menu-content[data-state="open"] { animation: pop-in 180ms var(--ease-out); }
.menu-content[data-state="closed"] { animation: pop-out 120ms var(--ease-out); }
@keyframes pop-in { from { opacity: 0; scale: 0.95; } }
@keyframes pop-out { to { opacity: 0; scale: 0.97; } }

/* native popover API (Chrome 114+, Firefox 125+, Safari 17+), enter/exit via @starting-style + allow-discrete */
[popover].pop {
  transform-origin: top left; opacity: 1; scale: 1;
  transition: opacity 180ms var(--ease-out), scale 180ms var(--ease-out), overlay 180ms allow-discrete, display 180ms allow-discrete;
}
[popover].pop:not(:popover-open) { opacity: 0; scale: 0.95; }
@starting-style { [popover].pop:popover-open { opacity: 0; scale: 0.95; } }
@media (prefers-reduced-motion: reduce) {
  [popover].pop, [popover].pop:not(:popover-open) { scale: 1; }
  .menu-content[data-state] { animation-name: fade; }
}
@keyframes fade { from { opacity: 0; } }
```
```tsx
// 9d. Tooltip delay group: first open waits, peers open instantly.
// Radix equivalent: <Tooltip.Provider delayDuration={700} skipDelayDuration={300}> (the defaults);
// content gets data-state="delayed-open" | "instant-open": disable the animation on instant-open.
"use client";
import { useEffect, useId, useRef, useState, type FocusEvent, type ReactNode } from "react";

const OPEN_DELAY = 600;
const SKIP_WINDOW = 300;
let warmUntil = 0;
let openCount = 0;

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const id = useId();

  const show = (immediate = false) => {
    window.clearTimeout(timer.current);
    const warm = openCount > 0 || performance.now() < warmUntil;
    if (warm || immediate) { setInstant(warm); setOpen(true); return; }
    timer.current = window.setTimeout(() => { setInstant(false); setOpen(true); }, OPEN_DELAY);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    if (open) warmUntil = performance.now() + SKIP_WINDOW;
    setOpen(false);
  };
  const onFocus = (e: FocusEvent) => { if ((e.target as Element).matches(":focus-visible")) show(true); };

  useEffect(() => {
    if (!open) return;
    openCount++;
    return () => { openCount--; };
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span className="tt" aria-describedby={id}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") show(); }} onPointerLeave={hide}
      onFocus={onFocus} onBlur={hide} onKeyDown={(e) => { if (e.key === "Escape") hide(); }}>
      {children}
      <span role="tooltip" id={id} className="tt__bubble" data-open={open || undefined} data-instant={instant || undefined}>{label}</span>
    </span>
  );
}
```
```css
.tt { position: relative; display: inline-flex; }
.tt__bubble {
  position: absolute; bottom: calc(100% + 8px); left: 50%; translate: -50% 0; transform-origin: bottom center;
  padding: 4px 8px; border-radius: 6px; background: #111; color: #fff; font-size: 12px; white-space: nowrap;
  pointer-events: none; opacity: 0; scale: 0.97;
  transition: opacity var(--dur-tooltip) var(--ease-out), scale var(--dur-tooltip) var(--ease-out);
}
.tt__bubble[data-open] { opacity: 1; scale: 1; }
.tt__bubble[data-instant] { transition-duration: 0ms; }
```
**Tune:** accordion 200-300 ms; dropdown 150-200 ms from scale 0.95-0.97, exit ~70% of enter; tooltip first delay 500-700 ms, skip window 300 ms, animation 100-150 ms from scale 0.97; modals keep `transform-origin: center`.  
**A11y/perf:** `inert` on closed panels removes hidden links from the tab order (React 19 accepts boolean `inert`). Tooltips never hold essential or interactive content; open on keyboard focus immediately; Escape closes. For edge-aware positioning use Floating UI / Radix, or CSS anchor positioning with `position-try-fallbacks: flip-block` (the `transform-origin` will not follow the flip; acceptable).

### 10. Toasts and drawers
**Looks like:** (Sonner) Toasts stack as a deck: the newest in front, older ones peek 14 px behind at 95% / 90% scale; hovering the stack fans them out into a list; a flick sends one away. (Vaul) A bottom sheet slides up on the iOS curve, the page behind shrinks and rounds its corners, and you can drag it down to dismiss with a flick even if you did not drag far.  
**Use when / avoid when:** Use the libraries: `sonner` 2.0 (Emil Kowalski, actively used by shadcn/ui) and `vaul` 1.1 (note: the Vaul README says the repo is unmaintained since 2025; it still works and shadcn's Drawer wraps it, but pin the version, and fall back to a Radix/Base UI Dialog styled as a sheet if you hit a bug). Build custom only when the design demands it; copy the mechanics below. Avoid toasts for errors that need action (put those inline) and drawers on desktop (use a dialog or popover).  
**Stack:** libs; custom swipe hook in plain React.
```tsx
// app/layout.tsx - Sonner (Toaster is fine in a server layout)
import type { ReactNode } from "react";
import { Toaster } from "sonner";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" visibleToasts={3} gap={14} duration={4000} />
      </body>
    </html>
  );
}
// anywhere on the client: import { toast } from "sonner";
// toast.promise(save(), { loading: "Saving...", success: "Saved", error: "Could not save" });
```
```tsx
// components/Sheet.tsx - Vaul bottom sheet with background scale
"use client";
import { Drawer } from "vaul";
export function Sheet() {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger className="btn">Open</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 mt-24 flex max-h-[96dvh] flex-col rounded-t-2xl bg-white">
          <Drawer.Handle />
          <Drawer.Title className="px-4 pt-4 font-medium">Filters</Drawer.Title>
          <div className="overflow-y-auto p-4">Content</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
// shouldScaleBackground needs a wrapper in layout.tsx: <div data-vaul-drawer-wrapper="" className="min-h-dvh bg-white">{children}</div>
```
Mechanics (read from `sonner@2.0.8` and `vaul@1.1.2` source):

| Mechanic | Sonner | Vaul |
|---|---|---|
| Timing | enter/lift `400ms ease`; unmount after 200 ms | `500ms cubic-bezier(0.32, 0.72, 0, 1)` (Ionic sheet curve) |
| Stacking | `translateY(-gap * index)`, `scale(1 - 0.05 * index)`, gap 14 px, 3 visible; all stacked toasts take the front toast's height | page wrapper scales to `(innerWidth - 26) / innerWidth`, `border-radius: 8px` |
| Expand | hover/focus: each toast moves to `--offset` = sum of heights before + gap * index; an `::after` fills gaps so hover does not flicker | n/a |
| Dismiss | `abs(distance) >= 45px` OR `velocity > 0.11 px/ms` (distance / total time) | `velocity > 0.4 px/ms` OR dragged `>= 25%` of height (`closeThreshold`) |
| Wrong-direction drag | damped: `delta / (1.5 + abs(delta) / 20)` | over-drag damped logarithmically: `8 * (ln(v + 1) - 2)` |
| Timers | 4000 ms, paused on hover and when `document.hidden` | n/a |
| Scroll inside | n/a | drag only when scrolled to top, plus 100 ms lock after reaching it |
| Writes | CSS vars on the toast; Vaul writes `transform` directly (vars on a parent recalc every child) | direct `style.transform` |

Minimal custom swipe-to-dismiss (toasts, cards, custom sheets):
```ts
// lib/useSwipeDismiss.ts
"use client";
import { useRef, type PointerEvent } from "react";

type Opts = { axis?: "x" | "y"; direction?: 1 | -1; distance?: number; velocity?: number; onDismiss: () => void };

export function useSwipeDismiss<T extends HTMLElement>({ axis = "x", direction = 1, distance = 45, velocity = 0.11, onDismiss }: Opts) {
  const ref = useRef<T>(null);
  const start = useRef<{ p: number; t: number; id: number } | null>(null);
  const delta = useRef(0);

  const apply = (v: number, animated: boolean) => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = animated ? "transform 400ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms ease" : "none";
    el.style.transform = axis === "x" ? `translate3d(${v}px, 0, 0)` : `translate3d(0, ${v}px, 0)`;
  };
  const onPointerDown = (e: PointerEvent<T>) => {
    if (e.button !== 0 || start.current) return;                  // ignore 2nd finger mid-drag
    if ((e.target as Element).closest("button, a, input, textarea")) return;
    e.currentTarget.setPointerCapture(e.pointerId);               // keep receiving moves outside the element
    start.current = { p: axis === "x" ? e.clientX : e.clientY, t: performance.now(), id: e.pointerId };
  };
  const onPointerMove = (e: PointerEvent<T>) => {
    const s = start.current;
    if (!s || e.pointerId !== s.id) return;
    const raw = (axis === "x" ? e.clientX : e.clientY) - s.p;
    delta.current = Math.sign(raw) === direction ? raw : raw / (1.5 + Math.abs(raw) / 20); // friction, not a wall
    apply(delta.current, false);
  };
  const onPointerUp = (e: PointerEvent<T>) => {
    const s = start.current;
    if (!s || e.pointerId !== s.id) return;
    start.current = null;
    const d = delta.current;
    delta.current = 0;
    const v = Math.abs(d) / Math.max(1, performance.now() - s.t);
    const el = ref.current;
    if (el && Math.sign(d) === direction && (Math.abs(d) >= distance || v > velocity)) {
      apply(direction * (axis === "x" ? el.offsetWidth : el.offsetHeight) * 1.1, true);
      el.style.opacity = "0";
      window.setTimeout(onDismiss, 200);
    } else {
      apply(0, true);
    }
  };
  return { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
// <div {...useSwipeDismiss<HTMLDivElement>({ onDismiss })} className="toast" style={{ touchAction: "pan-y" }}>
```
Stack CSS if you hand-roll the deck (JS sets `--i` = index from front and `--offset` = px to lift when expanded):
```css
.toaster { position: fixed; right: 24px; bottom: 24px; width: 356px; }
.toast {
  position: absolute; right: 0; bottom: 0; width: 100%;
  translate: 0 calc(var(--i) * -14px); scale: calc(1 - var(--i) * 0.05); transform-origin: bottom center;
  transition: translate 400ms ease, scale 400ms ease, opacity 400ms ease;
}
.toast:nth-child(n + 4) { opacity: 0; pointer-events: none; }     /* 3 visible */
.toaster:is(:hover, :focus-within) .toast { translate: 0 calc(var(--offset) * -1); scale: 1; }
.toast::after { content: ""; position: absolute; left: 0; right: 0; top: 100%; height: 14px; } /* hover bridge over gaps */
@starting-style { .toast { translate: 0 100%; opacity: 0; } }
```
**Tune:** toast 400 ms `ease` (Sonner is deliberately softer than generic UI); drawer 500 ms `--ease-drawer`; dismiss velocity 0.11 px/ms for small toasts, 0.4 px/ms for full sheets; distance 45 px (toast) or 25% of height (sheet); background scale ~0.95 with 8-10 px radius.  
**A11y/perf:** Toast region must be `aria-live="polite"` (Sonner does it); never auto-dismiss something with an action the user needs. Swipe always has a close button alternative (WCAG 2.5.7). Drawers trap focus and return it (Vaul uses Radix Dialog). Reduced motion: keep the slide but shorten to 200 ms, or cross-fade.

### 11. Dock magnification
**Looks like:** macOS Dock: icons in a bar swell smoothly as the pointer approaches (peak under the pointer, neighbours partially grown), pushing each other apart; a label pops above the hovered icon. Magic UI `Dock`, React Bits `Dock`, Build UI "Magnified Dock".  
**Use when / avoid when:** Playful personal sites, app launchers, "what I use" sections, a portfolio's social bar. Avoid as primary navigation on content sites (moving targets, poor touch story) and never with more than ~10 items.  
**Stack:** Motion (`useMotionValue` + `useTransform` + `useSpring`).
```tsx
// components/fx/Dock.tsx
"use client";
import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";

const BASE = 44;      // px at rest
const PEAK = 72;      // px under the pointer
const RANGE = 140;    // px of influence either side
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

type DockItemData = { label: string; href: string; icon: ReactNode };

export function Dock({ items }: { items: DockItemData[] }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <nav aria-label="Dock" className="dock"
      onPointerMove={(e) => { if (e.pointerType === "mouse") mouseX.set(e.clientX); }}
      onPointerLeave={() => mouseX.set(Infinity)}>
      {items.map((it) => <DockItem key={it.href} mouseX={mouseX} {...it} />)}
    </nav>
  );
}

function DockItem({ mouseX, label, href, icon }: DockItemData & { mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const target = useTransform(distance, [-RANGE, 0, RANGE], [BASE, reduce ? BASE : PEAK, BASE]); // clamps outside range
  const size = useSpring(target, SPRING);
  return (
    <motion.a ref={ref} href={href} aria-label={label} className="dock__item" style={{ width: size, height: size }}>
      {icon}
      <span className="dock__label" aria-hidden="true">{label}</span>
    </motion.a>
  );
}
```
```css
.dock { display: flex; align-items: flex-end; gap: 8px; height: 64px; padding: 8px 10px; border-radius: 18px;
  background: rgb(255 255 255 / 0.6); box-shadow: 0 0 0 1px rgb(0 0 0 / 0.06), 0 10px 30px rgb(0 0 0 / 0.08); }
.dock__item { position: relative; display: grid; place-items: center; flex: none; border-radius: 22%; background: #f3f3f3; }
.dock__item > svg { width: 50%; height: 50%; }
.dock__label { position: absolute; bottom: calc(100% + 10px); padding: 2px 8px; border-radius: 6px; background: #111; color: #fff;
  font-size: 12px; white-space: nowrap; opacity: 0; translate: 0 4px; transition: opacity 150ms ease, translate 150ms var(--ease-out); pointer-events: none; }
.dock__item:is(:hover, :focus-visible) .dock__label { opacity: 1; translate: 0 0; }
```
**Tune:** peak/base ratio 1.4-1.7 (Magic UI: 40 -> 60, range 140); range 100-180 px; spring mass 0.1 / stiffness 150 / damping 12 (lively, Magic UI default) or stiffness 300 / damping 30 (calm).  
**A11y/perf:** Animates width/height (layout) of a small flex row: acceptable here because neighbours must move; do not copy this onto large layouts. Each item measures its rect per pointer move: fine for 10 items. Touch: magnification never triggers (mouse-only guard), icons remain normal links; labels also appear on keyboard focus.

### 12. Drag inertia swipe cards and reorder
**Looks like:** (a) A horizontal rail of cards you can grab and throw; it glides with momentum, resists at the ends, and settles snapped to a card edge (GSAP Draggable + Inertia, the "draggable slider" on countless agency sites). (b) A free-drag object bounded by a pen that rubber-bands at the edges (Motion). (c) A Tinder-style stack: the top card rotates as you drag and flies off past a threshold or on a flick. (d) A sortable list whose items slide out of the way (Motion `Reorder`).  
**Use when / avoid when:** (a) galleries, testimonials, product rails on desktop (native scroll-snap is better on touch: see `scroll-css-native.md`). (b) playful demos, stickers, "toys" on portfolio pages. (c) decision UIs, onboarding choice. (d) user-ordered lists (playlists, priorities). Avoid hijacking native scroll containers with drag on mobile; avoid Reorder for long/virtualized lists or where keyboard reordering is required (use dnd-kit).  
**Stack:** GSAP Draggable + InertiaPlugin; Motion drag, `Reorder`.
```tsx
// (a) throwable rail with snap
"use client";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

export function ThrowRail({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const vp = viewport.current!, tr = track.current!;
      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", tr);
      const bounds = () => ({ minX: Math.min(0, vp.clientWidth - tr.scrollWidth), maxX: 0 });
      const [drag] = Draggable.create(tr, {
        type: "x",
        bounds: bounds(),
        inertia: true,
        edgeResistance: 0.85,              // 0 = free past bounds, 1 = hard wall
        snap: { x: (endX: number) => gsap.utils.snap(slides.map((s) => -s.offsetLeft), endX) },
        onPress: () => vp.setAttribute("data-dragging", ""),
        onRelease: () => vp.removeAttribute("data-dragging"),
      });
      const onResize = () => drag.applyBounds(bounds());
      window.addEventListener("resize", onResize);
      return () => { window.removeEventListener("resize", onResize); drag.kill(); };
    },
    { scope: viewport },
  );

  return (
    <div ref={viewport} className="rail" data-cursor="drag">
      <div ref={track} className="rail__track">{children}</div>
    </div>
  );
}
// children: <article data-slide className="rail__slide">...</article>
```
```css
.rail { overflow: hidden; cursor: grab; }
.rail[data-dragging] { cursor: grabbing; }
.rail[data-dragging] .rail__track { user-select: none; }
.rail__track { display: flex; gap: 16px; width: max-content; touch-action: pan-y; } /* vertical page scroll still works */
.rail__slide { flex: none; width: clamp(240px, 28vw, 380px); }
.rail__slide img { pointer-events: none; -webkit-user-drag: none; }
```
```tsx
// (b) Motion: bounded free drag with rubber band + (c) swipe stack
"use client";
import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

export function Pen() {
  const pen = useRef<HTMLDivElement>(null);
  return (
    <div ref={pen} className="pen">
      <motion.div className="sticker" drag dragConstraints={pen} dragElastic={0.2}
        dragTransition={{ power: 0.3, timeConstant: 250, bounceStiffness: 400, bounceDamping: 25 }}
        whileDrag={{ scale: 1.06 }} />
    </div>
  );
}

type Card = { id: string; title: string };
const SWIPE_DISTANCE = 120;  // px
const SWIPE_VELOCITY = 500;  // px/s (Motion reports velocity per second)

function SwipeCard({ card, onDone, isTop }: { card: Card; onDone: (id: string, dir: 1 | -1) => void; isTop: boolean }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-12, 12]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  const fling = (dir: 1 | -1) => animate(x, dir * 600, { duration: 0.3, ease: [0.23, 1, 0.32, 1] }).then(() => onDone(card.id, dir));
  return (
    <motion.div className="swipe-card" style={{ x, rotate, opacity }} drag={isTop ? "x" : false} dragMomentum={false}
      onDragEnd={(_, info) => {
        const dir: 1 | -1 = info.offset.x > 0 ? 1 : -1;
        if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) fling(dir);
        else animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      }}>
      {card.title}
      {isTop && (
        <div className="swipe-card__actions">
          <button type="button" onClick={() => fling(-1)}>Skip</button>
          <button type="button" onClick={() => fling(1)}>Keep</button>
        </div>
      )}
    </motion.div>
  );
}

export function SwipeStack({ initial }: { initial: Card[] }) {
  const [cards, setCards] = useState(initial);
  return (
    <div className="swipe-stack">
      {cards.slice(0, 3).reverse().map((c, i, arr) => (
        <SwipeCard key={c.id} card={c} isTop={i === arr.length - 1} onDone={(id) => setCards((cs) => cs.filter((k) => k.id !== id))} />
      ))}
    </div>
  );
}
```
```css
.pen { position: relative; height: 320px; border-radius: 16px; background: #f4f4f5; }
.sticker { width: 96px; height: 96px; border-radius: 24px; background: #111; cursor: grab; touch-action: none; }
.swipe-stack { position: relative; width: 320px; height: 420px; }
.swipe-card { position: absolute; inset: 0; border-radius: 20px; background: #fff; box-shadow: 0 8px 30px rgb(0 0 0 / 0.08); touch-action: pan-y; }
.swipe-card:not(:last-child) { scale: 0.96; translate: 0 10px; }  /* peeking cards behind */
```
```tsx
// (d) Reorder with a drag handle (text stays selectable, scroll still works on touch)
"use client";
import { useState } from "react";
import { Reorder, useDragControls } from "motion/react";

export function SortableList({ initial }: { initial: string[] }) {
  const [items, setItems] = useState(initial);
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="sortable">
      {items.map((item) => <SortableItem key={item} value={item} />)}
    </Reorder.Group>
  );
}

function SortableItem({ value }: { value: string }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={value} dragListener={false} dragControls={controls} className="sortable__item"
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgb(0 0 0 / 0.12)" }}>
      <span>{value}</span>
      <button type="button" className="sortable__handle" aria-label={`Drag to reorder ${value}`} onPointerDown={(e) => controls.start(e)}>
        <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
          {[3, 8, 13].flatMap((y) => [3, 9].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" />))}
        </svg>
      </button>
    </Reorder.Item>
  );
}
```
```css
.sortable { display: grid; gap: 6px; list-style: none; padding: 0; }
.sortable__item { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 10px; background: #fff; }
.sortable__handle { cursor: grab; touch-action: none; padding: 6px; color: #999; }
```
**Tune:** Draggable `edgeResistance` 0.75-0.9; throw length via Draggable vars `throwResistance` (higher = shorter glide), `minDuration` / `maxDuration` (try 0.3 / 1.5 s) and `overshootTolerance` (0 = never overshoot bounds). Motion `dragElastic` 0.1-0.3 (default 0.5 feels loose); `dragTransition.power` default 0.8 / `timeConstant` default 700 ms: lower both for a shorter glide. Swipe card: rotation 10-15 deg at 240 px, distance 100-150 px, velocity 400-800 px/s. Reorder `axis="xy"` exists for wrapped grids (Motion 13.x).  
**A11y/perf:** Every drag has a button alternative (swipe actions, prev/next for rails; WCAG 2.5.7). Set `user-select: none` and make images non-draggable while dragging (Vercel guideline: also `inert` on the dragged element's interactive children). `touch-action: pan-y` on horizontal draggables so the page still scrolls vertically; `touch-action: none` only on handles and free-drag objects. Reduced motion: disable inertia (`inertia: false`, `dragMomentum={false}`) but keep dragging.

### 13. Micro-interaction kit
**Looks like:** Small moments that make an app feel hand-made: a destructive button that fills while held; a copy icon that blurs into a check; a heart that pops and throws a few hearts; a switch whose thumb lands with a tiny overshoot; a checkbox tick that draws itself; a quantity whose digits roll; a label that floats up on focus; a form that shakes once on a wrong code.  
**Use when / avoid when:** Each one earns its place by confirming a state change. Keep them fast and rare: no confetti on routine saves, no shake on every validation message, no bounce in a banking app. Emil's rule: slow where the user decides (hold 1.5-2 s linear), fast where the system responds (200 ms).  
**Stack:** CSS first; Motion for icon swaps; `canvas-confetti`; `@number-flow/react`.

13a. Hold-to-confirm (clip-path progress, duplicate label so text color flips inside the fill):
```tsx
"use client";
import { useRef, useState, type CSSProperties } from "react";

const HOLD_MS = 1500;

export function HoldToConfirm({ label = "Hold to delete", onConfirm }: { label?: string; onConfirm: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const begin = () => {
    window.clearTimeout(timer.current);
    setHolding(true);
    timer.current = window.setTimeout(() => { setHolding(false); onConfirm(); }, HOLD_MS);
  };
  const cancel = () => { window.clearTimeout(timer.current); setHolding(false); };
  return (
    <button type="button" className="btn hold" data-holding={holding || undefined} style={{ "--hold": `${HOLD_MS}ms` } as CSSProperties}
      onPointerDown={(e) => { if (e.button === 0) begin(); }}
      onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}  /* sliding off = escape hatch */
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); begin(); } }}
      onKeyUp={cancel} onBlur={cancel} onContextMenu={(e) => e.preventDefault()}
      aria-description={`Press and hold for ${HOLD_MS / 1000} seconds`}>
      <span>{label}</span>
      <span className="hold__fill" aria-hidden="true">{label}</span>
    </button>
  );
}
```
```css
.hold { position: relative; overflow: hidden; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.hold__fill {
  position: absolute; inset: 0; display: grid; place-items: center; background: #e5484d; color: #fff;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out);                          /* release: snappy */
}
.hold[data-holding] { scale: 0.97; }
.hold[data-holding] .hold__fill { clip-path: inset(0 0 0 0); transition: clip-path var(--hold) linear; } /* press: linear progress */
```

13b. Copy-to-clipboard icon morph:
```tsx
"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text); // secure context + user gesture required
      setCopied(true);
    } catch {
      setCopied(false); // fall back to selecting the text, or show "Press Ctrl+C"
    }
  };
  return (
    <button type="button" className="btn icon-btn" onClick={copy} aria-label={copied ? "Copied" : "Copy to clipboard"}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={copied ? "check" : "copy"} style={{ display: "inline-flex" }}
          initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```
CSS-only swap (no Motion): stack both icons in one grid cell and toggle a `data-copied` attribute.
```css
.icon-swap { display: inline-grid; }
.icon-swap > svg { grid-area: 1 / 1; transition: opacity 200ms var(--ease-out), scale 200ms var(--ease-out), filter 200ms var(--ease-out); }
.icon-swap > .i-check, [data-copied] .icon-swap > .i-copy { opacity: 0; scale: 0.5; filter: blur(4px); }
[data-copied] .icon-swap > .i-check { opacity: 1; scale: 1; filter: blur(0); }
```

13c. Like with pop + heart burst (canvas-confetti, 1 call, auto-disabled for reduced motion):
```tsx
"use client";
import { useState, type MouseEvent } from "react";
import confetti from "canvas-confetti";

const HEART_PATH = "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z";
let heartShape: confetti.Shape | null = null; // Path2D needs window: create lazily

function burstFrom(el: HTMLElement) {
  heartShape ??= confetti.shapeFromPath({ path: HEART_PATH });
  const r = el.getBoundingClientRect();
  confetti({
    particleCount: 12, spread: 70, startVelocity: 16, gravity: 0.7, ticks: 70, scalar: 0.9,
    shapes: [heartShape], colors: ["#ff3b5c", "#ff8fa3", "#ffc2cf"],
    origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
    disableForReducedMotion: true,
  });
}

export function LikeButton({ initial = false }: { initial?: boolean }) {
  const [liked, setLiked] = useState(initial);
  const [pop, setPop] = useState(false);
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = !liked;
    setLiked(next);
    setPop(next);
    if (next) burstFrom(e.currentTarget);
  };
  return (
    <button type="button" className="like" aria-pressed={liked} aria-label="Like" onClick={toggle} onAnimationEnd={() => setPop(false)} data-pop={pop || undefined}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.4 3.2 5 6.6 5c2 0 3.4 1.1 4.4 2.6.1.2.5.2.6 0C12.6 6.1 14 5 16 5c3.4 0 5.5 3.4 4.1 6.7C18.1 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
```
```css
.like svg { fill: transparent; stroke: currentColor; stroke-width: 1.8; transition: fill 150ms ease, stroke 150ms ease; }
.like[aria-pressed="true"] svg { fill: #ff3b5c; stroke: #ff3b5c; }
.like[data-pop] svg { animation: like-pop 400ms var(--ease-out); }
@keyframes like-pop { 0% { scale: 0.7; } 50% { scale: 1.2; } 100% { scale: 1; } }
@media (prefers-reduced-motion: reduce) { .like[data-pop] svg { animation: none; } }
```

13d. Toggle switch with a spring, CSS only (the `linear()` spring token from recipe 0):
```tsx
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch__thumb" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
```
```css
.switch { --w: 44px; --h: 26px; --pad: 3px; --thumb: calc(var(--h) - var(--pad) * 2);
  position: relative; width: var(--w); height: var(--h); border-radius: 999px; background: #d4d4d8; transition: background-color 200ms ease; }
.switch[aria-checked="true"] { background: #16a34a; }
.switch__thumb { position: absolute; top: var(--pad); left: var(--pad); width: var(--thumb); height: var(--thumb); border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 0.25); transition: translate var(--spring-snappy-dur) var(--spring-snappy); }
.switch[aria-checked="true"] .switch__thumb { translate: calc(var(--w) - var(--thumb) - var(--pad) * 2) 0; }
.switch:active .switch__thumb { scale: 1.1 0.92; transition: translate var(--spring-snappy-dur) var(--spring-snappy), scale 120ms var(--ease-out); }
```
Motion alternative: `justify-content: flex-start | flex-end` on the track + `<motion.span layout transition={{ type: "spring", stiffness: 700, damping: 35 }} />` on the thumb.

13e. Animated checkbox (native input, SVG tick draws via `pathLength="1"`):
```tsx
import type { ComponentProps } from "react";

export function Checkbox({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="check">
      <input type="checkbox" className="check__input" {...props} />
      <svg className="check__box" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="1" y="1" width="18" height="18" rx="5" />
        <path className="check__mark" d="M5.5 10.5l3 3 6-6.5" pathLength="1" />
      </svg>
      {label}
    </label>
  );
}
```
```css
.check { display: inline-flex; align-items: center; gap: 0.6rem; cursor: pointer; }
.check__input { position: absolute; width: 1px; height: 1px; opacity: 0; }   /* still focusable and announced */
.check__box { width: 20px; height: 20px; flex: none; }
.check__box rect { fill: #fff; stroke: #a1a1aa; stroke-width: 1.5; transition: fill 150ms ease, stroke 150ms ease; }
.check__mark { fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 120ms ease-in; }
.check__input:checked + .check__box rect { fill: #111; stroke: #111; }
.check__input:checked + .check__box .check__mark { stroke-dashoffset: 0; transition: stroke-dashoffset 250ms var(--ease-out) 60ms; }
.check__input:focus-visible + .check__box { outline: 2px solid #2563eb; outline-offset: 2px; border-radius: 6px; }
.check:active .check__box { scale: 0.92; transition: scale var(--dur-press) var(--ease-out); }
```

13f. Number stepper with rolling digits (NumberFlow respects reduced motion by default: `respectMotionPreference` is true):
```tsx
"use client";
import { useState } from "react";
import NumberFlow from "@number-flow/react";

export function Stepper({ min = 1, max = 20, price = 24 }: { min?: number; max?: number; price?: number }) {
  const [qty, setQty] = useState(min);
  return (
    <div className="stepper" role="group" aria-label="Quantity">
      <button type="button" onClick={() => setQty((q) => Math.max(min, q - 1))} disabled={qty <= min} aria-label="Decrease">-</button>
      <output aria-live="polite"><NumberFlow value={qty} /></output>
      <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} aria-label="Increase">+</button>
      <NumberFlow className="stepper__total" value={qty * price} format={{ style: "currency", currency: "USD" }}
        spinTiming={{ duration: 500, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }} />
    </div>
  );
}
```
`trend` defaults to the sign of the change (digits roll up when increasing); pass `trend={0}` to roll each digit the shortest way, `plugins={[continuous]}` (exported from `@number-flow/react`) to make 1 -> 10 pass through intermediate numbers.

13g. Floating label input (CSS only):
```html
<div class="field">
  <input id="email" type="email" placeholder=" " autocomplete="email" required />
  <label for="email">Email</label>
</div>
```
```css
.field { position: relative; }
.field input { width: 100%; padding: 1.35rem 0.9rem 0.45rem; font-size: 16px; /* >= 16px: no iOS zoom */
  border: 1px solid #d4d4d8; border-radius: 10px; background: #fff; transition: border-color 150ms ease, box-shadow 150ms ease; }
.field label { position: absolute; left: 0.9rem; top: 0.95rem; color: #71717a; pointer-events: none; transform-origin: left top;
  transition: translate 200ms var(--ease-out), scale 200ms var(--ease-out), color 150ms ease; }
.field input:is(:focus, :not(:placeholder-shown)) + label { translate: 0 -0.6rem; scale: 0.78; }
.field input:focus { outline: none; border-color: #111; box-shadow: 0 0 0 3px rgb(0 0 0 / 0.08); }
.field input:focus + label { color: #111; }
.field input:user-invalid { border-color: #e5484d; }   /* only after the user interacted */
```

13h. Error shake (once, on a failed submit only) and success:
```ts
// lib/shake.ts - WAAPI so it re-triggers without remounting (remounting would steal focus)
export function shake(el: HTMLElement | null) {
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.animate([{ outlineColor: "#e5484d" }, { outlineColor: "transparent" }], { duration: 600 });
    return;
  }
  el.animate(
    [{ translate: "0" }, { translate: "-6px" }, { translate: "5px" }, { translate: "-3px" }, { translate: "2px" }, { translate: "0" }],
    { duration: 360, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  );
}
```
Success check: reuse the `pathLength` draw from 4g on the submit button, then reset.  
**Tune:** hold 1.2-2 s linear press / 200 ms release; icon swap spring `duration 0.25-0.35, bounce 0` from scale 0.5 + blur 4 px; heart pop 350-450 ms to 1.2x, 8-16 particles, gravity 0.6-0.9; switch thumb ~450 ms with <= 3% overshoot; checkbox draw 200-300 ms in, 100-150 ms out; NumberFlow spin 400-750 ms; floating label 200 ms at scale 0.75-0.8; shake 300-400 ms, amplitude <= 6 px, decaying.  
**A11y/perf:** Hold-to-confirm needs keyboard hold (Space/Enter) and a visible hint; for irreversible actions also offer Undo. Icons swapped with Motion keep one accessible name on the button. `role="switch"` + `aria-checked`; native checkbox stays in the DOM. Confetti canvas is a fixed full-screen layer that removes itself; `disableForReducedMotion: true`. Clipboard API needs HTTPS (or localhost) and a user gesture.

### 14. Loading feedback hover intent and command palette
**Looks like:** Fast responses show nothing; slow ones show a calm skeleton that matches the final layout and fades to content. Likes and toggles update instantly and quietly roll back on failure. Mega-menus open only when you pause on a trigger and do not slam shut when you cut diagonally to the panel. Draggable surfaces resist past their edges like iOS. The command palette appears instantly on Cmd+K.  
**Use when / avoid when:** Everywhere in product UI. Avoid skeletons for sub-300 ms loads, spinners inside every card, and entrance animations on keyboard-invoked UI.  
**Stack:** CSS + React hooks + `cmdk`.
```ts
// 14a. Show-delay + minimum-visible flag (Vercel guidelines: ~150-300 ms delay, ~300-500 ms minimum)
"use client";
import { useEffect, useRef, useState } from "react";

export function useDelayedFlag(active: boolean, delay = 200, minVisible = 400) {
  const [shown, setShown] = useState(false);
  const shownAt = useRef<number | null>(null);
  useEffect(() => {
    if (active && shownAt.current === null) {
      const t = window.setTimeout(() => { shownAt.current = performance.now(); setShown(true); }, delay);
      return () => window.clearTimeout(t);
    }
    if (!active && shownAt.current !== null) {
      const remaining = Math.max(0, minVisible - (performance.now() - shownAt.current));
      const t = window.setTimeout(() => { shownAt.current = null; setShown(false); }, remaining);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [active, delay, minVisible]);
  return shown;
}
// const showSkeleton = useDelayedFlag(isLoading); return showSkeleton ? <CardSkeleton /> : isLoading ? null : <Card />;
```
```css
/* Skeleton: same box sizes as the real content (zero CLS), low contrast, transform-based sweep on a pseudo */
.skeleton { position: relative; overflow: hidden; border-radius: 6px; background: rgb(0 0 0 / 0.06); }
.skeleton::after {
  content: ""; position: absolute; inset: 0; translate: -100% 0;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55), transparent);
  animation: skeleton-sweep 1.6s ease-in-out infinite;
}
@keyframes skeleton-sweep { to { translate: 100% 0; } }
@media (prefers-reduced-motion: reduce) {
  .skeleton::after { animation: none; }
  .skeleton { animation: skeleton-pulse 2s ease-in-out infinite; }
}
@keyframes skeleton-pulse { 50% { opacity: 0.6; } }
.content-enter { animation: fade-in 200ms var(--ease-out); }  /* cross-fade in, never pop */
@keyframes fade-in { from { opacity: 0; } }
```
Mark the loading region `aria-busy="true"` with a visually hidden "Loading..." label; remove when content arrives.
```tsx
// 14b. Optimistic micro-feedback (React 19). Base state comes from the server; the optimistic value
//      reverts automatically when the transition settles if the server state did not change.
"use client";
import { useOptimistic, useTransition } from "react";
import NumberFlow from "@number-flow/react";
import { toast } from "sonner";

type LikeState = { liked: boolean; count: number };

export function OptimisticLike({ state, save }: { state: LikeState; save: (liked: boolean) => Promise<void> }) {
  const [optimistic, setOptimistic] = useOptimistic(state, (s: LikeState, liked: boolean) => ({ liked, count: s.count + (liked ? 1 : -1) }));
  const [, startTransition] = useTransition();
  const toggle = () =>
    startTransition(async () => {
      const next = !optimistic.liked;
      setOptimistic(next);
      try { await save(next); } catch { toast.error("Could not save. Try again."); }
    });
  return (
    <button type="button" className="like-pill" aria-pressed={optimistic.liked} onClick={toggle}>
      <span aria-hidden="true">{optimistic.liked ? "Liked" : "Like"}</span> <NumberFlow value={optimistic.count} />
    </button>
  );
}
```
```ts
// 14c. Hover intent: open after a short pause, close with grace time; bind to a wrapper around trigger AND panel.
"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";

export function useHoverIntent({ openDelay = 120, closeDelay = 250 } = {}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const schedule = (next: boolean, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), ms);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return {
    open,
    setOpen,
    bind: {
      onPointerEnter: (e: PointerEvent) => { if (e.pointerType === "mouse") schedule(true, openDelay); },
      onPointerLeave: (e: PointerEvent) => { if (e.pointerType === "mouse") schedule(false, closeDelay); },
    },
  };
}
```
```css
/* bridge the gap between trigger and panel so leaving the trigger toward the panel never closes it */
.mega-panel { position: absolute; top: calc(100% + 12px); }
.mega-panel::before { content: ""; position: absolute; left: 0; right: 0; bottom: 100%; height: 12px; }
```
Once any top-level menu is open, switching to a sibling trigger should open instantly (same "warm group" idea as tooltips, recipe 9d). For diagonal moves into submenus use Floating UI's `safePolygon()` in `useHover`, which keeps the submenu open while the pointer travels inside the triangle between pointer and panel.
```ts
// 14d. Rubber-band past bounds (the iOS UIScrollView curve, as used by @use-gesture): c = 0.55
export const rubberband = (overflow: number, dimension: number, c = 0.55) =>
  (overflow * dimension * c) / (dimension + c * overflow);

export function withRubberband(value: number, min: number, max: number, dimension: number) {
  if (value < min) return min - rubberband(min - value, dimension);
  if (value > max) return max + rubberband(value - max, dimension);
  return value;
}
// while dragging: el.style.transform = `translate3d(0, ${withRubberband(y, minY, 0, el.clientHeight)}px, 0)`;
// on release: spring back to the clamped value (Motion animate(..., { type: "spring", duration: 0.5, bounce: 0.2 }))
```
Native first: `overscroll-behavior: contain` on modals, drawers and chat panes stops scroll chaining; iOS already rubber-bands native scrollers, so never fake it on a real scroll container.
```tsx
// 14e. Command palette (cmdk 1.1): no open animation for a keyboard-summoned, high-frequency surface
"use client";
import { useEffect, useState } from "react";
import { Command } from "cmdk";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command menu">
      <Command.Input placeholder="Type a command or search..." />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Group heading="Navigate">
          <Command.Item onSelect={() => { window.location.href = "/projects"; }}>Projects</Command.Item>
          <Command.Item onSelect={() => { window.location.href = "/about"; }}>About</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```
```css
[cmdk-overlay] { position: fixed; inset: 0; background: rgb(0 0 0 / 0.3); }
[cmdk-dialog] { position: fixed; top: 20vh; left: 50%; translate: -50% 0; width: min(640px, 92vw); border-radius: 12px; background: #fff;
  box-shadow: 0 24px 60px rgb(0 0 0 / 0.2); }
/* if you must animate: opacity only, <= 120 ms, and only when opened by pointer */
[cmdk-list] { height: min(var(--cmdk-list-height), 360px); overflow: auto; transition: height 100ms var(--ease-out); } /* smooth resize while filtering */
[cmdk-item] { padding: 10px 12px; border-radius: 8px; }
[cmdk-item][data-selected="true"] { background: rgb(0 0 0 / 0.06); } /* no transition: keyboard nav must feel instant */
```
**Tune:** skeleton show-delay 150-300 ms, min visible 300-500 ms, sweep 1.2-2 s, base alpha 0.05-0.08; content fade-in 150-250 ms; hover intent open 80-150 ms (menus) / 300-500 ms (preview cards), close 200-300 ms; rubber-band constant 0.55 (lower = stiffer); cmdk list height 100 ms.  
**A11y/perf:** Skeleton sweep is a transform on a pseudo (compositor); do not animate `background-position` on dozens of skeletons. Optimistic UI must announce failures (toast with `aria-live`) and never optimistic-update destructive actions. Hover-intent menus also open on click and keyboard (Enter/Space/ArrowDown). Command palette: focus the input on open, return focus on close (cmdk's Dialog uses Radix Dialog).

### 15. Image hover treatments
**Looks like:** (a) Image slowly zooms inside a fixed rounded frame. (b) Grayscale thumbnails bloom into color. (c) A second image (alternate shot, detail, or the "after") wipes up from the bottom. (d) Duotone brand-tinted images return to full color on hover.  
**Use when / avoid when:** (a) cards, articles, product tiles: the default, tasteful choice. (b) logo walls, team grids, archives where color should reward attention. (c) e-commerce (alternate product angle), case studies. (d) brand-heavy editorial layouts. Avoid scale above 1.08, shadow-grow + lift + zoom all at once (2016 Material cliche), and hiding essential info behind hover (touch users never see it).  
**Stack:** CSS only (WebGL displacement/liquid hovers: `webgl-shaders-3d.md`).
```css
.img-frame { position: relative; overflow: hidden; border-radius: 12px; isolation: isolate; /* fixes Safari radius clipping during transforms */ }
.img-frame img { display: block; width: 100%; height: 100%; object-fit: cover; }

/* (a) scale inside the frame */
.zoom img { transition: scale 900ms var(--ease-out); }
/* (b) grayscale -> color */
.mono img { filter: grayscale(1) contrast(1.05); transition: filter 500ms ease; }
/* (c) clip reveal of a second image */
.wipe img + img { position: absolute; inset: 0; clip-path: inset(100% 0 0 0); transition: clip-path 600ms var(--ease-in-out); }
/* (d) duotone: grayscale image + two blended color layers */
.duo img { filter: grayscale(1) contrast(1.1); transition: filter 500ms ease; }
.duo::before, .duo::after { content: ""; position: absolute; inset: 0; pointer-events: none; transition: opacity 500ms ease; }
.duo::before { background: #1f2a6b; mix-blend-mode: lighten; }   /* shadows -> brand dark */
.duo::after { background: #f7c948; mix-blend-mode: multiply; }   /* highlights -> brand light */

@media (hover: hover) and (pointer: fine) {
  .card:is(:hover, :focus-within) .zoom img { scale: 1.05; }
  .card:is(:hover, :focus-within) .mono img { filter: none; }
  .card:is(:hover, :focus-within) .wipe img + img { clip-path: inset(0 0 0 0); }
  .card:is(:hover, :focus-within) .duo img { filter: none; }
  .card:is(:hover, :focus-within) .duo::before,
  .card:is(:hover, :focus-within) .duo::after { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .zoom img, .wipe img + img { transition: none; }
  .card:is(:hover, :focus-within) .zoom img { scale: 1; }
}
```
```html
<a class="card" href="/work/aurora">
  <div class="img-frame zoom wipe" style="aspect-ratio: 4 / 5">
    <img src="/aurora-1.jpg" alt="Aurora app on a phone" />
    <img src="/aurora-2.jpg" alt="" />
  </div>
  <h3>Aurora</h3>
</a>
```
**Tune:** zoom 1.03-1.06 over 700-1000 ms `--ease-out` (slow zoom reads premium, fast zoom reads cheap); grayscale -> color 400-600 ms; wipe 500-700 ms `--ease-in-out` (or `inset(0 0 0 100%)` for horizontal); duotone pick a dark and a light brand color with strong luminance contrast.  
**A11y/perf:** `scale` on an image inside `overflow: hidden` is compositor-only; `filter: grayscale()` repaints per frame: fine for thumbnails, on full-bleed heroes cross-fade two pre-rendered layers with opacity instead. Trigger on `:focus-within` too so keyboard users get the same state. Second image in (c) is decorative (`alt=""`) unless it adds information.

## Feel tuning table
Values that separate "premium" from "cheap". Motion's default spring (stiffness 100, damping 10, mass 1) is visibly bouncy: always pass explicit values for UI.

| Interaction | Premium values | Cheap / broken values |
|---|---|---|
| Button press | `scale: 0.97`, 100-160 ms `--ease-out`, on `:active` | scale 0.9, 300 ms, or none at all |
| Hover color / background | 150-200 ms `ease` | `transition: all 0.5s` |
| Cursor dot / ring | quickTo dot 0.08-0.15 s, ring 0.35-0.6 s `power3`; Motion ring spring 500 / 40 / 0.6 | dot lagging > 0.2 s (feels like a slow site) |
| Cursor state morph | 300-400 ms `--ease-out`, swell 1.5-1.8x, label state 2.4-3x | instant size jumps, blend-difference on white pages |
| Magnetic | strength 0.2-0.4; `elastic.out(1, 0.3)` 1 s (playful) or `power3.out` 0.5 s (calm); Motion 150 / 15 / 0.1 | strength > 0.5 (target escapes pointer) |
| Hover preview follow | quickTo 0.6-0.9 s `power3`, velocity tilt <= 8 deg, scale-in 400 ms | 1:1 follow (no lag = no depth) |
| Image trail | threshold 80-150 px, lerp 0.1, fade/scale-out at +0.4 s over 1 s | threshold < 50 px (smear of images) |
| Tilt card | 5-10 deg, perspective 800-1200 px, spring 150-250 / 18-30, scale <= 1.04 | 15-25 deg, instant snap back |
| Spotlight | border light 300-450 px at 0.35-0.6 alpha; surface 500-800 px at 0.04-0.1 | saturated rainbow glow at full alpha |
| Tabs / nav pill | spring `{ duration: 0.3-0.45, bounce: 0-0.2 }`; clip-path 250 ms `--ease-in-out` | bounce 0.5 on a settings page |
| Tooltip | first delay 500-700 ms, skip window 300 ms, 100-150 ms from scale 0.97, instant for peers | every tooltip waits and animates |
| Dropdown / popover | 150-200 ms from scale 0.95 at trigger origin, exit ~70% of enter | scale from 0, center origin |
| Modal | 200-250 ms from scale 0.96, `transform-origin: center` | 500 ms slide + bounce |
| Accordion | 200-300 ms `--ease-out` | 600 ms height animation |
| Toast | 400 ms `ease`, gap 14 px, scale step 0.05, 3 visible, 4 s lifetime, swipe 45 px or 0.11 px/ms | toasts that cannot be swiped or paused |
| Drawer | 500 ms `cubic-bezier(0.32, 0.72, 0, 1)`; dismiss at 0.4 px/ms or 25% height | linear slide, distance-only dismiss |
| Drag release | spring `{ duration: 0.5, bounce: 0.2 }`; `dragElastic` 0.1-0.3; `edgeResistance` 0.75-0.9 | hard walls at bounds, keyframed snap-back |
| Dock | size 44 -> 72 over +-140 px; spring mass 0.1 / stiffness 150 / damping 12 | scale-only (neighbours overlap) |
| Hold to confirm | press 1.2-2 s `linear`, release 200 ms `--ease-out` | eased progress (lies about time left) |
| Icon swap (copy, state) | spring 0.25-0.35 s, bounce 0, from scale 0.5 + blur 4 px | crossfade with both icons visible |
| Hover intent | menus open after 80-150 ms, close after 200-300 ms; preview cards 300-500 ms | open on first pixel of hover, close instantly |
| Skeleton | show-delay 150-300 ms, min 300-500 ms, sweep 1.2-2 s, alpha 0.05-0.08 | skeleton flash on 80 ms responses |
| Stagger | 30-80 ms per item, never blocks input | 150 ms per item on a 20-item list |
| Image zoom | 1.03-1.06 over 700-1000 ms | 1.15 over 200 ms |

CSS spring stand-ins: `--spring-snappy` (recipe 0) for state toggles. For other feels, simulate and sample (k = stiffness, c = damping, m = 1): k 400 / c 30 = ~450 ms, 2.7% overshoot; k 300 / c 16 = ~940 ms, 19% overshoot (playful); k 170 / c 26 = ~725 ms, no overshoot (gentle).

## Taste verdicts
| Effect | Verdict | How to make it tasteful |
|---|---|---|
| Custom cursor on docs, SaaS app, e-commerce, long reads | No | Keep the native cursor; spend the effort on hover states |
| Custom cursor on a portfolio / studio / gallery | Yes, if it carries meaning | States with labels ("View", "Drag", "Play"), hidden on inputs, native on touch, no lag on the dot |
| Ring that trails on every page for no reason | Slop | Delete it, or reveal a cursor only over media (`data-cursor="view"`) |
| `mix-blend-mode: difference` cursor | Only on monochrome/editorial palettes | On colorful pages it produces random neon inversions |
| Magnetic on every button | Slop | 1-3 hero CTAs or icon buttons; never in forms or nav lists |
| Tilt on every card | Slop (top AI tell) | One hero object, <= 8 deg, glare subtle, no text-heavy cards |
| Spotlight grid | Good on dark marketing grids | Never stacked with tilt + border beams + shine on the same cards |
| Rotating gradient borders / shine sweeps everywhere | Slop | One marketing CTA per page, static on reduced motion |
| Text roll hover | Good for nav and primary CTA | Not on every inline link; keep 10-20 ms char stagger |
| Hover image reveal on a project index | Signature move when photography is strong | Works only if rows still read as links without hover |
| Image trail | Once per site | Hero or 404; disabled on touch and reduced motion |
| Bouncy springs in productivity UI | No | `bounce <= 0.2`; save bounce for drag release and playful toys |
| Animated command palette / context menus | No | Instant (Raycast has no open animation); list resize 100 ms is fine |
| Confetti | Rare wins only | First purchase, completed onboarding; never on routine saves |
| Shake | Wrong code/password only | Once, <= 6 px, plus a red message; never on field blur |
| Hover-only information | No | Anything that matters must be visible or reachable by tap/focus |
| Hover scale 1.05+ with growing shadow and lift | Dated | 1.02-1.04 or image-only zoom inside a fixed frame |

## Gotchas
- **GSAP overwrites your CSS hover transform.** GSAP writes the full inline `transform`; a `:hover { transform: scale(1.05) }` on the same node is lost. Use the individual `scale` / `translate` / `rotate` properties in CSS (they compose with `transform`) or give GSAP and CSS separate nested nodes (recipe 1).
- **Sticky hover on touch.** A tap leaves `:hover` applied. Gate hover motion with `@media (hover: hover) and (pointer: fine)` and JS pointer effects with `e.pointerType === "mouse"`.
- **Hydration mismatch from matchMedia at render.** Read media queries through `useSyncExternalStore` with a server snapshot (recipe 0) or inside effects; never at module scope.
- **Measuring the element that moves.** Magnetic/tilt code that calls `getBoundingClientRect()` on the moving element jitters at the edges; measure a static wrapper.
- **`position: fixed` stops being fixed** inside any ancestor with `transform`, `filter`, `perspective`, `contain: paint` or `will-change: transform` (ScrollSmoother content, a `motion.div` with `layout`). Portal cursor layers and hover previews to `document.body`.
- **Blend mode does nothing.** `mix-blend-mode` on a child of a z-indexed fixed wrapper blends only with that wrapper. Put the blend mode on the outermost fixed layer.
- **Stale hover after scroll.** When content scrolls under a still pointer, Chrome dispatches synthetic mouse events but Safari may not; for cursor labels/previews re-resolve with `document.elementFromPoint(lastX, lastY)` on `scroll` (throttled to rAF).
- **`AnimatePresence mode="popLayout"` with a custom component child** needs that component to forward its ref (React 19: accept `ref` as a prop and pass it to the DOM node), or the exit is not popped out of layout.
- **Radix exit animations never play with transitions.** Radix Presence waits for `animationend`; use `@keyframes` on `[data-state="closed"]`. Base UI uses `[data-starting-style]` / `[data-ending-style]` transitions instead.
- **Two tab sets share one indicator.** Duplicate `layoutId`s across instances make pills jump between components; derive them from `useId()` or wrap each in `<LayoutGroup id>`.
- **`transition: all`.** Animates padding/width/color you did not intend and causes layout thrash; list properties explicitly.
- **iOS `:active` does nothing** unless the page has a touch listener; register one passive `touchstart` listener at the root.
- **Safari drops `border-radius` clipping** on `overflow: hidden` frames while a child transforms; add `isolation: isolate` to the frame.
- **Native image drag ghost** hijacks custom drag: `draggable={false}` / `-webkit-user-drag: none` on images, `user-select: none` while dragging.
- **Pointer capture vs leave.** After `setPointerCapture`, `pointerleave` does not fire until release; do not capture on hold-to-confirm (sliding off must cancel), do capture on swipe/drag.
- **Second finger mid-drag** makes the element jump: ignore new pointers while `start.current` is set (recipe 10).
- **Scrolling vs dragging on touch.** Horizontal draggables need `touch-action: pan-y`; free-drag objects and handles need `touch-action: none`; never `none` on large regions (page stops scrolling).
- **`will-change` everywhere** eats GPU memory; keep it on continuously animated layers (cursor, trail images) only.
- **Motion `x`/`y` shorthands run on the main thread.** Fine for pointer-driven motion values; for large entrance animations under heavy JS load prefer CSS/WAAPI (Emil's note).
- **Spring defaults are bouncy.** `useSpring(x)` without options = stiffness 100 / damping 10: always pass a config.
- **Driving child styles via a CSS variable on a big parent** recalculates styles for every descendant each frame; set variables on the element that consumes them (recipe 7) or set `transform` directly (Vaul).
- **Clipboard writes fail** outside secure contexts, without a user gesture, or in cross-origin iframes; always `try/catch` and offer a manual fallback.
- **`canvas-confetti` `shapeFromPath`** needs `Path2D`/`DOMMatrix`: create shapes lazily in the click handler, not at module scope (SSR crash).
- **`inert` typing.** React 19 takes a boolean (`inert={!open}`); React 18 needed `inert=""`.
- **`interpolate-size` is Chromium-only** (129+) as of 2026-09; Firefox/Safari snap open. Use `grid-template-rows: 0fr -> 1fr` when the animation must work everywhere.
- **Vaul is unmaintained** (README note) though stable at 1.1.2; pin it, and test `shouldScaleBackground` with your `data-vaul-drawer-wrapper` element and iOS keyboard (`repositionInputs`).

## Sources
- https://emilkowal.ski/ui/building-a-toast-component
- https://emilkowal.ski/ui/building-a-drawer-component
- https://emilkowal.ski/ui/the-magic-of-clip-path
- https://emilkowal.ski/ui/developing-taste
- https://emilkowal.ski/ui/7-practical-animation-tips
- https://emilkowal.ski/ui/building-a-hold-to-delete-component
- https://github.com/emilkowalski/skills (skills/animate/RECIPES.md, skills/review-animations/STANDARDS.md)
- https://github.com/emilkowalski/vaul (README: unmaintained notice)
- https://rauno.me/craft/interaction-design
- https://github.com/vercel-labs/web-interface-guidelines
- https://gsap.com/docs/v3/GSAP/gsap.quickTo()/
- https://gsap.com/docs/v3/Plugins/Draggable/
- https://gsap.com/docs/v3/Plugins/InertiaPlugin/
- @gsap/react 2.1.2 README and types; gsap 3.15.0 `types/Draggable.d.ts`, `types/gsap-core.d.ts` (npm)
- https://motion.dev/docs/react-use-spring
- https://motion.dev/docs/react-drag
- https://motion.dev/docs/react-reorder
- https://motion.dev/docs/react-layout-animations
- motion 13.4.4 / motion-dom type definitions (spring defaults, `dragElastic` 0.5, decay `power` 0.8 / `timeConstant` 700, `ReorderAxis` "xy") (npm)
- sonner 2.0.8 source (`GAP`, `SWIPE_THRESHOLD`, velocity 0.11, dampening), vaul 1.1.2 source (`VELOCITY_THRESHOLD` 0.4, `CLOSE_THRESHOLD` 0.25, `dampenValue`, transition curve), cmdk 1.1.1 (`--cmdk-list-height`, `cmdk-*` attributes), @number-flow/react 0.6.2 types, @types/canvas-confetti 1.9 (npm)
- https://github.com/radix-ui/primitives/blob/main/packages/react/tooltip/src/tooltip.tsx (delayDuration 700, skipDelayDuration 300, delayed-open / instant-open)
- https://github.com/codrops/ImageTrailEffects (js/demo.js)
- https://github.com/codrops/MagneticButtons (src/js/demo1/buttonCtrl.js, src/js/cursor.js)
- https://github.com/codrops/ImageRevealHover
- https://github.com/Cuberto/mouse-follower (README defaults)
- https://github.com/olivierlarose/mouse-hover-project-gallery (src/components/modal/index.jsx)
- https://blog.olivierlarose.com/tutorials/magnetic-button
- https://blog.olivierlarose.com/tutorials/awwwards-landing-page
- https://blog.olivierlarose.com/tutorials/mouse-image-gallery
- https://github.com/magicuidesign/magicui (apps/www/registry/magicui/magic-card.tsx, dock.tsx)
- https://github.com/DavidHDev/react-bits (TiltedCard, GlareHover, ElasticSlider)
- https://github.com/mdn/browser-compat-data (interpolate-size, ::details-content, anchor-name, position-try-fallbacks, mask-composite, @starting-style, transition-behavior, popover, interestfor, linear(), @property, :has, text-decoration-thickness, clipboard writeText)
- https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size
- https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite
- https://css-tricks.com/link-underlines-that-animate-into-block-backgrounds/
- https://dev.to/anmolbaranwal/yay-i-created-my-first-portfolio-375/comments (practitioner feedback: "Don't touch scroll. Don't touch the cursor", cursor making the page feel laggy)
- https://lists.w3.org/Archives/Public/public-css-archive/2025Oct/0604.html (CSSWG: OS cursor-size settings not honored by custom cursors)
