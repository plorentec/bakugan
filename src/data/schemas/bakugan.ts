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
 * Asset status for tracking asset pipeline progress.
 */
export const AssetStatusSchema = z.enum([
  'MISSING',
  'LICENSE_REVIEW',
  'DOWNLOADED',
  'CONVERTED',
  'INTEGRATED',
]);

export type AssetStatus = z.infer<typeof AssetStatusSchema>;

/**
 * Model paths for different Bakugan states (ball form, battle form, etc.)
 */
export const BakuganModelsSchema = z.object({
  /** Closed Bakugan (ball form) — GLB path */
  ball: z.string().optional(),
  /** Open Bakugan (battle form) — GLB path */
  battle: z.string().optional(),
  /** Legacy OBJ path for backward compatibility */
  obj: z.string().optional(),
  /** FBX source path */
  fbx: z.string().optional(),
  /** DAE/COLLADA source path */
  dae: z.string().optional(),
});

export type BakuganModels = z.infer<typeof BakuganModelsSchema>;

/**
 * Animation paths for Bakugan 3D models.
 */
export const BakuganAnimationsSchema = z.object({
  idle: z.string().optional(),
  transform: z.string().optional(),
  attack: z.string().optional(),
  hit: z.string().optional(),
  victory: z.string().optional(),
  defeat: z.string().optional(),
});

export type BakuganAnimations = z.infer<typeof BakuganAnimationsSchema>;

/**
 * Complete asset references for a Bakugan.
 * Supports multiple sources with priority: Wii > DS > Other > Fan > Placeholder.
 */
export const BakuganAssetsSchema = z.object({
  /** 2D portrait image path */
  portrait: z.string().optional(),
  /** Small thumbnail image path */
  thumbnail: z.string().optional(),
  /** 3D model paths for different states */
  models: BakuganModelsSchema.optional(),
  /** Animation paths */
  animations: BakuganAnimationsSchema.optional(),
  /** Original source of the model (e.g. "DS", "Wii") */
  source: z.string().optional(),
  /** URL to the model source */
  sourceUrl: z.string().optional(),
  /** License status for these assets */
  license: z.string().optional(),
  /** Pipeline status for this asset set */
  status: AssetStatusSchema.optional(),
});

export type BakuganAssets = z.infer<typeof BakuganAssetsSchema>;

/**
 * Full Bakugan entity schema.
 * Each Bakugan has attributes, G-Power range, and 5 stats.
 */
export const BakuganSchema = z.object({
  /** Unique identifier */
  id: z.string().min(1),
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
  /** URL to a reference image (optional) — kept for backward compat */
  image_url: z.string().url().optional(),
  /** Path to 3D model reference (optional) — kept for backward compat */
  model_reference: z.string().optional(),
  /** Complete asset references (new system) */
  assets: BakuganAssetsSchema.optional(),
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
