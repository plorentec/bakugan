# ODD Tasks — bakugan-phase6-shop-progression

## Objective
Implement shop UI, money system, XP/leveling, stat allocation, G-Power growth, and story mode progression.

## Problem
After FASE 5 (minigames), we need the progression system — earning money/XP, buying items, leveling up, and story mode.

## Why
FASE 6 in the 9-phase roadmap. Progression gives players goals and rewards.

## Scope (FASE 6 only)
- In scope: Shop UI, money system, XP/leveling, stat allocation, G-Power growth, story mode (7 opponents), tournament unlocks.
- Out of scope: Animations/audio (FASE 7), more content (FASE 8), PvP (FASE 9).

## Constraints
- Use existing shop.json config for prices/unlocks
- Use existing experience.json for XP curve
- Story mode: 7 opponents with -100 G-Power handicap
- Shop tiers unlock after tournament victories
- Desktop-first, responsive

## Tasks
- [ ] T1 Money system — earn from brawls, spend in shop
- [ ] T2 XP and leveling system — XP curve, level-up triggers
- [ ] T3 Stat point allocation — level-up screen, choose stat to increase
- [ ] T4 G-Power growth — per-level increase (250 total L1→MAX)
- [ ] T5 Zustand progression store — money, XP, level, stats, unlocks
- [ ] T6 Shop page — browse items by tier, purchase with money
- [ ] T7 Shop UI components — item cards, price display, buy button
- [ ] T8 Brawl rewards — per-Bakugan defeated + power-up bonuses
- [ ] T9 Level-up screen — allocate stat points, see G-Power growth
- [ ] T10 Story mode — 7 opponents with decreasing G-Power handicap
- [ ] T11 Opponent AI — Normal difficulty for story, Hard for postgame
- [ ] T12 Tournament unlock system — shop tiers unlock after victories
- [ ] T13 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- Shop displays items by tier with prices
- Player can purchase items with earned money
- Money earned after each brawl
- XP awarded after each brawl
- Level-up triggers stat point allocation
- G-Power increases with level
- Story mode has 7 opponents
- Opponent G-Power reduced by 100 in story mode
- Shop tiers unlock after tournament victories
- npm run build passes

## Verification evidence
(append per task as completed)

## Next step
T1-T4: Money, XP, stats, G-Power systems
