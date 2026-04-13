"use client";

import type { MotionValue } from "framer-motion";
import type {
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
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
const DEFAULT_SCREEN_FACING_EULER = [0, 0, 0] as const;
const DEFAULT_IDLE_EULER = [-0.2, -0.56, 0.04] as const;

const INTERACTIVE_PHASES = new Set<Phase>(["idle", "hover"]);
const IDLE_SPIN_SPEED = 0.22;
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

export type Phase =
  | "idle"
  | "hover"
  | "activating"
  | "expanding"
  | "open"
  | "collapsing";

interface ComputerModelStageProps {
  ariaLabel?: string;
  boundsMargin?: number;
  cameraFov?: number;
  cameraPosition?: readonly [number, number, number];
  fitBounds?: boolean;
  hoverEulerOffset?: readonly [number, number, number];
  hoverScale?: number;
  idleEuler?: readonly [number, number, number];
  idleSpinSpeed?: number;
  interactionMode?: "drag" | "click";
  lightingVariant?: "default" | "contrast";
  materialVariant?: "source" | "clay";
  modelUrl?: string;
  omitNodeNames?: readonly string[];
  rotationAmplitude?: number;
  rotationProgress?: MotionValue<number>;
  sceneEuler?: readonly [number, number, number];
  sceneScale?: number;
  phase: Phase;
  onActivate: () => void;
  onActivationComplete: () => void;
  onHoverChange?: (hovered: boolean) => void;
  className?: string;
  screenFacingEuler?: readonly [number, number, number];
  variant?: "default" | "minimal";
}

interface ModelObjectProps {
  boundsMargin: number;
  dragRotationRef: MutableRefObject<THREE.Vector3>;
  dragTargetRotationRef: MutableRefObject<THREE.Vector3>;
  dragVelocityRef: MutableRefObject<THREE.Vector3>;
  fitBounds: boolean;
  hoverEulerOffset: readonly [number, number, number];
  hoverScale: number;
  idleEuler: readonly [number, number, number];
  idleSpinSpeed: number;
  materialVariant: "source" | "clay";
  modelUrl: string;
  omitNodeNames?: readonly string[];
  rotationAmplitude: number;
  rotationProgress?: MotionValue<number>;
  sceneEuler?: readonly [number, number, number];
  sceneScale?: number;
  phase: Phase;
  pointerStateRef: MutableRefObject<{
    active: boolean;
    pointerId: number;
    startQuaternion: THREE.Quaternion;
    startVector: THREE.Vector3;
  }>;
  onActivationComplete: () => void;
  screenFacingEuler: readonly [number, number, number];
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
    console.error("Failed to load interactive 3D model:", error);
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
  fitBounds,
  hoverEulerOffset,
  hoverScale,
  idleEuler,
  idleSpinSpeed,
  materialVariant,
  modelUrl,
  omitNodeNames,
  rotationAmplitude,
  rotationProgress,
  sceneEuler,
  sceneScale = 1,
  phase,
  pointerStateRef,
  onActivationComplete,
  screenFacingEuler,
}: ModelObjectProps) {
  const reducedMotion = useReducedMotion();
  const gltf = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(0);
  const activationNotifiedRef = useRef(false);
  const previousPhaseRef = useRef<Phase>(phase);
  const baseQuaternionRef = useRef(new THREE.Quaternion());
  const deltaVectorRef = useRef(new THREE.Vector3());
  const hoverWeightRef = useRef(0);
  const omittedNodeNamesSet = useMemo(
    () => new Set(omitNodeNames ?? []),
    [omitNodeNames],
  );
  const screenFacingQuaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          screenFacingEuler[0],
          screenFacingEuler[1],
          screenFacingEuler[2],
        ),
      ),
    [screenFacingEuler],
  );
  const idleQuaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(idleEuler[0], idleEuler[1], idleEuler[2]),
      ),
    [idleEuler],
  );

  const model = useMemo(() => {
    const clone = gltf.scene.clone();
    const nodesToRemove: THREE.Object3D[] = [];

    if (sceneEuler) {
      clone.rotation.set(sceneEuler[0], sceneEuler[1], sceneEuler[2]);
      clone.updateMatrixWorld(true);
    }

    clone.traverse((child) => {
      if (omittedNodeNamesSet.has(child.name)) {
        nodesToRemove.push(child);
      }

      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      if (materialVariant === "clay") {
        const materialName =
          (Array.isArray(child.material)
            ? child.material[0]?.name
            : child.material?.name) ?? "";

        child.material =
          materialName === "window glass"
            ? new THREE.MeshPhysicalMaterial({
                color: "#f4f7ff",
                roughness: 0.14,
                metalness: 0,
                transmission: 0.35,
                transparent: true,
                opacity: 0.42,
              })
            : new THREE.MeshStandardMaterial({
                color:
                  materialName === "garagedoor" ? "#d8d1c5" : "#ebe5da",
                roughness: 0.82,
                metalness: 0.04,
              });
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    nodesToRemove.forEach((child) => {
      child.parent?.remove(child);
    });

    return clone;
  }, [gltf, materialVariant, omittedNodeNamesSet, sceneEuler]);

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
    const hoverTarget = phase === "hover" ? 1 : 0;
    const spinMultiplier = 1;
    const scrollRotation = rotationProgress
      ? THREE.MathUtils.clamp(rotationProgress.get(), 0, 1) * rotationAmplitude
      : 0;

    hoverWeightRef.current = THREE.MathUtils.damp(
      hoverWeightRef.current,
      hoverTarget,
      reducedMotion ? 10 : 7.5,
      delta,
    );

    if (!reducedMotion && !isDragging) {
      idleTimeRef.current += delta * idleSpinSpeed * spinMultiplier;
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
        idleEuler[0] + hoverEulerOffset[0] * hoverWeightRef.current,
        idleEuler[1] +
          scrollRotation +
          (reducedMotion ? 0 : idleTimeRef.current) +
          hoverEulerOffset[1] * hoverWeightRef.current,
        idleEuler[2] + hoverEulerOffset[2] * hoverWeightRef.current,
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
    const hoverScaleValue =
      1 + (hoverScale - 1) * hoverWeightRef.current;

    group.scale.setScalar(breathingScale * hoverScaleValue);
  });

  const modelGroup = (
    <group ref={groupRef}>
      <group scale={sceneScale}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </group>
  );

  return fitBounds ? (
    <Bounds fit clip observe margin={boundsMargin}>
      {modelGroup}
    </Bounds>
  ) : (
    modelGroup
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
      ariaLabel = "Archived Builds interactive 3D model. Activate to open the archive.",
      boundsMargin = 1.08,
      cameraFov = 34,
      cameraPosition = [0, 0.68, 5.2],
      fitBounds = true,
      hoverEulerOffset = [0, 0, 0],
      hoverScale = 1,
      idleEuler = DEFAULT_IDLE_EULER,
      idleSpinSpeed = IDLE_SPIN_SPEED,
      interactionMode = "drag",
      lightingVariant = "default",
      materialVariant = "source",
      modelUrl = COMPUTER_MODEL_URL,
      omitNodeNames,
      rotationAmplitude = 0,
      rotationProgress,
      sceneEuler,
      sceneScale = 1,
      phase,
      onActivate,
      onActivationComplete,
      onHoverChange,
      screenFacingEuler = DEFAULT_SCREEN_FACING_EULER,
      className = "",
      variant = "default",
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

    if (
      interactionMode === "drag" &&
      performance.now() - lastDragEndAtRef.current <= DRAG_CLICK_GUARD_MS
    ) {
      return;
    }

    onActivate();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (
      interactionMode !== "drag" ||
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
      interactionMode !== "drag" ||
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
    if (interactionMode !== "drag") {
      return;
    }

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
    if (interactionMode !== "drag") {
      return;
    }

    if (pointerStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    resetPointerState();
    dragTargetRotationRef.current?.set(0, 0, 0);
  }

  function handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (interactionMode === "click") {
      tryActivate();
      return;
    }

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
    interactionMode === "drag"
      ? phase === "activating" || phase === "expanding"
        ? "[touch-action:none]"
        : "[touch-action:pan-y]"
      : "[touch-action:manipulation]";
  const cursorClass = INTERACTIVE_PHASES.has(phase)
    ? interactionMode === "drag"
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-pointer"
    : "cursor-default";
  const isMinimal = variant === "minimal";
  const useContrastLighting = lightingVariant === "contrast";
  const stageClassName = isMinimal
    ? "relative h-full w-full appearance-none overflow-visible border-none bg-transparent p-0 text-left text-white shadow-none outline-none [contain:layout_paint] transition focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    : "relative h-full w-full appearance-none overflow-hidden rounded-[inherit] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(190,220,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(40,88,190,0.18),transparent_34%),linear-gradient(180deg,rgba(10,12,18,0.96),rgba(5,8,14,0.9))] p-0 text-left text-white outline-none [contain:layout_paint] transition focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={ariaLabel}
      className={`${stageClassName} ${touchActionClass} ${cursorClass} ${className}`.trim()}
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
      {!isMinimal ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]"
        />
      ) : null}
      <Canvas
        className="pointer-events-none h-full w-full"
        dpr={[1, 1.75]}
        camera={{ position: [...cameraPosition], fov: cameraFov }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        eventSource={buttonRef as RefObject<HTMLElement>}
      >
        <ambientLight intensity={useContrastLighting ? 0.46 : 0.92} />
        <hemisphereLight
          intensity={useContrastLighting ? 0.38 : 0.82}
          color="#f6fbff"
          groundColor="#040608"
        />
        <directionalLight
          position={useContrastLighting ? [5.5, 6.5, 7.5] : [6, 7, 8]}
          intensity={useContrastLighting ? 1.95 : 2.2}
          color={useContrastLighting ? "#fff7ed" : "#f9fbff"}
        />
        <directionalLight
          position={useContrastLighting ? [-6.5, 2.5, -4.5] : [-8, 3, -5]}
          intensity={useContrastLighting ? 0.72 : 0.86}
          color={useContrastLighting ? "#8ea4cf" : "#93a8c7"}
        />
        <spotLight
          angle={useContrastLighting ? 0.34 : 0.45}
          intensity={useContrastLighting ? 8.5 : 18}
          penumbra={0.72}
          position={useContrastLighting ? [0, 8, 7] : [0, 9, 8]}
          color={useContrastLighting ? "#fffaf2" : "#f1f6ff"}
        />
        <Suspense fallback={<LoadingState />}>
          <SafeComputerModelObject
            boundsMargin={boundsMargin}
            fitBounds={fitBounds}
            dragRotationRef={dragRotationRef}
            dragTargetRotationRef={dragTargetRotationRef}
            dragVelocityRef={dragVelocityRef}
            hoverEulerOffset={hoverEulerOffset}
            hoverScale={hoverScale}
            idleEuler={idleEuler}
            idleSpinSpeed={idleSpinSpeed}
            materialVariant={materialVariant}
            modelUrl={modelUrl}
            omitNodeNames={omitNodeNames}
            rotationAmplitude={rotationAmplitude}
            rotationProgress={rotationProgress}
            sceneEuler={sceneEuler}
            sceneScale={sceneScale}
            phase={phase}
            pointerStateRef={pointerStateRef}
            onActivationComplete={onActivationComplete}
            screenFacingEuler={screenFacingEuler}
          />
          <Preload all />
        </Suspense>
      </Canvas>
      {!isMinimal ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/36 to-transparent"
        />
      ) : null}
      {!reducedMotion && !isMinimal ? (
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
