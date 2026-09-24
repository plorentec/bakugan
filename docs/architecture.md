# Architecture — Bakugan Battle Brawlers (Web)

## 1. Directory Structure

```
bakugan/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home/menu screen
│   │   ├── deck-builder/
│   │   │   └── page.tsx              # Deck builder screen
│   │   ├── battle/
│   │   │   └── page.tsx              # Battle arena screen
│   │   ├── shop/
│   │   │   └── page.tsx              # Shop screen
│   │   ├── collection/
│   │   │   └── page.tsx              # Collection/Bakudex screen
│   │   └── api/                      # API routes (if needed)
│   │
│   ├── game/                         # Phaser 3 game integration
│   │   ├── PhaserGame.tsx            # React wrapper for Phaser canvas
│   │   ├── scenes/
│   │   │   ├── BootScene.tsx         # Asset loading
│   │   │   ├── ArenaScene.tsx        # Main arena gameplay
│   │   │   └── MinigameScene.tsx     # Minigame rendering
│   │   ├── objects/
│   │   │   ├── BakuganObject.ts      # Bakugan sprite/physics
│   │   │   ├── GateCardObject.ts     # Gate Card on field
│   │   │   ├── PowerUpObject.ts      # Power-up pickup
│   │   │   └── HazardObject.ts       # Arena hazard
│   │   └── config/
│   │       └── PhaserConfig.ts       # Phaser game config
│   │
│   ├── battle-engine/                # Battle logic (React-independent)
│   │   ├── state-machine.ts          # Battle state machine
│   │   ├── g-power-calculator.ts     # G-Power calculation
│   │   ├── battle-context.ts         # Battle state context
│   │   ├── ai-controller.ts          # AI decision making
│   │   └── types.ts                  # Battle engine types
│   │
│   ├── effects/                      # Extensible effects engine
│   │   ├── registry.ts               # Effect type registry
│   │   ├── handlers/                 # Individual effect handlers
│   │   │   ├── g-power.ts           # ADD_G_POWER, REMOVE_G_POWER, etc.
│   │   │   ├── battle-control.ts    # RESTART_BATTLE, SKIP_BATTLE, etc.
│   │   │   ├── movement.ts          # INFINITE_STEERING, MOVE_TO_GATE_CARD, etc.
│   │   │   ├── special.ts           # CRITICAL_KO, IMMUNE_CRITICAL_KO, etc.
│   │   │   └── conditional.ts       # CONDITIONAL_BOOST, ATTRIBUTE_COMBO_BOOST, etc.
│   │   ├── conditions.ts            # Condition evaluation
│   │   ├── resolver.ts              # Effect conflict resolution
│   │   └── types.ts                 # Effect types
│   │
│   ├── minigames/                    # 6 minigame implementations
│   │   ├── base-minigame.ts         # Abstract minigame base class
│   │   ├── scratch-battle.ts        # Scratch pattern minigame
│   │   ├── spin-battle.ts           # Spin rotation minigame
│   │   ├── timing-battle.ts         # Timing/rhythm minigame
│   │   ├── pop-battle.ts            # Target popping minigame
│   │   ├── trace-battle.ts          # Shape tracing minigame
│   │   ├── bound-battle.ts          # Bouncing catch minigame
│   │   └── types.ts                 # Minigame types
│   │
│   ├── data/                         # Data schemas and import pipeline
│   │   ├── schemas/                  # Zod schemas
│   │   │   ├── bakugan.schema.ts
│   │   │   ├── gate-card.schema.ts
│   │   │   ├── ability-card.schema.ts
│   │   │   ├── deck.schema.ts
│   │   │   ├── arena.schema.ts
│   │   │   └── effects.schema.ts
│   │   ├── pipeline/                 # Import pipeline
│   │   │   ├── source.ts            # Source record handling
│   │   │   ├── raw.ts               # Raw data preservation
│   │   │   ├── normalize.ts         # Data normalization
│   │   │   ├── validate.ts          # Schema validation
│   │   │   └── database.ts          # IndexedDB storage
│   │   ├── config/                   # Balance/config JSONs
│   │   │   ├── balance.json
│   │   │   ├── experience.json
│   │   │   ├── shop.json
│   │   │   └── arenas.json
│   │   └── seed/                     # MVP dataset
│   │       ├── bakugan.json          # 6 Bakugan
│   │       ├── gate-cards.json       # 12 Gate Cards
│   │       ├── ability-cards.json    # 12 Ability Cards
│   │       └── arenas.json           # 1 Standard Arena
│   │
│   ├── ui/                           # React UI components
│   │   ├── screens/
│   │   │   ├── MenuScreen.tsx        # Main menu
│   │   │   ├── BattleScreen.tsx      # Battle HUD overlay
│   │   │   ├── DeckBuilderScreen.tsx # Deck builder
│   │   │   ├── ShopScreen.tsx        # Shop
│   │   │   └── CollectionScreen.tsx  # Bakudex
│   │   ├── components/
│   │   │   ├── HUD.tsx               # In-battle HUD
│   │   │   ├── GPowerBar.tsx         # G-Power display
│   │   │   ├── AbilityCardHand.tsx   # Ability card selection
│   │   │   ├── Timer.tsx             # Battle timer
│   │   │   └── SpecialMeter.tsx      # Special shot meter
│   │   └── shared/
│   │       ├── Card.tsx              # Card display component
│   │       ├── AttributeIcon.tsx     # Element icons
│   │       └── Button.tsx            # Styled button
│   │
│   ├── shop/                         # Shop logic
│   │   ├── shop-store.ts            # Zustand shop state
│   │   ├── shop-service.ts          # Purchase logic
│   │   └── types.ts                 # Shop types
│   │
│   ├── collection/                   # Collection/Bakudex
│   │   ├── collection-store.ts      # Zustand collection state
│   │   ├── bakudex.ts               # Bakudex tracking
│   │   └── types.ts                 # Collection types
│   │
│   ├── deck-builder/                 # Deck builder logic
│   │   ├── deck-store.ts            # Zustand deck state
│   │   ├── deck-validator.ts        # 3+3+3 validation
│   │   └── types.ts                 # Deck types
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── game-store.ts            # Global game state
│   │   ├── player-store.ts          # Player profile, money, XP
│   │   └── persistence.ts           # IndexedDB/localStorage adapter
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── db.ts                    # IndexedDB setup
│   │   ├── random.ts                # Seeded RNG
│   │   └── constants.ts             # Game constants
│   │
│   └── types/                        # Shared TypeScript types
│       ├── bakugan.ts               # Bakugan types
│       ├── cards.ts                 # Card types
│       ├── battle.ts                # Battle types
│       ├── effects.ts               # Effect types
│       └── arena.ts                 # Arena types
│
├── public/
│   ├── assets/
│   │   ├── bakugan/                  # Bakugan sprites/models
│   │   ├── cards/                    # Card images
│   │   ├── arenas/                   # Arena backgrounds
│   │   ├── ui/                       # UI elements
│   │   ├── audio/                    # Sound effects
│   │   └── placeholders/             # Placeholder images
│   └── data/                         # Public data files
│       ├── balance.json
│       ├── experience.json
│       ├── shop.json
│       └── arenas.json
│
├── data/
│   └── raw/                          # Raw research data
│       ├── gamefaqs-guide.md
│       ├── profleonidas-database.md
│       └── models-resource.md
│
├── docs/                             # Documentation
│   ├── research.md
│   ├── game-design.md
│   ├── data-model.md
│   ├── architecture.md
│   └── roadmap.md
│
├── odd/
│   └── tasks/                        # ODD task files
│       └── bakugan-phase1-foundation.md
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── .gitignore
```

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Routing, SSR, file-based structure |
| **UI** | React 19 | Component rendering, state |
| **Styling** | Tailwind CSS | Responsive design, utility classes |
| **Animation** | Framer Motion | UI transitions, card animations |
| **Game Engine** | Phaser 3 | Arena rendering, physics, minigames |
| **State** | Zustand | Game state, collection, deck, shop |
| **Validation** | Zod | Schema validation, type inference |
| **Persistence** | IndexedDB (via idb) | MVP data storage |
| **Database** | PostgreSQL + Prisma | Future production (prepared, not MVP) |
| **Language** | TypeScript | Full type safety |

