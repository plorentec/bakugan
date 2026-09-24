# ODD Tasks — bakugan-phase4-combat-gpower

## Objective
Implement full battle state machine, G-Power calculation, Scratch Battle minigame, Ability Card play, battle resolution, and AI opponent.

## Problem
After FASE 3 (arena + throw + stand), we need the combat system that resolves battles when two Bakugan meet on a Gate Card.

## Why
FASE 4 in the 9-phase roadmap. This is the core gameplay loop — battles determine who wins Gate Cards.

## Scope (FASE 4 only)
- In scope: Battle state machine, G-Power calculator, Scratch Battle minigame, G-Power bars, battle timer, Ability Card play, battle resolution, AI (Easy), effects engine foundation, battle log.
- Out of scope: Remaining 5 minigames (FASE 5), shop, progression (FASE 6+).

## Constraints
- Follow battle sequence from docs/research.md (Section 5): REVEAL_GATE → APPLY_BONUSES → ABILITY_WINDOW → MINIGAME → G_POWER → RESOLUTION
- G-Power calculation: base + gate card bonus + ability card effects + power-ups
- Scratch Battle: mouse drag pattern, accuracy scoring, 0.0-1.0 normalized result
- Effects engine: extensible, JSON-driven (not hardcoded)
- AI (Easy): random decisions, basic minigame performance

## Tasks
- [ ] T1 Battle state machine (src/battle-engine/state-machine.ts)
- [ ] T2 G-Power calculator (src/battle-engine/g-power-calculator.ts)
- [ ] T3 Effects engine foundation (src/effects/registry.ts, src/effects/handlers/*.ts)
- [ ] T4 Scratch Battle minigame (src/minigames/scratch-battle.ts)
- [ ] T5 Battle HUD update — G-Power bars, timer, phase indicator
- [ ] T6 Ability Card play window — select from hand, apply effects
- [ ] T7 Battle resolution — winner determination, Gate Card award
- [ ] T8 AI controller (Easy) — random decisions, basic minigame
- [ ] T9 Battle log — shows what happened each step
- [ ] T10 Integration with ArenaScene — trigger battle on stand
- [ ] T11 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- Battle state machine progresses through all phases
- G-Power calculated correctly with all modifiers
- Scratch Battle minigame playable and produces 0.0-1.0 result
- G-Power bars animate during battle
- Timer counts down and ends battle
- Ability Cards can be played during ability window
- Winner takes Gate Card after battle
- AI opponent makes moves (Easy difficulty)
- Effects engine applies ADD_G_POWER and SWAP_G_POWER
- npm run build passes

## Verification evidence
(append per task as completed)

## Next step
T1: Battle state machine
