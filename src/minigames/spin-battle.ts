/**
 * Spin Battle — a rotation-based minigame for Gold Gate Cards.
 *
 * Gameplay: An attribute symbol sits inside a circle at center.
 * The player drags in a circular motion around the symbol.
 * Faster rotation = more G-Power. Staying near the orbit path = accuracy.
 *
 * Score: rotation_speed × accuracy × time_bonus
 * Result: 0.0 (no rotation) to 1.0 (fast, accurate spinning).
 * Duration: 10 seconds (configurable via MinigameConfig).
 */

import { BaseMinigame } from './base-minigame';
import type { MinigameConfig } from './types';

/* ------------------------------------------------------------------ */
/*  Spin Battle State                                                   */
/* ------------------------------------------------------------------ */

export interface SpinState {
  /** Current angle of the cursor relative to center (radians) */
  currentAngle: number;
  /** Previous angle for computing delta */
  prevAngle: number;
  /** Accumulated total rotation (radians, can exceed 2π) */
  totalRotation: number;
  /** Instantaneous angular velocity (radians/sec) */
  angularVelocity: number;
  /** Smoothed angular velocity for scoring */
  smoothedVelocity: number;
  /** Sum of distances from the ideal orbit ring */
  orbitDeviation: number;
  /** Total samples taken while dragging */
  orbitSamples: number;
  /** Whether the player is currently dragging */
  isDragging: boolean;
  /** Last pointer position */
  lastX: number;
  lastY: number;
  /** Number of complete revolutions */
  revolutionCount: number;
}

/* ------------------------------------------------------------------ */
/*  Spin Battle                                                         */
/* ------------------------------------------------------------------ */

export class SpinBattle extends BaseMinigame {
  private state: SpinState;

  /** Center of the spin area (set by overlay) */
  private centerX = 0;
  private centerY = 0;
  /** Ideal orbit radius (pixels) */
  private orbitRadius = 80;
  /** Symbol display radius */
  private symbolRadius = 30;

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

  update(delta: number): void {
    if (this.isFinished || !this.isStarted) return;

    // Decay smoothed velocity toward current value
    this.state.smoothedVelocity =
      this.state.smoothedVelocity * 0.9 + this.state.angularVelocity * 0.1;

    if (this.tickTimer(delta)) {
      this.calculateFinalScore();
      return;
    }
  }

  /* ================================================================== */
  /*  Input handling (called by overlay)                                  */
  /* ================================================================== */

  /** Set the center and orbit radius for the spin area. */
  setCenter(x: number, y: number, orbitRadius: number): void {
    this.centerX = x;
    this.centerY = y;
    this.orbitRadius = orbitRadius;
  }

  /** Notify drag start. */
  onSpinStart(x: number, y: number): void {
    this.state.isDragging = true;
    this.state.lastX = x;
    this.state.lastY = y;
    this.state.currentAngle = Math.atan2(y - this.centerY, x - this.centerX);
    this.state.prevAngle = this.state.currentAngle;
  }

  /** Notify cursor movement while dragging. */
  onSpinMove(x: number, y: number, deltaSeconds: number): void {
    if (!this.state.isDragging || this.isFinished) return;

    const dx = x - this.centerX;
    const dy = y - this.centerY;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    const angle = Math.atan2(dy, dx);
    let angleDelta = angle - this.state.prevAngle;

    // Normalize to [-π, π] to handle wrap-around
    if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
    if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

    // Only count meaningful angular changes
    if (Math.abs(angleDelta) > 0.001 && deltaSeconds > 0) {
      this.state.totalRotation += Math.abs(angleDelta);
      this.state.angularVelocity = Math.abs(angleDelta) / Math.max(deltaSeconds, 0.016);

      // Track revolutions
      this.state.revolutionCount = Math.floor(
        this.state.totalRotation / (2 * Math.PI),
      );

      // Orbit accuracy: how close is the cursor to the ideal orbit ring
      const deviation = Math.abs(distFromCenter - this.orbitRadius) / this.orbitRadius;
      this.state.orbitDeviation += deviation;
      this.state.orbitSamples++;
    }

    this.state.prevAngle = angle;
    this.state.currentAngle = angle;
    this.state.lastX = x;
    this.state.lastY = y;

    this.updateLiveScore();
  }

  /** Notify drag end. */
  onSpinEnd(): void {
    this.state.isDragging = false;
    this.state.angularVelocity = 0;
  }

  /* ================================================================== */
  /*  Scoring                                                             */
  /* ================================================================== */

  private updateLiveScore(): void {
    if (this.state.totalRotation < 0.1) {
      this.currentScore = 0;
      return;
    }

    // Speed: radians per second → normalized (2π rad/s = 1 full rev/s = good)
    const speedFactor = Math.min(
      1.0,
      this.state.smoothedVelocity / (2 * Math.PI),
    );

    // Accuracy: average deviation from orbit ring (0 = perfect, 1 = way off)
    const avgDeviation =
      this.state.orbitSamples > 0
        ? this.state.orbitDeviation / this.state.orbitSamples
        : 1;
    const accuracy = Math.max(0, 1 - avgDeviation);

    // Revolution bonus: more full circles = more effort
    const revolutionFactor = Math.min(1.0, this.state.revolutionCount / 5);

    // Time bonus: reward for sustained spinning
    const elapsed = this.config.duration - this.timeRemaining;
    const timeBonus = Math.min(1.0, elapsed / 3); // 3 seconds of spinning = max time bonus

    // Combined: 35% speed + 30% accuracy + 20% revolutions + 15% time
    this.currentScore = this.clampScore(
      speedFactor * 0.35 +
        accuracy * 0.3 +
        revolutionFactor * 0.2 +
        timeBonus * 0.15,
    );
  }

  private calculateFinalScore(): void {
    this.updateLiveScore();
    this.isFinished = true;
  }

  /* ================================================================== */
  /*  Getters for overlay rendering                                       */
  /* ================================================================== */

  getState(): Readonly<SpinState> {
    return this.state;
  }

  getCenter(): { x: number; y: number; orbitRadius: number } {
    return {
      x: this.centerX,
      y: this.centerY,
      orbitRadius: this.orbitRadius,
    };
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private createInitialState(): SpinState {
    return {
      currentAngle: 0,
      prevAngle: 0,
      totalRotation: 0,
      angularVelocity: 0,
      smoothedVelocity: 0,
      orbitDeviation: 0,
      orbitSamples: 0,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      revolutionCount: 0,
    };
  }
}
