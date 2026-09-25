"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDeckStore } from "@/stores/deck-store";
import type { GateCard, GateCardTier } from "@/data/schemas";
import gateCardData from "@/data/raw/gate-cards.json";

// ─── Tier Colors ──────────────────────────────────────────────────────

const tierColors: Record<GateCardTier, string> = {
  gold: "bg-yellow-500",
  silver: "bg-gray-400",
  copper: "bg-orange-700",
};

const tierBorderColors: Record<GateCardTier, string> = {
  gold: "border-yellow-500",
  silver: "border-gray-400",
  copper: "border-orange-700",
};

const tierLabels: Record<GateCardTier, string> = {
  gold: "Oro",
  silver: "Plata",
  copper: "Cobre",
};

const tiers: GateCardTier[] = ["gold", "silver", "copper"];

// ─── Component ────────────────────────────────────────────────────────

export default function GateCardPanel() {
  const [filter, setFilter] = useState<GateCardTier | "all">("all");
  const deck = useDeckStore((s) => s.deck);
  const addGateCard = useDeckStore((s) => s.addGateCard);
  const removeGateCard = useDeckStore((s) => s.removeGateCard);

  const cards = gateCardData as GateCard[];
  const filtered =
    filter === "all" ? cards : cards.filter((c) => c.tier === filter);

  const inDeck = (id: string) => deck.gate_cards.some((g) => g.gate_card_id === id);

  // Count how many of each tier are in the deck
  const tierCounts = { gold: 0, silver: 0, copper: 0 };
  for (const gc of deck.gate_cards) {
    const card = cards.find((c) => c.id === gc.gate_card_id);
    if (card) tierCounts[card.tier]++;
  }

  const handleToggle = (card: GateCard) => {
    if (inDeck(card.id)) {
      removeGateCard(card.id);
    } else if (deck.gate_cards.length < 3) {
      addGateCard(card);
    }
  };

  // Best bonus for display (max bonus value)
  const bestBonus = (bonuses: GateCard["bonuses"]) => {
    return Math.max(
      bonuses.pyrus,
      bonuses.aquos,
      bonuses.subterra,
      bonuses.haos,
      bonuses.darkus,
      bonuses.ventus
    );
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wider">
        Gate Cards
      </h2>

      {/* Tier filter */}
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
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setFilter(tier)}
            className={`px-2 py-1 rounded text-xs font-semibold transition ${
              filter === tier
                ? `${tierColors[tier]} text-white`
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {tierLabels[tier]}
          </button>
        ))}
      </div>

      {/* Tier counts */}
      <div className="flex gap-2 text-[10px]">
        {tiers.map((tier) => (
          <span key={tier} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${tierColors[tier]}`} />
            <span className={tierCounts[tier] === 1 ? "text-green-400" : "text-gray-500"}>
              {tierCounts[tier]}/1
            </span>
          </span>
        ))}
      </div>

      {/* Gate Card list */}
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
                  ? `${tierBorderColors[card.tier]} bg-gray-800/80 ring-2 ring-white/30`
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
              }`}
            >
              {selected && (
                <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-bold">
                  EN MAZO
                </span>
              )}

              {/* Name + Tier badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-white text-sm">{card.name}</span>
                <span
                  className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${tierColors[card.tier]} text-white`}
                >
                  {tierLabels[card.tier]}
                </span>
              </div>

              {/* Battle type + best bonus */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs text-gray-400 capitalize">
                  Batalla {card.battle_type}
                </span>
                <span className="text-xs text-orange-300 font-mono">
                  +{bestBonus(card.bonuses)} G
                </span>
              </div>

              {/* Effect (if any) */}
              {card.effect && (
                <div className="text-[10px] text-cyan-300/80 mb-1">
                  {card.effect.description}
                </div>
              )}

              {/* Depicted bakugan */}
              {card.depicted_bakugan && (
                <div className="text-[10px] text-yellow-300/70">
                  Representa: {card.depicted_bakugan}
                </div>
              )}

              {/* Mini bonus display */}
              <div className="flex gap-1 mt-1.5">
                {(
                  [
                    ["pyrus", card.bonuses.pyrus],
                    ["aquos", card.bonuses.aquos],
                    ["subterra", card.bonuses.subterra],
                    ["haos", card.bonuses.haos],
                    ["darkus", card.bonuses.darkus],
                    ["ventus", card.bonuses.ventus],
                  ] as const
                ).map(([attr, bonus]) => (
                  <div key={attr} className="text-center">
                    <div className="text-[8px] text-gray-500 uppercase leading-none">
                      {attr.slice(0, 2)}
                    </div>
                    <div
                      className={`text-[9px] font-mono ${
                        bonus >= 140
                          ? "text-green-400"
                          : bonus >= 100
                            ? "text-yellow-300"
                            : "text-gray-400"
                      }`}
                    >
                      {bonus}
                    </div>
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Deck count */}
      <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-700">
        {deck.gate_cards.length} / 3 en mazo
      </div>
    </div>
  );
}
