# Data Model — Bakugan Battle Brawlers (Web)

## 1. Entity Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Bakugan    │────▶│     Deck     │◀────│  GateCard    │
│  (6 attrs)   │     │ (3+3+3 rule) │     │ (G/S/C tier) │
└─────────────┘     └──────────────┘     └──────────────┘
       │                   │                     │
       │                   │                     │
       ▼                   ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Arena      │     │ AbilityCard  │     │  Battle      │
│ (hazards,   │     │ (R/G/B color)│     │ (state mchn) │
│  power-ups) │     └──────────────┘     └──────────────┘
└─────────────┘           │                     │
                          │                     │
                          ▼                     ▼
                    ┌──────────────┐     ┌──────────────┐
                    │ Effects      │     │  Minigame    │
                    │ Engine       │     │  (6 types)   │
                    └──────────────┘     └──────────────┘
```

---

## 2. Bakugan Schema

```typescript
import { z } from 'zod';

const AttributeSchema = z.enum([
  'pyrus', 'aquos', 'subterra', 'haos', 'darkus', 'ventus'
]);

const BakuganStatsSchema = z.object({
  speed: z.number().min(0).max(4),
  defense: z.number().min(0).max(4),
  control: z.number().min(0).max(4),
  steering: z.number().min(0).max(4),
  magnet: z.number().min(0).max(4),
});

const SourceMetadataSchema = z.object({
  source: z.string(),
  source_url: z.string().url().optional(),
  source_notes: z.string().optional(),
  asset_license_status: z.enum([
    'original',
    'reference_only_no_redistribution',
    'public_domain',
    'unknown'
  ]),
});

const ConflictRecordSchema = z.object({
  value: z.unknown(),
  sources: z.array(z.string()),
  conflict: z.literal(true),
});

const BakuganSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  attributes: z.array(AttributeSchema).min(1).max(6),
  base_g_power: z.number().min(0).max(999),
  max_g_power: z.number().min(0).max(999),
  stats: BakuganStatsSchema,
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  model_reference: z.string().optional(),
  special_shot: z.string().optional(),
  special_shot_description: z.string().optional(),
  source: SourceMetadataSchema,
  conflicts: z.array(ConflictRecordSchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

type Bakugan = z.infer<typeof BakuganSchema>;

// Example: Serpenoid (Pyrus)
const serpenoid: Bakugan = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Serpenoid',
  attributes: ['pyrus', 'aquos', 'subterra', 'haos', 'darkus', 'ventus'],
  base_g_power: 190,
  max_g_power: 440,
  stats: {
    speed: 2,
    defense: 1,
    control: 1,
    steering: 1,
    magnet: 1,
  },
  description: 'All-attribute Bakugan with balanced stats. Available in all 6 attributes.',
  source: {
    source: 'GameFAQs guide FAQ 81516, Section F',
    source_url: 'https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516',
    source_notes: 'Base G-Power 190, max 440. Stats from guide table.',
    asset_license_status: 'reference_only_no_redistribution',
  },
  created_at: '2026-09-24T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
};
```

---

## 3. GateCard Schema

```typescript
const GateCardTierSchema = z.enum(['gold', 'silver', 'copper']);

const GateCardBattleTypeSchema = z.enum([
  'scratch', 'spin', 'timing', 'pop', 'trace', 'bound'
]);

const GateCardBonusesSchema = z.object({
  pyrus: z.number(),
  aquos: z.number(),
  subterra: z.number(),
  haos: z.number(),
  darkus: z.number(),
  ventus: z.number(),
});

const GateCardEffectSchema = z.object({
  type: z.string(),
  description: z.string(),
  magnitude: z.number().optional(),
  condition: z.string().optional(),
}).optional();

const GateCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  tier: GateCardTierSchema,
  battle_type: GateCardBattleTypeSchema,
  bonuses: GateCardBonusesSchema,
  effect: GateCardEffectSchema,
  depicted_bakugan: z.string().optional(), // Gold cards: bonus applied twice
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  source: SourceMetadataSchema,
  conflicts: z.array(ConflictRecordSchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

type GateCard = z.infer<typeof GateCardSchema>;

// Example: Serpenoid Gold Gate Card
const serpenoidGold: GateCard = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Serpenoid',
  tier: 'gold',
  battle_type: 'scratch',
  bonuses: {
    pyrus: 180,
    aquos: 60,
    subterra: 90,
    haos: 140,
    darkus: 130,
    ventus: 50,
  },
  effect: {
    type: 'BONUS_TWICE',
    description: 'If the depicted Bakugan stands on it, bonus applied twice',
  },
  depicted_bakugan: 'Serpenoid',
  source: {
    source: 'GameFAQs guide FAQ 81516, Section G',
    source_url: 'https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516',
    source_notes: 'Gold card. Scratch Battle minigame. Bonus twice if Serpenoid stands on it.',
    asset_license_status: 'reference_only_no_redistribution',
  },
  created_at: '2026-09-24T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
};

// Example: Stand Off Copper Gate Card
const standOff: GateCard = {
  id: '00000000-0000-0000-0000-000000000020',
  name: 'Stand Off',
  tier: 'copper',
  battle_type: 'trace',
  bonuses: {
    pyrus: 140,
    aquos: 80,
    subterra: 50,
    haos: 80,
    darkus: 60,
    ventus: 20,
  },
  effect: {
    type: 'PREVENT_ABILITY_CARDS',
    description: 'Neither side can play Ability Cards',
  },
  source: {
    source: 'GameFAQs guide FAQ 81516, Section G',
    source_url: 'https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516',
    source_notes: 'Copper card. Trace Battle. Prevents Ability Cards.',
    asset_license_status: 'reference_only_no_redistribution',
  },
  created_at: '2026-09-24T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
};
```

---

## 4. AbilityCard Schema

```typescript
const AbilityCardColorSchema = z.enum(['red', 'green', 'blue']);

const AbilityCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  color: AbilityCardColorSchema,
  effects: z.array(EffectDefinitionSchema), // defined in Effects section
  conditions: z.array(z.object({
    type: z.string(),
    description: z.string(),
    value: z.unknown().optional(),
  })).optional(),
  description: z.string(),
  image_url: z.string().url().optional(),
  source: SourceMetadataSchema,
  conflicts: z.array(ConflictRecordSchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

type AbilityCard = z.infer<typeof AbilityCardSchema>;

// Example: Rewind (Red)
const rewind: AbilityCard = {
  id: '00000000-0000-0000-0000-000000000030',
  name: 'Rewind',
  color: 'red',
  effects: [
    {
      type: 'RESTART_BATTLE',
      target: 'all_active',
    },
  ],
  description: 'Battle starts over',
  source: {
    source: 'GameFAQs guide FAQ 81516, Section H',
    source_url: 'https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516',
    source_notes: 'Red Ability Card. Restarts battle.',
    asset_license_status: 'reference_only_no_redistribution',
  },
  created_at: '2026-09-24T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
};

// Example: Stolen Gold (Green)
const stolenGold: AbilityCard = {
  id: '00000000-0000-0000-0000-000000000040',
  name: 'Stolen Gold',
  color: 'green',
  effects: [
    {
      type: 'SKIP_BATTLE',
      target: 'all_active',
      condition: {
        type: 'GATE_CARD_TIER',
        description: 'Only on Gold Gate Card',
        value: 'gold',
      },
    },
    {
      type: 'SWAP_G_POWER',
      target: 'all_active',
    },
  ],
  conditions: [
    {
      type: 'GATE_CARD_TIER',
      description: 'Only works on Gold Gate Cards',
      value: 'gold',
    },
  ],
  description: 'Skip battle on Gold Gate Card; highest G wins',
  source: {
    source: 'GameFAQs guide FAQ 81516, Section H',
    source_url: 'https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516',
    source_notes: 'Green Ability Card. Skips battle on Gold Gate.',
    asset_license_status: 'reference_only_no_redistribution',
  },
  created_at: '2026-09-24T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
};

// Example: Blaze (Blue)
const blaze: AbilityCard = {
  id: '00000000-0000-0000-0000-000000000050',
  name: 'Blaze',
  color: 'blue',
  effects: [
    {
      type: 'ADD_G_POWER',
      magnitude: 80,
      target: 'self',
      condition: {
        type: 'ATTRIBUTE_MATCH',
        description: '+80 G for Pyrus',
        value: 'pyrus',
      },
    },
    {
      type: 'ADD_G_POWER',
      magnitude: 50,
      target: 'self',
      condition: {
        type: 'ATTRIBUTE_MATCH',
        description: '+50 G for Aquos and Ventus',
        value: ['aquos', 'ventus'],
      },
    },
  ],
  description: '+80 G for Pyrus, +50 G for Aquos and Ventus',
  source: {
    source: 'GameFAQs guide FAQ 81516, Section H',
    source_url: 'https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516',
    source_notes: 'Blue Ability Card. Flat G-Power boost.',
    asset_license_status: 'reference_only_no_redistribution',
  },
  created_at: '2026-09-24T00:00:00Z',
  updated_at: '2026-09-24T00:00:00Z',
};
```

---

## 5. Deck Schema

```typescript
const DeckSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  bakugan: z.array(z.object({
    bakugan_id: z.string().uuid(),
    level: z.number().min(1).max(20),
    current_g_power: z.number().min(0),
    allocated_stats: z.object({
      speed: z.number().min(0).max(4),
      defense: z.number().min(0).max(4),
      control: z.number().min(0).max(4),
      steering: z.number().min(0).max(4),
      magnet: z.number().min(0).max(4),
    }),
  })).length(3, 'Deck must have exactly 3 Bakugan'),
  gate_cards: z.array(z.object({
    gate_card_id: z.string().uuid(),
  })).length(3, 'Deck must have exactly 3 Gate Cards'),
  ability_cards: z.array(z.object({
    ability_card_id: z.string().uuid(),
  })).length(3, 'Deck must have exactly 3 Ability Cards'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Validation rules
const validateDeck = (deck: z.infer<typeof DeckSchema>) => {
  const errors: string[] = [];

  // Gate Card tier validation: must be 1 Gold, 1 Silver, 1 Copper
  // (requires looking up GateCard data to check tier)

  // Ability Card color validation: must be 1 Red, 1 Green, 1 Blue
  // (requires looking up AbilityCard data to check color)

  // No duplicate Bakugan name+attribute
  const bakuganKeys = deck.bakugan.map(b => `${b.bakugan_id}`);
  const uniqueBakugan = new Set(bakuganKeys);
  if (uniqueBakugan.size !== bakuganKeys.length) {
    errors.push('Duplicate Bakugan in deck');
  }

  return { valid: errors.length === 0, errors };
};
```

### Deck Validation Rules

1. **Bakugan**: Exactly 3. No duplicate Bakugan ID (which encodes name+attribute).
2. **Gate Cards**: Exactly 3. Must be 1 Gold, 1 Silver, 1 Copper (validated against GateCard.tier).
3. **Ability Cards**: Exactly 3. Must be 1 Red, 1 Green, 1 Blue (validated against AbilityCard.color).

---

## 6. Arena Schema

```typescript
const ArenaHazardSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'fountain', 'river', 'quicksand', 'vent', 'tornado',
    'geyser', 'lava_line', 'floating_cube', 'warp_strip',
    'lightning', 'trampoline', 'boost_pad'
  ]),
  position: z.object({ x: z.number(), y: z.number() }),
  size: z.object({ width: z.number(), height: z.number() }).optional(),
  effect: z.string(),
  affected_attributes: z.array(AttributeSchema).optional(), // null = all
  g_power_penalty: z.number().optional(), // e.g. Pyrus lava = -10
  launch_force: z.number().optional(),
});

const ArenaSpawnPointSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['power_up', 'gate_card_slot', 'bakugan_start']),
  position: z.object({ x: z.number(), y: z.number() }),
  power_up_type: z.enum(['g_power_boost', 'experience_boost', 's_power_boost']).optional(),
});

const ArenaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  is_standard: z.boolean(), // true = no hazards
  advantage_attribute: AttributeSchema.optional(),
  disadvantage_attribute: AttributeSchema.optional(),
  field_size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  hazards: z.array(ArenaHazardSchema),
  spawn_points: z.array(ArenaSpawnPointSchema),
  gate_card_slots: z.number().min(4).max(8),
  difficulty_levels: z.number().min(1).max(3),
  source: SourceMetadataSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

type Arena = z.infer<typeof ArenaSchema>;
```

---

## 7. Effects System

### EffectDefinition

```typescript
const EffectTypeSchema = z.enum([
  // G-Power modifications
  'ADD_G_POWER',
  'REMOVE_G_POWER',
  'SWAP_G_POWER',
  'DOUBLE_G_POWER',
  'HALVE_G_POWER',
  'SET_G_POWER',

  // Battle control
  'RESTART_BATTLE',
  'SKIP_BATTLE',
  'PREVENT_ABILITY_CARDS',
  'PREVENT_MINIGAME',
  'DOUBLE_MINIGAME_INPUT',

  // Movement
  'INFINITE_STEERING',
  'MOVE_TO_GATE_CARD',
  'REDO_THROW',
  'EXTRA_THROW',
  'SWITCH_BAKUGAN',

  // Special
  'FILL_SPECIAL_METER',
  'CRITICAL_KO',
  'IMMUNE_CRITICAL_KO',
  'LAUNCH_OPPONENT',
  'REMOVE_ALL_OPPONENTS',
  'SWAP_GATE_CARD',
  'RETURN_ABILITY_CARD',

  // Character-specific
  'CHARACTER_G_POWER_BOOST',

  // Conditional
  'CONDITIONAL_BOOST',
  'ATTRIBUTE_COMBO_BOOST',
  'GATE_CARD_OWNERSHIP_BOOST',
  'POSITION_BOOST',

  // Gate Card specific
  'BONUS_TWICE',
]);

const EffectTargetSchema = z.enum([
  'self',
  'opponent',
  'all_active',
  'field',
  'all_opponents',
]);

const EffectConditionSchema = z.object({
  type: z.string(),
  description: z.string(),
  value: z.unknown().optional(),
}).optional();

const EffectDefinitionSchema = z.object({
  type: EffectTypeSchema,
  magnitude: z.number().optional(),
  target: EffectTargetSchema,
  condition: EffectConditionSchema,
  character: z.string().optional(),
  attributes: z.array(AttributeSchema).optional(),
  gate_card_tier: z.enum(['gold', 'silver', 'copper']).optional(),
  timing: z.enum([
    'pre_battle',
    'during_battle',
    'post_battle',
    'on_stand',
    'on_throw',
    'passive',
  ]).optional(),
});

type EffectDefinition = z.infer<typeof EffectDefinitionSchema>;
```

### Effect Registry Pattern

```typescript
type EffectHandler = (
  effect: EffectDefinition,
  context: BattleContext
) => BattleState;

const effectRegistry: Record<string, EffectHandler> = {
  ADD_G_POWER: (effect, ctx) => {
    const target = resolveTarget(effect.target, ctx);
    return {
      ...ctx.state,
      [target]: {
        ...ctx.state[target],
        effective_g_power: ctx.state[target].effective_g_power + (effect.magnitude ?? 0),
      },
    };
  },
  SWAP_G_POWER: (effect, ctx) => {
    const selfG = ctx.state.self.effective_g_power;
    const oppG = ctx.state.opponent.effective_g_power;
    return {
      ...ctx.state,
      self: { ...ctx.state.self, effective_g_power: oppG },
      opponent: { ...ctx.state.opponent, effective_g_power: selfG },
    };
  },
  // ... more handlers
};

