"use client";

/**
 * BakuganModel.tsx — Loads and renders 3D Bakugan models using Three.js.
 * Uses a shared renderer to avoid WebGL context limits.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Shared renderer (singleton)                                         */
/* ------------------------------------------------------------------ */

let sharedRenderer: THREE.WebGLRenderer | null = null;
let rendererRefCount = 0;

function getSharedRenderer(): THREE.WebGLRenderer {
  if (!sharedRenderer) {
    sharedRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    sharedRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    sharedRenderer.setClearColor(0x000000, 0);
  }
  rendererRefCount++;
  return sharedRenderer;
}

function releaseSharedRenderer() {
  rendererRefCount--;
  if (rendererRefCount <= 0 && sharedRenderer) {
    sharedRenderer.dispose();
    sharedRenderer = null;
    rendererRefCount = 0;
  }
}

/* ------------------------------------------------------------------ */
/*  Attribute colors for fallback                                       */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_COLORS: Record<string, string> = {
  pyrus: "#dc2626",
  aquos: "#2563eb",
  subterra: "#d97706",
  haos: "#eab308",
  darkus: "#7c3aed",
  ventus: "#16a34a",
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface BakuganModelProps {
  name: string;
  attribute?: string;
  modelPath?: string;
  size?: number;
  className?: string;
  autoRotate?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BakuganModel({
  name,
  attribute = "pyrus",
  modelPath,
  size = 120,
  className = "",
  autoRotate = true,
}: BakuganModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !modelPath || error) return;

    const container = containerRef.current;
    let animationId: number | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let obj: THREE.Group | null = null;

    const init = async () => {
      try {
        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.z = 3;

        // Use shared renderer
        renderer = getSharedRenderer();
        renderer.setSize(size, size);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-1, -1, -1);
        scene.add(backLight);

        // Load OBJ model
        const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
        const objLoader = new OBJLoader();

        obj = await objLoader.loadAsync(modelPath);

        // Center and scale model
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = box.getSize(new THREE.Vector3()).length();
        const scale = 2 / maxSize;

        obj.position.sub(center);
        obj.scale.multiplyScalar(scale);

        scene.add(obj);

        // Try to load textures
        const textureLoader = new THREE.TextureLoader();
        for (let i = 1; i <= 4; i++) {
          const texPath = modelPath.replace("Model.obj", `mat${i}.png`);
          try {
            const texture = await textureLoader.loadAsync(texPath);
            obj.traverse((child) => {
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

        // Animation loop
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          if (autoRotate && obj) {
            obj.rotation.y += 0.01;
          }
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();

        setLoaded(true);
      } catch (err) {
        console.warn(`Failed to load model: ${modelPath}`, err);
        setError(true);
      }
    };

    init();

    return () => {
      if (animationId !== null) cancelAnimationFrame(animationId);
      if (renderer) {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        releaseSharedRenderer();
      }
    };
  }, [modelPath, size, autoRotate, error]);

  // Fallback SVG if model failed to load
  if (error || !modelPath) {
    const color = ATTRIBUTE_COLORS[attribute] || "#666";
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <defs>
            <radialGradient id={`sphere-${name}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill={`url(#sphere-${name})`} stroke={color} strokeWidth="2" />
          <ellipse cx="38" cy="38" rx="10" ry="6" fill="white" opacity="0.2" transform="rotate(-30 38 38)" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${className}`}
      style={{ width: size, height: size }}
    />
  );
}
