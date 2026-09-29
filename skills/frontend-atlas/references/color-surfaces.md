# Color, Surfaces and Materials
> Load when: choosing or generating a palette, building theme tokens (light/dark/multi-brand), fixing contrast, making gradients/glass/shadows/borders/radii look premium, or treating images (duotone, scrims, grading).
> Stack assumptions: Tailwind CSS 4.3 (CSS-first `@theme`) + CSS custom properties, React 19 / Next 16 App Router + TS. Every recipe is plain CSS first; TS only where it computes something (palette generation, contrast checks, displacement maps).

## Contents
- [Decision guide](#decision-guide)
- [1. OKLCH working model (cheat sheet)](#1-oklch-working-model-cheat-sheet)
- [2. 12-step ramp generator (TS, gamut-aware)](#2-12-step-ramp-generator-ts-gamut-aware)
- [3. CSS-only ramps with relative color syntax](#3-css-only-ramps-with-relative-color-syntax)
- [4. Ready-made palettes (tinted neutrals + accent)](#4-ready-made-palettes-tinted-neutrals--accent)
- [5. Semantic token architecture in Tailwind v4](#5-semantic-token-architecture-in-tailwind-v4)
- [6. light-dark() tokens and local inversion](#6-light-dark-tokens-and-local-inversion)
- [7. Multi-brand theming from one hue](#7-multi-brand-theming-from-one-hue)
- [8. Contrast: WCAG 2 vs APCA, and testing](#8-contrast-wcag-2-vs-apca-and-testing)
- [9. Text on images and gradients (scrims)](#9-text-on-images-and-gradients-scrims)
- [10. Dark mode done right](#10-dark-mode-done-right)
- [11. Theme switch without FOUC](#11-theme-switch-without-fouc)
- [12. Accent strategy and brand color extraction](#12-accent-strategy-and-brand-color-extraction)
- [13. Gradients that do not look cheap](#13-gradients-that-do-not-look-cheap)
- [14. Banding fixes: dithering with noise](#14-banding-fixes-dithering-with-noise)
- [15. Glassmorphism done right](#15-glassmorphism-done-right)
- [16. Liquid Glass approximations (tiered)](#16-liquid-glass-approximations-tiered)
- [17. Layered, tinted shadows and an elevation scale](#17-layered-tinted-shadows-and-an-elevation-scale)
- [18. Inner shadows, bevels, tactile controls](#18-inner-shadows-bevels-tactile-controls)
- [19. Hairline borders](#19-hairline-borders)
- [20. Gradient borders](#20-gradient-borders)
- [21. Radius system, nested radius rule, squircles](#21-radius-system-nested-radius-rule-squircles)
- [22. Grain and noise surfaces](#22-grain-and-noise-surfaces)
- [23. Image treatment: duotone, grading, blend modes](#23-image-treatment-duotone-grading-blend-modes)
- [24. Reference token sets (brand-inspired aesthetics)](#24-reference-token-sets-brand-inspired-aesthetics)
- [25. Color tools](#25-color-tools)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide

| Goal / feel | Technique | Cost | Recipe |
|---|---|---|---|
| Palette that looks even across hues | OKLCH ramp: fixed L steps, bell-shaped chroma, hue drift | CSS / 2 kb TS at build | [2](#2-12-step-ramp-generator-ts-gamut-aware), [3](#3-css-only-ramps-with-relative-color-syntax) |
| "Just give me good colors" | Tinted neutral + one accent from the ready-made sets | CSS | [4](#4-ready-made-palettes-tinted-neutrals--accent) |
| Theme tokens usable as `bg-surface-2` etc. | `:root`/`.dark` vars + `@theme inline` | CSS | [5](#5-semantic-token-architecture-in-tailwind-v4) |
| One inverted (dark) section on a light page | `light-dark()` tokens + `color-scheme: dark` on the section | CSS | [6](#6-light-dark-tokens-and-local-inversion) |
| White-label / per-client brand | `data-brand` + relative colors from one `--brand-h` | CSS | [7](#7-multi-brand-theming-from-one-hue) |
| Legal compliance + real readability | WCAG 2 AA gate + APCA Lc tuning | 3 kb dev-only | [8](#8-contrast-wcag-2-vs-apca-and-testing) |
| Headline over a photo | Eased scrim gradient, not flat black 50% | CSS | [9](#9-text-on-images-and-gradients-scrims) |
| Premium dark UI | Lighter-is-higher surfaces, desaturated accent, borders over shadows | CSS | [10](#10-dark-mode-done-right) |
| No white flash on reload | `next-themes` or 6-line head script | 1 kb | [11](#11-theme-switch-without-fouc) |
| Gradient hero that is not "AI purple" | `in oklch`, analogous hues, eased stops, grain | CSS | [13](#13-gradients-that-do-not-look-cheap), [14](#14-banding-fixes-dithering-with-noise) |
| Frosted nav / floating panel | `backdrop-filter: blur(12-20px) saturate(140-180%)` + rim | GPU, area-bound | [15](#15-glassmorphism-done-right) |
| Apple "Liquid Glass" feel | CSS rim+sheen everywhere, SVG refraction on Chromium only | GPU heavy, small elements | [16](#16-liquid-glass-approximations-tiered) |
| Cards that float naturally | 3-8 layered shadows tinted with the bg hue | CSS | [17](#17-layered-tinted-shadows-and-an-elevation-scale) |
| Buttons that feel pressable | Inset highlight + inner shade + 1px ring | CSS | [18](#18-inner-shadows-bevels-tactile-controls) |
| Crisp separation without heaviness | Alpha hairlines, inset rings, image outlines | CSS | [19](#19-hairline-borders) |
| Glowing / animated edge | padding-box/border-box trick or mask-composite | CSS | [20](#20-gradient-borders) |
| Consistent corners | Radius tokens, inner = outer - padding, squircle PE | CSS | [21](#21-radius-system-nested-radius-rule-squircles) |
| Tactile, printed, analog | Static SVG noise overlay 3-8% | CSS, 1 kb | [22](#22-grain-and-noise-surfaces) |
| Unify mismatched photos | Duotone / grayscale + color blend | CSS or SVG filter | [23](#23-image-treatment-duotone-grading-blend-modes) |
| "Make it look like Linear/Vercel/Stripe" | Token sets as starting points | CSS | [24](#24-reference-token-sets-brand-inspired-aesthetics) |

Browser facts used below (checked 2026-09): `oklch()`, `color-mix()`, relative color syntax, `light-dark()` (colors) and gradient interpolation `in <space>` are Baseline across Chrome/Edge, Firefox, Safari (gradient `in oklch`: Chrome 111, Safari 16.4, Firefox 113+). `light-dark()` with images: Chrome 150, Firefox 150, Safari 27. `contrast-color()`: Baseline April 2026 (Chrome/Edge 147, Firefox 146, Safari 26), returns only `white` or `black`. `backdrop-filter`: universal, but ship `-webkit-backdrop-filter` too for Safari; SVG `url()` filters inside `backdrop-filter` render only in Chromium. `corner-shape`: Chromium 139+ only. `prefers-reduced-transparency`: Chromium 119+ only.

## Recipes

### 1. OKLCH working model (cheat sheet)
**Looks like:** Not a visual effect: the mental model that makes every later recipe predictable.  
**Use when / avoid when:** Always author new colors in `oklch()`. Keep hex only for brand-mandated values (convert them once, recipe 12). HSL is the slop tell: `hsl(220 90% 50%)` and `hsl(60 90% 50%)` have wildly different perceived lightness, so HSL ramps look uneven and HSL-based dark modes go muddy.  
**Stack:** CSS
```css
/* app/tokens-cheatsheet.css - reference values, not a stylesheet to import */
:root {
  /* oklch(L C H / alpha)
     L: 0..1 perceived lightness (0.62 blue and 0.62 yellow look equally light)
     C: 0..~0.37; sRGB max depends on hue+L (blue ~0.28 at L 0.5, cyan ~0.15, yellow ~0.2 at L 0.9)
     H: 0..360 hue angle. Approx: red 25, orange 55, amber 75, yellow 95, lime 125, green 150,
        teal 180, cyan 210, sky 235, blue 260, indigo 275, violet 295, purple 310, pink 350 */

  --ink: oklch(0.2 0.01 265);          /* near-black with a cool tint: better than #000 text */
  --paper: oklch(0.985 0.004 85);      /* warm off-white: better than #fff for long reading */
  --neutral-tint-cool: 0.008;          /* chroma for "gray" that still reads gray */
  --neutral-tint-warm: 0.006;
}

/* Wide gamut: only raise chroma where the display can show it */
.badge { background: oklch(0.72 0.17 150); }
@media (color-gamut: p3) {
  .badge { background: oklch(0.72 0.22 150); }
}

/* "none" is valid for achromatic colors (no hue) and interpolates cleanly */
.divider { border-color: oklch(0.9 0 none); }
```
**Tune:** chroma for neutrals 0.003-0.012 (above 0.015 they read as colored); UI accents 0.12-0.2; "neon" 0.22+ (P3 only for most hues). Lightness steps for UI states: hover +/-0.04, pressed +/-0.08.  
**A11y/perf:** Zero cost. Out-of-gamut values get mapped by the browser, historically by clipping, which shifts hue; generate with gamut fitting (recipe 2) instead of trusting the browser.

### 2. 12-step ramp generator (TS, gamut-aware)
**Looks like:** A 12-step scale per hue (Radix-style semantics) whose steps have identical perceived lightness across hues, with chroma peaking at the solid step and hues drifting slightly toward the dark end, like Tailwind v4's own palette (blue-50 hue 254 -> blue-950 hue 268; orange-50 hue 74 -> orange-950 hue 36).  
**Use when / avoid when:** Use for any custom brand color or when you need both light and dark ramps. Avoid hand-tweaking 24 values in a design tool; regenerate instead. Do not use equal chroma on every step: pale steps with high chroma look fluorescent, dark steps with high chroma look like mud.  
**Stack:** TS (zero deps, runs in Node 24 with type stripping or at build time)
```ts
// lib/palette.ts - zero-dependency OKLCH ramp generator with sRGB / Display-P3 gamut fitting
export type Gamut = "srgb" | "p3";
export type Mode = "light" | "dark";

export interface RampOptions {
  hue: number; // base hue in degrees (268 indigo, 150 green, 30 orange-red)
  peakChroma: number; // chroma of step 9 before gamut fitting (0.06 muted .. 0.26 vivid)
  hueDrift?: number; // degrees from lightest to darkest (blue +10, orange -25, yellow -30)
  solidL?: number; // lightness of step 9, the brand swatch (0.55 blue .. 0.85 yellow)
  mode?: Mode;
  gamut?: Gamut;
}

// Radix 12-step semantics: 1-2 app bg, 3-5 component bg (rest/hover/active),
// 6-8 borders (subtle/default/hover+focus), 9-10 solid (rest/hover), 11-12 text (low/high)
const L_LIGHT = [0.993, 0.982, 0.958, 0.934, 0.905, 0.868, 0.815, 0.745, 0, 0, 0.52, 0.3];
const L_DARK = [0.155, 0.185, 0.225, 0.26, 0.295, 0.335, 0.39, 0.47, 0, 0, 0.8, 0.94];
const C_CURVE = [0.03, 0.07, 0.14, 0.22, 0.3, 0.38, 0.5, 0.68, 1, 0.97, 0.82, 0.42];

type Vec3 = [number, number, number];

function oklchToLinearSrgb(l: number, c: number, hDeg: number): Vec3 {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

function linearSrgbToLinearP3([r, g, b]: Vec3): Vec3 {
  const x = 0.4123907993 * r + 0.3575843394 * g + 0.1804807884 * b;
  const y = 0.2126390059 * r + 0.7151686788 * g + 0.0721923154 * b;
  const z = 0.0193308187 * r + 0.1191947798 * g + 0.9505321522 * b;
  return [
    2.4934969119 * x - 0.9313836179 * y - 0.4027107845 * z,
    -0.8294889696 * x + 1.7626640603 * y + 0.0236246858 * z,
    0.0358458302 * x - 0.0761723893 * y + 0.956884524 * z,
  ];
}

function inGamut(l: number, c: number, h: number, gamut: Gamut): boolean {
  const lin = oklchToLinearSrgb(l, c, h);
  const rgb = gamut === "p3" ? linearSrgbToLinearP3(lin) : lin;
  return rgb.every((v) => v >= -0.0001 && v <= 1.0001);
}

/** Largest chroma <= wanted that is displayable (binary search; keeps L and H fixed). */
export function fitChroma(l: number, wanted: number, h: number, gamut: Gamut): number {
  if (inGamut(l, wanted, h, gamut)) return wanted;
  let lo = 0;
  let hi = wanted;
  for (let i = 0; i < 20; i += 1) {
    const mid = (lo + hi) / 2;
    if (inGamut(l, mid, h, gamut)) lo = mid;
    else hi = mid;
  }
  return lo;
}

const round = (v: number, d = 3) => Number(v.toFixed(d));

export function oklchRamp(opts: RampOptions): string[] {
  const { hue, peakChroma, hueDrift = 0, solidL = 0.62, mode = "light", gamut = "srgb" } = opts;
  const base = mode === "light" ? L_LIGHT : L_DARK;
  const lightness = base.map((l, i) => {
    if (i === 8) return solidL;
    if (i === 9) return mode === "light" ? solidL - 0.04 : solidL + 0.04;
    if (i === 10) return mode === "light" ? Math.min(l, solidL - 0.1) : Math.max(l, solidL + 0.14);
    return l;
  });
  return lightness.map((l, i) => {
    const t = 1 - l; // darker steps drift further
    const h = (hue - hueDrift / 2 + hueDrift * t + 360) % 360;
    const c = fitChroma(l, peakChroma * C_CURVE[i], h, gamut);
    return `oklch(${round(l)} ${round(c)} ${round(h, 1)})`;
  });
}

export function rampToCss(name: string, ramp: string[]): string {
  return ramp.map((v, i) => `  --${name}-${i + 1}: ${v};`).join("\n");
}

/* Usage (e.g. scripts/gen-palette.ts, run with `node scripts/gen-palette.ts`):
   const indigo = { hue: 268, peakChroma: 0.2, hueDrift: 10, solidL: 0.56 };
   console.log(`:root {\n${rampToCss("accent", oklchRamp(indigo))}\n}`);
   console.log(`.dark {\n${rampToCss("accent", oklchRamp({ ...indigo, mode: "dark" }))}\n}`);
   console.log(`@media (color-gamut: p3) { :root {\n${rampToCss("accent", oklchRamp({ ...indigo, gamut: "p3", peakChroma: 0.26 }))}\n} }`); */
```
Actual output of the usage above (verified by running it):
```css
/* app/palette.css - generated: indigo, light + dark */
:root {
  --accent-1: oklch(0.993 0.003 263.1);
  --accent-2: oklch(0.982 0.008 263.2);
  --accent-3: oklch(0.958 0.02 263.4);
  --accent-4: oklch(0.934 0.031 263.7);
  --accent-5: oklch(0.905 0.046 264);
  --accent-6: oklch(0.868 0.064 264.3);
  --accent-7: oklch(0.815 0.092 264.9);
  --accent-8: oklch(0.745 0.131 265.5);
  --accent-9: oklch(0.56 0.2 267.4);
  --accent-10: oklch(0.52 0.194 267.8);
  --accent-11: oklch(0.46 0.164 268.4);
  --accent-12: oklch(0.3 0.084 270);
}
.dark {
  --accent-1: oklch(0.155 0.006 271.5);
  --accent-2: oklch(0.185 0.014 271.1);
  --accent-3: oklch(0.225 0.028 270.8);
  --accent-4: oklch(0.26 0.044 270.4);
  --accent-5: oklch(0.295 0.06 270);
  --accent-6: oklch(0.335 0.076 269.6);
  --accent-7: oklch(0.39 0.1 269.1);
  --accent-8: oklch(0.47 0.136 268.3);
  --accent-9: oklch(0.56 0.2 267.4);
  --accent-10: oklch(0.6 0.194 267);
  --accent-11: oklch(0.8 0.1 265);
  --accent-12: oklch(0.94 0.028 263.6);
}
```
**Tune:** `solidL` per hue (yellow/amber/lime/cyan need 0.78-0.88 and dark text on step 9; blue/indigo/violet 0.5-0.6 with white text); `peakChroma` 0.14 calm SaaS, 0.2 confident, 0.26 P3 vivid; `hueDrift` warm hues negative (yellow drifts to orange in darks instead of olive), cool hues positive (blue drifts to indigo). For neutral ramps call it with `peakChroma: 0.012` and the accent hue: that is the "tinted gray" every premium UI uses.  
**A11y/perf:** Build-time only. Check steps 11/12 against step 2 with APCA (recipe 8): target Lc 60 / Lc 90, the same guarantee Radix makes for its scales.

### 3. CSS-only ramps with relative color syntax
**Looks like:** A full hover/active/subtle/border family derived at runtime from one `--accent`, so a CMS or user can change one value and every state follows.  
**Use when / avoid when:** Use for user-chosen accents, per-project colors in a portfolio, or per-card tints. Avoid for the core design system palette: relative colors cannot gamut-fit, so extreme inputs (neon cyan, pure yellow) produce clipped steps. Precompute those with recipe 2.  
**Stack:** CSS
```css
/* app/accent-derived.css */
:root {
  --accent: oklch(0.58 0.2 268); /* the only input */

  /* relative color syntax: channels l, c, h are numbers; use decimals inside calc(), not % */
  --accent-hover: oklch(from var(--accent) calc(l - 0.05) c h);
  --accent-active: oklch(from var(--accent) calc(l - 0.09) calc(c * 0.95) h);
  --accent-subtle: oklch(from var(--accent) 0.96 calc(c * 0.18) h);
  --accent-subtle-hover: oklch(from var(--accent) 0.93 calc(c * 0.26) h);
  --accent-border: oklch(from var(--accent) 0.82 calc(c * 0.45) h);
  --accent-text: oklch(from var(--accent) 0.45 calc(c * 0.85) calc(h + 2));
  --accent-glow: oklch(from var(--accent) calc(l + 0.1) c h / 0.35);
  /* text ON the solid accent: black/white automatically (Baseline 2026) */
  --accent-contrast: contrast-color(var(--accent));
}

.dark {
  --accent-subtle: oklch(from var(--accent) 0.26 calc(c * 0.35) h);
  --accent-subtle-hover: oklch(from var(--accent) 0.3 calc(c * 0.42) h);
  --accent-border: oklch(from var(--accent) 0.45 calc(c * 0.6) h);
  --accent-text: oklch(from var(--accent) 0.8 calc(c * 0.6) h);
}

/* Fallback for engines without relative colors: color-mix() is older and universal */
@supports not (color: oklch(from red l c h)) {
  :root {
    --accent-hover: color-mix(in oklab, var(--accent), black 10%);
    --accent-active: color-mix(in oklab, var(--accent), black 18%);
    --accent-subtle: color-mix(in oklab, var(--accent) 10%, white);
    --accent-border: color-mix(in oklab, var(--accent) 40%, white);
    --accent-glow: color-mix(in oklab, var(--accent) 35%, transparent);
  }
}

.btn-primary {
  background: var(--accent);
  color: var(--accent-contrast, white);
  transition: background-color var(--dur-fast, 120ms) var(--ease-out, ease-out);
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:active { background: var(--accent-active); }
```
**Tune:** hover delta 0.04-0.06 L; subtle bg chroma factor 0.12-0.25 (higher looks like a highlighter); dark-mode subtle L 0.24-0.3.  
**A11y/perf:** `contrast-color()` picks by WCAG-style contrast and can choose black on mid-blues (MDN's own warning: `#2277d3` gets black text). Keep solid accents either clearly dark (L < 0.6) or clearly light (L > 0.75), or hardcode `--accent-contrast`.

### 4. Ready-made palettes (tinted neutrals + accent)
**Looks like:** Five complete, tested starting points. Each has a neutral carrying a hint of the accent hue, which is what makes a UI feel "designed" rather than default gray.  
**Use when / avoid when:** Use when the brief has no brand color. Pick by mood; do not mix neutrals from two sets. Avoid the "slate + indigo-500 + purple gradient" combo unless you mean it: it is the single most common AI-generated palette.  
**Stack:** CSS
```css
/* app/palettes.css - pick ONE block and rename to :root / .dark as needed */

/* A. "Graphite + Signal" - calm dev-tool, Linear-ish. Cool neutral, desaturated indigo */
[data-palette="graphite"] {
  --n-0: oklch(0.99 0.002 270);  --n-1: oklch(0.975 0.003 270); --n-2: oklch(0.955 0.004 270);
  --n-3: oklch(0.92 0.006 270);  --n-4: oklch(0.87 0.008 270);  --n-5: oklch(0.72 0.012 270);
  --n-6: oklch(0.55 0.014 270);  --n-7: oklch(0.42 0.014 270);  --n-8: oklch(0.3 0.012 270);
  --n-9: oklch(0.21 0.01 270);   --n-10: oklch(0.16 0.008 270);
  --accent: oklch(0.58 0.16 272);
}

/* B. "Paper + Ink" - editorial, warm. Warm off-white, near-black ink, vermilion accent */
[data-palette="paper"] {
  --n-0: oklch(0.985 0.006 85);  --n-1: oklch(0.97 0.008 85);   --n-2: oklch(0.945 0.01 82);
  --n-3: oklch(0.91 0.012 80);   --n-4: oklch(0.85 0.014 78);   --n-5: oklch(0.68 0.016 70);
  --n-6: oklch(0.52 0.016 65);   --n-7: oklch(0.4 0.014 60);    --n-8: oklch(0.29 0.012 55);
  --n-9: oklch(0.21 0.01 50);    --n-10: oklch(0.17 0.008 50);
  --accent: oklch(0.6 0.2 33);
}

/* C. "Forest" - sustainable/finance/wellness. Green-gray neutral, deep green + lime spark */
[data-palette="forest"] {
  --n-0: oklch(0.985 0.004 140); --n-1: oklch(0.965 0.006 140); --n-2: oklch(0.94 0.008 145);
  --n-3: oklch(0.9 0.01 150);    --n-4: oklch(0.84 0.012 150);  --n-5: oklch(0.68 0.016 155);
  --n-6: oklch(0.52 0.018 160);  --n-7: oklch(0.4 0.02 162);    --n-8: oklch(0.3 0.02 165);
  --n-9: oklch(0.22 0.018 165);  --n-10: oklch(0.17 0.014 165);
  --accent: oklch(0.45 0.1 158);
  --spark: oklch(0.9 0.19 125);  /* use for ONE highlight: a badge, a cursor, a number */
}

/* D. "Midnight Neon" - dark-first creative/AI. Blue-black, electric cyan-green accent (P3 aware) */
[data-palette="midnight"] {
  --n-0: oklch(0.13 0.012 260);  --n-1: oklch(0.16 0.014 260);  --n-2: oklch(0.19 0.016 260);
  --n-3: oklch(0.23 0.018 260);  --n-4: oklch(0.28 0.02 260);   --n-5: oklch(0.4 0.02 260);
  --n-6: oklch(0.55 0.018 260);  --n-7: oklch(0.7 0.014 260);   --n-8: oklch(0.82 0.01 260);
  --n-9: oklch(0.92 0.006 260);  --n-10: oklch(0.97 0.004 260);
  --accent: oklch(0.82 0.15 175);
}
@media (color-gamut: p3) { [data-palette="midnight"] { --accent: oklch(0.84 0.2 172); } }

/* E. "Clay" - human/craft/studio. Warm stone neutral, terracotta + deep plum text */
[data-palette="clay"] {
  --n-0: oklch(0.975 0.01 60);   --n-1: oklch(0.955 0.014 58);  --n-2: oklch(0.93 0.018 55);
  --n-3: oklch(0.89 0.022 52);   --n-4: oklch(0.82 0.026 50);   --n-5: oklch(0.66 0.03 45);
  --n-6: oklch(0.5 0.03 40);     --n-7: oklch(0.38 0.03 20);    --n-8: oklch(0.29 0.03 355);
  --n-9: oklch(0.22 0.03 345);   --n-10: oklch(0.17 0.025 345);
  --accent: oklch(0.62 0.14 42);
}
```
**Tune:** the neutral chroma column is the whole personality: 0.002-0.006 = crisp/technical, 0.01-0.018 = warm/organic, 0.02+ = tinted theme (use only when the brand is the color). Keep accent chroma at least 8x the neutral chroma so the accent still pops.  
**A11y/perf:** In each set, body text = `--n-9` on `--n-0/1` passes WCAG AA and APCA Lc 90; `--n-6` secondary text passes Lc 60 on `--n-0` (use it at 16px+ only).

### 5. Semantic token architecture in Tailwind v4
**Looks like:** Components written as `bg-surface-1 text-fg border-border-subtle` that re-theme instantly for dark mode, high contrast, or a new brand without touching markup.  
**Use when / avoid when:** Every project with more than one page. Never write `bg-zinc-900 dark:bg-zinc-100` pairs in components: that is palette-level coupling and makes dark mode a find-and-replace job.  
**Stack:** CSS (Tailwind 4.3). Pattern matches shadcn/ui's v4 setup: raw vars on `:root`/`.dark`, mapped with `@theme inline` so utilities read the live variable.
```css
/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  color-scheme: light;
  /* surfaces: 0 = page, 1..3 = raised layers, elevated = popovers/menus */
  --bg: oklch(0.985 0.003 270);
  --surface-1: oklch(1 0 0);
  --surface-2: oklch(0.97 0.004 270);
  --surface-3: oklch(0.945 0.005 270);
  --elevated: oklch(1 0 0);
  --overlay: oklch(0.2 0.01 270 / 0.4);          /* dialog backdrop */

  /* lines */
  --border-subtle: oklch(0.2 0.01 270 / 0.08);   /* alpha borders adapt to any surface */
  --border: oklch(0.2 0.01 270 / 0.13);
  --border-strong: oklch(0.2 0.01 270 / 0.24);

  /* text */
  --fg: oklch(0.2 0.012 270);
  --fg-muted: oklch(0.45 0.014 270);
  --fg-faint: oklch(0.6 0.012 270);              /* placeholders, meta; 16px+ only */

  /* brand */
  --accent: oklch(0.56 0.19 268);
  --accent-hover: oklch(0.51 0.19 268);
  --accent-subtle: oklch(0.95 0.03 268);
  --accent-fg: oklch(0.46 0.17 268);             /* accent-colored text on surfaces */
  --accent-contrast: oklch(0.99 0 0);            /* text on solid accent */
  --focus: oklch(0.62 0.19 268);

  /* status */
  --success: oklch(0.6 0.15 150);  --success-subtle: oklch(0.96 0.03 150);
  --warning: oklch(0.75 0.16 75);  --warning-subtle: oklch(0.97 0.04 85);
  --danger: oklch(0.58 0.21 25);   --danger-subtle: oklch(0.96 0.025 25);

  --shadow-color: 270deg 12% 40%; /* consumed by recipe 17 tokens (hsl channels) */
  --radius: 0.75rem;
}

.dark {
  color-scheme: dark;
  --bg: oklch(0.155 0.006 270);
  --surface-1: oklch(0.185 0.007 270);
  --surface-2: oklch(0.215 0.008 270);
  --surface-3: oklch(0.25 0.009 270);
  --elevated: oklch(0.235 0.009 270);
  --overlay: oklch(0.08 0.01 270 / 0.6);

  --border-subtle: oklch(1 0 0 / 0.06);
  --border: oklch(1 0 0 / 0.1);
  --border-strong: oklch(1 0 0 / 0.18);

  --fg: oklch(0.95 0.004 270);
  --fg-muted: oklch(0.72 0.01 270);
  --fg-faint: oklch(0.56 0.01 270);

  --accent: oklch(0.66 0.15 268);                /* lighter AND less chroma than light mode */
  --accent-hover: oklch(0.71 0.14 268);
  --accent-subtle: oklch(0.27 0.05 268);
  --accent-fg: oklch(0.78 0.11 268);
  --accent-contrast: oklch(0.16 0.02 268);
  --focus: oklch(0.72 0.14 268);

  --success: oklch(0.72 0.14 150); --success-subtle: oklch(0.25 0.04 150);
  --warning: oklch(0.8 0.14 80);   --warning-subtle: oklch(0.27 0.04 80);
  --danger: oklch(0.68 0.18 25);   --danger-subtle: oklch(0.26 0.05 25);

  --shadow-color: 270deg 30% 3%;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-elevated: var(--elevated);
  --color-overlay: var(--overlay);
  --color-border-subtle: var(--border-subtle);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-fg-faint: var(--fg-faint);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-subtle: var(--accent-subtle);
  --color-accent-fg: var(--accent-fg);
  --color-accent-contrast: var(--accent-contrast);
  --color-focus: var(--focus);
  --color-success: var(--success);
  --color-success-subtle: var(--success-subtle);
  --color-warning: var(--warning);
  --color-warning-subtle: var(--warning-subtle);
  --color-danger: var(--danger);
  --color-danger-subtle: var(--danger-subtle);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  html { background: var(--bg); color: var(--fg); }
  :focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  ::selection { background: oklch(from var(--accent) l c h / 0.25); }
}
```
```tsx
// components/ui/card.tsx
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-1 p-6 text-fg shadow-sm">
      {children}
    </div>
  );
}
```
**Tune:** Keep the token count small: 4 surfaces, 3 borders, 3 text levels, 1 accent family, 3 statuses. More tokens = inconsistent usage. Optional: `--color-*: initial;` inside a plain `@theme` block to delete Tailwind's default palette and force token use.  
**A11y/perf:** `@theme inline` matters: without it, utilities reference a `--color-*` variable resolved at `:root`, and nested `.dark` scopes stop working. Opacity modifiers (`bg-accent/10`) still work; Tailwind 4 compiles them to `color-mix(in oklab, ...)`.

### 6. light-dark() tokens and local inversion
**Looks like:** One token declaration per color; plus the ability to drop a single dark "feature band" into a light page (or a light card into a dark page) with `color-scheme: dark` on that section only.  
**Use when / avoid when:** Great for vanilla CSS, design-system packages, and for inverted sections. With Tailwind's `dark:` variant you still need the class approach (recipe 5); both can coexist because `light-dark()` follows `color-scheme`, which recipe 5 sets on `.dark`.  
**Stack:** CSS
```css
/* app/tokens-light-dark.css */
:root {
  color-scheme: light dark; /* REQUIRED: without it light-dark() always returns the first value */
  --bg: light-dark(oklch(0.985 0.003 270), oklch(0.155 0.006 270));
  --surface-1: light-dark(oklch(1 0 0), oklch(0.185 0.007 270));
  --fg: light-dark(oklch(0.2 0.012 270), oklch(0.95 0.004 270));
  --fg-muted: light-dark(oklch(0.45 0.014 270), oklch(0.72 0.01 270));
  --border: light-dark(oklch(0.2 0.01 270 / 0.13), oklch(1 0 0 / 0.1));
  --accent: light-dark(oklch(0.56 0.19 268), oklch(0.66 0.15 268));
}
/* explicit user choice overrides the OS */
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }

body { background: var(--bg); color: var(--fg); }

/* Local inversion: unregistered custom properties are substituted as tokens and
   light-dark() resolves on the element that USES them, so this band flips itself. */
.band-inverted { color-scheme: dark; background: var(--bg); color: var(--fg); }
.card-light-island { color-scheme: light; background: var(--surface-1); color: var(--fg); }

/* Images/gradients in light-dark(): Chrome 150, Firefox 150, Safari 27. Guard it. */
.hero { background-image: linear-gradient(oklch(0.97 0.02 270), transparent); }
@supports (background-image: light-dark(none, none)) {
  .hero {
    background-image: light-dark(
      linear-gradient(oklch(0.97 0.02 270), transparent),
      radial-gradient(60% 50% at 50% 0%, oklch(0.35 0.08 270 / 0.6), transparent)
    );
  }
}
```
**Tune:** none; the value is in fewer declarations and section-level inversion.  
**A11y/perf:** Do not register these tokens with `@property ... syntax: "<color>"`: registered properties compute at declaration time on `:root`, which kills local inversion. Form controls and scrollbars follow `color-scheme` automatically, a free win.

### 7. Multi-brand theming from one hue
**Looks like:** `<html data-brand="ocean">` swaps the whole product (accent family, tinted neutrals, focus ring, selection) for a client, a sub-brand, or a project page, from 2-3 numbers.  
**Use when / avoid when:** White-label SaaS, portfolios where each case study adopts the client's color, agency sites. Avoid tinting neutrals above chroma 0.02 for brands with warm-vs-cool conflicts (a red brand with 0.03 red neutrals turns the UI pink).  
**Stack:** CSS
```css
/* app/brands.css */
:root {
  --brand-h: 268;      /* hue */
  --brand-c: 0.19;     /* chroma of the solid color */
  --brand-l: 0.56;     /* lightness of the solid color */
  --tint: 0.006;       /* how much hue the neutrals carry */
}
[data-brand="ocean"]  { --brand-h: 230; --brand-c: 0.14; --brand-l: 0.55; --tint: 0.008; }
[data-brand="ember"]  { --brand-h: 40;  --brand-c: 0.18; --brand-l: 0.64; --tint: 0.006; }
[data-brand="moss"]   { --brand-h: 140; --brand-c: 0.12; --brand-l: 0.52; --tint: 0.01; }
[data-brand="citrus"] { --brand-h: 100; --brand-c: 0.18; --brand-l: 0.86; --tint: 0.008; }

:root, [data-brand] {
  --accent: oklch(var(--brand-l) var(--brand-c) var(--brand-h));
  --accent-hover: oklch(calc(var(--brand-l) - 0.05) var(--brand-c) var(--brand-h));
  --accent-subtle: oklch(0.955 calc(var(--brand-c) * 0.18) var(--brand-h));
  --accent-fg: oklch(min(0.48, calc(var(--brand-l) - 0.08)) calc(var(--brand-c) * 0.9) var(--brand-h));
  --focus: oklch(0.65 var(--brand-c) var(--brand-h));
  /* light brands (L > 0.72) need dark text on solid; others white */
  --accent-contrast: contrast-color(var(--accent));

  --bg: oklch(0.985 calc(var(--tint) * 0.6) var(--brand-h));
  --surface-2: oklch(0.965 var(--tint) var(--brand-h));
  --fg: oklch(0.2 calc(var(--tint) * 1.6) var(--brand-h));
  --fg-muted: oklch(0.46 calc(var(--tint) * 2) var(--brand-h));
}
```
**Tune:** `--tint` 0.004-0.012; for yellow/lime brands (`--brand-l` above 0.8) never use the solid as text color: `--accent-fg` clamps to L 0.48 for that reason.  
**A11y/perf:** Changing `data-brand` restyles everything in one style recalc; no JS color math. Re-run the contrast script (recipe 8) per brand in CI.

### 8. Contrast: WCAG 2 vs APCA, and testing
**Looks like:** Text that is readable in both modes, including the mid-gray secondary text and dark-mode accents where WCAG 2 math is least trustworthy.  
**Use when / avoid when:** Always. WCAG 2.x AA is still the legal baseline (ADA, EAA via EN 301 549); APCA is the better perceptual model and is what WCAG 3 drafts are built around, but it is not a legal standard. Pass WCAG 2 AA, then use APCA to fix what WCAG 2 misjudges (it overrates contrast of dark pairs, so dark-mode gray text that "passes" can be unreadable, and it underrates white on saturated orange/blue).  
**Stack:** reference table + dev-only TS (`apca-w3` 0.1.9, `culori` 4.0.2 optional)

| Content | WCAG 2.x AA | WCAG AAA | APCA Lc target |
|---|---|---|---|
| Body text, columns (16-18px/400) | 4.5:1 | 7:1 | Lc 90 preferred, Lc 75 minimum (needs 18px+/400) |
| Content text that is not body (labels, cards, 24px/400, 16px/700) | 4.5:1 | 7:1 | Lc 60 |
| Large headlines (36px/400, 24px/700 and up) | 3:1 (>=24px, or >=18.66px bold) | 4.5:1 | Lc 45 |
| Placeholder, disabled, copyright, meta | exempt when disabled | - | Lc 30 minimum for any text |
| Non-text UI: input borders, icons, focus rings, chart lines | 3:1 (SC 1.4.11) | - | Lc 45 for thin strokes, Lc 30 for large solid shapes |
| Decorative dividers | none | - | Lc 15 minimum if it must be discernible |

APCA polarity: positive Lc = dark text on light, negative Lc = light text on dark; compare absolute values. Radix guarantees its step 11 / 12 reach Lc 60 / Lc 90 on its step 2 background, a good bar for any scale.
```ts
// scripts/check-contrast.ts - run: node scripts/check-contrast.ts (Node 24 strips types)
// npm i -D apca-w3 culori @types/culori ; apca-w3 ships no types: add `declare module "apca-w3";` to a .d.ts for tsc
import { calcAPCA } from "apca-w3";
import { formatHex, parse, wcagContrast } from "culori";

type Pair = { name: string; fg: string; bg: string; minLc: number; minWcag: number };

const pairs: Pair[] = [
  { name: "body light", fg: "oklch(0.2 0.012 270)", bg: "oklch(0.985 0.003 270)", minLc: 90, minWcag: 4.5 },
  { name: "muted light", fg: "oklch(0.45 0.014 270)", bg: "oklch(0.985 0.003 270)", minLc: 60, minWcag: 4.5 },
  { name: "body dark", fg: "oklch(0.95 0.004 270)", bg: "oklch(0.155 0.006 270)", minLc: 90, minWcag: 4.5 },
  { name: "muted dark", fg: "oklch(0.72 0.01 270)", bg: "oklch(0.155 0.006 270)", minLc: 60, minWcag: 4.5 },
  { name: "on accent", fg: "oklch(0.99 0 0)", bg: "oklch(0.56 0.19 268)", minLc: 60, minWcag: 4.5 },
];

let failed = 0;
for (const p of pairs) {
  const fg = parse(p.fg);
  const bg = parse(p.bg);
  if (!fg || !bg) throw new Error(`Unparseable color in ${p.name}`);
  const lc = Math.abs(Number(calcAPCA(formatHex(fg), formatHex(bg))));
  const ratio = wcagContrast(fg, bg);
  const ok = lc >= p.minLc && ratio >= p.minWcag;
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${p.name.padEnd(12)} Lc ${lc.toFixed(1).padStart(5)}  WCAG ${ratio.toFixed(2)}:1`);
}
process.exit(failed ? 1 : 0);
```
**Tune:** thin fonts (weight 300 and below) need roughly +15 Lc; light text on dark reads thinner, so dark-mode body text wants L 0.9-0.95, not pure white (halation) and not 0.8 (too dim).  
**A11y/perf:** Test tools: Chrome DevTools color picker contrast line (AA/AAA curves), apcacontrast.com, Polypane, the Polychrom Figma plugin. Also test `@media (prefers-contrast: more)`: bump `--fg-muted` to `--fg`, borders to `--border-strong`, drop translucency. In `forced-colors: active` your colors are replaced; keep a real `border`/`outline` on controls (transparent is fine) so they still get outlines.

### 9. Text on images and gradients (scrims)
**Looks like:** White headline on a photo that stays readable at every crop, with a shadow falloff you do not notice (no visible "dark band" edge).  
**Use when / avoid when:** Any text over photography or video. Avoid the flat `bg-black/50` overlay over the whole image: it kills the photo. Avoid `mix-blend-mode: difference` for real copy (contrast is unpredictable; fine for a giant decorative word or a cursor).  
**Stack:** CSS
```css
/* app/scrim.css */
:root { --scrim: 0.14 0.02 270; } /* L C H of the shadow: tint it with the page hue, not pure black */

.media { position: relative; isolation: isolate; overflow: hidden; border-radius: var(--radius-lg, 1rem); }
.media > img, .media > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }

/* Eased scrim (13 stops, from CSS-Tricks "Easing Linear Gradients"): no hard edge */
.media::before {
  content: "";
  position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(
    to top,
    oklch(var(--scrim) / 0.8) 0%,
    oklch(var(--scrim) / 0.59) 19%,
    oklch(var(--scrim) / 0.433) 34%,
    oklch(var(--scrim) / 0.306) 47%,
    oklch(var(--scrim) / 0.222) 56.5%,
    oklch(var(--scrim) / 0.155) 65%,
    oklch(var(--scrim) / 0.101) 73%,
    oklch(var(--scrim) / 0.06) 80.2%,
    oklch(var(--scrim) / 0.034) 86.1%,
    oklch(var(--scrim) / 0.017) 91%,
    oklch(var(--scrim) / 0.006) 95.2%,
    oklch(var(--scrim) / 0.002) 98.2%,
    oklch(var(--scrim) / 0) 100%
  );
}
.media__caption { position: absolute; inset-inline: 0; bottom: 0; padding: clamp(1rem, 3vw, 2rem); color: oklch(0.98 0 0); }

/* Small labels on busy photos: soft halo, not a hard drop shadow */
.on-photo-label { text-shadow: 0 0 14px oklch(0 0 0 / 0.45), 0 1px 2px oklch(0 0 0 / 0.35); }

/* Progressive blur band (Apple Music / visionOS style): stacked backdrop blurs with masks */
.progressive-blur { position: absolute; inset-inline: 0; bottom: 0; height: 45%; pointer-events: none; z-index: -1; }
.progressive-blur > i { position: absolute; inset: 0; }
.progressive-blur > i:nth-child(1) { -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); mask-image: linear-gradient(to bottom, transparent, #000 25%, #000 50%, transparent 75%); }
.progressive-blur > i:nth-child(2) { -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); mask-image: linear-gradient(to bottom, transparent 25%, #000 50%, #000 75%, transparent); }
.progressive-blur > i:nth-child(3) { -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); mask-image: linear-gradient(to bottom, transparent 50%, #000 75%); }
.progressive-blur > i:nth-child(4) { -webkit-backdrop-filter: blur(28px); backdrop-filter: blur(28px); mask-image: linear-gradient(to bottom, transparent 75%, #000); }
```
```html
<figure class="media" style="aspect-ratio: 4 / 5">
  <img src="/work/atlas.jpg" alt="Atlas dashboard on a laptop" />
  <div class="progressive-blur" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <figcaption class="media__caption"><h3>Atlas</h3><p>Design system, 2026</p></figcaption>
</figure>
```
**Tune:** scrim max alpha 0.55 (bright photos) to 0.85 (text-heavy); scrim height 40-60% of the image; `--scrim` hue = page hue so the shadow blends into the next section. Progressive blur: 3-5 layers, max blur 20-32px.  
**A11y/perf:** Measure contrast at the brightest pixel under the text, not the average. Progressive blur is 4 backdrop-filter layers: fine for 1-3 cards in view, not for a 20-card grid (use the gradient scrim alone there). Never animate the blur values.

### 10. Dark mode done right
**Looks like:** Deep, calm, layered UI (Linear, Raycast, Vercel dashboard): surfaces get lighter as they rise, accents glow slightly instead of shouting, lines do the separation work, photos do not blind you.  
**Use when / avoid when:** Every dark theme. Pure `#000` only when intentional: OLED-luxury (fashion, automotive, film, product-on-black photography). Then keep text at L 0.9 (not white), make surfaces start at L 0.14+, and let borders carry structure.  
**Stack:** CSS
```css
/* app/dark-rules.css - apply inside .dark (tokens from recipe 5) */
.dark {
  /* 1. Elevation = lightness. Each layer +0.03 L, same hue, slightly more chroma */
  --bg: oklch(0.155 0.006 270);
  --surface-1: oklch(0.185 0.007 270);
  --surface-2: oklch(0.215 0.008 270);
  --surface-3: oklch(0.25 0.009 270);

  /* 2. Accent: raise L by ~0.1, cut chroma by 15-25% (saturated color vibrates on dark) */
  --accent: oklch(0.68 0.15 268);

  /* 3. Status colors: lighter, calmer */
  --danger: oklch(0.7 0.16 25);
  --success: oklch(0.74 0.13 150);
}

/* 4. Borders + top highlight instead of shadows (shadows are invisible on near-black) */
.dark .card {
  background: var(--surface-1);
  border: 1px solid oklch(1 0 0 / 0.07);
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.05),   /* light from above: the "lip" */
    0 0 0 1px oklch(0 0 0 / 0.4),        /* dark outer ring separates from bg */
    0 16px 32px -12px oklch(0 0 0 / 0.6);
}

/* 5. Images: dim slightly; opt out per image */
.dark img:not([data-no-dim]),
.dark video:not([data-no-dim]) { filter: brightness(0.88) contrast(1.06); }

/* 6. Text: off-white, and slightly lighter weight for long copy (light-on-dark reads bolder) */
.dark body { color: oklch(0.93 0.004 270); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.dark .prose { font-variation-settings: "wght" 380; letter-spacing: 0.005em; }

/* 7. Screenshots with white backgrounds: swap sources instead of filtering */
```
```html
<picture>
  <source srcset="/shots/editor-dark.avif" media="(prefers-color-scheme: dark)" />
  <img src="/shots/editor-light.avif" alt="Editor with inline AI suggestions" width="1600" height="1000" />
</picture>
```
```ts
// app/layout.tsx (excerpt) - browser chrome color per scheme (Next.js Viewport API)
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1013" },
  ],
};
```
**Tune:** bg L 0.13-0.18 (below 0.12 surfaces become indistinguishable; above 0.2 it reads as gray, not dark); surface step 0.025-0.035; border alpha 0.06-0.12; body text L 0.9-0.95. The `<picture>` media query follows the OS, not your toggle: if you have a toggle, render both images and hide one with `.dark` classes, or use `light-dark()` images where supported.  
**A11y/perf:** Re-check APCA for dark muted text (WCAG 2 overrates dark pairs). The `filter` on images is static and cheap; do not transition it on scroll. Keep a `prefers-contrast: more` block that raises borders to 0.2 alpha and text to L 0.97.

### 11. Theme switch without FOUC
**Looks like:** Reload in dark mode shows dark from the first paint; toggling swaps instantly without every component running its own staggered color transition.  
**Use when / avoid when:** Any site with a toggle. If the site has no toggle, skip JS entirely: `color-scheme: light dark` + `light-dark()` or `prefers-color-scheme` is flash-free by construction. The circle-reveal toggle animation lives in `page-transitions.md` (View Transitions).  
**Stack:** next-themes 0.4.6 (React) or a vanilla head script
```tsx
// app/providers.tsx
"use client";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
```
```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  // next-themes mutates <html> before hydration, so the attribute mismatch is expected
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```
```tsx
// components/theme-toggle.tsx
"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="inline-block size-9" aria-hidden="true" />; // same box, no layout shift
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-grid size-9 place-items-center rounded-full border border-border-subtle bg-surface-1 text-fg-muted hover:text-fg"
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
```
Vanilla (Astro, plain HTML, or no next-themes). Must be inline, blocking, in `<head>`, before any CSS paints:
```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var root = document.documentElement;
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```
**Tune:** `disableTransitionOnChange` (next-themes injects a temporary `* { transition: none }`) is what stops 200 elements animating colors at different speeds. If you want an animated switch, animate the whole page once with a view transition, not per-element `transition: background-color`.  
**A11y/perf:** The toggle must expose its state via label; a 3-way control (light/dark/system) is kinder than a 2-way one. `localStorage` throws in some privacy modes: the try/catch is not optional.

### 12. Accent strategy and brand color extraction
**Looks like:** A mostly neutral page where the accent appears in about 5-10% of pixels (primary CTA, links, focus ring, active state, one highlighted word or number) so every instance means "act here".  
**Use when / avoid when:** Default for product and portfolio sites. 60-30-10 is the budget: 60% neutral surfaces, 30% secondary (text, imagery, secondary surfaces), 10% accent. The slop tell is accent everywhere: gradient headings, colored icons in every card, colored section backgrounds, all competing. If the brand demands a loud color field, make it ONE full-bleed section, not sprinkles.  
**Stack:** CSS + TS (extraction)
```css
/* app/accent-budget.css */
.cta-primary { background: var(--accent); color: var(--accent-contrast); }
.cta-secondary { background: transparent; color: var(--fg); box-shadow: inset 0 0 0 1px var(--border-strong); }
a:where(:not([class])) { color: var(--accent-fg); text-decoration-color: oklch(from var(--accent-fg) l c h / 0.35); text-underline-offset: 0.2em; }
a:where(:not([class])):hover { text-decoration-color: currentColor; }
.hl { color: var(--accent-fg); } /* one word in a headline, one stat. Max one per viewport. */
.icon { color: var(--fg-muted); } /* icons stay neutral; accent only when active/selected */
[aria-current="page"] .icon { color: var(--accent-fg); }
```
```ts
// lib/color-extract.ts - brand hex -> OKLCH, and dominant vivid color from an image (client-side)
export interface Oklch { l: number; c: number; h: number }

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function hexToOklch(hex: string): Oklch {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((ch) => ch + ch).join("") : n;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Invalid hex color: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => srgbToLinear(parseInt(full.slice(i, i + 2), 16) / 255));
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.hypot(A, B);
  const H = C < 0.0001 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: +L.toFixed(3), c: +C.toFixed(3), h: +H.toFixed(1) };
}

/** Make any brand color usable as a UI accent: clamp L into button range, cap chroma. */
export function toUiAccent({ l, c, h }: Oklch): string {
  const L = Math.min(0.7, Math.max(0.5, l));
  const C = Math.min(0.2, Math.max(0.06, c));
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
}

/** Dominant vivid color of an image (logo, cover, project thumbnail). Same-origin or CORS-enabled images only. */
export async function extractAccent(src: string): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const buckets = new Map<number, { r: number; g: number; b: number; w: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const sat = max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
    if (max < 40 || (max > 245 && sat < 0.1)) continue; // skip near-black and near-white
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const w = 0.2 + sat * sat; // vivid pixels win over large gray areas
    const prev = buckets.get(key) ?? { r: 0, g: 0, b: 0, w: 0 };
    buckets.set(key, { r: prev.r + r * w, g: prev.g + g * w, b: prev.b + b * w, w: prev.w + w });
  }
  let best = { r: 128, g: 128, b: 128, w: 0 };
  for (const v of buckets.values()) if (v.w > best.w) best = v;
  if (best.w === 0) return "#808080";
  const hex = [best.r, best.g, best.b].map((ch) => Math.round(ch / best.w).toString(16).padStart(2, "0")).join("");
  return `#${hex}`;
}
```
Verified conversions from `hexToOklch`: Stripe-like `#635bff` -> `oklch(0.578 0.235 278.3)`, `#0a2540` -> `oklch(0.26 0.06 251.3)`, Apple-like `#0071e3` -> `oklch(0.563 0.193 256.2)`, `#f5f5f7` -> `oklch(0.971 0.003 286.4)`, `#1d1d1f` -> `oklch(0.232 0.004 286.1)`.  
**Tune:** extraction `size` 32-64 (bigger is slower, not better); the `sat * sat` weight decides "vivid wins" vs "area wins". At build time use `sharp(file).stats()` whose `dominant` field gives the same answer server-side.  
**A11y/perf:** Pipe extracted colors through `toUiAccent` then the ramp generator; raw logo colors (pure yellow, neon green) fail as text. Cross-origin images without CORS headers taint the canvas and `getImageData` throws: catch it and fall back to the default accent.

### 13. Gradients that do not look cheap
**Looks like:** Rich, luminous color transitions with no gray dead zone in the middle; soft light pooling from an edge instead of a diagonal purple-to-blue wash.  
**Use when / avoid when:** Hero atmospheres, section transitions, card glows, subtle headline fades. The slop pattern: `linear-gradient(135deg, #667eea, #764ba2)` full-bleed behind centered white Inter text, plus gradient text on every heading. Tasteful versions use analogous hues (span <= 60 deg), low alpha, light from one direction, and grain.  
**Stack:** CSS
```css
/* app/gradients.css */

/* 1. Always name the interpolation space. Legacy colors (hex/rgb/hsl) still interpolate in sRGB
      by default, which is where muddy gray middles come from. */
.g-sunset { background: linear-gradient(in oklch 100deg, oklch(0.68 0.19 35), oklch(0.8 0.16 80)); }
.g-calm   { background: linear-gradient(in oklab 180deg, oklch(0.97 0.02 250), oklch(0.93 0.04 290)); }

/* 2. Holographic / iridescent: longer hue path walks the whole wheel.
      Same start and end color + "longer hue" = full 360 deg sweep. */
.g-holo {
  background: linear-gradient(in oklch longer hue 90deg, oklch(0.86 0.12 20), oklch(0.86 0.12 20));
}

/* 3. Edge light (Linear / Vercel style dark hero): light pools from the top, not a diagonal wash */
.g-edge-light {
  background:
    radial-gradient(60% 45% at 50% -8%, oklch(0.62 0.16 268 / 0.42), transparent 70%),
    radial-gradient(35% 30% at 88% 6%, oklch(0.7 0.12 210 / 0.18), transparent 70%),
    var(--bg);
}

/* 4. CSS mesh: 4 radial blobs on a tinted base. Animated/organic mesh: see backgrounds-svg-canvas.md */
.g-mesh {
  background-color: oklch(0.96 0.02 80);
  background-image:
    radial-gradient(at 12% 18%, oklch(0.86 0.1 40) 0, transparent 50%),
    radial-gradient(at 88% 12%, oklch(0.86 0.09 330) 0, transparent 55%),
    radial-gradient(at 72% 86%, oklch(0.85 0.09 250) 0, transparent 50%),
    radial-gradient(at 18% 92%, oklch(0.92 0.1 100) 0, transparent 45%);
}

/* 5. Eased fade to the page color (section seams): extra stops = no visible edge */
.g-fade-bottom {
  background: linear-gradient(
    to bottom,
    oklch(from var(--bg) l c h / 0) 0%,
    oklch(from var(--bg) l c h / 0.1) 20%,
    oklch(from var(--bg) l c h / 0.35) 45%,
    oklch(from var(--bg) l c h / 0.7) 70%,
    oklch(from var(--bg) l c h / 0.92) 88%,
    var(--bg) 100%
  );
}

/* 6. Restrained gradient text: fade fg -> muted top to bottom (the tasteful headline treatment) */
.text-fade {
  background: linear-gradient(in oklab 180deg, var(--fg) 35%, oklch(from var(--fg) l c h / 0.55));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 7. Conic spotlight for a card or logo tile */
.g-conic {
  background: conic-gradient(from 210deg at 50% 60%, in oklch, oklch(0.3 0.05 268), oklch(0.45 0.12 300), oklch(0.3 0.05 268));
}
```
**Tune:** alpha of edge light 0.2-0.45 (dark) / 0.12-0.25 (light); ellipse size 40-70% of the box; hue span 20-60 deg for "expensive", 120+ deg only for deliberately playful brands; always add grain (recipe 14) to large dark gradients.  
**A11y/perf:** Static gradients are free. Animating `background-position` of a huge gradient repaints every frame: animate a transformed pseudo-element instead, or use a shader. `.text-fade` must keep a real `color` fallback for forced-colors: add `@media (forced-colors: active) { .text-fade { color: CanvasText; background: none; } }`.

### 14. Banding fixes: dithering with noise
**Looks like:** Smooth dark gradients with no visible stair-steps (banding shows most in dark, low-chroma, large gradients on 8-bit panels).  
**Use when / avoid when:** Any gradient over ~600px wide in the dark third of the lightness range. Not needed for small UI gradients.  
**Stack:** CSS (inline SVG noise, under 1 kb)
```css
/* app/noise.css */
:root {
  /* fractalNoise, desaturated (feColorMatrix saturate 0) so grain does not tint the image */
  --noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.dither { position: relative; isolation: isolate; }
.dither::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: var(--noise);
  background-size: 180px 180px;
  opacity: 0.045;          /* dithering: barely visible */
  mix-blend-mode: overlay; /* soft-light for gentler, normal for visible grain */
}
```
**Tune:** dither opacity 0.03-0.05; visible grain 0.06-0.12 (recipe 22); `baseFrequency` 0.65-0.9 (higher = finer). Also fix the gradient itself first: interpolate `in oklab`, and add 2-3 extra stops in the darkest third where banding lives.  
**A11y/perf:** One static tiled background on a pseudo-element: negligible. Do not put `filter: url(#noise)` on a large element (runs the turbulence filter on every repaint); rasterized tiles are the cheap path. Animated grain belongs to `backgrounds-svg-canvas.md` and should stop under reduced motion.

### 15. Glassmorphism done right
**Looks like:** A floating nav, dock, toast, or popover that picks up the color of whatever scrolls beneath it, with a crisp light rim and legible text (Apple Control Center, Vercel/Linear nav bars, Raycast window).  
**Use when / avoid when:** Only for layers that float above changing content (nav, toolbars, menus, modals, media controls). Glass on a flat solid background is invisible and just looks gray. Apple's own rule: do not use it for the content layer; a grid of glass cards over a purple blob background is the 2021 Dribbble cliche.  
**Stack:** CSS (+ Tailwind variant)
```css
/* app/glass.css */
.glass {
  position: relative;
  background: oklch(from var(--surface-1) l c h / 0.64);
  /* literal values in the -webkit- line: Safari has had bugs with var() inside it */
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  backdrop-filter: blur(16px) saturate(170%);
  border: 1px solid oklch(0.2 0.01 270 / 0.08);
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.7),        /* top rim catches the light */
    0 1px 2px oklch(0.2 0.01 270 / 0.06),
    0 12px 32px -12px oklch(0.2 0.01 270 / 0.22);
}
.dark .glass {
  background: oklch(from var(--surface-1) l c h / 0.58);
  border-color: oklch(1 0 0 / 0.1);
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.12),
    0 0 0 1px oklch(0 0 0 / 0.35),
    0 16px 40px -12px oklch(0 0 0 / 0.6);
}
/* optional grain inside the glass hides blur artifacts and adds "material" */
.glass::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background-image: var(--noise); background-size: 180px; opacity: 0.035; mix-blend-mode: overlay;
}

/* No backdrop-filter: go opaque rather than unreadable */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--surface-1); }
}
/* User asked for less transparency (Chromium 119+ reports it) or more contrast */
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .glass { background: var(--surface-1); -webkit-backdrop-filter: none; backdrop-filter: none; border-color: var(--border-strong); }
}
```
```tsx
// components/site-nav.tsx - floating glass pill (Tailwind 4 utilities: backdrop-blur-lg = 16px)
export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-4">
      <nav className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface-1/60 p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_12px_32px_-12px_rgb(0_0_0/0.35)] backdrop-blur-lg backdrop-saturate-150">
        <a href="#work" className="rounded-full px-4 py-2 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg">Work</a>
        <a href="#about" className="rounded-full px-4 py-2 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg">About</a>
        <a href="#contact" className="rounded-full bg-fg px-4 py-2 text-sm text-bg">Contact</a>
      </nav>
    </header>
  );
}
```
**Tune:** blur 12-24px (below 8px text behind stays readable and fights yours; above 30px looks like fog); saturate 140-180% (keeps colors alive through the blur, the Apple trick); tint alpha 0.55-0.75 behind text, 0.3-0.45 for chrome without text; rim highlight alpha 0.1-0.15 dark / 0.6-0.8 light.  
**A11y/perf:** Cost scales with blurred area x radius and re-runs whenever content underneath moves. Budget: 1-3 visible glass layers, none full-viewport on mobile (use a solid 80% overlay behind modals instead). Never animate `backdrop-filter` values; fade the element's opacity. Test legibility over the busiest content that can scroll under it.

### 16. Liquid Glass approximations (tiered)
**Looks like:** Apple's 2025 Liquid Glass: a thick, clear lens with bright specular rims where the background bends and magnifies at the edges, content stays sharp in the middle.  
**Use when / avoid when:** One or two hero controls: a floating nav pill, a dock, a media control bar, a toggle. Apple HIG: Liquid Glass is for the navigation/control layer, never the content layer; use the clear variant only over visually rich media and add a ~35% dark dimming layer when the content beneath is bright. As a full-page aesthetic it is already a 2025-26 cliche.  
**Stack:** Tier 1 CSS (all browsers). Tier 2 SVG displacement via `backdrop-filter: url()` (Chromium only; Safari/Firefox ignore SVG filters in backdrop-filter, confirmed by the open W3C svgwg issue #1142). True cross-browser refraction needs WebGL: see `webgl-shaders-3d.md`.
```css
/* app/liquid-glass.css - Tier 1: frost + thick rim + sheen, works everywhere */
.lg {
  position: relative;
  isolation: isolate;
  border-radius: 999px;
  background: oklch(1 0 0 / 0.08);
  -webkit-backdrop-filter: blur(8px) saturate(180%) brightness(1.08);
  backdrop-filter: blur(8px) saturate(180%) brightness(1.08);
  box-shadow:
    0 8px 32px oklch(0 0 0 / 0.22),
    inset 0 1px 1px oklch(1 0 0 / 0.55),     /* top rim */
    inset 0 -1px 1px oklch(1 0 0 / 0.28),    /* bottom rim (light exits through the glass) */
    inset 1px 0 1px oklch(1 0 0 / 0.18),
    inset -1px 0 1px oklch(1 0 0 / 0.18);
}
.lg::before { /* specular sheen */
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(135deg, oklch(1 0 0 / 0.42), oklch(1 0 0 / 0.07) 28%, transparent 58%);
  mix-blend-mode: screen;
}
.lg--dim::after { /* HIG: dimming layer for clear glass over bright content */
  content: ""; position: absolute; inset: 0; z-index: -2; border-radius: inherit; background: oklch(0 0 0 / 0.35);
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .lg { background: oklch(0.2 0.01 270 / 0.92); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
```
```ts
// lib/lens-map.ts - Tier 2 displacement map for a rounded-rect glass bezel (kube.io approach, simplified)
// R/G encode the sampling offset: 128 = none, 0/255 = -/+ scale/2 px. Offsets point inward, so the rim magnifies.
export function createLensMap(width: number, height: number, radius: number, bezel: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(width, height);
  const r = Math.min(radius, width / 2, height / 2);
  const hx = width / 2 - r;
  const hy = height / 2 - r;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5 - width / 2;
      const py = y + 0.5 - height / 2;
      const qx = Math.abs(px) - hx;
      const qy = Math.abs(py) - hy;
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const depth = -(outside + Math.min(Math.max(qx, qy), 0) - r); // px inward from the edge
      let dx = 0;
      let dy = 0;
      if (depth > 0 && depth < bezel) {
        let nx = 0;
        let ny = 0;
        if (qx > 0 && qy > 0) {
          nx = (Math.sign(px) * qx) / outside;
          ny = (Math.sign(py) * qy) / outside;
        } else if (qx > qy) nx = Math.sign(px);
        else ny = Math.sign(py);
        // cubic falloff approximates the slope of a convex-squircle bezel: strong at the rim, 0 on the flat top
        const strength = (1 - depth / bezel) ** 3;
        dx = -nx * strength;
        dy = -ny * strength;
      }
      const i = (y * width + x) * 4;
      image.data[i] = Math.round(128 + dx * 127);
      image.data[i + 1] = Math.round(128 + dy * 127);
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
```
```tsx
// components/liquid-glass.tsx
"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createLensMap } from "@/lib/lens-map";

type UAData = { brands?: { brand: string }[] };
// @supports cannot detect this (Safari/Firefox parse url() but render nothing), so sniff Chromium.
const isChromium = () =>
  typeof navigator !== "undefined" &&
  Boolean((navigator as Navigator & { userAgentData?: UAData }).userAgentData?.brands?.some((b) => b.brand === "Chromium"));

interface Props { children: ReactNode; radius?: number; bezel?: number; scale?: number; className?: string }

export function LiquidGlass({ children, radius = 28, bezel = 16, scale = 36, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const filterId = `lg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isChromium()) return;
    if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
    const build = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (w > 0 && h > 0) setMap({ url: createLensMap(w, h, radius, bezel), w, h });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius, bezel]);

  return (
    <div
      ref={ref}
      className={`lg ${className}`}
      style={{
        borderRadius: radius,
        ...(map ? { backdropFilter: `url(#${filterId}) blur(2px) saturate(170%) brightness(1.06)` } : {}),
      }}
    >
      {map && (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={map.url} x="0" y="0" width={map.w} height={map.h} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}
```
**Tune:** `bezel` 12-24px (the refracting rim width), `scale` 20-60 (displacement strength; above 60 edges tear), blur with refraction 1-3px (refraction needs a sharp backdrop to be visible), `radius` must match the element's real radius or the rim bends in the wrong place. Put a busy, high-contrast background under it (photo, text, stripes) or the lens is invisible.  
**A11y/perf:** `colorInterpolationFilters="sRGB"` is mandatory: the default linearRGB shifts 128 away from "no offset" and the whole panel drifts. Map regeneration is O(w x h): keep lenses under ~600x200 px, and do not resize them every frame (animate `transform: scale()` instead of width). The SVG filter re-runs on every scroll frame under the element: 1-2 lenses per page. Reduced transparency: Tier 2 is skipped and Tier 1 goes opaque.

### 17. Layered, tinted shadows and an elevation scale
**Looks like:** Cards and popovers that sit on the page like paper under soft daylight: tight contact shadow plus a wide, faint ambient one, tinted with the background hue instead of gray smog (Josh W. Comeau's "Designing Beautiful Shadows").  
**Use when / avoid when:** Light themes, product UIs, floating media. Rules: one light source for the whole page (same x:y offset ratio everywhere), more elevation = bigger offset + bigger blur + lower opacity, shadow color = bg hue with lower lightness. Avoid Tailwind's default `shadow-lg` in pure black on a tinted page (it reads dirty) and avoid shadows on every card in a grid (use borders; save shadows for things that float).  
**Stack:** CSS (tokens generated by joshwcomeau.com/shadow-palette; values verbatim from a generated set)
```css
/* app/shadows.css */
:root {
  --shadow-color: 220deg 5% 68%; /* H S L channels of the surface the shadow falls on, darker + less saturated */
  --shadow-elevation-low:
    0.1px 0.3px 0.3px hsl(var(--shadow-color) / 0.31),
    0.1px 0.5px 0.5px -1.5px hsl(var(--shadow-color) / 0.27),
    0.3px 1.2px 1.3px -3px hsl(var(--shadow-color) / 0.24);
  --shadow-elevation-medium:
    0.1px 0.3px 0.3px hsl(var(--shadow-color) / 0.32),
    0.2px 0.9px 1px -1px hsl(var(--shadow-color) / 0.29),
    0.6px 2.4px 2.6px -2px hsl(var(--shadow-color) / 0.27),
    1.6px 5.9px 6.4px -3px hsl(var(--shadow-color) / 0.24);
  --shadow-elevation-high:
    0.1px 0.3px 0.3px hsl(var(--shadow-color) / 0.3),
    0.4px 1.3px 1.4px -0.4px hsl(var(--shadow-color) / 0.29),
    0.7px 2.4px 2.6px -0.9px hsl(var(--shadow-color) / 0.27),
    1.1px 4.1px 4.5px -1.3px hsl(var(--shadow-color) / 0.26),
    1.8px 6.8px 7.4px -1.7px hsl(var(--shadow-color) / 0.25),
    2.9px 10.9px 11.8px -2.1px hsl(var(--shadow-color) / 0.24),
    4.5px 16.9px 18.4px -2.6px hsl(var(--shadow-color) / 0.22),
    6.8px 25.2px 27.4px -3px hsl(var(--shadow-color) / 0.21);
}
/* On a colored section, re-tint: the shadow of a blue surface is a darker, grayer blue */
.section-blue { --shadow-color: 220deg 45% 38%; }
/* Dark: shadows need far more opacity and must be paired with a rim (recipe 10) */
.dark { --shadow-color: 250deg 30% 2%; }

/* Elevation scale: map meaning, not sizes */
.e0 { box-shadow: none; }                                  /* in-flow content: use borders */
.e1 { box-shadow: var(--shadow-elevation-low); }           /* resting cards, inputs */
.e2 { box-shadow: var(--shadow-elevation-medium); }        /* hover-lifted cards, dropdowns, sticky bars */
.e3 { box-shadow: var(--shadow-elevation-high); }          /* dialogs, popovers, dragged items */

/* Hover lift: fade a pre-rendered shadow on a pseudo-element (cheap); do not transition box-shadow on 30 cards */
.lift { position: relative; transition: transform var(--dur-base, 200ms) var(--ease-out, ease-out); }
.lift::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: var(--shadow-elevation-high); opacity: 0;
  transition: opacity var(--dur-base, 200ms) var(--ease-out, ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .lift:hover { transform: translateY(-2px); }
  .lift:hover::after { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { .lift:hover { transform: none; } }
```
```css
/* app/globals.css (excerpt) - expose as Tailwind utilities: shadow-e1 / shadow-e2 / shadow-e3 */
@theme inline {
  --shadow-e1: var(--shadow-elevation-low);
  --shadow-e2: var(--shadow-elevation-medium);
  --shadow-e3: var(--shadow-elevation-high);
}
```
**Tune:** `--shadow-color` lightness 30-70% (lighter bg = lighter shadow color); x offset about a quarter to half of y (light from above, slightly left) or 0 for "overhead" light; for large floating media add one extra wide ambient layer `0 40px 80px -20px hsl(var(--shadow-color) / 0.35)`.  
**A11y/perf:** Stacked shadows are cheap when static. Transitioning `box-shadow` repaints each frame; the pseudo-element opacity swap above is the standard fix. `filter: drop-shadow()` follows alpha shapes (PNG cutouts, SVG icons) and is the only option for non-rectangular silhouettes.

### 18. Inner shadows, bevels, tactile controls
**Looks like:** Buttons and toggles with a lit top edge, a slightly darker bottom lip, a crisp 1px ring and a real "press" (Raycast, Linear, Vercel primary buttons; the "skeuo-lite" 2024-26 look).  
**Use when / avoid when:** Primary buttons, segmented controls, keycaps, toggles, dark dashboards. Avoid on body cards or every element: tactility signals "this is pressable".  
**Stack:** CSS
```css
/* app/tactile.css */
.btn-tactile {
  --btn: var(--accent);
  position: relative;
  padding: 0.625rem 1rem;
  border-radius: 0.625rem;
  color: var(--accent-contrast);
  background: linear-gradient(to bottom, oklch(from var(--btn) calc(l + 0.05) c h), var(--btn));
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.28),                          /* top bevel highlight */
    inset 0 -1px 0 oklch(0 0 0 / 0.16),                         /* bottom inner shade */
    0 0 0 1px oklch(from var(--btn) calc(l - 0.14) c h),        /* crisp outer ring, darker than fill */
    0 1px 2px oklch(0 0 0 / 0.18),
    0 4px 10px -4px oklch(from var(--btn) calc(l - 0.2) c h / 0.5); /* colored ambient shadow */
  transition: transform 80ms var(--ease-out, ease-out), box-shadow 80ms var(--ease-out, ease-out);
}
.btn-tactile:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 1px 2px oklch(0 0 0 / 0.25),                        /* pressed: the shadow moves inside */
    0 0 0 1px oklch(from var(--btn) calc(l - 0.14) c h);
}

/* Neutral dark keycap / secondary button */
.keycap {
  background: linear-gradient(to bottom, oklch(0.27 0.008 270), oklch(0.22 0.008 270));
  color: var(--fg);
  border-radius: 0.5rem;
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.09),
    inset 0 -2px 0 oklch(0 0 0 / 0.35),                         /* thicker bottom = key depth */
    0 0 0 1px oklch(0 0 0 / 0.5),
    0 2px 4px oklch(0 0 0 / 0.3);
}

/* Inset well: search fields, toggle tracks, code blocks */
.well {
  background: var(--surface-2);
  box-shadow: inset 0 1px 2px oklch(0.2 0.01 270 / 0.08), inset 0 0 0 1px var(--border-subtle);
  border-radius: 0.625rem;
}
@media (prefers-reduced-motion: reduce) { .btn-tactile:active { transform: none; } }
```
**Tune:** highlight alpha 0.2-0.35 on colored fills, 0.06-0.1 on dark neutrals; gradient lightness delta 0.03-0.06 (more looks like 2010 glossy); press travel 1px.  
**A11y/perf:** Tactile styling never replaces a focus style: keep the `:focus-visible` outline outside the ring (`outline-offset: 2px`).

### 19. Hairline borders
**Looks like:** Structure you feel rather than see (Linear's refresh principle "structure should be felt not seen"): 1px lines at 6-12% alpha, image edges defined against same-color backgrounds, device-pixel-thin dividers on retina.  
**Use when / avoid when:** Separating surfaces of similar lightness, table rows, card edges in dark mode, screenshots on white. Avoid solid gray borders (`#e5e7eb`) on tinted surfaces: alpha borders adapt to whatever is below.  
**Stack:** CSS
```css
/* app/hairlines.css */
:root { --hairline: oklch(0.2 0.01 270 / 0.1); }
.dark { --hairline: oklch(1 0 0 / 0.08); }

.card { border: 1px solid var(--hairline); }

/* Layout-free ring: no box-size change, stacks with other shadows, follows border-radius */
.ring-hairline { box-shadow: inset 0 0 0 1px var(--hairline); }

/* Device-pixel lines on HiDPI (1 physical pixel at 2x) */
.divider { border-top: 1px solid var(--hairline); }
@media (min-resolution: 2dppx) {
  .divider { border-top-width: 0.5px; }
}

/* Image edge definition (screenshots, product shots on a matching bg) */
.shot { border-radius: 0.75rem; outline: 1px solid oklch(0 0 0 / 0.08); outline-offset: -1px; }
.dark .shot { outline-color: oklch(1 0 0 / 0.1); }

/* Top-lit edge for dark surfaces: brighter line on top only */
.lit-edge { box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.06), inset 0 0 0 1px oklch(1 0 0 / 0.04); }

/* Section divider that fades at the ends */
.rule-fade { height: 1px; border: 0; background: linear-gradient(90deg, transparent, var(--hairline) 20%, var(--hairline) 80%, transparent); }
```
**Tune:** alpha 0.06-0.08 subtle, 0.1-0.14 default, 0.2-0.25 strong/interactive; dark mode needs about 60-80% of the light-mode alpha because white-on-dark reads stronger.  
**A11y/perf:** Hairlines are decorative; interactive boundaries (inputs, checkboxes) need 3:1 against adjacent colors (WCAG 1.4.11), so inputs use `--border-strong`, not the hairline.

### 20. Gradient borders
**Looks like:** A 1px edge that catches light from one corner, or a slowly rotating glow line around a featured card (Linear/Vercel "beam" borders, Raycast extension cards).  
**Use when / avoid when:** One featured element per view (pricing tier, hero CTA, active card). Rotating borders on every card is a clear AI-template tell.  
**Stack:** CSS
```css
/* app/gradient-borders.css */

/* A. Opaque fill: two backgrounds, padding-box and border-box. Simplest, no pseudo-element. */
.gb-solid {
  border: 1px solid transparent;
  border-radius: 1rem;
  background:
    linear-gradient(var(--surface-1), var(--surface-1)) padding-box,
    linear-gradient(140deg, oklch(1 0 0 / 0.35), oklch(1 0 0 / 0.04) 40%, oklch(from var(--accent) l c h / 0.5)) border-box;
}

/* B. Transparent/glass fill: mask-composite cuts the middle out of a gradient layer */
.gb-ring { position: relative; border-radius: 1rem; }
.gb-ring::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px; /* border width */
  border-radius: inherit;
  background: linear-gradient(140deg, oklch(1 0 0 / 0.5), transparent 45%, oklch(from var(--accent) l c h / 0.6));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
}

/* C. Rotating beam with a registered (animatable) angle */
@property --beam-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.gb-beam {
  border: 1px solid transparent;
  border-radius: 1rem;
  background:
    linear-gradient(var(--surface-1), var(--surface-1)) padding-box,
    conic-gradient(from var(--beam-angle), transparent 0 70%, oklch(from var(--accent) l c h / 0.9) 85%, transparent 100%) border-box,
    linear-gradient(var(--hairline), var(--hairline)) border-box;
  animation: beam-spin 6s linear infinite;
}
@keyframes beam-spin { to { --beam-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .gb-beam { animation: none; --beam-angle: 220deg; } }
```
**Tune:** border gradient alpha 0.3-0.5 at the lit corner; beam arc 10-20% of the circle; beam period 4-8s (faster feels like a loading spinner).  
**A11y/perf:** Animating a registered custom property repaints only that element's background: fine for 1-3 elements, not a 30-card grid. Cursor-following glow borders live in `interactions.md`.

### 21. Radius system, nested radius rule, squircles
**Looks like:** Corners that feel related: concentric curves when a card holds an image or button (outer radius = inner radius + padding), one consistent family from chips to panels.  
**Use when / avoid when:** Always tokenize radius. Pick a personality: sharp 0-4px (editorial, brutalist, finance), medium 8-14px (product UI), soft 20-32px (consumer, Apple-like). Mixing personalities (sharp cards, pill buttons, 24px images) is what makes layouts look assembled from kits.  
**Stack:** CSS
```css
/* app/radius.css */
:root {
  --r-xs: 4px; --r-sm: 6px; --r-md: 10px; --r-lg: 14px; --r-xl: 20px; --r-2xl: 28px; --r-pill: 9999px;
}

/* Nested rule: inner = outer - padding (clamped so it never collapses to an odd 0) */
.frame {
  --frame-r: var(--r-2xl);
  --frame-pad: 8px;
  border-radius: var(--frame-r);
  padding: var(--frame-pad);
  background: var(--surface-2);
}
.frame > img, .frame > .inner {
  border-radius: max(var(--r-xs), calc(var(--frame-r) - var(--frame-pad)));
}

/* Squircle (continuous corner) where supported: Chromium 139+. Squircles read smaller, so bump the radius. */
.squircle { border-radius: var(--r-xl); }
@supports (corner-shape: squircle) {
  .squircle { corner-shape: squircle; border-radius: calc(var(--r-xl) * 1.6); }
}

/* Optical: pills with a leading icon need less padding on the icon side */
.pill-icon { border-radius: var(--r-pill); padding: 0.5rem 1rem 0.5rem 0.75rem; }
```
**Tune:** if padding exceeds the outer radius, make the inner corner small (4-6px), not 0; squircle multiplier 1.4-1.8 to match the visual size of a round corner.  
**A11y/perf:** In Chromium `corner-shape` also shapes borders, shadows, outlines, overflow and backdrop-filter; everywhere else the `border-radius` fallback shows, so design the fallback as the real design.

### 22. Grain and noise surfaces
**Looks like:** Printed paper, risograph, film: surfaces with a fine tooth that makes flat color feel physical (Arc, many 2024-26 studio and portfolio sites).  
**Use when / avoid when:** Editorial, craft, music, fashion, "human" brands; large flat color fields and gradients. Avoid on dense data UIs and small-text areas (noise lowers perceived contrast). Animated TV-static grain over the whole site is a strong flavor: see `backgrounds-svg-canvas.md`, use it only when the brand is loud.  
**Stack:** CSS (reuses `--noise` from recipe 14)
```css
/* app/grain.css */
.grain-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  background-image: var(--noise);
  background-size: 200px 200px;
  opacity: 0.07;
  mix-blend-mode: multiply; /* light pages darken the specks; dark pages use overlay */
}
.dark .grain-page::before { mix-blend-mode: overlay; opacity: 0.09; }

/* Paper card: warm base + grain + soft inner vignette */
.paper {
  background-color: oklch(0.965 0.012 85);
  background-image:
    radial-gradient(120% 90% at 50% 40%, transparent 60%, oklch(0.5 0.03 70 / 0.08)),
    var(--noise);
  background-size: auto, 200px 200px;
  background-blend-mode: normal, multiply;
}
```
**Tune:** page grain opacity 0.04-0.1; SVG `baseFrequency` 0.6 (coarse riso) to 0.9 (fine film); tile 150-250px.  
**A11y/perf:** A fixed full-screen blended pseudo-element forces compositing of everything under it on some GPUs; if low-end Android scroll janks, switch to `mix-blend-mode: normal` with a gray noise at 0.04 opacity, or apply grain per section.

### 23. Image treatment: duotone, grading, blend modes
**Looks like:** Mismatched photos (team, clients, archive) unified into one brand-colored family; hover blooms from duotone to full color (Spotify-era duotone, editorial grayscale grids, agency team pages).  
**Use when / avoid when:** Team grids, client logos (monochrome them), index/archive pages, imagery behind text. Avoid duotoning product screenshots (people need to see the real UI).  
**Stack:** SVG filter (exact) or CSS blend (simple)
```html
<!-- components/duotone-filter.html: include once near the top of <body> -->
<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <filter id="duotone-brand" color-interpolation-filters="sRGB">
    <!-- 1. luminance to gray -->
    <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
    <!-- 2. map shadows -> highlights per channel: tableValues="shadow highlight" (0..1 sRGB) -->
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0.08 0.98" />
      <feFuncG type="table" tableValues="0.07 0.86" />
      <feFuncB type="table" tableValues="0.22 0.62" />
    </feComponentTransfer>
  </filter>
</svg>
```
```css
/* app/image-treatment.css */
.duotone { filter: url(#duotone-brand); transition: filter var(--dur-slow, 400ms) var(--ease-out, ease-out); }
@media (hover: hover) and (pointer: fine) {
  .duotone:hover { filter: none; }
}

/* CSS-only duotone: grayscale image screened over a dark color, then multiplied by a light color */
.duotone-css { position: relative; background: oklch(0.25 0.08 280); isolation: isolate; }
.duotone-css img { display: block; width: 100%; filter: grayscale(1) contrast(1.1); mix-blend-mode: screen; }
.duotone-css::after { content: ""; position: absolute; inset: 0; background: oklch(0.88 0.12 85); mix-blend-mode: multiply; pointer-events: none; }

/* Color grade: pull shadows toward the brand without killing the photo */
.grade { position: relative; isolation: isolate; }
.grade::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(160deg, oklch(0.55 0.15 268 / 0.35), oklch(0.7 0.14 40 / 0.2));
  mix-blend-mode: soft-light; /* "color" recolors fully; "overlay" is punchier */
}

/* Client logos: any colored logo -> uniform muted monochrome */
.logo-mono { filter: grayscale(1) brightness(0) opacity(0.55); }
.dark .logo-mono { filter: grayscale(1) brightness(0) invert(1) opacity(0.6); }
```
**Tune:** duotone shadow L 0.1-0.25, highlight L 0.85-0.97 (tableValues are 0-1 sRGB channels; get them from oklch.com); grade overlay alpha 0.15-0.4.  
**A11y/perf:** `filter` on a handful of images is fine and a hover transition on one image at a time is fine; never scrub filters on scroll. Alt text describes the subject, not the treatment.

### 24. Reference token sets (brand-inspired aesthetics)
**Looks like:** Starting token blocks capturing the public aesthetic of well-known product sites, as tokens only (never copy logos, copy text or proprietary fonts; use open alternatives).  
**Use when / avoid when:** When a brief says "like Linear" or "Vercel vibes". Change at least the accent hue and the display font so the result is yours. Public brand hex values were converted with recipe 12's `hexToOklch`.  
**Stack:** CSS (same variable names as recipe 5)
```css
/* app/presets.css - one block per aesthetic */

/* Linear-like: near-black with a whisper of blue, desaturated indigo accent, soft lines, Inter Display */
[data-preset="linear"] {
  color-scheme: dark;
  --bg: oklch(0.14 0.003 250);          /* ~#08090a family */
  --surface-1: oklch(0.175 0.004 265); --surface-2: oklch(0.205 0.005 265); --surface-3: oklch(0.24 0.006 265);
  --border-subtle: oklch(1 0 0 / 0.06); --border: oklch(1 0 0 / 0.09);
  --fg: oklch(0.96 0.003 265); --fg-muted: oklch(0.7 0.008 265); --fg-faint: oklch(0.54 0.008 265);
  --accent: oklch(0.57 0.16 275);       /* ~#5e6ad2 */
  --radius: 0.5rem;
  --font-display: "Inter Display", "Inter", system-ui, sans-serif; /* tracking about -0.022em at 48px+ */
}

/* Vercel-like: pure black/white, the gray scale does all the work, blue only for links/focus, Geist */
[data-preset="vercel"] {
  color-scheme: dark;
  --bg: oklch(0 0 0); --surface-1: oklch(0.145 0 0); --surface-2: oklch(0.18 0 0); --surface-3: oklch(0.22 0 0);
  --border-subtle: oklch(1 0 0 / 0.08); --border: oklch(1 0 0 / 0.14); --border-strong: oklch(1 0 0 / 0.24);
  --fg: oklch(0.985 0 0); --fg-muted: oklch(0.72 0 0); --fg-faint: oklch(0.55 0 0);
  --accent: oklch(0.573 0.214 258);     /* ~#0070f3 */
  --radius: 0.5rem;
  --font-sans: "Geist", system-ui, sans-serif; --font-mono: "Geist Mono", ui-monospace, monospace;
}

/* Stripe-like: white surfaces, deep navy ink, blurple accent, cyan-to-blurple mesh in the top third */
[data-preset="stripe"] {
  color-scheme: light;
  --bg: oklch(0.99 0.003 250); --surface-1: oklch(1 0 0); --surface-2: oklch(0.975 0.006 250);
  --fg: oklch(0.26 0.06 251);           /* ~#0a2540: navy ink, not black */
  --fg-muted: oklch(0.47 0.04 255);
  --accent: oklch(0.578 0.235 278);     /* ~#635bff */
  --accent-2: oklch(0.804 0.146 219.5); /* ~#00d4ff, gradient partner only */
  --shadow-color: 251deg 45% 30%;       /* navy-tinted, large soft shadows */
  --radius: 0.5rem;
}

/* Apple-like: light gray canvas, near-black text, one link blue, big radii, photography carries the color */
[data-preset="apple"] {
  color-scheme: light;
  --bg: oklch(0.971 0.003 286);         /* ~#f5f5f7 */
  --surface-1: oklch(1 0 0);
  --fg: oklch(0.232 0.004 286);         /* ~#1d1d1f */
  --fg-muted: oklch(0.5 0.006 286);
  --accent: oklch(0.563 0.193 256);     /* ~#0071e3 */
  --radius: 1.375rem;                   /* 18-28px tiles */
  --shadow-color: 286deg 4% 60%;
}

/* Raycast-like: very dark warm neutral, coral-red accent, tactile controls (recipe 18), glow under the hero */
[data-preset="raycast"] {
  color-scheme: dark;
  --bg: oklch(0.13 0.004 20); --surface-1: oklch(0.17 0.005 20); --surface-2: oklch(0.21 0.006 20);
  --border: oklch(1 0 0 / 0.09);
  --fg: oklch(0.96 0.004 20); --fg-muted: oklch(0.68 0.01 20);
  --accent: oklch(0.7 0.191 23);        /* ~#ff6363 */
  --glow: oklch(0.62 0.2 25 / 0.35);    /* radial-gradient under the hero screenshot */
  --radius: 0.75rem;
}

/* Arc-like: playful, saturated-but-soft tinted chrome, grain, generous radii */
[data-preset="arc"] {
  color-scheme: light;
  --bg: oklch(0.95 0.035 300);
  --surface-1: oklch(0.985 0.012 300); --surface-2: oklch(0.93 0.05 300);
  --fg: oklch(0.25 0.05 290); --fg-muted: oklch(0.45 0.06 290);
  --accent: oklch(0.62 0.21 350);
  --accent-2: oklch(0.8 0.14 75);
  --radius: 1rem;
  /* pair with .grain-page (recipe 22) and an in-oklch mesh (recipe 13) */
}
```
**Tune:** each preset is 80% neutrals; the fastest way to make it yours is a new accent hue plus a different display face (see `typography.md`).  
**A11y/perf:** Re-run the contrast script per preset; Stripe-like navy muted text and Arc-like tinted muted text are the usual failures.

### 25. Color tools
| Tool | Use it for |
|---|---|
| oklch.com (Evil Martians) | Pick/convert OKLCH, see sRGB vs P3 gamut holes per hue |
| Harmonizer (harmonizer.evilmartians.com, Figma plugin) | Palettes with equal chroma + APCA contrast per level across hues; exports Tailwind/CSS/JSON |
| Radix Colors + custom palette tool (radix-ui.com/colors) | 12-step semantics; steps 11/12 guaranteed Lc 60/90 on step 2 |
| Huetone (huetone.ardov.me) | LCH/OKLCH palette editor with APCA/WCAG contrast grids |
| Leonardo (leonardocolor.io, Adobe) | Generate colors by target contrast ratio against a background |
| Tailwind v4 palette (tailwindcss.com/docs/colors) | Reference OKLCH ramps incl. tinted neutrals slate/zinc/stone/mauve/olive/mist/taupe |
| Realtime Colors (realtimecolors.com) | Preview a 5-color system on a real layout, light and dark |
| Josh W. Comeau shadow palette + gradient generator | Layered tinted shadow tokens; eased multi-stop gradients |
| apcacontrast.com, Chrome DevTools picker, Polypane, Polychrom (Figma) | Contrast checks (APCA + WCAG) |
| OkColor (Figma), stylelint-gamut | OKLCH picking in Figma; lint out-of-gamut colors that need `@media (color-gamut: p3)` |
| `culori` 4.0.2, `colorjs.io` 0.7.1, `apca-w3` 0.1.9, `apcach` 0.6.4 | Conversion, gamut mapping, APCA math, APCA-driven color generation |

## Gotchas
- `linear-gradient(#f06, #06f)` still interpolates in sRGB (legacy colors keep legacy behavior) and gets a gray middle. Fix: write `in oklab` / `in oklch` explicitly.
- `light-dark()` returns the light value forever if `color-scheme` is not `light dark` (or set per theme). Fix: set it on `:root` and on your theme class/attribute.
- Registering color tokens with `@property` freezes `light-dark()` at `:root`, so local inversion stops working. Fix: leave theme tokens unregistered; register only tokens you animate.
- Tailwind 4 utilities mapped without `@theme inline` read the variable at `:root`, so a nested `.dark` section keeps light colors. Fix: `@theme inline { --color-x: var(--x); }`.
- Relative color `calc()` with percentages (`calc(l - 10%)`) fails; channels are numbers. Fix: `calc(l - 0.1)`.
- Out-of-gamut OKLCH gets mapped by the browser (historically clipped), shifting hue: bright blues go purple, cyans go gray-green. Fix: gamut-fit at build (recipe 2) and gate higher chroma behind `@media (color-gamut: p3)`.
- `contrast-color()` only returns black/white by WCAG-style math and picks black on mid-blues. Fix: keep solids clearly dark or light, or hardcode `--accent-contrast`.
- Backdrop blur disappears when an ancestor has `opacity < 1`, `filter`, `mask`, `clip-path`, `mix-blend-mode` or its own `backdrop-filter` (the ancestor becomes the Backdrop Root; the child only sees what is inside it). Classic case: a Motion/GSAP fade-in on the nav wrapper. Fix: animate the glass element itself, or only `transform` on the ancestor.
- Safari: always ship `-webkit-backdrop-filter` alongside `backdrop-filter`, literal values in the prefixed line; `backdrop-filter: url(#svg)` does nothing outside Chromium and `@supports` cannot tell you. Fix: JS gate (recipe 16).
- `filter: url(#duotone)` renders nothing if the SVG is `display: none`. Fix: hide it with `width="0" height="0" style="position:absolute"`.
- SVG filters default to `color-interpolation-filters="linearRGB"`: duotones come out washed and displacement maps drift. Fix: set `sRGB` on the filter.
- Pure white text on pure black causes halation (text blooms), worse with astigmatism. Fix: fg L 0.9-0.95 on bg L 0.13-0.18.
- Dark mode cards merge into the bg because shadows are invisible. Fix: lighter surfaces + 1px alpha border + inset top highlight (recipe 10).
- Fixed full-screen grain with `mix-blend-mode` can tank scroll FPS on low-end Android. Fix: blend mode `normal`, or per-section grain.
- Theme toggle icon rendered on the server then flipped: hydration mismatch. Fix: same-size placeholder until mounted, use `resolvedTheme`.
- Gradient text without a fallback disappears in forced-colors mode. Fix: `@media (forced-colors: active)` reset (recipe 13).
- Canvas color extraction on a cross-origin image without CORS throws a SecurityError. Fix: same-origin images, `crossOrigin="anonymous"` + CORS headers, or extract at build with `sharp().stats()`.

## Sources
- https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
- https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools
- https://github.com/evilmartians/harmonizer/blob/main/README.md
- https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- https://tailwindcss.com/docs/theme , https://tailwindcss.com/docs/colors , https://tailwindcss.com/docs/dark-mode
- https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css (palette, shadow, radius, blur values)
- https://linear.app/now/how-we-redesigned-the-linear-ui , https://linear.app/now/behind-the-latest-design-refresh
- https://blog.logrocket.com/ux-design/linear-design/
- https://vercel.com/geist/colors
- https://developer.apple.com/design/human-interface-guidelines/materials
- https://www.joshwcomeau.com/css/designing-shadows/ , https://www.joshwcomeau.com/gradient-generator/
- https://github.com/molefrog/spoiled/blob/main/web/demo.css , https://github.com/chinchang/web-maker (generated shadow-palette tokens in the wild)
- https://git.apcacontrast.com/documentation/APCAeasyIntro.html , https://github.com/Myndex/apca-w3
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark
- https://www.bram.us/2026/03/19/more-easy-light-dark-mode-switching-light-dark-is-about-to-support-images/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/contrast-color
- https://developer.chrome.com/blog/new-in-web-ui-io26
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color-interpolation-method
- https://css-tricks.com/easing-linear-gradients/ , https://css-tricks.com/grainy-gradients/
- https://kube.io/blog/liquid-glass-css-svg/ , https://webtricks.dev/blog/liquid-glass-css , https://github.com/w3c/svgwg/issues/1142
- https://caniuse.com/css-backdrop-filter , https://github.com/mdn/browser-compat-data/issues/25914
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency , https://caniuse.com/wf-prefers-reduced-transparency
- https://www.nngroup.com/articles/glassmorphism/ , https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape , https://www.smashingmagazine.com/2026/03/beyond-border-radius-css-corner-shape-property-ui/
- https://blog.master.dev/the-classic-border-radius-advice-plus-an-unusual-trick/ , https://cloudfour.com/thinks/the-math-behind-nesting-rounded-corners/
- https://refactoringui.com/previews/building-your-color-palette
- https://www.stylekit.top/en/styles/stripe-style (public Stripe brand hex values)
- npm registry (2026-09-26): next-themes 0.4.6, culori 4.0.2, colorjs.io 0.7.1, apca-w3 0.1.9, apcach 0.6.4, tailwindcss 4.3.3
