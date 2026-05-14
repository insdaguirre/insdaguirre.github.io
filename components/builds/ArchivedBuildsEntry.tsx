"use client";

import type {
  ComponentProps,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { PastProject } from "@/components/builds/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ArchiveDomeGallery from "@/components/builds/ArchiveDomeGallery";
import styles from "@/components/builds/ArchivedBuildsEntry.module.css";
import ComputerModelStage, {
  type Phase,
} from "@/components/builds/ComputerModelStage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ARCHIVE_IMMERSIVE_VISIBILITY_EVENT } from "@/lib/archive-ui";

type ArchiveGalleryProps = ComponentProps<typeof ArchiveDomeGallery>;

interface ArchivedBuildsEntryProps extends Omit<ArchiveGalleryProps, "projects"> {
  projects: PastProject[];
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const COMPACT_ARCHIVE_QUERY = "(max-width: 767px)";

function getFocusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.tabIndex !== -1 &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

function restoreScrollPosition(position: number) {
  scrollToPageY(position);
}

function scrollToPageY(position: number) {
  const html = document.documentElement;
  const previousScrollBehavior = html.style.scrollBehavior;

  html.style.scrollBehavior = "auto";
  window.scrollTo(0, position);
  html.style.scrollBehavior = previousScrollBehavior;
}

function InstructionCopy({ phase }: { phase: Phase }) {
  const visible = phase === "idle" || phase === "hover";

  if (!visible) {
    return null;
  }

  return (
    <motion.p
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: phase === "hover" ? 0.92 : 0.72,
        y: phase === "hover" ? -2 : 0,
      }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={styles.instructionCopy}
    >
      Click the Commodore 64 to view past builds.
    </motion.p>
  );
}

function HoverCue({ phase }: { phase: Phase }) {
  const visible = phase === "idle" || phase === "hover";

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: phase === "hover" ? 1 : 0,
        scale: phase === "hover" ? 1 : 0.96,
        y: phase === "hover" ? 0 : 8,
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={styles.hoverCue}
    >
      Click to open
    </motion.div>
  );
}

