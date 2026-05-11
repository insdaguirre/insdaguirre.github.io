"use client";

import type { PastProject } from "@/components/builds/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "@/components/builds/ArchivedBuildsEntry.module.css";
import ArchivedBuildsOverlay, {
  type ArchivedBuildsOverlayGalleryProps,
} from "@/components/builds/ArchivedBuildsOverlay";
import ComputerModelStage, {
  type Phase,
} from "@/components/builds/ComputerModelStage";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ArchivedBuildsEntryProps
  extends Omit<ArchivedBuildsOverlayGalleryProps, "projects"> {
  projects: PastProject[];
}

function HintBadge({ phase }: { phase: Phase }) {
  const visible = phase === "idle" || phase === "hover";

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: visible ? (phase === "hover" ? 1 : 0.74) : 0,
        y: phase === "hover" ? -4 : 0,
      }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={styles.hintBadge}
    >
      ↗ Open Archive
    </motion.div>
  );
}

export default function ArchivedBuildsEntry({
  projects,
  fit,
  fitBasis,
  minRadius,
  maxRadius,
  padFactor,
  overlayBlurColor,
  maxVerticalRotationDeg,
  dragSensitivity,
  segments,
  dragDampening,
  grayscale,
}: ArchivedBuildsEntryProps) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);
  const stageTriggerRef = useRef<HTMLButtonElement>(null);
  const activationTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const activationDuration = reducedMotion ? 180 : 650;
  const transitionDuration = reducedMotion ? 200 : 500;

  const clearTimers = useCallback(() => {
    if (activationTimerRef.current) {
      window.clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
    }

    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleHoverChange = useCallback((hovered: boolean) => {
    setPhase((currentPhase) => {
      if (currentPhase !== "idle" && currentPhase !== "hover") {
        return currentPhase;
      }

      return hovered ? "hover" : "idle";
    });
  }, []);

  const handleActivationComplete = useCallback(() => {
    if (phase !== "activating") {
      return;
    }

    clearTimers();
    setPhase("expanding");
    setShouldRenderOverlay(true);
    setOverlayVisible(true);
    openTimerRef.current = window.setTimeout(() => {
      setPhase("open");
      openTimerRef.current = null;
    }, transitionDuration);
  }, [clearTimers, phase, transitionDuration]);

  const handleActivate = useCallback(() => {
    if (phase !== "idle" && phase !== "hover") {
      return;
    }

    clearTimers();
    setPhase("activating");
    setOverlayVisible(false);
    activationTimerRef.current = window.setTimeout(() => {
      handleActivationComplete();
      activationTimerRef.current = null;
    }, activationDuration);
  }, [activationDuration, clearTimers, handleActivationComplete, phase]);

  const handleClose = useCallback(() => {
    if (!overlayVisible) {
      return;
    }

    clearTimers();
    setOverlayVisible(false);
    setPhase("collapsing");
    idleTimerRef.current = window.setTimeout(() => {
      setPhase("idle");
      idleTimerRef.current = null;
    }, transitionDuration);
  }, [clearTimers, overlayVisible, transitionDuration]);

  const handleOverlayHidden = useCallback(() => {
    setShouldRenderOverlay(false);
  }, []);

  const galleryProps = {
    projects,
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    maxVerticalRotationDeg,
    dragSensitivity,
    segments,
    dragDampening,
    grayscale,
  } satisfies ArchivedBuildsOverlayGalleryProps;

  return (
    <div className="relative h-[32rem] [contain:layout_paint] sm:h-[40rem] lg:h-[46rem]">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{
          opacity: overlayVisible ? 0 : 1,
          scale:
            reducedMotion || (phase !== "activating" && phase !== "expanding")
              ? 1
              : 1.04,
        }}
        transition={{
          duration: reducedMotion ? 0.2 : 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ pointerEvents: overlayVisible ? "none" : "auto" }}
      >
        <div
          className={`${styles.stageGlow} absolute inset-0 rounded-[inherit]`}
          data-hovered={phase === "hover"}
          data-activating={phase === "activating" || phase === "expanding"}
        >
          <ComputerModelStage
            ref={stageTriggerRef}
            phase={phase}
            onActivate={handleActivate}
            onActivationComplete={handleActivationComplete}
            onHoverChange={handleHoverChange}
          />
          <HintBadge phase={phase} />
        </div>
      </motion.div>

      {shouldRenderOverlay ? (
        <ArchivedBuildsOverlay
          {...galleryProps}
          isVisible={overlayVisible}
          onClose={handleClose}
          onHidden={handleOverlayHidden}
          returnFocusRef={stageTriggerRef}
        />
      ) : null}
    </div>
  );
}
