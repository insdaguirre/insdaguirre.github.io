"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  InstancedMesh,
  MathUtils,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  ShaderChunk,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type WebGLRendererParameters,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface SceneConfig {
  canvas: HTMLCanvasElement;
  rendererOptions?: Partial<WebGLRendererParameters>;
  size?: "parent" | { width: number; height: number };
}

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

interface SceneSize {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

interface RenderState {
  elapsed: number;
  delta: number;
}

class SceneRuntime {
  private readonly config: SceneConfig;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private resizeTimer?: number;
  private animationFrameId = 0;
  private readonly clock = new Clock();
  private readonly animationState: RenderState = { elapsed: 0, delta: 0 };
  private isVisible = false;
  private isAnimating = false;
  private readonly handleResize = () => this.onResize();
  private readonly handleIntersection = (entries: IntersectionObserverEntry[]) =>
    this.onIntersection(entries);
  private readonly handleVisibilityChange = () => this.onVisibilityChange();

  canvas: HTMLCanvasElement;
  camera: PerspectiveCamera;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene: Scene;
  renderer: WebGLRenderer;
  size: SceneSize = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0,
  };

  render: () => void = this.defaultRender.bind(this);
  onBeforeRender: (state: RenderState) => void = () => {};
  onAfterRender: (state: RenderState) => void = () => {};
  onAfterResize: (size: SceneSize) => void = () => {};

  constructor(config: SceneConfig) {
    this.config = config;
    this.canvas = config.canvas;
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      ...(config.rendererOptions ?? {}),
    });
    this.canvas.style.display = "block";
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.resize();
    this.initObservers();
  }

  private initObservers() {
    if (!(this.config.size instanceof Object)) {
      window.addEventListener("resize", this.handleResize);

      if (this.config.size === "parent" && this.canvas.parentNode instanceof Element) {
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this.canvas.parentNode);
      }
    }

    this.intersectionObserver = new IntersectionObserver(this.handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });
    this.intersectionObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private onResize() {
    if (this.resizeTimer) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => this.resize(), 100);
  }

  resize() {
    let width: number;
    let height: number;

    if (this.config.size instanceof Object) {
      width = this.config.size.width;
      height = this.config.size.height;
    } else if (this.config.size === "parent" && this.canvas.parentNode instanceof HTMLElement) {
      width = this.canvas.parentNode.offsetWidth;
      height = this.canvas.parentNode.offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;
    this.updateCamera();
    this.updateRenderer();
    this.onAfterResize(this.size);
  }

  private updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;

    if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
      this.adjustFov(this.cameraMinAspect);
    } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
      this.adjustFov(this.cameraMaxAspect);
    } else {
      this.camera.fov = this.cameraFov;
    }

    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  private adjustFov(aspect: number) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
    const newTan = tanFov / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
  }

  private updateWorldSize() {
    const fovRad = (this.camera.fov * Math.PI) / 180;

    this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
    this.size.wWidth = this.size.wHeight * this.size.ratio;
  }

  private updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);

    let pixelRatio = window.devicePixelRatio;

    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }

    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }

  private onIntersection(entries: IntersectionObserverEntry[]) {
    this.isAnimating = entries[0]?.isIntersecting ?? false;

    if (this.isAnimating) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  private onVisibilityChange() {
    if (!this.isAnimating) {
      return;
    }

    if (document.hidden) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  private startAnimation() {
    if (this.isVisible) {
      return;
    }

    const animateFrame = () => {
      this.animationFrameId = window.requestAnimationFrame(animateFrame);
      this.animationState.delta = this.clock.getDelta();
      this.animationState.elapsed += this.animationState.delta;
      this.onBeforeRender(this.animationState);
      this.render();
      this.onAfterRender(this.animationState);
    };

    this.isVisible = true;
    this.clock.start();
    animateFrame();
  }

  private stopAnimation() {
    if (!this.isVisible) {
      return;
    }

    window.cancelAnimationFrame(this.animationFrameId);
    this.isVisible = false;
    this.clock.stop();
  }

  private defaultRender() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse((object) => {
      const mesh = object as InstancedMesh & {
        material?: Record<string, unknown> & { dispose?: () => void };
        geometry?: { dispose?: () => void };
      };

      if (!mesh.isMesh || !mesh.material) {
        return;
      }

      Object.values(mesh.material).forEach((value) => {
        if (value && typeof value === "object" && "dispose" in value && typeof value.dispose === "function") {
          value.dispose();
        }
      });

      mesh.material.dispose?.();
      mesh.geometry?.dispose?.();
    });

    this.scene.clear();
  }

  dispose() {
    if (this.resizeTimer) {
      window.clearTimeout(this.resizeTimer);
    }

    window.removeEventListener("resize", this.handleResize);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.stopAnimation();
    this.clear();
    this.renderer.dispose();
  }
}

