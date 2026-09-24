"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useDeckStore } from "@/stores/deck-store";
import BakuganPanel from "@/ui/deck-builder/BakuganPanel";
import GateCardPanel from "@/ui/deck-builder/GateCardPanel";
import AbilityCardPanel from "@/ui/deck-builder/AbilityCardPanel";
import DeckSummary from "@/ui/deck-builder/DeckSummary";

export default function DeckBuilderPage() {
  const loadDeck = useDeckStore((s) => s.loadDeck);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="border-b border-gray-800 px-6 py-4"
      >
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              &larr; Menu
            </a>
            <span className="text-gray-600">|</span>
            <h1 className="text-xl font-black uppercase tracking-widest">
              <span className="text-orange-500">Bakugan</span>{" "}
              <span className="text-white">Deck Builder</span>
            </h1>
          </div>
        </div>
      </motion.header>

      {/* Main content: 3 panels + summary sidebar */}
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <div className="flex gap-4 lg:gap-6" style={{ height: "calc(100vh - 80px)" }}>
          {/* Three card panels */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 min-h-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/80 rounded-xl border border-gray-800 p-4 overflow-hidden flex flex-col"
            >
              <BakuganPanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/80 rounded-xl border border-gray-800 p-4 overflow-hidden flex flex-col"
            >
              <GateCardPanel />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/80 rounded-xl border border-gray-800 p-4 overflow-hidden flex flex-col"
            >
              <AbilityCardPanel />
            </motion.div>
          </div>

          {/* Deck summary sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:flex w-[280px] xl:w-[320px] flex-shrink-0 bg-gray-900/80 rounded-xl border border-gray-800 p-4 overflow-y-auto"
          >
            <div className="w-full">
              <DeckSummary />
            </div>
          </motion.aside>
        </div>

        {/* Mobile summary (below panels) */}
        <div className="lg:hidden mt-4">
          <div className="bg-gray-900/80 rounded-xl border border-gray-800 p-4">
            <DeckSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
