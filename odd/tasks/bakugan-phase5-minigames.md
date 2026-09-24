# ODD Tasks — bakugan-phase5-minigames

## Objective
Implement all 6 minigame types with normalized 0.0-1.0 results, platform adaptation, and AI performance scaling.

## Problem
After FASE 4 (combat + Scratch Battle), we need the remaining 5 minigames to complete the battle system.

## Why
FASE 5 in the 9-phase roadmap. All 6 minigames are needed for variety in battles.

## Scope (FASE 5 only)
- In scope: Spin Battle, Timing Battle, Pop Battle, Trace Battle, Bound Battle, platform detection, input adaptation, AI minigame scaling.
- Out of scope: New arenas, shop, progression (FASE 6+).

## Constraints
- Follow minigame descriptions from docs/research.md (Sections 8-13)
- All produce normalized 0.0-1.0 result
- Platform adaptation: desktop (mouse/keyboard), tablet (touch), mobile (touch simplified)
- AI scales accuracy by difficulty (Easy: 0.3-0.5, Normal: 0.5-0.7, Hard: 0.7-0.9)

## Tasks
- [ ] T1 Spin Battle — mouse wheel / drag-rotate, accuracy scoring
- [ ] T2 Timing Battle — keyboard/tap at cues, rhythm-based scoring
- [ ] T3 Pop Battle — click/tap targets, reaction-based scoring
- [ ] T4 Trace Battle — mouse/finger trace, pattern accuracy scoring
- [ ] T5 Bound Battle — catch/deflect objects, success rate scoring
- [ ] T6 Platform detection and input adaptation
- [ ] T7 Update minigame manager — selection by Gate Card tier
- [ ] T8 Update AI controller — difficulty-scaled minigame performance
- [ ] T9 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- All 6 minigames playable and produce 0.0-1.0 result
- Minigame selected based on Gate Card tier (Gold→Scratch/Spin, Silver→Timing/Pop, Copper→Trace/Bound)
- Desktop: keyboard/mouse input works
- Tablet: touch input works
- Mobile: touch input works (simplified)
- AI performs at difficulty-scaled accuracy
- Minigame results correctly influence G-Power battle
- npm run build passes

## Verification evidence
(append per task as completed)

## Next step
T1-T5: Implement 5 minigames
