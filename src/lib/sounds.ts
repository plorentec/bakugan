/**
 * sounds.ts — Sound definition map for all game events.
 *
 * Maps logical event names to AudioManager sound triggers.
 * Used by components and the event bus to play the right sound.
 */

import { audioManager, type SoundName } from "./audio";

/* ------------------------------------------------------------------ */
/*  Event → Sound mapping                                               */
/* ------------------------------------------------------------------ */

export const EVENT_SOUNDS: Partial<Record<string, SoundName>> = {
  BAKUGAN_THROWN: "throw",
  BAKUGAN_STANDING: "stand",
  BATTLE_TRIGGERED: "battle_start",
  BATTLE_ENGINE_STARTED: "battle_start",
  BATTLE_ENGINE_RESOLVED: undefined, // win/lose determined by data
  DOUBLE_STAND: "double_stand",
  CRITICAL_KO: "critical_ko",
  GATE_CARD_PLACED: "gate_card_place",
  BATTLE_ENGINE_ABILITY_CARD_PLAYED: "ability_play",
  BATTLE_ENGINE_MINIGAME_RESULT: "minigame_scratch",
  THROW_LANDED: "click",
  STEERING_EXPIRED: "click",
};

/* ------------------------------------------------------------------ */
/*  Convenience: play sound for a game event                            */
/* ------------------------------------------------------------------ */

export function playEventSound(event: string, data?: { winnerPlayerId?: number }): void {
  const sound = EVENT_SOUNDS[event];
  if (sound) {
    audioManager.playSfx(sound);
    return;
  }

  // Win/lose based on battle result
  if (event === "BATTLE_ENGINE_RESOLVED") {
    audioManager.playSfx(data?.winnerPlayerId === 0 ? "win" : "lose");
  }
}

/* ------------------------------------------------------------------ */
/*  Direct SFX triggers (for UI interactions)                           */
/* ------------------------------------------------------------------ */

export function playClickSound(): void {
  audioManager.playSfx("click");
}

export function playSelectSound(): void {
  audioManager.playSfx("select");
}

export function playBuySound(): void {
  audioManager.playSfx("buy");
}

export function playLevelUpSound(): void {
  audioManager.playSfx("level_up");
}

export function playTimerWarningSound(): void {
  audioManager.playSfx("timer_warning");
}
