/**
 * Battle Control Effect Handlers — control battle flow.
 *
 * Handlers: restartBattle, skipBattle, disableOpponent
 */

import type { EffectContext, EffectResult } from '../types';

/* ------------------------------------------------------------------ */
/*  restartBattle                                                      */
/* ------------------------------------------------------------------ */

/**
 * Restarts the battle from the beginning.
 * Returns a special result that signals the engine to restart.
 */
export function restartBattle(_context: EffectContext): EffectResult {
  return {
    applied: true,
    description: 'Battle restarted!',
  };
}

/* ------------------------------------------------------------------ */
/*  skipBattle                                                         */
/* ------------------------------------------------------------------ */

/**
 * Skips the minigame and resolves battle immediately.
 * Highest G-Power wins.
 */
export function skipBattle(_context: EffectContext): EffectResult {
  return {
    applied: true,
    description: 'Battle skipped! Highest G-Power wins!',
  };
}

/* ------------------------------------------------------------------ */
/*  disableOpponent                                                    */
/* ------------------------------------------------------------------ */

/**
 * Prevents the opponent from playing ability cards.
 */
export function disableOpponent(context: EffectContext): EffectResult {
  const { target } = context;

  target.abilityCardDisabled = true;

  return {
    applied: true,
    description: `${target.name} can no longer play Ability Cards!`,
  };
}
