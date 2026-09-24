import balanceConfig from '@/data/config/balance.json';

// ─── Types ────────────────────────────────────────────────────────────

export interface BattleResult {
  /** Whether the player won the brawl (3 Gate Cards) */
  playerWon: boolean;
  /** Number of opponent Bakugan defeated during the brawl */
  bakuganDefeated: number;
  /** Levels of each defeated Bakugan */
  defeatedBakuganLevels: number[];
  /** Whether the opponent never won a single Gate Card */
  opponentShutout: boolean;
  /** Whether this was a story mode battle */
  isStoryMode: boolean;
  /** Opponent's base level */
  opponentLevel: number;
  /** Number of power-ups collected during battle */
  powerUpsCollected: number;
  /** Whether player had Experience Boost active */
  hasExperienceBoost: boolean;
}

export interface MoneyReward {
  /** Total money earned */
  total: number;
  /** Base reward from brawl victory */
  baseReward: number;
  /** Per-Bakugan defeated bonus */
  bakuganBonus: number;
  /** Power-up bonus */
  powerUpBonus: number;
  /** Shutout multiplier applied */
  shutoutMultiplier: number;
}

// ─── Constants ────────────────────────────────────────────────────────

const BASE_REWARD_PER_LEVEL = 100;
const PER_BAKUGAN_DEFEATED_PER_LEVEL = 50;
const POWER_UP_BONUS = 25;
const SHUTOUT_MULTIPLIER = 2;

// ─── Functions ────────────────────────────────────────────────────────

/**
 * Calculate money rewards after a battle.
 *
 * Formula:
 *   Base reward: 100 × opponent_level
 *   Per Bakugan defeated: 50 × bakugan_level
 *   Power-up bonuses: collected during battle
 *   Double payout if opponent never won Gate Cards (shutout)
 */
export function calculateBrawlRewards(result: BattleResult): MoneyReward {
  if (!result.playerWon) {
    return { total: 0, baseReward: 0, bakuganBonus: 0, powerUpBonus: 0, shutoutMultiplier: 1 };
  }

  // Base reward
  const baseReward = BASE_REWARD_PER_LEVEL * result.opponentLevel;

  // Per-Bakugan defeated bonus
  const bakuganBonus = result.defeatedBakuganLevels.reduce(
    (sum, level) => sum + PER_BAKUGAN_DEFEATED_PER_LEVEL * level,
    0,
  );

  // Power-up bonus
  const powerUpBonus = result.powerUpsCollected * POWER_UP_BONUS;

  // Shutout multiplier
  const shutoutMultiplier = result.opponentShutout ? SHUTOUT_MULTIPLIER : 1;

  const subtotal = (baseReward + bakuganBonus + powerUpBonus) * shutoutMultiplier;

  // Story mode handicap: no extra money penalty in story, but reward is from the
  // reduced opponent — the story handicap only affects G-Power
  return {
    total: Math.floor(subtotal),
    baseReward: Math.floor(baseReward * shutoutMultiplier),
    bakuganBonus: Math.floor(bakuganBonus * shutoutMultiplier),
    powerUpBonus: Math.floor(powerUpBonus * shutoutMultiplier),
    shutoutMultiplier,
  };
}

/**
 * Get the story mode G-Power handicap from balance config.
 * In story mode, opponent Bakugan have their G-Power reduced by this amount.
 */
export function getStoryHandicap(): number {
  return balanceConfig.story.g_power_handicap;
}
