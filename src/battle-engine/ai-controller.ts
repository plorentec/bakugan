/**
 * AI Controller — makes decisions for the opponent during battle.
 *
 * Easy difficulty: random gate card placement, random ability card play,
 * basic minigame performance (0.3–0.5 range).
 */

import type { AbilityCard } from '@/data/schemas';
import type { BattlePlayerState } from './types';
import balanceConfig from '@/data/config/balance.json';

/* ------------------------------------------------------------------ */
/*  AI Difficulty Config                                                */
/* ------------------------------------------------------------------ */

type AIDifficulty = 'easy' | 'normal' | 'hard';

interface AIConfig {
  minigameAccuracyMin: number;
  minigameAccuracyMax: number;
  gPowerHandicap: number;
  useSpecialShots: boolean;
}

function getAIConfig(difficulty: AIDifficulty): AIConfig {
  const raw = balanceConfig.ai[difficulty];
  return {
    minigameAccuracyMin: raw.minigame_accuracy_min,
    minigameAccuracyMax: raw.minigame_accuracy_max,
    gPowerHandicap: raw.g_power_handicap,
    useSpecialShots: raw.use_special_shots === true,
  };
}

/* ------------------------------------------------------------------ */
/*  AI Controller Class                                                 */
/* ------------------------------------------------------------------ */

export class AIController {
  private config: AIConfig;

  constructor(private difficulty: AIDifficulty = 'easy') {
    this.config = getAIConfig(difficulty);
  }

  /**
   * AI decides whether to play an ability card.
   * Easy: 50% chance to play if any cards available.
   * Returns the card to play, or null if passing.
   */
  selectAbilityCard(availableCards: AbilityCard[]): AbilityCard | null {
    if (availableCards.length === 0) return null;

    // Easy AI: 50% chance to play a random card
    if (this.difficulty === 'easy') {
      return Math.random() < 0.5 ? this.randomPick(availableCards) : null;
    }

    // Normal/Hard: always play if available
    return this.randomPick(availableCards);
  }

  /**
   * AI "plays" the minigame and returns a result.
   * The result is a random value within the difficulty's accuracy range.
   */
  playMinigame(): number {
    const { minigameAccuracyMin, minigameAccuracyMax } = this.config;
    return minigameAccuracyMin + Math.random() * (minigameAccuracyMax - minigameAccuracyMin);
  }

  /**
   * Get the G-Power handicap for this difficulty.
   */
  getGPowerHandicap(): number {
    return this.config.gPowerHandicap;
  }

  /**
   * Check if AI should use Special Shots.
   */
  canUseSpecialShots(): boolean {
    return this.config.useSpecialShots;
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                             */
  /* ------------------------------------------------------------------ */

  private randomPick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}
