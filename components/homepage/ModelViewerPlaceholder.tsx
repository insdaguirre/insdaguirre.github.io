"use client";

import type { MotionValue } from "framer-motion";
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Bounds, Center, Html, Preload } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const MODEL_URL = "/models/mclaren_mp45.obj";

interface ModelViewerPlaceholderProps {
  scrollYProgress: MotionValue<number>;
}

interface ModelObjectProps extends ModelViewerPlaceholderProps {
  dragOffsetRef: MutableRefObject<number>;
  dragTargetRef: MutableRefObject<number>;
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

function ModelObject({
  scrollYProgress,
  dragOffsetRef,
  dragTargetRef,
}: ModelObjectProps) {
  const reducedMotion = useReducedMotion();
  const source = useLoader(OBJLoader, MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = source.clone();
    const defaultMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8d8d8"),
      metalness: 0.72,
      roughness: 0.28,
    });

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      child.material = Array.isArray(child.material)
        ? child.material.map(() => defaultMaterial.clone())
        : defaultMaterial.clone();
    });

    return clone;
  }, [source]);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    const progress = scrollYProgress.get();
    const spinProgress = THREE.MathUtils.clamp((progress - 0.14) / 0.58, 0, 1);
    const baseRotation = reducedMotion ? 0 : spinProgress * Math.PI * 1.35;

    dragOffsetRef.current = THREE.MathUtils.damp(
      dragOffsetRef.current,
      dragTargetRef.current,
      dragTargetRef.current === 0 ? 9 : 14,
      delta
    );

    groupRef.current.rotation.x = -0.08;
    groupRef.current.rotation.y = baseRotation + dragOffsetRef.current;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

export default function ModelViewerPlaceholder({
  scrollYProgress,
}: ModelViewerPlaceholderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);
  const dragTargetRef = useRef(0);
  const pointerStateRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startOffset: 0,
  });

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pointerStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: dragTargetRef.current,
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

    const width = wrapperRef.current?.clientWidth ?? 1;
    const deltaX = event.clientX - pointerStateRef.current.startX;
    const deltaRotation = (deltaX / width) * Math.PI * 0.8;

    dragTargetRef.current = THREE.MathUtils.clamp(
      pointerStateRef.current.startOffset + deltaRotation,
      -0.7,
      0.7
    );
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
    dragTargetRef.current = 0;
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
            <ModelObject
              dragOffsetRef={dragOffsetRef}
              dragTargetRef={dragTargetRef}
              scrollYProgress={scrollYProgress}
            />
          </Bounds>
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
