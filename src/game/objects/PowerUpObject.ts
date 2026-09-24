/**
 * PowerUpObject — a Phaser physics sprite for field power-ups.
 *
 * Three types spawn randomly on the arena during battle:
 *   G_POWER_BOOST  (yellow, "G")  → +30 G-Power
 *   EXPERIENCE_BOOST (green, "E") → more XP after brawl (Story only)
 *   S_POWER_BOOST  (grey, "S")   → fills Special Meter partially or fully
 *
 * Collected when a Bakugan rolls over them.
 *
 * Source: GameFAQs guide FAQ 81516, Section C "Fields and Power-Ups"
 */

import Phaser from 'phaser';

/* ------------------------------------------------------------------ */
/*  Power-Up Types                                                      */
/* ------------------------------------------------------------------ */

export type PowerUpKind = 'g_power_boost' | 'experience_boost' | 's_power_boost';

export interface PowerUpConfig {
  kind: PowerUpKind;
  /** Display label on the power-up circle */
  label: string;
  /** Fill colour (hex) */
  color: number;
  /** Alpha for the circle */
  alpha: number;
  /** G-Power boost amount (for g_power_boost) */
  gPowerBoost?: number;
  /** Special meter fill fraction (for s_power_boost: 0.25 small, 1.0 large) */
  specialFill?: number;
  /** XP multiplier boost (for experience_boost) */
  xpMultiplier?: number;
}

const POWER_UP_CONFIGS: Record<PowerUpKind, PowerUpConfig> = {
  g_power_boost: {
    kind: 'g_power_boost',
    label: 'G',
    color: 0xffd700,
    alpha: 0.9,
    gPowerBoost: 30,
  },
  experience_boost: {
    kind: 'experience_boost',
    label: 'E',
    color: 0x00cc44,
    alpha: 0.9,
    xpMultiplier: 1.2,
  },
  s_power_boost: {
    kind: 's_power_boost',
    label: 'S',
    color: 0x888888,
    alpha: 0.9,
    specialFill: 0.25,
  },
};

/* ------------------------------------------------------------------ */
/*  PowerUpObject Class                                                 */
/* ------------------------------------------------------------------ */

export class PowerUpObject extends Phaser.Physics.Arcade.Sprite {
  readonly powerUpKind: PowerUpKind;
  readonly config: PowerUpConfig;

  private bobTween: Phaser.Tweens.Tween | null = null;
  private glowCircle: Phaser.GameObjects.Arc | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    kind: PowerUpKind,
  ) {
    // Create a small circle texture dynamically
    const key = `powerup-${kind}`;
    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      const cfg = POWER_UP_CONFIGS[kind];
      g.fillStyle(cfg.color, cfg.alpha);
      g.fillCircle(12, 12, 12);
      g.generateTexture(key, 24, 24);
      g.destroy();
    }

    super(scene, x, y, key);

    this.powerUpKind = kind;
    this.config = POWER_UP_CONFIGS[kind];

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(12);
    this.setImmovable(true);
    this.body!.checkCollision.none = true;
    this.setDepth(5);

    // Add label text
    const label = scene.add.text(x, y, this.config.label, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    label.setOrigin(0.5);
    label.setDepth(6);

    // Gentle bob animation
    this.bobTween = scene.tweens.add({
      targets: [this, label],
      y: y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow ring
    this.glowCircle = scene.add.circle(x, y, 16, this.config.color, 0.2);
    this.glowCircle.setDepth(4);
    scene.tweens.add({
      targets: this.glowCircle,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Collection                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Collect this power-up. Returns the effect description.
   * Destroys the sprite and cleans up tweens/graphics.
   */
  collect(): CollectedPowerUp {
    const result: CollectedPowerUp = {
      kind: this.powerUpKind,
      gPowerBoost: this.config.gPowerBoost ?? 0,
      specialFill: this.config.specialFill ?? 0,
      xpMultiplier: this.config.xpMultiplier ?? 1,
    };

    // Collect animation — scale up then destroy
    this.scene.tweens.killTweensOf(this);
    if (this.glowCircle) {
      this.scene.tweens.killTweensOf(this.glowCircle);
      this.glowCircle.destroy();
    }

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });

    return result;
  }

  /* ------------------------------------------------------------------ */
  /*  Cleanup                                                             */
  /* ------------------------------------------------------------------ */

  preDestroy(): void {
    if (this.bobTween) {
      this.bobTween.destroy();
      this.bobTween = null;
    }
    if (this.glowCircle) {
      this.glowCircle.destroy();
      this.glowCircle = null;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Collected Result                                                    */
/* ------------------------------------------------------------------ */

export interface CollectedPowerUp {
  kind: PowerUpKind;
  gPowerBoost: number;
  specialFill: number;
  xpMultiplier: number;
}

/* ------------------------------------------------------------------ */
/*  Spawn Helper                                                        */
/* ------------------------------------------------------------------ */

/**
 * Spawn power-ups at random positions within the arena bounds.
 * Returns an array of PowerUpObjects.
 */
export function spawnPowerUps(
  scene: Phaser.Scene,
  count: number,
  bounds: { width: number; height: number },
  allowedTypes?: PowerUpKind[],
): PowerUpObject[] {
  const types = allowedTypes ?? (['g_power_boost', 'experience_boost', 's_power_boost'] as PowerUpKind[]);
  const powerUps: PowerUpObject[] = [];

  for (let i = 0; i < count; i++) {
    const kind = types[Math.floor(Math.random() * types.length)];
    const x = 80 + Math.random() * (bounds.width - 160);
    const y = 80 + Math.random() * (bounds.height - 160);
    powerUps.push(new PowerUpObject(scene, x, y, kind));
  }

  return powerUps;
}
