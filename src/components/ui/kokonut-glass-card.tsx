"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type KokonutGlassCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Adapted from KokonutUI's source-first glass card pattern.
 * The effect stays intentionally restrained for Ledger's operations UI.
 */
export function KokonutGlassCard({ children, className = "" }: KokonutGlassCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/12 via-transparent to-[#4d69d8]/10" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
