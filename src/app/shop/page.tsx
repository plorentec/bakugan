"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useProgressionStore } from "@/stores/progression-store";
import { playClickSound, playBuySound } from "@/lib/sounds";
import { slideInRight, PAGE_TRANSITION } from "@/lib/animations";
import MoneyDisplay from "@/ui/shop/MoneyDisplay";
import ShopTier, { type ShopTierItem } from "@/ui/shop/ShopTier";
import shopConfig from "@/data/config/shop.json";
import bakuganData from "@/data/raw/bakugan.json";
import gateCardData from "@/data/raw/gate-cards.json";
import abilityCardData from "@/data/raw/ability-cards.json";
import type { Attribute, GateCardTier, AbilityCardColor } from "@/data/schemas";

// ─── Lookup Maps ──────────────────────────────────────────────────────

const bakuganMap = new Map(
  bakuganData.map((b) => [b.id, b])
);

const gateCardMap = new Map(
  gateCardData.map((c) => [c.id, c])
);

const abilityCardMap = new Map(
  abilityCardData.map((c) => [c.id, c])
);

// ─── Attribute helpers ────────────────────────────────────────────────

const attributeColors: Record<string, string> = {
  pyrus: "text-red-400",
  aquos: "text-blue-400",
  subterra: "text-amber-500",
  haos: "text-yellow-200",
  darkus: "text-purple-400",
  ventus: "text-green-400",
};

// ─── Page ─────────────────────────────────────────────────────────────

export default function ShopPage() {
  const money = useProgressionStore((s) => s.money);
  const lastMoneyChange = useProgressionStore((s) => s.lastMoneyChange);
  const unlockedShopTiers = useProgressionStore((s) => s.unlockedShopTiers);
  const canAfford = useProgressionStore((s) => s.canAfford);
  const isOwned = useProgressionStore((s) => s.isOwned);
  const purchaseBakugan = useProgressionStore((s) => s.purchaseBakugan);
  const purchaseGateCard = useProgressionStore((s) => s.purchaseGateCard);
  const purchaseAbilityCard = useProgressionStore((s) => s.purchaseAbilityCard);

  const [activeTab, setActiveTab] = useState<string>("start");
  const [showAll, setShowAll] = useState(false);

  // Build items for each tier
  const tierData = useMemo(() => {
    return shopConfig.tiers.map((tier) => {
      const items: ShopTierItem[] = [];

      // Bakugan
      for (const bak of tier.bakugan) {
        const bakData = bakuganMap.get(bak.bakugan_id);
        items.push({
          id: bak.bakugan_id,
          name: bakData?.name ?? bak.bakugan_id,
          price: bak.price,
          type: "bakugan" as const,
          attribute: bak.attributes[0],
          owned: isOwned("bakugan", bak.bakugan_id),
          canAfford: canAfford(bak.price),
        });
      }

      // Gate Cards
      for (const gc of tier.gate_cards) {
        const gcData = gateCardMap.get(gc.gate_card_id);
        items.push({
          id: gc.gate_card_id,
          name: gcData?.name ?? gc.gate_card_id,
          price: gc.price,
          type: "gate" as const,
          tier: gcData?.tier,
          owned: isOwned("gate", gc.gate_card_id),
          canAfford: canAfford(gc.price),
        });
      }

      // Ability Cards
      for (const ac of tier.ability_cards) {
        const acData = abilityCardMap.get(ac.ability_card_id);
        items.push({
          id: ac.ability_card_id,
          name: acData?.name ?? ac.ability_card_id,
          price: ac.price,
          type: "ability" as const,
          attribute: undefined,
          owned: isOwned("ability", ac.ability_card_id),
          canAfford: canAfford(ac.price),
        });
      }

      return { ...tier, items };
    });
  }, [unlockedShopTiers, money, isOwned, canAfford]);

  const activeTier = tierData.find((t) => t.id === activeTab) ?? tierData[0];

  const handleBuy = (type: "bakugan" | "gate" | "ability", id: string, price: number) => {
    playBuySound();
    switch (type) {
      case "bakugan":
        purchaseBakugan(id, price);
        break;
      case "gate":
        purchaseGateCard(id, price);
        break;
      case "ability":
        purchaseAbilityCard(id, price);
        break;
    }
  };

  return (
    <motion.div
      {...PAGE_TRANSITION}
      variants={slideInRight}
      className="min-h-screen bg-gray-950 text-white"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={() => playClickSound()}
              className="text-gray-400 hover:text-white transition text-sm font-bold"
            >
              ← Inicio
            </Link>
            <h1 className="text-xl font-black uppercase tracking-wider text-orange-400">
              Tienda
            </h1>
          </div>
          <MoneyDisplay amount={money} lastChange={lastMoneyChange} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tier tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {tierData.map((tier) => {
            const isUnlocked = unlockedShopTiers.includes(tier.id);
            const isActive = activeTab === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => {
                  if (isUnlocked) {
                    playClickSound();
                    setActiveTab(tier.id);
                  }
                }}
                disabled={!isUnlocked}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : isUnlocked
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-900 text-gray-600 cursor-not-allowed"
                }`}
              >
                {!isUnlocked && "🔒 "}
                {tier.name}
              </button>
            );
          })}
        </div>

        {/* Active tier */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTier.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-200">
                {activeTier.name}
              </h2>
              <span className="text-sm text-gray-500">
                {activeTier.items.length} elementos
              </span>
            </div>

            {unlockedShopTiers.includes(activeTier.id) ? (
              <ShopTier
                tierName={activeTier.name}
                items={activeTier.items}
                onBuy={handleBuy}
              />
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg font-bold mb-2">🔒 Bloqueado</p>
                <p className="text-sm">Completa la condición requerida para desbloquear esta categoría</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
