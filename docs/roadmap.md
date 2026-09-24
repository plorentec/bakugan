# Roadmap — Bakugan Battle Brawlers (Web)

## Phase 1: Research + Documentation + Data Models + First Data Import

**Status**: CURRENT
**Estimated Complexity**: M (Medium)

### Objectives
- Complete research of all DS mechanics from primary sources
- Write 5 documentation files (research, game design, data model, architecture, roadmap)
- Define TypeScript interfaces and Zod schemas for all domain entities
- Set up project structure and base configuration
- Import MVP dataset (6 Bakugan, 12 Gate Cards, 12 Ability Cards)
- Validate data pipeline works end-to-end

### Deliverables
- `docs/research.md` — Per-mechanic research with source attribution
- `docs/game-design.md` — Full game design document
- `docs/data-model.md` — TypeScript interfaces + Zod schemas
- `docs/architecture.md` — System architecture and directory structure
- `docs/roadmap.md` — This file
- `src/data/schemas/` — Zod schema files
- `src/data/seed/` — MVP dataset JSON files
- `src/data/config/` — balance.json, experience.json, shop.json, arenas.json
- `src/data/pipeline/` — Import pipeline skeleton
- `src/lib/db.ts` — IndexedDB setup
- Base directory structure created
- `npx tsc --noEmit` passes
- `npm run build` passes
- Deck validation script accepts legal deck, rejects illegal deck

### Dependencies
- Raw data files in `data/raw/`
- GameFAQs guide as primary source

### Acceptance Criteria
- [ ] 5 docs exist and reflect ONLY sourced DS behaviour (UNKNOWNs marked, none invented)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] Validator rejects illegal deck and accepts legal MVP deck
- [ ] Dataset entries carry source/source_url/source_notes/asset_license_status
- [ ] All TypeScript interfaces and Zod schemas compile without errors

---

## Phase 2: Deck Builder Functional

**Status**: PLANNED
**Estimated Complexity**: M (Medium)

### Objectives
- Build a functional deck builder UI
- Implement 3+3+3 validation (3 Bakugan, 3 Gate Cards, 1G/1S/1C, 3 Ability Cards, 1R/1G/1B)
- Display Bakugan stats, Gate Card bonuses, Ability Card effects
- Allow deck saving/loading via IndexedDB
- Show collection progress

### Deliverables
- Deck builder screen with drag-and-drop or click-to-add
- Real-time validation feedback (highlight illegal selections)
- Bakugan selection panel (show stats, G-Power, attributes)
- Gate Card selection panel (show tiers, bonuses, effects)
- Ability Card selection panel (show colors, effects)
- Deck summary view (show final deck composition)
- Save/load deck functionality
- Integration with Zustand deck store

### Dependencies
- Phase 1 (schemas, seed data, IndexedDB)
- UI component library (Tailwind + Framer Motion)

### Acceptance Criteria
- [ ] User can select 3 Bakugan (no duplicate name+attribute)
- [ ] User can select 3 Gate Cards (1 Gold, 1 Silver, 1 Copper)
- [ ] User can select 3 Ability Cards (1 Red, 1 Green, 1 Blue)
- [ ] Validation errors shown for illegal selections
- [ ] Deck saves to IndexedDB and loads on page refresh
- [ ] Collection shows which cards are owned vs locked
- [ ] `npx tsc --noEmit` and `npm run build` pass

---

## Phase 3: Basic Arena + Launch + Gate Cards + Stand

**Status**: PLANNED
**Estimated Complexity**: L (Large)

### Objectives
- Implement Phaser 3 arena scene with basic rendering
- Build Bakugan throw mechanic (click-drag-release)
- Implement Bakugan movement (arrow keys / WASD)
- Gate Card placement on field
- Basic stand mechanic (Bakugan stands when rolling over Gate Card)
- Double Stand detection (2 Bakugan on same card = auto-win)
- Critical KO detection (knock opponent off card)

### Deliverables
- Phaser 3 game canvas embedded in React
- Arena scene with field boundary and gate card slots
- Bakugan object with physics (arcade physics, top-down)
- Throw mechanic: force based on drag distance
- Movement: WASD/arrow keys, steering stat affects duration
- Gate Card visual on field (show bonuses, tier)
- Stand detection when Bakugan overlaps Gate Card
- Double Stand: auto-win animation and logic
- Critical KO: collision-based knockback
- React ↔ Phaser event bus
- Battle HUD overlay (G-Power display, phase indicator)

