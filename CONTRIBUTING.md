# Contributing to GOATED UI

Thank you for helping. This skill earns trust by only teaching agents code that was checked, so every contribution follows the same bar.

## What makes a good recipe

- **It solves a real, named effect** that ships on production sites, and says when to use it and when not to.
- **It is verified.** TypeScript and TSX type-check against a pinned library version (write the version in the recipe). Visual recipes were run in a browser and, when they animate on scroll, audited with `scripts/motion-audit.mjs`.
- **It is accessible.** Reduced motion keeps the content (static end state or opacity only), pointer-only effects are gated to `(hover: hover) and (pointer: fine)`, and nothing essential hides behind JavaScript.
- **It cleans up after itself**: timelines, ScrollTriggers, observers, animation frames, WebGL contexts.
- **It has a Tune section**: which values to change for each motion personality.

## Workflow

1. Fork the repository and create a branch.
2. Edit or add recipes in `skills/frontend-atlas/references/`. Keep one recipe per `###` heading: the heading becomes its anchor in the index.
3. Regenerate the index and check every link:

   ```bash
   node skills/frontend-atlas/scripts/maintenance/build-index.mjs
   node skills/frontend-atlas/scripts/maintenance/check-links.mjs --links
   node tools/validate.mjs
   ```

4. If you added a commonly requested effect, add it to the shortlist in `SKILL.md`.
5. Add a line to `CHANGELOG.md` under an "Unreleased" heading.
6. Open a pull request that names the library versions you verified against and how you tested the recipe in a browser.

## Reporting a problem

Open an issue with the recipe anchor (for example `scroll-gsap.md#9-stacked-cards`), the library versions you use, what you expected and what happened. A minimal reproduction link is the fastest way to a fix.

## Releases

Bump `version` in both `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` (the validator fails if they disagree), move the "Unreleased" notes under the new version, and tag the release `vX.Y.Z`.
