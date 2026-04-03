# HOMEPAGE REBUILD PLAN
### Diego Aguirre — Personal Website

---

## 1. Repo Audit / Current Stack Summary

| Item | Status |
|---|---|
| Framework | **None** — repo is uninitialized |
| Package Manager | **None** — no lockfile present |
| TypeScript | Not configured |
| Tailwind CSS | Not installed |
| Framer Motion | Not installed |
| Three.js / React Three Fiber | Not installed |
| Existing pages / routes | None |
| Existing components | None |
| Assets present | `mclaren_mp45.obj` (24.5 MB, 3D model) |

**Conclusion:** This is a greenfield project. We bootstrap from scratch using the preferred stack.

---

## 2. Recommended Stack

| Layer | Tool | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Production-grade, fast DX, static export if needed, well-suited for personal sites |
| Language | TypeScript | Type safety, better component contracts |
| Styling | Tailwind CSS v4 | Utility-first, minimal CSS weight, dark-mode-first easy |
| Animation | Framer Motion | Best-in-class declarative scroll orchestration for React; `useScroll` + `useTransform` are exactly what this sequence needs |
| 3D | React Three Fiber (`@react-three/fiber`) + `@react-three/drei` | Already used in the ModelViewer component being pasted in — must match |
| 3D loader | `three` + `OBJLoader` | ModelViewer uses `OBJLoader` for `.obj` files |
| Font | Geist (bundled with Next.js) or custom variable font via `next/font` | Clean, premium, modern |

### New dependencies to add
```
next react react-dom typescript
tailwindcss @tailwindcss/vite (or PostCSS plugin)
framer-motion
three @react-three/fiber @react-three/drei
@types/three
```
> Three.js / R3F are **required** — the ModelViewer component pasted later depends on them directly.

---

## 3. Project Structure

