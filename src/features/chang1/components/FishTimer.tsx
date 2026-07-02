'use client';

import { motion } from 'motion/react';

/**
 * Golden "Thời gian" fish with the elapsed run time inside its white box
 * (measured region of ca-thoi-gian.webp: L12.9 T33.6 R79.3 B71.6 %).
 * The parent supplies size/position via a wrapping element.
 */
export function FishTimer({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.img
        src="/chang1/ca-thoi-gian.webp"
        alt=""
        draggable={false}
        className="h-auto w-full drop-shadow-[0_8px_12px_rgba(10,60,120,0.3)]"
      />
      <span
        className="absolute flex items-center justify-center font-black tabular-nums text-amber-900"
        style={{ left: '14%', right: '22%', top: '36%', bottom: '31%', fontSize: 'clamp(17px,2vw,32px)' }}
        aria-label={`Thời gian: ${mm} phút ${ss} giây`}
      >
        {mm}:{ss}
      </span>
    </motion.div>
  );
}
