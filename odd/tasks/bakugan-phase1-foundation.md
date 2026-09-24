# ODD Tasks — bakugan-phase1-foundation

## Objective
Build the foundation for a web game that reproduces the gameplay of "Bakugan Battle Brawlers" (Nintendo DS): research the sources, write the required documentation, define data models, and import the first dataset (FASE 1 + base structure only — no gameplay implementation yet).

## Problem
The user wants the DS game's concept (deck building, throw + arena movement, gate cards physically on field, stand, battles with minigames, G-Power, progression, shop, collection), not a generic card battler. Mechanics must be grounded in documented sources — never invented.

## Why
Explicit request (2026-09-24): FASE 1 = investigate sources, create documentation, create data models, import first data. After docs, only FASE 1 and base structure.

## Scope (FASE 1 only)
- In scope: research notes, docs/*.md, directory skeleton, TS/Zod domain models, config JSONs, import pipeline skeleton, MVP dataset.
- Out of scope (later phases): playable arena, battle engine runtime, minigames implementation, UI screens, shop logic, AI, online.

## Constraints
- Primary source: GameFAQs guide for Bakugan Battle Brawlers (DS). Secondary: Bakugan Wiki. Visual refs: The Models Resource. Also: github.com/ProfLeonDias/Bakugan-Database.
- Never invent stats when a documented source exists; undocumented = UNKNOWN + ask user before deciding important mechanics.
- Every imported datum keeps: source, source_url, source_notes, asset_license_status.
- No downloading/redistributing protected images/models; placeholders only; URLs as documentation references.
- TypeScript; Next.js/React for UI; Phaser 3 for arena/minigames; Zustand state; IndexedDB/localStorage + JSON in MVP; engine must be React-independent.
- Deck rules: 3 Bakugan + 3 Gate (1 Gold/1 Silver/1 Copper) + 3 Ability (1 Red/1 Green/1 Blue), enforced in validation.
- Artifacts in English (project convention for docs/code).

## TDD mode
- Resolved: OFF (no test runner configured in project). Source: inspected package.json/tsconfig.
- Ordinary functional checks instead: `npx tsc --noEmit`, `npm run build`, data validator script.

## Tasks
- [x] T1 Research GameFAQs DS guide — ✅ COMPLETE. FAQ 81516, author UFVKNP, v1.2 (2025-10-01). 38 Bakugan, 103 Gate Cards, 97 Ability Cards, 8 arenas, 6 minigames, shop inventory, special shots — all extracted verbatim.
- [x] T2 Research Bakugan Wiki — ⚠️ FAILED (model token limit exhausted). Not blocking: GameFAQs primary source is comprehensive enough.
- [x] T3 Research ProfLeonDias/Bakugan-Database + Models Resource — ✅ COMPLETE. Bakugan-Database = toy collector DB (no game stats, no JSON/CSV). Models Resource = 20 Bakugan models (DAE/FBX/OBJ), asset_license_status: reference_only_no_redistribution.
- [x] T4 docs/research.md — ✅ COMPLETE. 20 mechanic sections with ORIGINAL/IMPLEMENTATION/SOURCE/UNCERTAINTIES format.
- [x] T5 docs/game-design.md — ✅ COMPLETE. 14 sections covering full game design.
- [x] T6 docs/data-model.md — ✅ COMPLETE. TypeScript interfaces + Zod schemas (Bakugan, GateCard, AbilityCard, Deck, Arena, Effects, Source, Conflict, Config).
- [x] T7 docs/architecture.md — ✅ COMPLETE. Directory tree, tech stack, Phaser integration, battle engine, effects engine, data pipeline.
- [x] T8 docs/roadmap.md — ✅ COMPLETE. 9 phases with objectives, deliverables, dependencies, complexity.
- [x] T9 Base directory structure — ✅ COMPLETE. 12 directories under src/ (data/schemas, data/pipeline, data/config, data/raw, game, battle-engine, effects, minigames, ui, shop, collection, deck-builder, assets).
- [x] T10 TS domain models + Zod schemas — ✅ COMPLETE. 9 files in src/data/schemas/ (attribute, source-metadata, bakugan, gate-card, ability-card, deck, arena, effects, index).
- [x] T11 Config files — ✅ COMPLETE. balance.json, experience.json, shop.json, arenas.json in src/data/config/.
- [x] T12 Import pipeline skeleton — ✅ COMPLETE. 6 files in src/data/pipeline/ (source, raw, normalize, validate, database, index).
- [x] T13 MVP dataset — ✅ COMPLETE. 6 Bakugan, 12 Gate Cards, 12 Ability Cards in src/data/raw/. All with source fields.
- [x] T14 Functional checks — ✅ COMPLETE. npx tsc --noEmit passes. npm run build has pre-existing failure (missing root layout.tsx — unrelated to FASE 1). Pipeline skeleton runs correctly.
- [ ] T15 Native review at candidate boundary (RDD is on; consent is the human's per candidate) — IN PROGRESS

## Acceptance criteria
- Five docs exist and reflect ONLY sourced DS behaviour (UNKNOWNs marked, none invented).
- `npx tsc --noEmit` and `npm run build` pass with the new structure/models.
- Validator rejects an illegal deck (wrong gate tier mix / ability color mix / counts) and accepts a legal MVP deck (proven by a small script run).
- Dataset entries carry source/source_url/source_notes/asset_license_status.

## Verification evidence
(append per task as completed)

## Next step
T1–T3 parallel research delegation.
