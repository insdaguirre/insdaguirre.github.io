"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import styles from "@/components/builds/ArchiveDomeGallery.module.css";
import type { PastProject } from "@/components/builds/types";

type DomeGalleryProps = {
  projects: PastProject[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  segments?: number;
  dragDampening?: number;
  grayscale?: boolean;
};

type ItemDef = {
  project: PastProject;
  projectOrder: number;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

type RectDef = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type OpenedTileState = {
  project: PastProject;
  projectOrder: number;
  tileInstanceIndex: number;
  originRect: RectDef;
  targetRect: RectDef;
  expanded: boolean;
  closing: boolean;
};

const DEFAULTS = {
  maxVerticalRotationDeg: 10,
  dragSensitivity: 20,
  segments: 30,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const wrapAngleSigned = (degrees: number) => {
  const normalized = (((degrees + 180) % 360) + 360) % 360;
  return normalized - 180;
};

function buildItems(pool: PastProject[], segments: number): ItemDef[] {
  const xStart = -(segments - 1);
  const xColumns = Array.from({ length: segments }, (_, index) => xStart + index * 2);
  const evenRows = [-4, -2, 0, 2, 4];
  const oddRows = [-3, -1, 1, 3, 5];

  const coordinates = xColumns.flatMap((x, columnIndex) => {
    const rows = columnIndex % 2 === 0 ? evenRows : oddRows;
    return rows.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  if (pool.length === 0) {
    return [];
  }

  const normalizedProjects = pool.map((project, projectOrder) => ({
    project,
    projectOrder,
  }));

  const usedProjects = Array.from(
    { length: coordinates.length },
    (_, index) => normalizedProjects[index % normalizedProjects.length],
  );

  for (let index = 1; index < usedProjects.length; index += 1) {
    if (usedProjects[index].project.href === usedProjects[index - 1].project.href) {
      for (let swapIndex = index + 1; swapIndex < usedProjects.length; swapIndex += 1) {
        if (
          usedProjects[swapIndex].project.href !== usedProjects[index].project.href
        ) {
          const nextProject = usedProjects[index];
          usedProjects[index] = usedProjects[swapIndex];
          usedProjects[swapIndex] = nextProject;
          break;
        }
      }
    }
  }

  return coordinates.map((coordinate, index) => ({
    ...coordinate,
    project: usedProjects[index].project,
    projectOrder: usedProjects[index].projectOrder,
  }));
}

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function getProjectMonogram(name: string) {
  const parts = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getRectRelativeToRoot(rect: DOMRect, rootRect: DOMRect): RectDef {
  return {
    left: rect.left - rootRect.left,
    top: rect.top - rootRect.top,
    width: rect.width,
    height: rect.height,
  };
}

export default function ArchiveDomeGallery({
  projects,
  fit = 1.02,
  fitBasis = "auto",
  minRadius = 620,
  maxRadius = Infinity,
  padFactor = 0.06,
  overlayBlurColor = "#080511",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  segments = DEFAULTS.segments,
  dragDampening = 0.82,
  grayscale = false,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedTileRef = useRef<HTMLButtonElement | null>(null);
  const openStartedAtRef = useRef(0);

  const rotationRef = useRef({ x: -1.5, y: -14 });
  const startRotationRef = useRef({ x: -1.5, y: -14 });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const activePointerIdRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const touchPendingRef = useRef(false);
  const movedRef = useRef(false);
  const lastDragEndAtRef = useRef(0);
  const inertiaFrameRef = useRef<number | null>(null);

  const [openedTile, setOpenedTile] = useState<OpenedTileState | null>(null);

  const items = useMemo(() => buildItems(projects, segments), [projects, segments]);

  const applyTransform = useCallback((xDegrees: number, yDegrees: number) => {
    if (!sphereRef.current) {
      return;
    }

    sphereRef.current.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDegrees}deg) rotateY(${yDegrees}deg)`;
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaFrameRef.current) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (velocityX: number, velocityY: number) => {
      const dampening = clamp(dragDampening, 0.2, 0.96);
      const friction = 0.935 + dampening * 0.035;
      const stopThreshold = 0.012;
      const maxFrames = Math.round(120 + 120 * dampening);
      let frameCount = 0;
      let nextVelocityX = clamp(velocityX, -1.4, 1.4) * 82;
      let nextVelocityY = clamp(velocityY, -1.4, 1.4) * 82;

      const step = () => {
        nextVelocityX *= friction;
        nextVelocityY *= friction;

        if (
          (Math.abs(nextVelocityX) < stopThreshold &&
            Math.abs(nextVelocityY) < stopThreshold) ||
          frameCount >= maxFrames
        ) {
          inertiaFrameRef.current = null;
          return;
        }

        frameCount += 1;

        const nextX = clamp(
          rotationRef.current.x - nextVelocityY / 220,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg,
        );
        const nextY = wrapAngleSigned(rotationRef.current.y + nextVelocityX / 220);

        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaFrameRef.current = requestAnimationFrame(step);
      };

      stopInertia();
      inertiaFrameRef.current = requestAnimationFrame(step);
    },
    [applyTransform, dragDampening, maxVerticalRotationDeg, stopInertia],
  );

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const contentRect = entries[0].contentRect;
      const width = Math.max(1, contentRect.width);
      const height = Math.max(1, contentRect.height);
      const minDimension = Math.min(width, height);
      const maxDimension = Math.max(width, height);
      const aspectRatio = width / height;

      let basis: number;
      switch (fitBasis) {
        case "min":
          basis = minDimension;
          break;
        case "max":
          basis = maxDimension;
          break;
        case "width":
          basis = width;
          break;
        case "height":
          basis = height;
          break;
        default:
          basis = aspectRatio >= 1.3 ? width : minDimension;
      }

      let radius = basis * fit;
      radius = Math.min(radius, height * 1.48);
      radius = clamp(radius, minRadius, maxRadius);

      const viewerPad = Math.max(12, Math.round(minDimension * padFactor));

      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });

    resizeObserver.observe(root);

    return () => resizeObserver.disconnect();
  }, [
    applyTransform,
    fit,
    fitBasis,
    grayscale,
    maxRadius,
    minRadius,
    overlayBlurColor,
    padFactor,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, [applyTransform]);

  useEffect(() => {
    return () => stopInertia();
  }, [stopInertia]);

  useEffect(() => {
    if (!openedTile || openedTile.expanded || openedTile.closing) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setOpenedTile((current) =>
        current && !current.expanded && !current.closing
          ? { ...current, expanded: true }
          : current,
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [openedTile]);

  useEffect(() => {
    if (!openedTile) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openedTile]);

  useEffect(() => {
    if (!openedTile?.expanded || openedTile.closing) {
      return;
    }

    const timeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [openedTile]);

  useEffect(() => {
    if (!openedTile) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedTile((current) => {
          if (!current || current.closing) {
            return current;
          }

          return { ...current, expanded: false, closing: true };
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openedTile]);

  const clearPointerTracking = useCallback(() => {
    activePointerIdRef.current = null;
    dragStartRef.current = null;
    lastSampleRef.current = null;
    draggingRef.current = false;
    touchPendingRef.current = false;
    movedRef.current = false;
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (openedTile) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      stopInertia();

      activePointerIdRef.current = event.pointerId;
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      startRotationRef.current = { ...rotationRef.current };
      lastSampleRef.current = {
        x: event.clientX,
        y: event.clientY,
        t: performance.now(),
      };
      velocityRef.current = { x: 0, y: 0 };
      movedRef.current = false;

      if (event.pointerType === "touch") {
        touchPendingRef.current = true;
        draggingRef.current = false;
        return;
      }

      draggingRef.current = true;
      touchPendingRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [openedTile, stopInertia],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (
        activePointerIdRef.current !== event.pointerId ||
        dragStartRef.current === null
      ) {
        return;
      }

      if (touchPendingRef.current && !draggingRef.current) {
        const deltaX = event.clientX - dragStartRef.current.x;
        const deltaY = event.clientY - dragStartRef.current.y;

        if (deltaX * deltaX + deltaY * deltaY < 36) {
          return;
        }

        if (Math.abs(deltaX) <= Math.abs(deltaY) + 4) {
          clearPointerTracking();
          return;
        }

        draggingRef.current = true;
        touchPendingRef.current = false;
        movedRef.current = true;
        startRotationRef.current = { ...rotationRef.current };
        dragStartRef.current = { x: event.clientX, y: event.clientY };
        lastSampleRef.current = {
          x: event.clientX,
          y: event.clientY,
          t: performance.now(),
        };
        velocityRef.current = { x: 0, y: 0 };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }

      if (!draggingRef.current) {
        return;
      }

      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;

      if (!movedRef.current && deltaX * deltaX + deltaY * deltaY > 16) {
        movedRef.current = true;
      }

      const nextX = clamp(
        startRotationRef.current.x - deltaY / dragSensitivity,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg,
      );
      const nextY = wrapAngleSigned(
        startRotationRef.current.y + deltaX / dragSensitivity,
      );

      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);

      const now = performance.now();
      const lastSample = lastSampleRef.current;

      if (lastSample) {
        const elapsed = Math.max(now - lastSample.t, 16);
        velocityRef.current = {
          x: (event.clientX - lastSample.x) / elapsed,
          y: (event.clientY - lastSample.y) / elapsed,
        };
      }

      lastSampleRef.current = { x: event.clientX, y: event.clientY, t: now };
    },
    [
      applyTransform,
      clearPointerTracking,
      dragSensitivity,
      maxVerticalRotationDeg,
    ],
  );

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const shouldContinueInertia = draggingRef.current && movedRef.current;
      const { x: velocityX, y: velocityY } = velocityRef.current;

      if (draggingRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      clearPointerTracking();

      if (shouldContinueInertia) {
        lastDragEndAtRef.current = performance.now();
        startInertia(velocityX, velocityY);
      }
    },
    [clearPointerTracking, startInertia],
  );

  const openTile = useCallback(
    (
      item: ItemDef,
      tileInstanceIndex: number,
      sourceButton: HTMLButtonElement,
    ) => {
      const root = rootRef.current;
      const frame = frameRef.current;

      if (!root || !frame) {
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const sourceRect = sourceButton.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();

      openStartedAtRef.current = performance.now();
      stopInertia();
      lastFocusedTileRef.current = sourceButton;

      setOpenedTile({
        project: item.project,
        projectOrder: item.projectOrder,
        tileInstanceIndex,
        originRect: getRectRelativeToRoot(sourceRect, rootRect),
        targetRect: getRectRelativeToRoot(frameRect, rootRect),
        expanded: false,
        closing: false,
      });
    },
    [stopInertia],
  );

  const handleTileClick = useCallback(
    (item: ItemDef, tileInstanceIndex: number) =>
      (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (
          draggingRef.current ||
          performance.now() - lastDragEndAtRef.current < 180 ||
          openedTile
        ) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        openTile(item, tileInstanceIndex, event.currentTarget);
      },
    [openTile, openedTile],
  );

  const requestClose = useCallback((ignoreStartDelay = false) => {
    setOpenedTile((current) => {
      if (!current || current.closing) {
        return current;
      }

      if (
        !ignoreStartDelay &&
        performance.now() - openStartedAtRef.current < 220
      ) {
        return current;
      }

      return {
        ...current,
        expanded: false,
        closing: true,
      };
    });
  }, []);

  const handleOpenedTileTransitionEnd = useCallback(
    (event: ReactTransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "width") {
        return;
      }

      setOpenedTile((current) => {
        if (!current || !current.closing || current.expanded) {
          return current;
        }

        requestAnimationFrame(() => lastFocusedTileRef.current?.focus());
        return null;
      });
    },
    [],
  );

  const openedCardRect =
    openedTile?.expanded && !openedTile.closing
      ? openedTile.targetRect
      : openedTile?.originRect;

  const openedCardStyle = openedCardRect
    ? ({
        left: `${openedCardRect.left}px`,
        top: `${openedCardRect.top}px`,
        width: `${openedCardRect.width}px`,
        height: `${openedCardRect.height}px`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-open={openedTile ? "true" : "false"}
      style={
        {
          ["--segments-x" as string]: segments,
          ["--segments-y" as string]: segments,
        } as CSSProperties
      }
    >
      <div
        className={styles.main}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className={styles.stage}>
          <div ref={sphereRef} className={styles.sphere}>
            {items.map((item, tileInstanceIndex) => (
              <div
                key={`${item.project.href}-${tileInstanceIndex}`}
                className={styles.item}
                style={
                  {
                    ["--offset-x" as string]: item.x,
                    ["--offset-y" as string]: item.y,
                    ["--item-size-x" as string]: item.sizeX,
                    ["--item-size-y" as string]: item.sizeY,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className={`${styles.tileButton} ${
                    openedTile?.tileInstanceIndex === tileInstanceIndex
                      ? styles.tileButtonHidden
                      : ""
                  }`}
                  aria-haspopup="dialog"
                  aria-expanded={openedTile?.tileInstanceIndex === tileInstanceIndex}
                  aria-label={
                    item.project.ariaLabel ??
                    `${item.project.ctaLabel ?? "Open Repository"} for ${item.project.name}`
                  }
                  onClick={handleTileClick(item, tileInstanceIndex)}
                >
                  <div className={styles.tileVisual}>
                    {item.project.imageSrc ? (
                      <img
                        src={item.project.imageSrc}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className={styles.tileImage}
                      />
                    ) : (
                      <div className={styles.tileFallback} aria-hidden="true">
                        <span>{getProjectMonogram(item.project.name)}</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.overlay} />
        <div className={`${styles.edgeFade} ${styles.edgeFadeTop}`} />
        <div className={`${styles.edgeFade} ${styles.edgeFadeBottom}`} />
      </div>

      <div className={styles.viewer} aria-hidden={openedTile ? undefined : "true"}>
        <button
          type="button"
          className={styles.scrim}
          onClick={() => requestClose(false)}
          aria-label="Close focused project"
        />
        <div ref={frameRef} className={styles.frame} aria-hidden="true" />

        {openedTile && openedCardStyle ? (
          <div
            className={styles.focusCard}
            data-expanded={
              openedTile.expanded && !openedTile.closing ? "true" : "false"
            }
            style={openedCardStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`archive-focus-title-${openedTile.tileInstanceIndex}`}
            onTransitionEnd={handleOpenedTileTransitionEnd}
          >
            <div className={styles.focusMedia}>
              {openedTile.project.imageSrc ? (
                <img
                  src={openedTile.project.imageSrc}
                  alt={openedTile.project.imageAlt ?? openedTile.project.name}
                  className={styles.focusImage}
                />
              ) : (
                <div className={styles.focusFallback} aria-hidden="true">
                  <span>{getProjectMonogram(openedTile.project.name)}</span>
                </div>
              )}
            </div>

            <div className={styles.focusShade} />

            <div className={styles.focusTopRow}>
              <div className={styles.focusEyebrowRow}>
                <span className={styles.focusIndex}>
                  {String(openedTile.projectOrder + 1).padStart(2, "0")}
                </span>
                <span className={styles.focusBadge}>
                  {openedTile.project.badgeLabel ?? "GitHub"}
                </span>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className={styles.focusCloseButton}
                onClick={() => requestClose(true)}
              >
                Close
              </button>
            </div>

            <div className={styles.focusInfo}>
              <div className={styles.focusCopy}>
                <h3
                  id={`archive-focus-title-${openedTile.tileInstanceIndex}`}
                  className={styles.focusTitle}
                >
                  {openedTile.project.name}
                </h3>
                <p className={styles.focusRepository}>
                  {openedTile.project.repository}
                </p>
              </div>

              <div className={styles.focusActions}>
                <Link
                  href={openedTile.project.href}
                  target={
                    openedTile.project.external ??
                    isExternalHref(openedTile.project.href)
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    openedTile.project.external ??
                    isExternalHref(openedTile.project.href)
                      ? "noreferrer"
                      : undefined
                  }
                  className={styles.focusActionLink}
                >
                  {openedTile.project.ctaLabel ?? "Open Repository"}
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
