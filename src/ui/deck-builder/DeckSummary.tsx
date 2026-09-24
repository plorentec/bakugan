"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDeckStore } from "@/stores/deck-store";
import type { Bakugan, GateCard, AbilityCard } from "@/data/schemas";
import bakuganData from "@/data/raw/bakugan.json";
import gateCardData from "@/data/raw/gate-cards.json";
import abilityCardData from "@/data/raw/ability-cards.json";
import ValidationFeedback from "./ValidationFeedback";

// ─── Lookup maps ──────────────────────────────────────────────────────

const bakuganMap = new Map<string, Bakugan>(
  bakuganData.map((b) => [b.id, b as Bakugan])
);
const gateCardMap = new Map<string, GateCard>(
  gateCardData.map((c) => [c.id, c as GateCard])
);
const abilityCardMap = new Map<string, AbilityCard>(
  abilityCardData.map((c) => [c.id, c as AbilityCard])
);

// ─── Attribute/Color helpers ──────────────────────────────────────────

const attributeDot: Record<string, string> = {
  pyrus: "bg-red-500",
  aquos: "bg-blue-500",
  subterra: "bg-amber-600",
  haos: "bg-yellow-300",
  darkus: "bg-purple-600",
  ventus: "bg-green-500",
};

const tierDot: Record<string, string> = {
  gold: "bg-yellow-500",
  silver: "bg-gray-400",
  copper: "bg-orange-700",
};

const colorDot: Record<string, string> = {
  red: "bg-red-600",
  green: "bg-green-600",
  blue: "bg-blue-600",
};

// ─── Component ────────────────────────────────────────────────────────

export default function DeckSummary() {
  const deck = useDeckStore((s) => s.deck);
  const errors = useDeckStore((s) => s.errors);
  const saveDeck = useDeckStore((s) => s.saveDeck);
  const setDeckName = useDeckStore((s) => s.setDeckName);
  const isValid = errors.length === 0;

  // Debounced auto-save
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (errors.length === 0) {
        saveDeck();
      }
    }, 1000);
  }, [errors, saveDeck]);

  useEffect(() => {
    autoSave();
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [deck, autoSave]);

  // Calculate total G-Power
  const totalGPower = deck.bakugan.reduce((sum, b) => {
    const bakugan = bakuganMap.get(b.bakugan_id);
    return sum + (bakugan?.base_g_power ?? 0);
  }, 0);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Deck Name */}
      <div>
        <label className="text-[10px] text-gray-500 uppercase tracking-wider">
          Deck Name
        </label>
        <input
          type="text"
          value={deck.name}
          onChange={(e) => setDeckName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-orange-500 transition"
          maxLength={30}
        />
      </div>

      {/* Validation */}
      <ValidationFeedback />

      {/* Bakugan in deck */}
      <div>
        <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
          Bakugan ({deck.bakugan.length}/3)
        </h3>
        <div className="flex flex-col gap-1.5">
          {deck.bakugan.map((b) => {
            const bakugan = bakuganMap.get(b.bakugan_id);
            if (!bakugan) return null;
            const primaryAttr = bakugan.attributes[0];
            return (
              <motion.div
                key={b.bakugan_id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-gray-800/60 rounded px-2.5 py-1.5 border border-gray-700"
              >
                <span className={`w-2 h-2 rounded-full ${attributeDot[primaryAttr]}`} />
                <span className="text-xs text-white font-semibold flex-1">
                  {bakugan.name}
                </span>
                <span className="text-[10px] text-orange-300 font-mono">
                  {bakugan.base_g_power}G
                </span>
              </motion.div>
            );
          })}
          {Array.from({ length: 3 - deck.bakugan.length }).map((_, i) => (
            <div
              key={`empty-b-${i}`}
              className="flex items-center justify-center bg-gray-800/30 rounded px-2.5 py-1.5 border border-dashed border-gray-700"
            >
              <span className="text-[10px] text-gray-600">Empty Slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gate Cards in deck */}
      <div>
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
          Gate Cards ({deck.gate_cards.length}/3)
        </h3>
        <div className="flex flex-col gap-1.5">
          {deck.gate_cards.map((g) => {
            const card = gateCardMap.get(g.gate_card_id);
            if (!card) return null;
            return (
              <motion.div
                key={g.gate_card_id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-gray-800/60 rounded px-2.5 py-1.5 border border-gray-700"
              >
                <span className={`w-2 h-2 rounded-full ${tierDot[card.tier]}`} />
                <span className="text-xs text-white font-semibold flex-1">
                  {card.name}
                </span>
                <span className="text-[10px] text-gray-400 capitalize">
                  {card.tier}
                </span>
              </motion.div>
            );
          })}
          {Array.from({ length: 3 - deck.gate_cards.length }).map((_, i) => (
            <div
              key={`empty-g-${i}`}
              className="flex items-center justify-center bg-gray-800/30 rounded px-2.5 py-1.5 border border-dashed border-gray-700"
            >
              <span className="text-[10px] text-gray-600">Empty Slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ability Cards in deck */}
      <div>
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">
          Ability Cards ({deck.ability_cards.length}/3)
        </h3>
        <div className="flex flex-col gap-1.5">
          {deck.ability_cards.map((a) => {
            const card = abilityCardMap.get(a.ability_card_id);
            if (!card) return null;
            return (
              <motion.div
                key={a.ability_card_id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-gray-800/60 rounded px-2.5 py-1.5 border border-gray-700"
              >
                <span className={`w-2 h-2 rounded-full ${colorDot[card.color]}`} />
                <span className="text-xs text-white font-semibold flex-1">
                  {card.name}
                </span>
                <span className="text-[10px] text-gray-400 capitalize">
                  {card.color}
                </span>
              </motion.div>
            );
          })}
          {Array.from({ length: 3 - deck.ability_cards.length }).map((_, i) => (
            <div
              key={`empty-a-${i}`}
              className="flex items-center justify-center bg-gray-800/30 rounded px-2.5 py-1.5 border border-dashed border-gray-700"
            >
              <span className="text-[10px] text-gray-600">Empty Slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deck stats summary */}
      <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700">
        <h3 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
          Deck Summary
        </h3>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Total Base G-Power</span>
          <span className="text-orange-300 font-mono font-bold">{totalGPower}</span>
        </div>
      </div>

      {/* Save button */}
      <motion.button
        whileHover={isValid ? { scale: 1.02 } : {}}
        whileTap={isValid ? { scale: 0.98 } : {}}
        disabled={!isValid}
        onClick={() => saveDeck()}
        className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition ${
          isValid
            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/20"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isValid ? "Save Deck" : "Complete Deck to Save"}
      </motion.button>
    </div>
  );
}
