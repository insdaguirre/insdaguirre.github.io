"use client";

import type { PastProject } from "@/components/builds/types";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion } from "framer-motion";
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

interface ScreenRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Portals a fixed overlay to document.body and animates it from the recorded
 * stage rect to full viewport. Using a portal bypasses [contain:layout_paint]
 * on the parent, which would otherwise trap position:fixed children.
 *
 * Animation is driven imperatively with Framer's `animate()` function so we
 * have full control over the sequence and callbacks, and avoid mixing string
 * units (vw/dvh) with pixel values in a single keyframe object.
 */
interface ScreenTransitionSurfaceProps {
  phase: Phase;
  stageRect: ScreenRect | null;
  reducedMotion: boolean;
  onExpandComplete: () => void;
  onRevealComplete: () => void;
}

function noop() {}

function ScreenTransitionSurface({
  phase,
  stageRect,
  reducedMotion,
  onExpandComplete,
  onRevealComplete,
}: ScreenTransitionSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dissolveRef = useRef<HTMLDivElement>(null);
  const prevPhaseRef = useRef<Phase>("idle");
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useLayoutEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    const surface = surfaceRef.current;
    const stage = stageRef.current;
    const dissolve = dissolveRef.current;
    const animationControls: { stop: () => void }[] = [];

    if (
      phase === "screenExpanding" &&
      prev === "activating" &&
      stageRect &&
      surface &&
      stage &&
      dissolve
    ) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Snap to stage rect with no animation
      Object.assign(surface.style, {
        top: `${stageRect.top}px`,
        left: `${stageRect.left}px`,
        width: `${stageRect.width}px`,
        height: `${stageRect.height}px`,
        borderRadius: "0.75rem",
      });
      Object.assign(stage.style, {
        opacity: "1",
        transform: "scale(1)",
      });
      Object.assign(dissolve.style, {
        opacity: "0",
      });

      // Animate pixel values to full viewport dimensions
      animationControls.push(
        animate(
          surface,
          {
            top: [stageRect.top, 0],
            left: [stageRect.left, 0],
            width: [stageRect.width, vw],
            height: [stageRect.height, vh],
            borderRadius: ["0.75rem", "0rem"],
          },
          {
            duration: reducedMotion ? 0.15 : 0.72,
            ease: [0.16, 1, 0.3, 1],
            onComplete: onExpandComplete,
          },
        ),
      );
    }

    if (phase === "revealing" && prev === "screenExpanding" && stage && dissolve) {
      Object.assign(dissolve.style, {
        opacity: "0.42",
      });

      animationControls.push(
        animate(
          stage,
          {
            opacity: [1, 0],
            scale: reducedMotion ? [1, 1] : [1, 1.03],
          },
          {
            duration: reducedMotion ? 0.18 : 0.56,
            ease: [0.22, 1, 0.36, 1],
          },
        ),
      );

      animationControls.push(
        animate(
          dissolve,
          { opacity: [0.42, 0] },
          {
            duration: reducedMotion ? 0.18 : 0.58,
            ease: [0.4, 0, 0.2, 1],
            onComplete: onRevealComplete,
          },
        ),
      );
    }

    return () => {
      animationControls.forEach((control) => {
        control.stop();
      });
    };
  }, [phase, stageRect, reducedMotion, onExpandComplete, onRevealComplete]);

  const isActive = phase === "screenExpanding" || phase === "revealing";

  if (!isActive || !stageRect || !portalTarget) {
    return null;
  }

  return createPortal(
    <>
      {/* SVG filter for phosphor-grain fizzle on dissolve */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter
            id="screen-grain"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72 0.68"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* Transition surface — fixed to viewport, escapes all CSS containment */}
      <div
        ref={surfaceRef}
        aria-hidden="true"
        className={styles.screenTransitionSurface}
        style={{
          position: "fixed",
          zIndex: 9000,
          overflow: "hidden",
          pointerEvents: "none",
          // Initial position — will be overwritten by the useEffect snap
          top: stageRect.top,
          left: stageRect.left,
          width: stageRect.width,
          height: stageRect.height,
          borderRadius: "0.75rem",
        }}
      >
        <div ref={stageRef} className={styles.screenTransitionStage}>
          <ComputerModelStage
            phase={phase}
            onActivate={noop}
            onActivationComplete={noop}
            className="h-full w-full"
          />
        </div>
        {/* Dark dissolve layer that fades out to reveal the archive */}
        <div
          ref={dissolveRef}
          className={styles.screenDissolve}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
          }}
        />
      </div>
    </>,
    portalTarget,
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
  const [stageRect, setStageRect] = useState<ScreenRect | null>(null);
  const stageTriggerRef = useRef<HTMLButtonElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const activationTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const activationDuration = reducedMotion ? 180 : 650;

  const clearTimers = useCallback(() => {
    if (activationTimerRef.current) {
      window.clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
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
    if (activationTimerRef.current) {
      window.clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
    }

    setPhase((currentPhase) => {
      if (currentPhase !== "activating") return currentPhase;

      if (stageContainerRef.current) {
        const rect = stageContainerRef.current.getBoundingClientRect();
        setStageRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }

      return "screenExpanding";
    });
  }, []);

  const handleExpandComplete = useCallback(() => {
    setPhase((currentPhase) => {
      if (currentPhase !== "screenExpanding") return currentPhase;
      setShouldRenderOverlay(true);
      setOverlayVisible(true);
      return "revealing";
    });
  }, []);

  const handleRevealComplete = useCallback(() => {
    setPhase((currentPhase) => {
      if (currentPhase !== "revealing") return currentPhase;
      return "open";
    });
  }, []);

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
    }, activationDuration + 300);
  }, [activationDuration, clearTimers, handleActivationComplete, phase]);

  const handleClose = useCallback(() => {
    if (!overlayVisible && phase !== "open") {
      return;
    }

    clearTimers();
    setOverlayVisible(false);
    setPhase("collapsing");
    idleTimerRef.current = window.setTimeout(() => {
      setShouldRenderOverlay(false);
      setStageRect(null);
      setPhase("idle");
      idleTimerRef.current = null;
    }, reducedMotion ? 200 : 500);
  }, [clearTimers, overlayVisible, phase, reducedMotion]);

  const handleOverlayHidden = useCallback(() => {
    // no-op: cleanup handled in handleClose timer
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

  const isModelVisible =
    phase === "idle" ||
    phase === "hover" ||
    phase === "activating" ||
    phase === "collapsing";

  return (
    <div className="relative h-[32rem] sm:h-[40rem] lg:h-[46rem]">
      {/* Model stage */}
      <motion.div
        ref={stageContainerRef}
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: isModelVisible ? 1 : 0 }}
        transition={{
          duration: reducedMotion ? 0.08 : 0.18,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ pointerEvents: isModelVisible ? "auto" : "none" }}
      >
        <div
          className={`${styles.stageGlow} absolute inset-0 rounded-[inherit]`}
          data-hovered={phase === "hover"}
          data-activating={phase === "activating"}
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

      {/* Archive — mounted early so it's ready behind the transition surface */}
      {shouldRenderOverlay ? (
        <ArchivedBuildsOverlay
          {...galleryProps}
          isVisible={overlayVisible}
          onClose={handleClose}
          onHidden={handleOverlayHidden}
          returnFocusRef={stageTriggerRef}
        />
      ) : null}

      {/* Transition surface — portals to body to escape CSS containment */}
      <ScreenTransitionSurface
        phase={phase}
        stageRect={stageRect}
        reducedMotion={reducedMotion}
        onExpandComplete={handleExpandComplete}
        onRevealComplete={handleRevealComplete}
      />
    </div>
  );
}
