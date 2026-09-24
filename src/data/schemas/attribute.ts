import { z } from 'zod';

/**
 * The six elemental attributes in Bakugan Battle Brawlers.
 * Each Bakugan has at least one attribute; some can have multiple.
 */
export const AttributeSchema = z.enum([
  'pyrus',
  'aquos',
  'subterra',
  'haos',
  'darkus',
  'ventus',
]);

export type Attribute = z.infer<typeof AttributeSchema>;

/** Array of 1-6 attributes for a Bakugan (multi-attribute Bakugan exist) */
export const AttributesArraySchema = z.array(AttributeSchema).min(1).max(6);

export type AttributesArray = z.infer<typeof AttributesArraySchema>;
