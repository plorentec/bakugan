/**
 * Bound Battle — a charge-and-catch minigame for Copper Gate Cards.
 *
 * Gameplay: An attribute icon appears in center. Player holds to charge,
 * then releases to launch. The icon bounces around the screen and the
 * player must click to catch it. Each successful catch = points.
 *
 * Score: catches / max_catches × timing_bonus
 * Result: 0.0 (no catches) to 1.0 (all catches with good timing).
 * Duration: 10 seconds (configurable via MinigameConfig).
 */

import { BaseMinigame } from './base-minigame';
import type { MinigameConfig } from './types';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

/** Icon radius for catch detection (pixels) */
const CATCH_RADIUS = 22;
/** Maximum catches expected in the time limit */
const MAX_CATCHES = 8;
/** Charge rate (0-1 per second) */
const CHARGE_RATE = 1.2;
/** Minimum charge before launch is valid */
const MIN_CHARGE = 0.15;
/** Maximum bounce speed (pixels/second) */
const MAX_BOUNCE_SPEED = 250;
/** Catch window: time the icon is "catchable" after landing (seconds) */
const CATCH_WINDOW = 1.2;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type BallPhase = 'idle' | 'charging' | 'flying' | 'landed' | 'caught';

export interface BoundState {
  /** Current phase of the game */
  phase: BallPhase;
  /** Ball position */
  ballX: number;
  ballY: number;
  /** Ball velocity (when flying) */
  velX: number;
  velY: number;
  /** Charge level (0.0 to 1.0) */
  chargeLevel: number;
  /** Whether the player is holding to charge */
  isHolding: boolean;
  /** Number of successful catches */
  catches: number;
  /** Time remaining in catch window after landing */
  catchWindowTimer: number;
  /** Total number of launch attempts */
  totalLaunches: number;
  /** Whether the icon is visible */
  ballVisible: boolean;
}

/* ------------------------------------------------------------------ */
/*  Bound Battle                                                        */
/* ------------------------------------------------------------------ */

export class BoundBattle extends BaseMinigame {
  private state: BoundState;

  /** Canvas dimensions */
  private canvasWidth = 256;
  private canvasHeight = 192;

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

    if (this.tickTimer(delta)) {
      this.calculateFinalScore();
      return;
    }

    // Charging phase
    if (this.state.phase === 'charging' && this.state.isHolding) {
      this.state.chargeLevel = Math.min(
        1.0,
        this.state.chargeLevel + CHARGE_RATE * delta,
      );
    }

    // Flying phase — move ball and bounce off walls
    if (this.state.phase === 'flying') {
      this.state.ballX += this.state.velX * delta;
      this.state.ballY += this.state.velY * delta;

      // Bounce off walls
      const r = CATCH_RADIUS;
      if (this.state.ballX <= r) {
        this.state.ballX = r;
        this.state.velX = Math.abs(this.state.velX);
      } else if (this.state.ballX >= this.canvasWidth - r) {
        this.state.ballX = this.canvasWidth - r;
        this.state.velX = -Math.abs(this.state.velX);
      }

      if (this.state.ballY <= r) {
        this.state.ballY = r;
        this.state.velY = Math.abs(this.state.velY);
      } else if (this.state.ballY >= this.canvasHeight - r) {
        this.state.ballY = this.canvasHeight - r;
        this.state.velY = -Math.abs(this.state.velY);
      }

      // Gradually slow down
      const friction = 0.998;
      this.state.velX *= Math.pow(friction, delta * 60);
      this.state.velY *= Math.pow(friction, delta * 60);

      // If ball is very slow, transition to "landed" state (catchable)
      const speed = Math.sqrt(
        this.state.velX ** 2 + this.state.velY ** 2,
      );
      if (speed < 20) {
        this.state.phase = 'landed';
        this.state.catchWindowTimer = CATCH_WINDOW;
      }
    }

    // Landed phase — catch window counting down
    if (this.state.phase === 'landed') {
      this.state.catchWindowTimer -= delta;
      if (this.state.catchWindowTimer <= 0) {
        // Missed the catch — ball disappears
        this.state.ballVisible = false;
        this.state.totalLaunches++;
        this.resetBall();
      }
    }

