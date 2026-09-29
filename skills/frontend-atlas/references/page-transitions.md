# Page Transitions, Preloaders & Menus
> Load when: animating between routes/pages or views (SPA or MPA), shared-element list->detail morphs, theme-toggle reveals, intro preloaders, fullscreen menus, hide-on-scroll navs, or fixing scroll/focus/ScrollTrigger bugs after navigation.
> Stack assumptions: React 19.3 / Next 16.3 App Router + TS, GSAP 3.15 + @gsap/react 2.1, Motion 13.4 (`motion/react`), Lenis 1.3 (`lenis/react`). Vanilla/MPA variants: native View Transitions, Swup 4.10, Barba 2.10, Astro `<ClientRouter />`.

## Contents
- [Decision guide](#decision-guide)
- [Browser support (Sept 2026)](#browser-support-sept-2026)
- [Shared tokens](#shared-tokens)
- Recipes - View Transitions core
  - [1. Same-document View Transition helper (vanilla)](#1-same-document-view-transition-helper-vanilla)
  - [2. The pseudo-element tree: naming, classes, custom keyframes](#2-the-pseudo-element-tree-naming-classes-custom-keyframes)
  - [3. Cross-document (MPA) transitions](#3-cross-document-mpa-transitions)
  - [4. React 19.3 `<ViewTransition>` + Next 16 routes](#4-react-193-viewtransition--next-16-routes)
  - [5. Shared-element list->detail (3 ways)](#5-shared-element-list-detail-3-ways)
  - [6. Motion `AnimatePresence` in the App Router (and why it is fragile)](#6-motion-animatepresence-in-the-app-router-and-why-it-is-fragile)
  - [7. GSAP overlay route transitions (the Awwwards default)](#7-gsap-overlay-route-transitions-the-awwwards-default)
- Recipes - archetypes
  - [8. Fade-through](#8-fade-through)
  - [9. Curtain wipe: single panel and staggered stairs](#9-curtain-wipe-single-panel-and-staggered-stairs)
  - [10. Circle reveal from the click point (theme toggle + routes)](#10-circle-reveal-from-the-click-point-theme-toggle--routes)
  - [11. Slide stack / push](#11-slide-stack--push)
  - [12. Text-mask / logo transition](#12-text-mask--logo-transition)
  - [13. Morphing header / title](#13-morphing-header--title)
  - [14. Dark overlay with page-title flash](#14-dark-overlay-with-page-title-flash)
- Recipes - non-React MPAs
  - [15. Swup 4](#15-swup-4)
  - [16. Barba 2 + GSAP](#16-barba-2--gsap)
  - [17. Astro `<ClientRouter />`](#17-astro-clientrouter-)
- Recipes - preloaders & intro gating
  - [18. Counter 0-100 + curtain, skipped on repeat visits](#18-counter-0-100--curtain-skipped-on-repeat-visits)
  - [19. Intro gate store (hero waits for preloader)](#19-intro-gate-store-hero-waits-for-preloader)
  - [20. Image-stack loader](#20-image-stack-loader)
  - [21. Logo draw loader (CSS only)](#21-logo-draw-loader-css-only)
  - [22. Asset preloading without killing LCP](#22-asset-preloading-without-killing-lcp)
- Recipes - menus & nav
  - [23. Fullscreen menu overlay](#23-fullscreen-menu-overlay)
  - [24. Nav hide on scroll down / show on up](#24-nav-hide-on-scroll-down--show-on-up)
- [25. Route-change hygiene component](#25-route-change-hygiene-component)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide
| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| Calm, product-grade route change (SaaS, docs, app) | React `<ViewTransition>` + Next `transitionTypes` | 0 kb extra, GPU snapshots | [4](#4-react-193-viewtransition--next-16-routes) |
| Thumbnail grows into detail hero across routes | `<ViewTransition name>` pair | 0 kb | [5a](#5-shared-element-list-detail-3-ways) |
| Card expands into modal on the same page | Motion `layoutId` | ~34 kb (Motion) | [5b](#5-shared-element-list-detail-3-ways) |
| Plain HTML/MPA site, zero JS | `@view-transition { navigation: auto }` | 0 kb, Chromium + Safari only | [3](#3-cross-document-mpa-transitions) |
| Agency/portfolio "cover then reveal" choreography | GSAP overlay + `router.push` after cover | GSAP ~27 kb | [7](#7-gsap-overlay-route-transitions-the-awwwards-default), [9](#9-curtain-wipe-single-panel-and-staggered-stairs) |
| Theme switch that feels physical | VT + `clip-path: circle()` from pointer | 0 kb | [10](#10-circle-reveal-from-the-click-point-theme-toggle--routes) |
| iOS-style drill-in / back | VT types `forward`/`back` slide or push | 0 kb | [11](#11-slide-stack--push) |
| Brand moment between pages | Logo/text mask overlay | GSAP | [12](#12-text-mask--logo-transition), [14](#14-dark-overlay-with-page-title-flash) |
| Static site (WordPress, Webflow export, Eleventy) needing SPA-feel | Swup 4 (+ themes) or Barba 2 + GSAP | 9 kb / ~7 kb + GSAP | [15](#15-swup-4), [16](#16-barba-2--gsap) |
| First-visit brand intro | Counter + curtain, sessionStorage skip | GSAP | [18](#18-counter-0-100--curtain-skipped-on-repeat-visits) |
| Fullscreen menu | clip-path inset + staggered masked links, Lenis stop | GSAP | [23](#23-fullscreen-menu-overlay) |

Taste rules:
- A route transition must finish in <= 1.0 s total (cover + reveal) and never wait on the network visibly; if the page is not ready, the overlay holds, it does not loop a spinner.
- Pick ONE transition language per site (e.g. stairs everywhere) and vary only direction/colour. Five different wipes on one site is the AI tell.
- Product/app UIs: 200-400 ms crossfades or morphs only. Curtains, counters and logo walls belong to portfolios, launches and brand sites.
- Never replay the intro on every navigation; intros run once per session.

## Browser support (Sept 2026)
From MDN browser-compat-data (main branch, 2026-09-26).

| Feature | Chrome/Edge | Firefox | Safari |
|---|---|---|---|
| `document.startViewTransition(cb)`, `::view-transition-*`, `view-transition-name` | 111 | 144 | 18 |
| `startViewTransition({ update, types })`, `ViewTransition.types`, `:active-view-transition-type()` | 125 | 147 | 18.2 |
| `view-transition-class` | 125 | 144 | 18.2 |
| `view-transition-name: match-element` | 137 | 144 | 18.4 |
| Cross-document `@view-transition`, `pageswap`/`pagereveal`, `<link rel="expect">` | 126 (events 123-124) | no | 18.2 |
| Nested groups `view-transition-group: contain / nearest` | 140 | no | no |
| `document.activeViewTransition` | 142 | 147 | 26.2 |
| `ViewTransition.waitUntil()` | 144 | no | no |
| Element-scoped `el.startViewTransition()`, `view-transition-scope` | 147 | no | no |

Same-document VT is Baseline (Newly available, Oct 2025). Everything must degrade to an instant swap: feature-detect, never gate navigation on the animation.

## Shared tokens
Put once in `globals.css`; every recipe below reads these.
```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
  --dur-exit: 150ms;      /* old content leaves fast */
  --dur-enter: 250ms;     /* new content fades in */
  --dur-move: 400ms;      /* morphs and slides */
  --dur-cover: 650ms;     /* curtains */
  --dur-reveal: 750ms;
  --curtain-bg: #0c0c0c;
  --curtain-fg: #f2efe9;
}
```
```ts
// lib/transition-tokens.ts (GSAP uses seconds)
export const TT = {
  cover: 0.65,
  reveal: 0.75,
  stagger: 0.05,
  easeCover: "power4.inOut",
  easeReveal: "expo.inOut",
  navTimeoutMs: 4000, // reveal anyway if the route never commits
} as const;
```

## Recipes

### 1. Same-document View Transition helper (vanilla)
**Looks like:** the browser snapshots the page, you mutate the DOM, and old/new states crossfade (default 250 ms) or run your CSS keyframes. Named elements morph position and size.  
**Use when / avoid when:** filter/sort grids, tab switches, theme changes, SPA view swaps in any framework. Avoid for updates that fire faster than ~300 ms apart (typing, sliders): each call skips the previous transition and the page flickers.  
**Stack:** Vanilla TS
```ts
// lib/view-transition.ts
type Update = () => void | Promise<void>;
type VTLike = Pick<ViewTransition, "finished" | "ready" | "updateCallbackDone" | "skipTransition">;

const settled = (p: Promise<unknown>) => p.then(() => undefined);

function noTransition(update: Update): VTLike {
  const done = settled(Promise.resolve().then(update));
  // ready resolves (not rejects) so callers can always `await vt.ready` before WAAPI code
  return { finished: done, ready: Promise.resolve(undefined), updateCallbackDone: done, skipTransition: () => {} };
}

export function transition(update: Update, types: string[] = []): VTLike {
  if (typeof document === "undefined" || !("startViewTransition" in document)) return noTransition(update);
  const html = document.documentElement;
  try {
    // Object form (Chrome 125, Firefox 147, Safari 18.2) carries types into :active-view-transition-type()
    return document.startViewTransition({ update, types });
  } catch {
    // Firefox 144-146 / Chrome 111-124 accept only the callback: emulate types with a data attribute
    html.dataset.vt = types.join(" ");
    const vt = document.startViewTransition(update);
    vt.finished.finally(() => delete html.dataset.vt);
    return vt;
  }
}

// usage
// const vt = transition(() => renderGrid(filtered), ["filter"]);
// await vt.finished; // safe place to re-init ScrollTrigger / focus
```
```css
/* reduced motion: keep a short opacity crossfade, drop all movement */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation-duration: 0s; }
  ::view-transition-old(*), ::view-transition-new(*) { animation-duration: var(--dur-exit); }
}
```
**Tune:** default duration via `::view-transition-group(*) { animation-duration }` (250-450 ms for UI); `vt.skipTransition()` when the user navigates again mid-flight; `await vt.ready` before running WAAPI on pseudos; `await vt.finished` before measuring layout.  
**A11y/perf:** the page is non-interactive while `::view-transition` exists; add `::view-transition { pointer-events: none; }` to keep clicks alive (named participants still skip hit-testing). Snapshots are GPU textures: 30+ named elements on a long page costs memory on mobile. The update callback must be fast; do data fetching BEFORE calling `transition()`.

### 2. The pseudo-element tree: naming, classes, custom keyframes
**Looks like:** any element gets its own layer that can slide, scale, clip or morph independently of the page crossfade.  
**Use when / avoid when:** always name only what should visibly persist (logo, hero image, active card). Naming every card "because it animates" makes the page look like it melts; name a handful.  
**Stack:** CSS
```text
::view-transition
`-- ::view-transition-group(root | name | .class)    (animates width/height/transform from old box to new box)
    `-- ::view-transition-image-pair(name)            (isolation: isolate; blend container)
        |-- ::view-transition-old(name)               (static screenshot, fades out)
        `-- ::view-transition-new(name)               (live render, fades in)
```
```css
/* naming: must be unique among rendered elements at snapshot time */
.site-logo { view-transition-name: site-logo; }
.card { view-transition-name: match-element; view-transition-class: card; } /* auto-unique, same-document only */

/* style a whole family via class selector (Chrome 125 / FF 144 / Safari 18.2) */
::view-transition-group(.card) {
  animation-duration: var(--dur-move);
  animation-timing-function: var(--ease-out-expo);
}

/* custom keyframes on the root (page-level) snapshot */
@keyframes vt-fade-out { to { opacity: 0; } }
@keyframes vt-fade-in { from { opacity: 0; } }
@keyframes vt-rise { from { transform: translateY(24px); } }

::view-transition-old(root) { animation: var(--dur-exit) ease-in both vt-fade-out; }
::view-transition-new(root) {
  animation: var(--dur-enter) ease-out var(--dur-exit) both vt-fade-in,
             var(--dur-move) var(--ease-out-expo) var(--dur-exit) both vt-rise;
}

/* aspect-ratio change (thumb 1:1 -> hero 16:9): stop the default stretch-crossfade */
::view-transition-old(hero-img), ::view-transition-new(hero-img) {
  height: 100%;
  object-fit: cover;
  overflow: clip;
  animation: none;       /* no crossfade: the image just moves and re-crops */
  mix-blend-mode: normal;
}

/* keep a fixed header perfectly still above sliding content */
.site-header { view-transition-name: site-header; }
::view-transition-group(site-header) { animation: none; z-index: 100; }
::view-transition-old(site-header) { display: none; }
::view-transition-new(site-header) { animation: none; }

/* per-type rules */
html:active-view-transition-type(filter) ::view-transition-group(.card) { animation-duration: 300ms; }
html[data-vt~="filter"] ::view-transition-group(.card) { animation-duration: 300ms; } /* fallback from recipe 1 */
```
**Tune:** morph duration 350-500 ms with `--ease-out-expo`; crossfade 150/250 ms asymmetric (exit faster than enter); `z-index` on groups when a morphing element must fly above others.  
**A11y/perf:** blur keyframes on `::view-transition-image-pair` (Next.js guide uses `filter: blur(3px)` at 30%) are fine for one small element; never blur the root snapshot on mobile. Duplicate `view-transition-name` values abort the transition (console: "Unexpected duplicate view-transition-name"): the classic bug when a list and its detail both render.

### 3. Cross-document (MPA) transitions
**Looks like:** a static multi-page site crossfades between pages and the logo/hero morphs, with zero JavaScript.  
**Use when / avoid when:** Astro static, Eleventy, Hugo, WordPress, Rails, plain HTML. Same-origin only. Firefox (as of 147) does not support it: users get a normal navigation, which is fine. Avoid adding a 1 s curtain here: a real navigation already costs a network round trip.  
**Stack:** CSS + optional vanilla JS
```css
/* in BOTH the old and new page's CSS */
@view-transition {
  navigation: auto;          /* same-origin push/replace/traverse navigations */
}
@media (prefers-reduced-motion: reduce) {
  @view-transition { navigation: none; }
}
.post-hero { view-transition-name: post-hero; }  /* same name on list thumb (per item) and detail hero */
```
```html
<!-- new page: hold first render until the hero exists, so the morph has a target -->
<link rel="expect" href="#post-hero" blocking="render">
```
```js
// direction-aware types for MPAs (Chrome 126+, Safari 18.2+)
const order = ["/", "/work", "/about", "/contact"];
const idx = (url) => order.indexOf(new URL(url).pathname);

window.addEventListener("pageswap", (e) => {
  if (!e.viewTransition || !e.activation?.entry) return;
  // last-minute naming on the OLD page: only the clicked card gets the shared name
  const target = new URL(e.activation.entry.url).pathname;
  const card = document.querySelector(`a[href="${target}"] .thumb`);
  if (card) card.style.viewTransitionName = "post-hero";
});

window.addEventListener("pagereveal", (e) => {
  if (!e.viewTransition || !navigation.activation?.from) return;
  const from = idx(navigation.activation.from.url);
  const to = idx(navigation.currentEntry.url);
  e.viewTransition.types.add(to >= from ? "forward" : "back");
});
```
```css
html:active-view-transition-type(forward) {
  &::view-transition-old(root) { animation: var(--dur-move) var(--ease-in-out-quart) both slide-to-left; }
  &::view-transition-new(root) { animation: var(--dur-move) var(--ease-in-out-quart) both slide-from-right; }
}
html:active-view-transition-type(back) {
  &::view-transition-old(root) { animation: var(--dur-move) var(--ease-in-out-quart) both slide-to-right; }
  &::view-transition-new(root) { animation: var(--dur-move) var(--ease-in-out-quart) both slide-from-left; }
}
@keyframes slide-to-left { to { transform: translateX(-30%); opacity: 0; } }
@keyframes slide-from-right { from { transform: translateX(30%); opacity: 0; } }
@keyframes slide-to-right { to { transform: translateX(30%); opacity: 0; } }
@keyframes slide-from-left { from { transform: translateX(-30%); opacity: 0; } }
```
**Tune:** keep MPA transitions <= 400 ms; pages that take > 4 s to render skip the transition (Chrome timeout). `rel="expect"` only on the one critical element; blocking render too long hurts LCP.  
**A11y/perf:** register `pagereveal` in a classic `<script>` in `<head>` (not `defer`/module), otherwise it fires before your listener exists. `navigation.activation` is Chromium/Safari-only; guard it. BFCache restores also fire `pagereveal`.

### 4. React 19.3 `<ViewTransition>` + Next 16 routes
**Looks like:** route content slides left on "forward" links and right on "back", the header stays put, skeletons slide down while content rises in. Declarative, no animation library.  
**Use when / avoid when:** SaaS, dashboards, e-commerce, docs: the new default for Next 16. Status verified: `ViewTransition` and `addTransitionType` are exported from stable `react@19.3.0` (released 2026-09-09); Next 16.3 needs NO config flag (the old `experimental.viewTransition` flag no longer exists in 16.3.6); `<Link transitionTypes>` and `router.push(href, { transitionTypes })` feed `addTransitionType`. Avoid for heavy choreography (multi-stage curtains, counters): use recipe 7.  
**Stack:** React + CSS
```tsx
// components/page-slide.tsx (Server Component compatible: ViewTransition renders no DOM)
import { ViewTransition } from "react";

const DIR = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" } as const;

export function PageSlide({ children }: { children: React.ReactNode }) {
  // put this in each page.tsx, NOT in layout.tsx (layouts persist, enter/exit never fire there)
  return (
    <ViewTransition enter={DIR} exit={DIR} default="none">
      {children}
    </ViewTransition>
  );
}
```
```tsx
// app/work/page.tsx
import Link from "next/link";
import { PageSlide } from "@/components/page-slide";

export default function WorkPage() {
  return (
    <PageSlide>
      <main>
        <h1>Work</h1>
        <Link href="/work/atlas" transitionTypes={["nav-forward"]}>Atlas case study</Link>
        <Link href="/" transitionTypes={["nav-back"]}>Back home</Link>
      </main>
    </PageSlide>
  );
}
```
```tsx
// programmatic
"use client";
import { useRouter } from "next/navigation";
export function NextProjectButton({ href }: { href: string }) {
  const router = useRouter();
  return <button onClick={() => router.push(href, { transitionTypes: ["nav-forward"] })}>Next project</button>;
}
```
```css
::view-transition-old(.nav-forward) { --slide: -60px; animation: var(--dur-exit) ease-in both vt-fade-out, var(--dur-move) var(--ease-in-out-quart) both vt-slide reverse; }
::view-transition-new(.nav-forward) { --slide: 60px;  animation: var(--dur-enter) ease-out var(--dur-exit) both vt-fade-in, var(--dur-move) var(--ease-in-out-quart) both vt-slide; }
::view-transition-old(.nav-back)    { --slide: 60px;  animation: var(--dur-exit) ease-in both vt-fade-out, var(--dur-move) var(--ease-in-out-quart) both vt-slide reverse; }
::view-transition-new(.nav-back)    { --slide: -60px; animation: var(--dur-enter) ease-out var(--dur-exit) both vt-fade-in, var(--dur-move) var(--ease-in-out-quart) both vt-slide; }
@keyframes vt-slide { from { translate: var(--slide); } to { translate: 0; } }

/* Suspense handoff: skeleton leaves down, content rises */
::view-transition-old(.slide-down) { animation: var(--dur-exit) ease-out both vt-fade-out; }
::view-transition-new(.slide-up) { animation: var(--dur-enter) ease-in var(--dur-exit) both vt-fade-in, var(--dur-move) var(--ease-out-expo) both vt-rise; }

::view-transition { pointer-events: none; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation-duration: 0s !important; }
  ::view-transition-old(*), ::view-transition-new(*) { animation: var(--dur-exit) ease both vt-fade-in !important; }
  ::view-transition-old(*) { animation-name: vt-fade-out !important; }
}
```
```tsx
// Suspense reveal (app/photo/[id]/page.tsx)
import { Suspense, ViewTransition } from "react";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<ViewTransition exit="slide-down" default="none"><Skeleton /></ViewTransition>}>
      <ViewTransition enter="slide-up" default="none"><PhotoContent id={id} /></ViewTransition>
    </Suspense>
  );
}
```
**Tune:** 60 px slide offset (bigger reads as "whole app moves"); exit 150 ms, enter 210-250 ms delayed by the exit, move 400 ms. `default="none"` on every named/typed boundary, otherwise it crossfades on every unrelated transition.  
**A11y/perf:** only updates inside `startTransition`, `<Suspense>` reveals and `useDeferredValue` animate; plain `setState` does not. React sets `html { view-transition-name: none }` inline during its transitions, so `::view-transition-old(root)` rules do NOT apply to React-driven transitions: only content wrapped in `<ViewTransition>` animates, the rest swaps instantly. Browser back/forward carries no type: the directional slide is skipped (correct). Callback props `onEnter/onExit/onUpdate/onShare(instance, types)` must return a cleanup (e.g. `() => anim.cancel()`).

### 5. Shared-element list->detail (3 ways)
**Looks like:** the clicked thumbnail flies and scales into the detail hero; everything else fades. Made famous by iOS App Store cards and the Chrome "HTTP 203 playlist" demo.  
**Use when / avoid when:** galleries, case-study grids, product cards. Avoid on lists of 100+ where the user never perceives continuity (tables, feeds).  
**Stack:** React VT | Motion | Motion AnimateView

(a) Across routes, React `<ViewTransition name>` (Next 16):
```tsx
// components/project-grid.tsx
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

type Project = { slug: string; title: string; cover: string };

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-3">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link href={`/work/${p.slug}`} transitionTypes={["nav-forward"]}>
            <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
              <Image src={p.cover} alt="" width={800} height={600} className="aspect-[4/3] object-cover" />
            </ViewTransition>
            <span>{p.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
// app/work/[slug]/page.tsx renders the SAME name:
// <ViewTransition name={`cover-${slug}`} share="morph" default="none"><Image ... fill preload /></ViewTransition>
```
```css
::view-transition-group(.morph) { animation-duration: 500ms; animation-timing-function: var(--ease-out-expo); z-index: 10; }
::view-transition-image-pair(.morph) { animation: 500ms both vt-soft; }
@keyframes vt-soft { 30% { filter: blur(3px); } }
```
The morph only pairs if the destination renders in the same commit (prefetched/cached route). If the detail suspends first, you get an enter animation instead: keep the hero image out of the suspending subtree, or prefetch.

(b) Same page, Motion `layoutId` (card -> modal):
```tsx
"use client";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";

type Item = { id: string; title: string; src: string };
const spring = { type: "spring", duration: 0.55, bounce: 0.12 } as const;

export function ExpandGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <MotionConfig transition={spring} reducedMotion="user">
      <ul className="grid grid-cols-3 gap-4">
        {items.map((it) => (
          <motion.li key={it.id} layoutId={`card-${it.id}`} style={{ borderRadius: 16 }} className="overflow-hidden bg-neutral-900">
            <button onClick={() => setActive(it)} className="block w-full text-left">
              <motion.img layoutId={`img-${it.id}`} src={it.src} alt="" className="aspect-square w-full object-cover" />
              <motion.h3 layoutId={`title-${it.id}`} className="p-3">{it.title}</motion.h3>
            </button>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>
        {active && (
          <>
            <motion.div key="scrim" className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)} />
            <motion.div key="modal" layoutId={`card-${active.id}`} style={{ borderRadius: 24 }} role="dialog" aria-modal="true"
              aria-labelledby={`title-${active.id}`} className="fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-2xl overflow-hidden bg-neutral-900">
              <motion.img layoutId={`img-${active.id}`} src={active.src} alt="" className="aspect-video w-full object-cover" />
              <motion.h3 layoutId={`title-${active.id}`} id={`title-${active.id}`} className="p-6 text-2xl">{active.title}</motion.h3>
              <button autoFocus onClick={() => setActive(null)} className="absolute right-4 top-4">Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
```
Set `borderRadius`/`boxShadow` via `style` so Motion's scale correction keeps corners round during the morph. `reducedMotion="user"` disables transform/layout animation but keeps opacity.

(c) Motion 13 `AnimateView` (View-Transition-based, keyframe props, requires React 19.3; import from `motion/react-animate-view`, NOT `motion/react`; free since leaving Motion+ early access):
```tsx
"use client";
import { spring } from "motion";
import { AnimateView } from "motion/react-animate-view";
import { startTransition, useState } from "react";

export function Gallery({ ids }: { ids: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (open)
    return (
      <AnimateView name={open} share={{ transition: { type: spring, visualDuration: 0.45, bounce: 0.15 } }}>
        <img src={`/img/${open}.jpg`} alt="" className="fixed inset-0 h-full w-full object-cover"
          onClick={() => startTransition(() => setOpen(null))} />
      </AnimateView>
    );
  return (
    <div className="grid grid-cols-4 gap-2">
      {ids.map((id) => (
        <AnimateView key={id} name={id}>
          <img src={`/img/${id}.jpg`} alt="" className="aspect-square object-cover"
            onClick={() => startTransition(() => setOpen(id))} />
        </AnimateView>
      ))}
    </div>
  );
}
```
**Tune:** morph 400-550 ms; spring bounce 0-0.15 for images (bounce on photos looks cheap); scrim opacity 0.5-0.7.  
**A11y/perf:** (b) is real DOM layout animation: smooth for < 20 elements, keep `layoutId` elements free of `filter`. (a)/(c) are snapshot-based: text inside a morphing snapshot scales like a bitmap, so morph the image, crossfade the text. Move focus into the modal and back to the trigger on close.

### 6. Motion `AnimatePresence` in the App Router (and why it is fragile)
**Looks like:** old page fades/slides out, then the new one animates in (`mode="wait"`).  
**Use when / avoid when:** enter-only animations via `template.tsx` are safe and cheap. Exit animations need the "FrozenRouter" hack: acceptable for a small portfolio you control, avoid in anything with streaming, `loading.tsx`, parallel/intercepting routes or a team. Prefer recipe 4 or 7.  
**Stack:** Motion
```tsx
// app/template.tsx - ENTER ONLY, safe. Remounts on every navigation.
"use client";
import { motion } from "motion/react";
import { useEffect } from "react";

let hasNavigated = false; // false on the server and on first hydration -> no opacity:0 in SSR HTML (protects LCP)

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => { hasNavigated = true; }, []);
  return (
    <motion.div
      initial={hasNavigated ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```
```tsx
// components/page-presence.tsx - EXIT + ENTER via frozen router context (private Next API)
"use client";
import { AnimatePresence, motion } from "motion/react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import { useContext, useRef } from "react";

function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current; // keep rendering the OLD route tree while it exits
  return <LayoutRouterContext.Provider value={frozen}>{children}</LayoutRouterContext.Provider>;
}

export function PagePresence({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ opacity: 0, y: -12, transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] } }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
// app/layout.tsx: <body><PagePresence>{children}</PagePresence></body>
```
**Tune:** exit 150-250 ms, enter 350-500 ms; `mode="wait"` doubles perceived latency, so keep exit short.  
**A11y/perf:** `LayoutRouterContext` still exists at that path in Next 16.3.6 but is not public API: pin Next and retest on upgrade. Next scrolls to top on commit BEFORE your exit finishes, so the exiting page jumps: pass `scroll={false}` on links and scroll in `onExitComplete`. Use `<MotionConfig reducedMotion="user">` so y-movement drops for reduced-motion users.

### 7. GSAP overlay route transitions (the Awwwards default)
**Looks like:** click -> a panel (or columns, circle, logo) covers the screen -> route swaps underneath -> the cover leaves and the new hero animates in. Seen on most GSAP-built portfolio SOTDs.  
**Use when / avoid when:** portfolios, agency and launch sites where the transition IS the brand. Avoid for apps: every navigation costs ~1.2 s of theatre. Keep total cover+reveal <= 1.4 s.  
**Stack:** GSAP + Next App Router. One provider owns an overlay and a `navigate()` that plays `variant.cover`, calls `router.push`, waits for `usePathname` to change, then plays `variant.reveal`. Variants (recipes 9, 10, 12, 14) are plug-ins.
```ts
// components/transition/types.ts
import type gsap from "gsap";
export type NavMeta = { x: number; y: number; label?: string };
export type TransitionVariant = {
  Overlay: () => React.JSX.Element;
  cover: (root: HTMLElement, meta: NavMeta) => gsap.core.Timeline;
  reveal: (root: HTMLElement, meta: NavMeta) => gsap.core.Timeline;
};
```
```tsx
// components/transition/PageTransitionProvider.tsx
"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useRef } from "react";
import { TT } from "@/lib/transition-tokens";
import type { NavMeta, TransitionVariant } from "./types";

gsap.registerPlugin(useGSAP);

type Navigate = (href: string, meta?: Partial<NavMeta>) => void;
const NavContext = createContext<Navigate | null>(null);

export function usePageNav(): Navigate {
  const nav = useContext(NavContext);
  if (!nav) throw new Error("usePageNav must be used inside <PageTransitionProvider>");
  return nav;
}

export function PageTransitionProvider({ variant, children }: { variant: TransitionVariant; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const s = useRef({ busy: false, waiting: false, timer: 0, meta: { x: 0, y: 0 } as NavMeta });
  const { contextSafe } = useGSAP({ scope: root });
  const Overlay = variant.Overlay;

  const reveal = contextSafe(() => {
    const st = s.current;
    const el = root.current;
    if (!el || !st.waiting) return;
    st.waiting = false;
    window.clearTimeout(st.timer);
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
    lenis?.start();
    variant.reveal(el, st.meta).eventCallback("onComplete", () => {
      gsap.set(el, { autoAlpha: 0, pointerEvents: "none" });
      st.busy = false;
    });
  });

  const navigate = contextSafe((href: string, meta: Partial<NavMeta> = {}) => {
    const st = s.current;
    const el = root.current;
    const url = new URL(href, window.location.href);
    if (st.busy || !el) return;
    if (url.origin !== window.location.origin) { window.location.assign(url); return; }
    const samePage = url.pathname === window.location.pathname;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (samePage || reduce) { router.push(href); return; } // no theatre for hash/query changes or reduced motion
    st.busy = true;
    st.meta = { x: meta.x ?? window.innerWidth / 2, y: meta.y ?? window.innerHeight / 2, label: meta.label };
    router.prefetch(href);
    lenis?.stop();
    gsap.set(el, { autoAlpha: 1, pointerEvents: "auto" }); // blocks double clicks during the cover
    variant.cover(el, st.meta).eventCallback("onComplete", () => {
      st.waiting = true;
      router.push(href, { scroll: false });
      st.timer = window.setTimeout(reveal, TT.navTimeoutMs); // failsafe: redirect, error, or slow server
    });
  });

  // any pathname change while waiting == the new route committed
  useGSAP(() => { if (s.current.waiting) reveal(); }, { dependencies: [pathname], scope: root });

  return (
    <NavContext.Provider value={navigate}>
      {children}
      <div ref={root} className="pt-root" aria-hidden="true"><Overlay /></div>
    </NavContext.Provider>
  );
}
```
```tsx
// components/transition/TransitionLink.tsx
"use client";
import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { usePageNav } from "./PageTransitionProvider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string; label?: string };

export function TransitionLink({ href, label, onClick, ...rest }: Props) {
  const navigate = usePageNav();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    if (e.defaultPrevented || modified || rest.target === "_blank") return; // keep new-tab behaviour
    e.preventDefault();
    const keyboard = e.detail === 0; // Enter key: no pointer coords
    navigate(href, keyboard ? { label } : { x: e.clientX, y: e.clientY, label });
  };
  return <Link href={href} onClick={handleClick} {...rest} />;
}
```
```tsx
// components/transition/SiteTransitions.tsx - client boundary (variants hold functions, cannot cross from a Server Component)
"use client";
import { PageTransitionProvider } from "./PageTransitionProvider";
import { stairs } from "./variants";
export function SiteTransitions({ children }: { children: React.ReactNode }) {
  return <PageTransitionProvider variant={stairs}>{children}</PageTransitionProvider>;
}
// app/layout.tsx: <body><ReactLenis root /><SiteTransitions>{children}</SiteTransitions></body>
```
```css
.pt-root { position: fixed; inset: 0; z-index: 1000; visibility: hidden; opacity: 0; pointer-events: none; }
```
**Tune:** cover 0.55-0.75 s `power4.inOut`; reveal 0.65-0.85 s `expo.inOut`; start the hero's entrance at ~40% of the reveal (hand-off feels continuous, not sequential).  
**A11y/perf:** reduced motion and same-page links skip the overlay entirely. Browser back/forward bypasses `navigate()` (instant swap): correct, never animate history traversal with a 1 s curtain. Animate transforms/scale on the panels; full-screen `clip-path` is fine for one-shot 0.6 s tweens, never scrubbed. If the destination has `loading.tsx`, the reveal shows the skeleton: acceptable, or remove `loading.tsx` so the old page holds until data is ready (the overlay covers it anyway).

### 8. Fade-through
**Looks like:** Material "fade through": old page fades out quickly, new page fades in while scaling 92% -> 100%. Quiet, premium, no direction implied.  
**Use when / avoid when:** top-level sections with no spatial relation (Home -> About), product apps. Drop the scale on text-heavy docs (pure crossfade).  
**Stack:** CSS (native VT) | React VT
```css
@keyframes vt-fade-through-in { from { opacity: 0; transform: scale(0.92); } }
/* vanilla / MPA */
::view-transition-old(root) { animation: 90ms cubic-bezier(0.4, 0, 1, 1) both vt-fade-out; }
::view-transition-new(root) { animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both vt-fade-through-in; }
/* React: <ViewTransition enter="ft-in" exit="ft-out" default="none"> in each page.tsx */
::view-transition-old(.ft-out) { animation: 90ms cubic-bezier(0.4, 0, 1, 1) both vt-fade-out; }
::view-transition-new(.ft-in) { animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both vt-fade-through-in; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-new(root), ::view-transition-new(.ft-in) { animation-name: vt-fade-in; }
}
```
**Tune:** total 300 ms (30/70 split); scale 0.92-0.96; up to 450 ms for editorial sites.  
**A11y/perf:** opacity + transform on snapshots only: the cheapest transition there is.

### 9. Curtain wipe: single panel and staggered stairs
**Looks like:** a solid panel sweeps up over the page and exits through the top; the "stairs" version splits it into 5-8 columns that rise with a stagger, like blinds.  
**Use when / avoid when:** portfolios and studios. Stairs are everywhere on template marketplaces: make them yours with brand colour, uneven column widths, or a 2-colour double layer (second layer 60-100 ms behind).  
**Stack:** GSAP (variants for recipe 7)
```tsx
// components/transition/variants.tsx
"use client";
import gsap from "gsap";
import { TT } from "@/lib/transition-tokens";
import type { TransitionVariant } from "./types";

export const q = (root: HTMLElement, sel: string) => root.querySelectorAll<HTMLElement>(sel);

export const curtain: TransitionVariant = {
  Overlay: () => (
    <>
      <div className="pt-panel pt-panel--accent" />
      <div className="pt-panel" />
    </>
  ),
  cover: (root) =>
    gsap.timeline().fromTo(q(root, ".pt-panel"), { yPercent: 100 },
      { yPercent: 0, duration: TT.cover, ease: TT.easeCover, stagger: 0.08 }),
  reveal: (root) =>
    gsap.timeline().to([...q(root, ".pt-panel")].reverse(),
      { yPercent: -100, duration: TT.reveal, ease: TT.easeReveal, stagger: 0.08 }),
};

const COLS = 6;
export const stairs: TransitionVariant = {
  Overlay: () => (
    <div className="pt-stairs">
      {Array.from({ length: COLS }, (_, i) => <span key={i} />)}
    </div>
  ),
  cover: (root) =>
    gsap.timeline().fromTo(q(root, ".pt-stairs span"), { scaleY: 0, transformOrigin: "50% 100%" },
      { scaleY: 1, duration: TT.cover, ease: TT.easeCover, stagger: { each: TT.stagger, from: "start" } }),
  reveal: (root) =>
    gsap.timeline()
      .set(q(root, ".pt-stairs span"), { transformOrigin: "50% 0%" })
      .to(q(root, ".pt-stairs span"),
        { scaleY: 0, duration: TT.reveal, ease: TT.easeReveal, stagger: { each: TT.stagger, from: "start" } }),
};
```
```css
.pt-panel { position: absolute; inset: 0; background: var(--curtain-bg); transform: translateY(100%); }
.pt-panel--accent { background: var(--accent, #d8ff3d); }
.pt-stairs { position: absolute; inset: 0; display: flex; }
.pt-stairs span { flex: 1; height: 100%; background: var(--curtain-bg); transform: scaleY(0); margin-right: -1px; } /* -1px kills subpixel seams */
```
No-JS MPA equivalent (recipe 3): `::view-transition-new(root) { animation: var(--dur-cover) var(--ease-in-out-quart) both wipe-in; } @keyframes wipe-in { from { clip-path: inset(100% 0 0 0); } }`.  
**Tune:** columns 5-8 (more reads as "blinds"); stagger 0.04-0.07 s; `from: "center"` or `"edges"` for symmetric variants.  
**A11y/perf:** `scaleY` on a few full-height columns is compositor-only. Reduced motion never reaches this (provider skips it).

### 10. Circle reveal from the click point (theme toggle + routes)
**Looks like:** the new theme (or page) grows as a circle from exactly where you clicked until it fills the viewport. Popularised by Telegram's theme switch and countless dev portfolios.  
**Use when / avoid when:** theme toggles (best use), playful portfolios. As a transition on every link it is an AI-portfolio tell: keep it for one special action.  
**Stack:** View Transitions + WAAPI (theme) | GSAP clip-path (routes)
```tsx
// components/ThemeToggle.tsx
"use client";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => { setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"); }, []);

  const apply = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* private mode */ }
    setTheme(next);
  };

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) { apply(next); return; }
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.detail === 0 ? left + width / 2 : e.clientX;
    const y = e.detail === 0 ? top + height / 2 : e.clientY;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const html = document.documentElement;
    html.dataset.vt = "theme";
    const vt = document.startViewTransition(() => { flushSync(() => apply(next)); }); // DOM must update synchronously
    vt.finished.finally(() => delete html.dataset.vt);
    await vt.ready;
    html.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: "cubic-bezier(0.76, 0, 0.24, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  };

  return (
    <button type="button" onClick={onClick} aria-pressed={theme === "dark"} aria-label="Dark theme">
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
```
```css
/* only for this transition: kill the default crossfade so the circle is a hard edge */
html[data-vt="theme"]::view-transition-old(root),
html[data-vt="theme"]::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
```
Route version (variant for recipe 7, add to `variants.tsx`):
```tsx
export const circle: TransitionVariant = {
  Overlay: () => <div className="pt-circle" />,
  cover: (root, { x, y }) => {
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    return gsap.timeline().fromTo(q(root, ".pt-circle"),
      { clipPath: `circle(0px at ${x}px ${y}px)`, yPercent: 0 },
      { clipPath: `circle(${r}px at ${x}px ${y}px)`, duration: 0.7, ease: "power3.inOut" });
  },
  reveal: (root) => gsap.timeline().to(q(root, ".pt-circle"), { yPercent: -100, duration: TT.reveal, ease: TT.easeReveal }),
};
```
```css
.pt-circle { position: absolute; inset: 0; background: var(--curtain-bg); clip-path: circle(0px at 50% 50%); }
```
**Tune:** 500-750 ms; `cubic-bezier(0.76,0,0.24,1)` for a confident sweep; reverse it (shrink `::view-transition-old(root)` with the old snapshot on top via `z-index: 1`) when switching back to light for a "lights on" feel.  
**A11y/perf:** avoid a flash of the wrong theme on load with a blocking inline `<script>` in `<head>` that reads localStorage and sets `data-theme` (plus `suppressHydrationWarning` on `<html>`). With React `<ViewTransition>` components on the page, this manual `document.startViewTransition` still works because the update is a `flushSync`, not a Transition.

### 11. Slide stack / push
**Looks like:** iOS navigation push: the new page slides in from the right over the old one, which drifts 30% left and dims; "back" reverses it.  
**Use when / avoid when:** hierarchical drill-down (list -> item -> sub-item), mobile-first apps, docs. Avoid for flat sibling pages (use fade-through).  
**Stack:** CSS (VT types) | React VT
```css
::view-transition { background: #000; } /* dimming = old snapshot opacity over black: no filter needed */

@keyframes push-in { from { transform: translateX(100%); } }
@keyframes push-out { to { transform: translateX(-30%); opacity: 0.55; } }
@keyframes pop-in { from { transform: translateX(-30%); opacity: 0.55; } }
@keyframes pop-out { to { transform: translateX(100%); } }

html:active-view-transition-type(forward) {
  &::view-transition-old(root) { animation: var(--dur-move) var(--ease-in-out-quart) both push-out; }
  &::view-transition-new(root) { animation: var(--dur-move) var(--ease-in-out-quart) both push-in; box-shadow: -24px 0 48px rgb(0 0 0 / 0.25); }
}
html:active-view-transition-type(back) {
  &::view-transition-old(root) { animation: var(--dur-move) var(--ease-in-out-quart) both pop-out; z-index: 1; }
  &::view-transition-new(root) { animation: var(--dur-move) var(--ease-in-out-quart) both pop-in; }
}

/* React: enter={{ "nav-forward": "push-in", "nav-back": "pop-in", default: "none" }}
          exit={{ "nav-forward": "push-out", "nav-back": "pop-out", default: "none" }} default="none" */
::view-transition-new(.push-in) { animation: var(--dur-move) var(--ease-in-out-quart) both push-in; }
::view-transition-old(.push-out) { animation: var(--dur-move) var(--ease-in-out-quart) both push-out; }
::view-transition-new(.pop-in) { animation: var(--dur-move) var(--ease-in-out-quart) both pop-in; }
::view-transition-old(.pop-out) { animation: var(--dur-move) var(--ease-in-out-quart) both pop-out; }
::view-transition-group(.push-in), ::view-transition-group(.pop-out) { z-index: 2; }

@media (prefers-reduced-motion: reduce) {
  html:active-view-transition-type(forward, back) {
    &::view-transition-old(root) { animation: var(--dur-exit) ease both vt-fade-out; }
    &::view-transition-new(root) { animation: var(--dur-enter) ease both vt-fade-in; }
  }
}
```
**Tune:** 350-450 ms `--ease-in-out-quart`; parallax ratio 25-35%; shadow opacity 0.15-0.3.  
**A11y/perf:** transforms only; full-page snapshots moving horizontally are cheap. Keep the fixed header named and frozen (recipe 2) so it does not slide with the page.

### 12. Text-mask / logo transition
**Looks like:** the screen fills with the brand colour and a huge wordmark; on reveal the letters turn into windows onto the new page and the camera "flies through" a letter until the page is fully visible.  
**Use when / avoid when:** brand-led sites with a bold, heavy wordmark (weight 800+). Thin serif logos make tiny windows and the effect reads as a glitch. Once per navigation at most; not on mobile menus.  
**Stack:** GSAP + SVG mask (variant for recipe 7)
```tsx
// add to components/transition/variants.tsx
const WORD = "ATLAS";
const HOLE_ORIGIN = "742 450"; // user-space point that sits ON a thick stroke (here the stem of the L). Tune per logo.

export const logoMask: TransitionVariant = {
  Overlay: () => (
    <svg className="pt-mask" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <mask id="pt-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
          <rect width="1600" height="900" fill="#fff" />
          <text className="pt-hole-word" x="800" y="450" textAnchor="middle" dominantBaseline="central"
            fontSize="260" fontWeight="900" fill="#000" opacity="0">{WORD}</text>
        </mask>
      </defs>
      <rect width="1600" height="900" mask="url(#pt-hole)" style={{ fill: "var(--curtain-bg)" }} />
      <text className="pt-word" x="800" y="450" textAnchor="middle" dominantBaseline="central"
        fontSize="260" fontWeight="900" style={{ fill: "var(--curtain-fg)" }}>{WORD}</text>
    </svg>
  ),
  cover: (root) =>
    gsap.timeline()
      .set(q(root, ".pt-hole-word"), { opacity: 0, scale: 1, svgOrigin: HOLE_ORIGIN })
      .fromTo(q(root, ".pt-mask"), { yPercent: 100 }, { yPercent: 0, duration: TT.cover, ease: TT.easeCover })
      .fromTo(q(root, ".pt-word"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, "-=0.2"),
  reveal: (root) =>
    gsap.timeline()
      .set(q(root, ".pt-word"), { opacity: 0 })
      .set(q(root, ".pt-hole-word"), { opacity: 1 }) // the letters become windows onto the new page
      .to(q(root, ".pt-hole-word"), { scale: 60, svgOrigin: HOLE_ORIGIN, duration: 1.1, ease: "expo.in" }, 0.15),
};
```
```css
.pt-mask { position: absolute; inset: 0; width: 100%; height: 100%; }
.pt-mask text { font-family: var(--font-display, inherit); }
```
**Tune:** hold the letter-windows for 0.1-0.25 s before the zoom (the "aha" beat); zoom 0.9-1.2 s `expo.in`; scale 40-80 depending on stroke thickness. Swap `text` for your logo `<path>` for a mark-based version (same mask, same origin rule).  
**A11y/perf:** SVG masks re-rasterise every frame: fine for one 1 s tween on desktop, test on a mid Android (drop to a plain curtain under `(max-width: 768px)` if it stutters). Reduced motion never reaches this (provider skips).

### 13. Morphing header / title
**Looks like:** the big transparent hero header on Home smoothly shrinks into a compact solid bar on inner pages; the logo glides from centre-large to left-small. Or a list item's title flies up to become the detail page `h1`.  
**Use when / avoid when:** sites whose header genuinely differs per route. Avoid morphing long multi-line titles: snapshots scale like bitmaps, text looks soft mid-flight.  
**Stack:** React VT (header lives in the layout, so it fires `update`, not enter/exit)
```tsx
// components/SiteHeader.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

export function SiteHeader() {
  const isHome = usePathname() === "/";
  return (
    <ViewTransition name="site-header" update="header-morph" default="none">
      <header className={isHome ? "header header--hero" : "header header--compact"}>
        <ViewTransition name="site-logo" update="header-morph" default="none">
          <Link href="/" className="logo">Atlas</Link>
        </ViewTransition>
        <nav aria-label="Primary">
          <Link href="/work" transitionTypes={["nav-forward"]}>Work</Link>
          <Link href="/about" transitionTypes={["nav-forward"]}>About</Link>
        </nav>
      </header>
    </ViewTransition>
  );
}
```
```css
.header { position: fixed; inset: 0 0 auto; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding-inline: 24px; }
.header--hero { height: 160px; background: transparent; }
.header--hero .logo { font-size: clamp(3rem, 8vw, 6rem); }
.header--compact { height: 64px; background: var(--surface, #0c0c0c); }
.header--compact .logo { font-size: 1.25rem; }

::view-transition-group(.header-morph) { animation-duration: 500ms; animation-timing-function: var(--ease-out-expo); z-index: 100; }
/* scale by height, keep aspect: avoids the squashed-text look when width and height change differently */
::view-transition-old(.header-morph), ::view-transition-new(.header-morph) { height: 100%; width: auto; }
```
Title morph list -> detail: give the list `h2` and the detail `h1` the same `<ViewTransition name={`title-${slug}`} share="title-morph" default="none">`, and set `::view-transition-old(.title-morph) { animation: none; opacity: 0; }` so only the crisp NEW text scales from the old box (reads sharper than a crossfade of two bitmaps).  
**Tune:** 400-550 ms; for large font-size ratios (> 3x) fade the old out within the first 100 ms.  
**A11y/perf:** the header must not be `display: none` on either route (no snapshot = no morph, just an enter/exit fade).

### 14. Dark overlay with page-title flash
**Looks like:** the screen goes near-black and the destination's name ("Projects") rises through a mask in huge type, holds a beat, slides out upward, and the new page appears. Common on studio sites (Dennis Snellenberg-style portfolios).  
**Use when / avoid when:** 4-8 top-level pages with strong names. Pointless for detail pages with long titles (use the curtain).  
**Stack:** GSAP (variant for recipe 7; pass `label` through `TransitionLink`)
```tsx
// add to components/transition/variants.tsx
export const titleFlash: TransitionVariant = {
  Overlay: () => (
    <div className="pt-flash">
      <p className="pt-flash-title"><span className="pt-flash-inner" /></p>
    </div>
  ),
  cover: (root, { label }) => {
    const inner = root.querySelector<HTMLElement>(".pt-flash-inner");
    if (inner) inner.textContent = label ?? ""; // span has no React children, so imperative text is safe
    return gsap.timeline()
      .fromTo(q(root, ".pt-flash"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" })
      .fromTo(q(root, ".pt-flash-inner"), { yPercent: 110 }, { yPercent: 0, duration: 0.65, ease: "expo.out" }, 0.1);
  },
  reveal: (root) =>
    gsap.timeline()
      .to(q(root, ".pt-flash-inner"), { yPercent: -110, duration: 0.45, ease: "expo.in" }, 0.15)
      .to(q(root, ".pt-flash"), { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, "-=0.1"),
};
// usage: <TransitionLink href="/work" label="Work">Work</TransitionLink>
```
```css
.pt-flash { position: absolute; inset: 0; display: grid; place-items: center; background: var(--curtain-bg); }
.pt-flash-title { overflow: clip; padding-block: 0.06em; font-size: clamp(3rem, 11vw, 10rem); line-height: 0.95; letter-spacing: -0.04em; color: var(--curtain-fg); }
.pt-flash-inner { display: inline-block; }
```
**Tune:** hold 0.15-0.3 s between rise and exit; `clamp()` so one word fits on 375 px; add a small dot/bullet before the word (the studio signature).  
**A11y/perf:** overlay is `aria-hidden`; the real announcement comes from the new page title (recipe 25). Keep it opaque: a 90% black overlay shows the route swap flicker through it.

### 15. Swup 4
**Looks like:** SPA-smooth page changes on any server-rendered site: the `#swup` container fades/slides while header and footer stay.  
**Use when / avoid when:** WordPress, Craft, Kirby, Eleventy, Hugo, Rails, Laravel. Best maintained option in 2026 (swup 4.10.0, Sept 2026). Not for React/Next (fights the router).  
**Stack:** Vanilla JS
```html
<body>
  <header>...persistent...</header>
  <div class="swup-stack"><main id="swup" class="transition-fade">...page...</main></div>
  <script type="module" src="/js/app.js"></script>
</body>
```
```js
// /js/app.js
import Swup from "swup";
import SwupA11yPlugin from "@swup/a11y-plugin";       // focus + route announcements
import SwupHeadPlugin from "@swup/head-plugin";       // updates <head> (title, meta, per-page CSS)
import SwupPreloadPlugin from "@swup/preload-plugin"; // hover/viewport prefetch
import SwupScrollPlugin from "@swup/scroll-plugin";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const swup = new Swup({
  containers: ["#swup"],
  plugins: [new SwupA11yPlugin(), new SwupHeadPlugin(), new SwupPreloadPlugin(), new SwupScrollPlugin({ animateScroll: false })],
});

let ctx;
function initPage() {
  ctx = gsap.context(() => {
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      gsap.from(el, { yPercent: 30, opacity: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
  }, "#swup");
}
initPage();
swup.hooks.before("content:replace", () => ctx?.revert()); // kill old triggers BEFORE the DOM swap
swup.hooks.on("page:view", initPage);
```
```css
/* CSS-driven default: swup toggles these classes on <html> */
html.is-changing .transition-fade { transition: opacity 250ms var(--ease-out-expo); opacity: 1; }
html.is-animating .transition-fade { opacity: 0; }
@media (prefers-reduced-motion: reduce) { html.is-changing .transition-fade { transition-duration: 1ms; } }
```
Themes and plugins (one line each):
```js
import SwupFadeTheme from "@swup/fade-theme";        // new SwupFadeTheme({ mainElement: "#swup" }) - zero CSS
import SwupOverlayTheme from "@swup/overlay-theme";  // new SwupOverlayTheme({ direction: "to-top" }); tune --swup-overlay-theme-color / -duration
import SwupParallelPlugin from "@swup/parallel-plugin"; // old and new containers animate simultaneously
import SwupJsPlugin from "@swup/js-plugin";          // GSAP-driven in/out
```
```js
// GSAP in/out with the JS plugin (replace the CSS classes above)
new SwupJsPlugin({
  animations: [{
    from: "(.*)", to: "(.*)",
    out: (done) => gsap.to("#swup", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in", onComplete: done }),
    in: (done) => gsap.fromTo("#swup", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", onComplete: done }),
  }],
});
```
```css
/* parallel plugin: stack both containers in one grid cell */
.swup-stack { display: grid; }
.swup-stack > * { grid-area: 1 / 1; }
html.is-changing .transition-slide { transition: transform 0.5s var(--ease-in-out-quart), opacity 0.5s; }
.transition-slide.is-previous-container { transform: translateX(-30%); opacity: 0; } /* final state of old */
.transition-slide.is-next-container { transform: translateX(100%); opacity: 0; }    /* initial state of new */
```
**Tune:** CSS fade 200-300 ms; overlay theme duration 0.5-0.7 s; parallel slides 450-550 ms.  
**A11y/perf:** always add the a11y plugin (it moves focus and announces). Scripts inside `#swup` do not re-run: move init into `page:view`. Swup core ~9 kb gz.

### 16. Barba 2 + GSAP
**Looks like:** the classic 2019-2023 Awwwards stack: `leave` animates the old container out, `enter` animates the new one in, with GSAP timelines.  
**Use when / avoid when:** legacy/static GSAP sites already on Barba. For new builds prefer Swup 4 (more active) or native cross-document VT. `@barba/core` 2.10.3 was last published Aug 2024: stable but slow-moving.  
**Stack:** Vanilla JS + GSAP
```html
<body data-barba="wrapper">
  <div class="curtain" aria-hidden="true"></div>
  <main data-barba="container" data-barba-namespace="home">...</main>
</body>
```
```js
import barba from "@barba/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = "manual";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let ctx;
const initPage = (container) => {
  ctx = gsap.context(() => {
    gsap.from("[data-reveal]", { yPercent: 100, opacity: 0, stagger: 0.05, duration: 0.8, ease: "expo.out" });
  }, container);
};

barba.init({
  preventRunning: true, // ignore clicks while a transition runs
  transitions: [{
    name: "curtain",
    once({ next }) { initPage(next.container); },
    async leave() {
      if (reduce) return;
      await gsap.fromTo(".curtain", { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "power4.inOut" });
    },
    async enter({ next }) {
      ctx?.revert();
      window.scrollTo(0, 0);
      initPage(next.container);
      if (reduce) return;
      await gsap.to(".curtain", { yPercent: -100, duration: 0.7, ease: "expo.inOut" });
    },
  }],
});
barba.hooks.after(() => ScrollTrigger.refresh());
```
```css
.curtain { position: fixed; inset: 0; z-index: 100; background: var(--curtain-bg); transform: translateY(100%); pointer-events: none; }
```
**Tune:** `sync: true` on a transition runs leave and enter together (needs both containers stacked, like Swup parallel).  
**A11y/perf:** Barba has no built-in route announcer or focus management: add an `aria-live="polite"` region and focus the new `h1` in `barba.hooks.after`. Update `<title>`/meta yourself (`next.html` contains the full new document string).

### 17. Astro `<ClientRouter />`
**Looks like:** Astro's built-in SPA router using View Transitions: default crossfade, `slide`, shared elements via `transition:name`, persistent islands.  
**Use when / avoid when:** Astro sites that need persistent state (audio player, 3D canvas) across pages or fallback animations in Firefox. If you only need visuals, Astro's docs now point to native cross-document `@view-transition` (recipe 3), which ships no router JS.  
**Stack:** Astro
```astro
---
// src/layouts/Base.astro
import { ClientRouter } from "astro:transitions";
---
<html lang="en">
  <head><ClientRouter fallback="swap" /></head>
  <body>
    <header transition:persist>...</header>
    <main transition:animate="slide"><slot /></main>
  </body>
</html>
<script>
  document.addEventListener("astro:page-load", () => { /* init per page; also fires on first load */ });
  document.addEventListener("astro:before-swap", () => { /* kill ScrollTriggers / Lenis listeners */ });
</script>
```
```astro
<img src={post.cover} alt="" transition:name={`cover-${post.slug}`} />
<a href="/logout" data-astro-reload>Log out</a>
```
**Tune:** `transition:animate` = `fade` (default) | `slide` | `none` | `initial`; `fallback` = `animate` | `swap` | `none` for browsers without VT.  
**A11y/perf:** route announcements are on by default and reduced motion disables the animations automatically.

### 18. Counter 0-100 + curtain, skipped on repeat visits
**Looks like:** black screen, a big tabular counter ticks 0 -> 100 in the corner with a thin progress line, then the curtain lifts and the hero type rises. The signature of studio portfolios 2019-2026.  
**Use when / avoid when:** portfolio or launch site, first visit only, when there is something worth loading (WebGL, video, big images). A fake 3 s counter on a static page is pure AI-slop: it delays perceived content and users bounce. Max 2.5 s; skip on repeat visits in the same session; skip for reduced motion.  
**Stack:** GSAP + inline head script (no flash, works before hydration)
```tsx
// app/layout.tsx (excerpt) - runs before paint; decides whether the intro runs at all
import { Preloader } from "@/components/intro/Preloader";

const introScript = `try{var d=document.documentElement;if(sessionStorage.getItem('intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='skip'}else{d.dataset.intro='run'}}catch(e){document.documentElement.dataset.intro='skip'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: introScript }} /></head>
      <body>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
```
```tsx
// components/intro/Preloader.tsx
"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { markIntroDone } from "./intro-store";
import { waitForAssets } from "./preload";

gsap.registerPlugin(useGSAP);

const MIN_S = 1.2;       // never shorter: a flash of counter looks broken
const MAX_MS = 2500;     // never longer: reveal even if assets are slow
const HERO_ASSETS = ["/images/hero.avif"];

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = root.current;
    if (!el) return;
    if (document.documentElement.dataset.intro !== "run") { markIntroDone(); return; }

    const counter = el.querySelector<HTMLElement>(".pl-count");
    const state = { v: 0 };
    const render = () => { if (counter) counter.textContent = String(Math.round(state.v)).padStart(3, "0"); };

    // phase 1: time-based climb to 90 while real assets load
    const climb = gsap.to(state, { v: 90, duration: MIN_S, ease: "power2.inOut", onUpdate: render });
    gsap.to(".pl-bar", { scaleX: 0.9, duration: MIN_S, ease: "power2.inOut" });

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      gsap.timeline({
        onComplete: () => {
          try { sessionStorage.setItem("intro-seen", "1"); } catch { /* private mode */ }
          document.documentElement.dataset.intro = "done";
          gsap.set(el, { display: "none" });
        },
      })
        .to(state, { v: 100, duration: 0.35, ease: "power1.out", onUpdate: render })
        .to(".pl-bar", { scaleX: 1, duration: 0.35, ease: "power1.out" }, "<")
        .to(".pl-count, .pl-bar", { yPercent: -120, opacity: 0, duration: 0.4, ease: "power3.in" }, "+=0.1")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, "-=0.1")
        .add(markIntroDone, "-=0.55"); // hero starts rising while the curtain is still leaving
    };

    Promise.all([waitForAssets(HERO_ASSETS, MAX_MS), climb.then()]).then(finish);
    const failsafe = window.setTimeout(finish, MAX_MS + 800);
    return () => window.clearTimeout(failsafe);
  }, { scope: root });

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <span className="pl-count">000</span>
      <span className="pl-bar" />
    </div>
  );
}
```
```css
/* Hidden by default; shown ONLY when the head script opted in. With JS disabled or the head script
   missing/blocked, data-intro is never "run", so visitors never sit behind a blank curtain
   (verified in a browser harness: the old "hide when skip/done" gate showed a black screen for 5 s). */
.preloader { display: none; }
html[data-intro="run"] .preloader {
  display: block; position: fixed; inset: 0; z-index: 2000; background: var(--curtain-bg); color: var(--curtain-fg);
  clip-path: inset(0% 0% 0% 0%);
  animation: pl-failsafe 0.4s ease 5s forwards; /* opted in but the bundle failed: the loader removes itself */
}
.pl-count { position: absolute; right: 4vw; bottom: 3vw; font-size: clamp(4rem, 14vw, 12rem); line-height: 0.8; font-variant-numeric: tabular-nums; letter-spacing: -0.05em; }
.pl-bar { position: absolute; left: 0; bottom: 0; width: 100%; height: 2px; background: currentColor; transform: scaleX(0); transform-origin: 0 50%; }
@keyframes pl-failsafe { to { opacity: 0; visibility: hidden; } }
```
**Tune:** MIN 1.0-1.5 s, MAX 2.5 s; counter `tabular-nums` (proportional digits jitter); curtain 0.8-1.0 s `expo.inOut`; start hero at 40-60% of the curtain.  
**A11y/perf:** page content is server-rendered and fully painted UNDER the overlay, so LCP is recorded on time and crawlers see everything; never render the page `opacity: 0` behind a loader (opacity-0 elements are not LCP candidates). The counter is `aria-hidden`. Repeat navigations and reduced-motion users never see it.

### 19. Intro gate store (hero waits for preloader)
**Looks like:** nothing by itself: the plumbing that stops the hero animating invisibly behind the preloader, and makes it animate immediately when the intro is skipped.  
**Use when / avoid when:** any site with a preloader or intro. Without it, hero timelines run at mount (hidden) and the user sees a static hero after the curtain. Do not use React context for this (re-renders the tree); a 20-line external store is enough.  
**Stack:** React `useSyncExternalStore` + GSAP (or Motion)
```ts
// components/intro/intro-store.ts
type Listener = () => void;
const listeners = new Set<Listener>();
let done = false;

export function markIntroDone(): void {
  if (done) return;
  done = true;
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent("intro:done")); // for non-React code (vanilla, WebGL loop)
}
export const isIntroDone = (): boolean => done;
export function subscribeIntro(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
```
```ts
// components/intro/use-intro-done.ts
"use client";
import { useSyncExternalStore } from "react";
import { isIntroDone, subscribeIntro } from "./intro-store";
export const useIntroDone = (): boolean => useSyncExternalStore(subscribeIntro, isIntroDone, () => false);
```
```tsx
// components/hero/Hero.tsx
"use client";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useIntroDone } from "@/components/intro/use-intro-done";

gsap.registerPlugin(useGSAP, SplitText);

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const ready = useIntroDone();

  useGSAP(() => {
    if (!ready) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      SplitText.create(".hero-title", {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08 }),
      });
      gsap.from(".hero-meta", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", delay: 0.35 });
    });
  }, { scope: root, dependencies: [ready] });

  return (
    <section ref={root} className="hero">
      <h1 className="hero-title">Design engineer building calm, fast interfaces.</h1>
      <p className="hero-meta">Based in Casablanca - available 2026</p>
    </section>
  );
}
```
**Tune:** start hero 0.3-0.6 s before the curtain finishes; returning the tween from `onSplit` lets SplitText re-split on resize without stacking animations (see `text-effects.md`).  
**A11y/perf:** `gsap.from` sets the start state at the moment `ready` flips, while the curtain still covers the hero: no flash. When the intro is skipped, `markIntroDone()` runs in the preloader's first effect and the hero animates at once; with reduced motion it is static and visible. Vanilla: `isIntroDone() ? start() : window.addEventListener("intro:done", start, { once: true })`.

### 20. Image-stack loader
**Looks like:** 5-7 project images flash in rapidly, stacked at the centre (each revealed by a clip-path wipe), then the last one expands to full-bleed and becomes the hero background. Seen on photographer and studio sites.  
**Use when / avoid when:** image-led portfolios where the images ARE the content. Needs small images. A loader waiting on 8 MB of JPEG is worse than none.  
**Stack:** GSAP (swap in for the counter of recipe 18)
```tsx
// components/intro/ImageStackLoader.tsx
"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { markIntroDone } from "./intro-store";
import { waitForAssets } from "./preload";

gsap.registerPlugin(useGSAP);

const IMAGES = ["/intro/1.avif", "/intro/2.avif", "/intro/3.avif", "/intro/4.avif", "/intro/5.avif"];

export function ImageStackLoader() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (document.documentElement.dataset.intro !== "run") { markIntroDone(); return; }
    const frames = gsap.utils.toArray<HTMLElement>(".isl-frame");
    const last = frames[frames.length - 1];
    let tl: gsap.core.Timeline | undefined;
    waitForAssets(IMAGES, 2500).then(() => {
      tl = gsap.timeline({
        onComplete: () => {
          try { sessionStorage.setItem("intro-seen", "1"); } catch { /* ignore */ }
          document.documentElement.dataset.intro = "done";
        },
      })
        .fromTo(frames, { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.out", stagger: 0.16 })
        .to(last, { width: "100vw", height: "100svh", duration: 1.0, ease: "expo.inOut" }, "+=0.15")
        .add(markIntroDone, "-=0.4")
        .to(root.current, { autoAlpha: 0, duration: 0.3 });
    });
    return () => tl?.kill(); // created async, outside the context's synchronous capture
  }, { scope: root });

  return (
    <div ref={root} className="isl" aria-hidden="true">
      {IMAGES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" className="isl-frame" style={{ zIndex: i }} decoding="async" />
      ))}
    </div>
  );
}
```
```css
/* Same opt-in gate as recipe 18: hidden unless the head script set data-intro="run" (no JS = no curtain),
   plus a failsafe so a failed bundle can never leave a permanent overlay. */
.isl { display: none; }
html[data-intro="run"] .isl { display: grid; position: fixed; inset: 0; z-index: 2000; place-items: center; background: var(--curtain-bg);
  animation: isl-failsafe 0.4s ease 6s forwards; }
@keyframes isl-failsafe { to { opacity: 0; visibility: hidden; } }
.isl-frame { grid-area: 1 / 1; width: min(28vw, 320px); height: min(38vw, 420px); object-fit: cover; clip-path: inset(100% 0% 0% 0%); }
```
**Tune:** 5-7 frames; 0.12-0.2 s stagger (faster reads as flicker, slower as a slideshow); final expand 0.9-1.2 s. Make the final frame the same image as the hero background so the hand-off is seamless.  
**A11y/perf:** animating `width/height` of ONE image for 1 s is acceptable; for many elements use Flip (see `scroll-gsap.md`). Keep intro images <= 80 KB AVIF each (they display at ~300 px).

### 21. Logo draw loader (CSS only)
**Looks like:** the logo outline draws itself stroke by stroke, the fill fades in, the overlay fades away. Zero JS, so it works before hydration and can never get stuck.  
**Use when / avoid when:** brand sites with a line-friendly mark; fastest intro (<= 1.6 s). Complex filled logos have no strokes to draw: use recipe 12.  
**Stack:** CSS + inline SVG
```tsx
// components/intro/LogoDraw.tsx (Server Component: no JS shipped)
export function LogoDraw() {
  return (
    <div className="ld" aria-hidden="true">
      <svg viewBox="0 0 120 120" width="96" height="96" fill="none" stroke="currentColor" strokeWidth="3">
        <path pathLength={1} d="M20 100 L60 20 L100 100 Z" />
        <circle pathLength={1} cx="60" cy="72" r="16" />
      </svg>
    </div>
  );
}
```
```css
:root { --ld-draw: 1s; --ld-hold: 0.25s; }
.ld { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; background: var(--curtain-bg); color: var(--curtain-fg);
  animation: ld-out 0.5s var(--ease-in-out-quart) calc(var(--ld-draw) + var(--ld-hold) + 0.3s) forwards; }
.ld path, .ld circle { stroke-dasharray: 1; stroke-dashoffset: 1; fill: currentColor; fill-opacity: 0;
  animation: ld-draw var(--ld-draw) var(--ease-in-out-quart) forwards, ld-fill 0.3s ease calc(var(--ld-draw) - 0.1s) forwards; }
.ld circle { animation-delay: 0.2s, calc(var(--ld-draw) + 0.1s); }
@keyframes ld-draw { to { stroke-dashoffset: 0; } }
@keyframes ld-fill { to { fill-opacity: 1; } }
@keyframes ld-out { to { opacity: 0; visibility: hidden; } }
html[data-intro="skip"] .ld { display: none; }
@media (prefers-reduced-motion: reduce) { .ld { display: none; } }
```
Gate the hero with a tiny client wrapper that calls `markIntroDone()` in `onAnimationEnd` of `.ld` (check `e.animationName === "ld-out"`), or delay the hero by the same CSS token.  
**Tune:** `pathLength={1}` normalises every path so dasharray/offset are 1 regardless of real length; draw 0.8-1.2 s; stagger strokes 0.1-0.25 s.  
**A11y/perf:** stroke-dashoffset on a 96 px SVG is trivial. Skip on repeat visits with the same `data-intro` head script as recipe 18.

### 22. Asset preloading without killing LCP
**Looks like:** invisible: hero image, fonts and 3D model are ready when the curtain lifts, and nothing pops in afterwards.  
**Use when / avoid when:** always pair with a preloader; also useful without one (preload the next route's hero on hover). Preloading is parallel, never a gate on HTML: SEO/LCP content ships in the first response.  
**Stack:** React 19 resource APIs + DOM
```ts
// components/intro/preload.ts
"use client";
import { preload } from "react-dom";

const timeout = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function loadImage(src: string): Promise<void> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().catch(() => undefined); // errors must never block the reveal
}

/** Resolves when fonts + images are ready, or after maxMs - whichever first. Never rejects. */
export function waitForAssets(images: string[], maxMs = 2500): Promise<void> {
  images.forEach((src) => preload(src, { as: "image", fetchPriority: "high" }));
  const fonts = document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve();
  return Promise.race([Promise.all([fonts, ...images.map(loadImage)]).then(() => undefined), timeout(maxMs)]);
}
```
```tsx
// app/page.tsx (excerpt) - Next 16: `preload` prop replaces the deprecated `priority`
import Image from "next/image";
<Image src="/images/hero.avif" alt="Studio at night" fill preload sizes="100vw" className="object-cover" />
```
```tsx
// components/three/use-scene-progress.ts - R3F: feed progress (0-100) into the counter of recipe 18
"use client";
import { useGLTF, useProgress } from "@react-three/drei";
useGLTF.preload("/models/scene.glb");
export function useSceneProgress(): number { return useProgress((s) => s.progress); }
```
**Tune:** max wait 2-3 s then reveal anyway; preload only first-viewport assets (hero image, display font, first model); everything else lazy.  
**A11y/perf:** `next/font` already self-hosts and preloads fonts: no manual font preloads on top. Video heroes: preload the poster, not the MP4; start playback on `intro:done`. `fetchPriority: "high"` on at most 1-2 images.

### 23. Fullscreen menu overlay
**Looks like:** "Menu" morphs to "Close", a full-viewport panel wipes down (clip-path), giant links rise out of masks with a stagger, socials fade in at the bottom; closing plays it back 1.6x faster.  
**Use when / avoid when:** portfolios and brand sites with 3-6 destinations. For SaaS with 8+ links use a normal drawer or Vaul sheet. The AI-slop version: centred 4 links in Inter on a blurred backdrop; commit instead to one huge display size (8-12vw), left-aligned, with index numbers or hover previews.  
**Stack:** GSAP + Lenis + `inert`
```tsx
// components/nav/FullscreenMenu.tsx
"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function FullscreenMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const mounted = useRef(false);
  const lenis = useLenis();

  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = gsap.timeline({ paused: true, onReverseComplete: () => gsap.set(menu.current, { visibility: "hidden" }) });
    t.set(menu.current, { visibility: "visible" });
    if (reduce) {
      t.fromTo(menu.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" });
    } else {
      t.fromTo(menu.current, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" })
        .fromTo(".menu-link-inner", { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.06 }, "-=0.35")
        .fromTo(".menu-foot", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.5");
    }
    tl.current = t;
  }, { scope: root });

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const t = tl.current;
    const page = document.getElementById("page"); // wraps <main> + <footer>, NOT the header
    const html = document.documentElement;
    if (open) {
      if (lenis) lenis.stop(); else html.style.overflow = "hidden";
      page?.setAttribute("inert", "");
      t?.timeScale(1).play();
      menu.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
    } else {
      page?.removeAttribute("inert");
      if (lenis) lenis.start(); else html.style.overflow = "";
      t?.timeScale(1.6).reverse();
      if (menu.current?.contains(document.activeElement)) toggle.current?.focus({ preventScroll: true });
    }
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={root}>
      <button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-menu"
        onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Menu"}
      </button>
      <nav ref={menu} id="site-menu" className="menu" aria-label="Main" inert={!open}>
        <ol className="menu-list">
          {LINKS.map((l, i) => (
            <li key={l.href} className="menu-item">
              <Link href={l.href} className="menu-link" onClick={() => setOpen(false)}>
                <span className="menu-link-inner"><sup>{String(i + 1).padStart(2, "0")}</sup>{l.label}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="menu-foot"><a href="mailto:hello@example.com">hello@example.com</a></div>
      </nav>
    </div>
  );
}
```
```css
html { scrollbar-gutter: stable; } /* no layout shift when overflow is locked */
.menu-toggle { position: fixed; top: 20px; right: 24px; z-index: 1001; mix-blend-mode: difference; color: #fff; }
.menu { position: fixed; inset: 0; z-index: 1000; visibility: hidden; display: grid; align-content: center;
  padding: 0 6vw; background: var(--curtain-bg); color: var(--curtain-fg); overscroll-behavior: contain; }
.menu-item { overflow: clip; padding-block: 0.04em; }
.menu-link { display: block; font-size: clamp(3rem, 10vw, 9rem); line-height: 0.95; letter-spacing: -0.04em; }
.menu-link-inner { display: inline-block; }
.menu-link sup { font-size: 0.18em; margin-right: 0.6em; vertical-align: top; opacity: 0.5; }
.menu-foot { position: absolute; left: 6vw; bottom: 4vh; }
@media (hover: hover) and (pointer: fine) {
  .menu-list:hover .menu-link { opacity: 0.35; transition: opacity 250ms; }
  .menu-list .menu-link:hover { opacity: 1; }
}
```
**Tune:** panel 0.7-0.9 s `expo.inOut`; link stagger 0.04-0.08 s; close `timeScale` 1.4-1.8 (closing should always be faster than opening). Variation: `clip-path: circle(0% at <toggle position>)` to grow from the button.  
**A11y/perf:** `inert` on the page wrapper is the modern focus trap (Baseline since 2023) and React 19 accepts `inert` as a boolean prop; the menu itself is `inert` while closed so hidden links are not tabbable. Esc closes, focus returns to the toggle. Lenis `stop()` blocks wheel/touch scrolling; without Lenis lock `overflow` on `<html>`. Full-screen clip-path is fine for a one-shot tween.

### 24. Nav hide on scroll down / show on up
**Looks like:** the header slides away as you read down, reappears the moment you scroll up, and is always visible near the top.  
**Use when / avoid when:** long-form pages, case studies, docs on mobile. Avoid when the header holds the primary CTA of a landing page (keep it sticky and small instead).  
**Stack:** React + CSS transition (works with or without Lenis: Lenis drives native scroll, so `scroll` events still fire)
```ts
// components/nav/use-hide-on-scroll.ts
"use client";
import { useEffect, useState } from "react";

const DELTA = 8;     // px of travel before reacting: kills jitter from trackpads
const TOP_ZONE = 80; // always visible near the top

export function useHideOnScroll(disabled = false): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (disabled) { setHidden(false); return; }
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) < DELTA) return;
        setHidden(y > TOP_ZONE && y > last);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [disabled]);
  return hidden;
}
```
```tsx
// components/nav/SiteNav.tsx
"use client";
import Link from "next/link";
import { useHideOnScroll } from "./use-hide-on-scroll";

export function SiteNav({ menuOpen = false }: { menuOpen?: boolean }) {
  const hidden = useHideOnScroll(menuOpen);
  return (
    <header className="site-nav" data-hidden={hidden}>
      <Link href="/">Atlas</Link>
      <nav aria-label="Primary"><Link href="/work">Work</Link> <Link href="/about">About</Link></nav>
    </header>
  );
}
```
```css
.site-nav { position: fixed; inset: 0 0 auto; z-index: 50; display: flex; justify-content: space-between; padding: 16px 24px;
  transition: transform 450ms var(--ease-out-expo); }
.site-nav[data-hidden="true"]:not(:focus-within) { transform: translateY(-100%); } /* keyboard focus always reveals it */
@media (prefers-reduced-motion: reduce) { .site-nav { transition: none; } }
```
**Tune:** DELTA 5-12 px; TOP_ZONE = header height; hide transition 350-500 ms ease-out-expo; show can be faster (250 ms) via a separate rule on `[data-hidden="false"]`.  
**A11y/perf:** `:focus-within` keeps it visible for keyboard users; `data-hidden` state changes only when direction flips, so React re-renders rarely. Pair with anchor links using `scroll-margin-top` equal to the header height.

### 25. Route-change hygiene component
**Looks like:** nothing, which is the point: every navigation lands at the top (except back/forward), Lenis never glides from the old position, ScrollTriggers measure the new page, focus and announcements are correct.  
**Use when / avoid when:** every Next site that uses Lenis and/or ScrollTrigger. Mount once in the root layout.  
**Stack:** React + Lenis + GSAP
```tsx
// components/RouteHygiene.tsx
"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function RouteHygiene() {
  const pathname = usePathname();
  const lenis = useLenis();
  const first = useRef(true);
  const traversing = useRef(false);

  // back/forward: let Next restore the saved scroll position
  useEffect(() => {
    const onPop = () => { traversing.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const hash = window.location.hash;
    const anchor = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null; // no querySelector: "#1st" throws
    if (!traversing.current) {
      if (anchor) { if (lenis) lenis.scrollTo(anchor, { immediate: true }); else anchor.scrollIntoView(); }
      else if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); // kills Lenis inertia from the old page
      else window.scrollTo(0, 0);
    }
    traversing.current = false;

    // focus: main has tabIndex={-1}; keyboard/screen-reader users start at the new content
    document.getElementById("main")?.focus({ preventScroll: true });

    // measure after the new page's effects created their triggers and layout settled
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => ScrollTrigger.refresh()); });
    const onLoad = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onLoad);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [pathname, lenis]);

  return null;
}
// app/layout.tsx: <ReactLenis root /><RouteHygiene /> ... <main id="main" tabIndex={-1} className="outline-none">{children}</main>
```
Checklist:
| Concern | Next 16 App Router | Vanilla / Swup / Barba |
|---|---|---|
| Scroll to top | Built in (`htmlElement.scrollTop = 0` in layout-router); add Lenis `scrollTo(0, { immediate: true })` | Swup scroll plugin; Barba: `window.scrollTo(0,0)` in `enter` + `history.scrollRestoration = "manual"` |
| Back/forward restore | Built in: do not force top on `popstate` | Swup scroll plugin restores; Barba: store positions yourself |
| Route announcement | Built in: `next-route-announcer` reads `document.title` (falls back to the `h1`). Do not add a second live region | Swup a11y plugin; Astro built in; Barba: `aria-live="polite"` region + set text after swap |
| Focus | Focus `<main tabIndex={-1}>` (above) | a11y plugin / focus new `h1` in `after` hook |
| ScrollTrigger | Per-page `useGSAP` reverts its triggers on unmount; `refresh()` after mount | `ctx.revert()` before swap, re-init after, `refresh()` |
| Prefetch | `<Link>` prefetches in viewport; custom `navigate()` calls `router.prefetch` | Swup preload plugin; Barba `@barba/prefetch` |
| Reduced motion | Skip overlays; VT crossfade only | CSS media query zeroes durations |
| Never block | Failsafe timeout reveals after 4 s; modified clicks and `_blank` bypass the transition | `preventRunning: true` (Barba), Swup cancels in-flight visits |

**Tune:** double rAF before `refresh()` is usually enough; add `ScrollTrigger.refresh()` on `window` `load` for image-heavy pages without fixed dimensions.  
**A11y/perf:** focusing `main` on every navigation is what screen-reader users expect from an SPA; `preventScroll` keeps the scroll position logic above in charge.

## Gotchas
- **Duplicate `view-transition-name`** (list thumb AND detail hero both rendered, or two cards with the same name) aborts the whole transition with an `InvalidStateError`. Names must be unique per snapshot; use `match-element` or `name={`x-${id}`}`.
- **React-driven VTs ignore `::view-transition-*(root)` rules**: React sets `html { view-transition-name: none }` during its transitions. Style `<ViewTransition>` classes instead, or use `document.startViewTransition` + `flushSync` for whole-page effects (theme toggle).
- **`<ViewTransition>` in `layout.tsx` never fires enter/exit** (layouts persist). Put route wrappers in each `page.tsx`; layout-level ones only get `update`.
- **Named pair never morphs in Next**: destination suspended (no prefetch, or `loading.tsx` above it), or `default="none"` without an explicit `share`. Keep the named element outside the suspending subtree.
- **Plain `setState` never animates** with React VT: wrap in `startTransition`, use `<Link>`/`router.push` (navigations are transitions), Suspense or `useDeferredValue`.
- **Types in old browsers**: `startViewTransition({ update, types })` throws/ignores in Chrome < 125 and Firefox 144-146 (callback-only). Use the helper in recipe 1.
- **Cross-document VT silently not running**: missing `@view-transition` on the OLD page, cross-origin link, redirect in between, or page took > ~4 s. Firefox has no MPA support at all (Sept 2026).
- **Clicks lost during a VT**: `::view-transition` captures pointer events; add `::view-transition { pointer-events: none; }` and keep transitions short.
- **Text looks blurry mid-morph**: snapshots are bitmaps. Morph images/boxes, crossfade text; for big title morphs hide the old snapshot and scale only the new one.
- **`position: fixed` children break inside a transformed wrapper**: a `motion.div` in `template.tsx` animating `y` becomes the containing block, so fixed headers/modals inside it jump. Keep fixed UI outside the animated wrapper (layout level).
- **FrozenRouter breaks on Next upgrades**: it imports a private module. Pin Next, have an E2E test for navigation, or switch to recipe 4/7.
- **Next scrolls before your exit animation**: the old page jumps to top while exiting. Use `scroll: false` on `router.push`/`<Link>` and scroll during the covered moment (recipe 7).
- **Lenis keeps gliding after navigation**: inertia from the old page continues on the new one. `lenis.scrollTo(0, { immediate: true, force: true })` on route change (Lenis 1.3 also has a `stopInertiaOnNavigate: true` option); `lenis.stop()` while an overlay covers.
- **ScrollTrigger measures the old page**: pin-spacers linger or start/end are wrong after navigation. Scope every trigger in `useGSAP({ scope })` so it reverts on unmount, then `ScrollTrigger.refresh()` after the new page mounts (recipe 25).
- **Preloader stuck forever**: an asset 404s or `decode()` rejects. Every wait must race a timeout, catch errors, and the overlay must have a CSS failsafe animation.
- **Preloader flash on repeat visits**: deciding in `useEffect` is too late. Decide in a blocking inline `<head>` script that sets `data-intro`, and hide via CSS.
- **Blank curtain without JS**: gate JS-driven loaders as "hidden unless `html[data-intro="run"]`", never "visible unless skip/done". The inverted gate means no-JS visitors, blocked inline scripts (strict CSP without a nonce) and failed bundles all get a full-screen overlay (5 s with a failsafe, forever without one). Add a nonce to the head script when the site uses a CSP.
- **Hero invisible after intro**: hero hidden with CSS `opacity: 0` waiting for JS that never runs (error, slow bundle). Hide only under the overlay; never `opacity: 0` in SSR HTML.
- **Double-click during a curtain** starts two navigations. Guard with a `busy` flag and `pointer-events: auto` on the overlay while covering.
- **Cmd/Ctrl-click hijacked**: custom transition links must let modified clicks, middle clicks and `target="_blank"` fall through to the browser.
- **Menu leaves the page dead**: `inert` or `lenis.stop()` not undone when navigating from inside the menu. Close on link click and in a pathname effect; undo in cleanup.
- **Scrollbar jump when locking scroll**: `overflow: hidden` removes the scrollbar and shifts layout. `html { scrollbar-gutter: stable; }`.
- **iOS overlay height**: `100vh` overlays leave a gap behind the URL bar; use `position: fixed; inset: 0` or `100dvh`/`100svh`.
- **Full-screen `clip-path`/`filter` scrubbed** by scroll or pointer janks on mid Android; one-shot tweens <= 1 s are fine. Prefer `transform: scale/translate` for anything continuous.
- **Barba/Swup scripts in the swapped container don't run**: move init into hooks (`page:view`, `barba.hooks.after`) and revert GSAP contexts before the swap.
- **Theme toggle circle starts from (0,0) on keyboard**: `e.clientX` is 0 for Enter/Space; use the button's centre when `e.detail === 0`.

## Sources
- https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
- https://developer.mozilla.org/en-US/docs/Web/API/Element/startViewTransition
- https://github.com/mdn/browser-compat-data (api/Document, Element, ViewTransition, PageSwapEvent, PageRevealEvent; css/properties/view-transition-*; css/at-rules/view-transition; html/elements/link rel=expect) - fetched 2026-09-26
- https://developer.chrome.com/docs/web-platform/view-transitions
- https://developer.chrome.com/blog/view-transitions-update-io24
- https://developer.chrome.com/blog/view-transitions-in-2025
- https://developer.chrome.com/blog/element-scoped-view-transitions
- https://developer.chrome.com/docs/css-ui/view-transitions/element-scoped-view-transitions
- https://react.dev/reference/react/ViewTransition
- https://react.dev/blog/2026/09/09/react-19-3
- https://nextjs.org/docs/app/guides/view-transitions (v16.3.6)
- https://nextjs.org/docs/app/api-reference/components/link#transitiontypes
- https://nextjs.org/docs/app/api-reference/functions/use-router
- next@16.3.6 package source: dist/client/components/layout-router.js (scroll + focus), app-router-announcer.js, shared/lib/app-router-context.shared-runtime, get-img-props (`preload` replaces `priority`)
- react@19.3.0 / react-dom@19.3.0 package source (exports `ViewTransition`, `addTransitionType`; root `view-transition-name: none`)
- https://motion.dev/docs/react-animate-view
- https://github.com/vercel-labs/react-view-transitions-demo
- https://github.com/shuding/next-view-transitions (README via npm 0.3.5)
- https://docs.astro.build/en/guides/view-transitions/
- https://swup.js.org/ and npm READMEs: @swup/parallel-plugin, @swup/js-plugin, @swup/fade-theme, @swup/overlay-theme
- https://barba.js.org/docs/ (@barba/core 2.10.3)
- https://gsap.com/docs/v3/ (useGSAP, SplitText, contextSafe)
- https://github.com/darkroomengineering/lenis (lenis/react, stop/start, scrollTo options)
