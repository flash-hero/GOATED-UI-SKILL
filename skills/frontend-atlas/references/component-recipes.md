# Component Recipes: 21st.dev, Aceternity, Magic UI, React Bits, Motion Primitives and co.
> Load when: the job names or implies a "known" animated component (bento, marquee, border beam, shimmer button, spotlight, lamp, beams, globe, dock, number ticker, sticky scroll, 3D card, testimonials marquee, avatar stack, compare slider, mockups...), when choosing between registry install vs owning the code, or when composing a landing/portfolio section from proven parts.
> Stack assumptions: React 19 / Next 16 App Router + TS, Tailwind v4.3 (CSS-first), `motion` 13 (`motion/react`), GSAP 3.15 where noted. Every "Own it" recipe below runs without the source library. Registry facts verified 2026-09-26.

## Contents
- [Registry & install cheat-sheet](#registry--install-cheat-sheet)
- [Shared base (tokens, cn, media hooks)](#shared-base)
- [Overuse score legend](#overuse-score-legend)
- [Decision guide](#decision-guide)
- [Recipes](#recipes)
  - [A. Hero & backgrounds](#a-hero--backgrounds) - 1 Spotlight, 2 Lamp, 3 Background beams, 4 Meteors, 5 Particles / Sparkles, 6 Retro grid, 7 Flickering grid, 8 Dot / grid / animated grid pattern, 9 Ripple, 10 Aurora background, 11 Wavy background, 12 Light rays, 13 Noise texture, 14 Globe, 15 World map
  - [B. Text](#b-text) - 16 Gradient / aurora text, 17 Animated shiny text, 18 Text generate + blur fade, 19 Typewriter, 20 Flip words / word rotate, 21 Morphing text, 22 Text reveal on scroll, 23 Number ticker, 24 Circular text, 25 Hyper / decrypted text
  - [C. Buttons & borders](#c-buttons--borders) - 26 Shimmer button, 27 Border beam / border trail, 28 Shine border / moving border / hover border gradient, 29 Rainbow button, 30 Pulsating button, 31 Interactive hover button, 32 Cool mode / click spark / confetti, 33 Star border
  - [D. Cards](#d-cards) - 34 Magic card / card spotlight, 35 Glowing effect, 36 3D card / tilted card, 37 Focus cards, 38 Expandable card, 39 Stack / swipe cards, 40 Pixel card, 41 Apple cards carousel, 42 Scratch to reveal
  - [E. Layout & sections](#e-layout--sections) - 43 Bento grid, 44 Marquee / infinite moving cards / logo loop, 45 Sticky scroll reveal, 46 Container scroll (tilted tablet), 47 Hero parallax, 48 Parallax scroll columns, 49 Tracing beam, 50 Timeline, 51 Layout grid, 52 Masonry, 53 Compare slider, 54 Animated tabs, 55 Infinite menu
  - [F. Navigation](#f-navigation) - 56 Floating navbar, 57 Dock
  - [G. Data & social proof](#g-data--social-proof) - 58 Animated list, 59 Animated tooltip avatar stack, 60 Orbiting circles, 61 Animated beam, 62 Hero video dialog
  - [H. Mockups](#h-mockups) - 63 Safari / iPhone frames, 64 Terminal animation, 65 Code comparison
  - [I. Cursor & fun](#i-cursor--fun) - 66 Splash cursor, 67 Blob cursor
- [Recipe combos](#recipe-combos)
- [How to find more](#how-to-find-more)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Registry & install cheat-sheet

shadcn CLI (3.x+/4.x) ships a built-in directory of namespaced registries (`https://ui.shadcn.com/r/registries.json`, 382 entries on 2026-09-26). `npx shadcn@latest add @ns/name` works with zero config; the raw JSON URL works everywhere too. Items copy source into `components/ui/`, install npm deps, and (when the item declares `css`/`cssVars`) patch `globals.css`.

| Library | CLI (namespace) | Raw registry URL | Typical deps | Notes that bite |
|---|---|---|---|---|
| Magic UI (magicui.design, 22k stars) | `npx shadcn@latest add @magicui/marquee` | `https://magicui.design/r/marquee.json` | `motion`; per item `cobe`, `canvas-confetti`, `shiki`, `react-tweet` | MIT. Items ship their keyframes in the registry `css` field, CLI writes them into `@theme`. `smooth-cursor` still imports `framer-motion`. `iphone-15-pro` is now `iphone`. |
| Aceternity UI (ui.aceternity.com) | `npx shadcn@latest add @aceternity/background-beams` | `https://ui.aceternity.com/registry/<name>.json` | `motion clsx tailwind-merge`; per item `@tabler/icons-react`, `simplex-noise`, `@tsparticles/*`, `three @react-three/fiber`, `dotted-map` | Registry items ship NO keyframes: copy the `@theme` snippet from each docs page (spotlight, aurora, scroll...). Some items now 401 without a token (e.g. `github-globe`); blocks are paid "All-Access". shadcn directory marks it "degraded". |
| React Bits (reactbits.dev, 48k stars) | `npx shadcn@latest add @react-bits/SplashCursor-TS-TW` | `https://reactbits.dev/r/<Name>-<TS or JS>-<TW or CSS>.json` | per item: `motion`, `gsap`, `ogl`, `three`, `gl-matrix`, `matter-js` | 209 components x 4 variants. License MIT + Commons Clause (you may use in products, not resell the components). Also `jsrepo`. |
| Motion Primitives (motion-primitives.com) | `npx motion-primitives@latest add border-trail` or `npx shadcn@latest add @motion-primitives/border-trail` | `https://motion-primitives.com/c/<name>.json` | `motion`, `react-use-measure` (infinite-slider) | MIT, ~33 primitives (text-effect, morphing-dialog, animated-background, infinite-slider, border-trail, spotlight, tilt, glow-effect). |
| Animate UI (animate-ui.com) | `npx shadcn@latest add @animate-ui/components-backgrounds-bubble` | `https://animate-ui.com/r/<layer>-<group>-<name>.json` | `motion`, `tw-animate-css` | Two layers: `primitives-*` (unstyled, Radix/Base UI/Headless variants) and `components-*` (styled). Names are path-like: `components-animate-tabs`, `primitives-effects-magnetic`. |
| Cult UI (cult-ui.com) | `npx shadcn@latest add @cult-ui/dynamic-island` | `https://cult-ui.com/r/<name>.json` | `motion`; some shader items | Distinct pieces: dynamic-island, texture-card, texture-button, hero-dithering, hero-liquid-metal, three-d-carousel, family-drawer, direction-aware-tabs. Site sits behind a Vercel bot checkpoint (curl gets a challenge page; the CLI works). |
| Kokonut UI (kokonutui.com) | `npx shadcn@latest add @kokonutui/particle-button` | `https://kokonutui.com/r/<name>.json` | `motion`, `lucide-react` | 51 items: background-paths, beams-background, liquid-glass-card, hold-button, attract-button, action-search-bar, AI inputs. |
| Skiper UI (skiper-ui.com) | `npx shadcn@latest add @skiper-ui/skiper16` | `https://skiper-ui.com/registry/skiper<N>.json` | `framer-motion` (legacy import path), `lenis`, `gsap`, `swiper` | Numbered items; public index has 37 (card stack scroll, perspective carousels, gooey, svg follow scroll); many are pro-only. Rewrite `framer-motion` imports to `motion/react`. |
| Origin UI, now coss ui | `npx shadcn@latest add @coss/<name>` | `https://coss.com/ui/r/<name>.json` | Base UI | `originui.com` 301-redirects to `coss.com/ui`. Forms/controls, not "wow" effects. |
| shadcnblocks / Tailark | `@shadcnblocks/<name>`, `@tailark/<name>` | `https://shadcnblocks.com/r/<name>.json` | - | Whole marketing sections. Many paid. |
| 21st.dev | `npx @21st-dev/cli@latest add <user>/<slug>` | `npx shadcn@latest add "https://21st.dev/r/<user>/<slug>"` | whatever the author used | 12k+ community items. Code retrieval is METERED: free daily quota, login or API key required (an anonymous GET of `/r/...` returns `authentication_required`). "Magic MCP" was renamed "21st MCP"; setup `npx @21st-dev/cli@latest init --client claude`. |

Rules of thumb:
- Registry code is a starting point you now own. Re-theme it on day one (colors, radius, easing tokens) or it will read as "installed from a registry".
- Check each file for `"use client"`, `window` at module scope, `Math.random()` in render (hydration mismatch), un-cleaned `setTimeout`/listeners, and missing `prefers-reduced-motion`. Most registry items fail at least one.
- Prefer `motion/react` imports. If an item imports `framer-motion`, either install it or rewrite the import (API is identical).

## Shared base

All "Own it" recipes assume these three files.

```css
/* app/globals.css */
@import "tailwindcss";

/* Hide-until-hover states must only apply where hover exists. Tailwind v4's hover: is already gated,
   but a plain lg:opacity-0 is not: a landscape iPad is lg-wide with no hover and would never see it. */
@custom-variant can-hover (@media (hover: hover) and (pointer: fine));

:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1);
  --dur-fast: 150ms;
  --dur-base: 300ms;
  --dur-slow: 600ms;
  --fx-accent: oklch(0.72 0.17 250);
  --fx-accent-2: oklch(0.7 0.2 320);
  --fx-line: color-mix(in oklab, currentColor 12%, transparent);
}

/* Any infinite decorative loop gets .fx-loop so one rule can stop them all. */
@media (prefers-reduced-motion: reduce) {
  .fx-loop,
  .fx-loop::before,
  .fx-loop::after {
    animation: none !important;
  }
}
```

```ts
// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

```ts
// lib/fx-hooks.ts
"use client";
import { useCallback, useSyncExternalStore } from "react";

export function useMedia(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const usePrefersReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/** Stable CSS-safe id for SVG defs (React 19 useId output contains characters that break url(#id)). */
export const cssId = (reactId: string) => reactId.replace(/[^a-zA-Z0-9_-]/g, "");
```

## Overuse score legend

Scores are for 2026 marketing/portfolio sites. They measure how strongly the component, with default props, signals "assembled from a registry / generated by AI".

| Score | Meaning | What to do |
|---|---|---|
| 1 | Rare, still reads as crafted | Use freely |
| 2 | Seen, but neutral | Tune tokens to the brand |
| 3 | Common; fine when restrained | Change at least 2 of: color, timing, geometry, trigger |
| 4 | Strong template signal | Only with a concept reason; restyle heavily; one per page |
| 5 | Instant AI-slop tell (purple-orange gradients, default demo copy/layout) | Avoid, or rebuild the mechanic in a totally different skin |

## Decision guide

| Goal / feel | Component | Cost (CSS / JS / GPU) | Recipe |
|---|---|---|---|
| Dark hero needs a focal glow without imagery | Spotlight (static SVG blur) or Lamp | CSS + 0 kb / 0-motion / low | [1](#1-spotlight), [2](#2-lamp-effect) |
| "Alive" hero background, low distraction | Flickering grid, dot pattern + noise, light rays | Canvas 2D ~1 kb / low | [7](#7-flickering-grid), [8](#8-dot--grid--animated-grid-pattern), [12](#12-light-rays), [13](#13-noise-texture) |
| Interactive hero depth | Particles (mouse magnetism), Globe (cobe ~5 kb WebGL) | Canvas / WebGL, medium | [5](#5-particles--sparkles), [14](#14-globe-cobe) |
| Synthwave / dev-tool nostalgia | Retro grid | CSS 3D transform, low | [6](#6-retro-grid) |
| Draw eye to the one CTA | Shimmer button / border beam | CSS only | [26](#26-shimmer-button), [27](#27-border-beam--border-trail) |
| Feature overview in one screen | Bento grid with live mini-demos inside cells | CSS grid | [43](#43-bento-grid) |
| Logos / testimonials social proof | Marquee (CSS), avatar stack tooltip | CSS only | [44](#44-marquee--infinite-moving-cards--logo-loop), [59](#59-animated-tooltip-avatar-stack) |
| Explain integrations / data flow | Animated beam, orbiting circles | SVG + JS measure / CSS | [61](#61-animated-beam), [60](#60-orbiting-circles) |
| Product screenshot reveal on scroll | Container scroll (tilt to flat), Safari frame | Motion scroll-linked | [46](#46-container-scroll-tilted-tablet), [63](#63-safari--iphone-frames) |
| Step-by-step product story | Sticky scroll reveal, timeline, tracing beam | IO / scroll-linked | [45](#45-sticky-scroll-reveal), [50](#50-timeline), [49](#49-tracing-beam) |
| Stats that feel earned | Number ticker (spring, in-view once) | Motion ~0 extra | [23](#23-number-ticker) |
| Hover delight on cards | Magic card spotlight, glowing effect, 3D tilt | CSS vars + pointer | [34](#34-magic-card--card-spotlight), [35](#35-glowing-effect), [36](#36-3d-card--tilted-card) |
| Portfolio gallery with personality | Focus cards, expandable card, stack cards, masonry | CSS / Motion layout | [37](#37-focus-cards), [38](#38-expandable-card), [39](#39-stack--swipe-cards), [52](#52-masonry) |
| Before/after | Compare slider | CSS clip-path + range input | [53](#53-compare-slider) |
| Dev-tool hero | Terminal animation + code comparison | JS timers | [64](#64-terminal-animation), [65](#65-code-comparison) |
| Playful click feedback | Cool mode / confetti | Canvas or DOM particles | [32](#32-cool-mode--click-spark--confetti) |

## Recipes

Format per entry: **Source** (install), **Looks like**, **Use when / avoid when**, **Overuse** + how to make it bespoke, then either **Own it** code (self-contained) or **Mechanic** notes, **Tune**, **A11y/perf**.

---

## A. Hero & backgrounds

### 1. Spotlight
**Source:** Aceternity `npx shadcn@latest add @aceternity/spotlight` (plus "Spotlight New" `@aceternity/spotlight-new`: three drifting radial gradients).  
**Looks like:** a huge, soft diagonal beam (blurred ellipse at 21% white) that slides in from the top-left once and settles behind the headline.  
**Use when / avoid when:** dark hero with only type. Avoid on light backgrounds (it vanishes) and never stack with beams + meteors + grid (the 2024 "Aceternity hero" soup).  
**Overuse:** 5. Bespoke: tint it with the brand hue at 10-15% opacity, aim it at the product shot instead of the headline, or trigger it on scroll into a later section.  
**Stack:** SVG + CSS keyframes.

```tsx
// components/fx/spotlight.tsx
import { useId } from "react";
import { cn } from "@/lib/cn";
import { cssId } from "@/lib/fx-hooks";

export function Spotlight({ className, fill = "white" }: { className?: string; fill?: string }) {
  const id = cssId(useId());
  return (
    <svg
      aria-hidden
      className={cn("fx-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] opacity-0 lg:w-[84%]", className)}
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter={`url(#${id})`}>
        <ellipse
          cx="1924.71" cy="273.501" rx="1924.71" ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill} fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter id={id} x="0.86" y="0.84" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="151" />
        </filter>
      </defs>
    </svg>
  );
}
// usage: <section className="relative overflow-hidden bg-neutral-950"><Spotlight className="-top-40 left-0 md:-top-20 md:left-60" /> ...</section>
```

```css
.fx-spotlight { animation: fx-spotlight 2s ease 0.75s 1 forwards; }
@keyframes fx-spotlight {
  from { opacity: 0; transform: translate(-72%, -62%) scale(0.5); }
  to   { opacity: 1; transform: translate(-50%, -40%) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .fx-spotlight { animation: none; opacity: 1; transform: translate(-50%, -40%); }
}
```
**Tune:** `fillOpacity` 0.08-0.21; start delay 0.5-1s (after the headline lands); container position decides the angle.  
**A11y/perf:** one-shot transform/opacity, cheap. The blur is rasterized once; do not animate `stdDeviation`. Needs `overflow-hidden` on the section or it causes horizontal scroll.

### 2. Lamp effect
**Source:** Aceternity `@aceternity/lamp`.  
**Looks like:** two conic-gradient light cones fan out from a bright horizontal filament at the top center; a glow pool spills onto the headline below.  
**Use when / avoid when:** a single "moment" section (CTA, launch) on dark UI. Avoid as the first hero on every page; avoid on light themes.  
**Overuse:** 4. Bespoke: swap cyan for a warm brand hue, lengthen to 1.2s, reduce the cone angle, pair with serif type.  
**Stack:** Motion (`whileInView`). Improvement over the original: animates `scaleX` instead of `width` (no layout per frame).

```tsx
// components/fx/lamp.tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LampSection({
  children,
  color = "oklch(0.8 0.13 210)",
  bg = "oklch(0.15 0.02 265)",
}: { children: ReactNode; color?: string; bg?: string }) {
  const reduce = useReducedMotion();
  const grow = {
    initial: reduce ? false : { opacity: 0.5, scaleX: 0.5 },
    whileInView: { opacity: 1, scaleX: 1 },
    viewport: { once: true, amount: 0.5 },
    transition: { delay: 0.3, duration: 0.8, ease: EASE },
  } as const;

  return (
    <section
      style={{ "--lamp": color, "--lamp-bg": bg } as CSSProperties}
      className="relative isolate flex min-h-[90svh] w-full flex-col items-center justify-center overflow-hidden bg-[var(--lamp-bg)]"
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center">
        <motion.div
          {...grow}
          className="absolute right-1/2 h-56 w-[30rem] origin-right"
          style={{ backgroundImage: "conic-gradient(from 70deg at center top, var(--lamp), transparent, transparent)" }}
        >
          <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-[var(--lamp-bg)] [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-full w-40 bg-[var(--lamp-bg)] [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          {...grow}
          className="absolute left-1/2 h-56 w-[30rem] origin-left"
          style={{ backgroundImage: "conic-gradient(from 290deg at center top, transparent, transparent, var(--lamp))" }}
        >
          <div className="absolute right-0 bottom-0 z-20 h-full w-40 bg-[var(--lamp-bg)] [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute right-0 bottom-0 z-20 h-40 w-full bg-[var(--lamp-bg)] [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-[var(--lamp-bg)] blur-2xl" />
        <div className="absolute z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-[var(--lamp)] opacity-50 blur-3xl" />
        <motion.div {...grow} className="absolute z-30 h-36 w-64 -translate-y-24 rounded-full bg-[var(--lamp)] blur-2xl" />
        <motion.div {...grow} className="absolute z-50 h-0.5 w-[30rem] -translate-y-28 bg-[var(--lamp)]" />
        <div className="absolute z-40 h-44 w-full -translate-y-[12.5rem] bg-[var(--lamp-bg)]" />
      </div>
      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">{children}</div>
    </section>
  );
}
```
**Tune:** cone angles (`from 70deg` / `from 290deg`, +-10deg), cone width 24-36rem, glow `opacity-50` to 0.3 for subtlety, duration 0.8-1.4s.  
**A11y/perf:** blurred layers are static; only transform/opacity animate. The original also has a full-width `backdrop-blur-md` strip at 10% opacity: dropped here (invisible, costly). Reduced motion renders the final state. On mobile the 30rem cones overflow; keep `overflow-hidden`.

### 3. Background beams
**Source:** Aceternity `@aceternity/background-beams` (also `background-beams-with-collision`: vertical beams that explode on hitting the floor).  
**Looks like:** 50 parallel, gently curved hairlines sweeping diagonally; a cyan-to-violet gradient pulse runs along random lines at random intervals.  
**Use when / avoid when:** waitlist / email-capture hero where the page is otherwise empty. Avoid behind dense text (moire) and on content pages.  
**Overuse:** 5. Bespoke: monochrome stroke in brand color at 0.2 opacity, 10-15 beams, slower (20-30s).  
**Stack:** SVG + Motion (animates gradient coordinates). Paths are generated (the original ships 50 literal strings built on the same +7/-8 offset rule).

```tsx
// components/fx/background-beams.tsx
"use client";
import { memo, useId, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cssId } from "@/lib/fx-hooks";

const beamPath = (i: number) => {
  const p = (x: number, y: number) => `${x + 7 * i} ${y - 8 * i}`;
  return `M${p(-380, -189)}C${p(-380, -189)} ${p(-312, 216)} ${p(152, 343)}C${p(616, 470)} ${p(684, 875)} ${p(684, 875)}`;
};
const seeded = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

export const BackgroundBeams = memo(function BackgroundBeams({
  count = 50, from = "#18CCFC", via = "#6344F5", to = "#AE48FF", className = "",
}: { count?: number; from?: string; via?: string; to?: string; className?: string }) {
  const uid = cssId(useId());
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const beams = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      d: beamPath(i), dur: 10 + seeded(i + 1) * 10, delay: seeded(i + 101) * 10, y2: 93 + seeded(i + 201) * 8,
    })),
    [count],
  );
  const animate = inView && !reduce;

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 696 316" fill="none">
        <path d={beams.map((b) => b.d).join("")} stroke={`url(#${uid}-base)`} strokeOpacity="0.05" strokeWidth="0.5" />
        {animate && beams.map((b, i) => (
          <path key={i} d={b.d} stroke={`url(#${uid}-g${i})`} strokeOpacity="0.4" strokeWidth="0.5" />
        ))}
        <defs>
          {animate && beams.map((b, i) => (
            <motion.linearGradient
              key={i}
              id={`${uid}-g${i}`}
              initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
              animate={{ x1: ["0%", "100%"], x2: ["0%", "95%"], y1: ["0%", "100%"], y2: ["0%", `${b.y2}%`] }}
              transition={{ duration: b.dur, delay: b.delay, ease: "easeInOut", repeat: Infinity }}
            >
              <stop stopColor={from} stopOpacity="0" />
              <stop stopColor={from} />
              <stop offset="32.5%" stopColor={via} />
              <stop offset="100%" stopColor={to} stopOpacity="0" />
            </motion.linearGradient>
          ))}
          <radialGradient id={`${uid}-base`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)">
            <stop offset="0.0667" stopColor="#d4d4d4" />
            <stop offset="0.2432" stopColor="#d4d4d4" />
            <stop offset="0.4359" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
});
```
**Tune:** `count` 12-50, duration base 10s (raise to 20s for calm), `strokeOpacity` 0.2-0.4, gradient stops (one hue reads premium, three hues read template).  
**A11y/perf:** each beam is a JS attribute animation repainting the SVG; 50 is fine on desktop, use `count={16}` under 768px. Paused offscreen via `useInView`; reduced motion keeps only the faint static base lines. Seeded randomness avoids hydration mismatch.

### 4. Meteors
**Source:** Magic UI `@magicui/meteors`, Aceternity `@aceternity/meteors`.  
**Looks like:** tiny dots with 50px fading tails streak diagonally across a card or hero at random delays.  
**Use when / avoid when:** small dark "night sky" card, a 404, a space-themed product. Avoid full-page (reads as screensaver).  
**Overuse:** 5. Bespoke: 3-6 meteors max, long random gaps, clipped inside one card.  
**Stack:** CSS keyframes, random styles generated after mount.

```tsx
// components/fx/meteors.tsx
"use client";
import { useEffect, useState, type CSSProperties } from "react";

export function Meteors({ count = 12, angle = 215, minDuration = 3, maxDuration = 9 }: {
  count?: number; angle?: number; minDuration?: number; maxDuration?: number;
}) {
  const [styles, setStyles] = useState<CSSProperties[]>([]);
  useEffect(() => {
    setStyles(Array.from({ length: count }, () => ({
      "--angle": `${angle}deg`,
      top: "-5%",
      left: `${Math.random() * 100}%`,
      animationDelay: `${(0.2 + Math.random()).toFixed(2)}s`,
      animationDuration: `${Math.round(minDuration + Math.random() * (maxDuration - minDuration))}s`,
    }) as CSSProperties));
  }, [count, angle, minDuration, maxDuration]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {styles.map((s, i) => <span key={i} className="fx-meteor fx-loop" style={s} />)}
    </div>
  );
}
```

```css
.fx-meteor {
  position: absolute; width: 2px; height: 2px; border-radius: 9999px;
  background: oklch(0.72 0 0); box-shadow: 0 0 0 1px #ffffff10;
  animation: fx-meteor 5s linear infinite;
}
.fx-meteor::before {
  content: ""; position: absolute; top: 50%; width: 50px; height: 1px; transform: translateY(-50%);
  background: linear-gradient(to right, oklch(0.72 0 0), transparent);
}
@keyframes fx-meteor {
  0%   { transform: rotate(var(--angle)) translateX(0); opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: rotate(var(--angle)) translateX(-500px); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .fx-meteor { display: none; } }
```
**Tune:** `angle` 200-235deg, tail 40-80px, count 3-20, travel 500-900px.  
**A11y/perf:** transform-only, cheap. Hidden entirely under reduced motion (decorative).

### 5. Particles / Sparkles
**Source:** Magic UI `@magicui/particles` (canvas, mouse magnetism, zero deps); Aceternity `@aceternity/sparkles` (tsParticles: `@tsparticles/react @tsparticles/engine @tsparticles/slim`, ~40 kb+); React Bits `@react-bits/Particles-TS-TW` (OGL, 3D).  
**Looks like:** a field of faint dots drifting slowly; each dot is pulled a little toward the cursor with its own "magnetism", producing parallax-like depth. Sparkles = twinkling dots under a headline, often masked into a crescent.  
**Use when / avoid when:** quiet depth behind a dark hero or CTA. Avoid on light UI (looks like dust on the screen) and behind body text.  
**Overuse:** 4. Bespoke: 30-60 particles, brand-tinted, bias drift direction (`vy = -0.05` rising embers), mask to a region.  
**Stack:** Canvas 2D.

```tsx
// components/fx/particles.tsx
"use client";
import { useEffect, useRef } from "react";

type P = { x: number; y: number; tx: number; ty: number; r: number; a: number; ta: number; dx: number; dy: number; mag: number };

export function Particles({
  className = "", quantity = 80, staticity = 50, ease = 50, size = 0.4, rgb = "255,255,255", vx = 0, vy = 0,
}: { className?: string; quantity?: number; staticity?: number; ease?: number; size?: number; rgb?: string; vx?: number; vy?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current, el = canvas.current, ctx = el?.getContext("2d");
    if (!box || !el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0, y: 0 };
    let w = 0, h = 0, raf = 0, ps: P[] = [];

    const make = (): P => ({
      x: Math.random() * w, y: Math.random() * h, tx: 0, ty: 0,
      r: Math.floor(Math.random() * 2) + size, a: 0, ta: Math.random() * 0.6 + 0.1,
      dx: (Math.random() - 0.5) * 0.1, dy: (Math.random() - 0.5) * 0.1, mag: 0.1 + Math.random() * 4,
    });
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        ctx.beginPath();
        ctx.arc(p.x + p.tx, p.y + p.ty, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.a})`;
        ctx.fill();
      }
    };
    const resize = () => {
      w = box.offsetWidth; h = box.offsetHeight;
      el.width = w * dpr; el.height = h * dpr;
      el.style.width = `${w}px`; el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = Array.from({ length: quantity }, make);
      if (reduce) { ps.forEach((p) => (p.a = p.ta)); draw(); }
    };
    const step = () => {
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const edge = Math.min(p.x + p.tx - p.r, w - p.x - p.tx - p.r, p.y + p.ty - p.r, h - p.y - p.ty - p.r);
        const k = Math.max(0, edge / 20); // fade near edges
        p.a = k > 1 ? Math.min(p.a + 0.02, p.ta) : p.ta * k;
        p.x += p.dx + vx; p.y += p.dy + vy;
        p.tx += (mouse.x / (staticity / p.mag) - p.tx) / ease;
        p.ty += (mouse.y / (staticity / p.mag) - p.ty) / ease;
        if (p.x < -p.r || p.x > w + p.r || p.y < -p.r || p.y > h + p.r) ps[i] = make();
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - w / 2, y = e.clientY - r.top - h / 2;
      if (Math.abs(x) < w / 2 && Math.abs(y) < h / 2) { mouse.x = x; mouse.y = y; }
    };
    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting && !reduce) raf = requestAnimationFrame(step);
    });
    resize();
    ro.observe(box); io.observe(box);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("pointermove", onMove); };
  }, [quantity, staticity, ease, size, rgb, vx, vy]);

  return <div ref={wrap} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}><canvas ref={canvas} /></div>;
}
```
**Tune:** `quantity` 40-120 (area-scaled: ~1 per 12k px2), `staticity` 30-80 (lower = stronger pull), `ease` 30-80 (lower = snappier), `size` 0.3-0.8.  
**A11y/perf:** paused offscreen, static frame under reduced motion, DPR capped at 2. Sparkles via tsParticles is 10x the JS for the same look: prefer this canvas or a CSS twinkle for under 30 dots. Deeper particle systems: `backgrounds-svg-canvas.md`.

### 6. Retro grid
**Source:** Magic UI `@magicui/retro-grid` (now a WebGL shader with this CSS path as fallback).  
**Looks like:** an infinite perspective floor grid scrolling toward the viewer, fading into the horizon (Tron / synthwave).  
**Use when / avoid when:** dev tools, gaming, "retro future" direction. Avoid for anything serious or editorial.  
**Overuse:** 5 (Magic UI hero default). Bespoke: only lower 40% of the hero, brand-colored lines at 0.3 opacity, slow speed, pair with a horizon glow.  
**Stack:** CSS 3D transform. Improvement: translates exactly one cell per cycle, so the loop is seamless (the original jumps).

```tsx
// components/fx/retro-grid.tsx
import type { CSSProperties } from "react";

export function RetroGrid({ angle = 65, cell = 60, line = "oklch(0.6 0 0 / 0.5)", pxPerSecond = 90, fade = "var(--color-background, white)", className = "" }: {
  angle?: number; cell?: number; line?: string; pxPerSecond?: number; fade?: string; className?: string;
}) {
  const style = { "--angle": `${angle}deg`, "--cell": `${cell}px`, "--line": line, "--dur": `${cell / pxPerSecond}s` } as CSSProperties;
  return (
    <div aria-hidden style={style} className={`pointer-events-none absolute inset-0 overflow-hidden [perspective:200px] ${className}`}>
      <div className="absolute inset-0 [transform:rotateX(var(--angle))]">
        <div className="fx-retro-lines fx-loop" />
      </div>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${fade}, transparent 90%)` }} />
    </div>
  );
}
```

```css
.fx-retro-lines {
  position: absolute; inset: 0; margin-left: -200%; width: 600vw; height: 300vh; transform-origin: 100% 0 0;
  background-image: linear-gradient(to right, var(--line) 1px, transparent 0), linear-gradient(to bottom, var(--line) 1px, transparent 0);
  background-size: var(--cell) var(--cell);
  animation: fx-retro var(--dur) linear infinite;
}
@keyframes fx-retro { from { transform: translateY(calc(-1 * var(--cell))); } to { transform: translateY(0); } }
```
**Tune:** `angle` 55-75 (lower = flatter floor), `cell` 40-80, speed 40-120 px/s.  
**A11y/perf:** transform-only on one layer; static under reduced motion (`.fx-loop`). The 600vw x 300vh layer is a big texture: fine on desktop, keep it inside a clipped container.

### 7. Flickering grid
**Source:** Magic UI `@magicui/flickering-grid`.  
**Looks like:** a field of tiny squares whose opacities randomly re-roll, like a server-rack LED wall or TV static in slow motion.  
**Use when / avoid when:** infra / AI / data products; masked behind a logo or clipped to text. Good "alive but calm" substitute for particles.  
**Overuse:** 3. Bespoke: mask it with a radial or into the shape of the logo; brand color at `maxOpacity` 0.15-0.25.  
**Stack:** Canvas 2D.

```tsx
// components/fx/flickering-grid.tsx
"use client";
import { useEffect, useRef } from "react";

export function FlickeringGrid({ className = "", square = 4, gap = 6, chance = 0.3, rgb = "0,0,0", maxOpacity = 0.3 }: {
  className?: string; square?: number; gap?: number; chance?: number; rgb?: string; maxOpacity?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current, el = canvas.current, ctx = el?.getContext("2d");
    if (!box || !el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pitch = square + gap;
    let cols = 0, rows = 0, cells = new Float32Array(0), raf = 0, last = 0;

    const draw = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          ctx.fillStyle = `rgba(${rgb},${cells[i * rows + j]})`;
          ctx.fillRect(i * pitch * dpr, j * pitch * dpr, square * dpr, square * dpr);
        }
      }
    };
    const setup = () => {
      const w = box.clientWidth, h = box.clientHeight;
      el.width = w * dpr; el.height = h * dpr; el.style.width = `${w}px`; el.style.height = `${h}px`;
      cols = Math.ceil(w / pitch); rows = Math.ceil(h / pitch);
      cells = Float32Array.from({ length: cols * rows }, () => Math.random() * maxOpacity);
      draw();
    };
    const tick = (t: number) => {
      const dt = last ? (t - last) / 1000 : 0;
      last = t;
      for (let k = 0; k < cells.length; k++) if (Math.random() < chance * dt) cells[k] = Math.random() * maxOpacity;
      draw();
      raf = requestAnimationFrame(tick);
    };
    const ro = new ResizeObserver(setup);
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf); last = 0;
      if (entry.isIntersecting && !reduce) raf = requestAnimationFrame(tick);
    });
    ro.observe(box); io.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [square, gap, chance, rgb, maxOpacity]);

  return <div ref={wrap} aria-hidden className={`pointer-events-none h-full w-full ${className}`}><canvas ref={canvas} /></div>;
}
// Masked usage: <div className="absolute inset-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"><FlickeringGrid rgb="99,102,241" maxOpacity={0.2} /></div>
```
**Tune:** `square` 2-6, `gap` 4-8, `chance` 0.1-0.5 (per second per cell), `maxOpacity` 0.1-0.35.  
**A11y/perf:** full-HD at pitch 10 is ~20k fillRects/frame: fine on desktop, for mobile raise `gap` or throttle to 30 fps. Static frame under reduced motion.

### 8. Dot / grid / animated grid pattern
**Source:** Magic UI `@magicui/dot-pattern`, `@magicui/grid-pattern`, `@magicui/animated-grid-pattern`, `@magicui/interactive-grid-pattern`; Aceternity "Grid and Dot Backgrounds" (pure Tailwind).  
**Looks like:** hairline grid or dot matrix, radially masked so it fades out from the center; animated variant fades random cells in and out.  
**Use when / avoid when:** the cheapest way to give an empty hero "engineering paper" texture. Avoid dense grids behind text at > 10% contrast.  
**Overuse:** 3 (the radial-masked dot hero is everywhere). Bespoke: odd cell sizes (28px, 44px), offset the mask center toward the product, add noise ([13](#13-noise-texture)).  
**Stack:** CSS only.

```css
.fx-dots {
  background-image: radial-gradient(var(--fx-line) 1px, transparent 1px);
  background-size: 16px 16px;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 70%);
}
.fx-grid {
  background-image:
    linear-gradient(to right, var(--fx-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--fx-line) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 60% 50% at 50% 0%, #000 40%, transparent 100%);
}
/* Animated cells without JS: one pseudo-element "spark" per axis would look mechanical; use the TSX below only if needed. */
```
**Mechanic (animated grid pattern):** N squares at random cell coordinates, each fades 0 -> `maxOpacity` -> 0 over `duration` (Magic UI default 4s, `repeatDelay` 0.5s, stagger `index * 0.1s`), then jumps to a new random cell on `onAnimationComplete`. Interactive variant highlights the hovered cell (`fill` transition 100-1000ms). Keep N <= 30; animate `opacity` only.  
**Tune:** cell 16-48px, line alpha 6-12%, mask ellipse size.  
**A11y/perf:** static CSS backgrounds are free. Never animate `background-position` of a full-screen grid on scroll (repaints every frame); translate a layer instead.

### 9. Ripple
**Source:** Magic UI `@magicui/ripple`.  
**Looks like:** 8 concentric circles around a center logo breathing in and out with a tiny stagger, fading toward the bottom.  
**Use when / avoid when:** "connect / integrate / radar" sections, behind a single app icon. Avoid behind text.  
**Overuse:** 4. Bespoke: 4-5 rings, dashed borders, brand hue, slower (4s).  
**Stack:** CSS.

```tsx
// components/fx/ripple.tsx
import type { CSSProperties } from "react";

export function Ripple({ base = 210, step = 70, count = 8, opacity = 0.24 }: { base?: number; step?: number; count?: number; opacity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none [mask-image:linear-gradient(to_bottom,white,transparent)]">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="fx-ripple fx-loop"
          style={{ "--i": i, width: base + i * step, height: base + i * step, opacity: Math.max(0, opacity - i * 0.03) } as CSSProperties}
        />
      ))}
    </div>
  );
}
```

```css
.fx-ripple {
  position: absolute; left: 50%; top: 50%; border-radius: 9999px;
  border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
  background: color-mix(in oklab, currentColor 8%, transparent);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  transform: translate(-50%, -50%) scale(1);
  animation: fx-ripple 2s ease calc(var(--i) * 0.06s) infinite;
}
@keyframes fx-ripple {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%      { transform: translate(-50%, -50%) scale(0.9); }
}
```
**Tune:** `base` 150-260, `step` 50-90, duration 2-5s, stagger 0.06-0.2s (larger = visible wave).  
**A11y/perf:** transform-only; static rings under reduced motion.

### 10. Aurora background
**Source:** Aceternity `@aceternity/aurora-background` (design by Akshith Pottigari). Related: React Bits `Aurora`/`SoftAurora` (OGL shader), Animate UI `components-backgrounds-gradient`.  
**Looks like:** soft blue/violet bands sliding slowly behind a white or near-black hero, like northern lights through frosted glass.  
**Use when / avoid when:** calm SaaS / AI hero on light UI. Avoid if the page already has a gradient mesh; avoid on low-end mobile.  
**Overuse:** 4. Bespoke: two brand hues only, mask to one corner, 90s+ cycle.  
**Stack:** CSS (faithful). Heavy: see perf.

```tsx
// components/fx/aurora-background.tsx
import type { ReactNode } from "react";

export function AuroraBackground({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-zinc-50 text-slate-950 dark:bg-zinc-900 dark:text-white">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="fx-aurora fx-loop" />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
```

```css
.fx-aurora {
  --stripes: repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%);
  --aurora: repeating-linear-gradient(100deg, #3b82f6 10%, #a5b4fc 15%, #93c5fd 20%, #ddd6fe 25%, #60a5fa 30%);
  position: absolute; inset: -10px; pointer-events: none; opacity: 0.5;
  filter: blur(10px) invert(1);
  background-image: var(--stripes), var(--aurora);
  background-size: 300%, 200%;
  background-position: 50% 50%, 50% 50%;
  mask-image: radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%);
}
.fx-aurora::after {
  content: ""; position: absolute; inset: 0; mix-blend-mode: difference;
  background-image: var(--stripes), var(--aurora);
  background-size: 200%, 100%;
  background-attachment: fixed;
  animation: fx-aurora 60s linear infinite;
}
:is(.dark, [data-theme="dark"]) .fx-aurora {
  --stripes: repeating-linear-gradient(100deg, #000 0%, #000 7%, transparent 10%, transparent 12%, #000 16%);
  filter: blur(10px);
}
@keyframes fx-aurora {
  from { background-position: 50% 50%, 50% 50%; }
  to   { background-position: 350% 50%, 350% 50%; }
}
```
**Tune:** the five `--aurora` stops (keep within one hue family), `opacity` 0.3-0.5, cycle 60-120s, mask ellipse origin.  
**A11y/perf:** animates `background-position` under `filter` + `mix-blend-mode` on a viewport-sized layer = full repaint every frame (visible battery drain, the known complaint about this component). Mitigate: keep it in the hero only, stop it offscreen (toggle a class via IntersectionObserver), or bake a static frame for mobile (`@media (max-width: 768px) { .fx-aurora::after { animation: none } }`). A shader version (`webgl-shaders-3d.md`) is cheaper at large sizes.

### 11. Wavy background
**Source:** Aceternity `@aceternity/wavy-background` (deps `simplex-noise`).  
**Looks like:** five thick, blurred, colored sine-noise waves undulating horizontally across the middle of the hero.  
**Use when / avoid when:** playful consumer or music products. Avoid in B2B.  
**Overuse:** 4.  
**Mechanic:** canvas sized to the window; each frame fills the background at `waveOpacity` alpha (motion trails), then strokes 5 paths where `y = noise3D(x / 800, 0.3 * i, t) * 100 + h / 2`, `lineWidth` 50, `t += 0.001` (slow) or `0.002` (fast); blur via `ctx.filter = "blur(10px)"`.  
**Tune:** `waveWidth` 30-70, `blur` 6-14, colors (2-3 max), speed.  
**A11y/perf:** the original never cancels its RAF on unmount in some versions and blurs every frame in the canvas: move blur to a CSS `filter` on the `<canvas>` element (rasterized by the compositor), cap DPR, pause offscreen, draw one static frame for reduced motion.

### 12. Light rays
**Source:** Magic UI `@magicui/light-rays` (Motion, DOM), React Bits `@react-bits/LightRays-TS-TW` (OGL shader, mouse-following).  
**Looks like:** 7 soft vertical god-rays hanging from the top edge, each slowly swinging +-2deg and fading in/out, over two radial ambient glows.  
**Use when / avoid when:** atmospheric hero, "stage light" on a product render. Avoid stacking with spotlight/lamp.  
**Overuse:** 3.  
**Mechanic (Magic UI):** per ray: `left` 8-92%, base rotate -28..28deg, width 160-320px, `swing` 0.8-2.6deg, `duration = cycle * (0.75..1.25)` with cycle 14s, `opacity: [0, intensity, 0]`, `rotate: [r - swing, r + swing, r - swing]`, `ease: "easeInOut"`, `repeatDelay = duration * 0.1`. Each ray is a `linear-gradient(to bottom, color-mix(color 70%, transparent), transparent)` with `blur(36px)` and `mix-blend-mode: screen`, `origin-top`.  
**Tune:** `count` 5-9, `blur` 24-48px, `color` alpha 0.15-0.3, `length` 60-80vh.  
**A11y/perf:** blurred layers that only change transform/opacity are fine; generate randoms in `useEffect` (the original does) to avoid hydration mismatch; render static rays for reduced motion.

### 13. Noise texture
**Source:** Magic UI `@magicui/noise-texture` (full-size SVG `feTurbulence`), Cult UI `texture-overlay`.  
**Looks like:** fine film grain over gradients and flat fills; kills banding and "plastic" flatness.  
**Use when / avoid when:** almost always on gradients, glass, and large dark fills. It is the single cheapest premium upgrade here.  
**Overuse:** 1.  
**Stack:** CSS with a tiled data-URI (cheaper than a viewport-sized SVG filter).

```css
.fx-noise { position: relative; isolation: isolate; }
.fx-noise::after {
  content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0.07; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
```
**Tune:** `opacity` 0.04-0.12 (dark UI tolerates more), `baseFrequency` 0.6-1.0 (higher = finer), blend `overlay` or `soft-light`.  
**A11y/perf:** static; the 160px tile is rasterized once. Never animate grain position every frame on full screen (a stepped 8 fps "film jitter" is the most you want). More texture recipes: `backgrounds-svg-canvas.md`.

### 14. Globe (cobe)
**Source:** Magic UI `@magicui/globe` (deps `cobe`, `motion`); Aceternity `github-globe` (three-globe, now token-gated) and `3d-globe`. Uses cobe 2.0.1 (~5 kb, WebGL, zero deps).  
**Looks like:** a dotted, softly lit earth rotating slowly, orange city markers, draggable horizontally with inertia; cobe 2 adds arcs and DOM labels anchored to markers.  
**Use when / avoid when:** "global" claims backed by real data (regions, customers, edge locations). Avoid as decoration without data.  
**Overuse:** 4. Bespoke: real markers, arcs between real regions, labels via anchor positioning, dark globe with brand `glowColor`.  
**Stack:** WebGL (cobe).

```tsx
// components/fx/globe.tsx
"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";

type Marker = { location: [number, number]; size: number };
const DEFAULT_MARKERS: Marker[] = [
  { location: [40.7128, -74.006], size: 0.1 },
  { location: [51.5072, -0.1276], size: 0.07 },
  { location: [35.6762, 139.6503], size: 0.08 },
  { location: [-23.5505, -46.6333], size: 0.08 },
];

// cobe 2 API: createGlobe() renders once and returns { update, destroy }. There is no onRender loop
// in v2 (the README still shows the old snippet), so drive rotation from your own rAF via update().
// width/height are CSS pixels; cobe multiplies by devicePixelRatio itself.
export function Globe({ markers = DEFAULT_MARKERS, className = "" }: { markers?: Marker[]; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dragX = useRef<number | null>(null);
  const target = useRef(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = 0, smooth = 0, raf = 0;

    const globe = createGlobe(el, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: el.offsetWidth, height: el.offsetWidth,
      phi: 0, theta: 0.3, dark: 0, diffuse: 0.4, mapSamples: 16000, mapBrightness: 1.2,
      baseColor: [1, 1, 1], markerColor: [251 / 255, 100 / 255, 21 / 255], glowColor: [1, 1, 1],
      markers,
    });
    const frame = () => {
      if (dragX.current === null && !reduce) phi += 0.005;
      smooth += (target.current - smooth) * 0.08; // spring-ish drag inertia
      globe.update({ phi: phi + smooth });
      raf = requestAnimationFrame(frame);
    };
    // Render only while visible: WebGL keeps burning GPU offscreen otherwise.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf) raf = requestAnimationFrame(frame);
      if (!entry.isIntersecting) { cancelAnimationFrame(raf); raf = 0; }
    });
    const ro = new ResizeObserver(() => globe.update({ width: el.offsetWidth, height: el.offsetWidth }));
    io.observe(el);
    ro.observe(el);
    const fadeIn = requestAnimationFrame(() => { el.style.opacity = "1"; });
    return () => { cancelAnimationFrame(fadeIn); cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); globe.destroy(); };
  }, [markers]);

  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[600px] ${className}`}>
      <canvas
        ref={canvas}
        className="size-full cursor-grab opacity-0 transition-opacity duration-500 [contain:layout_paint_size] [touch-action:pan-y]"
        onPointerDown={(e) => { dragX.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => {
          if (dragX.current === null) return;
          target.current += (e.clientX - dragX.current) / 200;
          dragX.current = e.clientX;
        }}
        onPointerUp={() => { dragX.current = null; }}
        onPointerCancel={() => { dragX.current = null; }}
      />
    </div>
  );
}
```
**Tune:** `theta` 0.2-0.4 (tilt), `diffuse` 0.4-1.2, `mapSamples` 10k-20k (dot density), `mapBrightness` 1-6, `dark: 1` + `baseColor [0.3,0.3,0.3]` for dark globes, rotation 0.002-0.006 rad/frame. cobe 2: `arcs: [{ from, to }]`, `arcColor`, `arcHeight`; give markers an `id` and position labels with `position-anchor: --cobe-<id>` + `opacity: var(--cobe-visible-<id>, 0)`.  
**A11y/perf:** WebGL keeps rendering offscreen: mount it only when in view (IntersectionObserver gate) on long pages. Keep `markers` referentially stable (module constant or `useMemo`) or the globe is recreated each render. `touch-action: pan-y` preserves vertical scrolling on phones. Provide a visually hidden list of regions for screen readers if the markers carry meaning.

### 15. World map
**Source:** Aceternity `@aceternity/world-map` (deps `dotted-map`, `motion`), Magic UI `dotted-map`.  
**Looks like:** a dotted world map with glowing curved arcs drawing from city to city, pulsing endpoint dots.  
**Use when / avoid when:** remote teams, shipping, latency maps. Avoid without real routes.  
**Overuse:** 4.  
**Mechanic:** `new DottedMap({ height: 100, grid: "diagonal" }).getSVG({ radius: 0.22, color: "#00000040", shape: "circle" })` rendered as an `<img>` data URI (static), then an overlay `<svg viewBox="0 0 800 400">` with equirectangular projection `x = (lng + 180) * 800 / 360`, `y = (90 - lat) * 400 / 180`, arc `M sx sy Q midX (min(sy, ey) - 50) ex ey`, drawn with Motion `pathLength: 0 -> 1` (duration 1s, stagger 0.5s) and endpoint `<circle>` with SVG `<animate>` on `r` 2 -> 8 and opacity 0.5 -> 0.  
**Tune:** arc lift (-30..-80), dot radius 0.18-0.3, one accent color.  
**A11y/perf:** generate the map SVG at build time or memoize it (the original rebuilds `DottedMap` every render, which is slow). `aria-hidden` the art; describe the routes in text.

---

## B. Text

Deeper text choreography (SplitText, variable-font axes, scramble plugins) lives in `text-effects.md`. This section covers the registry components people ask for by name.

### 16. Gradient / aurora text
**Source:** Magic UI `@magicui/aurora-text`, `@magicui/animated-gradient-text`; React Bits `@react-bits/GradientText-TS-TW`; Aceternity "Colourful Text".  
**Looks like:** one or two headline words filled with a multi-stop gradient that slowly pans.  
**Use when / avoid when:** a single emphasized word, gradient drawn from the brand palette. Avoid the pink-violet-blue default and whole sentences.  
**Overuse:** 5 with default colors, 3 with a tight two-hue brand gradient. Bespoke: metallic gradient (4 grays + one highlight), pan only on hover, or an image fill.  
**Stack:** CSS.

```tsx
// components/fx/gradient-text.tsx
import type { CSSProperties, ReactNode } from "react";

export function GradientText({ children, colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"], seconds = 10, className = "" }: {
  children: ReactNode; colors?: string[]; seconds?: number; className?: string;
}) {
  const style = { "--fx-gradient": `linear-gradient(135deg, ${[...colors, colors[0]].join(", ")})`, "--fx-dur": `${seconds}s` } as CSSProperties;
  return <span className={`fx-gradient-text fx-loop ${className}`} style={style}>{children}</span>;
}
```

```css
.fx-gradient-text {
  background-image: var(--fx-gradient);
  background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  animation: fx-gradient-pan var(--fx-dur, 10s) ease-in-out infinite alternate;
  padding-block: 0.1em; margin-block: -0.1em; /* keep descenders inside the painted box */
}
@keyframes fx-gradient-pan { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
@media (forced-colors: active) { .fx-gradient-text { color: CanvasText; background: none; } }
```
**Tune:** `background-size` 200-300%, cycle 6-14s, `alternate` (calm) vs linear loop (Magic UI animated-gradient-text: `to { background-position: 300% 0 }`, 8s linear).  
**A11y/perf:** stays real text (the sr-only duplicate some registries add is unnecessary). Check contrast of the darkest AND lightest stop. Note: Magic UI aurora-text also declares rotate/scale keyframes, which never apply because the span is inline.

### 17. Animated shiny text
**Source:** Magic UI `@magicui/animated-shiny-text` (the "Introducing X ->" pill), Motion Primitives `@motion-primitives/text-shimmer`, Kokonut `shimmer-text`.  
**Looks like:** muted gray text with a narrow highlight band sweeping across every few seconds, usually inside a rounded announcement badge.  
**Use when / avoid when:** loading and AI status lines ("Thinking..."). Avoid as the pill above every hero (peak 2024-25 template tell).  
**Overuse:** 5 as hero pill, 2 as a loading state.  
**Stack:** CSS.

```css
.fx-shiny {
  --shiny-width: 100px;
  color: rgb(82 82 82 / 0.7);
  background-image: linear-gradient(to right, transparent, rgb(0 0 0 / 0.8) 50%, transparent);
  background-size: var(--shiny-width) 100%;
  background-repeat: no-repeat;
  background-position: 0 0;
  -webkit-background-clip: text; background-clip: text;
  animation: fx-shiny 8s infinite;
}
:is(.dark, [data-theme="dark"]) .fx-shiny {
  color: rgb(163 163 163 / 0.7);
  background-image: linear-gradient(to right, transparent, rgb(255 255 255 / 0.8) 50%, transparent);
}
@keyframes fx-shiny {
  0%, 90%, 100% { background-position: calc(-100% - var(--shiny-width)) 0; }
  30%, 60%      { background-position: calc(100% + var(--shiny-width)) 0; }
}
@media (prefers-reduced-motion: reduce) { .fx-shiny { animation: none; } }
```
**Tune:** `--shiny-width` 60-160px; 2s linear (loading) vs 8s with a long rest (badge). Motion Primitives variant: `background-size: 250% 100%`, spread `text.length * 2px`, `backgroundPosition 100% -> 0%` 2s linear.  
**A11y/perf:** give loading text `role="status"`. Cheap.

### 18. Text generate effect / blur fade
**Source:** Aceternity `@aceternity/text-generate-effect` (word blur-in, stagger 0.2s); Magic UI `@magicui/blur-fade` (block-level: y 6px + blur 6px, 0.4s, `delay` prop) and `@magicui/text-animate`; Motion Primitives `@motion-primitives/text-effect` (presets blur / fade-in-blur / scale / slide, per char, word or line).  
**Looks like:** words resolve from blurred and transparent to sharp in sequence, like an LLM streaming.  
**Use when / avoid when:** one hero line or a pull quote. Avoid on paragraphs and on every heading.  
**Overuse:** 4 (blur-in everything is a 2025 AI-site signature). Bespoke: animate by line, 4px blur not 10px, once on entry.  
**Stack:** Motion.

```tsx
// components/fx/text-generate.tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ElementType } from "react";

export function TextGenerate({ text, as: Tag = "p", stagger = 0.08, duration = 0.5, blur = 8, className = "" }: {
  text: string; as?: ElementType; stagger?: number; duration?: number; blur?: number; className?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : stagger } } }}
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block whitespace-pre"
            variants={{
              hidden: reduce ? { opacity: 0 } : { opacity: 0, y: "0.15em", filter: `blur(${blur}px)` },
              show: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: reduce ? 0.2 : duration, ease: [0.16, 1, 0.3, 1] }}
          >
            {i < words.length - 1 ? `${word} ` : word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
```
**Tune:** stagger 0.03-0.1s per word (total under 1.2s), blur 4-10px, y 0-0.2em, duration 0.4-0.8s. Block-level BlurFade: `delay = 0.04 + i * 0.05`.  
**A11y/perf:** blur on the spans of one line is fine; never blur-animate large images or whole sections. The sr-only copy stops screen readers reading word fragments.

### 19. Typewriter / typing animation
**Source:** Aceternity `@aceternity/typewriter-effect` (+ `TypewriterEffectSmooth`, width reveal), Magic UI `@magicui/typing-animation` (type, delete, loop), React Bits `TextType`, Kokonut `type-writer`.  
**Looks like:** text types itself out, holds, deletes, types the next phrase; blinking caret.  
**Use when / avoid when:** CLIs, AI prompts, search placeholders. Avoid for the main value proposition (users wait for the sentence).  
**Overuse:** 4. Bespoke: human rhythm (jitter per char, pause on punctuation).  
**Stack:** React state + CSS caret.

```tsx
// components/fx/typewriter.tsx
"use client";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/fx-hooks";

export function Typewriter({ words, typeMs = 60, deleteMs = 35, holdMs = 1600, loop = true, className = "" }: {
  words: string[]; typeMs?: number; deleteMs?: number; holdMs?: number; loop?: boolean; className?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const chars = Array.from(words[wordIndex % words.length]);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  useEffect(() => {
    if (reduce) return;
    let delay: number;
    let next: () => void;
    if (!deleting && count < chars.length) {
      delay = typeMs * (0.6 + Math.random() * 0.8) + (/[.,!?]/.test(chars[count]) ? 250 : 0);
      next = () => setCount((c) => c + 1);
    } else if (!deleting) {
      if (!loop && wordIndex === words.length - 1) return;
      delay = holdMs;
      next = () => setDeleting(true);
    } else if (count > 0) {
      delay = deleteMs;
      next = () => setCount((c) => c - 1);
    } else {
      delay = typeMs * 4;
      next = () => { setDeleting(false); setWordIndex((i) => (i + 1) % words.length); };
    }
    const t = setTimeout(next, delay);
    return () => clearTimeout(t);
  }, [count, deleting, wordIndex, chars, words.length, typeMs, deleteMs, holdMs, loop, reduce]);

  return (
    <span className={className}>
      <span className="sr-only">{words.join(". ")}</span>
      <span aria-hidden className="inline-grid">
        <span className="invisible col-start-1 row-start-1">{longest}</span>
        <span className="col-start-1 row-start-1">
          {reduce ? words[0] : chars.slice(0, count).join("")}
          <span className="fx-caret" />
        </span>
      </span>
    </span>
  );
}
```

```css
.fx-caret {
  display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -0.12em;
  background: currentColor; animation: fx-blink 1s steps(2, start) infinite;
}
@keyframes fx-blink { to { visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .fx-caret { animation: none; } }
```
**Tune:** type 40-90ms/char, delete 25-45ms, hold 1.2-2.5s, punctuation pause 150-350ms. Caret: 2px bar (modern) vs `width: 0.6em` block (terminal).  
**A11y/perf:** the invisible longest-word layer reserves width, so nothing reflows. `chars` is a fresh array each render and is a dependency on purpose: the effect must re-run every tick.

### 20. Flip words / word rotate / text loop
**Source:** Aceternity `@aceternity/flip-words` (also `layout-text-flip`, `container-text-flip`), Magic UI `@magicui/word-rotate`, Motion Primitives `@motion-primitives/text-loop`, React Bits `RotatingText`.  
**Looks like:** "Build [faster] apps": every ~3s the word blurs, lifts and scales away while the next drops in letter by letter.  
**Use when / avoid when:** genuinely parallel options, max 4. Avoid when the rotating word changes the sentence meaning.  
**Overuse:** 5 ("for designers / developers / founders"). Bespoke: masked slot-machine roll, or advance on scroll/hover instead of a timer.  
**Stack:** Motion `AnimatePresence`. Fixes vs originals: interval cleaned up (Aceternity leaks a `setTimeout`), width reserved.

```tsx
// components/fx/flip-words.tsx
"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export function FlipWords({ words, interval = 3000, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduce]);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className={`relative inline-grid ${className}`}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1">{longest}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          aria-hidden
          className="col-start-1 row-start-1 whitespace-nowrap"
          initial={{ opacity: 0, y: "0.35em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-0.6em", x: "0.4em", filter: "blur(8px)", scale: 1.6 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          {Array.from(words[i]).map((ch, k) => (
            <motion.span
              key={k}
              className="inline-block whitespace-pre"
              initial={{ opacity: 0, y: "0.3em", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: k * 0.05, duration: 0.2 }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
```
**Tune:** interval 2.5-4s; exit style (Aceternity: y -40px, x 40px, scale 2, blur 8px) vs Magic UI WordRotate (y -50 -> 0 -> 50, 0.25s easeOut, `mode="wait"`); letter delay 0.03-0.06s.  
**A11y/perf:** rotating content is `aria-hidden`; the sr-only list states all options once (no `aria-live` spam).

### 21. Morphing text
**Source:** Magic UI `@magicui/morphing-text` (the classic gooey text morph).  
**Looks like:** one word melts into the next: both blur and cross-fade, and an alpha-threshold filter turns the blur into liquid, connected shapes.  
**Use when / avoid when:** 2-4 short words at display size, heavy weight. Avoid thin fonts (the threshold eats hairlines).  
**Overuse:** 3.  
**Stack:** RAF + SVG `feColorMatrix` threshold.

```tsx
// components/fx/morphing-text.tsx
"use client";
import { useEffect, useId, useRef } from "react";
import { cssId } from "@/lib/fx-hooks";

const MORPH_S = 1.5;
const COOLDOWN_S = 0.5;

export function MorphingText({ texts, className = "" }: { texts: string[]; className?: string }) {
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const filterId = cssId(useId());

  useEffect(() => {
    const t1 = a.current, t2 = b.current;
    if (!t1 || !t2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      t1.textContent = texts[0]; t1.style.opacity = "1"; t2.style.opacity = "0";
      return;
    }
    let index = 0, morph = 0, cooldown = 0, last = performance.now(), raf = 0;
    const apply = (f: number) => {
      t2.style.filter = `blur(${Math.min(8 / f - 8, 100)}px)`;
      t2.style.opacity = `${Math.pow(f, 0.4) * 100}%`;
      const inv = 1 - f;
      t1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
      t1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
      t1.textContent = texts[index % texts.length];
      t2.textContent = texts[(index + 1) % texts.length];
    };
    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      cooldown -= dt;
      if (cooldown <= 0) {
        morph -= cooldown; // cooldown is negative here, so morph advances by dt
        cooldown = 0;
        let f = morph / MORPH_S;
        if (f > 1) { cooldown = COOLDOWN_S; f = 1; }
        apply(f);
        if (f === 1) index++;
      } else {
        morph = 0;
        t2.style.filter = "none"; t2.style.opacity = "100%";
        t1.style.filter = "none"; t1.style.opacity = "0%";
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [texts]);

  return (
    <div className={`relative mx-auto h-16 w-full max-w-3xl text-center text-[40pt] leading-none font-bold md:h-24 lg:text-[6rem] ${className}`}>
      <span className="sr-only">{texts.join(", ")}</span>
      <div aria-hidden className="absolute inset-0" style={{ filter: `url(#${filterId}) blur(0.6px)` }}>
        <span ref={a} className="absolute inset-x-0 top-0 m-auto inline-block w-full" />
        <span ref={b} className="absolute inset-x-0 top-0 m-auto inline-block w-full" />
      </div>
      <svg aria-hidden className="fixed h-0 w-0">
        <defs>
          <filter id={filterId}>
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
```
**Tune:** morph 1-2s, cooldown 0.3-1.5s, threshold offset `-140` (toward -100 = fatter goo), post-blur 0.4-1px. Weights 700-900 survive best.  
**A11y/perf:** the RAF never stops: gate it with an IntersectionObserver on long pages. Filter repaint is one line of text, acceptable.

### 22. Text reveal on scroll
**Source:** Magic UI `@magicui/text-reveal`, React Bits `@react-bits/ScrollReveal-TS-TW` (GSAP: opacity + blur + slight rotation per word, scrubbed), Kokonut `scroll-text`.  
**Looks like:** a pinned paragraph of big muted text; words light up to full opacity in reading order as you scroll (the Apple manifesto paragraph).  
**Use when / avoid when:** one mission statement per site, 20-40 words. Avoid for content people must read fast and on mobile-first pages (200vh of scroll is a chore).  
**Overuse:** 4. Bespoke: reveal by line with an underline sweep, or light words in the brand color.  
**Stack:** CSS scroll-driven (Chrome 115+, Safari 26+, Firefox Nightly only as of 2026) plus a Motion fallback.

```tsx
// components/fx/text-reveal.tsx (server component, zero JS)
import type { CSSProperties } from "react";

export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <section className={`fx-reveal relative h-[200vh] ${className}`} style={{ "--n": words.length } as CSSProperties}>
      <div className="sticky top-0 mx-auto flex h-svh max-w-4xl items-center px-4">
        <p className="flex flex-wrap text-3xl leading-tight font-bold md:text-5xl">
          {words.map((w, i) => (
            <span key={i} className="fx-reveal-word mr-[0.25em]" style={{ "--i": i } as CSSProperties}>{w}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
```

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .fx-reveal { view-timeline-name: --fx-reveal; }
    .fx-reveal-word {
      opacity: 0.2;
      animation: fx-reveal-word linear both;
      animation-timeline: --fx-reveal; /* must come after the shorthand */
      /* "contain" = while the 200vh section covers the viewport, i.e. while the sticky child is stuck */
      animation-range: contain calc(var(--i) / var(--n) * 100%) contain calc((var(--i) + 1) / var(--n) * 100%);
    }
  }
}
@keyframes fx-reveal-word { to { opacity: 1; } }
```

```tsx
// Motion fallback for Firefox (faithful to Magic UI): same markup, JS-driven
"use client";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }} className="mr-[0.25em]">{children}</motion.span>;
}

export function TextRevealMotion({ text }: { text: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = text.split(" ");
  return (
    <section ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 mx-auto flex h-svh max-w-4xl items-center px-4">
        <p className="flex flex-wrap text-3xl leading-tight font-bold md:text-5xl">
          {words.map((w, i) => <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>)}
        </p>
      </div>
    </section>
  );
}
```
**Tune:** section 150-300vh, dim opacity 0.15-0.3, widen each word range to `2/n` for a softer wave.  
**A11y/perf:** without support (or with reduced motion) words stay at opacity 1. Opacity-only. GSAP scrubbed variants with blur: `scroll-gsap.md`; CSS scroll-timeline details: `scroll-css-native.md`.

### 23. Number ticker
**Source:** Magic UI `@magicui/number-ticker`, React Bits `CountUp`, Motion Primitives `animated-number` / `sliding-number`, `@number-flow/react` 0.6 (digit roll; best when values change live).  
**Looks like:** a stat counts up from 0 and decelerates into its final value when scrolled into view.  
**Use when / avoid when:** 3-4 real stats. Avoid tiny numbers (0 -> 7) and prices users compare.  
**Overuse:** 3. Bespoke: tabular figures, unit fades in after the count, digit roll instead of counting.  
**Stack:** Motion spring writing `textContent` (no React render per frame).

```tsx
// components/fx/number-ticker.tsx
"use client";
import { useEffect, useMemo, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

export function NumberTicker({ value, from = 0, decimals = 0, delay = 0, locale = "en-US", className = "" }: {
  value: number; from?: number; decimals?: number; delay?: number; locale?: string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { damping: 60, stiffness: 100 });
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [locale, decimals],
  );

  useEffect(() => {
    if (!inView) return;
    if (reduce) { if (ref.current) ref.current.textContent = fmt.format(value); return; }
    const t = setTimeout(() => mv.set(value), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, reduce, value, delay, mv, fmt]);

  useEffect(() => spring.on("change", (v) => {
    if (ref.current) ref.current.textContent = fmt.format(Number(v.toFixed(decimals)));
  }), [spring, fmt, decimals]);

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      <span className="sr-only">{fmt.format(value)}</span>
      <span ref={ref} aria-hidden>{fmt.format(from)}</span>
    </span>
  );
}
```
**Tune:** damping 40-80 / stiffness 60-150 (1.5-2.5s total feels right), `delay` stagger 0.1-0.2s between stats.  
**A11y/perf:** screen readers get the final value, not 60 intermediates; `tabular-nums` stops width jitter.

### 24. Circular text
**Source:** React Bits `@react-bits/CircularText-TS-TW` (hover modes slowDown / speedUp / pause / goBonkers), Magic UI `@magicui/spinning-text`, Motion Primitives `spinning-text`.  
**Looks like:** a phrase set on a circle rotating slowly around an arrow or logo; changes speed on hover.  
**Use when / avoid when:** scroll cue, "available for work" sticker, editorial accents.  
**Overuse:** 3. Bespoke: uppercase mono with separators, rotate with scroll instead of time.  
**Stack:** CSS rotation + WAAPI `updatePlaybackRate` (speed change without the jump that swapping `animation-duration` causes).

```tsx
// components/fx/circular-text.tsx
"use client";
import { useRef } from "react";

export function CircularText({ text, radius = 80, seconds = 20, hoverRate = 4, className = "" }: {
  text: string; radius?: number; seconds?: number; hoverRate?: number; className?: string;
}) {
  const ring = useRef<HTMLDivElement>(null);
  const chars = Array.from(text);
  const setRate = (rate: number) => ring.current?.getAnimations().forEach((a) => a.updatePlaybackRate(rate));

  return (
    <div
      role="img"
      aria-label={text}
      className={`relative ${className}`}
      style={{ width: radius * 2, height: radius * 2 }}
      onPointerEnter={() => setRate(hoverRate)}
      onPointerLeave={() => setRate(1)}
    >
      <div ref={ring} aria-hidden className="fx-spin fx-loop absolute inset-0" style={{ animationDuration: `${seconds}s` }}>
        {chars.map((ch, i) => (
          <span
            key={i}
            className="absolute top-0 left-1/2 whitespace-pre"
            style={{ height: radius, transformOrigin: "bottom center", transform: `translateX(-50%) rotate(${(360 / chars.length) * i}deg)` }}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}
```

```css
.fx-spin { animation: fx-spin 20s linear infinite; }
@keyframes fx-spin { to { transform: rotate(360deg); } }
```
**Tune:** radius 50-120px, font-size ~ radius x 0.18, 12-24s per turn, `hoverRate` 0.25 (calmer) to 4. End the string with a separator so spacing is even.  
**A11y/perf:** transform-only; reads once via `aria-label`; stopped by `.fx-loop` under reduced motion.

### 25. Hyper text / decrypted text / text scramble
**Source:** Magic UI `@magicui/hyper-text` (scramble on hover, 800ms), React Bits `DecryptedText` (speed 50ms, maxIterations 10, `sequential`, `animateOn: "view" | "hover"`), Motion Primitives `text-scramble` (duration 0.8s, speed 0.04s), Kokonut `matrix-text`, GSAP `ScrambleTextPlugin` (free since 3.13).  
**Looks like:** letters cycle through random glyphs and lock in left to right.  
**Use when / avoid when:** dev tools, security, nav labels on hover. Avoid on body copy.  
**Overuse:** 3.  
**Mechanic:** every `speed` ms, replace each unrevealed char with a random glyph from the set; the reveal index advances by `length / (duration / speed)`; keep spaces; use monospace or fixed-width glyph sets so width does not jitter; final text in an sr-only span. Full implementation: `text-effects.md`.  
**A11y/perf:** reduced motion shows the final text immediately.

---

## C. Buttons & borders

Button micro-interaction fundamentals (press scale, magnetic pull, focus rings) live in `interactions.md`; this section is the registry "effect buttons". Rule: one effect button per viewport, on the primary CTA only.

### 26. Shimmer button
**Source:** Magic UI `@magicui/shimmer-button` (also `shiny-button`, `ripple-button`, `animated-subscribe-button`), Kokonut `command-button`.  
**Looks like:** a black pill whose thin rim has a bright spark orbiting around it (a rotating conic gradient peeking through a 0.05em gap), with a soft inner bottom highlight.  
**Use when / avoid when:** the single primary CTA on a dark hero. Avoid on light UI with the default white spark, and never on secondary buttons.  
**Overuse:** 5 at defaults. Bespoke: brand-colored spark at 60% alpha, slower (5-6s), radius matching the site's radius scale instead of a pill.  
**Stack:** CSS (container query units drive the slide).

```tsx
// components/fx/shimmer-button.tsx
import type { ComponentProps, CSSProperties } from "react";

type Props = ComponentProps<"button"> & { shimmer?: string; bg?: string; radius?: string; speed?: string; cut?: string };

export function ShimmerButton({ children, className = "", shimmer = "#ffffff", bg = "rgb(0 0 0)", radius = "100px", speed = "3s", cut = "0.05em", style, ...props }: Props) {
  const vars = { "--shimmer": shimmer, "--bg": bg, "--radius": radius, "--speed": speed, "--cut": cut, "--spread": "90deg", ...style } as CSSProperties;
  return (
    <button {...props} style={vars} className={`fx-shimmer-btn ${className}`}>
      <span aria-hidden className="fx-shimmer-wrap">
        <span className="fx-shimmer-spark fx-loop"><span className="fx-shimmer-cone fx-loop" /></span>
      </span>
      <span className="relative">{children}</span>
      <span aria-hidden className="fx-shimmer-highlight" />
      <span aria-hidden className="fx-shimmer-backdrop" />
    </button>
  );
}
```

```css
.fx-shimmer-btn {
  position: relative; z-index: 0; display: inline-flex; align-items: center; justify-content: center; overflow: hidden;
  padding: 0.75rem 1.5rem; border-radius: var(--radius); border: 1px solid rgb(255 255 255 / 0.1);
  background: var(--bg); color: #fff; white-space: nowrap; cursor: pointer;
  transition: transform var(--dur-base) ease-in-out;
}
.fx-shimmer-btn:active { transform: translateY(1px); }
.fx-shimmer-wrap { position: absolute; inset: 0; z-index: -30; overflow: visible; filter: blur(2px); container-type: size; }
.fx-shimmer-spark { position: absolute; inset: 0; height: 100cqh; aspect-ratio: 1; animation: fx-shimmer-slide var(--speed) ease-in-out infinite alternate; }
.fx-shimmer-cone {
  position: absolute; inset: -100%; width: auto;
  background: conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer) var(--spread), transparent var(--spread));
  animation: fx-spin-around calc(var(--speed) * 2) linear infinite;
}
.fx-shimmer-highlight { position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 -8px 10px #ffffff1f; transition: box-shadow var(--dur-base) ease-in-out; }
.fx-shimmer-btn:hover .fx-shimmer-highlight { box-shadow: inset 0 -6px 10px #ffffff3f; }
.fx-shimmer-btn:active .fx-shimmer-highlight { box-shadow: inset 0 -10px 10px #ffffff3f; }
.fx-shimmer-backdrop { position: absolute; inset: var(--cut); z-index: -20; border-radius: var(--radius); background: var(--bg); }
@keyframes fx-shimmer-slide { to { transform: translate(calc(100cqw - 100%), 0); } }
@keyframes fx-spin-around {
  0% { transform: rotate(0); }
  15%, 35% { transform: rotate(90deg); }
  65%, 85% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}
```
**Tune:** `--cut` 0.04-0.1em (rim thickness), `--speed` 2-6s, `--spread` 60-120deg, blur 1-3px.  
**A11y/perf:** transform-only loops; the focus ring must be added (`:focus-visible { outline: 2px solid var(--fx-accent); outline-offset: 3px }`). Reduced motion leaves a static glint.

### 27. Border beam / border trail
**Source:** Magic UI `@magicui/border-beam`, Motion Primitives `@motion-primitives/border-trail`, Cult UI `border-beam-button`.  
**Looks like:** a short comet of light (orange to purple) travels around a card's 1px border forever.  
**Use when / avoid when:** marking the one "live" or recommended element (pricing tier, active agent, input focus). Avoid on every card; avoid default orange-purple.  
**Overuse:** 5 at defaults. Bespoke: one run on hover or on state change (`animation-iteration-count: 1`), brand hue, 2 beams reversed with `delay`.  
**Stack:** pure CSS `offset-path: rect()` (Chrome 116+, Firefox 122+, Safari 18+) + mask. No Motion needed.

```tsx
// components/fx/border-beam.tsx
import type { CSSProperties } from "react";

export function BorderBeam({ size = 50, duration = 6, delay = 0, from = "#ffaa40", to = "#9c40ff", width = 1, reverse = false }: {
  size?: number; duration?: number; delay?: number; from?: string; to?: string; width?: number; reverse?: boolean;
}) {
  return (
    <div aria-hidden className="fx-beam-mask" style={{ "--bw": `${width}px` } as CSSProperties}>
      <div
        className="fx-beam fx-loop"
        style={{
          "--from": from, "--to": to, width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          animationDuration: `${duration}s`, animationDelay: `${-delay}s`,
          animationDirection: reverse ? "reverse" : "normal",
        } as CSSProperties}
      />
    </div>
  );
}
// usage: <div className="relative rounded-2xl border ...">...<BorderBeam /></div>
```

```css
.fx-beam-mask {
  position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  border: var(--bw, 1px) solid transparent;
  /* show only the border ring */
  mask-image: linear-gradient(transparent, transparent), linear-gradient(#000, #000);
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
}
.fx-beam {
  position: absolute; aspect-ratio: 1;
  background: linear-gradient(to left, var(--from), var(--to), transparent);
  animation: fx-beam 6s linear infinite;
}
@keyframes fx-beam { from { offset-distance: 0%; } to { offset-distance: 100%; } }
```
**Tune:** `size` 40-120 (beam length), `duration` 4-10s, `width` 1-2px. Two beams: second with `reverse` and `delay = duration / 2`.  
**A11y/perf:** `offset-distance` animation is compositor-friendly in Chromium; the mask is static. Older Safari (<18) shows a still beam in the corner, acceptable. `offset-rotate: auto` (default) keeps the gradient pointing along the direction of travel.

### 28. Shine border / moving border / hover border gradient
**Source:** Magic UI `@magicui/shine-border` (radial gradient 300% panning inside a masked border, 14s), Aceternity `@aceternity/moving-border` (a radial dot moved along an SVG `<rect>` with `getPointAtLength` every frame) and `@aceternity/hover-border-gradient` (highlight hops TOP -> LEFT -> BOTTOM -> RIGHT each second, becomes a full blue glow on hover), React Bits `ElectricBorder` (SVG turbulence displacement).  
**Looks like:** a border whose light slowly travels or pulses around the shape.  
**Use when / avoid when:** focus/highlight states, one featured card. Avoid on dense lists.  
**Overuse:** 4.  
**Stack:** modern CSS replacement for all three: a registered `@property` angle animating a conic border. Cheaper than per-frame JS path sampling.

```css
@property --fx-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }

.fx-conic-border {
  --card: oklch(0.18 0.01 260);
  border: 1px solid transparent;
  border-radius: 1rem;
  background:
    linear-gradient(var(--card), var(--card)) padding-box,
    conic-gradient(from var(--fx-angle), transparent 65%, var(--fx-accent) 85%, var(--fx-accent-2) 92%, transparent) border-box;
  animation: fx-conic 4s linear infinite;
}
/* "hover border gradient": only move on hover/focus */
.fx-conic-border[data-on-hover] { animation-play-state: paused; }
.fx-conic-border[data-on-hover]:is(:hover, :focus-visible) { animation-play-state: running; }
@keyframes fx-conic { to { --fx-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .fx-conic-border { animation: none; --fx-angle: 200deg; } }
```
**Tune:** arc length (`65%` -> `85%` stops), speed 3-8s, add a blurred copy behind (`::before` with `filter: blur(12px)`, `inset: -2px`, `z-index: -1`) for glow. Shine-border style: `background-image: radial-gradient(transparent, transparent, <colors>, transparent, transparent)`, `background-size: 300% 300%`, keyframes `background-position` 0% 0% -> 100% 100% -> 0% 0%, border isolated with `mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude; padding: 1px`.  
**A11y/perf:** registered-property animation repaints only the element (small). `@property` is baseline (Firefox 128+). Aceternity's moving border runs `getPointAtLength` in JS every frame: avoid on pages with many instances.

### 29. Rainbow button
**Source:** Magic UI `@magicui/rainbow-button`.  
**Looks like:** a dark button with a thin animated rainbow border along the bottom edge and a blurred rainbow glow puddle underneath.  
**Use when / avoid when:** playful launches, "Star on GitHub" CTAs. Avoid in serious B2B.  
**Overuse:** 4. Bespoke: 2-3 brand hues instead of 5.  
**Stack:** CSS.

```css
.fx-rainbow-btn {
  --c1: oklch(66.2% 0.225 25.9); --c2: oklch(60.4% 0.26 302); --c3: oklch(69.6% 0.165 251);
  --c4: oklch(80.2% 0.134 225); --c5: oklch(90.7% 0.231 133);
  --rainbow: linear-gradient(90deg, var(--c1), var(--c5), var(--c3), var(--c4), var(--c2));
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  height: 2.75rem; padding: 0 2rem; border-radius: 0.75rem; border: 2px solid transparent;
  color: #fff; font-weight: 500; cursor: pointer;
  background:
    linear-gradient(#121213, #121213) padding-box,
    linear-gradient(#121213 50%, rgb(18 18 19 / 0.6) 80%, rgb(18 18 19 / 0)) border-box,
    var(--rainbow) border-box;
  background-size: 200%;
  animation: fx-rainbow 2s linear infinite;
}
.fx-rainbow-btn::before {
  content: ""; position: absolute; bottom: -20%; left: 50%; z-index: 0; width: 60%; height: 20%;
  transform: translateX(-50%); background: var(--rainbow); background-size: 200%;
  filter: blur(0.75rem); animation: fx-rainbow 2s linear infinite;
}
@keyframes fx-rainbow { from { background-position: 0%; } to { background-position: 200%; } }
@media (prefers-reduced-motion: reduce) { .fx-rainbow-btn, .fx-rainbow-btn::before { animation: none; } }
```
**Tune:** `--speed` 2-6s, glow blur 0.5-1rem, glow width 40-70%. Light variant: swap `#121213` for `#fff`.  
**A11y/perf:** small repaint loop, fine. Keep text contrast on the dark fill.

### 30. Pulsating button
**Source:** Magic UI `@magicui/pulsating-button` (`variant: "pulse" | "ripple"`, auto-derives `--bg` from the computed background).  
**Looks like:** a button emitting a soft expanding halo every 1.5s.  
**Use when / avoid when:** "live" status, a waiting action (join call, record). Avoid on CTAs that are not time-sensitive (reads as nagging).  
**Overuse:** 3.  
**Stack:** CSS. Pseudo-element version (transform/opacity) instead of animating `box-shadow`.

```css
.fx-pulse { position: relative; isolation: isolate; }
.fx-pulse::after {
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  background: color-mix(in oklab, var(--pulse, var(--fx-accent)) 55%, transparent);
  animation: fx-pulse 1.5s var(--ease-out-expo) infinite;
}
@keyframes fx-pulse {
  from { transform: scale(1); opacity: 1; }
  to   { transform: scale(1.35); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .fx-pulse::after { animation: none; opacity: 0; } }
```
**Tune:** scale 1.15-1.5 (Magic UI uses an 8px `--distance`), period 1.2-2.5s, stop after 3 iterations if it is not a live state.  
**A11y/perf:** compositor-only. Pair "live" meaning with text, not only motion.

### 31. Interactive hover button
**Source:** Magic UI `@magicui/interactive-hover-button`, Kokonut `slide-text-button`, Aceternity `tailwindcss-buttons`.  
**Looks like:** a pill with a tiny dot before the label; on hover the dot scales up to flood the button with the primary color while the label slides out right and a label + arrow slides in from the right.  
**Use when / avoid when:** secondary CTAs, "View project" links. Good because the motion is state feedback, not decoration.  
**Overuse:** 3.  
**Stack:** Tailwind v4 only (assumes shadcn tokens `bg-primary`, `text-primary-foreground`).

```tsx
// components/fx/interactive-hover-button.tsx
import type { ComponentProps } from "react";

export function InteractiveHoverButton({ children, className = "", ...props }: ComponentProps<"button">) {
  const t = "transition-[translate,opacity,scale] duration-300 ease-[var(--ease-out-quart)]";
  return (
    <button {...props} className={`group relative w-auto cursor-pointer overflow-hidden rounded-full border bg-background p-2 px-6 text-center font-semibold ${className}`}>
      <span className="flex items-center justify-center gap-2">
        <span className={`size-2 rounded-full bg-primary ${t} group-hover:scale-[100.8] group-focus-visible:scale-[100.8]`} />
        <span className={`inline-block ${t} group-hover:translate-x-12 group-hover:opacity-0 group-focus-visible:translate-x-12 group-focus-visible:opacity-0`}>{children}</span>
      </span>
      <span aria-hidden className={`absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 ${t} group-hover:-translate-x-5 group-hover:opacity-100 group-focus-visible:-translate-x-5 group-focus-visible:opacity-100`}>
        <span>{children}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </span>
    </button>
  );
}
```
**Tune:** duration 250-400ms, dot scale must exceed button diagonal / 8px (100x is safe up to ~800px wide).  
**A11y/perf:** mirrors hover on `:focus-visible`; the duplicate label is `aria-hidden`. Under reduced motion it still works (state change), optionally drop the translate.

### 32. Cool mode / click spark / confetti
**Source:** Magic UI `@magicui/cool-mode` (particles spray from the pointer while held; circles or custom images; gravity + spin), `@magicui/confetti` (wraps `canvas-confetti`); React Bits `@react-bits/ClickSpark-TS-TW` (canvas lines radiating from the click); Kokonut `particle-button`.  
**Looks like:** a small burst of dots or sparks at the click point; confetti = full-screen paper shower.  
**Use when / avoid when:** celebrating an actual success (signup, copy, payment done, easter egg). Avoid on every click.  
**Overuse:** 2.  
**Stack:** WAAPI on fixed-position DOM nodes (no canvas, no React re-renders, no conflict with React-owned children).

```tsx
// components/fx/click-burst.tsx
"use client";
import type { PointerEvent, ReactNode } from "react";

export function ClickBurst({ children, count = 10, distance = 36, colors = ["var(--fx-accent)", "var(--fx-accent-2)"] }: {
  children: ReactNode; count?: number; distance?: number; colors?: string[];
}) {
  const burst = (e: PointerEvent<HTMLSpanElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
      dot.setAttribute("aria-hidden", "true");
      dot.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:6px;height:6px;border-radius:9999px;pointer-events:none;z-index:9999;background:${colors[i % colors.length]}`;
      document.body.appendChild(dot);
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const d = distance * (0.6 + Math.random() * 0.6);
      const anim = dot.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(angle) * d}px), calc(-50% + ${Math.sin(angle) * d}px)) scale(0)`, opacity: 0 },
        ],
        { duration: 500 + Math.random() * 250, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      anim.onfinish = () => dot.remove();
      anim.oncancel = () => dot.remove();
    }
  };
  return <span className="inline-block" onPointerDown={burst}>{children}</span>;
}
```
**Tune:** count 6-14, distance 24-60px, duration 450-800ms. Confetti: `import confetti from "canvas-confetti"; confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true })`; side cannons = two calls with `angle: 60 / 120` and `origin.x: 0 / 1`.  
**A11y/perf:** decorative nodes are `aria-hidden` and removed on finish. Announce the success in text (toast), not via particles.

### 33. Star border
**Source:** React Bits `@react-bits/StarBorder-TS-TW`.  
**Looks like:** two soft radial "stars" slide in opposite directions along the top and bottom edges of a dark pill button, fading as they travel.  
**Use when / avoid when:** quieter alternative to shimmer/border-beam on dark UI.  
**Overuse:** 2.  
**Mechanic:** wrapper `overflow: hidden; padding: 1px 0`; two absolutely positioned blobs `width: 300%; height: 50%; background: radial-gradient(circle, color, transparent 10%)`, one at `bottom: -11px; right: -250%` animating `translate(0,0) -> translate(-100%,0)` with opacity 1 -> 0, the other at `top: -10px; left: -250%` animating to `translate(100%,0)`; both `linear infinite alternate`, 6s. Inner content box has its own background and a 1px border so only the rims glow.  
**A11y/perf:** transform/opacity only; stop under reduced motion.

---

## D. Cards

### 34. Magic card / card spotlight
**Source:** Magic UI `@magicui/magic-card` (`mode: "gradient" | "orb"`), Aceternity `@aceternity/card-spotlight` (adds a three.js dot-matrix "canvas reveal" on hover: heavy), React Bits `SpotlightCard`, Kokonut `spotlight-cards`. The pattern was popularized by Linear's and Vercel's feature grids.  
**Looks like:** as the pointer moves over a grid of dark cards, a soft radial light follows it inside the hovered card and lights up the borders of neighboring cards near the pointer.  
**Use when / avoid when:** feature grids on dark UI; subtle is the whole point. Avoid colored gradients at full strength.  
**Overuse:** 3 (subtle) / 4 (purple-pink default). Bespoke: 1 listener for the whole grid so light spills across card borders, white at 6-10% only.  
**Stack:** CSS custom properties + one pointer listener (rAF-throttled, read-then-write).

```tsx
// components/fx/spotlight-grid.tsx
"use client";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { useFinePointer } from "@/lib/fx-hooks";

export function SpotlightGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const fine = useFinePointer();

  const update = (x: number, y: number) => {
    const cards = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-spotlight]") ?? []);
    const rects = cards.map((c) => c.getBoundingClientRect()); // all reads first
    cards.forEach((c, i) => {                                   // then all writes
      c.style.setProperty("--mx", `${x - rects[i].left}px`);
      c.style.setProperty("--my", `${y - rects[i].top}px`);
    });
  };
  const onMove = (e: PointerEvent) => {
    cancelAnimationFrame(frame.current);
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => update(clientX, clientY));
  };
  const onLeave = () => { cancelAnimationFrame(frame.current); update(-9999, -9999); };

  return (
    <div ref={ref} onPointerMove={fine ? onMove : undefined} onPointerLeave={fine ? onLeave : undefined} className={className}>
      {children}
    </div>
  );
}

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div data-spotlight className={`fx-spot-card ${className}`}>{children}</div>;
}
```

```css
.fx-spot-card {
  --mx: -9999px; --my: -9999px; --spot: 220px;
  --card: oklch(0.17 0.005 260); --edge: oklch(0.27 0.005 260);
  position: relative; border-radius: 1rem; border: 1px solid transparent;
  background:
    linear-gradient(var(--card), var(--card)) padding-box,
    radial-gradient(var(--spot) circle at var(--mx) var(--my), oklch(0.75 0.12 280), oklch(0.8 0.1 350), var(--edge) 100%) border-box;
}
.fx-spot-card::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(var(--spot) circle at var(--mx) var(--my), rgb(255 255 255 / 0.07), transparent 100%);
  opacity: 0; transition: opacity var(--dur-base) ease;
}
.fx-spot-card:hover::before { opacity: 1; }
```
**Tune:** `--spot` 150-350px, inner glow alpha 0.04-0.1, border gradient: monochrome (`white 30%` -> `--edge`) is the premium version. Magic UI "orb" mode: a 420px blurred (60px) gradient orb following the pointer with a spring (stiffness 250, damping 30, mass 0.6), `mix-blend-mode: screen` on dark.  
**A11y/perf:** paint-only on the cards under the pointer; no listener on touch devices (they see the static border). Never animate `filter: blur()` orbs on large cards per pointermove on low-end devices.

### 35. Glowing effect
**Source:** Aceternity `@aceternity/glowing-effect` (demo props: `spread={40} glow proximity={64} inactiveZone={0.01} disabled={false}`).  
**Looks like:** a multicolor arc of light on the card border that swings around the edge to point at the cursor, easing (2s expo) as the pointer moves nearby; off when the pointer sits in the card center.  
**Use when / avoid when:** bento/feature cards on dark UI where the pointer is expected to travel. Avoid on touch-first pages.  
**Overuse:** 3. Bespoke: single-hue gradient (`--glow-gradient`), narrower spread (16-24deg).  
**Stack:** CSS mask + Motion `animate()` for the angle tween.

```tsx
// components/fx/glowing-edge.tsx
"use client";
import { animate } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";

export function GlowingEdge({ spread = 20, proximity = 64, inactiveZone = 0.7, borderWidth = 2, duration = 2 }: {
  spread?: number; proximity?: number; inactiveZone?: number; borderWidth?: number; duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, current = 0;
    let tween: ReturnType<typeof animate> | undefined;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { left, top, width, height } = el.getBoundingClientRect();
        const cx = left + width / 2, cy = top + height / 2;
        const inCenter = Math.hypot(e.clientX - cx, e.clientY - cy) < 0.5 * Math.min(width, height) * inactiveZone;
        const near = e.clientX > left - proximity && e.clientX < left + width + proximity && e.clientY > top - proximity && e.clientY < top + height + proximity;
        const active = near && !inCenter;
        el.style.setProperty("--active", active ? "1" : "0");
        if (!active) return;
        const target = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
        const next = current + ((((target - current + 180) % 360) + 360) % 360) - 180; // shortest way round
        tween?.stop();
        if (reduce) { current = next; el.style.setProperty("--start", String(next)); return; }
        tween = animate(current, next, {
          duration, ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => { current = v; el.style.setProperty("--start", String(v)); },
        });
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf); tween?.stop(); document.removeEventListener("pointermove", onMove); };
  }, [proximity, inactiveZone, duration]);

  return <div ref={ref} aria-hidden className="fx-glow-edge" style={{ "--spread": spread, "--bw": `${borderWidth}px` } as CSSProperties} />;
}
// usage: <div className="relative rounded-2xl border p-6"><GlowingEdge spread={40} proximity={64} inactiveZone={0.01} />...</div>
```

```css
.fx-glow-edge { --start: 0; --active: 0; position: absolute; inset: 0; pointer-events: none; border-radius: inherit; }
.fx-glow-edge::after {
  content: ""; position: absolute; inset: calc(-1 * var(--bw)); border-radius: inherit;
  border: var(--bw) solid transparent;
  background: var(--glow-gradient,
    radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
    radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
    radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%),
    radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
    repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e 5%, #5a922c 10%, #4c7894 15%, #dd7bbb 20%));
  background-attachment: fixed;
  opacity: var(--active); transition: opacity var(--dur-base);
  mask-image: linear-gradient(#0000, #0000), conic-gradient(from calc((var(--start) - var(--spread)) * 1deg), #0000 0deg, #fff, #0000 calc(var(--spread) * 2deg));
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
}
```
**Tune:** `spread` 16-48 (arc half-width in deg), `proximity` 0-120px, `inactiveZone` 0.01-0.7, `duration` 0.6-2s, `borderWidth` 1-3px, optional outer `filter: blur(var(--blur))`.  
**A11y/perf:** one document listener per card; for grids of 12+ cards, hoist to a single listener that loops cards (like recipe 34). `background-attachment: fixed` makes the colors consistent across cards but forces repaint on scroll: drop it on mobile.

### 36. 3D card / tilted card
**Source:** Aceternity `@aceternity/3d-card` (`CardContainer` / `CardBody` / `CardItem translateZ`), React Bits `@react-bits/TiltedCard-TS-TW` (springs, cursor-following caption), Motion Primitives `tilt`, Aceternity `3d-pin`, `comet-card`, `glare-card`.  
**Looks like:** the card tilts toward the pointer in perspective; inner layers (title, image, CTA) float at different depths; optional glare highlight.  
**Use when / avoid when:** product/pass/album cards, portfolio thumbnails. Avoid for text-heavy cards (tilted text is hard to read) and more than one tilt system per page.  
**Overuse:** 4 (Aceternity default demo). Bespoke: small angles (6-10deg), depth only on 1-2 layers, glare in brand tint.  
**Stack:** CSS variables + pointer events.

```tsx
// components/fx/tilt-card.tsx
"use client";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/fx-hooks";

export function TiltCard({ children, max = 10, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useFinePointer() && !usePrefersReducedMotion();
  const set = (rx: number, ry: number, gx: number, gy: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `${rx}deg`); el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--gx", `${gx}%`); el.style.setProperty("--gy", `${gy}%`);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    set((0.5 - py) * max * 2, (px - 0.5) * max * 2, px * 100, py * 100);
  };
  return (
    <div className="[perspective:1000px]">
      <div
        ref={ref}
        onPointerMove={enabled ? onMove : undefined}
        onPointerLeave={enabled ? () => set(0, 0, 50, 50) : undefined}
        className={`fx-tilt ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
// Depth layers: <TiltCard><img data-depth style={{ "--depth": 60 } as React.CSSProperties} ... /><h3 data-depth>...</h3></TiltCard>
```

```css
.fx-tilt {
  --rx: 0deg; --ry: 0deg; --gx: 50%; --gy: 50%;
  position: relative; transform-style: preserve-3d; border-radius: 1rem;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 500ms var(--ease-out-expo);
}
.fx-tilt:hover { transform: rotateX(var(--rx)) rotateY(var(--ry)) scale(1.03); transition-duration: 150ms; }
.fx-tilt [data-depth] { transform: translateZ(calc(var(--depth, 40) * 1px)); transition: transform 500ms var(--ease-out-expo); }
.fx-tilt::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(circle at var(--gx) var(--gy), rgb(255 255 255 / 0.22), transparent 55%);
  mix-blend-mode: overlay; opacity: 0; transition: opacity var(--dur-base);
}
.fx-tilt:hover::after { opacity: 1; }
```
**Tune:** `max` 6-14deg (React Bits 14, Aceternity ~ offset/25), hover scale 1.02-1.1, perspective 800-1200px, depth 20-80px, the 150ms transition while moving acts as smoothing (Aceternity uses 200ms linear; React Bits springs damping 30 / stiffness 100 / mass 2).  
**A11y/perf:** transform-only. `overflow: hidden` on any ancestor between card and layers flattens `preserve-3d` (layers stop popping): put rounding/clipping on the layer itself. Touch: static card.

### 37. Focus cards
**Source:** Aceternity `@aceternity/focus-cards`.  
**Looks like:** a grid of image cards; hovering one keeps it sharp while all siblings blur slightly and shrink to 98%, its title fades in over a dark scrim.  
**Use when / avoid when:** portfolio or gallery grids with strong imagery.  
**Overuse:** 2.  
**Stack:** CSS `:has()` (baseline since Firefox 121). No JS state needed.

```css
.fx-focus-grid { display: grid; gap: 2.5rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr)); }
.fx-focus-card { position: relative; overflow: hidden; border-radius: 0.75rem; aspect-ratio: 4 / 5; transition: filter var(--dur-base) ease-out, scale var(--dur-base) ease-out; }
.fx-focus-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fx-focus-card .fx-focus-title { position: absolute; inset: auto 0 0; padding: 2rem 1rem; background: linear-gradient(to top, rgb(0 0 0 / 0.6), transparent); color: #fff; opacity: 0; transition: opacity var(--dur-base); }
.fx-focus-card:is(:hover, :focus-within) .fx-focus-title { opacity: 1; }
@media (hover: hover) {
  .fx-focus-grid:has(.fx-focus-card:hover) .fx-focus-card:not(:hover) { filter: blur(4px); scale: 0.98; }
}
@media (prefers-reduced-motion: reduce) { .fx-focus-card { transition: none; } }
```
**Tune:** blur 2-6px (or `grayscale(1) opacity(.6)` for a cheaper, calmer variant), scale 0.96-0.99, 250-400ms.  
**A11y/perf:** blur transitions repaint every sibling image: fine for 3-9 cards, use grayscale/opacity for big grids. Titles must also be reachable without hover (show them on touch: `@media (hover: none) { .fx-focus-title { opacity: 1 } }`).

### 38. Expandable card
**Source:** Aceternity `@aceternity/expandable-card-demo-standard` / `-grid`, Motion Primitives `@motion-primitives/morphing-dialog` (production-grade: focus trap, Escape, click-outside), Cult UI `expandable`, Kokonut `card-stack`.  
**Looks like:** a compact list row (thumbnail + title) morphs, via shared layout animation, into a centered modal card with a big image and body text; closing morphs it back into the row.  
**Use when / avoid when:** project lists, team bios, changelog entries where details are optional. Avoid for primary content users must read.  
**Overuse:** 2.  
**Stack:** Motion `layoutId`.

```tsx
// components/fx/expandable-cards.tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

type Item = { title: string; description: string; src: string; body: string };

export function ExpandableCards({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | null>(null);
  const uid = useId();
  const trigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger.current?.focus(); // return focus to the row that opened it
    };
  }, [active]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div key="scrim" className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}
              layoutId={`card-${active.title}-${uid}`}
              className="pointer-events-auto flex max-h-[90svh] w-full max-w-[500px] flex-col overflow-hidden rounded-3xl bg-white dark:bg-neutral-900"
            >
              <motion.img layoutId={`img-${active.title}-${uid}`} src={active.src} alt="" className="h-72 w-full object-cover" />
              <div className="overflow-auto p-5">
                <motion.h3 id={`${uid}-title`} layoutId={`title-${active.title}-${uid}`} className="text-lg font-semibold">{active.title}</motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{active.body}</motion.p>
                <button autoFocus onClick={() => setActive(null)} className="mt-5 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-black">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ul className="mx-auto grid w-full max-w-2xl gap-2">
        {items.map((item) => (
          <motion.li key={item.title} layoutId={`card-${item.title}-${uid}`} className="rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <button className="flex w-full items-center gap-4 p-3 text-left" onClick={(e) => { trigger.current = e.currentTarget; setActive(item); }}>
              <motion.img layoutId={`img-${item.title}-${uid}`} src={item.src} alt="" className="size-14 rounded-lg object-cover" />
              <span className="flex flex-col">
                <motion.span layoutId={`title-${item.title}-${uid}`} className="font-medium">{item.title}</motion.span>
                <span className="text-sm text-neutral-500">{item.description}</span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </>
  );
}
```
**Tune:** default layout transition is a spring; set `transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}` on the morphing elements for a crisper feel. Use `layout="position"` on text to avoid glyph stretching.  
**A11y/perf:** Escape, scrim click, autofocus close button and focus return are included; for a full focus trap use Motion Primitives MorphingDialog, Radix Dialog, or native `<dialog>` with `showModal()`. Images should share the same `src` (and ideally be preloaded) or the morph flashes.

### 39. Stack / swipe cards
**Source:** React Bits `@react-bits/Stack-TS-TW` (drag the top card past a threshold to send it to the back; optional autoplay), React Bits `CardSwap` (GSAP, 3D stack cycling on a timer), Aceternity `card-stack`, `draggable-card`, Skiper `skiper48` (Swiper card effect).  
**Looks like:** a deck of slightly rotated photos; drag the top one away and it tucks under the pile with a spring.  
**Use when / avoid when:** personal portfolios ("about me" photos), testimonials, onboarding. Avoid for content users must compare.  
**Overuse:** 2.  
**Stack:** Motion drag.

```tsx
// components/fx/card-stack.tsx
"use client";
import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useState, type ReactNode } from "react";