```
/
├── app/
│   ├── layout.tsx          # Root layout — font, metadata, dark bg
│   ├── page.tsx            # Homepage (entry point)
│   └── globals.css         # Tailwind directives + CSS custom props
│
├── components/
│   ├── homepage/
│   │   ├── HeroSection.tsx         # "Diego Aguirre" hero text
│   │   ├── ModelStage.tsx          # Scroll-pinned 3D stage wrapper
│   │   ├── ModelViewerPlaceholder.tsx  # ← paste your real component here
│   │   ├── IdentitySection.tsx     # builder / technologist / founder
│   │   └── MenuButton.tsx          # Upper-right minimal menu trigger
│   └── ui/
│       └── (shared primitives if needed)
│
├── hooks/
│   └── useReducedMotion.ts    # Wraps Framer's useReducedMotion
│
├── public/
│   └── models/
│       └── mclaren_mp45.obj   # Move .obj here for public serving
│
├── HOMEPAGE_REBUILD_PLAN.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Component Breakdown

### `app/layout.tsx`
- Sets `<html>` `className="bg-black text-white antialiased"`
- Applies font variable via `next/font/local` or `next/font/google`
- Sets `<meta name="color-scheme" content="dark">`
- No scroll snap — we handle scroll manually via Framer

### `app/page.tsx`
- Thin orchestration layer
- Renders `<MenuButton />`, `<HeroSection />`, `<ModelStage />`, `<IdentitySection />`
- Passes a shared `scrollYProgress` ref down (from `useScroll` at page level)

### `components/homepage/HeroSection.tsx`
- Full-viewport (`100dvh`) centered section
- Large `<h1>Diego Aguirre</h1>` — bold, white, wide letter-spacing
- Framer `motion.div` — animated opacity + Y translate out as scroll begins
- Sits `position: sticky; top: 0` OR exits via `useTransform` — see scroll section

### `components/homepage/ModelStage.tsx`
- Acts as the scroll-pinned container for the 3D viewer
- Uses `useScroll` with `offset` to track its own scroll phase
- Translates scroll progress into:
  - Entry: model scales in / fades in
  - Mid: model rotates (drives `autoRotateSpeed` or external rotation prop)
  - Exit: model translates off-screen (e.g., `x: 400 + "vw"` or spins out)
- Contains `<ModelViewerPlaceholder />` (swapped for real component in Phase 3)
- Exposes a `scrollPhase` value for accessibility / reduced-motion

### `components/homepage/ModelViewerPlaceholder.tsx`
- Simple styled placeholder div until the real `ModelViewer` is pasted in
- Same API surface as the real component (same props interface)
- Shows a subtle wireframe border and "3D Viewer" label

### `components/homepage/IdentitySection.tsx`
- Three items: `builder`, `technologist`, `founder`
- Each item is a `motion.div` with staggered `whileInView` fade + translate-up
- Large, spaced, restrained — not a list, more like typographic statements
- Viewport trigger: `once: true`, `amount: 0.3`

### `components/homepage/MenuButton.tsx`
- `position: fixed; top: 1.5rem; right: 1.5rem; z-index: 50`
- Two or three short lines (hamburger abstraction) or just text "MENU"
- Triggers a drawer/overlay — wired up in Phase 4
- For Phase 1: renders the element, no interaction yet

### `hooks/useReducedMotion.ts`
- Wraps Framer's `useReducedMotion()` hook
- Exported for use in every animated component
- When `true`: skip scroll-driven transforms, use simple fade-in instead

---

## 5. Scroll Choreography / Animation Sequencing

The page has **three distinct scroll phases**. All driven by `useScroll` from Framer Motion.

```
┌──────────────────────────────────────────────────────────┐
│  PHASE 0 — Initial viewport (0–15% scroll)               │
│  • "Diego Aguirre" fully visible, centered               │
│  • 3D model partially visible below fold                 │
│  • Menu button visible                                   │
├──────────────────────────────────────────────────────────┤
│  PHASE 1 — Hero exit (15–35% scroll)                     │
│  • "Diego Aguirre" fades out + translates up             │
│  • 3D model rises into viewport / scales slightly up     │
│  • Model begins slow rotation                            │
├──────────────────────────────────────────────────────────┤
│  PHASE 2 — 3D focal point (35–65% scroll)                │
│  • 3D model is the sole subject, centered                │
│  • Rotation accelerates with scroll velocity             │
│  • Black surround, no other UI                           │
├──────────────────────────────────────────────────────────┤
│  PHASE 3 — 3D exit (65–80% scroll)                       │
│  • Model spins and translates off-screen (right or down) │
│  • Opacity fades to 0                                    │
├──────────────────────────────────────────────────────────┤
│  PHASE 4 — Identity section (80–100% scroll)             │
│  • "builder" / "technologist" / "founder" stagger in     │
│  • Cinematic, large, spaced typography                   │
│  • Page ends here (for now)                              │
└──────────────────────────────────────────────────────────┘
```

### Implementation approach

Use **one page-level `useScroll`** to get `scrollYProgress` (0→1 across total page height).

Then use `useTransform(scrollYProgress, [from, to], [startVal, endVal])` for each property:

```ts
// Hero exit
const heroOpacity = useTransform(scrollYProgress, [0.1, 0.3], [1, 0]);
const heroY = useTransform(scrollYProgress, [0.1, 0.3], ['0%', '-20%']);

// Model rise + spin
const modelY = useTransform(scrollYProgress, [0.2, 0.45], ['30%', '0%']);
const modelRotation = useTransform(scrollYProgress, [0.3, 0.7], [0, 720]); // 2 full turns

// Model exit
const modelExitX = useTransform(scrollYProgress, [0.65, 0.8], ['0%', '120%']);
const modelExitOpacity = useTransform(scrollYProgress, [0.65, 0.8], [1, 0]);

// Identity stagger — handled via whileInView instead of scrollYProgress
```

### Page height
Set the total page height explicitly to give the scroll sequence room:
```tsx
// In page.tsx — a tall scroll container
<div style={{ height: '400vh' }}>
  <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
    {/* sticky scroll stage */}
  </div>
</div>
```

This is the **sticky scroll theater** pattern — the content is sticky, the scroll distance is the "timeline."

---

## 6. File-by-File Implementation Plan

### `package.json` (bootstrap)
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```
Then add:
```bash
npm install framer-motion three @react-three/fiber @react-three/drei @types/three
```

### `app/globals.css`
```css
@import "tailwindcss";

:root {
  --font-sans: /* next/font var */;
}

html {
  scroll-behavior: smooth;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### `app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diego Aguirre',
  description: 'Builder. Technologist. Founder.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-black text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
