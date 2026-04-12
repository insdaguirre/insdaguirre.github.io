"use client";

import type {
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import {
  Component,
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Bounds, Center, Html, Preload, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const COMPUTER_MODEL_URL = "/models/uploads_files_6110435_commodore64.glb";

// Tuned from local GLB inspection. The Commodore scene's front already faces +Z,
// so the screen-facing presentation can stay at the identity orientation.
const SCREEN_FACING_EULER = new THREE.Euler(0, 0, 0);
const IDLE_TILT_EULER = new THREE.Euler(-0.2, -0.56, 0.04);

const INTERACTIVE_PHASES = new Set<Phase>(["idle", "hover"]);
const IDLE_SPIN_SPEED = 0.22;
const HOVER_SPIN_MULTIPLIER = 0.25;
const BREATHE_FREQUENCY = 1.55;
const BREATHE_AMPLITUDE = 0.015;
const DRAG_MOVE_THRESHOLD = 6;
const DRAG_CLICK_GUARD_MS = 200;
const FOLLOW_STIFFNESS = 34;
const FOLLOW_DAMPING = 13;
const RETURN_STIFFNESS = 20;
const RETURN_DAMPING = 11;
const ACTIVATION_DAMPING = 7.8;
const COLLAPSE_DAMPING = 6.2;
const ACTIVATION_SETTLE_THRESHOLD = 0.01;

const screenFacingQuaternion = new THREE.Quaternion().setFromEuler(
  SCREEN_FACING_EULER,
);
const idleQuaternion = new THREE.Quaternion().setFromEuler(IDLE_TILT_EULER);

export type Phase =
  | "idle"
  | "hover"
  | "activating"
  | "expanding"
  | "open"
  | "collapsing";

interface ComputerModelStageProps {
  phase: Phase;
  onActivate: () => void;
  onActivationComplete: () => void;
  onHoverChange?: (hovered: boolean) => void;
  className?: string;
}

interface ModelObjectProps {
  boundsMargin: number;
  dragRotationRef: MutableRefObject<THREE.Vector3>;
  dragTargetRotationRef: MutableRefObject<THREE.Vector3>;
  dragVelocityRef: MutableRefObject<THREE.Vector3>;
  phase: Phase;
  pointerStateRef: MutableRefObject<{
    active: boolean;
    pointerId: number;
    startQuaternion: THREE.Quaternion;
    startVector: THREE.Vector3;
  }>;
  onActivationComplete: () => void;
}

interface ModelErrorBoundaryProps {
  children: ReactNode;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

function projectToArcball(clientX: number, clientY: number, rect: DOMRect) {
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  const lengthSquared = x * x + y * y;

  if (lengthSquared <= 1) {
    return new THREE.Vector3(x, y, Math.sqrt(1 - lengthSquared));
  }

  const scale = 1 / Math.sqrt(lengthSquared);
  return new THREE.Vector3(x * scale, y * scale, 0);
}

function LoadingState() {
  return (
    <Html center>
      <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/55 backdrop-blur-sm">
        Loading model
      </div>
    </Html>
  );
}

function ErrorState() {
  return (
    <Html center>
      <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/55 backdrop-blur-sm">
        Model unavailable
      </div>
    </Html>
  );
}

function quaternionToRotationVector(quaternion: THREE.Quaternion) {
  const normalized = quaternion.clone().normalize();

  if (normalized.w < 0) {
    normalized.set(
      -normalized.x,
      -normalized.y,
      -normalized.z,
      -normalized.w,
    );
  }

  const clampedW = THREE.MathUtils.clamp(normalized.w, -1, 1);
  const angle = 2 * Math.acos(clampedW);
  const sinHalfAngle = Math.sqrt(Math.max(1 - clampedW * clampedW, 0));

  if (angle < 1e-4 || sinHalfAngle < 1e-4) {
    return new THREE.Vector3();
  }

  return new THREE.Vector3(
    normalized.x / sinHalfAngle,
    normalized.y / sinHalfAngle,
    normalized.z / sinHalfAngle,
  ).multiplyScalar(angle);
}

function rotationVectorToQuaternion(vector: THREE.Vector3) {
  const angle = vector.length();

  if (angle < 1e-4) {
    return new THREE.Quaternion();
  }

  const axis = vector.clone().multiplyScalar(1 / angle);
  return new THREE.Quaternion().setFromAxisAngle(axis, angle);
}

function dampQuaternion(
  current: THREE.Quaternion,
  target: THREE.Quaternion,
  damping: number,
  delta: number,
) {
  const alpha = 1 - Math.exp(-damping * delta);
  current.slerp(target, alpha);
}

class ModelErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  state: ModelErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error) {
    console.error("Failed to load archived builds model:", error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState />;
    }

    return this.props.children;
  }
}

function ComputerModelObject({
  boundsMargin,
  dragRotationRef,
  dragTargetRotationRef,
  dragVelocityRef,
  phase,
  pointerStateRef,
  onActivationComplete,
}: ModelObjectProps) {
  const reducedMotion = useReducedMotion();
  const gltf = useGLTF(COMPUTER_MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(0);
  const activationNotifiedRef = useRef(false);
  const previousPhaseRef = useRef<Phase>(phase);
  const baseQuaternionRef = useRef(idleQuaternion.clone());
  const deltaVectorRef = useRef(new THREE.Vector3());

  const model = useMemo(() => {
    const clone = gltf.scene.clone();

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    return clone;
  }, [gltf]);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;

    if (phase === "activating") {
      activationNotifiedRef.current = false;
      dragRotationRef.current?.set(0, 0, 0);
      dragTargetRotationRef.current?.set(0, 0, 0);
      dragVelocityRef.current?.set(0, 0, 0);
    }

    if (
      phase === "idle" &&
      previousPhase !== "idle" &&
      previousPhase !== "hover"
    ) {
      idleTimeRef.current = 0;
      dragRotationRef.current?.set(0, 0, 0);
      dragTargetRotationRef.current?.set(0, 0, 0);
      dragVelocityRef.current?.set(0, 0, 0);
    }

    previousPhaseRef.current = phase;
  }, [phase, dragRotationRef, dragTargetRotationRef, dragVelocityRef]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const dragRotation = dragRotationRef.current;
    const dragTargetRotation = dragTargetRotationRef.current;
    const dragVelocity = dragVelocityRef.current;
    const pointerState = pointerStateRef.current;

    if (!group || !dragRotation || !dragTargetRotation || !dragVelocity || !pointerState) {
      return;
    }

    if (phase === "activating") {
      group.scale.setScalar(1);
      dampQuaternion(group.quaternion, screenFacingQuaternion, ACTIVATION_DAMPING, delta);

      if (
        !activationNotifiedRef.current &&
        group.quaternion.angleTo(screenFacingQuaternion) < ACTIVATION_SETTLE_THRESHOLD
      ) {
        activationNotifiedRef.current = true;
        group.quaternion.copy(screenFacingQuaternion);
        onActivationComplete();
      }

      return;
    }

    if (phase === "expanding" || phase === "open") {
      group.scale.setScalar(1);
      group.quaternion.copy(screenFacingQuaternion);
      return;
    }

    if (phase === "collapsing") {
      group.scale.setScalar(1);
      dampQuaternion(group.quaternion, idleQuaternion, COLLAPSE_DAMPING, delta);
      return;
    }

    const isDragging = pointerState.active;
    const spinMultiplier = phase === "hover" ? HOVER_SPIN_MULTIPLIER : 1;

    if (!reducedMotion && !isDragging) {
      idleTimeRef.current += delta * IDLE_SPIN_SPEED * spinMultiplier;
    }

    const springStiffness = isDragging ? FOLLOW_STIFFNESS : RETURN_STIFFNESS;
    const springDamping = isDragging ? FOLLOW_DAMPING : RETURN_DAMPING;

    deltaVectorRef.current.copy(dragTargetRotation).sub(dragRotation);
    dragVelocity.addScaledVector(deltaVectorRef.current, springStiffness * delta);
    dragVelocity.multiplyScalar(Math.exp(-springDamping * delta));
    dragRotation.addScaledVector(dragVelocity, delta);

    if (
      !isDragging &&
      dragRotation.lengthSq() < 1e-5 &&
      dragVelocity.lengthSq() < 1e-5 &&
      dragTargetRotation.lengthSq() < 1e-5
    ) {
      dragRotation.set(0, 0, 0);
      dragVelocity.set(0, 0, 0);
    }

    baseQuaternionRef.current.setFromEuler(
      new THREE.Euler(
        IDLE_TILT_EULER.x,
        IDLE_TILT_EULER.y + (reducedMotion ? 0 : idleTimeRef.current),
        IDLE_TILT_EULER.z,
      ),
    );

    group.quaternion.copy(
      baseQuaternionRef.current
        .clone()
        .multiply(rotationVectorToQuaternion(dragRotation)),
    );

    const breathingScale = reducedMotion
      ? 1
      : 1 + Math.sin(idleTimeRef.current * BREATHE_FREQUENCY) * BREATHE_AMPLITUDE;

    group.scale.setScalar(breathingScale);
  });

  return (
    <Bounds fit clip observe margin={boundsMargin}>
      <group ref={groupRef}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </Bounds>
  );
}

