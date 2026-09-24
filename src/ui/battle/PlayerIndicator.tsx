'use client';

/**
 * PlayerIndicator — shows which player's turn it is during local PvP.
 *
 * Displays a badge (P1 / P2) with the player name and an animated
 * transition effect when turns switch.
 */

import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface PlayerIndicatorProps {
  /** Current player index (0 = P1, 1 = P2) */
  currentPlayer: number;
  /** Player names */
  playerNames: [string, string];
  /** Whether PvP is active */
  isActive: boolean;
  /** Player colors */
  colors?: [string, string];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_COLORS: [string, string] = ['#3b82f6', '#ef4444'];
const PLAYER_LABELS: [string, string] = ['P1', 'P2'];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function PlayerIndicator({
  currentPlayer,
  playerNames,
  isActive,
  colors = DEFAULT_COLORS,
}: PlayerIndicatorProps) {
  if (!isActive) return null;

  const idx = currentPlayer === 0 ? 0 : 1;
  const color = colors[idx];

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={`player-${currentPlayer}`}
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-3 rounded-lg border px-4 py-2 shadow-lg backdrop-blur-sm"
          style={{
            borderColor: color,
            backgroundColor: `${color}20`,
          }}
        >
          {/* Avatar placeholder */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {PLAYER_LABELS[idx]}
          </div>

          {/* Player info */}
          <div className="flex flex-col">
            <span
              className="font-mono text-xs font-bold uppercase"
              style={{ color }}
            >
              {PLAYER_LABELS[idx]}
            </span>
            <span className="font-mono text-xs text-gray-300">
              {playerNames[idx]}
            </span>
          </div>

          {/* Active turn pulse */}
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="ml-2 h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
