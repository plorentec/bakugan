"use client";

/**
 * ArenaBackground.tsx — Animated arena background with Bakugan theme.
 * Creates a battle arena feel with grid, particles, and attribute coloring.
 */

import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface ArenaBackgroundProps {
  attribute?: string;
  className?: string;
  intensity?: number;
}

/* ------------------------------------------------------------------ */
/*  Attribute gradients                                                  */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_GRADIENTS: Record<string, { start: string; mid: string; end: string; accent: string }> = {
  pyrus: { start: "#1a0505", mid: "#3d0f0f", end: "#5c1818", accent: "#ef4444" },
  aquos: { start: "#050a1a", mid: "#0f1f3d", end: "#182f5c", accent: "#3b82f6" },
  subterra: { start: "#1a1205", mid: "#3d2a0f", end: "#5c4218", accent: "#f59e0b" },
  haos: { start: "#1a1a05", mid: "#3d3d0f", end: "#5c5c18", accent: "#eab308" },
  darkus: { start: "#0a051a", mid: "#1a0f3d", end: "#2a185c", accent: "#8b5cf6" },
  ventus: { start: "#051a0a", mid: "#0f3d1a", end: "#185c2a", accent: "#22c55e" },
  standard: { start: "#0a0a0a", mid: "#1a1a1a", end: "#2a2a2a", accent: "#6b7280" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function ArenaBackground({
  attribute = "standard",
  className = "",
  intensity = 1,
}: ArenaBackgroundProps) {
  const colors = ATTRIBUTE_GRADIENTS[attribute] || ATTRIBUTE_GRADIENTS.standard;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, ${colors.accent}15 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, ${colors.accent}10 0%, transparent 50%),
            radial-gradient(ellipse at center, ${colors.end} 0%, ${colors.mid} 40%, ${colors.start} 100%)
          `,
        }}
      />

      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="arena-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke={colors.accent} strokeWidth="0.3" opacity="0.5" />
          </pattern>
          <pattern id="arena-dots" width="25" height="25" patternUnits="userSpaceOnUse">
            <circle cx="12.5" cy="12.5" r="1" fill={colors.accent} opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arena-grid)" />
        <rect width="100%" height="100%" fill="url(#arena-dots)" />
      </svg>

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            background: `radial-gradient(circle, ${colors.accent}80, ${colors.accent}00)`,
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 17) % 70}%`,
            boxShadow: `0 0 ${6 + i}px ${colors.accent}40`,
          }}
          animate={{
            y: [-15, 15, -15],
            x: [-5, 5, -5],
            opacity: [0.3 * intensity, 0.7 * intensity, 0.3 * intensity],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Central glow */}
      <motion.div
        className="absolute"
        style={{
          width: "60%",
          height: "60%",
          left: "20%",
          top: "20%",
          background: `radial-gradient(circle, ${colors.accent}08 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.5 * intensity, 0.8 * intensity, 0.5 * intensity],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Scanlines effect */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />
    </div>
  );
}
