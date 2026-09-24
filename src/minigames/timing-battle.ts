/**
 * Timing Battle — a rhythm-based minigame for Silver Gate Cards.
 *
 * Gameplay: Attribute icons slide down two lanes toward a center target symbol.
 * The player must tap/click when the icon overlaps the center symbol.
 * Perfect timing = full points, early/late = partial, miss = zero.
 *
 * Score: successful_taps / total_icons × accuracy
 * Result: 0.0 (all misses) to 1.0 (all perfect taps).
 * Duration: 10 seconds (configurable via MinigameConfig).
 */

import { BaseMinigame } from './base-minigame';
import type { MinigameConfig } from './types';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

/** Pixel radius around center that counts as a "perfect" hit */
const PERFECT_WINDOW = 15;
/** Pixel radius for a "good" hit */
const GOOD_WINDOW = 40;
/** Pixel radius for an "ok" hit */
const OK_WINDOW = 70;
/** Speed of icons falling (pixels/second) */
const ICON_SPEED = 200;
/** Time between icon spawns (seconds) */
const SPAWN_INTERVAL = 0.8;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface TimingLane {
  /** Lane index (0 = left, 1 = right) */
  index: number;
  /** x position of this lane */
  x: number;
}

export interface TimingIcon {
  /** Unique id */
  id: number;
  /** Lane this icon is in */
  laneIndex: number;
  /** Current y position */
  y: number;
  /** Whether this icon has been hit or missed */
  resolved: boolean;
  /** Result of the hit: 'perfect' | 'good' | 'ok' | 'miss' | null */
  hitResult: 'perfect' | 'good' | 'ok' | 'miss' | null;
}

export interface TimingState {
  /** Active icons sliding down lanes */
  icons: TimingIcon[];
  /** Center target y position (where the hit zone is) */
  targetY: number;
  /** Time until next icon spawn */
  nextSpawnIn: number;
  /** Total icons spawned */
  totalSpawned: number;
  /** Total perfect hits */
  perfectHits: number;
  /** Total good hits */
  goodHits: number;
  /** Total ok hits */
  okHits: number;
  /** Total misses */
  misses: number;
  /** Next icon ID */
  nextId: number;
}

/* ------------------------------------------------------------------ */
/*  Timing Battle                                                       */
/* ------------------------------------------------------------------ */

export class TimingBattle extends BaseMinigame {
  private state: TimingState;

  /** Lanes configuration */
  private lanes: TimingLane[] = [];
  /** Canvas width for positioning */
  private canvasWidth = 256;
  /** Canvas height for positioning */
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
    this.setupLanes();
  }

  update(delta: number): void {
    if (this.isFinished || !this.isStarted) return;

    if (this.tickTimer(delta)) {
      this.calculateFinalScore();
      return;
    }

    // Spawn new icons
    this.state.nextSpawnIn -= delta;
    if (this.state.nextSpawnIn <= 0) {
      this.spawnIcon();
      this.state.nextSpawnIn = SPAWN_INTERVAL;
    }

    // Move icons and check for misses
    for (const icon of this.state.icons) {
      if (icon.resolved) continue;
      icon.y += ICON_SPEED * delta;

      // Check if icon passed the target zone without being tapped
      if (icon.y > this.state.targetY + OK_WINDOW + 20) {
        icon.resolved = true;
        icon.hitResult = 'miss';
        this.state.misses++;
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
    this.state.targetY = height * 0.7;
    this.setupLanes();
  }

  private setupLanes(): void {
    const laneWidth = this.canvasWidth / 3;
    this.lanes = [
      { index: 0, x: laneWidth },
      { index: 1, x: laneWidth * 2 },
    ];
  }

  /* ================================================================== */
  /*  Input handling (called by overlay)                                  */
  /* ================================================================== */

  /** Player taps/clicks in a lane. */
  onTap(laneIndex: number): void {
    if (this.isFinished) return;

    // Find the closest unresolved icon in this lane to the target zone
    let bestIcon: TimingIcon | null = null;
    let bestDist = Infinity;

    for (const icon of this.state.icons) {
      if (icon.resolved || icon.laneIndex !== laneIndex) continue;
      const dist = Math.abs(icon.y - this.state.targetY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIcon = icon;
      }
    }

    if (bestIcon && bestDist <= OK_WINDOW) {
      bestIcon.resolved = true;
      if (bestDist <= PERFECT_WINDOW) {
        bestIcon.hitResult = 'perfect';
        this.state.perfectHits++;
      } else if (bestDist <= GOOD_WINDOW) {
        bestIcon.hitResult = 'good';
        this.state.goodHits++;
      } else {
        bestIcon.hitResult = 'ok';
        this.state.okHits++;
      }
    }

    this.updateLiveScore();
  }

  /* ================================================================== */
  /*  Spawning                                                           */
  /* ================================================================== */

  private spawnIcon(): void {
    const laneIndex = Math.floor(Math.random() * this.lanes.length);
    this.state.icons.push({
      id: this.state.nextId++,
      laneIndex,
      y: -20,
      resolved: false,
      hitResult: null,
    });
    this.state.totalSpawned++;
  }

  /* ================================================================== */
  /*  Scoring                                                             */
  /* ================================================================== */

  private updateLiveScore(): void {
    const totalResolved =
      this.state.perfectHits +
      this.state.goodHits +
      this.state.okHits +
      this.state.misses;

    if (totalResolved === 0) {
      this.currentScore = 0;
      return;
    }

    // Weighted hits: perfect=1.0, good=0.6, ok=0.3, miss=0
    const weightedHits =
      this.state.perfectHits * 1.0 +
      this.state.goodHits * 0.6 +
      this.state.okHits * 0.3;

    // Accuracy: weighted hits / total resolved
    const accuracy = weightedHits / totalResolved;

    // Completion bonus: more icons attempted = more active play
    const completionFactor = Math.min(1.0, totalResolved / 10);

    // Combined: 70% accuracy + 30% completion
    this.currentScore = this.clampScore(
      accuracy * 0.7 + completionFactor * 0.3,
    );
  }

  private calculateFinalScore(): void {
    this.updateLiveScore();
    this.isFinished = true;
  }

  /* ================================================================== */
  /*  Getters for overlay rendering                                       */
  /* ================================================================== */

  getState(): Readonly<TimingState> {
    return this.state;
  }

  getLanes(): ReadonlyArray<TimingLane> {
    return this.lanes;
  }

  getTargetY(): number {
    return this.state.targetY;
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private createInitialState(): TimingState {
    return {
      icons: [],
      targetY: this.canvasHeight * 0.7,
      nextSpawnIn: SPAWN_INTERVAL,
      totalSpawned: 0,
      perfectHits: 0,
      goodHits: 0,
      okHits: 0,
      misses: 0,
      nextId: 0,
    };
  }
}
