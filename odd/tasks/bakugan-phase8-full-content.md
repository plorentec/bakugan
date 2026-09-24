# ODD Tasks — bakugan-phase8-full-content

## Objective
Import full 38-Bakugan roster, all 103 Gate Cards, all 97 Ability Cards, implement all 8 arenas, field pickups, and special shots.

## Problem
After FASE 7 (animations/audio), we need the complete content to make the game feel finished.

## Why
FASE 8 in the 9-phase roadmap. Full content transforms the MVP into a complete game.

## Scope (FASE 8 only)
- In scope: Full data import, all arenas, field pickups, special shots, complete shop, Bakudex.
- Out of scope: PvP online (FASE 9).

## Constraints
- All data from GameFAQs guide (data/raw/gamefaqs-guide.md)
- Source metadata required for every entry
- Arenas from docs/research.md Section 14
- Special Shots from docs/research.md Section 13

## Tasks
- [ ] T1 Import full Bakugan dataset (38 entries with all stats)
- [ ] T2 Import full Gate Card dataset (103 entries with bonuses/effects)
- [ ] T3 Import full Ability Card dataset (97 entries with effects)
- [ ] T4 Implement all 8 arenas (Standard, Pyrus, Aquos, Ventus, Subterra, Haos, Darkus, Battle Arena)
- [ ] T5 Arena hazards (fountains, quicksand, vents, tornado, geysers/lava, cubes/warps, lightning)
- [ ] T6 Movement elements (trampolines, boost pads)
- [ ] T7 Field-pickup Ability Cards (12 cards)
- [ ] T8 Special Shot system (6 attributes, meter, activation)
- [ ] T9 Complete shop with all tiers (from shop.json)
- [ ] T10 Bakudex (collection tracker for all entries)
- [ ] T11 Postgame Park battles
- [ ] T12 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- 38 Bakugan importable and playable
- 103 Gate Cards with correct bonuses and effects
- 97 Ability Cards with correct effects
- All 8 arenas functional with hazards
- Field-pickup cards spawn and can be collected
- Special Shots work for all 6 attributes
- Complete story mode (7 opponents)
- Postgame Park battles available
- Bakudex tracks all discoveries
- npm run build passes

## Verification evidence
(append per task as completed)

## Next step
T1-T3: Import full datasets
