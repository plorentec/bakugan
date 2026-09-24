/**
 * Scratch Battle — a drag-based minigame for Gold Gate Cards.
 *
 * Gameplay: An attribute symbol appears in a target area.
 * The player drags their mouse/finger over the symbol repeatedly
 * (scratching motion). Faster scratching = more G-Power.
 * Accuracy: staying on the symbol = higher score.
 *
 * Result: 0.0 (no scratches) to 1.0 (perfect fast scratching).
 * Duration: 10 seconds (configurable via MinigameConfig).
 *
 * This is a logic-only implementation. The React overlay renders
 * the canvas and forwards input events to this class.
 */

import { BaseMinigame } from './base-minigame';
import type { MinigameConfig } from './types';

/* ------------------------------------------------------------------ */
/*  Scratch Battle State                                                */
/* ------------------------------------------------------------------ */

export interface ScratchState {
  /** Current number of scratch strokes */
  strokeCount: number;
  /** Total distance scratched (pixels) */
  totalDistance: number;
  /** Distance scratched while cursor is over the target */
  onTargetDistance: number;
  /** Whether the cursor is currently over the target */
  isOnTarget: boolean;
  /** Time spent scratching (seconds) */
  scratchTime: number;
  /** Last cursor position */
  lastX: number;
  lastY: number;
  /** Whether the user is currently scratching (mouse/touch down + moving) */
  isScratching: boolean;
}

/* ------------------------------------------------------------------ */
/*  Scratch Battle                                                      */
/* ------------------------------------------------------------------ */

export class ScratchBattle extends BaseMinigame {
  private state: ScratchState;

  /** Target area (set externally by the overlay) */
  private targetX = 0;
  private targetY = 0;
  private targetRadius = 60;

  constructor(config: MinigameConfig) {
    super(config);
    this.state = this.createInitialState();
  }

  /* ================================================================== */
  /*  Lifecycle                                                           */
  /* ================================================================== */

  start(): void {
    super.start();
    this.state = this.createInitialState();
  }

  /**
   * Update the minigame state.
   * @param delta Time since last update in seconds
   */
  update(delta: number): void {
    if (this.isFinished || !this.isStarted) return;

    // Tick timer
    if (this.tickTimer(delta)) {
      this.calculateFinalScore();
      return;
    }
  }

  /* ================================================================== */
  /*  Input handling (called by overlay)                                  */
  /* ================================================================== */

  /**
   * Set the target area position.
   */
  setTarget(x: number, y: number, radius: number): void {
    this.targetX = x;
    this.targetY = y;
    this.targetRadius = radius;
  }

  /**
   * Notify that scratching has started (mouse/touch down).
   */
  onScratchStart(x: number, y: number): void {
    this.state.isScratching = true;
    this.state.lastX = x;
    this.state.lastY = y;
  }

  /**
   * Notify of cursor/finger movement while scratching.
   */
  onScratchMove(x: number, y: number): void {
    if (!this.state.isScratching || this.isFinished) return;

    const dx = x - this.state.lastX;
    const dy = y - this.state.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update total distance
    this.state.totalDistance += distance;

    // Check if cursor is over the target
    const distToTarget = Math.sqrt(
      (x - this.targetX) ** 2 + (y - this.targetY) ** 2,
    );
    this.state.isOnTarget = distToTarget <= this.targetRadius;

    if (this.state.isOnTarget) {
      this.state.onTargetDistance += distance;
      this.state.scratchTime += 0.016; // ~60fps
    }

    this.state.lastX = x;
    this.state.lastY = y;

    // Update live score
    this.updateLiveScore();
  }

  /**
   * Notify that scratching has stopped (mouse/touch up).
   */
  onScratchEnd(): void {
    if (this.state.isScratching) {
      this.state.strokeCount++;
    }
    this.state.isScratching = false;
    this.state.isOnTarget = false;
  }

  /* ================================================================== */
  /*  Scoring                                                             */
  /* ================================================================== */

  /**
   * Update the live score based on current scratch performance.
   */
  private updateLiveScore(): void {
    if (this.state.totalDistance < 10) {
      this.currentScore = 0;
      return;
    }

    // Accuracy: what fraction of scratching was on-target
    const accuracy = this.state.onTargetDistance / Math.max(this.state.totalDistance, 1);

    // Speed: scratches per second (more = better, capped)
    const scratchesPerSecond = this.state.strokeCount / Math.max(this.state.scratchTime, 0.1);
    const speedFactor = Math.min(1.0, scratchesPerSecond / 5); // 5 scratches/sec = max

    // Distance factor: more total distance = more effort
    const distanceFactor = Math.min(1.0, this.state.totalDistance / 500);

    // Combined score: weighted average
    // 40% accuracy + 30% speed + 30% distance
    this.currentScore = this.clampScore(
      accuracy * 0.4 + speedFactor * 0.3 + distanceFactor * 0.3,
    );
  }

  /**
   * Calculate the final score when time expires.
   */
  private calculateFinalScore(): void {
    this.updateLiveScore();
    this.isFinished = true;
  }

  /* ================================================================== */
  /*  Getters for overlay rendering                                       */
  /* ================================================================== */

  getState(): Readonly<ScratchState> {
    return this.state;
  }

  getTargetPosition(): { x: number; y: number; radius: number } {
    return {
      x: this.targetX,
      y: this.targetY,
      radius: this.targetRadius,
    };
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private createInitialState(): ScratchState {
    return {
      strokeCount: 0,
      totalDistance: 0,
      onTargetDistance: 0,
      isOnTarget: false,
      scratchTime: 0,
      lastX: 0,
      lastY: 0,
      isScratching: false,
    };
  }
}
