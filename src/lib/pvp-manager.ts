/**
 * PvP Manager — orchestrates local PvP and vs-AI battles.
 *
 * Manages turn flow between two players on the same device.
 * Player 1 controls the bottom Bakugan; Player 2 (or AI) controls the top.
 * Turn flow: P1 throw → P2 throw → resolve → repeat.
 */

import type { PvPMode } from '@/stores/pvp-store';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface PvPTurnAction {
  playerId: number;
  action: 'throw' | 'ability_card' | 'pass';
  targetSlot?: number;
  force?: number;
  cardId?: string;
}

export type PvPMatchState =
  | 'lobby'
  | 'selecting_bakugan'
  | 'player1_turn'
  | 'player2_turn'
  | 'resolving'
  | 'battle_engine'
  | 'match_over';

export interface PvPMatchInfo {
  state: PvPMatchState;
  currentPlayer: number;
  turnNumber: number;
  gateCardsWon: [number, number];
  bakuganUsed: [number, number];
}

/* ------------------------------------------------------------------ */
/*  PvPManager Class                                                    */
/* ------------------------------------------------------------------ */

export class PvPManager {
  private mode: PvPMode;
  private state: PvPMatchState = 'lobby';
  private currentPlayer: number = 0;
  private turnNumber: number = 1;
  private gateCardsWon: [number, number] = [0, 0];
  private bakuganUsed: [number, number] = [0, 0];
  private pendingActions: PvPTurnAction[] = [];
  private onStateChange?: (info: PvPMatchInfo) => void;
  private turnCallbacks: Map<number, (action: PvPTurnAction) => void> = new Map();

  constructor(mode: PvPMode) {
    this.mode = mode;
  }

  /* ================================================================== */
  /*  Lifecycle                                                          */
  /* ================================================================== */

  /** Start a new match */
  startMatch(): PvPMatchInfo {
    this.state = 'selecting_bakugan';
    this.currentPlayer = 0;
    this.turnNumber = 1;
    this.gateCardsWon = [0, 0];
    this.bakuganUsed = [0, 0];
    this.pendingActions = [];
    this.turnCallbacks.clear();

    const info = this.getInfo();
    this.emitChange(info);
    return info;
  }

  /** Register a callback for when a specific player needs to act */
  onTurnNeeded(playerId: number, callback: (action: PvPTurnAction) => void): void {
    this.turnCallbacks.set(playerId, callback);
  }

  /* ================================================================== */
  /*  Turn Management                                                    */
  /* ================================================================== */

  /**
   * Submit a turn action for the given player.
   * If both players have acted, resolves the turn.
   */
  submitAction(action: PvPTurnAction): void {
    this.pendingActions.push(action);

    // If this is local PvP, auto-advance to the next player
    if (this.mode === 'local') {
      this.handleLocalTurnFlow(action);
    } else {
      // AI mode: immediately generate AI action after player acts
      this.handleAITurnFlow(action);
    }
  }

  /**
   * Advance to the next turn explicitly.
   */
  advanceTurn(): void {
    if (this.pendingActions.length >= 2) {
      this.resolveTurn();
    } else {
      // Switch to the next player
      this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
      this.state = this.currentPlayer === 0 ? 'player1_turn' : 'player2_turn';
      this.emitChange(this.getInfo());
    }
  }

  /** Record that a player won a gate card */
  recordGateCardWin(playerId: number): void {
    this.gateCardsWon[playerId]++;

    // Check for match end (best of 3: first to 2)
    if (this.gateCardsWon[playerId] >= 2) {
      this.state = 'match_over';
      this.emitChange(this.getInfo());
    }
  }

  /** Record that a bakugan was used by a player */
  recordBakuganUsed(playerId: number): void {
    this.bakuganUsed[playerId]++;
  }

  /* ================================================================== */
  /*  Turn Flow                                                           */
  /* ================================================================== */

  private handleLocalTurnFlow(action: PvPTurnAction): void {
    if (action.playerId === 0 && this.pendingActions.length === 1) {
      // Player 1 just acted → now it's Player 2's turn
      this.currentPlayer = 1;
      this.state = 'player2_turn';
      this.emitChange(this.getInfo());
    } else if (action.playerId === 1 && this.pendingActions.length >= 2) {
      // Player 2 just acted → resolve
      this.resolveTurn();
    }
  }

  private handleAITurnFlow(action: PvPTurnAction): void {
    if (action.playerId === 0) {
      // Human just acted → generate AI response
      const aiAction = this.generateAIAction();
      this.pendingActions.push(aiAction);
      this.resolveTurn();
    }
  }

  private generateAIAction(): PvPTurnAction {
    // Simple AI: random target slot, medium force
    const targetSlot = Math.floor(Math.random() * 6);
    const force = 0.4 + Math.random() * 0.4;

    return {
      playerId: 1,
      action: 'throw',
      targetSlot,
      force,
    };
  }

  private resolveTurn(): void {
    this.state = 'resolving';
    this.emitChange(this.getInfo());

    // After resolution, start the next turn
    this.pendingActions = [];
    this.turnNumber++;
    this.currentPlayer = 0;
    this.state = 'selecting_bakugan';
    this.emitChange(this.getInfo());
  }

  /* ================================================================== */
  /*  Getters                                                             */
  /* ================================================================== */

  getInfo(): PvPMatchInfo {
    return {
      state: this.state,
      currentPlayer: this.currentPlayer,
      turnNumber: this.turnNumber,
      gateCardsWon: [...this.gateCardsWon] as [number, number],
      bakuganUsed: [...this.bakuganUsed] as [number, number],
    };
  }

  getMode(): PvPMode {
    return this.mode;
  }

  getCurrentPlayer(): number {
    return this.currentPlayer;
  }

  getWinner(): number | null {
    if (this.state !== 'match_over') return null;
    if (this.gateCardsWon[0] >= 2) return 0;
    if (this.gateCardsWon[1] >= 2) return 1;
    return null;
  }

  isMatchOver(): boolean {
    return this.state === 'match_over';
  }

  getPendingActions(): PvPTurnAction[] {
    return [...this.pendingActions];
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private emitChange(info: PvPMatchInfo): void {
    this.onStateChange?.(info);
  }

  /** Set a listener for match state changes */
  setOnStateChange(callback: (info: PvPMatchInfo) => void): void {
    this.onStateChange = callback;
  }

  /** Reset the manager for a new match */
  reset(): void {
    this.state = 'lobby';
    this.currentPlayer = 0;
    this.turnNumber = 1;
    this.gateCardsWon = [0, 0];
    this.bakuganUsed = [0, 0];
    this.pendingActions = [];
    this.turnCallbacks.clear();
  }
}