```

### `app/page.tsx`
```tsx
'use client';
import { useScroll } from 'framer-motion';
import { useRef } from 'react';
import MenuButton from '@/components/homepage/MenuButton';
import HeroSection from '@/components/homepage/HeroSection';
import ModelStage from '@/components/homepage/ModelStage';
import IdentitySection from '@/components/homepage/IdentitySection';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  return (
    <main ref={containerRef} className="relative bg-black">
      <MenuButton />
      {/* Tall scroll container — 400vh gives the animation its timeline */}
      <div className="relative" style={{ height: '400vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <HeroSection scrollYProgress={scrollYProgress} />
          <ModelStage scrollYProgress={scrollYProgress} />
        </div>
      </div>
      <IdentitySection />
    </main>
  );
}
```

### `components/homepage/HeroSection.tsx`
```tsx
'use client';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function HeroSection({ scrollYProgress }: Props) {
  const reduced = useReducedMotion();
  const opacity = useTransform(scrollYProgress, [0.1, 0.3], [1, 0]);
  const y = useTransform(scrollYProgress, [0.1, 0.3], ['0%', '-15%']);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      style={reduced ? {} : { opacity, y }}
    >
      <h1 className="text-[clamp(3rem,10vw,9rem)] font-bold tracking-[-0.02em] text-white select-none">
        Diego Aguirre
      </h1>
    </motion.div>
  );
}
```

### `components/homepage/ModelStage.tsx`
```tsx
'use client';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import ModelViewerPlaceholder from './ModelViewerPlaceholder';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function ModelStage({ scrollYProgress }: Props) {
  const reduced = useReducedMotion();
  const opacity = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.82], [0.3, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.15, 0.4], ['25%', '0%']);
  const scale = useTransform(scrollYProgress, [0.15, 0.4], [0.85, 1]);
  const exitX = useTransform(scrollYProgress, [0.65, 0.82], ['0%', '110%']);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-0"
      style={reduced ? {} : { opacity, y, scale, x: exitX }}
    >
      <ModelViewerPlaceholder />
    </motion.div>
  );
}
```

### `components/homepage/ModelViewerPlaceholder.tsx`
```tsx
// =====================================================================
// 3D VIEWER COMPONENT PLACEHOLDER
// Replace this component's internals with the real ModelViewer
// when you're ready to integrate. Keep the file, swap the contents.
// =====================================================================

export default function ModelViewerPlaceholder() {
  return (
    <div
      className="w-[min(80vw,600px)] aspect-square border border-white/10 rounded-lg
                 flex items-center justify-center text-white/20 text-sm tracking-widest
                 uppercase select-none"
    >
      3D viewer
    </div>
  );
}
```

### `components/homepage/IdentitySection.tsx`
```tsx
'use client';
import { motion } from 'framer-motion';

const items = ['builder', 'technologist', 'founder'];

export default function IdentitySection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-8 px-8">
      {items.map((item, i) => (
        <motion.p
          key={item}
          className="text-[clamp(2.5rem,7vw,7rem)] font-light tracking-widest text-white/90 uppercase"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: i * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, amount: 0.4 }}
        >
          {item}
        </motion.p>
      ))}
    </section>
  );
}
```

### `components/homepage/MenuButton.tsx`
```tsx
'use client';

export default function MenuButton() {
  return (
    <button
      aria-label="Open menu"
      className="fixed top-6 right-6 z-50 flex flex-col gap-[5px] group"
    >
      <span className="w-6 h-px bg-white transition-all group-hover:w-8" />
      <span className="w-4 h-px bg-white transition-all group-hover:w-8" />
    </button>
  );
}
```

### `hooks/useReducedMotion.ts`
```ts
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
```

---

## 7. Styling System

| Decision | Choice |
|---|---|
| Color palette | Black (`#000`) background, white text, `white/10`–`white/90` for hierarchy |
| Type scale | `clamp()` fluid type — no breakpoint-dependent font sizes |
| Font | Geist Sans (variable weight, ships with Next.js 15) |
| Weight hierarchy | `font-bold` for hero name, `font-light` for identity items |
| Spacing | Tailwind's `gap-*` and `px-*`, generous `tracking-widest` for the identity section |
| No gradients | Restraint — solid black only until intentional accent color is decided |

---

