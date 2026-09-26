"use client";

/**
 * BakuganImage.tsx — Dynamic Bakugan image using model textures as sprites.
 * Falls back to SVG placeholder if texture fails.
 */

import { useState } from "react";
import { getModelPath } from "@/lib/model-paths";
import { getBakuganImage } from "@/lib/image-manifest";

/* ------------------------------------------------------------------ */
/*  Attribute styles                                                    */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_STYLES: Record<string, {
  primary: string;
  secondary: string;
  glow: string;
  symbol: string;
  name: string;
}> = {
  pyrus: { primary: "#dc2626", secondary: "#991b1b", glow: "#fca5a5", symbol: "⚔", name: "PYRUS" },
  aquos: { primary: "#2563eb", secondary: "#1e40af", glow: "#93c5fd", symbol: "💧", name: "AQUOS" },
  subterra: { primary: "#d97706", secondary: "#92400e", glow: "#fcd34d", symbol: "🪨", name: "SUBTERRA" },
  haos: { primary: "#eab308", secondary: "#a16207", glow: "#fef08a", symbol: "✨", name: "HAOS" },
  darkus: { primary: "#7c3aed", secondary: "#5b21b6", glow: "#c4b5fd", symbol: "🌀", name: "DARKUS" },
  ventus: { primary: "#16a34a", secondary: "#15803d", glow: "#86efac", symbol: "🍃", name: "VENTUS" },
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
}

/* ------------------------------------------------------------------ */
/*  Get texture path from model path                                     */
/* ------------------------------------------------------------------ */

function getTexturePath(name: string): string | null {
  const modelPath = getModelPath(name);
  if (!modelPath) return null;
  return modelPath.replace("Model.obj", "mat1.png");
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
}: BakuganImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const style = ATTRIBUTE_STYLES[attribute] || ATTRIBUTE_STYLES.pyrus;

  // Fallback chain: explicit URL > wiki artwork > model texture > SVG sphere
  const candidates: string[] = [imageUrl ?? getBakuganImage(name), getTexturePath(name)].filter(
    (src): src is string => !!src && src !== failedSrc
  );
  const src = candidates[0];

  // If we have an image source, use it
  if (src) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-cover rounded-lg"
          style={{
            filter: "drop-shadow(0 0 8px " + style.glow + ")",
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

  // Fallback: SVG sphere with attribute styling
  const r = size / 2;
  const strokeWidth = size * 0.04;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
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
          className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white/80 truncate bg-black/50 rounded-b-lg"
          style={{ fontSize: Math.max(8, size * 0.1) }}
        >
          {name}
        </div>
      )}
    </div>
  );
}
