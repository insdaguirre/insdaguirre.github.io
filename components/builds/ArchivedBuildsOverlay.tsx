"use client";

import type { ComponentProps, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import ArchiveDomeGallery from "@/components/builds/ArchiveDomeGallery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export type ArchivedBuildsOverlayGalleryProps = ComponentProps<
  typeof ArchiveDomeGallery
>;

interface ArchivedBuildsOverlayProps extends ArchivedBuildsOverlayGalleryProps {
  isVisible: boolean;
  onClose: () => void;
  onHidden: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}

function getFocusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.tabIndex !== -1 &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

export default function ArchivedBuildsOverlay({
  isVisible,
  onClose,
  onHidden,
  returnFocusRef,
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
}: ArchivedBuildsOverlayProps) {
  const reducedMotion = useReducedMotion();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const focusTimeoutRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);
  const scrollLockActiveRef = useRef(false);
  const bodyStyleSnapshotRef = useRef({
    overflow: "",
    position: "",
    top: "",
    width: "",
  });

  function restoreBodyScrollLock(keepOverflowHidden: boolean) {
    const body = document.body;

    body.style.position = bodyStyleSnapshotRef.current.position;
    body.style.top = bodyStyleSnapshotRef.current.top;
    body.style.width = bodyStyleSnapshotRef.current.width;
    body.style.overflow = keepOverflowHidden
      ? "hidden"
      : bodyStyleSnapshotRef.current.overflow;

    if (scrollLockActiveRef.current) {
      window.scrollTo(0, scrollPositionRef.current);
      scrollLockActiveRef.current = false;
    }
  }

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    const body = document.body;

    scrollPositionRef.current = window.scrollY;
    bodyStyleSnapshotRef.current = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPositionRef.current}px`;
    body.style.width = "100%";
    scrollLockActiveRef.current = true;

    return () => {
      restoreBodyScrollLock(false);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    restoreBodyScrollLock(true);
  }, [isVisible]);

  useEffect(() => {
    focusTimeoutRef.current = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, reducedMotion ? 160 : 320);

    return () => {
      if (focusTimeoutRef.current) {
        window.clearTimeout(focusTimeoutRef.current);
      }
    };
  }, [reducedMotion]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      if (event.key === "Escape") {
        const nestedDialog = dialog.querySelector(
          "[role='dialog'][aria-modal='true'][aria-labelledby^='archive-focus-title-']",
        );

        if (nestedDialog) {
          return;
        }

        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const isInside = activeElement ? dialog.contains(activeElement) : false;

      if (event.shiftKey) {
        if (!isInside || activeElement === first) {
          event.preventDefault();
          last.focus();
        }

        return;
      }

      if (!isInside || activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onClose]);

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Archived Builds"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{
        duration: reducedMotion ? 0.2 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (isVisible) {
          return;
        }

        requestAnimationFrame(() => {
          returnFocusRef.current?.focus({ preventScroll: true });
        });
        onHidden();
      }}
      className="fixed inset-0 z-[60] flex h-[100dvh] flex-col bg-[rgba(8,5,17,0.96)]"
    >
      <div className="flex h-14 items-center justify-between gap-4 border-b border-white/8 px-5 sm:px-6">
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-white/38">
          {projects.length.toString().padStart(2, "0")} archived builds
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close Archived Builds"
          className="min-h-11 rounded-full border border-white/12 bg-black/28 px-[0.82rem] py-[0.52rem] text-[0.58rem] uppercase tracking-[0.24em] text-white/80 transition-colors hover:border-white/22 hover:bg-white/8 hover:text-white/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Close
        </button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <ArchiveDomeGallery
            projects={projects}
            fit={fit}
            fitBasis={fitBasis}
            minRadius={minRadius}
            maxRadius={maxRadius}
            padFactor={padFactor}
            overlayBlurColor={overlayBlurColor ?? "#080511"}
            maxVerticalRotationDeg={maxVerticalRotationDeg}
            dragSensitivity={dragSensitivity}
            segments={segments}
            dragDampening={dragDampening}
            grayscale={grayscale}
          />
        </div>
      </div>
    </motion.div>,
    portalTarget,
  );
}
