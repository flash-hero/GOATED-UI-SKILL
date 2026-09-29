# Inspiration Sources - curated directory + effect research playbook

> Load when: you need visual references or a moodboard, a component source, fonts, icons, 3D/illustration/photo assets, color/gradient/SVG/easing tools, perf/a11y checkers, popular repos to learn from, or you must figure out how a live site builds an effect you have never seen.
> Stack assumptions: any; command examples use Git Bash + `gh` CLI (authenticated) + `curl`, and browser DevTools (Chromium).

Status column legend: every URL below was requested on 2026-09-26. "200" = loaded; "bot-wall" = returns 401/403/429 to scripts but is a live site in browsers; redirects and dead domains are called out. Star counts are GitHub stargazers read via `gh api` on 2026-09-26.

## Contents
- [Decision guide - where to look for what](#decision-guide---where-to-look-for-what)
- [Recipes](#recipes)
  1. [Award and curated site galleries](#1-award-and-curated-site-galleries)
  2. [Section and pattern galleries (heroes, navbars, bento, flows)](#2-section-and-pattern-galleries-heroes-navbars-bento-flows)
  3. [Moodboards and visual discovery](#3-moodboards-and-visual-discovery)
  4. [Component sources (copy-paste React/Tailwind)](#4-component-sources-copy-paste-reacttailwind)
  5. [Tutorials, demos and teachers](#5-tutorials-demos-and-teachers)
  6. [Fonts: discovery, free sources, paid foundries](#6-fonts-discovery-free-sources-paid-foundries)
  7. [Icon sets](#7-icon-sets)
  8. [3D, illustration and photo assets](#8-3d-illustration-and-photo-assets)
  9. [Color tools](#9-color-tools)
  10. [Gradient and shader tools](#10-gradient-and-shader-tools)
  11. [SVG, pattern and texture tools](#11-svg-pattern-and-texture-tools)
  12. [Easing, motion and type-scale tools](#12-easing-motion-and-type-scale-tools)
  13. [Performance, accessibility and support checkers](#13-performance-accessibility-and-support-checkers)
  14. [Top GitHub repos by stars](#14-top-github-repos-by-stars)
  15. [Playbook: research an effect you have not seen](#15-playbook-research-an-effect-you-have-not-seen)
- [Gotchas](#gotchas)
- [Sources](#sources)

## Decision guide - where to look for what
| Need | First stop | Second stop | Cost of use | Recipe |
|---|---|---|---|---|
| "Show me award-level sites like X" | Awwwards SOTD/SOTY filtered by category/tech | SiteInspire, CSS Design Awards, The FWA | free | [1](#1-award-and-curated-site-galleries) |
| Landing page structure for a SaaS | Land-book, SaaS Landing Page, Lapa Ninja | SaaSframe, Landingfolio | free | [1](#1-award-and-curated-site-galleries) |
| A specific section (hero, navbar, footer, bento) | Supahero, Navbar Gallery, Footer Design, Bento Grids | Refero, Mobbin (web) | free / freemium | [2](#2-section-and-pattern-galleries-heroes-navbars-bento-flows) |
| Real product UI flows (onboarding, checkout) | Mobbin, Refero | Page Flows | paid tiers | [2](#2-section-and-pattern-galleries-heroes-navbars-bento-flows) |
| A mood, not a layout | Cosmos, Savee, Are.na | Recent (ex-Godly domain), Designspiration | free | [3](#3-moodboards-and-visual-discovery) |
| A ready animated React component | React Bits, Magic UI, Aceternity, 21st.dev | Motion Primitives, Cult UI, Animate UI | copy-paste | [4](#4-component-sources-copy-paste-reacttailwind); see `component-recipes.md` |
| Accessible base primitives | shadcn/ui, Base UI, Radix, Ark UI | coss.com/ui (ex-Origin UI) | copy-paste | [4](#4-component-sources-copy-paste-reacttailwind) |
| How an effect is built, with source | Codrops article + github.com/codrops | GSAP showcase/CodePen, Olivier Larose | free | [5](#5-tutorials-demos-and-teachers) |
| Shaders | The Book of Shaders, Inigo Quilez, Shadertoy | lygia, Maxime Heckel | free | [5](#5-tutorials-demos-and-teachers) |
| Font pairing evidence | Fonts In Use, Typewolf | foundry in-use pages | free | [6](#6-fonts-discovery-free-sources-paid-foundries) |
| Free commercial fonts beyond Google | Fontshare, Velvetyne, Collletttivo | Departure Mono, Commit Mono, Geist | free | [6](#6-fonts-discovery-free-sources-paid-foundries) |
| Icons that match a direction | Phosphor (6 weights), Lucide, Tabler | Iconify/Icones meta-search | free | [7](#7-icon-sets) |
| HDRIs, textures, CC0 3D | Poly Haven | Spline community | free | [8](#8-3d-illustration-and-photo-assets) |
| Palette with contrast built in | Realtime Colors, Radix Colors, Leonardo, Huetone | oklch.com | free | [9](#9-color-tools); see `color-surfaces.md` |
| Mesh/animated gradient | Paper shaders, ShaderGradient | meshgradient.com, Mesher | free | [10](#10-gradient-and-shader-tools) |
| Blobs, waves, noise, patterns | Haikei, fffuel | getwaves, Blobmaker, Hero Patterns | free | [11](#11-svg-pattern-and-texture-tools) |
| Tuning an easing or spring | cubic-bezier.com, linear() generator | easings.net, Leva | free | [12](#12-easing-motion-and-type-scale-tools); see `motion-principles.md` |
| "Is this CSS feature safe?" | webstatus.dev (Baseline), caniuse.com | MDN | free | [13](#13-performance-accessibility-and-support-checkers) |
| "What stack does this site use?" | DevTools + console snippet + bundle grep | Wappalyzer, BuiltWith | free | [15](#15-playbook-research-an-effect-you-have-not-seen) |

How to use a reference without producing a clone: collect 3-5 references from DIFFERENT industries that share the target direction (see `aesthetic-directions.md`), extract one idea from each (grid, type pairing, motion tempo, one signature component), and never take more than one signature idea from a single site.

## Recipes

### 1. Award and curated site galleries
**Use when:** you need whole-site references for a direction or an industry, or want to know what currently wins.
**Avoid when:** you need component-level patterns (use recipe 2) or you are about to copy a single site wholesale.

| Gallery | URL | Best for | How to use it well | Status 2026-09-26 |
|---|---|---|---|---|
| Awwwards | https://www.awwwards.com | The award bar; SOTD/SOTM/SOTY, Developer Award | Filter `websites/` by category, color, technology; SOTY archive at `/websites/sites_of_the_year/`; editorial collections at `/awwwards/collections/`; Academy courses at `/academy/` | 200 |
| Awwwards SOTY | https://www.awwwards.com/websites/sites_of_the_year/ | What "best of year" looks like | 2025: Lando Norris (OFF+BRAND) and Messenger (abeto). 2024: Igloo Inc (abeto), Don't Board Me (The First The Last), Opal Tadpole (Claudio Guglieri) | 200 |
| CSS Design Awards | https://www.cssdesignawards.com | Second opinion on award sites, UI/UX/innovation scores | Browse WOTD by month | 200 |
| The FWA | https://thefwa.com | Interactive/experimental, campaign and WebGL work | Use thefwa.com (fwa.com timed out) | 200 |
| SiteInspire | https://www.siteinspire.com | Long-running curated archive, filter by style/type/subject | Combine style + subject filters (e.g., "minimal" + "architecture") | bot-wall (429), live |
| Land-book | https://land-book.com | Landing pages by category and style | Filter by industry, then by color/style | 200 |
| Lapa Ninja | https://www.lapa.ninja | Landing pages + component-level categories | Good for SaaS/startup patterns | 200 |
| Minimal Gallery | https://minimal.gallery | Quiet, typographic, minimal sites | Reference for Swiss/Scandinavian/Luxury directions | 200 |
| One Page Love | https://onepagelove.com | Single-page sites, portfolios, templates | Also lists templates (check license) | 200 (www. subdomain returned 525; use apex) |
| Httpster | https://httpster.net | Eclectic hand-picked sites | Good for non-SaaS inspiration | 200 |
| Admire the Web | https://admiretheweb.com | Curated sites with section crops | Section-level screenshots | 200 |
| Curated.design | https://curated.design | Curated sites by category | Fast skim | 200 |
| SaaS Landing Page | https://saaslandingpage.com | SaaS landing pages only | Compare pricing/hero patterns across competitors | 200 |
| Landingfolio | https://www.landingfolio.com | Landing pages + section library | Sections useful for hero/pricing | 200 |
| SaaSframe | https://www.saasframe.io | SaaS pages and email/UI examples | Page-type filters | 200 |
| Dark Mode Design | https://www.darkmodedesign.com | Dark-only websites | Reference for Dark tech / Immersive directions | 200 |
| Brutalist Websites | https://brutalistwebsites.com | Raw/brutalist web since 2014 | Raw brutalism + anti-design references | 200 |
| Hoverstat.es | https://www.hoverstat.es | Web design showcase with interaction focus | Motion-rich sites | 200 |
| Web Design Museum | https://www.webdesignmuseum.org | 1991-2006 web history, exhibitions (Y2K, Flash) | Authentic period references for Y2K/retro | 200 |
| GSAP Showcase | https://gsap.com/showcase/ | Sites built with GSAP | Motion benchmarks; many Awwwards winners | 200 |
| Made in Webflow | https://webflow.com/made-in-webflow | Cloneable Webflow sites and effects | Search by effect name ("risograph", "scroll") | 200 |
| Framer Marketplace | https://www.framer.com/marketplace/ | Templates showing current Framer taste | Useful to see what is now "template default" (avoid copying it) | 200 |
| Godly | https://godly.website | Formerly the go-to curated gallery | Now 301-redirects to recent.design (`?ref=godly`), a submission-based gallery; old Godly archive links may not resolve | redirect |
| Recent | https://recent.design | Submission gallery: Web Interface, Branding, Product, Typography, Motion, 3D, Editorial, Print, Packaging | Use the Motion and 3D categories for fresh studio work | 200 |

Current signal (Awwwards SOTD, September 2026, for "what wins now"): MEER MOHSIN, The Tie-break (Merci Michel), Moto Finance (Properly Studio), Sobha Privy Collection (Vide Infra), bleibtgleich'26 (The First The Last), Gil Huybrecht, Boc.Studio, Noho (Eugene Morev), LxL Creative; nearly all carry the Developer Award, i.e. heavy custom motion/WebGL.

Studio sites worth studying directly (all 200): lusion.co, activetheory.net, locomotive.ca, basement.studio, darkroom.engineering (makers of Lenis and the Satus Next.js starter), obys.agency, immersive-g.com, 14islands.com, unseen.co, dogstudio.co, resn.co.nz, makemepulse.com, hellomonday.com, bureau.cool, dia.studio.

### 2. Section and pattern galleries (heroes, navbars, bento, flows)
**Use when:** you are designing one section or one flow and want 20 real variants fast.
**Avoid when:** you have no direction yet (pick one first, or every section will come from a different site).

| Source | URL | Best for | Notes | Status |
|---|---|---|---|---|
| Mobbin | https://mobbin.com | Real app screens and flows (iOS, Android, web) | Paid for full access; search by pattern ("paywall", "onboarding") | 200 |
| Refero | https://refero.design | Web app UI and flows, searchable by element | Strong for SaaS product UI | 200 |
| Page Flows | https://pageflows.com | Recorded user flows (video) | Screenlane now redirects here | 200 |
| Supahero | https://supahero.io | Hero sections only | Compare hero compositions | 200 |
| Navbar Gallery | https://www.navbar.gallery | Navigation bars | Desktop and mobile variants | 200 |
| Footer Design | https://www.footer.design | Footers | Footers are the most template-looking section; use this | 200 |
| Bento Grids | https://bentogrids.com | Bento layouts | Pair with `aesthetic-directions.md#9-bento-product-apple` | 200 |
| Collect UI | https://collectui.com | Dribbble-style UI shots by category | Concept-level, not production | 200 |
| Checklist Design | https://www.checklist.design | Checklists of what a page/component needs | Good pre-flight for completeness | 200 |
| UI Guideline | https://www.uiguideline.com | Component best practices | Pattern rules | 200 |
| Component Gallery | https://component.gallery | Components across 90+ design systems | See how GOV.UK, Atlassian, etc. build the same component | 200 |
| Design Systems Surf | https://designsystems.surf | Design system directory | Study token structures | 200 |
| Typewolf Site of the Day | https://www.typewolf.com/site-of-the-day | Sites notable for type | Includes fonts used | 200 |

### 3. Moodboards and visual discovery
**Use when:** the brief is a feeling ("warm, analog, confident") and you need imagery, type and color references beyond websites.
**Avoid when:** you need implementation detail.

| Source | URL | Best for | Notes | Status |
|---|---|---|---|---|
| Cosmos | https://www.cosmos.so | Visual search/moodboards, strong design-community taste | Search by mood words; clusters feel current | 200 |
| Savee | https://savee.com | Designer-curated boards | savee.it redirects to savee.com | 200 |
| Are.na | https://www.are.na | Research channels (typography, interfaces, archives) | Search channels like "web typography", "interfaces"; channels are human-curated | 200 |
| Designspiration | https://www.designspiration.com | Search by color and keyword | Color search is useful for palettes | 200 |
| Pinterest | https://www.pinterest.com | Broad, noisy | Use only with specific terms ("swiss poster grid", "riso print zine") | 200 |
| Fonts In Use | https://fontsinuse.com | Real typography in print and web, tagged by typeface | Best evidence for a font pairing | 200 |
| Recent | https://recent.design | Fresh branding/motion/3D submissions | See recipe 1 | 200 |

Search terms that surface good material: "grid systems poster", "specimen site", "type foundry website", "industrial design spec sheet", "riso zine", "exhibition identity", "annual report design", "kinetic identity", "motion identity system", "wayfinding".

### 4. Component sources (copy-paste React/Tailwind)
**Use when:** you need a working animated component fast and will restyle it to the chosen direction.
**Avoid when:** the component is the page's signature moment (build it bespoke), or you are stacking 5+ showcase components from different libraries (the result reads as a component catalog, a known AI tell).

| Source | URL | Stack | Strength | Watch-outs | Repo / stars |
|---|---|---|---|---|---|
| shadcn/ui | https://ui.shadcn.com | React, Radix/Base UI, Tailwind 4, CLI registry | Accessible primitives, registry standard others build on | Default theme is the #1 "vibe-coded" tell: always re-token | shadcn-ui/ui 124.6k |
| React Bits | https://reactbits.dev | React; JS/TS x CSS/Tailwind variants; GSAP/Motion/OGL/Three | Largest set of animated text, backgrounds, cursors | Some heavy WebGL backgrounds: check GPU cost on mobile | DavidHDev/react-bits 48.1k |
| Magic UI | https://magicui.design | React, Tailwind, Motion; shadcn registry | Marketing-page effects (marquee, border beam, number ticker, bento) | Very recognisable; restyle heavily | magicuidesign/magicui 22.4k |
| Aceternity UI | https://ui.aceternity.com | React, Tailwind, Motion | Flashy hero/background effects (spotlight, beams, 3D cards) | Most copied look of 2024-25; free + Pro (ui.aceternity.com/pro); not an open repo | n/a |
| 21st.dev | https://21st.dev | shadcn-registry marketplace, community components | Search many authors' variants of one component; `npx shadcn add` URLs | Quality varies by author; read the code | serafimcloud/21st 5.5k (repo last pushed 2025-05) |
| Motion Primitives | https://motion-primitives.com | React, Motion, Tailwind | Tasteful, restrained motion (text effects, morphing dialogs) | Smaller set | ibelick/motion-primitives 6.4k |
| Cult UI | https://www.cult-ui.com | React, Tailwind, Motion, shadcn | Design-engineer components | Site bot-walls scripts (429) | nolly-studio/cult-ui 6.2k |
| Animate UI | https://animate-ui.com | React, TS, Tailwind, Motion, shadcn CLI | Animated versions of common primitives | | imskyleen/animate-ui 4.3k |
| coss.com/ui (ex-Origin UI) | https://coss.com/ui | React, Tailwind | Large set of plain, well-made app components | originui.com now redirects here; "official design system of Cal.com" | cosscom/coss 10.6k |
| Kokonut UI | https://kokonutui.com | React, Tailwind, Motion, shadcn | Marketing and app components | | kokonut-labs/kokonutui 2.1k |
| Skiper UI | https://skiper-ui.com | React, Tailwind, Motion | Showcase-style animated components | No public repo found | n/a |
| Uiverse | https://uiverse.io | Plain CSS or Tailwind, community | Buttons, loaders, toggles, checkboxes in pure CSS | Quality varies; many are gimmicky | uiverse-io/galaxy 13.2k |
| HyperUI | https://www.hyperui.dev | Tailwind v4, HTML | Clean, framework-free marketing/app blocks | Static, little motion | markmead/hyperui 12.2k |
| Tailwind Plus | https://tailwindcss.com/plus | Tailwind, React/Vue/HTML | Professionally designed blocks and templates (paid; formerly Tailwind UI) | License per seat | n/a |
| UI Layouts | https://www.ui-layouts.com | React, Tailwind, Motion | Components + layout blocks | The old uilayouts.com domain has expired: use ui-layouts.com | ui-layouts/uilayouts 3.6k |
| Neobrutalism components | https://www.neobrutalism.dev | shadcn-based | Complete neo-brutal kit | Only for that direction | ekmas/neobrutalism-components 5.5k |
| shadcnblocks | https://www.shadcnblocks.com | shadcn blocks | Page sections | Mostly paid | n/a |
| Base UI | https://base-ui.com | Unstyled React primitives (Radix/MUI/Floating UI authors) | Accessibility-first headless | No styles by design | mui/base-ui 11.0k |
| Radix Primitives | https://www.radix-ui.com | Unstyled React primitives | Mature a11y behavior | Maintained by WorkOS | radix-ui/primitives 19.3k |
| Ark UI | https://ark-ui.com | Headless for React/Vue/Solid/Svelte | Multi-framework | | chakra-ui/ark 5.4k |
| Inspira UI | https://inspira-ui.com | Vue/Nuxt ports of Aceternity/Magic UI style | For Vue projects | | unovue/inspira-ui 5.0k |

Rules for using them (details and adapted code in `component-recipes.md`):
- Install through the shadcn CLI registry where offered, then move tokens to your direction; never keep default `zinc`/`slate` + violet.
- Budget: max 1-2 "hero effect" components per page; everything else should be quiet.
- Check `prefers-reduced-motion`, pointer-type guards, cleanup of RAF/listeners and SSR safety in the copied code; many community components skip at least one.

### 5. Tutorials, demos and teachers
**Use when:** you need to understand or adapt a technique with real source code.

| Source | URL | Best for | Notes |
|---|---|---|---|
| Codrops | https://tympanus.net/codrops/ | Tutorials + demos for scroll, WebGL, text, page transitions, grids | Search: `https://tympanus.net/codrops/?s=<effect>`; each demo links its GitHub repo |
| Codrops GitHub | https://github.com/codrops | 345 public demo repos | Most-starred: PageTransitions 2.3k, SidebarTransitions 1.7k, Animocons 1.5k, ParticleEffectsButtons 1.3k, OnScrollTypographyAnimations 343, SlideshowAnimations 305. Recent (2025-26): RotatingOnScrollAnimations, ScrollTextMotion, ElasticGridScroll, KineticTypePageTransition, 3DCarousel, RepeatingImageTransition, CodropsTemplate (their demo boilerplate) |
| GSAP docs + showcase | https://gsap.com/docs/v3/ , https://gsap.com/showcase/ | Canonical API; production examples | All plugins free since 3.13 (SplitText, MorphSVG, ScrollSmoother, Inertia, GSDevTools) |
| GSAP on CodePen | https://codepen.io/GreenSock | Official minimal demos per plugin | bot-wall to scripts; open in browser |
| GSAP AI skills | https://github.com/greensock/gsap-skills | Official GSAP guidance written for coding agents | 15.7k stars |
| Olivier Larose | https://blog.olivierlarose.com | Next.js + GSAP/Motion/Lenis recreations of Awwwards effects, with source | Closest to "how studio sites do it" in React |
| Hyperplexed | https://www.youtube.com/@Hyperplexed | Short breakdowns of famous site effects in vanilla JS/CSS | Great for "how did they do that" |
| Kevin Powell | https://www.youtube.com/@KevinPowell | Modern CSS layout and features | CSS-first solutions |
| Josh W. Comeau | https://www.joshwcomeau.com | Deep CSS/React/animation explainers, springs, shadows, gradients | Also the gradient generator (recipe 10) |
| Emil Kowalski | https://emilkowal.ski , https://animations.dev | Interaction/animation craft, author of Sonner and Vaul | animations.dev is his paid course |
| Rauno Freiberg | https://rauno.me , https://devouringdetails.com | Invisible details of interaction design | devouringdetails.com is his interaction course/site |
| Frontend.fyi | https://www.frontend.fyi | Motion/React animation tutorials | |
| Three.js Journey | https://threejs-journey.com | Bruno Simon's Three.js/R3F course | The standard WebGL curriculum |
| Maxime Heckel | https://blog.maximeheckel.com | Shaders, R3F, post-processing, WebGPU deep dives | Interactive articles |
| The Book of Shaders | https://thebookofshaders.com | Fragment shader fundamentals | repo patriciogonzalezvivo/thebookofshaders 7.0k |
| Inigo Quilez | https://iquilezles.org | SDFs, noise, palettes (the cosine palette), raymarching | Reference-grade math articles |
| Shadertoy | https://www.shadertoy.com | Thousands of GLSL examples | bot-wall to scripts; licenses vary per shader (default CC BY-NC-SA) |
| lygia | https://github.com/patriciogonzalezvivo/lygia | Shader function library (GLSL/HLSL/WGSL/Metal) | 3.4k stars; `#include` granular functions |
| awesome-creative-coding | https://github.com/terkelg/awesome-creative-coding | Index of generative/creative coding resources | 15.4k stars |

### 6. Fonts: discovery, free sources, paid foundries
**Use when:** choosing faces for a direction. Pairing logic lives in `typography.md`; direction-specific picks in `aesthetic-directions.md`.

**Discovery**
| Source | URL | Use |
|---|---|---|
| Fonts In Use | https://fontsinuse.com | Evidence: how a face looks in real work |
| Typewolf | https://www.typewolf.com | Trending faces, "Google Fonts worth using", site of the day with fonts |
| Fontpair | https://fontpair.co | Google Fonts pairings (starting point only) |

**Free for commercial use**
| Source | URL | Notable faces | Notes |
|---|---|---|---|
| Google Fonts | https://fonts.google.com | Newsreader, Fraunces, Bricolage Grotesque, Anybody, Roboto Flex, Geist, Geist Mono, Doto, Instrument Sans, Hanken Grotesk, Schibsted Grotesk, Albert Sans, Spectral, IBM Plex, JetBrains Mono, Shippori Mincho, Zen Kaku Gothic New | Load via `next/font/google` (self-hosted at build) |
| Fontsource | https://fontsource.org | npm packages of open fonts | Self-host outside Next (`@fontsource-variable/<name>`); repo fontsource/fontsource 6.1k |
| Fontshare (Indian Type Foundry) | https://www.fontshare.com | Satoshi, General Sans, Switzer, Cabinet Grotesk, Clash Display, Zodiak, Gambetta, Sentient, Boska, Tanker | Free for commercial use under the ITF Free Font License |
| Velvetyne | https://velvetyne.fr | Terminal Grotesque, Basteleur, Ouroboros, Karrik | Libre (OFL); great for zine/anti-design |
| Collletttivo | https://www.collletttivo.it | Mazius Display, Apfel Grotezk | Libre Italian collective |
| Uncut | https://uncut.wtf | Catalog of libre contemporary fonts | Returned status 454 to scripts on 2026-09-26; check in browser |
| Departure Mono | https://departuremono.com | Pixel monospace | OFL |
| Commit Mono | https://commitmono.com | Neutral coding mono | OFL |
| Geist | https://github.com/vercel/geist-font | Geist Sans / Mono (+ Pixel variants used on vercel.com) | OFL; repo 3.6k |
| Inter | https://github.com/rsms/inter | Inter / Inter Display | OFL; repo 19.9k; overused as a hero face |
| JetBrains Mono | https://github.com/JetBrains/JetBrainsMono | Coding mono | OFL; repo 13.0k |

**Paid foundries (what the reference sites actually ship)**
| Foundry | URL | Signature faces | Seen on (verified 2026-09-26 unless noted) |
|---|---|---|---|
| Klim | https://klim.co.nz | Söhne, Tiempos, Domaine, Founders Grotesk, Signifier, National 2 | stripe.com (Söhne), mercury.com (Tiempos), resend.com (Domaine) |
| Grilli Type | https://www.grillitype.com | GT America, GT Sectra, GT Alpina, GT Flexa, GT Maru, GT Pressura | oxide.computer (GT America Mono) |
| Commercial Type | https://commercialtype.com | Graphik, Canela, Lyon, Druk, Publico, Atlas Grotesk | aman.com (Lyon) |
| ABC Dinamo | https://abcdinamo.com | ABC Favorit, Diatype, Monument Grotesk, Whyte, Arizona | gumroad.com and resend.com (ABC Favorit) |
| Pangram Pangram | https://pangrampangram.com | PP Neue Montreal, PP Editorial New, PP Mori, PP Neue Machina, PP Monument Extended, PP Neue Bit, PP Mondwest | ouraring.com (PP Editorial New). Free trial for personal use; commercial needs a license |
| Lineto | https://lineto.com | LL Akkurat, LL Circular, LL Brown, LL Lettera Mono, LL Unica77 | ouraring.com (Akkurat), nothing.tech (Lettera Mono) |
| Swiss Typefaces | https://www.swisstypefaces.com | Suisse Int'l, Suisse Works, Suisse Neue, Euclid Flex | column.com and oxide.computer (Suisse), muuto.com (Euclid Flex) |
| CoType | https://cotypefoundry.com | Aeonik, Aeonik Pro, Aeonik Fono | lusion.co (Aeonik) |
| Displaay | https://displaay.net | Reckless, Migra | |
| OH no Type | https://ohnotype.co | Obviously, Degular, Vulf Mono | |
| Sharp Type | https://sharptype.co | Ogg, Sharp Grotesk, Beatrice | bot-wall (429) |
| Colophon | https://www.colophon-foundry.org | Apercu, Basis Grotesque, Mabry | |
| Production Type | https://productiontype.com | Display and text families for editorial/brand | |
| Future Fonts | https://www.futurefonts.com | In-progress faces sold cheaply early | futurefonts.xyz redirects here |
| Typotheque | https://www.typotheque.com | Multi-script families | |
| Fontfabric | https://www.fontfabric.com | Nexa, Mont; publishes a yearly trend report | |
| Atipo | https://www.atipofoundry.com | Display families | |
| Blaze Type | https://blazetype.eu | Experimental display | |
| US Graphics | https://usgraphics.com/products/berkeley-mono | Berkeley Mono | The premium coding mono |
| Adobe Fonts | https://fonts.adobe.com | Subscription library | Web use tied to Creative Cloud kit |
| MyFonts | https://www.myfonts.com | Monotype marketplace (Helvetica Now, Neue Haas) | |

### 7. Icon sets
**Use when:** choosing icons; match stroke weight and corner style to the direction and to your type weight.

| Set | URL | Count / styles | React package | Best directions | Stars |
|---|---|---|---|---|---|
| Phosphor | https://phosphoricons.com | 6 weights: Thin, Light, Regular, Bold, Fill, Duotone | `@phosphor-icons/react` | Almost any; Thin/Light for Luxury/Japanese, Bold for Neo-brutal, Duotone for Playful | phosphor-icons/homepage 7.6k |
| Lucide | https://lucide.dev | Large outline set (Feather fork), adjustable stroke | `lucide-react` | Dark tech, SaaS, dashboards (default in shadcn: change stroke or swap to avoid the stock look) | lucide-icons/lucide 24.7k |
| Tabler | https://tabler.io/icons | 6,200+ MIT, outline + filled, adjustable stroke | `@tabler/icons-react` | Dense apps, dashboards, cyber (stroke 1.5) | tabler/tabler-icons 21.8k |
| Iconoir | https://iconoir.com | 1,600+ | `iconoir-react` | Scandinavian, editorial, calm SaaS | iconoir-icons/iconoir 4.6k |
| Heroicons | https://heroicons.com | Outline, solid, mini, micro | `@heroicons/react` | Tailwind projects, corporate | tailwindlabs/heroicons 23.8k |
| Radix Icons | https://www.radix-ui.com/icons | Crisp 15x15 set | `@radix-ui/react-icons` | Dense UI, dev tools | radix-ui/icons 2.7k |
| Hugeicons | https://hugeicons.com | Very large free + pro set, multiple styles | `@hugeicons/react` + `@hugeicons/core-free-icons` (old `hugeicons-react` is deprecated) | SaaS, mobile | n/a |
| Remix Icon | https://remixicon.com | Line + fill pairs | `@remixicon/react` | Neutral products | Remix-Design/RemixIcon 8.4k |
| Streamline | https://www.streamlinehq.com | Huge catalog, many styles incl. illustrations; freemium | downloads/plugins | Playful illustrative (matching icon + illustration families) | n/a |
| Iconify / Icones | https://iconify.design , https://icones.js.org | Meta-search across 200+ open sets | `@iconify/react` or copy SVG | Find one-off icons in a matching style | n/a |
| Fluent Emoji | https://github.com/microsoft/fluentui-emoji | Flat, color and 3D emoji (MIT) | SVG/PNG files | Soft 3D / clay, playful | 10.1k |

Icon rules: one set per product; stroke width close to your body text stem (1.5px at 16-20px for regular text, 2px for bold UIs); never emoji as UI icons (top-6 AI tell); animated icons (useanimations.com, Lordicon, Rive) only for state changes.

### 8. 3D, illustration and photo assets
**Use when:** you need imagery and have no art direction budget. Prefer the brand's own photography whenever it exists.

| Source | URL | What | License notes | Status |
|---|---|---|---|---|
| Poly Haven | https://polyhaven.com | HDRIs, PBR textures, models | CC0 | 200 |
| Spline community | https://app.spline.design/community | Remixable 3D scenes | Per-scene; runtime `@splinetool/react-spline` (repo 1.4k) is heavy, export static renders when possible | 200 |
| Unsplash | https://unsplash.com | Photography | Unsplash License; the most recognisable stock: crop, grade and use sparingly | bot-wall (401 challenge) |
| Pexels | https://www.pexels.com | Photo + video | Pexels License | bot-wall (403) |
| Blush | https://blush.design | Customisable illustration systems | Free tier with limits | bot-wall (429) |
| Open Peeps | https://www.openpeeps.com | Hand-drawn people library (Pablo Stanley) | CC0 | 200 |
| Humaaans | https://www.humaaans.com | Mix-and-match people | CC BY-ish free use; very recognisable | 200 |
| unDraw | https://undraw.co | Flat SVG illustrations with color picker | Free; the "Corporate Memphis" look, overused | 200 |
| Figma Community | https://www.figma.com/community | UI kits, icon sets, mockups | Per file | 200 |
| Fluent Emoji | https://github.com/microsoft/fluentui-emoji | 3D/color emoji | MIT | 200 |

Taste rule: a single consistent library beats a mix; recolor illustrations to the direction's tokens; avoid people illustrations with purple limbs and floating plants (instantly reads as 2019 template).

### 9. Color tools
**Use when:** building or checking a palette. Color theory and token recipes are in `color-surfaces.md`.

| Tool | URL | Use |
|---|---|---|
| OKLCH picker | https://oklch.com | Pick/convert OKLCH, see gamut (P3 vs sRGB) |
| Realtime Colors | https://www.realtimecolors.com | Preview a 5-color palette on a live page, export CSS/Tailwind |
| Radix Colors | https://www.radix-ui.com/colors | 12-step scales with defined roles (bg, border, solid, text), light/dark, P3 |
| Leonardo (Adobe) | https://leonardocolor.io | Generate scales by target contrast ratio |
| Huetone | https://huetone.ardov.me | Build scales with APCA/WCAG contrast visible per step |
| Colorbox (Lyft) | https://colorbox.io | Algorithmic scale generator |
| UI Colors | https://uicolors.app | Tailwind-style 50-950 scale from one hex |
| Tints.dev | https://www.tints.dev | Tailwind palettes, tweak hue/saturation per step |
| Atmos | https://atmos.style | Palette builder with contrast tools |
| Coolors | https://coolors.co | Quick palette exploration (then fix contrast elsewhere) |
| APCA contrast | https://apcacontrast.com | APCA (candidate WCAG 3 method) checks |
| WebAIM contrast checker | https://webaim.org/resources/contrastchecker/ | WCAG 2.x AA/AAA ratios |
| Who Can Use | https://www.whocanuse.com | Contrast impact by vision type |

### 10. Gradient and shader tools
**Use when:** you need a mesh gradient, animated shader background or grain without writing GLSL from scratch. Implementation in `backgrounds-svg-canvas.md` and `webgl-shaders-3d.md`.

| Tool | URL | Output | Notes |
|---|---|---|---|
| Paper | https://paper.design | Design tool + `@paper-design/shaders` / `@paper-design/shaders-react` (mesh gradient, grain, dithering, metaballs, etc.) | Zero-dependency canvas shaders; repo paper-design/shaders 3.5k |
| ShaderGradient | https://shadergradient.co | Animated 3D gradient (R3F), React component or Framer | Tune in browser, copy props |
| Unicorn Studio | https://www.unicorn.studio | No-code WebGL scenes/effects, embed or `unicornstudio-react` | Export and embed; watch payload |
| Mesh Gradient | https://meshgradient.com | Static mesh gradient images/CSS | Quick hero backdrops |
| Mesher (CSS Hero) | https://csshero.org/mesher/ | Pure-CSS layered radial gradients | No JS, good fallback |
| Josh Comeau gradient generator | https://www.joshwcomeau.com/gradient-generator/ | CSS gradients interpolated in better color spaces | Avoids grey dead zones |
| Learn UI gradient generator | https://www.learnui.design/tools/gradient-generator.html | Smooth multi-stop CSS gradients | |
| Shadertoy | https://www.shadertoy.com | Reference shaders to port | Check each shader's license |
| lygia | https://github.com/patriciogonzalezvivo/lygia | Noise, color, SDF, filter functions | Import only what you use |
| Grainy gradients demo | https://grainy-gradients.vercel.app | CSS/SVG noise-over-gradient technique | Returned HTTP 402 (deployment paused) on 2026-09-26; technique is reproduced in `aesthetic-directions.md` shared building blocks |

### 11. SVG, pattern and texture tools
| Tool | URL | Makes | Notes |
|---|---|---|---|
| Haikei | https://haikei.app | Blobs, waves, layered peaks, blurry gradients, grids as SVG | Export SVG, then optimise with SVGOMG |
| fffuel | https://www.fffuel.co | Dozens of small generators (noise/grain, gradients, patterns, shapes) | Grain textures for riso/organic directions |
| Get Waves | https://getwaves.io | Section-divider waves | Keep waves subtle; big waves read 2018 |
| Blobmaker | https://www.blobmaker.app | Organic blob SVGs | For organic/wellness masks |
| Hero Patterns | https://heropatterns.com | Repeating SVG background patterns | Recolor to tokens, low opacity |
| SVG Backgrounds | https://www.svgbackgrounds.com | Customisable SVG backgrounds | Some paid |
| Patternico | https://patternico.com | Seamless icon patterns | |
| css-doodle | https://css-doodle.com | Generative patterns as a web component | repo 6.0k |
| SVGOMG | https://jakearchibald.github.io/svgomg/ | Optimise SVG (SVGO GUI) | Also at svgomg.net |
| SVGator | https://www.svgator.com | Timeline SVG animation editor, exports CSS/JS | Paid tiers |
| SVG Repo | https://www.svgrepo.com | Free SVG icons/vectors | bot-wall (429); licenses vary per file |
| Dither It / ditherit | https://ditherit.com , https://dither.it | Dither images (Bayer, Floyd-Steinberg, Atkinson) | For the 1-bit direction |

### 12. Easing, motion and type-scale tools
| Tool | URL | Use |
|---|---|---|
| cubic-bezier.com | https://cubic-bezier.com | Design and compare cubic-bezier curves visually (Lea Verou) |
| Easings.net | https://easings.net | Named easing reference (easeOutQuint etc.) with CSS equivalents |
| Linear easing generator | https://linear-easing-generator.netlify.app | Convert springs/bounces (JS or SVG path) to CSS `linear()` (Jake Archibald) |
| easing.dev | https://www.easing.dev | Easing/spring playground |
| Open Props | https://open-props.style | Ready CSS custom properties incl. easings, springs, shadows; repo argyleink/open-props 5.5k |
| Leva | https://github.com/pmndrs/leva | React GUI to tune values live (durations, springs, uniforms); 6.2k |
| Theatre.js | https://github.com/theatre-js/theatre | Timeline editor for web animation/R3F; 12.7k, last push 2024-08 (maintenance has slowed) |
| GSDevTools | https://gsap.com/docs/v3/Plugins/GSDevTools/ | Scrub/loop GSAP timelines while tuning; free since 3.13 |
| Jitter | https://jitter.video | Motion design tool for UI animation mockups |
| Rive | https://rive.app | Interactive state-machine animations; `@rive-app/react-canvas` |
| LottieFiles | https://lottiefiles.com | Lottie/dotLottie library and tools (bot-wall 403 to scripts) |
| Utopia | https://utopia.fyi | Fluid type and space scales with `clamp()` |
| Typescale | https://typescale.com | Modular type scale preview |
| Fluid Type Scale | https://www.fluid-type-scale.com | Fluid scale CSS generator |

### 13. Performance, accessibility and support checkers
Details and budgets in `performance-a11y.md`.

| Tool | URL | Use |
|---|---|---|
| PageSpeed Insights | https://pagespeed.web.dev | Lab + field (CrUX) Core Web Vitals |
| Lighthouse | https://github.com/GoogleChrome/lighthouse | Local audits (DevTools or CLI); 30.8k |
| WebPageTest | https://www.webpagetest.org | Filmstrips, real devices/locations (bot-wall to scripts) |
| React Scan | https://github.com/aidenybai/react-scan | Visualise unnecessary React re-renders; 21.9k |
| Bundlephobia | https://bundlephobia.com | npm package size + tree-shaking |
| pkg-size.dev | https://pkg-size.dev | Install/bundle size of packages |
| WAVE | https://wave.webaim.org | Visual accessibility audit |
| axe-core | https://github.com/dequelabs/axe-core | Automated a11y engine (DevTools extension, Playwright); 7.6k |
| webhint | https://github.com/webhintio/hint | Linting for a11y, perf, compatibility; 3.7k |
| webstatus.dev | https://webstatus.dev | Baseline status of web features (Newly/Widely available) |
| Can I use | https://caniuse.com | Per-browser support tables |
| Wappalyzer | https://www.wappalyzer.com | Detect frameworks/CMS/libraries (extension) |
| BuiltWith | https://builtwith.com | Technology profile of a domain |

### 14. Top GitHub repos by stars
Read the source of these before inventing your own; star counts from `gh api repos/OWNER/REPO` on 2026-09-26.

| Repo | Stars | What to learn from it |
|---|---|---|
| shadcn-ui/ui | 124,623 | Registry/CLI pattern, accessible component composition |
| VoltAgent/awesome-design-md | 118,077 | DESIGN.md files describing popular brands' design systems for coding agents (useful for token extraction; do not clone brands) |
| mrdoob/three.js | 115,924 | WebGL engine; examples folder is the best reference |
| tailwindlabs/tailwindcss | 97,693 | v4 CSS-first `@theme` |
| juliangarnier/anime | 73,123 | anime.js v4 (`animate`, `stagger`, `createTimeline`) |
| hakimel/reveal.js | 72,351 | HTML presentations |
| pixijs/pixijs | 48,229 | 2D WebGL/WebGPU renderer |
| DavidHDev/react-bits | 48,120 | Animated components with JS/TS x CSS/Tailwind variants |
| goabstract/Awesome-Design-Tools | 41,322 | Index of design tools/plugins |
| motiondivision/motion | 33,736 | Motion for React/JS (`motion/react`) |
| pmndrs/react-three-fiber | 32,524 | React renderer for Three.js |
| airbnb/lottie-web | 32,127 | Lottie player |
| GoogleChrome/lighthouse | 30,817 | Audits |
| pmndrs/react-spring | 29,161 | Spring physics animation |
| greensock/GSAP | 28,638 | GSAP source (all plugins free) |
| alexpate/awesome-design-systems | 26,016 | Design system index |
| lucide-icons/lucide | 24,731 | Icon toolkit |
| processing/p5.js | 24,050 | Creative coding |
| tailwindlabs/heroicons | 23,825 | Icons |
| magicuidesign/magicui | 22,397 | Marketing components |
| aidenybai/react-scan | 21,857 | Render perf |
| tabler/tabler-icons | 21,790 | Icons |
| google/fonts | 20,527 | Google Fonts sources + issue tracker |
| rsms/inter | 19,916 | Inter font |
| radix-ui/primitives | 19,333 | Headless a11y primitives |
| liabru/matter-js | 18,433 | 2D physics (falling tags, stickers) |
| gztchan/awesome-design | 17,575 | Design resources index |
| darkroomengineering/lenis | 16,034 | Smooth scroll (package `lenis`, React `lenis/react`) |
| greensock/gsap-skills | 15,683 | Official GSAP skills for AI agents |
| terkelg/awesome-creative-coding | 15,368 | Creative coding index |
| formkit/auto-animate | 13,923 | Zero-config layout transitions |
| uiverse-io/galaxy | 13,177 | Community CSS components |
| JetBrains/JetBrainsMono | 13,044 | Mono font |
| emilkowalski/sonner | 13,005 | Toasts with great motion |
| barbajs/barba | 12,984 | Page transitions (MPA); last push 2024-12 |
| theatre-js/theatre | 12,701 | Animation timeline editor; last push 2024-08 |
| markmead/hyperui | 12,241 | Tailwind v4 blocks |
| mui/base-ui | 10,999 | Headless components |
| cosscom/coss | 10,624 | coss.com/ui (ex-Origin UI) |
| microsoft/fluentui-emoji | 10,130 | 3D/color emoji assets |
| pmndrs/drei | 9,897 | R3F helpers |
| tsparticles/tsparticles | 8,984 | Particles/confetti |
| locomotivemtl/locomotive-scroll | 8,864 | Scroll detection + smooth scroll (v5 built on Lenis) |
| emilkowalski/vaul | 8,623 | Drawer |
| Remix-Design/RemixIcon | 8,384 | Icons |
| barvian/number-flow | 7,717 | Animated numbers |
| dequelabs/axe-core | 7,558 | a11y engine |
| phosphor-icons/homepage | 7,551 | Phosphor icons |
| tengbao/vanta | 7,075 | Legacy 3D backgrounds (last push 2024-03; prefer Paper shaders/custom) |
| patriciogonzalezvivo/thebookofshaders | 7,034 | Shader course |
| ibelick/motion-primitives | 6,381 | Motion components |
| rdev/liquid-glass-react | 6,269 | Liquid glass (Chromium-only displacement) |
| pmndrs/leva | 6,241 | Live tweak GUI |
| nolly-studio/cult-ui | 6,184 | Components |
| fontsource/fontsource | 6,143 | Self-hosted font packages |
| css-doodle/css-doodle | 6,049 | Generative CSS patterns |
| shuding/cobe | 5,899 | 5kb WebGL globe |
| ekmas/neobrutalism-components | 5,553 | Neo-brutal shadcn kit |
| argyleink/open-props | 5,526 | CSS tokens incl. easings |
| serafimcloud/21st | 5,472 | 21st.dev registry |
| chakra-ui/ark | 5,396 | Headless components |
| mattdesl/canvas-sketch | 5,286 | Generative art framework |
| swup/swup | 5,232 | Page transitions for server-rendered sites |
| oframe/ogl | 4,659 | Minimal WebGL library |
| iconoir-icons/iconoir | 4,561 | Icons |
| imskyleen/animate-ui | 4,334 | Animated primitives |
| vercel/geist-font | 3,632 | Geist fonts |
| ui-layouts/uilayouts | 3,626 | Components and blocks |
| paper-design/shaders | 3,484 | Canvas shaders (mesh gradient, grain, dithering) |
| patriciogonzalezvivo/lygia | 3,448 | Shader library |
| pmndrs/uikit | 3,244 | UI inside R3F |
| pmndrs/postprocessing | 2,864 | Post-processing for three.js |
| radix-ui/icons | 2,684 | Icons |
| codrops/PageTransitions | 2,311 | Classic page transition demos |
| kokonut-labs/kokonutui | 2,121 | Components |
| sjfricke/awesome-webgl | 1,537 | WebGL index |
| splinetool/react-spline | 1,421 | Spline React runtime |
| pmndrs/react-postprocessing | 1,392 | R3F post-processing |
| darkroomengineering/satus | 995 | Darkroom's Next.js App Router starter (Lenis + GSAP + WebGL conventions) |
| AxiomeCG/awesome-threejs | 992 | Three.js index |

Refresh a count or discover more:
```bash
# Refresh star counts for a list of repos (Git Bash / macOS / Linux)
for r in darkroomengineering/lenis DavidHDev/react-bits magicuidesign/magicui motiondivision/motion; do
  gh api "repos/$r" --jq '[.full_name, .stargazers_count, .pushed_at[0:10]] | @tsv'
done

# Discover: most-starred repos for a topic, with last push date (stale repos are a risk)
gh search repos "scroll animation" --sort stars --limit 20 --json fullName,stargazersCount,pushedAt,description
gh search repos "topic:webgl topic:react" --sort stars --limit 20 --json fullName,stargazersCount,pushedAt
```

### 15. Playbook: research an effect you have not seen
**Use when:** the user points at a site ("make it feel like X") or describes an effect you cannot place.
**Goal:** identify the technique and library in under 15 minutes, then rebuild a minimal version with this skill's recipes. Recreate techniques; never lift proprietary assets, shaders or code verbatim (check each repo's LICENSE; Codrops demos carry their own license, Shadertoy defaults to CC BY-NC-SA).

**Step 1 - Name it three ways.** Visual description, technical description, library vocabulary. Search each.
| What you see | Technical name | Search terms |
|---|---|---|
| Text lines slide up from behind an invisible edge | line mask reveal | "SplitText mask lines", "text reveal overflow hidden" |
| Images warp/ripple on hover or scroll | DOM-to-WebGL plane with displacement shader | "image distortion shader hover", "curtains", "ogl image hover" |
| Section sticks while content inside changes | pinned scroll sequence | "ScrollTrigger pin scrub", "sticky scrollytelling" |
| Cards stack on top of each other while scrolling | stacking cards | "sticky stacking cards", "ScrollTrigger stack" |
| Page cross-fades with a shared image growing | shared-element / view transition | "view transitions shared element", "Flip plugin page transition" |
| Letters shuffle random characters before settling | text scramble | "ScrambleText", "text scramble effect" |
| Cursor bends/magnetises buttons | magnetic hover | "magnetic button gsap quickTo" |
| Gradient that moves like liquid | mesh gradient shader | "mesh gradient shader", "stripe gradient webgl" |
| Grid of images with inertia you can drag | draggable infinite canvas | "infinite draggable grid", "Draggable inertia gallery" |

**Step 2 - Inspect the live site in DevTools (Chromium).**
- Elements: a `<canvas>` covering the viewport = WebGL/2D canvas; `html.lenis` / `lenis-smooth` classes = Lenis; `data-scroll`/`data-scroll-container` = Locomotive; `data-wf-site` on `<html>` = Webflow; `data-framer-name` attributes = Framer; `data-barba` = Barba; inline `transform` values changing every frame = JS-driven animation (GSAP/Motion); `view-transition-name` styles = View Transitions API.
- Animations drawer (More tools > Animations): captures CSS/WAAPI animations with exact durations, delays and easing curves; slow to 10% to study choreography.
- Sources: Ctrl+Shift+F across all loaded scripts for `ScrollTrigger`, `SplitText`, `lenis`, `WebGLRenderer`, `fragmentShader`, `gl_FragColor`, `uniform`, `startViewTransition`, `animation-timeline`.
- Performance panel: record a scroll; see what triggers layout/paint and whether the main thread is busy (tells you if it is CSS-driven or JS-driven).
- Rendering drawer: Paint flashing and Layer borders reveal what is composited.
- WebGL: Spector.js browser extension captures a frame and shows every draw call and shader source.

**Step 3 - Run a stack-detection snippet in the Console.** Read-only; it does not create contexts or modify the page.
```js
(() => {
  const w = window, d = document, html = d.documentElement;
  const has = (sel) => !!d.querySelector(sel);
  const report = {
    gsap: w.gsap?.version ?? (w.ScrollTrigger ? "present (no global version)" : undefined),
    scrollTrigger: !!w.ScrollTrigger,
    three: w.__THREE__, // three.js registers its REVISION here on load
    lenis: html.classList.contains("lenis") || !!w.lenis,
    locomotive: has("[data-scroll-container]"),
    barba: !!w.barba || has("[data-barba]"),
    swup: !!w.swup || has("#swup"),
    nextAppRouter: !!w.__next_f,
    nextPagesRouter: !!w.__NEXT_DATA__,
    nuxt: !!w.__NUXT__,
    webflow: html.hasAttribute("data-wf-site"),
    framer: has("[data-framer-name]"),
    shopify: !!w.Shopify,
    pixi: w.PIXI?.VERSION,
    lottie: !!w.lottie || has("lottie-player, dotlottie-player, dotlottie-wc"),
    spline: has("spline-viewer"),
    canvases: [...d.querySelectorAll("canvas")].map((c) => `${c.width}x${c.height}`),
    viewTransitionNames: [...d.querySelectorAll("*")].filter((el) => (getComputedStyle(el).viewTransitionName ?? "none") !== "none").length,
  };
  console.table(report);
  return report;
})();
```
Bundled apps often do not expose globals: a `false` here is not proof of absence, so confirm with the Sources search in step 2.

**Step 4 - Command-line sniff (fonts, colors, library signatures).** This is the script used to verify the facts in `aesthetic-directions.md`. It only sees assets referenced in the initial HTML (lazy chunks and bot-walled sites need DevTools).
```bash
#!/usr/bin/env bash
# usage: ./sniff-stack.sh https://example.com
set -uo pipefail
url="$1"
ua="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
host=$(printf '%s' "$url" | sed -E 's#(https?://[^/]+).*#\1#')
tmp=$(mktemp -d)
curl -sL --max-time 20 -A "$ua" "$url" -o "$tmp/index.html"
grep -oE '(src|href)="[^"]+\.(js|css)[^"]*"' "$tmp/index.html" | sed -E 's/^(src|href)="//; s/"$//' | sort -u | head -60 > "$tmp/assets.txt"
cp "$tmp/index.html" "$tmp/all.txt"
while read -r a; do
  case "$a" in http*) u="$a";; //*) u="https:$a";; /*) u="$host$a";; *) u="$host/$a";; esac
  curl -sL --max-time 15 -A "$ua" "$u" >> "$tmp/all.txt"
done < "$tmp/assets.txt"
echo "== libraries (match counts)"
for sig in ScrollTrigger SplitText ScrollSmoother lenis locomotive WebGLRenderer ogl barba swup lottie rive splinetool pixi matter framer-motion startViewTransition animation-timeline; do
  c=$(grep -o "$sig" "$tmp/all.txt" | wc -l)
  if [ "$c" -gt 0 ]; then echo "$sig: $c"; fi
done
echo "== font families"; grep -oiE 'font-family:[^;}]{2,70}' "$tmp/all.txt" | sort | uniq -c | sort -rn | head -10
echo "== font files";    grep -oiE '[A-Za-z0-9_-]+\.woff2' "$tmp/all.txt" | sort -u | head -15
echo "== top hex colors"; grep -oiE '#[0-9a-f]{6}\b' "$tmp/all.txt" | tr 'A-F' 'a-f' | sort | uniq -c | sort -rn | head -12
echo "== shader hints";  grep -oE 'gl_FragColor|fragColor|uniform (float|vec2|vec3|sampler2D) u[A-Z][A-Za-z]*' "$tmp/all.txt" | sort | uniq -c | sort -rn | head -10
rm -rf "$tmp"
```
Hashed font filenames (e.g., `03ez25a9g3i0n.woff2`) mean `next/font` or a bundler renamed them; read the `font-family` list instead.

**Step 5 - Search where effects are published, by effect name.**
- Codrops: `https://tympanus.net/codrops/?s=<effect name>` then open the article's GitHub link (github.com/codrops/<Demo>).
- CodePen: `https://codepen.io/search/pens?q=<effect name>`; add "gsap", "three", or "css only".
- GSAP community forum and showcase: https://gsap.com/community/ , https://gsap.com/showcase/
- Component libraries (recipe 4): search the effect name on reactbits.dev, magicui.design, ui.aceternity.com, 21st.dev.
- GitHub code search (real production usage):
```bash
gh search code "ScrollTrigger.create" "pin:" --language=typescript --limit 20
gh search code "SplitText.create" "mask:" --limit 20
gh search code "uniform float uTime" "uMouse" --extension=glsl --limit 20
gh search code "startViewTransition" --language=tsx --limit 20
gh search code "animation-timeline: view()" --extension=css --limit 20
gh search repos "infinite draggable grid" --sort stars --limit 10
```

**Step 6 - Rebuild minimal, then tune.** Reproduce the effect in isolation with the closest recipe in this skill (`scroll-gsap.md`, `scroll-css-native.md`, `text-effects.md`, `interactions.md`, `page-transitions.md`, `backgrounds-svg-canvas.md`, `webgl-shaders-3d.md`), match timing from the Animations drawer, tune values live with Leva or GSDevTools, then apply the chosen direction's tokens. Finish with reduced-motion and pointer-type fallbacks.

**Step 7 - Decide whether to use it.** Ask: does this effect serve the direction and the content, or is it the reference site's signature? If it is their signature, borrow the principle (e.g., "type enters through a mask on scroll"), change the material (timing, shape, axis, color).

## Gotchas
- **Galleries go stale or move.** godly.website now redirects to recent.design; originui.com to coss.com/ui; screenlane.com to pageflows.com; savee.it to savee.com; futurefonts.xyz to futurefonts.com; uilayouts.com expired (use ui-layouts.com); experimentaljetset.nl to jetset.nl. Re-check a URL before sending the user to it.
- **Bot walls are not dead sites.** Unsplash, Pexels, LottieFiles, SiteInspire, Cult UI, Blush, Shadertoy, CodePen, WebPageTest, Aesop, Balenciaga returned 401/403/429 to scripts; they load in browsers. Use the browser (claude-in-chrome) when WebFetch fails.
- **Award galleries skew to heavy WebGL.** SOTD winners mostly carry the Developer Award; that is not a signal that a SaaS or commerce client needs WebGL. Use industry galleries (Land-book, SaaS Landing Page, Mobbin) for conversion-critical pages.
- **Template marketplaces define the "default".** Framer/Webflow templates and top shadcn blocks show what is now generic; study them to avoid them.
- **Component libraries share a look.** Magic UI/Aceternity/React Bits effects are recognisable; restyle tokens, timing and scale, and use at most 1-2 per page.
- **Star counts mislead.** Check `pushed_at`: vanta (2024-03), theatre (2024-08), barba (2024-12) are popular but slow-moving; prefer maintained alternatives for new builds.
- **Licenses.** Shadertoy default is CC BY-NC-SA (non-commercial); Codrops demos have their own license; Pangram Pangram fonts need a commercial license; SF Pro is Apple-platform only; Unsplash photos are free but instantly recognisable.
- **Static sniffing misses code-split chunks.** Next.js/Vite sites load most JS lazily; confirm library use in DevTools Sources/Network, not just initial HTML.
- **Hashed or renamed fonts.** `next/font` renames files; the `font-family` names in CSS (often `__Name_hash`) still reveal the family.

## Sources
- Awwwards SOTY and SOTD pages: https://www.awwwards.com/websites/sites_of_the_year/ , https://www.awwwards.com/websites/sites_of_the_day/
- Godly redirect observed: https://godly.website -> https://recent.design/?ref=godly (HTTP 301, 2026-09-26)
- Vibe-coded tells dataset: https://github.com/JCarterJohnson/vibecoded-design-tells
- Developers Digest slop patterns: https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- Figma 2026 trends: https://www.figma.com/resource-library/web-design-trends/
- Fontfabric 2026 trends: https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/
- GitHub API (`gh api repos/...`, `gh api orgs/codrops/repos`) for all star counts and push dates, 2026-09-26
- HTTP status checks via `curl -L` of every URL listed in recipes 1-13, 2026-09-26
- Live CSS inspection (fonts/colors) of linear.app, vercel.com, raycast.com, resend.com, stripe.com, mercury.com, column.com, gumroad.com, nothing.tech, teenage.engineering, oxide.computer, ghostty.org, terminal.shop, posthog.com, lusion.co, ouraring.com, seed.com, aman.com, muuto.com


