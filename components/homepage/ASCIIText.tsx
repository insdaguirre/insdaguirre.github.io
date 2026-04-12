// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
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
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

function map(n: number, start: number, stop: number, start2: number, stop2: number) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

interface AsciiFilterOptions {
  fontSize?: number;
  fontFamily?: string;
  charset?: string;
  invert?: boolean;
}

class AsciiFilter {
  renderer!: THREE.WebGLRenderer;
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  deg: number;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width: number = 0;
  height: number = 0;
  center: { x: number; y: number } = { x: 0, y: 0 };
  mouse: { x: number; y: number } = { x: 0, y: 0 };
  cols: number = 0;
  rows: number = 0;

  constructor(renderer: THREE.WebGLRenderer, { fontSize, fontFamily, charset, invert }: AsciiFilterOptions = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

    if (this.context) {
      this.context.imageSmoothingEnabled = false;
    }

    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    if (this.context) {
      this.context.font = `${this.fontSize}px ${this.fontFamily}`;
      const charWidth = this.context.measureText('A').width;

      this.cols = Math.max(1, Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize))));
      this.rows = Math.max(1, Math.floor(this.height / this.fontSize));

      this.canvas.width = this.cols;
      this.canvas.height = this.rows;
      this.pre.style.fontFamily = this.fontFamily;
      this.pre.style.fontSize = `${this.fontSize}px`;
      this.pre.style.margin = '0';
      this.pre.style.padding = '0';
      this.pre.style.lineHeight = '1em';
      this.pre.style.position = 'absolute';
      this.pre.style.left = '50%';
      this.pre.style.top = '50%';
      this.pre.style.transform = 'translate(-50%, -50%)';
      this.pre.style.zIndex = '9';
      this.pre.style.backgroundAttachment = 'fixed';
      this.pre.style.mixBlendMode = 'difference';
    }
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.context) {
      this.context.clearRect(0, 0, w, h);
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
      this.asciify(this.context, w, h);
      this.hue();
    }
  }

  onMouseMove(e: MouseEvent) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() {
    return this.mouse.x - this.center.x;
  }

  get dy() {
    return this.mouse.y - this.center.y;
  }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let str = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = x * 4 + y * 4 * w;
        const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

        if (a === 0) {
          str += ' ';
          continue;
        }

        const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) idx = this.charset.length - idx - 1;
        str += this.charset[idx];
      }
      str += '\n';
    }
    this.pre.innerHTML = str;
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}

interface CanvasTxtOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

class CanvasTxt {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  txt: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  font: string;

