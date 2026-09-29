# Layout and Composition
> Load when: structuring a page or section - grids, containers, fluid spacing/type scales, hero layouts, bento grids, section patterns (features, logos, testimonials, pricing, FAQ, CTA, footer, project index), sticky/overlapping/horizontal compositions, navigation layouts, responsive strategy, visual hierarchy and optical alignment.
> Stack assumptions: Tailwind CSS 4.3 + plain CSS (grid, subgrid, container queries, `clamp()`), React 19 / Next 16 App Router + TS where behavior needs JS. Skeletons are HTML + CSS so they port to any framework; motion is out of scope here (see `scroll-gsap.md`, `scroll-css-native.md`, `interactions.md`).

## Contents
- [Decision guide](#decision-guide)
- [1. Page shell: the breakout grid](#1-page-shell-the-breakout-grid)
- [2. 12-column grid, editorial asymmetry, subgrid](#2-12-column-grid-editorial-asymmetry-subgrid)
- [3. Fluid type and space scales (Utopia)](#3-fluid-type-and-space-scales-utopia)
- [4. Vertical rhythm, section spacing hierarchy, density dial](#4-vertical-rhythm-section-spacing-hierarchy-density-dial)
- [5. Layout primitives (Every Layout)](#5-layout-primitives-every-layout)
- [6. Hero paradigms (10 skeletons)](#6-hero-paradigms-10-skeletons)
- [7. Bento grids done right](#7-bento-grids-done-right)
- [8. Feature sections that are not three identical cards](#8-feature-sections-that-are-not-three-identical-cards)
- [9. Social proof: logos band, testimonials, stats row](#9-social-proof-logos-band-testimonials-stats-row)
- [10. Conversion sections: pricing, FAQ, CTA](#10-conversion-sections-pricing-faq-cta)
- [11. Project index list with hover preview](#11-project-index-list-with-hover-preview)
- [12. About section and footer with giant wordmark](#12-about-section-and-footer-with-giant-wordmark)
- [13. Sticky compositions](#13-sticky-compositions)
- [14. Overlapping and broken-grid layouts](#14-overlapping-and-broken-grid-layouts)
- [15. Horizontal galleries with scroll-snap](#15-horizontal-galleries-with-scroll-snap)
- [16. Navigation layouts](#16-navigation-layouts)
- [17. Responsive strategy](#17-responsive-strategy)
- [18. Visual hierarchy and whitespace](#18-visual-hierarchy-and-whitespace)
- [19. Alignment and optical adjustments](#19-alignment-and-optical-adjustments)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide

| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| Readable article with full-bleed images and wide figures | Breakout grid with named lines | CSS | [1](#1-page-shell-the-breakout-grid) |
| Magazine / agency asymmetry | 12 named columns, offset spans, empty columns as whitespace | CSS | [2](#2-12-column-grid-editorial-asymmetry-subgrid) |
| Card rows whose titles/buttons line up | `grid-template-rows: subgrid` | CSS | [2](#2-12-column-grid-editorial-asymmetry-subgrid) |
| Type and spacing that scale smoothly 360 -> 1440+ | Utopia `clamp()` tokens in `@theme` | CSS | [3](#3-fluid-type-and-space-scales-utopia) |
| Page feels either cramped or empty | Section spacing hierarchy + `--density` | CSS | [4](#4-vertical-rhythm-section-spacing-hierarchy-density-dial) |
| Components that work without breakpoints | Stack / Cluster / Sidebar / Switcher / Cover / RAM grid | CSS | [5](#5-layout-primitives-every-layout) |
| First screen that is not the generic centered hero | One of 10 hero skeletons | CSS | [6](#6-hero-paradigms-10-skeletons) |
| Many features/facts in one glance | Bento with one dominant cell | CSS | [7](#7-bento-grids-done-right) |
| Features section with hierarchy | Sticky list + swapping media, editorial rows, numbered list | CSS (+ tiny JS) | [8](#8-feature-sections-that-are-not-three-identical-cards) |
| Logos that look equally weighted | Area-normalized logo sizing with `sqrt()` | CSS | [9](#9-social-proof-logos-band-testimonials-stats-row) |
| Portfolio work list | Index rows + preview swapped with `:has()` | CSS | [11](#11-project-index-list-with-hover-preview) |
| Memorable ending | Footer with container-sized wordmark | CSS | [12](#12-about-section-and-footer-with-giant-wordmark) |
| Text scrolls while media holds | `position: sticky` split | CSS | [13](#13-sticky-compositions) |
| Collage / layered editorial | Same-cell grid overlap + z-index | CSS | [14](#14-overlapping-and-broken-grid-layouts) |
| Swipeable row of cards / work | Scroll-snap reel aligned to the content edge | CSS | [15](#15-horizontal-galleries-with-scroll-snap) |
| Pinned horizontal scroll driven by vertical scroll | GSAP pin (not here) | JS | `scroll-gsap.md` |
| Nav that gets out of the way | Floating pill, hide-on-scroll, fullscreen menu | CSS + 1 kb JS | [16](#16-navigation-layouts) |
| Works on notch phones, landscape, 4K | Container queries, `svh`, safe areas, width caps | CSS | [17](#17-responsive-strategy) |
| "Something feels off" | Hierarchy audit + optical fixes | CSS | [18](#18-visual-hierarchy-and-whitespace), [19](#19-alignment-and-optical-adjustments) |

Support facts used below (checked 2026-09): subgrid, container size queries, `:has()`, `svh/dvh/lvh`, `clamp()`, `sqrt()`, `<details name>` exclusive accordions are Baseline. `text-box` (trim) is Baseline newly available (Chrome 133, Safari 18.2, Firefox 154 in Aug 2026). CSS masonry `display: grid-lanes` ships only in Safari 26.4+ (Chrome/Firefox behind flags) so use it as progressive enhancement. `hanging-punctuation` is Safari only. From Chrome 145, `100vw` excludes the vertical scrollbar when the root has `scrollbar-gutter: stable` (or `overflow-y: scroll`).

## Recipes

### 1. Page shell: the breakout grid
**Looks like:** A text column at a comfortable measure, with some elements breaking out a little (code, pull quotes), some a lot (figures), and some edge to edge (full-bleed media, colored bands), all aligned to the same center without wrapper divs (Ryan Mulligan's "Layout Breakouts", Josh W. Comeau's full-bleed grid).  
**Use when / avoid when:** Default shell for content pages, case studies, blogs, long landing pages. Avoid the `max-w-7xl mx-auto` wrapper-per-section habit: it makes full-bleed children impossible without negative-margin hacks.  
**Stack:** CSS (+ Tailwind usage)
```css
/* app/layout-shell.css */
.shell {
  --gap: clamp(1rem, 6vw, 3rem);          /* minimum side gutter */
  --content: min(65ch, 100% - var(--gap) * 2);
  --popout: minmax(0, 2rem);
  --feature: minmax(0, 6rem);
  --wide: minmax(0, 14rem);
  --full: minmax(var(--gap), 1fr);

  display: grid;
  grid-template-columns:
    [full-start] var(--full)
    [wide-start] var(--wide)
    [feature-start] var(--feature)
    [popout-start] var(--popout)
    [content-start] var(--content) [content-end]
    var(--popout) [popout-end]
    var(--feature) [feature-end]
    var(--wide) [wide-end]
    var(--full) [full-end];
}
.shell > * { grid-column: content; }
.shell > .popout { grid-column: popout; }
.shell > .feature { grid-column: feature; }
.shell > .wide { grid-column: wide; }
.shell > .full { grid-column: full; }

/* Full-bleed band whose own content re-aligns to the content column */
.shell > .band {
  grid-column: full;
  display: grid;
  grid-template-columns: inherit; /* same tracks, so children can use the same line names */
}
.shell > .band > * { grid-column: content; }
```
```css
/* app/globals.css (excerpt) - Tailwind 4: expose as utilities via @utility */
@utility shell { display: grid; grid-template-columns: [full-start] minmax(clamp(1rem, 6vw, 3rem), 1fr) [wide-start] minmax(0, 14rem) [feature-start] minmax(0, 6rem) [popout-start] minmax(0, 2rem) [content-start] min(65ch, 100% - clamp(1rem, 6vw, 3rem) * 2) [content-end] minmax(0, 2rem) [popout-end] minmax(0, 6rem) [feature-end] minmax(0, 14rem) [wide-end] minmax(clamp(1rem, 6vw, 3rem), 1fr) [full-end]; }
@utility col-content { grid-column: content; }
@utility col-feature { grid-column: feature; }
@utility col-wide { grid-column: wide; }
@utility col-full { grid-column: full; }
```
```html
<article class="shell">
  <h1>Designing the Atlas design system</h1>
  <p>Body copy sits at 65ch...</p>
  <blockquote class="popout">A pull quote nudges out.</blockquote>
  <figure class="feature"><img src="/atlas/flows.png" alt="User flows" /></figure>
  <figure class="full"><video src="/atlas/reel.mp4" muted autoplay loop playsinline></video></figure>
  <section class="band" style="background: var(--surface-2)"><h2>Results</h2><p>Aligned to content.</p></section>
</article>
```
**Tune:** measure 60-72ch for body (45ch for large lead text, 80ch max for docs); popout 1.5-3rem, feature 4-8rem, wide 10-16rem. On a 1440 viewport with 65ch content (~640px at 18px) the named zones land at roughly 700 / 900 / 1180 / full.  
**A11y/perf:** Pure CSS. `grid-template-columns: inherit` only works on direct children of the grid; for deeper nesting use `subgrid` (`grid-template-columns: subgrid`) which also inherits line names.

### 2. 12-column grid, editorial asymmetry, subgrid
**Looks like:** Agency/editorial pages where headline, body and image start on different columns, with deliberate empty columns (Pentagram, Collins, many Awwwards SOTD layouts); card rows where every title, body and CTA line up despite uneven copy.  
**Use when / avoid when:** Marketing sites, portfolios, case studies. The slop tell is everything centered at `max-w-3xl mx-auto`. Asymmetry needs a system: pick 2-3 recurring spans (e.g. heading 1-5, body 7-12, image 3-12) and reuse them.  
**Stack:** CSS
```css
/* app/grid-12.css */
.g12 {
  --margin: clamp(1rem, 4vw, 4rem);
  --gutter: clamp(1rem, 2vw, 1.5rem);
  display: grid;
  grid-template-columns: repeat(12, [col-start] minmax(0, 1fr) [col-end]);
  column-gap: var(--gutter);
  padding-inline: var(--margin);
  max-inline-size: 110rem;
  margin-inline: auto;
}
/* Named lines: "col-start 3" = the 3rd col-start line. Spans read like a design spec. */
.g12 > .kicker   { grid-column: col-start 1 / span 2; }
.g12 > .headline { grid-column: col-start 3 / col-end 10; }
.g12 > .lead     { grid-column: col-start 7 / col-end 12; }
.g12 > .image    { grid-column: col-start 1 / col-end 8; }
.g12 > .caption  { grid-column: col-start 9 / col-end 11; align-self: end; }

@media (max-width: 48rem) {
  .g12 { grid-template-columns: repeat(4, [col-start] minmax(0, 1fr) [col-end]); }
  .g12 > * { grid-column: 1 / -1; }
  .g12 > .caption { grid-column: col-start 2 / col-end 4; } /* keep one asymmetric beat on mobile */
}

/* Asymmetric two-column splits (use instead of 50/50) */
.split-5-7 { display: grid; grid-template-columns: 5fr 7fr; gap: var(--gutter, 1.5rem); }
.split-golden { display: grid; grid-template-columns: 1fr 1.618fr; gap: var(--gutter, 1.5rem); }
.split-offset { display: grid; grid-template-columns: 1fr min(60ch, 100%) 2fr; } /* text sits left of center */
.split-offset > * { grid-column: 2; }

/* Subgrid cards: title, body, meta and CTA rows align across the row */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
  gap: 1.5rem;
}
.cards > .card {
  display: grid;
  grid-row: span 4;             /* number of internal rows */
  grid-template-rows: subgrid;  /* rows come from the parent: siblings share heights */
  row-gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
}
.cards .card > .card-cta { align-self: end; }
```
```html
<section class="g12">
  <p class="kicker">Case study 03</p>
  <h2 class="headline">A banking app that feels like a conversation</h2>
  <p class="lead">We rebuilt onboarding around one question at a time...</p>
  <img class="image" src="/work/bank.jpg" alt="Onboarding screens" />
  <p class="caption">Fig. 2: the new first-run flow.</p>
</section>
```
**Tune:** gutter 16-32px; outer margin 16px mobile to 64-96px desktop; limit asymmetric offsets to 1-3 columns (more reads as broken). Subgrid `span N` must equal the number of child rows.  
**A11y/perf:** Visual order must match DOM order for keyboard and screen readers; never use `order`/`grid-row` to move a CTA above its heading visually.

### 3. Fluid type and space scales (Utopia)
**Looks like:** Headings and spacing that grow smoothly with the viewport, no breakpoint jumps; mobile gets tight, readable proportions and desktop gets drama, from one token set.  
**Use when / avoid when:** Every site. Formula (Utopia): `slope = (maxSize - minSize) / (maxVw - minVw)`, `intercept = minSize - slope * minVw`, `size = clamp(min, intercept(rem) + slope*100 vw, max)`. Avoid pure `vw` font sizes (`font-size: 5vw`): they do not respond to browser zoom and fail WCAG 1.4.4.  
**Stack:** CSS tokens + Tailwind `@theme`
```css
/* app/fluid-tokens.css
   Utopia: 360px @ 18px base, ratio 1.2  ->  1240px @ 20px base, ratio 1.25
   Space values are Utopia's generated output; type steps computed with the same formula. */
:root {
  --step--2: clamp(0.7813rem, 0.7736rem + 0.0341vw, 0.8rem);
  --step--1: clamp(0.9375rem, 0.9119rem + 0.1136vw, 1rem);
  --step-0: clamp(1.125rem, 1.0739rem + 0.2273vw, 1.25rem);
  --step-1: clamp(1.35rem, 1.2631rem + 0.3864vw, 1.5625rem);
  --step-2: clamp(1.62rem, 1.4837rem + 0.6057vw, 1.9531rem);
  --step-3: clamp(1.944rem, 1.7405rem + 0.9044vw, 2.4414rem);
  --step-4: clamp(2.3328rem, 2.0387rem + 1.3072vw, 3.0518rem);
  --step-5: clamp(2.7994rem, 2.384rem + 1.8461vw, 3.8147rem);
  /* display sizes for heroes (360 -> 1440): 44px -> 144px, 64px -> 240px */
  --step-display: clamp(2.75rem, 0.6667rem + 9.2593vw, 9rem);
  --step-mega: clamp(4rem, 0.3333rem + 16.2963vw, 15rem);

  --space-3xs: clamp(0.3125rem, 0.3125rem + 0vw, 0.3125rem);
  --space-2xs: clamp(0.5625rem, 0.5369rem + 0.1136vw, 0.625rem);
  --space-xs: clamp(0.875rem, 0.8494rem + 0.1136vw, 0.9375rem);
  --space-s: clamp(1.125rem, 1.0739rem + 0.2273vw, 1.25rem);
  --space-m: clamp(1.6875rem, 1.6108rem + 0.3409vw, 1.875rem);
  --space-l: clamp(2.25rem, 2.1477rem + 0.4545vw, 2.5rem);
  --space-xl: clamp(3.375rem, 3.2216rem + 0.6818vw, 3.75rem);
  --space-2xl: clamp(4.5rem, 4.2955rem + 0.9091vw, 5rem);
  --space-3xl: clamp(6.75rem, 6.4432rem + 1.3636vw, 7.5rem);
  /* one-up pairs: grow MORE than a single step (small on mobile, big on desktop) */
  --space-s-m: clamp(1.125rem, 0.8182rem + 1.3636vw, 1.875rem);
  --space-m-l: clamp(1.6875rem, 1.3551rem + 1.4773vw, 2.5rem);
  --space-l-xl: clamp(2.25rem, 1.6364rem + 2.7273vw, 3.75rem);
  --space-xl-2xl: clamp(3.375rem, 2.7102rem + 2.9545vw, 5rem);
  --space-2xl-3xl: clamp(4.5rem, 3.2727rem + 5.4545vw, 7.5rem);
  /* section padding (360 -> 1440): 64px -> 160px; page gutter 16px -> 48px */
  --space-section: clamp(4rem, 2rem + 8.8889vw, 10rem);
  --gutter: clamp(1rem, 0.3333rem + 2.963vw, 3rem);
}
```
```css
/* app/globals.css (excerpt) - Tailwind utilities: text-step-3, p-s-m, gap-l, py-section ... */
@theme inline {
  --text-step--1: var(--step--1);
  --text-step-0: var(--step-0);
  --text-step-1: var(--step-1);
  --text-step-2: var(--step-2);
  --text-step-3: var(--step-3);
  --text-step-4: var(--step-4);
  --text-step-5: var(--step-5);
  --text-display: var(--step-display);
  --text-display--line-height: 0.92;
  --text-mega: var(--step-mega);
  --text-mega--line-height: 0.85;
  --spacing-2xs: var(--space-2xs);
  --spacing-xs: var(--space-xs);
  --spacing-s: var(--space-s);
  --spacing-m: var(--space-m);
  --spacing-l: var(--space-l);
  --spacing-xl: var(--space-xl);
  --spacing-2xl: var(--space-2xl);
  --spacing-3xl: var(--space-3xl);
  --spacing-s-m: var(--space-s-m);
  --spacing-l-xl: var(--space-l-xl);
  --spacing-section: var(--space-section);
  --spacing-gutter: var(--gutter);
}
```
```ts
// lib/fluid.ts - generate your own clamp() (same math as utopia.fyi)
export function fluid(minPx: number, maxPx: number, minVw = 360, maxVw = 1240): string {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const intercept = minPx - slope * minVw;
  const r = (v: number) => Number(v.toFixed(4));
  return `clamp(${r(minPx / 16)}rem, ${r(intercept / 16)}rem + ${r(slope * 100)}vw, ${r(maxPx / 16)}rem)`;
}
// fluid(64, 160, 360, 1440) === "clamp(4rem, 2rem + 8.8889vw, 10rem)"
```
**Tune:** body ratio 1.2 mobile -> 1.25-1.333 desktop (editorial: 1.333 -> 1.5); keep `max/min <= 2.5` for any text people must read (zoom still scales it); display sizes may exceed that but must keep a rem term. Heroes on short laptops: also cap by height, e.g. `font-size: min(var(--step-mega), 22svh)`.  
**A11y/perf:** Zero runtime. Test at 200% browser zoom and with a 20px default font size: `rem` in the intercept is what keeps it accessible. Pair with `text-wrap: balance` on headings (see `typography.md`).

### 4. Vertical rhythm, section spacing hierarchy, density dial
**Looks like:** Clear grouping: things that belong together are close, groups are separated, sections breathe. The page reads as "chapters", not an evenly spaced list of blocks.  
**Use when / avoid when:** Always. Hierarchy rule: element gap < group gap < section gap, each roughly 2-3x the previous (e.g. 8 / 24 / 96-160px). Evenly spaced everything (every margin 32px) is the most common "template" feel. Internal padding of a container should be less than or equal to the space around it.  
**Stack:** CSS
```css
/* app/rhythm.css */
:root {
  --density: 1; /* 0.75 compact (dashboards), 1 default, 1.25 airy (luxury, editorial) */
  --gap-element: calc(var(--space-2xs) * var(--density));   /* label <-> input, title <-> meta */
  --gap-group: calc(var(--space-m) * var(--density));       /* heading block <-> body, card <-> card */
  --gap-block: calc(var(--space-xl-2xl) * var(--density));  /* sub-sections inside a section */
  --gap-section: calc(var(--space-section) * var(--density));
}
[data-density="compact"] { --density: 0.75; }
[data-density="airy"] { --density: 1.25; }

/* Flow: owl selector spacing, overridable per element */
.flow > * + * { margin-block-start: var(--flow-space, 1em); }
.flow > :is(h2, h3) { --flow-space: 1.8em; }        /* more space ABOVE a heading than below */
.flow > :is(h2, h3) + * { --flow-space: 0.6em; }    /* heading binds to what follows */

/* Sections */
.section { padding-block: var(--gap-section); }
.section--tight { padding-block: calc(var(--gap-section) * 0.5); }
.section + .section--same-bg { padding-block-start: 0; } /* avoid double padding between same-colored sections */

/* Section header: eyebrow + title + lead, grouped tightly, separated from content by a group gap */
.section-head { display: grid; gap: var(--gap-element); margin-block-end: var(--gap-block); max-inline-size: 48rem; }
```
**Tune:** section padding 64-96px mobile, 120-200px desktop (luxury/editorial up to 240px); heading margin-top 1.5-2x its margin-bottom; density 0.75 for data-heavy apps, 1.25 for portfolios.  
**A11y/perf:** Spacing expressed in `em` inside prose scales with user font size; keep it that way.

### 5. Layout primitives (Every Layout)
**Looks like:** Components that adapt intrinsically: a sidebar that wraps under content when space runs out, button groups that wrap cleanly, card grids without breakpoints, a hero that centers its main element in the viewport.  
**Use when / avoid when:** Building blocks for everything else; they remove most media queries. Use container queries (recipe 17) when a component must change structure, not just wrap.  
**Stack:** CSS (patterns from every-layout.dev)
```css
/* app/primitives.css */

/* Stack: vertical flow with one spacing value */
.stack { display: flex; flex-direction: column; justify-content: flex-start; }
.stack > * { margin-block: 0; }
.stack > * + * { margin-block-start: var(--stack-space, var(--space-s)); }

/* Cluster: wrapping inline group (tags, buttons, nav links, meta rows) */
.cluster { display: flex; flex-wrap: wrap; gap: var(--cluster-space, var(--space-xs)); align-items: center; justify-content: flex-start; }

/* Sidebar: side element has an ideal width; content takes the rest; wraps when content < 50% */
.with-sidebar { display: flex; flex-wrap: wrap; gap: var(--space-l); }
.with-sidebar > :first-child { flex-basis: 18rem; flex-grow: 1; }
.with-sidebar > :last-child { flex-basis: 0; flex-grow: 999; min-inline-size: 55%; }

/* Switcher: horizontal until the container is narrower than --threshold, then all stacked (no orphan row) */
.switcher { display: flex; flex-wrap: wrap; gap: var(--space-m); --threshold: 40rem; }
.switcher > * { flex-grow: 1; flex-basis: calc((var(--threshold) - 100%) * 999); }
.switcher > :nth-last-child(n + 5), .switcher > :nth-last-child(n + 5) ~ * { flex-basis: 100%; } /* 5+ items: always stack */

/* RAM grid: as many columns as fit, never overflowing on small screens */
.auto-grid { display: grid; gap: var(--space-m); grid-template-columns: repeat(auto-fit, minmax(min(var(--min, 16rem), 100%), 1fr)); }

/* Cover: min viewport height, principal element vertically centered, header/footer pinned */
.cover { display: flex; flex-direction: column; min-block-size: 100svh; padding: var(--space-m); }
.cover > * { margin-block: var(--space-s); }
.cover > :first-child:not(.cover__main) { margin-block-start: 0; }
.cover > :last-child:not(.cover__main) { margin-block-end: 0; }
.cover > .cover__main { margin-block: auto; }

/* Center: horizontally centered measure with gutters that do not eat the measure */
.center { box-sizing: content-box; max-inline-size: var(--measure, 65ch); margin-inline: auto; padding-inline: var(--gutter); }

/* Frame: fixed aspect media crop */
.frame-media { aspect-ratio: var(--ratio, 16 / 9); overflow: hidden; }
.frame-media > :is(img, video) { inline-size: 100%; block-size: 100%; object-fit: cover; }

/* Reel: horizontal scrolling row (see recipe 15 for snap + alignment) */
.reel { display: flex; gap: var(--space-s); overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-width: thin; }
.reel > * { flex: 0 0 var(--item, 18rem); }
```
**Tune:** Sidebar `min-inline-size` 50-60% (the wrap point); Switcher `--threshold` = the width at which items stop being readable side by side; RAM `--min` 14-20rem for cards.  
**A11y/perf:** All intrinsic, zero JS. The Switcher's `999` multiplier trick flips `flex-basis` from hugely negative (clamped to 0) to hugely positive at the threshold, so there is never an in-between orphan row.

### 6. Hero paradigms (10 skeletons)
**Looks like:** Ten structurally different first screens. Pick by content, not habit: what is the single strongest asset (a sentence, a product, a photo, a body of work)? The hero should be built around it.  
**Use when / avoid when:** The slop hero: centered badge pill + two-line gradient headline + subline + two buttons + a floating screenshot with a purple glow, all at `max-w-4xl`. Every paradigm below can still go generic if the content is generic; the layout only helps when it matches the asset.  
**Stack:** CSS (shared base below; tokens from recipes 3-4, colors from `color-surfaces.md`)

| # | Paradigm | Strongest asset | Seen on | Slop version to avoid |
|---|---|---|---|---|
| 1 | Giant typographic | A short, sharp sentence or name | Designer/dev portfolios, studio sites | Giant text that says nothing ("We build digital experiences") |
| 2 | Split text / media | Product shot or portrait | SaaS, personal sites | 50/50 split with a stock illustration |
| 3 | Full-bleed media + overlay | Film, photography | Apple product pages, hospitality, automotive | Stock drone video + centered white text + 50% black overlay |
| 4 | Product-in-frame | The UI itself | Linear, Vercel, Raycast | Fake dashboard with lorem charts |
| 5 | Centered minimal | Restraint, a single object or input | Luxury, dev tools, AI products with a prompt box | Centered + small + nothing else to see |
| 6 | Bento hero | Many proof points at once | Product launches, personal "about me" pages | 9 equal tiles with icons |
| 7 | Sticky-media scroll | A hero image/video that deserves time | Apple feature pages, case studies | Sticky image with too little text to justify it |
| 8 | Editorial magazine cover | Photography + strong typography | Fashion, culture, editorial portfolios | Fake magazine chrome without real content |
| 9 | Statement + marquee | A voice plus a stream of work/clients | Agencies, freelancers | Marquee of client logos you do not have |
| 10 | Index hero | A body of work | Portfolios, studios, archives | 3 projects stretched to look like an index |

```css
/* app/heroes.css - shared base */
.hero {
  position: relative;
  display: grid;
  min-block-size: calc(100svh - var(--nav-h, 0px)); /* svh: stable, no jump when mobile URL bar moves */
  padding: var(--space-l-xl) var(--gutter);
}
@media (orientation: landscape) and (max-height: 32rem) {
  .hero { min-block-size: auto; padding-block: var(--space-2xl); } /* landscape phones: do not force a full screen */
}

/* 1. Giant typographic: meta row / huge line / footer row, type bottom-aligned */
.hero--type { grid-template-rows: auto 1fr auto; row-gap: var(--space-m); }
.hero--type .meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-s); font-size: var(--step--1); color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.08em; }
.hero--type h1 {
  align-self: end;
  font-size: min(var(--step-mega), 26svh);   /* cap by height so short laptops still see the CTA */
  line-height: 0.85;
  letter-spacing: -0.045em;
  margin-inline-start: -0.06em;              /* optical: cancel the first glyph's side bearing */
  text-wrap: balance;
}
.hero--type h1 em { font-family: var(--font-serif, serif); font-style: italic; font-weight: 400; }
.hero--type .foot { display: flex; justify-content: space-between; align-items: end; gap: var(--space-m); }

/* 2. Split text / media: asymmetric 5/7, media bleeds off the right edge */
.hero--split { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--space-l-xl); align-items: center; padding-inline-end: 0; }
.hero--split .media { align-self: stretch; min-block-size: 60svh; border-radius: var(--r-2xl, 28px) 0 0 var(--r-2xl, 28px); overflow: hidden; }
.hero--split .media > img { inline-size: 100%; block-size: 100%; object-fit: cover; }
@media (max-width: 48rem) {
  .hero--split { grid-template-columns: 1fr; padding-inline-end: var(--gutter); }
  .hero--split .media { min-block-size: auto; aspect-ratio: 4 / 5; border-radius: var(--r-xl, 20px); }
}

/* 3. Full-bleed media + overlay: text bottom-left over an eased scrim */
.hero--media { padding: 0; isolation: isolate; align-items: end; color: oklch(0.98 0 0); min-block-size: 100svh; }
.hero--media > :is(img, video) { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; object-fit: cover; z-index: -2; }
.hero--media::before { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(to top, oklch(0.12 0.02 270 / 0.75), oklch(0.12 0.02 270 / 0.3) 35%, transparent 65%); }
.hero--media .content { padding: var(--gutter); padding-block-end: var(--space-xl-2xl); max-inline-size: 44rem; }

/* 4. Product-in-frame: headline on top, UI frame tilted back and fading into the next section */
.hero--product { justify-items: center; align-content: start; text-align: center; min-block-size: auto; overflow: clip; padding-block-start: calc(var(--nav-h, 4rem) + var(--space-2xl)); }
.hero--product h1 { font-size: var(--step-5); max-inline-size: 20ch; text-wrap: balance; }
.hero--product .frame {
  margin-block-start: var(--space-xl);
  inline-size: min(72rem, 100%);
  aspect-ratio: 16 / 10;
  border-radius: var(--r-xl, 20px);
  border: 1px solid var(--border);
  background: var(--surface-1);
  box-shadow: var(--shadow-elevation-high);
  transform: perspective(1600px) rotateX(8deg);
  transform-origin: 50% 0;
  mask-image: linear-gradient(to bottom, #000 65%, transparent);
}

/* 5. Centered minimal: small type, big air, ONE strong object (input, product, seal) */
.hero--minimal { place-content: center; justify-items: center; text-align: center; gap: var(--space-m); }
.hero--minimal h1 { font-size: var(--step-4); font-weight: 500; max-inline-size: 18ch; text-wrap: balance; }
.hero--minimal .object { inline-size: min(36rem, 100%); }

/* 6. Bento hero: headline cell dominates, proof tiles around it */
.hero--bento {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(8rem, 1fr));
  gap: var(--space-2xs);
  grid-template-areas:
    "title title title media"
    "title title title media"
    "stat  quote demo  media";
}
.hero--bento > * { border-radius: var(--r-xl, 20px); background: var(--surface-1); padding: var(--space-m); overflow: hidden; }
.hero--bento .title { grid-area: title; display: grid; align-content: end; }
.hero--bento .media { grid-area: media; padding: 0; }
.hero--bento .stat { grid-area: stat; } .hero--bento .quote { grid-area: quote; } .hero--bento .demo { grid-area: demo; }
@media (max-width: 56rem) {
  .hero--bento { grid-template-columns: 1fr 1fr; grid-template-rows: auto; grid-template-areas: "title title" "media media" "stat quote" "demo demo"; }
}

/* 7. Sticky-media scroll hero: media pins full-screen, text panels scroll over it */
.hero--sticky { display: grid; padding: 0; min-block-size: auto; }
.hero--sticky > .media { grid-area: 1 / 1; position: sticky; top: 0; block-size: 100svh; z-index: 0; }
.hero--sticky > .media > :is(img, video) { inline-size: 100%; block-size: 100%; object-fit: cover; }
.hero--sticky > .panels { grid-area: 1 / 1; z-index: 1; display: grid; gap: 60svh; padding: 40svh var(--gutter) 30svh; }
.hero--sticky .panel { max-inline-size: 28rem; padding: var(--space-m); border-radius: var(--r-lg, 14px); background: oklch(from var(--surface-1) l c h / 0.85); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }

/* 8. Editorial magazine cover: masthead overlapping the image, cover lines, issue bar */
.hero--cover { grid-template-columns: repeat(12, minmax(0, 1fr)); grid-template-rows: auto 1fr auto; column-gap: var(--space-s); row-gap: var(--space-s); }
.hero--cover .mast { grid-column: 1 / -1; grid-row: 1 / 3; z-index: 1; align-self: start; font-size: var(--step-mega); line-height: 0.8; letter-spacing: -0.05em; text-transform: uppercase; color: oklch(0.98 0 0); mix-blend-mode: difference; }
.hero--cover .image { grid-column: 4 / -1; grid-row: 1 / 3; min-block-size: 70svh; object-fit: cover; inline-size: 100%; block-size: 100%; }
.hero--cover .lines { grid-column: 1 / 4; grid-row: 2; align-self: end; display: grid; gap: var(--space-s); font-size: var(--step--1); }
.hero--cover .issue { grid-column: 1 / -1; display: flex; justify-content: space-between; border-block-start: 1px solid currentColor; padding-block-start: var(--space-2xs); font-size: var(--step--2); text-transform: uppercase; letter-spacing: 0.1em; }
@media (max-width: 48rem) {
  .hero--cover .image { grid-column: 1 / -1; }
  .hero--cover .lines { grid-column: 1 / -1; grid-row: 3; }
  .hero--cover .issue { grid-row: 4; }
}

/* 9. Statement + marquee: a voice, then a continuous strip of work */
.hero--statement { grid-template-rows: 1fr auto; align-items: center; padding-inline: 0; }
.hero--statement .statement { padding-inline: var(--gutter); font-size: var(--step-5); line-height: 1.05; max-inline-size: 22ch; text-wrap: balance; }
.marquee { overflow: clip; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.marquee__track { display: flex; inline-size: max-content; animation: marquee var(--marquee-dur, 40s) linear infinite; }
.marquee__track > * { flex: none; padding-inline-end: var(--space-l); } /* padding, not gap: keeps -50% exact */
@keyframes marquee { to { transform: translateX(-50%); } }
.marquee:hover .marquee__track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .marquee__track { animation: none; } .marquee { overflow-x: auto; } }

/* 10. Index hero: name line + the work list fills the rest (list styles: recipe 11) */
.hero--index { grid-template-rows: auto 1fr; align-content: start; row-gap: var(--space-xl); }
```
```html
<!-- 1. Giant typographic -->
<section class="hero hero--type">
  <p class="meta"><span>Studio Nord</span><span>Brand and product design</span><span>Oslo / Remote</span></p>
  <h1>Quiet tools for <em>loud</em> ideas.</h1>
  <div class="foot"><p>Independent studio since 2016.</p><a href="#work" class="cta-primary">See the work</a></div>
</section>

<!-- 9. Statement + marquee: the track holds the set TWICE; the copy is aria-hidden -->
<section class="hero hero--statement">
  <p class="statement">I design and build interfaces for AI products that people actually trust.</p>
  <div class="marquee" aria-label="Selected projects">
    <ul class="marquee__track">
      <li><img src="/work/a.jpg" alt="Atlas design system" width="480" height="320" /></li>
      <li><img src="/work/b.jpg" alt="Orbit analytics" width="480" height="320" /></li>
      <li><img src="/work/c.jpg" alt="Kite mobile banking" width="480" height="320" /></li>
      <li aria-hidden="true"><img src="/work/a.jpg" alt="" width="480" height="320" /></li>
      <li aria-hidden="true"><img src="/work/b.jpg" alt="" width="480" height="320" /></li>
      <li aria-hidden="true"><img src="/work/c.jpg" alt="" width="480" height="320" /></li>
    </ul>
  </div>
</section>
```
**Tune:** giant type 18-26svh cap; split ratio 5/7 or 4/8 (never 6/6 unless both halves are equally strong); product frame tilt 6-12deg with perspective 1200-2000px; marquee speed 30-60s per loop (slower = more expensive feel); sticky panels gap 50-70svh so each panel gets a moment.  
**A11y/perf:** Hero media: `fetchpriority="high"` on the LCP image, `muted playsinline` + poster on video, and never lazy-load the hero. The marquee must pause on hover/focus and stop under reduced motion (WCAG 2.2.2 for anything moving over 5s). Animated reveals of these heroes: `text-effects.md`, `scroll-gsap.md`.

### 7. Bento grids done right
**Looks like:** A mosaic of differently sized cells where one cell clearly dominates, each cell carries exactly one idea with a real visual (product crop, number, live widget), and the whole block reads as a composed poster (Apple feature bentos, Vercel/Linear feature grids).  
**Use when / avoid when:** 4-7 related proof points or features. Avoid: all cells equal (that is just a grid), 9+ cells of icon + two lines, a different gradient per cell, glowing animated borders on every cell, and card-in-card (a bordered, shadowed mockup inside a bordered, shadowed cell).  
**Stack:** CSS (container queries so it adapts to its slot, not the viewport)
```css
/* app/bento.css */
.bento-wrap { container-type: inline-size; }
.bento {
  --cell-pad: var(--space-m);
  --cell-r: var(--r-xl, 20px);
  display: grid;
  gap: var(--space-2xs);
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-auto-rows: minmax(11rem, auto);
  grid-template-areas:
    "hero hero hero hero side side"
    "hero hero hero hero side side"
    "a    a    b    b    c    c";
}
.bento > .cell {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-s);
  padding: var(--cell-pad);
  border-radius: var(--cell-r);
  background: var(--surface-1);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
}
.bento > .cell--hero { grid-area: hero; }
.bento > .cell--side { grid-area: side; }
.bento > .cell--a { grid-area: a; } .bento > .cell--b { grid-area: b; } .bento > .cell--c { grid-area: c; }

/* Inside a cell: label (top) / visual (middle, bleeds) / one-line value (bottom) */
.cell__label { font-size: var(--step--1); color: var(--fg-muted); }
.cell__value { font-size: var(--step-1); font-weight: 500; text-wrap: balance; }
.cell__visual {
  margin-inline: calc(var(--cell-pad) * -1);     /* bleed to the cell edges: no card-in-card */
  margin-block-end: calc(var(--cell-pad) * -1);
  flex: 1;
  min-block-size: 8rem;
}
.cell__visual > img { inline-size: 100%; block-size: 100%; object-fit: cover; object-position: top left; }
/* If an inner element must look like a card, follow the nested radius rule and drop its shadow */
.cell__inset { border-radius: calc(var(--cell-r) - var(--cell-pad)); background: var(--surface-2); }

/* Tablet */
@container (width < 60rem) {
  .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-areas: "hero hero" "side side" "a b" "c c"; }
}
/* Phone: single column, dominant cell keeps a taller minimum */
@container (width < 36rem) {
  .bento { grid-template-columns: 1fr; grid-template-areas: "hero" "side" "a" "b" "c"; }
  .bento > .cell--hero { min-block-size: 22rem; }
}

/* Gapless variant: 1px gap over a line-colored background = perfect shared hairlines */
.bento--gapless { gap: 1px; background: var(--border-subtle); border: 1px solid var(--border-subtle); border-radius: var(--cell-r); overflow: hidden; }
.bento--gapless > .cell { border: 0; border-radius: 0; background: var(--bg); }

/* Unknown number of items with varied spans: let grid backfill holes */
.bento--auto { grid-template-areas: none; grid-auto-flow: dense; }
.bento--auto > .w2 { grid-column: span 2; } .bento--auto > .h2 { grid-row: span 2; }

/* True masonry (uneven heights): progressive enhancement, Safari 26.4+ today */
.masonry { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: var(--space-s); }
@supports (display: grid-lanes) { .masonry { display: grid-lanes; } }
```
```html
<div class="bento-wrap">
  <div class="bento">
    <article class="cell cell--hero">
      <p class="cell__label">Realtime sync</p>
      <div class="cell__visual"><img src="/features/sync.avif" alt="Two cursors editing one document" /></div>
      <h3 class="cell__value">Every edit lands in under 50 ms, everywhere.</h3>
    </article>
    <article class="cell cell--side"><p class="cell__label">Uptime</p><p class="cell__value" style="font-size: var(--step-5)">99.99%</p></article>
    <article class="cell cell--a"><p class="cell__label">Offline</p><h3 class="cell__value">Works on a plane.</h3></article>
    <article class="cell cell--b"><p class="cell__label">Shortcuts</p><h3 class="cell__value">Everything is one keystroke away.</h3></article>
    <article class="cell cell--c"><p class="cell__label">Security</p><h3 class="cell__value">SOC 2 Type II, SSO, audit logs.</h3></article>
  </div>
</div>
```
**Tune:** 5-7 cells; dominant cell 35-50% of the area; gap 6-16px (tight gaps read as one object, wide gaps as separate cards); cell radius 16-28px with padding 20-32px; one accent moment in the whole bento, not one per cell.  
**A11y/perf:** `grid-template-areas` reorders visually only; keep DOM order = reading order (hero first). Container queries need `container-type` on a wrapper, not the grid itself if the grid's own width depends on its content.

### 8. Feature sections that are not three identical cards
**Looks like:** Features presented with hierarchy and pacing: a sticky media panel that swaps as each feature scrolls past (Apple, Linear, Stripe docs-style product pages), or numbered editorial rows separated by hairlines.  
**Use when / avoid when:** The slop version is a centered heading + 3 (or 6) equal cards, each with a gradient icon, a bold title and two gray lines. Use the sticky swap when each feature has a strong visual; numbered rows when features are text-led; a bento (recipe 7) when there are 5-7 short proof points.  
**Stack:** CSS + React (IntersectionObserver, no animation library)
```tsx
// components/sticky-features.tsx
"use client";
import { useEffect, useRef, useState } from "react";

export interface Feature { id: string; title: string; body: string; media: string; alt: string }

export function StickyFeatures({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // a feature is "active" while it crosses the middle 10% band of the viewport
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [features.length]);

  return (
    <section className="sf">
      <div className="sf__media" aria-hidden="true">
        {features.map((f, i) => (
          <img key={f.id} src={f.media} alt="" data-active={i === active} />
        ))}
      </div>
      <ol className="sf__list">
        {features.map((f, i) => (
          <li key={f.id} data-index={i} data-active={i === active} ref={(el) => { itemRefs.current[i] = el; }}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
            <img className="sf__inline" src={f.media} alt={f.alt} loading="lazy" />
          </li>
        ))}
      </ol>
    </section>
  );
}
```
```css
/* app/features.css */
.sf { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: var(--space-xl); padding-inline: var(--gutter); }
.sf__media {
  position: sticky;
  top: calc(var(--nav-h, 4rem) + var(--space-m));
  align-self: start;                      /* without this the grid stretches it and sticky never engages */
  display: grid;
  aspect-ratio: 4 / 3;
  border-radius: var(--r-xl, 20px);
  overflow: hidden;
  background: var(--surface-2);
}
.sf__media > img { grid-area: 1 / 1; inline-size: 100%; block-size: 100%; object-fit: cover; opacity: 0; transition: opacity var(--dur-slow, 400ms) var(--ease-out, ease-out); }
.sf__media > img[data-active="true"] { opacity: 1; }
.sf__list { display: grid; gap: 35svh; padding-block: 25svh; list-style: none; }
.sf__list > li { max-inline-size: 30rem; opacity: 0.35; transition: opacity var(--dur-base, 250ms) var(--ease-out, ease-out); }
.sf__list > li[data-active="true"] { opacity: 1; }
.sf__list h3 { font-size: var(--step-2); }
.sf__inline { display: none; }
@media (max-width: 48rem) {
  .sf { grid-template-columns: 1fr; }
  .sf__media { display: none; }
  .sf__list { gap: var(--space-xl); padding-block: 0; }
  .sf__list > li { opacity: 1; }
  .sf__inline { display: block; margin-block-start: var(--space-s); border-radius: var(--r-lg, 14px); aspect-ratio: 4 / 3; object-fit: cover; }
}
@media (prefers-reduced-motion: reduce) { .sf__media > img, .sf__list > li { transition: none; } }

/* Numbered editorial rows: text-led features, hairline separated, NOT zig-zag */
.feature-rows { list-style: none; counter-reset: feat; border-block-start: 1px solid var(--hairline); }
.feature-rows > li {
  counter-increment: feat;
  display: grid;
  grid-template-columns: 4rem minmax(0, 4fr) minmax(0, 5fr) minmax(0, 3fr);
  gap: var(--space-m);
  align-items: start;
  padding-block: var(--space-l);
  border-block-end: 1px solid var(--hairline);
}
.feature-rows > li::before { content: counter(feat, decimal-leading-zero); font-variant-numeric: tabular-nums; color: var(--fg-faint); }
.feature-rows h3 { font-size: var(--step-2); line-height: 1.1; }
.feature-rows p { color: var(--fg-muted); max-inline-size: 42ch; }
@media (max-width: 48rem) { .feature-rows > li { grid-template-columns: 2.5rem 1fr; } .feature-rows > li > :nth-child(n + 2) { grid-column: 2; } }
```
**Tune:** sticky media column 55-60% of the width; list gap 30-40svh so each feature owns a scroll moment; observer band `-45% 0px -45% 0px` (narrower = crisper switching). For scrubbed crossfades or pinned sequences use `scroll-gsap.md`.  
**A11y/perf:** The sticky media is `aria-hidden` because every feature also renders its own inline image with alt text (shown on mobile). IntersectionObserver costs nothing per frame, unlike scroll listeners.

### 9. Social proof: logos band, testimonials, stats row
**Looks like:** Client logos that look equally important despite different shapes; testimonials that read like quotes in a magazine, not a carousel of 5-star cards; numbers set like data, not like a dashboard widget.  
**Use when / avoid when:** Logos only if they are real and recognizable; 5-8 is plenty. Avoid: logo carousels with 20 unknown logos, testimonial cards with avatar + stars + "Amazing product!", 4 identical stat cards with icons and count-up animations on every number.  
**Stack:** CSS
```css
/* app/social-proof.css */

/* Logos: equal visual AREA, not equal height. Each <img> declares its own aspect ratio --r (width / height). */
.logos { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: var(--space-l) var(--space-xl); }
.logos img {
  --area: 2600;                                     /* px^2 each logo occupies; 2000-3500 */
  inline-size: calc(sqrt(var(--area) * var(--r, 3)) * 1px);
  block-size: auto;
}
/* recolor: see color-surfaces.md#23 (.logo-mono) */

/* Testimonials, featured: one big quote, attribution small */
.quote-feature { display: grid; grid-template-columns: minmax(0, 8fr) minmax(0, 4fr); gap: var(--space-xl); align-items: end; }
.quote-feature blockquote { font-size: var(--step-3); line-height: 1.2; text-wrap: balance; hanging-punctuation: first last; }
.quote-feature figcaption { display: grid; grid-template-columns: 3rem 1fr; gap: var(--space-2xs) var(--space-s); align-items: center; font-size: var(--step--1); color: var(--fg-muted); }
.quote-feature figcaption img { grid-row: span 2; border-radius: 50%; aspect-ratio: 1; object-fit: cover; }
@media (max-width: 48rem) { .quote-feature { grid-template-columns: 1fr; } }

/* Testimonials, wall: CSS columns masonry (independent quotes, so column reading order is fine) */
.quote-wall { columns: 3 18rem; column-gap: var(--space-m); }
.quote-wall > figure { break-inside: avoid; margin-block-end: var(--space-m); padding: var(--space-m); border: 1px solid var(--border-subtle); border-radius: var(--r-lg, 14px); }

/* Stats: gapless grid gives perfect shared dividers even when it wraps */
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr)); gap: 1px; background: var(--hairline); border-block: 1px solid var(--hairline); }
.stat { background: var(--bg); padding: var(--space-m) var(--space-s); display: grid; gap: var(--space-3xs); }
.stat__num { font-size: var(--step-5); line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.stat__label { font-size: var(--step--1); color: var(--fg-muted); max-inline-size: 22ch; }
```
```html
<div class="logos">
  <img src="/logos/northwind.svg" alt="Northwind" style="--r: 4.8" />
  <img src="/logos/orbit.svg" alt="Orbit" style="--r: 1.1" />
  <img src="/logos/kite.svg" alt="Kite" style="--r: 2.6" />
</div>
<div class="stats">
  <div class="stat"><span class="stat__num">4.2M</span><span class="stat__label">documents synced every day</span></div>
  <div class="stat"><span class="stat__num">38 ms</span><span class="stat__label">median edit latency worldwide</span></div>
  <div class="stat"><span class="stat__num">99.99%</span><span class="stat__label">uptime over the last 12 months</span></div>
</div>
```
**Tune:** logo `--area` 2000 (subtle) to 3500 (confident); `--r` = the SVG viewBox width / height; stats 3-4 items, label under 8 words, units attached to the number. Animated number transitions: `component-recipes.md` (NumberFlow).  
**A11y/perf:** `sqrt()` is Baseline (2023+). Logos need real alt text (company names). A testimonial marquee must pause on hover/focus and stop under reduced motion.

### 10. Conversion sections: pricing, FAQ, CTA
**Looks like:** Pricing where plan names, prices, CTAs and feature lists line up across tiers; a FAQ that reads like a document; a closing CTA that feels like the last page of a book, not a gradient box.  
**Use when / avoid when:** Avoid scaling the featured plan (`scale-105`): it breaks row alignment and looks templated. Emphasize with surface + ring instead. Avoid FAQ accordions with chevrons in colored circles; avoid CTA "boxes" with blob gradients floating in whitespace.  
**Stack:** CSS (+ native `<details name>` exclusive accordion)
```css
/* app/conversion.css */

/* Pricing: subgrid rows = name / price / blurb / CTA / features aligned across plans */
.plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), 1fr)); gap: var(--space-s); align-items: stretch; }
.plan {
  display: grid;
  grid-row: span 5;
  grid-template-rows: subgrid;
  row-gap: var(--space-s);
  padding: var(--space-m);
  border: 1px solid var(--border-subtle);
  border-radius: var(--r-xl, 20px);
  background: var(--surface-1);
}
.plan--featured { background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--accent), var(--shadow-elevation-medium); }
.plan__price { font-size: var(--step-4); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.plan__price small { font-size: var(--step--1); color: var(--fg-muted); letter-spacing: 0; }
.plan ul { display: grid; gap: var(--space-2xs); align-content: start; font-size: var(--step--1); color: var(--fg-muted); }

/* FAQ: sticky heading left, questions right */
.faq { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: var(--space-xl); align-items: start; }
.faq__head { position: sticky; top: calc(var(--nav-h, 4rem) + var(--space-m)); }
.faq details { border-block-end: 1px solid var(--hairline); }
.faq summary { display: flex; justify-content: space-between; gap: var(--space-s); padding-block: var(--space-s); font-size: var(--step-1); cursor: pointer; list-style: none; }
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after { content: "+"; font-weight: 300; transition: rotate var(--dur-fast, 150ms) var(--ease-out, ease-out); }
.faq details[open] summary::after { rotate: 45deg; }
.faq details > p { padding-block-end: var(--space-s); color: var(--fg-muted); max-inline-size: 60ch; }
@media (max-width: 48rem) { .faq { grid-template-columns: 1fr; } .faq__head { position: static; } }

/* Closing CTA: full-bleed, giant statement, one action (plus an email for humans) */
.cta-end { padding-block: var(--space-section); padding-inline: var(--gutter); display: grid; gap: var(--space-l); border-block-start: 1px solid var(--hairline); }
.cta-end h2 { font-size: var(--step-display); line-height: 0.9; letter-spacing: -0.04em; max-inline-size: 14ch; text-wrap: balance; }
.cta-end .actions { display: flex; flex-wrap: wrap; gap: var(--space-s); align-items: center; }
```
```html
<section class="faq">
  <div class="faq__head"><h2>Questions</h2><p>Still stuck? <a href="mailto:hello@example.com">Email us</a>.</p></div>
  <div>
    <details name="faq" open><summary>Can I cancel anytime?</summary><p>Yes. Plans are monthly and you keep access until the period ends.</p></details>
    <details name="faq"><summary>Do you offer student pricing?</summary><p>Yes, 50% off with a valid university email.</p></details>
  </div>
</section>
```
**Tune:** 2-3 plans (4+ needs a comparison table below instead of longer cards); featured ring 1-2px accent; FAQ 5-8 questions. Animated open/close height: `css-modern.md` (`::details-content`, `interpolate-size`).  
**A11y/perf:** `<details name="...">` makes an exclusive accordion natively (Baseline 2024), keyboard and screen-reader ready. Keep the price text real text (not an image) and state billing period next to it.

### 11. Project index list with hover preview
**Looks like:** A typographic list of projects (number / title / role / year) set large with hairlines; hovering a row dims the others and reveals that project's image in a fixed preview slot (studio and portfolio staple on Awwwards).  
**Use when / avoid when:** Portfolios with 5+ projects, archives, case-study indexes. Better than a 3-card grid when titles are strong. For the preview that follows the cursor, see `interactions.md`; this version keeps the preview in a sticky slot (calmer, works with keyboard focus).  
**Stack:** React + CSS
```tsx
// components/work-index.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

export interface Project { slug: string; title: string; role: string; year: number; cover: string }

export function WorkIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section className="index" onPointerLeave={() => setActive(null)}>
      <ol className="index__list">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              data-active={active === i || undefined}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="index__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="index__title">{p.title}</span>
              <span className="index__role">{p.role}</span>
              <span className="index__year">{p.year}</span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="index__preview" aria-hidden="true">
        {projects.map((p, i) => (
          <img key={p.slug} src={p.cover} alt="" loading="lazy" data-active={active === i || undefined} />
        ))}
      </div>
    </section>
  );
}
```
```css
/* app/work-index.css */
.index { display: grid; grid-template-columns: minmax(0, 8fr) minmax(0, 4fr); gap: var(--space-l); padding-inline: var(--gutter); }
.index__list { list-style: none; border-block-start: 1px solid var(--hairline); }
.index__list a {
  display: grid;
  grid-template-columns: 3ch minmax(0, 1fr) auto 5ch;
  gap: var(--space-s);
  align-items: baseline;
  padding-block: var(--space-s);
  border-block-end: 1px solid var(--hairline);
  color: var(--fg);
  text-decoration: none;
  transition: opacity var(--dur-base, 250ms) var(--ease-out, ease-out);
}
.index__title { font-size: var(--step-3); letter-spacing: -0.025em; line-height: 1; }
.index__n, .index__role, .index__year { font-size: var(--step--1); color: var(--fg-muted); font-variant-numeric: tabular-nums; }
.index__year { text-align: end; }
.index__list:has([data-active]) a:not([data-active]) { opacity: 0.3; }   /* dim siblings */

.index__preview { position: sticky; top: calc(var(--nav-h, 4rem) + var(--space-m)); align-self: start; display: grid; aspect-ratio: 4 / 5; border-radius: var(--r-lg, 14px); overflow: hidden; }
.index__preview > img { grid-area: 1 / 1; inline-size: 100%; block-size: 100%; object-fit: cover; opacity: 0; scale: 1.06; transition: opacity 300ms var(--ease-out, ease-out), scale 700ms var(--ease-out, ease-out); }
.index__preview > img[data-active] { opacity: 1; scale: 1; }

@media (hover: none), (max-width: 48rem) {
  .index { grid-template-columns: 1fr; }
  .index__preview { display: none; }
  .index__list a { grid-template-columns: 3ch minmax(0, 1fr) 5ch; }
  .index__role { display: none; }
}
@media (prefers-reduced-motion: reduce) { .index__preview > img { transition: opacity 150ms linear; scale: 1; } }
```
**Tune:** title size step-3 to step-display (bigger = more "studio"); dim opacity 0.2-0.4; preview ratio 4/5 portrait or 16/10 landscape to match covers; preview scale-in 1.04-1.08.  
**A11y/perf:** Each row is a real link; the preview is decorative. Previews use `loading="lazy"`, and since they are hidden until hover, preload the first two with `<link rel="preload" as="image">` if the hover must be instant.

### 12. About section and footer with giant wordmark
**Looks like:** An about section set like a magazine profile (portrait, big lead sentence, facts as a definition list), and a footer that ends the page with the name or brand set edge to edge, cropped at the bottom.  
**Use when / avoid when:** Portfolios, studios, personal brands. Avoid skill bars, percentage circles, "5+ years" counters and emoji bullet lists: they read as template filler. The giant-wordmark footer is common now; make it earn its place with a real typeface choice and a tight crop.  
**Stack:** CSS (container query units size the wordmark to the footer, not the viewport)
```css
/* app/about-footer.css */
.about { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--space-s); row-gap: var(--space-l); padding-inline: var(--gutter); }
.about__portrait { grid-column: 1 / 5; position: sticky; top: calc(var(--nav-h, 4rem) + var(--space-m)); align-self: start; aspect-ratio: 4 / 5; object-fit: cover; border-radius: var(--r-lg, 14px); }
.about__lead { grid-column: 6 / 13; font-size: var(--step-3); line-height: 1.15; letter-spacing: -0.02em; text-wrap: balance; }
.about__body { grid-column: 6 / 11; display: grid; gap: var(--space-s); color: var(--fg-muted); max-inline-size: 60ch; }
.about__facts { grid-column: 6 / 13; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr)); gap: var(--space-m); border-block-start: 1px solid var(--hairline); padding-block-start: var(--space-m); }
.about__facts dt { font-size: var(--step--1); color: var(--fg-faint); text-transform: uppercase; letter-spacing: 0.08em; }
.about__facts dd { margin: 0; }
@media (max-width: 48rem) {
  .about > * { grid-column: 1 / -1; }
  .about__portrait { position: static; max-inline-size: 22rem; }
}

.site-footer { container-type: inline-size; padding: var(--space-2xl) var(--gutter) 0; overflow: clip; border-block-start: 1px solid var(--hairline); }
.footer__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(11rem, 100%), 1fr)); gap: var(--space-l); font-size: var(--step--1); }
.footer__cols h3 { color: var(--fg-faint); font-size: inherit; font-weight: 400; margin-block-end: var(--space-2xs); }
.footer__wordmark {
  display: block;
  margin-block-start: var(--space-xl);
  margin-inline-start: -0.05em;            /* optical: align the first glyph with the grid edge */
  font-size: 20.5cqi;                       /* ~ 100 / (letters * 0.6): 8 letters -> 20.8cqi */
  font-weight: 700;
  line-height: 0.75;
  letter-spacing: -0.06em;
  white-space: nowrap;
  translate: 0 16%;                         /* crop the baseline area: footer has overflow clip + no bottom padding */
  user-select: none;
}
```
```html
<footer class="site-footer">
  <div class="footer__cols">
    <div><h3>Contact</h3><a href="mailto:hello@example.com">hello@example.com</a></div>
    <div><h3>Social</h3><a href="https://github.com/example">GitHub</a></div>
    <div><h3>Local time</h3><p>Casablanca, GMT+1</p></div>
  </div>
  <p class="footer__wordmark" aria-hidden="true">NORDLAB</p>
</footer>
```
**Tune:** wordmark `cqi` = roughly 100 / (letter count x average glyph width in em; 0.55-0.65 for grotesks); crop 10-25% via `translate`; wordmark color either `--fg` (bold) or `--surface-3` on `--bg` (quiet, "watermark").  
**A11y/perf:** The wordmark duplicates the brand name, so it is `aria-hidden`; the real name lives in the logo/header. `cqi` units are Baseline; the experimental `text-fit` (Chrome, I/O 2026) will size text to fit its container natively later.

### 13. Sticky compositions
**Looks like:** One side holds still while the other scrolls: case-study meta beside a long story, a docs TOC beside content, section titles that stick until the next section pushes them out, cards that pile up as you scroll.  
**Use when / avoid when:** Long content with a persistent reference (TOC, project facts, media). Avoid sticky elements taller than the viewport (unreachable bottoms) and more than one sticky layer per axis on mobile.  
**Stack:** CSS (pinned, scrubbed or scaled versions: `scroll-gsap.md`)
```css
/* app/sticky.css */

/* A. Sticky sidebar + scrolling content */
.sticky-split { display: grid; grid-template-columns: minmax(14rem, 1fr) minmax(0, 3fr); gap: var(--space-xl); align-items: start; padding-inline: var(--gutter); }
.sticky-split > aside {
  position: sticky;
  top: calc(var(--nav-h, 4rem) + var(--space-m));
  max-block-size: calc(100svh - var(--nav-h, 4rem) - var(--space-m) * 2);
  overflow-y: auto;                   /* long TOCs scroll inside */
  overscroll-behavior: contain;       /* do not chain scroll to the page */
}
@media (max-width: 56rem) { .sticky-split { grid-template-columns: 1fr; } .sticky-split > aside { position: static; max-block-size: none; } }

/* B. Sticky section titles: each title sticks until its section ends */
.chapter { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 9fr); gap: var(--space-l); padding-block: var(--space-2xl); }
.chapter > h2 { position: sticky; top: calc(var(--nav-h, 4rem) + var(--space-s)); align-self: start; font-size: var(--step-2); }

/* C. Stacking cards (CSS only): each card sticks slightly lower than the previous one */
.stack-cards { display: grid; gap: var(--space-xl); padding-block-end: 20svh; }
.stack-cards > .card {
  position: sticky;
  top: calc(var(--nav-h, 4rem) + var(--space-m) + var(--i, 0) * 1.25rem);
  min-block-size: 60svh;
  border-radius: var(--r-2xl, 28px);
  background: var(--surface-1);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 -8px 32px -16px oklch(0 0 0 / 0.25);   /* shadow on top edge sells the overlap */
}
```
```html
<div class="stack-cards">
  <article class="card" style="--i: 0">...</article>
  <article class="card" style="--i: 1">...</article>
  <article class="card" style="--i: 2">...</article>
</div>
```
**Tune:** sticky `top` = nav height + 16-32px; stacking offset 1-2rem per card; card height 55-75svh.  
**A11y/perf:** Sticky is compositor-cheap. It silently fails when any ancestor between the element and the scroller has `overflow: hidden | auto | scroll`; use `overflow: clip` on ancestors that only need clipping.

### 14. Overlapping and broken-grid layouts
**Looks like:** Collage compositions: an image overlapping another, a headline crossing an image edge, a section that rides up over the previous one. Editorial, fashion and studio sites use this to escape the "stack of boxes" feel.  
**Use when / avoid when:** 1-2 moments per page (hero, case-study opener, about). Overlaps everywhere read as chaos and break on mobile. Always build overlaps with grid cells, not absolute positioning, so they stay in flow and responsive.  
**Stack:** CSS
```css
/* app/overlap.css */

/* Collage on a 12x8 grid: items share cells, z-index decides the stack */
.collage {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: repeat(8, minmax(2.5rem, auto));
  padding-inline: var(--gutter);
  isolation: isolate;                      /* contain z-index to this component */
}
.collage .img-a { grid-column: 1 / 8; grid-row: 1 / 7; }
.collage .img-b { grid-column: 7 / 12; grid-row: 4 / 9; z-index: 1; box-shadow: var(--shadow-elevation-high); }
.collage .title {
  grid-column: 2 / 13; grid-row: 6 / 8; z-index: 2; align-self: center;
  font-size: var(--step-display); line-height: 0.9; letter-spacing: -0.04em;
  color: oklch(0.98 0 0); mix-blend-mode: difference;   /* stays legible over both images */
}
.collage img { inline-size: 100%; block-size: 100%; object-fit: cover; border-radius: var(--r-md, 10px); }
@media (max-width: 48rem) {
  .collage { grid-template-columns: repeat(6, minmax(0, 1fr)); grid-template-rows: auto; }
  .collage .img-a { grid-column: 1 / 6; grid-row: 1; }
  .collage .img-b { grid-column: 3 / 7; grid-row: 2; margin-block-start: -25%; }  /* small overlap only */
  .collage .title { grid-column: 1 / -1; grid-row: 3; mix-blend-mode: normal; color: var(--fg); }
}

/* Headline crossing an image edge (same cell, text aligned to the image's side) */
.cross { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
.cross > img { grid-column: 2; grid-row: 1; inline-size: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.cross > h2 { grid-column: 1 / 3; grid-row: 1; align-self: end; z-index: 1; font-size: var(--step-display); max-inline-size: 12ch; margin-block-end: -0.12em; }

/* Section riding up over the previous one */
.ride-up { position: relative; z-index: 1; margin-block-start: calc(var(--space-3xl) * -1); border-radius: var(--r-2xl, 28px) var(--r-2xl, 28px) 0 0; background: var(--surface-1); }

/* z-axis scale: name layers once, never type z-index: 9999 again */
:root { --z-raised: 10; --z-sticky: 100; --z-nav: 200; --z-overlay: 300; --z-modal: 400; --z-toast: 500; --z-cursor: 1000; }
```
**Tune:** overlap amount 15-35% of the smaller element; one blend-mode headline per page; ride-up distance 4-8rem.  
**A11y/perf:** Keep DOM order logical (title before images if it is the heading). `mix-blend-mode: difference` text has unpredictable contrast on mid-gray photos; verify, or use a solid color on mobile as above.

### 15. Horizontal galleries with scroll-snap
**Looks like:** A row of cards that swipes natively on touch and trackpad, snaps each card to the content edge (first card aligned with the page text, last card not stranded), with the row itself bleeding to the screen edges.  
**Use when / avoid when:** Work thumbnails, testimonials, product cards, image sets on mobile. For vertical-scroll-driven horizontal movement (pinned section), use GSAP: `scroll-gsap.md`. Avoid hiding the scrollbar without giving arrows: desktop mouse users cannot scroll horizontally otherwise.  
**Stack:** CSS + optional tiny React for arrows (native CSS carousels with `::scroll-button()` / `::scroll-marker`: `scroll-css-native.md`)
```css
/* app/h-gallery.css */
.h-gallery {
  --content: min(72rem, 100% - var(--gutter) * 2);
  --inset: max(var(--gutter), (100% - var(--content)) / 2); /* aligns first card with the content column */
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(80%, 24rem);
  gap: var(--space-s);
  padding-inline: var(--inset);
  scroll-padding-inline: var(--inset);
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-snap-type: inline mandatory;
  scrollbar-width: none;
  padding-block-end: var(--space-2xs);
}
.h-gallery::-webkit-scrollbar { display: none; }
.h-gallery > * { scroll-snap-align: start; }
.h-gallery > :last-child { scroll-snap-align: end; }
@media (prefers-reduced-motion: reduce) { .h-gallery { scroll-behavior: auto; } }
```
```tsx
// components/gallery-arrows.tsx - arrows for mouse users; scroll by ~one viewport of cards
"use client";
import type { RefObject } from "react";

export function GalleryArrows({ target }: { target: RefObject<HTMLElement | null> }) {
  const scroll = (dir: 1 | -1) => {
    const el = target.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => scroll(-1)} aria-label="Previous items" className="size-11 rounded-full border border-border">&larr;</button>
      <button type="button" onClick={() => scroll(1)} aria-label="Next items" className="size-11 rounded-full border border-border">&rarr;</button>
    </div>
  );
}
```
**Tune:** card width 70-85% on phones (the peek of the next card signals swipeability), 20-26rem on desktop; `mandatory` for cards, `proximity` for long mixed content.  
**A11y/perf:** Make the gallery focusable only if it has no focusable children (`tabindex="0"` + `role="region"` + `aria-label`), so keyboard users can scroll it. Native scrolling is the smoothest possible; do not re-implement it with transforms.

### 16. Navigation layouts
**Looks like:** A nav that matches the site's density: floating pill (portfolios, product sites), hide-on-scroll bar (content sites), mega menu (large product catalogs), fullscreen menu (agencies), 3-column docs shell, bottom bar or sheet on mobile.  
**Use when / avoid when:** Choose one pattern per site. Avoid hamburger menus on desktop for sites with 3-5 links (show them), and avoid mega menus for fewer than ~12 destinations. Glass styling for the pill: `color-surfaces.md#15-glassmorphism-done-right`. Menu open/close animation: `page-transitions.md`.  
**Stack:** CSS + small React hook
```tsx
// hooks/use-hide-on-scroll.ts
"use client";
import { useEffect, useState } from "react";

/** true when the user scrolls down past `topZone`; false on scroll up or near the top. */
export function useHideOnScroll(threshold = 8, topZone = 96): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < topZone) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(delta) > threshold) {
        setHidden(delta > 0);
        lastY = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topZone]);
  return hidden;
}
```
```tsx
// components/site-header.tsx
"use client";
import Link from "next/link";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";

export function SiteHeader() {
  const hidden = useHideOnScroll();
  return (
    <header className="site-header" data-hidden={hidden}>
      <Link href="/" className="font-medium">Nordlab</Link>
      <nav aria-label="Primary" className="flex gap-6 text-sm text-fg-muted">
        <Link href="/work">Work</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
```
```css
/* app/nav-layouts.css */
:root { --nav-h: 4rem; }
html { scroll-padding-top: calc(var(--nav-h) + 1rem); }   /* anchor links land below the fixed nav */

.site-header {
  position: sticky; top: 0; z-index: var(--z-nav, 200);
  display: flex; align-items: center; justify-content: space-between;
  block-size: var(--nav-h); padding-inline: var(--gutter);
  background: oklch(from var(--bg) l c h / 0.8);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  transition: translate 300ms var(--ease-out, ease-out);
}
.site-header[data-hidden="true"]:not(:focus-within) { translate: 0 -100%; }
@media (prefers-reduced-motion: reduce) { .site-header { transition: none; } }

/* Floating pill: centered, shrink-wrapped */
.nav-pill { position: fixed; inset-inline: 0; top: 0.75rem; margin-inline: auto; inline-size: fit-content; z-index: var(--z-nav, 200); }

/* Mega menu panel: link columns + one featured card */
.mega {
  position: absolute; inset-inline: 0; top: 100%;
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.4fr); gap: var(--space-l);
  padding: var(--space-l) var(--gutter);
  background: var(--elevated); border-block-end: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-elevation-medium);
}
.mega h3 { font-size: var(--step--1); color: var(--fg-faint); margin-block-end: var(--space-2xs); }

/* Fullscreen menu: huge links + meta column */
.menu-full {
  position: fixed; inset: 0; z-index: var(--z-overlay, 300);
  display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); align-items: end; gap: var(--space-xl);
  padding: calc(var(--nav-h) + var(--space-l)) var(--gutter) var(--space-l);
  background: var(--bg); overflow-y: auto; overscroll-behavior: contain;
}
.menu-full a.big { display: block; font-size: min(var(--step-display), 12svh); line-height: 0.95; letter-spacing: -0.04em; }
@media (max-width: 48rem) { .menu-full { grid-template-columns: 1fr; align-items: start; } }

/* Docs shell: sidebar | content | TOC */
.docs { display: grid; grid-template-columns: 16rem minmax(0, 1fr) 14rem; gap: var(--space-xl); padding-inline: var(--gutter); }
.docs > .docs-nav, .docs > .toc {
  position: sticky; top: var(--nav-h); align-self: start;
  max-block-size: calc(100svh - var(--nav-h)); overflow-y: auto; overscroll-behavior: contain;
  padding-block: var(--space-m);
}
.docs > main { min-inline-size: 0; max-inline-size: 72ch; padding-block: var(--space-m) var(--space-3xl); }
@media (max-width: 80rem) { .docs { grid-template-columns: 15rem minmax(0, 1fr); } .docs > .toc { display: none; } }
@media (max-width: 56rem) { .docs { grid-template-columns: 1fr; } .docs > .docs-nav { display: none; } } /* move it into a sheet */

/* Mobile bottom bar (apps, dashboards): respects the home indicator */
.bottom-bar {
  position: fixed; inset-inline: 0; bottom: 0; z-index: var(--z-nav, 200);
  display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  padding-block-end: env(safe-area-inset-bottom);
  background: var(--elevated); border-block-start: 1px solid var(--border-subtle);
}
.bottom-bar a { display: grid; place-items: center; min-block-size: 3.5rem; font-size: var(--step--2); }
```
**Tune:** nav height 56-72px; hide threshold 6-12px of delta (lower = twitchy); pill top offset 8-16px; fullscreen links capped by `svh` so 5 links fit on a phone.  
**A11y/perf:** Hidden header reappears on `:focus-within` so keyboard users never tab into an invisible nav. The fullscreen menu needs focus trapping, `Escape` to close and background scroll lock (native `<dialog>` gives the first two). A scroll listener with rAF gating and `passive: true` is fine; with Lenis, `window.scrollY` still updates.

### 17. Responsive strategy
**Looks like:** Components that fit whatever slot they land in, heroes that do not jump when the mobile URL bar moves, nothing hidden under notches, tap targets that are easy to hit, and a composed (not stretched) layout on 2560px monitors.  
**Use when / avoid when:** Always. Mobile-first CSS; viewport media queries for page-level structure; container queries for components; intrinsic primitives (recipe 5) before either.  
**Stack:** CSS (+ Tailwind 4 built-in container query variants)
```html
<!-- Tailwind 4: container queries are core. @container marks the container; @md: = container >= 28rem -->
<div class="@container">
  <article class="grid gap-4 @md:grid-cols-[9rem_1fr] @3xl:grid-cols-[14rem_1fr_auto]">
    <img class="aspect-square w-full rounded-lg object-cover" src="/work/kite.jpg" alt="Kite app icon" />
    <div><h3 class="text-step-1">Kite</h3><p class="text-fg-muted">Mobile banking for freelancers.</p></div>
    <a class="hidden self-center @3xl:block" href="/work/kite">Case study</a>
  </article>
</div>
```
```css
/* app/responsive.css */

/* Viewport units: svh for heroes (stable), dvh for app shells/sheets that must match the visible area */
.hero-full { min-block-size: 100svh; }
.app-shell { block-size: 100dvh; }

/* Safe areas: requires viewport-fit=cover (Next: export const viewport = { viewportFit: "cover" }) */
.page { padding-inline: max(var(--gutter), env(safe-area-inset-left)) max(var(--gutter), env(safe-area-inset-right)); }
.fixed-bottom-cta { bottom: max(1rem, env(safe-area-inset-bottom)); }

/* Touch targets: WCAG 2.2 SC 2.5.8 min 24x24 CSS px; aim for 44x44 (Apple HIG) on touch */
.icon-btn { position: relative; inline-size: 2rem; block-size: 2rem; }
.icon-btn::after { content: ""; position: absolute; inset: -0.375rem; } /* invisible hit area: 44x44 total */
@media (pointer: coarse) { .text-link-list a { display: inline-block; padding-block: 0.625rem; } }

/* Landscape phones: short viewports get compact chrome and no forced full-height sections */
@media (orientation: landscape) and (max-height: 32rem) {
  :root { --nav-h: 3rem; }
  .hero-full { min-block-size: auto; }
}

/* Very wide screens: cap composition width, let backgrounds bleed, scale root size gently above 1440 */
.container-max { max-inline-size: 100rem; margin-inline: auto; }
@media (min-width: 90rem) {
  html { font-size: clamp(100%, 1.111vw, 137.5%); } /* 16px at 1440 -> 22px at 1980+, respects user default */
}

/* 100vw without horizontal scrollbar: Chrome 145+ subtracts the scrollbar when the gutter is reserved */
html { scrollbar-gutter: stable; }

/* Hover-only affordances */
@media (hover: hover) and (pointer: fine) { .card:hover .card__reveal { opacity: 1; } }
```
```ts
// app/layout.tsx (excerpt) - enable env(safe-area-inset-*) on iOS
import type { Viewport } from "next";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
```
**Tune:** Tailwind 4 breakpoints: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem; container variants `@sm` 24rem, `@md` 28rem, `@lg` 32rem, `@xl` 36rem, `@2xl` 42rem, `@3xl` 48rem. Content max width 72-100rem; above that, scale type rather than widening lines.  
**A11y/perf:** Never disable zoom (`maximum-scale=1`). The root font-size clamp keeps `100%` as the floor, so user font preferences still win. Test: 320px width, 200% zoom, landscape iPhone, 2560px desktop, keyboard only.

### 18. Visual hierarchy and whitespace
**Looks like:** Within one second you know the one thing the section wants (primary), the two things that support it (secondary), and where the rest lives (tertiary). Whitespace is deliberate: tight inside groups, generous between them, lavish around the most important element.  
**Use when / avoid when:** A design audit tool for every section. Refactoring UI's core move: emphasize by de-emphasizing (make secondary text quieter instead of making the primary louder), and use weight and color before size.  
**Stack:** reference + CSS

| Lever | Primary | Secondary | Tertiary |
|---|---|---|---|
| Size | step-3 to display | step-0 to step-1 | step--1 |
| Weight | 500-700 (or 400 at display size) | 400-500 | 400 |
| Color | `--fg` | `--fg-muted` | `--fg-faint` |
| Space around | 2-3x group gap | group gap | element gap |
| Position | top-left of the reading path, or optical center | follows primary | edges, footers of cards |
| Contrast / color | accent allowed (one) | neutral | neutral |

```css
/* app/hierarchy.css */
/* Buttons: one primary per view; secondary is quieter, tertiary is just a link */
.btn--primary { background: var(--accent); color: var(--accent-contrast); }
.btn--secondary { background: transparent; color: var(--fg); box-shadow: inset 0 0 0 1px var(--border-strong); }
.btn--tertiary { background: none; color: var(--fg-muted); text-decoration: underline; text-underline-offset: 0.25em; text-decoration-color: var(--border-strong); }

/* Labels are a last resort: format data so it explains itself */
.meta { color: var(--fg-muted); font-size: var(--step--1); }            /* "12 Mar 2026 · 6 min read" beats "Date: ... Reading time: ..." */

/* Whitespace: internal padding <= external spacing, or the group falls apart */
.card { padding: var(--space-m); }
.card-grid { gap: var(--space-m); }                                     /* equal to padding: OK */
.section-head + .card-grid { margin-block-start: var(--space-xl); }     /* bigger: head binds less to the grid */
```
Audit checklist: squint at the section (blurred, what stands out first? it should be the primary); count accent uses (1-2 per viewport); check that every gap belongs to one of 3-4 spacing levels; remove one element and see if anything was lost (if not, keep it removed).  
**Tune:** section padding at least 2x the largest inner gap; primary headline gets 1.5-2x more space above than below.  
**A11y/perf:** De-emphasized text still needs contrast (APCA Lc 60 for secondary, Lc 30 minimum for tertiary; see `color-surfaces.md#8-contrast-wcag-2-vs-apca-and-testing`).

### 19. Alignment and optical adjustments
**Looks like:** Things that look aligned rather than measure aligned: play icons that look centered, big headlines whose left edge lines up with the body text, button labels centered on cap height, quotes whose marks hang outside the text block.  
**Use when / avoid when:** Always on display type, icons in circles, buttons/badges, pull quotes. These are the details that separate "built" from "designed" (Rauno Freiberg's "invisible details").  
**Stack:** CSS
```css
/* app/optical.css */

/* 1. Cap-height centering for buttons/badges/pills: trims half-leading above caps and below baseline.
      text-box: Chrome 133+, Safari 18.2+, Firefox 154+ (Baseline Aug 2026); padding fallback is fine elsewhere */
.btn, .badge, .pill { padding-block: 0.7em; line-height: 1; }
@supports (text-box: trim-both cap alphabetic) {
  .btn, .badge, .pill { text-box: trim-both cap alphabetic; padding-block: 0.85em; }
}

/* 2. Large type: cancel the side bearing so the stem aligns with body text below */
.display { margin-inline-start: -0.055em; }          /* tune per font: 0.03-0.08em */

/* 3. Hanging punctuation: Safari supports the property; fallback via negative indent */
.pull-quote p { hanging-punctuation: first last; }
@supports not (hanging-punctuation: first) {
  .pull-quote p.starts-with-quote { text-indent: -0.42em; }
}

/* 4. Play/triangle icons: geometric center != visual center; nudge toward the point */
.play-btn svg { translate: 8% 0; }

/* 5. Round and pointed shapes look smaller than squares at the same box size: overshoot */
.icon--circle { scale: 1.08; }
.icon--triangle { scale: 1.12; }

/* 6. Icon + text: size to the font, sit on the baseline region */
.inline-icon { inline-size: 1em; block-size: 1em; vertical-align: -0.125em; flex: none; }

/* 7. Visual center is slightly above geometric center: lift centered compositions */
.center-optical { display: grid; place-content: center; min-block-size: 100svh; padding-block-end: 6svh; }

/* 8. Numbers in tables/stats/prices: equal widths so columns and counters do not jitter */
.num { font-variant-numeric: tabular-nums lining-nums; }

/* 9. Buttons with a trailing icon: less padding on the icon side */
.btn--icon-end { padding-inline: 1.1em 0.85em; gap: 0.45em; }
```
**Tune:** side-bearing correction grows with size (0 at body size, 0.04-0.08em at 100px+); play icon nudge 5-10% of icon width; optical lift 3-8svh.  
**A11y/perf:** All static CSS. Never use `text-indent` hacks on text that may wrap from a non-quote first character (it would shift the whole first line); gate with a class.

## Gotchas
- `position: sticky` does nothing: an ancestor has `overflow: hidden/auto/scroll`, or the sticky item is stretched by grid/flex. Fix: `overflow: clip` on ancestors, `align-self: start` on the sticky item.
- `position: fixed` elements (nav, cursor, modals) jump or scroll away inside a transformed/filtered ancestor (smooth-scroll wrappers, animated page containers). Fix: render them outside that ancestor (portal to `body`).
- Grid/flex children overflow with long words, code blocks or wide images because `min-width: auto`. Fix: `minmax(0, 1fr)` tracks and `min-inline-size: 0` on flex children.
- `width: 100vw` full-bleed causes horizontal scroll where scrollbars take space. Fix: breakout grid (recipe 1); from Chrome 145, `scrollbar-gutter: stable` on `html` makes `100vw` scrollbar-aware.
- `100vh` heroes are taller than the visible screen on mobile. Fix: `100svh` (stable) or `100dvh` (tracks toolbar, can cause relayout while scrolling).
- `auto-fit` vs `auto-fill`: `auto-fit` collapses empty tracks and stretches few items to full width; `auto-fill` keeps empty tracks. Pick `auto-fill` when 2 items should not become two giant cards.
- `container-type: inline-size` on an element sized by its content (shrink-wrapped flex item, `inline-block`) collapses it to 0 width. Fix: give it a width from outside (`flex: 1`, grid track) or put the container on a parent.
- Subgrid cards misalign when `grid-row: span N` does not match the number of child rows. Fix: keep the internal structure fixed (empty element if needed).
- `grid-template-areas` / `order` visual reordering desyncs keyboard and screen-reader order. Fix: reorder the DOM, not the paint.
- Anchor links hide headings under a fixed/sticky nav. Fix: `html { scroll-padding-top: calc(var(--nav-h) + 1rem); }`.
- Marquee stutters or jumps at the loop point when using `gap`. Fix: per-item `padding-inline-end` and translate exactly `-50%` of a track holding the set twice.
- `scroll-snap-type: y mandatory` on long pages traps users inside tall sections. Fix: `proximity`, or snap only in horizontal galleries.
- Hidden scrollbars on horizontal galleries strand mouse users. Fix: arrow buttons (recipe 15) or keep `scrollbar-width: thin`.
- Overflowing trailing padding in horizontal scrollers is ignored in some older engines (last card touches the edge). Fix: add an empty `::after` column item or rely on `scroll-padding-inline`.
- Pure `vw` font sizes ignore zoom (WCAG 1.4.4). Fix: rem + vw inside `clamp()` (recipe 3).
- `body { overflow: hidden }` for an open menu shifts layout by the scrollbar width and kills sticky. Fix: `scrollbar-gutter: stable` on `html`, or use `<dialog>` / a scroll-lock utility.
- Bento cells with a bordered, shadowed mockup inside a bordered, shadowed cell (card-in-card) look cheap. Fix: bleed the visual to the cell edge or use the nested radius rule with no inner shadow.
- Hero content below the fold on 1366x768 laptops (the most common small laptop). Fix: cap display type by `svh`, test at 1366x650 visible area.

## Sources
- https://every-layout.dev/ (Stack, Cluster, Sidebar, Switcher, Cover, Grid, Frame, Reel, Center layouts)
- https://utopia.fyi/blog/clamp/ , https://utopia.fyi/space/calculator/
- https://ryanmulligan.dev/blog/layout-breakouts/
- https://www.joshwcomeau.com/css/full-bleed/
- https://ishadeed.com/article/modern-css-section-layout/ , https://ishadeed.com/article/css-container-query-guide/
- https://refactoringui.com/ (hierarchy, "emphasize by de-emphasizing", spacing systems)
- https://tailwindcss.com/docs/theme and https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css (breakpoints, container sizes)
- https://developer.chrome.com/blog/new-in-web-ui-io26 (text-fit, gap decorations, scroll-state queries)
- https://www.bram.us/2026/01/15/100vw-horizontal-overflow-no-more/
- https://www.smashingmagazine.com/2023/12/new-css-viewport-units-not-solve-classic-scrollbar-problem/
- https://webkit.org/blog/17758/when-will-css-grid-lanes-arrive-how-long-until-we-can-use-it/ , https://modern-css.com/css-grid-lanes/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-trim , https://developer.chrome.com/blog/css-text-box-trim
- https://linear.app/now/behind-the-latest-design-refresh , https://blog.logrocket.com/ux-design/linear-design/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Values in recipe 3 computed with the Utopia formula (script in the recipe) and cross-checked against Utopia's generated space output.