// Print recipe headings with GitHub-style anchors for the SKILL.md effect index, and validate intra/inter-file links.
// Usage: node scripts/maintenance/check-links.mjs --links [file.md ...]   (no --links: print recipe headings with anchors)
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const refDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "references");
const args = process.argv.slice(2);
const checkLinks = args.includes("--links");
const files = args.filter(a => a.endsWith(".md"));

// GitHub-style: keep text of literal tags like `<ViewTransition>` (they are code, not HTML), drop punctuation.
const slug = s => s.trim().toLowerCase()
  .replace(/[^\p{L}\p{N}\s_-]/gu, "")
  .replace(/\s/g, "-");

async function anchorsOf(name) {
  const md = await readFile(path.join(refDir, name), "utf8").catch(() => null);
  if (md === null) return null;
  const seen = new Map();
  const anchors = new Set();
  let inCode = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) inCode = !inCode;
    if (inCode) continue;
    for (const [, id] of line.matchAll(/<a (?:id|name)="([\w-]+)"/g)) anchors.add(id);
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (!h) continue;
    let s = slug(h[2]);
    const n = seen.get(s) ?? 0;
    seen.set(s, n + 1);
    if (n) s = `${s}-${n}`;
    anchors.add(s);
  }
  return anchors;
}

if (!checkLinks) {
  for (const name of files) {
    const md = await readFile(path.join(refDir, name), "utf8");
    let inCode = false;
    for (const line of md.split(/\r?\n/)) {
      if (/^\s*```/.test(line)) inCode = !inCode;
      if (inCode) continue;
      const h = line.match(/^###\s+(.*)$/);
      if (h) console.log(`${name}#${slug(h[1])}\t${h[1]}`);
    }
  }
} else {
  const all = (await readdir(refDir)).filter(f => f.endsWith(".md"));
  const cache = new Map();
  const get = async f => (cache.has(f) ? cache.get(f) : (cache.set(f, await anchorsOf(f)), cache.get(f)));
  const targets = files.length ? files : all;
  let bad = 0;
  for (const name of targets) {
    const md = await readFile(path.join(refDir, name), "utf8");
    // Markdown links anywhere, plus backticked cross-file refs (`file.md#anchor`); skip backticked bare #ids (CSS selectors, hex colors).
    const re = /\]\(((?:[\w-]+\.md)?#[\w-]+|[\w-]+\.md)\)|`([\w-]+\.md(?:#[\w-]+)?)`/g;
    for (const [, mdLink, codeLink] of md.matchAll(re)) {
      const link = mdLink ?? codeLink;
      const [file, anchor] = link.split("#");
      const target = file || name;
      const anchors = await get(target);
      if (anchors === null) { console.log(`${name}: missing file ${target} (link ${link})`); bad++; continue; }
      if (anchor && !anchors.has(anchor)) { console.log(`${name}: broken anchor ${link}`); bad++; }
    }
  }
  console.log(`${bad} broken links`);
}