function DragCard({ children, onSendToBack, sensitivity }: { children: ReactNode; onSendToBack: () => void; sensitivity: number }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) onSendToBack();
    else { x.set(0); y.set(0); }
  };
  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotateX, rotateY }}
      drag dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }} dragElastic={0.6}
      onDragEnd={onDragEnd}
    >
      {children}
    </motion.div>
  );
}

export function CardStack({ cards, sensitivity = 150, className = "" }: { cards: ReactNode[]; sensitivity?: number; className?: string }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i)); // last = top
  const sendToBack = (id: number) => setOrder((o) => [id, ...o.filter((v) => v !== id)]);
  return (
    <div className={`relative [perspective:600px] ${className}`}>
      {order.map((id, index) => (
        <DragCard key={id} sensitivity={sensitivity} onSendToBack={() => sendToBack(id)}>
          <motion.div
            className="h-full w-full overflow-hidden rounded-2xl"
            initial={false}
            animate={{ rotateZ: (order.length - index - 1) * 4, scale: 1 + index * 0.06 - order.length * 0.06 }}
            style={{ transformOrigin: "90% 90%" }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {cards[id]}
          </motion.div>
        </DragCard>
      ))}
      <button className="sr-only focus:not-sr-only focus:absolute focus:-bottom-10" onClick={() => sendToBack(order[order.length - 1])}>
        Next card
      </button>
    </div>
  );
}
// usage: <CardStack className="size-64" cards={photos.map((p) => <img key={p.src} src={p.src} alt={p.alt} className="pointer-events-none size-full object-cover" />)} />
```
**Tune:** `sensitivity` 100-200px, fan rotation 3-6deg per card, scale step 0.04-0.08, spring stiffness 200-320 / damping 18-26. Add `randomRotation` (+-5deg) for a messier photo pile.  
**A11y/perf:** keyboard path via the "Next card" button; images `pointer-events-none` so drag does not start a native image drag. Transform-only.

### 40. Pixel card
**Source:** React Bits `@react-bits/PixelCard-TS-TW` (variants default / blue / yellow / pink).  
**Looks like:** on hover, a grid of tiny pixels pops in from the card center outward, shimmering in 3 tones, and dissolves on leave.  
**Use when / avoid when:** dark portfolio tiles, game/pixel aesthetics.  
**Overuse:** 2.  
**Mechanic:** canvas sized to the card; a `Pixel` every `gap` px (5-10) with random color from the palette, `delay = distance from center` (so it ripples outward), `counterStep = random*4 + (w+h)*0.01`; `appear()` grows size by random `sizeStep` up to `maxSize` 0.5-2px then shimmers between min/max at `speed * 0.001`; `disappear()` shrinks 0.1/frame; RAF throttled to 60 fps and cancelled when every pixel is idle. Focus triggers the same animation (`tabIndex=0`). Reduced motion: speed 0 and no delay.  
**A11y/perf:** RAF only runs during transitions; big cards with `gap < 5` create tens of thousands of pixels, keep gap >= 5.

### 41. Apple cards carousel
**Source:** Aceternity `@aceternity/apple-cards-carousel` (deps `@tabler/icons-react`, `motion`); Skiper perspective carousels.  
**Looks like:** a horizontal row of tall rounded image cards (category label + big title over the photo) that scrolls with arrow buttons; clicking a card morphs it into a full-screen article modal (Apple Store "Get to know" row).  
**Use when / avoid when:** editorial storytelling, case studies. Avoid for more than ~10 items.  
**Overuse:** 3.  
**Mechanic:** native horizontal `overflow-x: scroll` container with hidden scrollbar and `scrollBy({ left: +-300, behavior: "smooth" })` arrows; cards stagger in (`opacity 0, y 20` -> `1, 0`, delay `0.2 * index`); open card uses `layoutId` morph to a fixed modal, Escape and outside click close (`use-outside-click` hook).  
**A11y/perf:** prefer native scroll + `scroll-snap-type: x mandatory` over transforms (free momentum and keyboard). Arrows need `aria-label`s; modal needs dialog semantics (see recipe 38).

### 42. Scratch to reveal
**Source:** Magic UI `@magicui/scratch-to-reveal`.  
**Looks like:** a gradient foil covering a coupon/secret; dragging "scratches" it away; past 50% cleared the foil fades out and a callback fires.  
**Use when / avoid when:** promo codes, playful easter eggs.  
**Overuse:** 1.  
**Mechanic:** canvas over the content; fill with a gradient; on pointermove while down draw circles with `ctx.globalCompositeOperation = "destination-out"`; every N moves read `getImageData` and count pixels with alpha 0; when the ratio exceeds `minScratchPercentage` (50) animate canvas opacity to 0 and call `onComplete`.  
**A11y/perf:** provide a "Reveal" button fallback for keyboard/screen-reader users; `getImageData` is slow on big canvases, sample every 10th pixel.

---

## E. Layout & sections

### 43. Bento grid
**Source:** Magic UI `@magicui/bento-grid` (+ live cell demos: marquee of files, animated list, beams, calendar, globe), Aceternity `@aceternity/bento-grid`, Kokonut `bento-grid`, React Bits `MagicBento` (spotlight + particles + tilt per cell), paid block packs (Aceternity, shadcnblocks, Tailark).  
**Looks like:** a feature section of unequal rounded tiles; each tile holds a live mini-demo of the feature at the top and a title/description at the bottom; on hover the text lifts and a CTA slides up.  
**Use when / avoid when:** 4-7 features that each have something to SHOW. Avoid when cells would only hold an icon + sentence (that is a feature list wearing a costume).  
**Overuse:** 4 (the 3-col, spans 1-2 / 2-1, icon + title + "Learn more" layout is the #1 template tell). Bespoke: asymmetric areas (`grid-template-areas`), mixed media (real screenshot, number, quote, video), no icons, one cell breaking the grid.  
**Stack:** CSS grid + Tailwind.

```tsx
// components/fx/bento.tsx
import type { ReactNode } from "react";

