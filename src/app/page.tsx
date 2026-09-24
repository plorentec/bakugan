"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useProgressionStore } from "@/stores/progression-store";
import { getXpForLevel } from "@/lib/xp";
import { playSelectSound } from "@/lib/sounds";
import { staggerContainer, staggerItem, PAGE_TRANSITION } from "@/lib/animations";

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
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white"
    >
      {/* Title */}
      <motion.div
        variants={staggerItem}
        className="text-center mb-8"
      >
        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-widest mb-2">
          <span className="text-orange-500">Bakugan</span>
        </h1>
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
        className="w-full max-w-xs mb-8 bg-gray-900 border border-gray-800 rounded-lg p-4"
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
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="/story"
          onClick={() => playSelectSound()}
          className="block w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider hover:from-purple-600 hover:to-indigo-600 transition shadow-lg shadow-purple-500/20"
        >
          Story Mode
        </motion.a>

        <motion.a
          variants={staggerItem}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="/deck-builder"
          onClick={() => playSelectSound()}
          className="block w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-500/20"
        >
          Deck Builder
        </motion.a>

        <motion.a
          variants={staggerItem}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="/battle?mode=pvp"
          onClick={() => playSelectSound()}
          className="block w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider hover:from-blue-600 hover:to-cyan-600 transition shadow-lg shadow-blue-500/20"
        >
          PvP Battle
        </motion.a>

        <motion.a
          variants={staggerItem}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="/battle"
          onClick={() => playSelectSound()}
          className="block w-full py-4 px-6 bg-gradient-to-r from-red-500 to-purple-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider hover:from-red-600 hover:to-purple-600 transition shadow-lg shadow-red-500/20"
        >
          Free Battle
        </motion.a>

        <motion.a
          variants={staggerItem}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="/shop"
          onClick={() => playSelectSound()}
          className="block w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider hover:from-yellow-600 hover:to-amber-600 transition shadow-lg shadow-yellow-500/20"
        >
          Shop
        </motion.a>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-[10px] text-gray-700 text-center"
      >
        Fan project &mdash; Not affiliated with SEGA or Spin Master
      </motion.p>
    </motion.div>
  );
}