## 8. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile (`< 640px`) | Hero text scales down via `clamp`; model viewer fills `min(80vw, 600px)`; scroll sequence identical but durations adjusted |
| Tablet (`640–1024px`) | Layout identical to mobile — single-column scroll theater works naturally |
| Desktop (`> 1024px`) | Full experience; model viewer can be larger (`min(60vw, 800px)`) |
| Touch devices | ModelViewer already handles touch vs. mouse internally; no parallax on touch |

Tailwind responsive utilities are sufficient — no media query logic needed in JS.

---

## 9. Performance Considerations

- **Next.js dynamic import** the ModelStage/ModelViewer with `{ ssr: false }` — Three.js does not run server-side and including it in the SSR bundle will error
  ```tsx
  const ModelStage = dynamic(() => import('@/components/homepage/ModelStage'), { ssr: false });
  ```
- **Framer Motion tree-shaking** — import only what you use (`motion`, `useScroll`, `useTransform`) to keep bundle lean
- **`frameloop="demand"`** — ModelViewer already uses this; it means Three.js only renders when something changes, not on every requestAnimationFrame tick
- **OBJ file size** — `mclaren_mp45.obj` is 24.5 MB. Strongly recommend converting to `.glb` (typically 3–5x smaller). Provide a loading state (the ModelViewer has a `Loader` component built in)
- **Largest Contentful Paint** — hero text is pure DOM, renders instantly; 3D canvas loads below the fold
- **Fonts** — use `display: swap` via `next/font` to avoid FOIT
- **No layout shift** — give the model stage a fixed `aspect-square` CSS so the page doesn't reflow when the canvas loads

---

## 10. Accessibility and Reduced-Motion Considerations

- All animated components check `useReducedMotion()` — when true, motion transforms are bypassed and elements are visible by default
- `<MenuButton>` has `aria-label="Open menu"`
- Hero `<h1>` is real semantic HTML — readable by screen readers regardless of animation state
- Identity section items should be wrapped in a semantic `<ul>/<li>` or `<section>` — the current plan uses `<p>` tags for typographic sizing but can be adjusted
- Canvas (`<ModelViewer>`) is decorative — add `aria-hidden="true"` to its wrapper so screen readers skip it
- Tab order: MenuButton is `fixed` and will be the first focusable element in DOM order — correct
- `prefers-color-scheme`: the site is intentionally dark-only; no need for a light mode at this stage

---

## 11. Risks, Unknowns, and Assumptions

| Item | Risk | Mitigation |
|---|---|---|
| OBJ file size (24.5 MB) | Slow load, bad UX | Convert to `.glb` before Phase 3; or lazy-load with progress indicator |
| `useScroll` on `window` vs container | Scroll binding may need tuning once real content height is known | Prototype early, adjust `offset` array values |
| Scroll sequence feel on mobile | Sticky scroll theaters can feel janky on iOS | Test early; may need `overscroll-behavior: none` or alternate approach |
| Framer Motion + SSR | Motion components must be `'use client'` | All animated components already marked as such in plan |
| `OBJLoader` materials | `.obj` file may reference `.mtl` file not present | Check if `mclaren_mp45.mtl` exists; if not, model will render without material colors |
| Three.js version compatibility | R3F requires specific Three.js peer version | Pin `three@^0.169` (current R3F-compatible range) |

---

## 12. Future 3D Integration

### Placeholder location
`components/homepage/ModelViewerPlaceholder.tsx` is the **exact file to replace** when you're ready. Swap its internals — keep the filename and export name so all imports continue to work.

### Dependencies already required
When pasting in the real ModelViewer, ensure these are installed:
```
three @react-three/fiber @react-three/drei
```
(These should already be present from Phase 3 setup.)

### Connecting scroll-driven rotation
The `ModelStage.tsx` wraps the viewer in a `motion.div`. The scroll-driven rotation for the exit sequence is applied at the wrapper level via CSS `transform`. If you want scroll to directly control the model's internal `rotation.y`, you'll need to:
1. Pass a `scrollYProgress` MotionValue as a prop to `ModelViewer`
2. Inside `ModelInner.useFrame`, read that value and apply it to `outer.current.rotation.y`

For Phase 3, the wrapper-level CSS rotation is sufficient and keeps the ModelViewer component self-contained.

### OBJ file serving
Move `mclaren_mp45.obj` to `public/models/mclaren_mp45.obj`. Then reference it as:
```tsx
<ModelViewer
  url="/models/mclaren_mp45.obj"
  ...
/>
```