export function BentoGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid w-full auto-rows-[22rem] grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>{children}</div>;
}

export function BentoCard({ title, description, href, cta = "Learn more", visual, className = "" }: {
  title: string; description: string; href: string; cta?: string; visual: ReactNode; className?: string;
}) {
  const move = "transition-[translate,opacity] duration-300 ease-[var(--ease-out-quart)]";
  return (
    <article className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:bg-neutral-950 dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ${className}`}>
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_25%,#000_60%)]">{visual}</div>
      <div className={`relative z-10 flex flex-col gap-1 p-6 ${move} lg:group-hover:-translate-y-10 lg:group-focus-within:-translate-y-10`}>
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">{title}</h3>
        <p className="max-w-lg text-neutral-500">{description}</p>
      </div>
      <a href={href} className={`relative z-10 px-6 pb-6 text-sm font-medium ${move} can-hover:lg:absolute can-hover:lg:bottom-0 can-hover:lg:translate-y-10 can-hover:lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100`}>
        {cta} <span aria-hidden>-&gt;</span>
      </a>
    </article>
  );
}
// Layout: <BentoGrid><BentoCard className="md:col-span-2" .../><BentoCard .../><BentoCard .../><BentoCard className="md:col-span-2" .../></BentoGrid>
// Asymmetric alternative: grid-template-areas "a a b" "c d b" on md+, with a tall "b" cell.
```
**Tune:** row height 18-26rem, gap 12-24px (tight gaps read premium), radius one step below the site's card radius, visual mask fade 25-60%. Cell demos: reuse [44](#44-marquee--infinite-moving-cards--logo-loop), [58](#58-animated-list), [61](#61-animated-beam), [14](#14-globe-cobe), [23](#23-number-ticker).  
**A11y/perf:** CTA reachable by keyboard (`focus-visible` reveals it), always visible below `lg`. Heavy cell demos (globe, canvas) must pause offscreen.

### 44. Marquee / infinite moving cards / logo loop
**Source:** Magic UI `@magicui/marquee` (CSS, `repeat` copies, `vertical`, `pauseOnHover`), Aceternity `@aceternity/infinite-moving-cards` (clones DOM with `cloneNode`, speed fast/normal/slow = 20/40/80s), Motion Primitives `@motion-primitives/infinite-slider` (JS, `speedOnHover` eases to a new speed), React Bits `LogoLoop` (JS, hover deceleration, fade edges), `ScrollVelocity` (speed tied to scroll velocity).  
**Looks like:** an endless row of logos or testimonial cards drifting sideways, edges faded, pausing on hover; often two rows in opposite directions.  
**Use when / avoid when:** 8+ logos you are allowed to show; testimonials that are short. Avoid for content users must read fully (long quotes) and for fewer than 6 items.  
**Overuse:** 4. Bespoke: vertical columns at different speeds (Magic UI 3D/vertical demos), grayscale logos that colorize on hover, speed tied to scroll velocity, or a static logo wall (often better).  
**Stack:** CSS.

```tsx
// components/fx/marquee.tsx
import type { CSSProperties, ReactNode } from "react";

export function Marquee({ children, reverse = false, vertical = false, pauseOnHover = true, repeat = 4, seconds = 40, gap = "1rem", className = "" }: {
  children: ReactNode; reverse?: boolean; vertical?: boolean; pauseOnHover?: boolean; repeat?: number; seconds?: number; gap?: string; className?: string;
}) {
  return (
    <div
      className={`fx-marquee ${className}`}
      data-vertical={vertical || undefined}
      data-pause={pauseOnHover || undefined}
      style={{ "--duration": `${seconds}s`, "--gap": gap } as CSSProperties}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div key={i} inert={i > 0} className="fx-marquee-track fx-loop" style={reverse ? { animationDirection: "reverse" } : undefined}>
          {children}
        </div>
      ))}
    </div>
  );
}
```

```css
.fx-marquee {
  display: flex; gap: var(--gap); overflow: hidden; padding: 0.5rem;
  mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
}
.fx-marquee[data-vertical] { flex-direction: column; mask-image: linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent); }
.fx-marquee-track {
  display: flex; flex-shrink: 0; justify-content: space-around; gap: var(--gap);
  animation: fx-marquee var(--duration) linear infinite;
}
.fx-marquee[data-vertical] .fx-marquee-track { flex-direction: column; animation-name: fx-marquee-y; }
.fx-marquee[data-pause]:is(:hover, :focus-within) .fx-marquee-track { animation-play-state: paused; }
@keyframes fx-marquee   { from { transform: translateX(0); } to { transform: translateX(calc(-100% - var(--gap))); } }
@keyframes fx-marquee-y { from { transform: translateY(0); } to { transform: translateY(calc(-100% - var(--gap))); } }
@media (prefers-reduced-motion: reduce) { .fx-marquee { overflow-x: auto; } }
```
**Tune:** speed as px/s, not seconds: ~30-60 px/s for logos, 20-40 px/s for readable cards (set `seconds = trackWidth / pxPerSecond`); gap 1-4rem; fade 5-15%; logos at 60% opacity, grayscale.  
**A11y/perf:** each track moves exactly its own width + gap, so N identical tracks loop seamlessly (need total width >= 2x container: raise `repeat` for short content). Copies are `inert` (React 19 boolean prop): hidden from screen readers and not focusable (Aceternity's `cloneNode` copies are neither). WCAG 2.2.2: pause on hover/focus is included; for testimonials also give a visible pause button. Under reduced motion the row becomes a normal scrollable strip.

### 45. Sticky scroll reveal
**Source:** Aceternity `@aceternity/sticky-scroll-reveal` (inside its own `overflow-y-auto` box, background color changes per step), Skiper `skiper16/17` (card stacks), React Bits `ScrollStack`.  
**Looks like:** left column of feature steps scrolls normally; the right column's visual stays pinned and swaps (cross-fade + slide) as each step reaches the viewport center; inactive steps dim to 30%.  
**Use when / avoid when:** product walkthroughs with 3-5 steps, each with a distinct visual. Avoid nested scroll boxes (the original's inner scroller traps wheel/touch; use page scroll as below).  
**Overuse:** 3.  
**Stack:** CSS sticky + IntersectionObserver + Motion `AnimatePresence`.

```tsx
// components/fx/sticky-scroll-reveal.tsx
"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Step = { title: string; description: string; visual: ReactNode };

export function StickyScrollReveal({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index)); }),
      { rootMargin: "-45% 0px -45% 0px" }, // a 10%-tall band at viewport center
    );
    refs.current.forEach((el) => { if (el) io.observe(el); });
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <section className="relative mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2">
      <div>
        {steps.map((s, i) => (
          <article
            key={s.title}
            ref={(el) => { refs.current[i] = el; }}
            data-index={i}
            className="flex min-h-[70svh] flex-col justify-center transition-opacity duration-500"
            style={{ opacity: active === i ? 1 : 0.3 }}
          >
            <h3 className="text-2xl font-semibold">{s.title}</h3>
            <p className="mt-4 max-w-sm text-neutral-500">{s.description}</p>
            <div className="mt-8 lg:hidden">{s.visual}</div>
          </article>
        ))}
      </div>
      <div aria-hidden className="sticky top-0 hidden h-svh items-center lg:flex">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {steps[active].visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
```
**Tune:** step height 60-100svh, center band `-40%..-48%` margins, dim 0.25-0.4, swap 350-600ms. Scrubbed (continuous) variants: `scroll-gsap.md`.  
**A11y/perf:** visuals are duplicated inline on mobile, so the pinned copy is `aria-hidden`. Only one visual mounted at a time (plus the exiting one).

### 46. Container scroll (tilted tablet)
**Source:** Aceternity `@aceternity/container-scroll-animation` (also `macbook-scroll`: the lid opens as you scroll).  
**Looks like:** a big device-like frame (thick gray bezel, 30px radius, layered shadow) starts tilted back 20deg under the headline and rotates flat toward the viewer as you scroll, while the headline drifts up.  
**Use when / avoid when:** revealing one hero screenshot/video. Avoid if the screenshot is not beautiful at 1000px wide.  
**Overuse:** 5 (default bezel + "Unleash the power of scroll animations" copy). Bespoke: thin bezel or none, real product UI, smaller start angle (10-12deg), shadow in brand tint.  
**Stack:** Motion scroll-linked transforms.

```tsx
// components/fx/container-scroll.tsx
"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useMedia } from "@/lib/fx-hooks";

const SHADOW = "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003";

export function ContainerScroll({ title, children }: { title: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const mobile = useMedia("(max-width: 768px)");
  const { scrollYProgress } = useScroll({ target: ref });
  const rotateX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : mobile ? [0.7, 0.9] : [1.05, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -100]);

  return (
    <div ref={ref} className="relative flex h-[60rem] items-center justify-center p-2 md:h-[80rem] md:p-20">
      <div className="relative w-full py-10 [perspective:1000px] md:py-40">
        <motion.div style={{ y }} className="mx-auto max-w-5xl text-center">{title}</motion.div>
        <motion.div
          style={{ rotateX, scale, boxShadow: SHADOW }}
          className="mx-auto -mt-12 h-[30rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 md:h-[40rem] md:p-6"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 md:p-4 dark:bg-zinc-900">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
```
**Tune:** start angle 10-25deg, perspective 800-1400px, container height 60-90rem (longer = slower flatten), end translate -60..-120px.  
**A11y/perf:** transform-only (the big shadow is painted once into the layer). Use `next/image` with `sizes` for the screenshot; it is the LCP element, so do not start it at `opacity: 0`.

### 47. Hero parallax
**Source:** Aceternity `@aceternity/hero-parallax`, Aceternity `parallax-hero-images`, `3d-marquee`.  
**Looks like:** a big headline, then three rows of 5 website screenshots tilted in 3D (rotateX 15deg, rotateZ 20deg) that straighten out while rows slide sideways in alternating directions as you scroll.  
**Use when / avoid when:** agencies / template shops with 15 strong thumbnails. Avoid with fewer or weaker images.  
**Overuse:** 4.  
**Mechanic:** section `h-[300vh] overflow-hidden [perspective:1000px] [transform-style:preserve-3d]`; `useScroll({ target, offset: ["start start", "end start"] })`; every value goes through `useSpring({ stiffness: 300, damping: 30 })`: rows 1 and 3 `x: [0, 1] -> [0, 1000]`, row 2 `x -> [0, -1000]`; the rows wrapper `rotateX [0, 0.2] -> [15, 0]`, `rotateZ [0, 0.2] -> [20, 0]`, `opacity [0, 0.2] -> [0.2, 1]`, `translateY [0, 0.2] -> [-700, 500]`. Cards `h-96 w-[30rem]`, `whileHover={{ y: -20 }}`, dark overlay 0.8 + title on hover.  
**A11y/perf:** 15 large images moving: serve them at card size (`sizes="480px"`), lazy-load rows 2-3, reduced motion renders a flat static grid.

### 48. Parallax scroll columns
**Source:** Aceternity `@aceternity/parallax-scroll` (and `parallax-scroll-2`), Skiper `skiper30` ("Oliver parallax"), Codrops-style column galleries.  
**Looks like:** a 3-column image grid where the middle column scrolls down while the outer columns scroll up.  
**Use when / avoid when:** photography / moodboard pages. Avoid on product pages.  
**Overuse:** 3.  
**Mechanic:** split images in thirds; `useScroll({ target: gridRef, offset: ["start end", "end start"] })` on the PAGE (the original scrolls a fixed-height inner box: avoid), `y` for columns 1 and 3 `[0, 1] -> [0, -200]`, column 2 `-> [0, 200]`. Pad top/bottom by the travel distance so columns never expose empty space. CSS-native version: `animation-timeline: view()` with `translate` keyframes (`scroll-css-native.md`).  
**A11y/perf:** transform-only; reduced motion keeps columns static.

### 49. Tracing beam
**Source:** Aceternity `@aceternity/tracing-beam`.  
**Looks like:** a thin vertical line with a small zig-zag runs down the left of a long article; a cyan-violet gradient segment slides down it as you read, and the top dot changes color once scrolling starts.  
**Use when / avoid when:** long-form changelogs, case studies, docs-like marketing. Pure reading-progress affordance.  
**Overuse:** 3.  
**Mechanic:** SVG path `M 1 0 V -36 l 18 24 V h*0.8 l -18 24 V h`; a `linearGradient` in `userSpaceOnUse` whose `y1` maps progress `[0, 0.8] -> [50, h]` and `y2` maps `[0, 1] -> [50, h - 200]`, both through `useSpring({ stiffness: 500, damping: 90 })`; `useScroll({ target, offset: ["start start", "end start"] })`. The original measures content height once on mount: use a `ResizeObserver` (images/fonts change height later).  
**A11y/perf:** purely decorative (`aria-hidden`); gradient attribute updates repaint a thin SVG only.

### 50. Timeline
**Source:** Aceternity `@aceternity/timeline`, Magic UI `arc-timeline`, React Bits `Stepper`.  
**Looks like:** entries with a big sticky year/title on the left; a faint vertical rail with a violet-blue progress bar that grows as you scroll through.  
**Use when / avoid when:** career/journey/changelog pages.  
**Overuse:** 3. Bespoke: rail in brand color, titles as outlined numerals, fewer, meatier entries.  
**Stack:** Motion `useScroll`, `scaleY` instead of animating `height` (no layout per frame, no height measurement).

```tsx
// components/fx/timeline.tsx
"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

export function Timeline({ entries }: { entries: { title: string; content: ReactNode }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 10%", "end 50%"] });
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={ref} className="relative mx-auto max-w-6xl pb-20">
      {entries.map((e) => (
        <div key={e.title} className="flex justify-start pt-10 md:gap-10 md:pt-40">
          <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
            <div className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-white dark:bg-black">
              <div className="size-4 rounded-full border border-neutral-300 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800" />
            </div>
            <h3 className="hidden text-5xl font-bold text-neutral-500 md:block md:pl-20">{e.title}</h3>
          </div>
          <div className="relative w-full pr-4 pl-20 md:pl-4">
            <h3 className="mb-4 text-2xl font-bold text-neutral-500 md:hidden">{e.title}</h3>
            {e.content}
          </div>
        </div>
      ))}
      <div aria-hidden className="absolute top-0 bottom-0 left-8 w-[2px] overflow-hidden bg-linear-to-b from-transparent via-neutral-200 to-transparent [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] dark:via-neutral-700">
        <motion.div style={{ scaleY: scrollYProgress, opacity }} className="absolute inset-0 origin-top rounded-full bg-linear-to-t from-purple-500 from-0% via-blue-500 via-10% to-transparent" />
      </div>
    </div>
  );
}
```
**Tune:** `offset` start 0-20% / end 40-70%, sticky `top-24..top-40`, entry spacing `pt-24..pt-40`.  
**A11y/perf:** semantic alternative: wrap entries in `<ol>`; progress bar is decorative.

### 51. Layout grid
**Source:** Aceternity `@aceternity/layout-grid`.  
**Looks like:** a 3-column photo grid; clicking a tile expands it (shared layout) to a large centered card with text while other tiles dim behind an overlay.  
**Use when / avoid when:** 4-8 image stories. Same logic as [38](#38-expandable-card).  
**Overuse:** 3.  
**Mechanic:** `motion.div layout` per tile; selected tile gets `layoutId` + absolute centered classes (`md:w-1/2 h-1/2 m-auto inset-0 z-50`), previously selected tile keeps `z-40` during return; overlay `opacity 0 -> 0.3`. Escape/overlay close, focus handling as in recipe 38.  
**A11y/perf:** tiles must be buttons; expanded content in a dialog.

### 52. Masonry
**Source:** React Bits `@react-bits/Masonry-TS-TW` (GSAP: absolute positioning into the shortest column, animate in from below with blur, stagger 0.05, hover scale 0.95), CSS columns.  
**Looks like:** Pinterest-style image wall with uneven heights.  
**Use when / avoid when:** photography, moodboards, UGC.  
**Overuse:** 2.  
**Stack:** CSS columns (zero JS). Native CSS masonry is not baseline yet in 2026: see `layout-composition.md` before relying on it.

```css
.fx-masonry { columns: 3 16rem; column-gap: 1rem; }
.fx-masonry > * { break-inside: avoid; margin-bottom: 1rem; display: block; }
.fx-masonry img { width: 100%; height: auto; border-radius: 0.75rem; }
```
**Tune:** column width 14-22rem, gap 0.75-1.5rem. Entrance: per-item `animation-timeline: view()` fade-up (`scroll-css-native.md`).  
**A11y/perf:** CSS columns order items top-to-bottom per column, so tab/reading order jumps between columns; if order matters use the JS shortest-column approach (React Bits) or a grid. Always set `width`/`height` attributes on images to avoid layout shift.

### 53. Compare slider
**Source:** Aceternity `@aceternity/compare` (hover or drag mode, sparkles on the divider, autoplay), Motion Primitives `@motion-primitives/image-comparison` (clip-path + spring), Cult UI.  
**Looks like:** two images stacked; a vertical divider with a round handle reveals "before" on the left and "after" on the right as you drag.  
**Use when / avoid when:** redesigns, photo retouching, light/dark UI, code before/after.  
**Overuse:** 2.  
**Stack:** React + `clip-path: inset()` + pointer capture + visually hidden range input (keyboard + screen reader).

```tsx
// components/fx/compare-slider.tsx
"use client";
import { useState, type PointerEvent } from "react";

export function CompareSlider({ before, after, beforeAlt, afterAlt, initial = 50, className = "" }: {
  before: string; after: string; beforeAlt: string; afterAlt: string; initial?: number; className?: string;
}) {
  const [pos, setPos] = useState(initial);
  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      className={`group relative aspect-video cursor-ew-resize touch-pan-y overflow-hidden rounded-2xl select-none ${className}`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
      onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e); }}
    >
      <img src={after} alt={afterAlt} draggable={false} className="absolute inset-0 size-full object-cover" />
      <img src={before} alt={beforeAlt} draggable={false} className="absolute inset-0 size-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs text-black shadow-lg group-has-[input:focus-visible]:ring-2 group-has-[input:focus-visible]:ring-blue-500">
          &lt;&gt;
        </div>
      </div>
      <input
        type="range" min={0} max={100} step={1} value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Comparison position: before on the left, after on the right"
        className="sr-only"
      />
    </div>
  );
}
```
**Tune:** handle 28-44px, divider 1-3px, add a spring on `pos` (Motion `useSpring`, bounce 0) for a softer follow; "hover mode" = update on `pointermove` without capture (desktop only).  
**A11y/perf:** `touch-pan-y` keeps vertical page scroll on phones while horizontal drags move the divider; arrow keys work through the hidden range input and show the ring on the handle. `clip-path: inset()` on one image is cheap.

### 54. Animated tabs
**Source:** Motion Primitives `@motion-primitives/animated-background` (shared `layoutId` highlight for tabs, lists, hover menus), Aceternity `@aceternity/tabs` (stacked 3D card tabs), Animate UI `components-animate-tabs` (Radix-based), Cult UI `direction-aware-tabs`, Kokonut `smooth-tab`.  
**Looks like:** a pill highlight slides and morphs between tab labels with a spring; the panel cross-fades.  
**Use when / avoid when:** any segmented control. This is the most tasteful, least overused component here.  
**Overuse:** 2.  
**Stack:** Motion `layoutId`.

```tsx
// components/fx/animated-tabs.tsx
"use client";
import { motion } from "motion/react";
import { useId, useState } from "react";

export function AnimatedTabs({ tabs, onChange }: { tabs: { id: string; label: string }[]; onChange?: (id: string) => void }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const uid = useId();
  return (
    <div role="tablist" className="inline-flex gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-900">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => { setActive(t.id); onChange?.(t.id); }}
          className="relative rounded-full px-4 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {active === t.id && (
            <motion.span
              layoutId={`pill-${uid}`}
              className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-neutral-800"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
```
**Tune:** spring `bounce` 0-0.25, `duration` 0.35-0.6; for hover-follow menus (Vercel/Linear nav) switch to `onMouseEnter` like Motion Primitives `enableHover`.  
**A11y/perf:** full tab semantics need arrow-key roving focus and `aria-controls`: take the behavior from Radix/Base UI Tabs (Animate UI does) and keep this pill. Under reduced motion, Motion still animates layout: pass `transition={{ duration: 0 }}` when `useReducedMotion()` is true.

### 55. Infinite menu / 3D galleries
**Source:** React Bits `@react-bits/InfiniteMenu-TS-TW` (WebGL sphere of image discs, `gl-matrix`), `DomeGallery`, `CircularGallery` (OGL, curved scroll-through), `FlowingMenu` (marquee reveal on hover), `ChromaGrid`, `Lanyard` (R3F + physics badge).  
**Looks like:** InfiniteMenu: a globe covered in round thumbnails that you drag to spin with inertia; the disc facing you becomes active and its title + CTA appear.  
**Use when / avoid when:** creative portfolios with 10-40 image projects, experimental sites. Avoid for anything that needs scanning or SEO-visible project lists.  
**Overuse:** 2 (fresh in 2026, but React Bits demos are recognizable: change the textures and typography).  
**Mechanic:** icosahedron vertices as instance positions, one instanced disc mesh, arcball control with inertia, nearest-to-camera instance snaps; ~1.2k lines. Install rather than rewrite.  
**A11y/perf:** always render a plain HTML list of the same projects (visually hidden or as the mobile fallback); pause the render loop offscreen; WebGL basics in `webgl-shaders-3d.md`.

---

## F. Navigation

Full menu systems (overlay menus, mega menus, route transitions) are in `page-transitions.md`.

### 56. Floating navbar
**Source:** Aceternity `@aceternity/floating-navbar` (hides on scroll down, shows on scroll up), `resizable-navbar` (full-width bar shrinks into a blurred pill after scroll), `navbar-menu` (hover dropdowns), `notch`; Kokonut `morphic-navbar`; React Bits `PillNav`, `GooeyNav`, `CardNav`, `StaggeredMenu`.  
**Looks like:** a compact blurred pill centered near the top that slides away when scrolling down and returns on scroll up.  
**Use when / avoid when:** long landing pages. Avoid hiding navigation on short pages or apps where nav is needed constantly.  
**Overuse:** 3.  
**Stack:** Motion `useScroll` + `useMotionValueEvent`. Differences from the original: visible at the top of the page, 4px jitter threshold, shows on keyboard focus.

```tsx
// components/fx/floating-nav.tsx
"use client";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useState } from "react";

export function FloatingNav({ items }: { items: { name: string; href: string }[] }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 80) setVisible(true);
    else if (Math.abs(y - prev) > 4) setVisible(y < prev);
  });

  return (
    <motion.nav
      aria-label="Primary"
      initial={false}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onFocusCapture={() => setVisible(true)}
      className="fixed inset-x-0 top-6 z-50 mx-auto flex w-fit items-center gap-1 rounded-full border border-black/5 bg-white/80 px-2 py-1.5 shadow-lg shadow-black/5 backdrop-blur-md dark:border-white/10 dark:bg-black/50"
    >
      {items.map((i) => (
        <a key={i.href} href={i.href} className="rounded-full px-3 py-1.5 text-sm text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10">
          {i.name}
        </a>
      ))}
    </motion.nav>
  );
}
```
**Tune:** hide distance -80..-120px, show threshold 60-120px from top, 200-300ms. Resizable variant: animate `width` from 100% to ~40rem + `backdrop-filter` once past 100px (use `layout` or a transform scale on a wrapper to avoid layout per frame).  
**A11y/perf:** `backdrop-filter` on a small pill is fine; on a full-width bar over video it is costly. Never hide nav while it contains focus.

### 57. Dock
**Source:** Magic UI `@magicui/dock` (`iconSize` 40, `iconMagnification` 60, `iconDistance` 140), Aceternity `@aceternity/floating-dock` (collapses to a vertical menu on mobile), Motion Primitives `dock`, React Bits `Dock`, Cult UI `dock`.  
**Looks like:** macOS dock: icons grow smoothly as the pointer approaches, neighbors grow less, all spring back when the pointer leaves.  
**Use when / avoid when:** portfolio socials/app launcher rows, "apps" metaphors. Avoid as the main site nav (unlabeled icons).  
**Overuse:** 3.  
**Stack:** Motion.

```tsx
// components/fx/dock.tsx
"use client";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { useFinePointer } from "@/lib/fx-hooks";

const MouseX = createContext<MotionValue<number> | null>(null);

export function Dock({ children, className = "" }: { children: ReactNode; className?: string }) {
  const mouseX = useMotionValue(Infinity);
  const fine = useFinePointer();
  return (
    <MouseX.Provider value={mouseX}>
      <div
        onPointerMove={fine ? (e) => mouseX.set(e.clientX) : undefined}
        onPointerLeave={() => mouseX.set(Infinity)}
        className={`mx-auto flex h-[58px] w-max items-end gap-2 rounded-2xl border border-black/10 bg-white/40 p-2 backdrop-blur-md dark:border-white/10 dark:bg-black/30 ${className}`}
      >
        {children}
      </div>
    </MouseX.Provider>
  );
}

export function DockIcon({ children, href, label, size = 40, magnification = 60, distance = 140 }: {
  children: ReactNode; href: string; label: string; size?: number; magnification?: number; distance?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const fallback = useMotionValue(Infinity); // unconditional: keeps rules-of-hooks happy
  const mouseX = useContext(MouseX) ?? fallback;
  const offset = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - b.x - b.width / 2;
  });
  const target = useTransform(offset, [-distance, 0, distance], [size, magnification, size]);
  const s = useSpring(target, { mass: 0.1, stiffness: 150, damping: 12 });
  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={label}
      style={{ width: s, height: s, padding: Math.max(6, size * 0.2) }}
      className="flex aspect-square items-center justify-center rounded-full bg-neutral-200/70 focus-visible:ring-2 dark:bg-neutral-800/70"
    >
      {children}
    </motion.a>
  );
}
```
**Tune:** `magnification` 1.3-1.8x `size`, `distance` 100-180px, spring mass 0.1 / stiffness 150 / damping 12 (lower damping = bouncier). `items-end` grows upward like macOS; `items-center` grows both ways.  
**A11y/perf:** icons must be labeled links. Width/height animate (layout per frame) by design so neighbors shift: fine for under 12 icons; disable magnification on touch (the pointer listener is only attached for fine pointers).

---

## G. Data & social proof

### 58. Animated list
**Source:** Magic UI `@magicui/animated-list` (the "notifications arriving" demo inside bento cells), Kokonut `ai-loading`, Animate UI `notification-list`.  
**Looks like:** iOS-style notification cards pop in at the top of a stack one per second, pushing older ones down with a spring.  
**Use when / avoid when:** showing activity/automation ("New signup", "Payment received") inside a bento cell or phone mockup. Avoid fake-looking data (use plausible names, amounts, timestamps).  
**Overuse:** 4. Bespoke: real event types from the product, varied card heights, slower cadence (1.5-2.5s).  
**Stack:** Motion `AnimatePresence` + `layout`.

```tsx
// components/fx/animated-list.tsx
"use client";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export function AnimatedList({ children, delay = 1000, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const items = useMemo(() => Children.toArray(children), [children]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!inView || reduce || index >= items.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [inView, reduce, index, delay, items.length]);

  const shown = useMemo(() => items.slice(0, (reduce ? items.length - 1 : index) + 1).reverse(), [items, index, reduce]);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-4 ${className}`}>
      <AnimatePresence>
        {shown.map((item, i) => (
          <motion.div
            key={isValidElement(item) ? item.key : i}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, originY: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 40 }}
            className="w-full"
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
// Wrap in a fixed-height box: <div className="relative h-[400px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"><AnimatedList>{cards}</AnimatedList></div>
```
**Tune:** `delay` 800-2500ms, spring stiffness 250-400 / damping 30-45, start scale 0 (pop) vs 0.95 + y -8 (calmer).  
**A11y/perf:** starts only in view; reduced motion shows the full list. If it represents live data, add `aria-live="polite"` to a real (non-demo) list only.

### 59. Animated tooltip (avatar stack)
**Source:** Aceternity `@aceternity/animated-tooltip`, Magic UI `@magicui/avatar-circles` (static overlapping stack + "+99" bubble), Animate UI `components-animate-avatar-group`, Kokonut `team-selector`.  
**Looks like:** overlapping round avatars; hovering one pops up a black name tag that springs in and swings/tilts with the pointer's horizontal position over the avatar.  
**Use when / avoid when:** "Loved by" rows, team credits, contributors. Avoid with stock photos.  
**Overuse:** 4. Bespoke: squircle avatars, tag in brand color, no rotation (translate only).  
**Stack:** Motion.

```tsx
// components/fx/avatar-stack.tsx
"use client";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState, type PointerEvent } from "react";

type Person = { id: number; name: string; role: string; image: string };

export function AvatarStack({ people }: { people: Person[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const x = useMotionValue(0);
  const spring = { stiffness: 100, damping: 15 };
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), spring);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), spring);
  const onMove = (e: PointerEvent<HTMLImageElement>) => x.set(e.nativeEvent.offsetX - e.currentTarget.offsetWidth / 2);

  return (
    <ul className="flex items-center">
      {people.map((p) => (
        <li
          key={p.id}
          tabIndex={0}
          aria-describedby={hovered === p.id ? `tip-${p.id}` : undefined}
          className="group relative -mr-4 rounded-full outline-none focus-visible:ring-2"
          onPointerEnter={() => setHovered(p.id)}
          onPointerLeave={() => setHovered(null)}
          onFocus={() => setHovered(p.id)}
          onBlur={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered === p.id && (
              <motion.div
                id={`tip-${p.id}`}
                role="tooltip"
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 10 } }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{ translateX, rotate }}
                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-md bg-black px-4 py-2 text-xs whitespace-nowrap shadow-xl"
              >
                <span className="absolute inset-x-10 -bottom-px h-px w-[20%] bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
                <span className="absolute -bottom-px left-10 h-px w-[40%] bg-linear-to-r from-transparent via-sky-500 to-transparent" />
                <span className="relative text-base font-bold text-white">{p.name}</span>
                <span className="text-white/80">{p.role}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onPointerMove={onMove}
            src={p.image}
            alt={p.name}
            width={56}
            height={56}
            className="relative size-14 rounded-full border-2 border-white object-cover object-top transition-transform duration-500 group-hover:z-30 group-hover:scale-105"
          />
        </li>
      ))}
    </ul>
  );
}
```
**Tune:** overlap -8..-16px, rotate range +-15..45deg (lower = classier), tooltip spring stiffness 200-300 / damping 10-20.  
**A11y/perf:** focus shows the tooltip too; names are in `alt` anyway. Transform-only.

### 60. Orbiting circles
**Source:** Magic UI `@magicui/orbiting-circles` (`radius` 160, `duration` 20, `iconSize` 30, `path`, `reverse`, `speed`).  
**Looks like:** integration logos riding circular orbits around a central logo, inner ring clockwise, outer ring counter-clockwise, faint circle paths drawn.  
**Use when / avoid when:** "works with your stack" sections with real integrations. Avoid with more than ~10 logos.  
**Overuse:** 4. Bespoke: elliptical orbit (scaleY 0.4 on the ring wrapper for a tilted 3D orbit), logos in monochrome.  
**Stack:** CSS (counter-rotation keeps icons upright).

```tsx
// components/fx/orbiting-circles.tsx  (parent: relative flex items-center justify-center overflow-hidden, fixed height)
import { Children, type CSSProperties, type ReactNode } from "react";

export function OrbitingCircles({ children, radius = 160, duration = 20, reverse = false, iconSize = 30, path = true }: {
  children: ReactNode; radius?: number; duration?: number; reverse?: boolean; iconSize?: number; path?: boolean;
}) {
  const count = Children.count(children);
  return (
    <>
      {path && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <circle cx="50%" cy="50%" r={radius} fill="none" className="stroke-black/10 dark:stroke-white/10" />
        </svg>
      )}
      {Children.map(children, (child, i) => (
        <div
          className="fx-orbit fx-loop absolute flex items-center justify-center rounded-full"
          style={{
            "--radius": radius, "--angle": (360 / count) * i, "--duration": duration,
            width: iconSize, height: iconSize,
            animationDirection: reverse ? "reverse" : undefined,
          } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </>
  );
}
// <div className="relative flex h-[500px] items-center justify-center overflow-hidden"><Logo/><OrbitingCircles iconSize={40}>{a}{b}{c}</OrbitingCircles><OrbitingCircles radius={100} reverse speed>{d}{e}</OrbitingCircles></div>
```

```css
.fx-orbit {
  /* static position doubles as the reduced-motion fallback (otherwise all icons collapse to the center) */
  transform: rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg));
  animation: fx-orbit calc(var(--duration) * 1s) linear infinite;
}
@keyframes fx-orbit {
  from { transform: rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg)); }
  to   { transform: rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg - 360deg)); }
}
```
**Tune:** radii 80-200px, 20-40s per turn (outer slower), icon 24-48px.  
**A11y/perf:** transform-only; list the integrations in text too. Absolutely positioned children of a flex container are centered by `justify-content/align-items`, which is why no top/left is needed.

### 61. Animated beam
**Source:** Magic UI `@magicui/animated-beam` (hub-and-spoke "integrations" demos), Aceternity `background-beams-with-collision` (different effect), Cult UI `grid-beam`.  
**Looks like:** curved SVG connectors between icon nodes; a short orange-violet light pulse travels along each connector, some in reverse, suggesting data flow into a central hub.  
**Use when / avoid when:** explaining data flow, sync, AI tool calls. Avoid decorative use with no real flow.  
**Overuse:** 4. Bespoke: single hue, real node labels, straight/orthogonal routes (curvature 0), staggered delays that follow the actual pipeline order.  
**Stack:** SVG + Motion gradient animation; geometry measured with ResizeObserver.

```tsx
// components/fx/animated-beam.tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState, type RefObject } from "react";
import { cssId } from "@/lib/fx-hooks";

