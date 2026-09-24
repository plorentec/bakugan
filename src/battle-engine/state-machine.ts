/**
 * Battle Engine — state machine for resolving Bakugan battles.
 *
 * Manages the full battle flow: SETUP → REVEAL_GATE → APPLY_BONUSES →
 * ABILITY_WINDOW → MINIGAME → G_POWER → RESOLUTION
 *
 * Emits events via the provided EventBus for UI updates.
 */

import type { AbilityCard } from '@/data/schemas';
import {
  type BattlePhase,
  type BattleState,
  type BattlePlayerState,
  type BattleContext,
  PHASE_TRANSITIONS,
} from './types';
import {
  calculateBaseGPower,
  calculateGateBonus,
} from './g-power-calculator';
import { AIController } from './ai-controller';
import { eventBus } from '@/game/events/EventBus';
import balanceConfig from '@/data/config/balance.json';

/* ------------------------------------------------------------------ */
/*  Timer helper (browser setTimeout, no Phaser dependency)             */
/* ------------------------------------------------------------------ */

class TimerHelper {
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  delay(callback: () => void, ms: number): void {
    this.timeouts.push(setTimeout(callback, ms));
  }

  clearAll(): void {
    for (const t of this.timeouts) clearTimeout(t);
    this.timeouts = [];
  }
}

/* ------------------------------------------------------------------ */
/*  BattleEngine Class                                                  */
/* ------------------------------------------------------------------ */

export class BattleEngine {
  private state: BattleState | null = null;
  private ai: AIController;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private timerHelper = new TimerHelper();
  private difficulty: 'easy' | 'normal' | 'hard';

  constructor(aiDifficulty: 'easy' | 'normal' | 'hard' = 'easy') {
    this.difficulty = aiDifficulty;
    this.ai = new AIController(aiDifficulty);
  }

  /** Get current battle state (read-only) */
  getState(): BattleState | null {
    return this.state;
  }

  /* ================================================================== */
  /*  Battle Lifecycle                                                    */
  /* ================================================================== */

  /**
   * Start a new battle with the given context.
   * Initializes state and transitions to REVEAL_GATE.
   */
  startBattle(context: BattleContext): BattleState {
    const playerState = this.createPlayerState(
      0,
      'Player',
      context.playerBakugan,
      context.playerAttribute,
      context.playerAbilityCards,
    );

    const opponentState = this.createPlayerState(
      1,
      'Opponent',
      context.opponentBakugan,
      context.opponentAttribute,
      context.opponentAbilityCards,
    );

    this.state = {
      phase: 'SETUP',
      turn: context.turn,
      players: [playerState, opponentState],
      currentGateCard: context.gateCard,
      timer: 0,
      maxTimer: 0,
      gPowerBars: [0, 0],
      battleLog: [],
      abilityWindowOpen: false,
      minigameActive: false,
      winner: null,
      winReason: '',
      isComplete: false,
    };

    this.log('Battle started!');
    this.emitEvent('BATTLE_ENGINE_STARTED', {
      phase: this.state.phase,
      players: this.state.players.map((p) => ({
        id: p.id,
        name: p.name,
        bakuganName: p.bakugan.name,
        attribute: p.attribute,
        baseGPower: p.baseGPower,
        abilityCardNames: p.abilityCards.map((c) => c.name),
      })),
      gateCardName: this.state.currentGateCard.name,
      gateCardTier: this.state.currentGateCard.tier,
      battleType: this.state.currentGateCard.battle_type,
      timer: this.state.timer,
    });

    // Auto-advance from SETUP to REVEAL_GATE
    this.nextPhase();

    return this.state;
  }

  /* ================================================================== */
  /*  Phase Transitions                                                   */
  /* ================================================================== */

  /**
   * Advance to the next phase in the battle flow.
   * Guards prevent skipping phases.
   */
  nextPhase(): void {
    if (!this.state || this.state.isComplete) return;

    const currentPhase = this.state.phase;
    const validNext = PHASE_TRANSITIONS[currentPhase];

    if (!validNext || validNext.length === 0) {
      return;
    }

    const nextPhase = validNext[0];
    this.transitionTo(nextPhase);
  }