---

### 3D Viewer Component Reference

================ 3D VIEWER COMPONENT PLACEHOLDER START ================
The component:
Usage: "import ModelViewer from './ModelViewer';

<ModelViewer
  url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb"
  width={400}
  height={400}
  modelXOffset={0.5}
  modelYOffset={0}
  enableMouseParallax
  enableHoverRotation
  environmentPreset="forest"
  fadeIn={false}
  autoRotate={false}
  autoRotateSpeed={0.35}
  showScreenshotButton
/>".
code: "/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unknown-property */
import { Suspense, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree, invalidate } from '@react-three/fiber';
import { OrbitControls, useGLTF, useFBX, useProgress, Html, Environment, ContactShadows } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
const deg2rad = d => (d * Math.PI) / 180;
const DECIDE = 8;
const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAG = 0.05;
const PARALLAX_EASE = 0.12;
const HOVER_MAG = deg2rad(6);
const HOVER_EASE = 0.15;

const Loader = ({ placeholderSrc }) => {
  const { progress, active } = useProgress();
  if (!active && placeholderSrc) return null;
  return (
    <Html center>
      {placeholderSrc ? (
        <img src={placeholderSrc} width={128} height={128} style={{ filter: 'blur(8px)', borderRadius: 8 }} />
      ) : (
        `${Math.round(progress)} %`
      )}
    </Html>
  );
};

const DesktopControls = ({ pivot, min, max, zoomEnabled }) => {
  const ref = useRef(null);
  useFrame(() => ref.current?.target.copy(pivot));
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableRotate={false}
      enableZoom={zoomEnabled}
      minDistance={min}
      maxDistance={max}
    />
  );
};

