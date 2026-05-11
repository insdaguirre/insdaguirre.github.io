"use client";

import type { MotionValue } from "framer-motion";
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { Suspense, useMemo, useRef, useState } from "react";
import { Bounds, Center, Html, Preload, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const MODEL_URL = "/models/uploads_files_6149127_mclaren_mp45_2k.glb";

interface InteractiveCarModelProps {
  rotationProgress: MotionValue<number>;
  className?: string;
  boundsMargin?: number;
  cameraFov?: number;
  cameraPosition?: [number, number, number];
  followDamping?: number;
  followStiffness?: number;
  modelTilt?: number;
  returnDamping?: number;
  returnStiffness?: number;
  rotationAmplitude?: number;
}

interface ModelObjectProps {
  boundsMargin: number;
  dragRotationRef: MutableRefObject<THREE.Vector3>;
  dragTargetRotationRef: MutableRefObject<THREE.Vector3>;
  dragVelocityRef: MutableRefObject<THREE.Vector3>;
  followDamping: number;
  followStiffness: number;
  modelTilt?: number;
  pointerStateRef: MutableRefObject<{
    active: boolean;
    pointerId: number;
    startQuaternion: THREE.Quaternion;
    startVector: THREE.Vector3;
  }>;
  returnDamping: number;
  returnStiffness: number;
  rotationAmplitude?: number;
  rotationProgress: MotionValue<number>;
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
      -normalized.w
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
    normalized.z / sinHalfAngle
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

function ModelObject({
  boundsMargin,
  dragRotationRef,
  dragTargetRotationRef,
  dragVelocityRef,
  followDamping,
  followStiffness,
  modelTilt = -0.08,
  pointerStateRef,
  returnDamping,
  returnStiffness,
  rotationAmplitude = Math.PI * 1.35,
  rotationProgress,
}: ModelObjectProps) {
  const reducedMotion = useReducedMotion();
  const gltf = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  const baseQuaternionRef = useRef(new THREE.Quaternion());
  const baseEulerRef = useRef(new THREE.Euler());

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

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    const spinProgress = THREE.MathUtils.clamp(rotationProgress.get(), 0, 1);
    const baseRotation = reducedMotion ? 0 : spinProgress * rotationAmplitude;
    const targetRotation = dragTargetRotationRef.current;
    const currentRotation = dragRotationRef.current;
    const velocity = dragVelocityRef.current;
    const isDragging = pointerStateRef.current.active;
    const springStiffness = isDragging ? followStiffness : returnStiffness;
    const springDamping = isDragging ? followDamping : returnDamping;

    velocity.addScaledVector(
      targetRotation.clone().sub(currentRotation),
      springStiffness * delta
    );
    velocity.multiplyScalar(Math.exp(-springDamping * delta));
    currentRotation.addScaledVector(velocity, delta);

    if (
      !isDragging &&
      currentRotation.lengthSq() < 1e-5 &&
      velocity.lengthSq() < 1e-5 &&
      targetRotation.lengthSq() < 1e-5
    ) {
      currentRotation.set(0, 0, 0);
      velocity.set(0, 0, 0);
    }

    baseEulerRef.current.set(modelTilt, baseRotation, 0);
    baseQuaternionRef.current.setFromEuler(baseEulerRef.current);
    groupRef.current.quaternion.copy(
      baseQuaternionRef.current
        .clone()
        .multiply(rotationVectorToQuaternion(currentRotation))
    );
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

function SafeModelObject(props: ModelObjectProps) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return <ErrorState />;
  }

  try {
    return <ModelObject {...props} />;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    console.error("Failed to load 3D model:", error);
    return <ErrorState />;
  }
}

export default function InteractiveCarModel({
  boundsMargin = 1.2,
  cameraFov = 30,
  cameraPosition = [0, 0.9, 8],
  className = "",
  followDamping = 13,
  followStiffness = 34,
  modelTilt = -0.08,
  returnDamping = 11,
  returnStiffness = 20,
  rotationAmplitude = Math.PI * 1.35,
  rotationProgress,
}: InteractiveCarModelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRotationRef = useRef(new THREE.Vector3());
  const dragTargetRotationRef = useRef(new THREE.Vector3());
  const dragVelocityRef = useRef(new THREE.Vector3());
  const pointerStateRef = useRef({
    active: false,
    pointerId: -1,
    startVector: new THREE.Vector3(0, 0, 1),
    startQuaternion: new THREE.Quaternion(),
  });

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    pointerStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startVector: projectToArcball(event.clientX, event.clientY, rect),
      startQuaternion: rotationVectorToQuaternion(
        dragTargetRotationRef.current.clone()
      ),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      !pointerStateRef.current.active ||
      pointerStateRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const currentVector = projectToArcball(event.clientX, event.clientY, rect);
    const deltaQuaternion = new THREE.Quaternion().setFromUnitVectors(
      pointerStateRef.current.startVector,
      currentVector
    );
    const nextQuaternion = pointerStateRef.current.startQuaternion.clone();

    nextQuaternion.premultiply(deltaQuaternion);
    dragTargetRotationRef.current.copy(quaternionToRotationVector(nextQuaternion));
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      pointerStateRef.current.pointerId === event.pointerId &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerStateRef.current.active = false;
    pointerStateRef.current.pointerId = -1;
    dragTargetRotationRef.current.set(0, 0, 0);
  }

  return (
    <div
      aria-hidden="true"
      ref={wrapperRef}
      className={`relative h-full w-full cursor-grab [touch-action:pan-y] active:cursor-grabbing ${className}`.trim()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.75]}
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.86} />
        <hemisphereLight
          intensity={0.75}
          color="#ffffff"
          groundColor="#040404"
        />
        <directionalLight position={[6, 6, 8]} intensity={2.1} />
        <directionalLight position={[-8, 2, -6]} intensity={0.85} color="#7f8da1" />
        <spotLight
          angle={0.45}
          intensity={18}
          penumbra={0.7}
          position={[0, 9, 8]}
          color="#f0f4ff"
        />
        <Suspense fallback={<LoadingState />}>
          <SafeModelObject
            boundsMargin={boundsMargin}
            dragRotationRef={dragRotationRef}
            dragTargetRotationRef={dragTargetRotationRef}
            dragVelocityRef={dragVelocityRef}
            followDamping={followDamping}
            followStiffness={followStiffness}
            modelTilt={modelTilt}
            pointerStateRef={pointerStateRef}
            returnDamping={returnDamping}
            returnStiffness={returnStiffness}
            rotationAmplitude={rotationAmplitude}
            rotationProgress={rotationProgress}
          />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