### Why This Stack

- **Next.js 15**: App Router provides clean routing. React Server Components reduce client bundle.
- **Phaser 3**: Mature 2D/2.5D game engine. Handles physics, sprites, input, rendering. Battle arena and minigames need real-time rendering.
- **Zod**: Runtime validation + static type inference from single source. Perfect for data schemas.
- **Zustand**: Minimal boilerplate, works outside React (battle engine can dispatch events), no providers needed.
- **IndexedDB**: Browser-native, handles large datasets (103+ cards), survives page reloads.

---

## 3. Phaser 3 Integration

### Embedding Pattern

Phaser renders into a `<canvas>` element. React manages the UI shell (menus, HUD, cards). Communication happens via event emitter.

```
┌─────────────────────────────────────┐
│  React (Next.js)                    │
│  ┌─────────────────────────────┐    │
│  │  UI Shell                   │    │
│  │  - Menu screens             │    │
│  │  - Deck builder             │    │
│  │  - Shop                     │    │
│  │  - Collection               │    │
│  │  - Battle HUD overlay       │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Phaser Canvas              │    │
│  │  (embedded in React)        │    │
│  │  - Arena rendering          │    │
│  │  - Bakugan movement         │    │
│  │  - Gate Card placement      │    │
│  │  - Minigame rendering       │    │
│  │  - Power-up effects         │    │
│  └─────────────────────────────┘    │
│                                     │
│  Event Bus: React ↔ Phaser          │
│  - Phaser emits: bakugan_stood,     │
│    battle_start, minigame_complete  │
│  - React emits: ability_card_played,│
│    throw_requested, special_shot    │
└─────────────────────────────────────┘
```

