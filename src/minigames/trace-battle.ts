/**
 * Trace Battle — a path-following minigame for Copper Gate Cards.
 *
 * Gameplay: An attribute icon traces an infinity symbol (∞) path.
 * The player must follow the path with mouse/finger.
 * Staying on path = accuracy, speed = bonus.
 *
 * Score: path_accuracy × speed × completion_bonus
 * Result: 0.0 (no tracing) to 1.0 (perfect trace at full speed).
 * Duration: 10 seconds (configurable via MinigameConfig).
 */

import { BaseMinigame } from './base-minigame';
import type { MinigameConfig } from './types';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

/** Width of the infinity symbol lobes */
const INFINITY_WIDTH = 90;
/** Height of the infinity symbol lobes */
const INFINITY_HEIGHT = 55;
/** Total path segments for resolution */
const PATH_SEGMENTS = 200;
/** Tolerance for being "on path" (pixels) */
const PATH_TOLERANCE = 25;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface TraceState {
  /** Current progress along the path (0.0 to 1.0) */
  pathProgress: number;
  /** Total path distance covered (pixels) */
  totalDistance: number;
  /** Distance covered while on-path */
  onPathDistance: number;
  /** Total distance from ideal path (for accuracy calc) */
  totalDeviation: number;
  /** Number of deviation samples */
  deviationSamples: number;
  /** Whether the player is currently tracing */
  isTracing: boolean;
  /** Last pointer position */
  lastX: number;
  lastY: number;
  /** Path target position (current ideal point) */
  targetX: number;
  targetY: number;
  /** Whether the path has been completed */
  pathCompleted: boolean;
}

/* ------------------------------------------------------------------ */
/*  Trace Battle                                                        */
/* ------------------------------------------------------------------ */

export class TraceBattle extends BaseMinigame {
  private state: TraceState;

