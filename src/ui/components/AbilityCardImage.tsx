"use client";

/**
 * AbilityCardImage.tsx — Ability Card visual with color coding.
 */

/* ------------------------------------------------------------------ */
/*  Color styles                                                         */
/* ------------------------------------------------------------------ */

const COLOR_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  red: { bg: "#dc2626", border: "#991b1b", icon: "⚔️" },
  green: { bg: "#16a34a", border: "#166534", icon: "🛡️" },
  blue: { bg: "#2563eb", border: "#1e40af", icon: "💧" },
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface AbilityCardImageProps {
  name: string;
  color: string;
  effect?: string;
  size?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function AbilityCardImage({
  name,
  color,
  effect,
  size = 100,
  className = "",
}: AbilityCardImageProps) {
  const style = COLOR_STYLES[color] || COLOR_STYLES.red;

  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 100 140"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Card background */}
      <rect x="2" y="2" width="96" height="136" rx="8" fill={style.bg} stroke={style.border} strokeWidth="3" />

      {/* Inner glow */}
      <rect x="8" y="8" width="84" height="124" rx="4" fill="white" opacity="0.1" />

      {/* Icon */}
      <text x="50" y="50" textAnchor="middle" fontSize="32" dominantBaseline="middle">
        {style.icon}
      </text>

      {/* Card name */}
      <text x="50" y="90" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">
        {name.length > 12 ? name.slice(0, 12) + "…" : name}
      </text>

      {/* Effect preview */}
      {effect && (
        <text x="50" y="115" textAnchor="middle" fontSize="7" fill="white" opacity="0.8" fontFamily="sans-serif">
          {effect.length > 20 ? effect.slice(0, 20) + "…" : effect}
        </text>
      )}
    </svg>
  );
}
