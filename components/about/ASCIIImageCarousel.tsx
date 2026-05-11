"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uEnableWaves;
uniform float uWaveStrength;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves * uWaveStrength;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uGlitchAmount;
uniform sampler2D uTexture;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    float time = uTime;
    vec2 pos = vUv;
    float glitch = uGlitchAmount;

    float rowNoise = noise(vec2(floor(pos.y * 72.0), floor(time * 42.0)));
    float rowShift = (rowNoise - 0.5) * 0.045 * glitch;
    float activeRow = step(0.72, rowNoise);
    vec2 shifted = pos + vec2(rowShift * activeRow, 0.0);

    float channelBase = 0.008 + glitch * 0.018;
    float r = texture2D(uTexture, shifted + vec2(cos(time * 1.7 + pos.y) * channelBase, 0.0)).r;
    float g = texture2D(uTexture, shifted + vec2(sin(time * 0.8 + pos.x) * channelBase * 0.6, 0.0)).g;
    float b = texture2D(uTexture, shifted - vec2(cos(time * 1.4 + pos.y) * channelBase, 0.0)).b;
    float a = texture2D(uTexture, shifted).a;

    float scanline = 1.0 - (0.08 + glitch * 0.1) * step(0.5, fract(pos.y * 120.0));
    gl_FragColor = vec4(r, g, b, a) * vec4(vec3(scanline), 1.0);
}
`;

type ASCIIImageFit = "cover" | "contain";
type LoadStatus = "loading" | "ready" | "empty" | "failed";

interface AsciiFilterOptions {
  fontSize?: number;
  fontFamily?: string;
  charset?: string;
  invert?: boolean;
}

class AsciiFilter {
  renderer: THREE.WebGLRenderer;
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  deg = 0;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width = 0;
  height = 0;
  center = { x: 0, y: 0 };
  pointer = { x: 0, y: 0 };
  cols = 0;
  rows = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    { fontSize, fontFamily, charset, invert }: AsciiFilterOptions = {}
  ) {
    this.renderer = renderer;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "absolute";
    this.domElement.style.inset = "0";
    this.domElement.style.overflow = "hidden";

    this.pre = document.createElement("pre");
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    this.domElement.appendChild(this.canvas);

    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 7;
    this.fontFamily = fontFamily ?? "'IBM Plex Mono', 'Courier New', monospace";
    this.charset =
      charset ?? " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    if (this.context) {
      this.context.imageSmoothingEnabled = false;
    }
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.pointer = { x: this.center.x, y: this.center.y };
  }

  setPointer(x: number, y: number) {
    this.pointer = { x, y };
  }

  reset() {
    if (!this.context) {
      return;
    }

    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText("A").width || this.fontSize * 0.6;

    this.cols = Math.max(1, Math.floor(this.width / charWidth));
    this.rows = Math.max(1, Math.floor(this.height / this.fontSize));

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = "0";
    this.pre.style.padding = "0";
    this.pre.style.lineHeight = "1em";
    this.pre.style.position = "absolute";
    this.pre.style.left = "50%";
    this.pre.style.top = "50%";
    this.pre.style.transform = "translate(-50%, -50%)";
    this.pre.style.zIndex = "9";
    this.pre.style.backgroundAttachment = "fixed";
    this.pre.style.mixBlendMode = "difference";
    this.pre.setAttribute("aria-hidden", "true");
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!this.context || w <= 0 || h <= 0) {
      return;
    }

    try {
      this.context.clearRect(0, 0, w, h);
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
      this.asciify(this.context, w, h);
      this.hue();
    } catch {
      this.pre.textContent = "";
    }
  }

  hue() {
    const dx = this.pointer.x - this.center.x;
    const dy = this.pointer.y - this.center.y;
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.06;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let str = "";

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = x * 4 + y * 4 * w;
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        if (a === 0) {
          str += " ";
          continue;
        }

        const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) {
          idx = this.charset.length - idx - 1;
        }
        str += this.charset[idx];
      }
      str += "\n";
    }

    this.pre.textContent = str;
  }
}

interface ImageFrame {
  src: string;
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

interface ASCIIImageRendererOptions {
  images: readonly string[];
  asciiFontSize: number;
  planeBaseHeight: number;
  enableWaves: boolean;
  imageFit: ASCIIImageFit;
  cycleIntervalMs: number;
  flickerDurationMs: number;
  reducedMotion: boolean;
  onStatusChange: (status: LoadStatus) => void;
}

function mapRange(n: number, start: number, stop: number, start2: number, stop2: number) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

function clampCanvasSize(width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  const maxSide = 720;
  let canvasWidth = Math.min(maxSide, Math.max(280, Math.round(width * 0.8)));
  let canvasHeight = Math.round(canvasWidth / Math.max(aspect, 0.01));

  if (canvasHeight > maxSide) {
    canvasHeight = maxSide;
    canvasWidth = Math.round(canvasHeight * aspect);
  }

  return {
    width: Math.max(1, canvasWidth),
    height: Math.max(1, canvasHeight),
  };
}

function drawImageFrame(
  frame: ImageFrame,
  targetWidth: number,
  targetHeight: number,
  imageFit: ASCIIImageFit
) {
  const { canvas, context, image } = frame;
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  context.clearRect(0, 0, targetWidth, targetHeight);
  context.fillStyle = "#030303";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const imageAspect = image.naturalWidth / Math.max(image.naturalHeight, 1);
  const canvasAspect = targetWidth / Math.max(targetHeight, 1);
  const shouldCover = imageFit === "cover";
  const fitByWidth = shouldCover ? imageAspect < canvasAspect : imageAspect > canvasAspect;

  let drawWidth = targetWidth;
  let drawHeight = targetHeight;

  if (fitByWidth) {
    drawHeight = targetWidth / Math.max(imageAspect, 0.01);
  } else {
    drawWidth = targetHeight * imageAspect;
  }

  const dx = (targetWidth - drawWidth) / 2;
  const dy = (targetHeight - drawHeight) / 2;
  context.drawImage(image, dx, dy, drawWidth, drawHeight);
  frame.texture.needsUpdate = true;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function normalizePublicImagePath(src: string) {
  const trimmed = src.trim();

  if (trimmed.startsWith("public/")) {
    return `/${trimmed.slice("public/".length)}`;
  }

  if (trimmed.startsWith("./public/")) {
    return `/${trimmed.slice("./public/".length)}`;
  }

  return trimmed;
}

class ASCIIImageRenderer {
  images: readonly string[];
  asciiFontSize: number;
  planeBaseHeight: number;
  enableWaves: boolean;
  imageFit: ASCIIImageFit;
  cycleIntervalMs: number;
  flickerDurationMs: number;
  reducedMotion: boolean;
  onStatusChange: (status: LoadStatus) => void;
  container: HTMLElement;
  width: number;
  height: number;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  filter!: AsciiFilter;
  geometry: THREE.PlaneGeometry | null = null;
  material: THREE.ShaderMaterial | null = null;
  mesh: THREE.Mesh | null = null;
  frames: ImageFrame[] = [];
  mouse: { x: number; y: number };
  center: { x: number; y: number };
  animationFrameId = 0;
  maxRotation = 0.12;
  activeIndex = 0;
  settledIndex = 0;
  targetIndex = 0;
  flickerUntil = 0;
  nextFlickerAt = 0;
  nextCycleAt = 0;
  disposed = false;
  running = false;
  lastFrameSize = { width: 0, height: 0 };

  constructor(
    {
      images,
      asciiFontSize,
      planeBaseHeight,
      enableWaves,
      imageFit,
      cycleIntervalMs,
      flickerDurationMs,
      reducedMotion,
      onStatusChange,
    }: ASCIIImageRendererOptions,
    container: HTMLElement,
    width: number,
    height: number
  ) {
    this.images = images;
    this.asciiFontSize = asciiFontSize;
    this.planeBaseHeight = planeBaseHeight;
    this.enableWaves = enableWaves;
    this.imageFit = imageFit;
    this.cycleIntervalMs = cycleIntervalMs;
    this.flickerDurationMs = reducedMotion ? 0 : flickerDurationMs;
    this.reducedMotion = reducedMotion;
    this.onStatusChange = onStatusChange;
    this.container = container;
    this.width = width;
    this.height = height;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();
    this.mouse = { x: width / 2, y: height / 2 };
    this.center = { x: width / 2, y: height / 2 };

    this.onPointerMove = this.onPointerMove.bind(this);
  }

  async init() {
    if (this.images.length === 0) {
      this.onStatusChange("empty");
      return;
    }

    this.onStatusChange("loading");

    try {
      await document.fonts.load('500 12px "IBM Plex Mono"');
    } catch {}

    const loaded = await Promise.all(this.images.map((src) => loadImage(src)));
    if (this.disposed) {
      return;
    }

    this.frames = loaded.flatMap((image, index) => {
      if (!image) {
        return [];
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        return [];
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;

      return [
        {
          src: this.images[index],
          image,
          canvas,
          context,
          texture,
        },
      ];
    });

    if (this.frames.length === 0) {
      this.onStatusChange("failed");
      return;
    }

    this.setMesh();
    this.setRenderer();
    this.setSize(this.width, this.height);
    this.onStatusChange("ready");
  }

  setMesh() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.frames[0].texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
        uWaveStrength: { value: 1.0 },
        uGlitchAmount: { value: 0.0 },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: "IBM Plex Mono",
      fontSize: this.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
    this.container.addEventListener("mousemove", this.onPointerMove);
    this.container.addEventListener("touchmove", this.onPointerMove, { passive: true });
  }

  setSize(width: number, height: number) {
    if (width <= 0 || height <= 0 || !this.filter || !this.mesh || !this.material) {
      return;
    }

    this.width = width;
    this.height = height;
    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: width / 2, y: height / 2 };

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const frameSize = clampCanvasSize(width, height);
    const sizeChanged =
      frameSize.width !== this.lastFrameSize.width || frameSize.height !== this.lastFrameSize.height;

    if (sizeChanged) {
      this.frames.forEach((frame) => {
        drawImageFrame(frame, frameSize.width, frameSize.height, this.imageFit);
      });
      this.lastFrameSize = frameSize;
    }

    const vHeight = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * 30;
    const vWidth = vHeight * this.camera.aspect;
    const maxW = vWidth * 0.96;
    const maxH = vHeight * 0.98;
    const frameAspect = frameSize.width / Math.max(frameSize.height, 1);
    const requestedHeight = Math.min(this.planeBaseHeight, maxH);
    let planeH = Math.min(requestedHeight, maxW / Math.max(frameAspect, 0.01));
    let planeW = planeH * frameAspect;

    if (planeW > maxW) {
      planeW = maxW;
      planeH = planeW / Math.max(frameAspect, 0.01);
    }

    this.geometry?.dispose();
    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.mesh.geometry = this.geometry;

    const widthRatio = THREE.MathUtils.clamp((width - 320) / 520, 0, 1);
    const waveStrength = this.enableWaves ? THREE.MathUtils.clamp(0.18 + 0.55 * widthRatio, 0.18, 0.72) : 0;
    this.maxRotation = this.reducedMotion
      ? 0.04
      : THREE.MathUtils.clamp(0.05 + 0.08 * widthRatio, 0.05, 0.13);

    this.material.uniforms.uWaveStrength.value = waveStrength;
    this.filter.fontSize = this.asciiFontSize;
    this.filter.setSize(width, height);
  }

  start() {
    if (this.running || this.frames.length === 0) {
      return;
    }

    this.running = true;
    this.nextCycleAt = performance.now() + this.getCycleInterval();

    const animateFrame = () => {
      if (!this.running || this.disposed) {
        return;
      }

      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render(performance.now());
    };

    animateFrame();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  getCycleInterval() {
    return this.reducedMotion
      ? Math.max(this.cycleIntervalMs * 1.8, 6000)
      : this.cycleIntervalMs;
  }

  onPointerMove(evt: MouseEvent | TouchEvent) {
    const point = "touches" in evt ? evt.touches[0] : evt;
    if (!point) {
      return;
    }

    const bounds = this.container.getBoundingClientRect();
    const x = point.clientX - bounds.left;
    const y = point.clientY - bounds.top;
    this.mouse = { x, y };
    this.filter?.setPointer(x, y);
  }

  updateFrame(now: number) {
    if (this.frames.length <= 1) {
      return 0;
    }

    if (this.flickerUntil === 0 && now >= this.nextCycleAt) {
      this.targetIndex = (this.settledIndex + 1) % this.frames.length;
      this.flickerUntil = now + this.flickerDurationMs;
      this.nextFlickerAt = now;

      if (this.reducedMotion || this.flickerDurationMs <= 0) {
        this.activeIndex = this.targetIndex;
        this.settledIndex = this.targetIndex;
        this.flickerUntil = 0;
        this.nextCycleAt = now + this.getCycleInterval();
        return 0;
      }
    }

    if (this.flickerUntil > 0) {
      const progress = THREE.MathUtils.clamp(
        1 - (this.flickerUntil - now) / Math.max(this.flickerDurationMs, 1),
        0,
        1
      );

      if (now >= this.flickerUntil) {
        this.activeIndex = this.targetIndex;
        this.settledIndex = this.targetIndex;
        this.flickerUntil = 0;
        this.nextCycleAt = now + this.getCycleInterval();
        return 0;
      }

      if (now >= this.nextFlickerAt) {
        const holdTarget = progress > 0.68 && Math.random() > 0.35;
        this.activeIndex = holdTarget
          ? this.targetIndex
          : Math.floor(Math.random() * this.frames.length);
        this.nextFlickerAt = now + 38 + Math.random() * 84;
      }

      return Math.sin(progress * Math.PI) * 0.72;
    }

    return 0;
  }

  render(now: number) {
    if (!this.material || !this.mesh || !this.filter || this.frames.length === 0) {
      return;
    }

    const glitchAmount = this.updateFrame(now);
    const activeFrame = this.frames[this.activeIndex] ?? this.frames[0];
    this.material.uniforms.uTexture.value = activeFrame.texture;
    this.material.uniforms.uTime.value = now * 0.001;
    this.material.uniforms.uGlitchAmount.value = glitchAmount;

    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    if (!this.mesh) {
      return;
    }

    const maxRot = this.maxRotation;
    const x = mapRange(this.mouse.y, 0, this.height, maxRot, -maxRot);
    const y = mapRange(this.mouse.x, 0, this.width, -maxRot, maxRot);

    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.045;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.045;
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.container.removeEventListener("mousemove", this.onPointerMove);
    this.container.removeEventListener("touchmove", this.onPointerMove);

    if (this.filter?.domElement.parentNode === this.container) {
      this.container.removeChild(this.filter.domElement);
    }

    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material.dispose());
    });
    this.scene.clear();

    this.frames.forEach((frame) => {
      frame.texture.dispose();
      frame.canvas.width = 1;
      frame.canvas.height = 1;
    });
    this.frames = [];

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}

export interface ASCIIImageCarouselProps {
  images: readonly string[];
  asciiFontSize?: number;
  planeBaseHeight?: number;
  enableWaves?: boolean;
  imageFit?: ASCIIImageFit;
  cycleIntervalMs?: number;
  flickerDurationMs?: number;
  className?: string;
}

export default function ASCIIImageCarousel({
  images,
  asciiFontSize = 6,
  planeBaseHeight = 17,
  enableWaves = true,
  imageFit = "cover",
  cycleIntervalMs = 3600,
  flickerDurationMs = 520,
  className,
}: ASCIIImageCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ASCIIImageRenderer | null>(null);
  const [status, setStatus] = useState<LoadStatus>(images.length > 0 ? "loading" : "empty");
  const imagesKey = useMemo(() => images.join("\u0000"), [images]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let visible = true;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = reducedMotionQuery.matches;
    const imageSources = images
      .map(normalizePublicImagePath)
      .filter((src) => src.length > 0);

    const cleanupRenderer = () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };

    const initAtSize = async (width: number, height: number) => {
      if (cancelled || width <= 0 || height <= 0) {
        return;
      }

      cleanupRenderer();

      const instance = new ASCIIImageRenderer(
        {
          images: imageSources,
          asciiFontSize,
          planeBaseHeight,
          enableWaves,
          imageFit,
          cycleIntervalMs,
          flickerDurationMs,
          reducedMotion,
          onStatusChange: (nextStatus) => {
            if (!cancelled) {
              setStatus(nextStatus);
            }
          },
        },
        container,
        width,
        height
      );

      rendererRef.current = instance;
      await instance.init();

      if (cancelled || rendererRef.current !== instance) {
        instance.dispose();
        return;
      }

      if (visible) {
        instance.start();
      }
    };

    const initialRect = container.getBoundingClientRect();
    if (initialRect.width > 0 && initialRect.height > 0) {
      void initAtSize(initialRect.width, initialRect.height);
    } else if (imageSources.length === 0) {
      setStatus("empty");
    }

    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) {
        return;
      }

      if (!rendererRef.current) {
        void initAtSize(width, height);
        return;
      }

      rendererRef.current.setSize(width, height);
    });
    resizeObserver.observe(container);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible) {
          rendererRef.current?.start();
        } else {
          rendererRef.current?.stop();
        }
      },
      { threshold: 0.04 }
    );
    intersectionObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      cleanupRenderer();
    };
  }, [
    imagesKey,
    asciiFontSize,
    planeBaseHeight,
    enableWaves,
    imageFit,
    cycleIntervalMs,
    flickerDurationMs,
    images,
  ]);

  const fallbackText =
    status === "loading"
      ? "SYNCING SIGNAL"
      : status === "empty"
        ? "NO IMAGE SIGNAL"
        : status === "failed"
          ? "SIGNAL LOST"
          : "";

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label="Animated ASCII image signal"
      role="img"
    >
      {fallbackText ? (
        <div className="absolute inset-0 grid place-items-center text-center font-mono text-[0.66rem] uppercase tracking-[0.28em] text-white/34">
          {fallbackText}
        </div>
      ) : null}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&display=swap');

        .ascii-image-container canvas {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          image-rendering: optimizeSpeed;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
          opacity: 0.18;
          mix-blend-mode: screen;
        }

        .ascii-image-container pre {
          margin: 0;
          user-select: none;
          padding: 0;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          background-image: radial-gradient(circle, #ff6188 0%, #fc9867 45%, #ffd866 100%);
          background-attachment: fixed;
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          z-index: 9;
          mix-blend-mode: difference;
        }
      `}</style>
    </div>
  );
}
