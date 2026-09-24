/**
 * Minigame Manager — creates and manages minigames based on Gate Card tier.
 *
 * Gold → Scratch Battle or Spin Battle (MVP: Scratch only)
 * Silver → Timing Battle or Pop Battle (placeholder)
 * Copper → Trace Battle or Bound Battle (placeholder)
 */

import type { GateCardBattleType } from '@/data/schemas';
import type { IMinigame, MinigameConfig, MinigameType } from './types';
import { ScratchBattle } from './scratch-battle';
import balanceConfig from '@/data/config/balance.json';

/* ------------------------------------------------------------------ */
/*  Minigame Manager                                                    */
/* ------------------------------------------------------------------ */

export class MinigameManager {
  private currentMinigame: IMinigame | null = null;

  /**
   * Create a minigame based on the Gate Card's battle type.
   */
  createMinigame(battleType: GateCardBattleType, difficulty: number = 1.0): IMinigame {
    // Clean up any existing minigame
    this.destroyCurrent();

    const config: MinigameConfig = {
      type: battleType as MinigameType,
      duration: 10, // 10 seconds for all minigames (MVP)
      difficulty,
    };

    switch (battleType) {
      case 'scratch':
        this.currentMinigame = new ScratchBattle(config);
        break;

      case 'spin':
        // Placeholder: use Scratch Battle for now
        this.currentMinigame = new ScratchBattle(config);
        break;

      case 'timing':
        // Placeholder: use Scratch Battle for now
        this.currentMinigame = new ScratchBattle(config);
        break;

      case 'pop':
        // Placeholder: use Scratch Battle for now
        this.currentMinigame = new ScratchBattle(config);
        break;

      case 'trace':
        // Placeholder: use Scratch Battle for now
        this.currentMinigame = new ScratchBattle(config);
        break;

      case 'bound':
        // Placeholder: use Scratch Battle for now
        this.currentMinigame = new ScratchBattle(config);
        break;

      default:
        this.currentMinigame = new ScratchBattle(config);
    }

    return this.currentMinigame;
  }

  /**
   * Get the current minigame instance.
   */
  getCurrentMinigame(): IMinigame | null {
    return this.currentMinigame;
  }

  /**
   * Get the result from the current minigame.
   * Returns null if no minigame is active.
   */
  getResult(): { score: number; gPowerEarned: number } | null {
    if (!this.currentMinigame) return null;
    return this.currentMinigame.getResult();
  }

  /**
   * Clean up the current minigame.
   */
  destroyCurrent(): void {
    if (this.currentMinigame) {
      this.currentMinigame.destroy();
      this.currentMinigame = null;
    }
  }
}
