"use client";

import type { MotionValue } from "framer-motion";
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Bounds, Center, Html, Preload } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const MODEL_URL = "/models/uploads_files_6149127_mclaren_mp45_2k.glb";

interface ModelViewerPlaceholderProps {
  scrollYProgress: MotionValue<number>;
}

interface ModelObjectProps extends ModelViewerPlaceholderProps {
  dragQuaternionRef: MutableRefObject<THREE.Quaternion>;
  dragTargetQuaternionRef: MutableRefObject<THREE.Quaternion>;
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

function ModelObject({
  scrollYProgress,
  dragQuaternionRef,
  dragTargetQuaternionRef,
}: ModelObjectProps) {
  const reducedMotion = useReducedMotion();
  const gltf = useLoader(GLTFLoader, MODEL_URL);
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

    const progress = scrollYProgress.get();
    const spinProgress = THREE.MathUtils.clamp((progress - 0.14) / 0.58, 0, 1);
    const baseRotation = reducedMotion ? 0 : spinProgress * Math.PI * 1.35;

    dragQuaternionRef.current.slerp(
      dragTargetQuaternionRef.current,
      1 - Math.exp(-10 * delta)
    );

    baseEulerRef.current.set(-0.08, baseRotation, 0);
    baseQuaternionRef.current.setFromEuler(baseEulerRef.current);
    groupRef.current.quaternion.copy(
      baseQuaternionRef.current.clone().multiply(dragQuaternionRef.current)
    );
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

function SafeModelObject({
  scrollYProgress,
  dragQuaternionRef,
  dragTargetQuaternionRef,
}: ModelObjectProps) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return <ErrorState />;
  }

  try {
    return (
      <ModelObject
        scrollYProgress={scrollYProgress}
        dragQuaternionRef={dragQuaternionRef}
        dragTargetQuaternionRef={dragTargetQuaternionRef}
      />
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    console.error("Failed to load 3D model:", error);
    return <ErrorState />;
  }
}

export default function ModelViewerPlaceholder({
  scrollYProgress,
}: ModelViewerPlaceholderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragQuaternionRef = useRef(new THREE.Quaternion());
  const dragTargetQuaternionRef = useRef(new THREE.Quaternion());
  const pointerStateRef = useRef({
    active: false,
    pointerId: -1,
    startVector: new THREE.Vector3(0, 0, 1),
    startQuaternion: new THREE.Quaternion(),
  });

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    pointerStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startVector: projectToArcball(event.clientX, event.clientY, rect),
      startQuaternion: dragTargetQuaternionRef.current.clone(),
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
    dragTargetQuaternionRef.current.copy(nextQuaternion);
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
    dragTargetQuaternionRef.current.identity();
  }

  return (
    <div
      ref={wrapperRef}
      className="relative h-[66vh] w-full max-w-[1080px] cursor-grab [touch-action:pan-y] active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
    >
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.9, 8], fov: 30 }}
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
          <Bounds fit clip observe margin={1.2}>
            <SafeModelObject
              dragQuaternionRef={dragQuaternionRef}
              dragTargetQuaternionRef={dragTargetQuaternionRef}
              scrollYProgress={scrollYProgress}
            />
          </Bounds>
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
