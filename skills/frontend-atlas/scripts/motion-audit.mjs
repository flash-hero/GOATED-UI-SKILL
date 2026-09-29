#!/usr/bin/env node
// Motion audit for animated pages: intro frames, scroll-position frames, frame pacing,
// long animation frames, CLS (with shifting nodes), console errors, horizontal overflow (with the
// culprit element), and content that entered the viewport but was never visible there
// (normal and prefers-reduced-motion). Run from a project that has playwright or playwright-core:
//   node <skill-dir>/scripts/motion-audit.mjs http://localhost:3000 [--out motion-audit] [--widths 1440,390] [--steps 12]
// Browser: set AUDIT_BROWSER to a Chromium executable, otherwise installed Edge/Chrome or Playwright's bundled Chromium.

import { access, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const url = args.find(a => /^https?:\/\//.test(a));
if (!url) {
  console.error("Usage: node motion-audit.mjs <url> [--out dir] [--widths 1440,390] [--steps 12]");
  process.exit(2);
}
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const outDir = path.resolve(flag("out", "motion-audit"));
const widths = flag("widths", "1440,390").split(",").map(Number).filter(Boolean);
const scrollSteps = Number(flag("steps", "12"));
const INTRO_FRAMES_MS = [0, 250, 600, 1200, 2500];
const SETTLE_MS = 450;

async function loadChromium() {
  const require = createRequire(path.join(process.cwd(), "noop.js"));
  for (const id of ["playwright", "playwright-core", "@playwright/test"]) {
    try {
      const mod = require(id);
      return mod.chromium ?? mod.default?.chromium;
    } catch { /* try next */ }
  }
  console.error("playwright not found in this project. Install it: npm i -D playwright-core");
  process.exit(2);
}

async function browserExecutable() {
  const local = process.env.LOCALAPPDATA;
  const candidates = [
    process.env.AUDIT_BROWSER,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    local && path.join(local, "Google", "Chrome", "Application", "chrome.exe"),
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { await access(candidate); return candidate; } catch { /* next */ }
  }
  return undefined; // fall back to Playwright's bundled Chromium
}

// Injected before any page script: frame pacing, long animation frames, CLS.
function instrument() {
  const describe = node => {
    if (!node || node.nodeType !== 1) return String(node?.nodeName ?? "?");
    const cls = typeof node.className === "string" && node.className.trim() ? "." + node.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    return `<${node.tagName.toLowerCase()}${node.id ? "#" + node.id : ""}${cls}>`;
  };
  const m = { frames: [], loaf: [], cls: 0, shifts: [], recording: false, describe };
  window.__motionAudit = m;
  let last = performance.now();
  const tick = now => {
    if (m.recording) m.frames.push(now - last);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) if (m.recording) m.loaf.push(Math.round(e.duration));
    }).observe({ type: "long-animation-frame", buffered: false });
  } catch { /* LoAF unsupported */ }
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        m.cls += e.value;
        if (e.value > 0.005) m.shifts.push({ value: Math.round(e.value * 1000) / 1000, sources: (e.sources || []).map(s => describe(s.node)) });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch { /* CLS unsupported */ }
}

const CONTENT = "h1,h2,h3,h4,h5,h6,p,li,a,button,img,video,figure,blockquote,label";

// Called after every scroll step: remember content that was in the viewport, and content that was actually visible there.
function markSeen(content) {
  const w = window;
  w.__inView ??= new WeakSet();
  w.__seen ??= new WeakSet();
  for (const el of document.querySelectorAll(content)) {
    if (w.__seen.has(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
    w.__inView.add(el);
    let node = el, visible = true;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      if (Number(cs.opacity) < 0.05 || cs.visibility === "hidden") { visible = false; break; }
      node = node.parentElement;
    }
    if (visible) w.__seen.add(el);
  }
}

// Content that sat in the viewport during the scroll but was never visible there (reveal never fired, or
// reduced-motion left it hidden). Crossfade stacks and exit animations are fine: they were visible at some step.
function findNeverVisible(content) {
  const w = window;
  const describe = w.__motionAudit.describe;
  const stuck = [];
  let neverInView = 0;
  for (const el of document.querySelectorAll(content)) {
    if (el.closest("[aria-hidden='true'],[hidden],dialog:not([open]),[inert],template,noscript")) continue;
    const text = (el.textContent || el.getAttribute("alt") || "").trim();
    if (!text && !["IMG", "VIDEO"].includes(el.tagName)) continue;
    if (w.__seen?.has(el)) continue;
    if (!w.__inView?.has(el)) { neverInView++; continue; }
    let node = el, reason = "not visible";
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      if (Number(cs.opacity) < 0.05) { reason = `opacity ${cs.opacity} on ${describe(node)}`; break; }
      if (cs.visibility === "hidden") { reason = `visibility hidden on ${describe(node)}`; break; }
      node = node.parentElement;
    }
    stuck.push({ tag: el.tagName.toLowerCase(), text: text.slice(0, 60), reason });
    if (stuck.length >= 25) break;
  }
  return { stuck, neverInView };
}

// Outermost elements that stick out horizontally without a clipping ancestor (the cause of sideways page scroll).
function findOverflowCulprits() {
  const describe = window.__motionAudit.describe;
  const docW = document.documentElement.clientWidth;
  const culprits = [];
  // Fixed boxes (cursors, overlays) never widen the page, and clipping ancestors contain their children.
  const contains = el => { const cs = getComputedStyle(el); return cs.overflowX !== "visible" || cs.position === "fixed"; };
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || (r.right <= docW + 1 && r.left >= -1)) continue;
    if (getComputedStyle(el).position === "fixed") continue;
    let p = el.parentElement, clipped = false;
    while (p && p !== document.body) { if (contains(p)) { clipped = true; break; } p = p.parentElement; }
    if (clipped || culprits.some(c => c.el.contains(el))) continue;
    culprits.push({ el, desc: `${describe(el)} spans ${Math.round(r.left)}..${Math.round(r.right)}px` });
    if (culprits.length >= 5) break;
  }
  return culprits.map(c => c.desc);
}

