# Native CSS Scroll Effects (scroll-driven animations, scroll-state, CSS carousels, scroll ergonomics)
> Load when: building scroll-linked effects WITHOUT a JS scroll library (progress bars, reveals, parallax, sticky/pinned-feel sections, snap carousels, stuck headers), adding a JS fallback for engines without support, or deciding native CSS vs GSAP ScrollTrigger.
> Stack assumptions: plain CSS first (works in any framework, including Next 16 App Router server components). JS interop in TS + React 19 client components (`"use client"`), vanilla variants given. Tailwind v4 users: put these rules in a CSS file under `@layer components` or an `@utility`; there are no first-party scroll-timeline utilities in Tailwind 4.3.

## Contents
- [Decision guide](#decision-guide)
- [Support snapshot (verified 2026-09-26)](#support-snapshot-verified-2026-09-26)
- Recipes
  - [1. Base pattern: scroll() / view() with guards](#1-base-pattern-scroll--view-with-guards)
  - [2. animation-range cheat sheet + range keyframes](#2-animation-range-cheat-sheet--range-keyframes)
  - [3. Named timelines + timeline-scope (cross-tree control)](#3-named-timelines--timeline-scope-cross-tree-control)
  - [4. Reading progress bar (page and per-article)](#4-reading-progress-bar-page-and-per-article)
  - [5. Reveal on enter (fade / slide / clip / blur)](#5-reveal-on-enter-fade--slide--clip--blur)
  - [6. Parallax layers](#6-parallax-layers)
  - [7. Image zoom inside a fixed frame](#7-image-zoom-inside-a-fixed-frame)
  - [8. Sticky header compact + frosted on scroll](#8-sticky-header-compact--frosted-on-scroll)
  - [9. Hero fade-out as you scroll away](#9-hero-fade-out-as-you-scroll-away)
  - [10. Horizontal scroll section (sticky + view timeline)](#10-horizontal-scroll-section-sticky--view-timeline)
  - [11. Stacking cards](#11-stacking-cards)
  - [12. Text fill / word-by-word highlight on scroll](#12-text-fill--word-by-word-highlight-on-scroll)
  - [13. Scroll-linked rotate / scale of decorative elements](#13-scroll-linked-rotate--scale-of-decorative-elements)
  - [14. Section background color transitions](#14-section-background-color-transitions)
  - [15. Scroll-snap carousel with active-slide scaling (and cover flow)](#15-scroll-snap-carousel-with-active-slide-scaling-and-cover-flow)
  - [16. CSS-only carousel: ::scroll-button, ::scroll-marker, scroll-marker-group](#16-css-only-carousel-scroll-button-scroll-marker-scroll-marker-group)
  - [17. scroll-state() container queries: stuck, snapped, scrollable, scrolled](#17-scroll-state-container-queries-stuck-snapped-scrollable-scrolled)
  - [18. Scroll-TRIGGERED animations: timeline-trigger + animation-trigger](#18-scroll-triggered-animations-timeline-trigger--animation-trigger)
  - [19. Scroll-spy table of contents: scroll-target-group](#19-scroll-spy-table-of-contents-scroll-target-group)
  - [20. JS interop: WAAPI ScrollTimeline / ViewTimeline](#20-js-interop-waapi-scrolltimeline--viewtimeline)
  - [21. Motion scroll() / useScroll](#21-motion-scroll--usescroll)
  - [22. IntersectionObserver fallback (class toggle + CSS transition)](#22-intersectionobserver-fallback-class-toggle--css-transition)
  - [23. The scroll-timeline polyfill: when (not) to use it](#23-the-scroll-timeline-polyfill-when-not-to-use-it)
  - [24. Scroll ergonomics baseline stylesheet](#24-scroll-ergonomics-baseline-stylesheet)
  - [25. Native CSS vs GSAP: who owns what](#25-native-css-vs-gsap-who-owns-what)
- [Gotchas](#gotchas)
- [Sources](#sources)
- [Support matrix](#support-matrix)

## Decision guide
| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| Thin bar showing read progress | `animation-timeline: scroll(root)` on `scaleX` | CSS only, compositor | [4](#4-reading-progress-bar-page-and-per-article) |
| Content "arrives" as it enters (one-shot, crisp) | IO class toggle or `timeline-trigger` (time-based) | ~0.5 kb JS or CSS (Chrome 146+) | [22](#22-intersectionobserver-fallback-class-toggle--css-transition), [18](#18-scroll-triggered-animations-timeline-trigger--animation-trigger) |
| Content scrubs in/out with the scroll (reversible) | `view()` + `animation-range: entry` | CSS only | [5](#5-reveal-on-enter-fade--slide--clip--blur) |
| Depth: layers drift at different speeds | named `view-timeline` on section, `translate` per layer | CSS, compositor | [6](#6-parallax-layers) |
| Photo slowly settles inside its frame | `scale` 1.2 -> 1 on `view()` | CSS, compositor | [7](#7-image-zoom-inside-a-fixed-frame) |
| Header tightens + frosts after first scroll | `scroll(root)` with `animation-range: 0 120px`, or `scroll-state(stuck)` | CSS; backdrop-filter static only | [8](#8-sticky-header-compact--frosted-on-scroll), [17](#17-scroll-state-container-queries-stuck-snapped-scrollable-scrolled) |
| Hero recedes as page moves on | `view()` `exit` range on hero content | CSS | [9](#9-hero-fade-out-as-you-scroll-away) |
| Vertical scroll drives a horizontal strip | tall section + sticky viewport + `contain` range | CSS; GSAP if you need snap/callbacks | [10](#10-horizontal-scroll-section-sticky--view-timeline) |
| Cards pile up with depth | sticky cards + `exit-crossing` scale | CSS | [11](#11-stacking-cards) |
| Paragraph "lights up" as you read | inline background-size fill or per-word opacity | CSS (paint cost) | [12](#12-text-fill--word-by-word-highlight-on-scroll) |
| Rotating badge / spinning ornament | `rotate` on `scroll(root)` | CSS | [13](#13-scroll-linked-rotate--scale-of-decorative-elements) |
| Page color changes per chapter | fixed per-section layers, opacity on named view timeline | CSS | [14](#14-section-background-color-transitions) |
| Swipe gallery with focused center slide | `scroll-snap` + `view(inline)` scale/opacity | CSS | [15](#15-scroll-snap-carousel-with-active-slide-scaling-and-cover-flow) |
| Carousel arrows + dots without JS | `::scroll-button()` / `::scroll-marker` | CSS, Chromium only | [16](#16-css-only-carousel-scroll-button-scroll-marker-scroll-marker-group) |
| Style when sticky is stuck / slide is snapped / user scrolled up | `@container scroll-state(...)` | CSS, Chromium only | [17](#17-scroll-state-container-queries-stuck-snapped-scrollable-scrolled) |
| TOC highlights current section | `scroll-target-group` + `:target-current` | CSS, Chromium only; IO fallback | [19](#19-scroll-spy-table-of-contents-scroll-target-group) |
| Scroll animation built from JS data | `el.animate({...}, { timeline: new ViewTimeline(...) })` | ~0 kb | [20](#20-js-interop-waapi-scrolltimeline--viewtimeline) |
| Already on Motion, want React values | `useScroll` + `useTransform` | motion (tree-shaken) | [21](#21-motion-scroll--usescroll) |
| Pinning, snapping, callbacks, sequenced timelines, Lenis | GSAP ScrollTrigger | ~45 kb | see `scroll-gsap.md` |

## Support snapshot (verified 2026-09-26)
Data: MDN browser-compat-data 8.1.3 (2026-09-24), webstatus.dev API, Mozilla dev-platform list. Current stables: Chrome/Edge 154, Firefox 156, Safari 27.0.

- **Scroll-driven animations** (`animation-timeline`, `scroll()`, `view()`, `animation-range`, `scroll-timeline`, `view-timeline`, `timeline-scope`, range keyframes, JS `ScrollTimeline`/`ViewTimeline`): Chrome/Edge 115 (`timeline-scope` 116), Safari/iOS 26.0 (Sept 2025; compositor-threaded since 26.4), **Firefox: Nightly only** (`layout.css.scroll-driven-animations.enabled`). Mozilla posted **Intent to Ship for Firefox 159 on 2026-09-25**; BCD lists Fx 159 release as 2026-10-27. Baseline status today: **Limited availability**. The claim "Baseline in all engines" is NOT true yet; it becomes Baseline newly available only if Fx 159 ships as planned. Always ship with a fallback.
- **`scroll` named range** (`animation-range: scroll ...` for view timelines): Chrome 147, Safari 26.5, Firefox Nightly.
- **Scroll-triggered animations** (`timeline-trigger`, `animation-trigger`, `trigger-scope`): Chrome 146 only.
- **CSS carousels** (`::scroll-button()`, `::scroll-marker`, `::scroll-marker-group`, `scroll-marker-group`, `:target-current`, `::column`): Chrome 135 only. `scroll-target-group`: Chrome 140 only. `scroll-initial-target`: Chrome 133 only.
- **scroll-state() container queries**: `stuck`/`snapped`/`scrollable` Chrome 133, `scrolled` (direction) Chrome 144. No Firefox/Safari.
- **`interactivity: inert`**: Chrome 135 only. **`scrollsnapchange`/`scrollsnapchanging`** events: Chrome 129 only.
- Baseline and safe: `scroll-snap-*` (widely), `scroll-behavior` (widely), `scroll-padding`/`scroll-margin` (widely), `overscroll-behavior` on scrollable boxes (C63/F59/S16), `scrollbar-gutter` + `scrollbar-width` (newly, Dec 2024), `scrollbar-color` (newly, Dec 2025 with Safari 26.2), `scrollend` event (newly, Dec 2025), `overflow: clip` (widely), `IntersectionObserver` (widely).

## Recipes

### 1. Base pattern: scroll() / view() with guards
**Looks like:** nothing by itself; this is the wrapper every recipe below uses so unsupported engines and reduced-motion users get the finished, static layout.  
**Use when / avoid when:** always wrap scroll-driven rules this way. Never put the "hidden" initial state outside the guard, or Firefox (until 159) and reduced-motion users get invisible content.  
**Stack:** CSS
```css
:root {
  /* scroll-linked motion is paced by the finger; keep the animation linear and shape inside keyframes */
  --sda-distance: 2.5rem;
  --sda-range-reveal: entry 10% cover 30%;
}

@keyframes sda-fade-up {
  from { opacity: 0; translate: 0 var(--sda-distance); }
  /* no `to`: the browser animates to the element's own computed value */
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .sda-reveal {
      animation: sda-fade-up linear both;   /* shorthand FIRST (it resets animation-timeline) */
      animation-timeline: view();           /* longhands AFTER the shorthand */
      animation-range: var(--sda-range-reveal);
    }
  }
}
```
```html
<h2 class="sda-reveal">Selected work</h2>
```
**Tune:** `--sda-distance` 1.5rem to 4rem (bigger reads as cheap); range end `cover 25%` to `cover 40%` (earlier end = content settles sooner, feels more confident).  
**A11y/perf:** `@supports` + `prefers-reduced-motion` guard means the static end state is the default. Only `transform`/`translate`/`scale`/`rotate`/`opacity` stay on the compositor; other properties are sampled on the main thread and can trail the scroll by a frame.

Anatomy you need to remember:
- `scroll(<scroller> <axis>)`: scroller `nearest` (default) | `root` | `self`; axis `block` (default) | `inline` | `x` | `y`. Progress 0-100% over the scroller's whole scroll range.
- `view(<axis> <inset>)`: tracks the element itself inside its nearest scroller. Inset `auto` | `<length-percentage>{1,2}` (start, end), e.g. `view(block 80px 0px)` shrinks the "viewport" by a fixed 80px header at the top.
- `animation-duration` must be `auto` (just omit it). Time delays are meaningless; use ranges.
- Fill mode: use `both` for reveal-type effects so the "before" state applies before the range starts and the end state holds after it.

### 2. animation-range cheat sheet + range keyframes
**Looks like:** precise control of WHEN inside the scroll an effect plays.  
**Use when / avoid when:** every `view()` effect. Default (`normal`) = `cover`, which spreads the effect over the whole passage and usually feels mushy; almost always narrow it.  
**Stack:** CSS

| Range name | 0% is when... | 100% is when... | Typical use |
|---|---|---|---|
| `cover` | subject's leading edge touches scrollport end (bottom) | subject's trailing edge leaves scrollport start (top) | parallax, full passage |
| `contain` | subject fully inside (or, if taller, fully covering) the scrollport | last moment it is fully inside / covering | pinned-feel sequences, horizontal sections |
| `entry` | leading edge touches bottom | subject fully entered (or covers) | reveals |
| `exit` | subject starts leaving at top | subject fully gone | fade/recede out |
| `entry-crossing` | leading edge crosses bottom edge | trailing edge crosses bottom edge | reveals tied to element height |
| `exit-crossing` | leading edge crosses top edge | trailing edge crosses top edge | stacking cards |
| `scroll` (C147, S26.5) | scroller at scroll start | scroller at scroll end | view timeline that also needs whole-page progress |

```css
/* common presets */
.a { animation-range: entry; }                      /* = entry 0% entry 100% */
.b { animation-range: entry 10% cover 30%; }        /* crisp reveal, done by 30% of passage */
.c { animation-range: exit 0% exit 80%; }           /* recede as it leaves */
.d { animation-range: contain 0% contain 100%; }    /* while a tall section covers the viewport */
.e { animation-range: cover 40% cover 60%; }        /* only around the viewport center */
.f { animation-range: entry 0px entry 200px; }      /* absolute length offsets are allowed */
.g { animation-range: 0px 120px; }                  /* on scroll(): first 120px of page scroll */

/* one keyframe set that owns its own ranges: no animation-range needed */
@keyframes in-and-out {
  entry 0%   { opacity: 0; translate: 0 3rem; }
  entry 100% { opacity: 1; translate: 0 0; }
  exit 0%    { opacity: 1; translate: 0 0; }
  exit 100%  { opacity: 0; translate: 0 -3rem; }
}
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .list-item {
      animation: in-and-out linear both;
      animation-timeline: view();
    }
  }
}

/* two animations on two ranges of the same timeline */
@supports (animation-timeline: view()) {
  .tile {
    animation: tile-in linear both, tile-out linear both;
    animation-timeline: view(), view();
    animation-range: entry, exit;
  }
}
@keyframes tile-in  { from { opacity: 0; scale: .92; } }
@keyframes tile-out { to   { opacity: 0; scale: .92; } }
```
**Tune:** reveal ranges end between `entry 100%` and `cover 40%`; exit ranges start at `exit 0%` to `exit 30%`. Use the range visualizer (https://goo.gle/view-timeline-range-tool) while tuning.  
**A11y/perf:** ranges come from the UNtransformed box, so scaling/translating the subject never feeds back into its own progress (no flicker loops).

### 3. Named timelines + timeline-scope (cross-tree control)
**Looks like:** a progress indicator, caption, or background elsewhere in the DOM reacting to a different scroller or element (e.g. a gallery counter outside the gallery, a fixed bar reading an article's progress).  
**Use when / avoid when:** the animated element is not the subject and not inside the scroller. Avoid when `view()` / `scroll()` on the element itself works (simpler).  
**Stack:** CSS
```html
<section class="gallery">
  <p class="gallery__meter" aria-hidden="true"><span></span></p>
  <ul class="gallery__rail">
    <li><img src="/work/01.avif" alt="Project one" width="1200" height="800"></li>
    <li><img src="/work/02.avif" alt="Project two" width="1200" height="800"></li>
    <li><img src="/work/03.avif" alt="Project three" width="1200" height="800"></li>
  </ul>
</section>
```
```css
.gallery {
  timeline-scope: --gallery-rail;          /* hoist/limit the name to this component */
}
.gallery__rail {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-timeline: --gallery-rail inline;  /* name + axis */
}
.gallery__rail > li { flex: 0 0 min(80vw, 56rem); scroll-snap-align: center; }
.gallery__meter { height: 2px; background: color-mix(in oklch, currentColor 15%, transparent); }
.gallery__meter > span {
  display: block;
  height: 100%;
  background: currentColor;
  transform-origin: 0 50%;
  scale: .333 1;                            /* static fallback: first of three */
}
@supports (animation-timeline: --x) {
  .gallery__meter > span {
    animation: meter-fill linear both;
    animation-timeline: --gallery-rail;
  }
}
@keyframes meter-fill { from { scale: .333 1; } to { scale: 1 1; } }
```
**Tune:** use one unique dashed name per component type; put `timeline-scope` on the component root so multiple instances on a page do not collide.  
**A11y/perf:** meter is decorative (`aria-hidden`).

Spec change to know: the CSSWG changed named-timeline lookup so names are **global by default** (last matching timeline in tree order wins), and `timeline-scope` now **limits** a name to a subtree (plus a new `timeline-scope: all`). Engines are mid-migration (Firefox Nightly 155 has global names; Chrome has "timeline naming conflict resolution" and `timeline-scope: all` as proposed features). Declaring `timeline-scope: --name` on the nearest common ancestor gives the same result under both the old (ancestor-only, hoisting) and the new (global, scoping) rules, so always do it.

### 4. Reading progress bar (page and per-article)
**Looks like:** a 2-3px bar pinned to the top that grows left to right as you read. Per-article variant only counts the article body, not the footer.  
**Use when / avoid when:** long-form articles, case studies, docs. Avoid on short marketing pages (it just advertises how little content there is).  
**Stack:** CSS + optional 20-line JS fallback
```html
<div class="read-progress" aria-hidden="true"></div>
<article class="post">...</article>
```
```css
.read-progress {
  position: fixed;
  inset: 0 0 auto;
  height: 3px;
  z-index: 100;
  background: var(--accent, oklch(0.72 0.19 45));
  transform-origin: 0 50%;
  scale: 0 1;
  pointer-events: none;
}
@supports (animation-timeline: scroll()) {
  .read-progress {
    animation: read-grow linear both;
    animation-timeline: scroll(root block);
  }
}
@keyframes read-grow { from { scale: 0 1; } to { scale: 1 1; } }

/* Per-article variant: progress only while the article covers the viewport */
@supports (animation-timeline: view()) {
  body { timeline-scope: --post; }
  .post { view-timeline: --post block; }
  .read-progress.is-article {
    animation: read-grow linear both;
    animation-timeline: --post;
    animation-range: contain 0% contain 100%;   /* article taller than viewport: top at top -> bottom at bottom */
  }
}
```
```ts
// read-progress-fallback.ts - only runs where CSS scroll timelines are missing (Firefox < 159)
export function initReadProgressFallback(bar: HTMLElement): () => void {
  if (CSS.supports("animation-timeline: scroll()")) return () => {};
  let frame = 0;
  const update = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.scale = `${p} 1`;
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
```
**Tune:** height 2-4px; accent color at full chroma is fine because the area is tiny; add `border-radius: 0 2px 2px 0` for a softer head.  
**A11y/perf:** a progress bar is state, not decoration motion, so it can stay on under reduced motion. Animate `scale`, never `width`.

### 5. Reveal on enter (fade / slide / clip / blur)
**Looks like:** headings rise 24-40px and fade in, images unmask from a thin slit to full frame as they come up the screen.  
**Use when / avoid when:** scrubbed reveals suit spatial content (images, cards, big display type). For body text prefer a one-shot time-based reveal ([22](#22-intersectionobserver-fallback-class-toggle--css-transition) / [18](#18-scroll-triggered-animations-timeline-trigger--animation-trigger)): a reader who stops mid-scroll should never be left staring at half-transparent copy. AI-slop tell: every single block fading up with identical distance and range; vary by content type and reveal only the key 20%.  
**Stack:** CSS
```css
@keyframes reveal-rise { from { opacity: 0; translate: 0 2.5rem; } }
@keyframes reveal-clip { from { clip-path: inset(0 45% 0 45% round 1rem); opacity: .2; } to { clip-path: inset(0 0 0 0 round 1rem); opacity: 1; } }
@keyframes reveal-blur { from { opacity: 0; filter: blur(12px); translate: 0 1rem; } }

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    [data-sda="rise"] {
      animation: reveal-rise linear both;
      animation-timeline: view();
      animation-range: entry 5% cover 30%;
    }
    [data-sda="clip"] {
      animation: reveal-clip linear both;
      animation-timeline: view();
      animation-range: entry 20% cover 45%;
    }
    [data-sda="blur"] {                 /* small elements only: filter is paint-heavy */
      animation: reveal-blur linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 90%;
    }
    /* stagger siblings with ranges, not delays (delays mean nothing on a scroll timeline) */
    .reveal-grid > * {
      animation: reveal-rise linear both;
      animation-timeline: view();
      animation-range: entry calc(var(--i, 0) * 6%) cover calc(28% + var(--i, 0) * 6%);
    }
  }
}
```
```html
<ul class="reveal-grid">
  <li style="--i:0">...</li><li style="--i:1">...</li><li style="--i:2">...</li>
</ul>
```
Where `sibling-index()` is supported (C138, F154, S26.2) you can drop the inline `--i`: `animation-range: entry calc((sibling-index() - 1) * 6%) cover calc(28% + (sibling-index() - 1) * 6%);` inside `@supports (order: sibling-index())`.  
**Tune:** distance 1.5-3rem; clip start `inset(0 45% ...)` (vertical slit) or `inset(100% 0 0 0)` (wipe up); stagger step 4-8% of range.  
**A11y/perf:** `clip-path` and `filter` are not reliably composited: fine for a handful of on-screen elements, janky on 30 cards or full-bleed images on mid-range Android. Never scrub `filter: blur()` on large areas.

### 6. Parallax layers
**Looks like:** inside a hero or chapter opener, the background photo drifts slower than the page, a mid layer slightly faster, and the headline slightly ahead; subtle depth, no seasickness.  
**Use when / avoid when:** one or two moments per page (hero, chapter break). Avoid on every section and avoid depth factors above ~0.4: that is the 2015 parallax look.  
**Stack:** CSS
```html
<section class="plx">
  <img class="plx__layer" style="--depth:-0.25" src="/hero-bg.avif" alt="" width="2400" height="1600">
  <div class="plx__layer plx__mist" style="--depth:0.1" aria-hidden="true"></div>
  <h2 class="plx__layer plx__title" style="--depth:0.3">Made slowly</h2>
</section>
```
```css
.plx {
  position: relative;
  min-height: 110svh;
  overflow: clip;                 /* NOT overflow:hidden: hidden creates a scroll container and hijacks view() lookups */
  display: grid;
  place-items: center;
  view-timeline: --plx block;
}
.plx__layer { grid-area: 1 / 1; }
.plx > img.plx__layer { width: 100%; height: 130%; object-fit: cover; }   /* extra height = travel room */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .plx__layer {
      animation: plx-drift linear both;
      animation-timeline: --plx;
      animation-range: cover;
    }
  }
}
@keyframes plx-drift {
  from { translate: 0 calc(var(--depth) * -30vh); }
  to   { translate: 0 calc(var(--depth) *  30vh); }
}
```
**Tune:** `--depth` -0.3..0.4; travel `30vh` total; image over-height = 100% + 2 x |depth| x 30vh relative to section.  
**A11y/perf:** reduced motion gets a static composition. Use `translate` (composited). For full-bleed layers add `will-change: translate` only to the one or two largest layers.

### 7. Image zoom inside a fixed frame
**Looks like:** a photo in a rounded frame that starts slightly zoomed (1.2x) and settles to 1x as it crosses the viewport, like a camera push-out (common on Apple product pages and studio sites such as Locomotive / Dogstudio).  
**Use when / avoid when:** editorial imagery, case-study covers. Avoid on UI screenshots (text shimmer while scaling).  
**Stack:** CSS
```html
<figure class="zoom-frame">
  <img src="/case/cover.avif" alt="Dashboard on a studio desk" width="1600" height="1000">
</figure>
```
```css
.zoom-frame {
  overflow: clip;
  border-radius: 1.25rem;
  aspect-ratio: 16 / 10;
  view-timeline: --zoom-frame block;
}
.zoom-frame > img { width: 100%; height: 100%; object-fit: cover; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .zoom-frame > img {
      animation: frame-settle linear both;
      animation-timeline: --zoom-frame;
      animation-range: entry 0% cover 60%;
    }
  }
}
@keyframes frame-settle { from { scale: 1.22; } to { scale: 1; } }
```
**Tune:** start scale 1.1-1.3; end the range between `cover 50%` and `contain 0%`; pair with a slight `translate: 0 -4%` for a push-in-and-pan.  
**A11y/perf:** composited `scale` only; serve an image at least 1.3x the rendered size to avoid blur at the start.

### 8. Sticky header compact + frosted on scroll
**Looks like:** at the top of the page the header is tall and transparent over the hero; after ~120px it tightens (logo scales down, header slides up a little) and a frosted translucent plate fades in behind it.  
**Use when / avoid when:** marketing sites with a full-bleed hero. Avoid frosted glass over busy, high-contrast imagery (unreadable) and avoid animating the blur radius.  
**Stack:** CSS (see [17](#17-scroll-state-container-queries-stuck-snapped-scrollable-scrolled) for a state-based variant)
```html
<header class="site-header">
  <div class="site-header__inner">
    <a class="site-header__logo" href="/">Studio</a>
    <nav aria-label="Primary">...</nav>
  </div>
</header>
```
```css
:root { --header-h: 5rem; --header-shift: .75rem; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--header-h);
  isolation: isolate;
}
.site-header::before {           /* the frosted plate: blur is STATIC, only opacity animates */
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: color-mix(in oklch, var(--surface, white) 72%, transparent);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  backdrop-filter: blur(14px) saturate(1.4);
  border-bottom: 1px solid color-mix(in oklch, currentColor 10%, transparent);
  opacity: 0;
}
.site-header__inner { height: 100%; display: flex; align-items: center; justify-content: space-between; padding-inline: clamp(1rem, 4vw, 3rem); }
.site-header__logo { transform-origin: 0 50%; }

@supports (animation-timeline: scroll()) {
  .site-header,
  .site-header::before,
  .site-header__inner,
  .site-header__logo {
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: scroll(root);
    animation-range: 0px 120px;
  }
  .site-header         { animation-name: hdr-lift; }
  .site-header::before { animation-name: hdr-plate; }
  .site-header__inner  { animation-name: hdr-recenter; }
  .site-header__logo   { animation-name: hdr-logo; }
}
@keyframes hdr-lift     { to { translate: 0 calc(var(--header-shift) * -1); } }
@keyframes hdr-recenter { to { translate: 0 calc(var(--header-shift) / 2); } }
@keyframes hdr-plate    { to { opacity: 1; } }
@keyframes hdr-logo     { to { scale: .82; } }

/* reduced motion: skip the movement but still show the plate once scrolled */
@media (prefers-reduced-motion: reduce) {
  .site-header, .site-header__inner, .site-header__logo { animation: none; }
}
```
**Tune:** range end 80-160px; shift .5-1rem; logo scale .78-.88; plate mix 60-80%.  
**A11y/perf:** zero layout properties animated (no height/padding), so no reflow per frame. `backdrop-filter` is expensive on large areas: keep the header short, never scrub blur radius. Unsupported engines keep the transparent header; add a solid fallback background if the hero is light.

### 9. Hero fade-out as you scroll away
**Looks like:** as the page starts moving, the hero headline and CTA drift up slightly, shrink 4%, and fade, handing focus to the next section (seen on most Awwwards SOTD landing pages).  
**Use when / avoid when:** full-viewport heroes. Avoid when the hero contains the only primary CTA and the page is short; fading it early hurts conversion.  
**Stack:** CSS
```html
<section class="hero">
  <div class="hero__content">
    <h1>Interfaces with a pulse</h1>
    <a class="btn" href="#work">See work</a>
  </div>
</section>
```
```css
.hero { min-height: 100svh; display: grid; place-items: center; view-timeline: --hero block; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .hero__content {
      animation: hero-recede linear both;
      animation-timeline: --hero;
      animation-range: exit 0% exit 75%;
    }
  }
}
@keyframes hero-recede {
  to { opacity: 0; translate: 0 -8vh; scale: .96; }
}
```
Alternative when the hero is not the first box or has odd height: `animation-timeline: scroll(root); animation-range: 0px 80vh;`.  
**Tune:** end at `exit 60%` to `exit 90%`; translate -4vh to -12vh; scale .94-.98. Add `filter: blur(6px)` only if the hero is text-only and small.  
**A11y/perf:** if the hero ALSO has a time-based intro animation (SplitText, `@starting-style`), put the intro on an inner element and the scroll fade on the wrapper; two animations fighting over `opacity` on the same element override each other.

### 10. Horizontal scroll section (sticky + view timeline)
**Looks like:** the page pins, and continuing to scroll vertically slides a row of project panels sideways, then releases (the classic "horizontal gallery" of agency sites).  
**Use when / avoid when:** 3-6 visual panels that are genuinely a sequence. Avoid for text-heavy content, forms, or anything with focusable controls inside panels (keyboard users tab into off-screen items). If you need snap-to-panel, progress callbacks, or nested animations per panel, use GSAP (`scroll-gsap.md#8-horizontal-scroll-gallery`).  
**Stack:** CSS
```html
<section class="hscroll" style="--panels: 4" aria-label="Selected projects">
  <div class="hscroll__viewport">
    <ul class="hscroll__track">
      <li class="hscroll__panel">Project 1</li>
      <li class="hscroll__panel">Project 2</li>
      <li class="hscroll__panel">Project 3</li>
      <li class="hscroll__panel">Project 4</li>
    </ul>
  </div>
</section>
```
```css
:root { --hs-panel-w: min(72vw, 62rem); --hs-gap: clamp(1rem, 3vw, 2.5rem); }

.hscroll__track {
  list-style: none;
  margin: 0;
  display: flex;
  gap: var(--hs-gap);
  padding-inline: 6vw;
}
.hscroll__panel { flex: 0 0 var(--hs-panel-w); aspect-ratio: 4 / 3; border-radius: 1.25rem; }

/* Fallback (and reduced motion): a normal swipeable, snapping rail */
.hscroll__viewport { overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; }
.hscroll__panel { scroll-snap-align: center; }

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .hscroll {
      height: calc(var(--panels) * 90svh);   /* vertical scroll budget */
      view-timeline: --hscroll block;
    }
    .hscroll__viewport {
      position: sticky;
      top: 0;
      height: 100svh;
      overflow: clip;                         /* clip, not auto: no nested scroller */
      display: flex;
      align-items: center;
      container-type: inline-size;            /* enables 100cqi = visible width without scrollbar */
    }
    .hscroll__track {
      width: max-content;
      animation: hscroll-slide linear both;
      animation-timeline: --hscroll;
      animation-range: contain 0% contain 100%;   /* exactly the pinned span */
    }
  }
}
@keyframes hscroll-slide {
  to { translate: calc(-100% + 100cqi) 0; }   /* track width minus visible width */
}
```
**Tune:** section height: match vertical budget to horizontal distance (roughly `panels x 80-100svh`) so a wheel notch moves about one panel-width per viewport of scroll; `animation-range: contain 5% contain 95%` adds a short dwell at both ends.  
**A11y/perf:** only `translate` is animated (composited). On touch devices many teams prefer the fallback rail: add `and (pointer: fine)` to the media query. If panels contain links, add a "skip gallery" link before the section.

### 11. Stacking cards
**Looks like:** cards stick near the top one after another; each new card slides over the previous one, which recedes (scales to ~0.9 and darkens), leaving a neat pile of edges (popularised by the scroll-driven-animations.style stacking-cards demo and many SaaS feature sections).  
**Use when / avoid when:** 3-5 feature or case-study cards. Avoid with more than 6 cards (scroll fatigue) or cards of unequal height.  
**Stack:** CSS
```html
<ul class="stack" style="--cards: 4">
  <li class="stack__card" style="--i: 1"><article class="stack__content">One</article></li>
  <li class="stack__card" style="--i: 2"><article class="stack__content">Two</article></li>
  <li class="stack__card" style="--i: 3"><article class="stack__content">Three</article></li>
  <li class="stack__card" style="--i: 4"><article class="stack__content">Four</article></li>
</ul>
```
```css
:root { --stack-top: 6rem; --stack-offset: 1.1rem; --stack-card-h: min(70svh, 40rem); --stack-shrink: .045; }

.stack {
  list-style: none;
  margin: 0;
  padding: 0 0 calc(var(--cards) * var(--stack-offset));
  display: grid;
  gap: 6vh;
  view-timeline: --stack block;
}
.stack__card {
  position: sticky;
  top: calc(var(--stack-top) + (var(--i) - 1) * var(--stack-offset));
  height: var(--stack-card-h);
}
.stack__content {
  position: relative;
  height: 100%;
  border-radius: 1.5rem;
  background: var(--surface, oklch(0.98 0 0));
  box-shadow: 0 30px 60px -30px oklch(0 0 0 / .35);
  transform-origin: 50% 0;
}
.stack__content::after {           /* dimming via overlay opacity, not filter */
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: oklch(0 0 0);
  opacity: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .stack__content,
    .stack__content::after {
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --stack;
      animation-range:
        exit-crossing calc((var(--i) - 1) / var(--cards) * 100%)
        exit-crossing calc(var(--i) / var(--cards) * 100%);
    }
    .stack__content        { animation-name: stack-recede; }
    .stack__content::after { animation-name: stack-dim; }
  }
}
@keyframes stack-recede { to { scale: calc(1 - (var(--cards) - var(--i)) * var(--stack-shrink)); } }
@keyframes stack-dim    { to { opacity: calc((var(--cards) - var(--i)) * .08); } }
```
**Tune:** `--stack-offset` .75-1.5rem (visible edge of each buried card); `--stack-shrink` .03-.06; dim step .05-.1.  
**A11y/perf:** sticky + transform/opacity only. Reduced motion keeps the sticky pile without scaling, which is still legible. `--i` is inherited by `::after` from the card, so the pseudo computes the same range.

### 12. Text fill / word-by-word highlight on scroll
**Looks like:** a large paragraph starts at 20% ink and "fills" to full ink line by line (variant A) or word by word (variant B) as it moves up the viewport (Apple feature pages, Linear, many studio manifestos).  
**Use when / avoid when:** ONE manifesto/intro statement per page, 20-60 words, display size. Avoid on body copy: it slows reading, and doing it on every paragraph is an AI-landing-page cliche.  
**Stack:** CSS (+ tiny server component for splitting)

Variant A - continuous line-by-line fill (one element, no splitting). Works because an inline box's background is laid out as if all its line fragments were one long line:
```html
<p class="ink-fill"><span>We design and build digital products that feel inevitable, quiet, and fast.</span></p>
```
```css
.ink-fill { font-size: clamp(1.75rem, 4vw, 3.5rem); line-height: 1.15; view-timeline: --ink-fill block; }
.ink-fill > span {
  color: transparent;
  background:
    linear-gradient(var(--ink, oklch(0.2 0 0)) 0 0) 0 0 / 100% 100% no-repeat,
    linear-gradient(color-mix(in oklch, var(--ink, oklch(0.2 0 0)) 20%, transparent) 0 0);
  -webkit-background-clip: text;
  background-clip: text;
}
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .ink-fill > span {
      background-size: 0% 100%, auto;
      animation: ink-fill linear both;
      animation-timeline: --ink-fill;
      animation-range: entry 60% cover 55%;
    }
  }
}
@keyframes ink-fill { to { background-size: 100% 100%, auto; } }
```
Variant B - per word (React server component; no client JS):
```tsx
// WordFill.tsx (server component)
type WordFillProps = { text: string; className?: string };

export function WordFill({ text, className }: WordFillProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p className={`word-fill ${className ?? ""}`} style={{ ["--n" as string]: words.length }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="word-fill__w" style={{ ["--i" as string]: i }}>{w} </span>
        ))}
      </span>
    </p>
  );
}
```
```css
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.word-fill { view-timeline: --word-fill block; font-size: clamp(1.75rem, 4vw, 3.5rem); }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .word-fill__w {
      opacity: .18;
      animation: word-on linear both;
      animation-timeline: --word-fill;
      animation-range:
        cover calc(20% + var(--i) / var(--n) * 35%)
        cover calc(20% + (var(--i) + 1) / var(--n) * 35%);
    }
  }
}
@keyframes word-on { to { opacity: 1; } }
```
**Tune:** window `20%..55%` of cover (shift later if the paragraph sits low on the page); dim level .12-.25; variant A range `entry 60% cover 55%`.  
**A11y/perf:** variant A animates `background-size` (paint, main thread) on one element: fine. Variant B is opacity per word (composited) but many layers; keep under ~80 words. The `sr-only` copy keeps screen readers from announcing word fragments. Without support both variants render fully inked.

### 13. Scroll-linked rotate / scale of decorative elements
**Looks like:** a circular "scroll to explore" badge that rotates as you scroll; a gradient blob that breathes (scales 0.85 -> 1.15) as a section passes.  
**Use when / avoid when:** small ornaments that add life to otherwise static layouts. Avoid on content or icons users must read mid-rotation.  
**Stack:** CSS + inline SVG
```html
<a class="spin-badge" href="#work" aria-label="Scroll to work">
  <svg viewBox="0 0 200 200" aria-hidden="true">
    <defs><path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
    <text font-size="17" letter-spacing="4"><textPath href="#badge-circle">SCROLL TO EXPLORE - SCROLL TO EXPLORE -</textPath></text>
  </svg>
</a>
<div class="blob" aria-hidden="true"></div>
```
```css
.spin-badge { display: inline-grid; width: 8rem; aspect-ratio: 1; color: inherit; }
.spin-badge svg { fill: currentColor; }
.blob {
  width: 40vmin; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, oklch(0.8 0.15 300), oklch(0.6 0.2 260) 60%, transparent 70%);
}
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) {
    .spin-badge svg {
      animation: badge-spin linear both;
      animation-timeline: scroll(root);
    }
    .blob {
      animation: blob-breathe linear both;
      animation-timeline: view();
    }
  }
}
@keyframes badge-spin   { to { rotate: 2turn; } }
@keyframes blob-breathe { 0% { scale: .85; rotate: -20deg; } 50% { scale: 1.15; } 100% { scale: .9; rotate: 25deg; } }
```
**Tune:** total rotation 1-3 turns over the page (more = dizzy); breathe 0.85-1.2.  
**A11y/perf:** `rotate`/`scale` are composited. Avoid a large `filter: blur()` on the blob; bake the softness into the gradient instead.

### 14. Section background color transitions
**Looks like:** the whole page background shifts color when a new chapter scrolls in (cream -> ink -> brand), cross-fading over part of the viewport, like studio sites that "change mood" per section.  
**Use when / avoid when:** 3-6 big chapters with distinct moods. Avoid alternating every section (strobe effect), and make sure text color flips with it.  
**Stack:** CSS (fixed per-section layers, opacity only)
```html
<main class="chapters">
  <section class="chapter" style="--bg: oklch(0.97 0.01 85); --fg: oklch(0.2 0.02 60)">...</section>
  <section class="chapter" style="--bg: oklch(0.18 0.02 260); --fg: oklch(0.96 0.01 260)">...</section>
  <section class="chapter" style="--bg: oklch(0.68 0.19 35); --fg: oklch(0.15 0.03 35)">...</section>
</main>
```
```css
html { background: oklch(0.97 0.01 85); }     /* = first chapter bg */
.chapter {
  position: relative;
  min-height: 100svh;
  color: var(--fg);
  view-timeline: --chapter block;
}
/* No support: each chapter paints its own background */
.chapter { background: var(--bg); }

@supports (animation-timeline: view()) {
  .chapter { background: none; }
  .chapter::before {
    content: "";
    position: fixed;             /* each chapter owns a full-viewport color layer */
    inset: 0;
    z-index: -1;
    background: var(--bg);
    pointer-events: none;
  }
  .chapter:not(:first-child)::before {
    opacity: 0;
    animation: chapter-bg linear both;
    animation-timeline: --chapter;      /* the pseudo finds its own section's timeline first */
    animation-range: entry 40% entry 80%;
  }
}
@keyframes chapter-bg { to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .chapter:not(:first-child)::before { animation-range: entry 59% entry 61%; }   /* near-instant switch */
}
```
**Tune:** fade window 20-40% of entry; place it so the switch completes as the chapter heading reaches the upper third.  
**A11y/perf:** full-screen opacity layers are composited and cheap. Breaks if any ancestor of `.chapter` has `transform`, `filter`, `contain: paint`, `will-change: transform`, or `content-visibility: auto` (fixed children then become relative to that ancestor). JS alternative that also works in Firefox today: IO toggles `data-theme` on `<body>` with `transition: background-color .6s` (pattern in [22](#22-intersectionobserver-fallback-class-toggle--css-transition)).

### 15. Scroll-snap carousel with active-slide scaling (and cover flow)
**Looks like:** a horizontal rail where the centered slide is full size and bright, neighbors shrink to ~82% and dim; swipe and it snaps. Cover-flow variant rotates side slides in 3D.  
**Use when / avoid when:** galleries, testimonials, product shots on touch-first pages. Avoid mandatory snapping on slides wider than the viewport (content becomes unreachable).  
**Stack:** CSS
```html
<ul class="snap-rail" aria-label="Gallery" tabindex="0">
  <li class="snap-slide"><img src="/g/1.avif" alt="Studio exterior" width="900" height="1200"></li>
  <li class="snap-slide"><img src="/g/2.avif" alt="Workshop" width="900" height="1200"></li>
  <li class="snap-slide"><img src="/g/3.avif" alt="Detail of joinery" width="900" height="1200"></li>
  <li class="snap-slide"><img src="/g/4.avif" alt="Team at the bench" width="900" height="1200"></li>
</ul>
```
```css
:root { --slide-w: min(68vw, 26rem); }
.snap-rail {
  list-style: none;
  margin: 0;
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;         /* no back-swipe / scroll chaining at the ends */
  scroll-snap-type: x mandatory;
  padding-inline: calc(50% - var(--slide-w) / 2);   /* lets first/last slides center */
  scrollbar-width: none;
  perspective: 1200px;                    /* used by the cover-flow variant */
}
.snap-rail::-webkit-scrollbar { display: none; }    /* Safari < 18.2 */
.snap-slide { flex: 0 0 var(--slide-w); scroll-snap-align: center; }
.snap-slide img { width: 100%; height: auto; border-radius: 1rem; display: block; }

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .snap-slide {
      animation: slide-focus linear both;
      animation-timeline: view(inline);     /* nearest scroller = the rail, inline axis */
    }
    .snap-rail.is-coverflow .snap-slide { animation-name: slide-coverflow; }
  }
}
@keyframes slide-focus {
  0%, 100% { scale: .82; opacity: .45; }
  50%      { scale: 1;   opacity: 1; }
}
@keyframes slide-coverflow {
  0%       { rotate: y 45deg;  scale: .8; }
  45%, 55% { rotate: y 0deg;   scale: 1; }
  100%     { rotate: y -45deg; scale: .8; }
}
```
**Tune:** off-center scale .78-.9, opacity .35-.6; widen the plateau (`45%, 55%`) so the focused slide rests fully sharp; `scroll-snap-stop: always` for one-slide-per-swipe (stories).  
**A11y/perf:** snapping is native and keyboard-scrollable because the rail is focusable and labelled. All animated props composited. Add prev/next buttons ([16](#16-css-only-carousel-scroll-button-scroll-marker-scroll-marker-group) in Chromium, or JS `rail.scrollBy({ left: rail.clientWidth * 0.8, behavior: "smooth" })`).

### 16. CSS-only carousel: ::scroll-button, ::scroll-marker, scroll-marker-group
**Looks like:** the rail gains real previous/next buttons and pagination dots, generated by the browser, with correct roles, focus order, and disabled states at the ends.  
**Use when / avoid when:** progressive enhancement only: Chrome/Edge 135+ today, nothing in Firefox/Safari. The underlying scroll-snap rail must stand on its own.  
**Stack:** CSS (Chromium), fallback = plain rail or small JS buttons
```html
<div class="carousel-wrap">
  <ul class="carousel" aria-label="Featured projects">
    <li data-label="Project Aurora">...</li>
    <li data-label="Project Basalt">...</li>
    <li data-label="Project Cinder">...</li>
  </ul>
</div>
```
```css
.carousel-wrap { position: relative; }        /* containing block for the buttons */
.carousel {
  list-style: none;
  margin: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(80%, 40rem);
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  scroll-marker-group: after;                  /* dots rendered after the scroller */
}
.carousel > li { scroll-snap-align: center; }

@supports (scroll-marker-group: after) {
  .carousel::scroll-button(left),
  .carousel::scroll-button(right) {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
    width: 3rem;
    aspect-ratio: 1;
    border: 0;
    border-radius: 50%;
    background: color-mix(in oklch, var(--surface, white) 85%, transparent);
    color: var(--ink, black);
    font-size: 1.25rem;
    cursor: pointer;
    transition: opacity .2s, scale .2s;
  }
  .carousel::scroll-button(left)  { content: "\2190" / "Previous"; left: .75rem; }
  .carousel::scroll-button(right) { content: "\2192" / "Next"; right: .75rem; }
  .carousel::scroll-button(left):disabled,
  .carousel::scroll-button(right):disabled { opacity: 0; pointer-events: none; }

  .carousel::scroll-marker-group {
    display: flex;
    justify-content: center;
    gap: .5rem;
    padding-block: 1rem;
  }
  .carousel > li::scroll-marker {
    content: "" / attr(data-label);            /* no glyph, accessible name from data attribute */
    width: .6rem;
    height: .6rem;
    border-radius: 1rem;
    background: color-mix(in oklch, currentColor 25%, transparent);
    transition: width .3s, background-color .3s;
  }
  .carousel > li::scroll-marker:target-current {
    width: 1.6rem;                              /* active pill */
    background: currentColor;
  }
}
```
**Tune:** button size 2.5-3.5rem; active marker as a pill (animating `width` is fine here: three tiny elements).  
**A11y/perf:** the browser supplies button semantics, `disabled` at the ends, and marker tab semantics with arrow-key navigation. Keep the scroller itself unpositioned so the buttons resolve against `.carousel-wrap`. `::column` (same release) can paginate one flowing block into snap pages (`.carousel { columns: 1 } .carousel::column { scroll-snap-align: center }`), Chromium only; test before relying on it.

### 17. scroll-state() container queries: stuck, snapped, scrollable, scrolled
**Looks like:** a sticky bar that gains a surface + shadow only once it is actually stuck; the snapped slide's caption slides up while others dim; a back-to-top button that appears once the page can scroll back up; a header that hides on scroll-down and returns on scroll-up. All without scroll listeners.  
**Use when / avoid when:** state-like changes (on/off), not continuous scrubbing. Chromium only (stuck/snapped/scrollable 133, scrolled 144): the unsupported default must be a complete design.  
**Stack:** CSS
```css
/* A. Sticky bar that changes when stuck. Container = the sticky element; styles apply to its CHILDREN. */
.subnav {
  position: sticky;
  top: 0;
  z-index: 40;
  container-type: scroll-state;
}
.subnav > .subnav__bar {
  padding-block: 1.25rem;
  transition: background-color .25s, box-shadow .25s, padding-block .25s;
}
@container scroll-state(stuck: top) {
  .subnav > .subnav__bar {
    padding-block: .75rem;
    background: var(--surface, white);
    box-shadow: 0 1px 0 color-mix(in oklch, currentColor 10%, transparent), 0 12px 24px -16px oklch(0 0 0 / .3);
  }
}

/* B. Snapped item highlight: scroller -> snap target (container) -> child that reacts */
.snap-rail > .snap-slide { container-type: scroll-state; }
@supports (container-type: scroll-state) {
  .snap-slide > figure { transition: opacity .4s; }
  .snap-slide figcaption { transition: translate .4s cubic-bezier(.16, 1, .3, 1); }
  @container not scroll-state(snapped: x) {
    .snap-slide > figure { opacity: .35; }
    .snap-slide figcaption { translate: 0 100%; }
  }
  /* keep off-screen slides out of the tab order (interactivity: Chrome 135+) */
  @container not scroll-state(snapped: x) {
    .snap-slide > figure { interactivity: inert; }
  }
}

/* C. Back-to-top appears once the page can scroll back up */
html { container-type: scroll-state; }
.back-to-top {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  opacity: 0;
  translate: 0 1rem;
  pointer-events: none;
  transition: opacity .3s, translate .3s;
}
@container scroll-state(scrollable: top) {
  .back-to-top { opacity: 1; translate: 0 0; pointer-events: auto; }
}

/* D. Hide header on scroll down, reveal on scroll up (scrolled: Chrome 144+) */
.site-header--auto {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  translate: 0 0;
  transition: translate .25s cubic-bezier(.2, .8, .2, 1);
}
@container scroll-state(scrolled: bottom) {
  .site-header--auto { translate: 0 -100%; }
}
@container scroll-state(scrolled: top) {
  .site-header--auto { translate: 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .site-header--auto, .back-to-top { transition-duration: 0s; }
}
```
**Tune:** transitions 200-400ms; keep hide/show on `translate` (never `top`); in D, add `:focus-within` override so keyboard users never lose the header: `.site-header--auto:focus-within { translate: 0 0 !important; }`.  
**A11y/perf:** a container query only styles DESCENDANTS of the container (pseudo-elements of the container may query it too). Pattern B needs three levels. `snapped` updates like `scrollsnapchanging` (during the gesture), so it feels immediate. Hidden fixed headers must not hide focused elements.

### 18. Scroll-TRIGGERED animations: timeline-trigger + animation-trigger
**Looks like:** the IntersectionObserver reveal, in pure CSS: a normal time-based animation (700ms, expo-out) that PLAYS when the element crosses a scroll range, instead of being scrubbed by it. Optionally reverses when it leaves.  
**Use when / avoid when:** one-shot reveals of text and UI where scrubbing would feel laggy. Chrome 146+ only (Sept 2026); keep the IO fallback ([22](#22-intersectionobserver-fallback-class-toggle--css-transition)).  
**Stack:** CSS
```css
:root { --dur-reveal: 700ms; --ease-out-expo: cubic-bezier(.16, 1, .3, 1); }
@keyframes trigger-rise { from { opacity: 0; translate: 0 1.75rem; } }

@media (prefers-reduced-motion: no-preference) {
  @supports (timeline-trigger-name: --t) {
    [data-reveal] {
      animation: trigger-rise var(--dur-reveal) var(--ease-out-expo) both;
      timeline-trigger: --reveal view() entry 30% exit 0%;   /* <name> <source> <activation range> */
      trigger-scope: --reveal;                                /* names are global like anchor-name: scope per element */
      animation-trigger: --reveal play-once;
    }
    /* reversible variant: plays forward on enter, backward on leave */
    [data-reveal="toggle"] {
      animation-trigger: --reveal play-forwards play-backwards;
    }
    /* stagger: siblings trigger at later points, CSS-only */
    [data-reveal-group] > [data-reveal] {
      timeline-trigger: --reveal view() entry calc(20% + (sibling-index() - 1) * 8%) exit 0%;
    }
  }
}
```
Full syntax: `timeline-trigger: <dashed-ident> <scroll()|view()|named timeline> <activation-range> [ / <active-range> ]`. The trigger activates when the scroll position enters the activation range and deactivates when it leaves the (usually wider) active range, which prevents flicker at the boundary. Actions for `animation-trigger`: `none`, `play`, `play-once`, `play-forwards`, `play-backwards`, `pause`, `reset`, `replay` (first action = on activate, second = on deactivate).  
**Tune:** activation start `entry 20%`-`entry 50%`; durations 500-900ms; stagger 6-10% of range.  
**A11y/perf:** time-based on the compositor, no JS. Known quirk: in `play-backwards` the stagger does not apply in reverse, and `play-forwards` + `forwards` fill can flash when re-entering; `play-once` is the safest default.

### 19. Scroll-spy table of contents: scroll-target-group
**Looks like:** a sticky TOC whose current section link is highlighted as you read, CSS-only.  
**Use when / avoid when:** docs, long case studies. Chrome/Edge 140+ only; ship the IO fallback below.  
**Stack:** CSS + ~25 lines JS fallback
```html
<nav class="toc" aria-label="On this page">
  <ol>
    <li><a href="#brief">Brief</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#outcome">Outcome</a></li>
  </ol>
</nav>
```
```css
.toc { position: sticky; top: 6rem; scroll-target-group: auto; }   /* its anchor links become scroll markers */
.toc a { color: color-mix(in oklch, currentColor 55%, transparent); text-decoration: none; transition: color .2s; }
.toc a:target-current,
.toc a[aria-current="true"] { color: currentColor; font-weight: 600; }
```
```ts
// toc-fallback.ts - only where scroll-target-group is unsupported
export function initTocFallback(nav: HTMLElement): () => void {
  if (CSS.supports("scroll-target-group: auto")) return () => {};
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const byId = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const sections = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute("aria-current"));
        byId.get(entry.target.id)?.setAttribute("aria-current", "true");
      }
    },
    { rootMargin: "-20% 0px -70% 0px" }          /* a thin band near the top third = "current" */
  );
  sections.forEach((s) => io.observe(s));
  return () => io.disconnect();
}
```
**Tune:** IO band `-20% 0px -70% 0px` (current = section crossing the top 20-30% band).  
**A11y/perf:** the fallback sets `aria-current`, which screen readers announce; keep the visual style identical in both paths.

### 20. JS interop: WAAPI ScrollTimeline / ViewTimeline
**Looks like:** the same effects as CSS, but created from data (per-item keyframes, CMS-driven ranges) or toggled at runtime.  
**Use when / avoid when:** you need runtime control (create/cancel, compute keyframes) without a library. Same support as CSS SDA (C115, S26, Firefox 159 planned). Returns nothing in unsupported engines: always feature-detect.  
**Stack:** TS / React
```ts
// vanilla: reading progress bar
const bar = document.querySelector<HTMLElement>(".read-progress");
type Axis = "block" | "inline" | "x" | "y";
type ScrollTimelineCtor = new (opts: { source?: Element; axis?: Axis }) => AnimationTimeline;
const ScrollTimelineImpl = (globalThis as unknown as { ScrollTimeline?: ScrollTimelineCtor }).ScrollTimeline;

if (bar && ScrollTimelineImpl) {
  bar.animate(
    { transform: ["scaleX(0)", "scaleX(1)"] },
    { timeline: new ScrollTimelineImpl({ source: document.documentElement, axis: "block" }), fill: "both" }
  );
}
```
```tsx
// useViewTimeline.ts
"use client";
import { useEffect, useRef } from "react";

type Axis = "block" | "inline" | "x" | "y";
type ViewTimelineCtor = new (opts: { subject: Element; axis?: Axis; inset?: string }) => AnimationTimeline;
type ScrollRange = { rangeStart?: string; rangeEnd?: string };

const getViewTimeline = (): ViewTimelineCtor | undefined =>
  (globalThis as unknown as { ViewTimeline?: ViewTimelineCtor }).ViewTimeline;

/** keyframes must be a stable reference (module constant or useMemo) */
export function useViewTimeline<T extends HTMLElement>(
  keyframes: Keyframe[],
  { rangeStart = "entry 10%", rangeEnd = "cover 35%" }: ScrollRange = {}
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    const ViewTimelineImpl = getViewTimeline();
    if (!el || !ViewTimelineImpl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const options: KeyframeAnimationOptions & ScrollRange = {
      timeline: new ViewTimelineImpl({ subject: el, axis: "block" }),
      rangeStart,
      rangeEnd,
      fill: "both",
      easing: "linear",
    };
    const animation = el.animate(keyframes, options);   // no duration: "auto" = the whole range
    return () => animation.cancel();
  }, [keyframes, rangeStart, rangeEnd]);
  return ref;
}

// usage
const RISE: Keyframe[] = [{ opacity: 0, transform: "translateY(2rem)" }, { opacity: 1, transform: "none" }];
export function Feature({ children }: { children: React.ReactNode }) {
  const ref = useViewTimeline<HTMLDivElement>(RISE, { rangeStart: "entry 0%", rangeEnd: "cover 30%" });
  return <div ref={ref}>{children}</div>;
}
```
**Tune:** `rangeStart`/`rangeEnd` accept the same strings as `animation-range` (`"entry 25%"`, `"cover 50%"`, `"contain 0%"`). The subject and the animated element can differ: track a section, animate a fixed element elsewhere.  
**A11y/perf:** the animation is compositor-driven like its CSS twin; `animation.cancel()` on unmount prevents leaks across route changes. TS: the local constructor types avoid depending on whether your `lib.dom` version already declares `ScrollTimeline`/`ViewTimeline`.

### 21. Motion scroll() / useScroll
**Looks like:** any scroll-linked effect where you also want JS values (a counter, a canvas uniform, a React state) or Motion's springs.  
**Use when / avoid when:** the project already uses Motion (`motion` 13.x). Motion hands `animate()` animations to the native `ScrollTimeline` when the browser supports it (hardware accelerated, no scroll measurements) and falls back to JS measurement elsewhere, so it also covers Firefox today. Avoid pulling Motion in just for a progress bar.  
**Stack:** Motion
```ts
// vanilla (motion)
import { animate, scroll } from "motion";

const bar = document.querySelector<HTMLElement>(".read-progress");
const stopBar = bar
  ? scroll(animate(bar, { transform: ["scaleX(0)", "scaleX(1)"] }, { ease: "linear" }))
  : () => {};

const hero = document.querySelector<HTMLElement>(".hero");
const stopProgress = scroll(
  (progress: number) => { document.documentElement.style.setProperty("--hero-progress", String(progress)); },
  { target: hero ?? undefined, offset: ["start start", "end start"] }
);
// cleanup on teardown: stopBar(); stopProgress();
```
```tsx
// React (motion/react)
"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <div ref={ref} style={{ position: "relative", overflow: "clip", aspectRatio: "16 / 10", borderRadius: "1rem" }}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y: reduce ? 0 : y, scale: 1.25, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
```
**Tune:** offsets are `"<target edge> <container edge>"` pairs (`start`/`center`/`end` or 0-1 / px / %); `["start end", "end start"]` = the full passage (like `cover`), `["start start", "end end"]` (default) = while the target scrolls through.  
**A11y/perf:** `useReducedMotion()` to freeze; Motion cleans up on unmount. For springy scroll values wrap with `useSpring(scrollYProgress, { stiffness: 120, damping: 30 })`, but note springs are JS-driven (main thread).

### 22. IntersectionObserver fallback (class toggle + CSS transition)
**Looks like:** the standard premium reveal: elements fade/rise once, time-based, as they enter; works in every engine including Firefox before 159.  
**Use when / avoid when:** the universal default for text/UI reveals, and the fallback for recipes 5, 14, 18. Do not tag above-the-fold content (it would flash hidden then fade on hydration): use an intro animation or `@starting-style` there.  
**Stack:** CSS + ~30 lines TS
```css
:root { --dur-reveal: 700ms; --ease-out-expo: cubic-bezier(.16, 1, .3, 1); --reveal-distance: 1.75rem; --stagger: 70ms; }

/* JS adds .io-reveal to <html> only when it is going to run: no-JS and failed-JS users see everything */
html.io-reveal [data-reveal] {
  opacity: 0;
  translate: 0 var(--reveal-distance);
  transition:
    opacity var(--dur-reveal) var(--ease-out-expo),
    translate var(--dur-reveal) var(--ease-out-expo);
  transition-delay: calc(var(--i, 0) * var(--stagger));
}
html.io-reveal [data-reveal].is-in { opacity: 1; translate: 0 0; }
```
```ts
// lib/reveal-fallback.ts
export function initRevealFallback(root: ParentNode = document): () => void {
  if (typeof window === "undefined") return () => {};
  if (CSS.supports("timeline-trigger-name: --t")) return () => {};           // native path (recipe 18) handles it
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  if (!("IntersectionObserver" in window)) return () => {};
  const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
  if (targets.length === 0) return () => {};

  document.documentElement.classList.add("io-reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);                                          // one-shot
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
  );
  targets.forEach((t) => io.observe(t));
  return () => io.disconnect();
}
```
```tsx
// components/RevealFallback.tsx - mount once in app/layout.tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initRevealFallback } from "@/lib/reveal-fallback";

export function RevealFallback() {
  const pathname = usePathname();                  // re-scan after client-side navigations
  useEffect(() => initRevealFallback(), [pathname]);
  return null;
}
```
**Tune:** distance 1-2.5rem; duration 500-900ms; stagger 50-90ms (cap at ~6 items, then batch); threshold .1-.25.  
**A11y/perf:** reduced motion returns early, so nothing is hidden. Only opacity/translate transition. Scrubbed-vs-triggered taste rule: triggered for reading content, scrubbed for spatial/ornamental motion.

### 23. The scroll-timeline polyfill: when (not) to use it
**Looks like:** `flackr/scroll-timeline` makes `animation-timeline`, `view-timeline`, `animation-range`, and JS `ScrollTimeline`/`ViewTimeline` work in engines without support by re-parsing your CSS and driving WAAPI from JS.  
**Use when / avoid when:** almost never for decoration in 2026. Firefox gets native support in 159 (planned 2026-10-27); until then static/IO fallbacks are better UX than a main-thread emulation. Consider it only for a scroll-driven effect that is essential to understanding content and must work in Firefox now.  
**Stack:** JS
```html
<!-- load only where needed -->
<script>
  if (!CSS.supports("animation-timeline: scroll()")) {
    const s = document.createElement("script");
    s.src = "https://flackr.github.io/scroll-timeline/dist/scroll-timeline.js";
    s.async = true;
    document.head.appendChild(s);
  }
</script>
```
**Tune:** nothing to tune; it is all or nothing.  
**A11y/perf:** trade-offs: runs on the main thread (no compositor smoothness, jank under load); only understands CSS it can fetch and parse (same-origin stylesheets or inline `<style>`; CSS-in-JS injected later and cross-origin sheets can be missed); last commit Aug 2024 and npm `scroll-timeline-polyfill` 1.1.0 (May 2024), so newer syntax (range keyframes edge cases, `scroll` range, `timeline-scope: all`, triggers) is not covered; ~86 open issues.

### 24. Scroll ergonomics baseline stylesheet
**Looks like:** nothing flashy: anchor jumps land below the fixed header, modals do not scroll the page behind them, no layout shift when scroll locks, tasteful scrollbars, snapping that helps instead of traps.  
**Use when / avoid when:** every site. These details separate "template" from "crafted" (Rauno Freiberg's "invisible details" territory).  
**Stack:** CSS
```css
:root {
  --header-h: 4.5rem;
  --scroll-thumb: color-mix(in oklch, currentColor 35%, transparent);
}
html {
  scroll-padding-top: calc(var(--header-h) + 1rem);   /* #anchor targets and focus scrolling clear the fixed header */
  scrollbar-gutter: stable;                            /* no layout jump when a modal sets overflow:hidden */
  scrollbar-color: var(--scroll-thumb) transparent;    /* thumb track (Baseline since Safari 26.2) */
}
@media (prefers-reduced-motion: no-preference) {
  html:not(.lenis) { scroll-behavior: smooth; }        /* never together with Lenis / ScrollSmoother */
}
h2[id], h3[id] { scroll-margin-top: .5rem; }           /* per-target extra offset on top of scroll-padding */
:target { animation: target-flash 1.2s ease-out 1; }
@keyframes target-flash { from { background-color: color-mix(in oklch, var(--accent, gold) 30%, transparent); } }

/* scroll containment for overlays and inner scrollers */
dialog, .drawer__body, .chat-log, .menu-panel { overscroll-behavior: contain; }
html:has(dialog[open]:modal) { overflow: hidden; }       /* lock page scroll while a modal is open */

/* scrollbars */
.thin-scroll { scrollbar-width: thin; }
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }    /* Safari < 18.2 */

/* snapping */
.chapters-snap { scroll-snap-type: y proximity; }         /* proximity for page sections: mandatory traps readers */
.chapters-snap > section { scroll-snap-align: start; }
.stories { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.stories > * { flex: 0 0 100%; scroll-snap-align: center; scroll-snap-stop: always; }   /* one per swipe */

/* live feeds: stop the reader's position jumping when content loads above; opt out loaders */
.feed__loader { overflow-anchor: none; }
```
```ts
// scrollend (Baseline Dec 2025): run work after a smooth scroll or fling settles
const rail = document.querySelector<HTMLElement>(".snap-rail");
const onEnd = () => rail?.dispatchEvent(new CustomEvent("rail:settled"));
rail?.addEventListener("scrollend", onEnd);
// Chromium 129+ also fires scrollsnapchange / scrollsnapchanging with event.snapTargetInline / snapTargetBlock
```
| Property / API | Solves | Support |
|---|---|---|
| `scroll-behavior: smooth` | smooth anchor jumps without JS | widely |
| `scroll-padding-*` / `scroll-margin-*` | fixed-header offsets, snap alignment offsets | widely (S14.1) |
| `overscroll-behavior: contain` | modal/drawer/chat scroll chaining, pull-to-refresh | C63 F59 S16 on scrollable boxes; on non-scrollable overflow boxes C144 F150 |
| `scrollbar-gutter: stable` | layout shift when scrollbars appear/disappear | newly (S18.2) |
| `scrollbar-width` / `scrollbar-color` | standard scrollbar styling | width newly (S18.2), color newly (S26.2) |
| `scroll-snap-type` / `-align` / `-stop` | carousels, stories, section snapping | widely (stop: S15, F103) |
| `overflow-anchor` | scroll anchoring for content inserted above | C56 F66 S27 |
| `scrollend` event | "scroll finished" without debounce | newly (C114 F109 S26.2) |
| `interactivity: inert` | CSS-driven inertness (off-screen slides) | Chrome 135 only |
| `scroll-initial-target: nearest` | start a scroller at a given item | Chrome 133 only |

**Tune:** `scroll-padding-top` = header height + 0.5-1rem; thin scrollbars on inner scrollers only, never hide the main page scrollbar.  
**A11y/perf:** smooth scrolling off under reduced motion; hidden scrollbars need another affordance (fade edge, arrows, peeking next slide).

### 25. Native CSS vs GSAP: who owns what
| Effect | Native CSS owns it when... | GSAP ScrollTrigger owns it when... |
|---|---|---|
| Reading progress, rotating ornaments, parallax, image zoom, hero recede | always: compositor-threaded, zero JS, survives main-thread jank | never needed |
| Reveals | triggered (IO/`timeline-trigger`) or light scrubbed | the reveal is a multi-step timeline (SplitText lines + mask + counters) |
| Pinned horizontal section | simple strip, no snapping, no per-panel choreography | you need `snap`, `containerAnimation` for per-panel tweens, progress callbacks, or exact pin spacing |
| Stacking cards | uniform cards, scale/dim only | cards with internal sequenced animations or variable heights |
| Scroll-state styling (stuck, snapped, direction) | Chromium-only enhancement is acceptable | must work identically in Firefox/Safari today |
| Callbacks (`onEnter`, analytics, video play/pause) | never (CSS has no callbacks; use IO / `scrollend`) | always, or plain IO |
| Smooth scroll | native `scroll-behavior` for anchor jumps only | Lenis (`lenis` 1.3.x) for inertia; see `scroll-gsap.md` |

Compatibility: Lenis drives the real document scroll position, so native scroll/view timelines, `position: sticky`, and scroll-state queries keep working with it. GSAP ScrollSmoother translates a content wrapper instead: layout positions no longer match visual positions, so do not mix it with native `view()` timelines. Mixing native SDA for ornaments with ScrollTrigger for the pinned hero is fine and common.

## Gotchas
- **`animation` shorthand resets `animation-timeline`.** Always declare `animation-timeline` (and `animation-range`) AFTER the shorthand. Chromium partially folds `animation-timeline` into the shorthand; Safari/Firefox do not, so the order rule is the only portable one.
- **`overflow: hidden` on an ancestor hijacks `view()`/`scroll(nearest)`.** It creates a scroll container, so progress is measured against a box that never scrolls (animation frozen at 0%). Use `overflow: clip` for visual clipping.
- **Absolutely/fixed positioned subjects skip scrollers.** `scroll(nearest)` walks the containing-block chain, so an `position: absolute` progress bar inside a non-positioned scroller will not find it. Use a named `scroll-timeline` on the scroller + `timeline-scope`.
- **Unreachable ranges at the end of the page.** An element near the footer may never reach `cover 50%` or `exit 0%`, leaving it half-revealed forever. Use `entry`-based ranges there, or add bottom padding.
- **Sticky subjects stall.** A `position: sticky` element's view progress stops while it is stuck. Track its parent section (named `view-timeline`) instead.
- **Durations and delays in seconds do nothing useful** on scroll timelines. Use `animation-range` offsets for stagger; keep easing `linear` and shape motion with keyframe percentages or per-keyframe `animation-timing-function`.
- **Two animations on the same property override** (hero intro + hero scroll fade on `opacity`). Split across wrapper/inner elements.
- **Hidden-by-default content.** Any `opacity: 0` outside `@supports` + reduced-motion guards becomes invisible content in Firefox 156-158 and for reduced-motion users. Put initial states inside keyframes with `fill: both`.
- **Mobile viewport jumps.** `vh`-based section heights change as the iOS/Android URL bar collapses, shifting ranges mid-scroll. Use `svh` for pinned heights, `lvh` for full-bleed backgrounds.
- **Named timeline collisions.** Under the new spec, timeline names are global (last defined wins). Scope per component with `timeline-scope`, and for triggers with `trigger-scope`.
- **Fixed-position pseudo layers break** under transformed/filtered/contained ancestors or `content-visibility: auto` (recipe 14).
- **Safari before 26.4 ran SDA on the main thread.** Heavy pages on iOS 26.0-26.3 can lag; keep effects transform/opacity and few in number.
- **Printing freezes mid-animation.** Add `@media print { *, *::before, *::after { animation: none !important; } }`.
- **Scrubbed text reveals feel cheap.** Users who stop scrolling see half-faded copy. Use triggered reveals for reading content.
- **`scroll-behavior: smooth` + Lenis/ScrollSmoother** double-smooths and breaks programmatic scrolls; remove it when a smooth-scroll library is active.
- **scroll-state queries style descendants only.** Putting the changing styles on the container itself silently does nothing.
- **`::scroll-button()` needs `content`** (not `none`) to render; give an alt text after `/` for an accessible name.

## Sources
- https://developer.chrome.com/docs/css-ui/scroll-driven-animations (Bramus, scroll()/view(), ranges, JS API, timeline-scope)
- https://drafts.csswg.org/scroll-animations-1/ (global timeline names, `timeline-scope: all`, changes list)
- https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/
- https://webkit.org/blog/17862/webkit-features-for-safari-26-4/ (threaded scroll-driven animations)
- https://webkit.org/blog/18325/webkit-features-for-safari-27-0/ (scroll anchoring, overflow-anchor)
- http://www.mail-archive.com/dev-platform@mozilla.org/msg01905.html (Firefox Intent to Ship SDA in Fx 159, 2026-09-25)
- https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features
- https://github.com/mdn/browser-compat-data (v8.1.3, 2026-09-24) and https://api.webstatus.dev/v1/features/scroll-driven-animations
- https://developer.chrome.com/blog/scroll-triggered-animations ; https://css-tricks.com/css-scroll-triggered-animations-first-look/ ; https://www.bram.us/2025/12/12/css-scroll-triggered-animations-are-coming-to-chrome/
- https://developer.chrome.com/blog/css-scroll-state-queries ; https://una.im/scroll-state-scrolled
- https://developer.chrome.com/blog/carousels-with-css
- https://una.im/scroll-target-group ; https://www.sarasoueidan.com/blog/css-scrollspy/
- https://scroll-driven-animations.style/ (demos: stacking cards, cover flow, progress, range visualizer)
- https://motion.dev/docs/scroll
- https://github.com/flackr/scroll-timeline (maintenance data via GitHub API)
- https://chromestatus.com (timeline-scope `all`, timeline naming conflict resolution, trigger-scope, `scroll` named range)

## Support matrix
Verified 2026-09-26 against MDN BCD 8.1.3 + webstatus.dev. C = Chrome/Edge, F = Firefox, S = Safari (macOS and iOS unless noted).

| Feature | C | F | S | Baseline | Fallback |
|---|---|---|---|---|---|
| `animation-timeline: scroll()/view()`, `animation-range`, named `scroll-/view-timeline` | 115 | Nightly only; 159 planned (2026-10-27) | 26.0 | Limited | static end state / IO ([22](#22-intersectionobserver-fallback-class-toggle--css-transition)) |
| `timeline-scope` | 116 | Nightly | 26.0 | Limited | avoid cross-tree; JS |
| Range keyframes (`entry 0% {}`) | 115 | Nightly | 26.0 | Limited | two animations + `animation-range` list |
| `scroll` named range | 147 | Nightly | 26.5 | Limited | `scroll(root)` timeline |
| JS `ScrollTimeline` / `ViewTimeline` | 115 | Nightly | 26.0 | Limited | Motion `scroll()` or IO |
| `timeline-trigger` / `animation-trigger` / `trigger-scope` | 146 | no | no | Limited | IO class toggle |
| `::scroll-button()` / `::scroll-marker` / `scroll-marker-group` / `:target-current` | 135 | no | no | Limited | plain snap rail + JS buttons |
| `scroll-target-group` | 140 | no | no | Limited | IO scroll-spy |
| `scroll-initial-target` | 133 | no | no | Limited | `scrollIntoView` on mount |
| `@container scroll-state(stuck/snapped/scrollable)` | 133 | no | no | Limited | static styles / IO |
| `scroll-state(scrolled)` | 144 | no | no | Limited | scroll-direction JS |
| `interactivity: inert` | 135 | no | no | Limited | `inert` attribute via JS |
| `scrollsnapchange` / `scrollsnapchanging` | 129 | no | no | Limited | `scrollend` + measure |
| `scrollend` event | 114 | 109 | 26.2 | Newly (2025-12) | debounce `scroll` |
| `scroll-snap-*`, `scroll-padding`, `scroll-margin` | 69 | 68 | 11 / 14.1 | Widely | n/a |
| `scroll-snap-stop` | 75 | 103 | 15 | Widely | n/a |
| `scroll-behavior` | 61 | 36 | 15.4 | Widely | n/a |
| `overscroll-behavior` (scrollable boxes) | 63 | 59 | 16 | Widely in practice (webstatus lists newer non-scrollable behaviour as Limited: C144, F150) | `overflow: hidden` lock |
| `scrollbar-gutter` | 94 | 97 | 18.2 | Newly (2024-12) | none needed |
| `scrollbar-width` | 121 | 64 | 18.2 | Newly (2024-12) | `::-webkit-scrollbar` |
| `scrollbar-color` | 121 | 64 | 26.2 | Newly (2025-12) | `::-webkit-scrollbar-thumb` |
| `overflow-anchor` | 56 | 66 | 27 | Limited (Safari just shipped) | none needed |
| `overflow: clip` | 90 | 81 | 16 | Widely | `overflow: hidden` (beware view()) |
| `sibling-index()` (range stagger) | 138 | 154 | 26.2 | Newly (2026-08) | inline `--i` |
