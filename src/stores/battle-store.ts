import { create } from 'zustand';
import type { Bakugan, GateCard, AbilityCard } from '@/data/schemas';
import bakuganData from '@/data/raw/bakugan.json';
import gateCardData from '@/data/raw/gate-cards.json';
import abilityCardData from '@/data/raw/ability-cards.json';
import { eventBus } from '@/game/events/EventBus';
import { BattleEngine } from '@/battle-engine/state-machine';
import type { BattleContext } from '@/battle-engine/types';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type BattlePhase =
  // Pre-battle phases
  | 'SETUP'
  | 'PLACE_GATE'
  | 'SELECT_BAKUGAN'
  | 'AIM'
  | 'THROW'
  | 'FIELD_MOVEMENT'
  | 'STAND'
  | 'BATTLE_TRIGGER'
  // Battle engine phases
  | 'REVEAL_GATE'
  | 'APPLY_BONUSES'
  | 'ABILITY_WINDOW'
  | 'MINIGAME'
  | 'G_POWER'
  | 'RESOLUTION';

export interface PlayerBattleState {
  id: number;
  name: string;
  bakugan: Bakugan[];
  gateCards: GateCard[];
  abilityCards: AbilityCard[];
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

  // Battle engine state
  battleEngine: BattleEngine | null;
  timer: number;
  maxTimer: number;
  gPowerBars: [number, number];
  battleLog: string[];
  abilityWindowOpen: boolean;
  minigameActive: boolean;
  winnerPlayerId: number | null;
  winReason: string;
  selectedAbilityCard: string | null;

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

  // Battle engine actions
  startBattleEngine: (context: BattleContext) => void;
  playAbilityCard: (playerId: number, cardId: string) => void;
  resolveMinigame: (playerId: number, score: number) => void;
  setSelectedAbilityCard: (cardId: string | null) => void;
  addBattleLog: (message: string) => void;
  resetBattle: () => void;
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
    abilityCards: abilityCardData.slice(0, 3) as unknown as AbilityCard[],
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

  // Battle engine state
  battleEngine: null,
  timer: 0,
  maxTimer: 0,
  gPowerBars: [0, 0],
  battleLog: [],
  abilityWindowOpen: false,
  minigameActive: false,
  winnerPlayerId: null,
  winReason: '',
  selectedAbilityCard: null,

  startBattle: () => {
    set({
      phase: 'PLACE_GATE',
      player: createDefaultPlayer('Player', 0),
      opponent: createDefaultPlayer('Opponent', 1),
      currentGateCardOnField: null,
      battleMessage: 'Place your Gate Cards!',
      battleEngine: null,
      timer: 0,
      maxTimer: 0,
      gPowerBars: [0, 0],
      battleLog: [],
      abilityWindowOpen: false,
      minigameActive: false,
      winnerPlayerId: null,
      winReason: '',
      selectedAbilityCard: null,
    });
  },

  setPhase: (phase) => set({ phase }),

  placeGateCard: (gateCardId) => {
    const { player } = get();
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

  /* ================================================================== */
  /*  Battle Engine Actions                                               */
  /* ================================================================== */

  startBattleEngine: (context: BattleContext) => {
    const engine = new BattleEngine('easy');
    const battleState = engine.startBattle(context);

    set({
      battleEngine: engine,
      phase: battleState.phase as BattlePhase,
      battleMessage: 'Battle started!',
      timer: battleState.timer,
      maxTimer: battleState.maxTimer,
      battleLog: [...battleState.battleLog],
    });
  },

  playAbilityCard: (playerId, cardId) => {
    const { battleEngine } = get();
    if (!battleEngine) return;

    battleEngine.playAbilityCard(playerId, cardId);
    const engineState = battleEngine.getState();
    if (engineState) {
      set({
        phase: engineState.phase as BattlePhase,
        abilityWindowOpen: engineState.abilityWindowOpen,
        battleLog: [...engineState.battleLog],
        selectedAbilityCard: null,
      });
    }
  },

  resolveMinigame: (playerId, score) => {
    const { battleEngine } = get();
    if (!battleEngine) return;

    battleEngine.resolveMinigame(playerId, score);
    const engineState = battleEngine.getState();
    if (engineState) {
      set({
        phase: engineState.phase as BattlePhase,
        minigameActive: engineState.minigameActive,
        battleLog: [...engineState.battleLog],
      });
    }
  },

  setSelectedAbilityCard: (cardId) => set({ selectedAbilityCard: cardId }),

  addBattleLog: (message) => {
    const { battleLog } = get();
    set({ battleLog: [...battleLog, message] });
  },

  resetBattle: () => {
    const { battleEngine } = get();
    if (battleEngine) {
      battleEngine.destroy();
    }
    set({
      phase: 'SETUP',
      battleEngine: null,
      timer: 0,
      maxTimer: 0,
      gPowerBars: [0, 0],
      battleLog: [],
      abilityWindowOpen: false,
      minigameActive: false,
      winnerPlayerId: null,
      winReason: '',
      selectedAbilityCard: null,
      currentGateCardOnField: null,
      battleMessage: '',
    });
  },
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

// Battle engine events
eventBus.on('BATTLE_ENGINE_TIMER_TICK', (data) => {
  const store = useBattleStore.getState();
  store.setBattleMessage(`Time: ${data.timeRemaining.toFixed(1)}s`);
});

eventBus.on('BATTLE_ENGINE_LOG', (data) => {
  const store = useBattleStore.getState();
  store.addBattleLog(data.message);
});

eventBus.on('BATTLE_ENGINE_G_POWER_UPDATE', (data) => {
  const store = useBattleStore.getState();
  // Update G-Power bars
  const total = Math.max(data.player0, data.player1, 1);
  // G-Power bars are set via the engine state, not directly here
  void total;
});

eventBus.on('BATTLE_ENGINE_RESOLVED', (data) => {
  const store = useBattleStore.getState();
  store.setBattleMessage(data.reason);
  store.resolveBattle(data.winnerPlayerId, data.gateCardId);
});