### Communication Pattern

```typescript
// Event bus for React ↔ Phaser communication
type GameEvent =
  | { type: 'BAKUGAN_THROWN'; payload: { bakuganId: string; force: number } }
  | { type: 'BAKUGAN_STOOD'; payload: { bakuganId: string; gateCardId: string } }
  | { type: 'BATTLE_START'; payload: { self: BakuganState; opponent: BakuganState } }
  | { type: 'MINIGAME_COMPLETE'; payload: { result: number; type: MinigameType } }
  | { type: 'ABILITY_CARD_PLAYED'; payload: { cardId: string } }
  | { type: 'SPECIAL_SHOT_ACTIVATED'; payload: { attribute: Attribute } }
  | { type: 'POWER_UP_COLLECTED'; payload: { type: PowerUpType } }
  | { type: 'GATE_CARD_PLACED'; payload: { gateCardId: string; position: Position } };

// React component emits events to Phaser
function BattleScreen() {
  const handleThrow = (force: number) => {
    gameEventBus.emit({ type: 'BAKUGAN_THROWN', payload: { bakuganId, force } });
  };

  return (
    <div>
      <PhaserGame ref={gameRef} />
      <HUD onThrow={handleThrow} />
    </div>
  );
}

// Phaser scene listens for React events
class ArenaScene extends Phaser.Scene {
  create() {
    gameEventBus.on('BAKUGAN_THROWN', (event) => {
      this.throwBakugan(event.payload.bakuganId, event.payload.force);
    });
  }

  // Phaser emits events to React
  onBakuganStood(bakuganId: string, gateCardId: string) {
    gameEventBus.emit({ type: 'BAKUGAN_STOOD', payload: { bakuganId, gateCardId } });
  }
}
```

### Phaser Config

```typescript
const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Top-down view, no gravity
      debug: false,
    },
  },
  scene: [BootScene, ArenaScene, MinigameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
```

---

## 4. Battle Engine

### Independence from React

