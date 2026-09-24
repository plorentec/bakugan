"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDeckStore } from "@/stores/deck-store";

export default function ValidationFeedback() {
  const errors = useDeckStore((s) => s.errors);
  const isValid = errors.length === 0;

  return (
    <div
      className={`rounded-lg border-2 p-3 transition-colors ${
        isValid
          ? "border-green-500/50 bg-green-900/20"
          : "border-red-500/50 bg-red-900/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-3 h-3 rounded-full ${
            isValid ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm font-bold text-white">
          {isValid ? "Deck Valid" : "Deck Invalid"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {errors.length > 0 && (
          <motion.ul
            key="errors"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-0.5 mt-2"
          >
            {errors.map((error, i) => (
              <motion.li
                key={error}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-xs text-red-300 flex items-center gap-1.5"
              >
                <span className="text-red-500">!</span>
                {error}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
