"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
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

      {/* Menu buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <a
          href="/deck-builder"
          className="block w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-center font-bold text-lg uppercase tracking-wider hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-500/20"
        >
          Deck Builder
        </a>

        <button
          disabled
          className="block w-full py-4 px-6 bg-gray-800 rounded-lg text-center font-bold text-lg uppercase tracking-wider text-gray-600 cursor-not-allowed border border-gray-700"
        >
          Battle (Coming Soon)
        </button>

        <button
          disabled
          className="block w-full py-4 px-6 bg-gray-800 rounded-lg text-center font-bold text-lg uppercase tracking-wider text-gray-600 cursor-not-allowed border border-gray-700"
        >
          Shop (Coming Soon)
        </button>
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
    </div>
  );
}
