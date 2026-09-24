# Game Design Document — Bakugan Battle Brawlers (Web)

## 1. Game Overview

**What we're building**: A web-based recreation of "Bakugan Battle Brawlers" (Nintendo DS, 2009, Now Production/Activision), grounded in documented DS mechanics. Players build decks of Bakugan, Gate Cards, and Ability Cards, throw Bakugan onto a 3D arena, battle via minigames, and progress through story mode and postgame content.

**Inspiration**: The DS game's unique blend of physical toy aesthetics, real-time arena movement, gate card placement strategy, and minigame-based combat. We preserve the core loop while adapting input methods for web (mouse/touch/keyboard instead of stylus/D-pad/microphone).

**Target platforms**: Desktop browsers (Chrome, Firefox, Edge), tablet browsers, mobile browsers. Primary: desktop. Responsive layout adapts UI for touch devices.

**Tech foundation**: Next.js 15 (React 19) for UI/shell, Phaser 3 for arena/minigame rendering, Zustand for state management, Zod for data validation, IndexedDB for persistence.

---

## 2. Core Gameplay Loop

```
Build Deck → Enter Arena → Place Gate Card → Throw Bakugan →
  ↓ (Bakugan lands on Gate Card)
Stand Check → (if opponent also standing) → Battle Sequence:
  Apply Bonuses → Play Ability Card → Minigame → G-Power Resolution → Winner Takes Card
  ↓
Win 3 Gate Cards → Brawl Won → Earn Money + XP → Shop / Level Up → Build Better Deck
  ↓
Repeat with harder opponents
```

The fundamental cycle:
1. **Prepare**: Build deck in Deck Builder (3 Bakugan + 3 Gate + 3 Ability)
2. **Engage**: Enter arena, place Gate Cards, throw Bakugan
3. **Battle**: When opposing Bakugan share a Gate Card, resolve via minigame
4. **Progress**: Earn money, XP, unlock new cards and Bakugan
5. **Repeat**: Stronger deck → tougher opponents → higher stakes

---

## 3. MVP Scope

### In Scope (Phases 1–6)

| Feature | MVP Count | Notes |
|---|---|---|
| Bakugan | 6 (one per attribute) | Serpenoid (All/Pyrus), Juggernoid (All/Aquos), Robotallion (All/Subterra), Falconeer (All/Haos), Saurus (All/Darkus), Manion (Subterra/Ventus) |
| Gate Cards | 12 (4G/4S/4C) | From "From the Start" shop tier |
| Ability Cards | 12 (4R/4G/4B) | From "From the Start" shop tier |
| Arenas | 1 | Standard Arena (no hazards) |
| Minigames | 6 | Scratch, Spin, Timing, Pop, Trace, Bound |
| Shop | Yes | "From the Start" tier only |
| Deck Builder | Yes | Enforces 3+3+3 validation |
| XP/Levels | Yes | G-Power growth, stat allocation |
| AI Opponent | Yes | 3 difficulties |
| Special Shots | No | Phase 7+ |
| Field-pickup Cards | No | Phase 5+ |
| Field Hazards | No | Phase 6+ |
| PvP Online | No | Phase 9 (if applicable) |

### Out of Scope (MVP)

- Special Shots (require level 3+ and meter system — Phase 7)
- Field-pickup Ability Cards (12 additional cards — Phase 5)
- Per-arena hazards and movement elements (Phase 6)
- Full 38-Bakugan roster (Phase 8)
- Full 103 Gate Cards / 97 Ability Cards (Phase 8)
- Multiple arenas (Phase 6+)
- Tag Team / Battle Royale modes (Phase 9)
- Online PvP (Phase 9)

---

## 4. Bakugan System

### Attributes

Six elemental attributes: Pyrus (fire), Aquos (water), Subterra (earth), Haos (light), Darkus (dark), Ventus (wind). Each Bakugan has one or more available attributes.

### Stats

Five stats, each ranging 0–4 (max based on highest printed values in DS guide):

