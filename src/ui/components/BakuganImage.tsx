"use client";

/**
 * BakuganImage.tsx — Dynamic Bakugan image with 3D model support.
 * Loads 3D OBJ models via Three.js, falls back to SVG placeholder.
 */

import { getModelPath } from "@/lib/model-paths";
import dynamic from "next/dynamic";

// Dynamic import for Three.js (client-only)
const BakuganModel = dynamic(() => import("./BakuganModel"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-full" />,
});

/* ------------------------------------------------------------------ */
/*  Attribute styles                                                    */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_STYLES: Record<string, { primary: string; secondary: string; glow: string; symbol: string }> = {
  pyrus: { primary: "#dc2626", secondary: "#991b1b", glow: "#fca5a5", symbol: "⚔" },
  aquos: { primary: "#2563eb", secondary: "#1e40af", glow: "#93c5fd", symbol: "💧" },
  subterra: { primary: "#d97706", secondary: "#92400e", glow: "#fcd34d", symbol: "🪨" },
  haos: { primary: "#eab308", secondary: "#a16207", glow: "#fef08a", symbol: "✨" },
  darkus: { primary: "#7c3aed", secondary: "#5b21b6", glow: "#c4b5fd", symbol: "🌀" },
  ventus: { primary: "#16a34a", secondary: "#15803d", glow: "#86efac", symbol: "🍃" },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface BakuganImageProps {
  name: string;
  attribute?: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  showName?: boolean;
  use3D?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BakuganImage({
  name,
  attribute = "pyrus",
  imageUrl,
  size = 80,
  className = "",
  showName = true,
  use3D = false,
}: BakuganImageProps) {
  const modelPath = use3D ? getModelPath(name) : undefined;
  const style = ATTRIBUTE_STYLES[attribute] || ATTRIBUTE_STYLES.pyrus;

  // If we have a 3D model, use it
  if (modelPath) {
    return (
      <div className={`relative ${className}`}>
        <BakuganModel
          name={name}
          attribute={attribute}
          modelPath={modelPath}
          size={size}
          autoRotate={true}
        />
        {showName && (
          <div
            className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white/70 truncate"
            style={{ fontSize: Math.max(8, size * 0.1) }}
          >
            {name}
          </div>
        )}
      </div>
    );
  }

  // Fallback: SVG sphere with attribute styling
  const r = size / 2;
  const strokeWidth = size * 0.04;

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`sphere-${attribute}-${name}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={style.glow} stopOpacity="0.9" />
            <stop offset="50%" stopColor={style.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={style.secondary} stopOpacity="1" />
          </radialGradient>
          <filter id={`glow-${attribute}-${name}`} x="-50%" y="-50%" width="200%" height="200%">
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
          fill={`url(#sphere-${attribute}-${name})`}
          stroke={style.secondary}
          strokeWidth={strokeWidth}
        />

        {/* Inner ring */}
        <circle cx={r} cy={r} r={r * 0.65} fill="none" stroke={style.glow} strokeWidth={strokeWidth * 0.5} opacity="0.4" />

        {/* Symbol */}
        <text x={r} y={r * 1.05} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.25} filter={`url(#glow-${attribute}-${name})`}>
          {style.symbol}
        </text>

        {/* Highlight */}
        <ellipse cx={r * 0.7} cy={r * 0.65} rx={r * 0.2} ry={r * 0.12} fill="white" opacity="0.25" transform={`rotate(-30 ${r * 0.7} ${r * 0.65})`} />
      </svg>

      {showName && (
        <div
          className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white/70 truncate"
          style={{ fontSize: Math.max(8, size * 0.1) }}
        >
          {name}
        </div>
      )}
    </div>
  );
}
