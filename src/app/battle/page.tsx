'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useBattleStore } from '@/stores/battle-store';
import { eventBus } from '@/game/events/EventBus';
import BattleHUD from '@/ui/battle/BattleHUD';
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
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = () => {
    startBattle();
    setGameStarted(true);
  };

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
      };

      startBattleEngine(context);
    };

    eventBus.on('BATTLE_TRIGGERED', onBattleTriggered);
    return () => {
      eventBus.off('BATTLE_TRIGGERED', onBattleTriggered);
    };
  }, [startBattleEngine]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!gameStarted ? (
        /* ── Pre-battle lobby ──────────────────────────────── */
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-black uppercase tracking-widest text-orange-500">
              Battle Arena
            </h1>
            <p className="mt-2 text-gray-400">
              Place Gate Cards, throw Bakugan, win 3 Gate Cards to triumph!
            </p>
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
                Your Bakugan
              </h2>
              <div className="flex gap-4">
                {bakuganData.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col items-center gap-1 rounded-lg border border-gray-700 bg-gray-900 p-3"
                  >
                    <div
                      className="h-10 w-10 rounded-full"
                      style={{
                        backgroundColor: attributeColor(b.attributes[0]),
                      }}
                    />
                    <span className="font-mono text-xs font-bold">{b.name}</span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {b.base_g_power} G
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
              <h3 className="mb-2 font-mono text-xs uppercase text-gray-500">Controls</h3>
              <ul className="space-y-1 font-mono text-xs text-gray-400">
                <li>
                  <span className="text-green-400">Click + Drag</span> on Bakugan to aim throw
                </li>
                <li>
                  <span className="text-blue-400">WASD / Arrows</span> to steer on field
                </li>
                <li>
                  <span className="text-orange-400">Speed</span> = throw velocity &nbsp;|&nbsp;
                  <span className="text-purple-400">Steering</span> = movement time
                </li>
                <li>
                  <span className="text-yellow-400">Scratch</span> during battle minigame for
                  G-Power
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Start button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-10 py-4 font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-red-600"
          >
            Start Battle
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-gray-600"
          >
            Fan project — Not affiliated with SEGA or Spin Master
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
          </div>

          {/* Sidebar — deck info */}
          <aside className="ml-4 flex h-[768px] w-56 flex-col gap-4 rounded-lg border border-gray-800 bg-gray-900/80 p-4">
            <h3 className="font-mono text-xs uppercase text-gray-500">Your Deck</h3>
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
                Gate Cards Won
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
