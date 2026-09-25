"use client";

/**
 * AbilityCardDesign.tsx — Ability Card inspired by the real Bakugan game.
 * Decorative border, stat circles on left, Bakugan image center, effect text.
 */

/* ------------------------------------------------------------------ */
/*  Color styles                                                         */
/* ------------------------------------------------------------------ */

const COLOR_STYLES: Record<string, {
  border: string;
  bg: string;
  accent: string;
  label: string;
}> = {
  red: { border: "#dc2626", bg: "#2d0a0a", accent: "#fca5a5", label: "RED" },
  green: { border: "#16a34a", bg: "#0a2d1a", accent: "#86efac", label: "GREEN" },
  blue: { border: "#2563eb", bg: "#0a1a2d", accent: "#93c5fd", label: "BLUE" },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface AbilityCardDesignProps {
  name: string;
  color: "red" | "green" | "blue";
  effect: string;
  timing?: string;
  stats?: {
    pyrus?: number;
    aquos?: number;
    subterra?: number;
    haos?: number;
    darkus?: number;
    ventus?: number;
  };
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
  stats,
  size = "md",
  className = "",
}: AbilityCardDesignProps) {
  const style = COLOR_STYLES[color] || COLOR_STYLES.red;

  const sizeMap = { sm: 120, md: 160, lg: 200 };
  const s = sizeMap[size];

  // Default stats if not provided
  const displayStats = stats || {
    pyrus: 100,
    aquos: 100,
    subterra: 100,
    haos: 100,
    darkus: 100,
    ventus: 100,
  };

  const statColors: Record<string, string> = {
    pyrus: "#dc2626",
    aquos: "#2563eb",
    subterra: "#d97706",
    haos: "#eab308",
    darkus: "#7c3aed",
    ventus: "#16a34a",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        width: s,
        height: s * 1.4,
        background: `linear-gradient(135deg, ${style.bg} 0%, #1a1a2e 50%, ${style.bg} 100%)`,
        border: `3px solid ${style.border}`,
        boxShadow: `0 0 20px ${style.border}30, inset 0 0 40px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Decorative border frame */}
      <svg
        viewBox="0 0 100 140"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Outer frame */}
        <rect x="2" y="2" width="96" height="136" rx="4" fill="none" stroke={style.border} strokeWidth="1" opacity="0.4" />
        <rect x="5" y="5" width="90" height="130" rx="3" fill="none" stroke={style.border} strokeWidth="0.5" opacity="0.2" />

        {/* Corner decorations */}
        <path d="M 10 10 L 20 10 L 20 15 L 15 15 L 15 20 L 10 20 Z" fill={style.border} opacity="0.3" />
        <path d="M 90 10 L 80 10 L 80 15 L 85 15 L 85 20 L 90 20 Z" fill={style.border} opacity="0.3" />
        <path d="M 10 130 L 20 130 L 20 125 L 15 125 L 15 120 L 10 120 Z" fill={style.border} opacity="0.3" />
        <path d="M 90 130 L 80 130 L 80 125 L 85 125 L 85 120 L 90 120 Z" fill={style.border} opacity="0.3" />

        {/* Vertical lines */}
        <line x1="8" y1="25" x2="8" y2="115" stroke={style.border} strokeWidth="0.5" opacity="0.3" />
        <line x1="92" y1="25" x2="92" y2="115" stroke={style.border} strokeWidth="0.5" opacity="0.3" />
      </svg>

      {/* Card name header */}
      <div
        className="relative z-10 text-center pt-3 pb-1 px-2"
        style={{
          background: `linear-gradient(180deg, ${style.border}40 0%, transparent 100%)`,
        }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: style.accent, textShadow: `0 0 8px ${style.border}` }}
        >
          {name}
        </span>
      </div>

      {/* Stats circles on left */}
      <div className="absolute left-1 top-16 z-10 flex flex-col gap-0.5">
        {Object.entries(displayStats).map(([attr, value]) => (
          <div
            key={attr}
            className="flex items-center justify-center rounded-full"
            style={{
              width: s * 0.12,
              height: s * 0.12,
              background: `${statColors[attr]}30`,
              border: `1.5px solid ${statColors[attr]}`,
            }}
          >
            <span
              className="font-bold"
              style={{
                fontSize: s * 0.06,
                color: statColors[attr],
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Center illustration area */}
      <div
        className="absolute z-5 flex items-center justify-center"
        style={{
          left: s * 0.2,
          top: s * 0.4,
          width: s * 0.6,
          height: s * 0.5,
          background: `radial-gradient(circle, ${style.border}15 0%, transparent 70%)`,
        }}
      >
        {/* Placeholder Bakugan silhouette */}
        <svg viewBox="0 0 60 60" width={s * 0.4} height={s * 0.4} opacity="0.3">
          <circle cx="30" cy="30" r="25" fill={style.border} opacity="0.2" />
          <circle cx="30" cy="30" r="15" fill="none" stroke={style.border} strokeWidth="1" opacity="0.4" />
        </svg>
      </div>

      {/* Effect text */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-3 py-2"
        style={{ background: `linear-gradient(transparent, ${style.bg})` }}
      >
        <p
          className="text-[8px] text-gray-300 leading-tight text-center"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
        >
          {effect}
        </p>
      </div>

      {/* Color label */}
      <div
        className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded"
        style={{ background: style.border }}
      >
        <span className="text-[7px] font-bold" style={{ color: style.bg }}>
          {style.label}
        </span>
      </div>

      {/* Bottom decoration */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${style.border}, transparent)` }}
      />
    </div>
  );
}