| Stat | Effect | DS Reference |
|---|---|---|
| Speed | Movement speed, starting velocity bonus | "Movement speed. Flicking faster off Touch Screen gives starting speed bonus." |
| Defense | Resistance to Critical KOs | "Resistance to attacks once stood. Higher defense = less vulnerable to Critical KOs." |
| Control | Turn responsiveness, stop-and-turn speed | "How responsive controls are. Tighter turns, faster stop-and-turn." |
| Steering | Duration of movement control before auto-stand | "How long you can control Bakugan on field before it stops and you lose the throw." |
| Magnet | Stand probability when rolling over Gate Card | "Strength of magnet when rolling over Gate Card. Easier to stand when moving quickly." |

### G-Power

- Base G-Power: per-Bakugan, per-attribute (e.g. Serpenoid Pyrus = 190)
- Growth: +per_level_increment per level, total gap L1→MAX = 250
- Max G-Power: base + 250
- Effective G-Power: base + growth + gate_bonus + ability_bonus + power_up_bonus

### Leveling

- XP earned from battles (scaled by difficulty)
- Each level: +1 to any stat (player choice), +G-Power increment
- Max stat value: 4
- Stat points: level × 1 (total stat points = level)

### MVP Roster (6 Bakugan)

| Bakugan | Attribute | G-Power | Spd | Def | Ctr | Str | Mag |
|---|---|---|---|---|---|---|---|
| Serpenoid | Pyrus (All) | 190 | 2 | 1 | 1 | 1 | 1 |
| Juggernoid | Aquos (All) | 200 | 1 | 2 | 1 | 1 | 1 |
| Robotallion | Subterra (All) | 200 | 1 | 1 | 2 | 1 | 1 |
| Falconeer | Haos (All) | 210 | 3 | 1 | 1 | 1 | 2 |
| Saurus | Darkus (All) | 210 | 1 | 1 | 1 | 2 | 1 |
| Manion | Ventus (Subterra/Haos/Ventus) | 300 | 1 | 1 | 1 | 2 | 1 |

---

## 5. Card System

### Gate Cards

Three tiers with distinct properties:

**Gold Gate Cards**:
- High G-Power bonuses per attribute
- Depict a specific Bakugan (bonus applied twice if that Bakugan stands on it)
- Minigame: Scratch Battle or Spin Battle
- MVP count: 4

**Silver Gate Cards**:
- Various G-Power bonuses (high to low)
- No special effects
- Minigame: Timing Battle or Pop Battle
- MVP count: 4

**Copper Gate Cards**:
- Higher highs and lower lows than Silver
- All have additional effects (doubling G-Power, preventing Ability Cards, etc.)
- Minigame: Trace Battle or Bound Battle
- MVP count: 4

### Ability Cards

Three colors with distinct activation rules:

**Red Ability Cards**:
- Activated during battle (L/R buttons in DS → button press in web)
- Effects: restart battle, give bonus, disable opponent's minigame
- Unused Red cards return to deck after battle
- MVP count: 4

**Green Ability Cards**:
- Specific use, most variety
- Effects: skip battle (highest G wins), cancel bonuses, character-specific +200 G-Power
- Consumed after use (inferred from DS guide)
- MVP count: 4

**Blue Ability Cards**:
- Every Blue card gives a flat G-Power boost
- Many are conditional (attribute combos, gate card ownership, position)
- Consumed after use (inferred from DS guide)
- MVP count: 4

---

## 6. Arena System

### Standard Arena (MVP)

- No elemental advantage/disadvantage
- No hazards
- Simple rectangular field with trampolines and boost pads
- Gate card placement slots (4–6 positions)
- Power-up spawn points

### Elemental Arenas (Phase 6+)

Seven elemental arenas, each with:
- **Advantage**: +G-Power for matching attribute
- **Disadvantage**: -G-Power for weak attribute
- **Hazards**: Attribute-specific environmental effects
- **Movement elements**: Trampolines (launch in facing direction), boost pads (shoot in facing direction)