### Dependencies
- Phase 1 (data models, schemas)
- Phaser 3 setup and configuration

### Acceptance Criteria
- [ ] Bakugan can be thrown with variable force
- [ ] Bakugan moves with WASD/arrow keys
- [ ] Bakugan stands when rolling over a Gate Card
- [ ] Gate Cards display on field with correct bonuses
- [ ] Double Stand triggers auto-win
- [ ] Critical KO knocks opponent off card
- [ ] HUD shows current battle state
- [ ] Phaser and React communicate via events
- [ ] `npm run build` passes

---

## Phase 4: Combat + G-Power + Scratch Battle + Resolution

**Status**: PLANNED
**Estimated Complexity**: XL (Extra Large)

### Objectives
- Implement full battle state machine
- G-Power calculation with all modifiers
- Scratch Battle minigame (first minigame)
- Battle timer and G-Power bar visualization
- Ability Card play window
- Battle resolution (winner takes Gate Card)
- AI opponent (Easy difficulty)

### Deliverables
- Battle state machine: SETUP → APPLY_BONUSES → ABILITY_WINDOW → MINIGAME → G_POWER → RESOLUTION
- G-Power calculator with gate card, ability card, and power-up bonuses
- Scratch Battle minigame: mouse drag pattern, accuracy scoring, 0.0–1.0 result
- G-Power bars: animated, showing both players' effective G-Power
- Battle timer: 30-second countdown (configurable)
- Ability Card play: select from hand, apply effects via effects engine
- Battle resolution: winner determined, Gate Card awarded
- AI controller: random gate card placement, basic minigame performance
- Effects engine: ADD_G_POWER, REMOVE_G_POWER, SWAP_G_POWER handlers
- Battle log: shows what happened each step

### Dependencies
- Phase 3 (arena, throw, stand, movement)
- Effects engine foundation

### Acceptance Criteria
- [ ] Battle state machine progresses through all phases
- [ ] G-Power calculated correctly with all modifiers
- [ ] Scratch Battle minigame playable and produces 0.0–1.0 result
- [ ] G-Power bars animate during battle
- [ ] Timer counts down and ends battle
- [ ] Ability Cards can be played during ability window
- [ ] Winner takes Gate Card after battle
- [ ] AI opponent makes moves (Easy difficulty)
- [ ] Effects engine applies ADD_G_POWER and SWAP_G_POWER
- [ ] `npm run build` passes

---

## Phase 5: Remaining Minigames

**Status**: PLANNED
**Estimated Complexity**: L (Large)

### Objectives
- Implement all 6 minigame types
- Normalize results to 0.0–1.0
- Platform adaptation (desktop, tablet, mobile)
- Minigame selection based on Gate Card tier

### Deliverables
- Spin Battle: mouse wheel / drag-rotate, accuracy scoring
- Timing Battle: keyboard/tap at cues, rhythm-based scoring
- Pop Battle: click/tap targets, reaction-based scoring
- Trace Battle: mouse/finger trace, pattern accuracy scoring
- Bound Battle: catch/deflect objects, success rate scoring
- Minigame base class with shared interface
- Platform detection and input adaptation
- Minigame selection: Gold → Scratch/Spin, Silver → Timing/Pop, Copper → Trace/Bound
- AI minigame performance: difficulty-scaled accuracy

### Dependencies
- Phase 4 (battle engine, minigame base)

### Acceptance Criteria
- [ ] All 6 minigames playable and produce 0.0–1.0 result
- [ ] Minigame selected based on Gate Card tier
- [ ] Desktop: keyboard/mouse input works
- [ ] Tablet: touch input works
- [ ] Mobile: touch input works (simplified)
- [ ] AI performs at difficulty-scaled accuracy
- [ ] Minigame results correctly influence G-Power battle
- [ ] `npm run build` passes

---

## Phase 6: Shop + Inventory + XP + Levels

**Status**: PLANNED
**Estimated Complexity**: L (Large)

### Objectives
- Build shop UI with tier-based unlocking
- Implement money system (earn from brawls, spend in shop)
- XP and leveling system
- Stat point allocation
- G-Power growth per level
- Story mode progression (7 opponents)

### Deliverables
- Shop screen: browse items by tier, purchase with money
- Money display in HUD
- Brawl rewards: per-Bakugan defeated + power-up bonuses
- Double payout if opponent never won Gate Cards
- XP display and level-up notification
- Level-up screen: allocate stat points
- G-Power growth visualization
- Story mode: 7 opponents with decreasing G-Power handicap
- Opponent AI: Normal difficulty for story, Hard for postgame
- Shop tiers unlock after tournament victories