function useCompactArchiveViewport() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_ARCHIVE_QUERY);
    const updateCompactState = () => setIsCompact(mediaQuery.matches);

    updateCompactState();
    mediaQuery.addEventListener("change", updateCompactState);

    return () => {
      mediaQuery.removeEventListener("change", updateCompactState);
    };
  }, []);

  return isCompact;
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
  const isCompactArchiveViewport = useCompactArchiveViewport();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pageFadeState, setPageFadeState] = useState<
    "hidden" | "covering" | "revealing"
  >("hidden");
  const phaseRef = useRef<Phase>("idle");
  const entryRef = useRef<HTMLDivElement>(null);
  const stageTriggerRef = useRef<HTMLButtonElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollReturnRef = useRef(0);
  const activationTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const pageFadeTimerRef = useRef<number | null>(null);

  const activationFallbackDelay = reducedMotion ? 120 : 720;
  const screenRevealDelay = reducedMotion ? 80 : 760;
  const collapseDelay = reducedMotion ? 120 : 540;
  const pageFadeDuration = reducedMotion ? 120 : 360;
  const isImmersivePhase = phase !== "idle" && phase !== "hover";
  const isPageFadeActive = pageFadeState !== "hidden";
  const useMobileArchiveSurface =
    isCompactArchiveViewport && (phase === "expanding" || phase === "open");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimers = useCallback(() => {
    if (activationTimerRef.current) {
      window.clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
    }

    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (pageFadeTimerRef.current) {
      window.clearTimeout(pageFadeTimerRef.current);
      pageFadeTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!isImmersivePhase) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isImmersivePhase]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(ARCHIVE_IMMERSIVE_VISIBILITY_EVENT, {
        detail: { visible: isImmersivePhase },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent(ARCHIVE_IMMERSIVE_VISIBILITY_EVENT, {
          detail: { visible: false },
        }),
      );
    };
  }, [isImmersivePhase]);

  useEffect(() => {
    if (phase !== "open") {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, reducedMotion ? 60 : 160);

    return () => window.clearTimeout(focusTimer);
  }, [phase, reducedMotion]);

  const handleHoverChange = useCallback((hovered: boolean) => {
    setPhase((currentPhase) => {
      if (currentPhase !== "idle" && currentPhase !== "hover") {
        return currentPhase;
      }

      const nextPhase = hovered ? "hover" : "idle";
      phaseRef.current = nextPhase;
      return nextPhase;
    });
  }, []);

  const handleActivationComplete = useCallback(() => {
    if (phaseRef.current !== "activating") {
      return;
    }

    if (activationTimerRef.current) {
      window.clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
    }

    phaseRef.current = "expanding";
    setPhase("expanding");

    openTimerRef.current = window.setTimeout(() => {
      phaseRef.current = "open";
      setPhase("open");
      openTimerRef.current = null;
    }, screenRevealDelay);
  }, [screenRevealDelay]);

  const alignEntryToViewport = useCallback(() => {
    const entry = entryRef.current;

    if (!entry) {
      return;
    }

    const targetScrollY = window.scrollY + entry.getBoundingClientRect().top;
    scrollToPageY(Math.max(0, Math.round(targetScrollY)));
  }, []);

  const handleActivate = useCallback(() => {
    if (phaseRef.current !== "idle" && phaseRef.current !== "hover") {
      return;
    }

    clearTimers();
    scrollReturnRef.current = window.scrollY;
    alignEntryToViewport();
    setPageFadeState("covering");
    phaseRef.current = "activating";
    setPhase("activating");

    activationTimerRef.current = window.setTimeout(() => {
      activationTimerRef.current = null;
      handleActivationComplete();
    }, activationFallbackDelay);
  }, [
    activationFallbackDelay,
    alignEntryToViewport,
    clearTimers,
    handleActivationComplete,
  ]);

  const handleClose = useCallback(() => {
    if (phaseRef.current !== "open" && phaseRef.current !== "expanding") {
      return;
    }

    clearTimers();
    phaseRef.current = "collapsing";
    setPhase("collapsing");

    closeTimerRef.current = window.setTimeout(() => {
      phaseRef.current = "idle";
      setPhase("idle");
      closeTimerRef.current = null;
      setPageFadeState("revealing");

      pageFadeTimerRef.current = window.setTimeout(() => {
        setPageFadeState("hidden");
        pageFadeTimerRef.current = null;
      }, pageFadeDuration);

      requestAnimationFrame(() => {
        restoreScrollPosition(scrollReturnRef.current);
        stageTriggerRef.current?.focus({ preventScroll: true });
      });
    }, collapseDelay);
  }, [clearTimers, collapseDelay, pageFadeDuration]);

  const handleScreenKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const screen = screenRef.current;

      if (!screen || phaseRef.current !== "open") {
        return;
      }

      if (event.key === "Escape") {
        const nestedDialog = screen.querySelector(
          "[role='dialog'][aria-modal='true'][aria-labelledby^='archive-focus-title-']",
        );

        if (nestedDialog) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        handleClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(screen);

      if (focusableElements.length === 0) {
        event.preventDefault();
        screen.focus({ preventScroll: true });
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const isInside = activeElement ? screen.contains(activeElement) : false;

      if (event.shiftKey) {
        if (!isInside || activeElement === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }

        return;
      }

      if (!isInside || activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    },
    [handleClose],
  );

  const galleryProps = useMemo(
    () =>
      ({
        projects,
        fit,
        fitBasis,
        minRadius,
        maxRadius,
        padFactor,
        overlayBlurColor: overlayBlurColor ?? "#030604",
        maxVerticalRotationDeg,
        dragSensitivity,
        segments,
        dragDampening,
        grayscale,
      }) satisfies ArchiveGalleryProps,
    [
      dragDampening,
      dragSensitivity,
      fit,
      fitBasis,
      grayscale,
      maxRadius,
      maxVerticalRotationDeg,
      minRadius,
      overlayBlurColor,
      padFactor,
      projects,
      segments,
    ],
  );

  const screenContent = (
    <div
      ref={screenRef}
      role="dialog"
      aria-hidden={phase === "open" ? undefined : true}
      aria-modal={phase === "open" ? "true" : undefined}
      aria-label="Archived builds"
      tabIndex={-1}
      className={styles.screenArchiveSurface}
      onKeyDown={handleScreenKeyDown}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={handleClose}
        aria-label="Close archive"
        className={styles.screenArchiveCloseButton}
      >
        X
      </button>
      <div className={styles.screenArchiveGallery}>
        <ArchiveDomeGallery {...galleryProps} />
      </div>
    </div>
  );

  return (
    <div
      ref={entryRef}
      className={`relative h-[100svh] min-h-[40rem] [contain:layout_paint] ${
        isImmersivePhase || isPageFadeActive ? "z-[80]" : "z-0"
      }`.trim()}
    >
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: pageFadeState === "covering" ? 1 : 0,
        }}
        transition={{
          duration: pageFadeDuration / 1000,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={styles.pageFadeMask}
        style={{
          pointerEvents: pageFadeState === "covering" ? "auto" : "none",
        }}
      />
      <div
        className={`${styles.stageGlow} absolute inset-0 z-10`}
        data-hovered={phase === "hover"}
        data-activating={phase === "activating" || phase === "expanding"}
        data-screen={phase === "open"}
      >
        <InstructionCopy phase={phase} />
        <ComputerModelStage
          ref={stageTriggerRef}
          ariaLabel="Open the archived builds on the Commodore 64 screen."
          cameraFov={isCompactArchiveViewport ? 36 : 26}
          cameraLookAt={
            isCompactArchiveViewport ? [0, 0.11, -0.02] : [0, 0.13, -0.04]
          }
          cameraPosition={
            isCompactArchiveViewport ? [0.02, 0.2, 3.15] : [0, 0.18, 1.86]
          }
          centerModel={false}
          className="absolute inset-0"
          fitBounds={false}
          hoverEulerOffset={[0.028, 0.12, -0.012]}
          hoverScale={1.04}
          idleEuler={[-0.05, -0.46, 0.015]}
          idleSpinSpeed={0}
          immersiveCamera
          immersiveCameraFov={isCompactArchiveViewport ? 38 : 24}
          immersiveCameraLookAt={
            isCompactArchiveViewport ? [0, 0.17, -0.03] : [0, 0.191, -0.03]
          }
          immersiveCameraPosition={
            isCompactArchiveViewport ? [0, 0.19, 1.08] : [0, 0.187, 0.62]
          }
          interactionMode="click"
          lightingVariant="contrast"
          materialVariant="source"
          onActivate={handleActivate}
          onActivationComplete={handleActivationComplete}
          onHoverChange={handleHoverChange}
          phase={phase}
          screenContent={useMobileArchiveSurface ? undefined : screenContent}
          screenContentInteractive={!useMobileArchiveSurface && phase === "open"}
          screenContentVisible={!useMobileArchiveSurface && phase === "open"}
          screenFacingEuler={[0, 0, 0]}
          variant="minimal"
        />
        <HoverCue phase={phase} />
      </div>
      {useMobileArchiveSurface ? (
        <motion.div
          initial={false}
          animate={{
            opacity: phase === "open" ? 1 : 0,
          }}
          transition={{
            duration: reducedMotion ? 0 : 0.22,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={styles.mobileArchiveViewport}
          style={{
            pointerEvents: phase === "open" ? "auto" : "none",
          }}
        >
          {screenContent}
        </motion.div>
      ) : null}
    </div>
  );
}
