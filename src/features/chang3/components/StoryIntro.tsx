'use client';

import { motion } from 'motion/react';
import { GoldButton, Parchment } from '@/components/ui/game';
import { STORY } from '../data';
import { TILE_ASPECT, tileStyle } from './PuzzleBoard';

/** Loose pieces drifting beside the story — cut live from the real puzzle image. */
const FLOATING = [
  { tile: 7, rot: -14, left: '4%', top: '8%', delay: 0 },
  { tile: 6, rot: 9, left: '46%', top: '2%', delay: 0.15 },
  { tile: 8, rot: -4, left: '24%', top: '46%', delay: 0.3 },
  { tile: 12, rot: 16, left: '62%', top: '52%', delay: 0.45 },
];

/**
 * Cốt truyện mở màn chặng 3: shattered picture pieces float beside the story
 * scroll; beats fade in, then the how-to chips and the CTA pop. Portrait
 * stacks; landscape sits side by side; the wrapper scrolls on short screens.
 */
export function StoryIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 py-6 landscape:flex-row landscape:gap-10">
      {/* Scattered pieces */}
      <motion.div
        initial={{ opacity: 0, x: -60, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative h-[clamp(120px,20vh,260px)] w-[clamp(170px,26vh,340px)] shrink-0 landscape:h-[clamp(220px,26vw,340px)] landscape:w-[clamp(280px,34vw,450px)]"
      >
        {FLOATING.map((p) => (
          <motion.div
            key={p.tile}
            initial={{ opacity: 0, y: -24, rotate: 0 }}
            animate={{ opacity: 1, y: [0, -9, 0], rotate: p.rot }}
            transition={{
              opacity: { delay: p.delay, duration: 0.4 },
              rotate: { delay: p.delay, duration: 0.4 },
              y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
            }}
            className="absolute w-[38%] rounded-md border-[3px] border-white/90 shadow-[0_10px_18px_rgba(10,60,120,0.35)]"
            style={{ ...tileStyle(p.tile), aspectRatio: TILE_ASPECT, left: p.left, top: p.top }}
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
            <GoldButton onClick={onStart}>{STORY.cta} 🧩</GoldButton>
          </motion.div>
        </Parchment>
      </motion.div>
    </div>
  );
}
