"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGLTF } from "@react-three/drei";
import ComputerModelStage, {
  type Phase,
} from "@/components/builds/ComputerModelStage";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ABOUT_MODEL_URL = "/models/about-bridge-model.glb";
const ABOUT_SCENE_EULER = [0, 0, 0] as const;
const ABOUT_IDLE_EULER = [0.22, -1.42, 0.02] as const;
const OMITTED_ABOUT_MODEL_NODES = [
  "Camera",
  "Camera.02",
  "Empty",
  "NurbsPath",
  "water",
  "Sun",
  "Point",
] as const;

export default function AboutBuildsTeaser() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [fading, setFading] = useState(false);
  const omittedNodeNames = useMemo(() => OMITTED_ABOUT_MODEL_NODES, []);

  const activationDuration = reducedMotion ? 180 : 650;
  const transitionDuration = reducedMotion ? 200 : 500;

  const activationTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const activationTimer = activationTimerRef;
    const transitionTimer = transitionTimerRef;
    return () => {
      if (activationTimer.current) window.clearTimeout(activationTimer.current);
      if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  // Called when the 3-D rotation settle animation completes inside ComputerModelStage.
  // At this point the model is face-forward; begin the full-viewport fade to black.
  const handleActivationComplete = useCallback(() => {
    if (phase !== "activating") return;
    setPhase("expanding");
    setFading(true);
  }, [phase]);

  // Called when the user clicks the model.
  const handleActivate = useCallback(() => {
    if (phase !== "idle" && phase !== "hover") return;

    setPhase("activating");

    // Safety-net timeout: if onActivationComplete never fires (e.g. reduced-motion
    // shortcircuits the quaternion settle), still proceed after activationDuration.
    activationTimerRef.current = window.setTimeout(() => {
      activationTimerRef.current = null;
      setPhase((current) => {
        if (current !== "activating") return current;
        setFading(true);
        return "expanding";
      });
    }, activationDuration);
  }, [activationDuration, phase]);

  const handleHoverChange = useCallback((hovered: boolean) => {
    setPhase((current) => {
      if (current !== "idle" && current !== "hover") return current;
      return hovered ? "hover" : "idle";
    });
  }, []);

  // Navigate once the fade-to-black is fully opaque.
  const handleFadeComplete = useCallback(() => {
    if (!fading) return;
    window.location.href = "/builds/";
  }, [fading]);

  const isActivating = phase === "activating" || phase === "expanding";

  return (
    <section className="relative overflow-hidden">
      {/* Full-viewport fade-to-black overlay, rendered via portal-like fixed positioning */}
      {fading ? (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration / 1000, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={handleFadeComplete}
        />
      ) : null}

      <div className="relative z-10 flex flex-col items-center py-8 sm:py-[2.8rem] lg:py-[3.2rem]">
        <p className="text-center text-[0.62rem] uppercase tracking-[0.32em] text-white/38">
          Drag or click to open /builds.
        </p>
        <motion.div
          className="relative mt-5 h-[22rem] w-full max-w-[42rem] sm:h-[29rem] sm:max-w-[51rem] lg:h-[37rem] lg:max-w-[64rem]"
          initial={false}
          animate={{
            scale: !reducedMotion && isActivating ? 1.04 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[14%] bottom-[12%] h-20 rounded-full bg-[radial-gradient(circle,rgba(120,150,255,0.18),rgba(120,150,255,0))] blur-2xl"
          />
          <ComputerModelStage
            ariaLabel="Interactive 3D bridge model. Click to open the builds page."
            boundsMargin={0.55}
            cameraFov={28}
            className="absolute inset-0"
            fitBounds
            hoverEulerOffset={[0.04, 0.18, -0.02]}
            hoverScale={1.14}
            idleEuler={ABOUT_IDLE_EULER}
            idleSpinSpeed={0.045}
            interactionMode="drag"
            lightingVariant="default"
            materialVariant="source"
            modelUrl={ABOUT_MODEL_URL}
            omitNodeNames={omittedNodeNames}
            sceneEuler={ABOUT_SCENE_EULER}
            onActivate={handleActivate}
            onActivationComplete={handleActivationComplete}
            onHoverChange={handleHoverChange}
            phase={phase}
            variant="minimal"
          />
        </motion.div>
      </div>
    </section>
  );
}

useGLTF.preload(ABOUT_MODEL_URL);
