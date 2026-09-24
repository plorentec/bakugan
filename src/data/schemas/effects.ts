import { z } from 'zod';
import { AttributeSchema } from './attribute';

/**
 * All effect types in the game.
 * Organized by category: G-Power modifications, battle control, movement, special, character-specific, conditional.
 */
export const EffectTypeSchema = z.enum([
  // G-Power modifications
  'ADD_G_POWER',
  'REMOVE_G_POWER',
  'SWAP_G_POWER',
  'DOUBLE_G_POWER',
  'HALVE_G_POWER',
  'SET_G_POWER',

  // Battle control
  'RESTART_BATTLE',
  'SKIP_BATTLE',
  'PREVENT_ABILITY_CARDS',
  'PREVENT_MINIGAME',
  'DOUBLE_MINIGAME_INPUT',

  // Movement
  'INFINITE_STEERING',
  'MOVE_TO_GATE_CARD',
  'REDO_THROW',
  'EXTRA_THROW',
  'SWITCH_BAKUGAN',

  // Special
  'FILL_SPECIAL_METER',
  'CRITICAL_KO',
  'IMMUNE_CRITICAL_KO',
  'LAUNCH_OPPONENT',
  'REMOVE_ALL_OPPONENTS',
  'SWAP_GATE_CARD',
  'RETURN_ABILITY_CARD',

  // Character-specific
  'CHARACTER_G_POWER_BOOST',

  // Conditional
  'CONDITIONAL_BOOST',
  'ATTRIBUTE_COMBO_BOOST',
  'GATE_CARD_OWNERSHIP_BOOST',
  'POSITION_BOOST',

  // Gate Card specific
  'BONUS_TWICE',
]);

export type EffectType = z.infer<typeof EffectTypeSchema>;

/**
 * Target of an effect — who or what it applies to.
 */
export const EffectTargetSchema = z.enum([
  'self',
  'opponent',
  'all_active',
  'field',
  'all_opponents',
]);

export type EffectTarget = z.infer<typeof EffectTargetSchema>;

/**
 * Condition that must be met for an effect to activate.
 * Evaluated at runtime by the effects engine.
 */
export const EffectConditionSchema = z
  .object({
    /** Condition type identifier (e.g. "ATTRIBUTE_MATCH", "GATE_CARD_TIER") */
    type: z.string(),
    /** Human-readable description of the condition */
    description: z.string(),
    /** Value to check against (string, number, array, etc.) */
    value: z.unknown().optional(),
  })
  .optional();

export type EffectCondition = z.infer<typeof EffectConditionSchema>;

/**
 * Timing of when an effect activates during the battle flow.
 */
export const EffectTimingSchema = z.enum([
  'pre_battle',
  'during_battle',
  'post_battle',
  'on_stand',
  'on_throw',
  'passive',
]);

export type EffectTiming = z.infer<typeof EffectTimingSchema>;

/**
 * A single effect definition within an Ability Card or Gate Card.
 * Defines what happens, when, and under what conditions.
 */
export const EffectDefinitionSchema = z.object({
  /** The type of effect to apply */
  type: EffectTypeSchema,
  /** Numeric magnitude if applicable (e.g. +80 G-Power) */
  magnitude: z.number().optional(),
  /** Who the effect targets */
  target: EffectTargetSchema,
  /** Optional condition that gates the effect */
  condition: EffectConditionSchema,
  /** For character-specific effects: which character this applies to */
  character: z.string().optional(),
  /** For attribute-specific effects: which attributes this applies to */
  attributes: z.array(AttributeSchema).optional(),
  /** For gate-card-tier-specific effects */
  gate_card_tier: z.enum(['gold', 'silver', 'copper']).optional(),
  /** When this effect activates during the battle flow */
  timing: EffectTimingSchema.optional(),
});

export type EffectDefinition = z.infer<typeof EffectDefinitionSchema>;
