/**
 * WebSocket Stub — interface for future multiplayer implementation.
 *
 * Provides the API surface for a WebSocket connection without
 * actually connecting to a server. This allows future online PvP
 * to slot in without changing consuming code.
 */

/* ------------------------------------------------------------------ */
/*  Event Types                                                         */
/* ------------------------------------------------------------------ */

export type WSEventType =
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'BATTLE_START'
  | 'MOVE_MADE'
  | 'BATTLE_END'
  | 'HEARTBEAT'
  | 'ERROR'
  | 'MATCH_FOUND'
  | 'MATCH_CANCELLED';

export interface WSMessage {
  type: WSEventType;
  payload: unknown;
  timestamp: number;
}

export interface WSPlayerInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface WSMatchData {
  matchId: string;
  players: [WSPlayerInfo, WSPlayerInfo];
  mode: 'ranked' | 'casual';
}

export interface WSMoveData {
  matchId: string;
  playerId: string;
  action: string;
  data: unknown;
}

/* ------------------------------------------------------------------ */
/*  Callbacks                                                           */
/* ------------------------------------------------------------------ */

export type WSCallback = (message: WSMessage) => void;

/* ------------------------------------------------------------------ */
/*  WebSocketManager Class (Stub)                                       */
/* ------------------------------------------------------------------ */

export class WebSocketManager {
  private connected: boolean = false;
  private callbacks: Map<WSEventType, Set<WSCallback>> = new Map();
  private allCallbacks: Set<WSCallback> = new Set();
  private url: string;

  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }

  /* ================================================================== */
  /*  Connection                                                          */
  /* ================================================================== */

  /** Simulate connecting to the server */
  connect(): Promise<void> {
    if (this.connected) {
      console.warn('[WS Stub] Already connected');
      return Promise.resolve();
    }

    console.log(`[WS Stub] Connecting to ${this.url}...`);
    this.connected = true;
    console.log('[WS Stub] Connected (simulated)');

    this.emit('HEARTBEAT', { status: 'connected' });
    return Promise.resolve();
  }

  /** Simulate disconnecting from the server */
  disconnect(): void {
    if (!this.connected) return;

    console.log('[WS Stub] Disconnecting...');
    this.connected = false;
    this.callbacks.clear();
    this.allCallbacks.clear();
    console.log('[WS Stub] Disconnected (simulated)');
  }

  /** Check if connected */
  isConnected(): boolean {
    return this.connected;
  }

  /* ================================================================== */
  /*  Sending                                                             */
  /* ================================================================== */

  /** Send a message (stub — logs to console) */
  send(type: WSEventType, payload: unknown): void {
    if (!this.connected) {
      console.warn('[WS Stub] Cannot send — not connected');
      return;
    }

    const message: WSMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    console.log('[WS Stub] Sending:', message);

    // In a real implementation, this would write to a WebSocket
    // For now, we echo back as if the server acknowledged
    this.emit('HEARTBEAT', { ack: true, originalType: type });
  }

  /* ================================================================== */
  /*  Receiving                                                           */
  /* ================================================================== */

  /** Register a callback for a specific event type */
  on(type: WSEventType, callback: WSCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    this.callbacks.get(type)!.add(callback);
  }

  /** Register a callback for all messages */
  onMessage(callback: WSCallback): void {
    this.allCallbacks.add(callback);
  }

  /** Unregister a callback for a specific event type */
  off(type: WSEventType, callback: WSCallback): void {
    this.callbacks.get(type)?.delete(callback);
  }

  /** Unregister a global message callback */
  offMessage(callback: WSCallback): void {
    this.allCallbacks.delete(callback);
  }

  /* ================================================================== */
  /*  Test helpers (for unit tests and manual testing)                    */
  /* ================================================================== */

  /**
   * Simulate receiving a message from the server.
   * Useful for testing event handlers.
   */
  simulateIncoming(type: WSEventType, payload: unknown): void {
    const message: WSMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    this.emit(type, payload);
    for (const cb of this.allCallbacks) {
      cb(message);
    }
  }

  /* ================================================================== */
  /*  Private                                                             */
  /* ================================================================== */

  private emit(type: WSEventType, payload: unknown): void {
    const listeners = this.callbacks.get(type);
    if (listeners) {
      const message: WSMessage = {
        type,
        payload,
        timestamp: Date.now(),
      };
      for (const cb of listeners) {
        cb(message);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton                                                           */
/* ------------------------------------------------------------------ */

/** Shared WebSocket manager instance for the application */
export const wsManager = new WebSocketManager();
