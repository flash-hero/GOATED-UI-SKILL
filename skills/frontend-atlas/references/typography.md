# Typography
> Load when: choosing fonts or pairings, setting a type scale, fixing type that "looks generated", loading fonts in Next.js without CLS, or laying out editorial/display typography (giant headlines, drop caps, pull quotes, labels, numerals, mixed serif-italic headlines).
> Stack assumptions: Next 16 App Router + TS, `next/font` (google + local), Tailwind v4 CSS-first `@theme` optional; plain CSS given for everything. Animated type lives in `text-effects.md`.

## Contents
- [Decision guide](#decision-guide)
- Recipes
  1. [Fluid type scale (Utopia method)](#1-fluid-type-scale-utopia-method)
  2. [Line-height and tracking by size](#2-line-height-and-tracking-by-size)
  3. [Measure, wrapping, hyphenation, hanging punctuation](#3-measure-wrapping-hyphenation-hanging-punctuation)
  4. [Trimming the box: `text-box` and optical alignment](#4-trimming-the-box-text-box-and-optical-alignment)
  5. [OpenType features: `font-variant-*` vs `font-feature-settings`](#5-opentype-features)
  6. [Numerals in UI](#6-numerals-in-ui)
  7. [Labels, eyebrows and small caps done right](#7-labels-eyebrows-and-small-caps-done-right)
  8. [Optical size, grade and dark-mode type](#8-optical-size-grade-and-dark-mode-type)
  9. [Font pairing playbook (2026)](#9-font-pairing-playbook-2026)
  10. [Sources and licensing map](#10-sources-and-licensing-map)
  11. [Loading fonts: next/font, local files, zero-CLS fallbacks](#11-loading-fonts)
  12. [Tailwind v4 `@theme` type tokens](#12-tailwind-v4-theme-type-tokens)
  13. [Giant display headlines](#13-giant-display-headlines)
  14. [Serif italics inside grotesk headlines](#14-serif-italics-inside-grotesk-headlines)
  15. [Inline images and pills in headlines](#15-inline-images-and-pills-in-headlines)
  16. [Editorial layout: columns, drop caps, pull quotes, sidenotes](#16-editorial-layout)
  17. [Mono for metadata: the index/label row](#17-mono-for-metadata)
- [Anti-patterns and fixes](#anti-patterns-and-fixes)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide
| Brand feel | Type move | Scale ratio (mobile -> desktop) | Display tracking / leading | Recipe |
|---|---|---|---|---|
| Product / dev-tool (Linear, Vercel lane) | One neutral grotesk + mono, weight contrast 400/500 vs 600 | 1.2 -> 1.25 | -0.02 to -0.035em / 1.05-1.1 | [9](#9-font-pairing-playbook-2026), [17](#17-mono-for-metadata) |
| Editorial / studio / portfolio | High-contrast serif display + grotesk text, mono labels | 1.2 -> 1.333 | -0.02 to -0.04em / 0.95-1.05 | [9](#9-font-pairing-playbook-2026), [16](#16-editorial-layout) |
| Agency / bold brand | Heavy or wide grotesk at giant sizes, fitted wordmark | 1.25 -> 1.414+ | -0.04 to -0.06em / 0.82-0.92 | [13](#13-giant-display-headlines), `text-effects.md#14-fit-text-to-width-giant-wordmark-footer` |
| Luxury / fashion | Didone or light display serif, generous tracking on small caps labels | 1.2 -> 1.5 (few steps, big jumps) | -0.01 to -0.03em / 1.0 | [7](#7-labels-eyebrows-and-small-caps-done-right), [9](#9-font-pairing-playbook-2026) |
| Long-form reading (blog, docs) | Serif or humanist text face at 18-21px, 60-70ch measure | 1.2 -> 1.25 | 0 / 1.55-1.7 body | [3](#3-measure-wrapping-hyphenation-hanging-punctuation) |
| Data / dashboards | Grotesk with tabular figures, mono for IDs | 1.125 -> 1.2 | 0 / 1.3-1.45 | [6](#6-numerals-in-ui) |
| Playful / consumer | Rounded or quirky display (ROND/SOFT axes), bouncy weights | 1.25 -> 1.333 | -0.02em / 1.0 | [8](#8-optical-size-grade-and-dark-mode-type), [9](#9-font-pairing-playbook-2026) |

Premium type is mostly four decisions: (1) a display face with a point of view, (2) a real scale with big jumps at the top, (3) negative tracking that grows with size, (4) restraint: 2 families, 3-4 weights, one accent move.

## Recipes

### 1. Fluid type scale (Utopia method)
**Looks like:** every size grows smoothly from phone to desktop with no breakpoint jumps, and the ratio itself widens on large screens so headlines get dramatic while body text barely changes.  
**Use when / avoid when:** always, for marketing/editorial sites. For dense app UI, fixed rem sizes (12/13/14/16) are fine and easier to align to a grid.  
**Stack:** CSS `clamp()` (+ a generator)

Method (utopia.fyi): pick a min viewport + base size + ratio, and a max viewport + base size + ratio. Each step `n` has `min = minBase * minRatio^n` and `max = maxBase * maxRatio^n`, interpolated linearly across viewport width:

```
slope      = (maxSize - minSize) / (maxViewport - minViewport)
intercept  = minSize - slope * minViewport
font-size  = clamp(minSize, intercept + slope * 100vw, maxSize)     // intercept in rem, slope*100 in vw
```

Utopia's own default (360px/18px/1.2 -> 1240px/20px/1.25), verified output:

```css
:root {
  --step--2: clamp(0.7813rem, 0.7736rem + 0.0341vw, 0.8rem);
  --step--1: clamp(0.9375rem, 0.9119rem + 0.1136vw, 1rem);
  --step-0: clamp(1.125rem, 1.0739rem + 0.2273vw, 1.25rem);
  --step-1: clamp(1.35rem, 1.2631rem + 0.3864vw, 1.5625rem);
  --step-2: clamp(1.62rem, 1.4837rem + 0.6057vw, 1.9531rem);
  --step-3: clamp(1.944rem, 1.7405rem + 0.9044vw, 2.4414rem);
  --step-4: clamp(2.3328rem, 2.0387rem + 1.3072vw, 3.0518rem);
  --step-5: clamp(2.7994rem, 2.384rem + 1.8461vw, 3.8147rem);
}
```

Display-heavy scale for portfolios/agency sites (360px/16px/1.2 -> 1440px/19px/1.333, computed with the formula above; step 6-8 are the hero sizes):

```css
:root {
  --step--1: clamp(0.8333rem, 0.8142rem + 0.0852vw, 0.8908rem); /* 13.3 -> 14.3px  labels, captions */
  --step-0:  clamp(1rem, 0.9375rem + 0.2778vw, 1.1875rem);       /* 16 -> 19px      body */
  --step-1:  clamp(1.2rem, 1.0724rem + 0.5673vw, 1.5829rem);     /* 19.2 -> 25.3px  lede, h5 */
  --step-2:  clamp(1.44rem, 1.2166rem + 0.9927vw, 2.1101rem);    /* 23 -> 33.8px    h4 */
  --step-3:  clamp(1.728rem, 1.3664rem + 1.607vw, 2.8127rem);    /* 27.6 -> 45px    h3 */
  --step-4:  clamp(2.0736rem, 1.515rem + 2.4826vw, 3.7493rem);   /* 33.2 -> 60px    h2 */
  --step-5:  clamp(2.4883rem, 1.6518rem + 3.7178vw, 4.9979rem);  /* 39.8 -> 80px    h1 (product) */
  --step-6:  clamp(2.986rem, 1.7606rem + 5.4462vw, 6.6622rem);   /* 47.8 -> 106.6px h1 (editorial) */
  --step-7:  clamp(3.5832rem, 1.8174rem + 7.8481vw, 8.8806rem);  /* 57.3 -> 142.1px hero */
  --step-8:  clamp(4.2998rem, 1.7871rem + 11.1675vw, 11.8379rem);/* 68.8 -> 189.4px statement */
  --step-label: 0.75rem;                                          /* 12px floor: never go smaller */
}
```

Generator (drop in `scripts/fluid-type.mjs`, run `node scripts/fluid-type.mjs > src/styles/type-scale.css`):

```js
const cfg = { minVw: 360, maxVw: 1440, minBase: 16, maxBase: 19, minRatio: 1.2, maxRatio: 1.333, steps: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8] };
const rem = (px) => `${+(px / 16).toFixed(4)}rem`;

function step(n) {
  const min = cfg.minBase * cfg.minRatio ** n;
  const max = cfg.maxBase * cfg.maxRatio ** n;
  const slope = (max - min) / (cfg.maxVw - cfg.minVw);
  const intercept = min - slope * cfg.minVw;
  const name = n < 0 ? `--step--${-n}` : `--step-${n}`;
  return `  ${name}: clamp(${rem(Math.min(min, max))}, ${rem(intercept)} + ${+(slope * 100).toFixed(4)}vw, ${rem(Math.max(min, max))});`;
}

console.log(`:root {\n${cfg.steps.map(step).join("\n")}\n}`);
```

**Tune:** ratios: 1.125-1.2 for UI, 1.25 (major third) for product marketing, 1.333 (perfect fourth) for editorial, 1.414-1.5 for poster/agency. Widening the ratio at max viewport (1.2 -> 1.333) is the move that makes desktop heroes feel designed while keeping mobile sane. Base 16-17px mobile, 18-20px desktop for reading sites.  
**A11y/perf:** keep the `rem` term in the preferred value so user font-size settings still scale the text; WCAG 1.4.4 (200% zoom) holds when the max size is no more than ~2.5x the min size for a step (Utopia's guidance); step-8 above is 2.75x, so reserve it for decorative statements or cap it. Never go below 12px for any readable text.

### 2. Line-height and tracking by size
**Looks like:** big type set tight and dense like a poster; small labels open and airy; body relaxed.  
**Use when / avoid when:** every project. The single most common tell of generated type is one line-height and zero tracking at every size.  
**Stack:** CSS tokens

| Role | Size | line-height | letter-spacing | Weight (typical) |
|---|---|---|---|---|
| Label / eyebrow (uppercase) | 11-13px | 1.2-1.3 | +0.06 to +0.12em | 500-600 |
| Caption / meta | 12-14px | 1.4-1.5 | 0 to +0.01em | 400-500 |
| Body | 16-20px | 1.5-1.7 | 0 (Inter-like: -0.005em at 16px+) | 400 |
| Lede / intro | 20-26px | 1.35-1.45 | -0.005 to -0.01em | 400 |
| h3-h4 | 24-45px | 1.15-1.25 | -0.01 to -0.02em | 500-600 |
| h1-h2 | 40-106px | 1.0-1.1 | -0.02 to -0.035em | 500-700 |
| Hero / statement | 100-200px | 0.85-0.95 | -0.035 to -0.06em | 500-800 |
| All-caps display, condensed | any large | 0.8-0.9 | -0.01 to +0.02em | 700-900 |

```css
:root {
  --leading-tight: 0.92;
  --leading-heading: 1.08;
  --leading-snug: 1.3;
  --leading-body: 1.6;
  --tracking-hero: -0.045em;
  --tracking-heading: -0.025em;
  --tracking-snug: -0.01em;
  --tracking-label: 0.08em;
}

/* One rule that auto-tightens leading as size grows: 16px -> 1.5, 64px -> 1.125, 128px -> 1.06 */
h1, h2, h3, .display { line-height: calc(1em + 0.5rem); }

/* Light text on dark reads bolder and tighter: open it slightly */
.on-dark { --leading-body: 1.68; letter-spacing: 0.005em; }
```

**Tune:** the heavier and larger the face, the more negative tracking it wants; geometric faces (wide O) need less than grotesks; serif display at 100px+ often wants only -0.01 to -0.02em. Always re-check tracking after swapping fonts; values are per-typeface, not universal.  
**A11y/perf:** WCAG 1.4.12 requires layouts to survive user overrides (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em): avoid fixed heights on text containers.

### 3. Measure, wrapping, hyphenation, hanging punctuation
**Looks like:** paragraphs of comfortable width with no single-word last lines; headlines with evenly balanced lines; quotes whose opening mark hangs outside the text edge.  
**Use when / avoid when:** always for text blocks. `balance` for headings only, `pretty` for paragraphs.  
**Stack:** CSS

```css
.prose { max-inline-size: 65ch; }                 /* 45-75 chars; ch = width of "0", ~65ch = ~75 avg chars */
.prose p { text-wrap: pretty; hyphens: auto; }    /* needs <html lang="en"> for hyphenation dictionaries */
h1, h2, h3, .lede { text-wrap: balance; }

/* Hanging punctuation: Safari only; negative indent fallback elsewhere */
blockquote p { hanging-punctuation: first last; }
@supports not (hanging-punctuation: first) {
  blockquote p:first-child { text-indent: -0.42em; }   /* width of the opening quote in most faces */
}

/* Justified text only with hyphenation, never in narrow columns */
.justified { text-align: justify; hyphens: auto; hyphenate-limit-chars: 7 3 3; }
```

Support (webstatus.dev, 2026-09): `text-wrap: balance` Chrome 114 / Firefox 121 / Safari 17.5 (Baseline 2024; Chromium balances only up to 6 lines, Firefox 10). `text-wrap: pretty` Chrome 117 / Safari 26, not Firefox (falls back to normal wrapping, safe as progressive enhancement). `hanging-punctuation`: Safari only. `hyphenate-limit-chars`: Chromium and Safari (prefixed in some versions).  
**Tune:** body 60-70ch for reading sites, 45-55ch for two-column layouts and ledes; headings `max-inline-size: 18-24ch` plus `balance` gives poster-like shapes.  
**A11y/perf:** `pretty` is slower on huge documents (MDN); fine for articles. Do not `balance` text you split with GSAP SplitText (`text-effects.md#gotchas`).

### 4. Trimming the box: `text-box` and optical alignment
**Looks like:** text in buttons and badges sits exactly centred; giant headlines align flush with images and grid lines instead of floating on invisible half-leading.  
**Use when / avoid when:** buttons, pills, cards with tight padding, display headlines aligned to images. Not needed on running text.  
**Stack:** CSS (`text-box`, Chrome 133+, Safari 18.2+; Firefox ignores it)

```css
.btn { padding: 0.9em 1.4em; text-box: trim-both cap alphabetic; }   /* equal visual padding above/below */
.display-flush { text-box: trim-both cap alphabetic; margin-block: 0; }

/* Optical left alignment of giant type: letters have side bearings, so a 180px "T" or "W"
   sits visibly right of a 0px grid line. Nudge by a fraction of an em. */
.display-flush { margin-inline-start: -0.05em; }

/* Pre-text-box fallback for icon+label alignment */
.btn-fallback { display: inline-flex; align-items: center; gap: 0.5em; line-height: 1; }
```

**Tune:** `cap alphabetic` for caps-heavy/Latin UI; `ex alphabetic` when you want x-height centering (lowercase labels). Optical nudge -0.02 to -0.08em, by eye per typeface.  
**A11y/perf:** zero cost. Firefox renders untrimmed (slightly taller), which is fine.

### 5. OpenType features
**Looks like:** the details that separate typeset from typed: real small caps, tabular figures in tables, slashed zero in codes, case-sensitive punctuation in caps labels, stylistic alternates that give a free font its own voice.  
**Use when / avoid when:** always check what a font offers (drop the file on wakamaifondue.com). Stylistic sets are the cheapest way to make a common font (Inter, Geist) look less default.  
**Stack:** CSS

| Want | Prefer (composable) | Low-level equivalent | Notes |
|---|---|---|---|
| Tabular figures | `font-variant-numeric: tabular-nums` | `"tnum"` | tables, prices, timers, counters |
| Proportional oldstyle | `font-variant-numeric: oldstyle-nums proportional-nums` | `"onum", "pnum"` | numerals inside serif body text |
| Lining figures | `font-variant-numeric: lining-nums` | `"lnum"` | headings, UI |
| Slashed zero | `font-variant-numeric: slashed-zero` | `"zero"` | codes, IDs, hashes |
| Fractions | `font-variant-numeric: diagonal-fractions` | `"frac"` | recipes, specs |
| Real small caps | `font-variant-caps: all-small-caps` | `"c2sc", "smcp"` | only if the font has them |
| Discretionary ligatures | `font-variant-ligatures: discretionary-ligatures` | `"dlig"` | display serif flourish |
| Kill ligatures (code, tracked caps) | `font-variant-ligatures: none` | `"liga" 0, "clig" 0` | letter-spaced text |
| Case-sensitive forms | (no high-level property) | `"case"` | raises hyphens, brackets, @ to cap height in uppercase |
| Stylistic set / character variant | `font-variant-alternates` + `@font-feature-values` | `"ss01"`, `"cv11"` | e.g. Inter `cv11` single-storey a, `ss01` open digits |

```css
body { font-variant-numeric: lining-nums; font-kerning: normal; }
.table, .price, time { font-variant-numeric: tabular-nums lining-nums; }
.code-id { font-variant-numeric: tabular-nums slashed-zero; }
.label { text-transform: uppercase; letter-spacing: var(--tracking-label); font-feature-settings: "case" 1; }

/* Stylistic sets: font-feature-settings is all-or-nothing per declaration (a later rule
   replaces the whole list), so set it once per element with every feature you need. */
.brand-inter { font-feature-settings: "cv11" 1, "ss01" 1, "ss03" 1; }
```

**Tune:** keep `font-feature-settings` on as few selectors as possible; `font-variant-*` longhands cascade and combine, feature settings do not.  
**A11y/perf:** features only work if the subset keeps them: when subsetting with `pyftsubset`, pass `--layout-features='*'` (recipe 11).

<a id="numerals"></a>

### 6. Numerals in UI
**Looks like:** prices and stats that do not wobble when they change, columns of numbers that align, counters whose width is stable.  
**Use when / avoid when:** any number that changes (timers, NumberFlow, counters) or sits in a column. Proportional figures are fine in running text.  
**Stack:** CSS

```css
.stat {
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "case" 1;           /* aligns +, -, % punctuation with lining figures */
  letter-spacing: -0.03em;
}
.stat__unit { font-size: 0.45em; vertical-align: 0.9em; margin-inline-start: 0.05em; letter-spacing: 0; }
.table td.num { text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
.timer { font-variant-numeric: tabular-nums; min-inline-size: 5ch; }  /* reserve width for 00:00 */
```

**Tune:** giant stats (step 6-8) with tight tracking and a small raised unit ("48" + "%") read premium; big "+" signs read cheap. Mono is a legitimate choice for IDs, hashes, timestamps, but not for prices.  
**A11y/perf:** write numbers in the DOM with `Intl.NumberFormat` for the user's locale; animated counters need an sr-only final value (`text-effects.md#24-number-animation`).

### 7. Labels, eyebrows and small caps done right
**Looks like:** tiny uppercase or small-caps labels above headings ("01 / SERVICES", "(Selected work)", "[ Case study ]") that organise the page like a magazine.  
**Use when / avoid when:** editorial and studio sites, section indexes, metadata. The "mono uppercase eyebrow over every section" is itself a saturated 2024-26 pattern; vary it (small caps serif, numbered index, or no eyebrow) and keep it meaningful (real numbering, real categories).  
**Stack:** CSS

```css
.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  font-feature-settings: "case" 1;
  color: var(--muted);
}
.eyebrow--index::before { content: counter(section, decimal-leading-zero) " / "; color: var(--fg); }
.section { counter-increment: section; }

/* Real small caps (serif editorial). Refuse fake ones: browsers otherwise synthesize by shrinking capitals. */
.smallcaps {
  font-variant-caps: all-small-caps;
  font-synthesis-small-caps: none;
  letter-spacing: 0.05em;
}

/* Status label with a dot */
.status { display: inline-flex; align-items: center; gap: 0.5em; font-size: var(--step--1); }
.status::before { content: ""; inline-size: 0.5em; block-size: 0.5em; border-radius: 50%; background: oklch(0.72 0.19 150); }
```

**Tune:** uppercase labels 11-13px, +0.06 to +0.12em tracking (more for lighter weights), weight one step heavier than body. Lowercase text never gets positive tracking.  
**A11y/perf:** `counter()` content is decorative and inconsistently announced; keep the real label text in the DOM. Muted label color still needs 4.5:1 at these sizes.

### 8. Optical size, grade and dark-mode type
**Looks like:** display serifs with razor-thin hairlines at 120px and sturdy, open letterforms at 14px from the same family; dark-mode text that does not bloom.  
**Use when / avoid when:** whenever the font has `opsz` (Fraunces 9-144, Newsreader 6-72, Literata 7-72, Source Serif 4 8-60, Bodoni Moda 6-96, Playfair 5-1200, Bricolage Grotesque 12-96, Inter 14-32, Roboto Flex / Google Sans Flex) or `GRAD` (Roboto Flex -200..150, Google Sans Flex 0-100).  
**Stack:** CSS

```css
/* Default is font-optical-sizing: auto (opsz follows font-size). Override only for effect: */
.hero-serif { font-variation-settings: "opsz" 144; }     /* force display cut at any size */
.caption-serif { font-variation-settings: "opsz" 9; }    /* sturdier small text */

/* Dark mode: same weight looks heavier on dark. Use grade (no reflow) or a lighter weight. */
@media (prefers-color-scheme: dark) {
  :root { --grade: -50; }
  body { font-variation-settings: "GRAD" var(--grade); }
}
/* Without GRAD: drop weight a notch for body text in dark mode */
.theme-dark body { font-weight: 380; }                    /* variable fonts accept any value */
```

**Tune:** off-white on off-black (for example `#EDEDED` on `#0B0B0C`) instead of pure #FFF/#000 for long text; +0.05 line-height and +0.005em tracking on dark.  
**A11y/perf:** `font-variation-settings` set on `body` is inherited but replaced wholesale by any descendant that sets its own list; set per-component values with registered custom properties (`text-effects.md#11-variable-font-axis-animation`).

### 9. Font pairing playbook (2026)
**Looks like:** a type system with a clear voice: one display face carrying character, one quiet text face, optionally a mono or italic accent.  
**Use when / avoid when:** start every greenfield project here, then run the saturation check below. When a brand already owns a font, keep it (identity beats freshness).  
**Stack:** fonts (exact family names as published)

Saturation evidence used below: Google Fonts popularity rank from the GF metadata API (2026-09; lower = more used), Fontshare view counts (API), the April 2026 Hacker News "slop fonts" thread (Space Grotesk, Instrument Serif, Geist, Syne, Fraunces), and the reflex-reject lists in the user's taste skills (Inter, DM Sans, Outfit, Plus Jakarta Sans, Instrument Sans/Serif, Newsreader, Playfair Display, Cormorant, IBM Plex, Space Mono/Grotesk). Important nuance: the "Inter replacements" that AI style guides push (Geist, Satoshi, Cabinet Grotesk, Outfit, Clash Display) are now the new monoculture of generated sites. Saturation = how strongly a font signals "template", not quality.

| # | Aesthetic / use | Display | Text / UI | Accent | Source, license | AI-saturation 2026 |
|---|---|---|---|---|---|---|
| 1 | Tech neutral (Vercel lane) | Geist 600 | Geist 400 | Geist Mono | Google Fonts + npm `geist`, OFL | HIGH (create-next-app default, GF #107) |
| 2 | Tech neutral, fresher | Host Grotesk 600 | Host Grotesk 400 | Fragment Mono | Google Fonts, OFL | LOW (GF #404 / #589) |
| 3 | Tech with a width axis | Mona Sans wdth 112-125, 700 | Mona Sans 400 | Martian Mono (wdth 75-112.5) | Google Fonts (GitHub), OFL | LOW (GF #434) |
| 4 | Free grotesk made by a top foundry | TikTok Sans (opsz, wdth 75-150) | TikTok Sans | Google Sans Code | Google Fonts, OFL (co-designed by Grilli Type) | LOW (brand association: TikTok) |
| 5 | Fintech / Stripe-adjacent (paid) | Soehne Breit (Klim "Söhne Breit") | Söhne | Söhne Mono | Klim Type Foundry, paid, test fonts available | MED (price keeps it rarer) |
| 6 | Swiss / international | Switzer 600 or ABC Diatype | Switzer 400 | JetBrains Mono / ABC Diatype Mono | Fontshare (free) / Dinamo (paid) | MED |
| 7 | Classic Awwwards editorial | PP Editorial New (Ultralight Italic for accents) | PP Neue Montreal | PP Neue Montreal Mono | Pangram Pangram, web license required | HIGH (2021-24 studio default) |
| 8 | Editorial, free and fresher | Gambetta or Zodiak | Switzer or Supreme | Fragment Mono | Fontshare ITF FFL (free commercial) | LOW-MED |
| 9 | Sharp high-contrast hero serif | Gloock | Schibsted Grotesk | Chivo Mono | Google Fonts, OFL | LOW (GF #535) |
| 10 | Newsroom modern | Source Serif 4 (opsz 60, 600) | Schibsted Grotesk | Reddit Mono | Google Fonts, OFL | LOW-MED |
| 11 | Literary long-read | Literata (opsz 72) | Literata (opsz auto) | Hanken Grotesk for UI | Google Fonts (TypeTogether), OFL | LOW |
| 12 | Warm contemporary | Young Serif | Onest | - | Google Fonts, OFL | LOW |
| 13 | Soft/wonky serif lane | Fraunces (SOFT 100, WONK 1) | any grotesk | - | Google Fonts, OFL | HIGH: swap for Bonny, Recia or Rowan (Fontshare) or Young Serif |
| 14 | Italic serif accent word lane | Instrument Serif Italic | Inter Tight / Geist | - | Google Fonts, OFL | VERY HIGH: swap for Gloock, Sentient / Erode / Boska italics (Fontshare), GT Alpina or Reckless Neue (paid) |
| 15 | Fashion / Didone | Bodoni Moda (opsz 96) | Host Grotesk 300-400 | real small caps | Google Fonts, OFL | LOW-MED |
| 16 | Editorial Didone, variable | Playfair (2023, opsz 5-1200, wdth) | Albert Sans | - | Google Fonts, OFL | LOW (old Playfair Display is HIGH) |
| 17 | Grotesk with character | Bricolage Grotesque (opsz 96, wdth 75) | Bricolage Grotesque 400 | - | Google Fonts, OFL | MED-HIGH (GF #51, rising) |
| 18 | Character grotesk, fresher | Special Gothic Expanded One | Special Gothic (wdth 75-125) | - | Google Fonts 2025, OFL | LOW |
| 19 | Wide "luxury tech" display | Zalando Sans Expanded or Science Gothic (wdth 50-200) | Zalando Sans | - | Google Fonts 2025, OFL | LOW (vs Clash Display / Unbounded / Syne: HIGH) |
| 20 | Condensed poster | Big Shoulders (opsz) or Tanker | Archivo | - | Google Fonts / Fontshare | LOW-MED (Bebas Neue, Anton: HIGH) |
| 21 | One family, whole system | Archivo Expanded (wdth 125, 800) | Archivo (wdth 100) | Archivo Condensed labels (wdth 62) | Google Fonts, OFL | MED |
| 22 | Friendly geometric SaaS | Funnel Display | Funnel Sans | - | Google Fonts 2024 (NORD ID), OFL | LOW (Outfit, Plus Jakarta, DM Sans: HIGH) |
| 23 | Humanist, warm product | Wix Madefor Display | Wix Madefor Text | - | Google Fonts (Dalton Maag), OFL | LOW (Manrope, Instrument Sans: MED-HIGH) |
| 24 | Raw / brutalist | Apfel Grotezk | Apfel Grotezk | Necto Mono | Collletttivo, OFL | LOW (Space Grotesk + Space Mono: HIGH) |
| 25 | Art-school experimental | Le Murmure or Basteleur | Karrik | - | Velvetyne, OFL | LOW |
| 26 | Developer, pixel accents | Geist Pixel or Departure Mono (accents only) | Host Grotesk | Commit Mono | Google Fonts 2026 / departuremono.com / commitmono.com, OFL | LOW |
| 27 | Variable playground | Google Sans Flex (wdth 25-151, wght 1-1000, ROND, GRAD, opsz) | same | - | Google Fonts 2025, OFL | MED (Google product association) |

Paid families worth knowing when a client can license (all offer trial or test fonts for layout work): Klim (Söhne, Founders Grotesk, National 2, Untitled Sans, Tiempos, Signifier, Domaine), Grilli Type (GT America, GT Walsheim, GT Standard, GT Flexa, GT Sectra, GT Super, GT Alpina), Commercial Type (Graphik, Atlas Grotesk, Druk, Canela, Publico, Lyon, Styrene), Displaay (Roobert, Saans, Matter, Reckless Neue, Tobias, Haffer), ABC Dinamo (Diatype, Favorit, Whyte, Monument Grotesk, Oracle, Arizona), Pangram Pangram (Neue Montreal, Editorial New, Mori, Neue Machina, Formula, Right Grotesk, Fragment, Migra, Hatton, Supply).

Zero-download stacks (modernfontstacks.com style) for UI chrome or perf-critical pages:

```css
:root {
  --stack-system: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --stack-transitional: Charter, "Bitstream Charter", "Sitka Text", Cambria, serif;
  --stack-mono: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace;
}
```

**Tune:** pair by contrast of structure (serif vs grotesk, wide vs condensed, geometric vs grotesque), not by similarity; match x-heights (or normalise with `font-size-adjust`, recipe 14). Max two families plus one mono. If the display face is loud (wide, condensed, pixel), the text face must be silent.  
**A11y/perf:** each family costs 20-120 KB per style; a variable file replaces 3+ statics. Check Latin Extended coverage for names and non-English content before committing (many Fontshare/Velvetyne fonts are Latin-only).

### 10. Sources and licensing map
**Looks like:** a legally shippable font choice with a known loading path.  
**Use when / avoid when:** before putting any non-Google font on a public site.  
**Stack:** reference

| Source | License (verified 2026-09) | Public website use | How to load |
|---|---|---|---|
| Google Fonts | SIL OFL / Apache | Free, commercial OK | `next/font/google` (self-hosts at build, no Google request at runtime) |
| Vercel Geist | SIL OFL | Free | `next/font/google` (`Geist`, `Geist_Mono`) or npm `geist` |
| Fontshare (Indian Type Foundry) | ITF Free Font License (some families OFL) | Free for personal and commercial use, self-hosting allowed; no reselling or redistributing the files | Download zip -> `next/font/local`; CSS API `https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap` for prototypes |
| Pangram Pangram | Free to try for personal use (portfolios, pitches, tests); commercial licenses from $40 | Their FAQ: "The Web license is needed for any website, microsite and subdomain where the font is embedded", priced by monthly pageviews | Buy web license -> `next/font/local` |
| Velvetyne | Libre / OFL | Free | Download -> `next/font/local` |
| Collletttivo | SIL OFL | Free (credit appreciated) | Download -> `next/font/local` |
| Displaay, Klim, Grilli Type, Dinamo, Commercial Type | Paid EULAs; trial/test fonts for evaluation only | Needs a web license (usually pageview tiers) | `next/font/local` |
| Future Fonts | Paid, discounted in-progress fonts, free updates | Web license per font | `next/font/local` |

**Tune:** keep the license PDF in the repo next to the font files (`/src/app/fonts/LICENSES/`).  
**A11y/perf:** self-host everything (privacy, one fewer connection, metric-matched fallbacks via `next/font`).

<a id="loading-fonts"></a>

### 11. Loading fonts
**Looks like:** the page renders immediately in a fallback that has the same metrics as the web font, so when the real font swaps in nothing moves (CLS about 0).  
**Use when / avoid when:** every project. In Next.js, never use `<link>` to Google Fonts or `@import` in CSS.  
**Stack:** `next/font` | manual `@font-face` + capsize

Next.js (verified against the Next 16.3 font API reference: `src`, `weight`, `style`, `subsets`, `axes`, `display`, `preload`, `fallback`, `adjustFontFallback`, `variable`, `declarations`):

```ts
// app/fonts.ts
import { Host_Grotesk, Young_Serif, Fragment_Mono, Mona_Sans } from "next/font/google";
import localFont from "next/font/local";

export const sans = Host_Grotesk({ subsets: ["latin"], variable: "--font-sans-src", display: "swap" });

export const serif = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-serif-src", display: "swap" });

export const mono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono-src",
  display: "swap",
  preload: false,                       // not above the fold: do not compete with LCP
});

// Variable font with an extra axis: only wght is included unless you ask
export const wide = Mona_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-wide-src" });

// Fontshare / Pangram / paid: files live next to this module (path is relative to this file)
export const display = localFont({
  src: [
    { path: "./fonts/Gambetta-Variable.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/Gambetta-VariableItalic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-display-src",
  display: "swap",
  adjustFontFallback: "Times New Roman", // serif fallback metrics; default for local is "Arial"
});
```

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { sans, serif, mono, wide, display } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} ${wide.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Facts that matter: `adjustFontFallback` is on by default (google: boolean, local: `"Arial" | "Times New Roman" | false`) and generates a size-adjusted fallback `@font-face`, which is what kills CLS. `preload` defaults to true and preloads only the `subsets` you list, on the routes whose layout/page calls the font function (root layout = every route). Static Google fonts need `weight`; variable ones do not.

Manual (Vite, Astro, plain HTML): compute fallback metrics with capsize, then preload the one critical file:

```js
// scripts/font-fallbacks.mjs -> paste output into your CSS
import { createFontStack } from "@capsizecss/core";
import { fromFile } from "@capsizecss/unpack/fs";
import arial from "@capsizecss/metrics/arial";

const gambetta = await fromFile("public/fonts/Gambetta-Variable.woff2");
const { fontFamily, fontFaces } = createFontStack([{ ...gambetta, familyName: "Gambetta" }, arial]);
console.log(fontFaces);
console.log(`:root { --font-display: ${fontFamily}; }`);
```

```css
@font-face {
  font-family: "Gambetta";
  src: url("/fonts/Gambetta-Variable.woff2") format("woff2");
  font-weight: 300 700;
  font-style: normal;
  font-display: swap;
}
/* + the generated fallback @font-face (size-adjust, ascent-override, descent-override, line-gap-override) */
```

```html
<link rel="preload" href="/fonts/Gambetta-Variable.woff2" as="font" type="font/woff2" crossorigin />
```

Subset self-hosted files (fonttools: `pip install fonttools brotli`), keeping OpenType features:

```bash
pyftsubset Gambetta-Variable.ttf --flavor=woff2 --layout-features='*' \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" \
  --output-file=Gambetta-Variable-latin.woff2
```

| `font-display` | Behaviour | Use for |
|---|---|---|
| `swap` | fallback immediately, swap when loaded | brand/display fonts, with metric-matched fallback (next/font default) |
| `optional` | ~100 ms block, then keep fallback for this page view if not loaded | body text on perf-critical pages; first uncached visit may never show the web font |
| `fallback` | short block, short swap window | compromise; rarely needed with metric fallbacks |
| `block` | invisible text up to 3 s | icon fonts only (and prefer SVG icons) |

**Tune:** budget: 2 families, at most 4 files above the fold, about 150 KB total woff2. Variable vs static: a variable file costs about 1.5-3 static weights, so use it at 3+ weights or whenever you animate axes.  
**A11y/perf:** preload only what renders above the fold (usually the display face and body regular); every extra preload delays LCP. `crossorigin` is required on font preloads even same-origin. Add `font-synthesis: none` in development to expose missing weights/styles instead of letting the browser fake bold/italic.

### 12. Tailwind v4 `@theme` type tokens
**Looks like:** `font-display text-hero tracking-label` utilities backed by the fluid scale and the next/font variables.  
**Use when / avoid when:** Tailwind v4 projects. Keep raw values in `@theme`, not scattered arbitrary values (`text-[5.3rem]`).  
**Stack:** Tailwind 4.3 CSS-first config

```css
@import "tailwindcss";

/* inline: these reference runtime variables set by next/font on <html> */
@theme inline {
  --font-sans: var(--font-sans-src), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-serif-src), ui-serif, Georgia, serif;
  --font-mono: var(--font-mono-src), ui-monospace, monospace;
  --font-display: var(--font-display-src), var(--font-serif-src), serif;
  --font-wide: var(--font-wide-src), var(--font-sans-src), sans-serif;
}

@theme {
  --text-label: 0.75rem;
  --text-label--line-height: 1.2;
  --text-label--letter-spacing: 0.08em;
  --text-label--font-weight: 500;

  --text-body: clamp(1rem, 0.9375rem + 0.2778vw, 1.1875rem);
  --text-body--line-height: 1.6;

  --text-lede: clamp(1.2rem, 1.0724rem + 0.5673vw, 1.5829rem);
  --text-lede--line-height: 1.4;
  --text-lede--letter-spacing: -0.01em;

  --text-h2: clamp(2.0736rem, 1.515rem + 2.4826vw, 3.7493rem);
  --text-h2--line-height: 1.08;
  --text-h2--letter-spacing: -0.025em;

  --text-h1: clamp(2.986rem, 1.7606rem + 5.4462vw, 6.6622rem);
  --text-h1--line-height: 1;
  --text-h1--letter-spacing: -0.035em;

  --text-hero: clamp(3.5832rem, 1.8174rem + 7.8481vw, 8.8806rem);
  --text-hero--line-height: 0.92;
  --text-hero--letter-spacing: -0.045em;
  --text-hero--font-weight: 500;

  --tracking-label: 0.08em;
  --leading-body: 1.6;
}
```

```tsx
<p className="font-mono text-label uppercase text-neutral-500">01 / Services</p>
<h1 className="font-display text-hero text-balance">Interfaces with a pulse</h1>
<p className="font-sans text-lede max-w-[55ch] text-pretty">We design and build ...</p>
```

**Tune:** `--text-*--line-height`, `--letter-spacing` and `--font-weight` sub-tokens ship with the size utility, so one class sets the whole role. Tailwind v4 has `text-balance` / `text-pretty` utilities.  
**A11y/perf:** name next/font variables `--font-*-src` (not `--font-sans`) or `@theme inline { --font-sans: var(--font-sans) }` becomes a self-reference that resolves to nothing.

### 13. Giant display headlines
**Looks like:** a 2-4 line headline at 100-190px that fills the first viewport like a poster: tight leading, negative tracking, deliberate line breaks, flush to the grid.  
**Use when / avoid when:** portfolio, agency, launch and editorial heroes. Product UIs and docs want step 4-5 headlines, not posters. Giant type needs few words (3-8); a 20-word giant headline is a paragraph shouting.  
**Stack:** CSS

```tsx
<h1 className="hero-title">
  Interfaces with <br className="max-md:hidden" />a pulse
</h1>
```

```css
.hero-title {
  font-family: var(--font-display);
  font-size: var(--step-7);
  font-weight: 500;
  line-height: 0.92;
  letter-spacing: -0.045em;
  text-wrap: balance;
  max-inline-size: 14ch;                 /* shapes the rag; widen to 18-22ch for 3-line heroes */
  margin-inline-start: -0.04em;          /* optical flush with the grid (side bearing) */
  padding-block-start: 0.06em;           /* room for accents/caps when a parent clips */
}
@media (max-width: 480px) {
  .hero-title { font-size: var(--step-6); overflow-wrap: anywhere; hyphens: auto; }
}
```

**Tune:** weight 400-600 reads more expensive at giant sizes than 800-900 (unless the aesthetic is poster/brutalist); line-height 0.85-0.95 (check that descenders of one line do not hit ascenders of the next: "g" above "l"); sentence case reads modern (Linear, Vercel, Stripe), Title Case reads 2015 marketing. Control breaks with `<br className="max-md:hidden">` on desktop and let `balance` handle mobile.  
**A11y/perf:** a `<br>` is announced as nothing, fine; never break words with spans that screen readers read as separate words. The H1 is often the LCP element: do not hide it behind a font load (`display: swap` + metric fallback, recipe 11).

### 14. Serif italics inside grotesk headlines
**Looks like:** "Design that *breathes* with you": a grotesk headline with one word in a serif italic, the signature move of 2023-26 studio sites.  
**Use when / avoid when:** one meaningful word per headline, in at most 2-3 headlines per page. The move itself is now saturated (and the Instrument Serif version is the most recognisable AI tell of 2025-26): use a less common italic (Gloock, Sentient, Erode, Boska, GT Alpina, Reckless Neue), or swap the idea for a weight/width contrast inside one variable family (Mona Sans wdth 75 vs 125).  
**Stack:** CSS

```tsx
<h2 className="mix-title">
  Design that <em className="mix-title__accent">breathes</em> with you
</h2>
```

```css
.mix-title {
  font-family: var(--font-sans);
  font-size: var(--step-5);
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: -0.035em;
  font-size-adjust: ex-height 0.5;       /* normalise x-heights of BOTH faces to 0.5em (Baseline 2024) */
}
.mix-title__accent {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;               /* serif italics need far less negative tracking */
  padding-inline-end: 0.04em;            /* italic overhang would collide with the next word */
}
```

**Tune:** without `font-size-adjust`, scale the accent by eye (`font-size: 1.05-1.15em`) because most serif italics have smaller x-heights than grotesks. Keep the accent color the same as the headline; a colored italic word plus a serif change is two moves.  
**A11y/perf:** use `<em>` only when the stress is semantic; for purely visual accents use `<span>`. One extra font file (the italic): preload it only if it appears above the fold.

### 15. Inline images and pills in headlines
**Looks like:** small rounded photos, avatars or video pills sitting inside a headline between words ("We build [photo] products people [avatar stack] love").  
**Use when / avoid when:** a single playful or human hero on studio/agency/community sites. A 2023-25 Framer-template staple: do it once, with real imagery that adds information (team, product), not stock.  
**Stack:** CSS

```tsx
<h2 className="pill-title">
  We build <span className="pill-title__media"><img src="/images/team.avif" alt="" /></span> products people love
</h2>
```

```css
.pill-title { font-size: var(--step-6); line-height: 1; letter-spacing: -0.04em; text-wrap: balance; }
.pill-title__media {
  display: inline-block;
  inline-size: 1.9em;
  block-size: 0.78em;                    /* roughly cap height: aligns to the letters, not the line box */
  margin-inline: 0.06em;
  vertical-align: -0.04em;
  border-radius: 999px;
  overflow: clip;
}
.pill-title__media img, .pill-title__media video { inline-size: 100%; block-size: 100%; object-fit: cover; }
```

**Tune:** height 0.7-0.8em (cap height), width 1.4-2.4em; animate only on first reveal (width from 0 with the heading reveal, see `text-effects.md#27-kinetic-headline-intro-sequence`).  
**A11y/perf:** decorative images get `alt=""`; give real `width`/`height` attributes or the aspect box above so nothing shifts. Video pills: `muted playsinline loop`, paused under reduced motion.

### 16. Editorial layout
**Looks like:** a magazine page: a lede, a drop cap, a pull quote with hanging quotes, sidenotes in the margin, small-caps first line.  
**Use when / avoid when:** case studies, essays, long-form about pages. Not for SaaS feature pages. Multi-column body text on screens forces up-down-up scrolling: use columns only for short blocks (credits, footnotes, intro lists).  
**Stack:** CSS

```css
.article { display: grid; grid-template-columns: minmax(0, 65ch) minmax(0, 20ch); column-gap: clamp(2rem, 4vw, 4rem); }
.article > * { grid-column: 1; }
.article > .note {                         /* sidenote sits beside the paragraph before it */
  grid-column: 2;
  font-size: var(--step--1);
  line-height: 1.45;
  color: var(--muted);
  align-self: start;
}
@media (max-width: 960px) {
  .article { grid-template-columns: minmax(0, 1fr); }
  .article > .note { grid-column: 1; border-inline-start: 2px solid var(--line); padding-inline-start: 1rem; }
}

.lede { font-size: var(--step-1); line-height: 1.4; letter-spacing: -0.01em; text-wrap: pretty; }
.lede::first-line { font-variant-caps: all-small-caps; letter-spacing: 0.04em; }

/* Drop cap: initial-letter is Chrome 110+ unprefixed, Safari -webkit-, not Firefox */
.article > p.dropcap::first-letter {
  font-family: var(--font-display);
  font-weight: 500;
  color: var(--accent);
  margin-inline-end: 0.1em;
}
@supports (initial-letter: 3) or (-webkit-initial-letter: 3) {
  .article > p.dropcap::first-letter { -webkit-initial-letter: 3; initial-letter: 3; }
}
@supports not ((initial-letter: 3) or (-webkit-initial-letter: 3)) {
  .article > p.dropcap::first-letter { float: inline-start; font-size: 3.9em; line-height: 0.8; margin-block-start: 0.06em; }
}

.pull {
  grid-column: 1 / -1;
  margin-block: 2.5em;
  font-family: var(--font-display);
  font-size: var(--step-4);
  line-height: 1.08;
  letter-spacing: -0.02em;
  text-wrap: balance;
  hanging-punctuation: first last;        /* Safari */
}
@supports not (hanging-punctuation: first) { .pull p:first-child { text-indent: -0.42em; } }

.credits { columns: 2 22ch; column-gap: 2rem; font-size: var(--step--1); }
.credits > * { break-inside: avoid; }
```

**Tune:** drop cap 2-4 lines (3 is classic); in the float fallback tweak `font-size`/`line-height` per face until the cap aligns with line 1 cap height and line 3 baseline. Pull quotes 1.5-2x body size, one per ~800 words.  
**A11y/perf:** `::first-letter` keeps the word intact for screen readers (no `<span>D</span>rop` hacks). Sidenotes must also make sense inline on mobile; reference them in text (a superscript link) if they are essential.

### 17. Mono for metadata
**Looks like:** a project index where titles are large display type and year/role/index sit in small mono, all on one shared baseline, separated by hairlines (the studio index list).  
**Use when / avoid when:** work lists, changelogs, archives, event listings. Mono for everything (body in mono) is a different, "terminal" aesthetic; mono as metadata is the restrained version.  
**Stack:** CSS

```html
<ul class="index">
  <li class="index__row">
    <span class="index__num">01</span>
    <a class="index__title" href="/work/devagent">DevAgent</a>
    <span class="index__meta">AI tooling</span>
    <time class="index__meta" datetime="2026">2026</time>
  </li>
</ul>
```

```css
.index { list-style: none; margin: 0; padding: 0; border-block-end: 1px solid var(--line); }
.index__row {
  display: grid;
  grid-template-columns: 4ch minmax(0, 1fr) auto 6ch;
  align-items: baseline;                  /* mixed sizes share one baseline */
  gap: clamp(0.75rem, 2vw, 2rem);
  padding-block: 1.1rem;
  border-block-start: 1px solid var(--line);
}
.index__num, .index__meta {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}
.index__title { font-family: var(--font-display); font-size: var(--step-3); line-height: 1.1; letter-spacing: -0.02em; }
.index__meta:last-child { text-align: end; }
@media (max-width: 640px) {
  .index__row { grid-template-columns: 3ch minmax(0, 1fr); }
  .index__row > .index__meta { grid-column: 2; }
}
```

**Tune:** mono at 0.75-0.85x body size; tracking 0 to +0.03em for lowercase mono, +0.06em for uppercase; one mono only, same family as code blocks.  
**A11y/perf:** use `<time datetime>` for dates and real links for titles; hover effects for rows live in `interactions.md`.

## Anti-patterns and fixes
| Anti-pattern (reads generated or cheap) | Fix |
|---|---|
| One family at default weights, flat scale (16/20/24/30/36), 400 vs 600 only | Display face with a POV, ratio >= 1.25 on desktop, hero at step 6-8, weight contrast 300-400 vs 500-700 |
| Zero tracking on 80px+ headlines | -0.03 to -0.05em (per face), line-height 0.9-1.0 |
| Negative tracking on small text or labels | 0 for body, +0.06-0.12em for uppercase labels |
| Positive tracking on lowercase body | Never; only caps and small caps get positive tracking |
| Line-height 1.5 on display, 1.2 on body | `line-height: calc(1em + 0.5rem)` for headings, 1.5-1.7 body |
| Lines of 100+ characters, or centered multi-line paragraphs | `max-inline-size: 60-70ch`, left-aligned body; center only 1-3 line headings |
| Single-word last lines in headings/paragraphs | `text-wrap: balance` (headings), `pretty` (paragraphs) |
| Faux bold/italic/small caps (weight/style not loaded) | Load the real style; `font-synthesis: none` in dev to surface misses |
| 6+ font files, 3 families | 2 families + mono, variable files, preload only above-the-fold faces |
| The saturated stack (Inter / Geist / Satoshi / Space Grotesk + Instrument Serif italic) | Pick from the LOW rows of recipe 9, or use stylistic sets to de-default a common face |
| Gradient or shimmer on every heading | Solid ink; one accent treatment per page (`text-effects.md#16-gradient-text--animated-gradient`) |
| Title Case Marketing Headlines Everywhere | Sentence case |
| Pure #000 on #fff (or #fff on #000) for long text | Off-black/off-white, dark mode +0.05 line-height and lighter weight/grade |
| Proportional digits in prices, tables, timers | `font-variant-numeric: tabular-nums` |
| Uppercase labels without case-sensitive forms | `font-feature-settings: "case" 1` so hyphens, brackets, @ sit at cap height |
| Justified text without hyphenation | `text-align: start`, or `justify` + `hyphens: auto` + `lang` |
| px font sizes or vw-only fluid sizes | `rem` + `clamp()` with a rem term (zoom-safe) |
| Emoji as bullets or section icons in headings | Real icons (SVG) or typographic markers (01, (a), [x]) |

## Gotchas
- **Tracking values do not transfer between fonts**: -0.04em that looks right on a grotesk looks cramped on a wide geometric or a high-contrast serif. Re-tune after every font swap.
- **next/font variable name collisions with Tailwind v4**: `variable: "--font-sans"` plus `@theme inline { --font-sans: var(--font-sans) }` is a cycle; name the next/font variables `--font-*-src`.
- **Static Google fonts need `weight`** (`Young_Serif({ weight: "400" })`); forgetting it is a build error. Variable fonts only ship `wght` unless you add `axes: ["wdth", "opsz"]`.
- **`preload: true` with no `subsets`** logs a warning and preloads nothing useful; list `subsets: ["latin"]` (or `latin-ext` when names need it).
- **Fonts called in a page, not the layout, only preload on that route**; fonts in the root layout preload on every route, so keep rarely used faces out of it.
- **Subsetting strips features**: `pyftsubset` without `--layout-features='*'` drops `ss01`, `tnum`, `case` and friends, and your font-feature-settings silently stop working.
- **`font-variation-settings` does not cascade per axis**: a child that sets `"wdth" 110` loses the parent's `"GRAD" -50`. Use registered custom properties per axis or the high-level `font-weight`/`font-stretch`.
- **`font-feature-settings` is all-or-nothing**: a later rule with `"ss01" 1` erases an earlier `"tnum" 1`. Prefer `font-variant-*` longhands, which combine.
- **SVG-as-image cannot see page fonts**: text inside `<img src="x.svg">`, CSS `background-image` or `mask-image` SVGs falls back to system fonts. Inline the SVG or outline the text.
- **Hyphenation needs a language**: `hyphens: auto` does nothing without `<html lang>`; mixed-language content needs `lang` on the element.
- **`text-wrap: balance` has a line cap** (Chromium 6 lines, Firefox 10) and fights GSAP SplitText line detection; do not balance split targets.
- **`initial-letter` + Firefox**: no support in 2026; always ship the float fallback in `@supports not`.
- **Pangram and other trial fonts are not licensed for public sites**: the Pangram FAQ requires a web license for any website embedding the font, including personal ones in practice; budget it or pick a Fontshare/OFL alternative.
- **Many free display fonts are Latin-only**: check Latin Extended (Turkish, Polish, Vietnamese names) and Arabic/French needs before choosing; Google Fonts lists subsets per family, Fontshare lists languages per font.

## Sources
- https://utopia.fyi/type/calculator/ (default settings and generated clamp tokens), https://utopia.fyi/blog/designing-with-fluid-type-scales/
- https://nextjs.org/docs/app/api-reference/components/font (Next 16.3.6: options, adjustFontFallback, preload per route, Tailwind v4 `@theme inline` example)
- https://tailwindcss.com/docs/font-size (`--text-*--line-height/--letter-spacing/--font-weight` tokens)
- https://fonts.google.com/metadata/fonts (families, axes, date added, popularity ranks, 2026-09)
- https://api.fontshare.com/v2/fonts (families, license types, view counts), https://www.fontshare.com/licenses/itf-ffl, https://www.fontshare.com/faq
- https://pangrampangram.com/pages/faq (personal use definition, web license by pageviews), https://pangrampangram.com/collections/fonts
- https://www.collletttivo.it/typefaces (OFL), https://velvetyne.fr/ (libre fonts)
- https://displaay.net/typefaces, https://fontsinuse.com/foundry/2366/displaay-type-foundry
- https://news.ycombinator.com/item?id=47865795 ("slop fonts": Space Grotesk, Instrument Serif, Geist, Syne, Fraunces)
- https://www.bruvora.com/blog/stop-ai-slop-typography, https://www.creativebloq.com/design/fonts-typography/serif-fonts-are-back-in-fashion-and-i-couldnt-be-happier, https://atypeofamigo.com/outstanding-fonts-why-is-instrument-serif-conquering-the-world/
- https://github.com/seek-oss/capsize (createFontStack, @capsizecss/unpack fromFile)
- https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap, https://developer.mozilla.org/en-US/docs/Web/CSS/initial-letter
- https://caniuse.com/css-text-wrap-balance, https://caniuse.com/css-initial-letter
- webstatus.dev API (`api.webstatus.dev/v1/features/<id>`): text-wrap-balance, text-wrap-pretty, hanging-punctuation, text-box, initial-letter, font-size-adjust, font-variant-numeric, font-optical-sizing, font-variation-settings, font-palette
- Skills cross-checked for saturation lists: https://github.com/pbakaus/impeccable (`reference/brand.md`, reflex-reject list), https://github.com/Leonxlnx/taste-skill (`skills/taste-skill/SKILL.md`)
