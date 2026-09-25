"use client";

/**
 * ParticleEffect.tsx — Reusable Framer Motion particle component.
 *
 * Generates simple animated particles for power-ups, abilities,
 * and special shot effects. No heavy particle system — just
 * lightweight CSS-animated elements.
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type ParticleType = "sparkles" | "glow" | "explosion" | "trail";

interface ParticleEffectProps {
  type: ParticleType;
  /** Center position (percentage or px) */
  x: number;
  y: number;
  /** Auto-remove after duration (ms) */
  duration?: number;
  /** Color override */
  color?: string;
  /** Number of particles */
  count?: number;
  /** Whether the effect is active */
  active?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Particle configs per type                                           */
/* ------------------------------------------------------------------ */

interface ParticleConfig {
  spread: number;
  sizeRange: [number, number];
  durationRange: [number, number];
  opacity: number;
  gravity?: number;
}

const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  sparkles: {
    spread: 60,
    sizeRange: [3, 8],
    durationRange: [0.4, 0.8],
    opacity: 0.9,
  },
  glow: {
    spread: 30,
    sizeRange: [12, 24],
    durationRange: [0.6, 1.2],
    opacity: 0.5,
  },
  explosion: {
    spread: 120,
    sizeRange: [4, 12],
    durationRange: [0.3, 0.7],
    opacity: 0.8,
    gravity: 200,
  },
  trail: {
    spread: 15,
    sizeRange: [2, 5],
    durationRange: [0.3, 0.5],
    opacity: 0.6,
  },
};

/* ------------------------------------------------------------------ */
/*  Seeded random (deterministic per mount, avoids hydration mismatch) */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function ParticleEffect({
  type,
  x,
  y,
  duration = 1000,
  color = "#ffd700",
  count = 8,
  active = true,
}: ParticleEffectProps) {
  const config = PARTICLE_CONFIGS[type];
  const [particles, setParticles] = useState<
    { id: number; targetX: number; targetY: number; size: number; dur: number; delay: number }[]
  >([]);

  useEffect(() => {
    const rng = seededRandom(Date.now() + count);
    const newParticles = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (rng() - 0.5) * 0.5;
      const dist = config.spread * (0.5 + rng() * 0.5);
      const size =
        config.sizeRange[0] +
        rng() * (config.sizeRange[1] - config.sizeRange[0]);
      const dur =
        config.durationRange[0] +
        rng() * (config.durationRange[1] - config.durationRange[0]);

      return {
        id: i,
        targetX: Math.cos(angle) * dist,
        targetY: Math.sin(angle) * dist + (config.gravity ?? 0) * dur * 0.3,
        size,
        dur,
        delay: rng() * 0.1,
      };
    });
    setParticles(newParticles);
  }, [count, type, config]);

  if (!active || particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: x, top: y, zIndex: 60 }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: config.opacity,
            x: 0,
            y: 0,
            scale: 1,
          }}
          animate={{
            opacity: 0,
            x: p.targetX,
            y: p.targetY,
            scale: 0.3,
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 ${p.size}px ${color}`,
          }}
        />
      ))}
    </div>
  );
}
