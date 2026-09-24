import { z } from 'zod';
import { AttributeSchema } from './attribute';
import { SourceMetadataSchema } from './source-metadata';

/**
 * Arena hazard types — physical hazards placed on the field.
 * Each affects movement or G-Power for non-favored attributes.
 */
export const ArenaHazardTypeSchema = z.enum([
  'fountain',       // Aquos: pushes back non-Aquos or launches up
  'river',          // Aquos: circular river moves non-Aquos counterclockwise
  'quicksand',      // Subterra: slows non-Subterra
  'vent',           // Ventus: blows non-Ventus up and away
  'tornado',        // Ventus: picks up and flings non-Ventus randomly
  'geyser',         // Pyrus: repels non-Pyrus or launches up
  'lava_line',      // Pyrus: non-Pyrus lose 10 G-Power and get launched
  'floating_cube',  // Haos: sucks in and launches non-Haos randomly
  'warp_strip',     // Haos: teleports all Bakugan to opposite side
  'lightning',      // Darkus: non-Darkus struck lose 50 G-Power and get launched
  'trampoline',     // Generic: launches in facing direction
  'boost_pad',      // Generic: shoots in facing direction along ground
]);

export type ArenaHazardType = z.infer<typeof ArenaHazardTypeSchema>;

/**
 * A hazard on the arena field with position, size, and effect.
 */
export const ArenaHazardSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Type of hazard */
  type: ArenaHazardTypeSchema,
  /** Center position on the field */
  position: z.object({ x: z.number(), y: z.number() }),
  /** Optional dimensions (default varies by hazard type) */
  size: z.object({ width: z.number(), height: z.number() }).optional(),
  /** Human-readable description of the hazard's effect */
  effect: z.string(),
  /** Which attributes are affected (empty = all) */
  affected_attributes: z.array(AttributeSchema).optional(),
  /** G-Power penalty applied when affected (e.g. -10 for lava) */
  g_power_penalty: z.number().optional(),
  /** Launch force multiplier (for hazards that push Bakugan) */
  launch_force: z.number().optional(),
});

export type ArenaHazard = z.infer<typeof ArenaHazardSchema>;

/** Types of spawn points on an arena */
export const ArenaSpawnPointTypeSchema = z.enum([
  'power_up',
  'gate_card_slot',
  'bakugan_start',
]);

/** Spawn point types */
export type ArenaSpawnPointType = z.infer<typeof ArenaSpawnPointTypeSchema>;

/** Power-up types that can spawn at power_up points */
export const PowerUpTypeSchema = z.enum([
  'g_power_boost',    // +30 G-Power
  'experience_boost', // More XP after brawl (Story only)
  's_power_boost',    // Partial or full Special Meter fill
]);

export type PowerUpType = z.infer<typeof PowerUpTypeSchema>;

/**
 * A spawn point on the arena field.
 */
export const ArenaSpawnPointSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Type of spawn point */
  type: ArenaSpawnPointTypeSchema,
  /** Position on the field */
  position: z.object({ x: z.number(), y: z.number() }),
  /** For power_up type: what kind of power-up spawns here */
  power_up_type: PowerUpTypeSchema.optional(),
});

export type ArenaSpawnPoint = z.infer<typeof ArenaSpawnPointSchema>;

/**
 * Full Arena schema — a battlefield with hazards and power-ups.
 * 7 elemental arenas + Standard arena (no hazards).
 */
export const ArenaSchema = z.object({
  /** Unique identifier (UUID v4) */
  id: z.string().uuid(),
  /** Arena display name */
  name: z.string().min(1),
  /** Description of the arena */
  description: z.string(),
  /** True for the Standard arena (no hazards) */
  is_standard: z.boolean(),
  /** Attribute that gets a G-Power advantage in this arena */
  advantage_attribute: AttributeSchema.optional(),
  /** Attribute that gets a G-Power disadvantage in this arena */
  disadvantage_attribute: AttributeSchema.optional(),
  /** Field dimensions in game units */
  field_size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  /** Hazards placed on the field */
  hazards: z.array(ArenaHazardSchema),
  /** Spawn points for power-ups, gate cards, and Bakugan */
  spawn_points: z.array(ArenaSpawnPointSchema),
  /** Number of Gate Card slots (4-8) */
  gate_card_slots: z.number().min(4).max(8),
  /** Difficulty levels available (1-3, affects power-up/platform placements) */
  difficulty_levels: z.number().min(1).max(3),
  /** Where this data came from */
  source: SourceMetadataSchema,
  /** ISO 8601 creation timestamp */
  created_at: z.string().datetime(),
  /** ISO 8601 last-updated timestamp */
  updated_at: z.string().datetime(),
});

export type Arena = z.infer<typeof ArenaSchema>;
