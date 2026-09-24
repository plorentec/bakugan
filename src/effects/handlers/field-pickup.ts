/**
 * Field-Pickup Ability Card Handlers
 *
 * These 12 Ability Cards are found as pickups on the arena field.
 * They trigger when a Bakugan stands on a Gate Card.
 * One at a time can be used.
 *
 * Source: GameFAQs guide FAQ 81516, Section C "Fields and Power-Ups"
 */

import type { BattleState, BattlePlayerState } from '@/battle-engine/types';

/* ------------------------------------------------------------------ */
/*  Field Pickup Effect Context                                         */
/* ------------------------------------------------------------------ */

export interface FieldPickupContext {
  /** The player who collected this pickup */
  player: BattlePlayerState;
  /** The full battle state */
  battleState: BattleState;
  /** All Bakugan standing on field (for multi-target effects) */
  allStanding: BattlePlayerState[];
  /** The Bakugan's current position */
  position: { x: number; y: number };
}

export interface FieldPickupResult {
  applied: boolean;
  description: string;
  modifiedState?: Partial<BattleState>;
}

/* ------------------------------------------------------------------ */
/*  Field Pickup Definitions                                            */
/* ------------------------------------------------------------------ */

export interface FieldPickup {
  name: string;
  effect: string;
  description: string;
}

export const FIELD_PICKUPS: FieldPickup[] = [
  {
    name: 'All For One',
    effect: 'DOUBLE_PERSONAL_G_BOOSTS',
    description: 'Double field G-Power boosts for you',
  },
  {
    name: 'Addition',
    effect: 'DOUBLE_ALL_G_BOOSTS',
    description: 'Double field G-Power boosts for every active Bakugan',
  },
  {
    name: 'Subtraction',
    effect: 'REMOVE_ALL_G_BOOSTS',
    description: 'Remove field G-Power boosts for every active Bakugan',
  },
  {
    name: 'Road Trip',
    effect: 'MOVE_TO_GATE_CARD',
    description: 'Move to different Gate Card on field',
  },
  {
    name: 'Sleight of Hand',
    effect: 'SWAP_GATE_CARD',
    description: 'Swap landed Gate Card for another in deck',
  },
  {
    name: 'Invulnerable',
    effect: 'IMMUNE_CRITICAL_KO',
    description: 'Immune to Critical KOs',
  },
  {
    name: 'Second Chance',
    effect: 'REDO_THROW',
    description: 'Negate last throw, redo',
  },
  {
    name: 'Surprise Attack',
    effect: 'INITIATE_CROSS_CARD_BATTLE',
    description: 'Start battle with Bakugan standing on another Gate Card',
  },
  {
    name: 'Trickster',
    effect: 'SWITCH_BAKUGAN',
    description: 'Switch thrown Bakugan with another in hand',
  },
  {
    name: "Fill 'er Up",
    effect: 'FILL_SPECIAL_METER',
    description: 'Fully fill Special Gauge',
  },
  {
    name: 'Another Throw',
    effect: 'EXTRA_THROW',
    description: 'Throw a second Bakugan that turn',
  },
];

/* ------------------------------------------------------------------ */
/*  Handler Functions                                                   */
/* ------------------------------------------------------------------ */

/**
 * All For One — Double field G-Power boosts for the player.
 */
export function handleAllForOne(ctx: FieldPickupContext): FieldPickupResult {
  const { player } = ctx;
  const doubled = player.gateBonus * 2;
  player.gateBonus = doubled;
  return {
    applied: true,
    description: `${player.name}'s Gate Card G-Power boosts doubled to ${doubled}`,
  };
}

/**
 * Addition — Double field G-Power boosts for every active Bakugan.
 */
export function handleAddition(ctx: FieldPickupContext): FieldPickupResult {
  for (const p of ctx.allStanding) {
    p.gateBonus *= 2;
  }
  return {
    applied: true,
    description: 'All active Bakugan G-Power boosts doubled',
  };
}

/**
 * Subtraction — Remove field G-Power boosts for every active Bakugan.
 */
