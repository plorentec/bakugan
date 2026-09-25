"use client";

/**
 * GateCardDesign.tsx — Gate Card inspired by the real Bakugan game.
 * Circular symbol pattern with attribute icons.
 */

/* ------------------------------------------------------------------ */
/*  Attribute symbols and colors                                        */
/* ------------------------------------------------------------------ */

const ATTRIBUTES = [
  { key: "pyrus", color: "#dc2626", symbol: "⚔", name: "PYRUS" },
  { key: "aquos", color: "#2563eb", symbol: "💧", name: "AQUOS" },
  { key: "subterra", color: "#d97706", symbol: "🪨", name: "SUBTERRA" },
  { key: "haos", color: "#eab308", symbol: "✨", name: "HAOS" },
  { key: "darkus", color: "#7c3aed", symbol: "🌀", name: "DARKUS" },
  { key: "ventus", color: "#16a34a", symbol: "🍃", name: "VENTUS" },
];

/* ------------------------------------------------------------------ */
/*  Tier styles                                                         */
/* ------------------------------------------------------------------ */

const TIER_STYLES: Record<string, { border: string; glow: string }> = {
  gold: { border: "#fbbf24", glow: "#fcd34d" },
  silver: { border: "#9ca3af", glow: "#d1d5db" },
  copper: { border: "#d97706", glow: "#fbbf24" },
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

  const sizeMap = { sm: 120, md: 160, lg: 200 };
  const s = sizeMap[size];

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        width: s,
        height: s * 1.4,
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        border: `3px solid ${style.border}`,
        boxShadow: `0 0 20px ${style.glow}30, inset 0 0 40px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Top decoration line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${style.border}, transparent)` }}
      />

      {/* Card name */}
      <div className="text-center pt-2 pb-1 px-2">
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: style.border, textShadow: `0 0 8px ${style.glow}` }}
        >
          {name}
        </span>
      </div>

      {/* Circular symbol pattern */}
      <svg
        viewBox="0 0 100 100"
        className="absolute"
        style={{
          width: s * 0.85,
          height: s * 0.85,
          left: s * 0.075,
          top: s * 0.3,
        }}
      >
        {/* Outer circle */}
        <circle cx="50" cy="50" r="45" fill="none" stroke={style.border} strokeWidth="0.5" opacity="0.3" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={style.border} strokeWidth="0.3" opacity="0.2" />

        {/* Inner geometric pattern */}
        <polygon
          points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5"
          fill="none"
          stroke={style.border}
          strokeWidth="0.4"
          opacity="0.25"
        />
        <polygon
          points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5"
          fill="none"
          stroke={style.border}
          strokeWidth="0.3"
          opacity="0.2"
        />

        {/* Connecting lines */}
        {ATTRIBUTES.map((attr, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const x = 50 + Math.cos(angle) * 35;
          const y = 50 + Math.sin(angle) * 35;
          return (
            <line
              key={`line-${attr.key}`}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke={attr.color}
              strokeWidth="0.3"
              opacity="0.3"
            />
          );
        })}

        {/* Attribute symbols */}
        {ATTRIBUTES.map((attr, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const x = 50 + Math.cos(angle) * 35;
          const y = 50 + Math.sin(angle) * 35;
          const bonus = bonuses[attr.key as keyof typeof bonuses];
          return (
            <g key={attr.key}>
              {/* Symbol circle */}
              <circle
                cx={x}
                cy={y}
                r="10"
                fill={`${attr.color}20`}
                stroke={attr.color}
                strokeWidth="1"
              />
              {/* Symbol */}
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
              >
                {attr.symbol}
              </text>
              {/* Bonus value */}
              <text
                x={x}
                y={y + 7}
                textAnchor="middle"
                fontSize="4"
                fill={attr.color}
                fontWeight="bold"
              >
                +{bonus}
              </text>
            </g>
          );
        })}

        {/* Center circle */}
        <circle cx="50" cy="50" r="12" fill="#0a0a0a" stroke={style.border} strokeWidth="1" />
        <circle cx="50" cy="50" r="8" fill="none" stroke={style.border} strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* Effect text */}
      {effect && (
        <div
          className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center"
          style={{ background: "linear-gradient(transparent, #0a0a0a)" }}
        >
          <span className="text-[7px] text-gray-400 leading-tight">
            {effect.length > 60 ? effect.slice(0, 60) + "…" : effect}
          </span>
        </div>
      )}

      {/* Bottom decoration */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${style.border}, transparent)` }}
      />
    </div>
  );
}
