"use client";

import { motion, AnimatePresence } from "framer-motion";

interface MoneyDisplayProps {
  amount: number;
  lastChange: number;
}

export default function MoneyDisplay({ amount, lastChange }: MoneyDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-yellow-400 font-black text-xl tabular-nums">
        {amount.toLocaleString()} G
      </span>
      <AnimatePresence>
        {lastChange !== 0 && (
          <motion.span
            key={Date.now()}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: lastChange > 0 ? -20 : 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`text-sm font-bold ${
              lastChange > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {lastChange > 0 ? "+" : ""}
            {lastChange.toLocaleString()} G
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