type Props = {
  containerRef: RefObject<HTMLElement | null>; fromRef: RefObject<HTMLElement | null>; toRef: RefObject<HTMLElement | null>;
  curvature?: number; reverse?: boolean; duration?: number; delay?: number;
  pathColor?: string; pathWidth?: number; pathOpacity?: number; gradientStart?: string; gradientStop?: string;
};

export function AnimatedBeam({
  containerRef, fromRef, toRef, curvature = 0, reverse = false, duration = 5, delay = 0,
  pathColor = "gray", pathWidth = 2, pathOpacity = 0.2, gradientStart = "#ffaa40", gradientStop = "#9c40ff",
}: Props) {
  const id = cssId(useId());
  const reduce = useReducedMotion();
  const [d, setD] = useState("");
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const c = containerRef.current, a = fromRef.current, b = toRef.current;
      if (!c || !a || !b) return;
      const rc = c.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const sx = ra.left - rc.left + ra.width / 2, sy = ra.top - rc.top + ra.height / 2;
      const ex = rb.left - rc.left + rb.width / 2, ey = rb.top - rc.top + rb.height / 2;
      setBox({ w: rc.width, h: rc.height });
      setD(`M ${sx},${sy} Q ${(sx + ex) / 2},${sy - curvature} ${ex},${ey}`);
    };
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  const x = reverse ? { x1: ["90%", "-10%"], x2: ["100%", "0%"] } : { x1: ["10%", "110%"], x2: ["0%", "100%"] };
  return (
    <svg aria-hidden fill="none" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} className="pointer-events-none absolute top-0 left-0">
      <path d={d} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      {!reduce && <path d={d} stroke={`url(#${id})`} strokeWidth={pathWidth} strokeLinecap="round" />}
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{ ...x, y1: ["0%", "0%"], y2: ["0%", "0%"] }}
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity }}
        >
          <stop stopColor={gradientStart} stopOpacity="0" />
          <stop stopColor={gradientStart} />
          <stop offset="32.5%" stopColor={gradientStop} />
          <stop offset="100%" stopColor={gradientStop} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}