| Arena | Advantage | Disadvantage | Key Hazard |
|---|---|---|---|
| Aquos | Aquos | Pyrus | Fountains push back non-Aquos |
| Subterra | Subterra | Ventus | Quicksand slows non-Subterra |
| Ventus | Ventus | Subterra | Vents blow non-Ventus up/away |
| Pyrus | Pyrus | Aquos | Geysers repel non-Pyrus |
| Haos | Haos | Darkus | Floating cubes launch non-Haos |
| Darkus | Darkus | Haos | Lightning strikes non-Darkus (-50 G) |
| Battle Arena | None | None | Postgame, bigger than Standard |

### Arena Layout

Each arena has:
- Field boundary (size varies per arena)
- Gate card positions (fixed slots)
- Power-up spawn points (3 difficulty tiers)
- Trampoline positions
- Boost pad positions
- Hazard trigger zones (elemental arenas only)

---

## 7. Battle System

### State Machine

```
SETUP
  → APPLY_GATE_BONUSES (attribute G-Power from Gate Card)
  → APPLY_COPPER_EFFECTS (Copper card special effects)
  → ABILITY_CARD_WINDOW (player plays 1 Ability Card, or passes)
  → MINIGAME (performed by both players simultaneously)
  → G_POWER_BATTLE (G-Power bars displayed, timer counts down)
  → RESOLUTION (winner determined, Gate Card awarded)
  → END_TURN
```

### G-Power Calculation

```
effective_g_power = base_g_power
  + gate_card_bonus[ bakugan.attribute ]
  + copper_card_effect
  + ability_card_bonus
  + power_up_bonus
  + arena_advantage (if applicable)
  - arena_disadvantage (if applicable)
  - arena_hazard_damage (if applicable)
```

### Win Conditions

1. **Battle Victory**: Higher G-Power after minigame + timer
2. **Double Stand**: Two of your Bakugan on same Gate Card → auto-win
3. **Critical KO**: Knock opponent's Bakugan off Gate Card → win without battle
4. **Standing Lock**: All 3 Bakugan standing + skip turn → auto-win Gate Card

### Brawl Win

First player to win 3 Gate Cards wins the brawl.

---

## 8. Minigame System

### Six Minigame Types

Each minigame maps to specific Gate Card tiers:

| Minigame | Gate Tier | Input Method (Desktop) | Input Method (Mobile) | Result |
|---|---|---|---|---|
| Scratch Battle | Gold | Mouse drag pattern | Finger trace | 0.0–1.0 |
| Spin Battle | Gold | Mouse wheel / drag-rotate | Two-finger twist | 0.0–1.0 |
| Timing Battle | Silver | Keyboard press at cues | Tap at cues | 0.0–1.0 |
| Pop Battle | Silver | Mouse click targets | Tap targets | 0.0–1.0 |
| Trace Battle | Copper | Mouse drag shape | Finger trace shape | 0.0–1.0 |
| Bound Battle | Copper | Mouse/keyboard catch | Tap/swipe catch | 0.0–1.0 |

### Normalization

All minigames produce a result in range 0.0–1.0:
- 0.0 = complete failure
- 0.5 = average performance
- 1.0 = perfect performance

Result maps to G-Power gain via configurable formula in `balance.json`.

### Platform Adaptation

- **Desktop**: Keyboard + mouse input. Full precision. Arrow keys / WASD for movement.
- **Tablet**: Touch input. On-screen joystick. Tap for actions. Reduced precision compensated by wider timing windows.
- **Mobile**: Touch input. Simplified UI. Larger hit targets. Tilt option for movement (optional).

### Minigame Timing

Minigames run simultaneously for both players. AI performs at difficulty-scaled accuracy:
- Easy: 0.3–0.5 result range
- Normal: 0.4–0.7 result range
- Hard: 0.6–0.9 result range

---

## 9. Special Shots

**Requirements**: Bakugan level 3+ AND full Special Meter.

**Meter fill**: Fills during battle, faster when losing. Full meter = ready to use.

**Activation**: Press Special button before throw. Consumes meter.

**Per-attribute effects** (from DS guide):

