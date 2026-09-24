# Bakugan Battle Brawlers — Web Game

A web-based recreation of the **Bakugan Battle Brawlers** Nintendo DS game, built with Next.js 15, Phaser 3, and TypeScript.

## 🎮 Features

### Core Gameplay
- **Deck Builder**: Construct legal decks (3 Bakugan + 3 Gate Cards + 3 Ability Cards)
- **Arena Battles**: Throw Bakugan, move them across the field, make Stand on Gate Cards
- **Combat System**: Full battle state machine with G-Power calculation
- **6 Minigames**: Scratch, Spin, Timing, Pop, Trace, Bound — each tied to Gate Card tier
- **Special Shots**: 6 attribute-specific special abilities (Pyrus Strike, Aquos Spiral, etc.)

### Progression
- **Story Mode**: 7 opponents with decreasing G-Power handicap
- **Shop**: 8 unlock tiers with 38 Bakugan, 103 Gate Cards, 97 Ability Cards
- **XP & Levels**: Level up to allocate stats (Speed, Defense, Control, Steering, Magnet)
- **Park Battles**: 26 postgame opponents for advanced players

### Multiplayer
- **Local PvP**: Two players on same device, turn-based with 30s timer
- **vs AI**: 3 difficulty levels (Easy, Normal, Hard)

### Polish
- **Animations**: Framer Motion transitions, Phaser tweens, particle effects
- **Audio**: 15 procedural sound effects, 3 background music tracks (all generated via Web Audio API)
- **Visual Effects**: Screen shake, glow effects, animated G-Power bars

## 📊 Content

| Category | Count | Source |
|----------|-------|--------|
| Bakugan | 38 | GameFAQs guide |
| Gate Cards | 103 | GameFAQs guide |
| Ability Cards | 97 | GameFAQs guide |
| Arenas | 8 | GameFAQs + Bakugan Wiki |
| Minigames | 6 | GameFAQs guide |
| Special Shots | 6 | GameFAQs + Bakugan Wiki |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Game Engine**: Phaser 3 (Arcade Physics)
- **UI**: React 19, Tailwind CSS v4, Framer Motion
- **State**: Zustand
- **Validation**: Zod
- **Persistence**: IndexedDB (via idb)
- **Build**: 102 kB shared JS

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
bakugan/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx           # Home
│   │   ├── battle/page.tsx    # Battle arena
│   │   ├── deck-builder/      # Deck construction
│   │   ├── shop/              # Item shop
│   │   ├── story/             # Story mode
│   │   ├── level-up/          # Stat allocation
│   │   └── collection/        # Bakudex
│   ├── game/                   # Phaser 3 game
│   │   ├── scenes/            # Boot, Arena
│   │   ├── objects/           # Bakugan, GateCard, PowerUp
│   │   └── events/            # EventBus
│   ├── battle-engine/          # Battle logic (React-independent)
│   ├── effects/                # Extensible effects engine
│   ├── minigames/              # 6 minigame implementations
│   ├── data/                   # Schemas, config, raw data
│   ├── stores/                 # Zustand stores
│   ├── ui/                     # React components
│   └── lib/                    # Utilities (audio, money, xp, etc.)
├── docs/                        # Documentation
├── data/raw/                    # Raw research data
└── odd/tasks/                   # ODD task trackers
```

## 📚 Documentation

- `docs/research.md` — Per-mechanic research (21 sections)
- `docs/game-design.md` — Full game design document
- `docs/data-model.md` — TypeScript + Zod schemas
- `docs/architecture.md` — System architecture
- `docs/roadmap.md` — 9-phase development roadmap

## 🎯 Source Data

All game data comes from the **GameFAQs guide** (FAQ 81516, author UFVKNP, v1.2):
- https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516

Supplementary data from:
- Bakugan Wiki (Fandom)
- The Models Resource
- ProfLeonDias/Bakugan-Database

## 📝 License

This project is for educational purposes. Bakugan is a trademark of Spin Master Ltd.
