# ODD Tasks — bakugan-phase2-deck-builder

## Objective
Build a functional deck builder UI with 3+3+3 validation, IndexedDB persistence, and collection display.

## Problem
After FASE 1 (data models + schemas), we need a working deck builder so users can construct legal decks before entering battles.

## Why
FASE 2 in the 9-phase roadmap. Deck builder is the first interactive UI and validates our data models work end-to-end.

## Scope (FASE 2 only)
- In scope: Tailwind setup, Zustand deck store, deck builder UI, validation, IndexedDB save/load, collection display.
- Out of scope: Battle engine, arena, minigames, shop, progression (later phases).

## Constraints
- Use existing Zod schemas from src/data/schemas/
- Use existing MVP dataset from src/data/raw/
- Deck rules: 3 Bakugan (no duplicate name+attribute), 3 Gate Cards (1G/1S/1C), 3 Ability Cards (1R/1G/1B)
- TypeScript, Next.js 15 App Router, React 19
- Artifacts in English

## Tasks
- [ ] T1 Install dependencies: tailwindcss, postcss, autoprefixer, zustand, framer-motion, idb
- [ ] T2 Configure Tailwind CSS (tailwind.config.ts, postcss.config.mjs, globals.css)
- [ ] T3 Create Zustand deck store (src/stores/deck-store.ts) — deck state, add/remove cards, validation
- [ ] T4 Create Zustand collection store (src/stores/collection-store.ts) — owned cards, unlock tracking
- [ ] T5 Create IndexedDB service (src/lib/db.ts) — save/load deck and collection
- [ ] T6 Build Bakugan selection panel component (src/ui/deck-builder/BakuganPanel.tsx)
- [ ] T7 Build Gate Card selection panel component (src/ui/deck-builder/GateCardPanel.tsx)
- [ ] T8 Build Ability Card selection panel component (src/ui/deck-builder/AbilityCardPanel.tsx)
- [ ] T9 Build deck summary component (src/ui/deck-builder/DeckSummary.tsx)
- [ ] T10 Build deck builder page (src/app/deck-builder/page.tsx) — integrates all panels
- [ ] T11 Add validation feedback (real-time errors, visual indicators)
- [ ] T12 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- User can select 3 Bakugan (no duplicate name+attribute)
- User can select 3 Gate Cards (1 Gold, 1 Silver, 1 Copper)
- User can select 3 Ability Cards (1 Red, 1 Green, 1 Blue)
- Validation errors shown for illegal selections
- Deck saves to IndexedDB and loads on page refresh
- Collection shows which cards are owned vs locked
- npx tsc --noEmit and npm run build pass

## Verification evidence
(append per task as completed)

## Next step
T1-T2: Install deps + configure Tailwind
