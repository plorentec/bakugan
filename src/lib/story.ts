import type { Attribute } from '@/data/schemas';
import balanceConfig from '@/data/config/balance.json';

// ─── Types ────────────────────────────────────────────────────────────

export interface StoryOpponent {
  id: string;
  name: string;
  attribute: Attribute;
  gPower: number;
  /** Story mode G-Power (base - handicap) */
  storyGPower: number;
  /** Whether this opponent has been defeated */
  defeated: boolean;
  /** Order in story progression (1-indexed) */
  order: number;
}

export type StoryProgress = Record<string, boolean>;

// ─── Constants ────────────────────────────────────────────────────────

/**
 * Story mode opponents — one per attribute + final boss.
 * G-Powers from DS guide. Story mode applies -100 G-Power handicap.
 */
export const STORY_OPPONENTS: StoryOpponent[] = [
  {
    id: 'dan',
    name: 'Dan',
    attribute: 'pyrus',
    gPower: 440,
    storyGPower: 440 + balanceConfig.story.g_power_handicap,
    defeated: false,
    order: 1,
  },
  {
    id: 'marucho',
    name: 'Marucho',
    attribute: 'aquos',
    gPower: 440,
    storyGPower: 440 + balanceConfig.story.g_power_handicap,
    defeated: false,
    order: 2,
  },
  {
    id: 'julie',
    name: 'Julie',
    attribute: 'subterra',
    gPower: 440,
    storyGPower: 440 + balanceConfig.story.g_power_handicap,
    defeated: false,
    order: 3,
  },
  {
    id: 'runo',
    name: 'Runo',
    attribute: 'haos',
    gPower: 440,
    storyGPower: 440 + balanceConfig.story.g_power_handicap,
    defeated: false,
    order: 4,
  },
  {
    id: 'shun',
    name: 'Shun',
    attribute: 'ventus',
    gPower: 440,
    storyGPower: 440 + balanceConfig.story.g_power_handicap,
    defeated: false,
    order: 5,
  },
  {
    id: 'masquerade',
    name: 'Masquerade',
    attribute: 'darkus',
    gPower: 440,
    storyGPower: 440 + balanceConfig.story.g_power_handicap,
    defeated: false,
    order: 6,
  },
  {
    id: 'marduk',
    name: 'Marduk',
    attribute: 'darkus',
    gPower: 500,
    storyGPower: 500 + balanceConfig.story.g_power_handicap,
    defeated: false,
    order: 7,
  },
];

// ─── Functions ────────────────────────────────────────────────────────

/**
 * Get the default story progress (all opponents undefeated).
 */
export function getDefaultStoryProgress(): StoryProgress {
  const progress: StoryProgress = {};
  for (const opponent of STORY_OPPONENTS) {
    progress[opponent.id] = false;
  }
  return progress;
}

/**
 * Check if a story opponent is unlocked.
 * First opponent is always unlocked. Others require the previous one to be defeated.
 */
export function isOpponentUnlocked(
  opponentId: string,
  progress: StoryProgress,
): boolean {
  const opponent = STORY_OPPONENTS.find((o) => o.id === opponentId);
  if (!opponent) return false;

  // First opponent is always unlocked
  if (opponent.order === 1) return true;

  // Previous opponent must be defeated
  const prevOpponent = STORY_OPPONENTS.find((o) => o.order === opponent.order - 1);
  if (!prevOpponent) return true;

  return progress[prevOpponent.id] === true;
}

/**
 * Mark an opponent as defeated and return the updated progress.
 */
export function defeatOpponent(
  opponentId: string,
  progress: StoryProgress,
): StoryProgress {
  return {
    ...progress,
    [opponentId]: true,
  };
}

/**
 * Check if all story opponents have been defeated.
 */
export function isStoryComplete(progress: StoryProgress): boolean {
  return STORY_OPPONENTS.every((opponent) => progress[opponent.id] === true);
}

/**
 * Get the number of opponents defeated.
 */
export function getDefeatedCount(progress: StoryProgress): number {
  return STORY_OPPONENTS.filter((opponent) => progress[opponent.id] === true).length;
}

/**
 * Get story opponent data by ID.
 */
export function getStoryOpponent(opponentId: string): StoryOpponent | undefined {
  return STORY_OPPONENTS.find((o) => o.id === opponentId);
}

/**
 * Get the G-Power handicap applied in story mode.
 */
export function getStoryGPowerHandicap(): number {
  return balanceConfig.story.g_power_handicap;
}
