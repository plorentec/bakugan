"use client";

/**
 * BakuganCard.tsx — Bakugan card design inspired by the real TCG.
 * Features: attribute border, Bakugan image, name, G-Power, stats.
 */

import BakuganImage from "./BakuganImage";

/* ------------------------------------------------------------------ */
/*  Attribute styles                                                    */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_STYLES: Record<string, {
  border: string;
  bg: string;
  glow: string;
  symbol: string;
}> = {
  pyrus: { border: "#dc2626", bg: "#450a0a", glow: "#fca5a5", symbol: "⚔" },
  aquos: { border: "#2563eb", bg: "#0a1a3d", glow: "#93c5fd", symbol: "💧" },
  subterra: { border: "#d97706", bg: "#3d2a0f", glow: "#fcd34d", symbol: "🪨" },
  haos: { border: "#eab308", bg: "#3d3d0f", glow: "#fef08a", symbol: "✨" },
  darkus: { border: "#7c3aed", bg: "#1a0f3d", glow: "#c4b5fd", symbol: "🌀" },
  ventus: { border: "#16a34a", bg: "#0f3d1a", glow: "#86efac", symbol: "🍃" },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface BakuganCardProps {
  name: string;
  attribute: string;
  baseGPower: number;
  maxGPower: number;
  stats: {
    speed: number;
    defense: number;
    control: number;
    steering: number;
    magnet: number;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Stat bar component                                                   */
/* ------------------------------------------------------------------ */

function StatBar({ label, value, max = 4, color }: { label: string; value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] text-gray-400 w-6">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className="w-1.5 h-2 rounded-sm"
            style={{
              backgroundColor: i < value ? color : "#374151",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function BakuganCard({
  name,
  attribute,
  baseGPower,
  maxGPower,
  stats,
  size = "md",
  className = "",
}: BakuganCardProps) {
  const style = ATTRIBUTE_STYLES[attribute] || ATTRIBUTE_STYLES.pyrus;

  const sizeClasses = {
    sm: "w-24 h-32",
    md: "w-32 h-44",
    lg: "w-40 h-56",
  };

  const imageSize = {
    sm: 60,
    md: 80,
    lg: 100,
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg overflow-hidden shadow-xl ${className}`}
      style={{
        background: `linear-gradient(135deg, ${style.bg} 0%, ${style.border}22 100%)`,
        border: `3px solid ${style.border}`,
        boxShadow: `0 0 15px ${style.glow}40, inset 0 0 30px ${style.bg}`,
      }}
    >
      {/* Header: Attribute symbol + Name */}
      <div
        className="px-2 py-1 flex items-center gap-1"
        style={{ background: `linear-gradient(90deg, ${style.border} 0%, transparent 100%)` }}
      >
        <span className="text-sm">{style.symbol}</span>
        <span className="text-[10px] font-bold text-white truncate">{name}</span>
      </div>

      {/* Bakugan Image */}
      <div className="flex justify-center items-center py-2">
        <BakuganImage
          name={name}
          attribute={attribute}
          size={imageSize[size]}
          showName={false}
        />
      </div>

      {/* G-Power */}
      <div className="text-center px-2">
        <div
          className="text-xs font-black"
          style={{ color: style.glow, textShadow: `0 0 8px ${style.glow}` }}
        >
          {baseGPower} G
        </div>
        <div className="text-[8px] text-gray-500">
          MAX: {maxGPower} G
        </div>
      </div>

      {/* Stats */}
      <div className="px-2 py-1 space-y-0.5">
        <StatBar label="SPD" value={stats.speed} color={style.border} />
        <StatBar label="DEF" value={stats.defense} color={style.border} />
        <StatBar label="CTR" value={stats.control} color={style.border} />
        <StatBar label="STR" value={stats.steering} color={style.border} />
        <StatBar label="MAG" value={stats.magnet} color={style.border} />
      </div>
    </div>
  );
}
