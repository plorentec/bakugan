import experienceConfig from '@/data/config/experience.json';
import balanceConfig from '@/data/config/balance.json';

// ─── Types ────────────────────────────────────────────────────────────

export interface XpReward {
  /** Total XP earned */
  total: number;
  /** Base XP from brawl */
  baseXp: number;
  /** Per-Bakugan defeated XP */
  bakuganXp: number;
  /** Difficulty multiplier applied */
  difficultyMultiplier: number;
  /** Experience boost multiplier (1.0 if none) */
  boostMultiplier: number;
}

export type Difficulty = 'easy' | 'normal' | 'hard';

// ─── Constants ────────────────────────────────────────────────────────

const XP_PER_OPPONENT_LEVEL = 50;
const XP_PER_BAKUGAN_DEFEATED_LEVEL = 25;
const EXPERIENCE_BOOST_MULTIPLIER = 1.5;

// ─── Functions ────────────────────────────────────────────────────────

/**
 * Get the XP threshold for a given level.
 * Level 1 = 0 XP (start), level 2 = 100 XP, etc.
 */
export function getXpForLevel(level: number): number {
  const curve = experienceConfig.xp_per_level;
  if (level < 0 || level >= curve.length) return Infinity;
  return curve[level];
}

/**
 * Get total XP required to reach a specific level from level 1.
 */
export function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

/**
 * Calculate XP reward from a battle.
 *
 * Formula:
 *   Base XP: 50 × opponent_level
 *   Per Bakugan defeated: 25 × bakugan_level
 *   Difficulty multiplier: easy 0.5, normal 1.0, hard 1.5
 *   Experience Boost: 1.5× multiplier
 */
export function calculateXpReward(result: {
  opponentLevel: number;
  bakuganDefeatedLevels: number[];
  difficulty: Difficulty;
  hasExperienceBoost: boolean;
  playerWon: boolean;
}): XpReward {
  if (!result.playerWon) {
    // Winner gets full XP, loser gets partial (50%)
    const baseXp = XP_PER_OPPONENT_LEVEL * result.opponentLevel;
    const bakuganXp = result.bakuganDefeatedLevels.reduce(
      (sum, level) => sum + XP_PER_BAKUGAN_DEFEATED_LEVEL * level,
      0,
    );
    const diffMult = experienceConfig.xp_multipliers[result.difficulty];
    const boostMult = result.hasExperienceBoost ? EXPERIENCE_BOOST_MULTIPLIER : 1.0;
    const total = Math.floor((baseXp + bakuganXp) * diffMult * boostMult * 0.5);
    return { total, baseXp: Math.floor(baseXp * 0.5), bakuganXp: Math.floor(bakuganXp * 0.5), difficultyMultiplier: diffMult, boostMultiplier: boostMult };
  }

  const baseXp = XP_PER_OPPONENT_LEVEL * result.opponentLevel;
  const bakuganXp = result.bakuganDefeatedLevels.reduce(
    (sum, level) => sum + XP_PER_BAKUGAN_DEFEATED_LEVEL * level,
    0,
  );

  const diffMult = experienceConfig.xp_multipliers[result.difficulty];
  const boostMult = result.hasExperienceBoost ? EXPERIENCE_BOOST_MULTIPLIER : 1.0;

  const total = Math.floor((baseXp + bakuganXp) * diffMult * boostMult);

  return {
    total,
    baseXp: Math.floor(baseXp * diffMult * boostMult),
    bakuganXp: Math.floor(bakuganXp * diffMult * boostMult),
    difficultyMultiplier: diffMult,
    boostMultiplier: boostMult,
  };
}

/**
 * Check if the player should level up based on accumulated XP.
 * Returns the new level if level-up occurred, otherwise returns the current level.
 */
export function checkLevelUp(currentXp: number, currentLevel: number): number {
  const maxLevel = balanceConfig.g_power.max_level;
  if (currentLevel >= maxLevel) return currentLevel;

  const xpNeeded = getXpForLevel(currentLevel + 1);
  if (currentXp >= xpNeeded) {
    return currentLevel + 1;
  }
  return currentLevel;
}

/**
 * Get stat points earned per level.
 */
export function getStatPointsPerLevel(): number {
  return balanceConfig.g_power.stat_points_per_level;
}

/**
 * Get the max level.
 */
export function getMaxLevel(): number {
  return balanceConfig.g_power.max_level;
}
