# Bakugan Battle Brawlers (Web) — Project Document

A web recreation of the **Bakugan Battle Brawlers** Nintendo DS game: players build a legal deck
(3 Bakugan + 3 Gate Cards + 3 Ability Cards), throw Bakugan across an arena, win Gate Cards through
six minigames, and climb from Story Mode into postgame content. Every stat, card and mechanic is
transcribed from documented DS sources — nothing is invented. **Status: all 10 phases are complete**
and the game builds and type-checks cleanly; the newest work unit (0.10.0) added real 2D artwork,
3D model wiring and this document.

## Quick path

1. `npm install`
2. `npm run dev` → open http://localhost:3000
3. Verify: the home menu loads in Spanish; `/models` lists all 38 Bakugan with `3D`/`2D` badges.

---

## 1. Status

| Check | Result |
|-------|--------|
| Phases complete | **10 / 10** (FASE 1 → 10) |
| `npm run typecheck` | ✅ clean (no errors) |
| `npm run build` | ✅ 11/11 static pages, 103 kB shared JS |
| `npm run validate` | ✅ runs (pipeline is still a staged skeleton) |
| Routes | 8 (`/`, `/battle`, `/deck-builder`, `/shop`, `/story`, `/level-up`, `/collection`, `/models`) |
| Code size | 98 TS/TSX files · 17,834 lines |

### Phases (from `odd/tasks/` and git history)

| # | Phase | Commit |
|---|-------|--------|
| 1 | Foundation — research, docs, Zod schemas, MVP dataset | `2e98ebd` |
| 2 | Deck Builder — 3+3+3 validation, IndexedDB | `59bd133` |
| 3 | Arena + Launch — Phaser throw, movement, Stand | `094b50d` |
| 4 | Combat + G-Power — 7-phase state machine, effects | `ac205e4` |
| 5 | Minigames — all 6 types, platform detection | `aff9f1f` |
| 6 | Shop + XP — money, levels, stat allocation, Story Mode | `1ea7c2e` |
| 7 | Animations + Audio — Framer Motion, tweens, Web Audio | `5edbc0f` |
| 8 | Full Content — 38/103/97 dataset, 8 arenas, 26 park battles | `284e392` |
| 9 | PvP Local — two players, same device, 30 s timer | `7cf83cc` |
| 10 | Final Integration — README, CHANGELOG, verification | `b51b03f` |

> **Note:** `docs/roadmap.md` lists 9 phases and ends at "Phase 9: PvP Online" (still future work).
> The delivered plan lives in `odd/tasks/`, where phase 9 is *local* PvP and phase 10 is final
> integration. Read the roadmap as the original plan, `odd/tasks/` as what actually shipped.

> **Note (2026-09-26):** the 0.10.0 artwork work unit — `public/assets/images/`,
> `src/lib/image-manifest.ts`, `odd/tasks/bakugan-artwork-images.md` and the component changes in
> `src/` — landed in commit `fd801af`; this document and the README refresh follow in the docs
> commit right after it.

---

## 2. Tech stack

Versions are the ones declared in `package.json`.

| Layer | Choice |
|-------|--------|
| Framework | Next.js `^15.1.0` (App Router) + React `^19.0.0` |
| Language | TypeScript `^5.7.0` (`strict`, path alias `@/*` → `src/*`) |
| Arena/minigame renderer | Phaser `^3.90.0` (Arcade physics) |
| 3D viewer | three `^0.186.1` (+ `@types/three ^0.186.0`) — GLTFLoader / OBJLoader |
| Styling | Tailwind CSS `^4.3.3`, PostCSS, Autoprefixer |
| Animation | framer-motion `^13.4.3` |
| State | zustand `^5.0.15` (5 stores) |
| Validation | zod `^3.23.0` (schemas in `src/data/schemas/`) |
| Persistence | IndexedDB via idb `^8.0.3` (deck, collection, progression stores) |
| IDs | nanoid `^5.0.0` |
| Declared but not imported yet | `openai ^4.70.0`, `better-sqlite3 ^11.6.0` (no references in `src/`) |

