import Phaser from 'phaser';

/**
 * Phaser 3 game configuration for Bakugan Battle Brawlers.
 *
 * - Arcade physics with zero gravity (top-down view)
 * - 1024x768 canvas, scalable via Phaser.Scale.FIT
 * - Background: dark green arena floor
 * - Scenes loaded in order: Boot → Arena
 */
export const PHASER_WIDTH = 1024;
export const PHASER_HEIGHT = 768;

export function createPhaserConfig(scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: PHASER_WIDTH,
    height: PHASER_HEIGHT,
    parent: 'phaser-container',
    backgroundColor: '#1a3a1a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: scenes,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
    },
  };
}