const pct = (arr, p) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return Math.round(s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))] * 10) / 10;
};

async function scrollThrough(page, label, width, shots) {
  const { height, vh } = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, vh: innerHeight }));
  const total = Math.max(0, height - vh);
  const stepPx = Math.max(200, Math.round(total / scrollSteps));
  await page.mouse.move(width / 2, vh / 2);
  await page.evaluate(markSeen, CONTENT);
  await page.evaluate(() => { window.__motionAudit.recording = true; });
  let i = 0;
  for (let y = 0; y < total + stepPx; y += stepPx) {
    // Wheel in small increments so smooth-scroll libraries (Lenis) and ScrollTrigger react like a real user.
    for (let k = 0; k < 4; k++) { await page.mouse.wheel(0, stepPx / 4); await page.waitForTimeout(40); }
    await page.waitForTimeout(SETTLE_MS);
    await page.evaluate(markSeen, CONTENT);
    if (shots) {
      const file = `${label}-${width}-scroll-${String(i).padStart(2, "0")}.png`;
      await page.screenshot({ path: path.join(outDir, file) });
    }
    i++;
  }
  await page.evaluate(() => { window.__motionAudit.recording = false; });
  const m = await page.evaluate(() => ({ frames: window.__motionAudit.frames, loaf: window.__motionAudit.loaf, cls: window.__motionAudit.cls, shifts: window.__motionAudit.shifts }));
  return {
    scrollHeight: height,
    frameP50ms: pct(m.frames, 50),
    frameP95ms: pct(m.frames, 95),
    framesOver33ms: m.frames.filter(f => f > 33.4).length,
    frameCount: m.frames.length,
    longAnimationFrames: m.loaf.length,
    worstLoafMs: m.loaf.length ? Math.max(...m.loaf) : 0,
    cls: Math.round(m.cls * 1000) / 1000,
    layoutShifts: m.shifts.sort((a, b) => b.value - a.value).slice(0, 6),
  };
}

await mkdir(outDir, { recursive: true });
const chromium = await loadChromium();
const executablePath = await browserExecutable();
const browser = await chromium.launch({ executablePath, headless: true });
const report = { url, generatedAt: new Date().toISOString(), note: "Headless lab numbers; use them to compare before/after, not as field data.", runs: [] };

try {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    for (const width of widths) {
      const label = reducedMotion === "reduce" ? "reduced" : "motion";
      const context = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion });
      await context.addInitScript(instrument);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
      page.on("console", msg => { if (msg.type() === "error") errors.push(`console: ${msg.text()}`); });

      const t0 = Date.now();
      await page.goto(url, { waitUntil: "domcontentloaded" });
      if (reducedMotion === "no-preference") {
        for (const at of INTRO_FRAMES_MS) {
          const wait = at - (Date.now() - t0);
          if (wait > 0) await page.waitForTimeout(wait);
          await page.screenshot({ path: path.join(outDir, `intro-${width}-${String(at).padStart(4, "0")}ms.png`) });
        }
      }
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);

      const scroll = await scrollThrough(page, label, width, reducedMotion === "no-preference" || width === widths[0]);
      const { stuck, neverInView } = await page.evaluate(findNeverVisible, CONTENT);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const overflowCulprits = overflow > 1 ? await page.evaluate(findOverflowCulprits) : [];

      report.runs.push({ reducedMotion, width, errors, horizontalOverflowPx: overflow, overflowCulprits, stuckInvisible: stuck, contentNeverInViewport: neverInView, ...scroll });
      await context.close();
      console.log(`${label} @${width}: p95 frame ${scroll.frameP95ms}ms, LoAF ${scroll.longAnimationFrames}, CLS ${scroll.cls}, stuck-invisible ${stuck.length}, errors ${errors.length}, overflow ${overflow}px`);
    }
  }
} finally {
  await browser.close();
}

const problems = [];
for (const r of report.runs) {
  const tag = `${r.reducedMotion}@${r.width}`;
  if (r.errors.length) problems.push(`${tag}: ${r.errors.length} console/page errors: ${[...new Set(r.errors)].slice(0, 3).join(" | ").slice(0, 300)}`);
  if (r.horizontalOverflowPx > 1) problems.push(`${tag}: horizontal overflow ${r.horizontalOverflowPx}px from ${r.overflowCulprits.join(", ") || "unknown element"}`);
  for (const s of r.stuckInvisible) problems.push(`${tag}: <${s.tag}> "${s.text}" was in the viewport but never visible (${s.reason})`);
  if (r.cls > 0.1) problems.push(`${tag}: CLS ${r.cls} > 0.1, largest shifts: ${r.layoutShifts.slice(0, 3).map(s => `${s.value} ${s.sources.join("+")}`).join("; ")}`);
  if (r.frameP95ms && r.frameP95ms > 25) problems.push(`${tag}: p95 frame ${r.frameP95ms}ms while scrolling (target <= 17-20ms)`);
  if (r.worstLoafMs > 100) problems.push(`${tag}: long animation frame of ${r.worstLoafMs}ms`);
}
report.problems = problems;
await writeFile(path.join(outDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(problems.length ? `\nPROBLEMS:\n- ${problems.join("\n- ")}` : "\nNo problems detected.");
console.log(`Frames and report: ${outDir}`);
process.exitCode = problems.length ? 1 : 0;