  /** Center of the infinity path */
  private centerX = 0;
  private centerY = 0;
  /** Scale of the infinity symbol */
  private scaleX = INFINITY_WIDTH;
  private scaleY = INFINITY_HEIGHT;

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
    this.updatePathTarget();
  }

  update(delta: number): void {
    if (this.isFinished || !this.isStarted) return;

    if (this.tickTimer(delta)) {
      this.calculateFinalScore();
      return;
    }

    // Auto-advance path progress slightly if player isn't tracing
    // (keeps the path moving even during brief pauses)
    if (!this.state.isTracing && !this.state.pathCompleted) {
      this.state.pathProgress += delta * 0.15;
      if (this.state.pathProgress >= 1.0) {
        this.state.pathProgress = 1.0;
        this.state.pathCompleted = true;
      }
      this.updatePathTarget();
    }
  }

  /* ================================================================== */
  /*  Setup                                                               */
  /* ================================================================== */

  setCenter(x: number, y: number, scaleX: number, scaleY: number): void {
    this.centerX = x;
    this.centerY = y;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  /* ================================================================== */
  /*  Input handling (called by overlay)                                  */
  /* ================================================================== */

  /** Notify tracing start. */
  onTraceStart(x: number, y: number): void {
    this.state.isTracing = true;
    this.state.lastX = x;
    this.state.lastY = y;
  }

  /** Notify cursor movement while tracing. */
  onTraceMove(x: number, y: number): void {
    if (!this.state.isTracing || this.isFinished || this.state.pathCompleted) return;

    // Calculate distance moved
    const dx = x - this.state.lastX;
    const dy = y - this.state.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.state.totalDistance += distance;

    // Distance from ideal path point
    const devDx = x - this.state.targetX;
    const devDy = y - this.state.targetY;
    const deviation = Math.sqrt(devDx * devDx + devDy * devDy);
    this.state.totalDeviation += deviation;
    this.state.deviationSamples++;

    // If close enough to the path target, count as on-path
    if (deviation <= PATH_TOLERANCE) {
      this.state.onPathDistance += distance;

      // Advance path progress proportionally to on-path movement
      const progressAdvance = distance / (PATH_SEGMENTS * 0.5);
      this.state.pathProgress = Math.min(
        1.0,
        this.state.pathProgress + progressAdvance,
      );
    } else {
      // Off-path: still advance slowly so the player can catch up
      const progressAdvance = distance / (PATH_SEGMENTS * 2);
      this.state.pathProgress = Math.min(
        1.0,
        this.state.pathProgress + progressAdvance,
      );
    }

    this.updatePathTarget();

    if (this.state.pathProgress >= 1.0) {
      this.state.pathCompleted = true;
    }

    this.state.lastX = x;
    this.state.lastY = y;
    this.updateLiveScore();
  }

  /** Notify tracing end. */
  onTraceEnd(): void {
    this.state.isTracing = false;
  }

  /* ================================================================== */
  /*  Path calculation — infinity symbol parametric                       */
  /* ================================================================== */

  /**
   * Parametric infinity (lemniscate of Bernoulli):
   * x(t) = a * cos(t) / (1 + sin²(t))
   * y(t) = a * cos(t) * sin(t) / (1 + sin²(t))
   * t ∈ [0, 2π]
   */
  private updatePathTarget(): void {
    const t = this.state.pathProgress * 2 * Math.PI;
    const sinT = Math.sin(t);
    const cosT = Math.cos(t);
    const denom = 1 + sinT * sinT;

    this.state.targetX = this.centerX + (this.scaleX * cosT) / denom;
    this.state.targetY = this.centerY + (this.scaleY * cosT * sinT) / denom;
  }

  /* ================================================================== */
  /*  Scoring                                                             */
  /* ================================================================== */

  private updateLiveScore(): void {
    if (this.state.totalDistance < 5) {
      this.currentScore = 0;
      return;
    }

    // Path accuracy: fraction of distance covered while on-path
    const accuracy = this.state.onPathDistance / Math.max(this.state.totalDistance, 1);

    // Average deviation (lower = better)
    const avgDeviation =
      this.state.deviationSamples > 0
        ? this.state.totalDeviation / this.state.deviationSamples
        : PATH_TOLERANCE * 2;
    const deviationScore = Math.max(
      0,
      1 - avgDeviation / (PATH_TOLERANCE * 3),
    );

    // Completion: how far along the path the player got
    const completion = this.state.pathCompleted
      ? 1.0
      : this.state.pathProgress;

    // Speed: total distance / elapsed time (normalized)
    const elapsed = this.config.duration - this.timeRemaining;
    const speed = this.state.totalDistance / Math.max(elapsed, 0.1);
    const speedFactor = Math.min(1.0, speed / 300); // 300 px/s = max

    // Combined: 35% accuracy + 25% deviation + 25% completion + 15% speed
    this.currentScore = this.clampScore(
      accuracy * 0.35 +
        deviationScore * 0.25 +
        completion * 0.25 +
        speedFactor * 0.15,
    );
  }

  private calculateFinalScore(): void {
    this.updateLiveScore();
    this.isFinished = true;
  }

  /* ================================================================== */
  /*  Getters for overlay rendering                                       */
  /* ================================================================== */

  getState(): Readonly<TraceState> {
    return this.state;
  }

  getCenter(): { x: number; y: number; scaleX: number; scaleY: number } {
    return {
      x: this.centerX,
      y: this.centerY,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
    };
  }

  /** Get points along the infinity path for rendering the guide. */
  getPathPoints(count: number = 100): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= count; i++) {
      const t = (i / count) * 2 * Math.PI;
      const sinT = Math.sin(t);
      const cosT = Math.cos(t);
      const denom = 1 + sinT * sinT;
      points.push({
        x: this.centerX + (this.scaleX * cosT) / denom,
        y: this.centerY + (this.scaleY * cosT * sinT) / denom,
      });
    }
    return points;
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private createInitialState(): TraceState {
    return {
      pathProgress: 0,
      totalDistance: 0,
      onPathDistance: 0,
      totalDeviation: 0,
      deviationSamples: 0,
      isTracing: false,
      lastX: 0,
      lastY: 0,
      targetX: this.centerX + this.scaleX,
      targetY: this.centerY,
      pathCompleted: false,
    };
  }
}