const ModelInner = ({
  url,
  xOff,
  yOff,
  pivot,
  initYaw,
  initPitch,
  minZoom,
  maxZoom,
  enableMouseParallax,
  enableManualRotation,
  enableHoverRotation,
  enableManualZoom,
  autoFrame,
  fadeIn,
  autoRotate,
  autoRotateSpeed,
  onLoaded
}) => {
  const outer = useRef(null);
  const inner = useRef(null);
  const { camera, gl } = useThree();

  const vel = useRef({ x: 0, y: 0 });
  const tPar = useRef({ x: 0, y: 0 });
  const cPar = useRef({ x: 0, y: 0 });
  const tHov = useRef({ x: 0, y: 0 });
  const cHov = useRef({ x: 0, y: 0 });

  const ext = useMemo(() => url.split('.').pop().toLowerCase(), [url]);
  const content = useMemo(() => {
    if (ext === 'glb' || ext === 'gltf') return useGLTF(url).scene.clone();
    if (ext === 'fbx') return useFBX(url).clone();
    if (ext === 'obj') return useLoader(OBJLoader, url).clone();
    console.error('Unsupported format:', ext);
    return null;
  }, [url, ext]);

  const pivotW = useRef(new THREE.Vector3());
  useLayoutEffect(() => {
    if (!content) return;
    const g = inner.current;
    g.updateWorldMatrix(true, true);

    const sphere = new THREE.Box3().setFromObject(g).getBoundingSphere(new THREE.Sphere());
    const s = 1 / (sphere.radius * 2);
    g.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    g.scale.setScalar(s);

    g.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (fadeIn) {
          o.material.transparent = true;
          o.material.opacity = 0;
        }
      }
    });

    g.getWorldPosition(pivotW.current);
    pivot.copy(pivotW.current);
    outer.current.rotation.set(initPitch, initYaw, 0);

    if (autoFrame && camera.isPerspectiveCamera) {
      const persp = camera;
      const fitR = sphere.radius * s;
      const d = (fitR * 1.2) / Math.sin((persp.fov * Math.PI) / 180 / 2);
      persp.position.set(pivotW.current.x, pivotW.current.y, pivotW.current.z + d);
      persp.near = d / 10;
      persp.far = d * 10;
      persp.updateProjectionMatrix();
    }

    if (fadeIn) {
      let t = 0;
      const id = setInterval(() => {
        t += 0.05;
        const v = Math.min(t, 1);
        g.traverse(o => {
          if (o.isMesh) o.material.opacity = v;
        });
        invalidate();
        if (v === 1) {
          clearInterval(id);
          onLoaded?.();
        }
      }, 16);
      return () => clearInterval(id);
    } else onLoaded?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    if (!enableManualRotation || isTouch) return;
    const el = gl.domElement;
    let drag = false;
    let lx = 0,
      ly = 0;
    const down = e => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      window.addEventListener('pointerup', up);
    };
    const move = e => {
      if (!drag) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      outer.current.rotation.y += dx * ROTATE_SPEED;
      outer.current.rotation.x += dy * ROTATE_SPEED;
      vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
      invalidate();
    };
    const up = () => (drag = false);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [gl, enableManualRotation]);

  useEffect(() => {
    if (!isTouch) return;
    const el = gl.domElement;
    const pts = new Map();

    let mode = 'idle';
    let sx = 0,
      sy = 0,
      lx = 0,
      ly = 0,
      startDist = 0,
      startZ = 0;

    const down = e => {
      if (e.pointerType !== 'touch') return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        mode = 'decide';
        sx = lx = e.clientX;
        sy = ly = e.clientY;
      } else if (pts.size === 2 && enableManualZoom) {
        mode = 'pinch';
        const [p1, p2] = [...pts.values()];
        startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        startZ = camera.position.z;
        e.preventDefault();
      }
      invalidate();
    };

    const move = e => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;

      if (mode === 'decide') {
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) > DECIDE || Math.abs(dy) > DECIDE) {
          if (enableManualRotation && Math.abs(dx) > Math.abs(dy)) {
            mode = 'rotate';
            el.setPointerCapture(e.pointerId);
          } else {
            mode = 'idle';
            pts.clear();
          }
        }
      }

      if (mode === 'rotate') {
        e.preventDefault();
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        lx = e.clientX;
        ly = e.clientY;
        outer.current.rotation.y += dx * ROTATE_SPEED;
        outer.current.rotation.x += dy * ROTATE_SPEED;
        vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
        invalidate();
      } else if (mode === 'pinch' && pts.size === 2) {
        e.preventDefault();
        const [p1, p2] = [...pts.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const ratio = startDist / d;
        camera.position.z = THREE.MathUtils.clamp(startZ * ratio, minZoom, maxZoom);
        invalidate();
      }
    };

    const up = e => {
      pts.delete(e.pointerId);
      if (mode === 'rotate' && pts.size === 0) mode = 'idle';
      if (mode === 'pinch' && pts.size < 2) mode = 'idle';
    };

    el.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, enableManualRotation, enableManualZoom, minZoom, maxZoom]);

  useEffect(() => {
    if (isTouch) return;
    const mm = e => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (enableMouseParallax) tPar.current = { x: -nx * PARALLAX_MAG, y: -ny * PARALLAX_MAG };
      if (enableHoverRotation) tHov.current = { x: ny * HOVER_MAG, y: nx * HOVER_MAG };
      invalidate();
    };
    window.addEventListener('pointermove', mm);
    return () => window.removeEventListener('pointermove', mm);
  }, [enableMouseParallax, enableHoverRotation]);

  useFrame((_, dt) => {
    let need = false;
    cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE;
    cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
    const phx = cHov.current.x,
      phy = cHov.current.y;
    cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE;
    cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;

    const ndc = pivotW.current.clone().project(camera);
    ndc.x += xOff + cPar.current.x;
    ndc.y += yOff + cPar.current.y;
    outer.current.position.copy(ndc.unproject(camera));

    outer.current.rotation.x += cHov.current.x - phx;
    outer.current.rotation.y += cHov.current.y - phy;

    if (autoRotate) {
      outer.current.rotation.y += autoRotateSpeed * dt;
      need = true;
    }

    outer.current.rotation.y += vel.current.x;
    outer.current.rotation.x += vel.current.y;
    vel.current.x *= INERTIA;
    vel.current.y *= INERTIA;
    if (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4) need = true;

    if (
      Math.abs(cPar.current.x - tPar.current.x) > 1e-4 ||
      Math.abs(cPar.current.y - tPar.current.y) > 1e-4 ||
      Math.abs(cHov.current.x - tHov.current.x) > 1e-4 ||
      Math.abs(cHov.current.y - tHov.current.y) > 1e-4
    )
      need = true;

    if (need) invalidate();
  });

  if (!content) return null;
  return (
    <group ref={outer}>
      <group ref={inner}>
        <primitive object={content} />
      </group>
    </group>
  );
};

