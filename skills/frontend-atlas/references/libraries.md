# Library Chooser (animation, scroll, 3D, UI motion)
> Load when: choosing or installing an animation / scroll / 3D / micro-interaction / carousel / transition library, checking bundle cost or 2026 maintenance status, or setting one up correctly in Next 16 + React 19.
> Stack assumptions: Next 16.3 App Router + React 19.3 + TS + Tailwind 4.3. Versions and gzip sizes verified on npm / bundlephobia 2026-09-26. Vanilla setup given where the library is framework-agnostic.

## Contents
- [Decision guide](#decision-guide)
- [Version, size and status table](#version-size-and-status-table)
- Recipes - animation engines
  - [1. GSAP 3.15 (and every plugin)](#1-gsap-315-and-every-plugin)
  - [2. @gsap/react `useGSAP`](#2-gsapreact-usegsap)
  - [3. Motion for React](#3-motion-for-react)
  - [4. Motion vanilla (`animate`, `scroll`, `inView`)](#4-motion-vanilla-animate-scroll-inview)
  - [5. anime.js v4](#5-animejs-v4)
  - [6. Web Animations API (no library)](#6-web-animations-api-no-library)
  - [7. react-spring (status)](#7-react-spring-status)
- Recipes - scroll & timelines
  - [8. Lenis](#8-lenis)
  - [9. Locomotive Scroll v5](#9-locomotive-scroll-v5)
  - [10. Theatre.js](#10-theatrejs)
- Recipes - 3D, WebGL, 2D canvas
  - [11. three.js](#11-threejs)
  - [12. React Three Fiber + drei](#12-react-three-fiber--drei)
  - [13. postprocessing / @react-three/postprocessing](#13-postprocessing--react-threepostprocessing)
  - [14. OGL](#14-ogl)
  - [15. regl](#15-regl)
  - [16. PixiJS v8](#16-pixijs-v8)
- Recipes - designer-authored runtimes
  - [17. Rive](#17-rive)
  - [18. Lottie / dotLottie](#18-lottie--dotlottie)
  - [19. Spline](#19-spline)
  - [20. Unicorn Studio](#20-unicorn-studio)
  - [21. Paper Shaders](#21-paper-shaders)
- Recipes - UI motion micro-libraries
  - [22. AutoAnimate](#22-autoanimate)
  - [23. NumberFlow](#23-numberflow)
  - [24. Sonner](#24-sonner)
  - [25. Vaul](#25-vaul)
  - [26. cmdk](#26-cmdk)
  - [27. tw-animate-css](#27-tw-animate-css)
- Recipes - carousels
  - [28. Embla Carousel](#28-embla-carousel)
  - [29. Swiper 14](#29-swiper-14)
  - [30. Splide](#30-splide)
- Recipes - page transitions
  - [31. Swup, Barba, next-view-transitions](#31-swup-barba-next-view-transitions)
- Recipes - particles, confetti, physics
  - [32. tsParticles v4](#32-tsparticles-v4)
  - [33. canvas-confetti](#33-canvas-confetti)
  - [34. Matter.js](#34-matterjs)
  - [35. Rapier / @react-three/rapier](#35-rapier--react-threerapier)
- Recipes - text splitting & AI tooling
  - [36. SplitType / Splitting.js vs GSAP SplitText](#36-splittype--splittingjs-vs-gsap-splittext)
  - [37. 21st.dev Magic MCP](#37-21stdev-magic-mcp)
- [Decision matrix](#decision-matrix)
- [Recommended stacks per project type](#recommended-stacks-per-project-type)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide
| Goal / feel | Pick | Cost (gzip) | Recipe |
|---|---|---|---|
| Scroll choreography, pinning, scrub, SplitText, SVG morph, timelines | GSAP + ScrollTrigger | 27.4 kB core + plugins | [1](#1-gsap-315-and-every-plugin) |
| React state-driven UI motion, layout/shared-element, exit animations, gestures | Motion (`motion/react`) | ~34 kB `motion`, 4.6 kB `m` + features | [3](#3-motion-for-react) |
| A few imperative tweens in vanilla JS, tiny | Motion `animate` (mini) or WAAPI | 2.3 kB / 0 kB | [4](#4-motion-vanilla-animate-scroll-inview), [6](#6-web-animations-api-no-library) |
| Smooth (inertial) scroll | Lenis | 5.5 kB | [8](#8-lenis) |
| Route transitions in Next | React `<ViewTransition>` (0 kB) or GSAP overlay | 0 / GSAP | `page-transitions.md` |
| Route transitions on static/CMS sites | Swup 4 | 9.2 kB | [31](#31-swup-barba-next-view-transitions) |
| 3D scene in React | R3F + drei (+ postprocessing) | three 185 kB + R3F 57 kB | [12](#12-react-three-fiber--drei) |
| One shader plane / fullscreen background | OGL or Paper Shaders | 34 kB (tree-shakes) / per shader | [14](#14-ogl), [21](#21-paper-shaders) |
| Designer-made interactive vector animation (state machines) | Rive | 59 kB JS + WASM | [17](#17-rive) |
| Designer-made After Effects animation | dotLottie | 33 kB JS + WASM | [18](#18-lottie--dotlottie) |
| Animated numbers (prices, stats) | NumberFlow | ~6 kB core | [23](#23-numberflow) |
| List add/remove/reorder with zero config | AutoAnimate | 3.2 kB | [22](#22-autoanimate) |
| Toasts / mobile drawer / command palette | Sonner / Vaul / cmdk | 9.4 / 18.5 / 14.9 kB | [24](#24-sonner)-[26](#26-cmdk) |
| Carousel | Embla (headless) | 6.9 kB | [28](#28-embla-carousel) |
| Celebration moment | canvas-confetti | 4.3 kB | [33](#33-canvas-confetti) |

Taste rules:
- One engine per concern. GSAP for scroll/timelines + Motion for React component state is a legitimate pair; adding anime.js or react-spring on top is not.
- Libraries do not make a site premium; tokens, restraint and timing do. Default to CSS (transitions, `@starting-style`, scroll-driven animations: see `css-modern.md`, `scroll-css-native.md`) and pull a library only when CSS cannot express it.
- Every heavy runtime (three, Spline, Rive, Lottie, Pixi) is lazy-loaded below the fold or behind an intersection check, with a static poster first.

## Version, size and status table
Sizes = min+gzip of the package's main entry from bundlephobia (2026-09-26); "n/a" = not measured (API rate-limited or WASM/remote runtime). Tree-shakable libraries ship less than the full-entry number.

| Package | Version | gzip | Last publish | Status 2026 |
|---|---|---|---|---|
| gsap | 3.15.0 | 27.4 kB core | 2026-04 | Active, all plugins free (Webflow-owned) |
| @gsap/react | 2.1.2 | ~1 kB (19 kB unpacked) | 2025-01 | Stable, feature-complete |
| motion | 13.4.4 | 47.7 kB full entry | 2026-09 | Very active |
| framer-motion | 13.4.4 | 64.6 kB | 2026-09 | Same code, legacy name: use `motion` |
| animejs | 4.5.0 | 40.3 kB full, tree-shakes | 2026-08 | Active (v4 rewrite) |
| lenis | 1.3.26 | 5.5 kB | 2026-09 | Very active |
| locomotive-scroll | 5.0.1 | 9.4 kB (README claim) | 2026-01 | Maintained, thin layer over Lenis |
| @theatre/core + studio | 0.7.2 | n/a | 2024-05 | Dormant |
| three | 0.186.1 | 184.9 kB | 2026-09 | Very active |
| @react-three/fiber | 9.8.1 | 57.0 kB | 2026-09 | Very active |
| @react-three/drei | 10.7.9 | per import | 2026-09 | Very active |
| postprocessing | 6.39.5 | 112.6 kB full, tree-shakes | 2026-09 | Active |
| @react-three/postprocessing | 3.1.2 | n/a | 2026-09 | Active |
| ogl | 1.0.11 | 34.2 kB full, tree-shakes | 2025-01 | Stable, slow |
| regl | 2.1.1 | 37.7 kB | 2024-11 | Maintenance only |
| pixi.js | 8.21.0 | 261 kB | 2026-09 | Very active |
| @rive-app/react-canvas | 4.35.0 | 58.9 kB + WASM | 2026-09 | Very active |
| @lottiefiles/dotlottie-react | 0.19.16 | 33.9 kB + WASM | 2026-08 | Active |
| lottie-web | 5.13.0 | 76.8 kB | 2025-05 | Maintenance |
| lottie-react | 3.1.2 | 196 kB (bundles lottie-web) | 2026-09 | Active wrapper |
| @splinetool/react-spline | 4.1.0 | 1.9 kB wrapper + runtime n/a (heavy) | 2025-07 | Active (runtime 2.0.58, 2026-09) |
| unicornstudio-react | 2.2.13 | n/a (loads SDK) | 2026-09 | Community wrapper, active |
| @paper-design/shaders-react | 0.0.81 | n/a (per shader) | 2026-09 | Active, pre-1.0 |
| @formkit/auto-animate | 0.10.0 | 3.2 kB | 2026-07 | Active |
| @number-flow/react | 0.6.2 | ~5.7 kB core | 2026-07 | Active |
| sonner | 2.0.8 | 9.4 kB | 2026-08 | Active |
| vaul | 1.1.2 | 18.5 kB | 2024-12 | Stable, rarely updated |
| cmdk | 1.1.1 | 14.9 kB | 2025-08 | Stable |
| embla-carousel(-react) | 8.6.0 | 6.9 / 7.3 kB | 2026-08 | Active |
| swiper | 14.2.0 | 20.1 kB core | 2026-08 | Active |
| @splidejs/splide | 4.1.4 | n/a | 2022-11 | Stale |
| swup | 4.10.0 | 9.2 kB | 2026-09 | Active |
| @barba/core | 2.10.3 | n/a | 2024-08 | Slow |
| next-view-transitions | 0.3.5 | tiny (13 kB unpacked) | 2025-12 | Superseded by React 19.3 VT |
| @tsparticles/react + slim | 4.4.0 | n/a | 2026-08 | Active |
| canvas-confetti | 1.9.4 | 4.3 kB | 2025-10 | Stable |
| matter-js | 0.20.0 | 25.9 kB | 2024-06 | Slow |
| @react-three/rapier | 2.2.0 | n/a (WASM) | 2026-08 | Active |
| @react-spring/web | 10.1.2 | 20.1 kB | 2026-06 | Maintained, low momentum |
| split-type | 0.3.4 | 4.3 kB | 2023-10 | Unmaintained |
| splitting | 1.1.0 | 1.8 kB | 2024-05 | Minimal maintenance |
| tw-animate-css | 1.4.0 | CSS only | 2026-02 | Active (shadcn default) |
| @21st-dev/magic | 0.2.3 | n/a (MCP proxy) | 2026-09 | Active |

## Recipes

### 1. GSAP 3.15 (and every plugin)
**Purpose:** the timeline engine for choreography: sequencing, scroll-linked animation, SVG, text splitting, FLIP. Framework-agnostic, animates anything numeric.  
**Install:** `npm i gsap @gsap/react` (all plugins are in the public `gsap` package since 3.13; no private registry, no token).  
**Use when / avoid when:** scroll storytelling, pinned sections, SplitText reveals, route curtains, anything with > 3 coordinated steps. Avoid for simple hover/state transitions in React (CSS or Motion is less code) and for enter/exit of React-managed nodes (GSAP cannot delay an unmount; use Motion `AnimatePresence` or VT).  
**Stack:** GSAP
```ts
// lib/gsap.ts - register once, import from here everywhere (client-only modules)
"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, CustomEase);
CustomEase.create("atlas-out", "0.16, 1, 0.3, 1");    // = --ease-out-expo token
CustomEase.create("atlas-inout", "0.76, 0, 0.24, 1"); // = --ease-in-out-quart token
gsap.defaults({ ease: "atlas-out", duration: 0.8 });

export { gsap, useGSAP, ScrollTrigger, SplitText, Flip };
```
Plugins (all free, import from `gsap/<Name>`):
| Plugin | What it is for |
|---|---|
| ScrollTrigger | Scroll-linked triggers, scrub, pin, snap, batch (see `scroll-gsap.md`) |
| ScrollSmoother | GSAP's own smooth scroll (wraps content in `#smooth-wrapper/#smooth-content`, adds `data-speed`/`data-lag`). Pick it OR Lenis, not both |
| ScrollToPlugin | Tween window/element scroll to a position or element |
| Observer | Unified wheel/touch/pointer intent events (fullpage "one swipe = one slide" sections) |
| SplitText | Split into chars/words/lines; 3.13 rewrite: `mask`, `autoSplit` + `onSplit` (re-split on resize/font load), `aria` handling, ~50% smaller |
| Flip | FLIP layout transitions: `Flip.getState()` -> change DOM -> `Flip.from(state)`; grid re-sorts, element re-parenting |
| Draggable + InertiaPlugin | Drag, throw with momentum, snap (sliders, knobs, carousels) |
| DrawSVGPlugin | Animate stroke drawing (`drawSVG: "0% 100%"`) |
| MorphSVGPlugin | Morph between SVG paths with point matching |
| MotionPathPlugin (+ MotionPathHelper) | Move along an SVG path with auto-rotate; helper = in-browser path editor |
| ScrambleTextPlugin | Decode/scramble text effect |
| TextPlugin | Typewriter-style text replacement |
| CustomEase / CustomBounce / CustomWiggle | Bezier-defined eases; bounce/wiggle generators |
| EasePack | RoughEase, SlowMo, ExpoScaleEase (use ExpoScaleEase for zooms) |
| Physics2DPlugin / PhysicsPropsPlugin | Velocity/gravity/friction tweens (confetti-like bursts without a physics engine) |
| PixiPlugin / EaselPlugin | Animate PixiJS / EaselJS display-object props |
| GSDevTools | Timeline scrubber UI for development (never ship) |
| CSSRulePlugin | Legacy (animating stylesheet rules/pseudo-elements); use CSS variables instead |

**Tune:** register once; set `gsap.defaults`; build named eases matching your CSS tokens so JS and CSS motion feel identical; `gsap.matchMedia()` for breakpoints and `prefers-reduced-motion` branches.  
**A11y/perf:** GSAP is SSR-safe to import (no window at module scope), but only use it inside client components/effects. Animate `x/y/scale/rotate/opacity` (`xPercent/yPercent` for responsive). License: GSAP's standard "no charge" license allows commercial use; it excludes using GSAP inside a product that competes with Webflow's visual builder (read gsap.com/standard-license if you build such a tool).  
**Verdict:** default for Awwwards-style sites. 27 kB core + ScrollTrigger + SplitText is worth it the moment you have a scroll story.

### 2. @gsap/react `useGSAP`
**Purpose:** a `useLayoutEffect`-style hook that wraps your GSAP code in `gsap.context()`, scopes selectors to a ref, and reverts every tween/ScrollTrigger/SplitText on unmount or dependency change. Safe under React 19 Strict Mode double-invoke.  
**Install:** `npm i @gsap/react`  
**Use when / avoid when:** every GSAP usage in React. Never hand-roll `useEffect` + `gsap.to` without context (leaks triggers across route changes).  
**Stack:** GSAP + React
```tsx
// components/RevealList.tsx
"use client";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRef } from "react";

export function RevealList({ items }: { items: string[] }) {
  const root = useRef<HTMLUListElement>(null);
  const { contextSafe } = useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".item", {
        yPercent: 40, opacity: 0, stagger: 0.06,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    });
  }, { scope: root, dependencies: [items.length], revertOnUpdate: true });

  // event handlers created after mount must be wrapped so they are reverted too
  const pulse = contextSafe((e: React.MouseEvent<HTMLLIElement>) => {
    gsap.fromTo(e.currentTarget, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
  });

  return (
    <ul ref={root}>
      {items.map((t) => <li key={t} className="item" onClick={pulse}>{t}</li>)}
    </ul>
  );
}
```
**Tune:** `scope` (selector root), `dependencies`, `revertOnUpdate: true` when the animation must rebuild on data change.  
**A11y/perf:** runs in a layout effect on the client only; nothing executes during SSR. Async-created animations (after `await`, in `setTimeout`) are outside the context: wrap in `contextSafe` or kill them in the returned cleanup.  
**Verdict:** mandatory companion to GSAP in React.

### 3. Motion for React
**Purpose:** declarative React animation: `animate`/`initial`/`exit`, variants, `AnimatePresence` for unmount animations, `layout`/`layoutId` FLIP, gestures (`whileHover`, `whileTap`, `drag`), springs, `useScroll`/`useTransform`, `Reorder`, plus `AnimateView` (View Transitions) in `motion/react-animate-view`.  
**Install:** `npm i motion` (import from `motion/react`; `framer-motion` is the same code under the old name).  
**Use when / avoid when:** component-level motion driven by React state: modals, menus, tabs underline, accordions, toasts, drag, shared layout. Avoid for long scroll-scrubbed stories with pinning (GSAP ScrollTrigger is more capable) and for 200+ simultaneously animating nodes.  
**Stack:** Motion
```tsx
// components/motion-provider.tsx - global reduced-motion + lazy features (use at the root layout)
"use client";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", visualDuration: 0.4, bounce: 0.15 }}>
      {/* strict: throws if a full `motion.*` component sneaks in and defeats the lazy bundle */}
      <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
    </MotionConfig>
  );
}
```
```tsx
// components/Tabs.tsx - uses the slim `m` components (4.6 kB) inside LazyMotion
"use client";
import * as m from "motion/react-m";
import { useState } from "react";

const TABS = ["Overview", "Specs", "Reviews"] as const;

export function Tabs() {
  const [active, setActive] = useState<(typeof TABS)[number]>("Overview");
  return (
    <div role="tablist" className="flex gap-1">
      {TABS.map((t) => (
        <button key={t} role="tab" aria-selected={active === t} onClick={() => setActive(t)} className="relative px-4 py-2">
          {active === t && <m.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-white/10" />}
          <span className="relative">{t}</span>
        </button>
      ))}
    </div>
  );
}
```
```tsx
// app/page.tsx - Server Component using Motion without a client wrapper
import * as motion from "motion/react-client";
export default function Page() {
  return <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>Hello</motion.h1>;
}
```
**Tune:** springs with `visualDuration` 0.3-0.5 and `bounce` 0-0.2 for UI (bounce > 0.3 reads toy-like); `domAnimation` (animations, variants, exit, hover/tap/focus) vs `domMax` (+ layout, drag): load `domMax` only where you use `layout`/`drag`.  
**A11y/perf:** `reducedMotion="user"` disables transform and layout animations while keeping opacity/colour. `motion/react-client` lets Server Components render motion elements (the component becomes a client island). Animating `x/y/scale/opacity` runs on the compositor via WAAPI where possible; animating `width/height` or `filter` does not.  
**Verdict:** default for React UI state animation. Bundle: ~34 kB for `motion` components, 4.6 kB initial with `LazyMotion` + `m` (+ ~15 kB `domAnimation` / ~25 kB `domMax`), per motion.dev bundle docs.

### 4. Motion vanilla (`animate`, `scroll`, `inView`)
**Purpose:** framework-free imperative animation with Motion's springs and timeline sequences; `motion/mini` is a WAAPI-only 2.3 kB `animate`.  
**Install:** `npm i motion`  
**Use when / avoid when:** vanilla sites, Astro islands, Web Components, or React code that needs an imperative one-off (`useAnimate`). Pinning/scrub stories: GSAP.  
**Stack:** Motion
```ts
// src/motion-init.ts (vanilla)
import { animate, inView, scroll, stagger } from "motion";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

inView(".feature", (el) => {
  if (reduce) return;
  animate(el.querySelectorAll("li"), { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.06), duration: 0.6, ease: [0.16, 1, 0.3, 1] });
}, { amount: 0.4 });

// progress bar linked to page scroll (hardware-accelerated ScrollTimeline where supported)
scroll(animate(".progress", { scaleX: [0, 1] }, { ease: "linear" }));
```
**Tune:** `stagger(0.04-0.08)`; `inView` `amount` 0.3-0.5; `animate(sequence)` array for timelines.  
**A11y/perf:** check reduced motion yourself (vanilla has no MotionConfig). `motion/mini` animate = 2.3 kB (WAAPI only, no springs for independent transforms); full hybrid `animate` ~17 kB.  
**Verdict:** best small vanilla engine when GSAP is overkill.

### 5. anime.js v4
**Purpose:** modular, tree-shakable animation engine (v4 rewrite, 2025): `animate`, `createTimeline`, `stagger`, `onScroll`, `createDraggable`, `createScope`, `svg.createDrawable`, `splitText` (v4.1+ utils).  
**Install:** `npm i animejs`  
**Use when / avoid when:** you like its API or need a free, small GSAP-like engine for vanilla demos/CodePens. In a GSAP project it is redundant; in React prefer Motion. Old v3 code (`anime({ targets })`) does not work in v4.  
**Stack:** anime.js
```ts
// src/anime-demo.ts (v4 API)
import { animate, createTimeline, stagger } from "animejs";

animate(".tile", {
  y: [{ to: -24, ease: "outExpo", duration: 400 }, { to: 0, ease: "outBounce", duration: 700 }],
  rotate: { from: -8 },
  delay: stagger(60, { from: "center" }),
});

const tl = createTimeline({ defaults: { duration: 600, ease: "inOutQuad" } });
tl.add(".title", { opacity: [0, 1], y: [20, 0] })
  .add(".subtitle", { opacity: [0, 1] }, "-=300");
```
```tsx
// components/AnimeBox.tsx - React: createScope reverts everything on unmount
"use client";
import { animate, createScope } from "animejs";
import { useEffect, useRef } from "react";

export function AnimeBox() {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
      animate(".box", { rotate: 360, duration: 1500, loop: true, ease: "linear" });
    });
    return () => scope.current?.revert();
  }, []);
  return <div ref={root}><div className="box h-12 w-12 bg-lime-300" /></div>;
}
```
**Tune:** eases are strings (`"outExpo"`, `"inOut(3)"`, `"spring(1, 80, 10, 0)"` style via `createSpring`); `from`/`to` objects or `[from, to]` arrays.  
**A11y/perf:** `createScope({ mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" } })` exposes `self.matches.reduce` inside `add()` for branching.  
**Verdict:** good, but pick it OR GSAP; GSAP's ScrollTrigger/SplitText ecosystem is deeper.

### 6. Web Animations API (no library)
**Purpose:** native `element.animate(keyframes, options)` with promises (`.finished`), playback control, compositor-accelerated transforms/opacity, and pseudo-element targets (`pseudoElement: "::view-transition-new(root)"`).  
**Use when / avoid when:** small imperative effects, view-transition pseudo animations, ripples, one-off flourishes, zero-dependency widgets. Avoid for complex sequencing with many elements (timeline math gets verbose).  
**Stack:** Vanilla
```ts
// lib/waapi.ts
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function pop(el: HTMLElement): Promise<void> {
  if (reduce()) return Promise.resolve();
  return el
    .animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }],
      { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
    )
    .finished.then(() => undefined);
}

export function fadeIn(el: HTMLElement, delay = 0): Animation {
  return el.animate({ opacity: [0, 1], translate: ["0 12px", "0 0"] }, { duration: 500, delay, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" });
}
```
**Tune:** `fill: "both"` for staggered starts; `composite: "add"` to stack with existing transforms; `commitStyles()` then `cancel()` to persist end state without leaking fills.  
**A11y/perf:** individual transform properties (`translate`, `scale`, `rotate`) avoid clobbering an element's existing `transform`.  
**Verdict:** always the first thing to try for tiny effects; it is what Motion mini and VT pseudo-animations build on.

### 7. react-spring (status)
**Purpose:** spring-physics hooks (`useSpring`, `useTrail`, `useTransition`), v10 supports React 19.  
**Install:** `npm i @react-spring/web`  
**Use when / avoid when:** maintaining an existing react-spring codebase, or in R3F via `@react-spring/three`. For new DOM work Motion covers the same ground with layout animations, gestures and better docs; momentum and ecosystem have moved to Motion.  
**Stack:** react-spring
```tsx
// components/SpringCard.tsx
"use client";
import { animated, useSpring } from "@react-spring/web";

export function SpringCard({ open }: { open: boolean }) {
  const styles = useSpring({ opacity: open ? 1 : 0, y: open ? 0 : 12, config: { tension: 280, friction: 26 } });
  return <animated.div style={styles}>Details</animated.div>;
}
```
**Tune:** `tension` 170-300, `friction` 20-30.  
**A11y/perf:** use `Globals.assign({ skipAnimation: true })` when reduced motion is on.  
**Verdict:** legacy choice for DOM; fine for `@react-spring/three` in R3F.

### 8. Lenis
**Purpose:** smooth, inertial scrolling that keeps NATIVE scroll (position: sticky, `scrollY`, find-in-page and anchors keep working), the de facto standard on Awwwards sites. Package `lenis` (`@studio-freight/lenis` is dead).  
**Install:** `npm i lenis`  
**Use when / avoid when:** scroll-story sites, portfolios, anything with ScrollTrigger scrub where wheel steps would look choppy. Avoid in dashboards, docs, long forms and chat UIs: users want native scroll there. Never combine with GSAP ScrollSmoother or Locomotive (which already contains Lenis).  
**Stack:** Lenis + GSAP
```tsx
// components/SmoothScroll.tsx - Lenis driven by GSAP's ticker so ScrollTrigger and Lenis share one frame
"use client";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

function SyncScrollTrigger() {
  useLenis(ScrollTrigger.update); // every Lenis scroll -> ScrollTrigger update
  return null;
}

export function SmoothScroll() {
  const lenisRef = useRef<LenisRef>(null);
  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000); // gsap time is seconds
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);
  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1, anchors: true, stopInertiaOnNavigate: true }}>
      <SyncScrollTrigger />
    </ReactLenis>
  );
}
// app/layout.tsx: <body><SmoothScroll />{children}</body>
```
**Tune:** `lerp` 0.08-0.12 (lower = floatier; < 0.07 feels drunk), or `duration` 1.0-1.4 with an ease; `wheelMultiplier` 0.8-1; `touchMultiplier` leave default (touch is native unless `syncTouch`). Nested scrollers: `data-lenis-prevent` on the element.  
**A11y/perf:** Lenis honors `prefers-reduced-motion` by default (lerp forced to 1, programmatic scrolls jump). `lenis.stop()/start()` for modals and menus; `scrollTo(target, { immediate, force, offset, lock })` for navigation (see `page-transitions.md#25-route-change-hygiene-component`). Include `lenis.css` (handles `html.lenis` height and iframe/`data-lenis-prevent` rules).  
**Verdict:** yes for scroll-story sites, no for app UI. Full ScrollTrigger patterns: `scroll-gsap.md`.

### 9. Locomotive Scroll v5
**Purpose:** v5 is a thin layer over Lenis adding data-attribute parallax (`data-scroll-speed`), in-view classes and scroll callbacks (README claims 9.4 kB gzip). v4 (custom transform-based scroll) is obsolete.  
**Install:** `npm i locomotive-scroll`  
**Use when / avoid when:** static/CMS sites wanting declarative parallax without writing GSAP. In React/Next with GSAP, use Lenis + ScrollTrigger directly (fewer layers, better docs).  
**Stack:** Vanilla
```ts
// src/scroll.ts
import "locomotive-scroll/dist/locomotive-scroll.css";
import LocomotiveScroll from "locomotive-scroll";

const scroll = new LocomotiveScroll({ lenisOptions: { lerp: 0.1 } });
// markup: <div data-scroll data-scroll-speed="0.3">parallax</div>
//         <section data-scroll data-scroll-class="is-inview" data-scroll-repeat>...</section>
window.addEventListener("pagehide", () => scroll.destroy());
```
**Tune:** `data-scroll-speed` -0.3..0.5 (bigger reads gimmicky); `data-scroll-offset` for trigger points.  
**A11y/perf:** parallax on large images is transform-only; disable speeds for reduced motion with CSS (`[data-scroll-speed] { transform: none !important; }`) since the attribute API has no global toggle.  
**Verdict:** fine for non-React static sites; otherwise Lenis + GSAP.

### 10. Theatre.js
**Purpose:** visual keyframe editor (studio UI in the browser) + runtime (`@theatre/core`), with `@theatre/r3f` for Three scenes. Export JSON state, play in production without the studio.  
**Install:** `npm i @theatre/core @theatre/studio`  
**Use when / avoid when:** a one-off cinematic 3D camera path authored by a designer, if the team already knows it. Last publish 0.7.2 in May 2024: treat as dormant; for new work hand-author GSAP timelines (with `GSDevTools` for scrubbing) or use Spline/Rive for designer authoring.  
**Stack:** Theatre
```ts
// src/theatre.ts
import { getProject, types } from "@theatre/core";
import state from "./theatre-state.json";

if (import.meta.env?.DEV) {
  const { default: studio } = await import("@theatre/studio"); // never ship studio to production
  studio.initialize();
}
const sheet = getProject("Hero", { state }).sheet("Intro");
const cam = sheet.object("Camera", { x: types.number(0, { range: [-10, 10] }), z: types.number(5, { range: [1, 20] }) });
cam.onValuesChange(({ x, z }) => { /* camera.position.set(x, 0, z) */ });
sheet.sequence.play({ iterationCount: 1 });
```
**Tune:** keep sequences short (< 6 s); scrub with `sheet.sequence.position = progress * length` from a ScrollTrigger.  
**A11y/perf:** studio bundle is large; dynamic-import in dev only.  
**Verdict:** avoid for new projects unless the team already depends on it.

### 11. three.js
**Purpose:** the WebGL/WebGPU 3D engine (scene graph, materials, loaders, `WebGPURenderer` + TSL node materials).  
**Install:** `npm i three` and `npm i -D @types/three`  
**Use when / avoid when:** real 3D (models, lighting, cameras), particle systems, image planes with shaders. For one fullscreen shader, OGL or Paper Shaders is 5x lighter. For React apps prefer R3F (recipe 12) over imperative three.  
**Stack:** three (vanilla)
```ts
// src/three-scene.ts
import * as THREE from "three";

export function mountScene(container: HTMLElement): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 5;
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 4), new THREE.MeshStandardMaterial({ color: "#e6e1d6", roughness: 0.35 }));
  scene.add(mesh, new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(3, 4, 5);
  scene.add(key);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setAnimationLoop((t) => {
    if (!reduce) mesh.rotation.y = t * 0.0003;
    renderer.render(scene, camera);
  });
  const ro = new ResizeObserver(() => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
  ro.observe(container);
  return () => { ro.disconnect(); renderer.setAnimationLoop(null); mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); renderer.dispose(); renderer.domElement.remove(); };
}
```
**Tune:** `setPixelRatio(min(dpr, 2))` (1.5 on mobile); pause the loop when offscreen (IntersectionObserver).  
**A11y/perf:** 185 kB gz for the full namespace import; named imports tree-shake somewhat. Canvas gets `aria-hidden` plus a text alternative nearby. Full shader/DOM-to-WebGL recipes: `webgl-shaders-3d.md`.  
**Verdict:** the 3D foundation; wrap with R3F in React.

### 12. React Three Fiber + drei
**Purpose:** React renderer for three (declarative scene graph, hooks like `useFrame`), plus drei's 150+ helpers (Environment, useGLTF, Text, MeshTransmissionMaterial, ScrollControls, View, Float, useProgress...). R3F 9 targets React 19.  
**Install:** `npm i three @react-three/fiber @react-three/drei`  
**Use when / avoid when:** any 3D in a React app. Avoid rendering a `<Canvas>` per card (use drei `<View>` with one canvas).  
**Stack:** R3F
```tsx
// components/three/Scene.tsx
"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Group } from "three";

function Model() {
  const { scene } = useGLTF("/models/object.glb");
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.2; });
  return <primitive ref={ref} object={scene} />;
}
useGLTF.preload("/models/object.glb");

export default function Scene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 40 }} gl={{ antialias: true }} frameloop="always">
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}><Model /></Float>
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
```
```tsx
// components/three/SceneLazy.tsx - `ssr: false` is only allowed inside a Client Component
"use client";
import dynamic from "next/dynamic";
export const SceneLazy = dynamic(() => import("./Scene"), { ssr: false, loading: () => <div className="aspect-square bg-neutral-900" /> });
```
**Tune:** `dpr={[1, 2]}`; `frameloop="demand"` + `invalidate()` for static scenes (big battery win); Draco/Meshopt-compress GLBs (`gltf-transform optimize`).  
**A11y/perf:** respect reduced motion inside `useFrame` (read a `matchMedia` ref, skip rotation). Mount below the fold lazily. Use `useProgress` to feed a preloader (`page-transitions.md#22-asset-preloading-without-killing-lcp`).  
**Verdict:** default 3D stack in React.

### 13. postprocessing / @react-three/postprocessing
**Purpose:** merged-pass effect composer for three (bloom, noise, vignette, chromatic aberration, DOF, SMAA, N8AO); the R3F wrapper exposes them as components.  
**Install:** `npm i postprocessing @react-three/postprocessing`  
**Use when / avoid when:** the "cinematic" final 10%: subtle bloom on emissives, film grain, vignette. The AI tell is maxed bloom + chromatic aberration on everything; keep effects invisible until you toggle them off.  
**Stack:** R3F
```tsx
// components/three/Effects.tsx
"use client";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";

export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.6} />
      <Noise opacity={0.035} />
      <Vignette eskil={false} offset={0.2} darkness={0.6} />
    </EffectComposer>
  );
}
// inside <Canvas>: <Effects />
```
**Tune:** bloom threshold 0.8-0.95, intensity 0.3-0.8; noise 0.02-0.05; drop effects on mobile (`useThree(s => s.size.width) < 768`).  
**A11y/perf:** each effect is a fullscreen pass; `multisampling={0}` + SMAA is cheaper than MSAA.  
**Verdict:** use sparingly, always A/B with it off.

### 14. OGL
**Purpose:** minimal WebGL library (three-like API, ~8-15 kB for typical imports). Powers many React Bits / Codrops backgrounds.  
**Install:** `npm i ogl`  
**Use when / avoid when:** one or two shader planes (gradients, noise, image distortion) where three would be 185 kB. Avoid for real 3D scenes with models/lights (three).  
**Stack:** OGL
```tsx
// components/ShaderBg.tsx
"use client";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

const vertex = `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;
const fragment = `precision highp float; uniform float uTime; varying vec2 vUv;
void main(){ vec3 a = vec3(0.05,0.05,0.08); vec3 b = vec3(0.45,0.3,1.0);
  float w = 0.5 + 0.5 * sin(vUv.x * 3.0 + uTime * 0.4) * cos(vUv.y * 2.0 - uTime * 0.3);
  gl_FragColor = vec4(mix(a, b, w * 0.6), 1.0); }`;

export function ShaderBg() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
    const gl = renderer.gl;
    el.appendChild(gl.canvas);
    const program = new Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 } } });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resize = () => renderer.setSize(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const frame = (t: number) => {
      program.uniforms.uTime.value = reduce ? 0 : t * 0.001;
      renderer.render({ scene: mesh });
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); gl.canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, []);
  return <div ref={host} aria-hidden="true" className="absolute inset-0 -z-10" />;
}
```
**Tune:** `dpr` 1-1.5 for fullscreen backgrounds (shaders are fill-rate bound); render one static frame for reduced motion (as above).  
**A11y/perf:** pause when offscreen or tab hidden (`document.visibilityState`). Shader recipes: `webgl-shaders-3d.md`, `backgrounds-svg-canvas.md`.  
**Verdict:** best weight/power ratio for shader backgrounds.

### 15. regl
**Purpose:** functional, stateless WebGL wrapper (draw commands as functions).  
**Install:** `npm i regl`  
**Use when / avoid when:** data-viz or GPGPU experiments by people who like its model. For websites OGL (simpler) or three (ecosystem) win; regl is in maintenance mode (2.1.1, Nov 2024).  
**Stack:** regl
```ts
// src/regl-bg.ts
import createREGL from "regl";

const regl = createREGL({ container: document.getElementById("bg")!, attributes: { alpha: true } });
const draw = regl({
  frag: `precision mediump float; uniform float t; varying vec2 uv; void main(){ gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(t), 1.0); }`,
  vert: `attribute vec2 position; varying vec2 uv; void main(){ uv = position * 0.5 + 0.5; gl_Position = vec4(position, 0, 1); }`,
  attributes: { position: [[-1, -1], [3, -1], [-1, 3]] },
  uniforms: { t: ({ time }) => time },
  count: 3,
});
const loop = regl.frame(() => draw());
window.addEventListener("pagehide", () => { loop.cancel(); regl.destroy(); });
```
**Tune / A11y/perf:** same as OGL.  
**Verdict:** niche; do not start new site work with it.

### 16. PixiJS v8
**Purpose:** fast 2D WebGL/WebGPU renderer: thousands of sprites, filters (displacement, blur), text, particles. v8 has async `init` and a WebGPU backend.  
**Install:** `npm i pixi.js` (React: `npm i @pixi/react`)  
**Use when / avoid when:** 2D games, interactive illustrations, displacement-map image hovers, big sprite counts. 261 kB gz: never for a single effect a shader or CSS can do.  
**Stack:** PixiJS
```ts
// src/pixi-stage.ts
import { Application, Assets, DisplacementFilter, Sprite } from "pixi.js";

export async function mountPixi(el: HTMLElement): Promise<() => void> {
  const app = new Application();
  await app.init({ resizeTo: el, backgroundAlpha: 0, antialias: true, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
  el.appendChild(app.canvas);
  const tex = await Assets.load("/images/hero.jpg");
  const photo = new Sprite(tex);
  photo.width = app.screen.width; photo.height = app.screen.height;
  const map = new Sprite(await Assets.load("/images/displacement.png"));
  map.texture.source.addressMode = "repeat";
  app.stage.addChild(photo, map);
  const filter = new DisplacementFilter({ sprite: map, scale: 30 });
  photo.filters = [filter];
  app.ticker.add((t) => { map.x += 0.6 * t.deltaTime; });
  return () => app.destroy(true, { children: true, texture: true });
}
```
**Tune:** displacement `scale` 10-40; `resolution` <= 2.  
**A11y/perf:** stop `app.ticker` for reduced motion; canvas is decorative (`aria-hidden`) unless you build an accessible layer.  
**Verdict:** right tool for heavy 2D; overkill otherwise.

### 17. Rive
**Purpose:** designer-authored interactive vector animations with state machines (hover, press, toggle, data binding via view models), rendered by a WASM runtime. Tiny `.riv` files.  
**Install:** `npm i @rive-app/react-canvas` (or `@rive-app/react-webgl2` for advanced rendering features)  
**Use when / avoid when:** interactive icons, animated toggles, mascots, onboarding illustrations that react to input. Avoid for simple fades/slides (CSS) or when no designer will maintain the `.riv`.  
**Stack:** Rive
```tsx
// components/RiveLike.tsx
"use client";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

const SM = "State Machine 1";

export function RiveLike() {
  const { rive, RiveComponent } = useRive({ src: "/rive/like.riv", stateMachines: SM, autoplay: true });
  const liked = useStateMachineInput(rive, SM, "liked");
  return (
    <button type="button" aria-label="Like" aria-pressed={Boolean(liked?.value)}
      onClick={() => { if (liked) liked.value = !liked.value; }} className="h-16 w-16">
      <RiveComponent aria-hidden="true" />
    </button>
  );
}
```
**Tune:** size the parent (the canvas fills it); set `layout` fit/alignment via `new Layout({ fit: Fit.Contain })`.  
**A11y/perf:** ~59 kB JS plus a WASM binary fetched at runtime (self-host it via the runtime loader if your CSP blocks CDNs). The semantic control is YOUR button; the Rive canvas is decoration. Pause when offscreen; honour reduced motion by jumping the state machine to its end state.  
**Verdict:** best-in-class for interactive illustration; pair with a designer.

### 18. Lottie / dotLottie
**Purpose:** play After Effects animations exported via Bodymovin. dotLottie (`.lottie`, zipped JSON + assets) with the ThorVG WASM renderer is the modern path; `lottie-web` is the classic SVG/canvas player.  
**Install:** `npm i @lottiefiles/dotlottie-react` (or `lottie-web`)  
**Use when / avoid when:** illustrative loops, success checkmarks, empty states authored in AE. Avoid huge JSON (> 300 kB) hero animations: use video. Stock LottieFiles animations are an AI-slop tell; commission or skip.  
**Stack:** dotLottie
```tsx
// components/SuccessAnim.tsx
"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

export function SuccessAnim() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => { setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  return (
    <DotLottieReact src="/lottie/success.lottie" autoplay={!reduce} loop={false}
      style={{ width: 120, height: 120 }} aria-hidden="true" />
  );
}
```
```ts
// src/lottie-classic.ts - lottie-web light build (no expressions) is much smaller than the full player
import lottie from "lottie-web/build/player/lottie_light";
const anim = lottie.loadAnimation({ container: document.getElementById("hero-anim")!, renderer: "svg", loop: true, autoplay: true, path: "/lottie/hero.json" });
window.addEventListener("pagehide", () => anim.destroy());
```
**Tune:** `renderer: "svg"` for crisp small UI, `"canvas"` for many layers; `setSpeed(0.8-1.2)`.  
**A11y/perf:** dotLottie ~34 kB JS + WASM; lottie-web 77 kB (full) and `lottie-react` pulls the full player (196 kB measured): prefer dotLottie or the light build. Show the last frame for reduced motion.  
**Verdict:** dotLottie for new work; lottie-web only for legacy/expressions.

### 19. Spline
**Purpose:** browser 3D design tool; embed scenes with the Spline runtime. `@splinetool/react-spline/next` renders a server-side placeholder image while the runtime loads.  
**Install:** `npm i @splinetool/react-spline @splinetool/runtime`  
**Use when / avoid when:** a designer-built 3D hero where speed of iteration matters more than weight. The runtime is heavy (hundreds of kB plus the scene file): never more than one per page, never on low-end mobile without a poster fallback. "Floating glossy 3D blob from Spline community" is a 2023-2026 AI-landing cliche.  
**Stack:** Spline
```tsx
// app/page.tsx (excerpt) - Server Component; the /next entry handles the placeholder
import Spline from "@splinetool/react-spline/next";

export default function Home() {
  return (
    <section className="relative h-[100svh]">
      <Spline scene="https://prod.spline.design/your-scene-id/scene.splinecode" />
    </section>
  );
}
```
**Tune:** export scenes with compressed textures, fewest lights, no heavy post; limit orbit to small angles.  
**A11y/perf:** the canvas captures wheel/touch by default: disable scroll zoom in Spline to avoid trapping page scroll. Replace with a static render under `(max-width: 768px)` or `prefers-reduced-motion`.  
**Verdict:** great for prototypes and marketing heroes; for performance-critical 3D, rebuild in R3F.

### 20. Unicorn Studio
**Purpose:** no-code WebGL effects editor (layered shaders, noise, dithering, mouse-reactive gradients) with an embed SDK. `unicornstudio-react` is a community wrapper (not affiliated) that loads the proprietary SDK.  
**Install:** `npm i unicornstudio-react`  
**Use when / avoid when:** a designer wants a unique shader hero without writing GLSL. Avoid when you need full control/ownership of the effect code or strict CSP (third-party script + service).  
**Stack:** Unicorn Studio
```tsx
// components/UnicornHero.tsx
"use client";
import UnicornScene from "unicornstudio-react/next";

export function UnicornHero() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <UnicornScene projectId="YOUR_PROJECT_EMBED_ID" width="100%" height="100%" />
    </div>
  );
}
```
**Tune:** keep scale/DPR low in the editor for fullscreen scenes; limit mouse-reactive layers.  
**A11y/perf:** decorative only; supply a static fallback image for reduced motion and when WebGL fails.  
**Verdict:** fast path to distinctive shader visuals; accept the vendor lock-in knowingly.

### 21. Paper Shaders
**Purpose:** zero-dependency, tree-shakable shader components by Paper (MeshGradient, GrainGradient, Dithering, DotOrbit, Metaballs, Warp, Waves, etc.), React and vanilla.  
**Install:** `npm i @paper-design/shaders-react` (pin the exact version: pre-1.0, props change)  
**Use when / avoid when:** premium animated gradient/grain backgrounds in a few lines. Avoid stacking several on one page (each is its own WebGL context).  
**Stack:** Paper Shaders
```tsx
// components/GradientBg.tsx
"use client";
import { MeshGradient } from "@paper-design/shaders-react";

export function GradientBg() {
  return (
    <MeshGradient
      colors={["#0b0b0f", "#2a1bff", "#ff5c39", "#f2efe9"]}
      distortion={0.8}
      swirl={0.15}
      speed={0.25}
      style={{ position: "absolute", inset: 0, zIndex: -1 }}
    />
  );
}
```
**Tune:** `speed` 0.1-0.3 for backgrounds (faster is distracting); 3-4 colours from the brand palette, one dark anchor.  
**A11y/perf:** set `speed={0}` for reduced motion; `aria-hidden` wrapper.  
**Verdict:** best effort/quality ratio for animated gradients in 2026.

### 22. AutoAnimate
**Purpose:** one-line FLIP animations for children being added, removed or reordered in a parent (uses WAAPI).  
**Install:** `npm i @formkit/auto-animate`  
**Use when / avoid when:** todo lists, filters, tag inputs, accordions in admin UIs where you want polish for free. Avoid when you need choreography or custom exit timing (Motion `AnimatePresence` + `layout`).  
**Stack:** AutoAnimate
```tsx
// components/TagList.tsx
"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function TagList({ tags, onRemove }: { tags: string[]; onRemove: (t: string) => void }) {
  const [parent] = useAutoAnimate({ duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
  return (
    <ul ref={parent} className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t}><button type="button" onClick={() => onRemove(t)} aria-label={`Remove ${t}`}>{t} x</button></li>
      ))}
    </ul>
  );
}
```
**Tune:** duration 150-250 ms.  
**A11y/perf:** disables itself for `prefers-reduced-motion` by default (`disrespectUserMotionPreference: false`). Children must have stable keys.  
**Verdict:** best 3 kB you can add to a CRUD app.

### 23. NumberFlow
**Purpose:** animated number component: digits roll individually, formatting via `Intl.NumberFormat` (currency, compact, percent), width animates smoothly. Pure web component inside.  
**Install:** `npm i @number-flow/react`  
**Use when / avoid when:** pricing toggles (monthly/yearly), live counters, dashboards, stats. Avoid "count up from 0 on scroll" for every stat on a landing page: that is the cliche; animate only on real value changes.  
**Stack:** NumberFlow
```tsx
// components/PriceToggle.tsx
"use client";
import NumberFlow from "@number-flow/react";
import { useState } from "react";

export function PriceToggle() {
  const [yearly, setYearly] = useState(false);
  return (
    <div>
      <button type="button" aria-pressed={yearly} onClick={() => setYearly((y) => !y)}>{yearly ? "Yearly" : "Monthly"}</button>
      <NumberFlow value={yearly ? 190 : 19} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        suffix={yearly ? "/yr" : "/mo"} className="text-5xl font-semibold tabular-nums" />
    </div>
  );
}
```
**Tune:** `trend` (+1/-1/0) to force roll direction; `spinTiming`/`transformTiming` to match your easing tokens.  
**A11y/perf:** respects reduced motion by default; renders an accessible text value. SSR renders the formatted number (no layout shift).  
**Verdict:** use it for any number that changes in place.

### 24. Sonner
**Purpose:** opinionated toast system (stacking, swipe to dismiss, promise toasts). shadcn/ui's toast of record.  
**Install:** `npm i sonner` (or `npx shadcn@latest add sonner`)  
**Use when / avoid when:** transient feedback (saved, copied, error). Never for critical errors that need action (use inline or dialog).  
**Stack:** Sonner
```tsx
// app/layout.tsx (excerpt) - Toaster is a client component; fine to render from a Server layout
import { Toaster } from "sonner";
// <body>{children}<Toaster position="bottom-right" richColors closeButton /></body>
```
```tsx
// components/CopyButton.tsx
"use client";
import { toast } from "sonner";
export function CopyButton({ text }: { text: string }) {
  return (
    <button type="button" onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("Copied"), () => toast.error("Copy failed"))}>
      Copy
    </button>
  );
}
```
**Tune:** `duration` 3000-5000 ms; `visibleToasts` 3; `toast.promise(p, { loading, success, error })` for async.  
**A11y/perf:** toasts live in an `aria-live` region; do not put the only copy of important info there.  
**Verdict:** default toast library.

### 25. Vaul
**Purpose:** unstyled drag-to-dismiss drawer for React (built on Radix Dialog), with snap points and background scale.  
**Install:** `npm i vaul` (or shadcn `drawer`)  
**Use when / avoid when:** mobile bottom sheets, filters, quick actions. On desktop, pair with a Dialog (responsive "drawer on mobile, dialog on desktop"). Stable but rarely updated (1.1.2, Dec 2024): fine to use, pin it.  
**Stack:** Vaul
```tsx
// components/FilterSheet.tsx
"use client";
import { Drawer } from "vaul";

export function FilterSheet({ children }: { children: React.ReactNode }) {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger className="rounded-full border px-4 py-2">Filters</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 mt-24 flex max-h-[85svh] flex-col rounded-t-2xl bg-neutral-950 p-6">
          <div aria-hidden className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-700" />
          <Drawer.Title className="text-lg font-medium">Filters</Drawer.Title>
          <Drawer.Description className="sr-only">Refine the product list</Drawer.Description>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```
**Tune:** `snapPoints={[0.4, 1]}`; `shouldScaleBackground` needs `<div vaul-drawer-wrapper="">` around the app.  
**A11y/perf:** Radix handles focus trap, Esc and `aria-modal`. With Lenis active, add `data-lenis-prevent` on scrollable drawer content.  
**Verdict:** best drawer; the physics feel is the reference.

### 26. cmdk
**Purpose:** composable, unstyled command palette (fuzzy filter, keyboard nav, groups). Used by Vercel, Linear-likes, shadcn `command`.  
**Install:** `npm i cmdk`  
**Use when / avoid when:** apps and docs with many destinations/actions (Cmd+K). A command palette on a 4-page portfolio is decoration.  
**Stack:** cmdk
```tsx
// components/CommandMenu.tsx
"use client";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PAGES = [{ href: "/", label: "Home" }, { href: "/docs", label: "Docs" }, { href: "/pricing", label: "Pricing" }];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command menu" className="cmdk">
      <Command.Input placeholder="Search pages and actions..." />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Group heading="Pages">
          {PAGES.map((p) => (
            <Command.Item key={p.href} value={p.label} onSelect={() => { setOpen(false); router.push(p.href); }}>{p.label}</Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```
**Tune:** style `[cmdk-item][data-selected="true"]`; animate list height with `--cmdk-list-height` (`transition: height 150ms`).  
**A11y/perf:** built on Radix Dialog + combobox semantics; keep `label`.  
**Verdict:** default palette.

### 27. tw-animate-css
**Purpose:** Tailwind v4 CSS-first replacement for the old `tailwindcss-animate` JS plugin (1.0.7, 2023, v3-only). Provides `animate-in/out`, `fade-in`, `zoom-in-95`, `slide-in-from-top-2`, accordion/collapsible keyframes. shadcn/ui switched to it for Tailwind v4.  
**Install:** `npm i -D tw-animate-css`  
**Use when / avoid when:** enter/exit of Radix/shadcn primitives driven by `data-state`. For bespoke motion write your own `@keyframes` + tokens.  
**Stack:** CSS
```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
```
```tsx
// components/ui/popover-content.tsx (excerpt) - the shadcn pattern
<PopoverPrimitive.Content
  className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 duration-200"
/>
```
**Tune:** `duration-150`..`duration-300`, `ease-out`; zoom 95 (not 50: big zooms look cheap).  
**A11y/perf:** add `motion-reduce:animate-none` on the content or a global reduced-motion rule.  
**Verdict:** install it in every shadcn + Tailwind v4 project; never install `tailwindcss-animate` on v4.

### 28. Embla Carousel
**Purpose:** headless, dependency-free carousel engine with great drag physics; plugins for autoplay, class names, wheel gestures, auto-scroll, fade.  
**Install:** `npm i embla-carousel-react embla-carousel-autoplay`  
**Use when / avoid when:** any carousel you style yourself (shadcn `carousel` uses it). Avoid carousels for primary content that users must see (conversion data says they skip slides).  
**Stack:** Embla
```tsx
// components/Carousel.tsx
"use client";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

export function Carousel({ slides }: { slides: { id: string; src: string; alt: string }[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]);
  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  return (
    <section aria-roledescription="carousel" aria-label="Projects">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {slides.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.id} src={s.src} alt={s.alt} className="min-w-0 flex-[0_0_80%] rounded-xl md:flex-[0_0_40%]" />
          ))}
        </div>
      </div>
      <button type="button" onClick={prev} aria-label="Previous slide">Prev</button>
      <button type="button" onClick={next} aria-label="Next slide">Next</button>
    </section>
  );
}
```
**Tune:** `duration` 20-35 (Embla's scroll speed unit); `dragFree: true` for free-scroll galleries; `containScroll: "trimSnaps"`.  
**A11y/perf:** do not autoplay for reduced-motion users (skip the Autoplay plugin); provide buttons, not just drag.  
**Verdict:** default carousel.

### 29. Swiper 14
**Purpose:** batteries-included slider (effects: fade, cube, coverflow, creative, cards; pagination, thumbs, virtual slides). Exports `swiper/react`, `swiper/element`, `swiper/modules`, `swiper/css`.  
**Install:** `npm i swiper`  
**Use when / avoid when:** you need built-in effects/thumbs/virtualization fast (e-commerce galleries). For custom-designed carousels Embla is lighter and cleaner. Coverflow/cube effects look dated.  
**Stack:** Swiper
```tsx
// components/ProductGallery.tsx
"use client";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function ProductGallery({ images }: { images: string[] }) {
  return (
    <Swiper modules={[Navigation, Pagination, Keyboard, A11y]} navigation pagination={{ clickable: true }} keyboard
      spaceBetween={12} slidesPerView={1.1} breakpoints={{ 768: { slidesPerView: 2.2 } }}>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <SwiperSlide key={src}><img src={src} alt={`Product view ${i + 1}`} loading="lazy" /></SwiperSlide>
      ))}
    </Swiper>
  );
}
```
**Tune:** `speed` 400-600; fractional `slidesPerView` (1.1, 2.2) hints scrollability.  
**A11y/perf:** include the `A11y` and `Keyboard` modules; ~20 kB core + modules + CSS.  
**Verdict:** pragmatic for shops; Embla for design-led sites.

### 30. Splide
**Purpose:** accessible vanilla slider with good a11y defaults.  
**Install:** `npm i @splidejs/splide`  
**Use when / avoid when:** legacy projects only: last release 4.1.4 (Nov 2022) and `@splidejs/react-splide` 0.7.12 (2022). New work: Embla or Swiper.  
**Stack:** Vanilla
```ts
// src/splide-init.ts
import Splide from "@splidejs/splide";
import "@splidejs/splide/css";
new Splide(".splide", { type: "loop", perPage: 3, gap: "1rem", breakpoints: { 768: { perPage: 1 } } }).mount();
```
**Tune / A11y/perf:** a11y is its strength (live region, labels built in).  
**Verdict:** stale; do not start new projects on it.

### 31. Swup, Barba, next-view-transitions
**Purpose:** page-transition routers. Full recipes live in `page-transitions.md` ([Swup](page-transitions.md#15-swup-4), [Barba](page-transitions.md#16-barba-2--gsap), [React VT](page-transitions.md#4-react-193-viewtransition--next-16-routes)).  
**Install:** `npm i swup @swup/a11y-plugin @swup/preload-plugin` | `npm i @barba/core` | `npm i next-view-transitions`  
**Use when / avoid when:** Swup 4.10 (active, 9.2 kB) for static/CMS MPAs; Barba 2.10 (slow, last release Aug 2024) only for existing Barba sites; `next-view-transitions` 0.3.5 is superseded in Next 16.3 by React 19.3's stable `<ViewTransition>` + `<Link transitionTypes>`, which need no library.  
**Stack:** Vanilla | Next
```tsx
// app/layout.tsx - next-view-transitions (legacy Next 14/15 path; shown for migration)
import { ViewTransitions } from "next-view-transitions";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en"><body>{children}</body></html>
    </ViewTransitions>
  );
}
// then: import { Link, useTransitionRouter } from "next-view-transitions"
```
**Tune / A11y/perf:** see `page-transitions.md`.  
**Verdict:** Next 16: no library. MPA: Swup. Barba: maintain, do not start.

### 32. tsParticles v4
**Purpose:** configurable particle systems (links, snow, confetti, fireworks) on canvas with presets and bundles (`slim`, `full`, per-feature).  
**Install:** `npm i @tsparticles/react @tsparticles/slim`  
**Use when / avoid when:** playful/event sites, holiday effects. The linked-dots "network" background is a 2016 cliche that screams template; if you need ambient motion prefer a subtle shader (recipe 14/21).  
**Stack:** tsParticles
```tsx
// components/Snow.tsx - v4 API: ParticlesProvider registers features once
"use client";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

const options: ISourceOptions = {
  fullScreen: { enable: true, zIndex: -1 },
  fpsLimit: 60,
  particles: {
    number: { value: 60 },
    color: { value: "#ffffff" },
    opacity: { value: { min: 0.2, max: 0.7 } },
    size: { value: { min: 1, max: 3 } },
    move: { enable: true, speed: 0.8, direction: "bottom", straight: false },
  },
  detectRetina: true,
  motion: { disable: false, reduce: { factor: 4, value: true } }, // honours prefers-reduced-motion
};

export function Snow() {
  return (
    <ParticlesProvider init={async (engine) => { await loadSlim(engine); }}>
      <Particles id="snow" options={options} />
    </ParticlesProvider>
  );
}
```
**Tune:** particle count 30-80 (mobile half); `fpsLimit` 60.  
**A11y/perf:** canvas redraw every frame: pause offscreen; the `motion.reduce` option cuts particles for reduced motion.  
**Verdict:** fine for seasonal fun; rarely the premium choice.

### 33. canvas-confetti
**Purpose:** fire-and-forget confetti bursts on a transient canvas.  
**Install:** `npm i canvas-confetti` and `npm i -D @types/canvas-confetti`  
**Use when / avoid when:** a genuine success moment (purchase, signup, level up), once. Confetti on every button click is noise.  
**Stack:** canvas-confetti
```ts
// lib/celebrate.ts
"use client";
import confetti from "canvas-confetti";

export function celebrate(origin?: { x: number; y: number }): void {
  const defaults = { disableForReducedMotion: true, zIndex: 3000, ticks: 180, colors: ["#d8ff3d", "#f2efe9", "#2a1bff"] };
  void confetti({ ...defaults, particleCount: 70, spread: 70, startVelocity: 38, origin: origin ?? { x: 0.5, y: 0.7 } });
  window.setTimeout(() => void confetti({ ...defaults, particleCount: 40, spread: 110, scalar: 0.8, origin: origin ?? { x: 0.5, y: 0.7 } }), 150);
}
// origin from a click: { x: e.clientX / innerWidth, y: e.clientY / innerHeight }
```
**Tune:** two bursts 100-200 ms apart feel richer than one big burst; brand colours only.  
**A11y/perf:** `disableForReducedMotion: true`; 4.3 kB; dynamic-import it inside the handler to keep it out of the main bundle.  
**Verdict:** the right tiny tool.

### 34. Matter.js
**Purpose:** 2D rigid-body physics (gravity, collisions, mouse drag). Famous for "falling tags/pills" heroes and playful footers.  
**Install:** `npm i matter-js` and `npm i -D @types/matter-js`  
**Use when / avoid when:** a single playful physics moment (skills pile, sticker drop). Last release 0.20.0 (Jun 2024): stable but slow. For 3D physics use Rapier.  
**Stack:** Matter + DOM
```tsx
// components/PhysicsTags.tsx - DOM tags driven by Matter bodies
"use client";
import Matter from "matter-js";
import { useEffect, useRef } from "react";

const TAGS = ["TypeScript", "React", "WebGL", "GSAP", "Figma", "Motion"];

export function PhysicsTags() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;
    const w = el.clientWidth, h = el.clientHeight;
    const engine = Engine.create({ gravity: { y: 1 } });
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(".tag"));
    const bodies = nodes.map((n, i) =>
      Bodies.rectangle(80 + ((i * 97) % (w - 160)), -60 * (i + 1), n.offsetWidth, n.offsetHeight, { chamfer: { radius: n.offsetHeight / 2 }, restitution: 0.4 }));
    const walls = [
      Bodies.rectangle(w / 2, h + 25, w, 50, { isStatic: true }),
      Bodies.rectangle(-25, h / 2, 50, h * 2, { isStatic: true }),
      Bodies.rectangle(w + 25, h / 2, 50, h * 2, { isStatic: true }),
    ];
    const mouse = Mouse.create(el);
    // Matter 0.20 binds a non-passive 'wheel' listener that swallows page scroll: remove it
    const wheel = (mouse as unknown as { mousewheel: EventListener }).mousewheel;
    el.removeEventListener("wheel", wheel);
    const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2 } });
    Composite.add(engine.world, [...bodies, ...walls, drag]);
    nodes.forEach((n) => Object.assign(n.style, { position: "absolute", left: "0", top: "0" })); // leave static layout only now
    const sync = () => bodies.forEach((b, i) => {
      nodes[i].style.transform = `translate(${b.position.x - nodes[i].offsetWidth / 2}px, ${b.position.y - nodes[i].offsetHeight / 2}px) rotate(${b.angle}rad)`;
    });
    Events.on(engine, "afterUpdate", sync);
    const runner = Runner.create();
    Runner.run(runner, engine);
    return () => {
      Runner.stop(runner);
      Events.off(engine, "afterUpdate", sync);
      Mouse.clearSourceEvents(mouse);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      nodes.forEach((n) => Object.assign(n.style, { position: "", left: "", top: "", transform: "" }));
    };
  }, []);
  return (
    // static, readable layout by default (SSR, reduced motion); physics takes over on mount
    <div ref={box} className="relative flex h-[60svh] flex-wrap content-end gap-2 overflow-hidden p-6">
      {TAGS.map((t) => <span key={t} className="tag rounded-full border px-5 py-2">{t}</span>)}
    </div>
  );
}
```
**Tune:** `restitution` 0.3-0.6; gravity 0.8-1.2; start the drop when the section enters view (IntersectionObserver).  
**A11y/perf:** reduced motion and SSR show the static flex layout (the effect never starts). Tags stay real text, so they remain readable and selectable. Pause the runner when offscreen.  
**Verdict:** fun, cheap (26 kB), use once per site.

### 35. Rapier / @react-three/rapier
**Purpose:** fast Rust/WASM physics engine; `@react-three/rapier` wraps it for R3F (`<Physics>`, `<RigidBody>`, colliders, joints).  
**Install:** `npm i @react-three/rapier`  
**Use when / avoid when:** 3D physics toys (draggable lanyard badge, falling objects, ball pits) in R3F. Heavy WASM: lazy-load with the canvas.  
**Stack:** R3F + Rapier
```tsx
// components/three/PhysicsPit.tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { Suspense } from "react";

export default function PhysicsPit() {
  return (
    <Canvas camera={{ position: [0, 4, 10], fov: 40 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} />
      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          {Array.from({ length: 24 }, (_, i) => (
            <RigidBody key={i} colliders="ball" position={[(i % 6) - 2.5, 4 + Math.floor(i / 6) * 1.2, 0]} restitution={0.5}>
              <mesh><sphereGeometry args={[0.45, 32, 32]} /><meshStandardMaterial color={i % 3 ? "#e6e1d6" : "#d8ff3d"} /></mesh>
            </RigidBody>
          ))}
          <CuboidCollider args={[8, 0.5, 4]} position={[0, -1, 0]} />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
```
**Tune:** `timeStep="vary"` for high-refresh displays; fewer bodies on mobile.  
**A11y/perf:** decorative canvas; freeze (`paused`) for reduced motion. Pair with `SceneLazy` pattern from recipe 12.  
**Verdict:** the 3D physics choice in 2026.

### 36. SplitType / Splitting.js vs GSAP SplitText
**Purpose:** split text into lines/words/chars for staggered reveals.  
**Install:** `gsap` (SplitText included) | `npm i split-type` | `npm i splitting`  
**Use when / avoid when:** since GSAP 3.13 SplitText is free, smaller, handles masks, re-splits on resize/font load (`autoSplit` + `onSplit`), and manages ARIA. SplitType (0.3.4, Oct 2023) is unmaintained and does not re-split responsively on its own; Splitting.js (1.1.0) is tiny and CSS-variable based (`--char-index`), good for pure-CSS staggers without GSAP.  
**Stack:** GSAP | CSS
| | GSAP SplitText | SplitType | Splitting.js |
|---|---|---|---|
| Lines/words/chars | yes | yes | chars/words (+ lines plugin) |
| Line masks | `mask: "lines"` built in | manual wrappers | manual |
| Re-split on resize/fonts | `autoSplit: true` + `onSplit` | manual | manual |
| ARIA handling | automatic (`aria: "auto"`) | manual | manual |
| Maintained 2026 | yes | no | minimal |
```tsx
// components/SplitHeading.tsx
"use client";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, SplitText);

export function SplitHeading({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      SplitText.create(ref.current, {
        type: "lines,words", mask: "lines", autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 1, ease: "expo.out", stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 85%" } }),
      });
    });
  }, { scope: ref });
  return <h2 ref={ref}>{children}</h2>;
}
```
```html
<!-- Splitting.js: CSS-only stagger -->
<h2 data-splitting>Quiet motion</h2>
<script type="module">import Splitting from "splitting"; Splitting();</script>
<style>
  .char { display: inline-block; animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: calc(var(--char-index) * 25ms); }
  @keyframes rise { from { transform: translateY(0.6em); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .char { animation: none; } }
</style>
```
**Tune / A11y/perf:** see `text-effects.md` for full split recipes; never split body paragraphs (screen readers and performance suffer).  
**Verdict:** GSAP SplitText in any GSAP project; Splitting.js for no-GSAP CSS staggers; drop SplitType.

### 37. 21st.dev Magic MCP
**Purpose:** MCP server that lets the coding agent search 21st.dev's community component registry (`search`, `get_component`) and, when AI access is enabled on the account, generate/iterate components. Since `@21st-dev/magic` 0.2.0 the npm package is only a stdio proxy to the hosted HTTP server `https://21st.dev/api/mcp`.  
**Install:** `npx @21st-dev/cli@latest init --client claude` (or add the HTTP server manually). Old Magic-console API keys were reset: create a new key at 21st.dev/mcp.  
**Use when / avoid when:** discovering a starting point for a component type (pricing table, hero, bento). Always restyle to your tokens and strip the Aceternity-clone defaults (spotlights, beams, glow borders) unless the aesthetic calls for them; see `component-recipes.md`.  
**Stack:** MCP config
```json
{
  "mcpServers": {
    "21st": {
      "url": "https://21st.dev/api/mcp",
      "headers": { "x-api-key": "YOUR_21ST_API_KEY" }
    }
  }
}
```
```bash
# Claude Code CLI equivalent (keep the key in an env var, never commit it)
claude mcp add --transport http 21st https://21st.dev/api/mcp --header "x-api-key: $TWENTY_FIRST_API_KEY"
```
**Tune:** check `get_usage.aiGenerationEnabled`; without AI access use `search` + `get_component` and adapt the code yourself.  
**A11y/perf:** registry components vary wildly in a11y: audit focus states, reduced motion and semantic markup before shipping.  
**Verdict:** useful for inspiration and scaffolding; never paste-and-ship.

## Decision matrix
Scores: +++ best fit, ++ good, + possible, - wrong tool.

| Need | CSS / WAAPI | GSAP | Motion | anime v4 | React VT | Lenis | R3F/three | OGL / Paper | Rive | dotLottie |
|---|---|---|---|---|---|---|---|---|---|---|
| Hover / focus / press states | +++ | + | ++ | + | - | - | - | - | ++ (icons) | - |
| Enter/exit of React nodes | + (`@starting-style`) | - | +++ | - | ++ | - | - | - | - | - |
| Shared element (same page) | + | ++ (Flip) | +++ (`layoutId`) | - | ++ | - | - | - | - | - |
| Shared element (across routes) | - | + | + | - | +++ | - | - | - | - | - |
| Scroll-triggered reveals | ++ (scroll-driven CSS) | +++ | ++ | ++ | - | - | - | - | - | - |
| Pin + scrub storytelling | + | +++ | + | + | - | ++ (companion) | - | - | - | - |
| Split-text reveals | + (Splitting) | +++ | + | ++ | - | - | - | - | - | - |
| SVG draw / morph | ++ (dashoffset) | +++ | ++ | ++ | - | - | - | - | ++ | ++ |
| Route curtains / preloaders | - | +++ | ++ | + | ++ (simple) | - | - | - | - | + |
| Smooth scroll | - | ++ (ScrollSmoother) | - | - | - | +++ | - | - | - | - |
| Shader backgrounds | - | - | - | - | - | - | ++ | +++ | - | - |
| Real 3D models | - | - | - | - | - | - | +++ | - | - | - |
| Interactive illustration | - | + | - | - | - | - | + | - | +++ | + |
| Designer AE animation | - | - | - | - | - | - | - | - | + | +++ |
| Bundle cost | 0 | 27 kB+ | 5-34 kB | 10-40 kB | 0 | 5.5 kB | 240 kB+ | 5-34 kB | 59 kB + WASM | 34 kB + WASM |

## Recommended stacks per project type
| Project | Core | Add only if needed | Avoid |
|---|---|---|---|
| Awwwards portfolio / studio site | GSAP (ScrollTrigger, SplitText, Flip, CustomEase) + @gsap/react + Lenis; GSAP overlay route transitions (`page-transitions.md#7-gsap-overlay-route-transitions-the-awwwards-default`); CSS for hovers | OGL or Paper Shaders for one hero shader; R3F if there is real 3D; Motion only for small React-state UI | Stacking Motion + GSAP + anime; Locomotive + Lenis; tsParticles networks; 3 s fake preloaders |
| SaaS landing page | CSS + Motion (LazyMotion + `m`) for reveals and UI demos; React `<ViewTransition>` for route changes; NumberFlow for pricing; tw-animate-css | GSAP ScrollTrigger for ONE pinned product walkthrough; Rive for an interactive illustration; Paper MeshGradient hero | Lenis on a conversion page with forms; Spline blob heroes; confetti on CTA clicks |
| Product app UI / dashboard | CSS transitions + tw-animate-css (shadcn) + Motion for layout/presence; Sonner, Vaul, cmdk; AutoAnimate for lists; React VT for navigation | NumberFlow for metrics; Embla for carousels | Smooth scroll, preloaders, page curtains, scroll-scrubbed anything |
| E-commerce | CSS + Motion; React VT shared image list->detail; Embla or Swiper (thumbs/zoom) product gallery; Vaul filter sheet on mobile; Sonner "added to cart" | GSAP for campaign/lookbook pages only; canvas-confetti on order confirmation | Heavy WebGL on PLP/PDP (hurts LCP and INP); autoplaying carousels as primary content |
| Docs / blog | CSS only (+ native cross-document `@view-transition` or React VT crossfade); cmdk search | Motion for interactive explainers; Rive/Lottie inside articles | Lenis, preloaders, page transitions > 300 ms |
| 3D showcase / product configurator | three + R3F + drei + postprocessing (subtle); drei `useProgress` preloader; GSAP for camera timelines and UI; Lenis if scroll-driven | @react-three/rapier for physics; Theatre only if already in the team; Spline for fast prototypes | Multiple canvases (use drei `<View>`); unbounded DPR; post-processing stacks on mobile |

## Gotchas
- **`framer-motion` and `motion` both installed**: two copies of the same engine ship (65 + 48 kB). Migrate imports to `motion/react` and remove `framer-motion` (versions are identical, 13.4.4).
- **Full `motion.*` inside `LazyMotion`**: silently loads the whole feature set. Use `m.*` from `motion/react-m` and `<LazyMotion strict>` to throw on mistakes.
- **Motion in Server Components**: `import { motion } from "motion/react"` in an RSC errors; use `import * as motion from "motion/react-client"` or a `"use client"` wrapper.
- **GSAP plugin not registered** after tree-shaking in production (works in dev): always `gsap.registerPlugin(...)` in one shared client module and import from it.
- **ScrollTrigger + Lenis out of sync** (jitter on pinned sections): drive Lenis from `gsap.ticker` with `autoRaf: false`, call `ScrollTrigger.update` on Lenis scroll, `lagSmoothing(0)`.
- **Lenis + ScrollSmoother or Locomotive together**: two scroll hijackers fight; pick one.
- **Nested scroll areas dead under Lenis** (modals, code blocks, drawers): add `data-lenis-prevent` to the scrollable element.
- **`@studio-freight/lenis` / `@studio-freight/react-lenis` in old tutorials**: dead packages; use `lenis` and `lenis/react`.
- **`next/dynamic` with `ssr: false` in a Server Component** fails in the App Router: move the dynamic import into a `"use client"` file.
- **WebGL context limit** (~16 per page in Chrome): one canvas per card or several Paper/OGL backgrounds on one page will start losing contexts. Use one canvas + drei `<View>`, or render offscreen scenes as images.
- **`lottie-react` bundle size**: it pulls the full lottie-web player (196 kB measured). Use dotLottie or `lottie-web/build/player/lottie_light`.
- **Rive/dotLottie WASM blocked by CSP** or slow CDN: self-host the WASM and point the runtime loader at it.
- **Spline/Unicorn scenes trap scroll or tank mobile**: disable zoom/scroll capture in the editor and swap in a poster below 768 px.
- **tailwindcss-animate on Tailwind v4** does nothing (JS plugin API changed): use `@import "tw-animate-css";`.
- **SplitType lines break on resize/font swap**: switch to GSAP SplitText `autoSplit` + `onSplit` (returning the tween so it is reverted and rebuilt).
- **anime.js v3 snippets** (`anime({ targets })`, `easing: "easeOutExpo"`) break on v4: use `animate(targets, { ease: "outExpo" })`.
- **Theatre studio shipped to production**: dynamic-import `@theatre/studio` in dev only.
- **Swiper CSS missing** (`swiper/css` and per-module CSS): slides stack vertically. Import the CSS in the client component or globally.
- **Matter.js swallows page scroll**: remove its `wheel` listener (recipe 34).
- **Library defaults ignore reduced motion** (GSAP, anime.js, Matter, Pixi, OGL): you must branch with `gsap.matchMedia()` / `matchMedia`. Built in: Motion (`reducedMotion="user"`), Lenis, AutoAnimate, NumberFlow, canvas-confetti (`disableForReducedMotion`), tsParticles (`motion.reduce`), Astro ClientRouter.

## Sources
- npm registry (`npm view <pkg> version time.modified dist.unpackedSize exports readme`) for every package above, 2026-09-26
- https://bundlephobia.com/api/size?package=<pkg> (gzip sizes, 2026-09-26)
- https://gsap.com/docs/v3/Installation , https://gsap.com/docs/v3/Plugins/ , https://gsap.com/resources/React , https://gsap.com/standard-license
- https://motion.dev/docs/react , https://motion.dev/docs/react-reduce-bundle-size , https://motion.dev/docs/react-animate-view , https://motion.dev/docs/animate
- https://animejs.com/documentation (v4 API: animate, createTimeline, stagger, createScope)
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- https://github.com/darkroomengineering/lenis (README + packages/react/README.md: autoRaf, LenisRef, GSAP ticker sync, reduced-motion default, anchors, stopInertiaOnNavigate)
- https://github.com/locomotivemtl/locomotive-scroll (v5 README via npm)
- https://www.theatrejs.com/docs/latest
- https://threejs.org/docs/ , https://r3f.docs.pmnd.rs/ , https://drei.docs.pmnd.rs/ , https://github.com/pmndrs/postprocessing
- https://github.com/oframe/ogl , https://github.com/regl-project/regl , https://pixijs.com/8.x/guides
- https://rive.app/docs/runtimes/react/react , https://developers.lottiefiles.com/docs/dotlottie-player/dotlottie-react/
- https://github.com/splinetool/react-spline , https://github.com/diegopeixoto/unicornstudio-react (README via npm, types checked), https://github.com/paper-design/shaders
- https://auto-animate.formkit.com/ , https://number-flow.barvian.me/ , https://sonner.emilkowal.ski/ , https://vaul.emilkowal.ski/ , https://github.com/pacocoursey/cmdk
- https://github.com/Wombosvideo/tw-animate-css , https://ui.shadcn.com/docs/tailwind-v4
- https://www.embla-carousel.com/ , https://swiperjs.com/react , https://splidejs.com/
- https://swup.js.org/ , https://barba.js.org/ , https://github.com/shuding/next-view-transitions
- https://github.com/tsparticles/tsparticles (v4 `@tsparticles/react` types: ParticlesProvider/init, Particles), https://github.com/catdad/canvas-confetti
- https://github.com/liabru/matter-js (0.20.0 source: Mouse wheel listener), https://rapier.rs/ , https://github.com/pmndrs/react-three-rapier
- https://www.react-spring.dev/ , https://github.com/lukePeavey/SplitType , https://splitting.js.org/ , https://gsap.com/docs/v3/Plugins/SplitText/
- https://21st.dev/mcp (and `@21st-dev/magic` 0.2.3 README)
