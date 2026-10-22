"use client";

import { motion } from "motion/react";

/** Fades and lifts its children in on mount; `delay` staggers siblings. */
export function Reveal({
  children,
  delay = 0,
  className,
  for: audience,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Profiles this block is for (see the profile switch), space-separated. */
  for?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
      data-for={audience}
    >
      {children}
    </motion.div>
  );
}
