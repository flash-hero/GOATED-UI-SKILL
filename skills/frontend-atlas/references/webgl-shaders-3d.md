# WebGL, Shaders and 3D for the Web
> Load when: the job needs a shader background, image distortion, DOM-synced WebGL gallery, particles, a 3D hero (R3F/drei), a globe, post-processing, Paper/Unicorn/Spline embeds, or WebGPU/TSL.
> Stack assumptions: React 19.3 / Next 16 App Router + TS, three 0.186 (r186), @react-three/fiber 9.8 (peer: react >=19 <19.4), @react-three/drei 10.7, @react-three/postprocessing 3.1 + postprocessing 6.39, ogl 1.0.11, cobe 2.0, @paper-design/shaders-react 0.0.81, unicornstudio-react 2.2, lenis 1.3, gsap 3.15. Raw WebGL2 and OGL variants given where they save 150 kB.

## Contents
- [Decision guide](#decision-guide)
- [1. Gatekeeping and loading shell (Next 16)](#1-gatekeeping-and-loading-shell-next-16)
- [2. Minimal full-screen fragment shader: WebGL2, OGL, R3F](#2-minimal-full-screen-fragment-shader-webgl2-ogl-r3f)
- [3. Shader library (GLSL)](#3-shader-library-glsl)
- [4. Image effects and DOM-to-WebGL](#4-image-effects-and-dom-to-webgl)
- [5. Cursor fluid simulation](#5-cursor-fluid-simulation)
- [6. Particles: morphing points, mouse repulsion, GPGPU](#6-particles-morphing-points-mouse-repulsion-gpgpu)
- [7. R3F hero scene (glass, environment, GLTF, scroll camera, 3D text)](#7-r3f-hero-scene-glass-environment-gltf-scroll-camera-3d-text)
- [8. Globes: cobe, three-globe, custom](#8-globes-cobe-three-globe-custom)
- [9. Post-processing stack](#9-post-processing-stack)
- [10. No-code / low-code: Paper Shaders, Unicorn Studio, Spline](#10-no-code--low-code-paper-shaders-unicorn-studio-spline)
- [11. WebGPU + TSL in r186](#11-webgpu--tsl-in-r186)
- [12. Debug and perf tooling](#12-debug-and-perf-tooling)
- [13. Art direction and taste verdicts](#13-art-direction-and-taste-verdicts)
- [Gotchas](#gotchas)
- [Sources](#sources)

Sibling files: static/CSS gradients, SVG, Canvas 2D, Lottie/Rive live in `backgrounds-svg-canvas.md`; Lenis + ScrollTrigger mechanics in `scroll-gsap.md`; cursor followers in `interactions.md`; general a11y/perf budgets in `performance-a11y.md`; React Bits/Aceternity drop-ins in `component-recipes.md`.

## Decision guide

First question: **would a CSS gradient, a looping AV1/WebM video, or an image do 90% of it?** If yes, ship that (see `backgrounds-svg-canvas.md`). WebGL earns its cost only when the effect is (a) interactive (cursor, scroll velocity, click), (b) procedural and infinite (never loops visibly), (c) needs real lighting/refraction, or (d) is the brand's signature moment.

| Goal / feel | Technique | Cost (JS gz / GPU) | Recipe |
|---|---|---|---|
| Slow organic brand gradient behind hero | Paper `MeshGradient` or custom domain-warped fbm | ~12 kB (Paper) or ~2 kB raw WebGL2 / low GPU | [3.2](#32-domain-warped-fbm-gradient-stripe--mesh-style), [10](#10-no-code--low-code-paper-shaders-unicorn-studio-spline) |
| Grainy "Grainient" noise gradient | noise gradient + grain in one pass | ~2 kB / low | [3.4](#34-animated-noise-gradient-with-grain) |
| Aurora / silk ribbons | 1-octave simplex + ramp, or sine fold (Silk) | ~2-10 kB / low | [3.5](#35-aurora-and-silk-flows) |
| Liquid chrome / metal | iterated domain distortion + env-like palette | ~2 kB / MEDIUM-HIGH (loops per pixel) | [3.6](#36-liquid-chrome--metal) |
| Retro print look (dither, halftone, ASCII) | post pass over scene or image | +postprocessing ~30 kB / low | [3.7](#37-bayer-dithering-and-halftone), [3.8](#38-ascii) |
| Image to image hover transition | displacement map mix (Robin Delaporte hover-effect) | OGL ~8 kB / low | [4.1](#41-hover-displacement-transition-between-two-images) |
| Gallery that warps/RGB-splits with scroll | DOM-to-WebGL planes + Lenis velocity | three ~185 kB / low-medium | [4.3](#43-dom-to-webgl-gallery-synced-to-lenis-rgb-shift-curve-ripple) |
| Infinite drag slider with depth | wrap-around planes, lerped offset | three ~185 kB / low | [4.4](#44-infinite-webgl-slider) |
| Cursor ink / smoke | Pavel Dobryakov fluid (SplashCursor) or cheap trail texture | ~12 kB / HIGH | [5](#5-cursor-fluid-simulation) |
| Logo/text dissolves to particles | Points + morph attribute + GSAP progress | R3F ~200 kB / low-medium | [6.1](#61-points-morph-text---sphere-with-mouse-repulsion) |
| 100k+ simulated particles | GPGPU / FBO ping-pong | three / HIGH | [6.2](#62-gpgpu--fbo-particles-overview) |
| Premium 3D product / glass object | R3F + drei Environment/Lightformer + MeshTransmissionMaterial | ~250 kB + model / HIGH | [7](#7-r3f-hero-scene-glass-environment-gltf-scroll-camera-3d-text) |
| "We are global" globe | cobe 2 (5 kB) > three-globe > custom | 5 kB / low | [8](#8-globes-cobe-three-globe-custom) |
| Film look on a 3D scene | Bloom + Noise + Vignette (+ subtle CA) | +30 kB / medium | [9](#9-post-processing-stack) |
| Designer owns the effect | Unicorn Studio embed / Spline | 54 kB / 700 kB+ runtime | [10](#10-no-code--low-code-paper-shaders-unicorn-studio-spline) |
| Compute-heavy, TSL node materials | WebGPURenderer (auto WebGL2 fallback) | three/webgpu ~290 kB / varies | [11](#11-webgpu--tsl-in-r186) |

Library choice: **raw WebGL2** for one full-screen shader (0 deps). **OGL** (core ~8-11 kB gz) for a few quads/textures. **three + R3F** once you need a scene graph, GLTF, lighting, post, or many planes. Measured r186 bundles (esbuild, min+gz, untreeshaken): `three` ~185 kB, `three/webgpu` ~290 kB; add R3F + the drei pieces you import. Never ship three.js for a single gradient.

## Recipes

### 1. Gatekeeping and loading shell (Next 16)
**Looks like:** the page paints a poster (image or CSS gradient) instantly; the canvas mounts only when near the viewport, fades in over the poster once its first frame is drawn, pauses offscreen and in hidden tabs, freezes on reduced motion, and falls back to the poster on context loss or weak GPUs.  
**Use when / avoid when:** every WebGL surface on a marketing page. Skip only for WebGL that IS the product (configurator, editor).  
**Stack:** React / Next 16 / WebGL

```ts
// src/lib/webgl/capabilities.ts
export type GLTier = "none" | "low" | "high";

type NavExtras = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** Call only in effects (never at module scope: SSR has no window). */
export function detectGLTier(): GLTier {
  if (typeof window === "undefined") return "none";
  try {
    const probe = document.createElement("canvas");
    // failIfMajorPerformanceCaveat -> null on software rasterizers (SwiftShader, blocklisted GPUs)
    const gl = probe.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return "none";
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // free the probe context immediately
    const nav = navigator as NavExtras;
    const lowMemory = (nav.deviceMemory ?? 8) <= 4; // Chromium only; others default to 8
    const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    const saveData = nav.connection?.saveData === true;
    const smallTouch = window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 768;
    return lowMemory || lowCores || saveData || smallTouch ? "low" : "high";
  } catch {
    return "none";
  }
}

export const DPR_CAP = { low: 1, high: 1.5 } as const; // 2 only for small canvases (< 600px)
```

```tsx
// src/lib/webgl/use-reduced-motion.ts
"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
```

```tsx
// src/components/webgl/ShaderStage.tsx
"use client";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { detectGLTier, type GLTier } from "@/lib/webgl/capabilities";
import { useReducedMotion } from "@/lib/webgl/use-reduced-motion";

export type StageSceneProps = {
  paused: boolean;          // offscreen or tab hidden
  reducedMotion: boolean;   // render ONE frame, no loop
  tier: Exclude<GLTier, "none">;
  onReady: () => void;      // call after first frame is drawn
  onContextLost: () => void;
};

type Props = {
  Scene: ComponentType<StageSceneProps>; // pass a next/dynamic({ ssr:false }) component
  poster: ReactNode;                      // <Image priority .../> or a CSS gradient div
  // Must position AND size the host: "absolute inset-0 -z-10" (background layer) or "relative h-[80svh]" (block).
  // Positioning lives in the class, never in an inline style: inline `position` would silently override
  // the caller's `absolute` and collapse the stage to 0px height (poster and canvas both vanish).
  className?: string;
  rootMargin?: string;
};

export function ShaderStage({ Scene, poster, className = "relative h-full w-full", rootMargin = "200px" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [tier, setTier] = useState<GLTier | null>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);

  useEffect(() => setTier(detectGLTier()), []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setShouldMount(true); // mount once, then only pause
    }, { rootMargin });
    io.observe(el);
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [rootMargin]);

  const canRender = tier !== null && tier !== "none" && shouldMount && !lost;

  return (
    <div ref={hostRef} className={className} style={{ overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0 }}>{poster}</div>
      {canRender && (
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            opacity: ready ? 1 : 0,
            transition: "opacity var(--dur-reveal, 700ms) var(--ease-out, cubic-bezier(.16,1,.3,1))",
          }}
        >
          <Scene
            paused={!inView || tabHidden}
            reducedMotion={reducedMotion}
            tier={tier}
            onReady={() => setReady(true)}
            onContextLost={() => { setReady(false); setLost(true); }}
          />
        </div>
      )}
    </div>
  );
}
```

```tsx
// src/components/hero/HeroBackground.tsx  (client file: ssr:false is illegal in Server Components)
"use client";
import dynamic from "next/dynamic";
import { ShaderStage } from "@/components/webgl/ShaderStage";

const GradientScene = dynamic(() => import("@/components/webgl/GradientScene"), { ssr: false });

export function HeroBackground() {
  return (
    <ShaderStage
      className="absolute inset-0 -z-10"
      Scene={GradientScene}
      poster={<div className="h-full w-full bg-[radial-gradient(120%_80%_at_20%_10%,#2a1b5c,transparent),linear-gradient(#0b0b12,#0b0b12)]" />}
    />
  );
}
```

Mobile/GPU budget (per visible canvas, mid-range Android at 60 fps):

| Item | Budget |
|---|---|
| DPR | cap 1.5 desktop, 1 on `tier: low`; full-screen fragment cost scales with DPR squared |
| Full-screen fragment | <= ~150 ALU ops, <= 4 fbm octaves, no nested loops > 16 iterations |
| Draw calls | < 100 (R3F scene), 1 for backgrounds |
| Textures | total < 64 MB GPU; 2048 px max on mobile; KTX2 for > 4 textures |
| Contexts | 1 per page ideally; browsers cap ~16 live WebGL contexts, oldest gets lost |
| Frame time | JS < 4 ms, GPU < 8 ms; background shaders should target 30 fps if they are ambient |

**Tune:** `rootMargin` 100-300px (mount before it scrolls in); fade-in 500-900 ms; DPR caps above.  
**A11y/perf:** canvas wrapper is `aria-hidden`; text never lives inside the canvas. Reduced motion = one frozen, well-composed frame (not a blank). Never block LCP: the poster is the LCP element; the canvas is decoration. Context loss: preventDefault in `webglcontextlost`, show poster, optionally remount on `webglcontextrestored`.

### 2. Minimal full-screen fragment shader: WebGL2, OGL, R3F
**Looks like:** one triangle covering the viewport, a fragment shader doing all the work, with `uTime`, `uResolution`, `uMouse` (smoothed, 0..1), `uScroll` (0..1 page progress).  
**Use when / avoid when:** every background shader in section 3. Avoid R3F for this alone (you pay ~200 kB for one quad).  
**Stack:** WebGL2 | OGL | R3F

**2a. Raw WebGL2 (zero deps, vanilla-friendly)**
```ts
// src/lib/webgl/shader-canvas.ts
const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

export const FRAG_HEADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;   // device pixels
uniform vec2 uMouse;        // 0..1, origin bottom-left, smoothed
uniform float uScroll;      // 0..1 page progress
out vec4 fragColor;
`;

export type ShaderCanvasOptions = {
  fragmentBody: string;      // appended after FRAG_HEADER, must define main()
  maxDpr?: number;
  speed?: number;
  frozen?: boolean;          // reduced motion: draw a single frame at frozenTime
  frozenTime?: number;
  onFirstFrame?: () => void;
  onContextLost?: () => void;
};

export type ShaderCanvas = { setPaused: (p: boolean) => void; destroy: () => void };

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("createShader failed");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

export function createShaderCanvas(canvas: HTMLCanvasElement, o: ShaderCanvasOptions): ShaderCanvas {
  const { maxDpr = 1.5, speed = 1, frozen = false, frozenTime = 8 } = o;
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) throw new Error("WebGL2 unavailable");
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG_HEADER + o.fragmentBody));
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link error");
  gl.useProgram(program);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one big triangle
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const loc = {
    time: gl.getUniformLocation(program, "uTime"),
    res: gl.getUniformLocation(program, "uResolution"),
    mouse: gl.getUniformLocation(program, "uMouse"),
    scroll: gl.getUniformLocation(program, "uScroll"),
  };

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let raf = 0, paused = false, last = performance.now(), t = frozen ? frozenTime : 0, firstDone = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    if (frozen || paused) draw(); // keep the still frame crisp after resize
  };
  const draw = () => {
    gl.uniform1f(loc.time, t);
    gl.uniform2f(loc.res, canvas.width, canvas.height);
    gl.uniform2f(loc.mouse, mouse.x, mouse.y);
    const max = document.documentElement.scrollHeight - innerHeight;
    gl.uniform1f(loc.scroll, max > 0 ? scrollY / max : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!firstDone) { firstDone = true; o.onFirstFrame?.(); }
  };
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 20); // clamp after tab switches
    last = now;
    t += dt * speed;
    const k = 1 - Math.exp(-dt * 6); // frame-rate independent smoothing
    mouse.x += (mouse.tx - mouse.x) * k;
    mouse.y += (mouse.ty - mouse.y) * k;
    draw();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && !paused && !frozen) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
  };
  const onLost = (e: Event) => { e.preventDefault(); stop(); o.onContextLost?.(); };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([en]) => { paused = !en.isIntersecting || document.hidden; if (paused) stop(); else start(); });
  io.observe(canvas);
  const onVis = () => { paused = document.hidden; if (paused) stop(); else start(); };
  if (window.matchMedia("(pointer: fine)").matches && !frozen) window.addEventListener("pointermove", onPointer, { passive: true });
  canvas.addEventListener("webglcontextlost", onLost);
  document.addEventListener("visibilitychange", onVis);
  resize();
  if (frozen) draw(); else start();

  return {
    setPaused: (p) => { paused = p; if (p) stop(); else start(); },
    destroy: () => {
      stop(); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteBuffer(vbo); gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
```

```tsx
// src/components/webgl/GradientScene.tsx  (plugs into ShaderStage from recipe 1)
"use client";
import { useEffect, useRef } from "react";
import { createShaderCanvas, type ShaderCanvas } from "@/lib/webgl/shader-canvas";
import { DPR_CAP } from "@/lib/webgl/capabilities";
import type { StageSceneProps } from "./ShaderStage";
import { WARP_GRADIENT_FRAG } from "@/lib/webgl/shaders"; // from recipe 3.2

export default function GradientScene({ paused, reducedMotion, tier, onReady, onContextLost }: StageSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrl = useRef<ShaderCanvas | null>(null);
  const cb = useRef({ onReady, onContextLost });
  cb.current = { onReady, onContextLost };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      ctrl.current = createShaderCanvas(canvas, {
        fragmentBody: WARP_GRADIENT_FRAG,
        maxDpr: DPR_CAP[tier],
        speed: 0.6,
        frozen: reducedMotion,
        onFirstFrame: () => cb.current.onReady(),
        onContextLost: () => cb.current.onContextLost(),
      });
    } catch (err) {
      console.error("[GradientScene]", err);
      cb.current.onContextLost(); // show poster
    }
    return () => { ctrl.current?.destroy(); ctrl.current = null; };
  }, [reducedMotion, tier]);

  useEffect(() => { ctrl.current?.setPaused(paused); }, [paused]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}
```

**2b. OGL (when you also need textures or a few meshes; this is the React Bits pattern, fixed)**
```tsx
"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime; uniform vec2 uResolution; uniform vec2 uMouse; uniform float uScroll;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float d = length(p - (uMouse - 0.5) * 0.4);
  vec3 col = 0.55 + 0.45 * cos(6.2831 * (vec3(0.0, 0.1, 0.2) + d * 1.4 - uTime * 0.05 + uScroll));
  gl_FragColor = vec4(col, 1.0);
}`;

export default function OglBackground({ paused = false, reducedMotion = false }: { paused?: boolean; reducedMotion?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false, antialias: false });
    const gl = renderer.gl;
    el.appendChild(gl.canvas);
    const program = new Program(gl, {
      vertex, fragment,
      uniforms: { uTime: { value: 0 }, uResolution: { value: [1, 1] }, uMouse: { value: [0.5, 0.5] }, uScroll: { value: 0 } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const target = [0.5, 0.5];
    const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect(); target[0] = (e.clientX - r.left) / r.width; target[1] = 1 - (e.clientY - r.top) / r.height; };
    if (matchMedia("(pointer: fine)").matches) window.addEventListener("pointermove", onMove, { passive: true });
    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      if (reducedMotion) renderer.render({ scene: mesh });
    });
    ro.observe(el);
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (pausedRef.current) return; // cheap: skip GPU work, keep loop alive
      program.uniforms.uTime.value += dt;
      const m = program.uniforms.uMouse.value as number[];
      const k = 1 - Math.exp(-dt * 6);
      m[0] += (target[0] - m[0]) * k; m[1] += (target[1] - m[1]) * k;
      const max = document.documentElement.scrollHeight - innerHeight;
      program.uniforms.uScroll.value = max > 0 ? scrollY / max : 0;
      renderer.render({ scene: mesh });
    };
    if (reducedMotion) { program.uniforms.uTime.value = 8; renderer.render({ scene: mesh }); } else raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [reducedMotion]);

  return <div ref={host} aria-hidden style={{ position: "absolute", inset: 0 }} />;
}
```

**2c. R3F (when the shader lives inside a larger R3F scene)**
```tsx
"use client";
import { useRef } from "react";
import * as THREE from "three";
import { Canvas, extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

const ScreenMaterial = shaderMaterial(
  { uTime: 0, uResolution: new THREE.Vector2(1, 1), uMouse: new THREE.Vector2(0.5, 0.5), uScroll: 0 },
  /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  /* glsl */ `uniform float uTime; uniform vec2 uResolution; uniform vec2 uMouse; uniform float uScroll; varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    vec3 col = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + length(p - (uMouse - 0.5) * 0.3) - uTime * 0.05));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`
);
extend({ ScreenMaterial });
declare module "@react-three/fiber" {
  interface ThreeElements { screenMaterial: ThreeElement<typeof ScreenMaterial> }
}

function FullscreenQuad({ frozen }: { frozen: boolean }) {
  const mat = useRef<InstanceType<typeof ScreenMaterial>>(null);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  useFrame((state, delta) => {
    const m = mat.current;
    if (!m) return;
    if (!frozen) m.uTime += delta;
    m.uResolution.set(size.width * dpr, size.height * dpr);
    // state.pointer is -1..1 (R3F v9); map to 0..1 and damp
    m.uMouse.x = THREE.MathUtils.damp(m.uMouse.x, state.pointer.x * 0.5 + 0.5, 6, delta);
    m.uMouse.y = THREE.MathUtils.damp(m.uMouse.y, state.pointer.y * 0.5 + 0.5, 6, delta);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <screenMaterial ref={mat} key={ScreenMaterial.key} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

export default function R3FBackground({ paused, reducedMotion }: { paused: boolean; reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "low-power" }}
      frameloop={paused || reducedMotion ? "demand" : "always"} // demand renders once, then only on invalidate()
      flat
    >
      <FullscreenQuad frozen={reducedMotion} />
    </Canvas>
  );
}
```
**Tune:** `maxDpr` 1-1.5 (backgrounds are soft; nobody sees 2x on a blur); `speed` 0.3-0.8 for ambient; mouse damping 4-8 (lower = floatier).  
**A11y/perf:** the big-triangle trick avoids the diagonal seam of a 2-triangle quad and a wasted vertex. Pausing = stop the RAF (raw/OGL) or `frameloop="demand"` (R3F). In R3F, `flat` + `#include <colorspace_fragment>` keeps hex colors matching CSS.

### 3. Shader library (GLSL)
**Looks like:** the building blocks behind Stripe's gradient, Linear/Vercel-era auroras, React Bits Silk/Liquid Chrome/Grainient, Paper's Dithering, Codrops grid reveals.  
**Use when / avoid when:** pick ONE background per page and art-direct it (section 13). Avoid stacking a shader background + fluid cursor + particles: that is the 2024 template look.  
**Stack:** WebGL (GLSL ES 3.00 for the raw path; drop the header and use `gl_FragColor`/`texture2D` inside three/OGL materials)

All chunks below live in one module and are composed as strings. Colors are baked as `const vec3` at build time (no uniform plumbing needed for the raw path) and mixed in linear space, then encoded with `pow(1/2.2)`: mixing sRGB hex values directly produces muddy grey midpoints.

#### 3.1 Common chunk (hash, value noise, simplex, fbm, palette, grain)
```ts
// src/lib/webgl/shaders.ts
/** "#7c3aed" -> "vec3(0.201, 0.041, 0.846)" in LINEAR space (sRGB decode, 2.2 approx). */
export function glslColor(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.pow(v / 255, 2.2).toFixed(4));
  return `vec3(${lin.join(", ")})`;
}

export const COMMON = /* glsl */ `
float hash12(vec2 p) {                       // Dave Hoskins, no sin() precision issues on mobile
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {                       // value noise, 0..1
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {                       // simplex 2D (Ashima Arts / Ian McEwan, MIT), -1..1
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
const mat2 OCT_ROT = mat2(0.8, 0.6, -0.6, 0.8);  // rotate each octave: kills grid artifacts
float fbm(vec2 p) {                          // 5 octaves, ~0..1
  float sum = 0.0, amp = 0.5;
  for (int i = 0; i < 5; i++) { sum += amp * vnoise(p); p = OCT_ROT * p * 2.02; amp *= 0.5; }
  return sum;
}
vec3 iqPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b * cos(6.28318 * (c * t + d)); }
float grain(vec2 fragCoord, float time) {    // -0.5..0.5, re-seeded at 18 fps (60 fps grain reads as TV static)
  return hash12(floor(fragCoord) + floor(time * 18.0) * 17.13) - 0.5;
}
vec3 encodeSRGB(vec3 linear) { return pow(max(linear, 0.0), vec3(1.0 / 2.2)); }
`;
```

#### 3.2 Domain-warped fbm gradient (Stripe / mesh style)
Inigo Quilez's warp: `f(p + 4*fbm(p + 4*fbm(p)))`. This is the look of Stripe's 2020 hero (theirs is a vertex-displaced plane via minigl, same idea), Paper `Warp`, and most "premium SaaS" gradients.
```ts
// src/lib/webgl/shaders.ts (continued: append below COMMON / glslColor)
type WarpOpts = { colors: [string, string, string, string]; scale?: number; grainAmount?: number; mouseInfluence?: number };

export function warpGradientFrag({ colors, scale = 1.25, grainAmount = 0.045, mouseInfluence = 0.35 }: WarpOpts): string {
  const [c0, c1, c2, c3] = colors.map(glslColor);
  return /* glsl */ `
${COMMON}
const vec3 C0 = ${c0}; const vec3 C1 = ${c1}; const vec3 C2 = ${c2}; const vec3 C3 = ${c3};
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y * ${scale.toFixed(3)};
  float t = uTime * 0.07;
  vec2 m = (uMouse - 0.5) * ${mouseInfluence.toFixed(3)};
  p.y += uScroll * 0.6;                                   // scroll drifts the field, not the layout
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + 0.6 * t + m),
                fbm(p + 3.5 * q + vec2(8.3, 2.8) - 0.4 * t));
  float f = fbm(p + 3.0 * r);
  vec3 col = mix(C0, C1, clamp(f * f * 2.4, 0.0, 1.0));
  col = mix(col, C2, clamp(length(q) * 0.9, 0.0, 1.0) * 0.75);
  col = mix(col, C3, clamp(r.x * r.x * 1.6, 0.0, 1.0) * 0.6);
  col *= 0.82 + 0.36 * f;                                  // soft relief, reads as "silk"
  col += grain(gl_FragCoord.xy, uTime) * ${grainAmount.toFixed(3)};
  fragColor = vec4(encodeSRGB(col), 1.0);
}`;
}

// deep ink -> violet -> coral -> haze. Replace with brand tokens.
export const WARP_GRADIENT_FRAG = warpGradientFrag({ colors: ["#07060f", "#3b1d8f", "#ff6b4a", "#c9b8ff"] });
```

#### 3.3 Inigo Quilez cosine palettes
`color(t) = a + b * cos(2pi * (c * t + d))`: four vec3 give an infinite smooth palette from one float (noise value, distance, time). Use it to color fbm, SDF glows, particles.

| Name | a | b | c | d |
|---|---|---|---|---|
| Rainbow (avoid for brands) | 0.5,0.5,0.5 | 0.5,0.5,0.5 | 1,1,1 | 0.00,0.33,0.67 |
| Warm sunset | 0.5,0.5,0.5 | 0.5,0.5,0.5 | 1,1,1 | 0.00,0.10,0.20 |
| Teal-orange film | 0.5,0.5,0.5 | 0.5,0.5,0.5 | 1,1,1 | 0.30,0.20,0.20 |
| Lime-violet | 0.5,0.5,0.5 | 0.5,0.5,0.5 | 1,1,0.5 | 0.80,0.90,0.30 |
| Copper | 0.5,0.5,0.5 | 0.5,0.5,0.5 | 1,0.7,0.4 | 0.00,0.15,0.20 |
| Magenta-cyan | 0.5,0.5,0.5 | 0.5,0.5,0.5 | 2,1,0 | 0.50,0.20,0.25 |
| Dusty pastel | 0.8,0.5,0.4 | 0.2,0.4,0.2 | 2,1,1 | 0.00,0.25,0.25 |

```glsl
// brand-fitting: a = mid tone, b = contrast (keep <= 0.35 for tasteful), c = 1 (one cycle), d = hue offsets
vec3 brand = iqPalette(f + uTime * 0.02, vec3(0.45, 0.40, 0.55), vec3(0.30, 0.25, 0.35), vec3(1.0), vec3(0.62, 0.70, 0.80));
```

#### 3.4 Animated noise gradient with grain
The "Grainient" look (React Bits `Grainient`, Paper `GrainGradient`): a 3-stop gradient along a noise-bent axis, heavy grain, very slow.
```ts
// src/lib/webgl/shaders.ts (continued)
export function grainGradientFrag(colors: [string, string, string], grainAmount = 0.09): string {
  const [c0, c1, c2] = colors.map(glslColor);
  return /* glsl */ `
${COMMON}
const vec3 C0 = ${c0}; const vec3 C1 = ${c1}; const vec3 C2 = ${c2};
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float t = uTime * 0.05;
  float n1 = snoise(p * 0.9 + vec2(t, -t)) * 0.5 + 0.5;
  float n2 = snoise(p * 1.8 - vec2(t * 1.3, t * 0.7) + n1) * 0.5 + 0.5;
  float g = clamp(p.y * 0.55 + 0.5 + (n1 - 0.5) * 0.9 + (n2 - 0.5) * 0.35 + (uMouse.x - 0.5) * 0.1, 0.0, 1.0);
  vec3 col = g < 0.5 ? mix(C0, C1, smoothstep(0.0, 0.5, g)) : mix(C1, C2, smoothstep(0.5, 1.0, g));
  col += grain(gl_FragCoord.xy, uTime) * ${grainAmount.toFixed(3)};
  fragColor = vec4(encodeSRGB(col), 1.0);
}`;
}
```

#### 3.5 Aurora and silk flows
Aurora (core of React Bits `Aurora`, output premultiplied so it composites over a dark CSS background) and Silk (React Bits `Silk` sine-fold pattern, no R3F needed):
```ts
// src/lib/webgl/shaders.ts (continued)
export function auroraFrag(stops: [string, string, string], amplitude = 1.0, blend = 0.5): string {
  const [c0, c1, c2] = stops.map(glslColor);
  return /* glsl */ `
${COMMON}
const vec3 C0 = ${c0}; const vec3 C1 = ${c1}; const vec3 C2 = ${c2};
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 ramp = uv.x < 0.5 ? mix(C0, C1, uv.x * 2.0) : mix(C1, C2, uv.x * 2.0 - 1.0);
  float h = exp(snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * ${amplitude.toFixed(3)});
  float intensity = 0.6 * (uv.y * 2.0 - h + 0.2);
  float a = smoothstep(0.2 - ${blend.toFixed(3)} * 0.5, 0.2 + ${blend.toFixed(3)} * 0.5, intensity);
  vec3 col = encodeSRGB(intensity * ramp) * a;       // premultiplied alpha
  fragColor = vec4(col, a);
}`;
}

export function silkFrag(color: string, scale = 1.0, rotation = 0.0, noise = 1.5): string {
  return /* glsl */ `
${COMMON}
const vec3 SILK = ${glslColor(color)};
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.y * ${scale.toFixed(3)};
  float c = cos(${rotation.toFixed(3)}), s = sin(${rotation.toFixed(3)});
  vec2 tex = mat2(c, -s, s, c) * uv * ${scale.toFixed(3)};
  float to = uTime * 2.0;
  tex.y += 0.03 * sin(8.0 * tex.x - to);
  float pattern = 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * to)
                                  + sin(20.0 * (tex.x + tex.y - 0.1 * to)));
  vec3 col = SILK * pattern - vec3(hash12(gl_FragCoord.xy) / 15.0 * ${noise.toFixed(3)});
  fragColor = vec4(encodeSRGB(clamp(col, 0.0, 1.0)), 1.0);
}`;
}
```

#### 3.6 Liquid chrome / metal
Iterated cosine domain distortion (React Bits `LiquidChrome`, itself a classic Shadertoy pattern). The React Bits version supersamples 3x3 = 9x the cost; drop that and use DPR 1 instead, it is a blurry effect anyway.
```ts
// src/lib/webgl/shaders.ts (continued)
export function liquidChromeFrag(base: [number, number, number] = [0.1, 0.1, 0.1], amplitude = 0.3, freq = 3.0): string {
  return /* glsl */ `
${COMMON}
void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / min(uResolution.x, uResolution.y);
  float t = uTime * 0.6;
  for (float i = 1.0; i < 9.0; i++) {
    uv.x += ${amplitude.toFixed(3)} / i * cos(i * ${freq.toFixed(3)} * uv.y + t + uMouse.x * 3.14159);
    uv.y += ${amplitude.toFixed(3)} / i * cos(i * ${freq.toFixed(3)} * uv.x + t + uMouse.y * 3.14159);
  }
  vec3 col = vec3(${base.map((v) => v.toFixed(3)).join(", ")}) / abs(sin(t - uv.y - uv.x));
  col = col / (1.0 + col);                            // Reinhard: tames the 1/sin singularity into chrome highlights
  fragColor = vec4(pow(col, vec3(0.8)), 1.0);
}`;
}
```

#### 3.7 Bayer dithering and halftone
Ordered dithering (Maxime Heckel "The Art of Dithering and Retro Shading", Paper `Dithering`, Obra Dinn look). The Bayer threshold is computed without a matrix: `bayer2(a) = fract(a.x/2 + 0.75*a.y^2)`, recursing to 4x4/8x8 (values verified against the 4x4 matrix `[0 8 2 10; 12 4 14 6; 3 11 1 9; 15 7 13 5]/16`).
```ts
// src/components/webgl/effects/DitherEffect.ts  (R3F post effect; see recipe 9 for the composer)
import { Effect } from "postprocessing";
import { Color, Uniform } from "three";
import { wrapEffect } from "@react-three/postprocessing";

const ditherFrag = /* glsl */ `
uniform float uPixelSize;
uniform vec3 uDark;
uniform vec3 uLight;
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
#define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
#define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))
void mainUv(inout vec2 uv) {                      // pixelate first so each dither cell samples one color
  vec2 cell = uPixelSize / resolution;
  uv = (floor(uv / cell) + 0.5) * cell;
}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float lum = dot(inputColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  lum = pow(lum, 1.0 / 2.2);                      // threshold in perceptual space (input is linear)
  float threshold = bayer8(floor(gl_FragCoord.xy / uPixelSize)) + 0.5 / 64.0;
  outputColor = vec4(mix(uDark, uLight, step(threshold, lum)), inputColor.a);
}`;

class DitherEffectImpl extends Effect {
  constructor({ pixelSize = 3, dark = "#0d0d0d", light = "#f2efe6" }: { pixelSize?: number; dark?: string; light?: string } = {}) {
    super("DitherEffect", ditherFrag, {
      uniforms: new Map<string, Uniform>([
        ["uPixelSize", new Uniform(pixelSize)],
        ["uDark", new Uniform(new Color(dark))],
        ["uLight", new Uniform(new Color(light))],
      ]),
    });
  }
}
export const Dither = wrapEffect(DitherEffectImpl);
// usage: <EffectComposer><Dither pixelSize={3} dark="#101014" light="#e9e4d8" /></EffectComposer>
```

Halftone (print dots, rotated screen, area-correct dot radius):
```ts
// src/components/webgl/effects/HalftoneEffect.ts
import { Effect } from "postprocessing";
import { Color, Uniform } from "three";
import { wrapEffect } from "@react-three/postprocessing";

const halftoneFrag = /* glsl */ `
uniform float uCell;      // dot pitch in device px (6-12)
uniform float uAngle;     // radians: 0.26 (15deg) or 0.785 (45deg) like print screens
uniform vec3 uInk;
uniform vec3 uPaper;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float s = sin(uAngle), c = cos(uAngle);
  vec2 p = mat2(c, -s, s, c) * gl_FragCoord.xy;
  vec2 local = fract(p / uCell) - 0.5;
  vec2 center = mat2(c, s, -s, c) * ((floor(p / uCell) + 0.5) * uCell);   // back to screen space
  vec3 src = texture2D(inputBuffer, center / resolution).rgb;
  float lum = pow(dot(src, vec3(0.2126, 0.7152, 0.0722)), 1.0 / 2.2);
  float radius = sqrt(1.0 - lum) * 0.62;                                  // dot AREA tracks darkness
  float d = length(local);
  float aa = fwidth(d);
  float ink = 1.0 - smoothstep(radius - aa, radius + aa, d);
  outputColor = vec4(mix(uPaper, uInk, ink), inputColor.a);
}`;

class HalftoneEffectImpl extends Effect {
  constructor({ cell = 8, angle = 0.785, ink = "#111111", paper = "#f4f1ea" }: { cell?: number; angle?: number; ink?: string; paper?: string } = {}) {
    super("HalftoneEffect", halftoneFrag, {
      uniforms: new Map<string, Uniform>([
        ["uCell", new Uniform(cell)], ["uAngle", new Uniform(angle)],
        ["uInk", new Uniform(new Color(ink))], ["uPaper", new Uniform(new Color(paper))],
      ]),
    });
  }
}
export const Halftone = wrapEffect(HalftoneEffectImpl);
```

#### 3.8 ASCII
`@react-three/postprocessing` ships `<ASCII characters=" .:-+*=%@#" cellSize={10} fontSize={54} color="#e8e8e8" invert={false} />` (props verified in v3.1 types). It builds a glyph atlas on a 2D canvas and maps cell luminance to the character ramp. Use it over a 3D object for "terminal" brands; never over body copy (unreadable, and not text for screen readers). For a DOM-only alternative (selectable text) see `text-effects.md`.

#### 3.9 Pixelation / mosaic reveal
The Codrops "on-scroll revealing WebGL images" look: cells appear in random order while resolution sharpens. Drop into the gallery material of recipe 4.3 (needs its `coverUv`, `hash12`).
```glsl
uniform float uReveal;      // 0 -> hidden, 1 -> fully sharp. Drive with ScrollTrigger (scrub) or a one-shot tween.
uniform float uGrid;        // cells across the short side at the start (12-24)
vec4 pixelReveal(sampler2D tex, vec2 uv, vec2 planeSize, vec2 imageSize) {
  vec2 aspect = planeSize / min(planeSize.x, planeSize.y);
  vec2 cells = floor(uGrid * aspect);
  vec2 cellId = floor(uv * cells);
  float delay = hash12(cellId) * 0.6;                            // per-cell stagger
  float local = clamp((uReveal - delay) / 0.4, 0.0, 1.0);
  float sharp = smoothstep(0.35, 1.0, uReveal);                  // global resolution ramp
  vec2 res = mix(cells, planeSize, sharp * sharp);               // cells -> full px resolution
  vec2 quv = (floor(uv * res) + 0.5) / res;
  vec4 color = texture2D(tex, coverUv(quv, planeSize, imageSize));
  return vec4(color.rgb, color.a * local);
}
```

#### 3.10 Chromatic aberration, vignette, film grain (finishing functions)
```glsl
// textured materials (three/OGL: texture2D). dir in UV units, e.g. vec2(0.004, 0.0) * velocity
vec3 chromaticSample(sampler2D tex, vec2 uv, vec2 dir) {
  return vec3(texture2D(tex, uv + dir).r, texture2D(tex, uv).g, texture2D(tex, uv - dir).b);
}
vec3 vignette(vec3 col, vec2 uv, float strength) {   // strength 0.15-0.45
  vec2 d = uv - 0.5;
  return col * (1.0 - strength * dot(d, d) * 2.5);
}
vec3 filmGrain(vec3 col, vec2 fragCoord, float time, float amount) {  // amount 0.03-0.08; stronger in shadows
  float g = hash12(floor(fragCoord) + floor(time * 18.0) * 17.13) - 0.5;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  return col + g * amount * (1.2 - lum);
}
```

#### 3.11 SDF shapes and metaballs
Smooth-union metaballs (IQ `smin`) for gooey blobs, lava-lamp CTAs, Paper `Metaballs` look. Anti-aliased with `fwidth`, so it is crisp at any DPR.
```ts
// src/lib/webgl/shaders.ts (continued)
export function metaballsFrag(fill: string, glow: string, bg: string): string {
  return /* glsl */ `
${COMMON}
const vec3 FILL = ${glslColor(fill)}; const vec3 GLOW = ${glslColor(glow)}; const vec3 BG = ${glslColor(bg)};
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdRoundBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec2 m = (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float t = uTime * 0.5;
  float d = sdRoundBox(p - vec2(0.0, -0.05), vec2(0.22, 0.08), 0.08);           // anchor shape (a pill CTA)
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 c = vec2(sin(t * (0.7 + fi * 0.13) + fi * 1.7), cos(t * (0.5 + fi * 0.11) + fi * 2.3)) * vec2(0.45, 0.25);
    d = smin(d, sdCircle(p - c, 0.06 + 0.02 * sin(fi + t)), 0.12);
  }
  d = smin(d, sdCircle(p - m, 0.07), 0.15);                                     // cursor blob
  float aa = fwidth(d);
  float shape = 1.0 - smoothstep(-aa, aa, d);
  float halo = exp(-max(d, 0.0) * 18.0) * 0.35;
  vec3 col = mix(BG + GLOW * halo, FILL, shape);
  fragColor = vec4(encodeSRGB(col), 1.0);
}`;
}
```
**Tune:** time multipliers 0.03-0.1 for backgrounds (if you can see it move within 1 s, it is too fast); fbm octaves 4-5 (6+ costs more than it shows); warp strength 3-4; grain 0.03-0.06 on gradients, 0.08-0.12 for deliberate risograph looks; `smin` k 0.08-0.2 (gooiness); dither `pixelSize` 2-4 device px.  
**A11y/perf:** 3.2 evaluates 25 noise lookups per pixel: fine at DPR 1.5 on laptops, use DPR 1 on `tier: low`. Liquid chrome and anything with loops > 8 iterations: DPR 1 always. For reduced motion pick `frozenTime` by eye (t=0 is often symmetric and dull). Dither/halftone/ASCII destroy legibility: never run them over text layers.

### 4. Image effects and DOM-to-WebGL
**Looks like:** images that liquefy into the next image on hover (Robin Delaporte's hover-effect, 2018 Codrops), galleries whose planes bow and RGB-split with scroll speed and ripple on click (Codrops 2024-2026 gallery tutorials, Lusion, Locomotive, Active Theory), infinite drag sliders with depth.  
**Use when / avoid when:** portfolio/editorial/fashion sites where images ARE the content and motion expresses brand. Avoid on e-commerce grids and docs; avoid RGB split as a permanent state (it reads as a 2019 glitch template). Effects must be velocity-driven and settle to a clean image at rest.  
**Stack:** WebGL (OGL for single images, three for galleries) + Lenis

#### 4.1 Hover displacement transition between two images
```tsx
// src/components/webgl/HoverDisplace.tsx  (OGL, ~8 kB; one canvas per image: use for <= 4 hero images, else recipe 4.3)
"use client";
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";

const vertex = /* glsl */ `
attribute vec2 position; attribute vec2 uv; varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex1; uniform sampler2D uTex2; uniform sampler2D uDisp;
uniform float uProgress; uniform float uIntensity; uniform float uAngle1; uniform float uAngle2;
uniform vec2 uPlane; uniform vec2 uImage1; uniform vec2 uImage2;
varying vec2 vUv;
mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
vec2 coverUv(vec2 uv, vec2 plane, vec2 image) {
  float rp = plane.x / plane.y, ri = image.x / image.y;
  vec2 scale = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
  return (uv - 0.5) * scale + 0.5;
}
void main() {
  vec2 disp = texture2D(uDisp, vUv).rg;
  vec2 uv1 = coverUv(vUv, uPlane, uImage1) + rot(uAngle1) * disp * uIntensity * uProgress;
  vec2 uv2 = coverUv(vUv, uPlane, uImage2) + rot(uAngle2) * disp * uIntensity * (1.0 - uProgress);
  gl_FragColor = mix(texture2D(uTex1, uv1), texture2D(uTex2, uv2), uProgress);
}`;

type Props = { src1: string; src2: string; displacement: string; alt: string; intensity?: number; className?: string };

function loadTexture(gl: Renderer["gl"], src: string): Promise<{ tex: Texture; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";            // required for cross-origin CDNs (plus ACAO header)
    img.onload = () => {
      const tex = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
      tex.image = img;
      resolve({ tex, w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function HoverDisplace({ src1, src2, displacement, alt, intensity = 0.3, className }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), alpha: true });
    const gl = renderer.gl;
    gl.canvas.setAttribute("aria-hidden", "true");
    Object.assign(gl.canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0", transition: "opacity 400ms" });
    let raf = 0, disposed = false, progress = 0, target = 0, last = 0;
    let program: Program | null = null, mesh: Mesh | null = null;

    const draw = () => { if (mesh) renderer.render({ scene: mesh }); };
    const tick = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, 0.05); last = now;
      progress += (target - progress) * (1 - Math.exp(-dt * (reduced ? 30 : 4.5)));
      if (program) program.uniforms.uProgress.value = progress;
      draw();
      raf = Math.abs(target - progress) > 0.001 ? requestAnimationFrame(tick) : 0; // render on demand only
      if (!raf) last = 0;
    };
    const go = (t: number) => { target = t; if (!raf) raf = requestAnimationFrame(tick); };
    const onEnter = () => go(1);
    const onLeave = () => go(0);

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      if (program) program.uniforms.uPlane.value = [el.clientWidth, el.clientHeight];
      draw();
    };
    const ro = new ResizeObserver(resize);

    Promise.all([loadTexture(gl, src1), loadTexture(gl, src2), loadTexture(gl, displacement)])
      .then(([a, b, d]) => {
        if (disposed) return;
        program = new Program(gl, {
          vertex, fragment,
          uniforms: {
            uTex1: { value: a.tex }, uTex2: { value: b.tex }, uDisp: { value: d.tex },
            uProgress: { value: 0 }, uIntensity: { value: reduced ? 0 : intensity },  // reduced motion: plain crossfade
            uAngle1: { value: Math.PI / 4 }, uAngle2: { value: -Math.PI / 4 * 3 },
            uPlane: { value: [el.clientWidth, el.clientHeight] },
            uImage1: { value: [a.w, a.h] }, uImage2: { value: [b.w, b.h] },
          },
        });
        mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
        el.appendChild(gl.canvas);
        ro.observe(el);
        resize();
        gl.canvas.style.opacity = "1";
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
        el.addEventListener("focusin", onEnter);       // keyboard users get the same reveal
        el.addEventListener("focusout", onLeave);
      })
      .catch((err) => console.error("[HoverDisplace] texture load failed, keeping <img>", err));

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener("pointerenter", onEnter); el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onEnter); el.removeEventListener("focusout", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [src1, src2, displacement, intensity]);

  return (
    <div ref={host} className={className} style={{ position: "relative", overflow: "hidden" }}>
      {/* real image: LCP, alt text, no-JS fallback. Canvas paints over it once textures are ready. */}
      <img src={src1} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}
```
Displacement maps: grayscale/colored noise textures 512-1024 px (the hover-effect repo ships ~16: clouds, stripes, fluid swirls). Stripes = "glitchy/editorial", fbm clouds = "liquid", diagonal gradients = "wipe".

#### 4.2 Cover UVs (object-fit: cover in a shader)
Used by every image recipe here. `plane` = element CSS px size, `image` = natural px size.
```glsl
vec2 coverUv(vec2 uv, vec2 plane, vec2 image) {
  float rp = plane.x / plane.y, ri = image.x / image.y;
  vec2 scale = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);   // crop the overflowing axis
  return (uv - 0.5) * scale + 0.5;                                  // centered, like object-position: 50% 50%
}
```

#### 4.3 DOM-to-WebGL gallery synced to Lenis (RGB shift, curve, ripple)
Pattern: real `<img>` elements stay in the layout (SEO, alt, layout, fallback) with `opacity: 0` once their texture is live; ONE fixed full-screen canvas draws a plane per image at the image's rect. Rects are measured on resize only (never `getBoundingClientRect` per frame); per frame, position = cached document offset minus current scroll. Lenis and the renderer run in the SAME rAF callback, otherwise planes trail the DOM by a frame ("swimming").
```ts
// src/lib/webgl/image-material.ts
import * as THREE from "three";

export const IMAGE_VERT = /* glsl */ `
uniform float uBend;      // velocity bow in px (sign = direction)
uniform float uDrum;      // static cylinder: px of recession at viewport top/bottom
uniform vec2 uViewport;   // CSS px
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(uv.x * 3.14159265) * uBend;           // mesh.scale.z = 1, so this is px (use uv.y for horizontal sliders)
  vec4 world = modelMatrix * vec4(pos, 1.0);
  float yn = world.y / (uViewport.y * 0.5);          // -1..1 across the viewport
  world.z -= yn * yn * uDrum;                        // barrel / scroll-drum curvature
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const IMAGE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uPlane; uniform vec2 uImage;
uniform float uTime; uniform float uVelocity; uniform float uHover;
uniform vec3 uClick;                                  // xy = uv of click, z = start time
uniform float uReveal; uniform float uGrid;
varying vec2 vUv;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 coverUv(vec2 uv, vec2 plane, vec2 image) {
  float rp = plane.x / plane.y, ri = image.x / image.y;
  vec2 scale = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
  return (uv - 0.5) * scale + 0.5;
}
vec4 pixelReveal(sampler2D tex, vec2 uv, vec2 planeSize, vec2 imageSize) {
  vec2 cells = floor(uGrid * planeSize / min(planeSize.x, planeSize.y));
  float delay = hash12(floor(uv * cells)) * 0.6;
  float local = clamp((uReveal - delay) / 0.4, 0.0, 1.0);
  float sharp = smoothstep(0.35, 1.0, uReveal);
  vec2 res = mix(cells, planeSize, sharp * sharp);
  vec4 color = texture2D(tex, coverUv((floor(uv * res) + 0.5) / res, planeSize, imageSize));
  return vec4(color.rgb, color.a * local);
}
void main() {
  if (uReveal < 0.999) { gl_FragColor = pixelReveal(uTexture, vUv, uPlane, uImage); return; }
  vec2 uv = vUv;
  float aspect = uPlane.x / uPlane.y;
  float age = uTime - uClick.z;                       // click ripple: one expanding ring, decays in ~1.5 s
  if (age >= 0.0 && age < 2.5) {
    vec2 d = (uv - uClick.xy) * vec2(aspect, 1.0);
    float dist = length(d);
    float ring = smoothstep(0.12, 0.0, abs(dist - age * 0.7));
    uv -= (d / max(dist, 1e-4)) * vec2(1.0 / aspect, 1.0) * ring * 0.025 * exp(-age * 1.8);
  }
  uv = (uv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;      // hover: 5% zoom-in inside the frame
  vec2 cuv = coverUv(uv, uPlane, uImage);
  vec2 shift = vec2(0.0, clamp(uVelocity, -60.0, 60.0) * 0.00035);   // RGB split along scroll axis, 0 at rest
  gl_FragColor = vec4(texture2D(uTexture, cuv + shift).r, texture2D(uTexture, cuv).g, texture2D(uTexture, cuv - shift).b, 1.0);
}`;

export function createImageMaterial(texture: THREE.Texture, imageW: number, imageH: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: IMAGE_VERT,
    fragmentShader: IMAGE_FRAG,
    transparent: true,
    uniforms: {
      uTexture: { value: texture },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uImage: { value: new THREE.Vector2(imageW, imageH) },
      uViewport: { value: new THREE.Vector2(innerWidth, innerHeight) },
      uTime: { value: 0 }, uVelocity: { value: 0 }, uHover: { value: 0 },
      uBend: { value: 0 }, uDrum: { value: 0 },
      uClick: { value: new THREE.Vector3(0, 0, -100) },
      uReveal: { value: 0 }, uGrid: { value: 16 },
    },
  });
}
```

```ts
// src/lib/webgl/dom-gallery.ts
import * as THREE from "three";
import { createImageMaterial } from "./image-material";

type Item = {
  el: HTMLImageElement; mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  top: number; left: number; width: number; height: number;
  hoverTarget: number; revealStart: number; off: () => void;
};
type Opts = { maxDpr?: number; drum?: number; bendPerVelocity?: number; reveal?: boolean };

const CAMERA_Z = 800;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export class DomGallery {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 1, 4000);
  private geometry = new THREE.PlaneGeometry(1, 1, 24, 24);   // segments needed for the vertex bend
  private items: Item[] = [];
  private timer = new THREE.Timer();
  private velocity = 0;
  private ro: ResizeObserver;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, images: HTMLImageElement[], private opts: Opts = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.camera.position.z = CAMERA_Z;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(document.documentElement);             // catches font swaps / lazy content shifting layout
    this.resize();
    images.forEach((el) => void this.add(el));
  }

  private async add(el: HTMLImageElement) {
    try { await el.decode(); } catch { return; }           // broken image: DOM fallback stays visible
    if (this.disposed) return;
    const texture = new THREE.Texture(el);                  // reuse the already-downloaded <img>, no 2nd request
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    const mesh = new THREE.Mesh(this.geometry, createImageMaterial(texture, el.naturalWidth, el.naturalHeight));
    const item: Item = { el, mesh, top: 0, left: 0, width: 0, height: 0, hoverTarget: 0, revealStart: this.opts.reveal === false ? -1 : Infinity, off: () => {} };
    if (this.opts.reveal === false) mesh.material.uniforms.uReveal.value = 1;
    const enter = () => { item.hoverTarget = 1; };
    const leave = () => { item.hoverTarget = 0; };
    const click = (e: MouseEvent) => {
      mesh.material.uniforms.uClick.value.set(e.offsetX / item.width, 1 - e.offsetY / item.height, this.timer.getElapsed());
    };
    const fine = matchMedia("(pointer: fine)").matches;
    if (fine) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); }
    el.addEventListener("click", click);
    item.off = () => { el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.removeEventListener("click", click); };
    this.measure(item);
    this.ro.observe(el);
    this.scene.add(mesh);
    this.items.push(item);
    el.style.opacity = "0";                                 // keep layout, alt text, selection; hide pixels
  }

  private measure(it: Item) {
    const r = it.el.getBoundingClientRect();
    it.top = r.top + window.scrollY; it.left = r.left + window.scrollX;
    it.width = r.width; it.height = r.height;
    it.mesh.scale.set(r.width, r.height, 1);
    it.mesh.material.uniforms.uPlane.value.set(r.width, r.height);
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.opts.maxDpr ?? 2)); // images need crispness: 2
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = (2 * Math.atan(h / 2 / CAMERA_Z) * 180) / Math.PI;  // 1 world unit == 1 CSS px at z=0
    this.camera.updateProjectionMatrix();
    for (const it of this.items) { this.measure(it); it.mesh.material.uniforms.uViewport.value.set(w, h); }
  }

  /** Call once per frame AFTER lenis.raf(), with window.scrollY and lenis.velocity. */
  render(scrollY: number, rawVelocity: number) {
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05), t = this.timer.getElapsed();
    this.velocity += (rawVelocity - this.velocity) * (1 - Math.exp(-dt * 8));
    const vw = innerWidth, vh = innerHeight;
    const bend = clamp(this.velocity, -60, 60) * (this.opts.bendPerVelocity ?? 0.6);
    for (const it of this.items) {
      const y = it.top - scrollY;
      const visible = y + it.height > -100 && y < vh + 100;
      it.mesh.visible = visible;                            // offscreen planes cost no draw call
      if (!visible) continue;
      it.mesh.position.set(it.left - window.scrollX - vw / 2 + it.width / 2, vh / 2 - y - it.height / 2, 0);
      const u = it.mesh.material.uniforms;
      if (it.revealStart === Infinity && y < vh * 0.85) it.revealStart = t;
      if (it.revealStart >= 0 && it.revealStart !== Infinity) u.uReveal.value = clamp((t - it.revealStart) / 1.4, 0, 1);
      u.uTime.value = t;
      u.uVelocity.value = this.velocity;
      u.uBend.value = bend;
      u.uDrum.value = this.opts.drum ?? 0;
      u.uHover.value += (it.hoverTarget - u.uHover.value) * (1 - Math.exp(-dt * 6));
    }
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.disposed = true;
    this.ro.disconnect();
    for (const it of this.items) {
      it.off();
      it.el.style.opacity = "";
      (it.mesh.material.uniforms.uTexture.value as THREE.Texture).dispose();
      it.mesh.material.dispose();
    }
    this.geometry.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
```

```tsx
// src/components/webgl/GalleryCanvas.tsx  (mount once per page; images carry data-gl-image)
"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { DomGallery } from "@/lib/webgl/dom-gallery";
import { detectGLTier } from "@/lib/webgl/capabilities";
import { useReducedMotion } from "@/lib/webgl/use-reduced-motion";

export function GalleryCanvas({ selector = "img[data-gl-image]" }: { selector?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced || detectGLTier() === "none") return;   // plain DOM images already render
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(selector));
    const gallery = new DomGallery(canvas, images, { drum: 0, bendPerVelocity: 0.6 });
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });       // if a global ReactLenis exists, pass it autoRaf:false and reuse it here
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);                                            // 1) move scroll
      gallery.render(window.scrollY, lenis.velocity);             // 2) draw at the SAME scroll value
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); gallery.destroy(); };
  }, [reduced, selector]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-lvh w-screen" />;
}
// Page: <main className="relative z-10"> ...sections with TRANSPARENT backgrounds (body carries the bg color)...
//   <img data-gl-image src="/work/01.jpg" alt="..." width={1200} height={1500} className="aspect-[4/5] w-full object-cover" />
```
With GSAP ScrollTrigger on the page, drive both from `gsap.ticker` instead (`lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add(t => { lenis.raf(t * 1000); gallery.render(scrollY, lenis.velocity) })`, `gsap.ticker.lagSmoothing(0)`); see `scroll-gsap.md`.

#### 4.4 Infinite WebGL slider
Planes on a ring buffer: position = `wrap(i * step + offset)`, offset lerps toward a target fed by drag/wheel/keys; velocity feeds the same bend/RGB-split material. Reference feel: Codrops "infinite WebGL slider" demos, Lusion/Studio Freight carousels.
```ts
// src/lib/webgl/infinite-slider.ts
import * as THREE from "three";
import { createImageMaterial } from "./image-material";

type SliderOpts = { itemW?: number; itemH?: number; gap?: number; maxDpr?: number };
const CAMERA_Z = 800;

export class InfiniteSlider {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 1, 4000);
  private geometry = new THREE.PlaneGeometry(1, 1, 24, 1);
  private meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
  private target = 0; private current = 0; private velocity = 0;
  private dragX: number | null = null; private idle = 0;
  private timer = new THREE.Timer(); private raf = 0;
  private readonly itemW: number; private readonly itemH: number; private readonly step: number;

  constructor(private canvas: HTMLCanvasElement, urls: string[], o: SliderOpts = {}) {
    this.itemW = o.itemW ?? 360; this.itemH = o.itemH ?? 480; this.step = this.itemW + (o.gap ?? 48);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, o.maxDpr ?? 2));
    this.camera.position.z = CAMERA_Z;
    const loader = new THREE.TextureLoader();
    urls.forEach((url, i) => {
      loader.loadAsync(url).then((tex) => {
        const img = tex.image as HTMLImageElement;
        const mesh = new THREE.Mesh(this.geometry, createImageMaterial(tex, img.naturalWidth, img.naturalHeight));
        mesh.scale.set(this.itemW, this.itemH, 1);
        mesh.material.uniforms.uPlane.value.set(this.itemW, this.itemH);
        mesh.material.uniforms.uReveal.value = 1;
        mesh.userData.index = i;
        this.scene.add(mesh); this.meshes.push(mesh);
      }).catch((e) => console.error("[InfiniteSlider] texture", url, e));
    });
    canvas.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("wheel", this.onWheel, { passive: true });
    canvas.addEventListener("keydown", this.onKey);
    canvas.tabIndex = 0;                                   // focusable: arrows move the slider
    this.resize(); window.addEventListener("resize", this.resize);
    this.raf = requestAnimationFrame(this.tick);
  }

  private onDown = (e: PointerEvent) => { this.dragX = e.clientX; this.canvas.setPointerCapture(e.pointerId); };
  private onMove = (e: PointerEvent) => { if (this.dragX === null) return; this.target += (e.clientX - this.dragX) * 1.4; this.dragX = e.clientX; this.idle = 0; };
  private onUp = () => { this.dragX = null; };
  private onWheel = (e: WheelEvent) => { this.target -= Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0; this.idle = 0; }; // horizontal only: never hijack page scroll
  private onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") this.target -= this.step;
    if (e.key === "ArrowLeft") this.target += this.step;
  };

  private resize = () => {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = (2 * Math.atan(h / 2 / CAMERA_Z) * 180) / Math.PI;
    this.camera.updateProjectionMatrix();
    this.meshes.forEach((m) => m.material.uniforms.uViewport.value.set(w, h));
  };

  private tick = () => {
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05);
    this.idle += dt;
    if (this.dragX === null && this.idle > 0.15) this.target = Math.round(this.target / this.step) * this.step; // snap
    const prev = this.current;
    this.current += (this.target - this.current) * (1 - Math.exp(-dt * 7));
    this.velocity = (this.current - prev) / Math.max(dt * 60, 1e-3);          // px per 60fps-frame
    const total = this.step * Math.max(this.meshes.length, 1);
    const half = this.canvas.clientWidth / 2;
    for (const m of this.meshes) {
      let x = (m.userData.index as number) * this.step + this.current;
      x = ((((x + total / 2) % total) + total) % total) - total / 2;          // wrap into [-total/2, total/2)
      m.position.x = x;
      m.position.z = -Math.abs(x / half) * 120;                                // depth falloff toward edges
      m.rotation.y = -(x / half) * 0.25;
      const u = m.material.uniforms;
      u.uVelocity.value = this.velocity; u.uBend.value = Math.max(-60, Math.min(60, this.velocity)) * 0.8;
      u.uTime.value = this.timer.getElapsed();
    }
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointermove", this.onMove); window.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("wheel", this.onWheel); this.canvas.removeEventListener("keydown", this.onKey);
    window.removeEventListener("resize", this.resize);
    this.meshes.forEach((m) => { (m.material.uniforms.uTexture.value as THREE.Texture).dispose(); m.material.dispose(); });
    this.geometry.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}
```
Pair it with a visually hidden `<ul>` of the same items as links (screen readers and no-JS), and pause the RAF via IntersectionObserver like recipe 2a when offscreen. Wrap needs `total > viewport width + itemW`, so duplicate the URL list if you have few images.

**Tune:** RGB split factor 0.0002-0.0005 per px/frame (above that = glitch); `bendPerVelocity` 0.4-1.0; drum 0 (flat) to 150 px (strong cylinder); hover zoom 3-6%; reveal duration 1.2-1.6 s with 0.6 stagger spread; slider lerp 6-9, drag multiplier 1.2-1.8, snap delay 120-200 ms.  
**A11y/perf:** reduced motion = do not start the gallery at all (DOM images render normally), and HoverDisplace degrades to a crossfade. Texture memory: a 2000x2500 image = 20 MB with mipmaps; serve 1x-1.5x the displayed size (next/image `sizes`). Keep ONE canvas for all gallery images (browsers cap live contexts around 16). Touch: no hover state, click ripple still works; don't bind wheel on mobile.

### 5. Cursor fluid simulation
**Looks like:** ink/smoke that pours from the cursor and swirls (Pavel Dobryakov's WebGL-Fluid-Simulation, 2019; React Bits `SplashCursor` is a 1,300-line TS port of it).  
**Use when / avoid when:** a single playful landing/portfolio moment on desktop, ideally behind content and brand-colored. Avoid as a site-wide overlay: it is one of the most recognizable 2024-2025 template effects, it sits on top of text (z-50, lowers contrast), and it burns GPU permanently (Navier-Stokes: advection + 20 Jacobi pressure iterations every frame).  
**Stack:** WebGL (raw, no deps)

```tsx
// src/components/webgl/FluidCursorGate.tsx
"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectGLTier } from "@/lib/webgl/capabilities";

const SplashCursor = dynamic(() => import("@/components/react-bits/SplashCursor"), { ssr: false });
const BACK = { r: 0, g: 0, b: 0 }; // HOISTED: an inline object is a new dep every render and re-inits the sim

export function FluidCursorGate({ color = "#7c5cff" }: { color?: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced && detectGLTier() === "high");
  }, []);
  if (!enabled) return null;
  return (
    <SplashCursor
      SIM_RESOLUTION={128} DYE_RESOLUTION={1024} PRESSURE_ITERATIONS={12}
      DENSITY_DISSIPATION={4} VELOCITY_DISSIPATION={2.5} CURL={2} SPLAT_RADIUS={0.15} SPLAT_FORCE={5000}
      SHADING RAINBOW_MODE={false} COLOR={color} BACK_COLOR={BACK} TRANSPARENT
    />
  );
}
```
Patch the copied React Bits source before shipping (verified in `src/ts-default/Animations/SplashCursor/SplashCursor.tsx`: the effect returns no cleanup):
```ts
// 1) keep the RAF id and cancel it
let rafId = 0;
function updateFrame() {
  const dt = calcDeltaTime();
  if (resizeCanvas()) initFramebuffers();
  updateColors(dt); applyInputs(); step(dt); render(null);
  rafId = requestAnimationFrame(updateFrame);
}
// 2) clamp DPR (original uses full devicePixelRatio: 3x on phones = 9x fragments)
function scaleByPixelRatio(input: number) { return Math.floor(input * Math.min(window.devicePixelRatio || 1, 1.25)); }
// 3) name every listener (mousedown, mousemove, touchstart, touchmove, touchend) and return a cleanup:
return () => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("mousedown", onMouseDown);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("touchstart", onTouchStart);
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("touchend", onTouchEnd);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
};
```
Cheap alternative with 80% of the feel: drei `useTrailTexture` (a canvas-2D trail texture, config `size 256, radius 0.3, maxAge 750, intensity 0.2, interpolate, smoothing`) sampled as a displacement/tint in any material:
```tsx
"use client";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTrailTexture } from "@react-three/drei";

export function TrailPlane({ color = "#7c5cff" }: { color?: string }) {
  const viewport = useThree((s) => s.viewport);
  const [trail, onMove] = useTrailTexture({ size: 256, radius: 0.25, maxAge: 900, intensity: 0.25, interpolate: 1, smoothing: 0.4 });
  const mat = useRef<THREE.ShaderMaterial>(null);
  useFrame(() => { if (mat.current) mat.current.uniforms.uTrail.value = trail; });
  return (
    <mesh scale={[viewport.width, viewport.height, 1]} onPointerMove={onMove}>
      <planeGeometry />
      <shaderMaterial
        ref={mat}
        transparent
        uniforms={{ uTrail: { value: trail }, uColor: { value: new THREE.Color(color) } }}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform sampler2D uTrail; uniform vec3 uColor; varying vec2 vUv;
          void main() {
            float t = texture2D(uTrail, vUv).r;
            gl_FragColor = vec4(uColor * t, t * 0.9);
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}
```
**Tune:** `DENSITY_DISSIPATION` 3-5 (higher = shorter trails, classier), `CURL` 1-3 (0 = laminar, 30 = original chaotic), `SPLAT_RADIUS` 0.1-0.2, `DYE_RESOLUTION` 512-1024 (1440 default is overkill), `PRESSURE_ITERATIONS` 10-15, one brand color, `RAINBOW_MODE={false}` always.  
**A11y/perf:** desktop + fine pointer only; off under reduced motion; never over body text. The sim costs 3-6 ms GPU/frame on integrated graphics even when the cursor is still: pause when the hero leaves the viewport.

### 6. Particles: morphing points, mouse repulsion, GPGPU
**Looks like:** a word or logo made of thousands of glowing points that explodes into a sphere as you scroll, parting around the cursor (Lusion, Igloo Inc, countless AI-startup heroes).  
**Use when / avoid when:** a hero or chapter transition with a clear narrative (logo -> product, text -> globe). Avoid a permanent drifting "neural network" field: the 2023-2025 AI-startup cliche.  
**Stack:** R3F + GSAP ScrollTrigger (progress) | three GPUComputationRenderer (GPGPU)

#### 6.1 Points morph (text -> sphere) with mouse repulsion
```tsx
// src/components/webgl/ParticleMorph.tsx
"use client";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const COUNT = 12000;

/** Rasterize text on a 2D canvas and return up to `count` points (world units, centered). */
function sampleText(text: string, count: number, font = "800 180px Inter, system-ui, sans-serif"): Float32Array {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 20, h = 240;
  c.width = w; c.height = h;
  ctx.font = font; ctx.fillStyle = "#fff"; ctx.textBaseline = "middle";
  ctx.fillText(text, 10, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const filled: number[] = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 128) filled.push(x, y);
  const out = new Float32Array(count * 3);
  const scale = 6 / w;                                          // text spans ~6 world units
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * (filled.length / 2)) * 2;
    out[i * 3] = (filled[j] - w / 2) * scale + (Math.random() - 0.5) * scale;
    out[i * 3 + 1] = -(filled[j + 1] - h / 2) * scale + (Math.random() - 0.5) * scale;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
  }
  return out;
}

function fibonacciSphere(count: number, radius: number): Float32Array {
  const out = new Float32Array(count * 3), golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    out[i * 3] = Math.cos(th) * r * radius; out[i * 3 + 1] = y * radius; out[i * 3 + 2] = Math.sin(th) * r * radius;
  }
  return out;
}

const vertexShader = /* glsl */ `
uniform float uProgress; uniform float uTime; uniform vec3 uMouse;
uniform float uRepelRadius; uniform float uRepelStrength; uniform float uSize; uniform float uPixelRatio;
attribute vec3 aTarget; attribute float aRandom;
varying float vMix; varying float vRandom;
void main() {
  float p = smoothstep(aRandom * 0.4, aRandom * 0.4 + 0.6, uProgress);   // per-particle stagger
  vec3 pos = mix(position, aTarget, p);
  pos += vec3(sin(uTime * 0.6 + aRandom * 40.0), cos(uTime * 0.5 + aRandom * 30.0), 0.0) * 0.02; // idle breathing
  vec2 away = pos.xy - uMouse.xy;
  float d = length(away);
  pos.xy += normalize(away + 1e-5) * (1.0 - smoothstep(0.0, uRepelRadius, d)) * uRepelStrength;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.6 + aRandom) / -mv.z;
  vMix = p; vRandom = aRandom;
}`;

const fragmentShader = /* glsl */ `
uniform vec3 uColorA; uniform vec3 uColorB;
varying float vMix; varying float vRandom;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.1, d) * (0.55 + 0.45 * vRandom);
  gl_FragColor = vec4(mix(uColorA, uColorB, vMix), alpha);
  #include <colorspace_fragment>   // THREE.Color stores linear values: encode so "#7c5cff" looks like the CSS color
}`;

function Points({ progressRef, text }: { progressRef: MutableRefObject<number>; text: string }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport, gl } = useThree();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(sampleText(text, COUNT), 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(fibonacciSphere(COUNT, 2.2), 3));
    g.setAttribute("aRandom", new THREE.BufferAttribute(Float32Array.from({ length: COUNT }, Math.random), 1));
    return g;
  }, [text]);
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uRepelRadius: { value: 0.6 }, uRepelStrength: { value: 0.35 }, uSize: { value: 18 },
    uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    uColorA: { value: new THREE.Color("#f4f1ea") }, uColorB: { value: new THREE.Color("#7c5cff") },
  }), [gl]);
  useFrame((state, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += dt;
    u.uProgress.value = THREE.MathUtils.damp(u.uProgress.value, progressRef.current, 5, dt);
    // pointer (-1..1) -> world on the z=0 plane (camera looks at origin)
    const tx = (state.pointer.x * viewport.width) / 2, ty = (state.pointer.y * viewport.height) / 2;
    u.uMouse.value.x = THREE.MathUtils.damp(u.uMouse.value.x, tx, 8, dt);
    u.uMouse.value.y = THREE.MathUtils.damp(u.uMouse.value.y, ty, 8, dt);
  });
  return (
    <points geometry={geometry}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function ParticleMorph({ progressRef, text = "ATLAS", paused }: { progressRef: MutableRefObject<number>; text?: string; paused: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 40 }} dpr={[1, 1.5]} frameloop={paused ? "never" : "always"} gl={{ antialias: false }}>
      <Points progressRef={progressRef} text={text} />
    </Canvas>
  );
}
```
Parent wiring (ScrollTrigger writes a ref; no React re-renders per scroll tick):
```tsx
"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger);
const ParticleMorph = dynamic(() => import("@/components/webgl/ParticleMorph"), { ssr: false });

export function MorphSection() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  useGSAP(() => {
    ScrollTrigger.create({ trigger: section.current, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: (self) => { progress.current = self.progress; } });
  }, { scope: section });
  return (
    <section ref={section} className="relative h-[250vh]">
      <h2 className="sr-only">Atlas</h2>
      <div className="sticky top-0 h-lvh"><ParticleMorph progressRef={progress} paused={false} /></div>
    </section>
  );
}
```

#### 6.2 GPGPU / FBO particles overview
Needed when particles carry state (velocity, life) or exceed ~50k with per-frame simulation (Maxime Heckel "The magical world of Particles", Codrops GPGPU tutorials). Positions live in a float texture (256x256 = 65,536 particles); a simulation fragment shader ping-pongs between two render targets; the points' vertex shader reads its position from the texture via a per-vertex UV (`aRef`).
```ts
import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";

const SIZE = 256;
const SIM = /* glsl */ `
uniform float uTime; uniform float uDelta; uniform sampler2D tOrigin;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;             // 'resolution' + 'tPosition' are injected
  vec4 p = texture2D(tPosition, uv);
  vec3 flow = vec3(sin(p.y * 1.3 + uTime * 0.3), sin(p.z * 1.1 + uTime * 0.2), sin(p.x * 1.7 - uTime * 0.25));
  p.xyz += flow * uDelta * 0.4;                            // swap for lygia curl noise for real flow fields
  p.w -= uDelta * 0.15;                                    // life
  if (p.w <= 0.0) p = vec4(texture2D(tOrigin, uv).xyz, 1.0);
  gl_FragColor = p;
}`;

export function createGpgpuParticles(renderer: THREE.WebGLRenderer) {
  const gpu = new GPUComputationRenderer(SIZE, SIZE, renderer);
  if (/iP(hone|ad|od)/.test(navigator.userAgent)) gpu.setDataType(THREE.HalfFloatType); // iOS float RT limits
  const origin = gpu.createTexture();
  const data = origin.image.data as Float32Array;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(2 + Math.random() * 0.2);
    data.set([v.x, v.y, v.z, Math.random()], i * 4);
  }
  const posVar = gpu.addVariable("tPosition", SIM, origin);
  gpu.setVariableDependencies(posVar, [posVar]);
  Object.assign(posVar.material.uniforms, { uTime: { value: 0 }, uDelta: { value: 0 }, tOrigin: { value: origin } });
  const err = gpu.init();
  if (err) throw new Error(`GPGPU init failed: ${err}`);

  const geo = new THREE.BufferGeometry();
  const refs = new Float32Array(SIZE * SIZE * 2);
  for (let i = 0; i < SIZE * SIZE; i++) refs.set([((i % SIZE) + 0.5) / SIZE, (Math.floor(i / SIZE) + 0.5) / SIZE], i * 2);
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SIZE * SIZE * 3), 3)); // unused, required
  geo.setAttribute("aRef", new THREE.BufferAttribute(refs, 2));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uPositions: { value: null }, uSize: { value: 3 } },
    vertexShader: `uniform sampler2D uPositions; uniform float uSize; attribute vec2 aRef; varying float vLife;
      void main(){ vec4 p = texture2D(uPositions, aRef); vLife = p.w;
        vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * (4.0 / -mv.z); }`,
    fragmentShader: `varying float vLife; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
      gl_FragColor = vec4(vec3(0.85, 0.8, 1.0), smoothstep(0.5, 0.0, d) * vLife); }`,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;                            // positions come from a texture: bounds are unknown

  return {
    points,
    update(time: number, delta: number) {
      posVar.material.uniforms.uTime.value = time;
      posVar.material.uniforms.uDelta.value = Math.min(delta, 1 / 30);
      gpu.compute();
      material.uniforms.uPositions.value = gpu.getCurrentRenderTarget(posVar).texture;
    },
    dispose() { gpu.dispose(); geo.dispose(); material.dispose(); },
  };
}
```
**Tune:** 8k-20k points for text morphs (more = mush, not detail); point size 12-24 at DPR-corrected scale; repel radius 0.4-0.8 world units, strength 0.2-0.5; stagger spread 0.3-0.5; damping 4-6. GPGPU: 128^2 on mobile, 256^2 desktop, 512^2 only for hero-only showpieces.  
**A11y/perf:** the text must also exist as real (sr-only or visible) text. Reduced motion: set progress to its end state, skip repulsion, `frameloop="demand"`. Additive blending + overdraw is the real cost: keep points small and count moderate. `frustumCulled = false` on GPGPU points or they vanish when the (wrong) bounding sphere leaves view.

### 7. R3F hero scene (glass, environment, GLTF, scroll camera, 3D text)
**Looks like:** a glass/chrome object floating in a studio light rig, refracting a headline behind it, soft contact shadow below, drag-to-tilt with spring snap-back (the pmndrs "glass" sandboxes, Vercel/Linear-era launch pages).  
**Use when / avoid when:** product launches, brand objects, portfolios with a signature object. Avoid a random torus knot with no meaning, and avoid `preset="city"` reflections that every drei demo shares (docs: presets hit a CDN and are not for production).  
**Stack:** R3F 9 + drei 10

```tsx
// src/components/webgl/GlassHero.tsx  (mount via ShaderStage: paused / reducedMotion / tier props)
"use client";
import { Suspense, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows, Environment, Float, Lightformer, MeshTransmissionMaterial,
  PerformanceMonitor, PresentationControls, Text, useGLTF,
} from "@react-three/drei";
import type { StageSceneProps } from "./ShaderStage";

function Product({ quality }: { quality: "low" | "high" }) {
  // gltfjsx --transform output: draco + webp textures; see GLTF pipeline below
  const { nodes } = useGLTF("/models/object-transformed.glb") as unknown as { nodes: Record<string, THREE.Mesh> };
  const mesh = Object.values(nodes).find((n) => (n as THREE.Mesh).isMesh) as THREE.Mesh;
  return (
    <mesh geometry={mesh.geometry} scale={1.4}>
      <MeshTransmissionMaterial
        transmission={1} thickness={0.6} roughness={0.04} ior={1.45}
        chromaticAberration={0.04} anisotropicBlur={0.1}
        distortion={0.15} distortionScale={0.3} temporalDistortion={0.05}
        samples={quality === "high" ? 8 : 4} resolution={quality === "high" ? 768 : 256}
        backside={false} color="#ffffff" attenuationColor="#d9d2ff" attenuationDistance={2.5}
      />
    </mesh>
  );
}

function StudioLights() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#0b0b10"]} />
      <Lightformer form="rect" intensity={3} color="#ffffff" scale={[10, 3]} position={[0, 5, -6]} target={[0, 0, 0]} />   {/* key strip */}
      <Lightformer form="rect" intensity={1.2} color="#c9b8ff" scale={[4, 8]} position={[-6, 0, 2]} target={[0, 0, 0]} />  {/* cool fill */}
      <Lightformer form="rect" intensity={2} color="#ffd9c4" scale={[3, 8]} position={[6, 1, 1]} target={[0, 0, 0]} />    {/* warm rim */}
      <Lightformer form="ring" intensity={4} color="#ffffff" scale={2} position={[0, 0, 8]} />                               {/* eye catch */}
    </Environment>
  );
}

export default function GlassHero({ paused, reducedMotion, tier, onReady }: StageSceneProps) {
  const [quality, setQuality] = useState<"low" | "high">(tier);
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 32 }}
      dpr={quality === "high" ? [1, 1.5] : 1}
      frameloop={paused ? "never" : reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={() => requestAnimationFrame(() => onReady())}
    >
      <color attach="background" args={["#0b0b10"]} />
      <PerformanceMonitor onDecline={() => setQuality("low")} flipflops={2} onFallback={() => setQuality("low")} />
      <Suspense fallback={null}>
        <Text position={[0, 0, -2]} fontSize={1.3} letterSpacing={-0.04} color="#f4f1ea" font="/fonts/display-bold.woff" anchorX="center" anchorY="middle">
          Clarity
        </Text>
        <PresentationControls global snap polar={[-0.2, 0.2]} azimuth={[-0.5, 0.5]} speed={1.2} damping={0.2}>
          <Float speed={reducedMotion ? 0 : 1.2} rotationIntensity={0.4} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
            <Product quality={quality} />
          </Float>
        </PresentationControls>
        <ContactShadows position={[0, -1.6, 0]} opacity={0.55} scale={8} blur={2.6} far={3.5} resolution={quality === "high" ? 512 : 256} color="#000000" />
        <StudioLights />
      </Suspense>
    </Canvas>
  );
}
useGLTF.preload("/models/object-transformed.glb");
```
Premium lighting recipe: one strong elongated key from above-behind (makes a long highlight on glass), a cool fill and a warm rim from opposite sides (color temperature contrast is what reads as "studio"), one ring Lightformer in front for the catch-light, dark background so transmission has contrast, and something BEHIND the glass to refract (text, a gradient plane). Glass over an empty background renders as nothing.

GLTF pipeline:
```bash
npx gltfjsx public/models/object.glb --transform --types --output src/components/webgl/Object.tsx
#   --transform: dedupe, prune, draco, resize textures to 1024, webp -> writes object-transformed.glb (often 70-90% smaller)
npx @gltf-transform/cli optimize object.glb object-ktx2.glb --compress meshopt --texture-compress ktx2
#   KTX2/Basis: textures stay compressed in GPU memory (4-8x less VRAM than PNG/WebP); worth it at > ~4 large textures
```
KTX2 at runtime (drei `useGLTF` extendLoader, per drei docs; self-host the transcoder by copying `node_modules/three/examples/jsm/libs/basis` to `public/basis/`):
```tsx
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { KTX2Loader } from "three-stdlib"; // drei's useGLTF uses three-stdlib's GLTFLoader: pair it with three-stdlib's KTX2Loader
let ktx2: KTX2Loader | null = null;
export function useKtx2Gltf(url: string) {
  const gl = useThree((s) => s.gl);
  return useGLTF(url, "/draco/", true, (loader) => {
    ktx2 ??= new KTX2Loader().setTranscoderPath("/basis/").detectSupport(gl);
    loader.setKTX2Loader(ktx2);
  });
}
```

Scroll-bound camera, option A (DOM-first page, recommended): ScrollTrigger writes progress into a ref; a rig damps the camera along a spline. Works with Lenis and any layout.
```tsx
"use client";
import { useMemo, type MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function CameraRig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 6), new THREE.Vector3(2.5, 0.8, 4.5), new THREE.Vector3(0.5, 1.8, 2.8), new THREE.Vector3(-1.5, 0.4, 3.5),
  ]), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  useFrame((state, dt) => {
    path.getPointAt(THREE.MathUtils.clamp(progressRef.current, 0, 1), target);
    state.camera.position.lerp(target, 1 - Math.exp(-dt * 4));   // damped: scroll jitter never reaches the camera
    state.camera.lookAt(look);
  });
  return null;
}
// ScrollTrigger.create({ trigger: storyEl, start: "top top", end: "bottom bottom", scrub: true, onUpdate: s => { progressRef.current = s.progress } })
```
Option B (the whole page lives in the canvas): drei `ScrollControls pages={4} damping={0.2}` + `useScroll()` (`offset`, `range(from, len)`, `curve`, `visible`) and `<Scroll html>` for DOM. Simpler, but it owns the scroll container (no Lenis/ScrollTrigger, no native anchors), so prefer A on real sites.

3D text: drei `Text` (troika SDF: crisp at any size, 1 draw call, loads .ttf/.otf/.woff directly, pass `characters` to avoid FOUC) for anything readable; `Text3D` (extruded `TextGeometry`, needs a typeface.json from facetype.js, `smooth`, `letterSpacing`, `lineHeight`; wrap in `<Center>`) only for chunky hero words that catch light, and keep it under ~20 glyphs.

**Tune:** MeshTransmissionMaterial `thickness` 0.3-1.5, `roughness` 0-0.15 (with roughness use `resolution` 32-256, per drei docs it still looks good and is much faster), `chromaticAberration` 0.02-0.06, `ior` 1.2-1.6, `samples` 4-10; Float `speed` 1-2, `floatIntensity` 0.3-1; ContactShadows `blur` 2-3, `opacity` 0.4-0.6, `frames={1}` when nothing moves; camera fov 25-35 (long lens = product photography).  
**A11y/perf:** MTM re-renders the scene into a buffer every frame per material (share one via `buffer` or `transmissionSampler` when there are several). Environment with `frames={1}` bakes once. Headline must also exist in the DOM (the 3D `Text` is `aria-hidden` decoration). PresentationControls on touch: set `global={false}` so page scroll is not captured.

### 8. Globes: cobe, three-globe, custom
**Looks like:** a dotted, glowing Earth slowly turning, with markers and arcs between offices/users (GitHub homepage globe, Vercel/Stripe "global network" sections; cobe is Shu Ding's 5 kB take on it).  
**Use when / avoid when:** there is real geographic data (offices, edge regions, customers). A decorative globe with random arcs is filler.  
**Stack:** cobe 2 (WebGL, zero deps) | three-globe (three) | custom R3F

| Option | Size | Strength | Weakness |
|---|---|---|---|
| **cobe 2.0** | ~5 kB gz | dotted-map look, markers + arcs (new in v2), CSS-anchor-bindable labels, you own the RAF | fixed style (dots), no textures/polygons |
| **three-globe** | three + ~60 kB | textured globe, arcs with dash animation, hex-bin polygons, labels, points; drops into R3F via `<primitive>` | heavier, generic look unless restyled |
| **react-globe.gl / globe.gl** | three + own renderer | batteries included (controls, tooltips) | its own canvas/renderer, hard to art-direct or share a scene |
| **Custom R3F** | three + R3F | full art direction (land-mask dots via fibonacci sphere, bezier arcs, atmosphere shader) | you build everything |

cobe v2 (verified against the 2.0.1 dist): `createGlobe(canvas, opts)` renders once and returns `{ update(partialOpts), destroy() }`. There is NO internal loop and NO `onRender` in v2 (the README still shows the v0.6 `onRender` snippet, the types and source do not): animate by calling `globe.update({ phi })` from your own `requestAnimationFrame`. v2 also multiplies `width`/`height` by `devicePixelRatio` internally, so pass CSS pixels.
```tsx
// src/components/webgl/CobeGlobe.tsx
"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import createGlobe, { type Arc, type Marker } from "cobe";

const MARKERS: Marker[] = [
  { location: [33.5731, -7.5898], size: 0.05, id: "cas" },
  { location: [48.8566, 2.3522], size: 0.04, id: "par" },
  { location: [40.7128, -74.006], size: 0.04, id: "nyc" },
  { location: [35.6762, 139.6503], size: 0.04, id: "tyo" },
];
const ARCS: Arc[] = [
  { from: [33.5731, -7.5898], to: [48.8566, 2.3522], id: "cas-par" },
  { from: [48.8566, 2.3522], to: [40.7128, -74.006], id: "par-nyc" },
];

export default function CobeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let phi = 0.6, drag = 0, velocity = 0, pointerX: number | null = null, raf = 0, inView = false;
    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr, width: canvas.offsetWidth, height: canvas.offsetWidth,   // CSS px
      phi, theta: 0.28, dark: 1, diffuse: 1.4, scale: 1, opacity: 0.92,
      mapSamples: 20000, mapBrightness: 5, mapBaseBrightness: 0.02,
      baseColor: [0.22, 0.22, 0.26], markerColor: [0.49, 0.36, 1], glowColor: [0.12, 0.1, 0.2],
      markers: MARKERS, arcs: ARCS, arcColor: [0.62, 0.5, 1], arcWidth: 0.4, arcHeight: 0.25, markerElevation: 0.01,
    });
    const frame = () => {
      if (pointerX === null) { phi += 0.0025; velocity *= 0.92; drag += velocity; }  // idle spin + inertia
      globe.update({ phi: phi + drag });
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && inView && !reduced) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onDown = (e: PointerEvent) => { pointerX = e.clientX; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; };
    const onMove = (e: PointerEvent) => {
      if (pointerX === null) return;
      const d = (e.clientX - pointerX) / 180;
      drag += d; velocity = d; pointerX = e.clientX;
      if (reduced) globe.update({ phi: phi + drag });   // still draggable with reduced motion, just no autoplay
    };
    const onUp = () => { pointerX = null; canvas.style.cursor = "grab"; };
    const ro = new ResizeObserver(() => globe.update({ width: canvas.offsetWidth, height: canvas.offsetWidth, phi: phi + drag }));
    const io = new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) start(); else stop(); });
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    ro.observe(canvas); io.observe(canvas);
    requestAnimationFrame(() => { canvas.style.opacity = "1"; });
    return () => {
      stop(); ro.disconnect(); io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      <canvas ref={canvasRef} aria-hidden className="h-full w-full cursor-grab opacity-0 transition-opacity duration-700"
        style={{ touchAction: "pan-y", contain: "layout paint size" }} />
      {/* cobe 2 exposes anchor names --cobe-{id} and visibility vars --cobe-visible-{id} (0 behind the globe, 1 in front) */}
      <span className="globe-label" style={{ positionAnchor: "--cobe-cas", opacity: "var(--cobe-visible-cas, 0)" } as CSSProperties}>Casablanca HQ</span>
    </div>
  );
}
```
```css
@supports (anchor-name: --a) {
  .globe-label {
    position: absolute; bottom: anchor(top); left: anchor(center); translate: -50% -6px;
    font: 500 12px/1 var(--font-mono); color: var(--text-muted); white-space: nowrap; pointer-events: none;
    filter: blur(calc((1 - var(--cobe-visible-cas, 0)) * 6px));
    transition: opacity 300ms, filter 300ms;
  }
}
@supports not (anchor-name: --a) { .globe-label { display: none; } }  /* list locations in a real <ul> nearby anyway */
```
three-globe in R3F (textured variant):
```tsx
"use client";
import { useMemo } from "react";
import ThreeGlobe from "three-globe";
import { useFrame } from "@react-three/fiber";

type ArcDatum = { startLat: number; startLng: number; endLat: number; endLng: number };
export function TexturedGlobe({ arcs }: { arcs: ArcDatum[] }) {
  const globe = useMemo(() => new ThreeGlobe()
    .globeImageUrl("/textures/earth-night-2k.jpg")
    .arcsData(arcs).arcColor(() => "#8b7bff").arcStroke(0.4)
    .arcDashLength(0.4).arcDashGap(2).arcDashAnimateTime(2500), [arcs]);
  useFrame((_, dt) => { globe.rotation.y += dt * 0.05; });
  return <primitive object={globe} scale={0.02} />;   // three-globe radius is 100 units
}
```
Custom R3F helpers (lat/lng to 3D and a lifted arc for `TubeGeometry` or drei `QuadraticBezierLine`):
```ts
import * as THREE from "three";
export function latLngToVec3(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat), theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}
export function arcCurve(a: THREE.Vector3, b: THREE.Vector3, r = 1, lift = 0.35): THREE.QuadraticBezierCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(r + a.distanceTo(b) * lift);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}
```
**Tune:** cobe `mapSamples` 12k-25k (more = finer dots), `mapBrightness` 4-8, `diffuse` 1-2, `theta` 0.2-0.35 (tilt shows the northern hemisphere where most markers are), spin 0.001-0.003 rad/frame, drag divisor 150-250; `dark: 1` + dark `baseColor` + subtle `glowColor` is the premium setting, `dark: 0` light globes need a soft grey base.  
**A11y/perf:** canvas `aria-hidden` plus a real list of locations. `touch-action: pan-y` keeps vertical page scroll working while horizontal drag spins. Pause via IntersectionObserver (you own the loop in v2, so this is 3 lines).

### 9. Post-processing stack
**Looks like:** a filmic finish on a 3D scene: soft highlight bloom, faint grain, gentle vignette, whisper of lens fringing, optional shallow depth of field.  
**Use when / avoid when:** R3F scenes that feel "CG-clean". Avoid on shader backgrounds (bake grain/vignette into the shader instead: one pass, recipe 3.10) and avoid default-intensity bloom (glowing everything = 2019 synthwave).  
**Stack:** @react-three/postprocessing 3.1 + postprocessing 6.39 (WebGLRenderer only)

```tsx
"use client";
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

export function FilmFinish({ quality = "high", closeUp = false }: { quality?: "low" | "high"; closeUp?: boolean }) {
  return (
    <EffectComposer multisampling={quality === "high" ? 4 : 0} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.7} radius={0.7} />
      {closeUp ? <DepthOfField target={[0, 0, 0]} worldFocusRange={2.5} bokehScale={2.5} /> : <></> /* empty fragment, not null: long-standing workaround for conditional composer children */}
      <ChromaticAberration offset={[0.0006, 0.0006]} radialModulation modulationOffset={0.35} />
      <Vignette offset={0.3} darkness={0.55} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.4} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
```
Facts verified in the v3.1 source: `EffectComposer` defaults `multisampling = 8` and HalfFloat buffers, and it forces `gl.toneMapping = NoToneMapping` while mounted, so R3F's default ACES disappears unless you add `<ToneMapping />` last (modes: `ACES_FILMIC`, `AGX`, `NEUTRAL`, `REINHARD`, ...). `enableNormalPass` is only for SSAO/SSGI. Effects are merged into as few passes as possible (`mergeMode="auto"`), but convolution effects (Bloom, DoF) each add passes.

| Effect | Tasteful | Cheap-looking |
|---|---|---|
| Bloom | `mipmapBlur`, threshold 0.8-0.95, intensity 0.4-1.0 (only emissive/specular glows) | threshold < 0.5, intensity > 2 |
| Noise | `premultiply`, SOFT_LIGHT/OVERLAY, opacity 0.2-0.5 | default SCREEN at 1.0 (washed grey) |
| ChromaticAberration | offset 0.0003-0.001, `radialModulation` (edges only) | 0.005+ everywhere |
| Vignette | offset 0.25-0.4, darkness 0.4-0.7 | darkness > 0.9 tunnel |
| DepthOfField | product close-ups, `bokehScale` 2-4, focus on the hero object | on wide scenes / text |
| ToneMapping | AGX (neutral, handles saturated brand colors) or ACES_FILMIC (contrasty) | none (flat, clipped highlights) |

**Tune:** see table; `multisampling` 4 (high) / 0 (low, add `<SMAA />` if edges matter).  
**A11y/perf:** full-screen passes scale with DPR squared: pair post with `dpr={[1, 1.5]}` and PerformanceMonitor. Under reduced motion keep static effects, drop animated grain (`<Noise>` animates per frame; remove it or lower `opacity` to 0.15).

### 10. No-code / low-code: Paper Shaders, Unicorn Studio, Spline
**Looks like:** designer-authored gradients, dithers, liquid metal logos, layered interactive scenes, 3D product toys.  
**Use when / avoid when:** Paper Shaders when you want a tuned, maintained shader as a React prop API (cheap, ~12 kB). Unicorn Studio when a designer iterates the look in their tool. Spline for playful interactive 3D mockups; avoid it for LCP heroes (heavy) and for anything that must be accessible or SEO-bearing.  
**Stack:** React components / embeds

Paper Shaders (`@paper-design/shaders-react` 0.0.81, 0.0.x: pin the exact version). Catalog in this version: `MeshGradient`, `StaticMeshGradient`, `StaticRadialGradient`, `GrainGradient`, `Warp`, `Swirl`, `Waves`, `Water`, `SmokeRing`, `NeuroNoise`, `PerlinNoise`, `SimplexNoise`, `Voronoi`, `Metaballs`, `Spiral`, `DotGrid`, `DotOrbit`, `ColorPanels`, `GodRays`, `GemSmoke`, `PulsingBorder`, `Dithering`, `ImageDithering`, `HalftoneDots`, `HalftoneCmyk`, `LiquidMetal`, `FlutedGlass`, `LensDistortion`, `PaperTexture`, `Heatmap`. Shared props: `speed`, `frame`, sizing (`fit` none|contain|cover, `scale`, `rotation`, `offsetX/Y`, `originX/Y`, `worldWidth/Height`), `minPixelRatio` (default 2), `maxPixelCount` (default 1920*1080*4), plus div props (`style`, `className`, `width`, `height`).
```tsx
"use client";
import { Dithering, GrainGradient, MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "@/lib/webgl/use-reduced-motion";

export function PaperHeroBackground() {
  const reduced = useReducedMotion();
  return (
    <MeshGradient
      aria-hidden
      style={{ position: "absolute", inset: 0 }}
      colors={["#07060f", "#3b1d8f", "#ff6b4a", "#c9b8ff"]}   // up to ~10 colors
      distortion={0.8} swirl={0.1} grainMixer={0.15} grainOverlay={0.08}
      speed={reduced ? 0 : 0.35}                               // 0 stops the rAF entirely (verified in ShaderMount)
      frame={4200}                                             // choose the still frame shown when speed is 0
      maxPixelCount={1920 * 1080}                              // backgrounds do not need 8 MP
      minPixelRatio={1}
    />
  );
}

export const GrainCard = () => (
  <GrainGradient style={{ width: "100%", height: 320, borderRadius: 24 }}
    colorBack="#0a0a0a" colors={["#7300ff", "#eba8ff", "#00bfff"]} softness={0.5} intensity={0.5} noise={0.25} shape="corners" speed={0.6} />
);

export const DitherOrb = () => (
  <Dithering style={{ width: 480, height: 480 }} colorBack="#000000" colorFront="#00b2ff" shape="sphere" type="4x4" size={2} scale={0.6} speed={1} />
);
// GrainGradient shapes: wave | dots | truchet | corners | ripple | blob | sphere
// Dithering shapes: simplex | warp | dots | wave | ripple | swirl | sphere ; types: random | 2x2 | 4x4 | 8x8
```
Paper's `ShaderMount` already pauses when offscreen (IntersectionObserver) and when the tab is hidden (visibilitychange); you only add reduced motion (`speed={0}`).

Unicorn Studio (runtime ~54 kB gz, SDK v2.3; designer tool with layers/effects, exports an embed ID or a self-hostable JSON):
```tsx
"use client";
import UnicornScene from "unicornstudio-react/next";
import { useReducedMotion } from "@/lib/webgl/use-reduced-motion";

export function UnicornHero() {
  const reduced = useReducedMotion();
  return (
    <UnicornScene
      projectId="YOUR_EMBED_ID"            // or jsonFilePath="/unicorn/hero.json" to self-host
      width="100%" height="100%"
      scale={0.75} dpi={1.25} fps={60}      // ValidFPS: 15 | 24 | 30 | 60 | 120; freeze via `paused`
      paused={reduced}
      lazyLoad production
      placeholder="/images/hero-poster.webp"
      altText="Abstract flowing light" ariaLabel="Decorative animated background"
    />
  );
}
```
Plain HTML: `<div data-us-project="ID" data-us-scale="0.75" data-us-dpi="1.25" data-us-lazyload="true" data-us-production="true" style="width:100%;height:100vh"></div>` + the UMD script + `UnicornStudio.init()`. The SDK already renders only in-view scenes, stops the loop for static scenes, handles visibility and resize: do not add your own IntersectionObserver. Destroy on route unmount (`scene.destroy()` / `UnicornStudio.destroy()`). The container needs explicit width/height before init. Check current plan terms for badge removal and JSON export before promising either.

Spline (`@splinetool/react-spline` 4.1, `/next` export available): `<Spline scene="https://prod.spline.design/ID/scene.splinecode" onLoad={...} />`. Cost is the problem: the runtime entry is ~37 kB gz but it lazy-loads multi-hundred-kB chunks/wasm (physics wasm alone ~430 kB br) plus the `.splinecode` scene (commonly 1-5 MB). Acceptable below the fold, behind a poster, mounted on intent (click "Play with it") or when in view; never as LCP. Rebuild in R3F when it becomes a core brand asset.

| Tool | Weight | Control | Verdict |
|---|---|---|---|
| Paper Shaders | ~12 kB gz per shader | props, presets | best default for shader backgrounds without writing GLSL |
| Unicorn Studio | ~54 kB gz + scene JSON/textures | designer-owned | good for layered 2D effects a designer tunes; vendor runtime |
| Spline | several hundred kB to MBs | designer-owned 3D | playful demos, below the fold only |
| Custom (recipes 2-3) | 2-10 kB | total | when the effect is the brand |

**Tune:** Paper `speed` 0.2-0.6 for backgrounds, `maxPixelCount` ~2 MP; Unicorn `scale` 0.5-0.8 + `dpi` 1-1.5 + `fps` 30 for ambient scenes.  
**A11y/perf:** all three render into canvases: keep text in the DOM, give a poster, respect reduced motion via `speed={0}` / `paused`.

### 11. WebGPU + TSL in r186
**Looks like:** same pixels; the gain is compute shaders (million-particle sims, GPU culling), TSL node materials that compile to WGSL or GLSL, and the new post stack (`RenderPipeline`, TRAA, SSGI, better DoF).  
**Use when / avoid when:** compute-heavy showpieces, new projects that commit to TSL. Avoid for marketing backgrounds and anything built on drei GLSL materials (`shaderMaterial`, `MeshTransmissionMaterial`) or `@react-three/postprocessing`: `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile` and `EffectComposer` are NOT supported by `WebGPURenderer` (three.js manual).  
**Stack:** three/webgpu + three/tsl (+ R3F 9 async `gl`)

Facts (three.js manual + r186 build, Sept 2026): import from `three/webgpu` and `three/tsl`; WebGPU init is async (`await renderer.init()`, or use `setAnimationLoop`, which waits); if WebGPU is unavailable it automatically falls back to a WebGL 2 backend; `forceWebGL: true` forces that path for testing; `renderer.backend.isWebGPUBackend` / `isWebGLBackend` tells you which one you got; the manual still calls the renderer experimental in places, and WebGLRenderer remains maintained but gets no big new features. `PostProcessing` was renamed `RenderPipeline` in r183 (old name deprecated). Browser support 2026: Chrome/Edge desktop 113+, Chrome Android 121+ (Android 12+), Safari 26 (macOS/iOS/iPadOS), Firefox 141+ Windows and 145+ macOS Apple Silicon; Firefox Linux/Android and Intel Macs still rolling out, hence the fallback matters.

Vanilla:
```ts
import * as THREE from "three/webgpu";
import { Fn, color, mix, mx_fractal_noise_float, smoothstep, time, uniform, uv, vec3 } from "three/tsl";

export async function createWebGPUBackground(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGPURenderer({ canvas, antialias: false });   // falls back to WebGL2 automatically
  await renderer.init();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  console.info("isWebGPUBackend" in renderer.backend ? "WebGPU backend" : "WebGL2 fallback backend");

  const uSpeed = uniform(0.08);
  const material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = Fn(() => {
    const p = uv().mul(2.5);
    const n = mx_fractal_noise_float(vec3(p, time.mul(uSpeed)), 4, 2.0, 0.5, 1.0).mul(0.5).add(0.5);  // (pos, octaves, lacunarity, diminish, amplitude)
    return mix(color("#0b0b12"), color("#7c5cff"), smoothstep(0.25, 0.85, n));
  })();
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
  return {
    setSpeed: (v: number) => { uSpeed.value = v; },
    dispose: () => { renderer.setAnimationLoop(null); material.dispose(); renderer.dispose(); },
  };
}
```
R3F 9 (pattern from the R3F Canvas docs):
```tsx
"use client";
import * as THREE from "three/webgpu";
import { Canvas, extend, type ThreeToJSXElements } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}
extend(THREE as any);

export default function WebGPUCanvas({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer(props as any);   // R3F owns + disposes factory-created renderers
        await renderer.init();
        return renderer;
      }}
    >
      {children /* use <meshBasicNodeMaterial colorNode={...} /> etc., not GLSL materials */}
    </Canvas>
  );
}
```
Post-processing on WebGPU: `const pipeline = new THREE.RenderPipeline(renderer); const scenePass = pass(scene, camera); pipeline.outputNode = bloom(scenePass)` (effects from `three/addons/tsl/display/*.js`, e.g. `BloomNode.js`, `RGBShiftNode.js`, `FXAANode.js`), then call `pipeline.render()` instead of `renderer.render()`.

**Tune:** keep the same DPR caps; TSL `uniform()` values update without recompiles.  
**A11y/perf:** bundle cost ~290 kB gz for `three/webgpu` vs ~185 kB for `three` (r186, untreeshaken). First-frame shader compilation is slower (async pipelines): show the poster until the first frame. Verdict for marketing sites in 2026: WebGLRenderer + GLSL is still the pragmatic default; adopt WebGPU when you need compute or you are starting a TSL codebase.

### 12. Debug and perf tooling
**Looks like:** a dev-only overlay with FPS, CPU/GPU ms, draw calls, triangles, textures; live sliders for every uniform; frame captures that show each draw call.  
**Use when / avoid when:** always during development of any canvas; never shipped to production.  
**Stack:** r3f-perf 7.2 | stats-gl 4.2 | leva 0.10 | Spector.js | renderer.info

```tsx
// src/components/webgl/DevTools.tsx  (dynamic-import it so none of this reaches the prod bundle)
"use client";
import { Perf } from "r3f-perf";
import { Leva } from "leva";

export default function DevTools() {
  return (
    <>
      <Perf position="top-left" />   {/* FPS, GPU/CPU ms, calls, triangles, geometries, textures, programs */}
      <Leva collapsed={false} />
    </>
  );
}
// in the scene file: const DevTools = dynamic(() => import("./DevTools"), { ssr: false });
// inside <Canvas>: {process.env.NODE_ENV === "development" && <DevTools />}
```
```tsx
// tune uniforms live with leva, then paste the final numbers back as constants
"use client";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";

export function useGradientControls(material: RefObject<THREE.ShaderMaterial | null>) {
  const v = useControls("Gradient", {
    speed: { value: 0.07, min: 0, max: 0.5, step: 0.005 },
    warp: { value: 3.5, min: 0, max: 8, step: 0.1 },
    grain: { value: 0.045, min: 0, max: 0.2, step: 0.005 },
    colorA: "#3b1d8f",
    colorB: "#ff6b4a",
  });
  const tmp = useRef(new THREE.Color());
  useFrame(() => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uSpeed.value = v.speed; u.uWarp.value = v.warp; u.uGrain.value = v.grain;
    u.uColorA.value.copy(tmp.current.set(v.colorA));
    u.uColorB.value.copy(tmp.current.set(v.colorB));
  });
}
```
Vanilla / OGL / raw WebGL2 (stats-gl 4.2 README): `const stats = new Stats({ trackGPU: true }); document.body.appendChild(stats.dom); stats.init(renderer);` (three renderer, or the canvas for raw WebGL2), then `stats.update()` after each render; raw WebGL2 wraps draws in `stats.begin()` / `stats.end()`. Safari GPU timing needs the WebKit feature flag "WebGL Timer Queries". drei wraps it as `<StatsGl />`.

Numbers to watch (`renderer.info` in three, `useThree((s) => s.gl.info)` in R3F):

| Metric | Mobile budget | Desktop budget | Fix when over |
|---|---|---|---|
| `info.render.calls` | < 100 | < 300 | `InstancedMesh` / drei `<Instances>`, `BatchedMesh` (different geometries, one material), `mergeGeometries` from `three/addons/utils/BufferGeometryUtils.js` for static props |
| `info.render.triangles` | < 300k | 1-2M | gltfjsx `--simplify`, LODs (drei `<Detailed>`), drop hidden meshes |
| texture VRAM | < 64 MB | < 256 MB | KTX2, 2048 px max on mobile, `dispose()` unused; VRAM ~ w*h*4*1.33 bytes with mipmaps |
| `info.programs.length` | < 10 | < 30 | share materials; each unique material variant is a new program and a compile hitch |
| GPU ms (stats-gl / r3f-perf) | < 8 ms | < 10 ms | lower DPR first, then samples/octaves/passes |

Spector.js (browser extension) captures one frame: every draw call, bound textures, full shader source, GL state. Use it to find the offscreen draw you forgot to cull, the 4K texture, the render target cleared twice. Chrome DevTools Performance shows GPU tasks and long rAF handlers; `chrome://gpu` reveals a SwiftShader (software) fallback, which explains "it lags only on this laptop".

**Tune:** profile on a mid-range Android and an old MacBook Air at DPR 2-3, not on the dev machine.  
**A11y/perf:** none of this ships: leva not imported in prod (or `<Leva hidden />`), r3f-perf dynamic-imported in development only.

### 13. Art direction and taste verdicts
**Looks like:** a shader that belongs to the brand (its palette, tempo, texture); the viewer notices the mood, not the technique.  
**Use when / avoid when:** before shipping any recipe above. Read with `color-surfaces.md` (palettes) and `motion-principles.md` (tempo).  
**Stack:** judgment + a few constants

```ts
// src/lib/webgl/art-direction.ts : one place for the numbers that make shaders feel premium
export const SHADER_ART = {
  timeScale: 0.05,          // ambient: a full visual cycle of 20-60 s
  mouseInfluence: 0.2,      // 0.1-0.35 of the field, damped at 4-8
  grain: 0.045,             // 3-6%, re-seeded at 12-24 fps
  accentMix: 0.6,           // accent never dominates the field
  dpr: { low: 1, high: 1.5 },
} as const;
// palette comes from design tokens, never from a demo default:
// warpGradientFrag({ colors: [tokens.bg, tokens.brandDeep, tokens.accent, tokens.haze] })
```

Overused in 2026 (instant "template" signal when used as-is):

| Effect | Why it reads cheap now | How to make it tasteful |
|---|---|---|
| Purple/blue aurora or mesh gradient behind a centered headline | default AI-startup hero since 2023; React Bits/Aceternity defaults | brand palette with ONE accent, near-black or paper base, 0.03-0.07 time scale, grain, cropped so only a region glows |
| Fluid splash cursor | most-copied React Bits component; covers text | contained playground section only, brand color, high dissipation |
| Particle "neural network" / plexus field | 2016 plexus re-skinned for AI | morph with meaning (logo to product), finite, then settle |
| RGB split / glitch on every image | 2019 editorial template | velocity-driven only, 0 at rest, <= 0.0005 per px/frame |
| Rainbow IQ palette, Balatro swirl, Iridescence | recognisable Shadertoy/React Bits defaults | derive palette from brand tokens (b <= 0.35) or a 3-stop ramp |
| Glass torus knot with `preset="city"` | the drei demo | meaningful object, custom Lightformer rig, something behind the glass to refract |
| Liquid chrome everything | Y2K revival peaked 2024-25 | as a logo material (Paper `LiquidMetal`), not a page background |
| Dither / halftone / ASCII | fresh in 2025, saturating in 2026 | commit to a print/retro identity (type, layout, palette), not a lone effect |

Art direction rules:
- **Palette:** shader colors from tokens (`glslColor(tokens.accent)`), mixed in linear space; one accent + 2-3 neutrals; narrow luminance range behind text. Check contrast against the brightest frame, not the average.
- **Tempo:** if a user can describe the motion after 2 seconds, halve the speed.
- **Texture:** fine grain turns banded gradients into print and hides 8-bit banding on dark gradients.
- **Composition:** let the effect live in a region (corner glow, bottom fade) and blend edges into the page with a CSS mask (`mask-image: linear-gradient(black 70%, transparent)`); headline over the calmest area.
- **Interaction:** subtle, damped, never required to understand the page.
- **One hero effect per page.** Everything else is CSS.

Accessibility of moving backgrounds:
- `prefers-reduced-motion: reduce`: render one composed frame (not blank). Autoplaying motion longer than 5 s needs a pause control (WCAG 2.2.2): a small "Pause background" toggle that sets `speed = 0` / `frameloop="never"` is cheap and a craft signal.
- No more than 3 flashes per second; avoid high-contrast strobing noise and fast hue cycling (photosensitive and vestibular triggers).
- Text over shaders: a scrim (`background: color-mix(in oklab, var(--bg) 60%, transparent)`) or a constrained luminance range; not `text-shadow`.
- Canvases are `aria-hidden`; any meaning they carry (locations, product name) also exists as DOM text.
- Save-Data or `tier: low`: poster only.

## Gotchas
- **Background stage renders nothing (0px tall)** -> an inline `style={{ position: "relative" }}` on a wrapper beats the caller's `absolute inset-0` class, so the host collapses and poster + canvas vanish (caught in a browser harness on recipe 1). Keep positioning in `className` only; check the host's computed height when a canvas "doesn't show".
- **Planes "swim" behind DOM images** -> Lenis and the WebGL render ran in different rAF callbacks. Drive `lenis.raf()` then `render()` from one loop (recipe 4.3), or both from `gsap.ticker` with `lagSmoothing(0)`.
- **`getBoundingClientRect()` per frame per image** -> layout thrash. Cache document offsets on resize/ResizeObserver, subtract scroll per frame.
- **`ssr: false` error in App Router** -> `next/dynamic` with `ssr: false` is only allowed in Client Components; put the dynamic import in a `"use client"` file (recipe 1).
- **Colors darker/washed in three vs CSS** -> `THREE.Color` stores linear values; custom `ShaderMaterial`s must end with `#include <colorspace_fragment>`. Raw WebGL2: mix in linear, encode with `pow(1/2.2)` (recipe 3.1).
- **Tone mapping vanished after adding post** -> `@react-three/postprocessing` sets `gl.toneMapping = NoToneMapping` while mounted; add `<ToneMapping mode={ToneMappingMode.AGX} />` last.
- **Console: "PCFSoftShadowMap has been removed"** -> three r186 deprecated it but R3F 9.8 still maps `shadows={true}` to it. Use `shadows="percentage"` (PCFShadowMap) or `"variance"`.
- **Console: "Clock: This module has been deprecated"** -> `THREE.Clock` deprecated since r183 (use `THREE.Timer` in vanilla code); R3F 9.8 still creates a Clock internally, harmless.
- **cobe globe does not spin after upgrading to 2.0** -> v2 removed `onRender`; call `globe.update({ phi })` in your own rAF. v2 also multiplies `width/height` by `devicePixelRatio`: pass CSS px.
- **"Too many active WebGL contexts. Oldest context will be lost"** -> one canvas per card. Share one canvas (recipe 4.3, drei `<View>`) and `loseContext()` on unmount.
- **React Bits WebGL components leak or burn GPU** -> SplashCursor returns no cleanup; Aurora rebuilds its color array every frame; most never pause offscreen or clamp DPR. Patch before shipping (recipe 5).
- **Black or banded on iPhone** -> declare `precision highp float;`; avoid `sin()`-based hashes with large inputs (use Hoskins `hash12`); use `HalfFloatType` render targets for GPGPU on iOS.
- **`#include` inside a one-line template string fails to compile** -> GLSL preprocessor directives must start their own line.
- **Black texture / tainted canvas** -> cross-origin image without CORS. Same-origin (next/image), or `crossOrigin="anonymous"` set before `src` plus `Access-Control-Allow-Origin` on the CDN.
- **WebGL images blurrier than DOM ones** -> DPR capped at 1 or source at display size. Image planes need DPR up to 2 and 1.5-2x source resolution; backgrounds do not.
- **Hitch on first hover/scroll** -> shader compiled lazily. Warm up with `gl.compile(scene, camera)` (or `compileAsync`) before fading the canvas in.
- **Canvas blocks clicks** -> `pointer-events: none` on decorative canvases; DOM-synced galleries keep real `<img>` elements receiving events.
- **Opaque sections hide the fixed gallery canvas** -> with the canvas behind `main`, sections must be transparent (body carries the color), or put the canvas above with `pointer-events: none` and text above it.
- **Model looks flat/grey** -> no environment map; PBR materials need `scene.environment` (drei `<Environment>` + Lightformers).
- **drei `Environment preset` fails in production** -> presets load from a CDN (drei docs: not for production). Self-host `.hdr`/gainmap files or use Lightformer-only environments.
- **Draco decoder 404** -> `useGLTF(url, "/draco/")` needs decoder files in `public/draco/`; pass `true` to use the gstatic CDN.
- **MeshTransmissionMaterial tanks FPS** -> each instance re-renders the scene; lower `samples`/`resolution`, share `buffer` or use `transmissionSampler`; `backside` doubles cost.
- **CSS `filter`/`backdrop-filter` scrubbed over a canvas** -> recomposites the whole canvas each frame; animate a shader uniform instead.
- **Paper / Unicorn fighting your observers** -> both already pause offscreen and in hidden tabs; only add reduced-motion handling.

## Sources
- three.js r186 release notes: https://github.com/mrdoob/three.js/releases/tag/r186
- three.js manual, WebGPURenderer: https://threejs.org/manual/#en/webgpurenderer (source: https://github.com/mrdoob/three.js/blob/dev/manual/pages/webgpurenderer.html)
- three.js manual, WebGPU post-processing (RenderPipeline): https://github.com/mrdoob/three.js/blob/dev/manual/pages/webgpu-postprocessing.html
- three.js llms.txt: https://threejs.org/docs/llms.txt
- three r186 package source (Timer, PCFSoftShadowMap deprecation, TSL `mx_fractal_noise_float`, backend flags, bundle sizes): npm `three@0.186.1`
- R3F Canvas docs (props, WebGPU async gl, ownership): https://github.com/pmndrs/react-three-fiber/blob/master/docs/API/canvas.mdx
- R3F 9.8.1 dist (shadows mapping, Clock): npm `@react-three/fiber@9.8.1`
- drei docs (MeshTransmissionMaterial, shaderMaterial, Environment, Lightformer, Float, ContactShadows, PresentationControls, ScrollControls, Text, Text3D, useGLTF, useKTX2, View, useFBO, PerformanceMonitor, useTrailTexture): https://github.com/pmndrs/drei/tree/master/docs
- @react-three/postprocessing 3.1.2 types/source: npm `@react-three/postprocessing@3.1.2`
- postprocessing 6.39.5 (effect uniforms, `mainUv`, ToneMappingMode): npm `postprocessing@6.39.5`
- OGL README and source: https://github.com/oframe/ogl
- cobe 2.0.1 dist, types, website source: https://github.com/shuding/cobe , https://cobe.vercel.app
- Paper Shaders 0.0.81: npm `@paper-design/shaders-react`, `@paper-design/shaders`; https://shaders.paper.design
- unicornstudio-react README: https://github.com/diegopeixoto/unicornstudio-react ; Unicorn Studio runtime guide: https://www.unicorn.studio/unicornstudio-llms.txt
- Spline runtime file sizes: https://www.jsdelivr.com/package/npm/@splinetool/runtime
- React Bits sources (Aurora, Silk, LiquidChrome, Iridescence, Balatro, Threads, DarkVeil, Grainient, SplashCursor): https://github.com/DavidHDev/react-bits/tree/main/src/ts-default
- Pavel Dobryakov, WebGL Fluid Simulation: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
- Robin Delaporte hover-effect: https://github.com/robin-dela/hover-effect ; Codrops "WebGL Distortion Hover Effects": https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/
- Codrops "Building a Scroll-Revealed WebGL Gallery" (2026): https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/
- Codrops "Smooth Horizontal Parallax Gallery: From DOM to WebGL" (2026): https://tympanus.net/codrops/2026/02/19/creating-a-smooth-horizontal-parallax-gallery-from-dom-to-webgl/
- Codrops "On-Scroll Revealing WebGL Images" (2024): https://tympanus.net/codrops/2024/02/07/on-scroll-revealing-webgl-image-explorations/
- Codrops "Grid Displacement Texture with RGB Shift (GPGPU)" (2024): https://tympanus.net/codrops/2024/08/27/grid-displacement-texture-with-rgb-shift-using-three-js-gpgpu-and-shaders/
- Maxime Heckel, "The Art of Dithering and Retro Shading for the Web": https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/
- Inigo Quilez, palettes and domain warping: https://iquilezles.org/articles/palettes/ , https://iquilezles.org/articles/warp/
- The Book of Shaders: https://thebookofshaders.com
- Lenis 1.3.26 README/types: https://github.com/darkroomengineering/lenis
- stats-gl README: https://github.com/RenaudRohlinger/stats-gl
- WebGPU support 2026: https://web.dev/blog/webgpu-supported-major-browsers , https://github.com/gpuweb/gpuweb/wiki/Implementation-Status
