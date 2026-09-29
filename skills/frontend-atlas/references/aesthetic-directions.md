# Aesthetic Directions - 30 named visual languages for 2025-2026

> Load when: the brief has no visual direction yet, the user names a style ("make it Swiss / brutalist / Linear-like / Y2K / earthy"), you must pick fonts + palette + motion that belong together, or a draft "looks AI-generated" and needs a committed point of view.
> Stack assumptions: framework-agnostic tokens as CSS custom properties (drop into `:root` or a Tailwind 4 `@theme` block); effect implementations live in sibling files and are cross-linked, not repeated.

## Contents
- [How to use this file](#how-to-use-this-file)
- [Index table](#index-table)
- [Decision guide - choosing a direction from a brief](#decision-guide---choosing-a-direction-from-a-brief)
- [Global AI-slop tells (evidence-ranked)](#global-ai-slop-tells-evidence-ranked)
- [Shared building blocks](#shared-building-blocks)
- [Recipes (the 30 directions)](#recipes)
  1. [Swiss / International Typographic](#1-swiss--international-typographic)
  2. [Editorial magazine](#2-editorial-magazine)
  3. [Neo-brutalism](#3-neo-brutalism)
  4. [Raw brutalism](#4-raw-brutalism)
  5. [Minimal luxury](#5-minimal-luxury)
  6. [Japanese minimal (ma)](#6-japanese-minimal-ma)
  7. [Dark tech (Linear / Vercel)](#7-dark-tech-linear--vercel)
  8. [Liquid glass / glassmorphism 2.0](#8-liquid-glass--glassmorphism-20)
  9. [Bento product (Apple)](#9-bento-product-apple)
  10. [Organic / earthy / wellness](#10-organic--earthy--wellness)
  11. [Y2K chrome](#11-y2k-chrome)
  12. [Retro-futurism (industrial)](#12-retro-futurism-industrial)
  13. [Terminal / ASCII / hacker](#13-terminal--ascii--hacker)
  14. [Maximalist collage](#14-maximalist-collage)
  15. [Anti-design](#15-anti-design)
  16. [Kinetic typographic](#16-kinetic-typographic)
  17. [Soft 3D / clay](#17-soft-3d--clay)
  18. [Tactile skeuomorphic 2.0](#18-tactile-skeuomorphic-20)
  19. [Gradient-mesh SaaS](#19-gradient-mesh-saas)
  20. [Grainy risograph / print](#20-grainy-risograph--print)
  21. [Monochrome photographic](#21-monochrome-photographic)
  22. [Playful illustrative](#22-playful-illustrative)
  23. [Scandinavian calm](#23-scandinavian-calm)
  24. [Dithered / pixel / 1-bit](#24-dithered--pixel--1-bit)
  25. [Cyber neon](#25-cyber-neon)
  26. [Data-dense instrument panel](#26-data-dense-instrument-panel)
  27. [Immersive WebGL studio](#27-immersive-webgl-studio)
  28. [Scrapbook / sticker](#28-scrapbook--sticker)
  29. [Corporate-premium (fintech)](#29-corporate-premium-fintech)
  30. [Handcrafted / zine](#30-handcrafted--zine)
- [Mixing rules - combining two directions without mush](#mixing-rules---combining-two-directions-without-mush)
- [Gotchas](#gotchas)
- [Sources](#sources)

## How to use this file
1. Run the decision guide below and commit to ONE primary direction (plus at most one accent direction, see mixing rules).
2. Paste that direction's token block. Every block uses the same token names (`--bg --surface --fg --muted --accent --accent-2 --line --radius --border --shadow --grain --font-display --font-body --font-mono --dur-fast --dur-base --dur-slow --ease`), so directions are hot-swappable and sibling recipes can consume them.
3. Load fonts from the named source (Google Fonts via `next/font/google`, Fontshare / Velvetyne / foundry files via `next/font/local`). Paid faces are named first because that is what the reference sites actually ship; a free stand-in follows.
4. Build effects from the cross-linked sibling files; use the direction's "Motion" line to set durations/easings and to know what must never move.
5. Before shipping, read the direction's "Slop tells" line and check the page against it.

Facts marked "verified" were read from the live site's CSS/HTML on 2026-09-26 (font files and hex values in their stylesheets). Palettes not marked verified are designed to the direction, not copied.

## Index table
| # | Direction | One-line essence | Default mode | Motion energy | Cost | Best for |
|---|-----------|------------------|--------------|---------------|------|----------|
| 1 | Swiss / International | Grid + grotesk + objectivity | Light | Low | CSS | Studios, foundries, architecture, B2B infra |
| 2 | Editorial magazine | Reading as the product | Light (cream) | Low-med | CSS | Publications, research, VC, thoughtful AI brands |
| 3 | Neo-brutalism | Flat color, thick outlines, hard shadows | Light | Snappy | CSS | Creator tools, indie SaaS, Gen Z |
| 4 | Raw brutalism | Default HTML as a stance | Light | None | CSS | Artists, radio, archives |
| 5 | Minimal luxury | Whitespace as price signal | Light (warm) | Slow | CSS+img | Fashion, hospitality, fragrance |
| 6 | Japanese minimal (ma) | Emptiness as structure | Light (washi) | Slow | CSS | Craft, product design, tea, ceramics |
| 7 | Dark tech | Precision dark UI, product-first | Dark | Med | CSS+JS | Dev tools, AI infra, productivity |
| 8 | Liquid glass | Refractive floating chrome over content | Media-backed | Springy | CSS/SVG, GPU | Consumer apps, OS-like product pages |
| 9 | Bento product | One idea per tile, mixed spans | Light/dark | Med | CSS+video | Product launches, feature overviews |
| 10 | Organic / wellness | Soft shapes, warm neutrals, texture | Light (oat) | Slow | CSS | Wellness, skincare, food |
| 11 | Y2K chrome | Liquid metal, acid color, bubbles | Either | High | 3D/img | Music, fashion drops, Gen Z bev |
| 12 | Retro-futurism | Industrial devices, dot-matrix, labels | Light grey | Stepped | CSS | Hardware, audio, gadgets |
| 13 | Terminal / ASCII | Monospace grid, commands, ASCII art | Dark | Stepped | CSS/canvas | CLIs, infra, security |
| 14 | Maximalist collage | Layered cutouts, many voices, one path | Loud | High | img | DTC food/bev, streetwear |
| 15 | Anti-design | Deliberately wrong, conceptually right | Any | Abrupt | CSS | Art schools, avant-garde fashion |
| 16 | Kinetic typographic | Type is the image and the motion | Dark or light | High | JS | Agencies, foundries, launches |
| 17 | Soft 3D / clay | Matte pastel 3D, springy | Light pastel | Bouncy | 3D/img | Consumer apps, edu, friendly AI |
| 18 | Tactile skeuo 2.0 | Real light, pressable controls | Light grey | Physical | CSS | Hardware, audio, wallets |
| 19 | Gradient-mesh SaaS | Moving color field + crisp product | Light | Slow drift | WebGL | Payments, SaaS, AI platforms |
| 20 | Grainy riso / print | Spot inks, overprint, halftone, grain | Paper | Stepped | CSS/SVG | Culture, zines, venues |
| 21 | Monochrome photographic | Images lead, type recedes | Black or white | Slow | img | Photo, fashion, architecture |
| 22 | Playful illustrative | Characters and chunky UI | Light | Bouncy | Lottie/Rive | Education, consumer, food |
| 23 | Scandinavian calm | Warm neutrals, material honesty | Light (linen) | Calm | CSS | Furniture, homeware, calm SaaS |
| 24 | Dithered / 1-bit | Two colors, dither patterns, pixel type | Paper or black | Stepped | canvas | Games, low-tech, indie software |
| 25 | Cyber neon | HUD, chamfers, glow on near-black | Dark | Glitch bursts | CSS | Gaming, esports, sci-fi |
| 26 | Instrument panel | Dense data, tabular, live | Dark or light | Minimal | JS | Dashboards, trading, infra |
| 27 | Immersive WebGL studio | The page is a 3D scene | Dark | Cinematic | GPU heavy | Agencies, launches, games |
| 28 | Scrapbook / sticker | Paper, tape, polaroids, drag | Paper | Playful | JS | Events, personal, community |
| 29 | Corporate-premium fintech | Quiet confidence, serif trust | Light | Restrained | CSS | Banks, fintech, B2B finance |
| 30 | Handcrafted / zine | Made by a person, marginalia | Paper | Hand-drawn | SVG | Writers, researchers, indie makers |

## Decision guide - choosing a direction from a brief
Answer in order; stop at the first row that clearly fits, then sanity-check with "misfits" in the recipe.

| Brief signal (what the user/brand says or is) | Primary direction | Good accent (optional) | Cost (CSS / JS kb / GPU) | Recipe |
|---|---|---|---|---|
| Dev tool, API, infra, "like Linear/Vercel" | Dark tech | Terminal (for code blocks), Bento (features) | CSS + ~30-60kb motion | [7](#7-dark-tech-linear--vercel) |
| CLI, open-source tool, security, "hacker" | Terminal / ASCII | Swiss (grid discipline) | CSS, optional canvas | [13](#13-terminal--ascii--hacker) |
| Bank, payments, B2B finance, legal, "trust" | Corporate-premium fintech | Editorial (serif headline), Gradient-mesh (one hero) | CSS | [29](#29-corporate-premium-fintech) |
| Payments/AI platform wanting energy + trust | Gradient-mesh SaaS | Dark tech sections | WebGL ~10-30kb | [19](#19-gradient-mesh-saas) |
| Hardware product, audio, camera, gadget | Retro-futurism or Tactile skeuo | Bento (specs) | CSS | [12](#12-retro-futurism-industrial), [18](#18-tactile-skeuomorphic-20) |
| Consumer app launch, "Apple-like" feature page | Bento product | Liquid glass (nav only) | CSS + video | [9](#9-bento-product-apple) |
| Fashion, fragrance, hotel, jewelry, real estate | Minimal luxury | Monochrome photographic | CSS + images | [5](#5-minimal-luxury) |
| Photographer, film, architecture portfolio | Monochrome photographic | Swiss (captions/index) | images | [21](#21-monochrome-photographic) |
| Design studio, foundry, museum, architect | Swiss | Kinetic type (one hero moment) | CSS | [1](#1-swiss--international-typographic) |
| Creative agency / dev portfolio wanting awards | Immersive WebGL or Kinetic type | Swiss or Minimal for case-study pages | GPU heavy / JS | [27](#27-immersive-webgl-studio), [16](#16-kinetic-typographic) |
| Magazine, research lab, VC, long reads, newsletter | Editorial magazine | Swiss (grid), Riso (covers) | CSS | [2](#2-editorial-magazine) |
| Wellness, skincare, supplements, therapy, food | Organic / wellness | Editorial (serif), Scandinavian | CSS | [10](#10-organic--earthy--wellness) |
| Furniture, homeware, calm productivity app | Scandinavian calm | Japanese minimal | CSS | [23](#23-scandinavian-calm) |
| Craft, tea, ceramics, stationery, Japanese brand | Japanese minimal | Monochrome photographic | CSS | [6](#6-japanese-minimal-ma) |
| Creator tool, indie SaaS, community, students | Neo-brutalism | Playful illustrative | CSS | [3](#3-neo-brutalism) |
| Kids, education, habit app, onboarding | Playful illustrative | Soft 3D | Lottie/Rive 60-150kb | [22](#22-playful-illustrative) |
| Friendly AI assistant, fintech for young users | Soft 3D / clay | Playful illustrative | pre-rendered img; 3D optional | [17](#17-soft-3d--clay) |
| DTC beverage/snack, streetwear, festival | Maximalist collage | Y2K chrome or Riso | images | [14](#14-maximalist-collage) |
| Music release, fashion drop, Gen Z nightlife | Y2K chrome | Kinetic type | 3D or pre-rendered | [11](#11-y2k-chrome) |
| Game, esports, sci-fi entertainment | Cyber neon or Immersive WebGL | Dithered pixel | CSS / GPU | [25](#25-cyber-neon) |
| Dashboard, trading, observability, analytics | Instrument panel | Dark tech chrome | JS (charts) | [26](#26-data-dense-instrument-panel) |
| Culture venue, bookshop, zine, poster archive | Grainy riso / print | Editorial | CSS/SVG | [20](#20-grainy-risograph--print) |
| Personal site, writer, digital garden | Handcrafted / zine | Editorial or Raw brutalism | SVG | [30](#30-handcrafted--zine) |
| Events, invites, travel journal, community | Scrapbook / sticker | Handcrafted | JS drag | [28](#28-scrapbook--sticker) |
| Artist, radio, archive, "anti-corporate" | Raw brutalism or Anti-design | Swiss | none | [4](#4-raw-brutalism), [15](#15-anti-design) |
| Low-tech, sustainability, indie games | Dithered / 1-bit | Terminal | canvas | [24](#24-dithered--pixel--1-bit) |

Tie-breakers:
- **Audience age and tech-literacy:** older/mass audience -> Scandinavian, Corporate-premium, Editorial. Designers/devs -> Swiss, Terminal, Dark tech. Gen Z -> Neo-brutal, Y2K, Collage.
- **Price point:** the higher the price, the less motion and the more whitespace (Luxury, Japanese, Monochrome). Mass price -> louder color and faster motion.
- **Content type:** product UI to show -> Dark tech / Bento / Fintech. Story -> Editorial / WebGL. Catalog -> Luxury / Scandinavian / Monochrome. Data -> Instrument panel.
- **Perf budget / low-end devices:** rule out 11, 17 (real-time), 19 (unless static fallback), 27.
- **Brand already has assets:** the direction must fit the logo and photography they already own. Never pick Monochrome photographic without real photos, or Playful illustrative without an illustrator or a consistent library.
- **When the user says "modern, clean, premium" and nothing else:** do NOT default to Dark tech (that is the AI default). Pick by industry from the table; for generic SaaS prefer Corporate-premium or Scandinavian calm, and add one signature detail.

## Global AI-slop tells (evidence-ranked)
From a 2026 scan of Reddit discussion of "vibe-coded" sites (3.2M posts across 47 subreddits, 3,033 on-topic comments; github.com/JCarterJohnson/vibecoded-design-tells), the most-cited tells in order: (1) stock shadcn/Tailwind defaults, (2) "AI purple" gradients (indigo/violet, traced to Tailwind's old indigo-500 default), (3) gradient-clipped hero text, (4) centered hero + three identical cards, (5) unprompted neon glow, (6) emoji as icons. About 13% of complaints were simply "they all look the same". Practitioner lists add: Inter everywhere; the Space Grotesk / Instrument Serif / Geist combo; one serif-italic accent word in a sans hero; permanent dark mode with grey body text; colored top/left borders on cards; badge above the H1; "1, 2, 3" step rows; stat banner rows; all-caps section labels everywhere.

Rules that follow from this:
- A direction is a set of constraints. The tells above are what appears when there is no direction. Picking one from this file and obeying its "never" list removes most of them.
- The same element can be slop in one direction and correct in another: all-caps tracked labels are right for Luxury and Retro-futurism, wrong as a default everywhere; Inter is fine in an Instrument panel (tabular workhorse), a tell as the hero face of a marketing page.
- Every direction below lists its own specific tells.

## Shared building blocks
Reused by several directions; effect depth lives in sibling files (`color-surfaces.md`, `backgrounds-svg-canvas.md`, `motion-principles.md`).

```css
/* Grain overlay: static SVG noise, no JS, no animation. Opacity comes from the direction's --grain. */
.grain::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: var(--grain, 0);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Reduced motion: keep end states, drop travel. Every direction assumes this is present. */
@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; }
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
}
```

```ts
// Tailwind 4 bridge: expose the direction tokens as utilities (bg-bg, text-fg, border-line, font-display...).
// globals.css
// @import "tailwindcss";
// @theme inline {
//   --color-bg: var(--bg); --color-surface: var(--surface); --color-fg: var(--fg);
//   --color-muted: var(--muted); --color-accent: var(--accent); --color-line: var(--line);
//   --font-display: var(--font-display); --font-body: var(--font-body); --font-mono: var(--font-mono);
//   --radius-card: var(--radius);
// }
export {};
```

## Recipes

### 1. Swiss / International Typographic
**Essence:** Objective communication: a visible modular grid, one grotesk in two or three sizes with brutal scale contrast, and nothing decorative.
**Signature traits:**
- Flush-left, ragged-right text; asymmetric compositions hung on a 12-column grid.
- Hairline rules and index numbers (01, 02) doing structural work.
- Extreme size jumps (14px next to 160px), no middle sizes.
- One signal color (red) used for less than 5% of the page, often none.

```css
:root {
  --bg: #f4f4f0; --surface: #ffffff; --fg: #111111; --muted: #6b6b6b;
  --accent: #e30613; --accent-2: #111111; --line: #111111;
  --radius: 0px; --border: 1px solid var(--line); --shadow: none; --grain: 0;
  --font-display: "Neue Haas Grotesk Display", "Switzer", system-ui, sans-serif;
  --font-body: "Suisse Intl", "Switzer", system-ui, sans-serif;
  --font-mono: "Suisse Intl Mono", "IBM Plex Mono", ui-monospace, monospace;
  --dur-fast: 120ms; --dur-base: 240ms; --dur-slow: 480ms; --ease: cubic-bezier(0.2, 0, 0, 1);
}
.swiss-grid {
  display: grid;
  grid-template-columns: [full-start] 1fr [content-start] repeat(12, minmax(0, 1fr)) [content-end] 1fr [full-end];
  column-gap: clamp(12px, 1.5vw, 24px);
}
.swiss-index { font: 500 0.75rem/1 var(--font-mono); letter-spacing: 0.02em; font-variant-numeric: tabular-nums; }
```
**Type:** Neue Haas Grotesk Display (Monotype) or Suisse Int'l (Swiss Typefaces) or Akkurat LL (Lineto). Free: Switzer (Fontshare) + IBM Plex Mono (Google). Display tracking -0.03em to -0.05em at 96px+.
**Motion:** 120-480ms, `cubic-bezier(0.2,0,0,1)`. Moves: horizontal wipes (clip-path inset), grid-aligned slides, counters, underline draws. Never: bounce, rotation, blur, parallax on type, springs.
**Layout:** Named-line CSS grid; captions hang in their own column; sections separated by 1px rules; lots of empty columns; big numerals as wayfinding. See `layout-composition.md`.
**Imagery/icons:** Objective photography cropped hard, often B/W or duotone; icons replaced by typographic arrows (-> , +) or none.
**References:** vitsoe.com, lineto.com, grillitype.com, jetset.nl (Experimental Jetset), swissted.com.
**Fits:** design studios, foundries, museums, architecture, B2B infra, designer portfolios. **Misfits:** kids, comfort food, wellness.
**Slop tells -> credible:** Tell = Helvetica + red square + decorative grid lines that align to nothing. Credible = the grid is real (every element snaps to named lines), line-heights are multiples of 4px, index numbers mean something (section order), one red at most, copy is short and declarative.

### 2. Editorial magazine
**Essence:** The page reads like a well-edited publication: kicker, headline, dek, byline, long measure, pull quotes, serif body.
**Signature traits:**
- Serif display with optical sizes; body in serif (or a newspaper grotesk for UI labels).
- Clear editorial hierarchy: kicker -> headline -> dek -> byline -> body.
- Varied column spans, sidenotes/footnotes, pull quotes, drop caps.
- Cream paper background, ink-black text, one warm accent.

```css
:root {
  --bg: #faf7f2; --surface: #ffffff; --fg: #1a1714; --muted: #6f675e;
  --accent: #b3401a; --accent-2: #1f3a5f; --line: color-mix(in oklab, var(--fg) 15%, transparent);
  --radius: 0px; --border: 1px solid var(--line); --shadow: none; --grain: 0.025;
  --font-display: "Tiempos Headline", "Newsreader", Georgia, serif;
  --font-body: "Tiempos Text", "Newsreader", Georgia, serif;
  --font-mono: "Schibsted Grotesk", system-ui, sans-serif; /* labels, kickers, bylines */
  --dur-fast: 150ms; --dur-base: 500ms; --dur-slow: 800ms; --ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.article { max-width: 68ch; font: 400 1.1875rem/1.6 var(--font-body); font-variant-numeric: oldstyle-nums proportional-nums; hanging-punctuation: first; text-wrap: pretty; }
.kicker { font: 600 0.8125rem/1 var(--font-mono); color: var(--accent); }
.headline { font: 400 clamp(2.5rem, 6vw, 5.5rem)/1.02 var(--font-display); letter-spacing: -0.02em; text-wrap: balance; }
.dek { font: italic 400 1.375rem/1.4 var(--font-body); color: var(--muted); }
```
**Type:** Tiempos Headline/Text or Domaine (Klim), GT Sectra + GT America (Grilli), Canela (Commercial Type), PP Editorial New (Pangram Pangram; verified on ouraring.com). Free: Newsreader (Google, opsz axis) + Schibsted Grotesk (Google) for kickers/UI. Avoid Instrument Serif as the only serif (overused AI combo).
**Motion:** 500-800ms, `cubic-bezier(0.22,1,0.36,1)`. Moves: headline line-mask reveals, image clip reveals on enter, reading-progress bar. Never: typing effects, bouncing, animated body text. See `text-effects.md`.
**Layout:** 12-col with text in 6-7 columns and sidenotes in 2-3; full-bleed images break the column; section numbers; 60-72ch measure; `text-wrap: balance` on headings, `pretty` on paragraphs.
**Imagery/icons:** Commissioned photography or illustration with captions and credits; no icons in body.
**References:** press.stripe.com (Stripe Press), worksinprogress.co, itsnicethat.com, theverge.com, kinfolk.com.
**Fits:** publications, research labs, VC firms, newsletters, book sites, AI companies wanting a thoughtful tone. **Misfits:** dashboards, utilities, fast-conversion funnels.
**Slop tells -> credible:** Tell = one serif-italic word inside an Inter hero, cream bg with a SaaS layout underneath. Credible = real editorial components (kicker/dek/byline/pull quote/sidenote), serif actually used for reading, old-style figures and small caps (`font-variant-caps: all-small-caps` for acronyms), real bylines and dates.

### 3. Neo-brutalism
**Essence:** Flat saturated fills, thick black outlines, hard offset shadows that make things feel pressable.
**Signature traits:**
- 2-3px black borders on everything interactive; hard shadow `4px 4px 0 #000`.
- Candy fills (pink, yellow, teal) with black text.
- Press interaction: element slides into its shadow.
- Chunky grotesk, often wide; marquees and stickers welcome.

```css
:root {
  --bg: #fff4e0; --surface: #ffffff; --fg: #000000; --muted: #3d3d3d;
  --accent: #ff90e8; --accent-2: #ffc900; --line: #000000;
  --radius: 6px; --border: 2px solid var(--line); --shadow: 4px 4px 0 var(--line); --grain: 0;
  --font-display: "ABC Favorit", "Bricolage Grotesque", system-ui, sans-serif;
  --font-body: "ABC Favorit", "Archivo", system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
  --dur-fast: 90ms; --dur-base: 150ms; --dur-slow: 240ms; --ease: cubic-bezier(0.3, 0, 0, 1);
}
.nb-btn {
  background: var(--accent); color: var(--fg); border: var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 0.75rem 1.25rem; font: 700 1rem/1 var(--font-body);
  transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}
@media (hover: hover) and (pointer: fine) { .nb-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--line); } }
.nb-btn:active { transform: translate(4px, 4px); box-shadow: 0 0 0 var(--line); }
.nb-btn:focus-visible { outline: 3px solid var(--fg); outline-offset: 3px; }
```
**Type:** ABC Favorit (Dinamo; verified on gumroad.com with `#ff90e8` pink on black), Mabry Pro (Colophon). Free: Bricolage Grotesque (Google) display + Archivo (Google, wdth axis for wide heads) + Space Mono.
**Motion:** 90-240ms, near-linear. Moves: press-into-shadow, marquees, sticker pops. Never: blur, soft shadows, gradients, fades longer than 200ms.
**Layout:** Boxy cards on a clear grid, visible borders between sections, oversized buttons, tag chips.
**Imagery/icons:** Flat illustrations with black outlines; icons 2px stroke (Phosphor Bold, Tabler at stroke 2).
**References:** gumroad.com, neobrutalism.dev (shadcn-based kit; repo ekmas/neobrutalism-components ~5.5k stars), posthog.com (neo-brutal + retro-desktop hybrid).
**Fits:** creator tools, indie SaaS, community, education, events, dev tools with humor. **Misfits:** luxury, healthcare, banks, grief/serious topics.
**Slop tells -> credible:** Tell = every card the same pastel with the same shadow, including non-interactive text blocks (the shadow stops meaning "press me"). Credible = hard shadow reserved for interactive elements, colors mapped to meaning (category or state), one border weight everywhere, contrast checked (black on pastel passes; white on pink does not).

### 4. Raw brutalism
**Essence:** Default HTML as a stance: honest materials, no styling beyond what is needed, speed as aesthetic.
**Signature traits:**
- Browser-default or system fonts, default blue links, visible underlines.
- Tables, lists, `<hr>`, plain forms; structure is visible.
- One bold decision (giant type, one color field, or one weird layout rule).

```css
:root {
  --bg: #ffffff; --surface: #ffffff; --fg: #000000; --muted: #555555;
  --accent: #0000ee; --accent-2: #551a8b; --line: #000000;
  --radius: 0px; --border: 1px solid var(--line); --shadow: none; --grain: 0;
  --font-display: "Times New Roman", Times, serif;
  --font-body: "Times New Roman", Times, serif;
  --font-mono: "Courier New", Courier, monospace;
  --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; --ease: linear;
}
body { background: var(--bg); color: var(--fg); font: 16px/1.4 var(--font-body); margin: 8px; }
a { color: var(--accent); text-decoration: underline; }
a:visited { color: var(--accent-2); }
table { border-collapse: collapse; } td, th { border: var(--border); padding: 4px 8px; text-align: left; vertical-align: top; }
```
**Type:** System serif/sans/mono stacks. Designer versions: ABC Diatype Mono or ABC Monument Grotesk Semi-Mono (Dinamo). Free: IBM Plex Mono.
**Motion:** None. State changes are instant. Hover = underline toggle or color invert. Never: smooth scroll, easing, preloaders.
**Layout:** Document flow, single column or a table; max-width optional; no cards.
**Imagery/icons:** Raw images at native aspect, no rounding; no icons (text labels).
**References:** brutalistwebsites.com (gallery), berkshirehathaway.com, are.na, nts.live, cargo.site (templates).
**Fits:** artists, radio, archives, cultural institutions, dev personal sites, zines. **Misfits:** mass-market conversion funnels.
**Slop tells -> credible:** Tell = "brutalist" as broken usability (hidden nav, unreadable contrast). Credible = semantic HTML, sub-50kb pages, real content density, visible focus, one intentional twist.

### 5. Minimal luxury
**Essence:** Whitespace, silence and slowness as price signals; the product photograph does all the talking.
**Signature traits:**
- Warm off-white or stone background, near-black ink, zero decorative color.
- Small type, wide tracking on uppercase nav, light display serif.
- Full-bleed imagery, very few words, slow crossfades.

```css
:root {
  --bg: #f3eee7; --surface: #ebe5dc; --fg: #313131; --muted: #82847f;
  --accent: #313131; --accent-2: #dad9d7; --line: #dad9d7;
  --radius: 0px; --border: 1px solid var(--line); --shadow: none; --grain: 0;
  --font-display: "Lyon Display", "Cormorant Garamond", Georgia, serif;
  --font-body: "Whitney", "Hanken Grotesk", system-ui, sans-serif;
  --font-mono: "Hanken Grotesk", system-ui, sans-serif;
  --dur-fast: 300ms; --dur-base: 900ms; --dur-slow: 1400ms; --ease: cubic-bezier(0.65, 0, 0.35, 1);
}
.lux-nav a { font: 400 0.6875rem/1 var(--font-body); letter-spacing: 0.14em; text-transform: uppercase; }
.lux-title { font: 300 clamp(2rem, 4.5vw, 4rem)/1.1 var(--font-display); letter-spacing: -0.01em; }
.lux-media img { transform: scale(1.06); transition: transform var(--dur-slow) var(--ease), opacity var(--dur-base) var(--ease); }
.lux-media.is-in img { transform: scale(1); }
```
**Type:** Lyon Display/Text (Commercial Type; verified on aman.com with `#f3eee7` bg and `#313131` ink), Canela (Commercial Type), Saol Display (Schick Toikka), Ogg (Sharp Type). Free: Cormorant Garamond Light (Google) + Hanken Grotesk (Google). Never gold, never script.
**Motion:** 900-1400ms, `cubic-bezier(0.65,0,0.35,1)`. Moves: image settle (scale 1.06 -> 1), crossfades, slow horizontal carousels. Never: bounce, fast staggers, cursor gimmicks, counters.
**Layout:** One idea per viewport, full-bleed or strict half-and-half splits, generous margins (8-12vw), product on neutral.
**Imagery/icons:** Art-directed photography with consistent grading; icons thin (Phosphor Thin/Light) or none.
**References:** therow.com, aman.com, aesop.com, bottegaveneta.com, byredo.com (luxury sites often block bots; open them in a browser).
**Fits:** fashion, hospitality, fragrance, jewelry, architecture, premium real estate. **Misfits:** SaaS, anything needing density or urgency.
**Slop tells -> credible:** Tell = black + gold `#d4af37` + Playfair Display + "Elevate your experience". Credible = restraint, colors pulled from the product and photography, type smaller than you think, copy sparse and specific.

### 6. Japanese minimal (ma)
**Essence:** Emptiness is the structure (ma); small blocks of carefully set type floating in space, with a single natural accent.
**Signature traits:**
- Washi-like off-white, sumi ink, one traditional accent (shu vermilion or ai indigo).
- Mincho (serif) display with gothic (sans) body; occasional vertical text.
- Asymmetric placement, large empty areas, horizontal hairlines.

```css
:root {
  --bg: #f7f5f0; --surface: #efece4; --fg: #222222; --muted: #8a857c;
  --accent: #b7282e; --accent-2: #2b4b6f; --line: #e2ded5;
  --radius: 0px; --border: 1px solid var(--line); --shadow: none; --grain: 0.02;
  --font-display: "Shippori Mincho B1", "Zen Old Mincho", serif;
  --font-body: "Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --dur-fast: 200ms; --dur-base: 700ms; --dur-slow: 1100ms; --ease: cubic-bezier(0.25, 0.1, 0.25, 1);
}
:lang(ja) { line-height: 1.9; letter-spacing: 0.04em; line-break: strict; word-break: auto-phrase; text-spacing-trim: trim-start; }
.tate { writing-mode: vertical-rl; text-orientation: mixed; font-family: var(--font-display); letter-spacing: 0.2em; }
```
**Type:** Shippori Mincho B1, Zen Old Mincho, Zen Kaku Gothic New, Noto Sans/Serif JP (all Google). Paid: A1 Mincho, Hiragino (Screen). Latin-only projects: EB Garamond + a quiet grotesk. `word-break: auto-phrase` and `text-spacing-trim` are Chromium-only as of 2026; they degrade gracefully.
**Motion:** 700-1100ms gentle ease. Moves: fade + 8-12px rise, sequential appearance with long gaps, slow image reveals. Never: fast stagger, rotation, glitch, scroll hijack.
**Layout:** Asymmetric; large empty cells in the grid; vertical labels for section names; small captions near image corners.
**Imagery/icons:** Natural-light product photography, textures (paper, wood, clay); no icons.
**References:** muji.us, nendo.jp/en, takram.com, kinto-usa.com, hara.ndc.co.jp (Kenya Hara).
**Fits:** craft, ceramics, tea, stationery, architecture, product design studios, hospitality. **Misfits:** gaming, high-energy consumer, dense SaaS.
**Slop tells -> credible:** Tell = cherry blossoms, red suns, brush fonts, decorative kanji (orientalism). Credible = real Japanese typesetting rules (line-height 1.8-2.0, `line-break: strict`), vertical text only where it means something, emptiness that is designed (fixed margins), not just missing content.

### 7. Dark tech (Linear / Vercel)
**Essence:** Near-black precision UI: crisp product screenshots, hairline borders, tight grotesk, one cool accent, lighting instead of decoration.
**Signature traits:**
- Near-black not pure black; text off-white; borders at 6-10% white.
- The real product UI is the hero image.
- Subtle lighting: top-edge highlights, spotlight hover, faint grid.
- Mono for keyboard shortcuts, code, and metadata.

```css
:root {
  --bg: #08090a; --surface: #111214; --fg: #e4e5e9; --muted: #9c9da1;
  --accent: #8fa4ff; --accent-2: #55cdff; --line: rgb(255 255 255 / 0.08);
  --radius: 10px; --border: 1px solid var(--line);
  --shadow: inset 0 1px 0 rgb(255 255 255 / 0.05), 0 0 0 1px rgb(255 255 255 / 0.06), 0 16px 40px -16px rgb(0 0 0 / 0.6);
  --grain: 0;
  --font-display: "Inter Display", "Geist", system-ui, sans-serif;
  --font-body: "Inter", "Geist", system-ui, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
  --dur-fast: 150ms; --dur-base: 250ms; --dur-slow: 700ms; --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
.dt-card { background: linear-gradient(180deg, rgb(255 255 255 / 0.04), transparent 40%) var(--surface); border: var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
.dt-h1 { font: 600 clamp(2.75rem, 6vw, 4.75rem)/1.02 var(--font-display); letter-spacing: -0.035em; color: var(--fg); }
.dt-kbd { font: 500 0.75rem/1 var(--font-mono); padding: 2px 6px; border: var(--border); border-radius: 4px; color: var(--muted); }
```
**Type:** Verified 2026-09-26: linear.app ships InterVariable with `#08090a` bg / `#e4e5e9` text and `#8fa4ff`, `#55cdff` accents; vercel.com ships Geist Sans + Geist Mono (plus new Geist Pixel variants); raycast.com ships Inter + JetBrains Mono/Geist Mono with `#ff6363` red on `#0c0d0f`; resend.com ships Domaine (serif display) + ABC Favorit + Commit Mono. Free: Geist + Geist Mono (OFL, Google Fonts / `geist` npm). Paid mono: Berkeley Mono (US Graphics).
**Motion:** UI 150-250ms; reveals 600-800ms `cubic-bezier(0.16,1,0.3,1)`. Moves: fade-up 12px with short blur(4px) on small text blocks, border beams, spotlight follows cursor, command-palette open, screenshot parallax 20-40px. Never: bounce, big rotations, playful overshoot, full-screen blur scrubbing.
**Layout:** Centered or left-aligned hero with a product frame in slight perspective, logo wall, dense feature grid or bento, changelog, keyboard-first.
**Imagery/icons:** High-DPI product captures; icons 1.5px stroke (Lucide, Radix Icons, Geist icons); faint dotted/line grids.
**References:** linear.app, vercel.com, raycast.com, resend.com, warp.dev.
**Fits:** dev tools, AI infra, productivity, API products, security. **Misfits:** consumer lifestyle, food, kids, heritage brands.
**Slop tells -> credible:** This is THE default AI look: black + purple radial glow + gradient headline + badge above H1 + three icon cards + grey body under 4.5:1. Credible = the product itself is the hero, accent under 5% of pixels, body text at least `#a1a1aa` on `#0a0a0a`, one signature lighting detail per page (not glows everywhere), and a light mode or light sections if the audience reads long docs.

### 8. Liquid glass / glassmorphism 2.0
**Essence:** Refractive, specular glass for the floating control layer (nav, tab bars, toolbars, sheets) over vivid content; the Apple Liquid Glass language introduced at WWDC 2025.
**Signature traits:**
- Glass only on the navigation/control layer, never on content cards (Apple HIG rule).
- Capsule and continuous-corner shapes; controls morph between states.
- Edge highlights and refraction (lensing) rather than flat frost.
- Content scrolls under the chrome; glass adapts light/dark to what is behind.

```css
:root {
  --bg: #0e0f13; --surface: rgb(255 255 255 / 0.14); --fg: #ffffff; --muted: rgb(255 255 255 / 0.72);
  --accent: #0a84ff; --accent-2: #ffffff; --line: rgb(255 255 255 / 0.38);
  --radius: 28px; --border: 1px solid var(--line);
  --shadow: 0 8px 32px rgb(0 0 0 / 0.22), inset 0 1px 0 rgb(255 255 255 / 0.5), inset 0 -1px 0 rgb(255 255 255 / 0.12);
  --grain: 0;
  --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Geist", system-ui, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Geist", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Geist Mono", monospace;
  --dur-fast: 180ms; --dur-base: 350ms; --dur-slow: 600ms; --ease: cubic-bezier(0.32, 0.72, 0, 1);
}
.glass {
  background: var(--surface); border: var(--border); border-radius: var(--radius); box-shadow: var(--shadow); color: var(--fg);
  -webkit-backdrop-filter: blur(16px) saturate(180%); backdrop-filter: blur(16px) saturate(180%);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .glass { background: rgb(28 28 32 / 0.92); } }
@media (prefers-reduced-transparency: reduce) { .glass { background: rgb(28 28 32 / 0.96); backdrop-filter: none; -webkit-backdrop-filter: none; } }
```
**Type:** SF Pro is licensed for Apple platforms only; reach it through the system stack and fall back to Geist or Figtree elsewhere. Keep text weights 500-600 on glass for legibility.
**Motion:** Springs, not curves: Motion `transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}`; shared-element morphs (`layoutId`) between capsule and sheet; specular highlight follows pointer or device tilt. Never: animate the blur radius on large areas, stack glass on glass, scrub backdrop-filter on scroll.
**Layout:** Full-bleed media or color under floating capsules (bottom tab bar, top toolbar, floating search); 12-16px inset from edges; sheets slide up.
**Imagery/icons:** Vivid photography or gradients underneath (glass is invisible over flat grey); SF Symbols style icons (Phosphor Regular/Fill as web stand-in).
**Real refraction:** the lensing look uses an SVG `feDisplacementMap` referenced from `backdrop-filter: url(#id)`, which renders only in Chromium; Safari/Firefox get plain blur. Implementations: kube.io/blog/liquid-glass-css-svg (full write-up), github.com/rdev/liquid-glass-react (~6.3k stars; README notes partial Safari/Firefox support). See `color-surfaces.md` for surface recipes and `webgl-shaders-3d.md` for shader-based glass.
**References:** apple.com/os/ios, developer.apple.com/design/human-interface-guidelines/materials, kube.io/blog/liquid-glass-css-svg, github.com/rdev/liquid-glass-react.
**Fits:** consumer apps, media/photo/music products, OS-like product pages, overlays on video. **Misfits:** text-heavy docs, dashboards, low-end Android audiences, contrast-critical flows.
**Slop tells -> credible:** Tell = 2021 glassmorphism: frosted cards over a purple blob, white text failing contrast, every card glass. Credible = glass reserved for floating chrome, real imagery behind it, a scrim or denser fill when text sits on it, `prefers-reduced-transparency` and no-backdrop fallbacks, at most 2-3 glass surfaces on screen.

### 9. Bento product (Apple)
**Essence:** A feature page as a grid of mixed-size tiles, one idea and one visual proof per tile, big numbers, product imagery inside rounded cards.
**Signature traits:**
- Rounded tiles (18-28px) on a light grey page or black sections; no borders.
- Mixed spans (2x2 hero tile, 1x2 tall, 2x1 wide); `grid-auto-flow: dense`.
- Each tile has exactly one micro-animation or looping video, not all at once.
- Headline numbers ("22 hrs", "3x") set huge in the tile.

```css
:root {
  --bg: #f5f5f7; --surface: #ffffff; --fg: #1d1d1f; --muted: #6e6e73;
  --accent: #0071e3; --accent-2: #000000; --line: #d2d2d7;
  --radius: 24px; --border: none; --shadow: none; --grain: 0;
  --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter Display", system-ui, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", monospace;
  --dur-fast: 200ms; --dur-base: 600ms; --dur-slow: 900ms; --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
.bento { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: minmax(220px, auto); grid-auto-flow: dense; }
.bento > * { background: var(--surface); border-radius: var(--radius); padding: clamp(20px, 2.5vw, 36px); overflow: hidden; }
.bento .t-hero { grid-column: span 2; grid-row: span 2; }
.bento .t-wide { grid-column: span 2; }
.bento .t-tall { grid-row: span 2; }
.bento .stat { font: 600 clamp(3rem, 7vw, 6rem)/0.95 var(--font-display); letter-spacing: -0.04em; }
@media (max-width: 760px) { .bento { grid-template-columns: 1fr; } .bento > * { grid-column: auto; grid-row: auto; } }
```
**Type:** SF Pro through the system stack (Apple-only license); Inter Display / Geist elsewhere is acceptable here because tiles carry the identity, not the face. Tight tracking (-0.03 to -0.045em) on numbers.
**Motion:** Tiles reveal 600-900ms expo-out with 60-80ms stagger; inside each tile one thing moves (counter, chart draw, looping muted video, chip rotating). Never: every tile animating simultaneously, hover-scaling the whole tile more than 1.02.
**Layout:** 4-col desktop, 2-col tablet, 1-col mobile with explicit `order`; one hero tile per grid; 12-20px gaps; padding consistent across tiles. See `layout-composition.md`.
**Imagery/icons:** Product renders and UI crops bleeding off tile edges; icons only as small labels (SF Symbols style).
**References:** apple.com/macbook-pro, bentogrids.com (gallery), raycast.com, linear.app (feature grids).
**Fits:** product launches, hardware specs, SaaS feature overviews, app landing pages. **Misfits:** narrative storytelling, editorial, luxury (too busy).
**Slop tells -> credible:** Tell = six equal tiles, each "Lucide icon + title + two lines of grey text". Credible = tile size follows importance, every tile carries unique visual proof (screenshot crop, stat, animation), copy is a claim not a label, and mobile order is designed.

### 10. Organic / earthy / wellness
**Essence:** Warm neutrals, soft shapes (arches, pills, blobs), textured photography and a gentle serif; calm, body-aware, trustworthy.
**Signature traits:**
- Oat, clay, sage, terracotta palette; never pure white or black.
- Soft display serif (with SOFT/optical axes) over a humanist or neo-grotesk body.
- Arch and pill image masks, soft diffuse shadows, subtle paper grain.
- Science or ingredient storytelling in calm modules.

```css
:root {
  --bg: #f1ece4; --surface: #e7dfd3; --fg: #2b2a26; --muted: #6d675c;
  --accent: #5f7a52; --accent-2: #c4704f; --line: #d8cfc1;
  --radius: 20px; --border: none; --shadow: 0 24px 48px -24px rgb(70 50 30 / 0.28); --grain: 0.04;
  --font-display: "PP Editorial New", "Fraunces", Georgia, serif;
  --font-body: "Akkurat LL", "Hanken Grotesk", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --dur-fast: 250ms; --dur-base: 800ms; --dur-slow: 1200ms; --ease: cubic-bezier(0.33, 1, 0.68, 1);
}
.arch { border-radius: 999px 999px var(--radius) var(--radius); overflow: hidden; aspect-ratio: 3 / 4; }
.pill { border-radius: 999px; padding: 0.7rem 1.4rem; background: var(--fg); color: var(--bg); }
.display { font-family: var(--font-display); font-weight: 300; font-variation-settings: "SOFT" 100, "WONK" 0; letter-spacing: -0.02em; }
```
**Type:** Verified: ouraring.com ships Akkurat LL (Lineto) + PP Editorial New (Pangram Pangram) on `#ede9e4`-family neutrals; seed.com ships a custom Seed Sans. Paid alternatives: GT Alpina (Grilli), Recoleta (Latinotype). Free: Fraunces (Google, `SOFT` axis 0-100; the setting is ignored by fonts without the axis) + Hanken Grotesk or Figtree (Google).
**Motion:** 800-1200ms easeOutCubic. Moves: slow fades, image masks opening (arch grows), breathing scale 1 -> 1.03 over 4-6s, blob morph loops 12-20s. Never: snappy UI bounces, glitch, hard cuts, fast marquees.
**Layout:** Generous section padding (12-20vh), alternating image/text with overlaps, ingredient grids, rounded containers, testimonial quotes in serif.
**Imagery/icons:** Tactile close-ups (skin, botanicals, ceramics, food), natural light; thin rounded icons (Phosphor Light) or hand-inked marks.
**References:** seed.com, ouraring.com, ritual.com, fromourplace.com, functionhealth.com.
**Fits:** wellness, skincare, supplements, therapy, food, sustainability, consumer health-tech. **Misfits:** dev tools, trading, gaming.
**Slop tells -> credible:** Tell = sage + beige + serif template with stock leaves and random blobs. Credible = art-directed photography, one shape language (arches OR blobs, not both), evidence-led content (studies, ingredients), palette derived from the product itself.

### 11. Y2K chrome
**Essence:** Liquid metal, acid color, bubble shapes and sparkles: the millennium web and pop-music packaging, rebuilt with real 3D.
**Signature traits:**
- Chrome/liquid-metal type or objects with environment reflections.
- Acid lime, hot pink, ice blue against black or silver.
- Pill buttons with glossy highlights, starbursts, sparkle glyphs, perspective grids.
- Rotating 3D logos and wide/extended display type.

```css
:root {
  --bg: #0a0a12; --surface: #16161f; --fg: #f4f6fb; --muted: #a7acb9;
  --accent: #b6ff00; --accent-2: #ff4fd8; --line: rgb(255 255 255 / 0.5);
  --radius: 999px; --border: 1px solid var(--line);
  --shadow: inset 0 2px 0 rgb(255 255 255 / 0.7), inset 0 -8px 16px rgb(0 0 0 / 0.25), 0 10px 30px -10px rgb(182 255 0 / 0.35);
  --grain: 0;
  --font-display: "PP Monument Extended", "Unbounded", system-ui, sans-serif;
  --font-body: "Geist", "Onest", system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
  --dur-fast: 160ms; --dur-base: 420ms; --dur-slow: 2400ms; --ease: cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* Small accents only (badges, 1-3 words). Real chrome headlines come from 3D or pre-rendered images. */
.chrome-text {
  background: linear-gradient(180deg, #ffffff 0%, #d7dbe3 30%, #6b7280 50%, #eef0f4 62%, #9ca3af 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.y2k-pill { border-radius: var(--radius); border: var(--border); box-shadow: var(--shadow); background: linear-gradient(180deg, #e9ecf2, #aab1bd); color: #0b0b0f; }
```
**Type:** PP Monument Extended (Pangram Pangram), Druk Wide (Commercial Type). Free: Unbounded, Syncopate, Michroma, Krona One (Google). Body stays a clean sans (Geist, Onest).
**Motion:** Overshoot springs 350-500ms; chrome sheen sweeps every 2-3s; 3D logo idles with slow Y rotation and pointer tilt; sparkle twinkles. Never: slow luxury fades, scroll-hijacked narratives.
**Layout:** Centered poster compositions, floating objects around a hero word, marquee tickers, perspective floor grids, sticker clusters.
**Imagery/icons:** Chrome 3D (Blender/Spline/R3F `MeshPhysicalMaterial` metalness 1, roughness 0.05-0.15, HDRI environment), holographic foil (`conic-gradient`), butterfly/star sparkles. See `webgl-shaders-3d.md`.
**References:** cari.institute (Consumer Aesthetics Research Institute, archive of Y2K / Frutiger Aero), webdesignmuseum.org/exhibitions/y2k-aesthetic-in-web-design, poolsuite.net (adjacent retro-computing playfulness).
**Fits:** music releases, fashion drops, Gen Z beverages, nightlife, gaming, events. **Misfits:** B2B, healthcare, finance, anything needing calm.
**Slop tells -> credible:** Tell = flat CSS gradient "chrome" on every heading plus Orbitron. Credible = real environment-mapped chrome (or pre-rendered AVIF) limited to logo/hero, a disciplined acid palette (one acid + one pink), clean body type, sparkle budget of 3-5 per viewport.

### 12. Retro-futurism (industrial)
**Essence:** The future as imagined by industrial designers: grey plastics, one signal color, dot-matrix numerals, part numbers and technical labels.
**Signature traits:**
- Light grey or off-white "device" surfaces with black type and one orange/red/yellow signal.
- Dot-matrix or LED display type for numbers and short labels.
- Spec-sheet layouts: exploded views, callout leaders, model codes.
- Stepped, mechanical motion; no blur, no glass.

```css
:root {
  --bg: #e6e6e3; --surface: #f5f5f5; --fg: #111111; --muted: #6a6a6a;
  --accent: #f05a24; --accent-2: #fab413; --line: #111111;
  --radius: 3px; --border: 1px solid var(--line); --shadow: none; --grain: 0;
  --font-display: "Ndot", "Doto", ui-monospace, monospace;
  --font-body: "Geist", system-ui, sans-serif;
  --font-mono: "LL Lettera Mono", "Geist Mono", ui-monospace, monospace;
  --dur-fast: 60ms; --dur-base: 160ms; --dur-slow: 480ms; --ease: steps(6, end);
}
.dot-bg { background-image: radial-gradient(circle, rgb(0 0 0 / 0.18) 1px, transparent 1.2px); background-size: 12px 12px; }
.spec-label { font: 500 0.6875rem/1 var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; }
.led { font-family: var(--font-display); color: var(--accent); font-variant-numeric: tabular-nums; }
```
**Type:** Verified: nothing.tech ships Ndot + NType82 (Nothing's own) + LL Lettera Mono (Lineto) + Geist; teenage.engineering ships custom te-20/te-40 faces with `#f05a24` orange and `#fab413` yellow in its CSS. Free: Doto (Google, dot-matrix variable) for numerals, Geist + Geist Mono for text. Paid: Eurostile/Microgramma (Linotype), PP Neue Machina.
**Motion:** Stepped 60-480ms (`steps()`), GSAP ScrambleText on numerals, LED flicker on load, analog meters with a stiff spring. Never: blur, glass, organic morphs, long fades.
**Layout:** Product-centric, exploded diagrams with leader lines, modular grids of specs, numbered callouts, small uppercase labels.
**Imagery/icons:** Studio product photography on seamless grey; technical line drawings; pixel/dot icons.
**References:** nothing.tech, teenage.engineering, analogue.co, play.date, rabbit.tech.
**Fits:** consumer hardware, audio, synths, cameras, gadgets, dev tools with personality. **Misfits:** wellness, luxury fashion, finance.
**Slop tells -> credible:** Tell = synthwave sunset grid with magenta/cyan (that is outrun, a different and tired thing). Credible = industrial language: part numbers, labels, one signal color, dot-matrix only for numerals/short labels, product as hero.

### 13. Terminal / ASCII / hacker
**Essence:** Monospace grid, real commands, ASCII art and keyboard-first interaction; the site feels like a well-made tool.
**Signature traits:**
- Monospace for UI, labels and code; a proportional face for paragraphs.
- `ch`-based layout, box-drawing frames, [bracketed] buttons.
- Install command with copy button as hero CTA.
- ASCII/character-cell animations generated from real imagery.

```css
:root {
  --bg: #080f11; --surface: #0f1719; --fg: #e7e7e8; --muted: #8b9092;
  --accent: #48d597; --accent-2: #c58cff; --line: #303235;
  --radius: 0px; --border: 1px solid var(--line); --shadow: none; --grain: 0;
  --font-display: "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace;
  --font-body: "Suisse Intl", "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace;
  --dur-fast: 0ms; --dur-base: 120ms; --dur-slow: 400ms; --ease: steps(4, end);
}
.term { font: 400 0.9375rem/1.6 var(--font-mono); max-width: 80ch; }
.term .prompt::before { content: "$ "; color: var(--accent); }
.cursor { display: inline-block; width: 1ch; height: 1.1em; background: var(--accent); vertical-align: text-bottom; animation: blink 1s steps(2, start) infinite; }
@keyframes blink { to { visibility: hidden; } }
.btn-term { font-family: var(--font-mono); border: var(--border); padding: 0.4rem 1ch; }
.btn-term::before { content: "["; }
.btn-term::after { content: "]"; }
```
**Type:** Verified: oxide.computer ships Suisse Int'l + GT America Mono on `#080f11` with `#48d597` green; ghostty.org ships JetBrains Mono + Pretendard; terminal.shop ships Geist Mono + Instrument Serif. Paid: Berkeley Mono (US Graphics), GT America Mono (Grilli). Free: JetBrains Mono, IBM Plex Mono, Commit Mono, Departure Mono (pixel), Geist Mono.
**Motion:** Stepped. Typing via `steps()` at 30-60ms per char (once, not looping), cursor blink `steps(2)`, character-cell ASCII animation at 12-24fps (canvas or pre-baked frames, as on ghostty.org), text scramble 300-500ms on hover. Never: eased layout motion, blur, soft shadows. See `text-effects.md` for scramble/typing.
**Layout:** 80-120ch content column, box-drawn panels, tables, keyboard hints, command palette.
**Imagery/icons:** ASCII renders of real imagery (luminance -> character ramp), terminal screenshots, no stock photos; icons as characters.
**References:** ghostty.org, terminal.shop, charm.land (Charm, formerly charm.sh), oxide.computer, opencode.ai.
**Fits:** CLIs, dev tools, infra, security, hacker events, dev personal sites. **Misfits:** mass consumer, older audiences, luxury.
**Slop tells -> credible:** Tell = Matrix rain, green-on-black everything, fake "hacking" typewriters on every heading, mono paragraphs that tire the eye. Credible = commands that actually work and copy, mono for UI + proportional for prose, ASCII generated from real assets, AA contrast for muted text, blinking cursor stopped under reduced motion.

### 14. Maximalist collage
**Essence:** Many voices on one page (cutout photos, stickers, several type styles, clashing flat colors) held together by a hidden grid and one reading path.
**Signature traits:**
- Cutout product/people photos with alpha, layered and rotated.
- 3-4 flat spot colors at full saturation, hard edges.
- Condensed heavy display + a serif interjection + a workhorse sans.
- Marquees, stickers, hand-drawn arrows, loud CTAs.

```css
:root {
  --bg: #f7f1e3; --surface: #ffffff; --fg: #111111; --muted: #444444;
  --accent: #ff3d2e; --accent-2: #1f4fff; --line: #111111;
  --radius: 14px; --border: 2px solid var(--line); --shadow: 5px 5px 0 var(--line); --grain: 0.06;
  --font-display: "Druk", "Anton", Impact, sans-serif;
  --font-body: "Archivo", system-ui, sans-serif;
  --font-mono: "DM Serif Display", Georgia, serif; /* the interjection voice */
  --dur-fast: 120ms; --dur-base: 300ms; --dur-slow: 600ms; --ease: cubic-bezier(0.34, 1.56, 0.64, 1);
  --yellow: #ffd400; --green: #00b36b;
}
.sticker { filter: drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 6px 10px rgb(0 0 0 / 0.25)); }
.slap { animation: slap var(--dur-base) var(--ease) both; }
@keyframes slap { from { transform: scale(1.35) rotate(-10deg); opacity: 0; } to { transform: scale(1) rotate(var(--r, -3deg)); opacity: 1; } }
```
**Type:** Druk / Druk Wide (Commercial Type), Obviously and Degular (OH no Type). Free: Anton or Big Shoulders Display + Archivo + DM Serif Display (Google). Max three families, each with a named job.
**Motion:** Stickers slap in (scale 1.35 -> 1 with overshoot, 250-400ms), marquees, hover image swaps, cursor-following product. Never: everything moving at once; body copy never moves. Stacked `drop-shadow` filters are fine on small stickers, costly on large or animated elements (pre-bake the outline into the PNG instead).
**Layout:** Underlying 12-col grid; layers overlap across columns; rotation -6 to 6deg; one clear CTA path per section.
**Imagery/icons:** Real product photography cut out; torn paper, tape, hand-drawn doodles; sprite atlases for many small assets.
**References:** liquiddeath.com, mschf.com, drinkolipop.com, graza.co.
**Fits:** DTC beverages/snacks, streetwear, music, festivals, entertainment, youth brands. **Misfits:** enterprise, healthcare, finance, government services.
**Slop tells -> credible:** Tell = clip-art stickers, six fonts, no hierarchy, 8MB of PNGs. Credible = art-directed cutouts of the real product, limited palette per section, one reading path, AVIF/WebP with explicit sizes, `loading="lazy"` below the fold.

### 15. Anti-design
**Essence:** Deliberately "wrong" choices (default UI, clashing type, overlapping windows, harsh color) in service of one clear concept, while still working.
**Signature traits:**
- Visible defaults (Times, Arial, blue links, grey bevel buttons) used knowingly.
- Overlaps, rotated or mirrored text, scale mismatches.
- Harsh RGB colors, marquees, cursor trails, abrupt state changes.

```css
:root {
  --bg: #ffffff; --surface: #c0c0c0; --fg: #000000; --muted: #333333;
  --accent: #0000ff; --accent-2: #ff00ff; --line: #000000;
  --radius: 0px; --border: 2px outset #dcdcdc; --shadow: none; --grain: 0;
  --font-display: "Terminal Grotesque", "Times New Roman", serif;
  --font-body: "Times New Roman", Times, serif;
  --font-mono: "Courier New", monospace;
  --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; --ease: steps(1, end);
}
.window { background: var(--surface); border: var(--border); position: absolute; min-width: 260px; }
.window h2 { background: var(--accent); color: #fff; font: 700 13px/1.6 var(--font-mono); margin: 0; padding: 0 6px; }
@media (max-width: 760px) { .window { position: static; margin: 12px 0; } }
```
**Type:** Terminal Grotesque (Velvetyne, libre), Redaction (free, redaction.us), ABC Monument Grotesk Semi-Mono (Dinamo), system defaults used ironically.
**Motion:** Abrupt jumps, `steps(1)`, draggable windows, cursor trails, blinking under 3 flashes/sec (WCAG 2.3.1). Never: break the back button or scroll, hide content from screen readers, trap focus.
**Layout:** Absolute-positioned windows or overlapping blocks on desktop; collapses to a readable single column on mobile.
**Imagery/icons:** Low-res GIFs, screenshots, default OS icons, scanned material.
**References:** art.yale.edu (Yale School of Art, the famous wiki-edited site), lingscars.com, cameronsworld.net, balenciaga.com.
**Fits:** art schools, avant-garde fashion, musicians, experimental portfolios, cultural events. **Misfits:** anything transactional for a mass audience.
**Slop tells -> credible:** Tell = chaos without a concept. Credible = one rule broken consistently (e.g., "everything is a draggable OS window"), everything else accessible: visible focus, readable body size, working nav, mobile fallback.

### 16. Kinetic typographic
**Essence:** Type is the image and the motion: variable-axis animation, viewport-filling words, scroll-scrubbed letterforms; few or no photos.
**Signature traits:**
- Headlines at 12-30vw, often edge-to-edge.
- Variable fonts animated on width/weight/slant axes.
- Split-text choreography (chars/words/lines) tied to scroll or pointer.
- Monochrome base with one hot color.

```css
:root {
  --bg: #0e0e0e; --surface: #181818; --fg: #f2f2f2; --muted: #8a8a8a;
  --accent: #ff4d00; --accent-2: #f2f2f2; --line: rgb(255 255 255 / 0.12);
  --radius: 0px; --border: 1px solid var(--line); --shadow: none; --grain: 0.03;
  --font-display: "GT Flexa", "Anybody", system-ui, sans-serif;
  --font-body: "ABC Diatype", "Hanken Grotesk", system-ui, sans-serif;
  --font-mono: "ABC Diatype Mono", "JetBrains Mono", ui-monospace, monospace;
  --dur-fast: 200ms; --dur-base: 800ms; --dur-slow: 1400ms; --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
.mega { font-family: var(--font-display); font-size: clamp(4rem, 18vw, 22rem); line-height: 0.82; letter-spacing: -0.04em; font-variation-settings: "wdth" 100, "wght" 800; transition: font-variation-settings var(--dur-base) var(--ease); }
@media (hover: hover) and (pointer: fine) { .mega:hover { font-variation-settings: "wdth" 150, "wght" 900; } }
```
**Type:** GT Flexa (Grilli), ABC Whyte Inktrap / ABC Diatype (Dinamo), PP Neue Machina (Pangram Pangram), Druk. Free variable: Anybody (wdth 50-150), Roboto Flex, Bricolage Grotesque, Big Shoulders, Recursive, Climate Crisis (Google). Check each font's axis ranges before animating.
**Motion:** GSAP SplitText (free since 3.13; `mask` and `autoSplit`) staggers 20-40ms per char, 600-1200ms expo-out; axis tweens on hover/scroll; marquees; 3D text rings. Never: animate `font-size` (use transform), move body text or nav labels after they settle, split long paragraphs into chars. See `text-effects.md` and `typography.md`.
**Layout:** Type-only hero, words as section dividers, grids of letters, sparse images used as punctuation.
**Imagery/icons:** Minimal; video inside letterforms needs an SVG mask or WebGL (CSS `background-clip: text` does not take video).
**References:** dia.studio (DIA, kinetic identity studio), obys.agency, abcdinamo.com, pangrampangram.com, locomotive.ca.
**Fits:** agencies, foundries, music, events, fashion campaigns, launches, portfolios. **Misfits:** long-form docs, commerce catalogs, dashboards.
**Slop tells -> credible:** Tell = every heading does the same letter fade-up. Credible = one kinetic system with a rule (e.g., all section heads enter via the width axis), motion tied to meaning, static final state for reduced motion, subsetted variable fonts (<= 80kb per face).

### 17. Soft 3D / clay
**Essence:** Matte, pastel, slightly squishy 3D objects and rounded UI; friendly, tactile, toy-like, springy.
**Signature traits:**
- Clay-render objects (soft AO, subsurface feel, no hard specular) in 2-4 pastel hues.
- Rounded display type and fat rounded buttons.
- Layered soft shadows; nothing sharp.
- Squash-and-stretch on press, idle floating.

```css
:root {
  --bg: #f3efe9; --surface: #ffffff; --fg: #1f2330; --muted: #5e6475;
  --accent: #ff7a59; --accent-2: #7c9cff; --line: #e6e0d6;
  --radius: 28px; --border: none;
  --shadow: 0 1px 2px rgb(31 35 48 / 0.06), 0 12px 32px -8px rgb(31 35 48 / 0.18);
  --grain: 0;
  --font-display: "GT Maru", "Fredoka", system-ui, sans-serif;
  --font-body: "Figtree", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --dur-fast: 150ms; --dur-base: 450ms; --dur-slow: 4000ms; --ease: cubic-bezier(0.34, 1.56, 0.64, 1);
}
.clay-btn { border-radius: 999px; background: var(--accent); color: #fff; box-shadow: inset 0 -4px 0 rgb(0 0 0 / 0.12), var(--shadow); transition: transform var(--dur-fast) var(--ease); }
.clay-btn:active { transform: scale(1.04, 0.92); }
.float { animation: float var(--dur-slow) ease-in-out infinite alternate; }
@keyframes float { from { transform: translateY(-6px) rotate(-1deg); } to { transform: translateY(6px) rotate(1deg); } }
```
**Type:** GT Maru (Grilli, rounded), SF Pro Rounded (Apple platforms only). Free: Fredoka (Google, display) + Figtree (Google, body); M PLUS Rounded 1c for CJK. Avoid Nunito as the default rounded face (overused).
**Motion:** Springs with bounce 0.3-0.5 (Motion `transition={{ type: "spring", bounce: 0.4 }}`), squash on press, idle float 3-5s sine, pointer-tilt on 3D objects capped at 10-15deg. Never: linear motion, hard shadows, glitch.
**Layout:** Friendly centered hero with 1-3 floating objects, rounded cards, big pill CTAs, generous spacing.
**Imagery/icons:** Blender/Spline clay renders with one consistent light rig; Microsoft Fluent 3D emoji (MIT, github.com/microsoft/fluentui-emoji, ~10k stars) as a free asset base; Airbnb's 2025 redesign popularized 3D clay-like icons.
**References:** airbnb.com (3D icon system), spline.design and app.spline.design/community, github.com/microsoft/fluentui-emoji, messenger.abeto.co (stylized toy planet, SOTY 2025).
**Fits:** consumer apps, fintech for young users, education, onboarding, friendly AI assistants, games. **Misfits:** serious B2B, luxury, news, legal.
**Slop tells -> credible:** Tell = a Spline-template blob with floating emoji, loading a multi-MB runtime for decoration. Credible = one material and light rig across all assets, pre-rendered AVIF/WebP for decorative objects, real-time 3D only where interaction adds meaning, lazy-load 3D after LCP. See `webgl-shaders-3d.md`.

### 18. Tactile skeuomorphic 2.0
**Essence:** Physical-feeling controls with a believable light model: pressable keys, knobs, toggles and product surfaces, without 2012 leather and linen.
**Signature traits:**
- Single key light (top-left): inset top highlight, soft drop shadow, subtle gradients.
- Controls that look pressable ARE pressable, with 1-2px travel.
- Real product photography/renders with reflections.
- Micro-detail: dividers with emboss, LED indicators, sound optional.

```css
:root {
  --bg: #e9e7e3; --surface: #f4f3f0; --fg: #1b1b1b; --muted: #5f5d58;
  --accent: #ff5a1f; --accent-2: #3cff7a; --line: rgb(0 0 0 / 0.08);
  --radius: 14px; --border: 1px solid var(--line);
  --shadow: inset 0 1px 0 rgb(255 255 255 / 0.85), 0 1px 1px rgb(0 0 0 / 0.08), 0 6px 16px -6px rgb(0 0 0 / 0.25);
  --grain: 0.03;
  --font-display: "Söhne", "Geist", system-ui, sans-serif;
  --font-body: "Söhne", "Geist", system-ui, sans-serif;
  --font-mono: "Söhne Mono", "Geist Mono", ui-monospace, monospace;
  --dur-fast: 90ms; --dur-base: 160ms; --dur-slow: 320ms; --ease: cubic-bezier(0.2, 0, 0, 1);
}
.key { background: linear-gradient(180deg, #fbfaf8, #e6e4df); border: var(--border); border-radius: var(--radius); box-shadow: var(--shadow); transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease); }
.key:active { transform: translateY(1.5px); box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.18), 0 0 0 rgb(0 0 0 / 0); }
.led-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-2); box-shadow: 0 0 6px var(--accent-2); }
```
**Type:** Söhne / Söhne Mono (Klim), system SF Pro. Free: Geist + Geist Mono. Labels small, mono, uppercase, like silkscreened hardware.
**Motion:** Physical: 90-160ms press, toggles with a stiff spring (Motion stiffness 500-700, damping 30-40), knobs rotate with drag (GSAP Draggable + InertiaPlugin, free since 3.13). Never: floaty fades, long easing on direct manipulation, parallax.
**Layout:** Device-like panels, controls as content, product hero with realistic lighting, specs in engraved-looking modules.
**Imagery/icons:** Studio renders/photos; icons as engraved glyphs (Phosphor Regular at 70% opacity with inset shadow).
**References:** op.al (Opal Tadpole page, Awwwards SOTY 2024), family.co, teenage.engineering, devouringdetails.com (Rauno Freiberg's interaction-detail course), thelightphone.com.
**Fits:** hardware, audio tools, cameras, premium utilities, wallets, craft apps. **Misfits:** editorial content, enterprise dashboards, mass e-commerce.
**Slop tells -> credible:** Tell = 2020 neumorphism: grey-on-grey extrusions with no contrast, every card raised. Credible = one light model, depth only on interactive controls, AA text contrast, real product imagery, micro-interactions tuned to milliseconds (see `interactions.md`).

### 19. Gradient-mesh SaaS
**Essence:** A living color field (WebGL mesh gradient) behind crisp typography and product UI; energetic but trustworthy.
**Signature traits:**
- Animated mesh gradient in the hero or as section dividers, slow drift.
- Skewed section edges, layered product cards with deep soft elevation.
- White/very light page with a navy ink; brand-specific gradient hues.

```css
:root {
  --bg: #f6f9fc; --surface: #ffffff; --fg: #0a2540; --muted: #425466;
  --accent: #635bff; --accent-2: #ff6118; --line: #e3e8ee;
  --radius: 10px; --border: 1px solid var(--line);
  --shadow: 0 50px 100px -20px rgb(50 50 93 / 0.25), 0 30px 60px -30px rgb(0 0 0 / 0.3);
  --grain: 0.02;
  --font-display: "Söhne", "Instrument Sans", system-ui, sans-serif;
  --font-body: "Söhne", "Instrument Sans", system-ui, sans-serif;
  --font-mono: "Söhne Mono", "JetBrains Mono", ui-monospace, monospace;
  --dur-fast: 150ms; --dur-base: 600ms; --dur-slow: 20000ms; --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --mesh-1: #ee30fb; --mesh-2: #ff6118; --mesh-3: #ffd601; --mesh-4: #635bff;
}
.skew-section { clip-path: polygon(0 12%, 100% 0, 100% 88%, 0 100%); }
/* Static fallback (reduced motion / no WebGL): layered radial gradients from the same tokens */
.mesh-fallback { background: radial-gradient(60% 80% at 10% 20%, var(--mesh-1), transparent 60%), radial-gradient(50% 70% at 80% 10%, var(--mesh-2), transparent 60%), radial-gradient(60% 80% at 70% 90%, var(--mesh-3), transparent 60%), var(--mesh-4); }
```
**Type:** Verified: stripe.com ships Söhne (variable) with `#635bff`, `#533afd`, `#ee30fb`, `#ff6118`, `#ffd601` in its CSS. Free: Instrument Sans or Hanken Grotesk.
**Motion:** Mesh drift 10-30s per cycle (never faster), paused offscreen via IntersectionObserver; content reveals 500-700ms expo-out; card tilt on hover <= 6deg. Never: hue cycling, fast gradient motion (seasick), gradient on body text. Implementation: `@paper-design/shaders-react` MeshGradient, ShaderGradient (shadergradient.co), or a custom fragment shader; see `backgrounds-svg-canvas.md` and `webgl-shaders-3d.md`.
**Layout:** Hero headline over the mesh (left-aligned), product cards overlapping the mesh edge, logo wall, docs/code snippets.
**Imagery/icons:** Product UI in floating cards; small duotone icons; no stock photos.
**References:** stripe.com, paper.design, shadergradient.co, meshgradient.com (generator).
**Fits:** payments, fintech infra, SaaS platforms, AI APIs, launches. **Misfits:** heritage craft, luxury, earthy wellness.
**Slop tells -> credible:** Tell = violet-to-blue blob gradient + glass card (the "AI purple"). Credible = mesh hues from the brand (not default indigo), gradient confined to one hero surface or dividers, grain/dither to kill banding, paused offscreen, static fallback for reduced motion and no-WebGL.

### 20. Grainy risograph / print
**Essence:** Spot-ink print simulated on screen: 2-3 fluorescent inks overprinting (multiply), halftone photos, misregistration and paper grain.
**Signature traits:**
- Limited ink palette per composition; overlaps create the third color.
- Halftone or duotone photos; visible grain; slight plate offset.
- Poster-like sections, each with its own two-ink story.

```css
:root {
  --bg: #f4efe6; --surface: #fbf8f2; --fg: #1b1b1b; --muted: #5b564f;
  --accent: #ff48b0; --accent-2: #0078bf; --line: #1b1b1b;
  --radius: 0px; --border: 2px solid var(--line); --shadow: none; --grain: 0.12;
  --font-display: "GT Pressura", "Bricolage Grotesque", system-ui, sans-serif;
  --font-body: "Young Serif", Georgia, serif;
  --font-mono: "GT Pressura Mono", "Courier Prime", monospace;
  --dur-fast: 80ms; --dur-base: 240ms; --dur-slow: 600ms; --ease: steps(3, end);
  --riso-yellow: #ffe800; --riso-teal: #00838a; --riso-orange: #ff6c2f; --riso-green: #00a95c;
}
.overprint { position: relative; color: var(--accent); mix-blend-mode: multiply; }
.overprint::after { content: attr(data-text); position: absolute; inset: 0; color: var(--accent-2); mix-blend-mode: multiply; transform: translate(2px, -1px); }
.halftone { background-image: radial-gradient(circle at center, var(--fg) 30%, transparent 31%); background-size: 6px 6px; }
.duotone img { filter: grayscale(1) contrast(1.2); mix-blend-mode: multiply; }
.duotone { background: var(--accent); }
```
**Type:** GT Pressura / GT Pressura Mono (Grilli; ink-trap print feel, named in Fontfabric's 2026 trend report), Obviously (OH no Type). Free: Bricolage Grotesque + Young Serif + Courier Prime (Google). Velvetyne libre faces also fit.
**Motion:** Stop-motion: grain "boil" by swapping 3-4 pre-made noise tiles with `steps()` at 8-12fps, misregistration jitter on hover (1-3px), paper slide-ins. Never: glossy transitions, glass, glows; never animate `feTurbulence` parameters full-screen (CPU-heavy).
**Layout:** Poster sections, big type overlapping halftone images, stamps and folios, visible page numbers.
**Imagery/icons:** Halftoned photography, hand-cut shapes, stamps; icons drawn with a marker.
**References:** risottostudio.com, printedmatter.org, posterhouse.org, webflow.com/made-in-webflow (search "risograph").
**Fits:** culture venues, bookshops, zines, music, festivals, indie brands, craft food. **Misfits:** fintech, medical, enterprise.
**Slop tells -> credible:** Tell = a grain overlay sprinkled on a generic SaaS page. Credible = real ink logic (2-3 inks, multiply overprints), halftoned imagery, grain kept low on text (or excluded via stacking), grain as a static tiled asset on a fixed `pointer-events: none` layer.

### 21. Monochrome photographic
**Essence:** Photography leads, typography recedes into small grotesk captions; black, white and grey only.
**Signature traits:**
- Full-bleed or large-grid images; consistent grading.
- Tiny captions and index numbers; almost no UI chrome.
- Slow crossfades and clip reveals; drag galleries.

```css
:root {
  --bg: #0a0a0a; --surface: #141414; --fg: #f5f5f5; --muted: #8c8c8c;
  --accent: #f5f5f5; --accent-2: #8c8c8c; --line: #262626;
  --radius: 0px; --border: none; --shadow: none; --grain: 0.02;
  --font-display: "Neue Haas Grotesk Display", "Hanken Grotesk", system-ui, sans-serif;
  --font-body: "Akkurat LL", "Hanken Grotesk", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --dur-fast: 200ms; --dur-base: 700ms; --dur-slow: 1200ms; --ease: cubic-bezier(0.76, 0, 0.24, 1);
}
.reveal-img { clip-path: inset(0 0 100% 0); transition: clip-path var(--dur-slow) var(--ease); }
.reveal-img.is-in { clip-path: inset(0 0 0 0); }
.caption { font: 400 0.75rem/1.4 var(--font-body); color: var(--muted); font-variant-numeric: tabular-nums; }
```
**Type:** Neue Haas Grotesk, Akkurat LL (Lineto), Founders Grotesk (Klim). Free: Hanken Grotesk + IBM Plex Mono. Optional light serif titles (Cormorant Garamond) for fashion.
**Motion:** 700-1200ms `cubic-bezier(0.76,0,0.24,1)`; clip-path reveals on a few hero images (fine at this scale, avoid scrubbing many at once), crossfades, cursor "View" label (pointer: fine only), horizontal drag galleries with inertia. Never: color flashes, bounce, text animation competing with images.
**Layout:** Image grid with index numbers, full-bleed sequences, lightbox, minimal nav in corners.
**Imagery/icons:** Real photography, graded consistently, AVIF with `srcset`/`sizes`, LCP image `fetchpriority="high"`; no icons.
**References:** magnumphotos.com, rickowens.eu, leica-camera.com, yohjiyamamoto.co.jp.
**Fits:** photographers, fashion, architecture, film, galleries. **Misfits:** SaaS, anything without strong photography.
**Slop tells -> credible:** Tell = `filter: grayscale(1)` on colorful stock photos. Credible = photography graded for monochrome, large sizes, tight captions with real metadata (place, year, camera), performance budget for images.

### 22. Playful illustrative
**Essence:** A consistent illustration system and characters carry the brand; UI is chunky, colorful and forgiving.
**Signature traits:**
- Custom illustration style with fixed line weight and palette.
- Chunky buttons with a darker bottom edge ("3D" press).
- Characters that react (Rive state machines, Lottie).
- Friendly rounded or quirky display type; hand-drawn annotations.

```css
:root {
  --bg: #fffaf0; --surface: #ffffff; --fg: #231f20; --muted: #5c5657;
  --accent: #58cc02; --accent-2: #ffe01b; --line: #e5e0d5;
  --radius: 16px; --border: 2px solid var(--line); --shadow: 0 4px 0 #46a302; --grain: 0;
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --font-mono: "Caveat", cursive; /* annotations only */
  --dur-fast: 120ms; --dur-base: 350ms; --dur-slow: 700ms; --ease: cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chunky { background: var(--accent); color: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 0.8rem 1.4rem; font: 800 1rem/1 var(--font-display); transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease); }
.chunky:active { transform: translateY(4px); box-shadow: 0 0 0 #46a302; }
@media (hover: hover) and (pointer: fine) { .wiggle:hover { animation: wiggle 400ms var(--ease); } }
@keyframes wiggle { 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
```
**Type:** Brands use customs (Duolingo "Feather Bold", Mailchimp "Means", Oatly hand-lettering). Free: Bricolage Grotesque + DM Sans, Baloo 2 for rounder tone, Caveat only for annotations. Accent `#58cc02` / `#ffe01b` are Duolingo green / Mailchimp yellow territory: pick your own brand hues.
**Motion:** Overshoot 250-450ms, wiggles, confetti on success, Rive characters reacting to input (see `backgrounds-svg-canvas.md` for Lottie/Rive). Never: long unskippable intros, motion that delays task completion.
**Layout:** Illustration-led sections, speech bubbles, hand-drawn underlines (SVG path draw), cards with chunky bottoms.
**Imagery/icons:** One illustration system; icons drawn to match illustration line weight (or Phosphor Duotone / Streamline sets with matching stroke).
**References:** oatly.com, duolingo.com, headspace.com, mailchimp.com, notion.com.
**Fits:** education, consumer apps, food/bev, non-profits, kids, onboarding flows. **Misfits:** luxury, security, serious finance.
**Slop tells -> credible:** Tell = "Corporate Memphis" flat people with purple limbs from a default library, emoji as icons. Credible = commissioned or tightly curated consistent style, characters that do something, illustration palette = UI palette.

### 23. Scandinavian calm
**Essence:** Warm neutrals from real materials (oak, linen, clay), quiet grotesk + reading serif, product-in-context photography, zero drama.
**Signature traits:**
- Linen/off-white backgrounds, charcoal text, one material accent.
- Geometric grotesk UI with a serif for stories.
- Honest commerce layouts; photography of objects in lived rooms.

```css
:root {
  --bg: #efeeeb; --surface: #ffffff; --fg: #282828; --muted: #6f6c66;
  --accent: #9a5e18; --accent-2: #c5dbf3; --line: #e0ddd6;
  --radius: 4px; --border: 1px solid var(--line); --shadow: none; --grain: 0;
  --font-display: "Euclid Flex", "Albert Sans", system-ui, sans-serif;
  --font-body: "Euclid Flex", "Albert Sans", system-ui, sans-serif;
  --font-mono: "Spectral", Georgia, serif; /* story/editorial voice */
  --dur-fast: 180ms; --dur-base: 400ms; --dur-slow: 700ms; --ease: cubic-bezier(0.25, 0.8, 0.25, 1);
}
.product-card img + img { position: absolute; inset: 0; opacity: 0; transition: opacity var(--dur-base) var(--ease); }
@media (hover: hover) and (pointer: fine) { .product-card:hover img + img { opacity: 1; } }
```
**Type:** Verified: muuto.com ships Euclid Flex (Swiss Typefaces) + Spectral with `#efeeeb`, `#282828`, `#9a5e18`, `#c5dbf3`. Paid: Aeonik (CoType), Graphik (Commercial Type). Free: Albert Sans (Google, Scandinavian-inspired geometric) + Spectral (Google).
**Motion:** 300-500ms calm ease-out; image swap on hover (studio -> in-room), fades, gentle accordions. Never: parallax, bounce, glitch, big scroll choreography.
**Layout:** 2-4 column product grids, editorial stories between grids, generous but practical whitespace, clear filters.
**Imagery/icons:** Natural-light interiors, material close-ups; thin icons (Phosphor Light, Iconoir).
**References:** muuto.com, audocph.com, framacph.com, fritzhansen.com, arket.com.
**Fits:** furniture, homeware, fashion basics, architecture, hospitality, calm productivity apps. **Misfits:** gaming, nightlife, hype drops.
**Slop tells -> credible:** Tell = beige template with thin sans and nothing else (bland, not calm). Credible = neutrals sampled from the products, precise photography, a serif storytelling layer, one accent with a job.

### 24. Dithered / pixel / 1-bit
**Essence:** Two colors, ordered or error-diffusion dithering, pixel type at integer scales; nostalgic, efficient, honest about bits.
**Signature traits:**
- 1-bit (or 2-4 color) palette; images dithered (Bayer, Floyd-Steinberg, Atkinson).
- Pixel or bitmap fonts for display; clean mono/sans for reading.
- Integer pixel grids, crisp scaling, stepped frame rates.

```css
:root {
  --bg: #e8e4d8; --surface: #f4f1e8; --fg: #111111; --muted: #4a4a4a;
  --accent: #ff4a00; --accent-2: #111111; --line: #111111;
  --radius: 0px; --border: 2px solid var(--line); --shadow: 2px 2px 0 var(--line); --grain: 0;
  --font-display: "Departure Mono", "Geist Pixel", "Silkscreen", ui-monospace, monospace;
  --font-body: "IBM Plex Mono", ui-monospace, monospace;
  --font-mono: "Departure Mono", ui-monospace, monospace;
  --dur-fast: 0ms; --dur-base: 250ms; --dur-slow: 800ms; --ease: steps(8, end);
}
.pixel-img { image-rendering: pixelated; width: calc(var(--native-w) * 3px); height: auto; }
.bayer-bg { background: repeating-conic-gradient(var(--fg) 0 25%, var(--bg) 0 50%) 0 0 / 2px 2px; }
.px-title { font-family: var(--font-display); font-size: 33px; line-height: 1; -webkit-font-smoothing: none; }
```
**Type:** Departure Mono (free, OFL, departuremono.com; design size 11px, use multiples), Vercel's Geist Pixel (square/circle variants, verified in vercel.com CSS), PP Neue Bit / PP Mondwest (Pangram Pangram). Free Google: Silkscreen, Pixelify Sans, Jersey 10, Micro 5. Avoid Press Start 2P as the default.
**Motion:** Stepped (`steps()`), 8-15fps sprite animation, dither-dissolve transitions (threshold a Bayer matrix over time in a shader or canvas). Never: sub-pixel easing on pixel art, blur, smooth scaling of bitmap assets.
**Layout:** 8px grid, window/panel metaphors, small file sizes as a feature (Low-tech Magazine's solar site serves dithered images to save energy).
**Imagery/icons:** Dithered photos (tools: ditherit.com, dither.it), 1-bit icon sets, sprite sheets.
**References:** solar.lowtechmagazine.com, 100r.co (Hundred Rabbits), play.date, vercel.com (Geist Pixel), ditherit.com.
**Fits:** games, indie software, dev tools, low-tech/sustainability, music, retro hardware. **Misfits:** luxury, wellness, mainstream fintech.
**Slop tells -> credible:** Tell = Press Start 2P + 8-bit clichés on a normal layout. Credible = dithering as a real pipeline (consistent algorithm and palette), pixel fonts only at integer multiples of their design size, crisp `image-rendering`, dither used to cut image weight. Set `--native-w` inline per image (its intrinsic width in px).

### 25. Cyber neon
**Essence:** HUD interfaces on near-black: chamfered panels, one or two neon hues with disciplined glow, glitch used as punctuation.
**Signature traits:**
- Near-black violet/blue base, cyan + magenta (or acid yellow) accents.
- Chamfered corners (clip-path), angled dividers, thin HUD lines.
- Short glitch/scramble bursts; scanlines at low opacity.

```css
:root {
  --bg: #07060b; --surface: #0f0d17; --fg: #e9e6ff; --muted: #9a94b3;
  --accent: #00f0ff; --accent-2: #ff2a6d; --line: rgb(0 240 255 / 0.35);
  --radius: 0px; --border: 1px solid var(--line); --shadow: 0 0 12px rgb(0 240 255 / 0.35); --grain: 0.05;
  --font-display: "PP Neue Machina", "Chakra Petch", system-ui, sans-serif;
  --font-body: "Rajdhani", "Chakra Petch", system-ui, sans-serif;
  --font-mono: "Share Tech Mono", "JetBrains Mono", ui-monospace, monospace;
  --dur-fast: 80ms; --dur-base: 180ms; --dur-slow: 600ms; --ease: steps(3, end);
  --chamfer: 14px;
}
.hud { background: var(--surface); border: var(--border); clip-path: polygon(var(--chamfer) 0, 100% 0, 100% calc(100% - var(--chamfer)), calc(100% - var(--chamfer)) 100%, 0 100%, 0 var(--chamfer)); }
.scanlines { background-image: repeating-linear-gradient(0deg, rgb(255 255 255 / 0.03) 0 1px, transparent 1px 3px); }
@media (hover: hover) and (pointer: fine) { .glitch:hover { animation: glitch var(--dur-base) var(--ease) 1; } }
@keyframes glitch { 33% { text-shadow: 2px 0 var(--accent-2), -2px 0 var(--accent); transform: translateX(1px); } 66% { text-shadow: -2px 0 var(--accent-2), 2px 0 var(--accent); transform: translateX(-1px); } }
```
**Type:** PP Neue Machina (Pangram Pangram), Druk Wide. Free: Chakra Petch, Rajdhani, Oxanium, Share Tech Mono (Google). Body in a neutral legible face; avoid Orbitron (cliche).
**Motion:** Glitch bursts 80-180ms on interaction only, scramble text on reveal, HUD lines drawing (SVG stroke), subtle flicker once on load. Never: continuous glitch or flashing above 3 per second (WCAG 2.3.1), glow on body text. Note: `clip-path` also clips `box-shadow`; put glow on a wrapper or use `filter: drop-shadow` on the parent.
**Layout:** Panels with chamfers, diagonal section cuts, data overlays on key art, stat readouts.
**Imagery/icons:** Game key art, 3D renders, line icons with angled terminals (Tabler at stroke 1.5).
**References:** cyberpunk.net, playvalorant.com (neon/sci-fi sites are usually game marketing; browse Awwwards "Games & Entertainment" for current ones).
**Fits:** gaming, esports, sci-fi entertainment, hackathons, events. **Misfits:** most businesses, healthcare, children.
**Slop tells -> credible:** Tell = Orbitron + cyan glow on everything + synthwave grid. Credible = one hue family with a glow budget (only interactive or live elements glow), a chamfer system applied consistently, neutral legible body, flashing within WCAG thresholds.

### 26. Data-dense instrument panel
**Essence:** Information first: dense grids, tabular numbers, semantic color only, live updates; motion exists only to explain change.
**Signature traits:**
- Small base size (13-14px), tight rows, split panes, sticky headers.
- Tabular numerals everywhere; right-aligned numbers.
- Color reserved for meaning (up/down/warn/info), never decoration.

```css
:root {
  --bg: #0b0e11; --surface: #12161b; --fg: #e6e8eb; --muted: #8b949e;
  --accent: #3b82f6; --accent-2: #f59e0b; --line: #1f242b;
  --radius: 4px; --border: 1px solid var(--line); --shadow: none; --grain: 0;
  --font-display: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  --font-body: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", "Geist Mono", ui-monospace, monospace;
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 600ms; --ease: cubic-bezier(0.2, 0, 0, 1);
  --up: #22c55e; --down: #ef4444;
}
.panel { font: 400 13px/1.45 var(--font-body); font-variant-numeric: tabular-nums; }
.panel td.num { text-align: right; font-family: var(--font-mono); }
.flash-up { animation: flash-up var(--dur-slow) var(--ease); }
@keyframes flash-up { from { background: color-mix(in oklab, var(--up) 25%, transparent); } to { background: transparent; } }
```
**Type:** IBM Plex Sans + Plex Mono (Google), Inter with `tnum` (acceptable here: it is a workhorse, not the brand voice), Geist Mono, Berkeley Mono (paid). Always `font-variant-numeric: tabular-nums`.
**Motion:** 120-200ms; animated number transitions (`@number-flow/react`), row flash on update 600ms, sparklines drawn once, live pulse dots. Never: decorative motion, page transitions that delay data, chart animations on every re-render.
**Layout:** 12-16 col dense grid, resizable panes, tables with sticky headers, small multiples, command palette, keyboard shortcuts.
**Imagery/icons:** Charts are the imagery (follow the `dataviz` skill); 16px icons (Lucide, Radix Icons).
**References:** radar.cloudflare.com, windy.com, flightradar24.com, oxide.computer, planetscale.com.
**Fits:** dashboards, trading, observability, analytics, research tools, admin panels. **Misfits:** consumer marketing pages.
**Slop tells -> credible:** Tell = giant KPI cards with fake numbers and purple gradient area charts. Credible = real data, alignment of numbers, density with hierarchy (size and weight, not color), semantic color only, empty/loading/error states designed.

### 27. Immersive WebGL studio
**Essence:** The page is a real-time 3D scene; DOM text floats over a canvas; scroll drives camera and story. The Awwwards SOTY archetype.
**Signature traits:**
- Full-viewport canvas under minimal DOM overlays.
- Preloader with real progress, then cinematic intro.
- Scroll-choreographed camera, post-processing (bloom, grain, subtle chromatic aberration).
- Custom cursor and sound toggles.

```css
:root {
  --bg: #0b0b0c; --surface: #151517; --fg: #f4f4f5; --muted: #9a9aa0;
  --accent: #0016ec; --accent-2: #ff4c41; --line: rgb(255 255 255 / 0.14);
  --radius: 999px; --border: 1px solid var(--line); --shadow: none; --grain: 0.04;
  --font-display: "Aeonik", "General Sans", system-ui, sans-serif;
  --font-body: "Aeonik", "General Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --dur-fast: 200ms; --dur-base: 900ms; --dur-slow: 1600ms; --ease: cubic-bezier(0.87, 0, 0.13, 1);
}
.stage { position: fixed; inset: 0; z-index: 0; }
.stage canvas { display: block; width: 100%; height: 100%; }
.overlay { position: relative; z-index: 1; pointer-events: none; }
.overlay a, .overlay button { pointer-events: auto; }
```
**Type:** Verified: lusion.co ships Aeonik (CoType) + IBM Plex Mono + a custom LusionMono, with `#0016ec` blue. Studio staples: PP Neue Montreal, ABC Diatype, Aeonik. Free: General Sans or Satoshi (Fontshare) + IBM Plex Mono.
**Motion:** Camera damping lerp 0.05-0.1 per frame; ScrollTrigger scrub 1-1.5; page transitions 900-1600ms; preloader <= 3s. Cap DPR at 1.5-2, pause render loop offscreen/hidden tab. Never: 30fps jank on a mid laptop, scroll-jacking without Lenis-quality feel, blocking content behind a 10s intro. See `webgl-shaders-3d.md`, `scroll-gsap.md`, `page-transitions.md`.
**Layout:** Canvas-first; case-study pages switch to calmer DOM layouts (Swiss or Minimal) for reading.
**Imagery/icons:** Custom 3D (glTF with Draco/meshopt, KTX2 textures), baked lighting, HDRI; icons minimal.
**References:** lusion.co, activetheory.net, igloo.inc (abeto, SOTY 2024), messenger.abeto.co (abeto, SOTY 2025), landonorris.com (OFF+BRAND, SOTY 2025), bruno-simon.com, immersive-g.com, resn.co.nz, 14islands.com, dogstudio.co, unseen.co.
**Fits:** agencies, product launches, games, automotive, entertainment, creative-dev portfolios. **Misfits:** content-heavy, SEO-critical commerce, low-end-device audiences, accessibility-critical services.
**Slop tells -> credible:** Tell = a generic particle sphere or floating torus knot with bloom, unrelated to the brand. Credible = a scene that IS the brand story, initial payload budget (aim <= 3-5MB before interaction), poster/static fallback for no-WebGL and reduced motion, real HTML text for SEO and screen readers.

### 28. Scrapbook / sticker
**Essence:** A desk surface or pinboard: polaroids, tape, tickets, handwritten notes and draggable stickers, with real content on readable paper cards.
**Signature traits:**
- Paper/kraft or grid-paper backgrounds; tape strips; slight rotations.
- Die-cut stickers with white outline; polaroid frames.
- Draggable, throwable pieces with inertia.
- Handwriting only for annotations; readable text in cards.

```css
:root {
  --bg: #f6f1e7; --surface: #fffdf8; --fg: #1e1e1e; --muted: #5a554c;
  --accent: #ff6b6b; --accent-2: #ffd93d; --line: #d9cfbf;
  --radius: 6px; --border: 1px solid var(--line); --shadow: 0 2px 6px rgb(0 0 0 / 0.18), 0 12px 24px -12px rgb(0 0 0 / 0.25); --grain: 0.05;
  --font-display: "Young Serif", Georgia, serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --font-mono: "Gochi Hand", cursive; /* notes only */
  --dur-fast: 150ms; --dur-base: 300ms; --dur-slow: 700ms; --ease: cubic-bezier(0.34, 1.56, 0.64, 1);
}
.polaroid { background: #fff; padding: 10px 10px 36px; box-shadow: var(--shadow); transform: rotate(var(--r, 0deg)); }
.tape { position: absolute; top: -12px; left: 50%; width: 90px; height: 26px; translate: -50% 0; rotate: -4deg; background: rgb(255 240 200 / 0.75); box-shadow: 0 1px 2px rgb(0 0 0 / 0.1); }
.grid-paper { background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 24px 24px; }
```
```ts
// Deterministic rotations: same on server and client (no hydration mismatch), stable across renders.
export function seededRotation(id: string, maxDeg = 6): string {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  const unit = ((h >>> 0) % 1000) / 999; // 0..1
  return `${((unit * 2 - 1) * maxDeg).toFixed(2)}deg`;
}
// usage: <figure className="polaroid" style={{ ["--r" as string]: seededRotation(item.id) }} />
```
**Type:** Free: Young Serif or DM Serif Display (headings), DM Sans (body), Gochi Hand / Reenie Beanie / Caveat (notes), Special Elite or Courier Prime (typewriter labels). Velvetyne's libre faces for zine flavor.
**Motion:** Drag with inertia (GSAP Draggable + InertiaPlugin, or Motion `drag` with `dragTransition`), hover lift + rotate toward 0, polaroid "develop" fade 700ms. Never: everything wobbling continuously, random rotation recomputed each render.
**Layout:** Free-form board on desktop (absolute positions from data), stacked readable list on mobile; each item keyboard-focusable.
**Imagery/icons:** Real photos in frames, scanned tickets and tape textures, die-cut stickers (outline baked into PNG/WebP).
**References:** partiful.com, cameronsworld.net, maggieappleton.com.
**Fits:** events and invites, personal sites, community, travel, education, creators. **Misfits:** enterprise, finance, healthcare.
**Slop tells -> credible:** Tell = random stickers everywhere and SSR hydration errors from `Math.random()` rotations. Credible = seeded rotations, one consistent paper/tape asset set, readable text blocks, drag that is optional (content reachable without it).

### 29. Corporate-premium (fintech)
**Essence:** Quiet confidence: light surfaces, a trustworthy serif headline, precise grotesk UI, real product screenshots, meticulous numbers.
**Signature traits:**
- Serif display for trust + grotesk UI + mono for figures.
- Muted ink (not pure black), one calm brand hue.
- Product UI in clean frames; compliance and security signals placed calmly.

```css
:root {
  --bg: #fbfcfd; --surface: #ffffff; --fg: #272735; --muted: #70707d;
  --accent: #4d68eb; --accent-2: #167e6c; --line: #dddde5;
  --radius: 10px; --border: 1px solid var(--line);
  --shadow: 0 1px 2px rgb(16 24 40 / 0.05), 0 8px 24px -12px rgb(16 24 40 / 0.12); --grain: 0;
  --font-display: "Tiempos Headline", "Source Serif 4", Georgia, serif;
  --font-body: "Arcadia", "Instrument Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --dur-fast: 150ms; --dur-base: 300ms; --dur-slow: 600ms; --ease: cubic-bezier(0.2, 0, 0, 1);
}
.money { font-family: var(--font-mono); font-variant-numeric: tabular-nums slashed-zero; }
.fin-h1 { font: 400 clamp(2.5rem, 5vw, 4.5rem)/1.05 var(--font-display); letter-spacing: -0.02em; text-wrap: balance; }
```
```ts
// Always format money with Intl; never hand-build currency strings.
export const formatMoney = (value: number, currency = "USD", locale = "en-US") =>
  new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
```
**Type:** Verified: mercury.com ships Arcadia + Arcadia Display + Tiempos (Klim) + IBM Plex Mono with ink `#272735`, muted `#70707d`, line `#dddde5`, blue `#4d68eb`; column.com ships Suisse Int'l / Suisse Neue / Suisse Int'l Mono with `#167e6c` green and `#011821` deep ink; stripe.com ships Söhne. Free: Source Serif 4 + Instrument Sans + IBM Plex Mono (Google).
**Motion:** 150-600ms restrained ease-out; product UI micro-demos (a transaction list sliding in, a card number revealing), count-ups once per page view. Never: gimmicks, cursor effects, bouncy springs, dark-tech glows.
**Layout:** Left-aligned serif hero + product frame, feature rows with real UI crops, comparison tables, pricing, calm trust band (regulatory notes, logos).
**Imagery/icons:** Product screenshots, occasional editorial photography of people at work; 1.5px icons.
**References:** mercury.com, column.com, ramp.com, brex.com, plaid.com, stripe.com.
**Fits:** banks, fintech, B2B finance, legal, insurance, enterprise SaaS. **Misfits:** youth culture, entertainment.
**Slop tells -> credible:** Tell = navy + gold + stock handshake, or a dark-tech clone with purple glow. Credible = quiet palette, serif used only for headlines, tabular money formatting, real product UI, compliance text that is legible not hidden.

### 30. Handcrafted / zine
**Essence:** Made by a person: hand-drawn marks, marginalia, photocopy texture, personal voice; a digital garden more than a brochure.
**Signature traits:**
- Single reading column with sidenotes/marginalia and hand-drawn diagrams.
- Wobbly borders and underlines, stamps, cut-out headings.
- Libre or historical typefaces; one marker accent.

```css
:root {
  --bg: #fdfbf5; --surface: #ffffff; --fg: #222222; --muted: #5d5a53;
  --accent: #d7263d; --accent-2: #fff176; --line: #222222;
  --radius: 255px 15px 225px 15px / 15px 225px 15px 255px; --border: 2px solid var(--line); --shadow: none; --grain: 0.06;
  --font-display: "Terminal Grotesque", "IM Fell English", Georgia, serif;
  --font-body: "Newsreader", Georgia, serif;
  --font-mono: "Courier Prime", ui-monospace, monospace;
  --dur-fast: 150ms; --dur-base: 400ms; --dur-slow: 1200ms; --ease: cubic-bezier(0.45, 0, 0.55, 1);
}
.hand-box { border: var(--border); border-radius: var(--radius); padding: 1rem 1.25rem; }
.highlight { background: linear-gradient(transparent 55%, var(--accent-2) 55% 90%, transparent 90%); }
.draw path { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: draw var(--dur-slow) var(--ease) forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
```
**Type:** Velvetyne libre (Terminal Grotesque, Basteleur), Redaction (free), IM Fell English and Newsreader (Google), Courier Prime. Handwriting fonts only for marginal notes; real handwriting is better as SVG.
**Motion:** SVG line draw 800-1500ms (set `--len` from `path.getTotalLength()`), "boil" wobble via SVG `feTurbulence` + `feDisplacementMap` with seed swapped at 8fps on small elements only, hover wiggles. Never: glossy transitions, gradients, heavy JS.
**Layout:** 60-70ch column, sidenotes in the margin (collapse inline on mobile), hand-drawn diagrams, backlinks and "tended on" dates.
**Imagery/icons:** Scanned drawings traced to SVG, photocopy textures, stamps; icons hand-drawn to match.
**References:** maggieappleton.com, sfpc.study (School for Poetic Computation), laurelschwulst.com, 100r.co, neocities.org, robinsloan.com.
**Fits:** personal sites, writers, researchers, indie makers, education, community projects. **Misfits:** enterprise sales, fintech, e-commerce at scale.
**Slop tells -> credible:** Tell = a "handwriting" font for all text and fake hand-drawn clip-art. Credible = marks actually made by hand (scanned or drawn in SVG), a real reading typeface for prose, limited palette, content with a personal point of view.

## Mixing rules - combining two directions without mush
1. **One owner, one guest.** The primary direction owns structure: grid, type system, spacing, color roles. The guest contributes ONE layer: texture, motion, or a single component family. Ratio about 80/20.
2. **Never mix two display faces from different directions.** Borrow the guest's accent, texture or motion, not its headline font.
3. **Share one token axis.** A good pair shares either palette temperature, radius family or motion tempo. If all three differ (e.g., Liquid glass + Raw brutalism), it will look like two sites stitched together.
4. **Depth models must agree.** Hard offset shadows (Neo-brutal, Collage), soft elevation (Fintech, Soft 3D), refraction (Glass) and flat (Swiss, Raw) do not mix. Pick one depth model per page.
5. **Motion tempo follows the owner.** A Luxury page with Kinetic-type guest still moves slowly; slow the guest down.
6. **Contain the guest spatially.** Put the guest in a defined zone (the hero, the footer, the 404, the case-study pages) instead of sprinkling it everywhere.

| Pair (owner + guest) | Why it works | Real example |
|---|---|---|
| Swiss + Terminal | Grid discipline + mono metadata | oxide.computer (Suisse Int'l + GT America Mono) |
| Dark tech + Editorial | Serif display adds voice to precise dark UI | resend.com (Domaine serif + ABC Favorit + Commit Mono) |
| Organic + Editorial | Soft serif carries calm and credibility | ouraring.com (PP Editorial New + Akkurat LL) |
| Corporate fintech + Editorial | Serif headline = trust, grotesk UI = precision | mercury.com (Tiempos + Arcadia) |
| Retro-futurism + Swiss | Industrial labels on a strict grid | nothing.tech (Ndot + LL Lettera Mono + Geist) |
| Neo-brutal + Playful illustrative | Both flat and outlined, same energy | gumroad.com |
| Dark tech + Bento | Features as tiles inside the dark system | linear.app, raycast.com |
| Terminal + Editorial serif | Mono UI with a serif voice for story | terminal.shop (Geist Mono + Instrument Serif) |
| Immersive WebGL + Swiss | Cinematic scene, readable case studies | lusion.co |
| Scandinavian + Japanese | Shared restraint, warm neutrals | muji / muuto-style catalogs |

Pairs that fight: Liquid glass + Neo-brutalism (refraction vs hard shadow), Cyber neon + Minimal luxury (loud vs silent), Riso grain + Glass (print vs screen materials), Soft 3D + Raw brutalism (toy vs anti-style), Gradient mesh + Grainy print on the same surface (both want to own the background).

## Gotchas
- **Defaulting to Dark tech for "modern/premium".** It is the most common AI output. Pick by industry from the decision guide; if dark is right, add a signature detail and fix muted-text contrast.
- **Font licensing.** SF Pro may only be used on Apple platforms, so reach it via the system stack, never self-host it. Pangram Pangram faces are free for personal use but need a license for commercial use. Klim, Grilli, Commercial Type, Dinamo, Lineto, Swiss Typefaces and CoType faces are paid webfont licenses (often priced by pageviews). Fontshare, Google Fonts, Velvetyne and Departure Mono are free for commercial use.
- **Variable-axis settings on the wrong font.** `font-variation-settings: "SOFT" 100` does nothing on a font without that axis, and `font-variation-settings` overrides `font-weight` unless you set `wght` in it too. Check axes on the font's specimen or Google Fonts page.
- **Glass and blur cost.** `backdrop-filter` on large or many elements drops frames on mid-range Android; never animate the blur radius; provide `@supports` and `prefers-reduced-transparency` fallbacks.
- **Grain everywhere.** A full-screen grain overlay can hurt text crispness and, if animated, burns CPU. Keep it static, on a `pointer-events: none` fixed layer, opacity 0.02-0.12.
- **Mixed-blend overprint and text.** `mix-blend-mode: multiply` on text changes perceived contrast by what is behind it; test contrast over the actual background.
- **Pixel fonts at non-integer sizes** blur; use multiples of the design size and `-webkit-font-smoothing: none` only for them.
- **Luxury and heavy WebGL sites often block bots** (403 from curl/WebFetch): open them in a real browser before claiming how they are built.
- **Hydration mismatches** from random rotations/colors in collage and scrapbook directions: derive from stable ids (see recipe 28).
- **"Direction" is not "effects".** A page can nail the tokens and still read as template if copy, photography and hierarchy are generic. Tokens are 30% of a direction; content and art direction are the rest.
- **Reduced motion is a design variant, not deletion.** Every direction's end state must be the designed static layout (see `performance-a11y.md`).

## Sources
- Awwwards Sites of the Year (SOTY 2025: Lando Norris by OFF+BRAND, Messenger by abeto; SOTY 2024: Igloo Inc by abeto, Don't Board Me by The First The Last, Opal Tadpole by Claudio Guglieri): https://www.awwwards.com/websites/sites_of_the_year/
- Awwwards Sites of the Day, September 2026: https://www.awwwards.com/websites/sites_of_the_day/
- Figma, web design trends 2026: https://www.figma.com/resource-library/web-design-trends/
- Fireart Studio, 2026 trends (tactile brutalism, chromatic extremes, typography as architecture): https://fireart.studio/blog/the-best-web-design-trends/
- Fontfabric, 10 design and typography trends 2026: https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/
- Canva / Studio 2am on "imperfect by design" 2026: https://studio2am.co/blogs/news/naive-grainy-and-blurred-on-purpose-2026s-pushback-against-ai-smooth-design
- Vibe-coded design tells, Reddit-mined dataset: https://github.com/JCarterJohnson/vibecoded-design-tells
- Developers Digest, 16 AI design slop patterns: https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- AI purple problem: https://dev.to/jaainil/ai-purple-problem-make-your-ui-unmistakable-3ono
- Apple Human Interface Guidelines, Materials (Liquid Glass): https://developer.apple.com/design/human-interface-guidelines/materials
- Liquid glass in CSS/SVG: https://kube.io/blog/liquid-glass-css-svg/ and https://github.com/rdev/liquid-glass-react
- Web Design Museum, Y2K exhibition: https://www.webdesignmuseum.org/exhibitions/y2k-aesthetic-in-web-design
- Live CSS/HTML inspected 2026-09-26 for fonts and hex values: linear.app, vercel.com, raycast.com, resend.com, stripe.com, mercury.com, column.com, gumroad.com, nothing.tech, teenage.engineering, oxide.computer, ghostty.org, terminal.shop, posthog.com, lusion.co, ouraring.com, seed.com, aman.com, muuto.com
- All reference URLs in recipes returned HTTP 200 on 2026-09-26 except aesop.com, balenciaga.com, bottegaveneta.com, arket.com, radar.cloudflare.com (403 bot protection; live in browsers). Redirects noted: jetset.nl (Experimental Jetset), charm.land (Charm), dia.studio (DIA), op.al (Opal).