### Dependencies
- Phase 4 (battle resolution, money/XP rewards)
- Shop data (shop.json)

### Acceptance Criteria
- [ ] Shop displays items by tier with prices
- [ ] Player can purchase items with earned money
- [ ] Money earned after each brawl
- [ ] XP awarded after each brawl
- [ ] Level-up triggers stat point allocation
- [ ] G-Power increases with level
- [ ] Story mode has 7 opponents
- [ ] Opponent G-Power reduced by 100 in story mode
- [ ] Shop tiers unlock after tournament victories
- [ ] `npm run build` passes

---

## Phase 7: Animations + Audio + Visual Effects

**Status**: PLANNED
**Estimated Complexity**: L (Large)

### Objectives
- Polish all UI animations
- Add sound effects and music
- Visual effects for battles, abilities, special shots
- Card flip animations
- Bakugan throw/stand/open animations

### Deliverables
- Framer Motion transitions for all screens
- Card flip/reveal animations
- Bakugan throw animation (arc trajectory)
- Bakugan stand animation (open/close)
- Battle entry animation
- G-Power bar animations
- Ability Card play effects
- Special Shot visual effects (per-attribute)
- Sound effects: throw, stand, battle start, minigame, win/lose
- Background music: menu, arena, battle
- Power-up collection effects
- Arena hazard visual effects

### Dependencies
- Phases 3–6 (all gameplay mechanics)

### Acceptance Criteria
- [ ] All screen transitions animated
- [ ] Card flip animations smooth
- [ ] Bakugan throw/stand animations working
- [ ] Battle visual effects (G-Power bars, ability effects)
- [ ] Sound effects for key actions
- [ ] Background music plays in menu and battle
- [ ] No performance issues on target devices
- [ ] `npm run build` passes

---

## Phase 8: Full Content (More Bakugan, Cards, Arenas)

**Status**: PLANNED
**Estimated Complexity**: XL (Extra Large)

### Objectives
- Import full 38-Bakugan roster
- Import all 103 Gate Cards
- Import all 97 Ability Cards
- Implement all 7 elemental arenas + Battle Arena
- Field hazards and movement elements
- Field-pickup Ability Cards (12 cards)
- Special Shots (6 attributes)
- Complete story mode and postgame

### Deliverables
- Full Bakugan dataset (38 entries with all stats)
- Full Gate Card dataset (103 entries with all bonuses and effects)
- Full Ability Card dataset (97 entries with all effects)
- All 8 arenas with hazards, trampolines, boost pads
- Field-pickup card system (12 cards)
- Special Shot system (6 attributes, meter, activation)
- Complete shop with all tiers
- Postgame Park battles
- Bakudex with all entries

### Dependencies
- Phases 1–7 (all systems working)
- Additional data research for any gaps

### Acceptance Criteria
- [ ] 38 Bakugan importable and playable
- [ ] 103 Gate Cards with correct bonuses and effects
- [ ] 97 Ability Cards with correct effects
- [ ] All 8 arenas functional with hazards
- [ ] Field-pickup cards spawn and can be collected
- [ ] Special Shots work for all 6 attributes
- [ ] Complete story mode (7 opponents)
- [ ] Postgame Park battles available
- [ ] Bakudex tracks all discoveries
- [ ] `npm run build` passes

---

## Phase 9: PvP Online (If Applicable)

**Status**: PLANNED (CONDITIONAL)
**Estimated Complexity**: XL (Extra Large)

### Objectives
- Real-time multiplayer via WebSockets
- Matchmaking system
- Spectator mode
- Anti-cheat measures
- Leaderboards

### Deliverables
- WebSocket server for real-time communication
- Room/lobby system
- Matchmaking by skill level
- Real-time battle synchronization
- Replay system
- Leaderboards (win/loss, XP, collection)
- Anti-cheat: server-side G-Power validation
- Spectator mode for ongoing battles

### Dependencies
- Phases 1–8 (complete single-player game)
- Server infrastructure
- Database for player accounts

### Acceptance Criteria
- [ ] Two players can connect and battle
- [ ] Battle state synchronized in real-time
- [ ] Matchmaking finds opponents
- [ ] No desync issues
- [ ] Anti-cheat prevents manipulation
- [ ] Leaderboards track player progress
- [ ] Spectator mode works
- [ ] `npm run build` passes