function applyEffect(
  effect: EffectDefinition,
  context: BattleContext
): BattleState {
  const handler = effectRegistry[effect.type];
  if (!handler) {
    throw new Error(`Unknown effect type: ${effect.type}`);
  }
  return handler(effect, context);
}
```

---

## 8. Source Metadata

```typescript
// Already defined in BakuganSchema. Key fields:
interface SourceMetadata {
  source: string;           // e.g. "GameFAQs guide FAQ 81516, Section F"
  source_url?: string;      // URL to source
  source_notes?: string;    // Additional context
  asset_license_status:     // License status for any assets
    | 'original'                    // We created it
    | 'reference_only_no_redistribution' // From external source, reference only
    | 'public_domain'               // No restrictions
    | 'unknown';                    // License unclear
}
```

---

## 9. Conflict Record

```typescript
// When multiple sources disagree on a value:
interface ConflictRecord {
  value: unknown;           // The conflicting value
  sources: string[];        // Which sources provide this value
  conflict: true;           // Always true (literal type)
}

// Example:
const conflictExample: ConflictRecord = {
  value: 100,
  sources: [
    'GameFAQs guide FAQ 81516, Section G (Manion Gold Darkus bonus)',
    'Inferred from pattern (other cards have 100)',
  ],
  conflict: true,
};
// Note: Manion Gold card Darkus bonus listed as "10" in guide — likely typo for 100
```

---

## 10. Config Schemas

### balance.json

```typescript
interface BalanceConfig {
  g_power: {
    per_level_increment: number;    // Derived from (max - base) / max_level
    min_level: number;              // 1
    max_level: number;              // Derived from stat cap
    stat_max: number;               // 4 (from DS guide)
    stat_points_per_level: number;  // 1
  };
  battle: {
    timer_seconds: number;          // OUR DESIGN: 30
    domination_threshold: number;   // OUR DESIGN: 0.95 (bar pushed 95% = auto-lose)
    ability_card_window_seconds: number; // OUR DESIGN: 5
  };
  minigame: {
    result_min: number;             // 0.0
    result_max: number;             // 1.0
    g_power_per_result_point: number; // OUR DESIGN: 100 (0.0 = +0G, 1.0 = +100G)
  };
  field: {
    advantage_g_power: number;      // OUR DESIGN: +50
    disadvantage_g_power: number;   // OUR DESIGN: -50
    hazard_damage: {
      pyrus_lava: number;           // -10 (DS guide)
      darkus_lightning: number;     // -50 (DS guide)
    };
  };
  special_shot: {
    required_level: number;         // 3 (DS guide)
    meter_fill_rate_base: number;   // OUR DESIGN: 10 per second
    meter_fill_rate_losing: number; // OUR DESIGN: 20 per second
  };
  ai: {
    easy: {
      minigame_accuracy_min: number; // 0.3
      minigame_accuracy_max: number; // 0.5
      g_power_handicap: number;      // -50
      use_special_shots: boolean;    // false
    };
    normal: {
      minigame_accuracy_min: number; // 0.4
      minigame_accuracy_max: number; // 0.7
      g_power_handicap: number;      // 0
      use_special_shots: boolean;    // basic
    };
    hard: {
      minigame_accuracy_min: number; // 0.6
      minigame_accuracy_max: number; // 0.9
      g_power_handicap: number;      // 0
      use_special_shots: boolean;    // true
    };
  };
  story: {
    g_power_handicap: number;       // -100 (DS guide)
  };
}
```

### experience.json

```typescript
interface ExperienceConfig {
  xp_per_level: number[];          // XP required for each level (index 0 = level 1→2)
  xp_multipliers: {
    easy: number;                  // OUR DESIGN: 0.5
    normal: number;                // OUR DESIGN: 1.0
    hard: number;                  // OUR DESIGN: 1.5
  };
  xp_base_rewards: {
    per_bakugan_defeated: number;  // OUR DESIGN: 100
    gate_card_won: number;         // OUR DESIGN: 200
    brawl_won: number;             // OUR DESIGN: 500
  };
}
```

### shop.json

```typescript
interface ShopConfig {
  tiers: ShopTier[];
}

