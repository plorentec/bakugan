"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDeckStore } from "@/stores/deck-store";
import type { AbilityCard, AbilityCardColor } from "@/data/schemas";
import abilityCardData from "@/data/raw/ability-cards.json";

// ─── Color Styles ─────────────────────────────────────────────────────

const colorBg: Record<AbilityCardColor, string> = {
  red: "bg-red-600",
  green: "bg-green-600",
  blue: "bg-blue-600",
};

const colorBorder: Record<AbilityCardColor, string> = {
  red: "border-red-500",
  green: "border-green-500",
  blue: "border-blue-500",
};

const colorText: Record<AbilityCardColor, string> = {
  red: "text-red-400",
  green: "text-green-400",
  blue: "text-blue-400",
};

const colorLabels: Record<AbilityCardColor, string> = {
  red: "Rojo",
  green: "Verde",
  blue: "Azul",
};

const colors: AbilityCardColor[] = ["red", "green", "blue"];

// ─── Component ────────────────────────────────────────────────────────

export default function AbilityCardPanel() {
  const [filter, setFilter] = useState<AbilityCardColor | "all">("all");
  const deck = useDeckStore((s) => s.deck);
  const addAbilityCard = useDeckStore((s) => s.addAbilityCard);
  const removeAbilityCard = useDeckStore((s) => s.removeAbilityCard);

  const cards = abilityCardData as AbilityCard[];
  const filtered =
    filter === "all" ? cards : cards.filter((c) => c.color === filter);

  const inDeck = (id: string) =>
    deck.ability_cards.some((a) => a.ability_card_id === id);

  // Count colors in deck
  const colorCounts = { red: 0, green: 0, blue: 0 };
  for (const ac of deck.ability_cards) {
    const card = cards.find((c) => c.id === ac.ability_card_id);
    if (card) colorCounts[card.color]++;
  }

  const handleToggle = (card: AbilityCard) => {
    if (inDeck(card.id)) {
      removeAbilityCard(card.id);
    } else if (deck.ability_cards.length < 3) {
      addAbilityCard(card);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-xl font-bold text-pink-400 uppercase tracking-wider">
        Ability Cards
      </h2>

      {/* Color filter */}
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
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${
              filter === c
                ? `${colorBg[c]} text-white`
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {colorLabels[c]}
          </button>
        ))}
      </div>

      {/* Color counts */}
      <div className="flex gap-2 text-[10px]">
        {colors.map((c) => (
          <span key={c} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${colorBg[c]}`} />
            <span className={colorCounts[c] === 1 ? "text-green-400" : "text-gray-500"}>
              {colorCounts[c]}/1
            </span>
          </span>
        ))}
      </div>

      {/* Ability Card list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
        {filtered.map((card) => {
          const selected = inDeck(card.id);
          return (
            <motion.button
              key={card.id}
              onClick={() => handleToggle(card)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full text-left p-3 rounded-lg border-2 transition-all ${
                selected
                  ? `${colorBorder[card.color]} bg-gray-800/80 ring-2 ring-white/30`
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
              }`}
            >
              {selected && (
                <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-bold">
                  EN MAZO
                </span>
              )}

              {/* Name + Color badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-white text-sm">{card.name}</span>
                <span
                  className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${colorBg[card.color]} text-white`}
                >
                  {colorLabels[card.color]}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-300 mb-1.5">{card.description}</p>

              {/* Effects */}
              <div className="flex flex-col gap-0.5">
                {card.effects.map((effect, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    <span className={`${colorText[card.color]} font-mono`}>
                      {effect.type}
                    </span>
                    {effect.magnitude !== undefined && (
                      <span className="text-orange-300">+{effect.magnitude}G</span>
                    )}
                    {effect.condition && (
                      <span className="text-gray-500 italic">
                        ({effect.condition.description})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Deck count */}
      <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-700">
        {deck.ability_cards.length} / 3 en mazo
      </div>
    </div>
  );
}
