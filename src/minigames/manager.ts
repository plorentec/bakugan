/**
 * Minigame Manager — creates and manages minigames based on Gate Card tier.
 *
 * Gold → Scratch Battle or Spin Battle
 * Silver → Timing Battle or Pop Battle
 * Copper → Trace Battle or Bound Battle
 *
 * Tier-to-minigame mapping is used when the Gate Card's battle_type
 * is not specific enough, or for random selection within a tier.
 */

import type { GateCardBattleType, GateCardTier } from '@/data/schemas';
import type { IMinigame, MinigameConfig, MinigameType } from './types';
import { ScratchBattle } from './scratch-battle';
import { SpinBattle } from './spin-battle';
import { TimingBattle } from './timing-battle';
import { PopBattle } from './pop-battle';
import { TraceBattle } from './trace-battle';
import { BoundBattle } from './bound-battle';
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
        this.currentMinigame = new SpinBattle(config);
        break;
      case 'timing':
        this.currentMinigame = new TimingBattle(config);
        break;
      case 'pop':
        this.currentMinigame = new PopBattle(config);
        break;
      case 'trace':
        this.currentMinigame = new TraceBattle(config);
        break;
      case 'bound':
        this.currentMinigame = new BoundBattle(config);
        break;
      default:
        this.currentMinigame = new ScratchBattle(config);
    }

    return this.currentMinigame;
  }

  /**
   * Create a random minigame for a given Gate Card tier.
   * Useful when the card's specific battle_type is not set,
   * or when you want random selection within the tier.
   *
   * Gold  → ['scratch', 'spin']
   * Silver → ['timing', 'pop']
   * Copper → ['trace', 'bound']
   */
  createMinigameForTier(
    tier: GateCardTier,
    difficulty: number = 1.0,
  ): IMinigame {
    const tierMinigames: Record<GateCardTier, MinigameType[]> = {
      gold: ['scratch', 'spin'],
      silver: ['timing', 'pop'],
      copper: ['trace', 'bound'],
    };

    const options = tierMinigames[tier];
    const chosen = options[Math.floor(Math.random() * options.length)];

    return this.createMinigame(chosen, difficulty);
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
