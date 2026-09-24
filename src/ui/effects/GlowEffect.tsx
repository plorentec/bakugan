"use client";

/**
 * GlowEffect.tsx — Animated glow overlay component.
 *
 * Renders a pulsing glow behind/around its children.
 * Used for Bakugan stand, ability plays, and special shots.
 */

import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface GlowEffectProps {
  /** Whether the glow is active */
  active?: boolean;
  /** Glow color */
  color?: string;
  /** Glow radius in px */
  radius?: number;
  /** Pulse speed in seconds */
  speed?: number;
  children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function GlowEffect({
  active = true,
  color = "#ffd700",
  radius = 20,
  speed = 1.2,
  children,
}: GlowEffectProps) {
  return (
    <div className="relative inline-block">
      {/* Glow layer */}
      {active && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: `0 0 ${radius}px ${radius / 2}px ${color}`,
          }}
          animate={{
            boxShadow: [
              `0 0 ${radius}px ${radius / 2}px ${color}`,
              `0 0 ${radius * 1.5}px ${radius}px ${color}`,
              `0 0 ${radius}px ${radius / 2}px ${color}`,
            ],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
