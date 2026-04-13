"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Key,
  type ReactNode,
} from "react";
import "./LogoLoop.css";

type LogoNodeItem = {
  node: ReactNode;
  href?: string;
  title?: string;
  ariaLabel?: string;
};

type LogoImageItem = {
  src: string;
  alt?: string;
  href?: string;
  title?: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export type LogoItem = LogoNodeItem | LogoImageItem;

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: Key) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

const toCssLength = (value?: number | string): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

const isNodeItem = (item: LogoItem): item is LogoNodeItem => "node" in item;

const getItemAriaLabel = (item: LogoItem): string | undefined =>
  isNodeItem(item) ? item.ariaLabel ?? item.title : item.alt ?? item.title;

const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = "Partner logos",
  className,
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState<number>(
    ANIMATION_CONFIG.MIN_COPIES,
  );
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === "up" || direction === "down";

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const directionMultiplier = isVertical
      ? direction === "up"
        ? 1
        : -1
      : direction === "left"
        ? 1
        : -1;
    const speedMultiplier = speed < 0 ? -1 : 1;

    return magnitude * directionMultiplier * speedMultiplier;
  }, [direction, isVertical, speed]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceRect = seqRef.current?.getBoundingClientRect();
    const sequenceWidth = sequenceRect?.width ?? 0;
    const sequenceHeight = sequenceRect?.height ?? 0;

    if (isVertical) {
      const parentHeight = containerRef.current?.parentElement?.clientHeight ?? 0;

      if (containerRef.current && parentHeight > 0) {
        const targetHeight = Math.ceil(parentHeight);

        if (containerRef.current.style.height !== `${targetHeight}px`) {
          containerRef.current.style.height = `${targetHeight}px`;
        }
      }

      if (sequenceHeight > 0) {
        const viewport =
          containerRef.current?.clientHeight ?? parentHeight ?? sequenceHeight;

        setSeqHeight(Math.ceil(sequenceHeight));
        setCopyCount(
          Math.max(
            ANIMATION_CONFIG.MIN_COPIES,
            Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM,
          ),
        );
      }

      return;
    }

    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      setCopyCount(
        Math.max(
          ANIMATION_CONFIG.MIN_COPIES,
          Math.ceil(containerWidth / sequenceWidth) +
            ANIMATION_CONFIG.COPY_HEADROOM,
        ),
      );
    }
  }, [isVertical]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (!window.ResizeObserver) {
      const handleResize = () => updateDimensions();

      window.addEventListener("resize", handleResize);
      updateDimensions();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const observers: ResizeObserver[] = [];

    const observe = (element: Element | null) => {
      if (!element) return;

      const observer = new ResizeObserver(updateDimensions);

      observer.observe(element);
      observers.push(observer);
    };

    observe(containerRef.current);
    observe(seqRef.current);
    updateDimensions();

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [gap, isVertical, logoHeight, logos, updateDimensions]);

  useEffect(() => {
    const images = seqRef.current?.querySelectorAll("img");

    if (!images || images.length === 0) {
      updateDimensions();
      return undefined;
    }

    let remainingImages = images.length;

    const handleImageLoad = () => {
      remainingImages -= 1;

      if (remainingImages === 0) {
        updateDimensions();
      }
    };

    images.forEach((image) => {
      const htmlImage = image as HTMLImageElement;

      if (htmlImage.complete) {
        handleImageLoad();
        return;
      }

      htmlImage.addEventListener("load", handleImageLoad, { once: true });
      htmlImage.addEventListener("error", handleImageLoad, { once: true });
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener("load", handleImageLoad);
        image.removeEventListener("error", handleImageLoad);
      });
    };
  }, [gap, isVertical, logoHeight, logos, updateDimensions]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return undefined;

    const sequenceSize = isVertical ? seqHeight : seqWidth;

    if (sequenceSize > 0) {
      offsetRef.current =
        ((offsetRef.current % sequenceSize) + sequenceSize) % sequenceSize;

      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime =
        Math.max(0, timestamp - lastTimestampRef.current) / 1000;

      lastTimestampRef.current = timestamp;

      const nextTargetVelocity =
        isHovered && effectiveHoverSpeed !== undefined
          ? effectiveHoverSpeed
          : targetVelocity;

      const easingFactor =
        1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);

      velocityRef.current +=
        (nextTargetVelocity - velocityRef.current) * easingFactor;

      if (sequenceSize > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;

        nextOffset = ((nextOffset % sequenceSize) + sequenceSize) % sequenceSize;
        offsetRef.current = nextOffset;

        track.style.transform = isVertical
          ? `translate3d(0, ${-nextOffset}px, 0)`
          : `translate3d(${-nextOffset}px, 0, 0)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [
    effectiveHoverSpeed,
    isHovered,
    isVertical,
    seqHeight,
    seqWidth,
    targetVelocity,
  ]);

  const cssVariables = useMemo(
    () =>
      ({
        "--logoloop-gap": `${gap}px`,
        "--logoloop-logoHeight": `${logoHeight}px`,
        ...(fadeOutColor ? { "--logoloop-fadeColor": fadeOutColor } : {}),
      }) as CSSProperties,
    [fadeOutColor, gap, logoHeight],
  );

  const rootClassName = useMemo(
    () =>
      [
        "logoloop",
        isVertical ? "logoloop--vertical" : "logoloop--horizontal",
        fadeOut ? "logoloop--fade" : "",
        scaleOnHover ? "logoloop--scale-hover" : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className, fadeOut, isVertical, scaleOnHover],
  );

  const handleMouseEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) {
      setIsHovered(true);
    }
  }, [effectiveHoverSpeed]);

  const handleMouseLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) {
      setIsHovered(false);
    }
  }, [effectiveHoverSpeed]);

  const renderLogoItem = useCallback(
    (item: LogoItem, key: Key) => {
      if (renderItem) {
        return (
          <li className="logoloop__item" key={key} role="listitem">
            {renderItem(item, key)}
          </li>
        );
      }

      const itemAriaLabel = getItemAriaLabel(item);

      const content = isNodeItem(item) ? (
        <span
          className="logoloop__node"
          aria-hidden={Boolean(item.href && itemAriaLabel)}
        >
          {item.node}
        </span>
      ) : (
        // This renderer accepts arbitrary image sources and sizing, so a raw img
        // avoids Next Image constraints around fixed dimensions and remote config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          srcSet={item.srcSet}
          sizes={item.sizes}
          width={item.width}
          height={item.height}
          alt={item.href && itemAriaLabel ? "" : item.alt ?? ""}
          title={item.title}
          loading="lazy"
          decoding="async"
          draggable={false}
          aria-hidden={item.href && itemAriaLabel ? true : undefined}
        />
      );

      const itemContent = item.href ? (
        <a
          className="logoloop__link"
          href={item.href}
          aria-label={itemAriaLabel || "logo link"}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      );

      return (
        <li className="logoloop__item" key={key} role="listitem">
          {itemContent}
        </li>
      );
    },
    [renderItem],
  );

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className="logoloop__list"
          key={`copy-${copyIndex}`}
          role="list"
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logos.map((item, itemIndex) =>
            renderLogoItem(item, `${copyIndex}-${itemIndex}`),
          )}
        </ul>
      )),
    [copyCount, logos, renderLogoItem],
  );

  const containerStyle = useMemo(
    (): CSSProperties => ({
      width: isVertical
        ? toCssLength(width) === "100%"
          ? undefined
          : toCssLength(width)
        : (toCssLength(width) ?? "100%"),
      ...cssVariables,
      ...style,
    }),
    [cssVariables, isVertical, style, width],
  );

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      style={containerStyle}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        className="logoloop__track"
        ref={trackRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {logoLists}
      </div>
    </div>
  );
});

LogoLoop.displayName = "LogoLoop";

export { LogoLoop };
export default LogoLoop;
