/**
 * EventBus — thin typed emitter bridging React ↔ Phaser.
 *
 * Phaser scenes emit game events (stands, KO, phase changes).
 * React components listen and update the HUD / store.
 * React components also emit commands (throw, move, place card).
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
  | 'BATTLE_TRIGGERED';

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