// Nodes: <div ref={containerRef} className="relative flex ..."><Circle ref={a}/>...<Circle ref={hub}/></div> then <AnimatedBeam containerRef={containerRef} fromRef={a} toRef={hub} curvature={-75} />
```
**Tune:** `curvature` -100..100 (0 = straight), `duration` 3-6s with the expo ease (pulse sprints then settles), stagger `delay` by pipeline order, `pathOpacity` 0.1-0.25.  
**A11y/perf:** the gradient sweep uses `userSpaceOnUse` percentages of the whole SVG, so long and short beams move at different visual speeds (intended). Re-measures on container resize only: if nodes move for other reasons (fonts loading), also observe the node elements.

### 62. Hero video dialog
**Source:** Magic UI `@magicui/hero-video-dialog` (`animationStyle`: from-center, from-bottom, from-top, from-left, from-right, fade, top-in-bottom-out, left-in-right-out).  
**Looks like:** a product video thumbnail with a frosted circular play button that scales on hover; click opens a lightbox that animates from the chosen direction and plays an embedded video; X to close.  
**Use when / avoid when:** a real demo video exists. The best "wow" is the video content itself.  
**Overuse:** 3.  
**Mechanic:** thumbnail `<button>` (image + play icon in a `backdrop-blur-md` circle, `group-hover:scale-100` from `scale-[0.9]`), `AnimatePresence` overlay `bg-black/50 backdrop-blur-md` and a `motion.div` with the chosen preset (e.g. from-center: `initial { scale: 0.5, opacity: 0 }`, spring damping 30 / stiffness 300), `<iframe allow="autoplay; encrypted-media" allowFullScreen>` mounted only when open.  
**A11y/perf:** use `<dialog>`/Radix for focus trap and Escape; lazy-mount the iframe (YouTube embeds cost 500 kb+); `lite-youtube` style facades keep LCP clean.

---

## H. Mockups

### 63. Safari / iPhone frames
**Source:** Magic UI `@magicui/safari` (SVG 1203x753, props `url`, `imageSrc`, `videoSrc`, `mode: "default" | "simple"`), `@magicui/iphone` (formerly `iphone-15-pro`, SVG 433x882, `src`/`videoSrc`), `@magicui/android`; Cult UI `mock-browser-window`.  
**Looks like:** clean browser chrome (traffic lights + URL pill) or a phone bezel around a screenshot/video.  
**Use when / avoid when:** framing product UI so it reads as software. Avoid double framing (frame inside a tilted tablet inside a card).  
**Overuse:** 3. Bespoke: match the frame to the brand theme (dark chrome for dark sites), or skip the frame and crop the UI tightly.  
**Stack:** HTML/CSS frame (lighter and more themeable than an SVG).

```tsx
// components/fx/browser-frame.tsx
import type { ReactNode } from "react";

