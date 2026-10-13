"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type ReactBitsRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Local source adaptation of React Bits' Animated Content pattern.
 * It is used only for section entrances, never for core controls.
 */
export function ReactBitsReveal({ children, className = "", delay = 0 }: ReactBitsRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.42, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
