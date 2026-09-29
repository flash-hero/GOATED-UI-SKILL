# Text Effects
> Load when: animating or styling type as an effect: split reveals, scramble/typewriter/rotating words, hover rolls, variable-font tricks, giant fitted wordmarks, gradient/shimmer/outline text, marquees, counters, underline draws, text masks, scroll-driven text fills.
> Stack assumptions: React 19 / Next 16 App Router + TS, Tailwind v4 optional; gsap 3.15 (SplitText, ScrambleText free since 3.13) + @gsap/react 2.1; motion 13 (`motion/react`); @number-flow/react 0.6. CSS-only first wherever possible; vanilla variants for the key recipes.

## Contents
- [Decision guide](#decision-guide)
- [Shared setup (tokens, GSAP registration, accessible splitter)](#shared-setup)
- Recipes
  1. [Line mask reveal (SplitText `mask: "lines"`)](#1-line-mask-reveal-splittext-mask-lines)
  2. [Word / char reveal variants (config table)](#2-word--char-reveal-variants)
  3. [CSS-only split reveal (no GSAP)](#3-css-only-split-reveal-no-gsap)
  4. [Staggered blur-in](#4-staggered-blur-in)
  5. [rotateX flip-up chars](#5-rotatex-flip-up-chars)
  6. [Scramble / decode / "decrypted" text](#6-scramble--decode--decrypted-text)
  7. [Typewriter with caret](#7-typewriter-with-caret)
  8. [Rotating words (height-masked slot)](#8-rotating-words-height-masked-slot)
  9. [Text roll on hover](#9-text-roll-on-hover)
  10. [Letter hover wave](#10-letter-hover-wave)
  11. [Variable-font axis animation](#11-variable-font-axis-animation)
  12. [Cursor-proximity variable type (Text Pressure / Variable Proximity)](#12-cursor-proximity-variable-type)
  13. [Stretch / scale-on-scroll giant type](#13-stretch--scale-on-scroll-giant-type)
  14. [Fit text to width (giant wordmark footer)](#14-fit-text-to-width-giant-wordmark-footer)
  15. [Outline / stroke text with fill on hover or scroll](#15-outline--stroke-text-with-fill)
  16. [Gradient text + animated gradient](#16-gradient-text--animated-gradient)
  17. [Shimmer / shine text](#17-shimmer--shine-text)
  18. [Aurora text](#18-aurora-text)
  19. [Glitch text (tasteful)](#19-glitch-text-tasteful)
  20. [Text along an SVG path](#20-text-along-an-svg-path)
  21. [Circular rotating text badge](#21-circular-rotating-text-badge)
  22. [CSS-only infinite marquee](#22-css-only-infinite-marquee)
  23. [Velocity-reactive marquee](#23-velocity-reactive-marquee)
  24. [Number animation (NumberFlow, CSS @property, GSAP)](#24-number-animation)
  25. [Highlighter / underline draw](#25-highlighter--underline-draw)
  26. [Text as a window: video / image inside type](#26-text-as-a-window-video--image-inside-type)
  27. [Kinetic headline intro sequence](#27-kinetic-headline-intro-sequence)
  28. [Long shadow / 3D extrude](#28-long-shadow--3d-extrude)
  29. [Blur-to-focus on scroll (CSS scroll-driven)](#29-blur-to-focus-on-scroll)
  30. [Per-word / reading-order scroll fill (CSS scroll-driven)](#30-reading-order-scroll-fill)
  31. [Cursor spotlight on text](#31-cursor-spotlight-on-text)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide
| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| Editorial, confident section headings appear | Lines rise from masks | GSAP SplitText (~6 kb gz w/ core ~30 kb) or CSS per-word | [1](#1-line-mask-reveal-splittext-mask-lines), [3](#3-css-only-split-reveal-no-gsap) |
| Soft, "Apple keynote" entrance for one hero line | Word blur-in | CSS, filter on few words, one-shot only | [4](#4-staggered-blur-in) |
| Playful / poster energy | rotateX char flip, wave | GSAP or CSS | [5](#5-rotatex-flip-up-chars), [10](#10-letter-hover-wave) |
| Dev-tool / terminal / data voice | Scramble, decode, typewriter | 0-2 kb JS | [6](#6-scramble--decode--decrypted-text), [7](#7-typewriter-with-caret) |
| Several audiences / use cases in one hero | Rotating word slot | CSS or Motion | [8](#8-rotating-words-height-masked-slot) |
| Nav links / CTAs that feel crafted | Text roll, char-staggered | CSS only | [9](#9-text-roll-on-hover) |
| Type-foundry / experimental | Variable axes, cursor pressure | CSS + small rAF loop, re-shapes text (layout) | [11](#11-variable-font-axis-animation), [12](#12-cursor-proximity-variable-type) |
| Brand wordmark as architecture | Fit-to-width, scale on scroll | CSS (container units / `text-fit`) | [13](#13-stretch--scale-on-scroll-giant-type), [14](#14-fit-text-to-width-giant-wordmark-footer) |
| Premium product headline accent | Subtle same-hue gradient, shimmer on status text | CSS `background-clip:text` + `@property` | [16](#16-gradient-text--animated-gradient), [17](#17-shimmer--shine-text) |
| Logo wall / ticker / kinetic band | Marquee, velocity marquee | CSS or Motion rAF | [22](#22-css-only-infinite-marquee), [23](#23-velocity-reactive-marquee) |
| Stats, pricing, counters | NumberFlow digit roll, `@property` counter | 0 kb CSS / ~7 kb NumberFlow | [24](#24-number-animation) |
| Emphasis inside body copy | Scribble underline / highlighter sweep | SVG stroke-dash / `background-size` | [25](#25-highlighter--underline-draw) |
| Reading-driven storytelling paragraph | Scroll fill (reading order) | CSS scroll-driven (Chromium + Safari 26) | [30](#30-reading-order-scroll-fill); GSAP scrub version in `scroll-gsap.md` |
| Hero "moment" | Kinetic intro timeline | GSAP timeline | [27](#27-kinetic-headline-intro-sequence) |

Rule of thumb: one signature text effect per page, used at most in 2-3 places. Reveals on every paragraph, scramble on every label, and gradient on every heading are the three biggest AI-slop tells in text motion.

## Shared setup

Tokens (put in `globals.css`; siblings `motion-principles.md` defines the canonical easing set, these are the text-specific ones):

```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1);
  --ease-back-out: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast: 220ms;
  --dur-base: 480ms;
  --dur-slow: 900ms;
  --dur-reveal: 1100ms;
  --stagger-char: 22ms;
  --stagger-word: 60ms;
  --stagger-line: 90ms;
}

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}

/* Hide split targets until JS has split them; visible when JS is off. */
[data-reveal] { visibility: hidden; }
@media (scripting: none) { [data-reveal] { visibility: visible; } }
```

GSAP registration, SSR-safe (SplitText's `register()` touches `window.innerWidth`, so never register at module scope on the server):

```ts
// lib/gsap.ts
"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
}

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP };
```

Accessible splitter for CSS-driven effects (server component friendly, grapheme-safe via `Intl.Segmenter`, baseline 2024). Visual spans are `aria-hidden`; the real text lives in an sr-only copy, which works on every element type (unlike `aria-label` on a `<p>`/`<span>`, which ARIA prohibits on generic/paragraph roles):

```tsx
// components/text/split.tsx
import type { CSSProperties, ElementType, ReactNode } from "react";

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function graphemes(word: string): string[] {
  return segmenter ? Array.from(segmenter.segment(word), (s) => s.segment) : Array.from(word);
}

type SplitProps = {
  text: string;
  by?: "words" | "chars";
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  style?: CSSProperties;
};

export function Split({ text, by = "words", as: Tag = "span", className, wordClassName = "w", charClassName = "c", style }: SplitProps) {
  const words = text.trim().split(/\s+/);
  let charIndex = 0;
  const content: ReactNode[] = words.map((word, wi) => (
    <span key={wi} className={wordClassName} style={{ "--i": wi, display: "inline-block", whiteSpace: "nowrap" } as CSSProperties}>
      {by === "chars"
        ? graphemes(word).map((g) => {
            const i = charIndex++;
            return (
              <span key={i} className={charClassName} style={{ "--i": i, display: "inline-block" } as CSSProperties}>
                {g}
              </span>
            );
          })
        : word}
    </span>
  ));
  const spaced = content.flatMap((node, i) => (i < content.length - 1 ? [node, " "] : [node]));
  return (
    <Tag className={className} style={{ "--n": by === "chars" ? charIndex : words.length, ...style } as CSSProperties}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{spaced}</span>
    </Tag>
  );
}
```

Modern alternative to `--i`: `sibling-index()` / `sibling-count()` (Chrome 138, Safari 26.2, Firefox 154, Baseline newly available Aug 2026). Use `calc(sibling-index() * 30ms)` only with a `--i` fallback for older browsers still in your audience; `sibling-index()` counts element siblings inside the same parent, so it restarts per word when chars are nested in word spans.

## Recipes

### 1. Line mask reveal (SplitText `mask: "lines"`)
**Looks like:** each line of a heading slides up from behind an invisible edge, 90 ms apart, easing out hard; the text looks "printed" into place.  
**Use when / avoid when:** section headings and short intros (1-4 lines). The house style of Studio Freight / darkroom.engineering, Locomotive and most Awwwards SOTDs. Avoid on body paragraphs, on every heading of a long page (reads as a template), and on text users need immediately (nav, pricing numbers).  
**Stack:** GSAP SplitText 3.13+

```tsx
"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type Props = { children: ReactNode; as?: ElementType; className?: string; delay?: number; onScroll?: boolean };

export function LineReveal({ children, as: Tag = "h2", className, delay = 0, onScroll = true }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          if (ctx.conditions?.reduce) {
            gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay });
            return;
          }
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "line",
            autoSplit: true,
            onSplit(self) {
              gsap.set(el, { autoAlpha: 1 });
              return gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.09,
                delay,
                scrollTrigger: onScroll ? { trigger: el, start: "top 85%", once: true } : undefined,
              });
            },
          });
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
```

Vanilla (CDN):

```html
<h2 class="reveal" data-reveal>Design systems that move with intent</h2>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>
<script>
  gsap.registerPlugin(SplitText);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".reveal").forEach((el) => {
    if (reduce) { gsap.set(el, { autoAlpha: 1 }); return; }
    SplitText.create(el, {
      type: "lines", mask: "lines", autoSplit: true,
      onSplit: (self) => {
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09 });
      },
    });
  });
</script>
```

Verified API facts (gsap 3.15 source): `mask` wraps each line/word/char in a clone of the same element with `overflow: clip`, class names get a `-mask` suffix (`.line-mask`). `autoSplit` only re-splits when `type` includes `lines`: it listens to `document.fonts` `loadingdone` and a ResizeObserver debounced 200 ms that fires only when the element's width changes; the animation returned from `onSplit` is reverted and recreated with its `totalTime` carried over, so a mid-flight reveal does not restart. SplitText instances are recorded by `gsap.context()` / `useGSAP`, so unmount reverts the DOM.  
**Tune:** `yPercent` 100-120 (below 100 shows the top of glyphs before start); `duration` 0.9-1.3; `stagger` 0.06-0.12 (lines), `ease` `expo.out` or `power4.out`. For a "curtain" feel add `rotate: 3, transformOrigin: "0% 100%"` on lines.  
**A11y/perf:** SplitText default `aria: "auto"` puts `aria-label` on the target and `aria-hidden` on pieces. `aria-label` is honoured on headings, links and buttons but prohibited on `<p>`/`<div>`/`<span>`: for those pass `aria: "none"` and add an sr-only copy. Transform-only, cheap. Do not use `text-wrap: balance` on the split element (GSAP docs: it interferes with line detection).

### 2. Word / char reveal variants
**Looks like:** the same mask mechanic at word or char granularity, from different directions.  
**Use when / avoid when:** words for 1-2 line display headlines; chars only for very short (1-3 word) display type, logos, numbers. Char splitting a 12-word headline produces 70+ tweens and reads as fussy.  
**Stack:** GSAP SplitText

```ts
// lib/reveals.ts - drop-in configs: SplitText.create(el, { ...R.split, autoSplit: true, onSplit: R.from })
import { gsap, SplitText } from "@/lib/gsap";

export const REVEALS = {
  wordsUp: {
    split: { type: "words,lines", mask: "words" },
    from: (s: SplitText) => gsap.from(s.words, { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.04 }),
  },
  charsUp: {
    split: { type: "chars,words", mask: "chars", smartWrap: true },
    from: (s: SplitText) => gsap.from(s.chars, { yPercent: 100, duration: 0.7, ease: "power3.out", stagger: { each: 0.018, from: "start" } }),
  },
  charsCenter: {
    split: { type: "chars,words", mask: "chars", smartWrap: true },
    from: (s: SplitText) => gsap.from(s.chars, { yPercent: 100, duration: 0.8, ease: "expo.out", stagger: { each: 0.02, from: "center" } }),
  },
  wordsSideways: {
    split: { type: "words,lines", mask: "lines" },
    from: (s: SplitText) => gsap.from(s.words, { xPercent: -30, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.03 }),
  },
  linesFadeUp: {
    split: { type: "lines" },
    from: (s: SplitText) => gsap.from(s.lines, { y: 24, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }),
  },
} as const;
```

**Tune:** char stagger 0.012-0.03 s (total sequence under ~0.8 s), word stagger 0.03-0.07 s. `smartWrap: true` keeps words from breaking mid-word when splitting chars only. Add `font-kerning: none` on char-split text if you see kerning jumps when pieces become inline-blocks (GSAP docs tip).  
**A11y/perf:** same as recipe 1. Chars + mask doubles the node count; keep under ~200 animated nodes per view.

### 3. CSS-only split reveal (no GSAP)
**Looks like:** words rise out of per-word masks on load or when scrolled into view; zero JS for the animation.  
**Use when / avoid when:** RSC-heavy sites, when you want reveals without shipping GSAP, or in a hero where the delay must survive hydration. Cannot detect rendered lines (use SplitText for true line masks).  
**Stack:** CSS (+ the `Split` component above, or hand-written spans)

```tsx
import { Split } from "@/components/text/split";

export function HeroTitle() {
  return <Split as="h1" text="Interfaces with a pulse" className="css-reveal display" />;
}
```

```css
/* Each word is its own mask: translate and the bottom clip inset move by the same
   100% with the same easing, so the clip edge stays fixed on the page while the word rises. */
.css-reveal [aria-hidden] .w {
  padding-block: 0.1em;        /* box includes accents + descenders */
  margin-block: -0.1em;
}
@media (prefers-reduced-motion: no-preference) {
  .css-reveal [aria-hidden] .w {
    animation: word-mask-in var(--dur-reveal) var(--ease-out-expo) both;
    animation-delay: calc(200ms + var(--i) * var(--stagger-word));
  }
}
@keyframes word-mask-in {
  from { translate: 0 100%; clip-path: inset(0 0 100% 0); }
  to   { translate: 0 0;    clip-path: inset(0 0 0 0); }
}
```

Scroll-triggered variant (Chromium 115+, Safari 26+; Firefox shows the static end state):

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .css-reveal--scroll [aria-hidden] .w {
      animation: word-mask-in linear both;
      animation-timeline: view();          /* must come AFTER the shorthand */
      animation-range: entry calc(10% + var(--i) * 3%) entry calc(60% + var(--i) * 3%);
    }
  }
}
```

**Tune:** keep translate and inset percentages identical (100%/100%) or the edge drifts; delay base 150-300 ms so the reveal starts after first paint; stagger 40-80 ms per word; for scroll ranges, 2-4% offset per word. Do not add `overflow: clip` to the moving word (it would travel with it).  
**A11y/perf:** `clip-path: inset()` on small inline-blocks is compositor-friendly enough; do not do this on 200+ words. Reduced motion: no animation declared, text simply present.

### 4. Staggered blur-in
**Looks like:** words fade from a 10 px blur and a small rise into sharp focus, like Apple keynote titles or Magic UI `TextAnimate` "blurIn".  
**Use when / avoid when:** one hero line or a short quote, played once. Very common in 2025-26 AI-built landing pages (every word of every heading blur-fading in = template tell). Never scrub blur with scroll on large text; never on paragraphs.  
**Stack:** CSS | Motion

```css
.blur-in [aria-hidden] .w { opacity: 0; }
@media (prefers-reduced-motion: no-preference) {
  .blur-in [aria-hidden] .w {
    filter: blur(10px);
    translate: 0 0.25em;
    animation: blur-in var(--dur-slow) var(--ease-out-quart) forwards;
    animation-delay: calc(150ms + var(--i) * var(--stagger-word));
  }
}
@media (prefers-reduced-motion: reduce) {
  .blur-in [aria-hidden] .w { animation: fade-in 400ms ease-out forwards; }
}
@keyframes blur-in { to { opacity: 1; filter: none; translate: 0 0; } }
@keyframes fade-in { to { opacity: 1; } }
```

Motion version (in-view, once):

```tsx
"use client";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { stagger } from "motion";

export function BlurIn({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const container: Variants = { hidden: {}, show: { transition: { delayChildren: stagger(0.06, { startDelay: 0.1 }) } } };
  const word: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, filter: "blur(10px)", y: "0.25em" },
        show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
      };
  return (
    <motion.h2 className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} variants={container}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((w, i) => (
          <motion.span key={i} variants={word} className="inline-block whitespace-nowrap">
            {w}
            {" "}
          </motion.span>
        ))}
      </span>
    </motion.h2>
  );
}
```

**Tune:** blur 6-12 px (above 16 px looks like a loading glitch), rise 0.15-0.3em, duration 0.7-1 s, stagger 40-80 ms per word.  
**A11y/perf:** `filter` forces a repaint of each word per frame; fine for 5-15 words once, janky on mobile when 50+ words or scroll-scrubbed. After the animation the `filter: none` end state releases the layer. Reduced motion: opacity only.

### 5. rotateX flip-up chars
**Looks like:** each letter swings up from lying flat on its back, like a split-flap board, with a slight overshoot.  
**Use when / avoid when:** short display words (brand name, section number, 404), preloader words. Poster/playful brands. Avoid for serious/editorial voices and anything over ~20 chars.  
**Stack:** GSAP SplitText

```tsx
"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export function FlipUp({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      SplitText.create(el, {
        type: "chars,words",
        charsClass: "char",
        smartWrap: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          return gsap.from(self.chars, {
            rotateX: -95,
            yPercent: 40,
            opacity: 0,
            transformPerspective: 700,
            transformOrigin: "50% 100% -0.3em",
            duration: 0.9,
            ease: "back.out(1.7)",
            stagger: 0.03,
          });
        },
      });
    },
    { scope: ref },
  );
  return (
    <h2 ref={ref} data-reveal style={{ fontKerning: "none" }}>
      {text}
    </h2>
  );
}
```

**Tune:** `rotateX` -80 to -100; `transformPerspective` 500-900 (lower = more dramatic); `back.out(1.4-2)`; stagger 0.02-0.04 s. Swap to `from: "random"` stagger for a split-flap board feel.  
**A11y/perf:** transforms only. Reduced motion: shown immediately. `transformPerspective` per char avoids needing `perspective` on a parent that SplitText does not create.

### 6. Scramble / decode / "decrypted" text
**Looks like:** characters cycle through random glyphs and lock into the final text left to right (Magic UI `HyperText`, React Bits `DecryptedText`, the "matrix" decode).  
**Use when / avoid when:** dev-tool, security, data, terminal voices; nav links on hover; short labels (2-4 words) and numbers. Overused in 2024-26 dev portfolios on every label; keep to one role (for example hover on nav only). Never on long text or body copy.  
**Stack:** GSAP ScrambleText | vanilla (dependency-free)

GSAP:

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function ScrambleLink({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { contextSafe } = useGSAP({ scope: ref });
  const play = contextSafe(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(ref.current!.querySelector("[data-text]"), {
      duration: 0.6,
      overwrite: true,
      scrambleText: { text: label, chars: "upperCase", speed: 0.6, revealDelay: 0.1 },
    });
  });
  return (
    <a ref={ref} href={href} onPointerEnter={play} onFocus={play} aria-label={label} className="font-mono uppercase">
      <span data-text aria-hidden="true">{label}</span>
    </a>
  );
}
```

ScrambleText options (verified): `text`, `chars` (`"upperCase" | "lowerCase" | "upperAndLowerCase"` or any string like `"01"`), `revealDelay`, `speed` (default 1, lower = slower glyph churn), `delimiter`, `tweenLength` (default true), `newClass`, `oldClass`, `rightToLeft`.

Dependency-free (also the "decrypt on reveal" hero version):

```ts
// lib/scramble.ts
export type ScrambleOptions = { duration?: number; chars?: string; swapEvery?: number; lead?: number };

export function scramble(el: HTMLElement, finalText: string, opts: ScrambleOptions = {}): () => void {
  const { duration = 900, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>", swapEvery = 45, lead = 0.35 } = opts;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = finalText;
    return () => {};
  }
  const len = finalText.length;
  const current = Array.from({ length: len }, () => "");
  const start = performance.now();
  let lastSwap = 0;
  let raf = 0;
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const swap = now - lastSwap >= swapEvery;
    if (swap) lastSwap = now;
    let out = "";
    for (let i = 0; i < len; i++) {
      const lockAt = lead + ((i + 1) / len) * (1 - lead);
      const ch = finalText[i];
      if (ch === " " || t >= lockAt) out += ch;
      else {
        if (swap || !current[i]) current[i] = pick();
        out += current[i];
      }
    }
    el.textContent = out;
    if (t < 1) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = finalText;
  };
}
```

```tsx
"use client";
import { useEffect, useRef } from "react";
import { scramble } from "@/lib/scramble";

export function DecryptHeading({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let stop = () => {};
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        stop = scramble(el, text, { duration: 1200 });
        io.disconnect();
      }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, [text]);
  return (
    <h2 className="font-mono tracking-tight">
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">{text}</span>
    </h2>
  );
}
```

**Tune:** `swapEvery` 40-70 ms (per-frame swapping at 120 Hz looks like noise, not decoding); duration 0.5-0.8 s hover, 1-1.4 s hero; `lead` 0.2-0.4 (time spent fully scrambled). Glyph set changes the voice: `01` binary, `ABCDEF0123456789` hex, katakana for "matrix".  
**A11y/perf:** width jitter is the classic bug: use a monospace font (`Geist Mono`, `JetBrains Mono`) or fix the element's `inline-size` to the final text width. Screen readers get the sr-only text; the animated span is hidden. Reduced motion: final text set immediately.

### 7. Typewriter with caret
**Looks like:** text appears character by character behind a blinking caret; optionally deletes and types the next phrase.  
**Use when / avoid when:** terminal/CLI product demos, chat/AI product mockups, a single hero line in a dev portfolio. The "Hi, I'm X and I build |" rotating typewriter is the most cliched portfolio hero of the last decade; prefer typing a real command or prompt.  
**Stack:** CSS (fixed string, monospace) | React (dynamic phrases)

CSS-only (monospace only, `--n` = character count):

```html
<p class="typewriter" style="--n: 27">npx create-next-app@latest</p>
```

```css
.typewriter {
  font-family: var(--font-mono), ui-monospace, monospace;
  inline-size: calc(var(--n) * 1ch);
  white-space: nowrap;
  overflow: clip;
  border-inline-end: 0.1em solid currentColor;
}
@media (prefers-reduced-motion: no-preference) {
  .typewriter {
    animation:
      type calc(var(--n) * 55ms) steps(var(--n), end) 400ms both,
      caret 1s step-end infinite;
  }
}
@keyframes type { from { inline-size: 0; } }
@keyframes caret { 50% { border-color: transparent; } }
```

React, multiple phrases with delete:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

type Props = { phrases: string[]; typeMs?: number; deleteMs?: number; holdMs?: number };

export function Typewriter({ phrases, typeMs = 55, deleteMs = 28, holdMs = 1600 }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const target = phrases[index];
    let delay = deleting ? deleteMs : typeMs + Math.random() * 40;
    if (!deleting && shown === target) delay = holdMs;
    const id = window.setTimeout(() => {
      if (!deleting && shown === target) setDeleting(true);
      else if (deleting && shown === "") {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      } else setShown(deleting ? target.slice(0, shown.length - 1) : target.slice(0, shown.length + 1));
    }, delay);
    return () => window.clearTimeout(id);
  }, [shown, deleting, index, phrases, typeMs, deleteMs, holdMs, reduce]);

  return (
    <span>
      <span className="sr-only">{phrases.join(", ")}</span>
      <span aria-hidden="true" className="tw">{reduce ? phrases[0] : shown}</span>
    </span>
  );
}
```

```css
.tw::after {
  content: "";
  display: inline-block;
  inline-size: 0.08em;
  block-size: 1em;
  margin-inline-start: 0.06em;
  vertical-align: -0.1em;
  background: currentColor;
  animation: caret 1s step-end infinite;
}
@keyframes caret { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tw::after { animation: none; } }
```

**Tune:** type 40-80 ms/char with 0-40 ms random jitter (human feel), delete 2x faster than typing, hold 1.2-2 s. Caret blink 1 s step-end (0.53 s on/off is the macOS cadence).  
**A11y/perf:** never put the changing text in an `aria-live` region. Auto-updating content that runs longer than 5 s needs a pause mechanism under WCAG 2.2.2; stop after one loop or pause on hover/focus if the phrases are essential.

### 8. Rotating words (height-masked slot)
**Looks like:** one word in a headline slides up and is replaced by the next ("Built for [designers / founders / teams]"), inside a one-line-tall window.  
**Use when / avoid when:** 3-5 genuinely different audiences or verbs. Cliche when the words are synonyms ("fast / quick / rapid") or when the rotating word is the only interesting thing on the page.  
**Stack:** CSS (fixed count) | Motion (any count)

CSS, 4 words (keyframe percentages are for n = 4; for n words the word is in during `0 -> 24/n %`, holds to `100/n %`, exits by `124/n %`):

```html
<h1>Built for
  <span class="rotator" style="--n: 4; --hold: 2.2s">
    <span class="sr-only">designers, founders, engineers, teams</span>
    <span class="rotator__slot" aria-hidden="true">
      <span style="--i: 0">designers</span>
      <span style="--i: 1">founders</span>
      <span style="--i: 2">engineers</span>
      <span style="--i: 3">teams</span>
    </span>
  </span>
</h1>
```

```css
.rotator__slot {
  display: inline-grid;          /* all words share one cell: width = widest word */
  overflow: clip;
  vertical-align: bottom;
  padding-block: 0.1em;          /* keep descenders inside the clip */
  margin-block: -0.1em;
}
.rotator__slot > span { grid-area: 1 / 1; translate: 0 110%; }
@media (prefers-reduced-motion: no-preference) {
  .rotator__slot > span {
    animation: rotate-4 calc(var(--n) * var(--hold)) var(--ease-in-out-quint) infinite both;
    animation-delay: calc(var(--i) * var(--hold));
  }
}
@media (prefers-reduced-motion: reduce) {
  .rotator__slot > span:not(:first-child) { visibility: hidden; }
  .rotator__slot > span:first-child { translate: 0 0; }
}
@keyframes rotate-4 {
  0% { translate: 0 110%; }
  6%, 25% { translate: 0 0; }
  31%, 100% { translate: 0 -110%; }
}
```

Motion (width animates to each word, any count):

```tsx
"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function RotatingWord({ words, interval = 2200 }: { words: string[]; interval?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [width, setWidth] = useState<number | "auto">("auto");
  const measure = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [reduce, interval, words.length]);

  useLayoutEffect(() => {
    if (measure.current) setWidth(measure.current.getBoundingClientRect().width);
  }, [i]);

  return (
    <span className="relative inline-block align-bottom">
      <span className="sr-only">{words.join(", ")}</span>
      <span ref={measure} aria-hidden="true" className="invisible absolute whitespace-nowrap">{words[i]}</span>
      <motion.span
        aria-hidden="true"
        className="relative inline-flex overflow-clip whitespace-nowrap py-[0.1em] -my-[0.1em]"
        animate={{ width }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[i]}
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-110%" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  );
}
```

**Tune:** hold 1.8-2.6 s; transition 0.45-0.6 s; ease in-out-quint for CSS (both directions visible), expo-out for Motion. Color the rotating word or set it in the italic serif of the pairing (see `typography.md`) so it reads as the variable.  
**A11y/perf:** sr-only lists all words once; the visual slot is hidden. WCAG 2.2.2: infinite rotation needs pause (hover/focus pause or stop after one cycle). Animating `width` is a layout animation on one inline element; acceptable, but never on many elements.

### 9. Text roll on hover
**Looks like:** on hover each letter slides up and an identical copy rolls in from below, staggered left to right (Locomotive/Obys-style nav links, Codrops "text roll" demos, Motion Primitives `TextRoll`).  
**Use when / avoid when:** nav links, footer links, primary CTA label. One of the best effort/quality ratios on the web. Avoid on body links (distracting mid-sentence) and on links longer than ~20 chars.  
**Stack:** CSS (+ tiny React splitter)

```tsx
import type { CSSProperties } from "react";
import { graphemes } from "@/components/text/split";

export function RollLink({ href, label, accent = false }: { href: string; label: string; accent?: boolean }) {
  return (
    <a href={href} className={accent ? "roll roll--accent" : "roll"}>
      <span className="sr-only">{label}</span>
      <span className="roll__label" aria-hidden="true">
        {graphemes(label).map((c, i) => (
          <span key={i} className="roll__char" data-char={c} style={{ "--i": i } as CSSProperties}>
            {c === " " ? " " : c}
          </span>
        ))}
      </span>
    </a>
  );
}
```

```css
.roll { --roll-lh: 1.2em; color: inherit; text-decoration: none; }
.roll__label { display: inline-flex; overflow: clip; line-height: var(--roll-lh); block-size: var(--roll-lh); }
.roll__char {
  display: inline-block;
  text-shadow: 0 var(--roll-lh) currentColor;             /* the copy that rolls in */
  transition: translate var(--dur-base) var(--ease-out-expo);
  transition-delay: calc(var(--i) * var(--stagger-char));
}
/* Accent variant: copy in another color via generated content, hidden from AT with alt text "" */
.roll--accent .roll__char { position: relative; text-shadow: none; }
.roll--accent .roll__char::after {
  content: attr(data-char) / "";
  position: absolute; inset-inline-start: 0; inset-block-start: 100%;
  color: var(--accent);
}
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .roll:hover .roll__char,
  .roll:focus-visible .roll__char { translate: 0 calc(-1 * var(--roll-lh)); }
}
@media (prefers-reduced-motion: reduce) {
  .roll:hover, .roll:focus-visible { text-decoration: underline; text-underline-offset: 0.2em; }
}
```

**Tune:** duration 380-550 ms, char stagger 12-25 ms (keep total under ~350 ms or the last letters feel late), `--roll-lh` 1.1-1.3em. For a 3D drum feel use `rotateX` per char like Motion Primitives TextRoll; the flat slide is cleaner.  
**A11y/perf:** transform only. Keyboard users get it on `:focus-visible`. Touch devices: no hover, label is static.

### 10. Letter hover wave
**Looks like:** hovering a word sends a small bump through its letters, one after another, then everything settles.  
**Use when / avoid when:** a logo, a single playful word, a 404 title. Never on nav that already has another hover effect; one wave per page.  
**Stack:** CSS (fires on hover-in) | WAAPI (always completes)

```css
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .wave:hover [aria-hidden] .c {
    animation: wave 700ms var(--ease-out-quart) both;
    animation-delay: calc(var(--i) * 28ms);
  }
}
@keyframes wave { 0%, 100% { translate: 0 0; } 35% { translate: 0 -0.22em; } }
```

The CSS version snaps back if the pointer leaves mid-wave. WAAPI version runs to completion:

```ts
export function bindWave(root: HTMLElement): () => void {
  if (!matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return () => {};
  const chars = Array.from(root.querySelectorAll<HTMLElement>("[aria-hidden] .c"));
  let running = false;
  const play = () => {
    if (running) return;
    running = true;
    const anims = chars.map((c, i) =>
      c.animate(
        [{ translate: "0 0" }, { translate: "0 -0.22em", offset: 0.35, easing: "cubic-bezier(0.25,1,0.5,1)" }, { translate: "0 0" }],
        { duration: 700, delay: i * 28, easing: "ease-in-out" },
      ),
    );
    Promise.all(anims.map((a) => a.finished)).finally(() => { running = false; });
  };
  root.addEventListener("pointerenter", play);
  return () => root.removeEventListener("pointerenter", play);
}
```

**Tune:** amplitude 0.15-0.3em, per-char delay 20-40 ms, duration 600-900 ms. Variant: animate `--wght` (recipe 11) instead of translate for a weight ripple.  
**A11y/perf:** transform only; run once per hover-in, not on every pointermove.

### 11. Variable-font axis animation
**Looks like:** weight, width, slant or optical size morph smoothly (letters thicken on hover, a word "breathes", a wave of weight passes through a line).  
**Use when / avoid when:** type-led brands and specimen-like pages. Only looks premium with a font that has real axes: Mona Sans / Hubot Sans (wdth 75-125, wght 200-900), Roboto Flex and Google Sans Flex (wdth 25-151, wght 1-1000, GRAD, opsz, slnt), Anybody (wdth 50-150), Science Gothic (wdth 50-200), Fraunces (SOFT, WONK, opsz), Recursive (CASL, MONO, slnt), Bricolage Grotesque (opsz, wdth). All on Google Fonts (axis ranges verified from the GF metadata API).  
**Stack:** CSS (`@property`)

```css
@property --wght { syntax: "<number>"; inherits: true; initial-value: 400; }
@property --wdth { syntax: "<number>"; inherits: true; initial-value: 100; }
@property --grad { syntax: "<number>"; inherits: true; initial-value: 0; }

.vf {
  font-family: var(--font-display);
  font-variation-settings: "wght" var(--wght), "wdth" var(--wdth), "GRAD" var(--grad);
  transition: --wght var(--dur-base) var(--ease-out-expo), --wdth var(--dur-base) var(--ease-out-expo), --grad var(--dur-fast) ease-out;
}
@media (hover: hover) { .vf:hover { --wght: 800; --wdth: 125; } }

/* Bolder on hover WITHOUT reflow: GRAD changes stroke weight but keeps advance widths */
@media (hover: hover) { .vf-link:hover { --grad: 100; } }

/* Breathing weight wave through split chars (Split by="chars") */
@media (prefers-reduced-motion: no-preference) {
  .vf-wave [aria-hidden] .c {
    animation: breathe 2.4s var(--ease-in-out-quint) infinite alternate;
    animation-delay: calc(var(--i) * -120ms);
  }
}
@keyframes breathe { from { --wght: 200; } to { --wght: 900; } }
```

Load the axes: `Mona_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display" })` with `next/font/google` (only `wght` is included by default; see `typography.md#loading-fonts`).  
**Tune:** prefer the high-level properties when you animate one axis (`font-weight` 300-800, `font-stretch` 75%-125%, `font-style: oblique 0deg` to `10deg`); use registered properties when several axes need independent timing or per-char delays. Negative delays start the wave mid-cycle so it never "boots up".  
**A11y/perf:** `wght`/`wdth` change glyph advances, so every frame re-lays out the line: fine for one headline, bad for paragraphs; add `contain: layout paint` on the wrapper and give it a fixed width if neighbours jump. `GRAD` and `opsz` do not reflow. Reduced motion: no loop, static mid weight.

### 12. Cursor-proximity variable type
**Looks like:** letters near the pointer swell in weight/width and relax as it moves away (React Bits "Text Pressure", ported from Juan Fuentes' CodePen, and "Variable Proximity").  
**Use when / avoid when:** a single hero word or wordmark on a type-driven or playful site. Desktop only. Gimmick if the font has no width axis or if it is used on more than one element.  
**Stack:** React + rAF (no library)

```tsx
"use client";
import { useEffect, useRef } from "react";
import { graphemes } from "@/components/text/split";

type Axis = { tag: string; min: number; max: number };
type Props = { text: string; radius?: number; axes?: Axis[]; className?: string };

const AXES: Axis[] = [
  { tag: "wght", min: 300, max: 900 },
  { tag: "wdth", min: 75, max: 125 },
];
const LERP = 0.18;

export function VariableProximity({ text, radius = 200, axes = AXES, className }: Props) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-c]"));
    const value = chars.map(() => 0);
    let centers: { x: number; y: number }[] = [];
    let px = -1e6;
    let py = -1e6;
    let raf = 0;
    let running = false;

    const measure = () => {
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
      });
    };
    const settings = (t: number) => axes.map((a) => `"${a.tag}" ${(a.min + (a.max - a.min) * t).toFixed(1)}`).join(", ");
    const tick = () => {
      let moving = false;
      chars.forEach((c, i) => {
        const d = Math.hypot(px - centers[i].x, py - centers[i].y);
        const target = Math.max(0, 1 - d / radius);
        value[i] += (target - value[i]) * LERP;
        if (Math.abs(target - value[i]) > 0.002) moving = true;
        const s = value[i] * value[i] * (3 - 2 * value[i]);
        c.style.fontVariationSettings = settings(s);
      });
      if (moving) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => { px = e.pageX; py = e.pageY; wake(); };
    const onLeave = () => { px = -1e6; py = -1e6; wake(); };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts.ready.then(measure);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [axes, radius]);

  return (
    <span ref={root} className={className} style={{ fontVariationSettings: axes.map((a) => `"${a.tag}" ${a.min}`).join(", ") }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {graphemes(text).map((g, i) => (
          <span key={i} data-c style={{ display: "inline-block", whiteSpace: "pre" }}>{g}</span>
        ))}
      </span>
    </span>
  );
}
```

**Tune:** radius 150-300 px (2-4 letters), lerp 0.12-0.25, axis ranges inside the font's real limits (React Bits passes wdth 5-200 but Roboto Flex clamps at 25-151). Smoothstep falloff reads better than linear. Pass `axes` as a module constant, not an inline array, or the effect re-binds every render.  
**A11y/perf:** this version caches char centres in page coordinates and sleeps when nothing moves; the React Bits original calls `getBoundingClientRect` on every char every frame, which thrashes layout. Each frame still re-lays the line (wght/wdth), so keep it to one element under ~20 chars. Touch/reduced motion: static min weight.

### 13. Stretch / scale-on-scroll giant type
**Looks like:** a screen-wide word grows from squashed to full height (or from narrow to wide on the width axis) as it enters the viewport; common on agency sites (Obys, Cuberto-style) and big footers.  
**Use when / avoid when:** one brand word or section title per page, in a heavy grotesk or condensed face. Avoid with thin serifs (non-uniform scaling distorts hairlines).  
**Stack:** CSS scroll-driven | GSAP fallback (pinned scrubs live in `scroll-gsap.md`)

```css
.giant {
  font-size: clamp(4rem, 17vw, 22rem);
  line-height: 0.82;
  letter-spacing: -0.045em;
  transform-origin: 50% 100%;
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .giant {
      animation: giant-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 45%;
    }
  }
}
@keyframes giant-rise { from { scale: 1 0.25; } to { scale: 1 1; } }

/* Width-axis variant for fonts with wdth (layout cost: one element only) */
@keyframes giant-widen { from { font-stretch: 75%; } to { font-stretch: 125%; } }
```

```ts
// GSAP fallback where scroll-driven animations are missing (Firefox as of 2026-09)
if (!CSS.supports("animation-timeline: view()")) {
  gsap.fromTo(".giant", { scaleY: 0.25 }, {
    scaleY: 1, ease: "none", transformOrigin: "50% 100%",
    scrollTrigger: { trigger: ".giant", start: "top bottom", end: "top 40%", scrub: true },
  });
}
```

**Tune:** start scaleY 0.2-0.4; range should finish before the word is centred (cover 40-55%); letter-spacing -0.03 to -0.06em at this size.  
**A11y/perf:** `scale` is compositor-only; `font-stretch` animation re-lays out each frame. Reduced motion: static full size.

### 14. Fit text to width (giant wordmark footer)
**Looks like:** a word set exactly edge to edge of its container at any viewport (the 2024-26 "giant wordmark footer").  
**Use when / avoid when:** footer wordmark, poster headline, section numbers. Overused as a default footer on AI-generated SaaS pages; earn it with a real brand word, a distinctive face, and maybe a reveal. If the word is a logo, use the SVG logo at `width: 100%` instead of live text.  
**Stack:** CSS (`text-fit`, container units) | JS fallback

Tier 1, native: `text-fit` (CSS Text 5: `[none | grow | shrink] [consistent | per-line | per-line-all]? <percentage>?`), shipping in Chrome 150 per the May 2026 intent to ship; Gecko/WebKit "no signal", so progressive only:

```css
.wordmark { font-size: 10vw; white-space: nowrap; text-fit: grow per-line-all; }
```

Tier 2, static word, zero JS: measure once how many `em` wide the word is (devtools: rendered width / font-size), then size by container width:

```css
.wordmark-wrap { container-type: inline-size; }
.wordmark {
  --em-width: 5.62;                       /* your word in your display face at 1em, measured */
  font-size: calc(100cqi / var(--em-width));
  line-height: 0.8;
  white-space: nowrap;
  letter-spacing: -0.04em;                /* measure AFTER setting tracking */
}
```

Tier 3, any text, pure CSS (Roman Komarov, kizu.dev/fit-to-width: a hidden duplicate is measured and `tan(atan2())` divides lengths into a unitless ratio):

```html
<p class="text-fit"><span><span>Any dynamic text</span></span><span aria-hidden="true">Any dynamic text</span></p>
```

```css
.text-fit {
  display: flex;
  container-type: inline-size;
  --captured-length: initial;
  --support-sentinel: var(--captured-length, 9999px);
  & > [aria-hidden] { visibility: hidden; }
  & > :not([aria-hidden]) {
    flex-grow: 1;
    container-type: inline-size;
    --captured-length: 100cqi;
    --available-space: var(--captured-length);
    & > * {
      --support-sentinel: inherit;
      --captured-length: 100cqi;
      --ratio: tan(atan2(var(--available-space), var(--available-space) - var(--captured-length)));
      --font-size: clamp(1em, 1em * var(--ratio), var(--max-font-size, infinity * 1px) - var(--support-sentinel));
      inline-size: var(--available-space);
      display: block;
      font-size: var(--font-size);
      @container (inline-size > 0) { white-space: nowrap; }
    }
  }
}
@property --captured-length { syntax: "<length>"; initial-value: 0px; inherits: true; }
```

JS fallback (works everywhere, re-fits on resize and font load):

```ts
export function fitText(el: HTMLElement): () => void {
  const parent = el.parentElement;
  if (!parent) return () => {};
  const fit = () => {
    el.style.fontSize = "100px";
    const ratio = parent.clientWidth / el.scrollWidth;
    el.style.fontSize = `${Math.floor(100 * ratio * 100) / 100}px`;
  };
  const ro = new ResizeObserver(fit);
  ro.observe(parent);
  document.fonts.ready.then(fit);
  return () => ro.disconnect();
}
```

**Tune:** `line-height` 0.75-0.85 and negative tracking so the block reads as one object; trim leftover top/bottom space with `text-box: trim-both cap alphabetic` (Chrome 133+, Safari 18.2+). Set `--max-font-size` in tier 3 to stop ultrawide monitors blowing it up.  
**A11y/perf:** fitted text can ignore user text zoom (open CSSWG a11y issue #12886 for `text-fit`); keep the wordmark decorative or repeated as normal text. Tier 2 uses `cqi` (baseline 2023).

### 15. Outline / stroke text with fill
**Looks like:** hollow letters that fill with ink left to right on hover, or as the section scrolls through.  
**Use when / avoid when:** alternating rows of a big marquee, a ghost word behind content, a hover state on giant nav. Outline-everything was a 2018-2021 agency trend; today use it as contrast against solid type, not as the whole voice.  
**Stack:** CSS

```html
<a class="outline-fill" href="/work">
  Selected work
  <span class="outline-fill__ink" aria-hidden="true">Selected work</span>
</a>
```

```css
.outline-fill {
  --ink: #111;
  position: relative;
  display: inline-block;
  color: transparent;
  -webkit-text-stroke: 0.018em var(--ink);   /* never currentColor here: color is transparent */
}
.outline-fill__ink {
  position: absolute; inset: 0;
  color: var(--ink);
  -webkit-text-stroke: 0;
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--dur-slow) var(--ease-out-expo);
}
@media (hover: hover) { .outline-fill:hover .outline-fill__ink { clip-path: inset(0 0 0 0); } }
.outline-fill:focus-visible .outline-fill__ink { clip-path: inset(0 0 0 0); }

/* Fill on scroll (Chromium, Safari 26) */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .outline-fill--scroll .outline-fill__ink {
      transition: none;
      animation: ink-wipe linear both;
      animation-timeline: view();
      animation-range: cover 25% cover 60%;
    }
  }
}
@keyframes ink-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }

/* Stroke outside the fill when both are visible (paint-order on HTML text: baseline 2024) */
.stroke-outside { -webkit-text-stroke: 0.06em #000; paint-order: stroke fill; }
@media (forced-colors: active) { .outline-fill { color: CanvasText; -webkit-text-stroke: 0; } }
```

**Tune:** stroke 0.012-0.03em (em so it scales; 1px strokes vanish on giant type and look heavy on small), wipe 700-1000 ms expo-out.  
**A11y/perf:** outlined text alone fails contrast easily; keep it decorative or large. Variable fonts keep overlapping contours, so strokes can show internal seams in letters like A, R, Q: use a static single-weight file for outline text. Reduced motion: add `transition: none` so the hover fill is instant.

### 16. Gradient text + animated gradient
**Looks like:** headline filled with a gradient; premium version is a restrained vertical fade (Linear's white to ~55% white), loud version is Vercel's 2021 "Develop. Preview. Ship." cycling gradient words.  
**Use when / avoid when:** one phrase per page. Purple-to-pink or rainbow gradients on every H1 is the most recognisable AI-landing tell; use same-hue or neutral gradients, or one accent word.  
**Stack:** CSS (`background-clip: text`, `@property`)

```css
.text-fade {
  background: linear-gradient(180deg, var(--fg) 30%, color-mix(in oklab, var(--fg) 55%, transparent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  padding-block: 0.08em;                  /* avoid clipped descenders at tight line-height */
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;            /* each line gets the full gradient */
}

@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
.text-gradient-live {
  background: conic-gradient(from var(--angle) at 50% 50%, #ff7a18, #af002d, #319197, #ff7a18);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
@media (prefers-reduced-motion: no-preference) {
  .text-gradient-live { animation: spin-angle 8s linear infinite; }
}
@keyframes spin-angle { to { --angle: 360deg; } }

@media (forced-colors: active) {
  .text-fade, .text-gradient-live { background: none; -webkit-text-fill-color: CanvasText; color: CanvasText; }
}
```

**Tune:** animated period 6-12 s (faster reads as a toy); without `@property`, use `background-size: 200% 100%` and animate `background-position`. Interpolate stops in OKLCH (`linear-gradient(in oklch, ...)`) so the middle does not go muddy.  
**A11y/perf:** check contrast at the lightest stop. `@property` is baseline (Firefox 128+). An animated gradient repaints the text box each frame: fine for one headline, not for 20 cards. Reduced motion: static gradient.

### 17. Shimmer / shine text
**Looks like:** a soft band of light sweeps across muted text on a loop, the "Thinking..." status in ChatGPT/Claude/Perplexity (Motion Primitives `TextShimmer`, Magic UI `AnimatedShinyText`).  
**Use when / avoid when:** loading/streaming status, "new" badges, one announcement pill. On marketing headlines it reads as AI slop.  
**Stack:** CSS

```css
.shimmer {
  --base: #8a8a93;
  --shine: #ffffff;
  --band: 12%;
  background: linear-gradient(100deg, var(--base) calc(50% - var(--band)), var(--shine) 50%, var(--base) calc(50% + var(--band)))
    0 0 / 250% 100% no-repeat;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
@media (prefers-reduced-motion: no-preference) {
  .shimmer { animation: shimmer 2.2s linear infinite; }
}
@keyframes shimmer { from { background-position: 100% 0; } to { background-position: 0% 0; } }
@media (prefers-reduced-motion: reduce) { .shimmer { background: none; -webkit-text-fill-color: var(--base); color: var(--base); } }
```

**Tune:** band 8-15%, period 1.6-2.6 s, base color >= 4.5:1 against the background (readable without the band).  
**A11y/perf:** put status text in `role="status"` and change it only when the state changes, not per frame. Never use `currentColor` inside the gradient: `color` is transparent.

### 18. Aurora text
**Looks like:** soft colored light blobs drift slowly inside the letterforms (Magic UI `AuroraText`).  
**Use when / avoid when:** one word in a hero on a dark, atmospheric brand. Default-palette aurora words ("#FF0080, #7928CA, #0070F3") are an instant AI-template tell; derive colors from the brand and keep them close in hue.  
**Stack:** CSS (`@property` animated gradient positions)

```css
@property --a1 { syntax: "<percentage>"; initial-value: 10%; inherits: false; }
@property --a2 { syntax: "<percentage>"; initial-value: 90%; inherits: false; }
@property --a3 { syntax: "<percentage>"; initial-value: 50%; inherits: false; }

.aurora {
  --c1: oklch(0.82 0.13 190);
  --c2: oklch(0.72 0.18 300);
  --c3: oklch(0.86 0.14 150);
  background:
    radial-gradient(40% 70% at var(--a1) 35%, var(--c1), transparent 70%),
    radial-gradient(35% 65% at var(--a2) 65%, var(--c2), transparent 70%),
    radial-gradient(45% 80% at var(--a3) 50%, var(--c3), transparent 70%),
    var(--fg);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  padding-block: 0.08em;
}
@media (prefers-reduced-motion: no-preference) {
  .aurora { animation: aurora-drift 14s ease-in-out infinite alternate; }
}
@keyframes aurora-drift {
  0%   { --a1: 10%; --a2: 90%; --a3: 50%; }
  50%  { --a1: 55%; --a2: 25%; --a3: 85%; }
  100% { --a1: 90%; --a2: 10%; --a3: 20%; }
}
```

**Tune:** period 10-20 s (slower = more expensive-looking); 3 blobs max; keep lightness within 0.1 L of each other so the word does not flicker between readable and unreadable.  
**A11y/perf:** every stop must pass contrast on its own. One element only (full-box repaint per frame). Reduced motion: static blobs.

### 19. Glitch text (tasteful)
**Looks like:** on hover, two color-shifted copies jitter through horizontal slices for a quarter second, then vanish.  
**Use when / avoid when:** music, gaming, security, "broken" 404 pages. A permanent looping glitch is a cyberpunk cliche and, at large sizes, can breach WCAG 2.3.1 (no more than three flashes per second). Interaction-triggered, short, small area only.  
**Stack:** CSS

```html
<h2 class="glitch" data-text="SIGNAL LOST">SIGNAL LOST</h2>
```

```css
.glitch { position: relative; display: inline-block; }
.glitch::before,
.glitch::after {
  content: attr(data-text) / "";          /* empty alt text: not announced twice */
  position: absolute; inset: 0;
  opacity: 0;
  pointer-events: none;
  mix-blend-mode: screen;                  /* use multiply on light backgrounds */
}
.glitch::before { color: #00e5ff; }
.glitch::after  { color: #ff2bd6; }
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .glitch:hover::before { animation: glitch-a 260ms steps(1, end) both; }
  .glitch:hover::after  { animation: glitch-b 260ms steps(1, end) both; }
}
@keyframes glitch-a {
  0%   { opacity: 1; clip-path: inset(12% 0 58% 0); translate: -0.04em 0; }
  33%  { opacity: 1; clip-path: inset(62% 0 18% 0); translate: 0.05em 0; }
  66%  { opacity: 1; clip-path: inset(34% 0 44% 0); translate: -0.02em 0; }
  100% { opacity: 0; }
}
@keyframes glitch-b {
  0%   { opacity: 1; clip-path: inset(70% 0 8% 0); translate: 0.04em 0; }
  33%  { opacity: 1; clip-path: inset(8% 0 72% 0); translate: -0.05em 0; }
  66%  { opacity: 1; clip-path: inset(45% 0 30% 0); translate: 0.03em 0; }
  100% { opacity: 0; }
}
```

**Tune:** duration 200-350 ms, offsets 0.02-0.06em, 3-4 slices. `steps(1)` makes the slices jump (real glitch) instead of sliding.  
**A11y/perf:** `content: attr() / ""` (alt-text syntax, Chrome 77+, Safari 17.4+, Firefox 128+) keeps screen readers from reading the text three times. Reduced motion: nothing.

### 20. Text along an SVG path
**Looks like:** a sentence rides a curve and slides along it on a loop or as you scroll (Codrops "text on a path" scroll demos).  
**Use when / avoid when:** editorial transitions between sections, playful brand moments, a curved "sticker" line. Keep the path gentle; tight curves crush letter spacing.  
**Stack:** SVG + GSAP (scroll) | SMIL (loop)

```tsx
"use client";
import { useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function PathText({ text }: { text: string }) {
  const root = useRef<SVGSVGElement>(null);
  const pathId = useId();
  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "textPath",
        { attr: { startOffset: "100%" } },
        { attr: { startOffset: "-60%" }, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
      );
    },
    { scope: root },
  );
  return (
    <svg ref={root} viewBox="0 0 1200 260" role="img" aria-label={text} className="w-full overflow-visible">
      <path id={pathId} d="M0,190 C300,40 600,300 900,120 S1150,60 1200,90" fill="none" />
      <text fontSize="64" fontWeight="600" letterSpacing="-1" fill="currentColor">
        <textPath href={`#${pathId}`} startOffset="0%">{text}</textPath>
      </text>
    </svg>
  );
}
```

SMIL loop without JS (pause it for reduced motion with `svg.pauseAnimations()`):

```html
<textPath href="#wave-path" startOffset="0%">
  Available for projects - 2026 - Available for projects - 2026 -
  <animate attributeName="startOffset" from="0%" to="-50%" dur="16s" repeatCount="indefinite" />
</textPath>
```

**Tune:** `font-size` is in viewBox units (64 in a 1200-wide viewBox = 5.3% of width); scrub 0.3-1; duplicate the phrase so a `-50%` loop is seamless. Use a unique `id` per instance (`useId()`) when rendering several.  
**A11y/perf:** SVG text is real text (selectable, indexable); `role="img"` + `aria-label` gives one clean announcement. Characters past the path end are not rendered, so make the path longer than the visible area.

### 21. Circular rotating text badge
**Looks like:** a ring of text ("AVAILABLE FOR WORK - 2026 -") slowly rotating around an icon or arrow.  
**Use when / avoid when:** a small sticker-like accent with real information (status, CTA). The "SCROLL DOWN - SCROLL DOWN" spinner was a 2020-2023 agency cliche; never more than one per page.  
**Stack:** SVG + CSS

```tsx
import { useId } from "react";

export function CircleBadge({ text = "Available for work - 2026 - " }: { text?: string }) {
  const id = useId();
  const r = 75;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="circle-badge" role="img" aria-label={text.replace(/ - /g, ", ")}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <path id={id} d={`M 100,100 m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} fill="none" />
        <text fontSize="15" letterSpacing="2" fill="currentColor" style={{ textTransform: "uppercase" }}>
          <textPath href={`#${id}`} textLength={circumference.toFixed(1)} lengthAdjust="spacing">{text}</textPath>
        </text>
      </svg>
      <span className="circle-badge__icon" aria-hidden="true">&#8599;</span>
    </div>
  );
}
```

```css
.circle-badge { position: relative; inline-size: 9rem; aspect-ratio: 1; display: grid; place-items: center; }
.circle-badge svg { position: absolute; inset: 0; }
.circle-badge__icon { font-size: 1.75rem; }
@media (prefers-reduced-motion: no-preference) {
  .circle-badge svg { animation: badge-spin 18s linear infinite; }
  @media (hover: hover) { .circle-badge:hover svg { animation-duration: 6s; } }
}
@keyframes badge-spin { to { rotate: 1turn; } }
```

**Tune:** `textLength` = circumference makes the phrase close the ring exactly; period 12-24 s; font 13-16 in a 200 viewBox, uppercase with 1-3 units tracking. Changing `animation-duration` on hover jumps the angle in some engines; if that bothers you, animate `--speed` with WAAPI `playbackRate` instead.  
**A11y/perf:** compositor-only rotation. Reduced motion: static ring.

### 22. CSS-only infinite marquee
**Looks like:** a band of words or logos scrolls sideways forever with no seam; faded at the edges.  
**Use when / avoid when:** logo walls, big editorial ticker between sections, award lists. Slow and large feels editorial; fast and small feels like a 2012 news ticker. Never use for information users must read in full.  
**Stack:** CSS (+ React for duplication)

```tsx
import type { CSSProperties, ReactNode } from "react";

export function Marquee({ children, seconds = 40, reverse = false, label }: { children: ReactNode; seconds?: number; reverse?: boolean; label: string }) {
  return (
    <section className="marquee" aria-label={label} style={{ "--duration": `${seconds}s`, "--dir": reverse ? "reverse" : "normal" } as CSSProperties}>
      <div className="marquee__track">
        <ul className="marquee__group">{children}</ul>
        <ul className="marquee__group" aria-hidden="true">{children}</ul>
      </div>
    </section>
  );
}
```

```css
.marquee {
  --gap: clamp(2rem, 5vw, 5rem);
  overflow: clip;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.marquee__track { display: flex; inline-size: max-content; }
.marquee__group {
  display: flex; align-items: center; gap: var(--gap);
  padding-inline-end: var(--gap);        /* makes -50% land exactly on the seam */
  margin: 0; list-style: none;
}
@media (prefers-reduced-motion: no-preference) {
  .marquee__track { animation: marquee var(--duration) linear infinite var(--dir); }
  @media (hover: hover) { .marquee:hover .marquee__track { animation-play-state: paused; } }
  .marquee:focus-within .marquee__track { animation-play-state: paused; }
}
@keyframes marquee { to { translate: -50% 0; } }
@media (prefers-reduced-motion: reduce) {
  .marquee { overflow-x: auto; mask-image: none; }
  .marquee__group[aria-hidden] { display: none; }
}
```

**Tune:** speed by content width, not time: ~60-100 px/s for text bands, 30-60 px/s for logos; so set `--duration` = group width / speed (measure once, or pick 30-60 s). Edge fade 6-12%. Alternate outline/solid words (recipe 15) for editorial bands.  
**A11y/perf:** duplicate group is `aria-hidden`; links inside the duplicate should get `tabIndex={-1}`. WCAG 2.2.2: motion running more than 5 s alongside other content needs a way to pause; hover/focus pause covers pointer and keyboard users, a visible pause button covers everyone. If content is shorter than the viewport, repeat items inside each group until one group is wider than the screen.

### 23. Velocity-reactive marquee
**Looks like:** a text band drifts slowly, speeds up and reverses direction with the user's scroll velocity (Framer Motion's classic "scroll velocity" example, Studio Freight-era sites; React Bits `ScrollVelocity`).  
**Use when / avoid when:** one kinetic band on a scroll-heavy page; pairs well with Lenis. Two stacked bands in opposite directions is the maximum.  
**Stack:** Motion 13

```tsx
"use client";
import { useRef, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { wrap } from "motion";

type Props = { children: ReactNode; baseVelocity?: number };

export function VelocityMarquee({ children, baseVelocity = -2 }: Props) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const skewX = useTransform(smoothVelocity, [-2000, 0, 2000], [8, 0, -8]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    moveBy += direction.current * moveBy * vf;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-clip whitespace-nowrap" aria-hidden={reduce ? undefined : true}>
      <motion.div className="flex w-max" style={{ x, skewX: reduce ? 0 : skewX }}>
        <span className="pr-[0.5em]">{children}</span>
        <span className="pr-[0.5em]" aria-hidden="true">{children}</span>
      </motion.div>
    </div>
  );
}
```

GSAP flavour: build the loop tween once, then `ScrollTrigger.create({ onUpdate: (self) => gsap.to(loop, { timeScale: gsap.utils.clamp(-4, 4, self.getVelocity() / 300) || 1, duration: 0.4, overwrite: true }) })` and ease `timeScale` back to 1 on `ScrollTrigger` "scrollEnd".  
**Tune:** `baseVelocity` 1-4 %/s; velocity map `[0,1000] -> [0,5]`; spring damping 40-60 / stiffness 300-500; skew max 5-10deg (more looks broken). Each copy must be wider than the viewport.  
**A11y/perf:** transform-only, one motion value; the band is decorative so hide it from AT and repeat the words in real text nearby if they matter. Reduced motion: static band.

### 24. Number animation
**Looks like:** digits roll like an odometer to a new value (NumberFlow), or count up from 0 when a stat enters view.  
**Use when / avoid when:** pricing toggles, live counters, dashboards, 2-4 hero stats. Counting up every number on the page ("10,000+ users!") on scroll is tired; prefer rolling on value change, where the motion carries meaning.  
**Stack:** @number-flow/react 0.6 | CSS `@property` | GSAP

NumberFlow (odometer, respects reduced motion by default, uses `Intl.NumberFormat`):

```tsx
"use client";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { useInView } from "motion/react";
import { useRef } from "react";

export function PlanPrice({ yearly }: { yearly: boolean }) {
  return (
    <NumberFlowGroup>
      <NumberFlow
        value={yearly ? 190 : 19}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        suffix={yearly ? "/yr" : "/mo"}
        className="tabular-nums"
        spinTiming={{ duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </NumberFlowGroup>
  );
}

export function StatOnView({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  return (
    <span ref={ref}>
      <NumberFlow value={inView ? to : 0} suffix={suffix} format={{ notation: "compact" }} className="tabular-nums" />
    </span>
  );
}
```

CSS only (integer interpolation through a registered property; Chrome 85+, Safari 16.4+, Firefox 128+):

```css
@property --num { syntax: "<integer>"; initial-value: 0; inherits: false; }
.count {
  font-variant-numeric: tabular-nums;
  counter-reset: num var(--num);
  transition: --num 1.6s var(--ease-out-expo);
}
.count::after { content: counter(num); }
.count.is-in { --num: var(--to); }           /* toggle .is-in with an IntersectionObserver */
@media (prefers-reduced-motion: reduce) { .count { transition: none; } }
```

```html
<p><span class="count" style="--to: 2481" aria-hidden="true"></span><span class="sr-only">2,481</span> projects shipped</p>
```

GSAP (formatted, any easing):

```ts
export function countTo(el: HTMLElement, to: number, locale = "en-US") {
  const fmt = new Intl.NumberFormat(locale);
  const state = { v: 0 };
  return gsap.to(state, {
    v: to, duration: 1.6, ease: "power3.out", snap: { v: 1 },
    onUpdate: () => { el.textContent = fmt.format(state.v); },
  });
}
```

**Tune:** 1.2-2 s ease-out for count-ups (linear looks mechanical, ends too abruptly); NumberFlow spin 500-900 ms. Always `tabular-nums` so width does not jitter (see `typography.md#numerals`).  
**A11y/perf:** CSS counters cannot format thousands separators and pseudo-content is inconsistently announced: pair with sr-only real value. NumberFlow renders accessible text and honours `prefers-reduced-motion` (`respectMotionPreference`, default true).

### 25. Highlighter / underline draw
**Looks like:** an underline sweeps in from the left on hover and exits to the right; a marker highlight paints behind a phrase line by line; a hand-drawn scribble draws under a key word.  
**Use when / avoid when:** emphasis inside editorial copy, link hovers, one key phrase in a hero. One scribble per page; hand-drawn marks everywhere look like a template.  
**Stack:** CSS (`background-size`) | SVG stroke-dash

```css
/* Link underline: in from left, out to right. Works across wrapped lines in reading order. */
.u-sweep {
  text-decoration: none;
  background: linear-gradient(currentColor, currentColor) no-repeat 100% 100% / 0% 0.08em;
  transition: background-size var(--dur-base) var(--ease-out-expo);
  padding-block-end: 0.06em;
}
@media (hover: hover) { .u-sweep:hover { background-size: 100% 0.08em; background-position-x: 0%; } }
.u-sweep:focus-visible { background-size: 100% 0.08em; background-position-x: 0%; }

/* Marker highlight, painted on view (toggle .is-in via IntersectionObserver) */
.marker {
  background: linear-gradient(transparent 58%, var(--highlight, oklch(0.92 0.16 100)) 58% 92%, transparent 92%) no-repeat 0 0 / 0% 100%;
  transition: background-size 1.1s var(--ease-out-quart) 150ms;
}
.marker.is-in { background-size: 100% 100%; }
@media (prefers-reduced-motion: reduce) { .marker { transition: none; } }
```

SVG scribble under a word:

```html
<span class="scribble">remarkable<svg viewBox="0 0 300 18" aria-hidden="true" focusable="false"><path d="M3 12 C 60 3, 110 16, 160 8 S 250 4, 297 11" pathLength="1" /></svg></span>
```

```css
.scribble { position: relative; white-space: nowrap; }
.scribble svg { position: absolute; inset-inline: -2%; inset-block-end: -0.35em; inline-size: 104%; block-size: auto; overflow: visible; }
.scribble path {
  fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round;
  stroke-dasharray: 1; stroke-dashoffset: 1;
}
.scribble.is-in path { stroke-dashoffset: 0; transition: stroke-dashoffset 900ms var(--ease-out-quart) 250ms; }
@media (prefers-reduced-motion: reduce) { .scribble path { stroke-dashoffset: 0; transition: none; } }
```

**Tune:** underline thickness 0.06-0.1em; marker band from ~55% to ~92% of line height (sits on the x-height like a real highlighter); scribble 700-1100 ms, starting after the heading reveal. For true hand-drawn randomness use `rough-notation` (what Magic UI `Highlighter` wraps).  
**A11y/perf:** `background-size` transitions repaint only the inline box; fine. `pathLength="1"` normalises dash math for any path.

### 26. Text as a window: video / image inside type
**Looks like:** giant letters act as windows onto a video or photo; outside the letters is flat page color (Apple product-launch pages of the 2010s, Magic UI `VideoText`).  
**Use when / avoid when:** one hero or section opener with footage that reads at letter scale (texture, motion, color), heavy/condensed display weight. Thin type = the effect disappears.  
**Stack:** CSS (`background-clip: text` for images, `mix-blend-mode` for video)

```css
/* Image inside text */
.img-type {
  background: url("/images/texture.avif") center / cover;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  font-weight: 900; font-size: clamp(4rem, 18vw, 16rem); line-height: 0.85;
}

/* Video inside text: white plate with black text, screened over the video.
   screen(white, video) = white, screen(black, video) = video. Dark page: black plate + white text + multiply. */
.video-type { position: relative; display: grid; isolation: isolate; overflow: clip; }
.video-type > * { grid-area: 1 / 1; }
.video-type video { inline-size: 100%; block-size: 100%; object-fit: cover; }
.video-type__plate {
  margin: 0; display: grid; place-items: center;
  background: #fff; color: #000; mix-blend-mode: screen;
  font-size: clamp(4rem, 20vw, 18rem); font-weight: 900; line-height: 0.8; letter-spacing: -0.04em;
}
.video-type--dark .video-type__plate { background: #000; color: #fff; mix-blend-mode: multiply; }
```

```html
<section class="video-type">
  <video autoplay muted loop playsinline poster="/video/reel-poster.jpg" aria-hidden="true">
    <source src="/video/reel.mp4" type="video/mp4" />
  </video>
  <h2 class="video-type__plate">MOTION</h2>
</section>
<script>
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll(".video-type video").forEach((v) => v.pause());
</script>
```

**Tune:** plate color must equal the page background exactly; weight 800-900, tracking -0.03 to -0.05em so counters are big enough to see footage.  
**A11y/perf:** avoid SVG `mask-image` data-URLs with `<text>`: SVG-as-image cannot use page web fonts, so the mask silently falls back to a system font. The heading stays real text. Reduced motion: paused video (poster frame).

### 27. Kinetic headline intro sequence
**Looks like:** the hero assembles itself in ~1.6 s: eyebrow fades in, headline lines rise from masks, one italic serif word scales in, subtext and CTA follow, hero image unclips.  
**Use when / avoid when:** the landing hero, once per session (after the preloader if any, see `page-transitions.md`). Keep total under ~1.8 s; anything longer delays LCP perception and annoys repeat visitors.  
**Stack:** GSAP timeline + SplitText

```tsx
"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // autoSplit + returning the whole timeline from onSplit: correct lines after the font
        // loads, and a resize mid-intro re-splits without restarting the sequence.
        SplitText.create(q(".hero-title"), {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
            return gsap
              .timeline({ defaults: { ease: "expo.out", duration: 1.1 } })
              .from(q(".hero-eyebrow"), { y: 12, autoAlpha: 0, duration: 0.6 })
              .from(self.lines, { yPercent: 110, stagger: 0.08 }, "-=0.3")
              .from(q(".hero-accent"), { scale: 0.6, autoAlpha: 0, rotate: -6, transformOrigin: "50% 80%" }, "<0.25")
              .from(q(".hero-sub, .hero-cta"), { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, "<0.2")
              .fromTo(
                q(".hero-media"),
                { clipPath: "inset(18% 12% 18% 12% round 24px)", scale: 1.08 },
                { clipPath: "inset(0% 0% 0% 0% round 0px)", scale: 1, duration: 1.4, ease: "power4.out" },
                "<",
              );
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="hero">
      <p className="hero-eyebrow eyebrow" data-reveal>Independent studio - Casablanca</p>
      <h1 className="hero-title" data-reveal>
        We build interfaces <em className="hero-accent inline-block">that</em> feel alive
      </h1>
      <p className="hero-sub" data-reveal>Design engineering for AI products and ambitious brands.</p>
      <a className="hero-cta" href="#work" data-reveal>See the work</a>
      <div className="hero-media" data-reveal />
    </section>
  );
}
```

**Tune:** overlaps (`"-=0.3"`, `"<0.2"`) make it feel choreographed rather than sequential; total 1.4-1.8 s; one hero accent move only. Splitting a line that contains an inline-block `<em>` works because `deepSlice` (default true) handles nested elements across lines.  
**A11y/perf:** the H1 is the LCP element: it must be in the HTML (server-rendered) and visible within ~2.5 s; `data-reveal` hides it only until JS runs, so keep the bundle small or drop `data-reveal` on the H1 and animate from `opacity: 0.001`. Reduced motion: everything visible immediately. `clip-path` animation on one image is fine.

### 28. Long shadow / 3D extrude
**Looks like:** letters extruded into a solid block toward the bottom-right, like a retro sign or risograph poster; on hover the type "presses in".  
**Use when / avoid when:** poster, retro, brutalist, playful food/music brands, big buttons in neo-brutalist UIs. Wrong register for SaaS, finance, luxury.  
**Stack:** CSS (+ tiny generator)

```ts
// Build once (server or client) and inline as a CSS variable.
export function extrude(depth = 10, color = "#141414", stepEm = 0.012): string {
  return Array.from({ length: depth }, (_, i) => {
    const d = ((i + 1) * stepEm).toFixed(3);
    return `${d}em ${d}em 0 ${color}`;
  }).join(", ");
}
// <h1 className="extrude" style={{ "--extrude": extrude() } as React.CSSProperties}>Hot sauce</h1>
```

```css
.extrude {
  color: var(--paper, #fff3d6);
  text-shadow: var(--extrude);
  transition: translate var(--dur-fast) ease-out, text-shadow var(--dur-fast) ease-out;
}
@media (hover: hover) {
  .extrude:hover { translate: 0.06em 0.06em; text-shadow: 0.03em 0.03em 0 #141414, 0.06em 0.06em 0 #141414; }
}
.long-shadow-soft { text-shadow: 0.02em 0.02em 0 #0002, 0.04em 0.04em 0 #0002, 0.06em 0.06em 0 #0002, 0.08em 0.08em 0 #0001; }
```

**Tune:** depth 6-14 layers, step 0.008-0.015em (em-based so it scales with fluid type); 45deg is classic, 30deg (`dx > dy`) feels more dynamic.  
**A11y/perf:** text-shadow with many layers repaints on change: fine for a headline, avoid animating it continuously. Forced colors mode drops text-shadow, which is the correct fallback.

### 29. Blur-to-focus on scroll
**Looks like:** a statement headline is blurred and faint when it enters, and sharpens into focus as it reaches the middle of the screen (Apple product pages).  
**Use when / avoid when:** one or two short statements (under ~12 words) on a narrative page. Scroll-scrubbed blur over big areas or many elements is the fastest way to drop frames on mobile; opacity + slight y is the safe default.  
**Stack:** CSS scroll-driven

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .focus-in {
      animation: focus-in linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 45%;
    }
  }
}
@keyframes focus-in {
  from { filter: blur(8px); opacity: 0.15; translate: 0 1.5rem; }
  to   { filter: blur(0); opacity: 1; translate: 0 0; }
}
@media (max-width: 640px) {
  @keyframes focus-in { from { opacity: 0.15; translate: 0 1rem; } to { opacity: 1; translate: 0 0; } }
}
```

**Tune:** blur 4-10 px; range should end by `cover 40-50%` so the text is sharp while being read.  
**A11y/perf:** the mobile override drops filter entirely (small screens, weaker GPUs). Firefox (no scroll timelines) and reduced motion see sharp static text.

### 30. Reading-order scroll fill
**Looks like:** a paragraph starts dim and fills with ink word by word, line by line, as you scroll (Apple AirPods/Vision Pro pages, React Bits `ScrollReveal`, countless Awwwards manifestos).  
**Use when / avoid when:** one manifesto paragraph of 20-60 words. Overused in 2024-26 portfolios; on long text it slows reading. The GSAP scrubbed per-word version (with pinning) lives in `scroll-gsap.md`; this is the zero-JS version.  
**Stack:** CSS scroll-driven (Chromium 115+, Safari 26+)

```html
<p class="read-fill"><span>We believe interfaces should feel inevitable: every motion earns its place, every word carries weight, and nothing moves without a reason.</span></p>
```

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .read-fill { view-timeline: --read block; }
    .read-fill > span {
      --dim: color-mix(in oklab, var(--fg) 20%, transparent);
      /* Inline box + default box-decoration-break: slice => the gradient runs across the
         unwrapped line, so the hard edge sweeps through the text in reading order. */
      background: linear-gradient(90deg, var(--fg) 50%, var(--dim) 50%) 100% 0 / 200% 100% no-repeat;
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; color: transparent;
      animation: read-fill linear both;
      animation-timeline: --read;
      animation-range: cover 20% cover 60%;
    }
  }
}
@keyframes read-fill { to { background-position: 0% 0; } }
```

Per-word opacity variant (split with `Split`; `var(--i)` can become `sibling-index()` once your audience is on Baseline 2026):

```css
@supports (animation-timeline: view()) {
  .word-fill { view-timeline: --wf block; }
  .word-fill [aria-hidden] .w {
    opacity: 0.2;
    animation: word-on linear both;
    animation-timeline: --wf;
    animation-range: cover calc(15% + var(--i) * 1%) cover calc(20% + var(--i) * 1%);
  }
}
@keyframes word-on { to { opacity: 1; } }
```

**Tune:** range 20%-60% of `cover` (finished before the paragraph leaves centre); for per-word, 1% per word works up to ~40 words, then use `calc(var(--i) / var(--n) * 40%)`. A soft edge: replace the 50%/50% hard stop with `45%` / `55%`.  
**A11y/perf:** the fallback (no `@supports`) is plain full-ink text, so Firefox and reduced-motion users read normally. `background-position` repaint of one paragraph is cheap. Contrast of the dim state does not matter as long as the filled state is reachable by scrolling, but never leave text permanently dim.

### 31. Cursor spotlight on text
**Looks like:** a dim paragraph or giant headline where a soft circle of full-ink text follows the pointer, like a flashlight.  
**Use when / avoid when:** dark heroes, manifesto blocks, "hidden message" moments. Decorative display text only: the dim base fails contrast for anyone not using a mouse. Card spotlights (Linear-style borders) are in `interactions.md`.  
**Stack:** CSS mask + a few lines of JS

```tsx
"use client";
import { useEffect, useRef } from "react";

export function SpotlightText({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let rect = el.getBoundingClientRect();
    const onEnter = () => { rect = el.getBoundingClientRect(); };
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    };
    const onLeave = () => { el.style.setProperty("--mx", "-999px"); el.style.setProperty("--my", "-999px"); };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return (
    <div ref={ref} className="spot">
      <p className="spot__base">{text}</p>
      <p className="spot__lit" aria-hidden="true">{text}</p>
    </div>
  );
}
```

```css
.spot { position: relative; --mx: -999px; --my: -999px; --r: 220px; }
.spot p { margin: 0; }
.spot__base { color: color-mix(in oklab, var(--fg) 30%, transparent); }
.spot__lit {
  position: absolute; inset: 0;
  color: var(--fg);
  mask-image: radial-gradient(circle var(--r) at var(--mx) var(--my), #000 25%, transparent 100%);
  pointer-events: none;
}
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .spot__base { color: var(--fg); }
  .spot__lit { display: none; }
}
```

**Tune:** radius 150-300 px, solid core 20-35% of the radius; base ink 25-40%. Rect is cached on `pointerenter`; if the page scrolls while hovering, also refresh it on `scroll`.  
**A11y/perf:** unprefixed `mask-image` is baseline (Chrome 120+, Safari 15.4+, Firefox 53+). One custom-property write per frame; the mask repaints only this block. Touch and reduced motion: full-ink text, no spotlight.

## Gotchas
- **SplitText crashes SSR when registered at module scope**: its `register()` reads `window.innerWidth`. Guard `gsap.registerPlugin` with `typeof window !== "undefined"` (see Shared setup) or register inside `useGSAP`.
- **Lines split before the web font loads** break at the wrong places: use `autoSplit: true` with the animation returned from `onSplit` (re-splits on `document.fonts` `loadingdone`, keeps the tween's progress), or split inside `document.fonts.ready.then()`. `autoSplit` does nothing unless `type` includes `"lines"`.
- **Flash of unsplit text** before hydration: hide with `[data-reveal] { visibility: hidden }`, reveal with `gsap.set(el, { autoAlpha: 1 })` right before the tween, and keep `@media (scripting: none)` visible. Never hide the LCP headline for longer than the JS takes to run.
- **Screen readers read nothing** when every piece is `aria-hidden` and the label sits on a `<p>`/`<div>`/`<span>` (ARIA prohibits naming generic/paragraph roles). Use headings/links as split targets, or `aria: "none"` + an sr-only copy.
- **`text-wrap: balance` on a SplitText target** fights line detection (GSAP docs). Balance the static version only, or insert manual `<br>` for display lines.
- **Char-splitting breaks shaping**: ligatures (fi, ffl), kerning pairs, connected scripts (Arabic, Devanagari, script fonts) and emoji ZWJ sequences. Split Arabic/Indic by words only; use `Intl.Segmenter` (SplitText already does) instead of `split("")`; set `font-kerning: none` to make kerning loss consistent.
- **`animation` shorthand after `animation-timeline`** resets the timeline to `auto`: always declare `animation-timeline` after the shorthand. Wrap scroll-driven CSS in `@supports (animation-timeline: view())` because Firefox (2026-09) has no scroll timelines.
- **`currentColor` inside `background-clip: text` gradients** resolves to `transparent` because you set `color: transparent`. Use explicit custom properties (`--ink`, `--fg`).
- **Descenders and accents clipped** by masks, `overflow: clip` and `background-clip: text` at tight line-heights: add `padding-block: 0.08-0.12em` with an equal negative margin.
- **Scramble/typewriter width jitter** in proportional fonts: use a monospace face or fix `inline-size` to the final string. Generate random glyphs in effects only, never during render (hydration mismatch).
- **`font-variation-settings` overrides `font-weight`** for the axes it names, so `<strong>` inside stops getting bolder. Prefer `font-weight`/`font-stretch`, and scope `font-variation-settings` to the animated element.
- **Outlined variable fonts show seams** at overlapping contours: use static single-weight files for stroked text.
- **Marquee seam jumps** when the gap is not part of each group: put `padding-inline-end: var(--gap)` on the group and translate exactly `-50%`; each group must be wider than the viewport.
- **Pseudo-element copies are announced**: use `content: attr(data-text) / ""` (alt-text syntax) or a real `aria-hidden` span.
- **WCAG 2.2.2 (Pause, Stop, Hide)**: marquees, rotating words, looping typewriters and aurora loops that run over 5 s next to other content need a pause mechanism (hover + focus pause at minimum; a visible toggle for essential content). WCAG 2.3.1: no glitch flashing more than 3 times per second.
- **StrictMode double-mount** duplicates manual splits (`<div><div>` nesting) if you split in `useEffect` without reverting. `useGSAP` reverts SplitText created inside it; outside it, call `split.revert()` in cleanup.
- **Blur and gradient repaints on mobile**: scrubbed `filter: blur()` on large text or animated gradients on many cards drop frames on mid-range Android. One element per viewport, and drop filter under 640px.

## Sources
- https://gsap.com/docs/v3/Plugins/SplitText/ (config, mask, autoSplit/onSplit, aria, tips)
- https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/
- https://gsap.com/blog/3-13/ (SplitText rewrite, all plugins free)
- gsap@3.15.0 npm package source `src/SplitText.js` (mask = clone with `overflow: clip` + `-mask` class suffix; ResizeObserver 200 ms debounce; `loadingdone` listener only for lines; `window.innerWidth` in `register()`)
- https://motion.dev/docs/stagger, https://motion.dev/docs/wrap, https://motion.dev/docs/react-use-velocity
- https://number-flow.barvian.me/ (props, NumberFlowGroup, respectMotionPreference)
- https://github.com/DavidHDev/react-bits (src/tailwind/TextAnimations/TextPressure/TextPressure.jsx, VariableProximity, ScrollVelocity, DecryptedText)
- https://github.com/ibelick/motion-primitives (components/core/text-shimmer.tsx, text-roll.tsx)
- https://github.com/magicuidesign/magicui (apps/www/registry/magicui/aurora-text.tsx, marquee.tsx, line-shadow-text.tsx, dia-text-reveal.tsx, hyper-text.tsx, video-text.tsx, highlighter.tsx)
- https://kizu.dev/fit-to-width/ (Roman Komarov, CSS fit-to-width)
- https://css-tricks.com/fit-width-text-in-1-line-of-css/
- https://drafts.csswg.org/css-text-5/#text-fit-property
- https://github.com/explainers-by-googlers/css-fit-text
- blink-dev "Intent to Ship: CSS text-fit property" (May 2026, Chrome 150): http://www.mail-archive.com/blink-dev@chromium.org/msg16473.html
- https://chromestatus.com/feature/5104141688635392
- webstatus.dev API (`api.webstatus.dev/v1/features/<id>`): scroll-driven-animations, sibling-count, paint-order, registered-custom-properties, masks, text-box, intl-segmenter, text-wrap-balance, text-wrap-pretty
- https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
- https://fonts.google.com/metadata/fonts (variable axis ranges for Mona Sans, Roboto Flex, Google Sans Flex, Anybody, Science Gothic, Fraunces, Recursive, Bricolage Grotesque)