  constructor(txt: string, { fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3' }: CanvasTxtOptions = {}) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;

    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    if (!this.context) {
      return;
    }

    this.context.font = this.font;
    const lines = this.txt.split('\n');
    const metrics = lines.map((line) => this.context!.measureText(line || ' '));
    const maxWidth = Math.ceil(Math.max(...metrics.map((m) => m.width), 0));

    const sample = this.context.measureText('Mg');
    const ascent = Math.ceil(sample.actualBoundingBoxAscent || this.fontSize * 0.75);
    const descent = Math.ceil(sample.actualBoundingBoxDescent || this.fontSize * 0.25);
    const lineHeight = ascent + descent;

    this.canvas.width = maxWidth + 40;
    this.canvas.height = lineHeight * lines.length + 40;
  }

  render() {
    if (!this.context) {
      return;
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;

    const lines = this.txt.split('\n');
    const sample = this.context.measureText('Mg');
    const ascent = Math.ceil(sample.actualBoundingBoxAscent || this.fontSize * 0.75);
    const descent = Math.ceil(sample.actualBoundingBoxDescent || this.fontSize * 0.25);
    const lineHeight = ascent + descent;

    let yPos = 20 + ascent;
    for (const line of lines) {
      this.context.fillText(line, 20, yPos);
      yPos += lineHeight;
    }
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

interface CanvAsciiOptions {
  text: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  enableWaves: boolean;
}

class CanvAscii {
  originalTextString: string;
  textString: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  container: HTMLElement;
  width: number;
  height: number;
  enableWaves: boolean;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  mouse: { x: number; y: number };
  textCanvas!: CanvasTxt;
  texture!: THREE.CanvasTexture;
  geometry: THREE.PlaneGeometry | undefined;
  material: THREE.ShaderMaterial | undefined;
  mesh!: THREE.Mesh;
  renderer!: THREE.WebGLRenderer;
  filter!: AsciiFilter;
  center: { x: number; y: number } = { x: 0, y: 0 };
  animationFrameId: number = 0;
  maxRotation = 0.2;

  constructor(
    { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves }: CanvAsciiOptions,
    containerElem: HTMLElement,
    width: number,
    height: number
  ) {
    this.originalTextString = text;
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();
    this.mouse = { x: this.width / 2, y: this.height / 2 };

    this.onMouseMove = this.onMouseMove.bind(this);
  }

  async init() {
    try {
      await document.fonts.load('600 200px "IBM Plex Mono"');
      await document.fonts.load('500 12px "IBM Plex Mono"');
    } catch {}
    await document.fonts.ready;
    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: 'IBM Plex Mono',
      color: this.textColor
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    // Placeholder geometry — setSize() computes the correct dimensions after renderer is ready.
    this.geometry = new THREE.PlaneGeometry(1, 1, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
        uWaveStrength: { value: 1.0 }
      }
    });

    // The mesh is added once here. setSize() only ever updates mesh.geometry in-place.
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: 'IBM Plex Mono',
      fontSize: this.asciiFontSize,
      invert: true
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('touchmove', this.onMouseMove);
  }

  setSize(w: number, h: number) {
    if (w <= 0 || h <= 0) {
      return;
    }

    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    // 1. Compute responsive values from immutable viewport-derived inputs.
    const widthRatio = THREE.MathUtils.clamp((w - 400) / 880, 0, 1);
    const targetTextFontSize = Math.round(80 + 160 * widthRatio); // 80px @ <=400px, 240px @ >=1280px
    const targetAsciiFontSize = Math.round(3 + 5 * widthRatio); // 3px @ narrow widths, 8px @ desktop

    // 2. Compute visible frustum at mesh depth (z=0, camera at z=30).
    const vHeight = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * 30;
    const vWidth = vHeight * this.camera.aspect;
    const maxW = vWidth * 0.84;
    const maxH = vHeight * 0.84;

    // 3. Pick line layout from current dimensions, not hard breakpoints.
    // Choose 2-line only when it materially increases fitted height.
    const words = this.originalTextString.trim().split(/\s+/);
    const oneLineText = words.join(' ');
    const splitIndex = Math.ceil(words.length / 2);
    const twoLineText = words.length > 1
      ? `${words.slice(0, splitIndex).join(' ')}\n${words.slice(splitIndex).join(' ')}`
      : oneLineText;

    const estimateAspect = (text: string) => {
      const lines = text.split('\n');
      const maxChars = Math.max(...lines.map((line) => line.length), 1);
      return maxChars / Math.max(lines.length, 1);
    };

    const fittedHeight = (aspect: number) => Math.min(maxH, maxW / Math.max(aspect, 0.01));

    let targetText = oneLineText;
    const allowWrap = w < 900;
    if (allowWrap && twoLineText !== oneLineText) {
      const oneLineHeight = fittedHeight(estimateAspect(oneLineText));
      const twoLineHeight = fittedHeight(estimateAspect(twoLineText));
      if (twoLineHeight > oneLineHeight * 1.22) {
        targetText = twoLineText;
      }
    }

    // 4. Update text texture in-place if font size or wrapping changed.
    if (
      this.textCanvas &&
      (Math.abs(targetTextFontSize - this.textFontSize) >= 1 || targetText !== this.textString)
    ) {
      this.textFontSize = targetTextFontSize;
      this.textString = targetText;
      this.textCanvas.txt = targetText;
      this.textCanvas.fontSize = targetTextFontSize;
      this.textCanvas.font = `600 ${targetTextFontSize}px ${this.textCanvas.fontFamily}`;
      this.textCanvas.resize();
      this.textCanvas.render();
      if (this.texture) {
        this.texture.needsUpdate = true;
      }
    }

    // 3. Update ASCII filter sampling density in-place (no recreate).
    if (this.filter && targetAsciiFontSize !== this.asciiFontSize) {
      this.asciiFontSize = targetAsciiFontSize;
      this.filter.fontSize = targetAsciiFontSize;
    }

    // 5. Fit plane to safe visible space from current text dimensions.
    if (this.mesh && this.textCanvas) {
      const textAspect = this.textCanvas.width / Math.max(this.textCanvas.height, 1);
      const planeH = Math.min(maxH, maxW / Math.max(textAspect, 0.01));
      const planeW = planeH * textAspect;

      this.geometry?.dispose();
      this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
      this.mesh.geometry = this.geometry;

      // Keep deformation and tilt proportional to available width at narrow viewports.
      const waveStrength = this.enableWaves
        ? THREE.MathUtils.clamp(0.15 + 0.85 * widthRatio, 0.15, 1)
        : 0;
      this.maxRotation = THREE.MathUtils.clamp(0.06 + 0.14 * widthRatio, 0.06, 0.2);
      (this.mesh.material as THREE.ShaderMaterial).uniforms.uWaveStrength.value = waveStrength;

      // Clamp any prior interactive rotation to the new safe bound immediately.
      this.mesh.rotation.x = THREE.MathUtils.clamp(this.mesh.rotation.x, -this.maxRotation, this.maxRotation);
      this.mesh.rotation.y = THREE.MathUtils.clamp(this.mesh.rotation.y, -this.maxRotation, this.maxRotation);
    }

    // 6. Resize renderer + ASCII filter (also triggers filter.reset() which recomputes cols/rows).
    this.filter.setSize(w, h);
    this.center = { x: w / 2, y: h / 2 };

    // 7. Reset interaction anchor to center so resize cannot keep stale cursor-driven tilt.
    this.mouse = { x: w / 2, y: h / 2 };
  }

  load() {
    this.animate();
  }

  onMouseMove(evt: MouseEvent | TouchEvent) {
    const e = (evt as TouchEvent).touches ? (evt as TouchEvent).touches[0] : (evt as MouseEvent);
    const bounds = this.container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    this.mouse = { x, y };
  }

  animate() {
    const animateFrame = () => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
  }

  render() {
    const time = new Date().getTime() * 0.001;

    this.textCanvas.render();
    this.texture.needsUpdate = true;

    (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = Math.sin(time);

    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    const maxRot = this.maxRotation;
    const x = map(this.mouse.y, 0, this.height, maxRot, -maxRot);
    const y = map(this.mouse.x, 0, this.width, -maxRot, maxRot);

    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
  }

  clear() {
    this.scene.traverse(object => {
      const obj = object as unknown as THREE.Mesh;
      if (!obj.isMesh) return;
      [obj.material].flat().forEach(material => {
        material.dispose();
        Object.keys(material).forEach(key => {
          const matProp = material[key as keyof typeof material];
          if (matProp && typeof matProp === 'object' && 'dispose' in matProp && typeof matProp.dispose === 'function') {
            matProp.dispose();
          }
        });
      });
      obj.geometry.dispose();
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.filter) {
      this.filter.dispose();
      if (this.filter.domElement.parentNode) {
        this.container.removeChild(this.filter.domElement);
      }
    }
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('touchmove', this.onMouseMove);
    this.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}

interface ASCIITextProps {
  text?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
}

export default function ASCIIText({
  text = 'David!',
  textColor = '#fdf9f3',
  enableWaves = true
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<CanvAscii | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    let rebuildVersion = 0;
    let lastResizeSize = { width: 0, height: 0 };

    const computeResponsiveFontSizes = (containerWidth: number) => {
      // Clamp: desktop min 1280px (240px text), mobile max ~400px (80px text)
      const minWidth = 400;
      const maxWidth = 1280;
      const minTextFontSize = 80;
      const maxTextFontSize = 240;
      
      const clamped = Math.max(minWidth, Math.min(maxWidth, containerWidth));
      const ratio = (clamped - minWidth) / (maxWidth - minWidth);
      
      const textFontSize = minTextFontSize + (maxTextFontSize - minTextFontSize) * ratio;
      // ASCII grid scales linearly with text size
      const asciiFontSize = Math.max(4, Math.min(8, Math.round(textFontSize / 30)));
      // Plane base height also scales
      const planeBaseHeight = Math.max(6, Math.min(24, Math.round(containerWidth / 50)));
      
      return { textFontSize, asciiFontSize, planeBaseHeight };
    };

    const createAndInit = async (container: HTMLDivElement, w: number, h: number) => {
      const { textFontSize, asciiFontSize, planeBaseHeight } = computeResponsiveFontSizes(w);
      const instance = new CanvAscii(
        { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves },
        container,
        w,
        h
      );
      await instance.init();
      return instance;
    };

    const rebuildAtSize = async (width: number, height: number) => {
      if (cancelled || width <= 0 || height <= 0) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const version = ++rebuildVersion;
      asciiRef.current?.dispose();
      asciiRef.current = null;

      const instance = await createAndInit(container, width, height);
      if (cancelled || version !== rebuildVersion) {
        instance.dispose();
        return;
      }

      asciiRef.current = instance;
      asciiRef.current.load();
    };

    const setup = async () => {
      const { width, height } = containerRef.current!.getBoundingClientRect();

      if (width === 0 || height === 0) {
        observer = new IntersectionObserver(
          async ([entry]) => {
            if (cancelled) return;
            if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
              const { width: w, height: h } = entry.boundingClientRect;
              observer?.disconnect();
              observer = null;

              if (!cancelled) {
                asciiRef.current = await createAndInit(containerRef.current!, w, h);
                if (!cancelled && asciiRef.current) {
                  asciiRef.current.load();
                }
              }
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(containerRef.current!);
        return;
      }

      asciiRef.current = await createAndInit(containerRef.current!, width, height);
      if (!cancelled && asciiRef.current) {
        asciiRef.current.load();

        ro = new ResizeObserver(entries => {
          if (!entries[0] || !asciiRef.current) return;
          const { width: w, height: h } = entries[0].contentRect;
          if (w > 0 && h > 0) {
            asciiRef.current.setSize(w, h);

            lastResizeSize = { width: w, height: h };
            if (resizeDebounce) {
              clearTimeout(resizeDebounce);
            }

            // Rebuild after resize settles so state matches a fresh load at this size.
            resizeDebounce = setTimeout(() => {
              void rebuildAtSize(lastResizeSize.width, lastResizeSize.height);
            }, 140);
          }
        });
        ro.observe(containerRef.current!);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (ro) ro.disconnect();
      if (resizeDebounce) clearTimeout(resizeDebounce);
      if (asciiRef.current) {
        asciiRef.current.dispose();
        asciiRef.current = null;
      }
    };
  }, [text, textColor, enableWaves]);

  return (
    <div
      ref={containerRef}
      className="ascii-text-container"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&display=swap');

        .ascii-text-container canvas {
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
        }

        .ascii-text-container pre {
          margin: 0;
          user-select: none;
          padding: 0;
          line-height: 1em;
          text-align: left;
          position: absolute;
          left: 0;
          top: 0;
          background-image: radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%);
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
