/**
 * music.ts — Background music controller.
 *
 * Wraps audioManager music playback with game-state awareness.
 * Call setSceneMusic() when switching between menu/arena/battle.
 */

import { audioManager, type MusicName } from "./audio";

/* ------------------------------------------------------------------ */
/*  Scene → Music mapping                                               */
/* ------------------------------------------------------------------ */

type GameScene = "menu" | "arena" | "battle";

const SCENE_MUSIC: Record<GameScene, MusicName> = {
  menu: "menu",
  arena: "arena",
  battle: "battle",
};

let currentScene: GameScene | null = null;

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Switch background music based on the current game scene.
 * No-ops if already playing the same scene's music.
 */
export function setSceneMusic(scene: GameScene): void {
  if (currentScene === scene) return;
  currentScene = scene;
  audioManager.playMusic(SCENE_MUSIC[scene]);
}

/** Stop all background music */
export function stopMusic(): void {
  currentScene = null;
  audioManager.stopMusic();
}

/** Set music volume (0..1) */
export function setMusicVolume(v: number): void {
  audioManager.setMusicVolume(v);
}

/** Set SFX volume (0..1) */
export function setSfxVolume(v: number): void {
  audioManager.setSfxVolume(v);
}
