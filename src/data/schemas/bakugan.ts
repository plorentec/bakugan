import { z } from 'zod';
import { AttributeSchema } from './attribute';
import { SourceMetadataSchema, ConflictRecordSchema } from './source-metadata';

/**
 * The five battle stats for a Bakugan.
 * Each ranges from 0 to 4 (max based on highest printed values in the game).
 * Stats are increased +1 per level-up.
 */
export const BakuganStatsSchema = z.object({
  /** Movement speed. Affects starting speed bonus from fast flick. */
  speed: z.number().min(0).max(4),
  /** Resistance to Critical KOs once stood. Higher = harder to KO. */
  defense: z.number().min(0).max(4),
  /** Control responsiveness. Tighter turns, faster stop-and-turn. */
  control: z.number().min(0).max(4),
  /** How long you can control Bakugan on field before it stops. */
  steering: z.number().min(0).max(4),
  /** Magnet strength. Easier to stand when moving quickly over Gate Card. */
  magnet: z.number().min(0).max(4),
});

export type BakuganStats = z.infer<typeof BakuganStatsSchema>;

/**
 * Full Bakugan entity schema.
 * Each Bakugan has attributes, G-Power range, and 5 stats.
 */
export const BakuganSchema = z.object({
  /** Unique identifier (UUID v4) */
  id: z.string().uuid(),
  /** Display name */
  name: z.string().min(1),
  /** One or more elemental attributes */
  attributes: z.array(AttributeSchema).min(1).max(6),
  /** G-Power at level 1 */
  base_g_power: z.number().min(0).max(999),
  /** Maximum G-Power (base + 250 total growth) */
  max_g_power: z.number().min(0).max(999),
  /** The five battle stats */
  stats: BakuganStatsSchema,
  /** Flavor text or description (optional) */
  description: z.string().optional(),
  /** URL to a reference image (optional) */
  image_url: z.string().url().optional(),
  /** Path to 3D model reference (optional) */
  model_reference: z.string().optional(),
  /** Special shot type name, e.g. "Pyrus Strike" (optional) */
  special_shot: z.string().optional(),
  /** Description of special shot behavior (optional) */
  special_shot_description: z.string().optional(),
  /** Where this data came from */
  source: SourceMetadataSchema,
  /** Any recorded data conflicts from multiple sources */
  conflicts: z.array(ConflictRecordSchema).optional(),
  /** ISO 8601 creation timestamp */
  created_at: z.string().datetime(),
  /** ISO 8601 last-updated timestamp */
  updated_at: z.string().datetime(),
});

export type Bakugan = z.infer<typeof BakuganSchema>;