const ModelViewer = ({
  url,
  width = 400,
  height = 400,
  modelXOffset = 0,
  modelYOffset = 0,
  defaultRotationX = -50,
  defaultRotationY = 20,
  defaultZoom = 0.5,
  minZoomDistance = 0.5,
  maxZoomDistance = 10,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  enableManualZoom = true,
  ambientIntensity = 0.3,
  keyLightIntensity = 1,
  fillLightIntensity = 0.5,
  rimLightIntensity = 0.8,
  environmentPreset = 'forest',
  autoFrame = false,
  placeholderSrc,
  showScreenshotButton = true,
  fadeIn = false,
  autoRotate = false,
  autoRotateSpeed = 0.35,
  onModelLoaded
}) => {
  useEffect(() => void useGLTF.preload(url), [url]);
  const pivot = useRef(new THREE.Vector3()).current;
  const contactRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  const initYaw = deg2rad(defaultRotationX);
  const initPitch = deg2rad(defaultRotationY);
  const camZ = Math.min(Math.max(defaultZoom, minZoomDistance), maxZoomDistance);

  const capture = () => {
    const g = rendererRef.current,
      s = sceneRef.current,
      c = cameraRef.current;
    if (!g || !s || !c) return;
    g.shadowMap.enabled = false;
    const tmp = [];
    s.traverse(o => {
      if (o.isLight && 'castShadow' in o) {
        tmp.push({ l: o, cast: o.castShadow });
        o.castShadow = false;
      }
    });
    if (contactRef.current) contactRef.current.visible = false;
    g.render(s, c);
    const urlPNG = g.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'model.png';
    a.href = urlPNG;
    a.click();
    g.shadowMap.enabled = true;
    tmp.forEach(({ l, cast }) => (l.castShadow = cast));
    if (contactRef.current) contactRef.current.visible = true;
    invalidate();
  };

  return (
    <div
      style={{
        width,
        height,
        touchAction: 'pan-y pinch-zoom',
        position: 'relative'
      }}
    >
      {showScreenshotButton && (
        <button
          onClick={capture}
          style={{
            position: 'absolute',
            border: '1px solid #fff',
            right: 16,
            top: 16,
            zIndex: 10,
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: 10
          }}
        >
          Take Screenshot
        </button>
      )}

      <Canvas
        shadows
        frameloop='demand'
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl, scene, camera }) => {
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        camera={{ fov: 50, position: [0, 0, camZ], near: 0.01, far: 100 }}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        {environmentPreset !== 'none' && <Environment preset={environmentPreset} background={false} />}

        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5, 5, 5]} intensity={keyLightIntensity} castShadow />
        <directionalLight position={[-5, 2, 5]} intensity={fillLightIntensity} />
        <directionalLight position={[0, 4, -5]} intensity={rimLightIntensity} />

        <ContactShadows ref={contactRef} position={[0, -0.5, 0]} opacity={0.35} scale={10} blur={2} />

        <Suspense fallback={<Loader placeholderSrc={placeholderSrc} />}>
          <ModelInner
            url={url}
            xOff={modelXOffset}
            yOff={modelYOffset}
            pivot={pivot}
            initYaw={initYaw}
            initPitch={initPitch}
            minZoom={minZoomDistance}
            maxZoom={maxZoomDistance}
            enableMouseParallax={enableMouseParallax}
            enableManualRotation={enableManualRotation}
            enableHoverRotation={enableHoverRotation}
            enableManualZoom={enableManualZoom}
            autoFrame={autoFrame}
            fadeIn={fadeIn}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            onLoaded={onModelLoaded}
          />
        </Suspense>

        {!isTouch && (
          <DesktopControls pivot={pivot} min={minZoomDistance} max={maxZoomDistance} zoomEnabled={enableManualZoom} />
        )}
      </Canvas>
    </div>
  );
};

export default ModelViewer;
". 
The model:
Stored in repo at "/Users/diego/DeegzDev-Alpha/mclaren_mp45.obj"
================= 3D VIEWER COMPONENT PLACEHOLDER END =================

---

## 13. Phased Build Plan

### Phase 1 — Static Layout and Structure
**Goal:** Get the page rendering with correct layout, fonts, colors, and all components in place — no motion yet.

