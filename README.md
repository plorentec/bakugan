# Bakugan Battle Brawlers — Web Game

A web-based recreation of the **Bakugan Battle Brawlers** Nintendo DS game, built with Next.js 15, Phaser 3, Three.js and TypeScript.

> 📖 **New here?** Read [`docs/PROJECT.md`](docs/PROJECT.md) — the **full project document** (systems, architecture, assets, sources, gaps).

## 🎮 Features

### Core Gameplay
- **Deck Builder**: Construct legal decks (3 Bakugan + 3 Gate Cards + 3 Ability Cards)
- **Arena Battles**: Throw Bakugan, move them across the field, make Stand on Gate Cards
- **Combat System**: 7-phase battle state machine with G-Power calculation
- **6 Minigames**: Scratch, Spin, Timing, Pop, Trace, Bound — each tied to Gate Card tier
- **Special Shots**: 6 attribute-specific special abilities (Pyrus Strike, Aquos Spiral, etc.)

### Progression
- **Story Mode**: 7 opponents, all with a −100 G handicap, unlocked sequentially
- **Shop**: 8 unlock tiers (38 Bakugan · 64 Gate Cards · 61 Ability Cards listed)
- **XP & Levels**: Level up to 11 and allocate stats (Speed, Defense, Control, Steering, Magnet)
- **Park Battles**: 26 postgame opponents with rewards and unlock rules

### Multiplayer
- **Local PvP**: Two players on same device, turn-based with 30s timer
- **vs AI**: 3 difficulty levels (Easy, Normal, Hard)

### Presentation
- **3D Models**: 20 Nintendo DS Bakugan models in a live Three.js viewer (`/models`)
- **2D Artwork**: 38/38 Bakugan artwork + 9/10 character portraits from the Bakugan Wiki
- **Spanish UI**: the whole interface (and card descriptions) is in Spanish (`lang="es"`)
- **Animations**: Framer Motion transitions, Phaser tweens, particle effects
- **Audio**: 15 procedural sound effects, 3 background music tracks (Web Audio API)

## 📊 Content

Verified counts from the data files:

| Category | Count | Source |
|----------|-------|--------|
| Bakugan | 38 | GameFAQs guide |
| Gate Cards | 103 (39 gold · 32 silver · 32 copper) | GameFAQs guide |
| Ability Cards | 97 (32 red · 32 green · 33 blue) | GameFAQs guide |
| Arenas | 8 | GameFAQs + Bakugan Wiki |
| Minigames | 6 | GameFAQs guide |
| Special Shots | 6 | GameFAQs + Bakugan Wiki |
| Story opponents | 7 | GameFAQs + Bakugan Wiki |
| Park Battle opponents | 26 | GameFAQs + Bakugan Wiki |
| Shop tiers | 8 | GameFAQs guide |
| 2D artwork (Bakugan) | 38 / 38 | Bakugan Wiki |
| 2D portraits (characters) | 9 / 10 — Kai missing | Bakugan Wiki |
| 3D models (DS rips) | 20 models → 19 / 38 roster | The Models Resource |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Other scripts (from `package.json`):

```bash
npm run build      # production build (11/11 static pages)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run validate   # data pipeline entry point
```

## 📁 Project Structure

```
bakugan/
├── src/
│   ├── app/                    # Next.js routes (8 pages)
│   │   ├── page.tsx            # Home / menu
│   │   ├── battle/             # Arena + vs AI + local PvP
│   │   ├── deck-builder/       # Deck construction (3+3+3)
│   │   ├── shop/               # Item shop (8 tiers)
│   │   ├── story/              # Story mode (7 opponents, portraits)
│   │   ├── level-up/           # Stat allocation
│   │   ├── collection/         # Bakudex
│   │   └── models/             # 3D model gallery (3D/2D badges)
│   ├── game/                   # Phaser 3 game (scenes, objects, EventBus)
│   ├── battle-engine/          # State machine, G-Power, AI, special shots
│   ├── effects/                # Extensible effects registry
│   ├── minigames/              # 6 minigame implementations
│   ├── data/                   # raw JSON, config, Zod schemas, pipeline
│   ├── stores/                 # Zustand stores (battle, deck, collection, progression, pvp)
│   ├── ui/                     # React components (cards, viewer, HUD, panels)
│   ├── lib/                    # Utilities (audio, money, xp, images, models…)
│   └── assets/                 # Source 3D models (20 Bakugan + 10 characters)
├── public/assets/              # Served artwork (38+9 WebP) and 3D models (20)
├── docs/                       # Documentation (see below)
├── data/raw/                   # Raw research extracts
└── odd/tasks/                  # Task trackers (10 completed phases)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5.7 (strict)
- **Game Engine**: Phaser 3 (Arcade Physics)
- **3D**: three.js (GLTF/OBJ loaders)
- **UI**: Tailwind CSS v4, Framer Motion
- **State**: Zustand · **Validation**: Zod · **Persistence**: IndexedDB (idb)
- **Build**: ~103 kB shared JS

## 📚 Documentation

| Document | What it covers |
|----------|----------------|
| [`docs/PROJECT.md`](docs/PROJECT.md) | **Full project document** — status, systems, architecture, assets, sources, gaps |
| [`docs/research.md`](docs/research.md) | Per-mechanic DS research (21 sections, GameFAQs-sourced) |
| [`docs/game-design.md`](docs/game-design.md) | Full game design document |
| [`docs/data-model.md`](docs/data-model.md) | TypeScript + Zod schemas |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and layering |
| [`docs/roadmap.md`](docs/roadmap.md) | Original 9-phase development roadmap |
| [`docs/bakugan-assets.md`](docs/bakugan-assets.md) | 3D models + 2D artwork research, coverage and licensing |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history (0.9.0 → 0.10.0) |

## 🎯 Sources & License

Primary source: **GameFAQs guide FAQ 81516** (author UFVKNP, v1.2) — all stats, cards and mechanics.
https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516

Supplementary sources:
- **Bakugan Wiki (Fandom)** — mechanics research + all 2D artwork and portraits (attributed per entry in `src/lib/image-manifest.ts`)
- **The Models Resource** — 20 DS Bakugan models, **non-commercial use only**
- **ProfLeonDias/Bakugan-Database** — roster reference

All game data and assets are used **internally for non-commercial/educational purposes with
attribution**; raw records carry `asset_license_status: reference_only_no_redistribution`.
Bakugan is a trademark of Spin Master Ltd.
