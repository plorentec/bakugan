'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore, type BattlePhase } from '@/stores/battle-store';
import { eventBus, type GameEventPayloads } from '@/game/events/EventBus';
import { playEventSound, playTimerWarningSound } from '@/lib/sounds';
import { staggerContainer, staggerItem } from '@/lib/animations';
import MinigameOverlay from './MinigameOverlay';

/* ------------------------------------------------------------------ */
/*  Phase labels                                                        */
/* ------------------------------------------------------------------ */

const PHASE_LABELS: Record<BattlePhase, string> = {
  SETUP: 'Preparando',
  PLACE_GATE: 'Coloca Gate Cards',
  SELECT_BAKUGAN: 'Seleccionar Bakugan',
  AIM: 'Apuntar y Lanzar',
  THROW: 'Lanzando...',
  FIELD_MOVEMENT: 'Movimiento en Campo',
  STAND: 'Stand',
  BATTLE_TRIGGER: '¡Batalla!',
  // Battle engine phases
  REVEAL_GATE: 'Revelando Gate Card',
  APPLY_BONUSES: 'Aplicando Bonificaciones',
  ABILITY_WINDOW: 'Jugar Ability Card',
  MINIGAME: '¡Batalla Scratch!',
  G_POWER: 'Calculando G-Power',
  RESOLUTION: 'Batalla Resuelta',
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
  REVEAL_GATE: 'text-yellow-400',
  APPLY_BONUSES: 'text-blue-400',
  ABILITY_WINDOW: 'text-green-400',
  MINIGAME: 'text-orange-400',
  G_POWER: 'text-cyan-400',
  RESOLUTION: 'text-red-500',
};

/* ------------------------------------------------------------------ */
/*  Battle Phase Groups                                                 */
/* ------------------------------------------------------------------ */

