# Changelog

All notable changes to the Bakugan Battle Brawlers web game.

## [0.9.0] - 2026-09-24

### Added
- **FASE 1: Foundation** (`2e98ebd`)
  - Research: GameFAQs guide (38 Bakugan, 103 Gate Cards, 97 Ability Cards)
  - Research: Bakugan Wiki, ProfLeonDias/Bakugan-Database, Models Resource
  - Documentation: research.md, game-design.md, data-model.md, architecture.md, roadmap.md
  - Data models: 9 Zod schemas (Bakugan, GateCard, AbilityCard, Deck, Arena, Effects, etc.)
  - Config: balance.json, experience.json, shop.json, arenas.json
  - Pipeline: source → raw → normalize → validate → database skeleton
  - MVP dataset: 6 Bakugan, 12 Gate Cards, 12 Ability Cards

- **FASE 2: Deck Builder** (`59bd133`)
  - Full-screen 3-panel deck builder UI
  - 3+3+3 validation (3 Bakugan, 3 Gate 1G/1S/1C, 3 Ability 1R/1G/1B)
  - IndexedDB persistence with debounced auto-save
  - Collection tracking (owned vs locked)
  - Dark theme with game aesthetic

- **FASE 3: Arena + Launch** (`094b50d`)
  - Phaser 3 arena with Arcade Physics (top-down)
  - Throw mechanic (drag + release)
  - WASD/arrow key movement
  - Gate Card placement and Stand detection
  - Double Stand (auto-win)
  - Critical KO (collision knockback)
  - AI opponent (basic throw + movement)
  - React ↔ Phaser EventBus communication

- **FASE 4: Combat + G-Power** (`ac205e4`)
  - 7-phase battle state machine
  - G-Power calculator (base + gate + ability + minigame)
  - Effects engine (registry pattern, extensible)
  - Scratch Battle minigame (0.0-1.0 normalized)
  - Battle HUD (G-Power bars, timer, ability cards)
  - AI controller (Easy difficulty)

- **FASE 5: Minigames** (`aff9f1f`)
  - Spin Battle (Gold): circular drag rotation
  - Timing Battle (Silver): tap at target zone
  - Pop Battle (Silver): click targets before vanish
  - Trace Battle (Copper): follow infinity path
  - Bound Battle (Copper): charge, launch, catch
  - Platform detection (desktop/tablet/mobile)
  - AI accuracy scaling (Easy/Normal/Hard)

- **FASE 6: Shop + XP** (`1ea7c2e`)
  - Money system (earn from brawls)
  - XP and leveling (curve from config)
  - Stat point allocation (1 per level, max 4/stat)
  - G-Power growth (250 total L1→MAX)
  - Shop with 8 unlock tiers
  - Story mode (7 opponents, -100 G handicap)
  - Level-up screen with stat preview

- **FASE 7: Animations + Audio** (`5edbc0f`)
  - Framer Motion transitions (fadeIn, slideIn, zoomIn, cardFlip)
  - Phaser tweens (throw arc, stand glow, KO particles)
  - 15 procedural sound effects (Web Audio API)
  - 3 background music tracks (procedural)
  - Screen shake, glow effects, particle system

- **FASE 8: Full Content** (`284e392`)
  - Full Bakugan dataset: 38 entries (was 6)
  - Full Gate Card dataset: 103 entries (was 12)
  - Full Ability Card dataset: 97 entries (was 12)
  - 8 arenas with hazards
  - 6 Special Shots (per-attribute)
  - Field pickups (G-Power, Experience, S-Power)
  - 26 Park Battle opponents
  - Bakudex collection tracker

- **FASE 9: PvP Local** (`7cf83cc`)
  - Local PvP (two players, same device)
  - Turn-based flow with 30s timer
  - Player indicator (P1/P2)
  - WebSocket stubs for future online play

### Technical Details
- 83 TypeScript files
- 14,861 lines of code
- 10 pages (Home, Battle, Deck Builder, Shop, Story, Level-Up, Collection, PvP, etc.)
- Build: 102 kB shared JS
- All data sourced from GameFAQs guide (no invented stats)