function SafeComputerModelObject(props: ModelObjectProps) {
  return (
    <ModelErrorBoundary>
      <ComputerModelObject {...props} />
    </ModelErrorBoundary>
  );
}

const ComputerModelStage = forwardRef<HTMLButtonElement, ComputerModelStageProps>(
  function ComputerModelStage(
    {
      phase,
      onActivate,
      onActivationComplete,
      onHoverChange,
      className = "",
    },
    forwardedRef,
  ) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRotationRef = useRef(new THREE.Vector3());
  const dragTargetRotationRef = useRef(new THREE.Vector3());
  const dragVelocityRef = useRef(new THREE.Vector3());
  const pointerStateRef = useRef({
    active: false,
    pointerId: -1,
    startVector: new THREE.Vector3(0, 0, 1),
    startQuaternion: new THREE.Quaternion(),
  });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const lastDragEndAtRef = useRef(0);
  const hasHoverRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useImperativeHandle(forwardedRef, () => buttonRef.current as HTMLButtonElement, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover)");
    const updateHoverCapability = () => {
      hasHoverRef.current = mediaQuery.matches;
    };

    updateHoverCapability();
    mediaQuery.addEventListener("change", updateHoverCapability);

    return () => {
      mediaQuery.removeEventListener("change", updateHoverCapability);
    };
  }, []);

  function resetPointerState() {
    pointerStateRef.current.active = false;
    pointerStateRef.current.pointerId = -1;
  }

  function tryActivate() {
    if (!INTERACTIVE_PHASES.has(phase)) {
      return;
    }

    if (performance.now() - lastDragEndAtRef.current <= DRAG_CLICK_GUARD_MS) {
      return;
    }

    onActivate();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (
      !INTERACTIVE_PHASES.has(phase) ||
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    const dragTargetRotation = dragTargetRotationRef.current;

    if (!rect || !dragTargetRotation) {
      return;
    }

    pointerStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startVector: projectToArcball(event.clientX, event.clientY, rect),
      startQuaternion: rotationVectorToQuaternion(dragTargetRotation.clone()),
    };
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    movedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const pointerState = pointerStateRef.current;

    if (
      !INTERACTIVE_PHASES.has(phase) ||
      !pointerState.active ||
      pointerState.pointerId !== event.pointerId
    ) {
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    const dragTargetRotation = dragTargetRotationRef.current;

    if (!rect || !dragTargetRotation) {
      return;
    }

    const movementX = event.clientX - pointerStartRef.current.x;
    const movementY = event.clientY - pointerStartRef.current.y;

    if (
      !movedRef.current &&
      Math.hypot(movementX, movementY) >= DRAG_MOVE_THRESHOLD
    ) {
      movedRef.current = true;
    }

    const currentVector = projectToArcball(event.clientX, event.clientY, rect);
    const deltaQuaternion = new THREE.Quaternion().setFromUnitVectors(
      pointerState.startVector,
      currentVector,
    );
    const nextQuaternion = pointerState.startQuaternion.clone();

    nextQuaternion.premultiply(deltaQuaternion);
    dragTargetRotation.copy(quaternionToRotationVector(nextQuaternion));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const pointerState = pointerStateRef.current;

    if (pointerState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetPointerState();
    dragTargetRotationRef.current?.set(0, 0, 0);

    if (movedRef.current) {
      lastDragEndAtRef.current = performance.now();
      return;
    }

    tryActivate();
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    if (pointerStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    resetPointerState();
    dragTargetRotationRef.current?.set(0, 0, 0);
  }

  function handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0) {
      return;
    }

    tryActivate();
  }

  function handlePointerEnter() {
    if (!hasHoverRef.current) {
      return;
    }

    onHoverChange?.(true);
  }

  function handlePointerLeave() {
    if (!hasHoverRef.current || pointerStateRef.current.active) {
      return;
    }

    onHoverChange?.(false);
  }

  const touchActionClass =
    phase === "activating" || phase === "expanding"
      ? "[touch-action:none]"
      : "[touch-action:pan-y]";

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Archived Builds interactive 3D model. Activate to open the archive."
      className={`relative h-full w-full overflow-hidden rounded-[inherit] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(190,220,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(40,88,190,0.18),transparent_34%),linear-gradient(180deg,rgba(10,12,18,0.96),rgba(5,8,14,0.9))] text-left text-white outline-none [contain:layout_paint] transition focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${touchActionClass} ${INTERACTIVE_PHASES.has(phase) ? "cursor-pointer active:cursor-grabbing" : "cursor-default"} ${className}`.trim()}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handlePointerCancel}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <span className="sr-only">Open Archived Builds</span>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]"
      />
      <Canvas
        className="pointer-events-none h-full w-full"
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.68, 5.2], fov: 34 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.92} />
        <hemisphereLight
          intensity={0.82}
          color="#f6fbff"
          groundColor="#040608"
        />
        <directionalLight position={[6, 7, 8]} intensity={2.2} color="#f9fbff" />
        <directionalLight position={[-8, 3, -5]} intensity={0.86} color="#93a8c7" />
        <spotLight
          angle={0.45}
          intensity={18}
          penumbra={0.72}
          position={[0, 9, 8]}
          color="#f1f6ff"
        />
        <Suspense fallback={<LoadingState />}>
          <SafeComputerModelObject
            boundsMargin={1.08}
            dragRotationRef={dragRotationRef}
            dragTargetRotationRef={dragTargetRotationRef}
            dragVelocityRef={dragVelocityRef}
            phase={phase}
            pointerStateRef={pointerStateRef}
            onActivationComplete={onActivationComplete}
          />
          <Preload all />
        </Suspense>
      </Canvas>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/36 to-transparent"
      />
      {!reducedMotion ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[10%] rounded-[2rem] border border-white/[0.045]"
        />
      ) : null}
    </button>
  );
  },
);

export default ComputerModelStage;

useGLTF.preload(COMPUTER_MODEL_URL);
