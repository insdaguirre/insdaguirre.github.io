/* eslint-disable @next/next/no-img-element */

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
  aspectRatio: number;
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
  segments: 21,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const gcd = (left: number, right: number): number => {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
};

function getProjectStep(projectCount: number) {
  if (projectCount <= 1) {
    return 1;
  }

  const preferredStep = 5;
  const maxOffset = Math.max(projectCount, preferredStep);

  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const lowerCandidate = preferredStep - offset;

    if (lowerCandidate >= 1 && gcd(lowerCandidate, projectCount) === 1) {
      return lowerCandidate;
    }

    const upperCandidate = preferredStep + offset;

    if (
      upperCandidate < projectCount &&
      gcd(upperCandidate, projectCount) === 1
    ) {
      return upperCandidate;
    }
  }

  return 1;
}

const wrapAngleSigned = (degrees: number) => {
  const normalized = (((degrees + 180) % 360) + 360) % 360;
  return normalized - 180;
};

function buildItems(pool: PastProject[], segments: number): ItemDef[] {
  if (pool.length === 0) {
    return [];
  }

  const slotsPerColumn = 4;
  const tileWidth = 2.2;
  const targetHorizontalGap = 0.44;
  const verticalGap = 0.46;
  const fallbackAspectRatio = 0.92;
  const ringUnits = segments * 2;
  const targetColumnStride = tileWidth + targetHorizontalGap;
  const columnCount = Math.max(1, Math.round(ringUnits / targetColumnStride));
  const columnStride = ringUnits / columnCount;
  const xStart = -((columnCount - 1) * columnStride) / 2;
  const xColumns = Array.from(
    { length: columnCount },
    (_, index) => xStart + index * columnStride,
  );
  const normalizedProjects = pool.map((project, projectOrder) => {
    const aspectRatio =
      project.imageWidth && project.imageHeight
        ? project.imageWidth / project.imageHeight
        : fallbackAspectRatio;
    const sizeY = clamp(tileWidth / aspectRatio, 1.16, 2.78);

    return {
      project,
      projectOrder,
      aspectRatio,
      sizeX: tileWidth,
      sizeY,
    };
  });

  const totalSlots = xColumns.length * slotsPerColumn;
  const projectStep = getProjectStep(normalizedProjects.length);
  const usedProjects = Array.from({ length: totalSlots }, (_, index) => {
    const projectIndex = (index * projectStep) % normalizedProjects.length;
    return normalizedProjects[projectIndex];
  });

  return xColumns.flatMap((x, columnIndex) => {
    const columnItems = usedProjects.slice(
      columnIndex * slotsPerColumn,
      (columnIndex + 1) * slotsPerColumn,
    );
    const totalHeight =
      columnItems.reduce((sum, item) => sum + item.sizeY, 0) +
      verticalGap * Math.max(0, columnItems.length - 1);
    const stagger = columnIndex % 2 === 0 ? -0.22 : 0.22;
    let cursor = -(totalHeight / 2) + stagger;

    return columnItems.map((item) => {
      const nextItem = {
        project: item.project,
        projectOrder: item.projectOrder,
        x,
        y: cursor + item.sizeY / 2,
        sizeX: item.sizeX,
        sizeY: item.sizeY,
        aspectRatio: item.aspectRatio,
      };

      cursor += item.sizeY + verticalGap;
      return nextItem;
    });
  });
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

function GitHubMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.7 7.7 0 0 1 8 4.96c.68 0 1.36.09 2 .26 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

function ExternalSiteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        d="M9.5 1a.75.75 0 0 0 0 1.5h1.69L6.72 6.97a.75.75 0 1 0 1.06 1.06l4.47-4.47V5.25a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 13 1h-3.5ZM3.75 3A1.75 1.75 0 0 0 2 4.75v7.5C2 13.216 2.784 14 3.75 14h7.5A1.75 1.75 0 0 0 13 12.25V9a.75.75 0 0 0-1.5 0v3.25a.25.25 0 0 1-.25.25h-7.5a.25.25 0 0 1-.25-.25v-7.5a.25.25 0 0 1 .25-.25H7a.75.75 0 0 0 0-1.5H3.75Z"
      />
    </svg>
  );
}

function getRectRelativeToRoot(rect: DOMRect, rootRect: DOMRect): RectDef {
  return {
    left: rect.left - rootRect.left,
    top: rect.top - rootRect.top,
    width: rect.width,
    height: rect.height,
  };
}

function getProjectAspectRatio(project: PastProject) {
  if (project.imageWidth && project.imageHeight) {
    return project.imageWidth / project.imageHeight;
  }

  return 0.92;
}

function getProjectLinkKind(project: PastProject) {
  return project.linkKind ?? "github";
}

function getProjectActionLabel(project: PastProject) {
  return (
    project.ctaLabel ??
    (getProjectLinkKind(project) === "external" ? "Visit Site" : "Open Repository")
  );
}

function getProjectActionAriaLabel(project: PastProject) {
  if (project.ariaLabel) {
    return project.ariaLabel;
  }

  return getProjectLinkKind(project) === "external"
    ? `Visit ${project.name}`
    : `Open GitHub repository for ${project.name}`;
}

function getProjectActionTitle(project: PastProject) {
  return getProjectLinkKind(project) === "external"
    ? getProjectActionLabel(project)
    : "Open GitHub repository";
}

function getProjectBadgeLabel(project: PastProject) {
  return (
    project.badgeLabel ??
    (getProjectLinkKind(project) === "external" ? "Live Site" : "GitHub")
  );
}

