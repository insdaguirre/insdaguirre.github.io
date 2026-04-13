"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGLTF } from "@react-three/drei";
import ComputerModelStage, {
  type Phase,
} from "@/components/builds/ComputerModelStage";
import Waves from "@/components/shared/Waves";
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
    <section className="relative mt-10 mb-10 sm:mt-14 sm:mb-12 lg:mt-16 lg:mb-16 overflow-hidden">
      {/* Background matching AboutHero and AboutSignalBand with animated waves */}
      <div aria-hidden="true" className="absolute inset-0">
        <Waves
          lineColor="rgba(198,255,194,0.22)"
          backgroundColor="#040406"
          waveSpeedX={0.0125}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_22%_28%,rgba(82,39,255,0.105),transparent_18%),radial-gradient(circle_at_78%_32%,rgba(255,0,209,0.06),transparent_16%),linear-gradient(180deg,rgba(0,0,0,0.105),rgba(0,0,0,0.255)_44%,rgba(0,0,0,0.63)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_16%,transparent_84%,rgba(255,255,255,0.015))]" />
        <div className="absolute left-[10%] top-[18%] h-44 w-44 rounded-full bg-[#5227ff]/12 blur-[100px]" />
        <div className="absolute right-[14%] top-[24%] h-36 w-36 rounded-full bg-[#ff00d1]/8 blur-[90px]" />
      </div>

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

      <div className="relative z-10 flex flex-col items-center">
        <p className="text-center text-[0.62rem] uppercase tracking-[0.32em] text-white/38">
          Click to open /builds.
        </p>
        <motion.div
          className="relative mt-5 h-[20rem] w-full max-w-[52rem] sm:h-[26rem] sm:max-w-[60rem] lg:h-[32rem] lg:max-w-[72rem]"
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
            interactionMode="click"
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
