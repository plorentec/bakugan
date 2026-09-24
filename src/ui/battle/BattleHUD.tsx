'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore, type BattlePhase } from '@/stores/battle-store';
import { eventBus, type GameEventPayloads } from '@/game/events/EventBus';

/* ------------------------------------------------------------------ */
/*  Phase labels                                                        */
/* ------------------------------------------------------------------ */

const PHASE_LABELS: Record<BattlePhase, string> = {
  SETUP: 'Setting Up',
  PLACE_GATE: 'Place Gate Cards',
  SELECT_BAKUGAN: 'Select Bakugan',
  AIM: 'Aim & Throw',
  THROW: 'Throwing...',
  FIELD_MOVEMENT: 'Field Movement',
  STAND: 'Standing',
  BATTLE_TRIGGER: 'Battle!',
};

const PHASE_COLORS: Record<BattlePhase, string> = {
  SETUP: 'text-gray-400',
  PLACE_GATE: 'text-yellow-400',
  SELECT_BAKUGAN: 'text-blue-400',
  AIM: 'text-orange-400',
  THROW: 'text-red-400',
  FIELD_MOVEMENT: 'text-green-400',
  STAND: 'text-purple-400',
  BATTLE_TRIGGER: 'text-red-500',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BattleHUD() {
  const { phase, player, opponent, battleMessage } = useBattleStore();
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    const handlers = {
      BAKUGAN_THROWN: (_d: GameEventPayloads['BAKUGAN_THROWN']) => setLastEvent('Bakugan thrown!'),
      BAKUGAN_STANDING: (d: GameEventPayloads['BAKUGAN_STANDING']) =>
        setLastEvent(`${d.playerId === 0 ? 'Your' : "Opponent's"} Bakugan stands!`),
      DOUBLE_STAND: (d: GameEventPayloads['DOUBLE_STAND']) =>
        setLastEvent(`DOUBLE STAND — ${d.playerId === 0 ? 'You' : 'Opponent'} win!`),
      CRITICAL_KO: () => setLastEvent('CRITICAL KO!'),
      STEERING_EXPIRED: () => setLastEvent('Steering expired'),
    };

    for (const [event, handler] of Object.entries(handlers)) {
      eventBus.on(event as keyof typeof handlers, handler as (d: unknown) => void);
    }

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        eventBus.off(event as keyof typeof handlers, handler as (d: unknown) => void);
      }
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex flex-col justify-between p-4">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        {/* Phase indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`rounded-lg bg-black/70 px-4 py-2 font-mono text-sm font-bold ${PHASE_COLORS[phase]}`}
          >
            {PHASE_LABELS[phase]}
          </motion.div>
        </AnimatePresence>

        {/* Gate Cards won */}
        <div className="flex gap-3">
          <ScorePill label="You" won={player.gateCardsWon} color="emerald" />
          <ScorePill label="CPU" won={opponent.gateCardsWon} color="rose" />
        </div>
      </div>

      {/* ── Centre event toast ──────────────────────────────── */}
      <div className="flex justify-center">
        <AnimatePresence>
          {lastEvent && (
            <motion.div
              key={lastEvent}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onAnimationComplete={() => {
                setTimeout(() => setLastEvent(null), 2000);
              }}
              className="rounded-full bg-black/60 px-6 py-2 font-mono text-sm font-bold text-white shadow-lg"
            >
              {lastEvent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        {/* Bakugan remaining */}
        <div className="flex gap-2">
          {player.bakugan.slice(0, 3).map((b, i) => (
            <div
              key={b.id}
              className={`h-6 w-6 rounded-full border-2 ${
                i <= player.bakuganRemaining - 1
                  ? 'border-emerald-400 bg-emerald-500/40'
                  : 'border-gray-600 bg-gray-800/40'
              }`}
            />
          ))}
        </div>

        {/* Battle message */}
        <AnimatePresence mode="wait">
          {battleMessage && (
            <motion.div
              key={battleMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-black/70 px-4 py-2 font-mono text-xs text-gray-300"
            >
              {battleMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opponent Bakugan remaining */}
        <div className="flex gap-2">
          {opponent.bakugan.slice(0, 3).map((b, i) => (
            <div
              key={b.id}
              className={`h-6 w-6 rounded-full border-2 ${
                i <= opponent.bakuganRemaining - 1
                  ? 'border-rose-400 bg-rose-500/40'
                  : 'border-gray-600 bg-gray-800/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ScorePill({ label, won, color }: { label: string; won: number; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 font-mono text-xs`}>
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold text-${color}-400`}>{won}</span>
      <span className="text-gray-500">/3</span>
    </div>
  );
}
