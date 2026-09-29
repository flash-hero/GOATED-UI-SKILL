# Changelog

All notable changes to GOATED UI are documented here. The project follows [Semantic Versioning](https://semver.org/): a new recipe or reference is a minor release, a correction is a patch, and a change to the workflow rules in `SKILL.md` is a major release.

## [1.0.0] - 2026-09-29

First public release of the `frontend-atlas` skill.

- 474 recipes across 17 reference files: motion principles, GSAP ScrollTrigger + Lenis, CSS scroll-driven animations, modern CSS, text effects, typography, interactions, page transitions, backgrounds (CSS, SVG, canvas), WebGL and React Three Fiber, 67 named components, color and surfaces, layout and composition, 30 aesthetic directions, 37 libraries, performance and accessibility, inspiration sources.
- `SKILL.md` router: Design Read, stack choice, verified platform facts, page choreography blueprint, non-negotiables, verification protocol, motion slop to refuse.
- Audit scripts: `motion-audit.mjs` (frame pacing, long animation frames, layout shift with its sources, overflow culprits, reveals that never fired, normal and reduced-motion runs) and `contact-sheet.mjs`.
- Maintenance scripts: `build-index.mjs` regenerates the recipe index, `check-links.mjs` validates every anchor.
- Library versions and browser facts verified on 2026-09-27: gsap 3.15, @gsap/react 2.1, motion 13.4, lenis 1.3, three r186, @react-three/fiber 9.8, drei 10.7, animejs 4.5, tailwindcss 4.3, next 16.3, react 19.3.
- Distribution: Claude Code plugin marketplace, the `skills` CLI for other agents, and manual install.

[1.0.0]: https://github.com/flash-hero/GOATED-UI-SKILL/releases/tag/v1.0.0
