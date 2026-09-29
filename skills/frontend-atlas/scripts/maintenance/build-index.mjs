// Generate references/INDEX.md: every recipe heading (### and #### under Recipes) with GitHub anchors.
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const refDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "references");
const slug = s => s.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
const ORDER = [
  "motion-principles.md", "scroll-gsap.md", "scroll-css-native.md", "text-effects.md", "interactions.md",
  "page-transitions.md", "backgrounds-svg-canvas.md", "webgl-shaders-3d.md", "component-recipes.md",
  "css-modern.md", "typography.md", "color-surfaces.md", "layout-composition.md", "aesthetic-directions.md",
  "libraries.md", "performance-a11y.md", "inspiration-sources.md",
];
const files = (await readdir(refDir)).filter(f => f.endsWith(".md") && f !== "INDEX.md");
const ordered = [...ORDER.filter(f => files.includes(f)), ...files.filter(f => !ORDER.includes(f))];

let out = "# Recipe index\n\n> Every recipe in this skill, by file. Search this file for an effect name (Ctrl+F / grep), then open only that section.\n> Generated from the reference headings; regenerate after editing references.\n\n";
let total = 0;
for (const f of ordered) {
  const md = await readFile(path.join(refDir, f), "utf8");
  const loadWhen = md.match(/^> Load when:\s*(.*)$/m)?.[1]?.trim() ?? "";
  const seen = new Map();
  const items = [];
  let inCode = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) inCode = !inCode;
    if (inCode) continue;
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (!h) continue;
    let s = slug(h[2]);
    const n = seen.get(s) ?? 0;
    seen.set(s, n + 1);
    if (n) s = `${s}-${n}`;
    const level = h[1].length;
    if (level === 3 || (level === 4 && /^\d+\.\d+/.test(h[2]))) items.push({ level, text: h[2].replace(/`/g, ""), anchor: s });
  }
  total += items.length;
  out += `## [${f}](${f})\n${loadWhen ? `${loadWhen}\n` : ""}\n`;
  out += items.map(i => `${i.level === 4 ? "  " : ""}- [${i.text}](${f}#${i.anchor})`).join("\n") + "\n\n";
}
await writeFile(path.join(refDir, "INDEX.md"), out);
console.log(`INDEX.md: ${total} entries from ${ordered.length} files`);