function hasUsablePrecision(context: WebGLContext) {
  const shaderPairs: Array<[number, number]> = [
    [context.VERTEX_SHADER, context.HIGH_FLOAT],
    [context.FRAGMENT_SHADER, context.HIGH_FLOAT],
    [context.VERTEX_SHADER, context.MEDIUM_FLOAT],
    [context.FRAGMENT_SHADER, context.MEDIUM_FLOAT],
  ];

  return shaderPairs.some(([shaderType, precisionType]) => {
    const precision = context.getShaderPrecisionFormat(shaderType, precisionType);
    return precision !== null && typeof precision.precision === "number";
  });
}

function createVerifiedContext(
  canvas: HTMLCanvasElement,
  attributes: WebGLContextAttributes,
) {
  const contextIds = ["webgl2", "webgl", "experimental-webgl"] as const;

  for (const contextId of contextIds) {
    try {
      const context = canvas.getContext(contextId, attributes) as WebGLContext | null;

      if (context && hasUsablePrecision(context)) {
        return context;
      }
    } catch {
      continue;
    }
  }

  return null;
}

interface PhysicsConfig {
  count: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  maxSize: number;
  minSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  controlSphere0?: boolean;
  followCursor?: boolean;
}

class BallPhysics {
  config: PhysicsConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center = new Vector3();

