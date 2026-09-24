/**
 * Effect Registry — central registry for all effect handlers.
 *
 * Follows the registry pattern: register handlers by EffectType,
 * then apply them by looking up the handler. New effects are added
 * by registering a new handler — no core code changes needed.
 */

import type { EffectHandler } from './types';
import type { EffectType } from '@/data/schemas';
import { addGPower, removeGPower, swapGPower, doubleGPower } from './handlers/g-power';
import { restartBattle, skipBattle, disableOpponent } from './handlers/battle-control';

/* ------------------------------------------------------------------ */
/*  Registry Class                                                      */
/* ------------------------------------------------------------------ */

export class EffectRegistry {
  private handlers = new Map<string, EffectHandler>();

  constructor() {
    this.registerDefaults();
  }

  /**
   * Register an effect handler for a given EffectType.
   */
  register(type: string, handler: EffectHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Get a handler for a given EffectType.
   * Returns undefined if no handler is registered.
   */
  getHandler(type: string): EffectHandler | undefined {
    return this.handlers.get(type);
  }

  /**
   * Check if a handler is registered for a given EffectType.
   */
  hasHandler(type: string): boolean {
    return this.handlers.has(type);
  }

  /**
   * Get all registered effect types.
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /* ------------------------------------------------------------------ */
  /*  Default Registration                                               */
  /* ------------------------------------------------------------------ */

  private registerDefaults(): void {
    // G-Power modifications
    this.register('ADD_G_POWER' as EffectType, addGPower);
    this.register('REMOVE_G_POWER' as EffectType, removeGPower);
    this.register('SWAP_G_POWER' as EffectType, swapGPower);
    this.register('DOUBLE_G_POWER' as EffectType, doubleGPower);

    // Battle control
    this.register('RESTART_BATTLE' as EffectType, restartBattle);
    this.register('SKIP_BATTLE' as EffectType, skipBattle);
    this.register('PREVENT_ABILITY_CARDS' as EffectType, disableOpponent);
  }
}

/* ------------------------------------------------------------------ */
/*  Singleton                                                           */
/* ------------------------------------------------------------------ */

/** Global effect registry instance */
export const effectRegistry = new EffectRegistry();
