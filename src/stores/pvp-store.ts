/**
 * PvP Store — manages local PvP and vs-AI battle modes.
 *
 * Tracks which player's turn it is, turn count, and provides
 * actions for turn management and forfeiting.
 */

import { create } from 'zustand';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type PvPMode = 'local' | 'ai';

export interface PvPPlayer {
  id: number;
  name: string;
  isAI: boolean;
  color: 'blue' | 'red';
}

export type PvPTurnPhase =
  | 'SELECT_BAKUGAN'
  | 'THROW'
  | 'RESOLVE'
  | 'WAITING'
  | 'BATTLE';

export interface PvPState {
  /** Active PvP mode */
  mode: PvPMode;
  /** Whether a PvP battle is active */
  isActive: boolean;
  /** The two players */
  players: [PvPPlayer, PvPPlayer];
  /** Which player index (0 or 1) has the current turn */
  currentTurnIndex: number;
  /** Current turn number (1-based) */
  turnCount: number;
  /** Turn timer in seconds remaining */
  turnTimer: number;
  /** Max turn timer */
  turnTimerMax: number;
  /** Current turn phase */
  turnPhase: PvPTurnPhase;
  /** Whether the game is paused (e.g. during handoff between players) */
  isPaused: boolean;
  /** Winner player index (null if no winner yet) */
  winnerIndex: number | null;

  // Actions
  startLocalBattle: () => void;
  startAIBattle: () => void;
  nextTurn: () => void;
  switchPlayer: () => void;
  forfeit: (playerId: number) => void;
  setTurnPhase: (phase: PvPTurnPhase) => void;
  tickTimer: () => void;
  pause: () => void;
  resume: () => void;
  resetPvP: () => void;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                             */
/* ------------------------------------------------------------------ */

const DEFAULT_TIMER_SECONDS = 30;

function createDefaultPlayers(mode: PvPMode): [PvPPlayer, PvPPlayer] {
  return [
    { id: 0, name: 'Player 1', isAI: false, color: 'blue' },
    {
      id: 1,
      name: mode === 'ai' ? 'AI Opponent' : 'Player 2',
      isAI: mode === 'ai',
      color: 'red',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Store                                                               */
/* ------------------------------------------------------------------ */

export const usePvPStore = create<PvPState>((set, get) => ({
  mode: 'ai',
  isActive: false,
  players: createDefaultPlayers('ai'),
  currentTurnIndex: 0,
  turnCount: 1,
  turnTimer: DEFAULT_TIMER_SECONDS,
  turnTimerMax: DEFAULT_TIMER_SECONDS,
  turnPhase: 'SELECT_BAKUGAN',
  isPaused: false,
  winnerIndex: null,

  startLocalBattle: () => {
    set({
      mode: 'local',
      isActive: true,
      players: createDefaultPlayers('local'),
      currentTurnIndex: 0,
      turnCount: 1,
      turnTimer: DEFAULT_TIMER_SECONDS,
      turnTimerMax: DEFAULT_TIMER_SECONDS,
      turnPhase: 'SELECT_BAKUGAN',
      isPaused: false,
      winnerIndex: null,
    });
  },

  startAIBattle: () => {
    set({
      mode: 'ai',
      isActive: true,
      players: createDefaultPlayers('ai'),
      currentTurnIndex: 0,
      turnCount: 1,
      turnTimer: DEFAULT_TIMER_SECONDS,
      turnTimerMax: DEFAULT_TIMER_SECONDS,
      turnPhase: 'SELECT_BAKUGAN',
      isPaused: false,
      winnerIndex: null,
    });
  },

  nextTurn: () => {
    const state = get();
    const nextIndex = state.currentTurnIndex === 0 ? 1 : 0;
    const newTurnCount = nextIndex === 0 ? state.turnCount + 1 : state.turnCount;

    set({
      currentTurnIndex: nextIndex,
      turnCount: newTurnCount,
      turnTimer: DEFAULT_TIMER_SECONDS,
      turnPhase: 'SELECT_BAKUGAN',
    });
  },

  switchPlayer: () => {
    const state = get();
    set({ currentTurnIndex: state.currentTurnIndex === 0 ? 1 : 0 });
  },

  forfeit: (playerId: number) => {
    const state = get();
    const winnerIndex = playerId === 0 ? 1 : 0;
    set({
      isActive: false,
      winnerIndex,
    });
  },

  setTurnPhase: (phase: PvPTurnPhase) => {
    set({ turnPhase: phase });
  },

  tickTimer: () => {
    const state = get();
    if (state.isPaused || !state.isActive) return;

    const newTime = Math.max(0, state.turnTimer - 1);
    set({ turnTimer: newTime });

    // Auto-forfeit on timeout
    if (newTime <= 0) {
      const timedOutPlayer = state.currentTurnIndex;
      state.forfeit(timedOutPlayer);
    }
  },

  pause: () => set({ isPaused: true }),

  resume: () => set({ isPaused: false }),

  resetPvP: () => {
    set({
      mode: 'ai',
      isActive: false,
      players: createDefaultPlayers('ai'),
      currentTurnIndex: 0,
      turnCount: 1,
      turnTimer: DEFAULT_TIMER_SECONDS,
      turnTimerMax: DEFAULT_TIMER_SECONDS,
      turnPhase: 'SELECT_BAKUGAN',
      isPaused: false,
      winnerIndex: null,
    });
  },
}));