function getViewerPadding(root: HTMLDivElement) {
  const value = Number.parseFloat(
    getComputedStyle(root).getPropertyValue("--viewer-pad"),
  );

  return Number.isFinite(value) ? value : 24;
}

function getFocusTargetRect(
  rootRect: DOMRect,
  viewerPadding: number,
  aspectRatio: number,
): RectDef {
  const shellPadding = 16;
  const headerHeight = 54;
  const footerHeight = 92;
  const internalGap = 14;
  const chromeHeight =
    shellPadding * 2 + headerHeight + footerHeight + internalGap * 2;
  const maxWidth = Math.min(
    rootRect.width - viewerPadding * 2,
    rootRect.width * 0.84,
  );
  const maxHeight = Math.min(
    rootRect.height - viewerPadding * 2,
    rootRect.height * 0.88,
  );
  const availableImageWidth = Math.max(140, maxWidth - shellPadding * 2);
  const availableImageHeight = Math.max(180, maxHeight - chromeHeight);

  let imageWidth = Math.min(
    availableImageWidth,
    availableImageHeight * aspectRatio,
  );
  let imageHeight = imageWidth / aspectRatio;

  if (imageHeight > availableImageHeight) {
    imageHeight = availableImageHeight;
    imageWidth = imageHeight * aspectRatio;
  }

  const width = imageWidth + shellPadding * 2;
  const height = imageHeight + chromeHeight;

  return {
    left: (rootRect.width - width) / 2,
    top: (rootRect.height - height) / 2,
    width,
    height,
  };
}

export default function ArchiveDomeGallery({
  projects,
  fit = 1.2,
  fitBasis = "auto",
  minRadius = 560,
  maxRadius = Infinity,
  padFactor = 0.05,
  overlayBlurColor = "#080511",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  segments = DEFAULTS.segments,
  dragDampening = 0.82,
  grayscale = false,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
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
  const verticalSegments = Math.max(28, Math.round(segments * 1.35));

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
      radius = Math.min(radius, height * 1.6);
      radius = clamp(radius, minRadius, maxRadius);

      const viewerPad = Math.max(12, Math.round(minDimension * padFactor));

      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      setOpenedTile((current) => {
        if (!current || current.closing) {
          return current;
        }

        return {
          ...current,
          targetRect: getFocusTargetRect(
            root.getBoundingClientRect(),
            viewerPad,
            getProjectAspectRatio(current.project),
          ),
        };
      });
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
      draggingRef.current = false;
      touchPendingRef.current = event.pointerType === "touch";
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

      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;

      if (!draggingRef.current) {
        if (deltaX * deltaX + deltaY * deltaY < 36) {
          return;
        }

        if (touchPendingRef.current && Math.abs(deltaX) <= Math.abs(deltaY) + 4) {
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

      const wasDragging = draggingRef.current;
      const didMove = movedRef.current;
      const shouldContinueInertia = wasDragging && didMove;
      const { x: velocityX, y: velocityY } = velocityRef.current;

      if (draggingRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      clearPointerTracking();

      if (didMove) {
        lastDragEndAtRef.current = performance.now();
      }

      if (shouldContinueInertia) {
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

      if (!root) {
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const sourceRect = sourceButton.getBoundingClientRect();
      const targetRect = getFocusTargetRect(
        rootRect,
        getViewerPadding(root),
        getProjectAspectRatio(item.project),
      );

      openStartedAtRef.current = performance.now();
      stopInertia();
      lastFocusedTileRef.current = sourceButton;

      setOpenedTile({
        project: item.project,
        projectOrder: item.projectOrder,
        tileInstanceIndex,
        originRect: getRectRelativeToRoot(sourceRect, rootRect),
        targetRect,
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
          ["--segments-y" as string]: verticalSegments,
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
                    ["--item-aspect" as string]: item.aspectRatio,
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
                    `${getProjectActionLabel(item.project)} for ${item.project.name}`
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

                    <div className={styles.tileCaption} aria-hidden="true">
                      <span className={styles.tileCaptionText}>
                        {item.project.name}
                      </span>
                    </div>
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
            <div className={styles.focusHeader}>
              <div className={styles.focusHeading}>
                <h3
                  id={`archive-focus-title-${openedTile.tileInstanceIndex}`}
                  className={styles.focusTitle}
                >
                  {openedTile.project.name}
                </h3>
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

            <div className={styles.focusImageFrame}>
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
            </div>

            <div className={styles.focusDetails}>
              <div className={styles.focusMeta}>
                <div className={styles.focusEyebrowRow}>
                  <span className={styles.focusIndex}>
                    {String(openedTile.projectOrder + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.focusBadge}>
                    {getProjectBadgeLabel(openedTile.project)}
                  </span>
                </div>
                <p className={styles.focusRepository}>
                  {openedTile.project.repository}
                </p>
              </div>

              <div className={styles.focusActions}>
                {openedTile.project.demoUrl ? (
                  <Link
                    href={openedTile.project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.focusActionLink} ${styles.focusActionLinkSecondary}`}
                  >
                    {openedTile.project.demoLabel ?? "View Demo"}
                  </Link>
                ) : null}

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
                  aria-label={
                    getProjectActionAriaLabel(openedTile.project)
                  }
                  title={getProjectActionTitle(openedTile.project)}
                  className={styles.focusIconLink}
                >
                  {getProjectLinkKind(openedTile.project) === "external" ? (
                    <ExternalSiteIcon className={styles.focusIcon} />
                  ) : (
                    <GitHubMarkIcon className={styles.focusIcon} />
                  )}
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
