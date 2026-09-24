import { create } from 'zustand';
import {
  saveProgression as dbSaveProgression,
  loadProgression as dbLoadProgression,
} from '@/lib/db';
import type { ProgressionData } from '@/lib/db';
import type { PlayerStats, StatName } from '@/lib/stats';
import { createEmptyStats, allocateStat, recalculateGPower, getRemainingStatPoints } from '@/lib/stats';
import { checkLevelUp, getStatPointsPerLevel, getMaxLevel, getXpForLevel } from '@/lib/xp';
import { getDefaultStoryProgress, isStoryComplete as checkStoryComplete, getDefeatedCount, defeatOpponent } from '@/lib/story';
import shopConfig from '@/data/config/shop.json';

// ─── Types ────────────────────────────────────────────────────────────

export type CardType = 'bakugan' | 'gate' | 'ability';

export interface ProgressionState {
  // Core progression
  money: number;
  xp: number;
  level: number;
  allocatedStats: PlayerStats;
  pendingStatPoints: number;

  // Collection
  ownedBakugan: string[];
  ownedGateCards: string[];
  ownedAbilityCards: string[];

  // Shop
  unlockedShopTiers: string[];

  // Story
  storyProgress: Record<string, boolean>;

  // Flags
  hasLeveledUp: boolean;
  lastMoneyChange: number; // for animated counter

  // Actions
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  canAfford: (amount: number) => boolean;

  addXp: (amount: number) => number; // returns new level if leveled up, else 0
  levelUp: (statChoice: StatName) => void;
  getStatValue: (stat: StatName) => number;
  getStatBonusGPower: () => number;

  allocateStatPoint: (stat: StatName) => boolean;

  unlockShopTier: (tier: string) => void;
  isTierUnlocked: (tier: string) => boolean;

  completeStoryOpponent: (opponentId: string) => void;
  getStoryProgress: () => Record<string, boolean>;
  isStoryComplete: () => boolean;
  getDefeatedCount: () => number;

  purchaseBakugan: (bakuganId: string, price: number) => boolean;
  purchaseGateCard: (gateCardId: string, price: number) => boolean;
  purchaseAbilityCard: (abilityCardId: string, price: number) => boolean;

  isOwned: (type: CardType, id: string) => boolean;

  loadProgression: () => Promise<void>;
  saveProgression: () => Promise<void>;
  clearLevelUpFlag: () => void;
}

// ─── Default state ────────────────────────────────────────────────────

function getDefaultState() {
  return {
    money: 2000,
    xp: 0,
    level: 1,
    allocatedStats: createEmptyStats(),
    pendingStatPoints: 0,
    ownedBakugan: [] as string[],
    ownedGateCards: [] as string[],
    ownedAbilityCards: [] as string[],
    unlockedShopTiers: ['start'],
    storyProgress: getDefaultStoryProgress(),
    hasLeveledUp: false,
    lastMoneyChange: 0,
  };
}

