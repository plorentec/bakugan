"use client";

/**
 * GateCardImage.tsx — Gate Card visual with tier colors and bonuses.
 */

/* ------------------------------------------------------------------ */
/*  Tier colors                                                         */
/* ------------------------------------------------------------------ */

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  gold: { bg: "#fbbf24", border: "#f59e0b", text: "#78350f", label: "GOLD" },
  silver: { bg: "#9ca3af", border: "#6b7280", text: "#1f2937", label: "SILVER" },
  copper: { bg: "#d97706", border: "#b45309", text: "#451a03", label: "COPPER" },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface GateCardImageProps {
  name: string;
  tier: string;
  bonuses?: Record<string, number>;
  size?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function GateCardImage({
  name,
  tier,
  bonuses,
  size = 120,
  className = "",
}: GateCardImageProps) {
  const style = TIER_STYLES[tier] || TIER_STYLES.silver;

  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 120 84"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Card background */}
      <rect x="2" y="2" width="116" height="80" rx="8" fill={style.bg} stroke={style.border} strokeWidth="3" />

      {/* Tier badge */}
      <rect x="8" y="8" width="50" height="18" rx="4" fill={style.border} />
      <text x="33" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">
        {style.label}
      </text>

      {/* Card name */}
      <text x="60" y="45" textAnchor="middle" fontSize="11" fontWeight="bold" fill={style.text} fontFamily="sans-serif">
        {name.length > 14 ? name.slice(0, 14) + "…" : name}
      </text>

      {/* Bonuses */}
      {bonuses && (
        <g>
          {Object.entries(bonuses).slice(0, 6).map(([attr, value], i) => (
            <text
              key={attr}
              x={15 + i * 17}
              y="70"
              textAnchor="middle"
              fontSize="8"
              fill={style.text}
              fontFamily="sans-serif"
            >
              {attr.slice(0, 3).toUpperCase()}: {value}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}
