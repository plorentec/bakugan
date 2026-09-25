"use client";

/**
 * AbilityCardDesign.tsx — Ability Card design inspired by the real Bakugan TCG.
 * Features: color coding, effect text, timing indicator.
 */

/* ------------------------------------------------------------------ */
/*  Color styles                                                         */
/* ------------------------------------------------------------------ */

const COLOR_STYLES: Record<string, {
  border: string;
  bg: string;
  glow: string;
  label: string;
  symbol: string;
}> = {
  red: { border: "#dc2626", bg: "#450a0a", glow: "#fca5a5", label: "RED", symbol: "⚔" },
  green: { border: "#16a34a", bg: "#0a3d1a", glow: "#86efac", label: "GREEN", symbol: "🛡" },
  blue: { border: "#2563eb", bg: "#0a1a3d", glow: "#93c5fd", label: "BLUE", symbol: "💧" },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface AbilityCardDesignProps {
  name: string;
  color: "red" | "green" | "blue";
  effect: string;
  timing?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function AbilityCardDesign({
  name,
  color,
  effect,
  timing = "battle",
  size = "md",
  className = "",
}: AbilityCardDesignProps) {
  const style = COLOR_STYLES[color] || COLOR_STYLES.red;

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
      {/* Header: Color badge + Symbol */}
      <div
        className="px-2 py-1 flex items-center justify-between"
        style={{ background: `linear-gradient(90deg, ${style.border} 0%, ${style.bg} 100%)` }}
      >
        <span className="text-lg">{style.symbol}</span>
        <span
          className="text-[9px] font-black uppercase"
          style={{ color: style.bg }}
        >
          {style.label}
        </span>
      </div>

      {/* Card name */}
      <div className="text-center px-2 py-2">
        <span className="text-xs font-bold text-white truncate block">{name}</span>
      </div>

      {/* Effect text */}
      <div className="px-2 py-2 flex-1">
        <div
          className="text-[9px] text-gray-300 leading-tight p-2 rounded"
          style={{ backgroundColor: `${style.border}15` }}
        >
          {effect}
        </div>
      </div>

      {/* Timing badge */}
      <div className="px-2 py-1 text-center">
        <span
          className="text-[8px] px-2 py-0.5 rounded-full uppercase"
          style={{ backgroundColor: `${style.border}30`, color: style.glow }}
        >
          {timing}
        </span>
      </div>
    </div>
  );
}
