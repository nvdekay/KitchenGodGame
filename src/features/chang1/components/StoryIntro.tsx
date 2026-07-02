'use client';

import { motion } from 'motion/react';
import { GoldButton, Parchment } from './ui';
import { STORY } from '../data';

/**
 * Cốt truyện mở màn: the flustered Táo (question marks are part of the sprite)
 * beside a story scroll whose beats fade in one after another, then the how-to
 * chips and the CTA pop in. Portrait stacks vertically; landscape sits side by
 * side. The wrapper scrolls if a short screen can't fit everything.
 */
export function StoryIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 py-6 landscape:flex-row landscape:gap-10">
      {/* Táo hoang mang */}
      <motion.div
        initial={{ opacity: 0, x: -60, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-[clamp(120px,20vh,280px)] shrink-0 landscape:w-[clamp(200px,24vw,360px)]"
      >
        <motion.img
          src="/chang1/tao-cham-hoi.webp"
          alt="Táo đang hoang mang tìm hồ sơ"
          draggable={false}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="h-auto w-full drop-shadow-[0_14px_18px_rgba(10,60,120,0.3)]"
        />
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
          <h1 className="mt-1 text-center text-[clamp(26px,4.2vw,44px)] font-black leading-tight text-amber-900">
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
            <GoldButton onClick={onStart}>{STORY.cta} ✨</GoldButton>
          </motion.div>
        </Parchment>
      </motion.div>
    </div>
  );
}
