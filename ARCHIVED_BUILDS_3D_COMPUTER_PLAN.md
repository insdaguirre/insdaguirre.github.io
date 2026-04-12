# Archived Builds: 3D Computer Interaction — Implementation Plan

> Execution-ready plan for replacing the `/builds` page Archived Builds section with a 3D Commodore 64 computer model that animates into a fullscreen browseable archive.

---

## Table of Contents

1. [Current-State Audit](#1-current-state-audit)
2. [Recommended Architecture](#2-recommended-architecture)
3. [Interaction Design Plan](#3-interaction-design-plan)
4. [Technical Implementation Plan](#4-technical-implementation-plan)
5. [Risk Analysis](#5-risk-analysis)
6. [Regression-Prevention Strategy](#6-regression-prevention-strategy)
7. [Codex-Ready Execution Checklist](#7-codex-ready-execution-checklist)

---

## 1. Current-State Audit

### 1.1 Route and Page Assembly

**File:** `app/builds/page.tsx`
- Next.js 15 App Router, **static export** (`output: "export"` in `next.config.ts`)
- Server component; no client-side data fetching
- Render tree:
  ```
  RevealFooterLayout          (shared/RevealFooterLayout.tsx)
  ├── MenuButton              (homepage/MenuButton.tsx)
  ├── BuildsHero              (builds/BuildsHero.tsx)
  └── <div.relative>
      ├── AmbientGridBackground (shared/AmbientGridBackground.tsx)
      └── <div.relative.z-10>
          ├── BuildsShowcase  (builds/BuildsShowcase.tsx)
          └── PastProjectsPanel (builds/PastProjectsPanel.tsx)   ← TARGET
  ```

### 1.2 Archived Builds — Current Implementation

**`components/builds/PastProjectsPanel.tsx`** (55 lines)
- Pure presentational wrapper; renders section copy and a fixed-height container
- Container height: `h-[32rem] sm:h-[40rem] lg:h-[46rem]`
- Passes `pastProjects` data array and layout props to `ArchiveDomeGallery`

**`components/builds/ArchiveDomeGallery.tsx`** (971 lines) — the real implementation
- `"use client"` — fully client-side
- No external drag library; uses Pointer Events API natively
- Key internal state:
  - `openedTile: OpenedTileState | null` — only piece of React state; drives modal open/close
  - All drag/rotation/inertia state held in refs to prevent re-renders
- **Drag system:**
  - `rotationRef` — live rotation `{x, y}` in degrees
  - `startRotationRef` — snapshot at drag start
  - `dragStartRef` — pointer position at drag start
  - `velocityRef` — sampled velocity for inertia
  - `activePointerIdRef`, `draggingRef`, `movedRef` — pointer tracking guards
  - `inertiaFrameRef` — `requestAnimationFrame` handle
  - `startInertia()` / `stopInertia()` — custom physics loop with configurable `dragDampening` and `friction`
  - `applyTransform()` — directly mutates `sphereRef.current.style.transform` (no React re-render)
- **3D sphere:** Pure CSS 3D via `transform-style: preserve-3d`, `perspective`, `rotateX/Y`, `translateZ`. Not WebGL.
- **Tile expand:** `openTile()` calculates `originRect` from clicked button and `targetRect` (centered, aspect-ratio-corrected). Uses CSS `transition` on `left/top/width/height` to animate card from tile position to centered focus view.
- **Focus card:** `role="dialog"`, `aria-modal="true"`, scrim backdrop, ESC key handler, focus management
- **Layout:** `ResizeObserver` on root recalculates `--radius`, `--viewer-pad`, and `targetRect` on resize

**`components/builds/ArchiveDomeGallery.module.css`**
- CSS custom properties: `--radius`, `--circ`, `--rot-x`, `--rot-y`, `--segments-x`, `--segments-y`, `--item-width`, `--item-height`, `--viewer-pad`, `--overlay-blur-color`, `--image-filter`
- Sphere items positioned with `rotateY(calc(var(--rot-y) * var(--offset-x))) rotateX(calc(var(--rot-x) * var(--offset-y))) translateZ(var(--radius))`
- Focus card animated via CSS `transition` on position/size properties

**`components/builds/builds-content.ts`**
- `pastProjects: PastProject[]` — 10 archived projects with image, href, repository, alt, demo URL
- `pastProjectsSectionCopy` — eyebrow, heading, description strings
- Images imported as Next.js `StaticImageData` from `/guis/*.png`

**`components/builds/types.ts`**
- `PastProject` interface — all fields optional except `name`, `href`, `repository`

### 1.3 Existing 3D Model Viewer

**`components/shared/InteractiveCarModel.tsx`** (358 lines)
- `"use client"`
- **Library stack:** Three.js 0.169, React Three Fiber 9.0, `@react-three/drei` 10.0
- **Model loaded via:** `useGLTF(MODEL_URL)` from `@react-three/drei`; preloaded via `useGLTF.preload(MODEL_URL)` at module level
- **Current model:** `/models/uploads_files_6149127_mclaren_mp45_2k.glb`
- **Target model:** `/models/uploads_files_6110435_commodore64.glb` ← **must be placed in `/public/models/`**
- **Canvas setup:** `<Canvas dpr={[1, 1.75]} camera={{ position, fov }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>`
- **Drag interaction:** Arcball rotation using `projectToArcball()` + quaternion math; `setPointerCapture` for smooth tracking
- **Spring physics:** `useFrame` loop with configurable `followStiffness/Damping` (during drag) and `returnStiffness/Damping` (after drag); velocity accumulation with exponential damping
- **Scroll integration:** Accepts `rotationProgress: MotionValue<number>` for scroll-driven base rotation
- **Subcomponents:** `ModelObject` (GLTF scene + shadow config + spring animation), `SafeModelObject` (error boundary wrapper), `LoadingState`, `ErrorState` (both use `<Html>` from drei)
- **Props API:** `boundsMargin`, `cameraFov`, `cameraPosition`, `followDamping/Stiffness`, `modelTilt`, `returnDamping/Stiffness`, `rotationAmplitude`, `rotationProgress`

**Usage sites:**
- `components/shared/FooterCarStage.tsx` — footer reveal; passes `spinProgress` (a `useTransform`-derived `MotionValue`) as `rotationProgress`
- `components/homepage/ModelViewerPlaceholder.tsx` (implied by agent report) — hero section

### 1.4 Animation Libraries in Use

| Library | Version | Primary Use |
|---|---|---|
| Framer Motion | 12.0 | `useScroll`, `useTransform`, `useMotionValue`, `motion.*` |
| GSAP + InertiaPlugin | 3.14.2 | Dot grid inertia; **not used in ArchiveDomeGallery** |
| Three.js | 0.169 | 3D rendering |
| React Three Fiber | 9.0 | React abstraction for Three.js |
| `@react-three/drei` | 10.0 | `useGLTF`, `Bounds`, `Center`, `Html`, `Preload` |

**No Lenis / Locomotive / external scroll library.** Native scroll + Framer Motion `useScroll`.

### 1.5 Key Architectural Constraints

- **Static export:** `output: "export"` — no server-side rendering, no API routes. All 3D must be client-only with `"use client"` and `Suspense`.
- **No `next/image` optimization** (`images: { unoptimized: true }`).
- CSS 3D sphere and WebGL Three.js are entirely separate systems — the dome gallery has zero overlap with `InteractiveCarModel`.

---

## 2. Recommended Architecture

### 2.1 Component Strategy

**Do not replace `ArchiveDomeGallery`.**
The dome gallery is the content delivery vehicle. It contains 971 lines of carefully tuned physics, accessibility, and layout logic. It must be preserved and simply rendered inside the new fullscreen overlay.

**Replace `PastProjectsPanel`** with a new orchestrator component.

**Create a new dedicated component** rather than extending `InteractiveCarModel`. Rationale:
- `InteractiveCarModel` is tightly coupled to scroll-progress-driven rotation via `MotionValue`. The new interaction requires click-triggered state transitions and a camera animation that `InteractiveCarModel` has no concept of.
- The new component needs to manage the `open/closed` phase transition, which would pollute `InteractiveCarModel`'s API and create coupling to the builds page.
- Reuse the internal pattern (React Three Fiber Canvas, `useGLTF`, `useFrame` spring loop, arcball pointer events) but implemented in a purpose-built component.

### 2.2 New Component Tree

```
PastProjectsPanel.tsx           ← MODIFIED (becomes orchestrator)
├── ArchivedBuildsEntry.tsx     ← NEW ("use client"; manages phase state)
│   ├── ComputerModelStage.tsx  ← NEW ("use client"; Three.js canvas + hover/click)
│   │   └── ComputerModelObject (inner; useGLTF + useFrame spring)
│   └── ArchivedBuildsOverlay.tsx  ← NEW ("use client"; fullscreen overlay + dome gallery)
│       └── ArchiveDomeGallery  ← UNCHANGED (moved into overlay)
```

### 2.3 Phase State Machine

```
type Phase =
  | "idle"          // 3D model visible, orbiting gently
  | "hover"         // cursor over model, affordance hint visible
  | "activating"    // click triggered; model rotating to screen-facing
  | "expanding"     // model scaling up / overlay fading in
  | "open"          // fullscreen overlay fully visible; dome gallery active
  | "collapsing"    // overlay fading out; model scaling back down
```

State lives in `ArchivedBuildsEntry.tsx` and flows down as props.

### 2.4 Files to Create

| File | Purpose |
|---|---|
| `components/builds/ArchivedBuildsEntry.tsx` | Phase state machine; layout coordinator |
| `components/builds/ComputerModelStage.tsx` | Three.js canvas with Commodore 64 model; idle/hover/activation animations |
| `components/builds/ArchivedBuildsOverlay.tsx` | Fullscreen overlay shell; houses ArchiveDomeGallery |
| `components/builds/ArchivedBuildsEntry.module.css` | Overlay transition styles, hint badge, entrance animation |

### 2.5 Files to Modify

| File | Change |
|---|---|
| `components/builds/PastProjectsPanel.tsx` | Replace `ArchiveDomeGallery` render with `ArchivedBuildsEntry`; keep section copy and wrapper styling |
| `public/models/` | **Add** `uploads_files_6110435_commodore64.glb` |

### 2.6 Files Not to Touch

- `ArchiveDomeGallery.tsx` — zero changes
- `ArchiveDomeGallery.module.css` — zero changes
- `builds-content.ts` — zero changes
- `types.ts` — zero changes
- `InteractiveCarModel.tsx` — zero changes
- `app/builds/page.tsx` — zero changes
- All other shared components

---

## 3. Interaction Design Plan

### 3.1 Stage Dimensions and Layout

`PastProjectsPanel` today renders `ArchiveDomeGallery` inside a fixed-height container (`h-[32rem] sm:h-[40rem] lg:h-[46rem]`). The new entry component replaces that container.

The **model stage** occupies the same footprint: a bounded rectangular container within the `PastProjectsPanel` card, approximately 460px–736px tall. This preserves the page's scroll rhythm — the section occupies the same vertical space in its resting state.

The **fullscreen overlay** covers the entire viewport (`position: fixed; inset: 0; z-index: 50`) and is rendered via a React portal to escape any `overflow: hidden` ancestor.

### 3.2 Idle State

- The Commodore 64 model renders centered in the stage container.
- A **gentle idle animation** plays: slow continuous Y-axis rotation (≈ 0.2 rad/s) driven by `useFrame`; very subtle breathing scale (±1.5%) on a sine wave.
- The stage background matches the current dome gallery container style (dark glass, gradient borders from `PastProjectsPanel`).
- A persistent **hint badge** is visible at the bottom of the stage:
  ```
  [ ↗  Open Archive ]
  ```
  Styled as a small pill, similar to `tileCaptionText` in the dome gallery — monospace, `0.62rem`, `tracking-[0.3em]`, white/40. It pulses with a subtle opacity animation (0.4 → 0.8 → 0.4, 3s ease-in-out loop) to signal interactivity.
- Cursor: `cursor-pointer` on the Canvas wrapper div.
- The model has the arcball drag interaction enabled in idle state so users can inspect it before clicking.

### 3.3 Hover State

- On `pointerenter` of the canvas wrapper (desktop only — guard with `@media (hover: hover)` or a `hasHover` ref):
  - Hint badge transitions from `opacity: 0.5` to `opacity: 1` and shifts up 4px.
  - A faint glow ring appears around the model stage border (`box-shadow` pulse, 300ms ease).
  - Idle rotation slows to ~25% speed to imply "pausing for interaction."
- On `pointerleave`: all effects reverse over 400ms.
- The cursor shows a custom `cursor: none` with a CSS-driven dot cursor is **not** recommended (complexity, regression risk). Use `cursor-pointer` throughout.

### 3.4 Click / Activation Transition

When the user clicks anywhere on the canvas (not during an active drag):

**Phase: `activating`** (~600ms total)

1. **Arcball drag is disabled** immediately (block pointer events to model rotation).
2. The model's **current rotation is animated to a target orientation** where the computer screen faces the viewport — i.e., the model's front face (screen face) is rotated to be parallel to the camera plane. This is a `useFrame`-driven spring animation:
   - Target quaternion: `screen-faces-camera` orientation (determined empirically for this specific GLB; approximately `rotateX(0) rotateY(0)` for a model exported with screen facing +Z). Set `targetFacingQuaternion` once when activation begins.
   - Spring stiffness: 12 (slow, intentional), damping: 8 — produces a deliberate, weighty rotation over ~600ms.
3. During this rotation, **idle breathing stops** and the hint badge fades out (`opacity: 0`, 200ms).
4. The stage div receives `data-activating="true"` which triggers a CSS border-color glow pulse.

**Phase: `expanding`** (~500ms, begins ~400ms into `activating`)

1. The Three.js canvas **scales up** from `scale(1)` to `scale(1.06)` (CSS transform on the wrapper div, Framer Motion `animate`).
2. The **fullscreen overlay mounts** with `opacity: 0` and begins fading to `opacity: 1` over 400ms (Framer Motion `animate`).
3. A `backdrop-filter: blur(0px)` transitions to `blur(0px)` — **do not use backdrop blur on the overlay** (GPU cost, mobile jank). Use a solid dark background with opacity instead: `background: rgba(8, 5, 17, 0.96)` fading in.
4. The model canvas fades out over 200ms as the overlay reaches ~60% opacity — there is no "model flies into screen" literal animation. The effect is: model sits there, you click it, the screen (of the computer) expands and takes over.

**Phase: `open`** — overlay fully visible, dome gallery interactive.

### 3.5 Fullscreen Overlay and Dome Gallery

The overlay (`ArchivedBuildsOverlay.tsx`) is a React portal rendered into `document.body`. Layout:

```
<div role="dialog" aria-modal="true" aria-label="Archived Builds">
  ├── <button> Scrim / close target (position: absolute; inset: 0; z-index: 0)
  └── <div> Content shell (position: relative; z-index: 1; inset: 0; height: 100dvh)
      ├── <header> Top bar
      │   ├── "Archive" eyebrow label (left)
      │   └── <button> "Close" / "×" (right)
      └── <div> Dome gallery container (flex-grow; overflow: hidden)
          └── <ArchiveDomeGallery ... /> (unchanged; receives all existing props)
```

**The `ArchiveDomeGallery` component is rendered with identical props** to the current `PastProjectsPanel` call — same `pastProjects`, same `fit`, `segments`, `dragSensitivity`, etc. The only difference is the container now occupies the full viewport height minus the top bar (~56px).

The top bar height is ~56px. Dome gallery height: `calc(100dvh - 56px)`.

`document.body.style.overflow = "hidden"` is set when overlay is open (same pattern used by `ArchiveDomeGallery`'s own tile-open flow — they will not conflict because the tile's overflow lock fires *after* the overlay is open).

### 3.6 Exiting the Overlay

**Three exit triggers:**
1. Click the `×` close button in the overlay header.
2. Press `Escape` (keyboard listener in `ArchivedBuildsEntry` while `phase === "open"`).
3. Click the scrim area (the area outside the dome gallery content — but since dome gallery fills the overlay, the scrim is only the header area outside the close button; simplify by making only the close button + ESC the exit path).

**Collapse sequence** (`collapsing` phase, ~500ms):

1. If a tile is open inside the dome gallery, close it first (the dome gallery handles this internally when unmounted or when its `data-open` state resets — but since we are not unmounting it, we need to call `requestClose` on it. **Solution:** expose a `forwardRef` `close()` imperative handle on `ArchiveDomeGallery`, or alternatively just immediately transition and let the dome gallery's own tile state reset naturally on the next open. The simpler path: add a prop `forceClose: boolean` to `ArchiveDomeGallery` that triggers `requestClose` when toggled. However — see §5 for risk — do not modify `ArchiveDomeGallery`. **Preferred approach:** The overlay simply unmounts `ArchiveDomeGallery` during collapse, which naturally drops all state. Any open tile is lost. This is acceptable UX; the user is exiting the overlay.)
2. Overlay fades from `opacity: 1` to `opacity: 0` over 400ms.
3. After overlay reaches opacity 0, it unmounts.
4. Phase returns to `idle`. Model canvas fades back in, idle rotation resumes.

### 3.7 Desktop vs Mobile Considerations

**Desktop:**
- Hover state enabled (check `window.matchMedia('(hover: hover)')` in a `useEffect`).
- Hint badge always visible but enhanced on hover.
- Arcball drag with pointer capture; all existing behavior intact.
- Escape key closes overlay.

**Mobile:**
- No hover state.
- Touch tap triggers activation (same click handler; drag threshold prevents accidental activation during orbit).
- Overlay close: only the `×` button (no keyboard).
- Dome gallery in overlay: same touch drag behavior (already designed for touch via Pointer Events).
- `dvh` (dynamic viewport height) used for overlay to account for mobile address bar.
- `touch-action: none` on the model canvas during `activating`/`expanding` phases to prevent scroll conflict.

**Reduced Motion:**
- `prefers-reduced-motion: reduce` detected via `useReducedMotion()` hook (already in codebase at `hooks/useReducedMotion.ts`).
- When reduced motion is active: skip the rotation-to-screen-facing animation; skip scale transitions; overlay fades in immediately (still 200ms crossfade — not instant, to prevent jarring jump).
- Idle rotation disabled (already gated in `InteractiveCarModel` with `reducedMotion ? 0 : spinProgress * amplitude`; apply same pattern).

---

## 4. Technical Implementation Plan

### Phase 0 — Asset Prerequisite

Before any code work begins:
- Place `uploads_files_6110435_commodore64.glb` in `/public/models/`.
- Verify the model loads by temporarily wiring it into `InteractiveCarModel.tsx`'s `MODEL_URL` and viewing the footer stage. Revert after verification.
- **Critically:** Identify the orientation of the Commodore 64 screen in the model's local coordinate space. Open the GLB in a viewer (gltf.pmnd.rs or Three.js editor). Determine the Euler angles needed so the screen face is perpendicular to the +Z camera axis. Record these as constants in `ComputerModelStage.tsx`:
  ```ts
  const SCREEN_FACING_EULER = new THREE.Euler(0, 0, 0); // fill in from inspection
  const IDLE_TILT_EULER = new THREE.Euler(-0.06, -0.4, 0); // 3/4 angle for idle
  ```

### Phase 1 — `ComputerModelStage.tsx`

**File:** `components/builds/ComputerModelStage.tsx`
**Directive:** `"use client"`
**Dependencies:** `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion` (for `useMotionValue` / `useSpring`), `hooks/useReducedMotion`

**Model URL constant:**
```ts
const COMPUTER_MODEL_URL = "/models/uploads_files_6110435_commodore64.glb";
```

**Props interface:**
```ts
interface ComputerModelStageProps {
  phase: Phase;                       // "idle" | "hover" | "activating" | "expanding" | "open" | "collapsing"
  onActivate: () => void;             // called on click (non-drag)
  className?: string;
}
```

**Internal architecture:**

```
ComputerModelStage (wrapper div + pointer handlers)
└── <Canvas>
    └── <Suspense fallback={<LoadingState />}>
        └── ComputerModelObject (useGLTF + useFrame animation)
```

**`ComputerModelObject` animation loop (`useFrame`):**

```
State refs (not React state — all mutations are in useFrame):
- dragRotationRef: THREE.Quaternion   — current arcball drag offset
- dragTargetRef: THREE.Quaternion     — target for spring interpolation during drag
- springVelocityRef: THREE.Vector3    — spring velocity (same pattern as InteractiveCarModel)
- idleTimeRef: number                 — accumulated time for idle oscillation
- isReturningSprungRef: boolean       — true when returning to facing orientation post-activation

Per frame:
1. If phase === "idle" or "hover":
   - Apply idle rotation: idleTimeRef += delta; baseY = idleTimeRef * IDLE_SPIN_SPEED
   - Apply idle breathing: scale = 1 + sin(idleTimeRef * BREATHE_FREQ) * 0.015
   - Apply drag offset on top of idle (spring toward dragTargetRef)
   - groupRef.current.rotation.set(IDLE_TILT + dragSpringX, baseY + dragSpringY, 0)

2. If phase === "activating":
   - Stop idle rotation
   - Spring toward SCREEN_FACING_EULER (stiffness: 12, damping: 8)
   - When close enough (angle < 0.01 rad), call a ref callback to advance phase → "expanding"

3. If phase === "expanding" | "open":
   - Hold at SCREEN_FACING_EULER (no movement)
   - Drag disabled (pointer handlers no-op)

4. If phase === "collapsing":
   - Spring back toward IDLE_TILT_EULER (stiffness: 10, damping: 7)
   - Re-enable drag when phase returns to "idle"
```

**Pointer handlers on wrapper div:**
- Same pattern as `InteractiveCarModel` (arcball via `projectToArcball` + quaternion).
- Activation check: `if (!draggingRef.current && performance.now() - lastDragEndAtRef.current > 200) onActivate()`
- Guard: no-op when `phase` is not `"idle"` or `"hover"`.

**Canvas config:**
```tsx
<Canvas
  dpr={[1, 1.75]}
  camera={{ position: [0, 0.6, 5], fov: 36 }}
  gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
>
```
Camera position and FOV should be tuned to the Commodore 64 model dimensions. Use `<Bounds fit clip observe margin={1.1}>` from drei.

**Lighting:**
- Inherit the same lighting setup as `InteractiveCarModel` (ambient + hemisphere + two directionals + spot). Identical code copy is fine — do not import from `InteractiveCarModel` as that creates coupling.

**Model preload:**
```ts
useGLTF.preload(COMPUTER_MODEL_URL);
```
At module level, outside the component.

**Fallback behavior (GLB fails to load):**
- `Suspense` shows `<LoadingState />` (same `<Html>` pattern as `InteractiveCarModel`).
- Error state wraps in try/catch same as `SafeModelObject` in `InteractiveCarModel` — renders `<ErrorState />`.
- When in error state, `onActivate` still fires and the overlay opens, but the model stage shows the error pill. This ensures the archive content remains accessible even if the GLB is unavailable.

### Phase 2 — `ArchivedBuildsOverlay.tsx`

**File:** `components/builds/ArchivedBuildsOverlay.tsx`
**Directive:** `"use client"`
**Dependencies:** `react` (createPortal), `framer-motion`, `ArchiveDomeGallery`

**Props:**
```ts
interface ArchivedBuildsOverlayProps {
  isVisible: boolean;             // drives fade in/out
  onClose: () => void;
  projects: PastProject[];
  // forward all ArchiveDomeGallery config props:
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  segments?: number;
  dragDampening?: number;
}
```

**Layout:**
```tsx
// Rendered via ReactDOM.createPortal(content, document.body)

<motion.div
  role="dialog"
  aria-modal="true"
  aria-label="Archived Builds"
  initial={{ opacity: 0 }}
  animate={{ opacity: isVisible ? 1 : 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  onAnimationComplete={() => { if (!isVisible) /* signal unmount */ }}
  style={{
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(8, 5, 17, 0.96)",
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* Top bar */}
  <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <p style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
      {projects.length.toString().padStart(2, "0")} archived builds
    </p>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close Archived Builds"
      style={{ /* pill button, same style as focusCloseButton in ArchiveDomeGallery.module.css */ }}
    >
      Close
    </button>
  </div>

  {/* Dome gallery — takes remaining height */}
  <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
    <ArchiveDomeGallery
      projects={projects}
      fit={fit}
      fitBasis={fitBasis}
      minRadius={minRadius}
      maxRadius={maxRadius}
      padFactor={padFactor}
      overlayBlurColor="#080511"
      maxVerticalRotationDeg={maxVerticalRotationDeg}
      dragSensitivity={dragSensitivity}
      segments={segments}
      dragDampening={dragDampening}
    />
  </div>
</motion.div>
```

**Mounting strategy:**
- The overlay is always in the DOM when `ArchivedBuildsEntry` is mounted (the motion component handles opacity).
- Use an internal `isMounted` boolean: `false` until first `isVisible === true` (lazy mount — do not render `ArchiveDomeGallery` until the overlay is first opened, to avoid initializing Three.js-adjacent CSS 3D on page load before the user requests it).
- Once mounted, never unmount until `ArchivedBuildsEntry` itself unmounts.

**Body scroll lock:**
- `useEffect` on `isVisible`: when true, set `document.body.style.overflow = "hidden"`. When false, restore. Use a ref to store the previous value.
- This must be coordinated with `ArchiveDomeGallery`'s own scroll lock (it also sets `document.body.style.overflow = "hidden"` when a tile is open). Because the overlay locks it first, and the dome gallery's lock fires on top (same value), this is benign. On close, the overlay restores the value last, which is also fine.

**ESC key handler:**
- `useEffect` when `isVisible`: add `keydown` listener for `Escape`; call `onClose`.
- Remove listener on cleanup.

**Focus management:**
- On open: after animation completes (or after 300ms timeout), focus the close button.
- On close: after overlay fades out, return focus to the element that triggered opening (the model canvas wrapper). Store trigger ref in `ArchivedBuildsEntry` and pass as a callback.

### Phase 3 — `ArchivedBuildsEntry.tsx`

**File:** `components/builds/ArchivedBuildsEntry.tsx`
**Directive:** `"use client"`

**State:**
```ts
const [phase, setPhase] = useState<Phase>("idle");
const [overlayVisible, setOverlayVisible] = useState(false);
```

**Phase transitions:**
```
handleActivate():
  setPhase("activating")

handleActivationComplete() [called from ComputerModelStage when rotation settles]:
  setPhase("expanding")
  setOverlayVisible(true)
  // After 500ms (animation duration):
  setTimeout(() => setPhase("open"), 500)

handleClose():
  setPhase("collapsing")
  setOverlayVisible(false)
  // After 500ms:
  setTimeout(() => setPhase("idle"), 500)
```

**Layout:**
```tsx
// Replaces the old `h-[32rem] sm:h-[40rem] lg:h-[46rem]` container

<div className="relative h-[32rem] sm:h-[40rem] lg:h-[46rem]">
  {/* Model stage — always rendered */}
  <motion.div
    className="absolute inset-0"
    animate={{
      opacity: phase === "open" ? 0 : 1,
      scale: phase === "activating" || phase === "expanding" ? 1.04 : 1,
    }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    <ComputerModelStage
      phase={phase}
      onActivate={handleActivate}
      onActivationComplete={handleActivationComplete}
    />
    {/* Hint badge */}
    <HintBadge visible={phase === "idle" || phase === "hover"} />
  </motion.div>

  {/* Portal overlay — lazy-mounted after first open */}
  {hasMountedOverlay && (
    <ArchivedBuildsOverlay
      isVisible={overlayVisible}
      onClose={handleClose}
      projects={projects}
      {...galleryProps}
    />
  )}
</div>
```

**`HintBadge` subcomponent** (inline in `ArchivedBuildsEntry.tsx`):
```tsx
// Positioned absolute, bottom-center of the stage
// Text: "Click to explore archive" or "↗ Open Archive"
// Styling: matches existing PastProjectsPanel eyebrow typography
// Animation: pulse opacity 0.44 → 0.88 with 3s ease-in-out infinite (CSS animation)
// Hides via `motion.div` opacity when phase !== "idle"
```

### Phase 4 — `PastProjectsPanel.tsx` — Minor Modification

Replace the inner container and `ArchiveDomeGallery` call with `ArchivedBuildsEntry`:

```tsx
// BEFORE (lines 35–49):
<div className="relative h-[32rem] sm:h-[40rem] lg:h-[46rem]">
  <ArchiveDomeGallery projects={pastProjects} fit={1.2} ... />
</div>

// AFTER:
<ArchivedBuildsEntry
  projects={pastProjects}
  fit={1.2}
  fitBasis="width"
  minRadius={560}
  maxRadius={1240}
  padFactor={0.05}
  maxVerticalRotationDeg={9}
  dragSensitivity={20}
  dragDampening={0.82}
  segments={21}
  overlayBlurColor="#080511"
/>
```

Also update the header bar text from `"Drag to orbit. Click a tile to focus."` to `"Click the computer to explore the archive."` (desktop only hint — matches the new interaction paradigm).

### Phase 5 — `ArchivedBuildsEntry.module.css`

```css
/* Hint badge pulse */
@keyframes hintPulse {
  0%, 100% { opacity: 0.44; }
  50% { opacity: 0.88; }
}

.hintBadge {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  animation: hintPulse 3s ease-in-out infinite;
  /* Same pill styling as PastProjectsPanel eyebrow */
  padding: 0.38rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(5, 6, 10, 0.62);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  white-space: nowrap;
  backdrop-filter: blur(8px);
}

/* Stage border glow on hover */
.stageGlow {
  transition: box-shadow 300ms ease;
}

.stageGlow[data-hovered="true"] {
  box-shadow: 0 0 0 1px rgba(82, 39, 255, 0.3), 0 0 32px rgba(82, 39, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .hintBadge {
    animation: none;
    opacity: 0.66;
  }
}
```

### Phase 6 — Overlay Close Button Styling

The close button in `ArchivedBuildsOverlay.tsx` should match the existing `focusCloseButton` style from `ArchiveDomeGallery.module.css`. Options:
1. Inline the styles as a Tailwind className string.
2. Import the CSS module from `ArchiveDomeGallery.module.css` (not recommended — creates cross-component CSS module dependency).
3. **Recommended:** Use Tailwind utilities to replicate the style:
   ```tsx
   className="rounded-full border border-white/12 bg-black/28 px-[0.82rem] py-[0.52rem] text-[0.58rem] uppercase tracking-[0.24em] text-white/80 transition-colors hover:border-white/22 hover:bg-white/8 hover:text-white/94"
   ```

### State Flow Summary

```
User lands on /builds page
  → ArchivedBuildsEntry mounts
  → phase = "idle"
  → ComputerModelStage renders Three.js canvas; model loads async
  → Gentle idle rotation + breathing begins
  → Hint badge pulses

User orbits model (drag)
  → Arcball drag active; no phase change
  → Release: inertia returns model toward idle rotation

User clicks model
  → handleActivate() called
  → phase = "activating"
  → ComputerModelStage: drag disabled; spring rotation toward screen-facing euler
  → ~600ms later: spring settles; handleActivationComplete() fires
  → phase = "expanding"; overlayVisible = true
  → ArchivedBuildsOverlay fades in (opacity 0 → 1, 400ms)
  → Model canvas fades out (opacity 1 → 0, 400ms)
  → ~500ms later: phase = "open"
  → ArchiveDomeGallery fully interactive

User explores archive, clicks tile
  → ArchiveDomeGallery internal flow: tile opens as focus card dialog
  → Overlay remains visible; background dome blurs

User closes tile
  → ArchiveDomeGallery internal flow: tile closes

User clicks "Close" or presses ESC
  → handleClose() called
  → phase = "collapsing"
  → overlayVisible = false
  → Overlay fades out (400ms)
  → Model canvas fades in (400ms)
  → ~500ms later: phase = "idle"
  → Idle rotation resumes
```

### Performance Considerations

1. **Lazy-mount `ArchiveDomeGallery`:** Only add it to the DOM after the first open. This prevents ResizeObserver, style recalculation, and DOM construction costs from firing on page load.
2. **Model preload:** `useGLTF.preload(COMPUTER_MODEL_URL)` at module level ensures the GLB is fetched when the JS bundle is parsed, not when the Canvas first renders.
3. **Portal isolation:** The overlay is a portal child of `document.body`. Its `position: fixed` prevents layout recalculation inside the builds page scroll container.
4. **dpr capped at 1.75:** Inherit from `InteractiveCarModel`'s setting. Do not exceed 2x on the new canvas.
5. **`will-change: transform`** on the model `<group>` (inherited via Three.js renderer). Do not add `will-change` to the overlay div — it is already `position: fixed`.
6. **No backdrop-filter on the overlay** (as noted in §3.4). The dark solid background achieves the visual without GPU cost.
7. **`contain: layout paint`** on the stage container div to isolate paint regions during animation.

---

## 5. Risk Analysis

### 5.1 Hydration Issues

**Risk:** The Three.js Canvas renders on the client only. If `ComputerModelStage` is included in the initial server render (even as a static export), a hydration mismatch can occur if any server-rendered content differs from the client.

**Mitigation:**
- `ComputerModelStage.tsx` is `"use client"` — in Next.js App Router, client components are not server-rendered in static export mode in a way that causes mismatches for dynamic content.
- Wrap the Canvas in `<Suspense fallback={null}>` at the `ArchivedBuildsEntry` level to ensure any deferred rendering is handled cleanly.
- Do **not** use `useId()` or any SSR-derived identifiers inside `ComputerModelStage`.

### 5.2 Performance Regressions

**Risk:** Adding a Three.js canvas to a page that already has a CSS 3D dome gallery, animated dot grid background, and scroll-driven animations could cause frame drops.

**Mitigation:**
- The model canvas only exists within the `PastProjectsPanel` container (not the full page). The canvas WebGL context is active only in the lower portion of the page.
- The overlay's `ArchiveDomeGallery` instance is lazy-mounted — it only adds the CSS 3D sphere to the DOM on first open.
- Canvas `dpr={[1, 1.75]}` (not `[1, 2]`).
- `powerPreference: "high-performance"` on the WebGL context.
- The `AmbientGridBackground` (dot grid) and the model canvas are never simultaneously in the viewport at the same time during active animation (the dot grid is in the hero/BuildsShowcase area; the model is below).

### 5.3 Mobile Interaction Conflicts

**Risk:** Touch events on the model canvas could conflict with page scroll.

**Mitigation:**
- Canvas wrapper div gets `touch-action: pan-y` in idle state (same as `InteractiveCarModel`'s existing `[touch-action:pan-y]` class).
- During `activating`/`expanding`: set `touch-action: none` to prevent any scroll interference during the transition.
- The Pointer Events API used for arcball drag already handles the touch/horizontal-vs-vertical disambiguation (same logic as `ArchiveDomeGallery`'s `touchPendingRef`).

### 5.4 Scroll-Lock Problems

**Risk:** The overlay sets `overflow: hidden` on `document.body`. On iOS Safari, this can cause the page to jump to the top.

**Mitigation:**
- Store scroll position before locking: `const scrollY = window.scrollY; document.body.style.overflow = "hidden"; document.body.style.top = "-" + scrollY + "px"; document.body.style.position = "fixed";`
- Restore on unlock: `document.body.style.position = ""; document.body.style.top = ""; window.scrollTo(0, scrollY);`
- This is a well-known iOS pattern. Implement it in the `ArchivedBuildsOverlay` `useEffect`.

### 5.5 Z-Index / Overlay Bugs

**Risk:** The overlay at `z-index: 50` may conflict with `MenuButton` (nav) or `RevealFooterLayout`.

**Mitigation:**
- Check `MenuButton` z-index. If it uses a high z-index (e.g., 40), set overlay to 60.
- Since the overlay is a portal attached to `document.body`, it is outside the `RevealFooterLayout` stacking context and will render above all page content by default.
- Set `z-index: 60` on the overlay to be safe and document this value.

### 5.6 Pointer-Event Conflicts

**Risk:** The model canvas uses `setPointerCapture` for arcball drag. If the pointer capture is not released before the overlay opens, the canvas may continue receiving events while the overlay is visible.

**Mitigation:**
- In `handlePointerEnd` / activation handler: always call `releasePointerCapture` before setting `phase = "activating"`. 
- The `onActivate` callback should only be triggered from `handlePointerEnd` (not `handlePointerDown`) to ensure capture is always released first.

### 5.7 GPU Cost

**Risk:** A second WebGL context on the page (the new model canvas) alongside the existing car model in the footer may exceed the browser's WebGL context limit (typically 8–16, but some browsers enforce lower limits).

**Assessment:** The footer car model is only rendered when `RevealFooterLayout`'s footer is revealed (scroll-dependent, below fold). In practice, both WebGL contexts will rarely be active simultaneously. However:
- **Monitor:** Test on iOS Safari (4 WebGL context limit historically). If the Commodore model fails to render, it will gracefully show `<ErrorState />`.
- **Mitigation:** The `"use client"` lazy boundary means the Canvas only initializes when the page reaches the `PastProjectsPanel` section in the viewport. Consider adding an `IntersectionObserver` gate (only mount Canvas when stage is near viewport) if performance issues arise in testing.

### 5.8 Accessibility Concerns

**Risk:** The 3D model is presented as the primary interaction affordance. Users who cannot use a pointer device, or who have JavaScript disabled, will not see the archive content.

**Mitigations:**
- The overlay is a `role="dialog"` `aria-modal="true"` with proper focus management and ESC close.
- The close button in the overlay is keyboard-focusable.
- The `ArchiveDomeGallery` inside the overlay already has full keyboard / focus / ARIA support (`aria-haspopup="dialog"`, `aria-expanded`, focus return on tile close, ESC handler).
- **Add a visually-hidden trigger as fallback:** Alongside the `ComputerModelStage`, render a `<button className="sr-only" onClick={handleActivate}>Open Archived Builds</button>`. This ensures keyboard-only users can access the overlay without interacting with the 3D canvas. Position it before the canvas in DOM order.
- The `ComputerModelStage` wrapper div should have `aria-label="Archived Builds — interactive 3D model. Click to open archive."` and `role="button"` or be wrapped in a `<button>` for keyboard activatability.
- **Actually preferred:** Wrap the canvas wrapper in a `<button>` element (not just a div with `onClick`) — this makes it natively keyboard focusable and activatable via `Enter`/`Space`.

### 5.9 SEO Concerns

**Risk:** The archive content (10 past projects) is currently rendered in the dome gallery which is client-only. After this change, it is still client-only but now requires an additional click interaction to reveal.

**Assessment:** The `pastProjects` data is already not indexed as visible text content (it's in a client-only WebGL/CSS-3D component today). The project names and URLs are present in the `builds-content.ts` data, but not in the HTML output of the static export for the dome section.

**Existing mitigation (do not remove):** `app/builds/page.tsx` already passes `pastProjects` into `createCollectionPageSchema` which outputs JSON-LD structured data for Google. All 10 archived projects appear in the JSON-LD `hasPart` collection items with their `name` and `url`. This coverage is preserved regardless of the UI change.

**No additional SEO risk introduced by this change.**

---

## 6. Regression-Prevention Strategy

### 6.1 What Must Remain Unchanged

| Item | Verification |
|---|---|
| `ArchiveDomeGallery` component API | Zero changes to the file |
| All 10 past projects render with correct images, names, hrefs | Visual check in overlay |
| Tile click → focus card expand animation | Click each tile |
| Focus card close button and ESC key | Test both |
| Focus card GitHub/demo links | Click through on 2–3 projects |
| `PastProjectsPanel` section copy (eyebrow, heading, description) | Visual check |
| JSON-LD structured data output | `view-source:` on `/builds/` page; check `<script type="application/ld+json">` |
| `BuildsShowcase` above the panel | Visual check; no layout shift |
| Footer car model | Scroll to footer; verify still renders |
| Homepage 3D model (if applicable) | Navigate to `/`; verify |
| Route stability: `/builds/` and `/builds/[slug]/` | Build and deploy test |

### 6.2 Manual Test Checklist

**Resting state:**
- [ ] Page loads; no console errors
- [ ] Commodore 64 model renders in the stage container
- [ ] Idle rotation is visible
- [ ] Hint badge is visible and pulsing
- [ ] Arcball drag works (orbit model in all directions)
- [ ] Drag-then-release inertia works
- [ ] Section copy above the container renders correctly

**Activation:**
- [ ] Click model → phase transitions to activating
- [ ] Model rotates to screen-facing orientation
- [ ] Overlay fades in
- [ ] Model canvas fades out while overlay appears
- [ ] Dome gallery is visible and interactive in overlay

**Overlay / Dome Gallery:**
- [ ] Drag works in dome gallery
- [ ] Inertia works in dome gallery
- [ ] Tile click → focus card opens
- [ ] Focus card close button works
- [ ] ESC closes focus card (not the overlay — ESC should close innermost modal first: the tile, then the overlay)
- [ ] All 10 project tiles present

**Close:**
- [ ] Overlay close button → overlay fades out
- [ ] ESC with no tile open → overlay closes
- [ ] Model canvas fades back in after overlay closes
- [ ] Idle rotation resumes after close
- [ ] Focus returns to model stage (or close button trigger)

### 6.3 Responsive Layout Testing

- [ ] **Mobile (375px):** Model stage renders; hint badge visible; tap activates overlay; overlay fills viewport; dome gallery touch-draggable; close button reachable
- [ ] **Tablet (768px):** Same as mobile plus verify section gutter spacing
- [ ] **Desktop (1280px):** Hover glow effect visible; full overlay layout correct
- [ ] **Large desktop (1920px):** Overlay not wider than intended; dome gallery content fills space well

### 6.4 Accessibility Verification

- [ ] Tab to model stage button → receives focus ring
- [ ] Enter/Space → activates overlay (same as click)
- [ ] Tab through overlay → reaches close button
- [ ] Focus is trapped in overlay while open (dome gallery tiles are focusable; close button focusable)
- [ ] ESC closes overlay from any focus position
- [ ] Focus returns to stage button after overlay close
- [ ] Screen reader announces overlay opening (`role="dialog"` `aria-label`)
- [ ] `prefers-reduced-motion` test: no rotation animation; overlay fades in without scale transition

### 6.5 Build and Performance Verification

- [ ] `next build` succeeds with no TypeScript errors
- [ ] `next build` output size for `/builds/` page is not significantly larger (model is fetched at runtime, not bundled)
- [ ] Lighthouse performance on `/builds/` page: aim for no more than 5 point regression from baseline
- [ ] Chrome DevTools Performance tab: no sustained frame drops during idle rotation at 60fps on mid-tier hardware

---

## 7. Codex-Ready Execution Checklist

Execute in order. Do not skip steps. Do not modify files outside the listed scope.

### Step 0 — Model Asset

- [ ] **0.1** Place `uploads_files_6110435_commodore64.glb` in `/public/models/`
- [ ] **0.2** Open `/public/models/uploads_files_6110435_commodore64.glb` in [gltf.pmnd.rs](https://gltf.pmnd.rs/) viewer and determine the Euler angles for: (a) idle 3/4 view angle, (b) screen-faces-camera orientation. Record as constants.

### Step 1 — `ComputerModelStage.tsx`

- [ ] **1.1** Create `components/builds/ComputerModelStage.tsx` with `"use client"` directive
- [ ] **1.2** Define `COMPUTER_MODEL_URL = "/models/uploads_files_6110435_commodore64.glb"`
- [ ] **1.3** Define `Phase` type: `"idle" | "hover" | "activating" | "expanding" | "open" | "collapsing"`
- [ ] **1.4** Define `SCREEN_FACING_EULER` and `IDLE_TILT_EULER` constants (from Step 0.2 observation)
- [ ] **1.5** Implement `projectToArcball()` function (copy from `InteractiveCarModel.tsx` lines 47–58)
- [ ] **1.6** Implement `quaternionToRotationVector()` and `rotationVectorToQuaternion()` (copy from `InteractiveCarModel.tsx` lines 80–116)
- [ ] **1.7** Implement `LoadingState` and `ErrorState` components (copy from `InteractiveCarModel.tsx` lines 60–78)
- [ ] **1.8** Implement `ComputerModelObject` inner component with `useGLTF`, `useFrame` animation loop handling all 6 phases
- [ ] **1.9** Implement `SafeComputerModelObject` error boundary wrapper
- [ ] **1.10** Implement `ComputerModelStage` export: wrapper div with pointer handlers, `<Canvas>`, lighting, `<Suspense>`
- [ ] **1.11** Add `useGLTF.preload(COMPUTER_MODEL_URL)` at module level
- [ ] **1.12** Add `aria-label` and `role="button"` (or wrap in `<button>`) on the canvas container
- [ ] **1.13** Add visually-hidden `<button className="sr-only">Open Archived Builds</button>` alongside canvas

### Step 2 — `ArchivedBuildsOverlay.tsx`

- [ ] **2.1** Create `components/builds/ArchivedBuildsOverlay.tsx` with `"use client"` directive
- [ ] **2.2** Import `createPortal` from `react-dom`
- [ ] **2.3** Import `motion` from `framer-motion`
- [ ] **2.4** Import `ArchiveDomeGallery` from `@/components/builds/ArchiveDomeGallery`
- [ ] **2.5** Define `ArchivedBuildsOverlayProps` interface (all `ArchiveDomeGallery` pass-through props + `isVisible` + `onClose`)
- [ ] **2.6** Implement iOS scroll lock: store `scrollY`, set `position: fixed; top: -Xpx`, restore on cleanup
- [ ] **2.7** Implement ESC key listener when `isVisible`
- [ ] **2.8** Implement focus management: ref the close button; focus it after open animation; restore focus on close
- [ ] **2.9** Render via `createPortal` into `document.body`
- [ ] **2.10** `motion.div` wrapper with `initial={{ opacity: 0 }}`, `animate={{ opacity: isVisible ? 1 : 0 }}`, `transition={{ duration: 0.4 }}`
- [ ] **2.11** Top bar with project count, "Close" button styled with Tailwind utilities matching `focusCloseButton` style
- [ ] **2.12** `<ArchiveDomeGallery>` in flex-grow container, height `calc(100dvh - 56px)`
- [ ] **2.13** Lazy mount guard: only render `ArchiveDomeGallery` after `isVisible` has been `true` at least once

### Step 3 — `ArchivedBuildsEntry.module.css`

- [ ] **3.1** Create `components/builds/ArchivedBuildsEntry.module.css`
- [ ] **3.2** Define `.hintBadge` with `@keyframes hintPulse` opacity animation (0.44 → 0.88 → 0.44, 3s ease-in-out infinite)
- [ ] **3.3** Define `@media (prefers-reduced-motion: reduce)` override: `animation: none; opacity: 0.66`

### Step 4 — `ArchivedBuildsEntry.tsx`

- [ ] **4.1** Create `components/builds/ArchivedBuildsEntry.tsx` with `"use client"` directive
- [ ] **4.2** Import `ComputerModelStage`, `ArchivedBuildsOverlay`, `ArchiveDomeGallery` types, `PastProject` type, CSS module
- [ ] **4.3** Import `motion` from `framer-motion`
- [ ] **4.4** Define `ArchivedBuildsEntryProps` (all `ArchiveDomeGallery` props + `projects: PastProject[]`)
- [ ] **4.5** Implement `phase` state with `useState<Phase>("idle")`
- [ ] **4.6** Implement `overlayVisible` state with `useState(false)`
- [ ] **4.7** Implement `hasMountedOverlay` ref (set to `true` on first open; never unset)
- [ ] **4.8** Implement `handleActivate()`: guard against non-idle phases; set `phase = "activating"`
- [ ] **4.9** Implement `handleActivationComplete()`: set `phase = "expanding"`; set `overlayVisible = true`; `setTimeout(() => setPhase("open"), 500)`
- [ ] **4.10** Implement `handleClose()`: set `phase = "collapsing"`; set `overlayVisible = false`; `setTimeout(() => setPhase("idle"), 500)`
- [ ] **4.11** Render: outer `div` with `relative h-[32rem] sm:h-[40rem] lg:h-[46rem]`
- [ ] **4.12** Inside: `motion.div` wrapping `ComputerModelStage` with `animate={{ opacity, scale }}` driven by phase
- [ ] **4.13** Inside `motion.div`: `HintBadge` using CSS module `.hintBadge`, hidden via Framer Motion when phase !== "idle"
- [ ] **4.14** Conditionally render `ArchivedBuildsOverlay` when `hasMountedOverlay.current`
- [ ] **4.15** Pass all gallery props through from `ArchivedBuildsEntryProps` to `ArchivedBuildsOverlay`

### Step 5 — `PastProjectsPanel.tsx` Modification

- [ ] **5.1** Open `components/builds/PastProjectsPanel.tsx`
- [ ] **5.2** Remove import of `ArchiveDomeGallery`
- [ ] **5.3** Remove import of `pastProjects` (it will still be imported for the count — keep or move to `ArchivedBuildsEntry`)
- [ ] **5.4** Add import: `import ArchivedBuildsEntry from "@/components/builds/ArchivedBuildsEntry"`
- [ ] **5.5** Replace the `<div className="relative h-[32rem] ..."><ArchiveDomeGallery ... /></div>` block with `<ArchivedBuildsEntry projects={pastProjects} fit={1.2} fitBasis="width" minRadius={560} maxRadius={1240} padFactor={0.05} maxVerticalRotationDeg={9} dragSensitivity={20} dragDampening={0.82} segments={21} overlayBlurColor="#080511" />`
- [ ] **5.6** Update the hint text inside the header bar from `"Drag to orbit. Click a tile to focus."` to `"Click the computer to open the archive."` (or remove it if it no longer applies; `ArchivedBuildsEntry` provides its own hint badge)

### Step 6 — Verification

- [ ] **6.1** Run `next build` — zero TypeScript errors, zero build errors
- [ ] **6.2** Run `next start` (or `npx serve out/` for static export) and open `/builds/`
- [ ] **6.3** Execute all manual tests from §6.2
- [ ] **6.4** Execute all responsive tests from §6.3
- [ ] **6.5** Execute accessibility checks from §6.4
- [ ] **6.6** Verify JSON-LD in page source
- [ ] **6.7** Open Chrome DevTools > Performance > Record while clicking model to activate overlay. Confirm no sustained jank frames.
- [ ] **6.8** Test on iOS Safari: scroll lock does not jump page; overlay height uses `100dvh` correctly; touch drag in overlay works

### Step 7 — Polish Pass (after all tests pass)

- [ ] **7.1** Tune idle rotation speed and breathing amplitude to match Commodore 64 model proportions
- [ ] **7.2** Tune `SCREEN_FACING_EULER` and `IDLE_TILT_EULER` constants to look correct with the actual model
- [ ] **7.3** Tune `ComputerModelStage` camera position and FOV for the best presentation of the Commodore 64 model
- [ ] **7.4** Verify hint badge text and position look natural at all breakpoints
- [ ] **7.5** Verify overlay close button is easy to reach on mobile (minimum 44×44px touch target)
- [ ] **7.6** Final pass: confirm no console warnings about Three.js deprecations or React key conflicts

---

*End of plan. Total new files: 4. Modified files: 1. Unchanged core files: all others.*
