import { create } from "zustand";
import { DeckSchema, validateDeck } from "@/data/schemas";
import type { Deck, Bakugan, GateCard, AbilityCard } from "@/data/schemas";
import type { GateCardTier, AbilityCardColor } from "@/data/schemas";
import { saveDeck as dbSaveDeck, loadDeck as dbLoadDeck } from "@/lib/db";
import bakuganData from "@/data/raw/bakugan.json";
import gateCardData from "@/data/raw/gate-cards.json";
import abilityCardData from "@/data/raw/ability-cards.json";

// ─── Lookup maps ──────────────────────────────────────────────────────

const gateCardMap = new Map<string, GateCard>(
  gateCardData.map((c) => [c.id, c as GateCard])
);
const abilityCardMap = new Map<string, AbilityCard>(
  abilityCardData.map((c) => [c.id, c as AbilityCard])
);

// ─── Default empty deck ───────────────────────────────────────────────

function createEmptyDeck(): Deck {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `deck-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "My Deck",
    bakugan: [],
    gate_cards: [],
    ability_cards: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ─── Extended validation ──────────────────────────────────────────────

function validateDeckComposition(deck: Deck): string[] {
  const errors: string[] = [];

  // Zod schema validation (lengths)
  const result = DeckSchema.safeParse(deck);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.push(issue.message);
    });
    return errors;
  }

  // Duplicate validation via validateDeck
  const baseResult = validateDeck(deck);
  errors.push(...baseResult.errors);

  // Gate Card tier validation: need 1 Gold, 1 Silver, 1 Copper
  const tierCounts: Record<GateCardTier, number> = { gold: 0, silver: 0, copper: 0 };
  for (const gc of deck.gate_cards) {
    const card = gateCardMap.get(gc.gate_card_id);
    if (card) {
      tierCounts[card.tier]++;
    }
  }
  if (tierCounts.gold !== 1) {
    errors.push(
      tierCounts.gold === 0
        ? "Need 1 Gold Gate Card"
        : `Too many Gold Gate Cards (${tierCounts.gold}, need 1)`
    );
  }
  if (tierCounts.silver !== 1) {
    errors.push(
      tierCounts.silver === 0
        ? "Need 1 Silver Gate Card"
        : `Too many Silver Gate Cards (${tierCounts.silver}, need 1)`
    );
  }
  if (tierCounts.copper !== 1) {
    errors.push(
      tierCounts.copper === 0
        ? "Need 1 Copper Gate Card"
        : `Too many Copper Gate Cards (${tierCounts.copper}, need 1)`
    );
  }

  // Ability Card color validation: need 1 Red, 1 Green, 1 Blue
  const colorCounts: Record<AbilityCardColor, number> = { red: 0, green: 0, blue: 0 };
  for (const ac of deck.ability_cards) {
    const card = abilityCardMap.get(ac.ability_card_id);
    if (card) {
      colorCounts[card.color]++;
    }
  }
  if (colorCounts.red !== 1) {
    errors.push(
      colorCounts.red === 0
        ? "Need 1 Red Ability Card"
        : `Too many Red Ability Cards (${colorCounts.red}, need 1)`
    );
  }
  if (colorCounts.green !== 1) {
    errors.push(
      colorCounts.green === 0
        ? "Need 1 Green Ability Card"
        : `Too many Green Ability Cards (${colorCounts.green}, need 1)`
    );
  }
  if (colorCounts.blue !== 1) {
    errors.push(
      colorCounts.blue === 0
        ? "Need 1 Blue Ability Card"
        : `Too many Blue Ability Cards (${colorCounts.blue}, need 1)`
    );
  }

  return errors;
}

// ─── Store interface ──────────────────────────────────────────────────

interface DeckState {
  deck: Deck;
  errors: string[];

  addBakugan: (bakugan: Bakugan) => void;
  removeBakugan: (bakuganId: string) => void;
  addGateCard: (card: GateCard) => void;
  removeGateCard: (gateCardId: string) => void;
  addAbilityCard: (card: AbilityCard) => void;
  removeAbilityCard: (abilityCardId: string) => void;
  validateDeck: () => void;
  loadDeck: () => Promise<void>;
  saveDeck: () => Promise<void>;
  setDeckName: (name: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────

export const useDeckStore = create<DeckState>((set, get) => ({
  deck: createEmptyDeck(),
  errors: [],

  addBakugan: (bakugan: Bakugan) => {
    const { deck } = get();
    if (deck.bakugan.length >= 3) return;

    // No duplicate Bakugan IDs
    if (deck.bakugan.some((b) => b.bakugan_id === bakugan.id)) return;

    set({
      deck: {
        ...deck,
        bakugan: [
          ...deck.bakugan,
          {
            bakugan_id: bakugan.id,
            level: 1,
            current_g_power: bakugan.base_g_power,
            allocated_stats: {
              speed: 0,
              defense: 0,
              control: 0,
              steering: 0,
              magnet: 0,
            },
          },
        ],
        updated_at: new Date().toISOString(),
      },
    });
    get().validateDeck();
  },

  removeBakugan: (bakuganId: string) => {
    const { deck } = get();
    set({
      deck: {
        ...deck,
        bakugan: deck.bakugan.filter((b) => b.bakugan_id !== bakuganId),
        updated_at: new Date().toISOString(),
      },
    });
    get().validateDeck();
  },

  addGateCard: (card: GateCard) => {
    const { deck } = get();
    if (deck.gate_cards.length >= 3) return;
    if (deck.gate_cards.some((g) => g.gate_card_id === card.id)) return;

    set({
      deck: {
        ...deck,
        gate_cards: [...deck.gate_cards, { gate_card_id: card.id }],
        updated_at: new Date().toISOString(),
      },
    });
    get().validateDeck();
  },

  removeGateCard: (gateCardId: string) => {
    const { deck } = get();
    set({
      deck: {
        ...deck,
        gate_cards: deck.gate_cards.filter((g) => g.gate_card_id !== gateCardId),
        updated_at: new Date().toISOString(),
      },
    });
    get().validateDeck();
  },

  addAbilityCard: (card: AbilityCard) => {
    const { deck } = get();
    if (deck.ability_cards.length >= 3) return;
    if (deck.ability_cards.some((a) => a.ability_card_id === card.id)) return;

    set({
      deck: {
        ...deck,
        ability_cards: [...deck.ability_cards, { ability_card_id: card.id }],
        updated_at: new Date().toISOString(),
      },
    });
    get().validateDeck();
  },

  removeAbilityCard: (abilityCardId: string) => {
    const { deck } = get();
    set({
      deck: {
        ...deck,
        ability_cards: deck.ability_cards.filter(
          (a) => a.ability_card_id !== abilityCardId
        ),
        updated_at: new Date().toISOString(),
      },
    });
    get().validateDeck();
  },

  validateDeck: () => {
    const { deck } = get();
    const errors = validateDeckComposition(deck);
    set({ errors });
  },

  loadDeck: async () => {
    const saved = await dbLoadDeck();
    if (saved) {
      set({ deck: saved });
      get().validateDeck();
    }
  },

  saveDeck: async () => {
    const { deck, errors } = get();
    if (errors.length > 0) return;
    await dbSaveDeck(deck);
  },

  setDeckName: (name: string) => {
    const { deck } = get();
    set({
      deck: { ...deck, name, updated_at: new Date().toISOString() },
    });
  },
}));
