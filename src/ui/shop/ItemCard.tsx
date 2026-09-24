"use client";

import { motion } from "framer-motion";

interface ItemCardProps {
  name: string;
  price: number;
  owned: boolean;
  canAfford: boolean;
  type: "bakugan" | "gate" | "ability";
  attribute?: string;
  tier?: string;
  onBuy: () => void;
}

const typeColors: Record<string, string> = {
  bakugan: "bg-orange-500",
  gate: "bg-gray-400",
  ability: "bg-blue-500",
};

const typeBorderColors: Record<string, string> = {
  bakugan: "border-orange-500",
  gate: "border-gray-400",
  ability: "border-blue-500",
};

const tierBadgeColors: Record<string, string> = {
  gold: "bg-yellow-500 text-black",
  silver: "bg-gray-300 text-black",
  copper: "bg-amber-700 text-white",
};

const colorBadgeColors: Record<string, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
};

const attributeColors: Record<string, string> = {
  pyrus: "bg-red-500",
  aquos: "bg-blue-500",
  subterra: "bg-amber-600",
  haos: "bg-yellow-300",
  darkus: "bg-purple-600",
  ventus: "bg-green-500",
};

export default function ItemCard({
  name,
  price,
  owned,
  canAfford,
  type,
  attribute,
  tier,
  onBuy,
}: ItemCardProps) {
  const isFree = price === 0;
  const isBuyable = !owned && (canAfford || isFree);

  return (
    <motion.div
      whileHover={!owned ? { scale: 1.02 } : {}}
      className={`relative p-3 rounded-lg border-2 transition-all ${
        owned
          ? "border-green-500/50 bg-green-900/20 opacity-70"
          : isBuyable
            ? `${typeBorderColors[type] || "border-gray-600"} bg-gray-800/80 hover:bg-gray-700/80 cursor-pointer`
            : "border-gray-700 bg-gray-800/50 opacity-60"
      }`}
    >
      {/* Owned indicator */}
      {owned && (
        <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-bold">
          OWNED
        </span>
      )}

      {/* Type badge */}
      <span
        className={`inline-block text-[10px] uppercase px-1.5 py-0.5 rounded font-bold mb-1.5 ${
          typeColors[type] || "bg-gray-500"
        } text-white`}
      >
        {type}
      </span>

      {/* Attribute badge */}
      {attribute && (
        <span
          className={`inline-block text-[10px] uppercase px-1.5 py-0.5 rounded font-bold mb-1.5 ml-1 ${
            attributeColors[attribute] || "bg-gray-500"
          } text-white`}
        >
          {attribute}
        </span>
      )}

      {/* Tier badge */}
      {tier && (
        <span
          className={`inline-block text-[10px] uppercase px-1.5 py-0.5 rounded font-bold mb-1.5 ml-1 ${
            tierBadgeColors[tier] || "bg-gray-500 text-white"
          }`}
        >
          {tier}
        </span>
      )}

      {/* Name */}
      <h3 className="text-white font-bold text-sm capitalize">{name}</h3>

      {/* Price & Buy */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-yellow-400 font-mono text-sm">
          {isFree ? "FREE" : `${price.toLocaleString()} G`}
        </span>
        {!owned && (
          <motion.button
            whileHover={isBuyable ? { scale: 1.05 } : {}}
            whileTap={isBuyable ? { scale: 0.95 } : {}}
            disabled={!isBuyable}
            onClick={(e) => {
              e.stopPropagation();
              if (isBuyable) onBuy();
            }}
            className={`px-3 py-1 rounded text-xs font-bold uppercase transition ${
              isBuyable
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isFree ? "Get" : "Buy"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
