/**
 * Park Battles — 26 postgame opponents with progressive unlock.
 *
 * After completing Story Mode, Park Battles become available.
 * Higher difficulty than story mode. Opponents use full G-Power values
 * (no -100 story handicap).
 *
 * Source: GameFAQs guide FAQ 81516, Sections E and B
 * Note: The guide references 26 Park Battle rows but does not fully
 * detail each opponent's team. This implementation uses the shop's
 * Park Battle Bakugan list and the game's roster to construct opponents.
 */

import type { Attribute } from '@/data/schemas';

/* ------------------------------------------------------------------ */
/*  Park Battle Types                                                   */
/* ------------------------------------------------------------------ */

export type ParkBattleType = '1v1' | 'tag' | 'battle_royale';

export interface ParkBattleOpponent {
  /** Unique identifier */
  id: string;
  /** Challenger name */
  challenger: string;
  /** Battle format */
  type: ParkBattleType;
  /** Attribute restrictions (empty = none) */
  restrictions: string[];
  /** Opponent's Bakugan team */
  opponents: ParkBattleBakugan[];
  /** Arena field used */
  field: string;
  /** Money reward */
  reward: number;
  /** Unlock requirement (null = available from start of postgame) */
  unlockCondition: string | null;
  /** Difficulty rating 1-5 */
  difficulty: number;
}

export interface ParkBattleBakugan {
  name: string;
  attribute: Attribute;
  gPower: number;
  level: number;
}

/* ------------------------------------------------------------------ */
/*  26 Park Battle Opponents                                            */
/* ------------------------------------------------------------------ */

/**
 * Park Battle opponents — constructed from the guide's available data.
 * The guide references 26 Park Battle encounters. Bakugan available
 * from Park Battles are listed in Section E. Opponent G-Powers use
 * full values (no story mode -100 handicap).
 */