| Shot | Attribute | Effect |
|---|---|---|
| Pyrus Strike | Pyrus | Cloaked in fire. Hits stood Bakugan → Critical KO |
| Aquos Spiral | Aquos | Infinite Steering for this throw |
| Subterra Quake | Subterra | Lands on Gate Card with opponent → Critical KO. Also clears adjacent Gate Cards |
| Ventus Storm | Ventus | Touches stood Bakugan → launched and removed. Gains defense shield on stand |
| Haos Lightning | Haos | Touches stood Bakugan → that Bakugan AND all other opposing Bakugan removed |
| Darkus Critical | Darkus | Intangible. Immune to Critical KOs from Pyrus Strike. Vulnerable to Subterra Quake |

**AI use**: Hard difficulty only. AI uses Special Shots when meter is full and advantageous.

**Note**: Special Shots are Phase 7+ — not in MVP scope.

---

## 10. Progression

### XP Curve

- XP earned from battles: base XP × difficulty multiplier × opponent tier
- XP required per level: configurable in `experience.json`
- Levels increase G-Power by fixed increment

### Level Benefits

- +1 stat point per level (allocate to any of 5 stats)
- +G-Power growth per level
- Level 3+: unlock Special Shots
- Higher levels: unlock shop tiers

### Stat Allocation

Player chooses which stat to increase each level. Stats capped at 4. Total stat points = level number.

### Unlock Conditions

Shop tiers unlock after winning specific tournaments:
1. From the Start (initial)
2. After Neo Challengers Tournament
3. After Supreme Tag Team Tournament
4. After Brave Battlers Tournament
5. After Maximum Power Tournament
6. After Bakugan Master Cup Tournament
7. After Completing Story Mode
8. Available from Park Battles

### Story Mode

- 7 opponents (one per attribute arena + postgame)
- Opponent G-Power reduced by 100 in story mode
- Postgame Park battles use full G-Power values

---

## 11. Economy

### Money Sources

- Brawl victory: per-Bakugan defeated bonus + power-up pickups
- Double payout: if opponent never won any Gate Cards
- Experience Boost power-ups: increase money earned

### Shop Prices (MVP tier)

| Item Type | Price Range |
|---|---|
| Basic Bakugan | 1,100 – 1,700 |
| Gold Gate Cards | 250 |
| Silver Gate Cards | 200 |
| Copper Gate Cards | 300 |
| Red Ability Cards | 500 – 1,000 |
| Green Ability Cards | 500 |
| Blue Ability Cards | 300 |

### Economy Balance

- Starting money: [OUR DESIGN] 2,000 (enough for 1–2 Bakugan + cards)
- Brawl reward: [OUR DESIGN] 500–2,000 based on opponent tier
- Shop prices match DS values for authenticity
- Later tiers significantly more expensive (up to 84,000 for endgame)

---

## 12. AI System

### Three Difficulty Levels

**Easy**:
- Random Gate Card placement
- Fixed Bakugan order (left to right)
- No Special Shots
- Minigame accuracy: 0.3–0.5
- G-Power handicap: -50 (configurable)

**Normal**:
- Weighted Gate Card placement (attribute matching)
- Fixed Bakugan order
- Basic Special Shots (level 3+, meter full)
- Minigame accuracy: 0.4–0.7
- G-Power handicap: 0

**Hard**:
- Optimal Gate Card placement
- Fixed Bakugan order (DS-accurate behavior)
- Full Special Shots with strategy
- Minigame accuracy: 0.6–0.9
- G-Power handicap: 0

### Information Parity

AI operates with same information as player:
- Sees Gate Card bonuses (but not hidden opponent cards)
- Knows own G-Power and opponent's visible G-Power
- Can calculate effective G-Power with known bonuses

### Story Mode AI

- Uses G-Power reduced by 100 from base [VERBATIM from DS guide]
- Fixed Bakugan order [VERBATIM from DS guide]
- Gate Card placement: random [VERBATIM from DS guide]

---

## 13. Effects Engine

### Design Principle

The effects engine is **extensible and JSON-driven**. No effect logic is hardcoded. New effects are added by:
1. Defining the effect in `effects/registry.ts`
2. Implementing the effect handler
3. Adding the effect to card data JSON

### Effect Types (Enum)