The battle engine is a pure TypeScript module with no React imports. It receives inputs via function calls and emits outputs via callbacks/events. React subscribes to events for UI updates.

```typescript
// battle-engine/types.ts
interface BattleEngine {
  // Input methods (called by React or AI)
  placeGateCard(gateCardId: string, position: Position): void;
  throwBakugan(bakuganId: string, force: number): void;
  playAbilityCard(cardId: string): void;
  activateSpecialShot(): void;
  performMinigame(result: number): void;

  // Output (events emitted)
  on(event: BattleEvent, handler: (data: unknown) => void): void;

  // State access
  getState(): BattleState;
  getPhase(): BattlePhase;
}

type BattlePhase =
  | 'SETUP'
  | 'PLACE_GATE_CARDS'
  | 'THROW_BAKUGAN'
  | 'APPLY_GATE_BONUSES'
  | 'APPLY_COPPER_EFFECTS'
  | 'ABILITY_CARD_WINDOW'
  | 'MINIGAME'
  | 'G_POWER_BATTLE'
  | 'RESOLUTION'
  | 'END_TURN';

type BattleEvent =
  | 'phase_changed'
  | 'g_power_updated'
  | 'ability_card_window_opened'
  | 'minigame_started'
  | 'battle_resolved'
  | 'brawl_won';
```

### State Machine

```typescript
// battle-engine/state-machine.ts
class BattleStateMachine {
  private phase: BattlePhase = 'SETUP';
  private state: BattleState;

  transition(action: BattleAction): void {
    switch (this.phase) {
      case 'SETUP':
        if (action.type === 'GATE_CARDS_PLACED') {
          this.phase = 'THROW_BAKUGAN';
        }
        break;
      case 'THROW_BAKUGAN':
        if (action.type === 'BAKUGAN_STOOD') {
          this.checkForBattle();
        }
        break;
      case 'APPLY_GATE_BONUSES':
        this.applyGateBonuses();
        this.phase = 'APPLY_COPPER_EFFECTS';
        break;
      // ... more transitions
    }
  }
}
```

### G-Power Calculator

```typescript
// battle-engine/g-power-calculator.ts
function calculateEffectiveGPower(
  bakugan: BakuganState,
  gateCard: GateCard,
  abilityCard: AbilityCard | null,
  arena: Arena,
  powerUps: PowerUp[]
): number {
  let gPower = bakugan.base_g_power + (bakugan.level * PER_LEVEL_INCREMENT);

  // Gate Card bonus
  gPower += gateCard.bonuses[bakugan.attribute];

  // Gold card: bonus twice if depicted bakugan
  if (gateCard.tier === 'gold' && gateCard.depicted_bakugan === bakugan.name) {
    gPower += gateCard.bonuses[bakugan.attribute]; // Second application
  }

  // Copper card effect
  if (gateCard.effect) {
    gPower = applyCopperEffect(gateCard.effect, gPower, bakugan);
  }

  // Ability Card bonus
  if (abilityCard) {
    gPower = applyAbilityCardEffect(abilityCard, gPower, bakugan);
  }

  // Arena advantage/disadvantage
  if (arena.advantage_attribute === bakugan.attribute) {
    gPower += ADVANTAGE_G_POWER;
  }
  if (arena.disadvantage_attribute === bakugan.attribute) {
    gPower += DISADVANTAGE_G_POWER; // Negative value
  }

  // Power-ups
  for (const pu of powerUps) {
    if (pu.type === 'g_power_boost') {
      gPower += G_POWER_BOOST_VALUE;
    }
  }

  return gPower;
}
```

---

## 5. Effects Engine

### Extensible, JSON-Driven Design

Effects are defined in card data JSON and processed by a registry of handlers. Adding a new effect requires:
1. Add enum value to `EffectType`
2. Implement handler function
3. Register in `effectRegistry`
4. Use in card data JSON

### Registry Pattern

