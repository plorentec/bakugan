"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProgressionStore } from "@/stores/progression-store";
import type { StatName } from "@/lib/stats";
import { STAT_MAX, STAT_NAMES, recalculateGPower, getRemainingStatPoints } from "@/lib/stats";

// ─── Stat display config ──────────────────────────────────────────────

const statLabels: Record<StatName, { name: string; desc: string; icon: string }> = {
  speed: { name: "Speed", desc: "Movement speed, starting velocity bonus", icon: "⚡" },
  defense: { name: "Defense", desc: "Resistance to Critical KOs", icon: "🛡️" },
  control: { name: "Control", desc: "Turn responsiveness, stop-and-turn speed", icon: "🎯" },
  steering: { name: "Steering", desc: "Duration of movement control before auto-stand", icon: "🔄" },
  magnet: { name: "Magnet", desc: "Stand probability when rolling over Gate Card", icon: "🧲" },
};

const statColors: Record<StatName, string> = {
  speed: "from-red-500 to-orange-500",
  defense: "from-blue-500 to-cyan-500",
  control: "from-yellow-500 to-amber-500",
  steering: "from-green-500 to-emerald-500",
  magnet: "from-purple-500 to-pink-500",
};

const statBorderColors: Record<StatName, string> = {
  speed: "border-red-500",
  defense: "border-blue-500",
  control: "border-yellow-500",
  steering: "border-green-500",
  magnet: "border-purple-500",
};

// ─── Page ─────────────────────────────────────────────────────────────

export default function LevelUpPage() {
  const router = useRouter();
  const level = useProgressionStore((s) => s.level);
  const allocatedStats = useProgressionStore((s) => s.allocatedStats);
  const pendingStatPoints = useProgressionStore((s) => s.pendingStatPoints);
  const allocateStatPoint = useProgressionStore((s) => s.allocateStatPoint);
  const clearLevelUpFlag = useProgressionStore((s) => s.clearLevelUpFlag);

  const [selectedStat, setSelectedStat] = useState<StatName | null>(null);
  const [allocatedInSession, setAllocatedInSession] = useState<StatName[]>([]);

  const currentPoints = pendingStatPoints - allocatedInSession.length;
  const allDone = currentPoints <= 0;

  const handleAllocate = (stat: StatName) => {
    if (currentPoints <= 0) return;
    if (allocatedStats[stat] >= STAT_MAX) return;

    setSelectedStat(stat);
  };

  const confirmAllocation = () => {
    if (!selectedStat) return;
    const success = allocateStatPoint(selectedStat);
    if (success) {
      setAllocatedInSession([...allocatedInSession, selectedStat]);
      setSelectedStat(null);
    }
  };

  const handleFinish = () => {
    clearLevelUpFlag();
    router.push("/");
  };

  // Calculate G-Power preview
  const previewGPower = selectedStat
    ? recalculateGPower(300, level, {
        ...allocatedStats,
        [selectedStat]: allocatedStats[selectedStat] + 1,
      })
    : recalculateGPower(300, level, allocatedStats);

  const currentGPower = recalculateGPower(300, level, allocatedStats);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition text-sm font-bold"
          >
            ← Home
          </Link>
          <h1 className="text-xl font-black uppercase tracking-wider text-orange-400">
            Level Up!
          </h1>
          <div className="text-sm text-gray-400">
            Lv. {level}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Level up banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-4xl font-black text-orange-400 mb-2">
            Level {level}!
          </h2>
          <p className="text-gray-400">
            {currentPoints > 0
              ? `Allocate ${currentPoints} stat point${currentPoints > 1 ? "s" : ""}`
              : "All points allocated!"}
          </p>
        </motion.div>

        {/* G-Power preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8 text-center"
        >
          <div className="text-sm text-gray-400 mb-1">Effective G-Power</div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl font-black text-orange-300">
              {selectedStat ? (
                <>
                  <span className="text-gray-500">{currentGPower}</span>
                  <span className="text-green-400 mx-2">→</span>
                  {previewGPower}
                </>
              ) : (
                currentGPower
              )}
            </span>
          </div>
        </motion.div>

        {/* Stat allocation */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {STAT_NAMES.map((stat, idx) => {
            const info = statLabels[stat];
            const value = allocatedStats[stat];
            const isMaxed = value >= STAT_MAX;
            const isSelected = selectedStat === stat;

            return (
              <motion.button
                key={stat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                onClick={() => handleAllocate(stat)}
                disabled={isMaxed || currentPoints <= 0}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `${statBorderColors[stat]} bg-gray-800 ring-2 ring-orange-400/50`
                    : isMaxed
                      ? "border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-500 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.icon}</span>
                    <span className="font-bold text-white">{info.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-orange-300">
                      {value}
                    </span>
                    <span className="text-xs text-gray-500">/ {STAT_MAX}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-2">{info.desc}</p>

                {/* Stat bar */}
                <div className="flex gap-1">
                  {Array.from({ length: STAT_MAX }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-sm transition-all ${
                        i < value
                          ? `bg-gradient-to-r ${statColors[stat]}`
                          : i === value && !isMaxed
                            ? "bg-gray-600"
                            : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Confirm button */}
        <AnimatePresence>
          {selectedStat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur border-t border-gray-800"
            >
              <div className="max-w-2xl mx-auto flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-400">
                    Allocate to: <span className="text-white font-bold">{statLabels[selectedStat].name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {allocatedStats[selectedStat]} → {allocatedStats[selectedStat] + 1}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedStat(null)}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmAllocation}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold hover:from-orange-600 hover:to-red-600 transition shadow-lg"
                  >
                    Confirm
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finish button */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg uppercase tracking-wider hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
            >
              Continue
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