  /**
   * Transition to a specific phase (with validation).
   */
  private transitionTo(phase: BattlePhase): void {
    if (!this.state) return;

    const currentPhase = this.state.phase;
    const validNext = PHASE_TRANSITIONS[currentPhase];

    if (!validNext.includes(phase)) {
      console.warn(
        `Invalid phase transition: ${currentPhase} → ${phase}. Valid: ${validNext.join(', ')}`,
      );
      return;
    }

    this.state.phase = phase;
    this.log(`Phase: ${phase}`);

    // Emit phase change
    eventBus.emit('BATTLE_PHASE_CHANGED', { phase });

    // Execute phase-specific logic
    switch (phase) {
      case 'REVEAL_GATE':
        this.revealGate();
        break;
      case 'APPLY_BONUSES':
        this.applyBonuses();
        break;
      case 'ABILITY_WINDOW':
        this.openAbilityWindow();
        break;
      case 'MINIGAME':
        this.startMinigame();
        break;
      case 'G_POWER':
        this.calculateGPower();
        break;
      case 'RESOLUTION':
        this.resolveBattle();
        break;
    }
  }

  /* ================================================================== */
  /*  Phase Implementations                                               */
  /* ================================================================== */

  /**
   * REVEAL_GATE: Show the Gate Card bonuses.
   */
  private revealGate(): void {
    if (!this.state) return;
    this.log(`Gate Card revealed: ${this.state.currentGateCard.name} (${this.state.currentGateCard.tier})`);

    for (const player of this.state.players) {
      const bonus = calculateGateBonus(
        this.state.currentGateCard,
        player.attribute,
        player.bakugan.name,
      );
      this.log(`${player.name}'s ${player.bakugan.name} gets +${bonus} G from Gate Card`);
    }

    this.startTimer(1.5, () => this.nextPhase());
  }

  /**
   * APPLY_BONUSES: Apply Gate Card and Copper Card effects.
   */
  private applyBonuses(): void {
    if (!this.state) return;

    for (const player of this.state.players) {
      player.gateBonus = calculateGateBonus(
        this.state.currentGateCard,
        player.attribute,
        player.bakugan.name,
      );

      // Apply AI handicap
      if (player.id === 1) {
        const handicap = this.ai.getGPowerHandicap();
        if (handicap < 0) {
          this.log(`${player.name} has AI handicap: ${handicap} G`);
          player.gateBonus += handicap;
        }
      }
    }

    // Check for Copper card effects
    const gc = this.state.currentGateCard;
    if (gc.tier === 'copper' && gc.effect) {
      if (gc.effect.type === 'PREVENT_ABILITY_CARDS') {
        this.log('Copper effect: Ability Cards are disabled!');
        for (const player of this.state.players) {
          player.abilityCardDisabled = true;
        }
      }
    }

    this.log(
      `Bonuses applied. P1: +${this.state.players[0].gateBonus}G, P2: +${this.state.players[1].gateBonus}G`,
    );

    this.startTimer(1.5, () => this.nextPhase());
  }

  /**
   * ABILITY_WINDOW: Allow players to play an Ability Card.
   */
  private openAbilityWindow(): void {
    if (!this.state) return;

    const anyDisabled = this.state.players.some((p) => p.abilityCardDisabled);
    if (anyDisabled) {
      this.log('Ability Cards disabled by Copper Gate Card effect');
      this.startTimer(1.0, () => this.nextPhase());
      return;
    }

    this.state.abilityWindowOpen = true;
    this.state.maxTimer = balanceConfig.battle.ability_card_window_seconds;
    this.state.timer = this.state.maxTimer;

    this.log('Ability Card window opened! Play a card or pass.');

    // AI plays its ability card after a short delay
    this.timerHelper.delay(() => {
      this.aiPlayAbilityCard();
    }, 500);

    this.startTimer(this.state.maxTimer, () => {
      this.closeAbilityWindow();
    });
  }

  /**
   * Player plays an ability card.
   */
  playAbilityCard(playerId: number, cardId: string): void {
    if (!this.state || !this.state.abilityWindowOpen) return;

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.abilityCardDisabled) return;

    const cardIndex = player.abilityCards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const card = player.abilityCards[cardIndex];
    player.playedAbilityCard = card;

    this.log(`${player.name} plays "${card.name}"!`);
    eventBus.emit('BATTLE_ENGINE_ABILITY_CARD_PLAYED', {
      playerId,
      cardId: card.id,
      cardName: card.name,
    });

