'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createPhaserConfig, PHASER_WIDTH, PHASER_HEIGHT } from './config/PhaserConfig';
import { eventBus } from './events/EventBus';
import { BootScene } from './scenes/BootScene';
import { ArenaScene } from './scenes/ArenaScene';

/**
 * React wrapper that mounts a Phaser 3 game instance.
 *
 * Creates the game on mount, destroys on unmount.
 * The canvas renders inside a div with id="phaser-container".
 * All Phaser↔React communication goes through the shared EventBus singleton.
 */
export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Prevent double-initialisation in Strict Mode
    if (gameRef.current) return;

    const config = createPhaserConfig([BootScene, ArenaScene]);
    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        eventBus.removeAllListeners();
      }
    };
  }, []);

  return (
    <div
      id="phaser-container"
      className="relative mx-auto"
      style={{ width: PHASER_WIDTH, height: PHASER_HEIGHT }}
    />
  );
}
