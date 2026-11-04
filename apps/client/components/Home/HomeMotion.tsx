"use client";

import { motion, useReducedMotion } from "motion/react";

/** Lets `.spot` cards inside light up under the cursor, with one listener for all. */
export const Spotlight = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div
    className={className}
    onPointerMove={(event) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>(".spot");
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--x", `${event.clientX - box.left}px`);
      card.style.setProperty("--y", `${event.clientY - box.top}px`);
    }}
  >
    {children}
  </div>
);

/** Rises into place the first time it scrolls into view. */
export const Reveal = ({ className, delay = 0, children }: { className?: string; delay?: number; children: React.ReactNode }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
