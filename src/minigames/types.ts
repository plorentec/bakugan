/**
 * Minigame Types — defines interfaces for the minigame system.
 *
 * All minigames produce a normalized result in range 0.0–1.0,
 * which maps to G-Power via balance.json config.
 */

/* ------------------------------------------------------------------ */
/*  Minigame Result                                                     */
/* ------------------------------------------------------------------ */

export interface MinigameResult {
  /** Normalized score (0.0 = failure, 1.0 = perfect) */
  score: number;
  /** G-Power earned from this result */
  gPowerEarned: number;
}

/* ------------------------------------------------------------------ */
/*  Minigame Config                                                     */
/* ------------------------------------------------------------------ */

export interface MinigameConfig {
  /** Type of minigame */
  type: MinigameType;
  /** Duration in seconds */
  duration: number;
  /** Difficulty multiplier (0.5 = easy, 1.0 = normal, 1.5 = hard) */
  difficulty: number;
}

export type MinigameType = 'scratch' | 'spin' | 'timing' | 'pop' | 'trace' | 'bound';

/* ------------------------------------------------------------------ */
/*  Minigame Interface                                                  */
/* ------------------------------------------------------------------ */

/**
 * Interface that all minigames must implement.
 */
export interface IMinigame {
  /** Start the minigame */
  start(): void;

  /**
   * Update the minigame state.
   * @param delta Time since last update in seconds
   */
  update(delta: number): void;

  /** Get the current result (may be incomplete) */
  getResult(): MinigameResult;

  /** Check if the minigame is complete */
  isComplete(): boolean;

  /** Get current score (0.0–1.0) */
  getCurrentScore(): number;

  /** Get remaining time in seconds */
  getRemainingTime(): number;

  /** Clean up resources */
  destroy(): void;
}