```typescript
enum EffectType {
  // G-Power modifications
  ADD_G_POWER = 'ADD_G_POWER',
  REMOVE_G_POWER = 'REMOVE_G_POWER',
  SWAP_G_POWER = 'SWAP_G_POWER',
  DOUBLE_G_POWER = 'DOUBLE_G_POWER',
  HALVE_G_POWER = 'HALVE_G_POWER',
  SET_G_POWER = 'SET_G_POWER',

  // Battle control
  RESTART_BATTLE = 'RESTART_BATTLE',
  SKIP_BATTLE = 'SKIP_BATTLE',
  PREVENT_ABILITY_CARDS = 'PREVENT_ABILITY_CARDS',
  PREVENT_MINIGAME = 'PREVENT_MINIGAME',
  DOUBLE_MINIGAME_INPUT = 'DOUBLE_MINIGAME_INPUT',

  // Movement
  INFINITE_STEERING = 'INFINITE_STEERING',
  MOVE_TO_GATE_CARD = 'MOVE_TO_GATE_CARD',
  REDO_THROW = 'REDO_THROW',
  EXTRA_THROW = 'EXTRA_THROW',
  SWITCH_BAKUGAN = 'SWITCH_BAKUGAN',

  // Special
  FILL_SPECIAL_METER = 'FILL_SPECIAL_METER',
  CRITICAL_KO = 'CRITICAL_KO',
  IMMUNE_CRITICAL_KO = 'IMMUNE_CRITICAL_KO',
  LAUNCH_OPPONENT = 'LAUNCH_OPPONENT',
  REMOVE_ALL_OPPONENTS = 'REMOVE_ALL_OPPONENTS',
  SWAP_GATE_CARD = 'SWAP_GATE_CARD',
  RETURN_ABILITY_CARD = 'RETURN_ABILITY_CARD',

  // Character-specific
  CHARACTER_G_POWER_BOOST = 'CHARACTER_G_POWER_BOOST',

  // Conditional
  CONDITIONAL_BOOST = 'CONDITIONAL_BOOST',
  ATTRIBUTE_COMBO_BOOST = 'ATTRIBUTE_COMBO_BOOST',
  GATE_CARD_OWNERSHIP_BOOST = 'GATE_CARD_OWNERSHIP_BOOST',
  POSITION_BOOST = 'POSITION_BOOST',
}
```

### Effect Application Pipeline

```
1. Parse effect definition from card data
2. Evaluate conditions (if conditional)
3. Calculate magnitude (base value + modifiers)
4. Apply to target (self, opponent, field, all)
5. Resolve conflicts (order of operations)
6. Emit event for UI update
```

### Effect Definition (JSON-driven)

```typescript
interface EffectDefinition {
  type: EffectType;
  magnitude?: number;
  target: 'self' | 'opponent' | 'all_active' | 'field';
  condition?: EffectCondition;
  character?: string; // for CHARACTER_G_POWER_BOOST
  attributes?: Attribute[]; // for ATTRIBUTE_COMBO_BOOST
}
```

---

## 14. Balance Philosophy

### Configuration Files

All balance values are externalized in JSON files:

- **`balance.json`**: G-Power formulas, minigame scaling, battle timing, hazard damage
- **`experience.json`**: XP curves, level-up thresholds, XP multipliers
- **`shop.json`**: Item prices, unlock tiers, money rewards
- **`arenas.json`**: Arena layouts, hazard positions, power-up spawns, advantage/disadvantage values

### Design Principles

1. **DS-authentic where documented**: Use exact values from the DS guide when available
2. **Our design where undocumented**: Fill gaps with reasonable, tunable values marked `[OUR DESIGN]`
3. **All values configurable**: Every number can be adjusted via JSON without code changes
4. **Balance testing**: Run automated balance simulations before tuning
5. **Transparency**: Every balance value has a source annotation (DS guide section or "OUR DESIGN")

### Tuning Approach

- Start with DS-authentic values
- Playtest and adjust via JSON config
- Automated balance checks: simulate 1000 battles, verify win rates are reasonable
- Document every change in config version history
