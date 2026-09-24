import { create } from 'zustand';
import type { Bakugan, GateCard } from '@/data/schemas';
import bakuganData from '@/data/raw/bakugan.json';
import gateCardData from '@/data/raw/gate-cards.json';
import { eventBus } from '@/game/events/EventBus';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type BattlePhase =
  | 'SETUP'
  | 'PLACE_GATE'
  | 'SELECT_BAKUGAN'
  | 'AIM'
  | 'THROW'
  | 'FIELD_MOVEMENT'
  | 'STAND'
  | 'BATTLE_TRIGGER';

export interface PlayerBattleState {
  id: number;
  name: string;
  bakugan: Bakugan[];
  gateCards: GateCard[];
  abilityCards: unknown[]; // AbilityCard type when ready
  bakuganRemaining: number;
  gateCardsWon: number;
  currentBakuganIndex: number;
  gPower: number;
}

export interface BattleState {
  phase: BattlePhase;
  player: PlayerBattleState;
  opponent: PlayerBattleState;
  currentGateCardOnField: string | null;
  battleMessage: string;

  // Actions
  startBattle: () => void;
  setPhase: (phase: BattlePhase) => void;
  placeGateCard: (gateCardId: string) => void;
  selectBakugan: (index: number) => void;
  throwBakugan: (bakuganId: string, force: number) => void;
  standBakugan: (bakuganId: string, gateCardId: string, playerId: number) => void;
  triggerBattle: (gateCardId: string, p1BakuganId: string, p2BakuganId: string) => void;
  resolveBattle: (winnerPlayerId: number, gateCardId: string) => void;
  updateGPower: (playerId: number, gPower: number) => void;
  setBattleMessage: (msg: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Default data                                                        */
/* ------------------------------------------------------------------ */

function createDefaultPlayer(name: string, id: number): PlayerBattleState {
  return {
    id,
    name,
    bakugan: bakuganData.slice(0, 3) as unknown as Bakugan[],
    gateCards: gateCardData.slice(0, 3) as unknown as GateCard[],
    abilityCards: [],
    bakuganRemaining: 3,
    gateCardsWon: 0,
    currentBakuganIndex: 0,
    gPower: 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Store                                                               */
/* ------------------------------------------------------------------ */

export const useBattleStore = create<BattleState>((set, get) => ({
  phase: 'SETUP',
  player: createDefaultPlayer('Player', 0),
  opponent: createDefaultPlayer('Opponent', 1),
  currentGateCardOnField: null,
  battleMessage: '',

  startBattle: () => {
    set({
      phase: 'PLACE_GATE',
      player: createDefaultPlayer('Player', 0),
      opponent: createDefaultPlayer('Opponent', 1),
      currentGateCardOnField: null,
      battleMessage: 'Place your Gate Cards!',
    });
  },

  setPhase: (phase) => set({ phase }),

  placeGateCard: (gateCardId) => {
    const { player } = get();
    // Mark card as placed (remove from hand)
    const remaining = player.gateCards.filter((c) => c.id !== gateCardId);
    set({
      player: { ...player, gateCards: remaining },
      phase: remaining.length === 0 ? 'SELECT_BAKUGAN' : 'PLACE_GATE',
    });
  },

  selectBakugan: (index) => {
    const { player } = get();
    set({
      player: { ...player, currentBakuganIndex: index },
      phase: 'AIM',
    });
  },

  throwBakugan: (_bakuganId, _force) => {
    set({ phase: 'FIELD_MOVEMENT', battleMessage: 'Steer your Bakugan!' });
  },

  standBakugan: (bakuganId, gateCardId, playerId) => {
    const state = get();
    const who = playerId === 0 ? 'player' : 'opponent';
    const bakugan = state[who].bakugan.find((b) => b.id === bakuganId);
    const bakName = bakugan?.name ?? 'Bakugan';

    set({
      phase: 'STAND',
      currentGateCardOnField: gateCardId,
      battleMessage: `${bakName} stands on Gate Card!`,
    });
  },

  triggerBattle: (_gateCardId, _p1BakuganId, _p2BakuganId) => {
    set({
      phase: 'BATTLE_TRIGGER',
      battleMessage: 'BATTLE!',
    });
  },

  resolveBattle: (winnerPlayerId, _gateCardId) => {
    const state = get();
    const who = winnerPlayerId === 0 ? 'player' : 'opponent';
    const winner = state[who];

    set({
      [who]: {
        ...winner,
        gateCardsWon: winner.gateCardsWon + 1,
      },
      phase: 'SELECT_BAKUGAN',
      battleMessage: `${winner.name} wins the Gate Card!`,
      currentGateCardOnField: null,
    } as Partial<BattleState>);
  },

  updateGPower: (playerId, gPower) => {
    const state = get();
    const who = playerId === 0 ? 'player' : 'opponent';
    set({
      [who]: { ...state[who], gPower },
    } as Partial<BattleState>);
  },

  setBattleMessage: (msg) => set({ battleMessage: msg }),
}));

/* ------------------------------------------------------------------ */
/*  EventBus ↔ Store integration                                        */
/* ------------------------------------------------------------------ */

// Subscribe to Phaser events and update the store
eventBus.on('BAKUGAN_STANDING', (data) => {
  const store = useBattleStore.getState();
  store.standBakugan(data.bakuganId, data.gateCardId, data.playerId);
});

eventBus.on('BATTLE_TRIGGERED', (data) => {
  const store = useBattleStore.getState();
  store.triggerBattle(data.gateCardId, data.player1BakuganId, data.player2BakuganId);
});

eventBus.on('DOUBLE_STAND', (data) => {
  const store = useBattleStore.getState();
  store.resolveBattle(data.playerId, data.gateCardId);
});

eventBus.on('CRITICAL_KO', (data) => {
  const store = useBattleStore.getState();
  store.resolveBattle(data.attackerPlayerId, data.gateCardId);
});

eventBus.on('BAKUGAN_THROWN', (data) => {
  const store = useBattleStore.getState();
  store.throwBakugan(data.bakuganId, data.force);
});

eventBus.on('G_POWER_UPDATED', (data) => {
  const store = useBattleStore.getState();
  store.updateGPower(data.playerId, data.gPower);
});