```typescript
// effects/registry.ts
type EffectHandler = (
  effect: EffectDefinition,
  context: BattleContext
) => BattleState;

const effectRegistry = new Map<string, EffectHandler>();

export function registerEffect(type: string, handler: EffectHandler): void {
  effectRegistry.set(type, handler);
}

export function applyEffect(
  effect: EffectDefinition,
  context: BattleContext
): BattleState {
  const handler = effectRegistry.get(effect.type);
  if (!handler) {
    console.warn(`No handler for effect type: ${effect.type}`);
    return context.state;
  }
  return handler(effect, context);
}
```

### Effect Application Pipeline

```
1. PARSE: Load effect definition from card JSON
2. EVALUATE: Check conditions (attribute match, gate tier, etc.)
3. CALCULATE: Compute magnitude (base + modifiers)
4. RESOLVE: Determine target (self, opponent, field)
5. APPLY: Execute effect on battle state
6. EMIT: Send event for UI update
7. LOG: Record effect for battle log
```

### Conflict Resolution

When multiple effects modify the same value:

```typescript
// effects/resolver.ts
function resolveEffectConflicts(
  effects: EffectDefinition[],
  context: BattleContext
): BattleState {
  // Sort by priority (defined in effect definition)
  const sorted = effects.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  let state = context.state;
  for (const effect of sorted) {
    state = applyEffect(effect, { ...context, state });
  }
  return state;
}
```

---

## 6. Data Pipeline

### Pipeline Stages

```
SOURCE → RAW → NORMALIZED → VALIDATED → DATABASE
```

### Implementation

```typescript
// data/pipeline/source.ts
interface SourceRecord {
  source: string;
  source_url: string;
  raw_format: 'html' | 'json' | 'csv' | 'manual';
  fetched_at: string;
}

// data/pipeline/raw.ts
interface RawRecord<T> {
  source: SourceRecord;
  data: T;
  raw_content: string;
  checksum: string; // SHA-256
}

// data/pipeline/normalize.ts
function normalizeBakugan(raw: RawRecord<unknown>): NormalizedRecord<Bakugan> {
  // Clean names, standardize attribute names, fill defaults
  return {
    source: raw.source,
    data: {
      id: crypto.randomUUID(),
      name: cleanName(raw.data.name),
      attributes: normalizeAttributes(raw.data.attributes),
      // ... map all fields
    },
    normalized_at: new Date().toISOString(),
    normalization_notes: ['Standardized attribute names', 'Filled default values'],
  };
}

// data/pipeline/validate.ts
function validate<T>(record: NormalizedRecord<T>, schema: z.ZodType<T>): ValidatedRecord<T> {
  const result = schema.safeParse(record.data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return {
    source: record.source,
    data: result.data,
    validated_at: new Date().toISOString(),
    validation_notes: [],
  };
}

// data/pipeline/database.ts
async function store<T>(record: ValidatedRecord<T>, storeName: string): Promise<void> {
  const db = await openDB();
  await db.put(storeName, {
    id: crypto.randomUUID(),
    data: record.data,
    source: {
      source: record.source.source,
      source_url: record.source.source_url,
      source_notes: record.validation_notes.join('; '),
      asset_license_status: 'reference_only_no_redistribution',
    },
    conflicts: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}
```

### Raw Preservation

Every import preserves:
- Original raw content (string)
- SHA-256 checksum
- Source metadata
- Normalization notes

This enables re-import, audit, and conflict resolution.

---

## 7. State Management

### Zustand Stores

