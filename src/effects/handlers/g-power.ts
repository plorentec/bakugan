/**
 * G-Power Effect Handlers — modify G-Power values during battle.
 *
 * Handlers: addGPower, removeGPower, swapGPower, doubleGPower
 */

import type { EffectContext, EffectResult } from '../types';

/* ------------------------------------------------------------------ */
/*  addGPower                                                          */
/* ------------------------------------------------------------------ */

/**
 * Adds a flat G-Power bonus to the target player.
 */
export function addGPower(context: EffectContext): EffectResult {
  const { target, effect } = context;
  const magnitude = effect.magnitude ?? 0;

  target.abilityBonus += magnitude;

  return {
    applied: true,
    description: `${target.name} gains +${magnitude} G-Power`,
  };
}

/* ------------------------------------------------------------------ */
/*  removeGPower                                                       */
/* ------------------------------------------------------------------ */

/**
 * Removes G-Power bonuses from the target player.
 * If magnitude is specified, removes that amount; otherwise removes all.
 */
export function removeGPower(context: EffectContext): EffectResult {
  const { target, effect } = context;
  const magnitude = effect.magnitude;

  if (magnitude !== undefined) {
    const removed = Math.min(target.abilityBonus, magnitude);
    target.abilityBonus -= removed;
    return {
      applied: true,
      description: `${target.name} loses ${removed} G-Power`,
    };
  }

  // Remove all boosts
  const totalRemoved = target.abilityBonus + target.gateBonus;
  target.abilityBonus = 0;
  target.gateBonus = 0;

  return {
    applied: true,
    description: `All G-Power boosts removed from ${target.name}`,
  };
}

/* ------------------------------------------------------------------ */
/*  swapGPower                                                         */
/* ------------------------------------------------------------------ */

/**
 * Swaps G-Power bonuses between the source and target players.
 */
export function swapGPower(context: EffectContext): EffectResult {
  const { source, target, battleState } = context;

  // Swap ability bonuses
  const tempAbility = source.abilityBonus;
  source.abilityBonus = target.abilityBonus;
  target.abilityBonus = tempAbility;

  // Swap gate bonuses
  const tempGate = source.gateBonus;
  source.gateBonus = target.gateBonus;
  target.gateBonus = tempGate;

  // Update the battle state's player array
  const p0 = battleState.players[0];
  const p1 = battleState.players[1];
  if (source.id === 0) {
    battleState.players = [source, target];
  } else {
    battleState.players = [target, source];
  }

  return {
    applied: true,
    description: `G-Power bonuses swapped between ${source.name} and ${target.name}`,
    modifiedPlayers: [battleState.players[0], battleState.players[1]],
  };
}

/* ------------------------------------------------------------------ */
/*  doubleGPower                                                       */
/* ------------------------------------------------------------------ */

/**
 * Doubles the target's G-Power ability bonus.
 */
export function doubleGPower(context: EffectContext): EffectResult {
  const { target } = context;

  target.abilityBonus *= 2;

  return {
    applied: true,
    description: `${target.name}'s G-Power bonus doubled to ${target.abilityBonus}`,
  };
}
