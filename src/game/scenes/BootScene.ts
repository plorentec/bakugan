import Phaser from 'phaser';

/**
 * BootScene — generates placeholder textures for Bakugan (circles)
 * and Gate Cards (rectangles), then transitions to ArenaScene.
 *
 * Each attribute gets a distinct colour:
 *   Pyrus=red, Aquos=blue, Subterra=brown, Haos=white, Darkus=purple, Ventus=green
 *
 * Gate Card tiers: Gold=yellow, Silver=gray, Copper=orange
 */

const ATTRIBUTE_COLORS: Record<string, number> = {
  pyrus: 0xe63946,
  aquos: 0x457b9d,
  subterra: 0xa0522d,
  haos: 0xf1faee,
  darkus: 0x7b2d8e,
  ventus: 0x2a9d8f,
};

const TIER_COLORS: Record<string, number> = {
  gold: 0xf4d03f,
  silver: 0xaeb6bf,
  copper: 0xe67e22,
};

/** Unique key for each generated texture */
function bakuganKey(attribute: string): string {
  return `bakugan-${attribute}`;
}

function gateCardKey(tier: string): string {
  return `gatecard-${tier}`;
}

/** Helper: create a temporary off-screen graphics object */
function tempGraphics(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setVisible(false);
  return g;
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Nothing to load — we generate all textures procedurally.
  }

  create(): void {
    this.generateBakuganTextures();
    this.generateGateCardTextures();
    this.generateMiscTextures();
    this.scene.start('ArenaScene');
  }

  /* ------------------------------------------------------------------ */
  /*  Texture generation                                                  */
  /* ------------------------------------------------------------------ */

  private generateBakuganTextures(): void {
    const radius = 14;

    for (const [attr, color] of Object.entries(ATTRIBUTE_COLORS)) {
      // --- Ball mode (small circle) ---
      const gBall = tempGraphics(this);
      gBall.fillStyle(color, 1);
      gBall.fillCircle(radius, radius, radius);
      // Dark outline
      gBall.lineStyle(2, 0x000000, 0.6);
      gBall.strokeCircle(radius, radius, radius);
      gBall.generateTexture(bakuganKey(attr), radius * 2, radius * 2);
      gBall.destroy();

      // --- Stand mode (larger circle with glow) ---
      const standRadius = 18;
      const glowRadius = 26;
      const totalSize = glowRadius * 2;
      const cx = totalSize / 2;
      const cy = totalSize / 2;
      const gStand = tempGraphics(this);
      // Glow ring
      gStand.fillStyle(color, 0.25);
      gStand.fillCircle(cx, cy, glowRadius);
      // Main body
      gStand.fillStyle(color, 1);
      gStand.fillCircle(cx, cy, standRadius);
      gStand.lineStyle(2, 0xffffff, 0.8);
      gStand.strokeCircle(cx, cy, standRadius);
      gStand.generateTexture(`${bakuganKey(attr)}-stand`, totalSize, totalSize);
      gStand.destroy();
    }
  }

  private generateGateCardTextures(): void {
    const w = 110;
    const h = 75;

    for (const [tier, color] of Object.entries(TIER_COLORS)) {
      const g = tempGraphics(this);
      // Card body
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, w, h, 6);
      // Border
      g.lineStyle(2, 0x000000, 0.5);
      g.strokeRoundedRect(0, 0, w, h, 6);
      // Inner highlight
      g.lineStyle(1, 0xffffff, 0.3);
      g.strokeRoundedRect(3, 3, w - 6, h - 6, 4);
      g.generateTexture(gateCardKey(tier), w, h);
      g.destroy();
    }
  }

  private generateMiscTextures(): void {
    // --- Stand-zone indicator (translucent circle) ---
    const szRadius = 20;
    const gSz = tempGraphics(this);
    gSz.fillStyle(0xffffff, 0.12);
    gSz.fillCircle(szRadius, szRadius, szRadius);
    gSz.lineStyle(1, 0xffffff, 0.3);
    gSz.strokeCircle(szRadius, szRadius, szRadius);
    gSz.generateTexture('stand-zone', szRadius * 2, szRadius * 2);
    gSz.destroy();

    // --- Trajectory dot ---
    const gDot = tempGraphics(this);
    gDot.fillStyle(0xffffff, 0.5);
    gDot.fillCircle(3, 3, 3);
    gDot.generateTexture('trajectory-dot', 6, 6);
    gDot.destroy();

    // --- Glow circle for animations ---
    const glowR = 30;
    const gGlow = tempGraphics(this);
    gGlow.fillStyle(0xffffff, 0.15);
    gGlow.fillCircle(glowR, glowR, glowR);
    gGlow.generateTexture('glow', glowR * 2, glowR * 2);
    gGlow.destroy();
  }
}
