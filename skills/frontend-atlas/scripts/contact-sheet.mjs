#!/usr/bin/env node
// Combine audit screenshots into one labeled contact sheet PNG so a whole scroll can be reviewed in one image.
//   node contact-sheet.mjs <dir> [--match motion-1440-scroll] [--cols 5] [--width 360] [--out sheet.png]
import { readdir, writeFile, access } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const dir = path.resolve(args.find(a => !a.startsWith("--") && !/^\d+$/.test(a)) ?? ".");
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const match = flag("match", "");
const cols = Number(flag("cols", "5"));
const tile = Number(flag("width", "360"));
const out = path.resolve(dir, flag("out", `sheet-${match || "all"}.png`));

const require = createRequire(path.join(process.cwd(), "noop.js"));
let chromium;
for (const id of ["playwright", "playwright-core", "@playwright/test"]) { try { chromium = require(id).chromium; break; } catch { /* next */ } }
if (!chromium) { console.error("Install playwright-core in this project first."); process.exit(2); }

const files = (await readdir(dir)).filter(f => f.endsWith(".png") && f.includes(match) && !f.startsWith("sheet-")).sort();
const html = `<!doctype html><body style="margin:0;background:#111;color:#ddd;font:12px system-ui">
<div style="display:grid;grid-template-columns:repeat(${cols},${tile}px);gap:6px;padding:6px">
${files.map(f => `<figure style="margin:0"><img src="${pathToFileURL(path.join(dir, f)).href}" style="width:${tile}px;display:block"><figcaption>${f}</figcaption></figure>`).join("\n")}
</div></body>`;
const htmlPath = path.join(dir, "_sheet.html");
await writeFile(htmlPath, html);

const candidates = [process.env.AUDIT_BROWSER, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].filter(Boolean);
let executablePath;
for (const c of candidates) { try { await access(c); executablePath = c; break; } catch { /* next */ } }
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: cols * (tile + 6) + 6, height: 600 } });
await page.goto(pathToFileURL(htmlPath).href);
await page.waitForLoadState("load");
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`${files.length} frames -> ${out}`);
