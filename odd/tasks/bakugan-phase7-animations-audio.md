# ODD Tasks — bakugan-phase7-animations-audio

## Objective
Polish all UI animations, add sound effects and music, and implement visual effects for battles, abilities, and special shots.

## Problem
After FASE 6 (progression), the game needs visual and audio polish to feel like a real videojuego, not just a web page.

## Why
FASE 7 in the 9-phase roadmap. Animations and audio create the game feel.

## Scope (FASE 7 only)
- In scope: Framer Motion transitions, card animations, Bakugan animations, battle effects, sound effects, background music, power-up effects, arena hazards.
- Out of scope: More content (FASE 8), PvP (FASE 9).

## Constraints
- Framer Motion for React UI animations
- Phaser tweens for in-game animations
- Web Audio API for sound effects (no external files — generate programmatically or use placeholders)
- Performance: 60fps target on desktop, 30fps on mobile

## Tasks
- [ ] T1 Screen transition animations (Framer Motion AnimatePresence)
- [ ] T2 Card flip/reveal animations
- [ ] T3 Bakugan throw animation (arc trajectory)
- [ ] T4 Bakugan stand animation (open/close)
- [ ] T5 Battle entry animation
- [ ] T6 G-Power bar animations
- [ ] T7 Ability Card play effects
- [ ] T8 Special Shot visual effects (per-attribute)
- [ ] T9 Sound effects system (Web Audio API)
- [ ] T10 Sound effects: throw, stand, battle start, minigame, win/lose
- [ ] T11 Background music: menu, arena, battle
- [ ] T12 Power-up collection effects
- [ ] T13 Arena hazard visual effects
- [ ] T14 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- All screen transitions animated
- Card flip animations smooth
- Bakugan throw/stand animations working
- Battle visual effects (G-Power bars, ability effects)
- Sound effects for key actions
- Background music plays in menu and battle
- No performance issues on target devices
- npm run build passes

## Verification evidence
(append per task as completed)

## Next step
T1-T8: Animation system
