/**
 * Pop Battle — a reaction-speed minigame for Silver Gate Cards.
 *
 * Gameplay: Attribute icons appear and disappear randomly on screen.
 * The player must click/tap them as fast as possible before they vanish.
 * Faster clicks = more points.
 *
 * Score: popped_icons / total_icons × speed_bonus
 * Result: 0.0 (no pops) to 1.0 (all popped quickly).
 * Duration: 10 seconds (configurable via MinigameConfig).
 */

import { BaseMinigame } from './base-minigame';
import type { MinigameConfig } from './types';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

/** Time an icon stays visible before disappearing (seconds) */
const ICON_LIFETIME = 1.5;
/** Time between icon spawns (seconds) */
const SPAWN_INTERVAL = 0.6;
/** Minimum distance between icons (pixels) */
const MIN_SPACING = 40;
/** Icon radius (pixels) */
const ICON_RADIUS = 18;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface PopIcon {
  /** Unique id */
  id: number;
  /** x position */
  x: number;
  /** y position */
  y: number;
  /** Time remaining before disappearing (seconds) */
  lifetime: number;
  /** Whether this icon has been popped */
  popped: boolean;
  /** Time from spawn to pop (for speed scoring), -1 if not popped */
  popTime: number;
}

export interface PopState {
  /** Active icons on screen */
  icons: PopIcon[];
  /** Time until next icon spawn */
  nextSpawnIn: number;
  /** Total icons that have appeared */
  totalSpawned: number;
  /** Total icons popped */
  totalPopped: number;
  /** Sum of pop reaction times (lower = faster = better) */
  totalPopTime: number;
  /** Next icon ID */
  nextId: number;
}

/* ------------------------------------------------------------------ */
/*  Pop Battle                                                          */
/* ------------------------------------------------------------------ */

export class PopBattle extends BaseMinigame {
  private state: PopState;

  /** Canvas dimensions for positioning */
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

    // Spawn new icons
    this.state.nextSpawnIn -= delta;
    if (this.state.nextSpawnIn <= 0) {
      this.spawnIcon();
      this.state.nextSpawnIn = SPAWN_INTERVAL;
    }

    // Update lifetimes and remove expired icons
    for (let i = this.state.icons.length - 1; i >= 0; i--) {
      const icon = this.state.icons[i];
      if (icon.popped) {
        // Remove popped icons after a short display
        icon.lifetime -= delta;
        if (icon.lifetime <= -0.2) {
          this.state.icons.splice(i, 1);
        }
        continue;
      }

      icon.lifetime -= delta;
      if (icon.lifetime <= 0) {
        // Icon expired — not popped
        this.state.icons.splice(i, 1);
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

  /** Player clicks/taps at (x, y). Returns true if an icon was popped. */
  onTap(x: number, y: number): boolean {
    if (this.isFinished) return false;

    // Find the closest unpopped icon within hit radius
    let bestIcon: PopIcon | null = null;
    let bestDist = Infinity;

    for (const icon of this.state.icons) {
      if (icon.popped) continue;
      const dx = x - icon.x;
      const dy = y - icon.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ICON_RADIUS + 8 && dist < bestDist) {
        bestDist = dist;
        bestIcon = icon;
      }
    }

    if (bestIcon) {
      bestIcon.popped = true;
      // popTime is how long the icon was alive before being popped
      bestIcon.popTime = ICON_LIFETIME - bestIcon.lifetime;
      this.state.totalPopped++;
      this.state.totalPopTime += bestIcon.popTime;
      this.updateLiveScore();
      return true;
    }

    return false;
  }

  /* ================================================================== */
  /*  Spawning                                                           */
  /* ================================================================== */

  private spawnIcon(): void {
    const margin = ICON_RADIUS + 10;
    let x: number;
    let y: number;
    let attempts = 0;

    // Try to find a non-overlapping position
    do {
      x = margin + Math.random() * (this.canvasWidth - 2 * margin);
      y = margin + Math.random() * (this.canvasHeight - 2 * margin);
      attempts++;
    } while (this.isTooClose(x, y) && attempts < 20);

    this.state.icons.push({
      id: this.state.nextId++,
      x,
      y,
      lifetime: ICON_LIFETIME,
      popped: false,
      popTime: -1,
    });
    this.state.totalSpawned++;
  }

  private isTooClose(x: number, y: number): boolean {
    for (const icon of this.state.icons) {
      if (icon.popped) continue;
      const dx = x - icon.x;
      const dy = y - icon.y;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_SPACING) return true;
    }
    return false;
  }

  /* ================================================================== */
  /*  Scoring                                                             */
  /* ================================================================== */

  private updateLiveScore(): void {
    if (this.state.totalSpawned === 0) {
      this.currentScore = 0;
      return;
    }

    // Pop rate: fraction of spawned icons that were popped
    const popRate = this.state.totalPopped / this.state.totalSpawned;

    // Speed bonus: average pop time (lower is better)
    // Perfect speed = 0.3s, max acceptable = ICON_LIFETIME
    let speedBonus = 1.0;
    if (this.state.totalPopped > 0) {
      const avgPopTime = this.state.totalPopTime / this.state.totalPopped;
      speedBonus = Math.max(
        0,
        1 - (avgPopTime - 0.3) / (ICON_LIFETIME - 0.3),
      );
    }

    // Combined: 60% pop rate + 40% speed
    this.currentScore = this.clampScore(
      popRate * 0.6 + speedBonus * 0.4,
    );
  }

  private calculateFinalScore(): void {
    this.updateLiveScore();
    this.isFinished = true;
  }

  /* ================================================================== */
  /*  Getters for overlay rendering                                       */
  /* ================================================================== */

  getState(): Readonly<PopState> {
    return this.state;
  }

  getIconRadius(): number {
    return ICON_RADIUS;
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private createInitialState(): PopState {
    return {
      icons: [],
      nextSpawnIn: 0.3, // First icon spawns quickly
      totalSpawned: 0,
      totalPopped: 0,
      totalPopTime: 0,
      nextId: 0,
    };
  }
}
