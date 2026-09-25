"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useProgressionStore } from "@/stores/progression-store";
import { getXpForLevel } from "@/lib/xp";
import { playSelectSound } from "@/lib/sounds";
import { staggerContainer, staggerItem, PAGE_TRANSITION } from "@/lib/animations";
import ArenaBackground from "@/ui/components/ArenaBackground";

export default function Home() {
  const money = useProgressionStore((s) => s.money);
  const xp = useProgressionStore((s) => s.xp);
  const level = useProgressionStore((s) => s.level);
  const loadProgression = useProgressionStore((s) => s.loadProgression);

  useEffect(() => {
    loadProgression();
  }, [loadProgression]);

  const xpProgress = useMemo(() => {
    const xpNeeded = getXpForLevel(level + 1);
    const xpCurrent = xp;
    if (xpNeeded === Infinity || xpNeeded === 0) return 100;
    return Math.min(100, (xpCurrent / xpNeeded) * 100);
  }, [xp, level]);

  return (
    <motion.div
      {...PAGE_TRANSITION}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }}
      className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden"
    >
      {/* Background */}
      <ArenaBackground attribute="darkus" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Title */}
        <motion.div
          variants={staggerItem}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-6xl lg:text-8xl font-black uppercase tracking-widest mb-2"
            animate={{
              textShadow: [
                "0 0 20px rgba(249,115,22,0.5)",
                "0 0 40px rgba(249,115,22,0.8)",
                "0 0 20px rgba(249,115,22,0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-orange-500">Bakugan</span>
          </motion.h1>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-300 uppercase tracking-wider">
            Battle Brawlers
          </h2>
          <p className="text-gray-500 mt-4 text-sm">
            Nintendo DS Web Recreation
          </p>
        </motion.div>

        {/* Progression bar */}
        <motion.div
          variants={staggerItem}
          className="w-full max-w-xs mb-8 bg-black/60 backdrop-blur border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase font-bold">Lv. {level}</span>
            <span className="text-xs text-yellow-400 font-mono">{money.toLocaleString()} G</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500">{xp} XP</span>
            <span className="text-[10px] text-gray-500">
              {getXpForLevel(level + 1) === Infinity ? "MAX" : `${getXpForLevel(level + 1)} XP`}
            </span>
          </div>
        </motion.div>

        {/* Menu buttons */}
        <motion.div
          variants={staggerContainer}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}
            whileTap={{ scale: 0.97 }}
            href="/story"
            onClick={() => playSelectSound()}
            className="block w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20"
          >
            🎮 Story Mode
          </motion.a>

          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(249,115,22,0.4)" }}
            whileTap={{ scale: 0.97 }}
            href="/deck-builder"
            onClick={() => playSelectSound()}
            className="block w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20"
          >
            🃏 Deck Builder
          </motion.a>

          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}
            whileTap={{ scale: 0.97 }}
            href="/battle?mode=pvp"
            onClick={() => playSelectSound()}
            className="block w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
          >
            ⚔️ PvP Battle
          </motion.a>

          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(239,68,68,0.4)" }}
            whileTap={{ scale: 0.97 }}
            href="/battle"
            onClick={() => playSelectSound()}
            className="block w-full py-4 px-6 bg-gradient-to-r from-red-500 to-purple-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider transition-all shadow-lg shadow-red-500/20"
          >
            🔥 Free Battle
          </motion.a>

          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(234,179,8,0.4)" }}
            whileTap={{ scale: 0.97 }}
            href="/shop"
            onClick={() => playSelectSound()}
            className="block w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/20"
          >
            🛒 Shop
          </motion.a>

          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
            whileTap={{ scale: 0.97 }}
            href="/collection"
            onClick={() => playSelectSound()}
            className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider transition-all shadow-lg shadow-green-500/20"
          >
            📚 Bakudex
          </motion.a>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-[10px] text-gray-600 text-center"
        >
          Fan project — Not affiliated with SEGA or Spin Master
        </motion.p>
      </div>
    </motion.div>
  );
}
