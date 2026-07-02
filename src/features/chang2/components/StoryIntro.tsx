'use client';

import { motion } from 'motion/react';
import { GoldButton, Parchment } from '@/components/ui/game';
import { STORY } from '../data';

/**
 * Cốt truyện mở màn chặng 2: a fan of face-down cards beside the story scroll —
 * beats fade in, then the how-to chips and the CTA pop. Portrait stacks;
 * landscape sits side by side; the wrapper scrolls on short screens.
 */
export function StoryIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 py-6 landscape:flex-row landscape:gap-10">
      {/* A scattered fan of face-down cards */}
      <motion.div
        initial={{ opacity: 0, x: -60, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative h-[clamp(120px,20vh,260px)] w-[clamp(150px,24vh,320px)] shrink-0 landscape:h-[clamp(220px,30vw,360px)] landscape:w-[clamp(260px,34vw,430px)]"
      >
        {[
          { rot: -16, x: '2%', delay: 0 },
          { rot: -2, x: '28%', delay: 0.12 },
          { rot: 14, x: '54%', delay: 0.24 },
        ].map((c) => (
          <motion.img
            key={c.rot}
            src="/chang2/card-back.webp"
            alt=""
            draggable={false}
            initial={{ y: -30, opacity: 0, rotate: 0 }}
            animate={{ y: [0, -8, 0], opacity: 1, rotate: c.rot }}
            transition={{
              opacity: { delay: c.delay, duration: 0.4 },
              rotate: { delay: c.delay, duration: 0.4 },
              y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
            }}
            className="absolute top-[6%] h-[88%] w-auto rounded-lg shadow-[0_10px_18px_rgba(10,60,120,0.3)]"
            style={{ left: c.x }}
          />
        ))}
      </motion.div>

      {/* Cuộn truyện */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-xl"
      >
        <Parchment className="px-6 py-6 sm:px-9 sm:py-8">
          <p className="text-center text-[11px] font-black tracking-[0.28em] text-amber-600">
            📜 {STORY.chapter} · {STORY.period}
          </p>
          <h1 className="mt-1 text-center text-[clamp(24px,4vw,42px)] font-black leading-tight text-amber-900">
            {STORY.title}
          </h1>

          <div className="mt-4 space-y-3">
            {STORY.beats.map((beat, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.6, duration: 0.5 }}
                className="text-sm leading-relaxed text-amber-950/90 sm:text-[15px]"
              >
                {beat}
              </motion.p>
            ))}
          </div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.4 }}
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            {STORY.howto.map((h) => (
              <li
                key={h}
                className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-bold text-sky-800 sm:text-xs"
              >
                {h}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.8, type: 'spring', stiffness: 260, damping: 16 }}
            className="mt-5 text-center"
          >
            <GoldButton onClick={onStart}>{STORY.cta} 🃏</GoldButton>
          </motion.div>
        </Parchment>
      </motion.div>
    </div>
  );
}
