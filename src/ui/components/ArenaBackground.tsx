"use client";

/**
 * ArenaBackground.tsx — Animated arena background with Bakugan theme.
 */

import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface ArenaBackgroundProps {
  attribute?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Attribute gradients                                                  */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_GRADIENTS: Record<string, string[]> = {
  pyrus: ["#1a0a0a", "#3d1111", "#5c1a1a"],
  aquos: ["#0a0a1a", "#11113d", "#1a1a5c"],
  subterra: ["#1a150a", "#3d2e11", "#5c451a"],
  haos: ["#1a1a0a", "#3d3d11", "#5c5c1a"],
  darkus: ["#0f0a1a", "#22113d", "#351a5c"],
  ventus: ["#0a1a0f", "#113d22", "#1a5c35"],
  standard: ["#0a0a0a", "#1a1a1a", "#2a2a2a"],
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function ArenaBackground({
  attribute = "standard",
  className = "",
}: ArenaBackgroundProps) {
  const colors = ATTRIBUTE_GRADIENTS[attribute] || ATTRIBUTE_GRADIENTS.standard;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${colors[2]} 0%, ${colors[1]} 40%, ${colors[0]} 100%)`,
        }}
      />

      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + i * 2,
            height: 4 + i * 2,
            background: `rgba(255, 255, 255, ${0.1 + i * 0.05})`,
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
