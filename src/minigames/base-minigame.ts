/**
 * Base Minigame — abstract class for all minigame implementations.
 *
 * Provides timer-based completion and common state management.
 * Subclasses implement start(), update(), and getCurrentScore().
 */

import type { IMinigame, MinigameResult, MinigameConfig } from './types';
import balanceConfig from '@/data/config/balance.json';

/* ------------------------------------------------------------------ */
/*  Abstract Base Minigame                                              */
/* ------------------------------------------------------------------ */

export abstract class BaseMinigame implements IMinigame {
  protected config: MinigameConfig;
  protected timeRemaining: number;
  protected isStarted = false;
  protected isFinished = false;
  protected currentScore = 0;

  constructor(config: MinigameConfig) {
    this.config = config;
    this.timeRemaining = config.duration;
  }

  /** Start the minigame (reset timer, etc.) */
  start(): void {
    this.isStarted = true;
    this.isFinished = false;
    this.timeRemaining = this.config.duration;
    this.currentScore = 0;
  }

  /**
   * Update the minigame state.
   * @param delta Time since last update in seconds
   */
  abstract update(delta: number): void;

  /**
   * Get the current result.
   * Score is clamped to [0, 1] and mapped to G-Power.
   */
  getResult(): MinigameResult {
    const score = Math.max(
      balanceConfig.minigame.result_min,
      Math.min(balanceConfig.minigame.result_max, this.currentScore),
    );
    const gPowerEarned = Math.round(
      score * balanceConfig.minigame.g_power_per_result_point,
    );
    return { score, gPowerEarned };
  }

  /** Check if the minigame is complete */
  isComplete(): boolean {
    return this.isFinished;
  }

  /** Get current score (0.0–1.0) */
  getCurrentScore(): number {
    return this.currentScore;
  }

  /** Get remaining time in seconds */
  getRemainingTime(): number {
    return this.timeRemaining;
  }

  /** Clean up resources */
  destroy(): void {
    this.isFinished = true;
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Tick the timer. Call from update().
   * Returns true if time has expired.
   */
  protected tickTimer(delta: number): boolean {
    if (this.isFinished) return true;

    this.timeRemaining = Math.max(0, this.timeRemaining - delta);
    if (this.timeRemaining <= 0) {
      this.isFinished = true;
      return true;
    }
    return false;
  }

  /**
   * Clamp score to valid range.
   */
  protected clampScore(score: number): number {
    return Math.max(
      balanceConfig.minigame.result_min,
      Math.min(balanceConfig.minigame.result_max, score),
    );
  }
}