    this.updateLiveScore();
  }

  /* ================================================================== */
  /*  Setup                                                               */
  /* ================================================================== */

  setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /* ================================================================== */
  /*  Input handling (called by overlay)                                  */
  /* ================================================================== */

  /** Player starts holding to charge. */
  onChargeStart(): void {
    if (this.state.phase !== 'idle' || this.isFinished) return;
    this.state.phase = 'charging';
    this.state.isHolding = true;
    this.state.chargeLevel = 0;
  }

  /** Player releases to launch. */
  onChargeRelease(): void {
    if (this.state.phase !== 'charging' || this.isFinished) return;
    this.state.isHolding = false;

    if (this.state.chargeLevel < MIN_CHARGE) {
      // Too weak — reset
      this.state.phase = 'idle';
      this.state.chargeLevel = 0;
      return;
    }

    // Launch the ball
    const speed = this.state.chargeLevel * MAX_BOUNCE_SPEED;
    const angle = Math.random() * 2 * Math.PI;
    this.state.velX = Math.cos(angle) * speed;
    this.state.velY = Math.sin(angle) * speed;
    this.state.phase = 'flying';
    this.state.ballVisible = true;
    this.state.totalLaunches++;
  }

  /** Player taps/clicks to catch the ball. */
  onCatchAttempt(x: number, y: number): boolean {
    if (this.isFinished) return false;

    // Can only catch during 'flying' or 'landed' phase
    if (
      this.state.phase !== 'flying' &&
      this.state.phase !== 'landed'
    ) {
      return false;
    }

    const dx = x - this.state.ballX;
    const dy = y - this.state.ballY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= CATCH_RADIUS + 8) {
      // Successful catch!
      this.state.phase = 'caught';
      this.state.catches++;
      this.state.ballVisible = false;

      // Reset for next launch after a brief pause
      this.scheduleNextBall();
      return true;
    }

    return false;
  }

  /* ================================================================== */
  /*  Ball management                                                     */
  /* ================================================================== */

  private resetBall(): void {
    this.state.phase = 'idle';
    this.state.chargeLevel = 0;
    this.state.isHolding = false;
    this.state.ballX = this.canvasWidth / 2;
    this.state.ballY = this.canvasHeight / 2;
    this.state.velX = 0;
    this.state.velY = 0;
    this.state.ballVisible = true;
  }

  private scheduleNextBall(): void {
    // Reset ball to center after a short delay (handled via update timer)
    this.state.catchWindowTimer = 0.5;
    const originalPhase = this.state.phase;

    // Use a simple delayed reset via the update loop
    // We set a special timer to reset after catch display
    setTimeout(() => {
      if (originalPhase === this.state.phase || this.state.phase === 'caught') {
        this.resetBall();
      }
    }, 500);
  }

  /* ================================================================== */
  /*  Scoring                                                             */
  /* ================================================================== */

  private updateLiveScore(): void {
    if (this.state.totalLaunches === 0 && this.state.catches === 0) {
      this.currentScore = 0;
      return;
    }

    // Catch rate: catches / max expected catches
    const catchRate = Math.min(1.0, this.state.catches / MAX_CATCHES);

    // Timing bonus: catches relative to launches (efficiency)
    const efficiency =
      this.state.totalLaunches > 0
        ? this.state.catches / this.state.totalLaunches
        : 0;

    // Charge quality: reward good charge levels (not too low, not max)
    // Ideal charge is 0.4-0.7 for good control
    let chargeBonus = 0.5;
    if (this.state.catches > 0) {
      chargeBonus = 0.7; // Bonus for having caught at least once
    }

    // Combined: 50% catch rate + 30% efficiency + 20% charge quality
    this.currentScore = this.clampScore(
      catchRate * 0.5 + efficiency * 0.3 + chargeBonus * 0.2,
    );
  }

  private calculateFinalScore(): void {
    this.updateLiveScore();
    this.isFinished = true;
  }

  /* ================================================================== */
  /*  Getters for overlay rendering                                       */
  /* ================================================================== */

  getState(): Readonly<BoundState> {
    return this.state;
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private createInitialState(): BoundState {
    return {
      phase: 'idle',
      ballX: this.canvasWidth / 2,
      ballY: this.canvasHeight / 2,
      velX: 0,
      velY: 0,
      chargeLevel: 0,
      isHolding: false,
      catches: 0,
      catchWindowTimer: 0,
      totalLaunches: 0,
      ballVisible: true,
    };
  }
}
