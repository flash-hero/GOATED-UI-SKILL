# Modern CSS for Premium Front Ends (2026 platform features, with support + fallbacks)
> Load when: styling or animating UI with platform features instead of JS: enter/exit animations from `display: none`, dialogs/popovers/tooltips/menus, accordions to `height: auto`, animated gradients/borders/counters, responsive components, color systems, typography polish, custom selects, masks/glass, and any time you must know whether a CSS feature is safe to ship today.
> Stack assumptions: plain CSS first (works in Next 16 App Router server components with a global stylesheet or CSS Modules). Tailwind CSS 4.3 equivalents in [recipe 32](#32-tailwind-v4-equivalents). React 19 client components only where JS is genuinely needed. Scroll-linked features live in `scroll-css-native.md`; full view-transition treatment in `page-transitions.md`; hover/cursor micro-interactions in `interactions.md`; palettes and surfaces in `color-surfaces.md`.

## Contents
- [Decision guide](#decision-guide)
- [Support snapshot (verified 2026-09-26)](#support-snapshot-verified-2026-09-26)
- Recipes
  - [1. Enter/exit from display:none: @starting-style + allow-discrete](#1-enterexit-from-displaynone-starting-style--allow-discrete)
  - [2. Animated `<dialog>` + `::backdrop` + `closedby`](#2-animated-dialog--backdrop--closedby)
  - [3. Popover API + invoker commands (+ popover=hint, interestfor)](#3-popover-api--invoker-commands--popoverhint-interestfor)
  - [4. Anchor positioning: tooltips, menus, sliding indicators](#4-anchor-positioning-tooltips-menus-sliding-indicators)
  - [5. Animate to height:auto: interpolate-size, calc-size, ::details-content](#5-animate-to-heightauto-interpolate-size-calc-size-details-content)
  - [6. @property: animated gradients, rotating borders, counters](#6-property-animated-gradients-rotating-borders-counters)
  - [7. Individual transform properties](#7-individual-transform-properties)
  - [8. linear() easing: springs and bounces in CSS](#8-linear-easing-springs-and-bounces-in-css)
  - [9. Container queries: size, units, style, name-only](#9-container-queries-size-units-style-name-only)
  - [10. :has() patterns](#10-has-patterns)
  - [11. Cascade architecture: @layer, nesting, @scope](#11-cascade-architecture-layer-nesting-scope)
  - [12. Subgrid for aligned card internals](#12-subgrid-for-aligned-card-internals)
  - [13. Color system: oklch, color-mix, relative colors, light-dark, contrast-color, alpha()](#13-color-system-oklch-color-mix-relative-colors-light-dark-contrast-color-alpha)
  - [14. Typography polish: text-wrap, text-box, hanging-punctuation, initial-letter](#14-typography-polish-text-wrap-text-box-hanging-punctuation-initial-letter)
  - [15. field-sizing: content](#15-field-sizing-content)
  - [16. sibling-index() / sibling-count() stagger and radial layouts](#16-sibling-index--sibling-count-stagger-and-radial-layouts)
  - [17. CSS logic: if(), @function, typed attr(), progress(), random()](#17-css-logic-if-function-typed-attr-progress-random)
  - [18. corner-shape: squircles, notches, scoops](#18-corner-shape-squircles-notches-scoops)
  - [19. shape() and animated clip-path](#19-shape-and-animated-clip-path)
  - [20. Masonry: display grid-lanes](#20-masonry-display-grid-lanes)
  - [21. reading-flow for visually reordered layouts](#21-reading-flow-for-visually-reordered-layouts)
  - [22. Customizable `<select>` (appearance: base-select)](#22-customizable-select-appearance-base-select)
  - [23. View transitions (pointer)](#23-view-transitions-pointer)
  - [24. Masks and mask-composite](#24-masks-and-mask-composite)
  - [25. backdrop-filter glass done right](#25-backdrop-filter-glass-done-right)
  - [26. image-set() for format/density switching](#26-image-set-for-formatdensity-switching)
  - [27. Forms: :user-valid / :user-invalid, accent-color](#27-forms-user-valid--user-invalid-accent-color)
  - [28. Underline craft: text-decoration-thickness / text-underline-offset](#28-underline-craft-text-decoration-thickness--text-underline-offset)
  - [29. Scrollbar styling (pointer)](#29-scrollbar-styling-pointer)
  - [30. Media features: hover/pointer and prefers-*](#30-media-features-hoverpointer-and-prefers-)
  - [31. Viewport units: svh / lvh / dvh](#31-viewport-units-svh--lvh--dvh)
  - [32. Tailwind v4 equivalents](#32-tailwind-v4-equivalents)
- [Gotchas](#gotchas)
- [Sources](#sources)
- [Support matrix](#support-matrix)

## Decision guide
| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| Menus/toasts/popovers fade+scale in AND out, no JS timers | `@starting-style` + `transition-behavior: allow-discrete` | CSS | [1](#1-enterexit-from-displaynone-starting-style--allow-discrete) |
| Modal with animated dim/blur backdrop, light dismiss | `<dialog>` + `::backdrop` + `command="show-modal"` + `closedby` | CSS + 0-5 lines JS | [2](#2-animated-dialog--backdrop--closedby) |
| Dropdown/share sheet without state management | `popover` + `commandfor`/`command` | HTML only | [3](#3-popover-api--invoker-commands--popoverhint-interestfor) |
| Tooltip/menu that flips at viewport edges | anchor positioning + `position-try-fallbacks` | CSS (Floating UI fallback ~3 kb) | [4](#4-anchor-positioning-tooltips-menus-sliding-indicators) |
| Accordion that animates to natural height | `::details-content` + `interpolate-size` (or grid 0fr->1fr) | CSS | [5](#5-animate-to-heightauto-interpolate-size-calc-size-details-content) |
| Spinning gradient border, animated gradient, count-up number | `@property` typed custom property | CSS, paint per frame | [6](#6-property-animated-gradients-rotating-borders-counters) |
| Hover lift + press scale + JS transform without conflicts | `translate` / `scale` / `rotate` properties | CSS, compositor | [7](#7-individual-transform-properties) |
| Physical spring/bounce without a JS spring lib | `linear()` easing token | CSS | [8](#8-linear-easing-springs-and-bounces-in-css) |
| Card that adapts to its slot, fluid type per component | container queries + `cqi` | CSS | [9](#9-container-queries-size-units-style-name-only) |
| Parent reacts to child state, quantity layouts, dock magnify | `:has()` | CSS | [10](#10-has-patterns) |
| Predictable overrides, component scoping | `@layer`, nesting, `@scope` | CSS | [11](#11-cascade-architecture-layer-nesting-scope) |
| Card titles/buttons aligned across a row | `grid-template-rows: subgrid` | CSS | [12](#12-subgrid-for-aligned-card-internals) |
| One brand color -> full themed palette in light and dark | `oklch()` + relative colors + `light-dark()` | CSS | [13](#13-color-system-oklch-color-mix-relative-colors-light-dark-contrast-color-alpha) |
| No widows, optically centered buttons | `text-wrap`, `text-box` | CSS | [14](#14-typography-polish-text-wrap-text-box-hanging-punctuation-initial-letter) |
| Auto-growing textarea | `field-sizing: content` | CSS | [15](#15-field-sizing-content) |
| Stagger without inline `--i` | `sibling-index()` | CSS | [16](#16-sibling-index--sibling-count-stagger-and-radial-layouts) |
| Apple-style continuous corners | `corner-shape: squircle` | CSS, Chromium only | [18](#18-corner-shape-squircles-notches-scoops) |
| Responsive wave/blob edges that morph | `clip-path: shape()` | CSS | [19](#19-shape-and-animated-clip-path) |
| Pinterest masonry | `display: grid-lanes` (Safari) / columns fallback | CSS | [20](#20-masonry-display-grid-lanes) |
| Fully designed `<select>` keeping native a11y | `appearance: base-select` | CSS | [22](#22-customizable-select-appearance-base-select) |
| Fading edges, spotlight reveals, gradient borders | `mask-image`, `mask-composite` | CSS | [24](#24-masks-and-mask-composite) |
| Frosted nav/cards | `backdrop-filter` (static) | GPU heavy on large areas | [25](#25-backdrop-filter-glass-done-right) |
| Links that feel crafted | `text-underline-offset` transitions | CSS | [28](#28-underline-craft-text-decoration-thickness--text-underline-offset) |
| Hero that fits mobile screens with URL bar | `svh` / `lvh` / `dvh` | CSS | [31](#31-viewport-units-svh--lvh--dvh) |

## Support snapshot (verified 2026-09-26)
Sources: MDN browser-compat-data 8.1.3 (2026-09-24), webstatus.dev API (Baseline), WebKit Safari 26.x/27 posts. Stables: Chrome/Edge 154, Firefox 156, Safari 27.0 (2026-09-14).
- **Baseline widely** (ship freely): individual transforms, `linear()`, container size queries + `cq*` units, `:has()`, nesting, `@layer`, subgrid, `oklch/oklab`, `color-mix()`, masks (unprefixed), `image-set()`, `:user-valid/:user-invalid`, `<dialog>`, svh/lvh/dvh, `grid-template-rows` interpolation.
- **Baseline newly** (ship, keep a light fallback for 1-2 year old devices): `@starting-style` + `transition-behavior` (2024-08), `@property` (2024-07), relative colors (2024-09), `light-dark()` (2024-05), `text-wrap: balance` (2024-05), `backdrop-filter` (2024-09), Popover (2025-01), `::details-content` (2025-09), same-document view transitions (2025-10), invoker commands (2025-12), `shape()` (2026-02), `@scope` (2026-03), `contrast-color()` (2026-04), container style queries (2026-05), `field-sizing` (2026-06), `sibling-index()/sibling-count()` (2026-08). Per BCD also now in all three engines: `text-box` (Firefox 154), `progress()` (Firefox 155), `alpha()` (Safari 27), anchor positioning core (C125 / F147 / S26; webstatus still reports "limited" pending `position-anchor` initial-value alignment fixed in C151 / F151 / S27).
- **Limited** (progressive enhancement only): `interpolate-size`/`calc-size()` (Chrome 129), `transition` of `display` (no Firefox), `overlay` (Chrome only), `text-wrap: pretty` (no Firefox), `if()` (Chrome 137), `@function` (Chrome 139), typed `attr()` (Chrome 133, Firefox 155), `corner-shape` (Chrome 139), `display: grid-lanes` (Safari 26.4), `reading-flow` (Chrome 137), customizable select (Chrome 135, Safari 27), `popover="hint"` (C151, F153), `interestfor` (Chrome 142), `closedby` (C134, F141), cross-document view transitions (C126, S18.2), `hanging-punctuation` (Safari), `initial-letter` (Chrome 110, Safari prefixed), `random()` (Safari 26.2), `prefers-reduced-transparency` (Chrome 118).

## Recipes

### 1. Enter/exit from display:none: @starting-style + allow-discrete
**Looks like:** a menu or popover that fades up 8px and scales from 0.97 when opened, and reverses when closed; a toast that animates in the moment it is inserted into the DOM. No `setTimeout`, no `onAnimationEnd` bookkeeping.  
**Use when / avoid when:** any element toggled via `display`, `[hidden]`, `popover`, `<dialog>`, or conditional rendering. Avoid big travel distances (>12px) for menus; that reads as template motion.  
**Stack:** CSS
```css
/* app/styles/overlay-motion.css */
:root {
  --dur-overlay-in: 220ms;
  --dur-overlay-out: 160ms;
  --ease-out-quint: cubic-bezier(.22, 1, .36, 1);
  --ease-in-quad: cubic-bezier(.55, .085, .68, .53);
}

/* 1. Popover: base styles = CLOSED (exit) state */
.menu-pop {
  opacity: 0;
  translate: 0 .5rem;
  scale: .97;
  transform-origin: top center;
  transition:
    opacity var(--dur-overlay-out) var(--ease-in-quad),
    translate var(--dur-overlay-out) var(--ease-in-quad),
    scale var(--dur-overlay-out) var(--ease-in-quad),
    display var(--dur-overlay-out) allow-discrete,   /* keep it displayed until the exit finishes */
    overlay var(--dur-overlay-out) allow-discrete;   /* keep it in the top layer (Chromium) */
}
/* 2. OPEN state */
.menu-pop:popover-open {
  opacity: 1;
  translate: 0 0;
  scale: 1;
  transition-duration: var(--dur-overlay-in);
  transition-timing-function: var(--ease-out-quint);
}
/* 3. First frame after display:none -> shown: where the entry animates FROM */
@starting-style {
  .menu-pop:popover-open {
    opacity: 0;
    translate: 0 .5rem;
    scale: .97;
  }
}

/* Toast: animates in on DOM insertion, no class juggling */
.toast {
  transition: opacity 240ms var(--ease-out-quint), translate 240ms var(--ease-out-quint);
  @starting-style {                      /* nested form is equivalent */
    opacity: 0;
    translate: 0 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-pop, .toast { translate: none; scale: none; }
  @starting-style { .menu-pop:popover-open, .toast { translate: none; scale: none; } }
}
```
```html
<button popovertarget="more-menu">More</button>
<div id="more-menu" popover class="menu-pop">...</div>
```
**Tune:** in 180-240ms, out 120-180ms (exits faster than entries); translate 4-10px; scale .95-.98.  
**A11y/perf:** only opacity/transform-family animate. Reduced motion keeps the fade (feedback) and drops movement. Support: `@starting-style` C117 / F129 / S17.5; `transition-behavior` C117 / F129 / S17.4. **Firefox does not transition `display`**, so exits are instant there (entries still animate); `overlay` is Chromium-only, so in Safari the closing element leaves the top layer immediately and may paint under sibling content during its exit. Both degrade gracefully.

### 2. Animated `<dialog>` + `::backdrop` + `closedby`
**Looks like:** a centered modal that rises 16px and settles while the page behind dims to 55% ink with a light blur; Esc, backdrop click, and the close button all dismiss with the reverse animation.  
**Use when / avoid when:** confirmations, forms, media lightboxes. Avoid modals for content that should be a page (deep-linkable) or for non-blocking info (use popover).  
**Stack:** HTML + CSS (+ 6 lines JS fallback for light dismiss in Safari)
```html
<!-- components/confirm-dialog.html -->
<button type="button" commandfor="confirm-delete" command="show-modal">Delete project</button>

<dialog id="confirm-delete" class="modal" closedby="any" aria-labelledby="confirm-title">
  <div class="modal__body">
    <h2 id="confirm-title">Delete project?</h2>
    <p>This removes the project and its 14 files. This cannot be undone.</p>
    <form method="dialog" class="modal__actions">
      <button type="button" commandfor="confirm-delete" command="close">Cancel</button>
      <button value="delete" class="btn-danger">Delete</button>
    </form>
  </div>
</dialog>
```
```css
/* app/styles/dialog.css */
:root { --dur-modal: 260ms; --ease-out-quint: cubic-bezier(.22, 1, .36, 1); --scrim: oklch(0.16 0.02 260); }

.modal {
  padding: 0;                          /* padding on the inner body so backdrop clicks hit <dialog> itself */
  border: 0;
  border-radius: 1.25rem;
  max-inline-size: min(34rem, calc(100vw - 2rem));
  opacity: 0;
  translate: 0 1rem;
  scale: .98;
  transition:
    opacity var(--dur-modal) var(--ease-out-quint),
    translate var(--dur-modal) var(--ease-out-quint),
    scale var(--dur-modal) var(--ease-out-quint),
    display var(--dur-modal) allow-discrete,
    overlay var(--dur-modal) allow-discrete;
}
.modal[open] { opacity: 1; translate: 0 0; scale: 1; }
@starting-style { .modal[open] { opacity: 0; translate: 0 1rem; scale: .98; } }

.modal::backdrop {
  background: oklch(from var(--scrim) l c h / 0);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);          /* static blur; only the tint animates */
  transition:
    background-color var(--dur-modal) linear,
    display var(--dur-modal) allow-discrete,
    overlay var(--dur-modal) allow-discrete;
}
.modal[open]::backdrop { background: oklch(from var(--scrim) l c h / .55); }
@starting-style { .modal[open]::backdrop { background: oklch(from var(--scrim) l c h / 0); } }

.modal__body { padding: clamp(1.25rem, 4vw, 2rem); }
html:has(.modal[open]:modal) { overflow: hidden; }       /* scroll lock; pair with scrollbar-gutter: stable */

@media (prefers-reduced-motion: reduce) {
  .modal { translate: none; scale: none; }
  @starting-style { .modal[open] { translate: none; scale: none; } }
}
```
```ts
// lib/dialog-light-dismiss.ts - only for engines without closedby (Safari as of 27)
type DialogWithRequestClose = HTMLDialogElement & { requestClose?: () => void };

export function enableLightDismiss(dialog: DialogWithRequestClose): () => void {
  if ("closedBy" in dialog) return () => {};
  const onClick = (e: MouseEvent) => {
    if (e.target !== dialog) return;                               // click landed on the backdrop area
    if (typeof dialog.requestClose === "function") dialog.requestClose();   // fires "cancel", respects preventDefault
    else dialog.close();
  };
  dialog.addEventListener("click", onClick);
  return () => dialog.removeEventListener("click", onClick);
}
```
**Tune:** rise 8-20px; backdrop alpha .4-.65; blur 0-8px (more looks like a 2021 glassmorphism template).  
**A11y/perf:** `showModal()` (or `command="show-modal"`) gives focus trapping, inert background, Esc handling, and top-layer stacking for free; return focus is automatic. `closedby`: `any` (Esc + backdrop), `closerequest` (Esc only), `none`. Support: `<dialog>` widely; `closedby` C134 / F141 / not Safari; `requestClose()` C134 / F139 / S18.4; command invokers C135 / F144 / S26.2.

### 3. Popover API + invoker commands (+ popover=hint, interestfor)
**Looks like:** share sheets, dropdowns, "more" menus, info bubbles that open on click, light-dismiss on outside click/Esc, stack correctly above everything (top layer), and restore focus, with zero JS.  
**Use when / avoid when:** any non-modal floating UI. Avoid for content that must stay open while users interact elsewhere unless you use `popover="manual"`.  
**Stack:** HTML (+ CSS from [1](#1-enterexit-from-displaynone-starting-style--allow-discrete) and [4](#4-anchor-positioning-tooltips-menus-sliding-indicators))
```html
<!-- components/popovers.html -->
<!-- auto popover: light dismiss, closes other auto popovers -->
<button commandfor="share-sheet" command="toggle-popover">Share</button>
<div id="share-sheet" popover class="menu-pop">
  <button commandfor="share-sheet" command="hide-popover">Close</button>
</div>

<!-- manual popover: only closes when told to (toasts, persistent panels) -->
<div id="saved-toast" popover="manual" role="status">Saved</div>

<!-- hint popover: tooltip-style, does NOT close open auto popovers (C151 / F153; Safari not yet) -->
<button commandfor="kbd-tip" command="toggle-popover" aria-describedby="kbd-tip">Shortcuts</button>
<div id="kbd-tip" popover="hint">Press ? to see all shortcuts</div>

<!-- custom command: any element can listen for "command" events -->
<button commandfor="reel" command="--play">Play reel</button>
<video id="reel" src="/reel.mp4" muted playsinline></video>
<script type="module">
  const reel = document.getElementById("reel");
  reel.addEventListener("command", (event) => {
    if (event.command === "--play") reel.play();
  });
</script>
```
Built-in `command` values: `show-modal`, `close`, `request-close` (dialogs); `show-popover`, `hide-popover`, `toggle-popover` (popovers); custom commands must start with `--`. Older `popovertarget` + `popovertargetaction` still works everywhere popovers do.

`interestfor` (Chrome 142 only): shows a popover on hover, keyboard focus, or long-press after a delay; great for link previews and profile cards:
```html
<a href="/team/ada" interestfor="ada-card">Ada Lovelace</a>
<div id="ada-card" popover="hint" class="menu-pop">Engineer, 12 projects</div>
```
```css
/* app/styles/interest.css - delay before showing / before hiding */
[interestfor] { interest-delay: .4s .2s; }
```
**Tune:** hover-intent delays 300-500ms in, 150-250ms out.  
**A11y/perf:** invokers get `aria-expanded` and focus management automatically. Popover `hint` is for supplementary text, not interactive content. Support: popover C114 / F125 / S17 (iOS 18.3 full), Baseline 2025-01; invoker commands Baseline 2025-12 (C135 / F144 / S26.2); `request-close` C139 / F144 / S26.2. Without `interestfor`, keep a click/focus path (`command="toggle-popover"`).

### 4. Anchor positioning: tooltips, menus, sliding indicators
**Looks like:** a dropdown that sits under its button, matches its width, flips above when near the bottom of the viewport, and hides when its button scrolls out of view; a nav pill that slides between links on hover.  
**Use when / avoid when:** all tethered UI. Keep Floating UI only where you need identical behaviour in older engines. Avoid anchoring across scroll containers you do not control (hidden-anchor bugs).  
**Stack:** CSS (fallback: Floating UI)
```html
<button class="menu-trigger" commandfor="acct-menu" command="toggle-popover">Account</button>
<div id="acct-menu" popover class="menu-pop anchored-menu">...</div>
```
```css
/* app/styles/anchor.css */
.menu-trigger { anchor-name: --acct-trigger; }

.anchored-menu {
  position: absolute;                 /* popovers default to fixed + inset:0 + margin:auto: reset them */
  inset: auto;
  margin: 0;
  position-anchor: --acct-trigger;
  position-area: block-end span-inline-end;       /* below, aligned to the trigger's start edge */
  margin-block-start: .5rem;                      /* gap; flips with the fallback */
  min-inline-size: anchor-size(inline);           /* at least as wide as the trigger */
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
  position-visibility: anchors-visible;           /* Chrome/Firefox keyword */
  position-visibility: anchor-visible;            /* renamed keyword (Safari 27); invalid values are ignored */
}

/* Tooltip with arrow-free, centered placement */
.tip-anchor { anchor-name: --tip; }
.tip {
  position: absolute;
  inset: auto;
  margin: 0;
  position-anchor: --tip;
  position-area: block-start;                     /* centered above */
  margin-block-end: .4rem;
  position-try-fallbacks: flip-block;
  max-inline-size: 28ch;
}

/* Sliding hover indicator: one pseudo-element follows whichever link is anchored */
.nav { position: relative; display: flex; gap: .25rem; }
.nav a { position: relative; z-index: 1; padding: .5rem .9rem; }
.nav:not(:hover, :focus-within) a[aria-current="page"],
.nav a:is(:hover, :focus-visible) { anchor-name: --nav-hit; }
.nav::before {
  content: "";
  position: absolute;
  position-anchor: --nav-hit;
  top: anchor(top);
  bottom: anchor(bottom);
  left: anchor(left);
  right: anchor(right);
  border-radius: 999px;
  background: color-mix(in oklch, currentColor 10%, transparent);
  transition: top .3s var(--ease-out-quint, ease-out), bottom .3s var(--ease-out-quint, ease-out), left .3s var(--ease-out-quint, ease-out), right .3s var(--ease-out-quint, ease-out);
}
@supports not (anchor-name: --a) {
  .nav::before { display: none; }
  .nav a[aria-current="page"] { background: color-mix(in oklch, currentColor 10%, transparent); border-radius: 999px; }
}
@media (prefers-reduced-motion: reduce) { .nav::before { transition: none; } }
```
Custom fallback positions: `@position-try --left-side { position-area: inline-start; margin: 0 .5rem 0 0; }` then `position-try-fallbacks: flip-block, --left-side;`. `position-try-order: most-height` picks the option with the most room.  
**Tune:** gap .25-.75rem; `span-inline-end` vs `center` alignment; indicator transition 250-350ms.  
**A11y/perf:** positioning is layout-time, no scroll listeners. Inset properties set with `anchor()` are transitionable (Chrome's anchor blog notes positioned values can be transitioned); where an engine does not interpolate, the indicator jumps, which is acceptable. Support: `anchor-name`, `position-area`, `anchor()`, `anchor-size()`, `@position-try` in C125-129 / F147 / S26; `position-visibility` S26.2; `position-anchor: normal` semantics C151 / F151 / S27.

### 5. Animate to height:auto: interpolate-size, calc-size, ::details-content
**Looks like:** FAQ accordions and "read more" panels that smoothly open to their natural height and close back, content fading in slightly behind.  
**Use when / avoid when:** accordions, disclosure panels, expanding cards. Avoid animating height of large, content-heavy regions on every interaction (layout cost each frame); keep it for small panels.  
**Stack:** CSS
```html
<details class="faq" name="faq">          <!-- same name = exclusive accordion (C120 / F130 / S17.2) -->
  <summary>What is included?</summary>
  <div class="faq__body"><p>Design, build, and three rounds of iteration.</p></div>
</details>
```
```css
/* app/styles/accordion.css */
:root {
  interpolate-size: allow-keywords;        /* opt the page into keyword interpolation (Chrome 129+) */
  --dur-disclose: 350ms;
  --ease-in-out-quart: cubic-bezier(.77, 0, .175, 1);
}
.faq::details-content {
  block-size: 0;
  overflow: clip;
  transition:
    block-size var(--dur-disclose) var(--ease-in-out-quart),
    content-visibility var(--dur-disclose) allow-discrete;   /* keep content rendered while closing */
}
.faq[open]::details-content { block-size: auto; }
.faq__body { padding-block: .5rem 1.25rem; opacity: 0; translate: 0 -.25rem; transition: opacity 250ms ease-out, translate 250ms ease-out; }
.faq[open] .faq__body { opacity: 1; translate: 0 0; }
.faq summary { cursor: pointer; list-style: none; }
.faq summary::-webkit-details-marker { display: none; }

/* Per-property alternative (no global opt-in): */
.panel[data-open="true"] { block-size: calc-size(auto, size); }

/* Universal fallback for any element (widely supported): 0fr -> 1fr grid rows */
.collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--dur-disclose) var(--ease-in-out-quart);
}
.collapse[data-open="true"] { grid-template-rows: 1fr; }
.collapse > .collapse__inner { min-block-size: 0; overflow: hidden; }

@media (prefers-reduced-motion: reduce) {
  .faq::details-content, .collapse { transition-duration: 0s; }
}
```
**Tune:** 280-420ms, ease-in-out (height changes read better symmetric); content fade 200-280ms.  
**A11y/perf:** `<details>` is keyboard- and screen-reader-native; find-in-page auto-opens it. Without `interpolate-size` (Firefox, Safari as of 27) the `::details-content` version opens instantly but correctly; use the grid version where the animation matters in all engines. Support: `::details-content` Baseline 2025-09 (C131 / F143 / S18.4); `interpolate-size`/`calc-size()` Chrome 129 only.

### 6. @property: animated gradients, rotating borders, counters
**Looks like:** a thin highlight that orbits a card's border; a gradient whose stops glide on hover instead of snapping; a KPI that counts up from 0 to 12,840.  
**Use when / avoid when:** one or two accents per page (featured plan card, primary CTA). Orbiting borders on every card is a 2024 AI-template tell.  
**Stack:** CSS
```css
/* app/styles/property-effects.css */
@property --border-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
@property --stop-a { syntax: "<color>"; inherits: false; initial-value: oklch(0.72 0.17 300); }
@property --count { syntax: "<integer>"; inherits: false; initial-value: 0; }

/* 1. Rotating conic border (1px) */
.orbit-card {
  --surface: oklch(0.18 0.01 260);
  border: 1px solid transparent;
  border-radius: 1.25rem;
  background:
    linear-gradient(var(--surface), var(--surface)) padding-box,
    conic-gradient(from var(--border-angle), transparent 0 65%, oklch(0.85 0.12 200) 80%, transparent 95%) border-box;
  animation: orbit 5s linear infinite;
}
@keyframes orbit { to { --border-angle: 360deg; } }

/* 2. Gradient stop that transitions (impossible without @property) */
.cta-gradient {
  background: linear-gradient(120deg, var(--stop-a), oklch(0.7 0.15 30));
  transition: --stop-a 400ms ease-out;
}
.cta-gradient:hover { --stop-a: oklch(0.78 0.16 220); }

/* 3. Count-up number, pure CSS (trigger by adding .is-in, e.g. via IntersectionObserver) */
.stat-num {
  --to: 12840;
  counter-reset: stat var(--count);
  transition: --count 1.8s cubic-bezier(.16, 1, .3, 1);
  font-variant-numeric: tabular-nums;
}
.stat-num::after { content: counter(stat); }
.stat-num.is-in { --count: var(--to); }

@media (prefers-reduced-motion: reduce) {
  .orbit-card { animation: none; --border-angle: 200deg; }
  .stat-num { transition: none; }
}
```
```html
<p class="stat"><span class="sr-only">12,840 projects shipped</span><span class="stat-num" aria-hidden="true"></span> projects</p>
```
**Tune:** orbit 4-8s per turn (faster = gamer RGB); highlight arc 15-25% of the circle; count-up 1.2-2s expo-out. For locale-formatted, rolling-digit counters use `@number-flow/react` (see `component-recipes.md`).  
**A11y/perf:** animating a custom property used in a gradient repaints the element every frame: fine for a few small elements, avoid on full-screen backgrounds (use a rotating pseudo-element with `rotate` instead). `inherits: false` keeps style recalc local. Support: `@property` Baseline 2024-07 (C85 / F128 / S16.4).

### 7. Individual transform properties
**Looks like:** a card lifts 4px on hover, compresses to 0.98 on press, and a JS/GSAP drag transform still applies on top, with no overwritten `transform` strings.  
**Use when / avoid when:** always prefer `translate`/`rotate`/`scale` over `transform` for UI state. Keep `transform` for matrix-style composition (skew, perspective chains) or when a library owns it.  
**Stack:** CSS
```css
/* app/styles/transforms.css */
:root { --ease-out-quint: cubic-bezier(.22, 1, .36, 1); }
.lift-card {
  transition: translate 300ms var(--ease-out-quint), scale 120ms ease-out, rotate 300ms var(--ease-out-quint);
}
@media (hover: hover) and (pointer: fine) {
  .lift-card:hover { translate: 0 -4px; }
}
.lift-card:active { scale: .98; }
.lift-card[data-pinned] { rotate: -1.5deg; }
/* Application order is fixed: translate -> rotate -> scale -> transform (so a library's transform composes after) */
```
**Tune:** lift 2-6px; press .96-.985; rotate 1-3deg.  
**A11y/perf:** each property transitions independently (no restarting the whole transform), all compositor-friendly. Tailwind v4 `translate-*`, `scale-*`, `rotate-*` utilities already emit these properties. Support: widely (C104 / F72 / S14.1).

### 8. linear() easing: springs and bounces in CSS
**Looks like:** toggles and popovers that overshoot and settle like a spring (iOS-like), badges that bounce once, all in a CSS `transition`.  
**Use when / avoid when:** small, playful UI (toggles, likes, toasts). Avoid springs on large surfaces or text blocks (wobbling paragraphs look broken) and on anything with long durations.  
**Stack:** CSS
```css
/* app/styles/easing-tokens.css */
:root {
  /* spring: from Chrome's linear() guide (Jake Archibald generator), ~1s */
  --ease-spring: linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1.004 83.8%, 1);
  --dur-spring: 900ms;
  /* coarse bounce (three decaying hops) */
  --ease-bounce: linear(0, 0.063, 0.25, 0.563, 1 36.4%, 0.812, 0.75, 0.813, 1 72.7%, 0.953, 0.938, 0.953, 1 90.9%, 0.984, 1);
  --dur-bounce: 700ms;
  /* fallback for engines without linear(): all current engines have it, this is for very old devices */
  --ease-spring-fallback: cubic-bezier(.34, 1.56, .64, 1);
}
.switch__thumb { transition: translate var(--dur-spring) var(--ease-spring); }
.switch[aria-checked="true"] .switch__thumb { translate: 1.25rem 0; }
.like-btn.is-liked svg { animation: pop var(--dur-bounce) var(--ease-bounce); }
@keyframes pop { from { scale: .6; } to { scale: 1; } }
@media (prefers-reduced-motion: reduce) {
  :root { --ease-spring: ease-out; --ease-bounce: ease-out; --dur-spring: 150ms; --dur-bounce: 150ms; }
}
```
**Tune:** generate your own with https://linear-easing-generator.netlify.app (paste a spring from Motion or a JS function); 30-60 points is plenty. Pair spring duration with its settle time (the curve encodes it: changing duration changes stiffness feel).  
**A11y/perf:** easing costs nothing. Reduced motion swaps tokens globally. Support: Baseline widely since 2026-06 (C113 / F112 / S17.2).

### 9. Container queries: size, units, style, name-only
**Looks like:** the same card renders stacked in a sidebar, side-by-side in the main column, and poster-style in a hero slot; its title scales with the card, not the viewport.  
**Use when / avoid when:** any reusable component. Viewport media queries remain right for page-level layout (nav collapse, grid column count).  
**Stack:** CSS
```css
/* app/styles/card.css */
.card-slot { container: card / inline-size; }        /* name / type */

.card { display: grid; gap: 1rem; padding: clamp(1rem, 4cqi, 2rem); }
.card__title { font-size: clamp(1.125rem, 1rem + 2.5cqi, 2.25rem); text-wrap: balance; }
.card__media { aspect-ratio: 4 / 3; border-radius: .75rem; overflow: clip; }

@container card (width >= 30rem) {
  .card { grid-template-columns: minmax(10rem, 40%) 1fr; align-items: center; }
}
@container card (width >= 52rem) {
  .card { grid-template-columns: 1fr; }
  .card__media { aspect-ratio: 21 / 9; }
  .card__title { font-size: clamp(2rem, 1rem + 4cqi, 4rem); }
}

/* Style queries: branch on a custom property set by an ancestor (Baseline 2026-05) */
.section--loud { --tone: loud; }
@container style(--tone: loud) {
  .card { background: var(--brand); color: var(--on-brand); }
}

/* Name-only query: style anything inside a named container regardless of size (C148 / F149 / S26.4) */
.sidebar { container-name: sidebar; }
@container sidebar {
  .card__media { display: none; }
}
```
**Tune:** breakpoints in rem at content-driven widths (where the layout breaks), usually 2-3 per component; `cqi` for padding and fluid type inside components.  
**A11y/perf:** `inline-size` containment is cheap; avoid `container-type: size` unless the container has an explicit height (it collapses otherwise). Support: size queries + `cq*` units widely (C105 / F110 / S16); style queries for custom properties C111 / F151 / S18; `@container` name-only C148 / F149 / S26.4.

### 10. :has() patterns
**Looks like:** a form field glows when its input is focused; a card highlights when its link is hovered; a grid switches to two columns once it holds four items; a macOS-dock magnification on hovered icon and neighbors, all without JS.  
**Use when / avoid when:** state that lives in the DOM (checked, focused, open, count). Avoid page-wide `:has()` on broad selectors (`body:has(*:hover)`) that invalidate styles on every mouse move.  
**Stack:** CSS
```css
/* app/styles/has-patterns.css */
/* parent state */
.field:has(input:focus-visible) { outline: 2px solid var(--brand); outline-offset: 2px; }
.card:has(a:is(:hover, :focus-visible)) { translate: 0 -2px; box-shadow: 0 18px 40px -24px oklch(0 0 0 / .45); }

/* form state */
.form:has(:user-invalid) .form__submit { opacity: .55; pointer-events: none; }
.plan:has(input[type="radio"]:checked) { border-color: var(--brand); background: oklch(from var(--brand) l c h / .06); }

/* quantity queries */
.gallery:has(> :nth-child(4)) { grid-template-columns: repeat(2, 1fr); }            /* 4 or more items */
.gallery:has(> :last-child:nth-child(3)) { grid-template-columns: 2fr 1fr 1fr; }     /* exactly 3 */
.list:not(:has(> li)) .list__empty { display: block; }                               /* empty state */

/* theme switch without JS */
html:has(#theme-dark:checked) { color-scheme: dark; }

/* dock magnification: hovered + previous + next siblings */
.dock { display: flex; align-items: end; gap: .5rem; }
.dock > * { transition: scale 200ms cubic-bezier(.22, 1, .36, 1); transform-origin: 50% 100%; }
@media (hover: hover) and (pointer: fine) {
  .dock > :hover { scale: 1.45; }
  .dock > :has(+ :hover), .dock > :hover + * { scale: 1.2; }
  .dock > :has(+ * + :hover), .dock > :hover + * + * { scale: 1.08; }
}
```
**Tune:** dock scale 1.3-1.6 center, 1.15-1.25 neighbors; lift 2-4px.  
**A11y/perf:** anchor `:has()` to a specific subject (`.card:has(...)`), prefer child combinators (`> `) for quantity queries. Support: widely (C105 / F121 / S15.4).

### 11. Cascade architecture: @layer, nesting, @scope
**Looks like:** nothing visible; it is why overrides stop being `!important` wars and why a `.prose` block's link styles never leak into the embedded card.  
**Use when / avoid when:** every project with more than one stylesheet or any third-party CSS. With Tailwind v4, remember it already emits `@layer theme, base, components, utilities`: unlayered CSS beats every layer, so put your own CSS inside a layer if utilities must still override it.  
**Stack:** CSS
```css
/* app/globals.css */
@layer reset, tokens, base, components, utilities, overrides;   /* order declared once, first */

@import url("./vendor/carousel.css") layer(components);          /* third-party CSS in a low layer */

@layer components {
  .card {
    padding: 1.5rem;
    border-radius: 1rem;

    &:hover { translate: 0 -2px; }                 /* & = .card */
    .card__title { font-weight: 600; }             /* relaxed nesting: no & needed for descendants */
    &.is-featured { outline: 1px solid var(--brand); }
    @media (width >= 48rem) { padding: 2rem; }     /* nested at-rules */
  }
}

/* @scope: styles apply inside .prose but stop at .not-prose islands (donut scope) */
@scope (.prose) to (.not-prose, pre, .embed) {
  :scope { max-inline-size: 68ch; line-height: 1.65; }
  a { text-decoration-thickness: 1px; text-underline-offset: .2em; }
  img { border-radius: .75rem; }
  h2 { margin-block: 2.5em .6em; }
}

/* @scope also resolves ties by proximity: the nearest scope root wins */
@scope (.theme-dark) { .btn { background: white; color: black; } }
@scope (.theme-light) { .btn { background: black; color: white; } }
```
**Tune:** keep 4-6 layers; put resets lowest and one-off overrides highest.  
**A11y/perf:** no runtime cost. Support: `@layer` widely; nesting widely (relaxed nesting C120 / F117 / S17.2); `@scope` Baseline 2026-03 (C118 / F146 / S26.4 full; Safari 17.4-26.3 partial).

### 12. Subgrid for aligned card internals
**Looks like:** a row of pricing or project cards where images, titles (of different lengths), descriptions, and CTAs line up horizontally across all cards, like a designed spread instead of ragged boxes.  
**Use when / avoid when:** any repeated card grid with multi-part content. Avoid when cards are intentionally free-form (masonry).  
**Stack:** CSS
```css
/* app/styles/cards-grid.css */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
  gap: 2rem 1.5rem;
}
.cards > .card {
  display: grid;
  grid-row: span 4;                     /* media, title, body, action */
  grid-template-rows: subgrid;          /* inherit the parent's row tracks */
  row-gap: .75rem;
}
.card__media { aspect-ratio: 4 / 3; border-radius: .75rem; overflow: clip; }
.card__title { align-self: end; text-wrap: balance; }
.card__action { align-self: end; }
```
**Tune:** `span N` must equal the number of direct parts; set a smaller `row-gap` on the card than the outer grid gap.  
**A11y/perf:** DOM order unchanged. Support: widely (C117 / F71 / S16).

### 13. Color system: oklch, color-mix, relative colors, light-dark, contrast-color, alpha()
**Looks like:** one brand color generates hover, pressed, soft-tint, border, and on-brand text tokens that stay perceptually consistent in light and dark mode.  
**Use when / avoid when:** always define tokens in `oklch()`: equal L steps look equally light across hues (HSL does not). Avoid pushing chroma to the gamut edge for large surfaces (neon fatigue); save high chroma for accents. Palette taste lives in `color-surfaces.md`.  
**Stack:** CSS (+ Tailwind `@theme`)
```css
/* app/styles/color-tokens.css */
:root {
  color-scheme: light dark;                               /* required for light-dark() */

  --brand: oklch(0.66 0.19 35);                           /* L C H */
  --brand-hover: oklch(from var(--brand) calc(l - 0.06) c h);
  --brand-active: oklch(from var(--brand) calc(l - 0.12) calc(c * 0.9) h);
  --brand-soft: oklch(from var(--brand) l c h / 0.12);    /* tint for backgrounds */
  --brand-complement: oklch(from var(--brand) l c calc(h + 180));

  --surface: light-dark(oklch(0.985 0.004 85), oklch(0.17 0.012 260));
  --surface-raised: light-dark(oklch(1 0 0), oklch(0.21 0.014 260));
  --ink: light-dark(oklch(0.23 0.012 260), oklch(0.95 0.005 85));
  --ink-muted: color-mix(in oklch, var(--ink) 62%, var(--surface));
  --border: color-mix(in oklch, var(--ink) 12%, transparent);

  --on-brand: white;                                      /* fallback */
}
@supports (color: contrast-color(red)) {
  :root { --on-brand: contrast-color(var(--brand)); }     /* picks black or white for max contrast */
}
@supports (color: alpha(from red / 50%)) {
  :root { --brand-soft: alpha(from var(--brand) / 12%); } /* same result, shorter (C151 / F155 / S27) */
}
[data-theme="dark"] { color-scheme: dark; }
[data-theme="light"] { color-scheme: light; }

.btn-brand { background: var(--brand); color: var(--on-brand); transition: background-color 150ms ease-out; }
.btn-brand:hover { background: var(--brand-hover); }
.btn-brand:active { background: var(--brand-active); }
```
```css
/* app/globals.css - Tailwind v4 */
@import "tailwindcss";
@theme {
  --color-brand: oklch(0.66 0.19 35);
  --color-brand-soft: oklch(from var(--color-brand) l c h / 0.12);
}
/* usage: bg-brand, bg-brand/20 (Tailwind mixes opacity with color-mix), text-brand */
```
**Tune:** hover L -0.04 to -0.08; soft tints alpha .08-.16; dark surfaces L .14-.22 with a little chroma (0.01-0.02) toward the brand hue so dark mode is not dead gray.  
**A11y/perf:** `contrast-color()` only chooses black or white; it does not guarantee WCAG for mid-lightness brands, so still check pairs (APCA/WCAG). Support: `oklch`/`color-mix` widely; relative colors Baseline 2024-09 (C122 / F128 / S18); `light-dark()` Baseline 2024-05; `contrast-color()` Baseline 2026-04 (C147 / F146 / S26); `alpha()` C151 / F155 / S27. Safari 27 also accepts more than two colors in `color-mix()` and images in `light-dark()`: do not rely on either cross-browser yet.

### 14. Typography polish: text-wrap, text-box, hanging-punctuation, initial-letter
**Looks like:** headlines without a lonely last word, paragraphs without orphans, button labels that sit optically centered, quotes whose opening mark hangs in the margin, an editorial drop cap.  
**Use when / avoid when:** globally for headings and body. Font pairing and scale live in `typography.md`.  
**Stack:** CSS
```css
/* app/styles/typography-polish.css */
h1, h2, h3, h4, blockquote, figcaption, .card__title { text-wrap: balance; }   /* Chromium balances <= 6 lines, Firefox <= 10 */
p, li, dd { text-wrap: pretty; }                                               /* avoids orphans; ignored where unsupported */

/* trim the half-leading so text boxes hug cap height and baseline: true optical centering */
.btn, .badge, .pill { text-box: trim-both cap alphabetic; }
.display-heading { text-box: trim-both cap alphabetic; line-height: .95; }

/* hanging punctuation (Safari only; harmless elsewhere) */
.prose blockquote, .prose p { hanging-punctuation: first last; }

/* drop cap */
.prose > p:first-of-type::first-letter {
  -webkit-initial-letter: 3;
  initial-letter: 3;
  font-weight: 700;
  color: var(--brand);
  margin-inline-end: .5rem;
}
@supports not ((initial-letter: 3) or (-webkit-initial-letter: 3)) {
  .prose > p:first-of-type::first-letter { float: left; font-size: 3.4em; line-height: .8; padding-block-start: .08em; }
}
```
**Tune:** `text-box-edge` alternatives: `cap alphabetic` (UI labels), `ex alphabetic` (lowercase-heavy logos), `text` (default metrics).  
**A11y/perf:** `pretty` costs more layout time in Safari (whole-paragraph algorithm); it is fine for article text, skip it on giant generated lists. Support: `balance` Baseline 2024-05; `pretty` C117 / S26 / not Firefox; `text-box` C133 / S18.2 / F154; `hanging-punctuation` Safari 26.5 full (older partial); `initial-letter` C110, Safari `-webkit-` partial, not Firefox.

### 15. field-sizing: content
**Looks like:** a comment textarea that grows with each line up to a max, inline-editable titles that are exactly as wide as their text, a compact select as wide as its choice.  
**Use when / avoid when:** chat inputs, comment boxes, inline editing, tag inputs. Avoid on fixed-grid forms where aligned widths matter.  
**Stack:** CSS
```css
/* app/styles/forms-autosize.css */
textarea.autosize {
  field-sizing: content;
  min-block-size: 3lh;           /* at least 3 lines */
  max-block-size: 12lh;          /* then scroll */
  resize: none;
}
input.inline-title { field-sizing: content; min-inline-size: 6ch; max-inline-size: 100%; }
select.compact { field-sizing: content; }
```
**Tune:** min 2-4lh, max 8-15lh.  
**A11y/perf:** no JS resize observers. Support: Baseline 2026-06 (C123 / F152 / S26.2); older engines keep the default fixed size (acceptable fallback, or add a `rows` attribute).

### 16. sibling-index() / sibling-count() stagger and radial layouts
**Looks like:** list items that cascade in 50ms apart without inline `style="--i"`; a radial menu whose items distribute evenly around a circle however many there are.  
**Use when / avoid when:** stagger in CSS-driven entrances (`@starting-style`, scroll triggers). Cap stagger at ~8 items: long cascades feel slow.  
**Stack:** CSS
```css
/* app/styles/stagger.css */
.stagger > * {
  transition: opacity 500ms cubic-bezier(.16, 1, .3, 1), translate 500ms cubic-bezier(.16, 1, .3, 1);
  transition-delay: calc(min(sibling-index() - 1, 8) * 55ms);
  @starting-style { opacity: 0; translate: 0 .75rem; }
}

/* radial menu: n items on a circle */
.radial { position: relative; inline-size: 14rem; aspect-ratio: 1; }
.radial > * {
  position: absolute;
  inset: 50% auto auto 50%;
  translate: -50% -50%;
  rotate: calc(360deg / sibling-count() * (sibling-index() - 1));
  transform: translateY(-6rem) rotate(calc(-360deg / sibling-count() * (sibling-index() - 1)));  /* keep labels upright */
}

/* fallback where unsupported (pre C138 / F154 / S26.2): inline --i */
@supports not (order: sibling-index()) {
  .stagger > * { transition-delay: calc(var(--i, 0) * 55ms); }
}
@media (prefers-reduced-motion: reduce) {
  .stagger > * { transition-delay: 0s; @starting-style { translate: none; } }
}
```
**Tune:** 40-80ms per item; cap 6-10 items.  
**A11y/perf:** pure CSS. Support: Baseline 2026-08 (C138 / F154 / S26.2).

### 17. CSS logic: if(), @function, typed attr(), progress(), random()
**Looks like:** components that switch values from a single custom property, reusable CSS helper functions, grids configured from `data-*` attributes, values mapped from container width without media-query ladders, organic per-item jitter.  
**Use when / avoid when:** progressive enhancement or internal tools; most of these are single-engine today. Always write the fallback declaration first.  
**Stack:** CSS
```css
/* app/styles/css-logic.css */

/* if() - Chrome 137: inline conditionals on style(), media(), supports() */
.button {
  padding: 0.75rem 1.25rem;                                           /* fallback */
  padding: if(style(--size: large): 1rem 1.75rem; else: 0.75rem 1.25rem);
  border-radius: if(media(pointer: coarse): 1rem; else: 0.625rem);
}

/* @function - Chrome 139: typed, reusable value helpers */
@function --tint(--color <color>, --amount <percentage>: 12%) returns <color> {
  result: color-mix(in oklch, var(--color) var(--amount), transparent);
}
.chip { background: color-mix(in oklch, var(--brand) 12%, transparent); background: --tint(var(--brand)); }

/* typed attr() - Chrome 133, Firefox 155: attributes as real typed values in any property */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(3, 1fr);                                         /* fallback */
  grid-template-columns: repeat(attr(data-cols type(<integer>), 3), 1fr);
}
.bar { inline-size: attr(data-value %, 0%); }                                    /* unit shorthand */

/* progress() - C138 / F155 / S26: 0..1 from a value between two bounds (clamped) */
.hero-title {
  --p: progress(100cqi, 20rem, 80rem);
  font-size: calc(2rem + var(--p) * 4rem);
  letter-spacing: calc(-0.01em - var(--p) * 0.03em);
}

/* random() - Safari 26.2 only: per-element random values */
.polaroid { rotate: -2deg; }
@supports (rotate: random(-1deg, 1deg)) {
  .polaroid { rotate: random(-4deg, 4deg); }
}
```
```html
<ul class="grid-auto" data-cols="4">...</ul>
<div class="bar" data-value="72"></div>
```
**Tune:** keep `if()` branches to 2-3; prefer container queries for layout switches (wider support).  
**A11y/perf:** all resolved at style time. Support: `if()` C137; `@function` C139 (Safari preview); typed `attr()` C133 / F155 (Safari preview; plain `attr()` in `content` works everywhere); `progress()` C138 / F155 / S26; `random()` Safari 26.2 only (Chrome/Firefox preview).

### 18. corner-shape: squircles, notches, scoops
**Looks like:** iOS-style continuous-curvature corners (squircle) on app icons and cards; ticket stubs with scooped corners; tech/brutalist notched corners, all from `border-radius` + one property, with borders and shadows following the shape.  
**Use when / avoid when:** a brand system built on a distinctive corner (the squircle reads "Apple-grade", notch reads "HUD/military"). Chromium only today, so the plain rounded fallback must be acceptable.  
**Stack:** CSS
```css
/* app/styles/corners.css */
.app-icon { border-radius: 22%; }
.card-squircle { border-radius: 1.5rem; }
@supports (corner-shape: squircle) {
  .app-icon { corner-shape: squircle; border-radius: 30%; }          /* squircle needs a larger radius to read as round */
  .card-squircle { corner-shape: squircle; border-radius: 2.25rem; }
}
.ticket { border-radius: 1rem; corner-shape: scoop; }                /* concave cut-outs */
.hud-panel { border-radius: 0 1.25rem; corner-shape: bevel; }        /* diagonal cuts on two corners */
.notched { border-radius: .75rem; corner-shape: notch; }
.custom-curve { border-radius: 2rem; corner-shape: superellipse(3); } /* 1 = round, higher = squarer, negative = concave */
```
**Tune:** squircle radius about 1.4-1.6x the old round radius; superellipse 1.5-4 for "soft square".  
**A11y/perf:** paints like border-radius (borders, shadows, outlines and backgrounds follow it). Support: Chrome 139 only; Firefox and Safari in preview builds.

### 19. shape() and animated clip-path
**Looks like:** section edges shaped like a wave that stays proportional at any width, blob buttons that morph on hover, reveal masks that sweep open with curved edges.  
**Use when / avoid when:** responsive custom shapes where `path()` fails (path is pixel-only and cannot mix % with units). Avoid giant animated clip-paths on scroll (main-thread paint).  
**Stack:** CSS
```css
/* app/styles/shapes.css */
:root { --ease-out-quint: cubic-bezier(.22, 1, .36, 1); }
.wave-section {
  clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);                /* fallback */
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    line to 100% 88%,
    curve to 50% 88% with 75% 100%,
    curve to 0% 88% with 25% 76%,
    close
  );
  transition: clip-path 700ms var(--ease-out-quint);
}
/* same command list = smooth interpolation */
.wave-section:hover {
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    line to 100% 92%,
    curve to 50% 92% with 75% 80%,
    curve to 0% 92% with 25% 104%,
    close
  );
}
/* mixed units: a 24px notch that stays 24px while the box stretches */
.tab-shape {
  clip-path: shape(from 0 0, hline to calc(100% - 24px), line to 100% 24px, vline to 100%, hline to 0, close);
}
@media (prefers-reduced-motion: reduce) { .wave-section { transition: none; } }
```
Commands: `move to|by`, `line to|by`, `hline to|by`, `vline to|by`, `curve to <p> with <c1> [/ <c2>]`, `smooth to <p> [with <c>]`, `arc to <p> of <r> [cw|ccw] [large|small]`, `close`.  
**Tune:** morph 500-800ms expo/quint out; keep control points within the box to avoid clipping content.  
**A11y/perf:** clip-path animation repaints; fine for hover on one element. Support: `shape()` Baseline 2026-02 (C135 / F148 / S18.4).

### 20. Masonry: display grid-lanes
**Looks like:** Pinterest-style columns where items of different heights pack tightly with no row gaps, in reading order across columns.  
**Use when / avoid when:** image walls, mood boards, testimonials of varying length. Avoid for content where row alignment carries meaning.  
**Stack:** CSS (Safari 26.4+ native; columns or JS elsewhere)
```css
/* app/styles/masonry.css */
.masonry {
  columns: 16rem;                  /* fallback everywhere: CSS multi-column (order runs down each column) */
  column-gap: 1rem;
}
.masonry > * { break-inside: avoid; margin-block-end: 1rem; }

@supports (display: grid-lanes) {
  .masonry {
    columns: auto;
    display: grid-lanes;           /* Safari 26.4+ */
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: 1rem;
  }
  .masonry > * { margin-block-end: 0; }
}
```
**Tune:** column min 14-20rem; `flow-tolerance` (Safari) controls how aggressively items jump to the shortest lane.  
**A11y/perf:** the columns fallback reads top-to-bottom per column, which scrambles chronological order: if order matters (newest first), use a JS masonry (e.g. measure + absolute) or plain grid in non-Safari. Support: `display: grid-lanes` Safari 26.4 only; Chrome and Firefox not shipped as of Sept 2026 (the syntax converged on `grid-lanes` after the long `masonry` debate).

### 21. reading-flow for visually reordered layouts
**Looks like:** a bento grid or reversed flex row where keyboard Tab order and screen-reader order follow the VISUAL order instead of DOM order.  
**Use when / avoid when:** layouts using `order`, `grid-auto-flow: dense`, or explicit grid placement that diverges from source order. Best fix is still to make DOM order match visual order.  
**Stack:** CSS (Chrome 137+)
```css
/* app/styles/reading-flow.css */
.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-flow: dense;
  reading-flow: grid-rows;          /* focus/reading follows visual row order */
}
.toolbar-reversed {
  display: flex;
  flex-direction: row-reverse;
  reading-flow: flex-visual;
}
.custom-order { display: grid; reading-flow: source-order; }
.custom-order > .cta { reading-order: -1; }   /* pull one item first in reading order */
```
Values: `normal`, `flex-visual`, `flex-flow`, `grid-rows`, `grid-columns`, `grid-order`, `source-order`.  
**A11y/perf:** without support, order falls back to DOM order, so keep DOM order sensible. Support: Chrome 137 only.

### 22. Customizable `<select>` (appearance: base-select)
**Looks like:** a fully branded dropdown (rounded picker, color swatches or icons in options, custom checkmark, rotating chevron, animated open) that is still a real `<select>`: keyboard, typeahead, form submission, mobile behaviour, and screen-reader semantics intact.  
**Use when / avoid when:** replace JS listbox libraries for single-select dropdowns. Keep a combobox library for search/async options or multi-select.  
**Stack:** HTML + CSS (Chrome 135+, Safari 27+; native select elsewhere)
```html
<!-- components/accent-select.html -->
<label for="accent">Accent color</label>
<select id="accent" name="accent" class="fancy-select">
  <button><selectedcontent></selectedcontent></button>
  <option value="coral"><span class="swatch" style="--c: oklch(0.7 0.17 35)"></span>Coral</option>
  <option value="sea"><span class="swatch" style="--c: oklch(0.65 0.12 200)"></span>Sea</option>
  <option value="moss"><span class="swatch" style="--c: oklch(0.62 0.11 140)"></span>Moss</option>
</select>
```
```css
/* app/styles/select.css */
.fancy-select,
.fancy-select::picker(select) { appearance: base-select; }         /* opt BOTH the button and the picker in */

.fancy-select {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-inline-size: 12rem;
  padding: .6rem .9rem;
  border: 1px solid var(--border);
  border-radius: .75rem;
  background: var(--surface-raised);
  color: var(--ink);
}
.fancy-select::picker-icon { transition: rotate 200ms ease-out; }
.fancy-select:open::picker-icon { rotate: 180deg; }

.fancy-select::picker(select) {
  margin-block-start: .35rem;
  padding: .35rem;
  border: 1px solid var(--border);
  border-radius: .9rem;
  background: var(--surface-raised);
  box-shadow: 0 24px 48px -24px oklch(0 0 0 / .35);
  opacity: 0;
  translate: 0 -.25rem;
  transition: opacity 180ms ease-out, translate 180ms ease-out, display 180ms allow-discrete, overlay 180ms allow-discrete;
}
.fancy-select::picker(select):popover-open { opacity: 1; translate: 0 0; }
@starting-style { .fancy-select::picker(select):popover-open { opacity: 0; translate: 0 -.25rem; } }

.fancy-select option {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .5rem .75rem;
  border-radius: .5rem;
}
.fancy-select option:is(:hover, :focus-visible) { background: var(--brand-soft); }
.fancy-select option::checkmark { content: "\2713"; order: 1; margin-inline-start: auto; }
.swatch { inline-size: 1rem; aspect-ratio: 1; border-radius: 50%; background: var(--c); }
```
**Tune:** picker radius slightly larger than the trigger's; open 150-200ms.  
**A11y/perf:** unsupported engines (Firefox, behind a flag since 149) ignore the `<button>` and inner markup and render a normal native select with the text labels: a safe fallback. `<selectedcontent>` clones the chosen option's markup into the button. Support: C135 / S27; `:open` C133 / F136 / S26.5.

### 23. View transitions (pointer)
**Looks like:** thumbnails that morph into the detail page hero, cross-fades between routes, list items that animate to new positions after filtering.  
**Use when / avoid when:** state or route changes where continuity helps orientation. Full recipes (Next.js App Router, React `<ViewTransition>`, cross-document MPAs, types, fallbacks) live in `page-transitions.md`.  
**Stack:** CSS + one JS call
```css
/* app/styles/vt-minimal.css */
@view-transition { navigation: auto; }                 /* cross-document (MPA): C126 / S18.2, not Firefox */
.product-card { view-transition-name: match-element; } /* auto-unique names per element: C137 / F144 / S18.4 */
::view-transition-group(*) { animation-duration: 320ms; animation-timing-function: cubic-bezier(.22, 1, .36, 1); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none; } }
```
```ts
// same-document update: Baseline 2025-10 (C111 / F144 / S18)
function applyFilter(update: () => void) {
  if (!document.startViewTransition) { update(); return; }
  document.startViewTransition(update);
}
```
Also new: `view-transition-class` (C125 / F144 / S18.2), `:active-view-transition-type()` (C125 / F147 / S18.2), element-scoped `element.startViewTransition()` (Chrome 147 only).

### 24. Masks and mask-composite
**Looks like:** carousels whose edges fade into the background, a spotlight that reveals an image around the cursor, 1px gradient borders on rounded cards, text that fades out at the bottom of a clamp.  
**Use when / avoid when:** any soft edge or cut-out. Prefer masks over overlay gradients when the background varies (overlays assume a flat bg color).  
**Stack:** CSS
```css
/* app/styles/masks.css */
.fade-x {
  mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
}
.fade-bottom { mask-image: linear-gradient(#000 60%, transparent); }

/* cursor spotlight (set --mx/--my from pointermove; see interactions.md) */
.spotlight {
  mask-image: radial-gradient(circle 12rem at var(--mx, 50%) var(--my, 50%), #000 0 40%, transparent 100%);
}

/* 1px gradient border that follows border-radius, content stays transparent */
.gradient-border { position: relative; border-radius: 1rem; }
.gradient-border::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;                                   /* border width */
  border-radius: inherit;
  background: linear-gradient(135deg, oklch(0.8 0.14 300), oklch(0.75 0.12 200) 50%, transparent);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;                        /* keep only the padding ring */
  pointer-events: none;
}
```
**Tune:** edge fades 6-12% of width; spotlight radius 8-16rem.  
**A11y/perf:** masks are GPU-friendly when static; animating `mask-position`/gradient stops repaints. The `mask` shorthand resets `mask-composite`, so declare composite after it. Support: unprefixed masks Baseline widely (C120 / F53 / S15.4); for Chrome < 120 add `-webkit-mask` and `-webkit-mask-composite: xor`.

### 25. backdrop-filter glass done right
**Looks like:** a nav bar or floating panel that blurs and slightly saturates whatever scrolls beneath it, with a hairline border and a faint top highlight (macOS/visionOS materials).  
**Use when / avoid when:** small floating surfaces over rich imagery. Avoid full-screen glass sections, glass-on-glass stacks, and glass over flat backgrounds (costly and invisible). "Glassmorphism cards on a purple gradient" is a stock AI look.  
**Stack:** CSS
```css
/* app/styles/glass.css */
.glass {
  background: color-mix(in oklch, var(--surface) 72%, transparent);            /* fallback-safe tint */
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  backdrop-filter: blur(16px) saturate(1.5);
  border: 1px solid color-mix(in oklch, white 18%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in oklch, white 25%, transparent), 0 20px 40px -24px oklch(0 0 0 / .4);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--surface); }
}
@media (prefers-reduced-transparency: reduce) {                                  /* Chrome 118+ */
  .glass { background: var(--surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
```
**Tune:** blur 8-20px; saturate 1.2-1.8; tint 60-85% surface.  
**A11y/perf:** cost scales with blurred area and with what changes beneath it each frame; never animate the blur radius (fade an overlay's opacity instead, see `scroll-css-native.md#8-sticky-header-compact--frosted-on-scroll`). An ancestor with `filter`, `opacity < 1`, `mask`, or its own `backdrop-filter` becomes the backdrop root, so nested glass only blurs its parent, not the page. Ensure text contrast against the worst-case background. Support: Baseline 2024-09 (unprefixed Safari 18; keep `-webkit-` for older iOS).

### 26. image-set() for format/density switching
**Looks like:** CSS background images served as AVIF/WebP to capable browsers and at 2x on retina, without JS or duplicate classes.  
**Use when / avoid when:** decorative CSS backgrounds. Content images should be `<img srcset>`/`<picture>` or `next/image`.  
**Stack:** CSS
```css
/* app/styles/hero-bg.css */
.hero-bg {
  background-image: url("/img/hero.jpg");                                            /* fallback */
  background-image: image-set(
    url("/img/hero.avif") type("image/avif"),
    url("/img/hero.webp") type("image/webp"),
    url("/img/hero.jpg") type("image/jpeg")
  );
  background-size: cover;
  background-position: center;
}
.logo-mark { background-image: image-set(url("/img/mark.png") 1x, url("/img/mark@2x.png") 2x); }
```
**A11y/perf:** browsers download only the chosen candidate. Support: widely (C113 / F89 / S17 unprefixed).

### 27. Forms: :user-valid / :user-invalid, accent-color
**Looks like:** fields turn red only after the user has interacted (not on page load), the submit button de-emphasises while anything is invalid, and native checkboxes/radios/range sliders adopt the brand color.  
**Use when / avoid when:** every form. Replace `:invalid` styling (which shouts at users before they type).  
**Stack:** CSS
```css
/* app/styles/forms.css */
:root { accent-color: var(--brand); }                        /* checkbox, radio, range, progress */

.field input { border: 1px solid var(--border); transition: border-color 150ms, box-shadow 150ms; }
.field input:focus-visible { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-soft); }
.field input:user-invalid { border-color: oklch(0.6 0.2 25); }
.field input:user-valid { border-color: oklch(0.65 0.15 150); }
.field__error { display: none; color: oklch(0.55 0.2 25); font-size: .875rem; }
.field:has(input:user-invalid) .field__error { display: block; }
.form:has(:user-invalid) [type="submit"] { opacity: .6; }
```
**A11y/perf:** pair visual errors with `aria-describedby` pointing at the error text; never rely on color alone (add an icon or text). `accent-color` automatically picks a contrasting checkmark color. Support: `:user-valid/:user-invalid` widely (C119 / F88 / S16.5); `accent-color` C93 / F92 / S26.2 (partial since 15.4).

### 28. Underline craft: text-decoration-thickness / text-underline-offset
**Looks like:** links with a thin, low-contrast underline sitting comfortably below descenders that tightens and darkens on hover; or an underline that draws in from the left and exits to the right.  
**Use when / avoid when:** all inline links. The sweep variant for nav and footer links only; inline prose links should stay underlined at rest (discoverability).  
**Stack:** CSS
```css
/* app/styles/links.css */
.prose a {
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: .28em;
  text-decoration-color: color-mix(in oklch, currentColor 35%, transparent);
  text-decoration-skip-ink: auto;
  transition: text-underline-offset 180ms ease-out, text-decoration-color 180ms ease-out, text-decoration-thickness 180ms ease-out;
}
.prose a:hover { text-underline-offset: .14em; text-decoration-color: currentColor; text-decoration-thickness: 2px; }

/* sweep underline: draws in from the left, leaves to the right */
.sweep {
  text-decoration: none;
  background: linear-gradient(currentColor 0 0) no-repeat 100% 100% / 0% 1px;
  transition: background-size 350ms cubic-bezier(.22, 1, .36, 1);
}
.sweep:is(:hover, :focus-visible) { background-position-x: 0%; background-size: 100% 1px; }
@media (prefers-reduced-motion: reduce) { .prose a, .sweep { transition: none; } }
```
**Tune:** offset .2-.35em at rest; thickness 1px rest / 1.5-2px hover; sweep 300-400ms.  
**A11y/perf:** the sweep variant has no underline at rest, so use it only where context makes links obvious (nav). If an engine does not interpolate `text-underline-offset`, the change is instant (harmless). Support: thickness/offset widely (C87-89 / F70 / S12.1). More hover recipes: `interactions.md`.

### 29. Scrollbar styling (pointer)
Standard properties now cover most needs: `scrollbar-width: thin | none`, `scrollbar-color: <thumb> <track>`, `scrollbar-gutter: stable`. Support: `scrollbar-width` and `scrollbar-gutter` Baseline 2024-12, `scrollbar-color` Baseline 2025-12 (Safari 26.2). Chrome ignores `::-webkit-scrollbar` rules on an element once `scrollbar-width`/`scrollbar-color` are set on it. Tailwind 4.3: `scrollbar-thin`, `scrollbar-none`, `scrollbar-thumb-*`, `scrollbar-track-*`, `scrollbar-gutter-stable`. Full ergonomics stylesheet: `scroll-css-native.md#24-scroll-ergonomics-baseline-stylesheet`.

### 30. Media features: hover/pointer and prefers-*
**Looks like:** hover effects that never "stick" on phones, larger hit targets on touch, motion replaced by fades for sensitive users, stronger borders for high-contrast users.  
**Use when / avoid when:** globally. Put these in your token layer so components inherit the right behaviour.  
**Stack:** CSS
```css
/* app/styles/media-features.css */
@media (hover: hover) and (pointer: fine) {                  /* real mouse/trackpad: hover effects, custom cursors */
  .card:hover { translate: 0 -3px; }
}
@media (any-pointer: coarse) {                               /* any touch input present: bigger targets */
  .icon-btn { min-inline-size: 44px; min-block-size: 44px; }
}
@media (prefers-reduced-motion: reduce) {                    /* swap movement for opacity, shorten */
  :root { --dur-overlay-in: 120ms; --dur-overlay-out: 100ms; }
}
@media (prefers-contrast: more) {
  :root { --border: color-mix(in oklch, var(--ink) 45%, transparent); --ink-muted: var(--ink); }
}
@media (forced-colors: active) {                             /* Windows High Contrast: restore system colors */
  .btn { border: 1px solid ButtonText; }
  .glass { background: Canvas; }
}
@media (prefers-reduced-transparency: reduce) {              /* Chrome 118+ only */
  .glass, .modal::backdrop { backdrop-filter: none; }
}
@media (scripting: none) {                                    /* no-JS users */
  [data-requires-js] { display: none; }
}
@media (dynamic-range: high) and (color-gamut: p3) {         /* HDR/P3 screens: richer accent */
  :root { --brand: oklch(0.68 0.24 35); }
}
@media (width >= 48rem) { .nav { display: flex; } }            /* range syntax, widely supported */
```
**A11y/perf:** `(hover: hover)` alone is not enough on hybrid laptops; combine with `(pointer: fine)` for cursor effects. Tailwind v4's `hover:` variant already compiles to `@media (hover: hover)`. Support: hover/pointer/any-pointer, reduced-motion, contrast, forced-colors widely; `scripting` C120 / F113 / S17; range syntax C104 / F102 / S16.4; `prefers-reduced-transparency` Chrome only.

### 31. Viewport units: svh / lvh / dvh
**Looks like:** a hero whose CTA is always visible above the mobile URL bar, a full-bleed background that never shows a gap when the bar collapses, an app shell that exactly fills the visible screen.  
**Use when / avoid when:** see the table; never use plain `100vh` for above-the-fold layout on mobile.  
**Stack:** CSS

| Unit | Equals | Use for | Avoid for |
|---|---|---|---|
| `svh` | viewport with browser UI expanded (smallest) | hero `min-height`, pinned/sticky sections, anything whose bottom must be visible | full-bleed backgrounds (gap when UI collapses) |
| `lvh` | viewport with UI collapsed (largest) | fixed background layers, video covers that must never show gaps | content that must be fully visible |
| `dvh` | current visible height, changes live | app shells, full-screen modals, chat layouts | long scrolling sections (relayout on every URL-bar move causes jank) |
| `vh` | on mobile = `lvh` | desktop-only layouts | mobile heroes |

```css
/* app/styles/viewport.css */
.hero { min-block-size: 100svh; }
.hero__bg { position: fixed; inset: 0; block-size: 100lvh; }
.app-shell { block-size: 100dvh; display: grid; grid-template-rows: auto 1fr auto; }
```
```html
<!-- app/layout.tsx head: make the on-screen keyboard resize content instead of overlaying it -->
<meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content">
```
**A11y/perf:** `dvh` changes trigger layout; keep it off large pages. Next.js: export `viewport` from `app/layout.tsx` (`export const viewport = { width: "device-width", initialScale: 1, interactiveWidget: "resizes-content" }`) instead of a manual meta tag. Support: widely (C108 / F101 / S15.4). Tailwind: `h-svh`, `min-h-svh`, `h-dvh`, `h-lvh`.

### 32. Tailwind v4 equivalents
Tailwind 4.3 (CSS-first `@theme`) maps most of this file to utilities and variants:

| Platform feature | Tailwind 4.x |
|---|---|
| `@starting-style` | `starting:` variant, e.g. `opacity-100 starting:opacity-0`; for popovers `starting:open:opacity-0` |
| `transition-behavior: allow-discrete` | `transition-discrete` (and `transition-normal`) |
| `[open]`, `:popover-open`, `:open` | `open:` variant |
| `::backdrop` | `backdrop:` variant, e.g. `backdrop:bg-black/50` |
| `::details-content` | `details-content:` variant |
| `:user-valid` / `:user-invalid` | `user-valid:` / `user-invalid:` |
| `:has()` | `has-[...]:`, `group-has-[...]:`, `peer-has-[...]:` |
| `:not()`, parent state, nth | `not-*:`, `in-*:`, `nth-3:`, `nth-[3n+1]:`, `*:` (children), `**:` (descendants) |
| container queries | `@container`, `@container/name`, `@md:`, `@max-md:`, `@md/name:`; v4.3 `@container-size` (size containment) |
| `cqi` units | arbitrary values, e.g. `text-[clamp(1rem,4cqi,2rem)]` |
| individual transforms | `translate-*`, `scale-*`, `rotate-*` (emit `translate`/`scale`/`rotate` properties) |
| `linear()` / custom easing | `@theme { --ease-spring: linear(...); }` -> `ease-spring` |
| oklch tokens, color-mix opacity | `@theme { --color-brand: oklch(...) }` -> `bg-brand`, `bg-brand/20` |
| `color-scheme` | `scheme-light`, `scheme-dark`, `scheme-light-dark` |
| `text-wrap` | `text-balance`, `text-pretty`, `text-nowrap` |
| `field-sizing` | `field-sizing-content`, `field-sizing-fixed` |
| masks | `mask-*` utilities (v4.1+: `mask-linear-*`, `mask-radial-*`, `mask-b-from-*`) |
| `accent-color` | `accent-*` |
| scrollbars | v4.3: `scrollbar-thin`, `scrollbar-none`, `scrollbar-thumb-*`, `scrollbar-track-*`, `scrollbar-gutter-stable` |
| viewport units | `h-svh`, `min-h-svh`, `h-dvh`, `h-lvh` |
| media features | `motion-safe:`, `motion-reduce:`, `pointer-fine:`, `pointer-coarse:`, `any-pointer-*:`, `contrast-more:`, `forced-colors:`, `noscript:`, `print:`, `supports-[...]:`, `not-supports-[...]:`; `hover:` is already gated by `(hover: hover)` |
| anchor positioning, `corner-shape`, `shape()`, `interpolate-size`, `sibling-index()` | no first-party utilities in 4.3: use arbitrary properties (`[anchor-name:--menu]`, `[corner-shape:squircle]`) or `@utility` |

Custom variants and utilities for the gaps:
```css
/* app/globals.css */
@import "tailwindcss";

@custom-variant stuck {                           /* style children of a stuck sticky scroll-state container */
  @container scroll-state(stuck: top) { @slot; }
}
@custom-variant supports-anchor {
  @supports (anchor-name: --a) { @slot; }
}
@utility squircle {
  @supports (corner-shape: squircle) { corner-shape: squircle; }
}
@utility anchor-* {
  anchor-name: --value([*]);                      /* anchor-[--menu] */
}
@utility interpolate-keywords { interpolate-size: allow-keywords; }
```

## Gotchas
- **`@starting-style` loses to later rules of equal specificity.** Place the `@starting-style` block AFTER the open-state rule (or nest it inside that rule). Otherwise the entry animation silently never runs.
- **`transition: all ... allow-discrete` flips every discrete property at 50%** (e.g. `visibility`, `font-family` changes mid-animation). List properties explicitly; add `display` and `overlay` with `allow-discrete` only.
- **Popover UA styles fight anchoring.** Popovers default to `position: fixed; inset: 0; margin: auto`. Reset `inset: auto; margin: 0` before `position-area`, or the popover stays centered.
- **Firefox never animates the exit** of `display: none` transitions (no `display` interpolation), and only Chromium supports `overlay`. Design exits that can be instant.
- **Dialog light-dismiss via backdrop click misfires** when the `<dialog>` element has padding (clicks on padding hit the dialog). Put padding on an inner wrapper.
- **Duplicate `anchor-name` resolves to the last element in tree order.** In repeated components use `anchor-scope: --name` (C131 / F147 / S26) on each item, or unique names.
- **Anchors must be laid out before, and within the containing-block chain of, the positioned element.** Anchors inside a separately `position: relative` subtree that is not an ancestor may not resolve; move the positioned element into the top layer (popover) to escape.
- **`interpolate-size` is inherited:** set it on `:root` once. Setting it on the animating element's child does nothing for the parent's height.
- **`@property` registrations are global and first-wins.** Name them uniquely (`--card-border-angle`), and register in the document (not inside a shadow root). `inherits: true` on properties animated high in the tree triggers large style recalcs.
- **Tailwind v4 layering:** your unlayered CSS beats Tailwind utilities (utilities live in `@layer utilities`). Wrap custom component CSS in `@layer components`.
- **`light-dark()` needs `color-scheme`** on the element or an ancestor; without it you always get the light value.
- **Relative color syntax with `currentColor`** (`oklch(from currentColor ...)`) has separate, later support than the base syntax; test before relying on it.
- **`contrast-color()` returns only black or white** and is not a WCAG guarantee.
- **`text-wrap: balance` does not shrink the box:** a balanced heading in a `width: fit-content` tooltip still reserves the unbalanced width. Balance only affects line breaks; Chromium only balances up to 6 lines.
- **`text-box` trimming changes element height;** re-check vertical rhythm and icon alignment in buttons after enabling it.
- **`field-sizing: content` with an empty input** sizes to the placeholder; set `min-inline-size`.
- **`sibling-index()` counts element siblings in the DOM,** including visually hidden ones and elements inside `display: contents` wrappers are counted relative to their own parent. Filtered lists need re-render or `--i`.
- **`if()` uses semicolons** between branches (`if(style(--x: a): 1rem; else: 2rem)`), not commas.
- **Customizable select needs `appearance: base-select` on BOTH** `select` and `::picker(select)`; forgetting the picker leaves the native popup.
- **Nested glass does not blur the page:** an ancestor with `backdrop-filter`, `filter`, `opacity < 1`, or `mask` becomes the backdrop root.
- **`mask` shorthand resets `mask-composite`,** declare composite after the shorthand.
- **`:user-invalid` only matches after interaction or a submit attempt;** that is the point, but test the "submit with empty required field" path.
- **`dvh` in scrolling pages causes jank** on mobile as the URL bar animates; use `svh` for layout.
- **Container `size` type without explicit height collapses to 0;** use `inline-size` unless you really need block-size queries.
- **`corner-shape: squircle` looks less round at the same radius;** increase the radius inside `@supports` so the non-supporting fallback is not over-rounded.

## Sources
- MDN browser-compat-data 8.1.3 (2026-09-24): https://github.com/mdn/browser-compat-data (queried locally for every version number in this file)
- webstatus.dev API (Baseline status and dates): https://api.webstatus.dev/v1/features/{feature-id}
- https://webkit.org/blog/18325/webkit-features-for-safari-27-0/ ; https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/ ; https://webkit.org/blog/17862/webkit-features-for-safari-26-4/ (grid-lanes, @scope, name-only container queries)
- https://drafts.csswg.org/css-color-5/ (alpha(), relative color syntax)
- https://drafts.csswg.org/css-values-5/ (progress(), random() grammar)
- https://developer.chrome.com/blog/anchor-positioning-api (transitioning positioned values)
- https://developer.chrome.com/docs/css-ui/css-linear-easing-function (spring linear() values) and https://linear-easing-generator.netlify.app
- https://developer.chrome.com/blog/css-scroll-state-queries (for the Tailwind `stuck` variant)
- https://tailwindcss.com/docs/hover-focus-and-other-states ; https://tailwindcss.com/docs/adding-custom-styles ; https://tailwindcss.com/blog/tailwindcss-v4-3
- https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features (customizable select flag, Firefox 149)
- chromestatus.com (popover=hint behaviour changes, timeline and trigger scoping)

## Support matrix
Verified 2026-09-26. C = Chrome/Edge, F = Firefox, S = Safari (macOS/iOS). "Newly" date = when the last engine shipped.

| Feature | C | F | S | Baseline | Fallback |
|---|---|---|---|---|---|
| `@starting-style` | 117 | 129 | 17.5 | Newly 2024-08 | appear instantly |
| `transition-behavior: allow-discrete` | 117 | 129 | 17.4 | Newly 2024-08 | instant exit |
| `display` transition | 117 | no | 18 | Limited | instant exit (Firefox) |
| `overlay` transition | 117 | no | no | Limited | exit may paint under content |
| `interpolate-size` / `calc-size()` | 129 | no | no | Limited | grid 0fr->1fr or instant |
| `::details-content` | 131 | 143 | 18.4 | Newly 2025-09 | animate inner wrapper |
| `<details name>` exclusive accordion | 120 | 130 | 17.2 | Newly 2024-09 | JS close-others |
| `@property` | 85 | 128 | 16.4 | Newly 2024-07 | static gradient |
| `translate` / `rotate` / `scale` | 104 | 72 | 14.1 | Widely | `transform` |
| `linear()` easing | 113 | 112 | 17.2 | Widely 2026-06 | `cubic-bezier` overshoot |
| Anchor positioning core | 125 | 147 | 26 | Limited per webstatus (all engines ship core) | Floating UI |
| `position-anchor: normal` semantics | 151 | 151 | 27 | Limited | explicit `position-anchor` |
| `anchor-scope` | 131 | 147 | 26 | Limited | unique names |
| Popover API | 114 | 125 | 17 (iOS 18.3) | Newly 2025-01 | JS disclosure |
| `popover="hint"` | 151 | 153 | no | Limited | `popover="manual"` |
| Invoker commands (`commandfor`/`command`) | 135 | 144 | 26.2 | Newly 2025-12 | `popovertarget` or JS |
| `command="request-close"` | 139 | 144 | 26.2 | Newly | `close` |
| `interestfor` | 142 | no | no | Limited | click/focus popover |
| `<dialog>` | 37 | 98 | 15.4 | Widely | n/a |
| `dialog closedby` | 134 | 141 | no | Limited | click-on-backdrop JS |
| `dialog.requestClose()` | 134 | 139 | 18.4 | Newly | `close()` |
| Container size queries + `cq*` units | 105 | 110 | 16 | Widely | media queries |
| Container style queries (custom props) | 111 | 151 | 18 | Newly 2026-05 | classes |
| Name-only `@container name` | 148 | 149 | 26.4 | Newly 2026 | size condition |
| `:has()` | 105 | 121 | 15.4 | Widely | JS class |
| CSS nesting | 120 | 117 | 17.2 | Widely | preprocessor |
| `@layer` | 99 | 97 | 15.4 | Widely | n/a |
| `@scope` | 118 | 146 | 26.4 | Newly 2026-03 | BEM prefixes |
| Subgrid | 117 | 71 | 16 | Widely | fixed row heights |
| `oklch()` / `oklab()` | 111 | 113 | 15.4 | Widely | hex |
| `color-mix()` | 111 | 113 | 16.2 | Widely | precomputed tokens |
| Relative color syntax | 122 | 128 | 18 | Newly 2024-09 | precomputed tokens |
| `light-dark()` | 123 | 120 | 17.5 | Newly 2024-05 | `prefers-color-scheme` blocks |
| `contrast-color()` | 147 | 146 | 26 | Newly 2026-04 | explicit token |
| `alpha()` | 151 | 155 | 27 | Newly (Sept 2026) | relative color `/ a` |
| `text-wrap: balance` | 114 | 121 | 17.5 | Newly 2024-05 | `<br>` / max-width |
| `text-wrap: pretty` | 117 | no | 26 | Limited | normal wrap |
| `text-box` / `-trim` / `-edge` | 133 | 154 | 18.2 | All engines per BCD (webstatus: limited) | padding tweaks |
| `hanging-punctuation` | no | no | 26.5 | Limited | negative text-indent |
| `initial-letter` | 110 | no | 9 (`-webkit-`, partial) | Limited | float drop cap |
| `field-sizing` | 123 | 152 | 26.2 | Newly 2026-06 | `rows` / JS autosize |
| `sibling-index()` / `sibling-count()` | 138 | 154 | 26.2 | Newly 2026-08 | inline `--i` |
| `if()` | 137 | no | no | Limited | fallback declaration |
| `@function` | 139 | no | preview | Limited | repeat the expression |
| Typed `attr()` | 133 | 155 | preview | Limited | inline custom props |
| `progress()` | 138 | 155 | 26 | All engines per BCD (Sept 2026) | `clamp()` math |
| `random()` | preview | preview | 26.2 | Limited | fixed values / `--i` math |
| `corner-shape` | 139 | preview | preview | Limited | `border-radius` |
| `shape()` | 135 | 148 | 18.4 | Newly 2026-02 | `polygon()` / `path()` |
| `display: grid-lanes` | no | no | 26.4 | Limited | `columns` or JS masonry |
| `reading-flow` / `reading-order` | 137 | no | no | Limited | fix DOM order |
| Customizable select (`base-select`, `::picker(select)`, `<selectedcontent>`) | 135 | flag (149) | 27 | Limited | native select |
| `:open` | 133 | 136 | 26.5 | Newly 2026-05 | `[open]` |
| Same-document view transitions | 111 | 144 | 18 | Newly 2025-10 | instant update |
| Cross-document view transitions | 126 | no | 18.2 | Limited | instant navigation |
| `view-transition-name: match-element` | 137 | 144 | 18.4 | Newly | explicit names |
| Masks (unprefixed) + `mask-composite` | 120 | 53 | 15.4 | Widely 2026-06 | `-webkit-mask*` |
| `backdrop-filter` | 76 | 103 | 18 (9 `-webkit-`) | Newly 2024-09 | opaque tint |
| `image-set()` | 113 | 89 | 17 | Widely | single `url()` |
| `:user-valid` / `:user-invalid` | 119 | 88 | 16.5 | Widely | `:invalid` + class |
| `accent-color` | 93 | 92 | 26.2 (15.4 partial) | Limited per webstatus, usable everywhere | native colors |
| `text-underline-offset` / `-thickness` | 87 / 89 | 70 | 12.1 | Widely | defaults |
| `scrollbar-width` / `scrollbar-color` / `scrollbar-gutter` | 121 / 121 / 94 | 64 / 64 / 97 | 18.2 / 26.2 / 18.2 | Newly | `::-webkit-scrollbar` |
| `hover` / `pointer` / `any-pointer` media | 38-41 | 64 | 9 | Widely | n/a |
| `prefers-reduced-transparency` | 118 | flag | no | Limited | reduced-motion + contrast |
| `scripting` media feature | 120 | 113 | 17 | All engines since 2023-12 | `.no-js` class |
| `svh` / `lvh` / `dvh` | 108 | 101 | 15.4 | Widely 2025-06 | `vh` + JS var |
| `stretch` sizing keyword | 138 | only `-webkit-fill-available` (146) | 27 | Limited | `-webkit-fill-available` |