export function BrowserFrame({ url = "acme.com", children, className = "" }: { url?: string; children: ReactNode; className?: string }) {
  return (
    <figure className={`overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900 ${className}`}>
      <div className="flex h-10 items-center gap-3 border-b border-black/5 px-4 dark:border-white/10">
        <div aria-hidden className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-6 w-1/2 min-w-0 items-center justify-center rounded-md bg-black/5 px-3 text-xs text-neutral-500 dark:bg-white/10">
          <span className="truncate">{url}</span>
        </div>
        <div aria-hidden className="w-12" />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">{children}</div>
    </figure>
  );
}
```
**Tune:** radius 10-14px, chrome height 36-44px, shadow = the page's elevation token. Phone: `aspect-[9/19.5] rounded-[3rem] border-[10px] border-neutral-900` + a `rounded-full` pill for the Dynamic Island; screen radius = outer radius minus border.  
**A11y/perf:** the screenshot inside needs real `alt`; if it is LCP, serve it via `next/image` with `priority`.

### 64. Terminal animation
**Source:** Magic UI `@magicui/terminal` (`<Terminal><TypingAnimation>` + `<AnimatedSpan delay>` lines, sequenced), Cult UI `terminal-animation`, Aceternity `terminal`.  
**Looks like:** a dark window with traffic lights; a command types out, then green check lines appear one by one ("Preflight checks", "Validating Tailwind CSS", "Installing dependencies"), ending with a success message.  
**Use when / avoid when:** CLI products, SDK onboarding, "install in one command" moments.  
**Overuse:** 3. Bespoke: the real command and real output of your tool, brand accent for the prompt symbol.  
**Stack:** React timers, starts in view.

```tsx
// components/fx/terminal-demo.tsx
"use client";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Line = { kind: "cmd" | "out"; text: string; className?: string };