Tasks:
- [ ] Bootstrap Next.js 15 with TypeScript and Tailwind
  ```bash
  npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
  ```
- [ ] Install motion and 3D dependencies
  ```bash
  npm install framer-motion three @react-three/fiber @react-three/drei @types/three
  ```
- [ ] Set up `app/layout.tsx` with black background and Geist font
- [ ] Create `app/page.tsx` scaffold (no scroll logic yet)
- [ ] Create `HeroSection` — static "Diego Aguirre" centered, full viewport
- [ ] Create `ModelViewerPlaceholder` — bordered box, correct dimensions
- [ ] Create `IdentitySection` — three items visible, no animation
- [ ] Create `MenuButton` — fixed position, no click handler
- [ ] Create `hooks/useReducedMotion.ts`
- [ ] Move `mclaren_mp45.obj` → `public/models/`
- [ ] Verify build passes, page renders on localhost

**Deliverable:** Static page, black bg, correct typography, all sections visible

---

### Phase 2 — Motion and Scroll Choreography
**Goal:** Wire up the full scroll sequence using Framer Motion. No 3D yet — placeholder is the stand-in.

Tasks:
- [ ] Add `useScroll` to `page.tsx`, pass `scrollYProgress` down
- [ ] Implement hero fade/exit in `HeroSection` via `useTransform`
- [ ] Implement sticky scroll container (`400vh` tall, `sticky top-0`)
- [ ] Implement model stage entry, hold, and exit in `ModelStage`
- [ ] Implement identity section stagger with `whileInView`
- [ ] Wire up `useReducedMotion` in all animated components
- [ ] Tune timing values — the breakpoints `[0.1, 0.3, 0.65, 0.82]` are starting estimates
- [ ] Test on mobile — verify sticky scroll feels correct on iOS Safari
- [ ] Verify reduced-motion behavior (test with OS setting)

**Deliverable:** Full scroll sequence working with placeholder cube

---

### Phase 3 — 3D Viewer Integration
**Goal:** Replace placeholder with real `ModelViewer`, load the McLaren OBJ, connect to scroll.

Tasks:
- [ ] Create `components/homepage/ModelViewer.tsx` — paste in the component code
- [ ] Wrap `ModelStage` import with `dynamic(() => import(...), { ssr: false })`
- [ ] Replace `<ModelViewerPlaceholder />` with `<ModelViewer url="/models/mclaren_mp45.obj" ... />`
- [ ] Tune props: `width`, `height`, `defaultZoom`, `autoRotate`, `environmentPreset`
- [ ] Consider converting OBJ to GLB for file size (optional but recommended)
- [ ] Verify loading state works (progress indicator during 24.5 MB load)
- [ ] Connect scroll-driven rotation if desired (via wrapper transform or ModelViewer prop extension)
- [ ] Verify `aria-hidden="true"` on canvas wrapper

**Deliverable:** Real 3D model in the scroll sequence

---

### Phase 4 — Polish, Responsiveness, and Menu Expansion
**Goal:** Production-ready finish. Every edge case handled.

Tasks:
- [ ] Build out menu overlay (slide-in drawer or full-screen takeover)
- [ ] Define menu content (navigation links, contact, etc.)
- [ ] Animate menu open/close (Framer `AnimatePresence`)
- [ ] Audit all breakpoints on real devices (iPhone SE → wide desktop)
- [ ] Tune fluid type sizes via `clamp()`
- [ ] Add subtle grain texture or vignette if desired (CSS only — `::after` pseudo-element)
- [ ] Performance audit: Lighthouse, bundle size, LCP
- [ ] Add `<meta og:image>` and social preview
- [ ] Add favicon
- [ ] Final reduced-motion audit
- [ ] Deploy preview (Vercel recommended for Next.js)

**Deliverable:** Production-ready personal homepage

---

## Quick-Start Commands

```bash
# 1. Initialize project
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# 2. Install additional dependencies
npm install framer-motion three @react-three/fiber @react-three/drei @types/three

# 3. Move model to public directory
mkdir -p public/models && mv mclaren_mp45.obj public/models/

# 4. Start dev server
npm run dev
```

---

*Plan authored: 2026-04-02*
*Stack: Next.js 15 · TypeScript · Tailwind CSS v4 · Framer Motion · React Three Fiber*
