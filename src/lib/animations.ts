/**
 * animations.ts — Framer Motion variants and animation configs.
 *
 * Centralized animation definitions for all React UI transitions.
 * Phaser tweens handle in-game object animations separately.
 */

import type { Variants } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Screen transitions                                                 */
/* ------------------------------------------------------------------ */

/** Generic fade in/out */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Fade + slide up */
export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.2 } },
};

/** Fade + slide from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

/** Fade + slide from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: 40, transition: { duration: 0.2 } },
};

/** Zoom from center */
export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

/** Fade + scale (for story / achievement reveals) */
export const fadeScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.25 } },
};

/* ------------------------------------------------------------------ */
/*  Card animations                                                    */
/* ------------------------------------------------------------------ */

/** 3D card flip variants */
export const cardFlip: Variants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

/** Card glow pulse for selected state */
export const cardGlow: Variants = {
  idle: {
    boxShadow: "0 0 0px rgba(255,255,255,0)",
  },
  selected: {
    boxShadow: [
      "0 0 10px rgba(255,200,0,0.4)",
      "0 0 25px rgba(255,200,0,0.6)",
      "0 0 10px rgba(255,200,0,0.4)",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Stagger container (for lists / grids)                               */
/* ------------------------------------------------------------------ */

/** Stagger children entry */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Stagger children — item variant */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------ */
/*  Battle effects                                                     */
/* ------------------------------------------------------------------ */

/** Screen shake (apply via transform) */
export const shake: Variants = {
  idle: { x: 0, y: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    y: [0, 3, -3, 2, -2, 1, -1, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

/** Glow pulse */
export const glow: Variants = {
  idle: {
    filter: "brightness(1)",
  },
  glowing: {
    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/** Pulse (scale bounce) */
export const pulse: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

/** Explosion effect (scale up + fade out) */
export const explosion: Variants = {
  hidden: { scale: 0.3, opacity: 1 },
  visible: {
    scale: [0.3, 1.8],
    opacity: [1, 0],
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------ */
/*  Utility: page transition config (for AnimatePresence)              */
/* ------------------------------------------------------------------ */

export const PAGE_TRANSITION = {
  initial: "hidden",
  animate: "visible",
  exit: "exit",
} as const;
