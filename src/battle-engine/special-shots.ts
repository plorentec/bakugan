/**
 * Special Shots — per-attribute special throw abilities.
 *
 * Only Bakugan level 3+ can use Special Shots. Requires full Special Meter.
 * Meter fills faster when losing. Activate by pressing Special button
 * when preparing to throw.
 *
 * Source: GameFAQs guide FAQ 81516, Section D "Special Shots"
 */

import type { Attribute } from '@/data/schemas';

/* ------------------------------------------------------------------ */
/*  Special Shot Definition                                             */
/* ------------------------------------------------------------------ */

export interface SpecialShot {
  /** Display name of the special shot */
  name: string;
  /** The attribute this shot belongs to */
  attribute: Attribute;
  /** Gameplay effect description */
  effect: string;
  /** Detailed behavior description from the guide */
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Special Shot Data                                                   */
/* ------------------------------------------------------------------ */

export const SPECIAL_SHOTS: Record<Attribute, SpecialShot> = {
  pyrus: {
    name: 'Pyrus Strike',
    attribute: 'pyrus',
    effect: 'CRITICAL_KO',
    description:
      'Cloaked in fiery aura, shoots like rocket. If hits opposing Bakugan while active → Critical KO, win Gate Card without fight.',
  },
  aquos: {
    name: 'Aquos Spiral',
    attribute: 'aquos',
    effect: 'INFINITE_STEERING',
    description:
      'Blue aura. Infinite Steering for this throw — can move around field as long as player wants before standing. AI farms power-ups with it.',
  },
  subterra: {
    name: 'Subterra Quake',
    attribute: 'subterra',
    effect: 'CRITICAL_KO_ADJACENT',
    description:
      'Brown aura with shockwave. Launches high, comes down with force. Lands on Gate Card with opposing Bakugan → Critical KO. Even without Bakugan, removes every other Bakugan from adjacent Gate Cards.',
  },
  ventus: {
    name: 'Ventus Storm',
    attribute: 'ventus',
    effect: 'REMOVE_AND_DEFEND',
    description:
      'Wind. Touches stood Bakugan → launched off and removed. When stands, gains greater defense (shield icon). Cannot be defeated with Critical KO.',
  },
  haos: {
    name: 'Haos Lightning',
    attribute: 'haos',
    effect: 'REMOVE_ALL_OPPONENTS',
    description:
      'Bright light. Touches stood Bakugan → that Bakugan AND every other opposing Bakugan on field launched away and removed.',
  },
  darkus: {
    name: 'Darkus Critical',
    attribute: 'darkus',
    effect: 'INTANGIBLE',
    description:
      'Dark aura. Completely intangible — moves through other Bakugan. Disables opponent influence on angle. When stands, remains intangible → immune to Critical KOs from Pyrus Strike. Still vulnerable to Subterra Quake.',
  },
};

/* ------------------------------------------------------------------ */
/*  Special Meter                                                       */
/* ------------------------------------------------------------------ */

/** Minimum Bakugan level required to use Special Shots */
export const SPECIAL_SHOT_MIN_LEVEL = 3;

/**
 * Special Meter configuration.
 * Fill rate is UNKNOWN from the guide — these values are our design.
 */
export const SPECIAL_METER_CONFIG = {
  /** Maximum meter value (100 = full) */
  max: 100,
  /** Base fill rate per battle tick (UNKNOWN — our design) */
  baseFillRate: 5,
  /** Multiplier when losing (meter fills faster when behind) */
  losingMultiplier: 2.0,
  /**
   * In 1v1, if up 2-0 in Gate Cards, opponent can use Special Shot
   * by third turn regardless of meter state.
   */
  comebackThreshold: 2,
  comebackTurn: 3,
} as const;

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Get the special shot for a given attribute.
 */
export function getSpecialShot(attribute: Attribute): SpecialShot {
  return SPECIAL_SHOTS[attribute];
}

/**
 * Check if a Bakugan can use its Special Shot.
 */
export function canUseSpecialShot(
  level: number,
  meterValue: number,
): boolean {
  return level >= SPECIAL_SHOT_MIN_LEVEL && meterValue >= SPECIAL_METER_CONFIG.max;
}

/**
 * Calculate Special Meter fill for a battle tick.
 * Fills faster when the player is losing.
 */
export function calculateMeterFill(
  currentMeter: number,
  isLosing: boolean,
  deltaMs: number,
): number {
  const rate = isLosing
    ? SPECIAL_METER_CONFIG.baseFillRate * SPECIAL_METER_CONFIG.losingMultiplier
    : SPECIAL_METER_CONFIG.baseFillRate;
  const tickRate = rate * (deltaMs / 1000);
  return Math.min(currentMeter + tickRate, SPECIAL_METER_CONFIG.max);
}