export function TerminalDemo({ lines, typeMs = 40, gapMs = 450 }: { lines: Line[]; typeMs?: number; gapMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!inView || reduce || line >= lines.length) return;
    const current = lines[line];
    const typing = current.kind === "cmd" && chars < current.text.length;
    const t = setTimeout(
      () => (typing ? setChars((c) => c + 1) : (setLine((n) => n + 1), setChars(0))),
      typing ? typeMs : gapMs,
    );
    return () => clearTimeout(t);
  }, [inView, reduce, line, chars, lines, typeMs, gapMs]);

  const upTo = reduce ? lines.length : line;
  return (
    <div ref={ref} className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-neutral-950 font-mono text-sm text-neutral-200 shadow-2xl">
      <div aria-hidden className="flex gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#febc2e]" /><span className="size-3 rounded-full bg-[#28c840]" />
      </div>
      <pre className="sr-only">{lines.map((l) => (l.kind === "cmd" ? `$ ${l.text}` : l.text)).join("\n")}</pre>
      <pre aria-hidden className="min-h-56 p-4 whitespace-pre-wrap">
        {lines.map((l, i) => {
          if (i > upTo || (i === upTo && l.kind === "out")) return null;
          const text = i === upTo ? l.text.slice(0, chars) : l.text;
          return (
            <div key={i} className={l.className}>
              {l.kind === "cmd" && <span className="text-emerald-400">$ </span>}
              {text}
              {i === upTo && <span className="fx-caret" />}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
// lines: [{ kind: "cmd", text: "npx shadcn@latest init" }, { kind: "out", text: "✔ Preflight checks.", className: "text-emerald-400" }, ...]
```
**Tune:** type 30-60ms/char, output gap 300-700ms, `min-h` set to the final height (no layout jump). Caret CSS from recipe 19.  
**A11y/perf:** full transcript in the sr-only `<pre>`; the animated copy is hidden.

### 65. Code comparison
**Source:** Magic UI `@magicui/code-comparison` (deps `shiki`, `next-themes`; `beforeCode`, `afterCode`, `language`, `filename`, `lightTheme`, `darkTheme`, `highlightColor`), Cult UI `code-block`, Animate UI `components-animate-code-tabs`.  
**Looks like:** two side-by-side editor panes (before / after) with a "VS" badge between them; highlighted/diff lines; the non-hovered pane blurs slightly.  
**Use when / avoid when:** "replace 40 lines with 4" pitches for SDKs.  
**Overuse:** 2.  
**Mechanic:** highlight both snippets with shiki at build time or in a server component (`codeToHtml(code, { lang, theme })`), render the HTML, mark lines with `// [!code highlight]` / `// [!code --]` / `// [!code ++]` via shiki transformers, and on hover of one pane apply `filter: blur(2px)` to the other (`group-hover` / `:has()`).  
**A11y/perf:** do shiki work server-side (it is large); keep code as real text (copyable).

---

## I. Cursor & fun

Custom cursor fundamentals (dot + ring, magnetic, blend-mode cursor, pointer: fine gating) are in `interactions.md`.

### 66. Splash cursor
**Source:** React Bits `@react-bits/SplashCursor-TS-TW` (port of Pavel Dobryakov's WebGL fluid simulation, ~1.3k lines; defaults `SIM_RESOLUTION 128`, `DYE_RESOLUTION 1440`, `DENSITY_DISSIPATION 3.5`, `VELOCITY_DISSIPATION 2`, `PRESSURE 0.1`, `PRESSURE_ITERATIONS 20`, `CURL 3`, `SPLAT_RADIUS 0.2`, `SPLAT_FORCE 6000`, `SHADING true`, `RAINBOW_MODE true`, `TRANSPARENT true`).  
**Looks like:** moving the mouse paints swirling, glowing rainbow ink that curls and fades across the whole viewport.  
**Use when / avoid when:** experimental/art sites, a playground page, a 404. Avoid on marketing sites (it covers content, drains battery, and is instantly recognizable as the React Bits demo).  
**Overuse:** 5.  
**Bespoke:** `RAINBOW_MODE: false` + one brand `COLOR`, confine it to one hero canvas (not fixed full-screen), `DYE_RESOLUTION 512-1024`, `DENSITY_DISSIPATION 4-6` so ink clears fast.  
**A11y/perf:** runs a full fluid solver every frame even when idle: mount only on `(pointer: fine)` and `prefers-reduced-motion: no-preference`, pause on `visibilitychange` and offscreen, `pointer-events: none` on the canvas. Deeper fluid/shader notes: `webgl-shaders-3d.md`.

### 67. Blob cursor
**Source:** React Bits `@react-bits/BlobCursor-TS-TW` (GSAP; `trailCount` 3, sizes [60,125,75], fast lead 0.1s `power3.out`, trailing 0.5s `power1.out`, gooey SVG filter `feGaussianBlur stdDeviation 30` + `feColorMatrix "... 35 -10"`), React Bits `GhostCursor`, `TargetCursor`, `ImageTrail`, `PixelTrail`, Magic UI `smooth-cursor`, `pointer`.  
**Looks like:** 2-3 colored circles chase the pointer at different lags and merge into one gooey blob.  
**Use when / avoid when:** playful portfolios, inside a bounded hero only.  
**Overuse:** 4.  
**Mechanic:** container with `onPointerMove`; per blob `gsap.to(el, { x, y, duration: i === 0 ? 0.1 : 0.5, ease })` (better: `gsap.quickTo(el, "x", { duration, ease })` created once per blob); the wrapper gets `filter: url(#goo)` so overlapping circles fuse; keep the native cursor visible or provide a clear replacement.  
**A11y/perf:** gate on `(hover: hover) and (pointer: fine)`; `quickTo` avoids creating a tween per event; the SVG filter repaints the blob layer each frame, so keep the container small.

---

## Recipe combos

Budget rule for every composition: at most ONE ambient background effect per viewport, ONE attention effect (on the primary CTA), ONE hover system site-wide. Everything else is static, well-set type and real content.

| # | Section | Composition (recipe numbers) | Why it works / taste notes |
|---|---|---|---|
| 1 | AI / dev-tool SaaS hero (dark) | Headline with one gradient word in brand hues (16) + blur-in subline (18) + ShimmerButton primary (26) + InteractiveHoverButton secondary (31) + FlickeringGrid masked to a radial behind the headline (7) + noise (13); screenshot in BrowserFrame (63) inside ContainerScroll at 10-12deg (46); logo Marquee below the fold line (44) | Ambient = flickering grid only. No spotlight, beams or meteors on top. |
| 2 | Feature bento | Bento (43) with live cells: AnimatedList of real events (58), AnimatedBeam hub of integrations (61), NumberTicker stat (23), Marquee of file cards (44); SpotlightGrid border glow across cells (34) | Each cell SHOWS the feature. Glow is the single hover system. |
| 3 | Portfolio projects | ExpandableCards list (38) or FocusCards grid (37) + TiltCard at 6-8deg on thumbnails (36); project detail pages use CompareSlider for redesign before/after (53) | Imagery carries it; motion is state feedback. |
| 4 | Portfolio "about" | CardStack of personal photos (39) + CircularText "available for work" sticker (24) + Dock of socials with labels (57) + TextReveal manifesto (22) | Personal, tactile; one scroll-linked moment only. |
| 5 | Social proof | Two Marquee rows of short testimonials in opposite directions, pause on hover (44) + AvatarStack "Loved by 2,000+ teams" (59) + 3 NumberTickers (23) | Keep quotes under 25 words; show a static grid under reduced motion. |
| 6 | Integrations | OrbitingCircles two rings (inner 100px reverse, outer 180px) around the product logo (60) + Ripple behind the logo (9); OR AnimatedBeam hub-and-spoke (61) | Pick one metaphor: orbit = ecosystem, beams = data flow. |
| 7 | Product walkthrough | StickyScrollReveal with BrowserFrame visuals (45 + 63); Timeline for changelog / roadmap (50); TracingBeam on long case studies (49) | Steps must map to real UI states. |
| 8 | Launch CTA / pre-footer | LampSection (2) + big headline + one CTA; click burst or `canvas-confetti` only after a real success (32) | Save the lamp for the end: it reads as a finale. |
| 9 | Dev-tool / CLI hero | TerminalDemo with the real install command (64) + CodeComparison before/after (65) + DotPattern or RetroGrid clipped to the lower 40% (8 or 6) | Real output beats any animated background. |

## How to find more

- **21st.dev** (12k+ components): browse by tag `https://21st.dev/community/components/s/<tag>` (hero, features, cta, pricing-section, testimonials, navigation, card, button...), libraries at `/community/libraries` (e.g. `/@dillionverma/library/magic-ui`, `/@manuarora700/library/aceternity-ui`, `/@ibelick/library/motion-primitives`). Append `.md` to component, category, author and library URLs for agent-readable markdown. CLI: `npx @21st-dev/cli@latest search "pricing table" --type c`, `21st get <id>` (prints code + demo), `21st add <user>/<slug>`. Search and previews are free; code retrieval has a free daily quota and needs login or an API key. Agent setup (21st MCP, formerly Magic MCP): `npx @21st-dev/cli@latest init --client claude`; old tool names map to `search`, `get_inspiration`, `generate`.
- **shadcn registry directory:** `https://ui.shadcn.com/r/registries.json` (382 namespaces). Worth browsing for motion: `@magicui`, `@aceternity`, `@react-bits`, `@motion-primitives`, `@animate-ui`, `@cult-ui`, `@kokonutui`, `@skiper-ui`, `@eldoraui`, `@smoothui`, `@paceui-gsap` (GSAP components), `@ui-layouts`, `@scrollxui`, `@spell`, `@systaliko-ui`, `@ncdai`; blocks: `@tailark`, `@shadcnblocks`; animated icons: `@lucide-animated`, `@heroicons-animated`, `@icons-animated`. Inspect before installing: fetch the raw `.../r/<name>.json` and read `files[].content`, `dependencies`, `css`.
- **React Bits:** reactbits.dev categories (Text Animations, Animations, Components, Backgrounds, Micro), plus the Background Studio / Texture Lab tools that export configured backgrounds.
- **GitHub source search:** `gh search code "offset-path: rect(" --language tsx`, `gh api repos/magicuidesign/magicui/contents/apps/www/registry/magicui`, `gh api repos/DavidHDev/react-bits/contents/src/ts-tailwind`, `gh api repos/ibelick/motion-primitives/contents/components/core`, `gh api repos/imskyleen/animate-ui/git/trees/main?recursive=1`, `gh api repos/nolly-studio/cult-ui/git/trees/main?recursive=1`.
- **Bespoke over registry:** Codrops demos (tympanus.net/codrops), uiverse.io (CSS-only buttons/loaders), CodePen: search the mechanic ("conic border @property", "gooey text morph", "offset-path border") rather than the component name, then rebuild in your tokens. Awwwards/Godly references: `inspiration-sources.md`.

## Gotchas

- **Keyframes silently missing:** Aceternity registry items ship no CSS, so `animate-spotlight`, `animate-aurora`, `animate-scroll` do nothing until you paste the `@theme` + `@keyframes` from the docs page. Magic UI items include them (the CLI writes into `globals.css`); if you copy files by hand, copy the `css` block from `https://magicui.design/r/<name>.json` too.
- **Tailwind v3-era code in v4 projects:** `bg-gradient-to-*` became `bg-linear-to-*`; `tailwind.config.js` keyframes move into `@theme`; `translate-*`, `rotate-*`, `scale-*` now set the individual `translate`/`rotate`/`scale` properties, which COMPOSE with Motion's `transform` instead of being overwritten (double transforms). `transition-all` also animates those properties; prefer `transition-[translate,opacity]`.
- **`framer-motion` vs `motion/react`:** Skiper and a few Magic UI items import `framer-motion`. Two copies of Motion in one bundle break shared context (`MotionConfig`, `LayoutGroup`, layoutId across components). Rewrite imports to `motion/react`.
- **Hydration mismatches:** `Math.random()` in render (beams, meteors, sparkles, stack rotations) differs server vs client. Generate in `useEffect` or use a seeded function (recipe 3).
- **`useId()` in `url(#...)`:** React 19 ids contain characters that are not safe in CSS/SVG references; sanitize (`cssId`) or use a manual prefix.
- **Nested scroll containers:** Aceternity sticky-scroll-reveal and parallax-scroll scroll an inner `overflow-y-auto` box; wheel/touch gets trapped and Lenis ignores it. Convert to page scroll (recipes 45, 48).
- **Registry access changed:** Aceternity marks some items (e.g. `github-globe`) as token-only (401); 21st.dev `/r/` URLs return `authentication_required` without login; React Bits is MIT + Commons Clause (do not resell the components).
- **Theme coupling:** Magic UI `magic-card` imports `next-themes`, `code-comparison` too; without it the build fails. Replace with CSS `:is(.dark)` selectors or your theme hook.
- **Offscreen loops:** canvas/WebGL effects (particles, flickering grid, globe, splash cursor, wavy background) keep running offscreen unless you add an IntersectionObserver; two of them on one page will drop frames on mid-range laptops.
- **3D flattening:** `overflow: hidden`, `filter`, `opacity < 1` on an intermediate element flatten `transform-style: preserve-3d` (3D card layers stop popping). Clip on the leaf.
- **Large blurred/animated areas:** aurora background (background-position under blur + blend), blur-in on paragraphs, filter transitions on big images = repaint jank. Keep filters on small elements or static layers.
- **Hover-only content:** bento CTAs, focus-card titles, avatar names must also be visible or reachable on touch and keyboard.
- **Duplicated marquee content:** clones without `inert` are read twice by screen readers and add tab stops.
- **layoutId collisions:** two instances of the same tabs/expandable component on one page share `layoutId` strings and morph into each other. Suffix with `useId()`.
- **Reduced motion with Motion:** `<MotionConfig reducedMotion="user">` at the app root disables transform/layout animations globally while keeping opacity; still handle CSS loops (`.fx-loop`) and canvases yourself.
- **The "registry soup" tell:** spotlight + beams + meteors + gradient headline + shimmer button + border beam on one screen is the most recognizable AI-template look of 2024-26. Apply the budget rule in [Recipe combos](#recipe-combos).

## Sources

- shadcn registry directory: https://ui.shadcn.com/docs/directory and https://ui.shadcn.com/r/registries.json
- Magic UI docs/install: https://magicui.design/docs/installation ; registry items https://magicui.design/r/shimmer-button.json (+ marquee, shine-border, ripple, meteors, orbiting-circles, aurora-text, animated-shiny-text, rainbow-button, pulsating-button, animated-gradient-text)
- Magic UI source: https://github.com/magicuidesign/magicui (registry.json, apps/www/registry/magicui/*.tsx)
- Aceternity UI: https://ui.aceternity.com/components ; https://ui.aceternity.com/components/spotlight ; /components/infinite-moving-cards ; /components/aurora-background ; /components/background-beams ; /docs/add-utilities ; registry JSON https://ui.aceternity.com/registry/<name>.json (spotlight, lamp, background-beams, sparkles, hero-parallax, container-scroll-animation, 3d-card, card-spotlight, infinite-moving-cards, animated-tooltip, floating-navbar, tracing-beam, wavy-background, glowing-effect, timeline, compare, text-generate-effect, typewriter-effect, flip-words, hover-border-gradient, moving-border, focus-cards, apple-cards-carousel, expandable-card-demo-standard, layout-grid, parallax-scroll, world-map, sticky-scroll-reveal, floating-dock, aurora-background, bento-grid, meteors, tabs, text-hover-effect)
- React Bits: https://github.com/DavidHDev/react-bits (README, public/r/*.json, src/ts-tailwind/*) and https://reactbits.dev/r/SplashCursor-TS-TW.json
- Motion Primitives: https://github.com/ibelick/motion-primitives (components/core/*), https://motion-primitives.com/docs/border-trail , https://motion-primitives.com/c/border-trail.json
- Animate UI: https://github.com/imskyleen/animate-ui , https://animate-ui.com/r/registry.json , https://animate-ui.com/r/components-backgrounds-bubble.json
- Cult UI: https://github.com/nolly-studio/cult-ui
- Kokonut UI: https://kokonutui.com/r/registry.json , https://kokonutui.com/docs
- Skiper UI: https://skiper-ui.com/registry/registry.json
- Origin UI redirect: https://originui.com -> https://coss.com/ui
- 21st.dev: https://21st.dev/llms.txt , https://21st.dev/.well-known/skills/index.json , https://21st.dev/.well-known/skills/21st-cli-use/SKILL.md , https://21st.dev/r/shadcn/button (auth check)
- cobe 2.0.1: https://github.com/shuding/cobe (README), npm `cobe`
- Browser support: https://github.com/mdn/browser-compat-data (css/properties/offset-path.json: basic shapes Chrome 116, Firefox 122, Safari 18; css/properties/animation-timeline.json: Chrome 115, Safari 26, Firefox preview only)
- Note: Reddit (r/reactjs, r/nextjs, r/webdev, r/Frontend) could not be fetched from this environment (blocked for automated access); overuse scores reflect the registries' own default demos and prevailing 2025-26 design commentary rather than quoted threads.