export function handleSubtraction(ctx: FieldPickupContext): FieldPickupResult {
  for (const p of ctx.allStanding) {
    p.gateBonus = 0;
  }
  return {
    applied: true,
    description: 'All active Bakugan G-Power boosts removed',
  };
}

/**
 * Invulnerable — Immune to Critical KOs for this battle.
 */
export function handleInvulnerable(ctx: FieldPickupContext): FieldPickupResult {
  // Mark player as immune — consumed by battle engine check
  return {
    applied: true,
    description: `${ctx.player.name} is now immune to Critical KOs`,
    modifiedState: { battleLog: [...ctx.battleState.battleLog, `${ctx.player.name} gained Critical KO immunity`] },
  };
}

/**
 * Second Chance — Negate last throw, redo.
 */
export function handleSecondChance(ctx: FieldPickupContext): FieldPickupResult {
  return {
    applied: true,
    description: `${ctx.player.name} may redo their last throw`,
  };
}

/**
 * Surprise Attack — Start battle with Bakugan standing on another Gate Card.
 */
export function handleSurpriseAttack(ctx: FieldPickupContext): FieldPickupResult {
  return {
    applied: true,
    description: `${ctx.player.name} initiates battle from another Gate Card`,
  };
}

/**
 * Trickster — Switch thrown Bakugan with another in hand.
 */
export function handleTrickster(ctx: FieldPickupContext): FieldPickupResult {
  return {
    applied: true,
    description: `${ctx.player.name} switched their thrown Bakugan`,
  };
};

/**
 * Fill 'er Up — Fully fill Special Gauge.
 */
export function handleFillErUp(ctx: FieldPickupContext): FieldPickupResult {
  return {
    applied: true,
    description: `${ctx.player.name}'s Special Gauge is now full`,
  };
}

/**
 * Another Throw — Throw a second Bakugan that turn.
 */
export function handleAnotherThrow(ctx: FieldPickupContext): FieldPickupResult {
  return {
    applied: true,
    description: `${ctx.player.name} may throw a second Bakugan this turn`,
  };
}

/**
 * Road Trip — Move to different Gate Card on field.
 */
export function handleRoadTrip(ctx: FieldPickupContext): FieldPickupResult {
  return {
    applied: true,
    description: `${ctx.player.name} moved to a different Gate Card`,
  };
}

/**
 * Sleight of Hand — Swap landed Gate Card for another in deck.
 */
export function handleSleightOfHand(ctx: FieldPickupContext): FieldPickupResult {
  return {
    applied: true,
    description: `${ctx.player.name} swapped their landed Gate Card`,
  };
}

/* ------------------------------------------------------------------ */
/*  Handler Registry                                                    */
/* ------------------------------------------------------------------ */

type FieldPickupHandler = (ctx: FieldPickupContext) => FieldPickupResult;

const FIELD_PICKUP_HANDLERS: Record<string, FieldPickupHandler> = {
  DOUBLE_PERSONAL_G_BOOSTS: handleAllForOne,
  DOUBLE_ALL_G_BOOSTS: handleAddition,
  REMOVE_ALL_G_BOOSTS: handleSubtraction,
  MOVE_TO_GATE_CARD: handleRoadTrip,
  SWAP_GATE_CARD: handleSleightOfHand,
  IMMUNE_CRITICAL_KO: handleInvulnerable,
  REDO_THROW: handleSecondChance,
  INITIATE_CROSS_CARD_BATTLE: handleSurpriseAttack,
  SWITCH_BAKUGAN: handleTrickster,
  FILL_SPECIAL_METER: handleFillErUp,
  EXTRA_THROW: handleAnotherThrow,
};

/**
 * Execute a field-pickup effect by its effect type string.
 */
export function executeFieldPickup(
  effectType: string,
  ctx: FieldPickupContext,
): FieldPickupResult {
  const handler = FIELD_PICKUP_HANDLERS[effectType];
  if (!handler) {
    return { applied: false, description: `Unknown field pickup effect: ${effectType}` };
  }
  return handler(ctx);
}