```typescript
// stores/game-store.ts
interface GameState {
  screen: 'menu' | 'deck-builder' | 'battle' | 'shop' | 'collection';
  setScreen: (screen: GameState['screen']) => void;

  // Battle state
  currentBattle: BattleState | null;
  startBattle: (opponent: Opponent) => void;
  endBattle: (result: BattleResult) => void;
}

// stores/player-store.ts
interface PlayerState {
  name: string;
  money: number;
  xp: number;
  level: number;
  stat_points: number;
  allocated_stats: PlayerStats;

  // Actions
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addXp: (amount: number) => void;
  allocateStat: (stat: keyof PlayerStats) => void;
}

// stores/deck-store.ts
interface DeckState {
  currentDeck: Deck | null;
  savedDecks: Deck[];

  // Actions
  setDeck: (deck: Deck) => void;
  saveDeck: () => void;
  validateDeck: () => ValidationResult;
}

// stores/shop-store.ts
interface ShopState {
  unlockedTiers: string[];
  purchasedItems: string[];

  // Actions
  unlockTier: (tierId: string) => void;
  purchase: (itemId: string, price: number) => boolean;
  isUnlocked: (tierId: string) => boolean;
}
```

### Store Communication

Zustand stores communicate via:
1. **Direct access**: `useGameStore.getState().currentBattle`
2. **Subscriptions**: `useGameStore.subscribe((state) => ...)`
3. **Events**: Battle engine emits events that stores respond to

---

## 8. Persistence

### MVP: IndexedDB

```typescript
// lib/db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BakuganDB extends DBSchema {
  bakugan: {
    key: string;
    value: DatabaseRecord<Bakugan>;
  };
  gate_cards: {
    key: string;
    value: DatabaseRecord<GateCard>;
  };
  ability_cards: {
    key: string;
    value: DatabaseRecord<AbilityCard>;
  };
  decks: {
    key: string;
    value: Deck;
  };
  player: {
    key: string;
    value: PlayerState;
  };
}

async function openBakuganDB(): Promise<IDBPDatabase<BakuganDB>> {
  return openDB<BakuganDB>('bakugan-battle-brawlers', 1, {
    upgrade(db) {
      db.createObjectStore('bakugan');
      db.createObjectStore('gate_cards');
      db.createObjectStore('ability_cards');
      db.createObjectStore('decks');
      db.createObjectStore('player');
    },
  });
}
```

### Future: PostgreSQL + Prisma

Prepared for multiplayer/online:
- Prisma schema mirrors IndexedDB structure
- Same TypeScript types used for both
- Migration path: export IndexedDB → import to PostgreSQL
- Not implemented in MVP

---

## 9. UI Architecture

### Screen Management

```
App (Next.js layout)
├── MenuScreen (home)
├── DeckBuilderScreen
├── BattleScreen
│   ├── PhaserGame (canvas)
│   └── HUD overlay (React)
├── ShopScreen
└── CollectionScreen
```

### Framer Motion Animations

```typescript
// Card flip animation
<motion.div
  initial={{ rotateY: 180 }}
  animate={{ rotateY: 0 }}
  transition={{ duration: 0.6 }}
>
  <CardFront />
</motion.div>

// Battle entry animation
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 200 }}
>
  <BakuganDisplay />
</motion.div>

// Screen transitions
<AnimatePresence mode="wait">
  <motion.div
    key={currentScreen}
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -100, opacity: 0 }}
  >
    {screenComponent}
  </motion.div>
</AnimatePresence>
```

### HUD System

```typescript
// Battle HUD overlay (renders on top of Phaser canvas)
function BattleHUD() {
  const { phase, gPower, timer, abilityCards } = useBattleState();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* G-Power bars */}
      <GPowerBar self={gPower.self} opponent={gPower.opponent} />

      {/* Battle timer */}
      <Timer seconds={timer} />

      {/* Ability card hand */}
      <AbilityCardHand
        cards={abilityCards}
        onPlay={handlePlayCard}
        disabled={phase !== 'ABILITY_CARD_WINDOW'}
      />

      {/* Special meter */}
      <SpecialMeter level={bakuganLevel} meter={specialMeter} />

      {/* Phase indicator */}
      <PhaseIndicator phase={phase} />
    </div>
  );
}
```

### Responsive Design

- **Desktop**: Full UI, keyboard + mouse input
- **Tablet**: Touch-optimized, larger buttons, on-screen joystick
- **Mobile**: Simplified HUD, larger touch targets, landscape orientation recommended

Tailwind responsive classes: `sm:`, `md:`, `lg:` breakpoints.
