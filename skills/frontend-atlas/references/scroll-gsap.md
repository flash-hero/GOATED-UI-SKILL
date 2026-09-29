# Scroll Choreography with GSAP ScrollTrigger + Lenis
> Load when: any JS-driven scroll effect: smooth scroll, reveals on enter, pinning, scrubbed timelines, horizontal galleries, stacked cards, SplitText on scroll, parallax, velocity effects, Flip-on-scroll, video/image-sequence scrubbing, full-screen slide sections.
> Stack assumptions: gsap 3.15 (all plugins free and in the public `gsap` package), @gsap/react 2.1.2 (`useGSAP`), lenis 1.3.26 (`lenis`, `lenis/react`), React 19 / Next 16 App Router + TS. Vanilla variants for setup and the key recipes. For pure-CSS `animation-timeline: scroll()/view()` see `scroll-css-native.md`; for easing/duration taste see `motion-principles.md`; for text-split aesthetics beyond scroll see `text-effects.md`.

## Contents
- [Decision guide](#decision-guide)
- [1. Setup and Lenis sync](#1-setup-and-lenis-sync)
- [2. useGSAP patterns](#2-usegsap-patterns)
- [3. Batch reveal on enter](#3-batch-reveal-on-enter)
- [4. SplitText line-mask reveal](#4-splittext-line-mask-reveal)
- [5. Text fills as you scroll](#5-text-fills-as-you-scroll)
- [6. Pinned hero zoom and clip expansion](#6-pinned-hero-zoom-and-clip-expansion)
- [7. Pinned multi-step timeline with label snap](#7-pinned-multi-step-timeline-with-label-snap)
- [8. Horizontal scroll gallery](#8-horizontal-scroll-gallery)
- [9. Stacked cards](#9-stacked-cards)
- [10. Sticky split layout](#10-sticky-split-layout)
- [11. Parallax layers](#11-parallax-layers)
- [12. Clip-path image reveals](#12-clip-path-image-reveals)
- [13. Scroll-velocity skew and marquee](#13-scroll-velocity-skew-and-marquee)
- [14. Progress bar, active nav, theme per section](#14-progress-bar-active-nav-theme-per-section)
- [15. Observer full-screen slides](#15-observer-full-screen-slides)
- [16. Flip hero-to-grid on scroll](#16-flip-hero-to-grid-on-scroll)
- [17. Scroll-scrubbed video and image sequence](#17-scroll-scrubbed-video-and-image-sequence)
- [18. Counters and SVG path draw](#18-counters-and-svg-path-draw)
- [19. matchMedia responsive and reduced motion](#19-matchmedia-responsive-and-reduced-motion)
- [20. Refresh discipline and ScrollTrigger config](#20-refresh-discipline-and-scrolltrigger-config)
- [Famous effects index](#famous-effects-index)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide

First question: does it need JS at all? A fade/slide on enter or a progress bar can be CSS `animation-timeline: view()` (see `scroll-css-native.md`). Reach for GSAP when you need pinning, a multi-step timeline, snapping, velocity, Flip, canvas/video scrubbing, or cross-browser certainty.

| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| "Expensive" inertial scroll feel | Lenis on GSAP ticker, lerp 0.08-0.12 | ~5 kb JS, main thread | [1](#1-setup-and-lenis-sync) |
| Cards/tiles rise in as they enter | `ScrollTrigger.batch` + `once` | GSAP core+ST ~45 kb gz total, transform/opacity only | [3](#3-batch-reveal-on-enter) |
| Editorial headline reveals line by line | SplitText `mask:"lines"` + `autoSplit` | +~6 kb, DOM split | [4](#4-splittext-line-mask-reveal) |
| Manifesto paragraph "reads itself" | Scrubbed word opacity stagger | cheap (opacity) | [5](#5-text-fills-as-you-scroll) |
| Hero media shrinks into a frame / expands to fullscreen | Pin + scrub `clipPath: inset()` + inner scale | clip-path repaint per frame on 1 layer: OK | [6](#6-pinned-hero-zoom-and-clip-expansion) |
| Story in N steps inside one screen | Pinned timeline + labels + `snap:"labelsDirectional"` | cheap if transforms | [7](#7-pinned-multi-step-timeline-with-label-snap) |
| Sideways gallery driven by vertical scroll | Pin + `x` tween + `containerAnimation` | cheap; native swipe on mobile | [8](#8-horizontal-scroll-gallery) |
| Feature cards pile up like a deck | CSS sticky + scrub scale, or full pin | CSS sticky version is cheapest | [9](#9-stacked-cards) |
| Scrollytelling: text left, media swaps right | CSS sticky + `onToggle` crossfade | cheap | [10](#10-sticky-split-layout) |
| Depth, layers moving at different speeds | ScrollTrigger `y` scrub per `[data-speed]`, or ScrollSmoother | cheap (transform) | [11](#11-parallax-layers) |
| Image unveils like a curtain/iris | `clipPath` inset/circle tween | paint per frame, small areas fine | [12](#12-clip-path-image-reveals) |
| Content reacts to scroll speed | `getVelocity()` + quickSetter skew; ticker marquee | cheap | [13](#13-scroll-velocity-skew-and-marquee) |
| Reading progress, active nav, dark/light sections | ST `onUpdate` scaleX, `onToggle`, CSS var theme | cheap | [14](#14-progress-bar-active-nav-theme-per-section) |
| One screen = one slide (showcase intro) | Observer + timeline gotoSection | cheap, but scroll-jacking | [15](#15-observer-full-screen-slides) |
| Hero element flies into a grid slot | `Flip.fit` inside scrubbed timeline | cheap (transform) | [16](#16-flip-hero-to-grid-on-scroll) |
| Product rotates/assembles as you scroll (Apple) | Canvas image sequence, or keyframe-dense video | heavy network (3-15 MB) | [17](#17-scroll-scrubbed-video-and-image-sequence) |
| Stats count up, lines draw themselves | Tween object -> textContent; DrawSVG / `pathLength=1` | trivial | [18](#18-counters-and-svg-path-draw) |
| Different choreography per breakpoint / reduced motion | `gsap.matchMedia()` | none | [19](#19-matchmedia-responsive-and-reduced-motion) |

Taste rules that separate premium from template:
- One signature scroll moment per page (a pin, a hero zoom, a sequence). Everything else is quiet reveals. Five pinned sections in a row is the #1 "AI portfolio" tell, next to "every element fades up 40px".
- Reveals: travel 24-60 px (or 100%+ inside a mask), 0.8-1.2 s, `expo.out`/`power3.out`, stagger 0.05-0.1. Never bounce/elastic on scroll content.
- Scrubbed motion is linear (`ease:"none"`); the scroll wheel is the easing. With Lenis active use `scrub: true` (Lenis already smooths); without Lenis use `scrub: 0.5-1`.
- Pins must earn their scroll distance: roughly 100vh of scroll per meaningful state change. A 400vh pin with one scale tween feels broken.

## Recipes

### 1. Setup and Lenis sync
**Looks like:** Wheel scrolling glides to a stop with a slight inertia (Darkroom/Studio Freight, most Awwwards SOTDs); every ScrollTrigger reads the smoothed position in the same frame, so pins never jitter.  
**Use when / avoid when:** Marketing, portfolio, editorial pages with scroll choreography. Avoid on apps/dashboards/docs, long-form reading where users use Find/scrollbar a lot, and pages with many nested scroll areas. Lenis keeps native scroll (scrollbar, keyboard, Find in page, `position: sticky` all work); it only eases wheel input. Do not combine with ScrollSmoother or `ScrollTrigger.normalizeScroll()`.  
**Stack:** GSAP + Lenis

Install:
```bash
npm i gsap @gsap/react lenis
```

`src/lib/gsap.ts` - the only place plugins are registered. Import it only from `"use client"` files (never from a Server Component).
```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

/** Motion tokens. Mirror of the CSS custom properties in globals.css. */
export const EASE = {
  out: "expo.out", // entrances/reveals  == cubic-bezier(0.16, 1, 0.3, 1)
  inOut: "power3.inOut", // slides/section swaps == cubic-bezier(0.65, 0, 0.35, 1)
  scrub: "none", // anything driven by scroll position
} as const;
export const DUR = { fast: 0.35, base: 0.8, slow: 1.2 } as const;
export const STAGGER = { tight: 0.04, base: 0.08, loose: 0.14 } as const;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin, useGSAP);
  gsap.defaults({ ease: EASE.out, duration: DUR.base });
  // Touch-only devices: ignore address-bar show/hide resizes (<25% of height). 3.15 already
  // defaults this on for touch-only devices; setting it documents intent.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin, useGSAP };
```
Because `gsap.defaults` sets `expo.out`, every scrubbed tween/timeline below explicitly sets `ease: "none"`. Forgetting that makes scrub feel "rubbery" at the start of each segment.

`src/app/globals.css` (tokens + the one CSS rule that breaks everything if missing):
```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 350ms;
  --dur-base: 800ms;
  --dur-slow: 1200ms;
}
/* Never smooth: CSS smooth scrolling fights Lenis and corrupts ScrollTrigger.refresh() measurements.
   (Remove Tailwind's `scroll-smooth` class from <html> too.) */
html { scroll-behavior: auto !important; }
/* Pre-hide below-the-fold reveal targets only when JS runs and motion is allowed (no flash, no
   invisible content if JS fails). Never put the LCP element/hero heading in here. */
@media (prefers-reduced-motion: no-preference) {
  .js [data-reveal] { opacity: 0; }
}
```

`src/components/scroll/SmoothScroll.tsx` - ReactLenis driven by `gsap.ticker` (one rAF loop), ScrollTrigger updated from Lenis' scroll event:
```tsx
"use client";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import type { LenisOptions } from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Module constant: ReactLenis re-creates the instance when JSON.stringify(options) changes.
const LENIS_OPTIONS: LenisOptions = {
  autoRaf: false, // GSAP ticker drives Lenis. Two rAF loops = 1-frame lag = jittery pins.
  lerp: 0.1, // 0.07-0.09 heavy/luxury, 0.1 default premium, 0.12-0.15 crisp. Frame-rate independent.
  wheelMultiplier: 1, // 0.8-1; >1 feels cheap and overshoots sections
  touchMultiplier: 1,
  syncTouch: false, // keep native momentum on phones (smoothed touch feels laggy, iOS<16 buggy)
  anchors: true, // same-page <a href="#id"> goes through Lenis, honours CSS scroll-margin-top
  stopInertiaOnNavigate: true, // clicking a link to another route kills leftover momentum
  // respectReducedMotion defaults to true: lerp forced to 1 and scrollTo becomes instant.
};

function ScrollTriggerBridge() {
  useLenis(ScrollTrigger.update); // ScrollTrigger recalculates in the same frame Lenis scrolls
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const tick = (time: number) => lenisRef.current?.lenis?.raf(time * 1000); // ticker time is seconds
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0); // never "catch up" after a long frame: scroll must map 1:1 to time
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP default
    };
  }, []);

  return (
    <ReactLenis root options={LENIS_OPTIONS} ref={lenisRef}>
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
```

`src/app/layout.tsx` (or `app/[locale]/layout.tsx`):
```tsx
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint: enables the .js pre-hide rule above */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
```

Anchor links and fixed header offset: use a plain `<a href="#work">` (not `next/link`, whose own hash scroll jumps instantly and races Lenis) and put the offset in CSS, which Lenis reads:
```css
section[id] { scroll-margin-top: 5rem; } /* height of the fixed header + breathing room */
```
Programmatic: `lenis.scrollTo("#work", { offset: 0, duration: 1.2 })`, `lenis.scrollTo(0, { immediate: true })`, `lenis.scrollTo(el, { lock: true })` (user input ignored until arrival).

Stopping Lenis for modals / menus / drawers:
```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import { useLenis } from "lenis/react";

export function Modal({ open, children }: { open: boolean; children: ReactNode }) {
  const lenis = useLenis();
  useEffect(() => {
    if (!open || !lenis) return;
    lenis.stop(); // adds .lenis-stopped -> html { overflow: clip } via lenis.css
    return () => lenis.start();
  }, [open, lenis]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 grid place-items-center">
      {/* Inner scroll areas must opt out or wheel events get eaten */}
      <div data-lenis-prevent className="max-h-[80svh] overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}
```
Other opt-outs: `data-lenis-prevent-wheel`, `-touch`, `-vertical`, `-horizontal`, or `prevent: (node) => node.closest("[data-scroll-area]") !== null` in options. `allowNestedScroll: true` auto-detects but walks the DOM on every wheel event.

Vanilla (no React):
```ts
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: 0.1, anchors: true, stopInertiaOnNavigate: true }); // autoRaf false by default
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```
**Tune:** `lerp` 0.07-0.12 (lower = heavier). `duration` + `easing` replaces lerp entirely (duration-based feels more "designed" but less responsive; `duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))` is the classic). `wheelMultiplier` 0.8-1.  
**A11y/perf:** Lenis honours `prefers-reduced-motion` by default (1:1 scroll, instant programmatic jumps). Keep `syncTouch: false` so phones keep native scrolling. Safari caps Lenis at 60 fps (30 in Low Power Mode). Iframes: wheel over an iframe is not smoothed (lenis.css sets `pointer-events: none` on iframes while smooth-scrolling).

### 2. useGSAP patterns
**Looks like:** Nothing visible; this is what keeps triggers from duplicating, leaking across routes, or crashing on unmount.  
**Use when / avoid when:** Every GSAP-in-React component. Never `useEffect` + raw `gsap.to` without `gsap.context` cleanup.  
**Stack:** GSAP + React

What `useGSAP` actually does (read from @gsap/react 2.1.2 source): creates one `gsap.context` scoped to `scope`, runs your callback in a layout effect (effect on the server), and calls `context.revert()` on unmount. With `dependencies` but WITHOUT `revertOnUpdate: true`, a dependency change re-runs your callback INTO THE SAME CONTEXT without reverting, so every ScrollTrigger is created again on top of the old one.

```tsx
"use client";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE, DUR, STAGGER } from "@/lib/gsap";

type Props = { items: { id: string; title: string }[] };

export function Showcase({ items }: Props) {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<"all" | "featured">("all");
  const visible = filter === "all" ? items : items.slice(0, 3);

  // A) Mount-only: selector text is scoped to root, everything auto-reverts on unmount.
  useGSAP(
    () => {
      gsap.from(".showcase__title", {
        yPercent: 100,
        duration: DUR.slow,
        ease: EASE.out,
        scrollTrigger: { trigger: ".showcase__title", start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  // B) Rebuild when the rendered list changes: revertOnUpdate is REQUIRED for ScrollTriggers.
  useGSAP(
    () => {
      gsap.from(".showcase__card", {
        y: 40,
        autoAlpha: 0,
        stagger: STAGGER.base,
        scrollTrigger: { trigger: ".showcase__grid", start: "top 80%" },
      });
      ScrollTrigger.refresh(); // list height changed: re-measure everything below
    },
    { scope: root, dependencies: [visible.length], revertOnUpdate: true },
  );

  // C) Animations created later (events, timeouts) must be contextSafe or they leak.
  const { contextSafe } = useGSAP({ scope: root });
  const onEnter = contextSafe((e: React.PointerEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { scale: 1.02, duration: DUR.fast, ease: EASE.out, overwrite: "auto" });
  });
  const onLeave = contextSafe((e: React.PointerEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: DUR.fast, ease: EASE.out, overwrite: "auto" });
  });

  // D) Manual listeners: add inside useGSAP, wrap with contextSafe, remove in the returned cleanup.
  useGSAP(
    (_ctx, safe) => {
      const onKey = safe!((e: KeyboardEvent) => {
        if (e.key === "f") gsap.to(".showcase__grid", { autoAlpha: 0.5, yoyo: true, repeat: 1, duration: DUR.fast });
      });
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="showcase">
      <h2 className="overflow-clip"><span className="showcase__title inline-block">Selected work</span></h2>
      <button onClick={() => setFilter(filter === "all" ? "featured" : "all")}>Toggle</button>
      <ul className="showcase__grid">
        {visible.map((it) => (
          <li key={it.id} className="showcase__card" onPointerEnter={onEnter} onPointerLeave={onLeave}>
            {it.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
```
Route changes: App Router unmounts (or, with `cacheComponents`, hides via React `<Activity>`) the old page; either way layout effects clean up, so `useGSAP` reverts its ScrollTriggers and pin-spacers. Never create ScrollTriggers at module scope or store them in globals.  
**Tune:** Put one `useGSAP` per concern; pass `scope` always; `dependencies` + `revertOnUpdate: true` whenever the callback creates ScrollTriggers.  
**A11y/perf:** Wrap motion in `gsap.matchMedia()` (recipe 19) inside the hook; `mm` created inside `useGSAP` is reverted with the context.

### 3. Batch reveal on enter
**Looks like:** Cards in a grid rise 40 px and fade in row by row as they enter, with a tight stagger that groups items entering on the same frame (instead of each card firing alone).  
**Use when / avoid when:** Grids, lists, logo walls, blog cards. Avoid on the hero and the LCP element (animate those on load, not scroll), and avoid on every paragraph of body copy: the "everything fades up" page is the most common AI-slop tell. Reveal groups, not atoms.  
**Stack:** GSAP ScrollTrigger

```tsx
"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE, DUR, STAGGER } from "@/lib/gsap";

export function RevealGrid({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.set(items, { y: 40 }); // opacity 0 already applied by the .js CSS rule (no flash)
        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true, // reveal once, never re-hide
          interval: 0.1, // collect items entering within 100ms into one batch
          batchMax: 4, // at most one row at a time on a 4-col grid
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: DUR.base + 0.2,
              ease: EASE.out,
              stagger: STAGGER.base,
              overwrite: true,
            }),
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-reveal]", { autoAlpha: 1 }); // static end state
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {children /* each card: <article data-reveal> ... */}
    </div>
  );
}
```
Vanilla: identical body inside `document.addEventListener("DOMContentLoaded", ...)` with `gsap.registerPlugin(ScrollTrigger)`.  
**Tune:** `y` 24-60 px (bigger for bigger cards); duration 0.8-1.2; stagger 0.05-0.12; `start` "top 85-92%". For a "reversible" feel drop `once` and add `onLeaveBack: b => gsap.to(b, { autoAlpha: 0, y: 40, overwrite: true })`.  
**A11y/perf:** Only transform + opacity. `autoAlpha` also toggles `visibility`, so hidden cards are not focus-clickable. Reduced motion: shown immediately. Batch excludes `scrub`, `snap`, `toggleActions`, `animation`, `trigger`.

### 4. SplitText line-mask reveal
**Looks like:** A headline's lines slide up from behind invisible masks, one after another (every Awwwards SOTD heading; Locomotive, Obys, Cuberto).  
**Use when / avoid when:** Display headings (h1-h3), pull quotes, section intros; max 2-4 per page. Avoid on body paragraphs (long waits to read) and on text that changes via React state.  
**Stack:** GSAP SplitText (3.13+ API)

```tsx
"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, EASE, DUR } from "@/lib/gsap";

type Props = { as?: ElementType; children: ReactNode; className?: string };

export function LineReveal({ as: Tag = "h2", children, className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(el, {
          type: "lines", // split only what you animate
          mask: "lines", // wraps each line in a div.line-mask { overflow: clip }
          linesClass: "line",
          autoSplit: true, // re-split on font load and on width change (lines only)
          aria: "auto", // aria-label on el, aria-hidden on the pieces (fine for headings)
          onSplit(self) {
            // RETURN the tween: SplitText reverts it before re-splitting and restores its progress.
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: DUR.slow,
              ease: EASE.out,
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(el, { autoAlpha: 0, duration: DUR.base, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
```
```css
/* Masks clip descenders (g, y, p) when line-height < ~1.15. Give the mask room, then cancel it. */
.line-mask { padding-bottom: 0.12em; margin-bottom: -0.12em; }
/* Split elements: kerning across split boundaries shifts glyphs; balance fights line splitting. */
[data-split], .line { font-kerning: none; text-wrap: wrap; }
```
Vanilla: same `SplitText.create(...)` after `gsap.registerPlugin(SplitText, ScrollTrigger)`; without `autoSplit`, wrap in `document.fonts.ready.then(() => ...)`.  
Char variant (for short display words): `type: "words,chars"`, `mask: "chars"`, animate `self.chars` with `yPercent: 100, stagger: 0.02` (0.015-0.03). Word variant: `type: "words"`, `mask: "words"`, stagger 0.04-0.06.  
**Tune:** `yPercent` 100-120 (masked), duration 0.9-1.3, stagger 0.06-0.12 for lines. Add `rotate: 2-4` with `transformOrigin: "0% 100%"` for a subtle tilt-up. `start` "top 80-90%".  
**A11y/perf:** `aria: "auto"` puts `aria-label` on the split element. That is only reliable on elements with a role that allows naming (headings, links, buttons). On `<p>`/`<div>` (generic role) `aria-label` is prohibited in ARIA 1.2 and often ignored, while the children are `aria-hidden`, so screen readers may read NOTHING. For paragraphs use `aria: "hidden"` plus a visually-hidden copy: `<p><span className="sr-only">{text}</span><span aria-hidden data-split>{text}</span></p>`. Never split text React will re-render (see Gotchas).

### 5. Text fills as you scroll
**Looks like:** A large paragraph starts at 15-20% opacity; as you scroll, words light up one after another as if being read aloud (Apple product "manifesto" blocks, countless SaaS about sections; Olivier Larose's "text gradient opacity" tutorial).  
**Use when / avoid when:** One statement paragraph of 20-60 words set at 32-64 px. Avoid for long body copy, and do not combine with a pinned section that also moves other things.  
**Stack:** GSAP SplitText + ScrollTrigger scrub

```tsx
"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export function ScrollFillText({ text, pin = false }: { text: string; pin?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const target = root.current?.querySelector<HTMLElement>("[data-split]");
      if (!target) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(target, {
          type: "words",
          tag: "span", // default wrapper is <div>: invalid inside <p>/<span>
          aria: "hidden", // sr-only copy below carries the text
          onSplit(self) {
            return gsap.fromTo(
              self.words,
              { opacity: 0.15 },
              {
                opacity: 1,
                ease: "none",
                duration: 0.4, // per-word fade length relative to stagger
                stagger: 0.1,
                scrollTrigger: pin
                  ? { trigger: root.current, start: "top top", end: "+=150%", pin: true, scrub: true }
                  : { trigger: target, start: "top 75%", end: "bottom 45%", scrub: true },
              },
            );
          },
        });
      });
    },
    { scope: root, dependencies: [text], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="mx-auto max-w-[22ch] py-[20vh] text-[clamp(2rem,4.5vw,4rem)] leading-[1.1]">
      <p>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true" data-split>
          {text}
        </span>
      </p>
    </div>
  );
}
```
Char-level variant: `type: "words,chars"` (words keep chars from wrapping mid-word), animate `self.chars` with `duration: 0.2, stagger: 0.02`. Color variant: tween `color` from `var(--fg-muted)` to `var(--fg)` resolved to real colors (e.g. `"#5b5b5b"` -> `"#f2f2f2"`) for a "ink" look; costs paint per word, fine for <200 words. Highlight-marker variant (background-size sweep per word) lives in `text-effects.md`.  
**Tune:** Start opacity 0.1-0.25 (below 0.1 the paragraph looks empty; above 0.3 the effect vanishes). `duration/stagger` ratio = how many words are mid-fade at once: 4 soft gradient (default), 1-2 crisp word-by-word, 10 slow wash. Unpinned `end` "bottom 40-55%" so the last word finishes while still readable. Pinned `end` +=100-200%.  
**A11y/perf:** sr-only copy is the accessible text. Reduced motion: no split, text at full opacity. Opacity only, cheap even at 300 words.

### 6. Pinned hero zoom and clip expansion
**Looks like:** (a) A full-bleed hero image pulls back into a rounded card with margins while the headline lifts away and a caption arrives; (b) the reverse: a small rounded media card grows to fill the screen (Apple product pages, "video expands" sections on launch pages, Olivier Larose "zoom parallax").  
**Use when / avoid when:** The single signature moment right after the hero, or to introduce a showreel. Avoid stacking two of these back to back; avoid on text-first pages. Never scrub `width/height/top/left` for this: use `clip-path` or `scale`.  
**Stack:** GSAP ScrollTrigger (pin + scrub)

```tsx
"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function HeroZoom() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", small: "(max-width: 767px)" },
        (ctx) => {
          const { motion, small } = ctx.conditions as { motion: boolean; small: boolean };
          if (!motion) return;
          const endClip = small ? "inset(16% 5% 16% 5% round 16px)" : "inset(12% 20% 12% 20% round 28px)";
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "+=120%", // ~1.2 screens of scroll for one state change
                pin: true,
                scrub: true, // Lenis smooths; use 0.6 if no Lenis
                anticipatePin: 1,
              },
            })
            // Same function + same number of values on both ends, or GSAP cannot interpolate.
            .fromTo(".hero__frame", { clipPath: "inset(0% 0% 0% 0% round 0px)" }, { clipPath: endClip }, 0)
            .fromTo(".hero__media", { scale: 1.15 }, { scale: 1 }, 0) // content recedes = "zoom out"
            .to(".hero__title", { yPercent: -60, autoAlpha: 0 }, 0)
            .fromTo(".hero__caption", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.6);
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-svh overflow-clip bg-[var(--bg)]">
      <div className="hero__frame absolute inset-0 overflow-clip">
        <Image className="hero__media object-cover will-change-transform" src="/images/hero.jpg" alt="" fill priority sizes="100vw" />
      </div>
      <h1 className="hero__title relative z-10 grid h-full place-items-center text-[clamp(3rem,10vw,9rem)] leading-none text-white">
        Northlight
      </h1>
      <p className="hero__caption absolute inset-x-0 bottom-[5svh] z-10 text-center">Scroll to explore</p>
    </section>
  );
}
```
(b) Expand-to-fullscreen, same markup with the frame starting small:
```ts
gsap
  .timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: root.current, start: "top top", end: "+=150%", pin: true, scrub: true },
  })
  .fromTo(".expand__frame", { clipPath: "inset(22% 28% 22% 28% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)" }, 0)
  .fromTo(".expand__media", { scale: 1.3 }, { scale: 1 }, 0)
  .to(".expand__label", { autoAlpha: 0, duration: 0.3 }, 0);
```
Transform-only alternative (cheapest, for low-end targets): scale the frame itself `fromTo(frame, { scale: 0.55, borderRadius: 44 }, { scale: 1, borderRadius: 0 })`; the visual radius is borderRadius x scale, so start at desiredRadius / startScale.  
**Tune:** End inset 10-20% vertical / 15-25% horizontal on desktop, 4-6% horizontal on phones. Inner scale 1.1-1.3 (higher = more drama). Pin length +=100-150%. Round radius 16-32 px matching the site's card radius token.  
**A11y/perf:** Reduced motion: no pin, static hero. `clip-path` repaints the clipped layer each frame: fine for ONE full-bleed layer, janky if you also scrub `filter: blur()` on it or clip 10 images at once. Use `h-svh` (not `dvh`) on pinned sections so mobile address-bar changes do not resize them mid-scroll.

### 7. Pinned multi-step timeline with label snap
**Looks like:** A section locks to the screen; each scroll "notch" transitions to the next step (text swaps, media crossfades, a progress bar advances) and settles precisely on each step (feature walkthroughs on Apple, Stripe, Linear launch pages).  
**Use when / avoid when:** 3-5 steps that belong to one idea. Avoid for more than ~6 steps (users feel trapped), for content that must be skimmed, and for steps with long text (use recipe 10 instead).  
**Stack:** GSAP ScrollTrigger (pin + scrub + snap)

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STEPS = [
  { title: "Capture", body: "Every signal, one inbox.", src: "/images/step-1.jpg" },
  { title: "Understand", body: "Models that explain themselves.", src: "/images/step-2.jpg" },
  { title: "Act", body: "Ship the fix before the ticket.", src: "/images/step-3.jpg" },
];

export function StepsPinned() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".step");
        const media = gsap.utils.toArray<HTMLElement>(".step-media");
        gsap.set([...panels.slice(1), ...media.slice(1)], { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * (STEPS.length - 1) * 1.1,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            snap: {
              snapTo: "labelsDirectional", // always moves to the next/previous step in scroll direction
              duration: { min: 0.25, max: 0.7 },
              delay: 0.08,
              ease: "power2.inOut",
            },
          },
        });

        tl.addLabel("step-0");
        panels.forEach((panel, i) => {
          if (i === 0) return;
          tl.to({}, { duration: 0.35 }) // hold: lets the current step rest before moving on
            .to(panels[i - 1], { autoAlpha: 0, yPercent: -30 })
            .fromTo(panel, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0 }, "<")
            .to(media[i - 1], { autoAlpha: 0, scale: 1.04 }, "<")
            .fromTo(media[i], { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1 }, "<")
            .to(".steps__bar", { scaleX: i / (STEPS.length - 1) }, "<")
            .addLabel(`step-${i}`); // LAST label must sit at the very end of the timeline (see Tune)
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative grid h-svh grid-cols-1 items-center gap-8 px-[5vw] md:grid-cols-2">
      <div className="relative h-[40svh]">
        {STEPS.map((s, i) => (
          <article key={s.title} className="step absolute inset-0 flex flex-col justify-center">
            <p className="text-sm tabular-nums opacity-60">0{i + 1} / 0{STEPS.length}</p>
            <h3 className="text-[clamp(2rem,4vw,3.5rem)] leading-tight">{s.title}</h3>
            <p className="max-w-[36ch] opacity-80">{s.body}</p>
          </article>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-px bg-current/20">
          <div className="steps__bar h-full origin-left scale-x-0 bg-current" />
        </div>
      </div>
      <div className="relative aspect-[4/5] overflow-clip rounded-3xl">
        {STEPS.map((s) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s.src} className="step-media absolute inset-0 h-full w-full object-cover" src={s.src} alt="" />
        ))}
      </div>
    </section>
  );
}
```
Lenis-friendly manual snap (use instead of `snap` if ScrollTrigger's snap tween and Lenis inertia visibly fight). Remove the `snap` object, import `ScrollTrigger` from `@/lib/gsap` and `useLenis` from `lenis/react`, and read Lenis through a ref (`const lenis = useLenis(); const lenisRef = useRef(lenis); useEffect(() => { lenisRef.current = lenis; }, [lenis]);`). Do NOT add `lenis` to the useGSAP `dependencies`: it changes from undefined to the instance right after mount, and `revertOnUpdate` would re-create this pin after the triggers below it were measured (see the out-of-order gotcha). Then add inside the same `mm.add` callback:
```ts
const st = tl.scrollTrigger!;
const labels = Object.keys(tl.labels);
const onScrollEnd = () => {
  if (!st.isActive) return;
  const y = window.scrollY;
  const nearest = labels
    .map((l) => st.labelToScroll(l))
    .reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
  if (Math.abs(nearest - y) > 2) lenisRef.current?.scrollTo(nearest, { duration: 0.6 });
};
ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
return () => ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
```
**Tune:** Scroll per step 0.8-1.2 x viewport height. Hold 0.25-0.5 (timeline units) before each transition. Snap `duration {min 0.2-0.3, max 0.6-0.9}`, `delay` 0.05-0.15. Do not add a tail after the last label: in 3.15 source, `labelsDirectional` returns the last label when scrolling down past it, so any tail region snaps the user BACK and they feel stuck.  
**A11y/perf:** Reduced motion: render steps as a normal vertical list (nothing hidden). Inactive steps are `visibility: hidden` via autoAlpha, so screen readers skip them while pinned; the static reduced-motion layout guarantees full content.

### 8. Horizontal scroll gallery
**Looks like:** Vertical scrolling slides a row of large project cards sideways while the section is pinned; images inside each card parallax and titles reveal as each card enters horizontally (agency portfolios, Awwwards "work" sections).  
**Use when / avoid when:** 4-10 visual items where the sideways motion itself is the point. Avoid for lists users need to compare, text-heavy cards, or more than ~12 items. On touch devices use native horizontal swipe with scroll-snap instead of converting vertical scroll.  
**Stack:** GSAP ScrollTrigger (pin + `containerAnimation`) + CSS scroll-snap fallback

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";

type Item = { id: string; title: string; src: string };

export function HorizontalGallery({ items }: { items: Item[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // useLenis() is undefined on the first render and the instance a tick later. Never make it a useGSAP
  // dependency: revertOnUpdate would re-create this pin AFTER the sections below have measured their
  // triggers, and every trigger below would fire early by the pin length. Read it through a ref instead.
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => { lenisRef.current = lenis; }, [lenis]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;

        const scrollTween = gsap.to(el, {
          x: () => -distance(),
          ease: "none", // REQUIRED for containerAnimation
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + distance(), // 1px vertical = 1px horizontal
            pin: true,
            scrub: true,
            invalidateOnRefresh: true, // re-run the function values on resize
            anticipatePin: 1,
          },
        });

        gsap.utils.toArray<HTMLElement>(".hcard").forEach((card) => {
          // Image parallax inside each card, measured along the horizontal travel.
          gsap.fromTo(
            card.querySelector(".hcard__img"),
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
          // Title reveal when the card is 70% into view horizontally.
          gsap.from(card.querySelector(".hcard__title"), {
            yPercent: 100,
            duration: 0.9,
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: "left 70%",
              toggleActions: "play none none reverse",
            },
          });
        });

        // Keyboard users: tabbing to an off-screen card must scroll the page to where it is visible.
        const st = scrollTween.scrollTrigger!;
        const onFocus = (e: FocusEvent) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>(".hcard");
          if (!card) return;
          const ratio = gsap.utils.clamp(0, 1, (card.offsetLeft - window.innerWidth * 0.1) / distance());
          const y = st.start + ratio * (st.end - st.start);
          if (lenisRef.current) lenisRef.current.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        };
        el.addEventListener("focusin", onFocus);
        return () => el.removeEventListener("focusin", onFocus);
      });
    },
    { scope: root, dependencies: [items.length], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="relative overflow-clip md:h-svh">
      <h2 className="px-[5vw] pt-[8svh] text-[clamp(2rem,5vw,4.5rem)]">Selected work</h2>
      {/* Mobile: native swipe + snap. Desktop: overflow visible, moved by GSAP. */}
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[5vw] py-[6svh] md:w-max md:snap-none md:overflow-visible"
      >
        {items.map((it) => (
          <a key={it.id} href={`/work/${it.id}`} className="hcard relative block w-[80vw] shrink-0 snap-start md:w-[42vw]">
            <div className="aspect-[4/5] overflow-clip rounded-2xl">
              {/* 120% wide, shifted -10%: room for +-8% parallax without exposing edges */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hcard__img h-full w-[120%] max-w-none -ml-[10%] object-cover" src={it.src} alt="" />
            </div>
            <div className="overflow-clip">
              <h3 className="hcard__title mt-4 text-2xl">{it.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
```
Vanilla: same body with `document.querySelector` for root/track, wrapped in the same `gsap.matchMedia()`.  
Fixed-count variant (equal 100vw panels): `xPercent: -100 * (panels.length - 1)` on the track and `end: () => "+=" + track.offsetWidth`.  
**Tune:** Scroll distance 1:1 with travel feels natural; multiply `distance()` by 1.2-1.5 in `end` for a slower, heavier gallery. Card width 35-50vw desktop. Inner image parallax +-6-10% (keep inside the 120% image width). `scrub: true` with Lenis, 0.5-1 without.  
**A11y/perf:** `containerAnimation` requires the container tween to be `ease: "none"`; triggers inside it cannot pin or snap, and use `left/right` keywords. Links stay real `<a>` elements; the focus handler keeps them visible. Reduced motion or <768px: native horizontal scroll, nothing converted.

### 9. Stacked cards
**Looks like:** Feature cards stick near the top one after another; each new card slides over the previous one, which shrinks slightly and darkens so the stack reads like a deck (Darkroom-style feature stacks, countless 2024-2026 SaaS "how it works" sections).  
**Use when / avoid when:** 3-6 cards of equal importance with a strong visual each. Avoid when cards have long content (the covered card becomes unreadable), and skip rotation/3D tilt on top (reads as template).  
**Stack:** CSS sticky + GSAP scrub (version A, preferred); full GSAP pin (version B)

Version A: CSS does the stacking, GSAP only scales/dims covered cards.
```tsx
"use client";
import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Card = { id: string; title: string; body: string; bg: string };

export function StackedCards({ cards }: { cards: Card[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const els = gsap.utils.toArray<HTMLElement>(".stack__card");
        const last = els[els.length - 1];
        els.forEach((card, i) => {
          if (i === els.length - 1) return;
          const depth = els.length - 1 - i; // how many cards will end up on top of this one
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: els[i + 1], // starts when the next card enters
                start: "top bottom",
                endTrigger: last, // keeps shrinking until the last card lands
                end: () => `top ${parseFloat(getComputedStyle(last).top)}px`, // last card's sticky top
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
            .to(card.querySelector(".stack__inner"), { scale: 1 - depth * 0.04 }, 0)
            .to(card.querySelector(".stack__shade"), { opacity: Math.min(0.12 * depth, 0.5) }, 0);
        });
      });
    },
    { scope: root, dependencies: [cards.length], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="stack">
      {cards.map((c, i) => (
        <article key={c.id} className="stack__card" style={{ "--i": i } as CSSProperties}>
          <div className="stack__inner" style={{ background: c.bg }}>
            <h3 className="text-[clamp(1.75rem,3vw,3rem)]">{c.title}</h3>
            <p className="max-w-[40ch] opacity-80">{c.body}</p>
            <div className="stack__shade" aria-hidden="true" />
          </div>
        </article>
      ))}
    </section>
  );
}
```
```css
.stack {
  --stack-top: 10svh; /* where the first card sticks */
  --stack-step: 1.25rem; /* visible sliver of each covered card */
  display: grid;
  gap: 10svh;
  padding: 10svh 5vw 30svh;
}
.stack__card {
  position: sticky; /* works with Lenis (native scroll); does NOT work inside ScrollSmoother */
  top: calc(var(--stack-top) + var(--i) * var(--stack-step));
  height: 75svh;
}
.stack__inner {
  position: relative;
  height: 100%;
  padding: clamp(1.5rem, 4vw, 3.5rem);
  border-radius: 28px;
  overflow: clip;
  transform-origin: 50% 0%; /* shrink toward the top so the sliver stays aligned */
}
.stack__shade { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
```
Version B: full pin; all cards share one grid cell (still in document flow, no absolute math):
```ts
// markup: <section ref={root} className="grid h-svh place-items-center">
//   <div className="grid w-[min(90vw,1100px)]">
//     {cards.map(c => <article className="deck__card relative [grid-area:1/1] h-[75svh] overflow-clip rounded-3xl">
//       ...<div className="deck__shade absolute inset-0 bg-black opacity-0" /></article>)}
//   </div></section>
const cards = gsap.utils.toArray<HTMLElement>(".deck__card");
gsap.set(cards.slice(1), { yPercent: 120 });
const tl = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: root.current,
    start: "top top",
    end: () => "+=" + window.innerHeight * (cards.length - 1),
    pin: true,
    scrub: true,
    invalidateOnRefresh: true,
    snap: 1 / (cards.length - 1), // optional: settle on each card
  },
});
cards.forEach((card, i) => {
  if (i === 0) return;
  tl.to(card, { yPercent: 0 }, i - 1)
    .to(cards[i - 1], { scale: 0.92 }, i - 1)
    .to(cards[i - 1].querySelector(".deck__shade"), { opacity: 0.45 }, i - 1);
});
```
**Tune:** Scale step 0.03-0.06 per depth; shade 0.1-0.15 per depth, capped 0.4-0.5; `--stack-step` 0.75-2 rem (0 for a clean full cover); card height 60-80svh. Version B: `yPercent` start 100-120; add `rotate: 3 -> 0` only if the brand is playful.  
**A11y/perf:** Dim with an overlay's `opacity`; never scrub `filter: brightness()` on big cards (per-frame paint of the whole card). Reduced motion: version A still stacks (pure CSS sticky, no scaling), which is fine; version B falls back to a normal list.

### 10. Sticky split layout
**Looks like:** Left column: tall text steps you scroll through normally. Right column: a sticky media frame that crossfades to the image matching the step at the viewport center (Stripe product pages, NYT-style scrollytelling, Apple feature rails).  
**Use when / avoid when:** 3-8 steps where each paragraph needs its own visual. Better than recipe 7 whenever there is real reading. Avoid when media is decorative (just inline it).  
**Stack:** CSS sticky + GSAP ScrollTrigger (`onToggle`)

```tsx
"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";

type Step = { id: string; title: string; body: string; src: string };

export function StickySplit({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.utils.toArray<HTMLElement>(".split__media");
      const texts = gsap.utils.toArray<HTMLElement>(".split__step");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let current = 0;

      const show = (i: number) => {
        if (i === current) return;
        current = i;
        media.forEach((m, j) =>
          gsap.to(m, {
            autoAlpha: j === i ? 1 : 0,
            scale: j === i ? 1 : 1.03,
            duration: reduce ? 0 : 0.7,
            ease: EASE.out,
            overwrite: true,
          }),
        );
        texts.forEach((t, j) => t.toggleAttribute("data-active", j === i));
      };

      gsap.set(media.slice(1), { autoAlpha: 0 });
      texts[0]?.setAttribute("data-active", "");
      texts.forEach((step, i) =>
        ScrollTrigger.create({
          trigger: step,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => self.isActive && show(i),
        }),
      );
    },
    { scope: root, dependencies: [steps.length], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="grid gap-12 px-[5vw] md:grid-cols-2">
      <div>
        {steps.map((s) => (
          <article
            key={s.id}
            className="split__step flex min-h-[80svh] flex-col justify-center opacity-40 transition-opacity duration-[var(--dur-base)] data-[active]:opacity-100"
          >
            {/* mobile: inline media, no sticky column */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mb-6 rounded-2xl md:hidden" src={s.src} alt="" />
            <h3 className="text-[clamp(1.75rem,3vw,2.75rem)]">{s.title}</h3>
            <p className="max-w-[42ch]">{s.body}</p>
          </article>
        ))}
      </div>
      <div className="hidden md:block">
        <div className="sticky top-[10svh] aspect-[4/5] overflow-clip rounded-3xl">
          {steps.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.id} className="split__media absolute inset-0 h-full w-full object-cover" src={s.src} alt="" />
          ))}
        </div>
      </div>
    </section>
  );
}
```
Scrubbed variant (media blends continuously instead of switching): per step `gsap.fromTo(media[i], { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: step, start: "top 80%", end: "top 30%", scrub: true } })`.  
**Tune:** Step `min-height` 70-100svh (shorter = snappier swaps). Crossfade 0.5-0.8 s with a 1.02-1.05 scale settle. Trigger line "center" (use "top 60%" to swap earlier). Inactive text opacity 0.3-0.5.  
**A11y/perf:** Everything readable without JS; mobile shows inline images. Reduced motion: instant swaps. `position: sticky` breaks if any ancestor has `overflow: hidden/auto`; use `overflow: clip` when you only need clipping (it does not create a scroll container).

### 11. Parallax layers
**Looks like:** Foreground elements drift faster than the page, backgrounds slower; images slide inside their frames so photos feel deeper than the layout (Locomotive Scroll's `data-scroll-speed` era, every editorial portfolio).  
**Use when / avoid when:** 2-3 depth layers max per viewport; image-in-frame parallax on large editorial photos. Avoid on text blocks people are reading (moving text while reading is nauseating), and avoid speeds so strong elements overlap unpredictably across breakpoints.  
**Stack:** GSAP ScrollTrigger (manual), or ScrollSmoother (built-in `data-speed`/`data-lag`)

(a) Manual `data-speed` with ScrollSmoother-compatible semantics (1 = normal, 0.8 = slower/background, 1.2 = faster/foreground), works with Lenis:
```tsx
"use client";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function ParallaxScope({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = parseFloat(el.dataset.speed ?? "1");
          // Measure a stable ancestor, never the element you move.
          const trigger = el.closest<HTMLElement>("[data-speed-trigger]") ?? el.parentElement ?? el;
          // Distance scrolled while the trigger crosses the viewport, times the speed difference.
          const travel = () => (1 - speed) * (window.innerHeight + trigger.offsetHeight);
          gsap.fromTo(
            el,
            { y: () => -travel() / 2 },
            {
              y: () => travel() / 2, // centred: element sits at its layout position mid-viewport
              ease: "none",
              scrollTrigger: {
                trigger,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
// Usage: <section data-speed-trigger><img data-speed="0.85" .../><h2 data-speed="1.1">...</h2></section>
```
(b) Image parallax inside an overflow-clipped frame (the most tasteful form):
```tsx
// Markup: <figure className="parallax-frame aspect-[3/2] overflow-clip rounded-2xl">
//           <img className="parallax-img -mt-[10%] h-[120%] w-full object-cover" src="..." alt="..." /></figure>
gsap.utils.toArray<HTMLElement>(".parallax-frame").forEach((frame) => {
  gsap.fromTo(
    frame.querySelector(".parallax-img"),
    { yPercent: -8 }, // image is 120% tall: +-8% of its own height stays inside the 10% slack
    { yPercent: 8, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } },
  );
});
```
(c) ScrollSmoother alternative (GSAP's own smooth scroller; use INSTEAD of Lenis, never with it):
```tsx
"use client";
import { useRef, type ReactNode } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { gsap, useGSAP } from "@/lib/gsap";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollSmoother);

export function SmootherRoot({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollSmoother.create({
      wrapper: wrapper.current!,
      content: content.current!,
      smooth: reduce ? 0 : 1, // seconds to catch up; 0.8-1.4
      effects: !reduce, // enables data-speed / data-lag
      smoothTouch: 0.1, // tiny smoothing on touch; 0/false = native
      normalizeScroll: true, // JS-thread scrolling: kills iOS address-bar pin jumps
    }); // context-aware: killed automatically on unmount
  });

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
// <img data-speed="0.8" />  <h2 data-speed="clamp(1.2)" /> (clamp: no offset for above-the-fold)
// <p data-lag="0.15" /> (element catches up 0.15s late)   data-speed="auto" on an oversized child
// fills its clipped parent automatically.
```
ScrollSmoother rules: `position: fixed` elements (header, cursor, modals) go OUTSIDE `#smooth-wrapper`, because the content is transformed. CSS `position: sticky` does not work inside; use ScrollTrigger `pin`. Do not nest effects.  
**Tune:** Speeds 0.8-1.2 for layout layers (0.9/1.1 is often enough), 0.6-0.7 only for full-bleed backgrounds. Frame parallax +-5-10%. `data-lag` 0.05-0.2 for floating decorative items only.  
**A11y/perf:** Transform only. Disabled for reduced motion and on small screens (parallax on phones mostly adds jank). Never parallax the LCP image before first paint.

### 12. Clip-path image reveals
**Looks like:** Images unveil instead of fading: a wipe up from the bottom edge, an iris opening from the center, a rounded window expanding, or a slanted wipe; the image inside settles from 1.2x scale for weight (Locomotive, Obys, Darkroom case studies).  
**Use when / avoid when:** Hero images of case studies, gallery entries, section openers. Use one style per site. Avoid on small thumbnails in bulk (20 simultaneous clip animations = paint storm) and on UI (buttons, cards with text).  
**Stack:** GSAP ScrollTrigger

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP, EASE } from "@/lib/gsap";

const CLIPS = {
  wipeUp: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
  iris: ["circle(0% at 50% 50%)", "circle(75% at 50% 50%)"], // 75% covers the corners
  window: ["inset(30% 30% 30% 30% round 24px)", "inset(0% 0% 0% 0% round 0px)"],
  slant: ["polygon(0% 0%, 0% 0%, -25% 100%, 0% 100%)", "polygon(0% 0%, 125% 0%, 100% 100%, 0% 100%)"],
} as const;

type Props = { src: string; alt: string; variant?: keyof typeof CLIPS; scrub?: boolean };

export function ClipReveal({ src, alt, variant = "wipeUp", scrub = false }: Props) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const [from, to] = CLIPS[variant];
        const tl = gsap.timeline({
          defaults: { ease: scrub ? "none" : "expo.inOut", duration: scrub ? 1 : 1.4 },
          scrollTrigger: scrub
            ? { trigger: frame.current, start: "top 90%", end: "top 30%", scrub: true }
            : { trigger: frame.current, start: "top 80%", once: true },
        });
        tl.fromTo(frame.current, { clipPath: from }, { clipPath: to }, 0).fromTo(
          ".clip__img",
          { scale: 1.25 },
          { scale: 1, ease: scrub ? "none" : EASE.out },
          0,
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(frame.current, { autoAlpha: 0, duration: 0.6, scrollTrigger: { trigger: frame.current, start: "top 85%", once: true } });
      });
    },
    { scope: frame },
  );

  return (
    <div ref={frame} className="relative aspect-[4/5] overflow-clip">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="clip__img h-full w-full object-cover" src={src} alt={alt} />
    </div>
  );
}
```
Curtain panel variant (a solid colour block slides away, the image scales down under it): animate a sibling `div.curtain` with `scaleY: 1 -> 0, transformOrigin: "top"`; pure transform, cheaper than clip-path for large grids.  
**Tune:** Played reveals 1.2-1.6 s with `expo.inOut`/`power4.inOut` (clip reveals want an in-out curve; a pure ease-out looks like a glitch at the start). Inner scale 1.15-1.35. Iris end 71-75%. Scrubbed: start "top 90%", end "top 30-40%".  
**A11y/perf:** Both ends must use the same function and point count (`inset` with `round` on both sides, 4-point polygon both sides). `clip-path` is paint-per-frame on the main thread: fine for 1-3 images at once; for grids use the curtain transform variant. Reduced motion: short fade.

### 13. Scroll-velocity skew and marquee
**Looks like:** (a) Images/cards skew a few degrees in the scroll direction when you scroll fast and spring back when you stop (GSAP's "skew on scroll velocity" demo, many Awwwards galleries). (b) A giant text marquee drifts by itself, reverses direction when you scroll up, and surges with scroll speed (Dennis Snellenberg's portfolio hero, recreated by Olivier Larose).  
**Use when / avoid when:** Playful/editorial brands, galleries, footers. Avoid skew on text-heavy content, and cap it: 20 deg (the demo default) looks broken on real layouts; 4-8 deg looks intentional.  
**Stack:** GSAP ScrollTrigger + quickSetter + ticker

(a) Velocity skew:
```tsx
"use client";
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export function VelocitySkew({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = root.current!.querySelectorAll<HTMLElement>("[data-skew]");
        const proxy = { skew: 0 };
        const setSkew = gsap.quickSetter(targets, "skewY", "deg"); // bypasses tween overhead
        const clamp = gsap.utils.clamp(-6, 6); // max skew in deg
        gsap.set(targets, { transformOrigin: "right center", force3D: true });

        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const skew = clamp(self.getVelocity() / -300); // px/s -> deg; lower divisor = more reactive
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
              proxy.skew = skew;
              gsap.to(proxy, {
                skew: 0,
                duration: 0.8,
                ease: "power3",
                overwrite: true,
                onUpdate: () => setSkew(proxy.skew),
              });
            }
          },
        });
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children /* children carry data-skew */}</div>;
}
```
(b) Velocity-driven marquee (ticker-based, so direction flips are seamless; no negative timeScale edge cases):
```tsx
"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const BASE_SPEED = 60; // px per second at rest
const MAX_BOOST = 1400; // px per second added at very fast scroll
const BOOST_PER_VELOCITY = 0.3; // scroll px/s -> marquee px/s
const DECAY = 0.9; // per 60Hz frame; 0.85 snappier, 0.95 floatier

export function VelocityMarquee({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current!.querySelector<HTMLElement>(".marquee__track")!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return; // static text

      const setX = gsap.quickSetter(track, "x", "px");
      let copyWidth = track.scrollWidth / 2;
      const ro = new ResizeObserver(() => (copyWidth = track.scrollWidth / 2));
      ro.observe(track);

      let x = 0;
      let dir = 1; // 1 = moving left
      let boost = 0;
      let visible = false;

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (visible = self.isActive), // no work while off-screen
        onUpdate: (self) => {
          dir = self.direction; // 1 scrolling down, -1 scrolling up
          boost = Math.max(boost, Math.min(Math.abs(self.getVelocity()) * BOOST_PER_VELOCITY, MAX_BOOST));
        },
      });

      const tick = (_time: number, deltaMs: number) => {
        if (!visible) return;
        const frames = deltaMs / (1000 / 60);
        boost *= Math.pow(DECAY, frames);
        x -= dir * (BASE_SPEED + boost) * (deltaMs / 1000);
        x = gsap.utils.wrap(-copyWidth, 0, x); // seamless: two identical copies
        setX(x);
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
      };
    },
    { scope: root, dependencies: [text], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="overflow-clip py-8" aria-label={text} role="marquee">
      <div className="marquee__track flex w-max whitespace-nowrap text-[clamp(3rem,12vw,11rem)] leading-none">
        {[0, 1].map((copy) => (
          <span key={copy} aria-hidden="true" className="flex shrink-0 gap-[0.5em] pr-[0.5em]">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i}>{text} -</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
```
Lenis-native alternative for (b): `useLenis(({ velocity, direction }) => { ... })` gives the smoothed velocity (px per frame) directly.  
**Tune:** Skew divisor 200-400, clamp 4-8 deg, spring back 0.5-1 s `power3`. Marquee base 40-100 px/s, boost factor 0.2-0.5, decay 0.85-0.95. Each copy must be wider than the viewport (repeat the text inside a copy).  
**A11y/perf:** Transforms only; the marquee idles when off-screen. Reduced motion: static text, no skew. A perpetually moving marquee should have a pause control if it runs longer than 5 s next to readable content (WCAG 2.2.2); purely decorative display type is the usual exception, but offer pause-on-hover at least.

### 14. Progress bar, active nav, theme per section
**Looks like:** A hairline bar fills across the top as you read; the section nav underlines the current chapter; the whole page background eases from ink to paper to accent as sections change (Awwwards SOTD staple; editorial long reads).  
**Use when / avoid when:** Long pages with chapters. Theme switching: 2-4 sections max with deliberate contrast shifts; avoid a new color every section (reads as a template demo).  
**Stack:** GSAP ScrollTrigger + CSS custom properties (for pure CSS progress, `animation-timeline: scroll()` in `scroll-css-native.md`)

```tsx
"use client";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Chapter = { id: string; label: string; theme: "light" | "dark" | "accent" };

export function ChapterChrome({ chapters }: { chapters: Chapter[] }) {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(chapters[0]?.id);

  useGSAP(
    () => {
      // 1. Reading progress: whole document, scaleX only (never width).
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } },
      );

      // 2. Active chapter + 3. theme. Toggling is rare, so React state is fine here.
      chapters.forEach((c) => {
        const section = document.getElementById(c.id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(c.id);
            document.documentElement.dataset.theme = c.theme;
          },
        });
      });
      return () => {
        delete document.documentElement.dataset.theme;
      };
    },
    { dependencies: [chapters.length], revertOnUpdate: true },
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-[2px]">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-[var(--fg)]" />
      </div>
      <nav aria-label="Chapters" className="fixed right-6 top-1/2 z-40 -translate-y-1/2">
        <ul className="grid gap-2 text-sm">
          {chapters.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} aria-current={active === c.id ? "true" : undefined} className="opacity-50 aria-[current]:opacity-100">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
```
```css
:root, [data-theme="light"] { --bg: #f3f0e8; --fg: #121212; }
[data-theme="dark"] { --bg: #0e0e0e; --fg: #efece4; }
[data-theme="accent"] { --bg: #d9ff42; --fg: #0e0e0e; }
body {
  background: var(--bg);
  color: var(--fg);
  transition: background-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
/* Sections themselves stay transparent so the body colour shows through. */
```
**Tune:** Theme switch line "top 50%" (switch when the new section owns half the screen); transition 0.6-1 s. Progress bar 2-3 px, `scrub: true`. Nav: highlight line "top 40-50%".  
**A11y/perf:** `aria-current="true"` on the active link. Theme transitions are one-off paints (fine); do not scrub `backgroundColor` continuously on the body. Check contrast of every theme pair (text AA). Reduced motion: keep the switch, set `transition-duration: 0.01ms` via your global reduced-motion rule.

### 15. Observer full-screen slides
**Looks like:** Each wheel notch, swipe or arrow key transitions to the next full-screen section with a split "curtain" (outer/inner wrappers moving opposite ways), background parallax and staggered heading chars; there is no scrollbar travel (GSAP "Animated continuous sections" demo by Brian Cross; agency showcase intros).  
**Use when / avoid when:** A standalone showcase/intro of 3-7 visual slides where each slide is one image + one line. DO NOT use for normal content pages, anything with long text, SEO-critical pages, or anything users need to skim or Find-in-page: this is scroll-jacking; trackpad users hate the "one notch = one slide" latency and screen-reader/keyboard users need extra work. Prefer recipe 7 (pinned + snap keeps the native scrollbar).  
**Stack:** GSAP Observer + SplitText

```tsx
"use client";
import { useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, Observer, SplitText, useGSAP } from "@/lib/gsap";

type Slide = { id: string; title: string; image: string };

export function FullscreenSlides({ slides }: { slides: Slide[] }) {
  const root = useRef<HTMLDivElement>(null);
  const goToRef = useRef<(i: number) => void>(() => {});
  const lenis = useLenis();

  useGSAP(
    (_ctx, contextSafe) => {
      const sections = gsap.utils.toArray<HTMLElement>(".fs-slide");
      const outers = gsap.utils.toArray<HTMLElement>(".fs-slide__outer");
      const inners = gsap.utils.toArray<HTMLElement>(".fs-slide__inner");
      const images = gsap.utils.toArray<HTMLElement>(".fs-slide__bg");
      const splits = gsap.utils.toArray<HTMLElement>(".fs-slide__title").map((h) =>
        SplitText.create(h, { type: "words,chars", mask: "words" }),
      );
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wrap = gsap.utils.wrap(0, sections.length);
      let current = -1;
      let animating = false;

      gsap.set(outers, { yPercent: 100 });
      gsap.set(inners, { yPercent: -100 });

      const goTo = contextSafe!((target: number, direction: number) => {
        const index = wrap(target);
        animating = true;
        const d = direction >= 0 ? 1 : -1;
        const tl = gsap.timeline({
          defaults: { duration: reduce ? 0.01 : 1.25, ease: "power1.inOut" },
          onComplete: () => {
            animating = false;
          },
        });
        if (current >= 0) {
          gsap.set(sections[current], { zIndex: 0 });
          tl.to(images[current], { yPercent: -15 * d }).set(sections[current], { autoAlpha: 0 });
        }
        gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
        tl.fromTo([outers[index], inners[index]], { yPercent: (i: number) => (i ? -100 * d : 100 * d) }, { yPercent: 0 }, 0)
          .fromTo(images[index], { yPercent: 15 * d }, { yPercent: 0 }, 0)
          .fromTo(
            splits[index].chars,
            { autoAlpha: 0, yPercent: 120 * d },
            { autoAlpha: 1, yPercent: 0, duration: reduce ? 0.01 : 1, ease: "power2", stagger: { each: 0.02, from: "random" } },
            0.2,
          );
        current = index;
      });
      goToRef.current = (i: number) => !animating && goTo(i, i > current ? 1 : -1);

      lenis?.stop(); // this page is not natively scrolled
      Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1, // makes wheel-down and swipe-up both fire onUp
        tolerance: 10, // px of intent before a slide change
        preventDefault: true,
        onDown: () => !animating && goTo(current - 1, -1),
        onUp: () => !animating && goTo(current + 1, 1),
      }); // context-aware: killed on unmount

      const onKey = (e: KeyboardEvent) => {
        if (animating) return;
        const next = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
        const prev = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
        if (!next && !prev) return;
        e.preventDefault();
        goTo(current + (next ? 1 : -1), next ? 1 : -1);
      };
      window.addEventListener("keydown", onKey);
      goTo(0, 1);

      return () => {
        window.removeEventListener("keydown", onKey);
        lenis?.start();
      };
    },
    { scope: root, dependencies: [slides.length, lenis], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="fixed inset-0 overflow-clip bg-black text-white">
      {slides.map((s) => (
        <section key={s.id} className="fs-slide invisible fixed inset-0" aria-roledescription="slide">
          <div className="fs-slide__outer h-full w-full overflow-clip">
            <div className="fs-slide__inner h-full w-full overflow-clip">
              <div
                className="fs-slide__bg absolute inset-0 grid place-items-center bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(#0006, #0006), url(${s.image})` }}
              >
                <h2 className="fs-slide__title text-[clamp(2.5rem,8vw,7rem)] leading-none">{s.title}</h2>
              </div>
            </div>
          </div>
        </section>
      ))}
      <nav aria-label="Slides" className="fixed bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        {slides.map((s, i) => (
          <button key={s.id} type="button" aria-label={`Go to ${s.title}`} className="size-2.5 rounded-full bg-white/60" onClick={() => goToRef.current(i)} />
        ))}
      </nav>
    </div>
  );
}
```
Non-looping: replace `wrap` with `if (target < 0 || target >= sections.length) return;`. Horizontal version: swap `yPercent` for `xPercent` and use `onLeft/onRight`.  
**Tune:** `tolerance` 10-40 (higher = fewer accidental slides from trackpad inertia); duration 1-1.4 s `power1.inOut`/`power2.inOut`; char stagger 0.015-0.03 `from: "random"` or "start"; background counter-parallax 10-20%.  
**A11y/perf:** Keyboard (arrows/PageUp/PageDown/Space) and dot buttons implemented; `aria-roledescription="slide"`. Reduced motion: instant slide swaps. Every slide must also be reachable without wheel gestures (dots). Lenis is stopped on mount and restarted on unmount.

### 16. Flip hero-to-grid on scroll
**Looks like:** The hero image detaches and travels down the page as you scroll, shrinking and landing exactly in an empty slot of the project grid below, then scrolls away with it (Codrops "OneElementScroll", portfolio sites where the hero becomes the first case-study tile).  
**Use when / avoid when:** One hero element that is genuinely the same object as a grid item (the continuity tells a story). Avoid for multiple flying elements, and avoid when there is a pin between the hero and the slot (the pin spacer changes their relative offset; rebuild after refresh if you must).  
**Stack:** GSAP Flip + ScrollTrigger

```tsx
"use client";
import { useRef } from "react";
import { gsap, Flip, useGSAP } from "@/lib/gsap";

export function HeroToGrid({ heroSrc, tiles }: { heroSrc: string; tiles: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        const mover = root.current!.querySelector<HTMLElement>(".flip-mover")!;
        const slot = root.current!.querySelector<HTMLElement>(".flip-slot")!;
        let flipCtx: gsap.Context | undefined;

        const build = () => {
          flipCtx?.revert(); // clears the previous fit transforms before measuring again
          flipCtx = gsap.context(() => {
            const slotState = Flip.getState(slot);
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: mover,
                  start: "clamp(top 15%)", // clamp(): never before scroll 0, no jump on load
                  endTrigger: slot,
                  end: "clamp(center center)",
                  scrub: true,
                },
              })
              // Flip.fit with a duration returns a tween: x/y/scale that land mover on the slot.
              .add(Flip.fit(mover, slotState, { duration: 1, ease: "none", scale: true }) as gsap.core.Tween);
          });
        };
        build();

        const rebuild = gsap.delayedCall(0.25, build).pause(); // debounced
        const onResize = () => rebuild.restart(true);
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("resize", onResize);
          flipCtx?.revert();
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <section className="grid min-h-svh place-items-center">
        {/* Same aspect ratio as the slot: scale:true then never distorts */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="flip-mover relative z-10 aspect-[4/3] w-[min(70vw,960px)] rounded-2xl object-cover" src={heroSrc} alt="Featured project" />
      </section>
      <section className="grid grid-cols-3 gap-6 px-[5vw] py-[20svh]">
        <div className="flip-slot invisible aspect-[4/3] rounded-2xl" aria-hidden="true" />
        {tiles.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} className="aspect-[4/3] rounded-2xl object-cover" src={src} alt="" />
        ))}
      </section>
    </div>
  );
}
```
Multi-waypoint version (Codrops OneElementScroll): collect `Flip.getState()` for several `[data-step]` placeholders and `tl.add(Flip.fit(el, state, { duration: 1, ease: "sine.inOut" }), "+=0.5")` for each.  
**Tune:** Different aspect ratios: drop `scale: true` (Flip then tweens width/height: layout per frame, acceptable for ONE element; use `object-fit: cover`). `start` "clamp(top 10-25%)"; `end` "clamp(center center)" or "clamp(top 30%)". Add `borderRadius` via `props: "borderRadius"` in `Flip.getState(slot, { props: "borderRadius" })` if radii differ.  
**A11y/perf:** The slot is `invisible` + `aria-hidden`; the mover keeps the real `alt`. Reduced motion / mobile: mover stays in the hero, slot hidden via CSS (`md:` only) or shows its own image.

### 17. Scroll-scrubbed video and image sequence
**Looks like:** A product rotates, explodes into parts or a camera flies through a scene exactly in sync with the scroll, forwards and backwards (Apple AirPods Pro / iPhone pages use canvas image sequences; many launch sites scrub an MP4).  
**Use when / avoid when:** A hero product story worth 3-15 MB. Video: continuous footage, smaller files, simpler. Image sequence: frame-perfect on every browser incl. Firefox and iOS, transparent backgrounds possible, heavier. Avoid on content pages, and never on the first screen of mobile without a poster/first frame.  
**Stack:** GSAP ScrollTrigger + `<video>` or `<canvas>`

(a) Scrubbed video (seek-safe: never queue a seek while one is in flight):
```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function ScrubVideo({ src, poster }: { src: string; poster: string }) {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const video = videoRef.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // poster only

      const proxy = { t: 0 };
      const seek = () => {
        if (!video.seeking && Math.abs(video.currentTime - proxy.t) > 0.01) video.currentTime = proxy.t;
      };
      const build = contextSafe!(() => {
        gsap.to(proxy, {
          t: Math.max(0, video.duration - 0.04), // last frame, not past the end
          ease: "none",
          onUpdate: seek,
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=300%", pin: true, scrub: true },
        });
      });
      video.addEventListener("seeked", seek); // catch up to the latest scroll position
      if (video.readyState >= 1) build();
      else video.addEventListener("loadedmetadata", build, { once: true });

      // iOS Safari paints seeked frames only after the element has been activated by a gesture.
      const prime = () => void video.play().then(() => video.pause()).catch(() => {});
      window.addEventListener("touchstart", prime, { once: true, passive: true });

      return () => {
        video.removeEventListener("seeked", seek);
        video.removeEventListener("loadedmetadata", build);
        window.removeEventListener("touchstart", prime);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-svh overflow-clip bg-black">
      <video ref={videoRef} className="h-full w-full object-cover" src={src} poster={poster} muted playsInline preload="auto" />
    </section>
  );
}
```
Encode for seeking (the step people skip; default H.264 has a keyframe every ~250 frames, so every scrub seek decodes up to 250 frames):
```bash
# Smoothest: every frame is a keyframe. 1280px wide is plenty behind a pinned full-bleed section.
ffmpeg -i input.mov -vf "scale=1280:-2" -c:v libx264 -preset slow -crf 22 -g 1 -pix_fmt yuv420p -movflags +faststart -an scrub.mp4
# Compromise (~3-5x smaller): keyframe every 5 frames, no scene-cut keyframes.
ffmpeg -i input.mov -vf "scale=1280:-2" -c:v libx264 -crf 23 -x264-params keyint=5:min-keyint=5:scenecut=0 -pix_fmt yuv420p -movflags +faststart -an scrub-g5.mp4
# Firefox scrubs MP4 poorly: serve it a VP9 WebM with short GOP.
ffmpeg -i input.mov -vf "scale=1280:-2" -c:v libvpx-vp9 -b:v 0 -crf 34 -g 5 -an scrub.webm
```
Optional: `fetch(src).then(r => r.blob())` then `video.src = URL.createObjectURL(blob)` (revoke on unmount) guarantees the whole file is in memory before scrubbing; worth it for files under ~10 MB when you see stalls.

(b) Canvas image sequence (Apple style) with progressive loading and DPR:
```tsx
"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const FRAME_COUNT = 120;
const frameSrc = (i: number) => `/sequence/frame_${String(i + 1).padStart(4, "0")}.webp`;
const MAX_DPR = 2;

export function ImageSequence() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const images: HTMLImageElement[] = new Array(FRAME_COUNT);
      const loaded = new Uint8Array(FRAME_COUNT);
      const playhead = { frame: 0 };
      let drawn = -1;
      let cancelled = false;

      const nearestLoaded = (i: number) => {
        for (let d = 0; d < FRAME_COUNT; d++) {
          if (loaded[i - d]) return i - d;
          if (loaded[i + d]) return i + d;
        }
        return -1;
      };

      const draw = (force = false) => {
        const i = nearestLoaded(Math.round(playhead.frame));
        if (i < 0 || (i === drawn && !force)) return;
        drawn = i;
        const img = images[i];
        const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight); // cover
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        draw(true);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      // Coarse-to-fine order: every 8th frame first, so scrubbing works before everything arrives.
      const order: number[] = [0, FRAME_COUNT - 1];
      for (const step of [8, 4, 2, 1]) {
        for (let i = 0; i < FRAME_COUNT; i += step) if (!order.includes(i)) order.push(i);
      }
      const startLoading = () => {
        order.forEach((i) => {
          const img = new Image();
          img.decoding = "async";
          img.src = frameSrc(i);
          img
            .decode()
            .then(() => {
              if (cancelled) return;
              images[i] = img;
              loaded[i] = 1;
              draw(Math.abs(i - Math.round(playhead.frame)) < 8);
            })
            .catch(() => {});
        });
      };

      ScrollTrigger.create({ trigger: root.current, start: "top bottom+=100%", once: true, onEnter: startLoading });

      gsap.to(playhead, {
        frame: FRAME_COUNT - 1,
        ease: "none",
        snap: "frame",
        onUpdate: () => draw(),
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=250%", pin: true, scrub: true },
      });

      return () => {
        cancelled = true;
        ro.disconnect();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-svh bg-black">
      <canvas ref={canvasRef} className="h-full w-full" aria-label="Product rotating as you scroll" role="img" />
    </section>
  );
}
```
Frame extraction:
```bash
ffmpeg -i product.mov -vf "fps=30,scale=1600:-2" -c:v libwebp -quality 72 -compression_level 6 public/sequence/frame_%04d.webp
```
**Tune:** Frames 60-150 (24-30 per 100vh of scroll feels continuous); 1280-1600 px wide, WebP q 65-80 or AVIF, 30-80 KB each; serve half the frames at 960 px to phones (`frameSrc(i * 2)` with `FRAME_COUNT / 2`). Pin length +=200-400%. MAX_DPR 1.5-2. Video: `-g 1` smoothest, `keyint=5` compromise; 1280 px, CRF 20-24.  
**A11y/perf:** `role="img"` + label on the canvas, or a visually-hidden description of what the sequence shows. Reduced motion: show a single representative frame/poster, do not pin. Start loading one screen before the section (done above). Budget: under 8 MB total on mobile, always `-an` (no audio) for scrub videos.

### 18. Counters and SVG path draw
**Looks like:** Stats count up from 0 to their value once when they enter; a hand-drawn line, route or signature draws itself as you scroll (SaaS metrics strips; timeline/roadmap sections; the GSAP DrawSVG demos).  
**Use when / avoid when:** Counters: 3-4 headline numbers, once. Avoid counting trivial numbers ("3 offices") or re-running on every re-entry. Path draw: a line that means something (journey, connection, underline); avoid decorative squiggles everywhere.  
**Stack:** GSAP ScrollTrigger (+ DrawSVGPlugin, or the `pathLength` fallback)

Counter:
```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = { value: number; decimals?: number; prefix?: string; suffix?: string; locale?: string };

export function Counter({ value, decimals = 0, prefix = "", suffix = "", locale = "en" }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  const fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const final = `${prefix}${fmt.format(value)}${suffix}`;

  useGSAP(
    () => {
      const node = el.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // final value stays
      const counter = { v: 0 };
      node.textContent = `${prefix}${fmt.format(0)}${suffix}`;
      gsap.to(counter, {
        v: value,
        duration: 1.8,
        ease: "power2.out", // decelerates into the final digits (expo.out finishes too early)
        scrollTrigger: { trigger: node, start: "top 85%", once: true },
        onUpdate: () => {
          node.textContent = `${prefix}${fmt.format(counter.v)}${suffix}`;
        },
      });
    },
    { scope: el },
  );

  return (
    <span className="tabular-nums">
      <span className="sr-only">{final}</span>
      {/* GSAP owns this text node: key the <Counter> on value so React never patches it */}
      <span ref={el} aria-hidden="true">
        {final}
      </span>
    </span>
  );
}
```
SVG path draw (DrawSVG, scrubbed) with the no-plugin fallback:
```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function DrawPath() {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".route",
          { drawSVG: "0%" }, // DrawSVG: "0%" -> "100%", or "50% 50%" -> "0% 100%" to grow from the centre
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <svg ref={root} viewBox="0 0 800 400" className="h-auto w-full" aria-hidden="true" fill="none">
      {/* No pathLength attribute here: DrawSVG measures real length and would be scaled by it */}
      <path className="route" d="M20 360 C 180 40, 320 380, 480 140 S 720 60, 780 40" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
```
No-plugin fallback (e.g. CSS-only projects or a vanilla page without DrawSVG): normalise the length with `pathLength="1"`, so no `getTotalLength()` math and it stays correct on resize:
```html
<path class="route-css" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M20 360 C 180 40, 320 380, 480 140 S 720 60, 780 40" stroke="currentColor" fill="none" />
<script type="module">
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  gsap.registerPlugin(ScrollTrigger);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.to(".route-css", {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: { trigger: ".route-css", start: "top 70%", end: "bottom 60%", scrub: true },
    });
  } else {
    gsap.set(".route-css", { strokeDashoffset: 0 });
  }
</script>
```
Never combine `pathLength` with DrawSVG on the same path (DrawSVG writes dash values in real user units, which `pathLength` then rescales).  
**Tune:** Counter 1.5-2.2 s `power2.out`/`power3.out`; format with `Intl.NumberFormat` (locale-aware separators, compact notation via `notation: "compact"`). Path draw: scrub over 50-100% of the section; stroke 1.5-3 px; `strokeLinecap: round` hides dash seams. Firefox sometimes needs `"102%"` with DrawSVG on closed shapes.  
**A11y/perf:** Counter exposes the final value to screen readers via the sr-only copy and uses `tabular-nums` so width does not jitter. Paths are decorative (`aria-hidden`). DrawSVG only animates stroke, never fill; convert `<rect>` to `<path>` for iOS Safari stroke bugs.

### 19. matchMedia responsive and reduced motion
**Looks like:** Desktop gets the full pinned choreography, phones get lighter native-scroll versions, and reduced-motion users get instant or cross-faded states; resizing across a breakpoint cleanly tears down and rebuilds.  
**Use when / avoid when:** Always, for anything with pins, parallax or scrub. The only thing never to do is `if (window.innerWidth > 768)` at setup time (does not react to resize/rotation and leaks triggers).  
**Stack:** GSAP `gsap.matchMedia()`

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP, EASE, DUR } from "@/lib/gsap";

export function ResponsiveStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isTablet: "(min-width: 768px) and (max-width: 1023px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, isMobile, reduceMotion } = ctx.conditions as Record<string, boolean>;
          // Site-level "motion off" switch (see below) behaves like the OS setting.
          const motionOff = reduceMotion || document.documentElement.dataset.motion === "off";

          if (motionOff) {
            // Replace motion with its end state or a short cross-fade; never hide content.
            gsap.from(".story__panel", { autoAlpha: 0, duration: 0.3, stagger: 0.05 });
            return;
          }

          if (isDesktop) {
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: root.current, start: "top top", end: "+=200%", pin: true, scrub: true },
              })
              .from(".story__panel", { yPercent: 100, stagger: 0.5 });
          } else {
            // Tablet/phone: no pin, simple reveals on enter.
            gsap.utils.toArray<HTMLElement>(".story__panel").forEach((panel) =>
              gsap.from(panel, {
                y: isMobile ? 24 : 40,
                autoAlpha: 0,
                duration: DUR.base,
                ease: EASE.out,
                scrollTrigger: { trigger: panel, start: "top 85%", once: true },
              }),
            );
          }
          return () => {
            // optional non-GSAP cleanup; GSAP objects created above revert automatically
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative md:h-svh">
      {["One", "Two", "Three"].map((t) => (
        <article key={t} className="story__panel grid min-h-[60svh] place-items-center md:absolute md:inset-0">
          <h3 className="text-5xl">{t}</h3>
        </article>
      ))}
    </section>
  );
}

// Site-level toggle: <button onClick={toggleMotion}>
export function toggleMotion() {
  const el = document.documentElement;
  el.dataset.motion = el.dataset.motion === "off" ? "on" : "off";
  gsap.matchMediaRefresh(); // re-runs every active matchMedia handler with the new flag
}
```
**Tune:** Breakpoints match your CSS ones (Tailwind `md` 768, `lg` 1024). Reduced-motion substitute: 0.2-0.4 s opacity only.  
**A11y/perf:** Reduced motion means no pin, no parallax, no scrub-linked transforms, no velocity effects; opacity fades are acceptable. Lenis already disables smoothing for reduced motion by default.

### 20. Refresh discipline and ScrollTrigger config
**Looks like:** Nothing, when done right. When done wrong: animations fire early/late, pins jump, the page end is cut off or has a blank gap after fonts/images load, and back-navigation lands on the wrong spot.  
**Use when / avoid when:** Every project with more than a couple of ScrollTriggers. Put one manager in the root layout.  
**Stack:** GSAP ScrollTrigger

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Mount once inside <SmoothScroll>. Re-measures after fonts and late images on every route. */
export function ScrollTriggerRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const refresh = gsap.delayedCall(0.15, () => !cancelled && ScrollTrigger.refresh()).pause();
    const request = () => refresh.restart(true); // debounce bursts of image loads

    // 1. Web fonts change line breaks (and SplitText lines): measure after they settle.
    document.fonts.ready.then(request);

    // 2. Images without reserved space (missing width/height/aspect-ratio) shift everything below.
    const pending = Array.from(document.images).filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener("load", request, { once: true }));

    // 3. Re-sort by document position (React creates child triggers before parents), then measure.
    ScrollTrigger.sort();
    request();

    return () => {
      cancelled = true;
      refresh.kill();
      pending.forEach((img) => img.removeEventListener("load", request));
    };
  }, [pathname]);

  return null;
}
```
Config cheat sheet (all verified against gsap 3.15 docs/source):

| Option | Use it when | Value |
|---|---|---|
| function-based `start`/`end`/values + `invalidateOnRefresh: true` | anything derived from sizes (`scrollWidth`, `innerHeight`, element heights) | `end: () => "+=" + el.offsetHeight` |
| `pinSpacing` | default `true` (padding) pushes following content down by the pin length; `false` when the next section should slide OVER the pinned one; auto `false` if the pin's parent is `display:flex` | `true` / `false` / `"margin"` |
| `pinReparent: true` | an ancestor has `transform`, `filter`, `will-change`, `contain`, `perspective` (breaks `position: fixed`); expensive, last resort | boolean |
| `anticipatePin: 1` | pin at the very top of a fast-scrolling page shows a 1-frame jump | 0.5-1 |
| `fastScrollEnd: true` | toggle-type (non-scrub) animations that must be finished if the user flies past | `true` or px/s threshold (default 2500) |
| `preventOverlaps: true` | sequential toggle animations on the same elements must not overlap | `true` or a group string |
| `refreshPriority` | a pin is created AFTER triggers located below it (e.g. parent effect runs after children) | higher number = refreshed first |
| `pinnedContainer` | non-pinning trigger INSIDE an element pinned by another ScrollTrigger | the pinned element |
| `clamp()` in start/end | trigger already in view at load (would start mid-animation) or near page end | `"clamp(top bottom)"` |
| `end: "max"` | progress bars / whole-page timelines | `start: 0, end: "max"` |
| `ScrollTrigger.config({ ignoreMobileResize: true })` | touch-only devices, address bar show/hide should not refresh | on by default for touch-only in 3.15 source |
| `ScrollTrigger.normalizeScroll(true)` | NO Lenis, iOS pin jitter / address-bar jumps; forces JS-thread scrolling | never together with Lenis |
| `markers` | development only | `markers: process.env.NODE_ENV === "development"` |
| `ScrollTrigger.clearScrollMemory("manual")` | vanilla multi-page sites where reload restores mid-page before pins measure | sets `history.scrollRestoration` |

Pin ordering example (child components mount first in React):
```ts
// In the HERO (top of page) component, whose pin is created after lower sections' triggers:
ScrollTrigger.create({ trigger: heroRef.current, pin: true, end: "+=100%", refreshPriority: 1 });
// Or globally after everything mounted: ScrollTrigger.sort(); ScrollTrigger.refresh();
```
Verified in the gsap 3.15 source: the sort key is `refreshPriority * -1e6 + pagePosition` (ascending), so HIGHER `refreshPriority` refreshes first; and as soon as ANY trigger has `refreshPriority` in its vars, every later `refresh()` auto-sorts all triggers by page position. So one `refreshPriority: 0` on any trigger is a cheap global guard against out-of-order creation (lazy sections, dependency-driven re-creation). Note: the official `gsap-scrolltrigger` agent skill states the direction backwards ("lower = refreshed first"); trust the source.
**Tune:** Debounce 100-250 ms. Refresh after: fonts ready, late images, accordion/tab toggles, CMS content fetches, and after any component changes height (call `ScrollTrigger.refresh()` in that component's effect).  
**A11y/perf:** `refresh()` re-measures every trigger (forces layout): never call it on scroll or in `onUpdate`. Reserve image space (`width`/`height`/`aspect-ratio`, `next/image` does this) so refreshes are rarely needed.

## Famous effects index

| Effect (where it got famous) | Recipe | Key settings |
|---|---|---|
| Inertial "buttery" scroll (darkroom.engineering, most SOTDs since 2022) | [1](#1-setup-and-lenis-sync) | Lenis lerp 0.1, GSAP ticker, `lagSmoothing(0)` |
| Headline lines rise from masks (Locomotive, Obys, Cuberto, every SOTD) | [4](#4-splittext-line-mask-reveal) | `mask:"lines"`, yPercent 110, 1.1 s expo.out, stagger 0.09 |
| Manifesto paragraph lights up word by word (Apple product pages, SaaS about sections; Olivier Larose tutorial) | [5](#5-text-fills-as-you-scroll) | opacity 0.15 -> 1, scrub, duration/stagger ratio 4 |
| Hero image recedes into a rounded card (2024-2026 agency and SaaS heroes) | [6](#6-pinned-hero-zoom-and-clip-expansion) | pin +=120%, `inset()` clip + inner scale 1.15 -> 1 |
| Video/card grows to fullscreen (Apple, product launch pages) | [6](#6-pinned-hero-zoom-and-clip-expansion) (b) | clip `inset(22% 28% round 24px)` -> `inset(0)` |
| Olivier Larose "zoom parallax" (pinned 300vh, image grid scales at different rates until the centre fills the screen) | [6](#6-pinned-hero-zoom-and-clip-expansion) + [11](#11-parallax-layers) | pin +=200%; per-image `scale: 1 -> 4/5/6/8/9` on one scrubbed timeline, `ease:"none"` |
| 3-step pinned feature walkthrough (Apple, Linear/Stripe launches) | [7](#7-pinned-multi-step-timeline-with-label-snap) | labels + `snap:"labelsDirectional"`, ~1 vh per step |
| Lusion / Active Theory style scroll-driven 3D camera | [7](#7-pinned-multi-step-timeline-with-label-snap) + `webgl-shaders-3d.md` | scrub a timeline that tweens `camera.position`/uniform objects, labels per shot |
| Horizontal "selected work" rail (agency portfolios) | [8](#8-horizontal-scroll-gallery) | pin, `x: -(scrollWidth - innerWidth)`, `containerAnimation` for inner parallax |
| Stacking feature cards deck (Darkroom-style, SaaS "how it works") | [9](#9-stacked-cards) | CSS sticky + scale 0.04/depth + shade overlay |
| Scrollytelling split, sticky media (Stripe, NYT, Apple feature rails) | [10](#10-sticky-split-layout) | CSS sticky, `onToggle` crossfade 0.7 s |
| Locomotive Scroll `data-scroll-speed` / ScrollSmoother `data-speed` | [11](#11-parallax-layers) | speeds 0.8-1.2, trigger a stable parent |
| Photo drifts inside its frame (editorial portfolios) | [11](#11-parallax-layers) (b) | img 120% tall, yPercent -8 -> 8 |
| Iris / window / wipe image reveals (Obys, Darkroom case studies) | [12](#12-clip-path-image-reveals) | 1.4 s expo.inOut, inner scale 1.25 -> 1 |
| Gallery skews with scroll speed (GSAP "skew on scroll velocity" demo) | [13](#13-scroll-velocity-skew-and-marquee) (a) | velocity / -300, clamp +-6 deg, 0.8 s power3 back |
| Giant name marquee that flips direction with scroll (Dennis Snellenberg portfolio) | [13](#13-scroll-velocity-skew-and-marquee) (b) | base 60 px/s, boost 0.3 x velocity, decay 0.9 |
| Page background shifts ink -> paper -> accent per section | [14](#14-progress-bar-active-nav-theme-per-section) | `data-theme` on html, CSS transition 0.8 s |
| GSAP "animated continuous sections" (Brian Cross demo) | [15](#15-observer-full-screen-slides) | Observer, outer/inner yPercent +-100, 1.25 s power1.inOut |
| One image travels through several layouts (Codrops OneElementScroll) | [16](#16-flip-hero-to-grid-on-scroll) | `Flip.fit` per `[data-step]`, `clamp(center center)` |
| Apple AirPods Pro / iPhone rotating product | [17](#17-scroll-scrubbed-video-and-image-sequence) (b) | 60-150 WebP frames, canvas cover-fit, `snap:"frame"` |
| Scroll-scrubbed product film | [17](#17-scroll-scrubbed-video-and-image-sequence) (a) | ffmpeg `-g 1`/`keyint=5`, seek-when-not-seeking |
| Route/journey line draws with scroll, stats count up | [18](#18-counters-and-svg-path-draw) | DrawSVG 0% -> 100% scrub; counter 1.8 s power2.out |
| Footer revealed from underneath the page | CSS only: `footer { position: sticky; bottom: 0; z-index: -1 }` with an opaque `main` above it | no GSAP needed |
| Page-load curtain / intro counters | see `page-transitions.md` | - |

## Gotchas

Pinning and Core Web Vitals (measured)
- Default `pin: true` on the body scroller uses `position: fixed` and Chromium reports it as layout shift: 0.75 when pinning and 1.0 when unpinning a 100vh section (1.75 per pin, measured 2026-09-27, gsap 3.15, real wheel input). Scroll is not an excluding input, so this lands in field CLS (CrUX). `pinType: "transform"` and CSS `position: sticky` + scrub both measured 0. Prefer sticky tracks for stacked cards, sticky splits and pinned heroes; use `pinType: "transform"` for GSAP-only pins when Lenis drives the scroll, and test phones for vibration (native touch scroll + transform pins can shiver). Full decision in `performance-a11y.md#9-cls-from-animations-and-font-loading`.

Lenis and setup
- Double rAF loop: `ReactLenis` defaults `autoRaf` to TRUE (provider source: `autoRaf: options?.autoRaf ?? autoRaf`, prop default `true`). If you also add `lenis.raf` to `gsap.ticker`, Lenis advances twice per frame (scroll feels 2x fast) or drifts out of phase. Fix: `options={{ autoRaf: false }}` whenever GSAP drives it.
- Missing `lenis.on("scroll", ScrollTrigger.update)` (or `useLenis(ScrollTrigger.update)`): ScrollTrigger reads scroll one frame late, pinned elements shiver 1-2 px. Fix: always bridge.
- Missing `gsap.ticker.lagSmoothing(0)`: after a long frame (tab switch, heavy decode) GSAP compresses time and Lenis lurches. Fix: set it with the ticker bridge, restore `(500, 33)` on cleanup.
- `scroll-behavior: smooth` on `html` (Tailwind `scroll-smooth`, many templates) fights Lenis and makes `ScrollTrigger.refresh()` measure mid-animation (GSAP official "common mistakes"). Fix: `html { scroll-behavior: auto !important }`.
- Lenis + ScrollSmoother, or Lenis + `ScrollTrigger.normalizeScroll()`: two scroll hijackers, erratic jumps. Pick exactly one smoothing strategy.
- Missing `lenis/dist/lenis.css`: `html.lenis { height: auto }` and the stopped/prevent rules are absent; `height: 100%` on html/body then breaks the scroll limit and `lenis.stop()` no longer locks.
- Nested scroll areas (modals, code blocks, dropdown lists, maps, chat widgets) will not scroll: add `data-lenis-prevent` (plus `overscroll-behavior: contain`, which lenis.css applies).
- `lenis.stop()` for a modal without `start()` in the cleanup path (route change while open) freezes the whole site. Always stop/start in one effect.
- `next/link` for same-page `#hash` links: Next scrolls natively while Lenis animates, producing a jump then glide. Use plain `<a href="#id">` + `anchors: true`, offsets via `scroll-margin-top` (Lenis reads it).
- Navigating while inertia is still running lands the new route partially scrolled (lenis issue #319). Fix: `stopInertiaOnNavigate: true`; if still needed, `useEffect(() => lenis?.scrollTo(0, { immediate: true }), [pathname])` (this breaks back/forward scroll restoration, so only as a last resort).
- `lerp` below ~0.06 or `wheelMultiplier` above 1.2: scroll feels drunk/laggy and users blame the site. Practitioner complaints about "smooth scroll" are almost always about over-heavy settings, not the concept.
- Safari caps Lenis at 60 fps (30 in Low Power Mode); ProMotion Safari users see less smoothness than Chrome users. Nothing to fix; do not compensate with lower lerp.
- Wheel over iframes (YouTube, Maps, Calendly) is not smoothed; lenis.css disables iframe pointer events only while smooth-scrolling. Keep embeds out of pinned sections.

React and Next
- `useGSAP` with `dependencies` but without `revertOnUpdate: true` re-runs the callback into the same context WITHOUT reverting (verified in @gsap/react 2.1.2 source): every dependency change stacks a duplicate ScrollTrigger/pin. Fix: `revertOnUpdate: true` for any hook that creates ScrollTriggers. Dev check: `ScrollTrigger.getAll().length` should not grow while you interact.
- Unscoped selectors (`gsap.to(".card")`) animate matching elements in other components. With Next 16 `cacheComponents`, previous routes stay in the DOM inside `<Activity mode="hidden">` (`display: none`), so unscoped selectors can also grab hidden copies of the page. Always pass `scope`; prefer refs for single elements. Effects in hidden Activity trees clean up and re-run when shown, which `useGSAP` handles.
- Pin + React-managed siblings: ScrollTrigger wraps the pinned node in a `.pin-spacer`; if React later inserts/removes siblings of that node you get "Failed to execute 'insertBefore'/'removeChild' on 'Node'". Fix: pin a node that is the only child of a wrapper you own, never conditionally render siblings inside the pinned node's parent, and create pins in `useGSAP` (layout effect, reverts before React removes DOM), not raw `useEffect`.
- SplitText on text React re-renders: React patches text nodes that no longer exist (crash or duplicated words). Fix: split only static text; key the component on the text; `dependencies: [text], revertOnUpdate: true`.
- Counters and any node whose `textContent` GSAP writes: React loses its text node. Render the final value once, key the component on value.
- Strict Mode (dev) mounts effects twice: a `from()` without revert leaves elements stuck in the "from" state. `useGSAP` reverts between runs; never hand-roll `useEffect` + `gsap.from` without `gsap.context`.
- React runs child effects before parent effects: a pin created in a parent (or in a component higher on the page that mounts later) is measured after triggers below it, so they start early by the pin length. Fix: `refreshPriority: 1` on the pin, or `ScrollTrigger.sort(); ScrollTrigger.refresh();` once after mount (recipe 20).
- The same bug from a changing hook dependency (verified in a browser harness): `dependencies: [lenis]` with `revertOnUpdate: true`, where `lenis = useLenis()`, re-creates the pin one tick after mount because `useLenis()` starts undefined. A sticky-split section below a horizontal gallery then had its step triggers 2274 px too early, so the last image was already active when the section scrolled in. Fix: keep pin-creating hooks' dependencies stable and read Lenis through a ref (recipe 8); for async/lazy content above pins, call `ScrollTrigger.sort(); ScrollTrigger.refresh();` after it mounts. Debug by comparing `ScrollTrigger.getAll().map(t => [t.trigger, t.start])` with each trigger's `getBoundingClientRect().top + scrollY`.
- Importing `lib/gsap.ts` from a Server Component pulls plugin registration into the server graph; touching `window`/`document` at module scope in a `"use client"` file still crashes SSR (client components pre-render on the server). Only inside effects/hooks.
- `next/font` uses `font-display: swap` with metric-adjusted fallbacks, but line breaks can still change after the real font loads: SplitText lines go stale (use `autoSplit: true`) and trigger positions shift (refresh after `document.fonts.ready`).
- `[data-reveal]` pre-hidden by the `.js` CSS rule but used in a component that never animates it stays invisible forever. Only use the attribute inside components that reveal it, and never on above-the-fold/LCP content.

Measurement and triggers
- Multiple ScrollTriggers tweening the same property of the same element with `to()`/`from()`: start values are recorded at creation, so the second tween jumps. Fix: `fromTo()` + `immediateRender: false`, or one timeline with one ScrollTrigger (GSAP common mistakes).
- `scrollTrigger` on a tween nested inside a timeline: the timeline and ScrollTrigger both try to control its playhead. Put the ScrollTrigger on the timeline only.
- Hard-coded sizes (`end: "+=" + el.offsetHeight`, `x: -track.scrollWidth`) go stale on resize/font load. Use function values + `invalidateOnRefresh: true`.
- Scrubbed animation already mid-way on load because the trigger starts before scroll 0 (element in the first viewport): wrap with `"clamp(top bottom)"`.
- Moving the element you use as `trigger` (parallax `y` on the trigger itself): measurements include your own offset. Trigger a stable parent.
- `content-visibility: auto` on sections gives ScrollTrigger placeholder heights: wrong start/end below them. Do not use it on or above scroll-choreographed sections.
- Lazy images without reserved space, accordions, tabs, "load more", CMS fetches all change document height: call `ScrollTrigger.refresh()` after the change (debounced), or reserve space up front.
- `snap: "labelsDirectional"` with timeline content after the last label snaps users backward (verified in source); keep the last label at the timeline end.
- `once: true` kills the ScrollTrigger at its end; do not expect `onLeaveBack`/reverse behaviour afterwards.
- `containerAnimation` requires the horizontal tween to be `ease: "none"`; nested triggers cannot pin or snap and use `left/right/center` keywords.
- Snap tween vs Lenis inertia can visibly fight on some trackpads; switch to the `scrollEnd` + `lenis.scrollTo` snap in recipe 7.

Pinning
- Animating the pinned element's own transform throws off pin measurements (docs). Animate its children.
- An ancestor with `transform`, `filter`, `perspective`, `will-change: transform`, or `contain: paint` becomes the containing block for `position: fixed`, so the pin jumps/scrolls away. Remove it (often a page-transition wrapper left with `transform: translateY(0)`), or `pinReparent: true` as a last resort.
- Pin whose parent is `display: flex`: `pinSpacing` defaults to `false` (source), so the next section slides underneath. Set `pinSpacing: true` explicitly or wrap the pin in a block element.
- Nested pins (pinning inside a pinned element) are unsupported. Restructure into one pinned timeline; use `pinnedContainer` only for non-pinning triggers inside a pinned element.
- Pinned sections sized `100vh`/`100dvh` on mobile: address-bar show/hide changes the height, forcing refreshes and visible jumps. Use `100svh` (or `100lvh` for full-bleed media), and keep `ignoreMobileResize`.
- 1-frame jump when a pin engages during a fast flick: `anticipatePin: 1`.
- `overflow-x: hidden` on a page wrapper (a common "fix" for horizontal overflow) turns it into a scroll container and silently kills `position: sticky` (recipes 9 and 10) and can confuse pins. Use `overflow-x: clip`.
- ScrollSmoother transforms its content: `position: fixed` inside `#smooth-content` scrolls away and `position: sticky` does not work. Fixed UI goes outside the wrapper; use ScrollTrigger pins instead of sticky.

Feel and taste
- Numeric `scrub` (e.g. `scrub: 1`) on top of Lenis = double smoothing, the "rubber band" lag people call cheap. With Lenis use `scrub: true`.
- `gsap.defaults({ ease })` leaks into scrubbed tweens; always `ease: "none"` (or `defaults: { ease: "none" }` on scrubbed timelines).
- Everything fades up 40-100 px on enter, every section pinned, every image parallaxed: the AI-template signature. One hero moment, masked reveals for display type, batch reveals for grids, stillness elsewhere.
- Unmasked `y: 100+` reveals look like elements falling in; either mask (overflow clip, then yPercent 100+) or keep travel at 24-60 px.
- Pins longer than ~1-1.2 viewport heights per state change feel like the page is broken, especially when nothing visibly changes for a whole wheel flick.
- Skew above ~8 deg, marquees above ~150 px/s at rest, and velocity effects on reading content read as gimmicks.
- Snap durations above ~0.9 s or long `delay` feel like the page is fighting the user.

Performance
- Scrubbing `filter: blur()/brightness()`, `backdrop-filter`, `box-shadow`, or large `clip-path` areas repaints every frame; dim with an overlay's `opacity`, crossfade a pre-blurred image, clip only 1-3 elements at a time.
- `will-change: transform` on everything exhausts GPU memory (and makes text blurry on some GPUs); limit it to the few large layers that move continuously.
- One ScrollTrigger per word/char/card at scale: use a single tween with `stagger` + one ScrollTrigger (recipe 5) or `ScrollTrigger.batch` (recipe 3).
- `ScrollTrigger.refresh()` inside `onUpdate`, scroll or resize handlers without debounce = layout thrash. ScrollTrigger already refreshes (debounced) on window resize.
- Image sequences: decode with `img.decode()`, cap DPR at 2, draw only when the frame index changes, start loading a screen ahead.
- Video scrubbing with default encoding (keyframe every ~250 frames) stutters on every seek; re-encode with `-g 1` or `keyint=5:scenecut=0`, strip audio, 1280 px wide.
- `markers: true` shipped to production: gate it with `process.env.NODE_ENV === "development"`.

Mobile and iOS
- Touch-only devices: gsap 3.15 source already ignores address-bar resizes under 25% of the height by default (`_ignoreMobileResize = Observer.isTouch === 1`), although the docs list the default as `false`; set `ScrollTrigger.config({ ignoreMobileResize: true })` explicitly anyway.
- Without Lenis, iOS momentum scrolling runs on another thread, so pins can jitter or lag a frame: `ScrollTrigger.normalizeScroll(true)` on touch devices only (`if (ScrollTrigger.isTouch === 1)`), never with Lenis. It hides native scrollbars and hands control back when pinch-zoomed.
- Lenis `syncTouch: true` makes phones feel laggy and is buggy on iOS < 16; keep it off unless you need touch-synced WebGL.
- iOS paints seeked video frames only after a user gesture activated the element: prime with `play().then(pause)` on the first `touchstart`.
- Horizontal pinned galleries converted from vertical swipes feel wrong on phones; use native horizontal scroll with `scroll-snap-type: x mandatory` below 768 px.

## Sources
- GSAP ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- ScrollTrigger.batch(): https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.batch()/
- ScrollTrigger.normalizeScroll(): https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()/
- ScrollTrigger.config(): https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/
- ScrollTrigger common mistakes: https://gsap.com/resources/st-mistakes/
- GSAP 3.8 release (containerAnimation, preventOverlaps, fastScrollEnd): https://gsap.com/blog/3-8/
- SplitText (3.13+ API): https://gsap.com/docs/v3/Plugins/SplitText/
- Flip and Flip.fit(): https://gsap.com/docs/v3/Plugins/Flip/ , https://gsap.com/docs/v3/Plugins/Flip/static.fit()/
- Observer: https://gsap.com/docs/v3/Plugins/Observer/
- ScrollSmoother: https://gsap.com/docs/v3/Plugins/ScrollSmoother/
- DrawSVGPlugin: https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/
- gsap.matchMedia(): https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- GSAP + React guide: https://gsap.com/resources/React/
- @gsap/react README: https://github.com/greensock/react
- Source read directly from npm tarballs: gsap@3.15.0 (ScrollTrigger.js, SplitText.js, Observer.js, ScrollSmoother.js, DrawSVGPlugin.js, gsap-core.js, types/*.d.ts), @gsap/react@2.1.2 (src/index.js), lenis@1.3.26 (dist/lenis.mjs, dist/lenis.css, dist/lenis-react.d.ts)
- Lenis README: https://github.com/darkroomengineering/lenis/blob/main/README.md
- lenis/react README and source: https://github.com/darkroomengineering/lenis/tree/main/packages/react (provider.tsx, use-lenis.ts, types.ts), core options: packages/core/src/types.ts
- Lenis + Next route-change issue: https://github.com/darkroomengineering/lenis/issues/319 , https://github.com/darkroomengineering/lenis/discussions/244
- GSAP forum, Lenis + ScrollTrigger in React/Next: https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/
- GSAP forum, pin removeChild error in React: https://gsap.com/community/forums/topic/27775-scrolltrigger-pin-throws-error-when-navigating-away-in-reactfrontity/
- GSAP forum, stacking cards logic (mvaneijgen): https://gsap.com/community/forums/topic/39367-scrolltrigger-stacking-cards-animation-logic-to-create-any-effect-yes-even-yours/ and https://gsap.com/community/forums/topic/45195-stacking-cards-on-scroll-with-scrolltrigger/
- GSAP forum, smooth video scrubbing: https://gsap.com/community/forums/topic/25730-scrub-through-video-smoothly-scrolltrigger/
- GSAP CodePen, skew on scroll velocity: https://codepen.io/GreenSock/pen/eYpGLYL
- Animated continuous sections (Observer) original by Brian Cross: https://codepen.io/BrianCross/pen/PoWapLP (code read via a GitHub port: https://github.com/diegofdg/proyectos_nothing_4us)
- Codrops OneElementScroll (Flip.fit + ScrollTrigger): https://github.com/codrops/OneElementScroll
- Reform Collective ZoomPin (Flip.fit in React): https://github.com/reformcollective/library
- Olivier Larose, text gradient opacity on scroll: https://blog.olivierlarose.com/tutorials/text-gradient-opacity-on-scroll
- Video scrubbing and keyframes: https://muffinman.io/blog/scrubbing-videos-using-javascript/
- Next.js Activity / Cache Components state preservation: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/preserving-ui-state.mdx , https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.mdx
