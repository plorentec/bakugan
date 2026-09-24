# ODD Tasks — bakugan-phase9-pvp

## Objective
Implement local PvP (two players on same device) and prepare WebSocket stubs for future online play.

## Problem
After FASE 8 (full content), we need multiplayer capability for two players to battle.

## Why
FASE 9 in the 9-phase roadmap. PvP is the final gameplay feature.

## Scope (FASE 9 only)
- In scope: Local PvP (same device), turn-based battle flow, shared screen, AI vs Human, WebSocket stubs.
- Out of scope: Full online matchmaking, servers, databases (future work).

## Constraints
- Local PvP: two players take turns on same device
- Shared screen with player indicators
- AI can substitute for human player
- WebSocket stubs for future online play

## Tasks
- [ ] T1 Local PvP mode — two players, same device, turn-based
- [ ] T2 Player indicator UI — show whose turn it is
- [ ] T3 Turn management — alternate turns, handle disconnections
- [ ] T4 PvP battle flow — both players select Bakugan, place Gate Cards, throw
- [ ] T5 AI substitution — replace human with AI when needed
- [ ] T6 WebSocket stubs — prepare for future online play
- [ ] T7 PvP lobby — create/join local battle
- [ ] T8 Functional checks: npx tsc --noEmit, npm run build

## Acceptance criteria
- Two players can battle on same device
- Turn-based flow works correctly
- AI can substitute for human player
- WebSocket stubs exist for future online play
- npm run build passes

## Verification evidence
(append per task as completed)

## Next step
T1-T4: Local PvP implementation
