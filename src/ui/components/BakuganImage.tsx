"use client";

/**
 * BakuganImage.tsx — Dynamic Bakugan image with attribute-colored placeholder.
 *
 * Shows a colored SVG placeholder based on attribute until real images are added.
 * Supports fallback to attribute-based placeholder.
 */

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Attribute colors                                                    */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_COLORS: Record<string, { bg: string; accent: string; icon: string }> = {
  pyrus: { bg: "#dc2626", accent: "#fca5a5", icon: "🔥" },
  aquos: { bg: "#2563eb", accent: "#93c5fd", icon: "💧" },
  subterra: { bg: "#d97706", accent: "#fcd34d", icon: "🌍" },
  haos: { bg: "#eab308", accent: "#fef08a", icon: "✨" },
  darkus: { bg: "#7c3aed", accent: "#c4b5fd", icon: "🌑" },
  ventus: { bg: "#16a34a", accent: "#86efac", icon: "🌀" },
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
}: BakuganImageProps) {
  const [imgError, setImgError] = useState(false);
  const colors = ATTRIBUTE_COLORS[attribute] || ATTRIBUTE_COLORS.pyrus;
  const showImage = imageUrl && !imgError;

  if (showImage) {
    return (
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill={colors.bg} stroke={colors.accent} strokeWidth="3" />

      {/* Inner glow */}
      <circle cx="50" cy="50" r="35" fill={colors.accent} opacity="0.3" />

      {/* Attribute icon */}
      <text x="50" y="58" textAnchor="middle" fontSize="32" dominantBaseline="middle">
        {colors.icon}
      </text>

      {/* Name initial */}
      <text
        x="50"
        y="85"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="white"
        fontFamily="sans-serif"
      >
        {name.slice(0, 10)}
      </text>
    </svg>
  );
}
