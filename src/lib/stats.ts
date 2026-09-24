import balanceConfig from '@/data/config/balance.json';

// ─── Types ────────────────────────────────────────────────────────────

export type StatName = 'speed' | 'defense' | 'control' | 'steering' | 'magnet';

export interface PlayerStats {
  speed: number;
  defense: number;
  control: number;
  steering: number;
  magnet: number;
}

export interface StatAllocationResult {
  success: boolean;
  stats: PlayerStats;
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────

export const STAT_MAX = balanceConfig.g_power.stat_max;
export const STAT_NAMES: StatName[] = ['speed', 'defense', 'control', 'steering', 'magnet'];

// ─── Functions ────────────────────────────────────────────────────────

/**
 * Get initial stats (all zeros).
 */
export function createEmptyStats(): PlayerStats {
  return { speed: 0, defense: 0, control: 0, steering: 0, magnet: 0 };
}

/**
 * Allocate a stat point to a specific stat.
 * Returns success/failure and the updated stats.
 */
export function allocateStat(
  currentStats: PlayerStats,
  statChoice: StatName,
): StatAllocationResult {
  const currentValue = currentStats[statChoice];

  if (currentValue >= STAT_MAX) {
    return {
      success: false,
      stats: { ...currentStats },
      message: `${statChoice} is already at maximum (${STAT_MAX})`,
    };
  }

  return {
    success: true,
    stats: {
      ...currentStats,
      [statChoice]: currentValue + 1,
    },
    message: `${statChoice} increased to ${currentValue + 1}`,
  };
}

/**
 * Get the current value of a specific stat.
 */
export function getStatValue(stats: PlayerStats, stat: StatName): number {
  return stats[stat];
}

/**
 * Calculate effective G-Power from base, level, and stats.
 *
 * Formula:
 *   effective_g_power = base_g_power + (level × per_level_increment) + stat_bonuses
 *
 * G-Power growth: 250 total from L1→MAX (25 per level for 10 levels)
 *
 * Stat bonuses are additive based on allocated stat points.
 * Each stat point provides a small G-Power bonus proportional to the stat value.
 */
export function recalculateGPower(
  baseGPower: number,
  level: number,
  stats: PlayerStats,
): number {
  const perLevelIncrement = balanceConfig.g_power.per_level_increment;
  const levelBonus = (level - 1) * perLevelIncrement;

  // Each stat point contributes to G-Power
  // Total potential from stats: sum of all stat values × 5 G-Power each
  const statBonus =
    stats.speed * 5 +
    stats.defense * 5 +
    stats.control * 5 +
    stats.steering * 5 +
    stats.magnet * 5;

  return baseGPower + levelBonus + statBonus;
}

/**
 * Get total stat points spent (total allocated stat points).
 */
export function getTotalStatPoints(stats: PlayerStats): number {
  return stats.speed + stats.defense + stats.control + stats.steering + stats.magnet;
}

/**
 * Get remaining stat points (total earned from levels minus allocated).
 */
export function getRemainingStatPoints(level: number, stats: PlayerStats): number {
  const totalEarned = (level - 1) * balanceConfig.g_power.stat_points_per_level;
  const totalSpent = getTotalStatPoints(stats);
  return Math.max(0, totalEarned - totalSpent);
}
