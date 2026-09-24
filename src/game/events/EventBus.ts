/**
 * EventBus — thin typed emitter bridging React ↔ Phaser.
 *
 * Phaser scenes emit game events (stands, KO, phase changes).
 * React components listen and update the HUD / store.
 * React components also emit commands (throw, move, place card).
 *
 * FASE 7: Added animation-specific events for sound/visual triggers.
 */

export type GameEventType =
  | 'BAKUGAN_THROWN'
  | 'BAKUGAN_STANDING'
  | 'BAKUGAN_MOVED'
  | 'GATE_CARD_PLACED'
  | 'DOUBLE_STAND'
  | 'CRITICAL_KO'
  | 'BATTLE_PHASE_CHANGED'
  | 'G_POWER_UPDATED'
  | 'THROW_LANDED'
  | 'STEERING_EXPIRED'
  | 'BAKUGAN_KNOCKED_BACK'
  | 'BATTLE_TRIGGERED'
  // Battle engine events (FASE 4)
  | 'BATTLE_ENGINE_STARTED'
  | 'BATTLE_ENGINE_TIMER_TICK'
  | 'BATTLE_ENGINE_ABILITY_CARD_PLAYED'
  | 'BATTLE_ENGINE_MINIGAME_RESULT'
  | 'BATTLE_ENGINE_G_POWER_UPDATE'
  | 'BATTLE_ENGINE_RESOLVED'
  | 'BATTLE_ENGINE_LOG'
  // FASE 7: Animation events
  | 'ANIMATION_SHAKE'
  | 'ANIMATION_GLOW'
  | 'ANIMATION_PARTICLE'
  // FASE 9: PvP events
  | 'PVP_TURN_CHANGED'
  | 'PVP_MATCH_OVER'
  | 'PVP_FORFEIT';

export interface GameEventPayloads {
  BAKUGAN_THROWN: { bakuganId: string; targetX: number; targetY: number; force: number; playerId: number };
  BAKUGAN_STANDING: { bakuganId: string; gateCardId: string; playerId: number };
  BAKUGAN_MOVED: { bakuganId: string; x: number; y: number; playerId: number };
  GATE_CARD_PLACED: { gateCardId: string; slotIndex: number; playerId: number };
  DOUBLE_STAND: { gateCardId: string; bakuganIds: string[]; playerId: number };
  CRITICAL_KO: { attackerId: string; defenderId: string; gateCardId: string; attackerPlayerId: number };
  BATTLE_PHASE_CHANGED: { phase: string };
  G_POWER_UPDATED: { playerId: number; gPower: number; bakuganId: string };
  THROW_LANDED: { bakuganId: string; playerId: number };
  STEERING_EXPIRED: { bakuganId: string; playerId: number };
  BAKUGAN_KNOCKED_BACK: { bakuganId: string; playerId: number; x: number; y: number };
  BATTLE_TRIGGERED: { gateCardId: string; player1BakuganId: string; player2BakuganId: string };
  // Battle engine events
  BATTLE_ENGINE_STARTED: {
    phase: string;
    players: Array<{
      id: number;
      name: string;
      bakuganName: string;
      attribute: string;
      baseGPower: number;
      abilityCardNames: string[];
    }>;
    gateCardName: string;
    gateCardTier: string;
    battleType: string;
    timer: number;
  };
  BATTLE_ENGINE_TIMER_TICK: { timeRemaining: number };
  BATTLE_ENGINE_ABILITY_CARD_PLAYED: { playerId: number; cardId: string; cardName: string };
  BATTLE_ENGINE_MINIGAME_RESULT: { playerId: number; score: number; gPowerEarned: number };
  BATTLE_ENGINE_G_POWER_UPDATE: { player0: number; player1: number };
  BATTLE_ENGINE_RESOLVED: { winnerPlayerId: number; reason: string; gateCardId: string };
  BATTLE_ENGINE_LOG: { message: string };
  // FASE 7: Animation events
  ANIMATION_SHAKE: { intensity?: number; duration?: number };
  ANIMATION_GLOW: { x: number; y: number; color?: string; duration?: number };
  ANIMATION_PARTICLE: { x: number; y: number; type: 'sparkles' | 'glow' | 'explosion' | 'trail'; color?: string };
  // FASE 9: PvP events
  PVP_TURN_CHANGED: { currentPlayer: number; turnCount: number; playerName: string };
  PVP_MATCH_OVER: { winnerIndex: number; winnerName: string; gateCardsWon: [number, number] };
  PVP_FORFEIT: { playerId: number; playerName: string };
}

type Callback<T = unknown> = (data: T) => void;

class EventBus {
  private listeners = new Map<string, Set<Callback>>();

  on<T extends GameEventType>(event: T, callback: Callback<GameEventPayloads[T]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as Callback);
  }

  off<T extends GameEventType>(event: T, callback: Callback<GameEventPayloads[T]>): void {
    this.listeners.get(event)?.delete(callback as Callback);
  }

  emit<T extends GameEventType>(event: T, data: GameEventPayloads[T]): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  /** Remove all listeners (call on game destroy) */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/** Singleton shared between Phaser scenes and React components */
export const eventBus = new EventBus();
