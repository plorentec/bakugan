"use client";

/**
 * GateCardDesign.tsx — Gate Card design inspired by the real Bakugan TCG.
 * Features: tier colors, attribute bonuses, effect text.
 */

/* ------------------------------------------------------------------ */
/*  Tier styles                                                         */
/* ------------------------------------------------------------------ */

const TIER_STYLES: Record<string, {
  border: string;
  bg: string;
  glow: string;
  label: string;
}> = {
  gold: { border: "#fbbf24", bg: "#451a03", glow: "#fcd34d", label: "GOLD" },
  silver: { border: "#9ca3af", bg: "#1f2937", glow: "#d1d5db", label: "SILVER" },
  copper: { border: "#d97706", bg: "#451a03", glow: "#fbbf24", label: "COPPER" },
};

/* ------------------------------------------------------------------ */
/*  Attribute colors                                                    */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_COLORS: Record<string, string> = {
  pyrus: "#dc2626",
  aquos: "#2563eb",
  subterra: "#d97706",
  haos: "#eab308",
  darkus: "#7c3aed",
  ventus: "#16a34a",
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface GateCardDesignProps {
  name: string;
  tier: "gold" | "silver" | "copper";
  bonuses: {
    pyrus: number;
    aquos: number;
    subterra: number;
    haos: number;
    darkus: number;
    ventus: number;
  };
  effect?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function GateCardDesign({
  name,
  tier,
  bonuses,
  effect,
  size = "md",
  className = "",
}: GateCardDesignProps) {
  const style = TIER_STYLES[tier] || TIER_STYLES.silver;

  const sizeClasses = {
    sm: "w-24 h-32",
    md: "w-32 h-44",
    lg: "w-40 h-56",
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
      {/* Header: Tier badge */}
      <div
        className="px-2 py-1 text-center"
        style={{ background: `linear-gradient(90deg, ${style.border} 0%, ${style.bg} 100%)` }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-wider"
          style={{ color: style.bg, textShadow: `0 0 4px ${style.glow}` }}
        >
          {style.label}
        </span>
      </div>

      {/* Card name */}
      <div className="text-center px-2 py-2">
        <span className="text-xs font-bold text-white truncate block">{name}</span>
      </div>

      {/* Attribute bonuses */}
      <div className="px-2 py-1">
        <div className="grid grid-cols-3 gap-1">
          {Object.entries(bonuses).map(([attr, value]) => (
            <div
              key={attr}
              className="text-center rounded px-1 py-0.5"
              style={{ backgroundColor: `${ATTRIBUTE_COLORS[attr]}30` }}
            >
              <div className="text-[7px] text-gray-400 uppercase">{attr.slice(0, 3)}</div>
              <div
                className="text-[10px] font-bold"
                style={{ color: ATTRIBUTE_COLORS[attr] }}
              >
                +{value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Effect */}
      {effect && (
        <div className="px-2 py-1">
          <div className="text-[8px] text-gray-400 text-center leading-tight">
            {effect.length > 50 ? effect.slice(0, 50) + "…" : effect}
          </div>
        </div>
      )}
    </div>
  );
}
