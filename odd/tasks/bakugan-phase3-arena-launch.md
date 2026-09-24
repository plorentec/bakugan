# ODD Tasks — bakugan-phase3-arena-launch

## Objective
Implement Phaser 3 arena with Bakugan throw, movement, Gate Card placement, Stand detection, Double Stand, and Critical KO.

## Problem
After the deck builder (FASE 2), we need the core gameplay arena where Bakugan are thrown, move, and interact with Gate Cards.

## Why
FASE 3 in the 9-phase roadmap. This is the first playable gameplay — the arena is where battles happen.

## Scope (FASE 3 only)
- In scope: Phaser 3 setup, arena scene, Bakugan physics, throw mechanic, movement, Gate Card placement, Stand detection, Double Stand, Critical KO, React↔Phaser event bus, Battle HUD.
- Out of scope: Combat resolution, minigames, G-Power battles, AI (FASE 4+).

## Constraints
- Phaser 3 for arena rendering (top-down arcade physics)
- React 19 for UI overlay (HUD)
- Zustand for game state
- Existing schemas from src/data/schemas/
- Existing MVP dataset from src/data/raw/
- Desktop-first, responsive

## Tasks
- [ ] T1 Install phaser dependency
- [ ] T2 Create Phaser game config (src/game/config/PhaserConfig.ts)
- [ ] T3 Create Phaser game wrapper React component (src/game/PhaserGame.tsx)
- [ ] T4 Create event bus for React↔Phaser communication (src/game/events/EventBus.ts)
- [ ] T5 Create BootScene — asset loading placeholder (src/game/scenes/BootScene.ts)
- [ ] T6 Create ArenaScene — main arena with field, gate card slots, boundaries (src/game/scenes/ArenaScene.ts)
- [ ] T7 Create BakuganObject — game object with physics, throw, movement, stand (src/game/objects/BakuganObject.ts)
- [ ] T8 Create GateCardObject — visual on field with bonuses, tier display (src/game/objects/GateCardObject.ts)
- [ ] T9 Implement throw mechanic — click-drag-release, force based on distance
- [ ] T10 Implement movement — WASD/arrow keys, steering stat affects duration
- [ ] T11 Implement Stand detection — Bakugan overlaps Gate Card → stands
- [ ] T12 Implement Double Stand — 2 Bakugan on same card → auto-win
- [ ] T13 Implement Critical KO — collision knockback off card
- [ ] T14 Create Battle HUD overlay (src/ui/battle/BattleHUD.tsx) — G-Power, phase indicator
- [ ] T15 Create battle page (src/app/battle/page.tsx) — integrates Phaser + HUD
- [ ] T16 Zustand battle store (src/stores/battle-store.ts) — battle state, phase tracking
- [ ] T17 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- Bakugan can be thrown with variable force
- Bakugan moves with WASD/arrow keys
- Bakugan stands when rolling over a Gate Card
- Gate Cards display on field with correct bonuses
- Double Stand triggers auto-win
- Critical KO knocks opponent off card
- HUD shows current battle state
- Phaser and React communicate via events
- npm run build passes

## Verification evidence
(append per task as completed)

## Next step
T1: Install Phaser 3
