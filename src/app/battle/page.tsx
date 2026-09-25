'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '@/stores/battle-store';
import { usePvPStore } from '@/stores/pvp-store';
import { eventBus } from '@/game/events/EventBus';
import { playSelectSound } from '@/lib/sounds';
import { zoomIn, PAGE_TRANSITION } from '@/lib/animations';
import BattleHUD from '@/ui/battle/BattleHUD';
import PlayerIndicator from '@/ui/battle/PlayerIndicator';
import TurnTimer from '@/ui/battle/TurnTimer';
import ScreenShake from '@/ui/effects/ScreenShake';
import ArenaBackground from '@/ui/components/ArenaBackground';
import BakuganImage from '@/ui/components/BakuganImage';
import bakuganData from '@/data/raw/bakugan.json';
import gateCardData from '@/data/raw/gate-cards.json';
import abilityCardData from '@/data/raw/ability-cards.json';
import type { Attribute, Bakugan, GateCard, AbilityCard } from '@/data/schemas';
import { BattleEngine } from '@/battle-engine/state-machine';
import type { BattleContext } from '@/battle-engine/types';

// Dynamic import — Phaser requires `window` so it must not be SSR'd.
const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { ssr: false });

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BattlePage() {
  const { startBattle, phase, player, battleEngine, startBattleEngine } = useBattleStore();
  const {
    isActive: pvpActive,
    mode: pvpMode,
    currentTurnIndex,
    turnTimer,
    turnTimerMax,
    players: pvpPlayers,
    startLocalBattle,
    startAIBattle,
    forfeit,
    resetPvP,
  } = usePvPStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'ai' | 'local' | null>(null);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStartAI = useCallback(() => {
    playSelectSound();
    startAIBattle();
    startBattle();
    setSelectedMode('ai');
    setGameStarted(true);
  }, [startAIBattle, startBattle]);

  const handleStartLocal = useCallback(() => {
    playSelectSound();
    startLocalBattle();
    startBattle();
    setSelectedMode('local');
    setGameStarted(true);
  }, [startLocalBattle, startBattle]);

  const handleForfeit = useCallback(() => {
    playSelectSound();
    forfeit(currentTurnIndex);
    setShowForfeitConfirm(false);
    setGameStarted(false);
    resetPvP();
  }, [forfeit, currentTurnIndex, resetPvP]);

  // Turn timer for local PvP
  useEffect(() => {
    if (!pvpActive || pvpMode !== 'local' || !gameStarted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      usePvPStore.getState().tickTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pvpActive, pvpMode, gameStarted]);

  // Listen for BATTLE_TRIGGERED and start the battle engine
  useEffect(() => {
    const onBattleTriggered = (data: {
      gateCardId: string;
      player1BakuganId: string;
      player2BakuganId: string;
    }) => {
      // Find the gate card and bakugan data
      const gateCard = gateCardData.find((gc) => gc.id === data.gateCardId);
      if (!gateCard) return;

      const playerBakugan = bakuganData.find((b) => b.id === data.player1BakuganId);
      const opponentBakugan = bakuganData.find(
        (b) => `opponent-${b.id}` === data.player2BakuganId,
      ) ?? bakuganData[0];

      if (!playerBakugan || !opponentBakugan) return;

      // Create ability cards for the battle
      const playerCards = abilityCardData.slice(0, 3) as unknown as AbilityCard[];
      const opponentCards = abilityCardData.slice(3, 6) as unknown as AbilityCard[];

      const context: BattleContext = {
        playerBakugan: playerBakugan as unknown as Bakugan,
        opponentBakugan: opponentBakugan as unknown as Bakugan,
        playerAttribute: playerBakugan.attributes[0] as Attribute,
        opponentAttribute: opponentBakugan.attributes[0] as Attribute,
        playerAbilityCards: playerCards,
        opponentAbilityCards: opponentCards,
        gateCard: gateCard as unknown as GateCard,
        turn: 1,
        aiDifficulty: 'easy',
        pvpMode: usePvPStore.getState().mode,
      };

      startBattleEngine(context);
    };

    eventBus.on('BATTLE_TRIGGERED', onBattleTriggered);
    return () => {
      eventBus.off('BATTLE_TRIGGERED', onBattleTriggered);
    };
  }, [startBattleEngine]);

  // Listen for CRITICAL_KO to trigger screen shake
  useEffect(() => {
    const onCriticalKO = () => setShakeTrigger((t) => t + 1);
    eventBus.on('CRITICAL_KO', onCriticalKO);
    return () => {
      eventBus.off('CRITICAL_KO', onCriticalKO);
    };
  }, []);

  return (
    <ScreenShake trigger={shakeTrigger} intensity={8} duration={500}>
      <motion.div
        {...PAGE_TRANSITION}
        variants={zoomIn}
        className="relative min-h-screen text-white overflow-hidden"
      >
        <ArenaBackground attribute="darkus" />
        <div className="relative z-10 min-h-screen">
        {!gameStarted ? (
          /* ── Pre-battle lobby ──────────────────────────────── */
          <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-black uppercase tracking-widest text-orange-500">
                Arena de Batalla
              </h1>
              <p className="mt-2 text-gray-400">
                ¡Coloca Gate Cards, lanza Bakugan, gana 3 Gate Cards para triunfar!
              </p>
            </motion.div>

            {/* Mode selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <h2 className="font-mono text-sm uppercase text-gray-500">Seleccionar Modo</h2>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartAI}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 px-8 py-5 transition ${
                    selectedMode === 'ai'
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">🤖</span>
                  <span className="font-mono text-sm font-bold text-white">vs IA</span>
                  <span className="font-mono text-[10px] text-gray-400">Un Jugador</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartLocal}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 px-8 py-5 transition ${
                    selectedMode === 'local'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">👥</span>
                  <span className="font-mono text-sm font-bold text-white">PvP Local</span>
                  <span className="font-mono text-[10px] text-gray-400">2 Jugadores</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Deck preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Bakugan lineup */}
              <div>
                <h2 className="mb-3 text-center font-mono text-sm uppercase text-gray-500">
                  {selectedMode === 'local' ? 'Bakugan J1' : 'Tu Bakugan'}
                </h2>
                <div className="flex gap-4">
                  {bakuganData.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col items-center gap-1 rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur p-3"
                    >
                      <BakuganImage
                        name={b.name}
                        attribute={b.attributes[0]}
                        size={56}
                        showName={false}
                      />
                      <span className="font-mono text-xs font-bold">{b.name}</span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {b.base_g_power} G
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMode === 'local' && (
                <div>
                  <h2 className="mb-3 text-center font-mono text-sm uppercase text-gray-500">
                    P2 Bakugan
                  </h2>
                  <div className="flex gap-4">
                    {bakuganData.slice(3, 6).map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-col items-center gap-1 rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur p-3"
                      >
                        <BakuganImage
                          name={b.name}
                          attribute={b.attributes[0]}
                          size={56}
                          showName={false}
                        />
                        <span className="font-mono text-xs font-bold">{b.name}</span>
                        <span className="font-mono text-[10px] text-gray-500">
                          {b.base_g_power} G
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ability Cards */}
              <div>
                <h2 className="mb-3 text-center font-mono text-sm uppercase text-gray-500">
                  Ability Cards
                </h2>
                <div className="flex gap-3">
                  {abilityCardData.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col items-center gap-1 rounded-lg border border-gray-700 bg-gray-900 p-2"
                    >
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: abilityCardColor(c.color) }}
                      >
                        {c.name}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500">{c.color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                <h3 className="mb-2 font-mono text-xs uppercase text-gray-500">Controles</h3>
                <ul className="space-y-1 font-mono text-xs text-gray-400">
                  <li>
                    <span className="text-green-400">Clic + Arrastrar</span> en Bakugan para apuntar el lanzamiento
                  </li>
                  <li>
                    <span className="text-blue-400">WASD / Flechas</span> para dirigir en el campo
                  </li>
                  <li>
                    <span className="text-orange-400">Velocidad</span> = velocidad de lanzamiento &nbsp;|&nbsp;
                    <span className="text-purple-400">Dirección</span> = tiempo de movimiento
                  </li>
                  <li>
                    <span className="text-yellow-400">Scratch</span> durante el minijuego de batalla para
                    G-Power
                  </li>
                  {selectedMode === 'local' && (
                    <li>
                      <span className="text-blue-400">J1</span> controla abajo &nbsp;|&nbsp;
                      <span className="text-red-400">J2</span> controla arriba
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-gray-600"
            >
              Proyecto de fans — No afiliado a SEGA ni Spin Master
            </motion.p>
          </div>
        ) : (
          /* ── Battle view ────────────────────────────────────── */
          <div className="flex h-screen items-center justify-center bg-gray-950">
            <div className="relative">
              {/* Phaser canvas (client-only) */}
              <PhaserGame />

              {/* HUD overlay — rendered on top of the canvas */}
              <div className="pointer-events-none absolute inset-0">
                <BattleHUD />
              </div>

              {/* PvP overlays — only active in local PvP mode */}
              {pvpActive && pvpMode === 'local' && (
                <>
                  <PlayerIndicator
                    currentPlayer={currentTurnIndex}
                    playerNames={[pvpPlayers[0].name, pvpPlayers[1].name]}
                    isActive={pvpActive}
                  />
                  <TurnTimer
                    timeRemaining={turnTimer}
                    maxTime={turnTimerMax}
                    isActive={pvpActive}
                  />
                </>
              )}

              {/* Forfeit button — only during active battle */}
              {gameStarted && pvpActive && (
                <div className="pointer-events-auto absolute bottom-4 right-4 z-50">
                  <AnimatePresence>
                    {showForfeitConfirm ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-2 rounded-lg border border-red-500 bg-gray-900 p-3"
                      >
                        <span className="font-mono text-xs text-red-400">¿Rendirse?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={handleForfeit}
                            className="rounded bg-red-500 px-3 py-1 font-mono text-xs font-bold text-white hover:bg-red-600"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setShowForfeitConfirm(false)}
                            className="rounded bg-gray-700 px-3 py-1 font-mono text-xs text-gray-300 hover:bg-gray-600"
                          >
                            No
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForfeitConfirm(true)}
                        className="rounded-lg border border-gray-600 bg-gray-800/80 px-4 py-2 font-mono text-xs text-gray-400 backdrop-blur-sm hover:border-red-500 hover:text-red-400"
                      >
                        Rendirse
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Sidebar — deck info */}
            <aside className="ml-4 flex h-[768px] w-56 flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/80 p-4">
              <h3 className="font-mono text-xs uppercase text-gray-500">Tu Mazo</h3>
              {player.bakugan.slice(0, 3).map((b, i) => (
                <div
                  key={b.id}
                  className={`flex items-center gap-2 rounded border p-2 font-mono text-xs ${
                    i === player.currentBakuganIndex
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: attributeColor(b.attributes?.[0] ?? 'pyrus') }}
                  />
                  <span className="flex-1 font-bold">{b.name}</span>
                  <span className="text-gray-500">{b.base_g_power}G</span>
                </div>
              ))}

              <div className="mt-auto border-t border-gray-700 pt-3">
                <h4 className="mb-1 font-mono text-[10px] uppercase text-gray-600">
                  Gate Cards Ganadas
                </h4>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-3 w-5 rounded ${
                        i < player.gateCardsWon ? 'bg-yellow-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
        </div>
      </motion.div>
    </ScreenShake>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function attributeColor(attr: string): string {
  const map: Record<string, string> = {
    pyrus: '#e63946',
    aquos: '#457b9d',
    subterra: '#a0522d',
    haos: '#f1faee',
    darkus: '#7b2d8e',
    ventus: '#2a9d8f',
  };
  return map[attr] ?? '#888888';
}

function abilityCardColor(color: string): string {
  const map: Record<string, string> = {
    red: '#ff4444',
    green: '#44ff44',
    blue: '#4444ff',
  };
  return map[color] ?? '#888888';
}