    // Process card effects
    this.processAbilityCardEffects(player, card);
  }

  /**
   * Close the ability card window and advance.
   */
  private closeAbilityWindow(): void {
    if (!this.state) return;
    this.state.abilityWindowOpen = false;
    this.stopTimer();
    this.nextPhase();
  }

  /**
   * Process effects from an ability card.
   */
  private processAbilityCardEffects(player: BattlePlayerState, card: AbilityCard): void {
    if (!this.state) return;

    for (const effect of card.effects) {
      const target = effect.target === 'self' ? player : this.getOpponent(player.id);

      switch (effect.type) {
        case 'ADD_G_POWER':
          if (this.checkEffectCondition(effect, player)) {
            player.abilityBonus += effect.magnitude ?? 0;
            this.log(`${player.name} gains +${effect.magnitude} G-Power from "${card.name}"`);
          }
          break;

        case 'REMOVE_G_POWER':
          this.state.players[0].abilityBonus = 0;
          this.state.players[1].abilityBonus = 0;
          this.state.players[0].gateBonus = 0;
          this.state.players[1].gateBonus = 0;
          this.log('All G-Power boosts removed!');
          break;

        case 'SWAP_G_POWER': {
          const p0 = this.state.players[0];
          const p1 = this.state.players[1];
          const tempBonus = p0.abilityBonus;
          p0.abilityBonus = p1.abilityBonus;
          p1.abilityBonus = tempBonus;
          this.log('G-Power bonuses swapped!');
          break;
        }

        case 'DOUBLE_G_POWER':
          target.abilityBonus *= 2;
          this.log(`${target.name}'s ability bonus doubled!`);
          break;

        case 'RESTART_BATTLE':
          this.log('Battle restarted by ability card!');
          this.stopTimer();
          this.timerHelper.clearAll();
          this.startBattle({
            playerBakugan: this.state.players[0].bakugan,
            opponentBakugan: this.state.players[1].bakugan,
            playerAttribute: this.state.players[0].attribute,
            opponentAttribute: this.state.players[1].attribute,
            playerAbilityCards: this.state.players[0].abilityCards,
            opponentAbilityCards: this.state.players[1].abilityCards,
            gateCard: this.state.currentGateCard,
            turn: this.state.turn,
            aiDifficulty: this.difficulty,
          });
          return;

        case 'SKIP_BATTLE':
          if (this.checkEffectCondition(effect, player)) {
            this.log(`Battle skipped by "${card.name}"! Highest G wins.`);
            this.stopTimer();
            this.state.abilityWindowOpen = false;
            this.calculateGPower();
            this.resolveBattle();
            return;
          }
          break;

        case 'PREVENT_ABILITY_CARDS':
          this.getOpponent(player.id).abilityCardDisabled = true;
          this.log(`${this.getOpponent(player.id).name} can no longer play Ability Cards!`);
          break;

        default:
          this.log(`Unhandled effect: ${effect.type}`);
          break;
      }
    }
  }

  /**
   * Check if an effect's condition is met.
   */
  private checkEffectCondition(
    effect: { condition?: { type: string; value?: unknown } },
    player: BattlePlayerState,
  ): boolean {
    if (!effect.condition) return true;

    switch (effect.condition.type) {
      case 'ATTRIBUTE_MATCH': {
        const attr = effect.condition.value;
        if (Array.isArray(attr)) {
          return attr.includes(player.attribute);
        }
        return attr === player.attribute;
      }
      case 'GATE_CARD_TIER':
        return effect.condition.value === this.state?.currentGateCard.tier;
      case 'BATTLE_TYPE':
        return effect.condition.value === this.state?.currentGateCard.battle_type;
      default:
        return true;
    }
  }

  /**
   * AI opponent plays an ability card.
   */
  private aiPlayAbilityCard(): void {
    if (!this.state) return;
    const opponent = this.state.players[1];
    if (opponent.abilityCardDisabled) return;

    const card = this.ai.selectAbilityCard(opponent.abilityCards);
    if (card) {
      this.playAbilityCard(1, card.id);
    }
  }

  /**
   * MINIGAME: Start the battle minigame.
   */
  private startMinigame(): void {
    if (!this.state) return;
    this.state.minigameActive = true;
    this.log('Minigame started! Both players perform simultaneously.');

    // AI "plays" the minigame after a delay
    this.timerHelper.delay(() => {
      this.resolveMinigame(1, this.ai.playMinigame());
    }, 2000);
  }

  /**
   * MINIGAME: Resolve a player's minigame result.
   */
  resolveMinigame(playerId: number, result: number): void {
    if (!this.state || !this.state.minigameActive) return;

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    const gPowerEarned = Math.round(
      result * balanceConfig.minigame.g_power_per_result_point,
    );
    player.minigameResult = result;
    player.minigameGPower = gPowerEarned;

    this.log(
      `${player.name} minigame: ${(result * 100).toFixed(0)}% → +${gPowerEarned} G`,
    );

    eventBus.emit('BATTLE_ENGINE_MINIGAME_RESULT', {
      playerId,
      score: result,
      gPowerEarned,
    });

    // Check if both players have completed
    const allComplete = this.state.players.every((p) => p.minigameResult >= 0);
    if (allComplete) {
      this.state.minigameActive = false;
      this.stopTimer();
      this.nextPhase();
    }
  }

  /**
   * G_POWER: Calculate final G-Power for both players.
   */
  private calculateGPower(): void {
    if (!this.state) return;

    for (const player of this.state.players) {
      player.totalGPower =
        calculateBaseGPower(player.bakugan) +
        player.gateBonus +
        player.abilityBonus +
        player.minigameGPower;
    }

    const p0 = this.state.players[0];
    const p1 = this.state.players[1];

    this.log(`Final G-Power — ${p0.name}: ${p0.totalGPower} | ${p1.name}: ${p1.totalGPower}`);

    const maxG = Math.max(p0.totalGPower, p1.totalGPower, 1);
    this.state.gPowerBars = [p0.totalGPower / maxG, p1.totalGPower / maxG];

    eventBus.emit('BATTLE_ENGINE_G_POWER_UPDATE', {
      player0: p0.totalGPower,
      player1: p1.totalGPower,
    });

    this.startTimer(2.0, () => this.nextPhase());
  }

  /**
   * RESOLUTION: Determine winner and clean up.
   */
  private resolveBattle(): void {
    if (!this.state) return;

    const p0 = this.state.players[0];
    const p1 = this.state.players[1];

    let winnerId: number;
    let reason: string;

    if (p0.totalGPower > p1.totalGPower) {
      winnerId = 0;
      reason = `${p0.name} wins with ${p0.totalGPower} G-Power!`;
    } else if (p1.totalGPower > p0.totalGPower) {
      winnerId = 1;
      reason = `${p1.name} wins with ${p1.totalGPower} G-Power!`;
    } else {
      winnerId = 0;
      reason = `Tie at ${p0.totalGPower} G! ${p0.name} wins by tiebreaker.`;
    }

    this.state.winner = winnerId;
    this.state.winReason = reason;
    this.state.isComplete = true;

    this.log(reason);

    eventBus.emit('BATTLE_ENGINE_RESOLVED', {
      winnerPlayerId: winnerId,
      reason,
      gateCardId: this.state.currentGateCard.id,
    });

    this.stopTimer();
  }

  /* ================================================================== */
  /*  Timer                                                               */
  /* ================================================================== */

  private startTimer(duration: number, onComplete: () => void): void {
    this.stopTimer();
    if (!this.state) return;

    this.state.timer = duration;
    this.state.maxTimer = duration;

    this.timerInterval = setInterval(() => {
      if (!this.state) {
        this.stopTimer();
        return;
      }

      this.state.timer = Math.max(0, this.state.timer - 0.1);

      eventBus.emit('BATTLE_ENGINE_TIMER_TICK', {
        timeRemaining: this.state.timer,
      });

      if (this.state.timer <= 0) {
        this.stopTimer();
        onComplete();
      }
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private createPlayerState(
    id: number,
    name: string,
    bakugan: import('@/data/schemas').Bakugan,
    attribute: import('@/data/schemas').Attribute,
    abilityCards: AbilityCard[],
  ): BattlePlayerState {
    return {
      id,
      name,
      bakugan,
      attribute,
      baseGPower: calculateBaseGPower(bakugan),
      gateBonus: 0,
      abilityBonus: 0,
      minigameGPower: 0,
      totalGPower: 0,
      abilityCards: [...abilityCards],
      playedAbilityCard: null,
      minigameResult: -1,
      abilityCardDisabled: false,
    };
  }

  private getOpponent(playerId: number): BattlePlayerState {
    if (!this.state) throw new Error('No battle state');
    return this.state.players[playerId === 0 ? 1 : 0];
  }

  private log(message: string): void {
    if (!this.state) return;
    this.state.battleLog.push(message);
    eventBus.emit('BATTLE_ENGINE_LOG', { message });
  }

  private emitEvent<T>(event: string, data: T): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventBus as { emit: (e: string, d: unknown) => void }).emit(event, data);
  }

  /** Cleanup when battle is destroyed */
  destroy(): void {
    this.stopTimer();
    this.timerHelper.clearAll();
    this.state = null;
  }
}
