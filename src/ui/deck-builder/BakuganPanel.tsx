"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDeckStore } from "@/stores/deck-store";
import { playSelectSound } from "@/lib/sounds";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { Bakugan, Attribute } from "@/data/schemas";
import bakuganData from "@/data/raw/bakugan.json";
import BakuganCard from "@/ui/components/BakuganCard";

// ─── Attribute Colors ─────────────────────────────────────────────────

const attributeColors: Record<Attribute, string> = {
  pyrus: "bg-red-500",
  aquos: "bg-blue-500",
  subterra: "bg-amber-600",
  haos: "bg-yellow-300",
  darkus: "bg-purple-600",
  ventus: "bg-green-500",
};

const attributeBorderColors: Record<Attribute, string> = {
  pyrus: "border-red-500",
  aquos: "border-blue-500",
  subterra: "border-amber-600",
  haos: "border-yellow-300",
  darkus: "border-purple-600",
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

const attributes: Attribute[] = [
  "pyrus",
  "aquos",
  "subterra",
  "haos",
  "darkus",
  "ventus",
];

// ─── Component ────────────────────────────────────────────────────────

export default function BakuganPanel() {
  const [filter, setFilter] = useState<Attribute | "all">("all");
  const deck = useDeckStore((s) => s.deck);
  const addBakugan = useDeckStore((s) => s.addBakugan);
  const removeBakugan = useDeckStore((s) => s.removeBakugan);

  const bakugan = bakuganData as Bakugan[];
  const filtered =
    filter === "all" ? bakugan : bakugan.filter((b) => b.attributes.includes(filter));

  const inDeck = (id: string) => deck.bakugan.some((b) => b.bakugan_id === id);

  const handleToggle = (b: Bakugan) => {
    playSelectSound();
    if (inDeck(b.id)) {
      removeBakugan(b.id);
    } else if (deck.bakugan.length < 3) {
      addBakugan(b);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-xl font-bold text-orange-400 uppercase tracking-wider">
        Bakugan
      </h2>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={`px-2 py-1 rounded text-xs font-semibold transition ${
            filter === "all"
              ? "bg-gray-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Todos
        </button>
        {attributes.map((attr) => (
          <button
            key={attr}
            onClick={() => setFilter(attr)}
            className={`px-2 py-1 rounded text-xs font-semibold capitalize transition ${
              filter === attr
                ? `${attributeColors[attr]} text-white`
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {attr}
          </button>
        ))}
      </div>

      {/* Bakugan cards — staggered entrance */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1"
      >
        {filtered.map((b) => {
          const selected = inDeck(b.id);
          const primaryAttr = b.attributes[0];
          return (
            <motion.button
              key={b.id}
              variants={staggerItem}
              onClick={() => handleToggle(b)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={
                selected
                  ? {
                      boxShadow: [
                        "0 0 0px rgba(255,200,0,0)",
                        "0 0 12px rgba(255,200,0,0.4)",
                        "0 0 0px rgba(255,200,0,0)",
                      ],
                    }
                  : { boxShadow: "0 0 0px rgba(255,200,0,0)" }
              }
              transition={
                selected
                  ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
              className={`relative w-full text-left p-3 rounded-lg border-2 transition-all ${
                selected
                  ? `${attributeBorderColors[primaryAttr]} bg-gray-800/80`
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
              }`}
            >
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-bold"
                >
                  EN MAZO
                </motion.span>
              )}

              {/* Bakugan Card */}
              <div className="flex justify-center mb-1.5">
                <BakuganCard
                  name={b.name}
                  attribute={primaryAttr}
                  baseGPower={b.base_g_power}
                  maxGPower={b.max_g_power}
                  stats={b.stats}
                  size="sm"
                />
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-5 gap-1">
                {(["speed", "defense", "control", "steering", "magnet"] as const).map(
                  (stat) => (
                    <div key={stat} className="text-center">
                      <div className="text-[9px] text-gray-400 uppercase leading-none">
                        {stat.slice(0, 2)}
                      </div>
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {Array.from({ length: 4 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-2 rounded-sm ${
                              i < b.stats[stat]
                                ? attributeTextColors[primaryAttr].replace("text-", "bg-")
                                : "bg-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Deck count */}
      <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-700">
        {deck.bakugan.length} / 3 en mazo
      </div>
    </div>
  );
}