const ENGINE_PHASES = new Set<BattlePhase>([
  'REVEAL_GATE',
  'APPLY_BONUSES',
  'ABILITY_WINDOW',
  'MINIGAME',
  'G_POWER',
  'RESOLUTION',
]);

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BattleHUD() {
  const {
    phase,
    player,
    opponent,
    battleMessage,
    timer,
    maxTimer,
    gPowerBars,
    battleLog,
    abilityWindowOpen,
    minigameActive,
    winReason,
    selectedAbilityCard,
    playAbilityCard,
    setSelectedAbilityCard,
    resolveMinigame,
  } = useBattleStore();
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [eventShake, setEventShake] = useState(false);
  const prevTimer = useRef(timer);

  // FASE 7: Play sounds on events + timer warning
  useEffect(() => {
    const handlers = {
      BAKUGAN_THROWN: (_d: GameEventPayloads['BAKUGAN_THROWN']) => {
        setLastEvent('¡Bakugan lanzado!');
        playEventSound('BAKUGAN_THROWN');
      },
      BAKUGAN_STANDING: (d: GameEventPayloads['BAKUGAN_STANDING']) => {
        setLastEvent(`¡Bakugan de ${d.playerId === 0 ? 'tú' : 'tu oponente'} hace stand!`);
        playEventSound('BAKUGAN_STANDING');
      },
      DOUBLE_STAND: (d: GameEventPayloads['DOUBLE_STAND']) => {
        setLastEvent(`DOBLE STAND — ¡${d.playerId === 0 ? 'Tú' : 'Tu oponente'} ganas!`);
        playEventSound('DOUBLE_STAND');
        setEventShake(true);
        setTimeout(() => setEventShake(false), 500);
      },
      CRITICAL_KO: () => {
        setLastEvent('¡KO CRÍTICO!');
        playEventSound('CRITICAL_KO');
        setEventShake(true);
        setTimeout(() => setEventShake(false), 500);
      },
      STEERING_EXPIRED: () => {
        setLastEvent('Dirección agotada');
        playEventSound('STEERING_EXPIRED');
      },
      BATTLE_ENGINE_STARTED: (d: GameEventPayloads['BATTLE_ENGINE_STARTED']) => {
        setLastEvent(`Batalla: ${d.players[0].bakuganName} vs ${d.players[1].bakuganName}`);
        playEventSound('BATTLE_ENGINE_STARTED');
      },
      BATTLE_ENGINE_RESOLVED: (d: GameEventPayloads['BATTLE_ENGINE_RESOLVED']) => {
        setLastEvent(d.reason);
        playEventSound('BATTLE_ENGINE_RESOLVED', { winnerPlayerId: d.winnerPlayerId });
      },
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

  // FASE 7: Timer warning sound
  useEffect(() => {
    if (timer <= 10 && timer > 0 && prevTimer.current > 10) {
      playTimerWarningSound();
    }
    prevTimer.current = timer;
  }, [timer]);

  const isEnginePhase = ENGINE_PHASES.has(phase);
  const timerPercent = maxTimer > 0 ? (timer / maxTimer) * 100 : 0;
  const timerWarning = timer <= 10 && timer > 0;

  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 z-50 flex flex-col justify-between p-4 ${
          eventShake ? 'animate-pulse' : ''
        }`}
      >
        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          {/* Phase indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`rounded-lg bg-black/70 px-4 py-2 font-mono text-sm font-bold ${PHASE_COLORS[phase]}`}
            >
              {PHASE_LABELS[phase]}
            </motion.div>
          </AnimatePresence>

          {/* Gate Cards won */}
          <div className="flex gap-3">
            <ScorePill label="Tú" won={player.gateCardsWon} color="emerald" />
            <ScorePill label="CPU" won={opponent.gateCardsWon} color="rose" />
          </div>
        </div>

        {/* ── G-Power Bars (during battle phases) ────────────── */}
        {isEnginePhase && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-2xl"
          >
            <div className="flex flex-col gap-2 rounded-lg bg-black/60 p-3">
              {/* Player G-Power */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-mono text-[10px] text-emerald-400">TÚ</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    initial={{ width: '50%' }}
                    animate={{ width: `${gPowerBars[0] * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <motion.span
                  key={player.gPower}
                  initial={{ scale: 1.3, color: '#ffffff' }}
                  animate={{ scale: 1, color: '#34d399' }}
                  transition={{ duration: 0.4 }}
                  className="w-20 text-right font-mono text-xs text-emerald-400"
                >
                  {player.gPower}G
                </motion.span>
              </div>

              {/* Opponent G-Power */}
              <div className="flex items-center gap-2">
                <span className="w-16 font-mono text-[10px] text-rose-400">CPU</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-l from-rose-600 to-rose-400"
                    initial={{ width: '50%' }}
                    animate={{ width: `${gPowerBars[1] * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <motion.span
                  key={opponent.gPower}
                  initial={{ scale: 1.3, color: '#ffffff' }}
                  animate={{ scale: 1, color: '#fb7185' }}
                  transition={{ duration: 0.4 }}
                  className="w-20 text-right font-mono text-xs text-rose-400"
                >
                  {opponent.gPower}G
                </motion.span>
              </div>

              {/* Timer bar */}
              {maxTimer > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-16 font-mono text-[10px] text-gray-500">TIEMPO</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
                    <motion.div
                      className={`h-full rounded-full ${
                        timerWarning
                          ? 'bg-gradient-to-r from-red-600 to-red-400'
                          : 'bg-gradient-to-r from-gray-600 to-gray-400'
                      }`}
                      animate={{
                        width: `${timerPercent}%`,
                        ...(timerWarning ? { opacity: [1, 0.6, 1] } : {}),
                      }}
                      transition={
                        timerWarning
                          ? { width: { duration: 0.1 }, opacity: { duration: 0.5, repeat: Infinity } }
                          : { duration: 0.1 }
                      }
                    />
                  </div>
                  <motion.span
                    animate={timerWarning ? { scale: [1, 1.15, 1] } : {}}
                    transition={timerWarning ? { duration: 0.5, repeat: Infinity } : {}}
                    className={`w-20 text-right font-mono text-xs ${
                      timerWarning ? 'text-red-400 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {timer.toFixed(1)}s
                  </motion.span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Centre event toast ──────────────────────────────── */}
        <div className="flex justify-center">
          <AnimatePresence>
            {lastEvent && (
              <motion.div
                key={lastEvent}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: -10 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
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

        {/* ── Ability Card Hand (during ABILITY_WINDOW) ──────── */}
        {abilityWindowOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="pointer-events-auto mx-auto mb-4"
          >
            <div className="flex flex-col items-center gap-2 rounded-lg bg-black/70 p-3">
              <span className="font-mono text-[10px] uppercase text-gray-500">
                Juega una Ability Card
              </span>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex gap-2"
              >
                {player.abilityCards.map((card) => (
                  <motion.button
                    key={card.id}
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAbilityCard(card.id)}
                    className={`rounded-lg border p-2 font-mono text-xs transition ${
                      selectedAbilityCard === card.id
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-bold">{card.name}</div>
                    <div className="text-[10px] text-gray-500">{card.color}</div>
                  </motion.button>
                ))}
                <motion.button
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (selectedAbilityCard) {
                      playAbilityCard(0, selectedAbilityCard);
                    } else {
                      playAbilityCard(0, '');
                    }
                  }}
                  className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 font-mono text-xs text-gray-400 transition hover:border-gray-400 hover:text-white"
                >
                  Pasar
                </motion.button>
              </motion.div>
              {selectedAbilityCard && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playAbilityCard(0, selectedAbilityCard)}
                  className="rounded-lg bg-yellow-500 px-4 py-1 font-mono text-xs font-bold text-black transition hover:bg-yellow-400"
                >
                  Jugar Carta
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Battle Log (during engine phases) ──────────────── */}
        {isEnginePhase && battleLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto absolute bottom-20 left-4 max-h-32 w-64 overflow-y-auto rounded-lg bg-black/70 p-2"
          >
            <div className="mb-1 font-mono text-[10px] uppercase text-gray-500">Registro de Batalla</div>
            {battleLog.slice(-8).map((msg, i) => (
              <div key={i} className="font-mono text-[10px] text-gray-400">
                {msg}
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <div className="flex items-end justify-between">
          {/* Bakugan remaining */}
          <div className="flex gap-2">
            {player.bakugan.slice(0, 3).map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ scale: 1 }}
                animate={i === player.currentBakuganIndex ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
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
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
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

      {/* ── Minigame Overlay ────────────────────────────────── */}
      <MinigameOverlay />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ScorePill({ label, won, color }: { label: string; won: number; color: string }) {
  return (
    <motion.div
      key={won}
      initial={{ scale: 1.2 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: 'backOut' }}
      className={`flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 font-mono text-xs`}
    >
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold text-${color}-400`}>{won}</span>
      <span className="text-gray-500">/3</span>
    </motion.div>
  );
}
