"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "@/components/about/CurvedLoop.module.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface CurvedLoopItem {
  src: string;
  alt: string;
}

interface CurvedLoopProps {
  marqueeText?: string;
  items?: CurvedLoopItem[];
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: "left" | "right";
  interactive?: boolean;
  itemGap?: number;
  itemHeight?: number;
  itemWidth?: number;
}

const VIEWBOX_WIDTH = 1600;
const VIEWBOX_HEIGHT = 320;
const BASELINE_Y = VIEWBOX_HEIGHT / 2;
const PATH_START_X = -180;
const PATH_MID_X = 760;
const PATH_END_X = VIEWBOX_WIDTH + 180;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function wrapOffset(offset: number, spacing: number) {
  let nextOffset = offset;

  while (nextOffset <= -spacing) {
    nextOffset += spacing;
  }

  while (nextOffset > 0) {
    nextOffset -= spacing;
  }

  return nextOffset;
}

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export default function CurvedLoop({
  marqueeText = "",
  items,
  speed = 0.8,
  className,
  curveAmount = 78,
  direction = "left",
  interactive = true,
  itemGap = 40,
  itemHeight = 92,
  itemWidth = 156,
}: CurvedLoopProps) {
  const reducedMotion = useReducedMotion();
  const iconItems = items ?? [];
  const isIconMode = iconItems.length > 0;
  const text = useMemo(() => {
    const trimmedText = marqueeText.replace(/\s+$/, "");
    return `${trimmedText}\u00A0`;
  }, [marqueeText]);
  const amplitude = clamp(curveAmount, 20, 112);
  const measureRef = useRef<SVGTextElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const directionRef = useRef<"left" | "right">(direction);
  const velocityRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [spacing, setSpacing] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [ready, setReady] = useState(false);
  const [renderOffset, setRenderOffset] = useState(0);
  const pathId = `curve-${useId().replace(/:/g, "")}`;
  const textClassName = joinClasses(className);
  const itemSpacing = itemWidth + itemGap;
  const cycleLength = iconItems.length * itemSpacing;
  const pathD = useMemo(() => {
    const firstControlX = 170;
    const secondControlX = 490;
    const thirdControlX = 1040;
    const fourthControlX = 1360;

    return [
      `M ${PATH_START_X} ${BASELINE_Y}`,
      `C ${firstControlX} ${BASELINE_Y - amplitude}, ${secondControlX} ${BASELINE_Y - amplitude}, ${PATH_MID_X} ${BASELINE_Y}`,
      `C ${thirdControlX} ${BASELINE_Y + amplitude}, ${fourthControlX} ${BASELINE_Y + amplitude}, ${PATH_END_X} ${BASELINE_Y}`,
    ].join(" ");
  }, [amplitude]);
  const totalText = useMemo(() => {
    if (!spacing || !pathLength) {
      return text;
    }

    const repeats = Math.max(4, Math.ceil((pathLength * 2) / spacing) + 2);
    return Array.from({ length: repeats }, () => text).join("");
  }, [pathLength, spacing, text]);
  const visibleItems = useMemo(() => {
    if (!isIconMode || !ready || !pathLength || !itemSpacing || !pathRef.current) {
      return [];
    }

    const pathNode = pathRef.current;
    const buffer = itemSpacing * 0.85;
    const startIndex = Math.floor((-buffer - renderOffset) / itemSpacing);
    const endIndex = Math.ceil((pathLength + buffer - renderOffset) / itemSpacing);

    return Array.from(
      { length: endIndex - startIndex + 1 },
      (_, listIndex) => {
        const itemIndex = startIndex + listIndex;
        const item =
          iconItems[
            ((itemIndex % iconItems.length) + iconItems.length) % iconItems.length
          ];
        const distance = itemIndex * itemSpacing + renderOffset;

        if (distance < -buffer || distance > pathLength + buffer) {
          return null;
        }

        const clampedDistance = clamp(distance, 0, pathLength);
        const point = pathNode.getPointAtLength(clampedDistance);
        const edgeFade =
          distance < 0
            ? 1 - Math.min(1, Math.abs(distance) / buffer)
            : distance > pathLength
              ? 1 - Math.min(1, (distance - pathLength) / buffer)
              : 1;

        return {
          item,
          key: `${item.src}-${itemIndex}`,
          opacity: edgeFade,
          x: point.x,
          y: point.y,
        };
      },
    ).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [
    iconItems,
    isIconMode,
    itemSpacing,
    pathLength,
    ready,
    renderOffset,
  ]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    let animationFrame = 0;

    const measure = () => {
      const nextSpacing = measureRef.current?.getComputedTextLength() ?? 0;
      const nextPathLength = pathRef.current?.getTotalLength() ?? 0;

      setSpacing(nextSpacing);
      setPathLength(nextPathLength);
      setReady(nextPathLength > 0 && (isIconMode || nextSpacing > 0));
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(measure);
    };

    scheduleMeasure();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && containerRef.current
        ? new ResizeObserver(scheduleMeasure)
        : null;
    const containerNode = containerRef.current;

    if (resizeObserver && containerNode) {
      resizeObserver.observe(containerNode);
    }
    const fontReady = document.fonts?.ready;

    if (fontReady) {
      void fontReady.then(scheduleMeasure).catch(() => undefined);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
    };
  }, [isIconMode, pathD, text, textClassName]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const initialOffset = isIconMode ? -cycleLength : -spacing;
    offsetRef.current = initialOffset;

    if (isIconMode) {
      setRenderOffset(initialOffset);
      return;
    }

    const textPathNode = textPathRef.current;

    if (!spacing || !textPathNode) {
      return;
    }

    textPathNode.setAttribute("startOffset", `${initialOffset}px`);
  }, [cycleLength, isIconMode, ready, spacing]);

  useEffect(() => {
    if (!ready || reducedMotion) {
      return;
    }

    if (isIconMode && !cycleLength) {
      return;
    }

    if (!isIconMode && (!spacing || !textPathRef.current)) {
      return;
    }

    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = (timestamp - lastTimestamp) / 16.6667;
      lastTimestamp = timestamp;

      if (!dragRef.current) {
        const distance =
          (directionRef.current === "right" ? speed : -speed) * delta;
        const wrapDistance = isIconMode ? cycleLength : spacing;
        const nextOffset = wrapOffset(offsetRef.current + distance, wrapDistance);

        offsetRef.current = nextOffset;

        if (isIconMode) {
          setRenderOffset(nextOffset);
        } else {
          const textPathNode = textPathRef.current;

          if (!textPathNode) {
            return;
          }

          textPathNode.setAttribute("startOffset", `${nextOffset}px`);
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [cycleLength, isIconMode, ready, reducedMotion, spacing, speed]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive) {
      return;
    }

    dragRef.current = true;
    lastXRef.current = event.clientX;
    velocityRef.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || !dragRef.current) {
      return;
    }

    const deltaX = event.clientX - lastXRef.current;
    lastXRef.current = event.clientX;
    velocityRef.current = deltaX;

    const wrapDistance = isIconMode ? cycleLength : spacing;

    if (!wrapDistance) {
      return;
    }

    const nextOffset = wrapOffset(offsetRef.current + deltaX, wrapDistance);
    offsetRef.current = nextOffset;

    if (isIconMode) {
      setRenderOffset(nextOffset);
      return;
    }

    if (!textPathRef.current) {
      return;
    }

    textPathRef.current.setAttribute("startOffset", `${nextOffset}px`);
  };

  const endDrag = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive) {
      return;
    }

    if (dragRef.current && Math.abs(velocityRef.current) > 0.35) {
      directionRef.current = velocityRef.current > 0 ? "right" : "left";
    }

    dragRef.current = false;
    setDragging(false);

    if (
      event &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.jacket}
      style={{
        cursor: interactive ? (dragging ? "grabbing" : "grab") : "auto",
        visibility: ready ? "visible" : "hidden",
      }}
      onPointerCancel={endDrag}
      onPointerDown={onPointerDown}
      onPointerLeave={endDrag}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
    >
      <svg
        aria-hidden="true"
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        {!isIconMode ? (
          <text
            ref={measureRef}
            className={textClassName}
            style={{ opacity: 0, pointerEvents: "none" }}
            xmlSpace="preserve"
          >
            {text}
          </text>
        ) : null}
        <defs>
          <path id={pathId} ref={pathRef} d={pathD} fill="none" />
        </defs>
        {ready && isIconMode ? (
          <g>
            {visibleItems.map(({ item, key, opacity, x, y }) => (
              <g
                key={key}
                className={styles.logoChip}
                opacity={opacity}
                transform={`translate(${x} ${y})`}
              >
                <rect
                  className={styles.logoChipPlate}
                  x={-itemWidth / 2}
                  y={-itemHeight / 2}
                  width={itemWidth}
                  height={itemHeight}
                  rx={itemHeight / 2}
                  ry={itemHeight / 2}
                />
                <image
                  aria-hidden="true"
                  className={styles.logoChipImage}
                  href={item.src}
                  preserveAspectRatio="xMidYMid meet"
                  x={-(itemWidth * 0.62) / 2}
                  y={-(itemHeight * 0.46) / 2}
                  width={itemWidth * 0.62}
                  height={itemHeight * 0.46}
                />
              </g>
            ))}
          </g>
        ) : null}
        {ready && !isIconMode ? (
          <text className={textClassName} xmlSpace="preserve">
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset="0px">
              {totalText}
            </textPath>
          </text>
        ) : null}
      </svg>
    </div>
  );
}
