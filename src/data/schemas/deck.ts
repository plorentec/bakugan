import { z } from 'zod';

/**
 * Deck schema — the 3+3+3 rule.
 * A valid deck contains:
 * - Exactly 3 Bakugan (no duplicate Bakugan IDs)
 * - Exactly 3 Gate Cards (1 Gold, 1 Silver, 1 Copper)
 * - Exactly 3 Ability Cards (1 Red, 1 Green, 1 Blue)
 */
export const DeckSchema = z.object({
  /** Unique identifier (UUID v4) */
  id: z.string().min(1),
  /** Deck name */
  name: z.string().min(1),
  /** Exactly 3 Bakugan, each with level, current G-Power, and allocated stats */
  bakugan: z
    .array(
      z.object({
        /** Reference to Bakugan.id */
        bakugan_id: z.string().min(1),
        /** Current level (1-20) */
        level: z.number().min(1).max(20),
        /** Current G-Power (base + level increments + power-ups) */
        current_g_power: z.number().min(0),
        /** Stats allocated by the player through leveling (0-4 each) */
        allocated_stats: z.object({
          speed: z.number().min(0).max(4),
          defense: z.number().min(0).max(4),
          control: z.number().min(0).max(4),
          steering: z.number().min(0).max(4),
          magnet: z.number().min(0).max(4),
        }),
      })
    )
    .length(3, 'El mazo debe tener exactamente 3 Bakugan'),
  /** Exactly 3 Gate Cards (1 Gold, 1 Silver, 1 Copper — validated against GateCard.tier) */
  gate_cards: z
    .array(
      z.object({
        /** Reference to GateCard.id */
        gate_card_id: z.string().min(1),
      })
    )
    .length(3, 'El mazo debe tener exactamente 3 Gate Cards'),
  /** Exactly 3 Ability Cards (1 Red, 1 Green, 1 Blue — validated against AbilityCard.color) */
  ability_cards: z
    .array(
      z.object({
        /** Reference to AbilityCard.id */
        ability_card_id: z.string().min(1),
      })
    )
    .length(3, 'El mazo debe tener exactamente 3 Ability Cards'),
  /** ISO 8601 creation timestamp */
  created_at: z.string().datetime(),
  /** ISO 8601 last-updated timestamp */
  updated_at: z.string().datetime(),
});

export type Deck = z.infer<typeof DeckSchema>;

/**
 * Validates deck composition rules beyond Zod schema:
 * - No duplicate Bakugan IDs
 * - (Gate Card tier and Ability Card color validation requires looking up card data)
 */
export function validateDeck(deck: Deck): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // No duplicate Bakugan IDs
  const bakuganKeys = deck.bakugan.map((b) => b.bakugan_id);
  const uniqueBakugan = new Set(bakuganKeys);
  if (uniqueBakugan.size !== bakuganKeys.length) {
    errors.push('Bakugan duplicados en el mazo');
  }

  // No duplicate Gate Card IDs
  const gateKeys = deck.gate_cards.map((g) => g.gate_card_id);
  const uniqueGates = new Set(gateKeys);
  if (uniqueGates.size !== gateKeys.length) {
    errors.push('Gate Cards duplicadas en el mazo');
  }

  // No duplicate Ability Card IDs
  const abilityKeys = deck.ability_cards.map((a) => a.ability_card_id);
  const uniqueAbilities = new Set(abilityKeys);
  if (uniqueAbilities.size !== abilityKeys.length) {
    errors.push('Ability Cards duplicadas en el mazo');
  }

  return { valid: errors.length === 0, errors };
}