// ─── Store ────────────────────────────────────────────────────────────

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  ...getDefaultState(),

  /* ================================================================ */
  /*  Money                                                             */
  /* ================================================================ */

  addMoney: (amount: number) => {
    const { money } = get();
    const newMoney = money + amount;
    set({ money: newMoney, lastMoneyChange: amount });
    get().saveProgression();
  },

  spendMoney: (amount: number) => {
    const { money } = get();
    if (money < amount) return false;
    set({ money: money - amount, lastMoneyChange: -amount });
    get().saveProgression();
    return true;
  },

  canAfford: (amount: number) => {
    return get().money >= amount;
  },

  /* ================================================================ */
  /*  XP & Leveling                                                     */
  /* ================================================================ */

  addXp: (amount: number) => {
    const { xp, level } = get();
    const newXp = xp + amount;
    const maxLevel = getMaxLevel();

    if (level >= maxLevel) {
      set({ xp: newXp });
      get().saveProgression();
      return 0;
    }

    const newLevel = checkLevelUp(newXp, level);
    if (newLevel > level) {
      const pendingPoints = getStatPointsPerLevel();
      set({
        xp: newXp,
        level: newLevel,
        pendingStatPoints: get().pendingStatPoints + pendingPoints,
        hasLeveledUp: true,
      });
      get().saveProgression();
      return newLevel;
    }

    set({ xp: newXp });
    get().saveProgression();
    return 0;
  },

  levelUp: (statChoice: StatName) => {
    const { level, allocatedStats, pendingStatPoints } = get();
    if (pendingStatPoints <= 0) return;

    const result = allocateStat(allocatedStats, statChoice);
    if (!result.success) return;

    set({
      allocatedStats: result.stats,
      pendingStatPoints: pendingStatPoints - 1,
    });
    get().saveProgression();
  },

  allocateStatPoint: (statChoice: StatName) => {
    const { allocatedStats, pendingStatPoints } = get();
    if (pendingStatPoints <= 0) return false;

    const result = allocateStat(allocatedStats, statChoice);
    if (!result.success) return false;

    set({
      allocatedStats: result.stats,
      pendingStatPoints: pendingStatPoints - 1,
    });
    get().saveProgression();
    return true;
  },

  getStatValue: (stat: StatName) => {
    return get().allocatedStats[stat];
  },

  getStatBonusGPower: () => {
    const stats = get().allocatedStats;
    return (
      stats.speed * 5 +
      stats.defense * 5 +
      stats.control * 5 +
      stats.steering * 5 +
      stats.magnet * 5
    );
  },

  /* ================================================================ */
  /*  Shop Tiers                                                        */
  /* ================================================================ */

  unlockShopTier: (tier: string) => {
    const { unlockedShopTiers } = get();
    if (!unlockedShopTiers.includes(tier)) {
      set({ unlockedShopTiers: [...unlockedShopTiers, tier] });
      get().saveProgression();
    }
  },

  isTierUnlocked: (tier: string) => {
    return get().unlockedShopTiers.includes(tier);
  },

  /* ================================================================ */
  /*  Story Progress                                                    */
  /* ================================================================ */

  completeStoryOpponent: (opponentId: string) => {
    const { storyProgress } = get();
    const newProgress = defeatOpponent(opponentId, storyProgress);
    const allDefeated = checkStoryComplete(newProgress);

    const updates: Partial<ProgressionState> = { storyProgress: newProgress };

    if (allDefeated) {
      // Unlock story_complete tier
      const tiers = [...get().unlockedShopTiers];
      if (!tiers.includes('story_complete')) {
        tiers.push('story_complete');
        updates.unlockedShopTiers = tiers;
      }
    }

    set(updates as ProgressionState);
    get().saveProgression();
  },

  getStoryProgress: () => {
    return get().storyProgress;
  },

  isStoryComplete: () => {
    return checkStoryComplete(get().storyProgress);
  },

  getDefeatedCount: () => {
    return getDefeatedCount(get().storyProgress);
  },

  /* ================================================================ */
  /*  Purchases                                                         */
  /* ================================================================ */

  purchaseBakugan: (bakuganId: string, price: number) => {
    const { money, ownedBakugan } = get();
    if (money < price) return false;
    if (ownedBakugan.includes(bakuganId)) return false;

    set({
      money: money - price,
      ownedBakugan: [...ownedBakugan, bakuganId],
      lastMoneyChange: -price,
    });
    get().saveProgression();
    return true;
  },

  purchaseGateCard: (gateCardId: string, price: number) => {
    const { money, ownedGateCards } = get();
    if (money < price) return false;
    if (ownedGateCards.includes(gateCardId)) return false;

    set({
      money: money - price,
      ownedGateCards: [...ownedGateCards, gateCardId],
      lastMoneyChange: -price,
    });
    get().saveProgression();
    return true;
  },

  purchaseAbilityCard: (abilityCardId: string, price: number) => {
    const { money, ownedAbilityCards } = get();
    if (money < price) return false;
    if (ownedAbilityCards.includes(abilityCardId)) return false;

    set({
      money: money - price,
      ownedAbilityCards: [...ownedAbilityCards, abilityCardId],
      lastMoneyChange: -price,
    });
    get().saveProgression();
    return true;
  },

  /* ================================================================ */
  /*  Ownership                                                         */
  /* ================================================================ */

  isOwned: (type: CardType, id: string) => {
    const state = get();
    switch (type) {
      case 'bakugan':
        return state.ownedBakugan.includes(id);
      case 'gate':
        return state.ownedGateCards.includes(id);
      case 'ability':
        return state.ownedAbilityCards.includes(id);
    }
  },

  /* ================================================================ */
  /*  Persistence                                                       */
  /* ================================================================ */

  loadProgression: async () => {
    const saved = await dbLoadProgression();
    if (saved) {
      set({
        money: saved.money,
        xp: saved.xp,
        level: saved.level,
        allocatedStats: saved.allocatedStats,
        pendingStatPoints: getRemainingStatPoints(saved.level, saved.allocatedStats),
        ownedBakugan: saved.ownedBakugan,
        ownedGateCards: saved.ownedGateCards,
        ownedAbilityCards: saved.ownedAbilityCards,
        unlockedShopTiers: saved.unlockedShopTiers,
        storyProgress: saved.storyProgress,
      });
    }
  },

  saveProgression: async () => {
    const state = get();
    const data: ProgressionData = {
      money: state.money,
      xp: state.xp,
      level: state.level,
      allocatedStats: state.allocatedStats,
      statPoints: state.pendingStatPoints,
      ownedBakugan: state.ownedBakugan,
      ownedGateCards: state.ownedGateCards,
      ownedAbilityCards: state.ownedAbilityCards,
      unlockedShopTiers: state.unlockedShopTiers,
      storyProgress: state.storyProgress,
    };
    await dbSaveProgression(data);
  },

  clearLevelUpFlag: () => {
    set({ hasLeveledUp: false });
  },
}));
