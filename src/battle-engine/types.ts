/**
 * Battle Engine Types — pure TypeScript, no React imports.
 *
 * Defines the state machine phases, player state, and battle context
 * for the Bakugan battle system.
 */

import type { Bakugan, GateCard, AbilityCard, Attribute } from '@/data/schemas';

/* ------------------------------------------------------------------ */
/*  Battle Phases                                                       */
/* ------------------------------------------------------------------ */

export const BattlePhaseValues = [
  'SETUP',
  'REVEAL_GATE',
  'APPLY_BONUSES',
  'ABILITY_WINDOW',
  'MINIGAME',
  'G_POWER',
  'RESOLUTION',
] as const;

export type BattlePhase = (typeof BattlePhaseValues)[number];

/** Valid phase transitions (from → to[]) */
export const PHASE_TRANSITIONS: Record<BattlePhase, readonly BattlePhase[]> = {
  SETUP: ['REVEAL_GATE'],
  REVEAL_GATE: ['APPLY_BONUSES'],
  APPLY_BONUSES: ['ABILITY_WINDOW'],
  ABILITY_WINDOW: ['MINIGAME'],
  MINIGAME: ['G_POWER'],
  G_POWER: ['RESOLUTION'],
  RESOLUTION: [],
};

/* ------------------------------------------------------------------ */
/*  Player Battle State                                                 */
/* ------------------------------------------------------------------ */

export interface BattlePlayerState {
  /** Player ID (0 = human, 1 = opponent/AI) */
  id: number;
  /** Display name */
  name: string;
  /** The Bakugan in this battle */
  bakugan: Bakugan;
  /** Active attribute */
  attribute: Attribute;
  /** Base G-Power (from Bakugan data) */
  baseGPower: number;
  /** G-Power bonus from Gate Card */
  gateBonus: number;
  /** G-Power bonus from Ability Card(s) */
  abilityBonus: number;
  /** G-Power earned from minigame */
  minigameGPower: number;
  /** Total effective G-Power */
  totalGPower: number;
  /** Available ability cards */
  abilityCards: AbilityCard[];
  /** The ability card played this battle (null if passed) */
  playedAbilityCard: AbilityCard | null;
  /** Minigame result (0.0–1.0) */
  minigameResult: number;
  /** Whether opponent has been disabled from playing ability cards */
  abilityCardDisabled: boolean;
}

/* ------------------------------------------------------------------ */
/*  Battle State                                                        */
/* ------------------------------------------------------------------ */

export interface BattleState {
  /** Current phase of the battle */
  phase: BattlePhase;
  /** Turn number (incremented per battle) */
  turn: number;
  /** Both players' battle state */
  players: [BattlePlayerState, BattlePlayerState];
  /** The Gate Card this battle is on */
  currentGateCard: GateCard;
  /** Time remaining in current phase (seconds) */
  timer: number;
  /** Max timer value (seconds) */
  maxTimer: number;
  /** G-Power bars [player0, player1] normalized to 0.0–1.0 range */
  gPowerBars: [number, number];
  /** Log of battle events */
  battleLog: string[];
  /** Whether the ability card window is currently open */
  abilityWindowOpen: boolean;
  /** Whether a minigame is currently active */
  minigameActive: boolean;
  /** Winner player ID (null if battle not resolved) */
  winner: number | null;
  /** Reason for win */
  winReason: string;
  /** Whether battle has ended */
  isComplete: boolean;
}

/* ------------------------------------------------------------------ */
/*  Battle Context (input to startBattle)                               */
/* ------------------------------------------------------------------ */

export interface BattleContext {
  /** Player 0 (human) Bakugan */
  playerBakugan: Bakugan;
  /** Player 1 (opponent) Bakugan */
  opponentBakugan: Bakugan;
  /** Active attribute for each player */
  playerAttribute: Attribute;
  opponentAttribute: Attribute;
  /** Player 0 ability cards */
  playerAbilityCards: AbilityCard[];
  /** Player 1 (AI) ability cards */
  opponentAbilityCards: AbilityCard[];
  /** The Gate Card the battle is on */
  gateCard: GateCard;
  /** Battle turn number */
  turn: number;
  /** AI difficulty */
  aiDifficulty: 'easy' | 'normal' | 'hard';
  /** PvP mode: 'ai' for single player, 'local' for local PvP */
  pvpMode?: 'ai' | 'local';
}

/* ------------------------------------------------------------------ */
/*  G-Power Calculation                                                 */
/* ------------------------------------------------------------------ */

export interface GPowerBreakdown {
  base: number;
  levelGrowth: number;
  gateBonus: number;
  abilityBonus: number;
  minigameBonus: number;
  total: number;
}