  constructor(config: PhysicsConfig) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.initializePositions();
    this.setSizes();
  }

  private initializePositions() {
    this.center.toArray(this.positionData, 0);

    for (let index = 1; index < this.config.count; index += 1) {
      const offset = 3 * index;
      this.positionData[offset] = MathUtils.randFloatSpread(2 * this.config.maxX);
      this.positionData[offset + 1] = MathUtils.randFloatSpread(2 * this.config.maxY);
      this.positionData[offset + 2] = MathUtils.randFloatSpread(2 * this.config.maxZ);
    }
  }

  setSizes() {
    this.sizeData[0] = this.config.size0;

    for (let index = 1; index < this.config.count; index += 1) {
      this.sizeData[index] = MathUtils.randFloat(this.config.minSize, this.config.maxSize);
    }
  }

  update({ delta }: RenderState) {
    const startIndex = this.config.controlSphere0 ? 1 : 0;

    if (this.config.controlSphere0) {
      const first = new Vector3().fromArray(this.positionData, 0);
      first.lerp(this.center, 0.1).toArray(this.positionData, 0);
      new Vector3(0, 0, 0).toArray(this.velocityData, 0);
    }

    for (let index = startIndex; index < this.config.count; index += 1) {
      const offset = 3 * index;
      const position = new Vector3().fromArray(this.positionData, offset);
      const velocity = new Vector3().fromArray(this.velocityData, offset);

      velocity.y -= delta * this.config.gravity * this.sizeData[index];
      velocity.multiplyScalar(this.config.friction);
      velocity.clampLength(0, this.config.maxVelocity);
      position.add(velocity);
      position.toArray(this.positionData, offset);
      velocity.toArray(this.velocityData, offset);
    }

    for (let index = startIndex; index < this.config.count; index += 1) {
      const offset = 3 * index;
      const position = new Vector3().fromArray(this.positionData, offset);
      const velocity = new Vector3().fromArray(this.velocityData, offset);
      const radius = this.sizeData[index];

      for (let compareIndex = index + 1; compareIndex < this.config.count; compareIndex += 1) {
        const compareOffset = 3 * compareIndex;
        const comparePosition = new Vector3().fromArray(this.positionData, compareOffset);
        const compareVelocity = new Vector3().fromArray(this.velocityData, compareOffset);
        const difference = new Vector3().copy(comparePosition).sub(position);
        const distance = difference.length();
        const combinedRadius = radius + this.sizeData[compareIndex];

        if (distance >= combinedRadius) {
          continue;
        }

        const overlap = combinedRadius - distance;
        const correction = difference.normalize().multiplyScalar(0.5 * overlap);
        const velocityCorrection = correction
          .clone()
          .multiplyScalar(Math.max(velocity.length(), 1));

        position.sub(correction);
        velocity.sub(velocityCorrection);
        position.toArray(this.positionData, offset);
        velocity.toArray(this.velocityData, offset);

        comparePosition.add(correction);
        compareVelocity.add(
          correction.clone().multiplyScalar(Math.max(compareVelocity.length(), 1)),
        );
        comparePosition.toArray(this.positionData, compareOffset);
        compareVelocity.toArray(this.velocityData, compareOffset);
      }

      if (this.config.controlSphere0) {
        const centerPosition = new Vector3().fromArray(this.positionData, 0);
        const difference = centerPosition.sub(position.clone());
        const distance = difference.length();
        const combinedRadius = radius + this.sizeData[0];

        if (distance < combinedRadius) {
          const correction = difference.normalize().multiplyScalar(combinedRadius - distance);
          const velocityCorrection = correction
            .clone()
            .multiplyScalar(Math.max(velocity.length(), 2));

          position.sub(correction);
          velocity.sub(velocityCorrection);
        }
      }

      if (Math.abs(position.x) + radius > this.config.maxX) {
        position.x = Math.sign(position.x) * (this.config.maxX - radius);
        velocity.x = -velocity.x * this.config.wallBounce;
      }

      if (this.config.gravity === 0) {
        if (Math.abs(position.y) + radius > this.config.maxY) {
          position.y = Math.sign(position.y) * (this.config.maxY - radius);
          velocity.y = -velocity.y * this.config.wallBounce;
        }
      } else if (position.y - radius < -this.config.maxY) {
        position.y = -this.config.maxY + radius;
        velocity.y = -velocity.y * this.config.wallBounce;
      }

      const maxBoundary = Math.max(this.config.maxZ, this.config.maxSize);

      if (Math.abs(position.z) + radius > maxBoundary) {
        position.z = Math.sign(position.z) * (this.config.maxZ - radius);
        velocity.z = -velocity.z * this.config.wallBounce;
      }

      position.toArray(this.positionData, offset);
      velocity.toArray(this.velocityData, offset);
    }
  }
}

class BallMaterial extends MeshPhysicalMaterial {
  readonly uniforms = {
    thicknessDistortion: { value: 0.1 },
    thicknessAmbient: { value: 0 },
    thicknessAttenuation: { value: 0.1 },
    thicknessPower: { value: 2 },
    thicknessScale: { value: 10 },
  };

  readonly defines = { USE_UV: "" };

