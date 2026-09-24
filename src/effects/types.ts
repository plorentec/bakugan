/**
 * Effects Engine Types — defines the interface for effect handlers.
 *
 * Effect handlers are pure functions that take an effect context and
 * return a modified battle state. The registry pattern makes the system
 * extensible without modifying core code.
 */

import type { EffectDefinition } from '@/data/schemas';
import type { BattleState, BattlePlayerState } from '@/battle-engine/types';

/* ------------------------------------------------------------------ */
/*  Effect Context                                                      */
/* ------------------------------------------------------------------ */

export interface EffectContext {
  /** The player who played the ability card */
  source: BattlePlayerState;
  /** The target player (may be same as source for self-targeting) */
  target: BattlePlayerState;
  /** The full battle state (for reading/writing) */
  battleState: BattleState;
  /** The effect definition being applied */
  effect: EffectDefinition;
}

/* ------------------------------------------------------------------ */
/*  Effect Handler                                                      */
/* ------------------------------------------------------------------ */

/**
 * An effect handler is a function that processes a single effect.
 * It receives the context and returns a description of what changed.
 * The registry applies the change to the battle state.
 */
export type EffectHandler = (context: EffectContext) => EffectResult;

export interface EffectResult {
  /** Whether the effect was applied successfully */
  applied: boolean;
  /** Description of what happened (for battle log) */
  description: string;
  /** Modified players (if the effect changed player state) */
  modifiedPlayers?: [BattlePlayerState, BattlePlayerState];
}
