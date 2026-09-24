'use client';

/**
 * TurnTimer — countdown timer for each player's turn.
 *
 * Shows a circular progress indicator with time remaining.
 * Visual warning at 10 seconds (yellow) and 5 seconds (red).
 * Auto-forfeit on timeout.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePvPStore } from '@/stores/pvp-store';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface TurnTimerProps {
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Maximum time for the turn */
  maxTime: number;
  /** Whether the timer is active */
  isActive: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const WARNING_THRESHOLD = 10;
const CRITICAL_THRESHOLD = 5;
const CIRCLE_RADIUS = 24;
const CIRCLE_STROKE = 3;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function TurnTimer({
  timeRemaining,
  maxTime,
  isActive,
}: TurnTimerProps) {
  const tickTimer = usePvPStore((s) => s.tickTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick the timer every second
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, tickTimer]);

  if (!isActive || maxTime <= 0) return null;

  const progress = timeRemaining / maxTime;
  const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  // Color based on time remaining
  const getColor = (): string => {
    if (timeRemaining <= CRITICAL_THRESHOLD) return '#ef4444';
    if (timeRemaining <= WARNING_THRESHOLD) return '#eab308';
    return '#22c55e';
  };

  const getGlowColor = (): string => {
    if (timeRemaining <= CRITICAL_THRESHOLD) return 'rgba(239,68,68,0.4)';
    if (timeRemaining <= WARNING_THRESHOLD) return 'rgba(234,179,8,0.3)';
    return 'rgba(34,197,94,0.2)';
  };

  const color = getColor();

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-50">
      <motion.div
        animate={
          timeRemaining <= CRITICAL_THRESHOLD
            ? { scale: [1, 1.1, 1] }
            : { scale: 1 }
        }
        transition={
          timeRemaining <= CRITICAL_THRESHOLD
            ? { duration: 0.5, repeat: Infinity }
            : {}
        }
        className="relative flex items-center justify-center"
        style={{ filter: `drop-shadow(0 0 8px ${getGlowColor()})` }}
      >
        <svg
          width={CIRCLE_RADIUS * 2 + CIRCLE_STROKE * 2}
          height={CIRCLE_RADIUS * 2 + CIRCLE_STROKE * 2}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={CIRCLE_RADIUS + CIRCLE_STROKE}
            cy={CIRCLE_RADIUS + CIRCLE_STROKE}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={CIRCLE_STROKE}
          />
          {/* Progress circle */}
          <circle
            cx={CIRCLE_RADIUS + CIRCLE_STROKE}
            cy={CIRCLE_RADIUS + CIRCLE_STROKE}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={CIRCLE_STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
          />
        </svg>

        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-sm font-bold"
            style={{ color }}
          >
            {Math.ceil(timeRemaining)}
          </span>
        </div>
      </motion.div>

      {/* Warning label */}
      {timeRemaining <= WARNING_THRESHOLD && timeRemaining > CRITICAL_THRESHOLD && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-center font-mono text-[10px] font-bold text-yellow-500"
        >
          HURRY!
        </motion.p>
      )}
      {timeRemaining <= CRITICAL_THRESHOLD && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-center font-mono text-[10px] font-bold text-red-500"
        >
          TIME&apos;S UP!
        </motion.p>
      )}
    </div>
  );
}