  constructor(params: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) {
    super(params);
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
        `,
      );

      const lightsChunk = ShaderChunk.lights_fragment_begin.replaceAll(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <lights_fragment_begin>",
        lightsChunk,
      );
    };
  }
}

interface BallpitRuntimeConfig {
  count: number;
  colors: number[];
  ambientColor: number;
  ambientIntensity: number;
  lightIntensity: number;
  materialParams: {
    metalness: number;
    roughness: number;
    clearcoat: number;
    clearcoatRoughness: number;
  };
  minSize: number;
  maxSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  controlSphere0: boolean;
  followCursor: boolean;
}

const defaultBallpitConfig: BallpitRuntimeConfig = {
  count: 200,
  colors: [0x5227ff, 0xb19eef, 0xff00d1],
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.42,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
};

type BallpitConfig = Partial<BallpitRuntimeConfig>;

const instanceObject = new Object3D();

class BallpitMesh extends InstancedMesh {
  config: BallpitRuntimeConfig;
  physics: BallPhysics;
  ambientLight: AmbientLight;
  light: PointLight;

  constructor(renderer: WebGLRenderer, params: BallpitConfig = {}) {
    const config = { ...defaultBallpitConfig, ...params };
    const roomEnvironment = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    const environmentTexture = pmrem.fromScene(roomEnvironment).texture;
    const geometry = new SphereGeometry();
    const material = new BallMaterial({
      envMap: environmentTexture,
      ...config.materialParams,
    });

    material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, config.count);

    this.config = config;
    this.physics = new BallPhysics(config);
    this.ambientLight = new AmbientLight(config.ambientColor, config.ambientIntensity);
    this.light = new PointLight(config.colors[0], config.lightIntensity);

    this.add(this.ambientLight);
    this.add(this.light);
    this.setColors(config.colors);

    roomEnvironment.dispose();
    pmrem.dispose();
  }

  setColors(colors: number[]) {
    if (colors.length <= 1) {
      return;
    }

    const colorObjects = colors.map((color) => new Color(color));
    const getColorAt = (ratio: number, out = new Color()) => {
      const clamped = Math.max(0, Math.min(1, ratio));
      const scaled = clamped * (colors.length - 1);
      const index = Math.floor(scaled);
      const start = colorObjects[index];

      if (index >= colors.length - 1) {
        return start.clone();
      }

      const alpha = scaled - index;
      const end = colorObjects[index + 1];
      out.r = start.r + alpha * (end.r - start.r);
      out.g = start.g + alpha * (end.g - start.g);
      out.b = start.b + alpha * (end.b - start.b);
      return out;
    };

    for (let index = 0; index < this.count; index += 1) {
      const color = getColorAt(index / this.count);
      this.setColorAt(index, color);

      if (index === 0) {
        this.light.color.copy(color);
      }
    }

    if (this.instanceColor) {
      this.instanceColor.needsUpdate = true;
    }
  }

  update(state: RenderState) {
    this.physics.update(state);

    for (let index = 0; index < this.count; index += 1) {
      instanceObject.position.fromArray(this.physics.positionData, 3 * index);

      if (index === 0 && this.config.followCursor === false) {
        instanceObject.scale.setScalar(0);
      } else {
        instanceObject.scale.setScalar(this.physics.sizeData[index]);
      }

      instanceObject.updateMatrix();
      this.setMatrixAt(index, instanceObject.matrix);

      if (index === 0) {
        this.light.position.copy(instanceObject.position);
      }
    }

    this.instanceMatrix.needsUpdate = true;
  }
}

interface PointerData {
  position: Vector2;
  normalizedPosition: Vector2;
  hover: boolean;
  touching: boolean;
  onEnter: (data: PointerData) => void;
  onMove: (data: PointerData) => void;
  onClick: (data: PointerData) => void;
  onLeave: (data: PointerData) => void;
  dispose?: () => void;
}

const pointerPosition = new Vector2();
const pointerDataMap = new Map<HTMLElement, PointerData>();
let pointerListenersActive = false;

function isPointerInside(rect: DOMRect) {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.left + rect.width &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.top + rect.height
  );
}

function updatePointerData(data: PointerData, rect: DOMRect) {
  data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top);
  data.normalizedPosition.set(
    (data.position.x / rect.width) * 2 - 1,
    (-data.position.y / rect.height) * 2 + 1,
  );
}

function processPointerInteraction() {
  pointerDataMap.forEach((data, element) => {
    const rect = element.getBoundingClientRect();

    if (isPointerInside(rect)) {
      updatePointerData(data, rect);

      if (!data.hover) {
        data.hover = true;
        data.onEnter(data);
      }

      data.onMove(data);
      return;
    }

    if (data.hover && !data.touching) {
      data.hover = false;
      data.onLeave(data);
    }
  });
}

function handlePointerMove(event: PointerEvent) {
  pointerPosition.set(event.clientX, event.clientY);
  processPointerInteraction();
}

function handlePointerLeave() {
  pointerDataMap.forEach((data) => {
    if (data.hover) {
      data.hover = false;
      data.onLeave(data);
    }
  });
}

function handlePointerClick(event: PointerEvent) {
  pointerPosition.set(event.clientX, event.clientY);

  pointerDataMap.forEach((data, element) => {
    const rect = element.getBoundingClientRect();
    updatePointerData(data, rect);

    if (isPointerInside(rect)) {
      data.onClick(data);
    }
  });
}

function handleTouchStart(event: TouchEvent) {
  if (event.touches.length === 0) {
    return;
  }

  event.preventDefault();
  pointerPosition.set(event.touches[0].clientX, event.touches[0].clientY);

  pointerDataMap.forEach((data, element) => {
    const rect = element.getBoundingClientRect();

    if (!isPointerInside(rect)) {
      return;
    }

    data.touching = true;
    updatePointerData(data, rect);

    if (!data.hover) {
      data.hover = true;
      data.onEnter(data);
    }

    data.onMove(data);
  });
}

function handleTouchMove(event: TouchEvent) {
  if (event.touches.length === 0) {
    return;
  }

  event.preventDefault();
  pointerPosition.set(event.touches[0].clientX, event.touches[0].clientY);

  pointerDataMap.forEach((data, element) => {
    const rect = element.getBoundingClientRect();
    updatePointerData(data, rect);

    if (isPointerInside(rect)) {
      if (!data.hover) {
        data.hover = true;
        data.touching = true;
        data.onEnter(data);
      }

      data.onMove(data);
    } else if (data.hover && data.touching) {
      data.onMove(data);
    }
  });
}

function handleTouchEnd() {
  pointerDataMap.forEach((data) => {
    if (!data.touching) {
      return;
    }

    data.touching = false;

    if (data.hover) {
      data.hover = false;
      data.onLeave(data);
    }
  });
}

function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }) {
  const data: PointerData = {
    position: new Vector2(),
    normalizedPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: () => {},
    onMove: () => {},
    onClick: () => {},
    onLeave: () => {},
    ...options,
  };

  if (!pointerDataMap.has(options.domElement)) {
    pointerDataMap.set(options.domElement, data);

    if (!pointerListenersActive) {
      document.body.addEventListener("pointermove", handlePointerMove);
      document.body.addEventListener("pointerleave", handlePointerLeave);
      document.body.addEventListener("click", handlePointerClick);
      document.body.addEventListener("touchstart", handleTouchStart, { passive: false });
      document.body.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.body.addEventListener("touchend", handleTouchEnd, { passive: false });
      document.body.addEventListener("touchcancel", handleTouchEnd, { passive: false });
      pointerListenersActive = true;
    }
  }

  data.dispose = () => {
    pointerDataMap.delete(options.domElement);

    if (pointerDataMap.size > 0) {
      return;
    }

    document.body.removeEventListener("pointermove", handlePointerMove);
    document.body.removeEventListener("pointerleave", handlePointerLeave);
    document.body.removeEventListener("click", handlePointerClick);
    document.body.removeEventListener("touchstart", handleTouchStart);
    document.body.removeEventListener("touchmove", handleTouchMove);
    document.body.removeEventListener("touchend", handleTouchEnd);
    document.body.removeEventListener("touchcancel", handleTouchEnd);
    pointerListenersActive = false;
  };

  return data;
}

interface BallpitInstance {
  dispose: () => void;
}

function createBallpit(
  canvas: HTMLCanvasElement,
  config: BallpitConfig = {},
): BallpitInstance | null {
  const rendererContext = createVerifiedContext(canvas, {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  if (!rendererContext) {
    return null;
  }

  let runtime: SceneRuntime | null = null;
  let spheres: BallpitMesh | null = null;
  let pointerData: PointerData | undefined;

  try {
    runtime = new SceneRuntime({
      canvas,
      size: "parent",
      rendererOptions: {
        antialias: true,
        alpha: true,
        context: rendererContext,
      },
    });

    runtime.renderer.toneMapping = ACESFilmicToneMapping;
    runtime.camera.position.set(0, 0, 20);
    runtime.camera.lookAt(0, 0, 0);
    runtime.cameraMaxAspect = 1.5;
    runtime.maxPixelRatio = 1.5;
    runtime.resize();

    spheres = new BallpitMesh(runtime.renderer, config);
    runtime.scene.add(spheres);

    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const intersectionPoint = new Vector3();

    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";

    pointerData =
      config.followCursor === false
        ? undefined
        : createPointerData({
            domElement: canvas,
            onMove(data) {
              if (!runtime || !spheres) {
                return;
              }

              raycaster.setFromCamera(data.normalizedPosition, runtime.camera);
              runtime.camera.getWorldDirection(plane.normal);
              raycaster.ray.intersectPlane(plane, intersectionPoint);
              spheres.physics.center.copy(intersectionPoint);
              spheres.config.controlSphere0 = true;
            },
            onLeave() {
              spheres?.config && (spheres.config.controlSphere0 = false);
            },
          });

    runtime.onBeforeRender = (state) => {
      spheres?.update(state);
    };

    runtime.onAfterResize = (size) => {
      if (!spheres) {
        return;
      }

      spheres.config.maxX = size.wWidth / 2;
      spheres.config.maxY = size.wHeight / 2;
    };
    runtime.onAfterResize(runtime.size);

    return {
      dispose() {
        pointerData?.dispose?.();

        if (runtime && spheres) {
          runtime.scene.remove(spheres);
          (spheres.material as Material).dispose();
          spheres.geometry.dispose();
        }

        runtime?.dispose();
        runtime = null;
        spheres = null;
      },
    };
  } catch (error) {
    pointerData?.dispose?.();

    if (runtime && spheres) {
      runtime.scene.remove(spheres);
      (spheres.material as Material).dispose();
      spheres.geometry.dispose();
    }

    runtime?.dispose();
    console.warn("Ballpit initialization failed. Falling back to static background.", error);
    return null;
  }
}

export interface BallpitProps extends BallpitConfig {
  className?: string;
  followCursor?: boolean;
}

export default function Ballpit({
  className = "",
  followCursor = true,
  ...props
}: BallpitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<BallpitInstance | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);
  const serializedConfig = JSON.stringify({ followCursor, ...props });

  useEffect(() => {
    const canvas = canvasRef.current;
    let frameId = 0;

    if (!canvas) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      if (!canvas.isConnected) {
        setFallbackActive(true);
        return;
      }

      instanceRef.current = createBallpit(
        canvas,
        JSON.parse(serializedConfig) as BallpitConfig,
      );
      setFallbackActive(instanceRef.current === null);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, [serializedConfig]);

  return (
    <div className={className}>
      {fallbackActive ? (
        <div className="h-full w-full bg-[radial-gradient(circle_at_28%_24%,rgba(82,39,255,0.16),transparent_0,transparent_20%),radial-gradient(circle_at_72%_28%,rgba(255,0,209,0.1),transparent_0,transparent_18%),linear-gradient(180deg,#050505_0%,#020202_50%,#000_100%)]" />
      ) : null}
      <canvas
        ref={canvasRef}
        className={`h-full w-full ${fallbackActive ? "hidden" : ""}`}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
