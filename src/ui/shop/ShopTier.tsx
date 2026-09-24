"use client";

import { useState } from "react";
import ItemCard from "./ItemCard";
import type { Attribute } from "@/data/schemas";

export interface ShopTierItem {
  id: string;
  name: string;
  price: number;
  type: "bakugan" | "gate" | "ability";
  attribute?: string;
  tier?: string;
  owned: boolean;
  canAfford: boolean;
}

interface ShopTierProps {
  tierName: string;
  items: ShopTierItem[];
  onBuy: (type: "bakugan" | "gate" | "ability", id: string, price: number) => void;
}

type FilterType = "all" | "bakugan" | "gate" | "ability";

export default function ShopTier({ tierName, items, onBuy }: ShopTierProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered =
    filter === "all" ? items : items.filter((item) => item.type === filter);

  const counts = {
    bakugan: items.filter((i) => i.type === "bakugan").length,
    gate: items.filter((i) => i.type === "gate").length,
    ability: items.filter((i) => i.type === "ability").length,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Filter buttons */}
      <div className="flex gap-2">
        {(["all", "bakugan", "gate", "ability"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-xs font-semibold transition capitalize ${
              filter === f
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {f === "all" ? `All (${items.length})` : `${f} (${counts[f as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item) => (
          <ItemCard
            key={item.id}
            name={item.name}
            price={item.price}
            owned={item.owned}
            canAfford={item.canAfford}
            type={item.type}
            attribute={item.attribute}
            tier={item.tier}
            onBuy={() => onBuy(item.type, item.id, item.price)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No items in this category
          </div>
        )}
      </div>
    </div>
  );
}
