"use client";

import { motion } from "framer-motion";

export default function AudioIndicator({ active, playing }) {
  if (!active) {
    return <div className="h-4 w-6" aria-hidden="true" />;
  }

  const bars = [0, 1, 2, 3];

  return (
    <div className="h-4 w-6 flex items-end gap-0.5" aria-hidden="true">
      {bars.map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full"
          style={{ background: playing ? "#00B8A9" : "rgba(255,255,255,0.35)" }}
          initial={false}
          animate={
            playing
              ? {
                  height: [6, 14, 8, 12][i],
                }
              : { height: 8 }
          }
          transition={
            playing
              ? {
                  duration: 0.55,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: i * 0.08,
                  ease: "easeInOut",
                }
              : { duration: 0.15 }
          }
        />
      ))}
    </div>
  );
}
