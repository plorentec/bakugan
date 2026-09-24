import { create } from "zustand";
import {
  saveCollection as dbSaveCollection,
  loadCollection as dbLoadCollection,
} from "@/lib/db";
import type { CollectionData } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────

type CardType = "bakugan" | "gate" | "ability";

interface CollectionState {
  ownedBakugan: string[];
  ownedGateCards: string[];
  ownedAbilityCards: string[];

  addBakugan: (id: string) => void;
  removeBakugan: (id: string) => void;
  addGateCard: (id: string) => void;
  removeGateCard: (id: string) => void;
  addAbilityCard: (id: string) => void;
  removeAbilityCard: (id: string) => void;
  isOwned: (type: CardType, id: string) => boolean;
  loadCollection: () => Promise<void>;
  saveCollection: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────

export const useCollectionStore = create<CollectionState>((set, get) => ({
  ownedBakugan: [],
  ownedGateCards: [],
  ownedAbilityCards: [],

  addBakugan: (id: string) => {
    const { ownedBakugan } = get();
    if (!ownedBakugan.includes(id)) {
      set({ ownedBakugan: [...ownedBakugan, id] });
    }
  },

  removeBakugan: (id: string) => {
    const { ownedBakugan } = get();
    set({ ownedBakugan: ownedBakugan.filter((b) => b !== id) });
  },

  addGateCard: (id: string) => {
    const { ownedGateCards } = get();
    if (!ownedGateCards.includes(id)) {
      set({ ownedGateCards: [...ownedGateCards, id] });
    }
  },

  removeGateCard: (id: string) => {
    const { ownedGateCards } = get();
    set({ ownedGateCards: ownedGateCards.filter((g) => g !== id) });
  },

  addAbilityCard: (id: string) => {
    const { ownedAbilityCards } = get();
    if (!ownedAbilityCards.includes(id)) {
      set({ ownedAbilityCards: [...ownedAbilityCards, id] });
    }
  },

  removeAbilityCard: (id: string) => {
    const { ownedAbilityCards } = get();
    set({ ownedAbilityCards: ownedAbilityCards.filter((a) => a !== id) });
  },

  isOwned: (type: CardType, id: string) => {
    const state = get();
    switch (type) {
      case "bakugan":
        return state.ownedBakugan.includes(id);
      case "gate":
        return state.ownedGateCards.includes(id);
      case "ability":
        return state.ownedAbilityCards.includes(id);
    }
  },

  loadCollection: async () => {
    const saved = await dbLoadCollection();
    if (saved) {
      set({
        ownedBakugan: saved.ownedBakugan,
        ownedGateCards: saved.ownedGateCards,
        ownedAbilityCards: saved.ownedAbilityCards,
      });
    }
  },

  saveCollection: async () => {
    const { ownedBakugan, ownedGateCards, ownedAbilityCards } = get();
    const collection: CollectionData = {
      ownedBakugan,
      ownedGateCards,
      ownedAbilityCards,
    };
    await dbSaveCollection(collection);
  },
}));
