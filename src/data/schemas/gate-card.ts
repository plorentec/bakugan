import { z } from 'zod';
import { AttributeSchema } from './attribute';
import { SourceMetadataSchema, ConflictRecordSchema } from './source-metadata';

/**
 * Gate Card tiers determine their role in deck construction and gameplay.
 * Gold: Depicts a Bakugan, bonus applied twice if that Bakugan stands on it.
 * Silver: Various bonuses, no special effects.
 * Copper: All have additional effects (e.g. doubling G-Power, preventing Ability Cards).
 */
export const GateCardTierSchema = z.enum(['gold', 'silver', 'copper']);

export type GateCardTier = z.infer<typeof GateCardTierSchema>;

/**
 * The six minigame types triggered by Gate Card battles.
 * Each tier has specific minigame types:
 * - Gold: Scratch Battle or Spin Battle
 * - Silver: Timing Battle or Pop Battle
 * - Copper: Trace Battle or Bound Battle
 */
export const GateCardBattleTypeSchema = z.enum([
  'scratch',
  'spin',
  'timing',
  'pop',
  'trace',
  'bound',
]);

export type GateCardBattleType = z.infer<typeof GateCardBattleTypeSchema>;

/**
 * G-Power bonuses provided by a Gate Card for each attribute.
 * Values are additive to the Bakugan's effective G-Power.
 */
export const GateCardBonusesSchema = z.object({
  pyrus: z.number(),
  aquos: z.number(),
  subterra: z.number(),
  haos: z.number(),
  darkus: z.number(),
  ventus: z.number(),
});

export type GateCardBonuses = z.infer<typeof GateCardBonusesSchema>;

/**
 * Optional effect on Copper Gate Cards.
 * All Copper cards have an effect; Gold cards have BONUS_TWICE.
 */
export const GateCardEffectSchema = z
  .object({
    /** Effect type identifier */
    type: z.string(),
    /** Human-readable description of the effect */
    description: z.string(),
    /** Numeric magnitude if applicable (e.g. +100 G) */
    magnitude: z.number().optional(),
    /** Condition string if the effect has activation conditions */
    condition: z.string().optional(),
  })
  .optional();

export type GateCardEffect = z.infer<typeof GateCardEffectSchema>;

/**
 * Full Gate Card entity schema.
 * Gate Cards are placed on the field and trigger battles when opposing Bakugan stand on them.
 */
export const GateCardSchema = z.object({
  /** Unique identifier (UUID v4) */
  id: z.string().uuid(),
  /** Display name */
  name: z.string().min(1),
  /** Tier determines deck composition rules and special effects */
  tier: GateCardTierSchema,
  /** Minigame type triggered by this card's battle */
  battle_type: GateCardBattleTypeSchema,
  /** G-Power bonuses for each attribute when standing on this card */
  bonuses: GateCardBonusesSchema,
  /** Optional effect (always present for Copper cards) */
  effect: GateCardEffectSchema,
  /** Name of the depicted Bakugan (Gold cards only — bonus applied twice if that Bakugan stands on it) */
  depicted_bakugan: z.string().optional(),
  /** Flavor text or description (optional) */
  description: z.string().optional(),
  /** URL to a reference image (optional) */
  image_url: z.string().url().optional(),
  /** Where this data came from */
  source: SourceMetadataSchema,
  /** Any recorded data conflicts from multiple sources */
  conflicts: z.array(ConflictRecordSchema).optional(),
  /** ISO 8601 creation timestamp */
  created_at: z.string().datetime(),
  /** ISO 8601 last-updated timestamp */
  updated_at: z.string().datetime(),
});

export type GateCard = z.infer<typeof GateCardSchema>;
