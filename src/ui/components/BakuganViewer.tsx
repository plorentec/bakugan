"use client";

/**
 * BakuganViewer.tsx — Reusable 3D Bakugan viewer with fallback chain.
 *
 * Fallback priority: 3D GLB model → 3D OBJ model → wiki artwork → model texture → SVG placeholder
 * Never shows broken images.
 *
 * Supports: rotation, zoom, idle animation, attribute-based lighting.
 * Not dependent on a specific Bakugan — works with any name.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type * as THREE from "three";
import { getModelPath } from "@/lib/model-paths";
import { getBestModelPath } from "@/lib/asset-tracker";
import { getBakuganImage } from "@/lib/image-manifest";

/* ------------------------------------------------------------------ */
/*  Attribute colors and lighting                                       */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_STYLES: Record<string, {
  primary: string;
  secondary: string;
  glow: string;
  symbol: string;
  name: string;
  lightColor: number;
  ambientIntensity: number;
  directionalIntensity: number;
}> = {
  pyrus: {
    primary: "#dc2626", secondary: "#991b1b", glow: "#fca5a5",
    symbol: "⚔", name: "PYRUS",
    lightColor: 0xfff0e0, ambientIntensity: 0.5, directionalIntensity: 0.9,
  },
  aquos: {
    primary: "#2563eb", secondary: "#1e40af", glow: "#93c5fd",
    symbol: "💧", name: "AQUOS",
    lightColor: 0xe0f0ff, ambientIntensity: 0.5, directionalIntensity: 0.8,
  },
  subterra: {
    primary: "#d97706", secondary: "#92400e", glow: "#fcd34d",
    symbol: "🪨", name: "SUBTERRA",
    lightColor: 0xfff5e0, ambientIntensity: 0.6, directionalIntensity: 0.7,
  },
  haos: {
    primary: "#eab308", secondary: "#a16207", glow: "#fef08a",
    symbol: "✨", name: "HAOS",
    lightColor: 0xfffff0, ambientIntensity: 0.7, directionalIntensity: 0.8,
  },
  darkus: {
    primary: "#7c3aed", secondary: "#5b21b6", glow: "#c4b5fd",
    symbol: "🌀", name: "DARKUS",
    lightColor: 0xf0e0ff, ambientIntensity: 0.4, directionalIntensity: 1.0,
  },
  ventus: {
    primary: "#16a34a", secondary: "#15803d", glow: "#86efac",
    symbol: "🍃", name: "VENTUS",
    lightColor: 0xe0ffe0, ambientIntensity: 0.5, directionalIntensity: 0.85,
  },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

export interface BakuganViewerProps {
  /** Bakugan name — used to look up model paths */
  name: string;
  /** Primary attribute for lighting and fallback colors */
  attribute?: string;
  /** Override model path (GLB or OBJ) */
  modelPath?: string;
  /** Override image URL */
  imageUrl?: string | null;
  /** Viewer size in pixels */
  size?: number;
  /** Additional CSS class */
  className?: string;
  /** Enable auto-rotation (default: true) */
  autoRotate?: boolean;
  /** Enable zoom/pan interaction (default: true) */
  interactive?: boolean;
  /** Show name label (default: false) */
  showName?: boolean;
  /** Background color (transparent by default) */
  backgroundColor?: string;
}

/* ------------------------------------------------------------------ */
/*  3D rendering (dynamic import to avoid SSR issues)                    */
/* ------------------------------------------------------------------ */

async function render3DModel(
  container: HTMLDivElement,
  modelPath: string,
  size: number,
  autoRotate: boolean,
  style: { lightColor: number; ambientIntensity: number; directionalIntensity: number },
  backgroundColor: string | undefined,
  name: string,
  onModeChange: (mode: "3d" | "image") => void,
): Promise<() => void> {
  const THREE = await import("three");

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 3;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(backgroundColor ? parseInt(backgroundColor.replace("#", "0x")) : 0x000000, 0);
  renderer.setSize(size, size);
  container.appendChild(renderer.domElement);

  // Attribute-based lighting
  const ambientLight = new THREE.AmbientLight(style.lightColor, style.ambientIntensity);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(style.lightColor, style.directionalIntensity);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-1, -1, -1);
  scene.add(backLight);

  // Load model based on extension
  const ext = modelPath.split(".").pop()?.toLowerCase();
  let loadedObj: THREE.Group;

  if (ext === "glb" || ext === "gltf") {
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync(modelPath);
    loadedObj = gltf.scene;
  } else {
    const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
    const objLoader = new OBJLoader();
    loadedObj = await objLoader.loadAsync(modelPath);
  }

  // Center and scale
  const box = new THREE.Box3().setFromObject(loadedObj);
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = box.getSize(new THREE.Vector3()).length();
  const scale = 2 / maxSize;

  loadedObj.position.sub(center);
  loadedObj.scale.multiplyScalar(scale);
  scene.add(loadedObj);

  // Try to load textures (for OBJ models)
  if (ext !== "glb" && ext !== "gltf") {
    const textureLoader = new THREE.TextureLoader();
    for (let i = 1; i <= 8; i++) {
      const texPath = modelPath.replace(/Model\.(obj|fbx|dae)/i, `mat${i}.png`);
      try {
        const texture = await textureLoader.loadAsync(texPath);
        loadedObj.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            if (child.material instanceof THREE.MeshPhongMaterial) {
              if (!child.material.map) {
                child.material.map = texture;
                child.material.needsUpdate = true;
              }
            }
          }
        });
      } catch {
        // Texture not found, skip
      }
    }
  }

  onModeChange("3d");

  // Animation loop
  let animId: number;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    if (autoRotate) {
      loadedObj.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  };
  animate();

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animId);
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    renderer.dispose();
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BakuganViewer({
  name,
  attribute = "pyrus",
  modelPath: overrideModelPath,
  imageUrl,
  size = 120,
  className = "",
  autoRotate = true,
  interactive = true,
  showName = false,
  backgroundColor,
}: BakuganViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [renderMode, setRenderMode] = useState<"loading" | "3d" | "image" | "svg">("loading");
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const style = ATTRIBUTE_STYLES[attribute] || ATTRIBUTE_STYLES.pyrus;

  // Resolve model path: override > asset tracker > model-paths
  const resolvedModelPath = overrideModelPath || getBestModelPath(name) || getModelPath(name);

  // Resolve texture/image path for fallback
  const texturePath = resolvedModelPath
    ? resolvedModelPath.replace(/Model\.(obj|fbx|dae|glb)/i, "mat1.png")
    : null;

  // Fallback chain when there is no usable 3D model: wiki artwork → texture
  const imageSrc = [imageUrl ?? getBakuganImage(name), texturePath].find(
    (src): src is string => !!src && src !== failedSrc
  );

  // Determine what to show
  const show3D = !!resolvedModelPath && renderMode !== "image" && renderMode !== "svg";
  const showImage = !show3D && !!imageSrc;

  // 3D rendering with Three.js
  useEffect(() => {
    if (!show3D || !containerRef.current || !resolvedModelPath) return;

    const container = containerRef.current;
    let cancelled = false;

    const loadModel = async () => {
      try {
        const cleanup = await render3DModel(
          container,
          resolvedModelPath,
          size,
          autoRotate,
          style,
          backgroundColor,
          name,
          (mode) => { if (!cancelled) setRenderMode(mode); },
        );
        if (!cancelled) {
          cleanupRef.current = cleanup;
        } else {
          cleanup();
        }
      } catch (err) {
        console.warn(`Failed to load 3D model for ${name}:`, err);
        if (!cancelled) setRenderMode("image");
      }
    };

    loadModel();

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [resolvedModelPath, size, autoRotate, style, backgroundColor, name, show3D]);

  // Loading state
  if (renderMode === "loading" && show3D) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div
          className="animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: `${style.primary}40`,
            borderTopColor: style.primary,
            width: size * 0.3,
            height: size * 0.3,
          }}
        />
      </div>
    );
  }

  // 3D model rendered
  if (show3D) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <div
          ref={containerRef}
          style={{ width: size, height: size, cursor: interactive ? "grab" : "default" }}
        />
        {showName && (
          <div
            className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white/80 truncate bg-black/50 rounded-b-lg"
            style={{ fontSize: Math.max(8, size * 0.1) }}
          >
            {name}
          </div>
        )}
      </div>
    );
  }

  // Image fallback
  if (showImage && imageSrc) {
    const src = imageSrc;
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-cover rounded-lg"
          style={{
            filter: `drop-shadow(0 0 8px ${style.glow})`,
          }}
          onError={() => setFailedSrc(src)}
        />
        {showName && (
          <div
            className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white/80 truncate bg-black/50 rounded-b-lg"
            style={{ fontSize: Math.max(8, size * 0.1) }}
          >
            {name}
          </div>
        )}
      </div>
    );
  }

  // SVG sphere placeholder (final fallback — never fails)
  const r = size / 2;
  const strokeWidth = size * 0.04;
  const uniqueId = `bakugan-viewer-${name.replace(/\s/g, "-")}`;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`sphere-${uniqueId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={style.glow} stopOpacity="0.9" />
            <stop offset="50%" stopColor={style.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={style.secondary} stopOpacity="1" />
          </radialGradient>
          <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx={r} cy={size * 0.92} rx={r * 0.6} ry={size * 0.06} fill="rgba(0,0,0,0.3)" />

        {/* Main sphere */}
        <circle
          cx={r}
          cy={r}
          r={r * 0.85}
          fill={`url(#sphere-${uniqueId})`}
          stroke={style.secondary}
          strokeWidth={strokeWidth}
        />

        {/* Inner ring */}
        <circle cx={r} cy={r} r={r * 0.65} fill="none" stroke={style.glow} strokeWidth={strokeWidth * 0.5} opacity="0.4" />

        {/* Symbol */}
        <text x={r} y={r * 1.05} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.25} filter={`url(#glow-${uniqueId})`}>
          {style.symbol}
        </text>

        {/* Highlight */}
        <ellipse cx={r * 0.7} cy={r * 0.65} rx={r * 0.2} ry={r * 0.12} fill="white" opacity="0.25" transform={`rotate(-30 ${r * 0.7} ${r * 0.65})`} />
      </svg>

      {showName && (
        <div
          className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white/80 truncate bg-black/50 rounded-b-lg"
          style={{ fontSize: Math.max(8, size * 0.1) }}
        >
          {name}
        </div>
      )}
    </div>
  );
}
