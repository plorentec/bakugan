"use client";

/**
 * ScreenShake.tsx — Screen shake wrapper component.
 *
 * Wraps children and applies a shake animation when triggered.
 * Used for Critical KO, heavy hits, and dramatic moments.
 */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ScreenShakeProps {
  /** Trigger a shake by changing this value */
  trigger: number;
  /** Shake intensity (px displacement, default 6) */
  intensity?: number;
  /** Shake duration (ms, default 500) */
  duration?: number;
  children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function ScreenShake({
  trigger,
  intensity = 6,
  duration = 500,
  children,
}: ScreenShakeProps) {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setShaking(true);
    const timer = setTimeout(() => setShaking(false), duration);
    return () => clearTimeout(timer);
  }, [trigger, duration]);

  return (
    <motion.div
      animate={
        shaking
          ? {
              x: [0, -intensity, intensity, -intensity * 0.6, intensity * 0.6, -intensity * 0.3, intensity * 0.3, 0],
              y: [0, intensity * 0.5, -intensity * 0.5, intensity * 0.3, -intensity * 0.3, intensity * 0.1, -intensity * 0.1, 0],
            }
          : { x: 0, y: 0 }
      }
      transition={{ duration: duration / 1000, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