interface ShopTier {
  id: string;
  name: string;
  unlock_condition: string;        // e.g. "neo_challengers_tournament"
  bakugan: ShopBakugan[];
  gate_cards: ShopGateCard[];
  ability_cards: ShopAbilityCard[];
}

interface ShopBakugan {
  bakugan_id: string;
  price: number;
  start_g_power: number;
  attributes: string[];           // Available attributes
}

interface ShopGateCard {
  gate_card_id: string;
  price: number;
}

interface ShopAbilityCard {
  ability_card_id: string;
  price: number;
}
```

### arenas.json

```typescript
interface ArenasConfig {
  arenas: Arena[];
  power_up_spawn_rates: {
    g_power_boost: number;        // OUR DESIGN: 0.3 (30% chance per spawn point)
    experience_boost: number;     // OUR DESIGN: 0.2
    s_power_boost: number;        // OUR DESIGN: 0.1
  };
  power_up_values: {
    g_power_boost: number;        // +30 (DS guide)
    experience_boost: number;     // OUR DESIGN: +20% XP
    s_power_boost_small: number;  // OUR DESIGN: +25% meter
    s_power_boost_large: number;  // OUR DESIGN: +100% meter
  };
}
```

---

## 11. Data Pipeline

### Pipeline Stages

```
SOURCE → RAW → NORMALIZED → VALIDATED → DATABASE
```

### TypeScript Types

```typescript
// Stage 1: SOURCE — where the data came from
interface SourceRecord {
  source: string;
  source_url: string;
  raw_format: 'html' | 'json' | 'csv' | 'manual';
  fetched_at: string;
}

// Stage 2: RAW — unmodified data as fetched
interface RawRecord<T> {
  source: SourceRecord;
  data: T;
  raw_content: string;           // Original content preserved
  checksum: string;              // SHA-256 of raw_content
}

// Stage 3: NORMALIZED — cleaned, consistent format
interface NormalizedRecord<T> {
  source: SourceRecord;
  data: T;
  normalized_at: string;
  normalization_notes: string[];
}

// Stage 4: VALIDATED — passes Zod schema validation
interface ValidatedRecord<T> {
  source: SourceRecord;
  data: T;                       // Type-safe, validated
  validated_at: string;
  validation_notes: string[];
}

// Stage 5: DATABASE — stored in IndexedDB
interface DatabaseRecord<T> {
  id: string;                    // UUID
  data: T;
  source: SourceMetadata;
  conflicts: ConflictRecord[];
  created_at: string;
  updated_at: string;
}

// Pipeline function
async function importRecord<T>(
  raw: RawRecord<T>,
  schema: z.ZodType<T>
): Promise<DatabaseRecord<T>> {
  // 1. Normalize
  const normalized = normalize(raw);

  // 2. Validate
  const result = schema.safeParse(normalized.data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }

  // 3. Check conflicts
  const conflicts = checkConflicts(result.data, raw.source);

  // 4. Store
  return {
    id: crypto.randomUUID(),
    data: result.data,
    source: {
      source: raw.source.source,
      source_url: raw.source.source_url,
      source_notes: normalized.normalization_notes.join('; '),
      asset_license_status: 'reference_only_no_redistribution',
    },
    conflicts,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
```

### Raw Preservation

Every import preserves the original raw content alongside the normalized version. This allows:
- Re-import if normalization logic changes
- Audit trail for data provenance
- Conflict resolution when sources disagree

### Conflict Recording

When multiple sources provide different values for the same field:

```typescript
function checkConflicts<T>(data: T, source: SourceRecord): ConflictRecord[] {
  const conflicts: ConflictRecord[] = [];
  // Compare against existing records for same entity
  // If values differ, record conflict with all source references
  return conflicts;
}
```

Example: Manion Gold Gate Card Darkus bonus = "10" in guide (possible typo for 100). If another source says 100, record conflict:

```typescript
{
  value: 10,
  sources: ['GameFAQs guide FAQ 81516, Section G'],
  conflict: true,
}
```
