/**
 * G-Power Calculator — computes effective G-Power for each Bakugan.
 *
 * Formula: base + levelGrowth + gateBonus + abilityBonus + minigameBonus
 *
 * Special rules:
 * - Gold Gate Card: if depicted Bakugan matches, bonus applied twice (2x)
 * - Per-level increment from balance.json config
 */

import type { Bakugan, GateCard, AbilityCard, Attribute } from '@/data/schemas';
import type { GPowerBreakdown } from './types';
import balanceConfig from '@/data/config/balance.json';

/* ------------------------------------------------------------------ */
/*  Base G-Power                                                        */
/* ------------------------------------------------------------------ */

/**
 * Calculate base G-Power from Bakugan data.
 * In MVP, all Bakugan are level 1, so base = base_g_power.
 * With leveling: base + (level * per_level_increment)
 */
export function calculateBaseGPower(
  bakugan: Bakugan,
  level: number = 1,
): number {
  const increment = balanceConfig.g_power.per_level_increment;
  return bakugan.base_g_power + (level - 1) * increment;
}

/* ------------------------------------------------------------------ */
/*  Gate Card Bonus                                                     */
/* ------------------------------------------------------------------ */

/**
 * Calculate Gate Card bonus for a given attribute.
 * For Gold cards: if the depicted Bakugan matches, bonus is doubled.
 */
export function calculateGateBonus(
  gateCard: GateCard,
  attribute: Attribute,
  bakuganName: string,
): number {
  const baseBonus = gateCard.bonuses[attribute] ?? 0;

  // Gold card special: depicted Bakugan gets bonus applied twice
  if (
    gateCard.tier === 'gold' &&
    gateCard.depicted_bakugan &&
    gateCard.depicted_bakugan.toLowerCase() === bakuganName.toLowerCase()
  ) {
    return baseBonus * 2;
  }

  return baseBonus;
}

/* ------------------------------------------------------------------ */
/*  Ability Card Bonus                                                  */
/* ------------------------------------------------------------------ */

/**
 * Calculate total G-Power bonus from played ability cards.
 * Evaluates each effect on the card and sums applicable bonuses.
 */
export function calculateAbilityBonus(
  abilityCards: (AbilityCard | null)[],
  bakugan: Bakugan,
  _opponent: Bakugan,
): number {
  let totalBonus = 0;

  for (const card of abilityCards) {
    if (!card) continue;

    for (const effect of card.effects) {
      if (effect.type === 'ADD_G_POWER' && effect.magnitude) {
        // Check condition (attribute match)
        if (effect.condition) {
          const condValue = effect.condition.value;
          if (effect.condition.type === 'ATTRIBUTE_MATCH') {
            if (Array.isArray(condValue)) {
              if (condValue.includes(bakugan.attributes[0])) {
                totalBonus += effect.magnitude;
              }
            } else if (condValue === bakugan.attributes[0]) {
              totalBonus += effect.magnitude;
            }
          }
          // Other condition types — skip for now (handled by effects engine)
        } else {
          // No condition — always applies
          totalBonus += effect.magnitude;
        }
      }
    }
  }

  return totalBonus;
}

/* ------------------------------------------------------------------ */
/*  Minigame G-Power                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert minigame result (0.0–1.0) to G-Power bonus.
 * Uses g_power_per_result_point from balance.json.
 */
export function calculateMinigameGPower(result: number): number {
  const clamped = Math.max(
    balanceConfig.minigame.result_min,
    Math.min(balanceConfig.minigame.result_max, result),
  );
  return Math.round(clamped * balanceConfig.minigame.g_power_per_result_point);
}

/* ------------------------------------------------------------------ */
/*  Total G-Power                                                       */
/* ------------------------------------------------------------------ */

/**
 * Calculate total effective G-Power from all sources.
 */
export function calculateTotalGPower(breakdown: Omit<GPowerBreakdown, 'total'>): number {
  return (
    breakdown.base +
    breakdown.levelGrowth +
    breakdown.gateBonus +
    breakdown.abilityBonus +
    breakdown.minigameBonus
  );
}

/**
 * Full breakdown of G-Power calculation.
 */
export function getGPowerBreakdown(
  bakugan: Bakugan,
  gateCard: GateCard,
  abilityCards: (AbilityCard | null)[],
  opponentBakugan: Bakugan,
  minigameResult: number,
  level: number = 1,
): GPowerBreakdown {
  const base = calculateBaseGPower(bakugan, level);
  const levelGrowth = 0; // Already included in base for MVP
  const gateBonus = calculateGateBonus(gateCard, bakugan.attributes[0], bakugan.name);
  const abilityBonus = calculateAbilityBonus(abilityCards, bakugan, opponentBakugan);
  const minigameBonus = calculateMinigameGPower(minigameResult);

  return {
    base,
    levelGrowth,
    gateBonus,
    abilityBonus,
    minigameBonus,
    total: calculateTotalGPower({ base, levelGrowth, gateBonus, abilityBonus, minigameBonus }),
  };
}