export const PARK_BATTLES: ParkBattleOpponent[] = [
  {
    id: 'pb-001',
    challenger: 'Ace Gorillan',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Dragonoid', attribute: 'pyrus', gPower: 400, level: 5 },
    ],
    field: 'pyrus-arena',
    reward: 5000,
    unlockCondition: null,
    difficulty: 1,
  },
  {
    id: 'pb-002',
    challenger: 'Kai',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Saurus', attribute: 'pyrus', gPower: 210, level: 3 },
      { name: 'Serpenoid', attribute: 'pyrus', gPower: 190, level: 3 },
    ],
    field: 'pyrus-arena',
    reward: 4000,
    unlockCondition: null,
    difficulty: 1,
  },
  {
    id: 'pb-003',
    challenger: 'Rena',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Sirenoid', attribute: 'aquos', gPower: 390, level: 5 },
    ],
    field: 'aquos-arena',
    reward: 5000,
    unlockCondition: null,
    difficulty: 1,
  },
  {
    id: 'pb-004',
    challenger: 'Mira',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Gorem', attribute: 'subterra', gPower: 400, level: 5 },
    ],
    field: 'subterra-arena',
    reward: 5000,
    unlockCondition: null,
    difficulty: 1,
  },
  {
    id: 'pb-005',
    challenger: 'Spectra',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Hydranoid', attribute: 'darkus', gPower: 450, level: 6 },
    ],
    field: 'darkus-arena',
    reward: 6000,
    unlockCondition: null,
    difficulty: 2,
  },
  {
    id: 'pb-006',
    challenger: 'Gus',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Tigrerra', attribute: 'haos', gPower: 400, level: 5 },
    ],
    field: 'haos-arena',
    reward: 5000,
    unlockCondition: null,
    difficulty: 2,
  },
  {
    id: 'pb-007',
    challenger: 'Mylene',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Skyress', attribute: 'ventus', gPower: 400, level: 5 },
    ],
    field: 'ventus-arena',
    reward: 5000,
    unlockCondition: null,
    difficulty: 2,
  },
  {
    id: 'pb-008',
    challenger: 'Volt',
    type: 'tag',
    restrictions: [],
    opponents: [
      { name: 'Fortress', attribute: 'pyrus', gPower: 390, level: 5 },
      { name: 'Harpus', attribute: 'ventus', gPower: 390, level: 5 },
    ],
    field: 'standard-arena',
    reward: 8000,
    unlockCondition: 'win_5_park_battles',
    difficulty: 2,
  },
  {
    id: 'pb-009',
    challenger: 'Lync',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Preyas', attribute: 'aquos', gPower: 380, level: 5 },
    ],
    field: 'aquos-arena',
    reward: 5500,
    unlockCondition: 'win_5_park_battles',
    difficulty: 2,
  },
  {
    id: 'pb-010',
    challenger: 'Shadow Prove',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Vladitor', attribute: 'darkus', gPower: 420, level: 6 },
    ],
    field: 'darkus-arena',
    reward: 6500,
    unlockCondition: 'win_5_park_battles',
    difficulty: 3,
  },
  {
    id: 'pb-011',
    challenger: 'Brontes',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Cycloid', attribute: 'subterra', gPower: 390, level: 5 },
    ],
    field: 'subterra-arena',
    reward: 5000,
    unlockCondition: 'win_5_park_battles',
    difficulty: 2,
  },
  {
    id: 'pb-012',
    challenger: 'Damdos',
    type: 'tag',
    restrictions: [],
    opponents: [
      { name: 'Fear Ripper', attribute: 'haos', gPower: 270, level: 4 },
      { name: 'Siege', attribute: 'darkus', gPower: 270, level: 4 },
    ],
    field: 'haos-arena',
    reward: 7000,
    unlockCondition: 'win_10_park_battles',
    difficulty: 3,
  },
  {
    id: 'pb-013',
    challenger: 'Elico',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Tentaclear', attribute: 'haos', gPower: 390, level: 5 },
    ],
    field: 'haos-arena',
    reward: 5000,
    unlockCondition: 'win_10_park_battles',
    difficulty: 3,
  },
  {
    id: 'pb-014',
    challenger: 'Naga',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Leonidas', attribute: 'pyrus', gPower: 420, level: 7 },
    ],
    field: 'pyrus-arena',
    reward: 8000,
    unlockCondition: 'win_10_park_battles',
    difficulty: 3,
  },
  {
    id: 'pb-015',
    challenger: 'iox',
    type: 'battle_royale',
    restrictions: [],
    opponents: [
      { name: 'Stinglash', attribute: 'darkus', gPower: 230, level: 3 },
      { name: 'Centipoid', attribute: 'subterra', gPower: 240, level: 3 },
      { name: 'Gargonoid', attribute: 'ventus', gPower: 250, level: 4 },
    ],
    field: 'standard-arena',
    reward: 10000,
    unlockCondition: 'win_10_park_battles',
    difficulty: 3,
  },
  {
    id: 'pb-016',
    challenger: 'Klaus',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Delta Dragonoid II', attribute: 'pyrus', gPower: 500, level: 8 },
    ],
    field: 'pyrus-arena',
    reward: 10000,
    unlockCondition: 'win_15_park_battles',
    difficulty: 4,
  },
  {
    id: 'pb-017',
    challenger: 'Baron',
    type: 'tag',
    restrictions: [],
    opponents: [
      { name: 'Preyas II', attribute: 'aquos', gPower: 480, level: 8 },
      { name: 'Sirenoid', attribute: 'aquos', gPower: 390, level: 6 },
    ],
    field: 'aquos-arena',
    reward: 12000,
    unlockCondition: 'win_15_park_battles',
    difficulty: 4,
  },
  {
    id: 'pb-018',
    challenger: 'Gil',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Hammer Gorem', attribute: 'subterra', gPower: 500, level: 8 },
    ],
    field: 'subterra-arena',
    reward: 10000,
    unlockCondition: 'win_15_park_battles',
    difficulty: 4,
  },
  {
    id: 'pb-019',
    challenger: 'Volt Kaster',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Storm Skyress', attribute: 'ventus', gPower: 500, level: 8 },
    ],
    field: 'ventus-arena',
    reward: 10000,
    unlockCondition: 'win_15_park_battles',
    difficulty: 4,
  },
  {
    id: 'pb-020',
    challenger: 'Xenogel',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Blade Tigrerra', attribute: 'haos', gPower: 500, level: 8 },
    ],
    field: 'haos-arena',
    reward: 10000,
    unlockCondition: 'win_15_park_battles',
    difficulty: 4,
  },
  {
    id: 'pb-021',
    challenger: 'Sigurd',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Dual Hydranoid', attribute: 'darkus', gPower: 550, level: 9 },
    ],
    field: 'darkus-arena',
    reward: 12000,
    unlockCondition: 'win_20_park_battles',
    difficulty: 4,
  },
  {
    id: 'pb-022',
    challenger: 'Druman',
    type: 'tag',
    restrictions: [],
    opponents: [
      { name: 'Reaper', attribute: 'darkus', gPower: 380, level: 6 },
      { name: 'Laserman', attribute: 'haos', gPower: 370, level: 6 },
    ],
    field: 'darkus-arena',
    reward: 14000,
    unlockCondition: 'win_20_park_battles',
    difficulty: 5,
  },
  {
    id: 'pb-023',
    challenger: 'Cyrus',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Battle Ax Vladitor', attribute: 'darkus', gPower: 650, level: 10 },
    ],
    field: 'darkus-arena',
    reward: 15000,
    unlockCondition: 'win_20_park_battles',
    difficulty: 5,
  },
  {
    id: 'pb-024',
    challenger: 'Zenoheld',
    type: 'battle_royale',
    restrictions: [],
    opponents: [
      { name: 'Fortress', attribute: 'pyrus', gPower: 390, level: 6 },
      { name: 'Griffon', attribute: 'haos', gPower: 300, level: 5 },
      { name: 'Monarus', attribute: 'ventus', gPower: 300, level: 5 },
    ],
    field: 'battle-arena',
    reward: 15000,
    unlockCondition: 'win_20_park_battles',
    difficulty: 5,
  },
  {
    id: 'pb-025',
    challenger: 'King Zenoheld',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Omega Leonidas', attribute: 'pyrus', gPower: 650, level: 10 },
    ],
    field: 'battle-arena',
    reward: 20000,
    unlockCondition: 'win_25_park_battles',
    difficulty: 5,
  },
  {
    id: 'pb-026',
    challenger: 'Prince Naga',
    type: '1v1',
    restrictions: [],
    opponents: [
      { name: 'Omega Leonidas', attribute: 'darkus', gPower: 650, level: 10 },
      { name: 'Battle Ax Vladitor', attribute: 'darkus', gPower: 650, level: 10 },
    ],
    field: 'battle-arena',
    reward: 30000,
    unlockCondition: 'win_25_park_battles',
    difficulty: 5,
  },
];

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Get all park battles that are currently unlocked based on completion count.
 */
export function getUnlockedParkBattles(winsCompleted: number): ParkBattleOpponent[] {
  return PARK_BATTLES.filter((pb) => {
    if (!pb.unlockCondition) return true;

    // Parse unlock conditions like "win_5_park_battles"
    const match = pb.unlockCondition.match(/win_(\d+)_park_battles/);
    if (match) {
      const required = parseInt(match[1], 10);
      return winsCompleted >= required;
    }

    return false;
  });
}

/**
 * Get a specific park battle by ID.
 */
export function getParkBattle(id: string): ParkBattleOpponent | undefined {
  return PARK_BATTLES.find((pb) => pb.id === id);
}

/**
 * Get the total number of park battles available.
 */
export function getTotalParkBattles(): number {
  return PARK_BATTLES.length;
}

/**
 * Check if a park battle unlock condition is met.
 */
export function isParkBattleUnlocked(
  battle: ParkBattleOpponent,
  winsCompleted: number,
): boolean {
  if (!battle.unlockCondition) return true;
  const match = battle.unlockCondition.match(/win_(\d+)_park_battles/);
  if (match) {
    return winsCompleted >= parseInt(match[1], 10);
  }
  return false;
}