---

## 3. Commands

Exact scripts from `package.json`:

| Command | What it does |
|---------|--------------|
| `npm install` | Install dependencies |
| `npm run dev` | Next.js dev server → http://localhost:3000 |
| `npm run build` | Production build (verified: 11/11 static pages) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` — type check only, no output on success |
| `npm run validate` | `tsx src/data/pipeline/index.ts` — data pipeline (stage skeleton; prints SOURCE→RAW→NORMALIZE→VALIDATE→DATABASE status) |

---

## 4. Content inventory (verified)

Counts were read directly from the JSON data files and cross-checked with a second command.

| Content | Count | Where |
|---------|-------|-------|
| Bakugan | **38** | `src/data/raw/bakugan.json` |
| Gate Cards | **103** (39 gold · 32 silver · 32 copper) | `src/data/raw/gate-cards.json` |
| Ability Cards | **97** (32 red · 32 green · 33 blue) | `src/data/raw/ability-cards.json` |
| Arenas | **8** | `src/data/config/arenas.json` |
| Minigames | **6** | `src/minigames/` |
| Special Shots | **6** (one per attribute) | `src/battle-engine/special-shots.ts` |
| Shop tiers | **8** | `src/data/config/shop.json` |
| Story opponents | **7** | `src/lib/story.ts` |
| Park battle opponents | **26** | `src/lib/park-battles.ts` |
| AI difficulties | **3** (easy / normal / hard) | `src/data/config/balance.json` |
| Sound effects / music tracks | **15 / 3** (all procedural, Web Audio API) | `src/lib/audio.ts` |
| Bakugan artwork (2D) | **38 / 38** | `public/assets/images/bakugan/` |
| Character portraits (2D) | **9 / 10** (Kai missing) | `public/assets/images/characters/` |
| 3D model directories | **20** Bakugan · **10** characters (reference) | `public/assets/models/bakugan/`, `src/assets/models/` |

Arenas: Standard Arena, Aquos Field, Subterra Field, Ventus Field, Pyrus Field, Haos Field,
Darkus Field, Battle Arena.

Shop tiers list **38 Bakugan, 64 Gate Cards and 61 Ability Cards** as unlock entries (the full
catalog is 103 / 97 — the rest of the catalog is not part of the shop unlock list). All 163 shop
prices are currently **0 G**.

---

## 5. Gameplay systems

### Deck builder (`/deck-builder`)
- Full-screen three-panel UI: Bakugan · Gate Cards · Ability Cards.
- Legal deck = **3 Bakugan + 3 Gate Cards (exactly 1 gold, 1 silver, 1 copper) + 3 Ability Cards
  (exactly 1 red, 1 green, 1 blue)**; duplicates are rejected.
- Validation lives in `src/stores/deck-store.ts` (+ `validateDeck` in `src/data/schemas/deck.ts`);
  error strings are in Spanish.
- Persists to IndexedDB through `saveDeck`/`loadDeck` (`src/lib/db.ts`) — auto-saved from the
  deck summary whenever validation changes, plus an explicit save button. Deck selection is not
  filtered by ownership (any catalog item can be added).

### Battle engine (`src/battle-engine/`)
- **7-phase state machine**: `SETUP → REVEAL_GATE → APPLY_BONUSES → ABILITY_WINDOW → MINIGAME →
  G_POWER → RESOLUTION` (transition table in `types.ts`).
- **G-Power calculator**: `base + level growth + gate bonus + ability bonus + minigame bonus`
  (gold cards double the bonus for their depicted Bakugan); stat bonuses are layered on top by
  `src/lib/stats.ts`. Tuning lives in `src/data/config/balance.json`.
- **Effects engine** (`src/effects/`): registry pattern — add a handler to support a new effect type;
  defaults cover G-Power add/remove/swap, battle control, field pickups.
- **Special Shots**: 6 attribute abilities (Pyrus Strike, Aquos Spiral, Subterra Quake, Ventus Storm,
  Haos Lightning, Darkus Critical); unlocked at Bakugan level 3 via a special meter.
- Field pickups spawn during battle: G-Power, Experience and S-Power boosts.

### Arena (Phaser, `src/game/`)
- Top-down arena with Arcade physics; throw by drag + release, move with WASD/arrows, Stand on a
  Gate Card to claim it, double Stand wins instantly, collision can cause a Critical KO.
- Scenes: `BootScene`, `ArenaScene`; objects: `BakuganObject`, `GateCardObject`, `PowerUpObject`.
- React ↔ Phaser communicate through `src/game/events/EventBus.ts`.

### Minigames (`src/minigames/`)
| Tier | Minigames |
|------|-----------|
| Gold | Scratch, Spin |
| Silver | Timing, Pop |
| Copper | Trace, Bound |

- `manager.ts` picks the minigame from the Gate Card tier; `platform.ts` detects desktop/tablet/mobile;
  AI accuracy scales with difficulty.

### Progression: shop, XP, levels
- XP curve in `src/data/config/experience.json`; base rewards per defeat / Gate Card / brawl win,
  multiplied by AI difficulty.
- Max level **11**: +25 G per level (250 G total from L1 → L11), **1 stat point per level**,
  stat cap **4** across Speed, Defense, Control, Steering, Magnet.
- Shop: **8 unlock tiers**; tier `start` is open by default, `story_complete` unlocks when Story
  Mode is finished — tournament/park tiers carry unlock conditions in `shop.json` but nothing
  calls `unlockShopTier` for them yet. Prices currently 0 G.
- Starting money: 2,000 G; money is earned from wins.

### Story mode (`/story`)
- **7 opponents** in order: Dan, Marucho, Julie, Runo, Shun, Masquerade, Marduk — one per attribute
  plus the final boss. Every opponent plays with a **−100 G handicap** (`balance.json → story`).
- Opponents unlock sequentially; the page now shows a **real portrait** for each one
  (`getCharacterImage`), falling back to the initial letter only if no portrait exists.

### Park battles (`src/lib/park-battles.ts`)
- **26 postgame opponents** with 1v1 / tag / battle-royale types, per-battle rewards
  (4,000–30,000 G), difficulty 1–5 and `win_N_park_battles` unlock rules.
- Helpers: `getUnlockedParkBattles`, `isParkBattleUnlocked`, `getTotalParkBattles`.

### Local PvP and vs AI (`/battle`)
- Battle menu offers **vs AI** and **local PvP** (two players, one device).
- Local PvP is turn-based with a **30 s turn timer** and a P1/P2 indicator; AI has three difficulties.
- WebSocket stubs exist (`src/lib/websocket-stub.ts`, `src/lib/pvp-manager.ts`) for future online play.

---

## 6. Architecture

| Layer | Location | Role |
|-------|----------|------|
| Routes | `src/app/` | Next.js pages (all client components with a shared root layout) |
| UI | `src/ui/` | Presentational React: cards, images, 3D viewer, HUD, panels, effects |
| Phaser game | `src/game/` | Canvas rendering, physics, sprites; talks to React via EventBus |
| Battle logic | `src/battle-engine/`, `src/effects/` | React-independent rules: state machine, G-Power, AI, effects |
| Minigames | `src/minigames/` | Self-contained minigame implementations behind a manager |
| Data | `src/data/` | `raw/` JSON datasets, `config/` tuning, `schemas/` Zod, `pipeline/` import |
| State | `src/stores/` | Zustand stores: battle, deck, collection, progression, pvp |
| Utilities | `src/lib/` | audio, music, money, xp, stats, story, park battles, models, images, db |
| Assets | `public/assets/`, `src/assets/` | Served artwork/models vs. source/reference models |

### Directory tree (as it exists)

```
bakugan/
├── src/
│   ├── app/                    # Next.js App Router — 8 routes
│   │   ├── layout.tsx          # root layout (lang="es")
│   │   ├── page.tsx            # home menu
│   │   ├── battle/page.tsx     # arena + vs AI + local PvP
│   │   ├── deck-builder/page.tsx
│   │   ├── shop/page.tsx
│   │   ├── story/page.tsx
│   │   ├── level-up/page.tsx   # stat allocation
│   │   ├── collection/page.tsx # Bakudex
│   │   └── models/page.tsx     # 3D model gallery
│   ├── game/                   # Phaser 3: PhaserGame, scenes/, objects/, events/, config/
│   ├── battle-engine/          # state-machine, g-power-calculator, ai-controller, special-shots
│   ├── effects/                # registry + handlers/ (g-power, battle-control, field-pickup)
│   ├── minigames/              # 6 minigames + manager, platform, base-minigame, types
│   ├── data/
│   │   ├── raw/                # bakugan.json, gate-cards.json, ability-cards.json
│   │   ├── config/             # arenas, balance, experience, shop (.json)
│   │   ├── schemas/            # Zod schemas (bakugan, gate-card, ability-card, deck, arena…)
│   │   └── pipeline/           # source → raw → normalize → validate → database
│   ├── stores/                 # battle-store, deck-store, collection-store, progression-store, pvp-store
│   ├── ui/                     # components/, battle/, deck-builder/, shop/, effects/
│   ├── lib/                    # 16 modules: audio, music, sounds, money, xp, stats, story,
│   │                           # park-battles, image-manifest, model-paths, asset-tracker,
│   │                           # model-converter, db, animations, pvp-manager, websocket-stub
│   └── assets/                 # source 3D models: models/bakugan (20), models/characters (10)
├── public/assets/
│   ├── images/bakugan/         # 38 WebP artwork
│   ├── images/characters/      # 9 WebP portraits
│   └── models/bakugan/         # 20 model dirs served to the browser
├── docs/                       # 7 documents (see §8)
├── data/raw/                   # source extracts: gamefaqs-guide, bakugan-wiki, models-resource,
│                               # profleonidas-database (.md)
├── odd/tasks/                  # 10 phase task files + artwork task file
├── package.json, tsconfig.json, next.config.ts, postcss.config.mjs
└── Dockerfile, docker-compose.yml, Caddyfile
```

---

## 7. Assets

### 3D models — 20 Nintendo DS Bakugan

- **Source**: The Models Resource, *Bakugan Battle Brawlers* DS/DSi rips (non-commercial terms).
- **Coverage**: 20 model directories; **19 of 38** roster entries resolve to a real model
  (17 exact name matches + 2 aliases), so **19 Bakugan have no 3D model**.
- **Aliases** (added in `src/lib/model-paths.ts`):
  `Delta Dragonoid II → Delta Dragonoid`, `Preyas II → Preyas Angelo`.
- **Formats on disk**: `Model.obj` + `Model.fbx` + `Model.dae` + `Model.mtl` + `mat1..N.png`.
  Registry prefers **GLB > OBJ**, but **0 GLB files exist** — `src/lib/model-converter.ts` can drive
  Blender headless yet is not wired into any script, and its gltf-pipeline path is still a TODO.
- **Served copy**: `public/assets/models/bakugan/` (what the browser loads).
  **Source copy**: `src/assets/models/bakugan/` (same 20, plus `src/assets/models/characters/`
  with 10 character models that are reference-only and not served).
- Loaded by `BakuganViewer` through three.js `GLTFLoader` (GLB) / `OBJLoader` (OBJ) + `TextureLoader`.

### 2D artwork — 38 Bakugan + 9 character portraits

- **Source**: Bakugan Wiki (Fandom) infobox/page images — no AI-generated images are used.
- **Files**: `public/assets/images/bakugan/` (38 WebP), `public/assets/images/characters/` (9 WebP).
- **Manifest**: `src/lib/image-manifest.ts` — **generated file**, keyed by the exact game names from
  `bakugan.json`; every entry carries `wikiTitle` and a `source` page URL for attribution.
  Helpers: `getBakuganImage(name)`, `getCharacterImage(name)` (accepts short UI names such as `Dan`).
- **Portraits**: Dan, Marucho, Julie, Runo, Shun, Masquerade, Marduk, Naga, Joe — **Kai has no
  portrait** (no wiki page, and he is absent from the DS/Wii model rosters).

### Fallback chains (never break the UI)

| Component | Chain |
|-----------|-------|
| `BakuganImage` | explicit URL → wiki artwork → model texture (`mat1.png`) → SVG sphere |
| `BakuganViewer` | 3D GLB → 3D OBJ → wiki artwork → model texture → SVG sphere |
| Story portrait | wiki portrait → opponent's initial letter |

Each failed source is remembered (`failedSrc`) and the next candidate is tried.

### Where they show up

- `/models` gallery: badge per Bakugan — **`3D`** when a model resolves, **`2D`** when only artwork
  exists, `—` otherwise.
- `/story`: opponent portraits instead of the initial letter.
- `BakuganImage` renders directly in `/battle` and inside `BakuganCard` (deck builder + Bakudex);
  `BakuganViewer` backs `/battle`, `/collection`, `/models` and the deck-builder panel.
  Gate/Ability cards use their own procedural designs (`GateCardDesign`, `AbilityCardDesign`),
  and the shop list is still text-only.

---

## 8. Documentation map

| File | One line |
|------|----------|
| [`../README.md`](../README.md) | Repo entry point: features, content counts, quick start, docs index |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Version history (0.9.0 phases → 0.10.0 artwork/docs) |
| [`research.md`](research.md) | 21 sections of per-mechanic DS research traced to the GameFAQs guide |
| [`game-design.md`](game-design.md) | Game design document: loop, systems, balance philosophy, AI |
| [`data-model.md`](data-model.md) | Entity overview and every TypeScript/Zod schema in detail |
| [`architecture.md`](architecture.md) | Layered architecture: Phaser integration, battle engine, effects, state, persistence |
| [`roadmap.md`](roadmap.md) | The original 9-phase development plan (Phase 9 online PvP still open) |
| [`bakugan-assets.md`](bakugan-assets.md) | 3D/2D asset research, per-Bakugan coverage table, GLB plan, license notes |
| [`PROJECT.md`](PROJECT.md) | This document — the single full-project reference |
| `../odd/tasks/*.md` | Task files for the 10 completed phases + the artwork work unit |
| [`../src/assets/models/README.md`](../src/assets/models/README.md) | Inventory of the downloaded DS model files |

---

## 9. Sources and licensing

| Source | Used for | Constraint |
|--------|----------|------------|
| **GameFAQs guide — FAQ 81516** (author UFVKNP, v1.2) | All stats, cards, G-Powers, mechanics | Reference only, no redistribution (`asset_license_status: reference_only_no_redistribution`) |
| **Bakugan Wiki (Fandom)** | Supplementary mechanics + all 2D artwork/portraits | Fan/third-party content — internal, non-commercial use **with attribution** (URLs in `image-manifest.ts`) |
| **The Models Resource** (DS/DSi rips) | 20 Bakugan + 10 character 3D models | **Non-commercial use only**; no redistribution outside this project |
| **ProfLeonDias/Bakugan-Database** | Reference data for names/roster | Reference only |

- Every raw record in `src/data/raw/*.json` carries a `source` block with the exact FAQ section,
  URL and `asset_license_status`.
- Research extracts live in `data/raw/*.md` (`gamefaqs-guide.md`, `bakugan-wiki.md`,
  `models-resource.md`, `profleonidas-database.md`).
- Bakugan is a trademark of Spin Master Ltd.; this project is educational and non-commercial.

---

## 10. Localisation

- **The UI is fully in Spanish**: `<html lang="es">` in `src/app/layout.tsx`, Spanish page titles
  ("Modelos 3D", "Bakudex"), Spanish button/label copy, and Spanish deck-validation messages.
- **Card and ability descriptions** in the data files are Spanish too.
- **English remains** the language of code identifiers, comments in older modules, and all
  documentation (`docs/`, `README.md`, `CHANGELOG.md`).

---

## 11. Known gaps / next steps

- [ ] **19 of 38 Bakugan have no 3D model** (Serpenoid, Juggernoid, Robotallion, Saurus, Falconeer,
      Stinglash, Centipoid, Gargonoid, Fear Ripper, Siege, Monarus, Griffon, Terrorclaw, Laserman,
      Reaper, Leonidas, Omega Leonidas, Vladitor, Battle Ax Vladitor) — they render as 2D artwork.
- [ ] **Kai has no portrait** — the artwork scope was 10 characters (the 7 story opponents plus
      Kai, Naga and Joe); 9 were downloaded, Kai's wiki page does not exist.
- [ ] **No GLB conversion yet** (0 `.glb` files) — models are served as OBJ/FBX/DAE and
      `src/lib/model-converter.ts` is not wired into a script (Blender path implemented,
      gltf-pipeline path TODO).
- [ ] **Park-battle opponents have no portraits** — the 26 challengers (Ace Gorillan, Kai, Naga,
      Zenoheld…) were explicitly out of the artwork scope; only Naga would resolve by name today.
- [ ] **Story battles are not wired to the route** — the Story page links to
      `/battle?story=<id>`, but no code in `src/` reads query parameters
      (`useSearchParams`/`URLSearchParams` appear nowhere), so `battle-store`'s
      `storyOpponentId` is never set and the −100 G handicap/story progress is not applied.
- [ ] **Park battles have no UI route** — `src/lib/park-battles.ts` is complete data + helpers but
      is not imported by any page.
- [ ] **Shop prices are all 0 G** (163 entries) — the economy is not tuned; the buy flow works.
- [ ] **`npm run validate` is a skeleton** — the pipeline prints stage status but does not yet
      load/normalize/validate the JSON files.
- [ ] **Online PvP is stubbed only** — `websocket-stub.ts` / `pvp-manager.ts`, no server.
- [ ] **`openai` and `better-sqlite3` are declared but unused** — remove or implement.
- [x] **`tsconfig.tsbuildinfo` no longer tracked (resolved 2026-09-26)** — it is a TypeScript
      build artifact that changed on almost every build and added noise to every diff; the tracked
      copy was removed with `git rm --cached tsconfig.tsbuildinfo` and `*.tsbuildinfo` is now in
      `.gitignore`.

---

## 12. Testing and verification

| Command | What it tells you |
|---------|-------------------|
| `npm run typecheck` | Types are sound across all 98 TS/TSX files (silent on success) |
| `npm run build` | Full production build + static prerender of every route (expect `11/11`) |
| `npm run validate` | Data pipeline entry point runs end-to-end (currently stage skeleton) |
| `npm run dev` + browse | Manual smoke test: `/`, `/deck-builder`, `/battle`, `/story`, `/models` |

Sanity checks used while writing this document (repeatable):

```bash
# content counts (second method: grep the stable id prefixes)
grep -c '"id": "b0' src/data/raw/bakugan.json      # 38
grep -c '"id": "g0' src/data/raw/gate-cards.json    # 103
grep -c '"id": "a0' src/data/raw/ability-cards.json # 97

# assets
ls -d public/assets/images/bakugan/*.webp | wc -l    # 38
ls -d public/assets/images/characters/*.webp | wc -l # 9
ls -d public/assets/models/bakugan/*/ | wc -l        # 20
find . -name '*.glb' -not -path './node_modules/*' | wc -l  # 0
```

## Next step

Start at [`../README.md`](../README.md) for the short tour, or read `research.md` /
`bakugan-assets.md` before touching mechanics or assets.
