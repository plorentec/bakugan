import { z } from 'zod';
import { SourceMetadataSchema, ConflictRecordSchema } from './source-metadata';
import { EffectDefinitionSchema } from './effects';

/**
 * Ability Card colors determine their role and usage rules.
 * Red: Activate during battle with L/R. Can be used once per battle; unused ones return to deck.
 * Green: Specific use, most variety. Skips battles, gives large boosts. One-use (consumed).
 * Blue: Flat G-Power boosts, often conditional. One-use (consumed).
 */
export const AbilityCardColorSchema = z.enum(['red', 'green', 'blue']);

export type AbilityCardColor = z.infer<typeof AbilityCardColorSchema>;

/**
 * Full Ability Card entity schema.
 * Ability Cards provide powerful one-time effects during battles.
 */
export const AbilityCardSchema = z.object({
  /** Unique identifier (UUID v4) */
  id: z.string().uuid(),
  /** Display name */
  name: z.string().min(1),
  /** Card color determines usage rules and deck composition */
  color: AbilityCardColorSchema,
  /** One or more effects this card produces */
  effects: z.array(EffectDefinitionSchema),
  /** Activation conditions (e.g. "only on Gold Gate Card") */
  conditions: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
        value: z.unknown().optional(),
      })
    )
    .optional(),
  /** Card description text */
  description: z.string(),
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

export type AbilityCard = z.infer<typeof AbilityCardSchema>;
