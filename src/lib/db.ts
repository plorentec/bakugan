import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Deck } from "@/data/schemas";
import type { AbilityCardColor, GateCardTier } from "@/data/schemas";

// ─── Types ────────────────────────────────────────────────────────────

export interface CollectionData {
  ownedBakugan: string[];
  ownedGateCards: string[];
  ownedAbilityCards: string[];
}

export interface ProgressionData {
  money: number;
  xp: number;
  level: number;
  statPoints: number;
  allocatedStats: {
    speed: number;
    defense: number;
    control: number;
    steering: number;
    magnet: number;
  };
  ownedBakugan: string[];
  ownedGateCards: string[];
  ownedAbilityCards: string[];
  unlockedShopTiers: string[];
  storyProgress: Record<string, boolean>;
}

// ─── Database Schema ──────────────────────────────────────────────────

interface BakuganDB extends DBSchema {
  decks: {
    key: string;
    value: Deck;
  };
  collections: {
    key: string;
    value: CollectionData;
  };
  progression: {
    key: string;
    value: ProgressionData;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────

const DB_NAME = "bakugan-db";
const DB_VERSION = 2;
const DECK_KEY = "current-deck";
const COLLECTION_KEY = "player-collection";
const PROGRESSION_KEY = "player-progression";

async function openBakuganDB(): Promise<IDBPDatabase<BakuganDB>> {
  return openDB<BakuganDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains("decks")) {
        db.createObjectStore("decks");
      }
      if (!db.objectStoreNames.contains("collections")) {
        db.createObjectStore("collections");
      }
      if (!db.objectStoreNames.contains("progression")) {
        db.createObjectStore("progression");
      }
    },
  });
}

// ─── Deck ─────────────────────────────────────────────────────────────

export async function saveDeck(deck: Deck): Promise<void> {
  const db = await openBakuganDB();
  await db.put("decks", deck, DECK_KEY);
}

export async function loadDeck(): Promise<Deck | null> {
  const db = await openBakuganDB();
  const deck = await db.get("decks", DECK_KEY);
  return deck ?? null;
}

// ─── Collection ───────────────────────────────────────────────────────

export async function saveCollection(collection: CollectionData): Promise<void> {
  const db = await openBakuganDB();
  await db.put("collections", collection, COLLECTION_KEY);
}

export async function loadCollection(): Promise<CollectionData | null> {
  const db = await openBakuganDB();
  const col = await db.get("collections", COLLECTION_KEY);
  return col ?? null;
}

// ─── Progression ──────────────────────────────────────────────────────

export async function saveProgression(progression: ProgressionData): Promise<void> {
  const db = await openBakuganDB();
  await db.put("progression", progression, PROGRESSION_KEY);
}

export async function loadProgression(): Promise<ProgressionData | null> {
  const db = await openBakuganDB();
  const prog = await db.get("progression", PROGRESSION_KEY);
  return prog ?? null;
}

// ─── Re-export helper types for convenience ───────────────────────────
export type { AbilityCardColor, GateCardTier };
