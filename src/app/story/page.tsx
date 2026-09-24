"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useProgressionStore } from "@/stores/progression-store";
import { playClickSound } from "@/lib/sounds";
import { fadeScaleIn, PAGE_TRANSITION } from "@/lib/animations";
import { STORY_OPPONENTS, isOpponentUnlocked, getDefeatedCount } from "@/lib/story";
import type { Attribute } from "@/data/schemas";

// ─── Attribute styles ─────────────────────────────────────────────────

const attributeColors: Record<Attribute, string> = {
  pyrus: "from-red-600 to-orange-500",
  aquos: "from-blue-600 to-cyan-500",
  subterra: "from-amber-700 to-yellow-600",
  haos: "from-yellow-400 to-white",
  darkus: "from-purple-700 to-indigo-600",
  ventus: "from-green-600 to-emerald-500",
};

const attributeBorderColors: Record<Attribute, string> = {
  pyrus: "border-red-500",
  aquos: "border-blue-500",
  subterra: "border-amber-600",
  haos: "border-yellow-300",
  darkus: "border-purple-500",
  ventus: "border-green-500",
};

const attributeTextColors: Record<Attribute, string> = {
  pyrus: "text-red-400",
  aquos: "text-blue-400",
  subterra: "text-amber-500",
  haos: "text-yellow-200",
  darkus: "text-purple-400",
  ventus: "text-green-400",
};

const difficultyLabels: Record<number, string> = {
  1: "EASY",
  2: "EASY",
  3: "EASY",
  4: "NORMAL",
  5: "NORMAL",
  6: "HARD",
  7: "HARD",
};

const difficultyColors: Record<string, string> = {
  EASY: "text-green-400",
  NORMAL: "text-yellow-400",
  HARD: "text-red-400",
};

// ─── Page ─────────────────────────────────────────────────────────────

export default function StoryPage() {
  const storyProgress = useProgressionStore((s) => s.storyProgress);
  const level = useProgressionStore((s) => s.level);

  const defeatedCount = getDefeatedCount(storyProgress);

  const opponents = useMemo(() => {
    return STORY_OPPONENTS.map((opp) => ({
      ...opp,
      unlocked: isOpponentUnlocked(opp.id, storyProgress),
      defeated: storyProgress[opp.id] === true,
    }));
  }, [storyProgress]);

  return (
    <motion.div
      {...PAGE_TRANSITION}
      variants={fadeScaleIn}
      className="min-h-screen bg-gray-950 text-white"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={() => playClickSound()}
              className="text-gray-400 hover:text-white transition text-sm font-bold"
            >
              ← Home
            </Link>
            <h1 className="text-xl font-black uppercase tracking-wider text-orange-400">
              Story Mode
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            {defeatedCount} / {STORY_OPPONENTS.length} defeated
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Story Progress</span>
            <span className="text-sm text-orange-400 font-bold">
              {Math.round((defeatedCount / STORY_OPPONENTS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(defeatedCount / STORY_OPPONENTS.length) * 100}%`,
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />
          </div>
        </div>

        {/* Opponent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opponents.map((opponent, idx) => {
            const isLocked = !opponent.unlocked && !opponent.defeated;
            const difficulty = difficultyLabels[opponent.order] || "NORMAL";
            const diffColor = difficultyColors[difficulty] || "text-gray-400";

            return (
              <motion.div
                key={opponent.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.08, duration: 0.35, ease: "easeOut" }}
                whileHover={!isLocked ? { scale: 1.02, y: -2 } : undefined}
                className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                  isLocked
                    ? "border-gray-800 bg-gray-900/50 opacity-40"
                    : opponent.defeated
                      ? `${attributeBorderColors[opponent.attribute]} bg-gray-900/80 opacity-70`
                      : `${attributeBorderColors[opponent.attribute]} bg-gray-900/80 hover:bg-gray-800/80`
                }`}
              >
                {/* Gradient accent */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                    attributeColors[opponent.attribute]
                  }`}
                />

                <div className="p-5">
                  {/* Status badges */}
                  <div className="flex items-center gap-2 mb-3">
                    {opponent.defeated && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-bold">
                        DEFEATED
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded font-bold">
                        🔒 LOCKED
                      </span>
                    )}
                    {!opponent.defeated && !isLocked && (
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${diffColor}`}>
                        {difficulty}
                      </span>
                    )}
                  </div>

                  {/* Opponent info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-14 h-14 rounded-lg bg-gradient-to-br ${
                        attributeColors[opponent.attribute]
                      } flex items-center justify-center text-2xl font-black text-white`}
                    >
                      {opponent.name[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {opponent.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs uppercase font-bold ${
                            attributeTextColors[opponent.attribute]
                          }`}
                        >
                          {opponent.attribute}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">
                          {opponent.storyGPower} G
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* G-Power bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>G-Power</span>
                      <span>{opponent.storyGPower} (Story Mode: {opponent.gPower} - 100)</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          attributeColors[opponent.attribute]
                        } rounded-full`}
                        style={{
                          width: `${Math.min(100, (opponent.storyGPower / 500) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action */}
                  {!isLocked && !opponent.defeated && (
                    <Link
                      href={`/battle?story=${opponent.id}`}
                      onClick={() => playClickSound()}
                      className={`block w-full py-2 rounded-lg text-center font-bold text-sm uppercase tracking-wider transition bg-gradient-to-r ${
                        attributeColors[opponent.attribute]
                      } text-white hover:opacity-90`}
                    >
                      Battle {opponent.name}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Story complete message */}
        {defeatedCount === STORY_OPPONENTS.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center p-8 bg-gray-900 border border-orange-500/30 rounded-xl"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-2xl font-black text-orange-400 mb-2">
              Story Complete!
            </h2>
            <p className="text-gray-400 mb-4">
              You&apos;ve defeated all opponents! The Bakugan Master Cup shop tier is now unlocked.
            </p>
            <Link
              href="/shop"
              onClick={() => playClickSound()}
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold uppercase tracking-wider hover:from-orange-600 hover:to-red-600 transition"
            >
              Visit Shop
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
