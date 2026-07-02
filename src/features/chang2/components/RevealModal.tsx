'use client';

import { motion } from 'motion/react';
import { GoldButton, Parchment } from '@/components/ui/game';
import type { MemeDef, PairDef } from '../data';

export type Reveal = { type: 'pair'; pair: PairDef } | { type: 'meme'; meme: MemeDef };

/**
 * Post-flip pop-up. A matched pair opens its educational "vỡ ra" card (image +
 * title + payload); a meme opens the trap card — big meme, punchline, move on.
 * The board is frozen underneath while this is open.
 */
export function RevealModal({ reveal, onClose }: { reveal: Reveal; onClose: () => void }) {
  const isPair = reveal.type === 'pair';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={isPair ? undefined : onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-sky-950/40 p-4 backdrop-blur-[3px]"
    >
      <motion.div
        initial={{ scale: 0.7, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Parchment className="px-5 py-5 text-center sm:px-7 sm:py-6">
          {isPair ? (
            <>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 14 }}
                className="text-4xl"
              >
                📑✨
              </motion.p>
              <h3 className="mt-1 text-lg font-black text-green-700 sm:text-xl">
                Ghép được một trang báo cáo!
              </h3>
              <motion.img
                src={reveal.pair.img}
                alt={reveal.pair.title}
                draggable={false}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mx-auto mt-3 max-h-[32vh] w-auto rounded-xl border-2 border-amber-200 object-contain shadow-md"
              />
              <h4 className="mt-3 text-base font-extrabold text-amber-900 sm:text-lg">
                {reveal.pair.title}
              </h4>
              <p className="mt-2 rounded-2xl bg-amber-100/70 px-4 py-3 text-left text-sm font-medium leading-relaxed text-amber-950 sm:text-[15px]">
                💡 {reveal.pair.content}
              </p>
              <GoldButton onClick={onClose} className="mt-4">
                Tuyệt! Tiếp tục →
              </GoldButton>
            </>
          ) : (
            <>
              <motion.p
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 12 }}
                className="text-4xl"
              >
                🙃
              </motion.p>
              <h3 className="mt-1 text-lg font-black text-red-600 sm:text-xl">
                Dính thẻ meme gây nhiễu!
              </h3>
              <motion.img
                src={reveal.meme.img}
                alt={reveal.meme.caption}
                draggable={false}
                initial={{ scale: 0.8, rotate: -4, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 240, damping: 16 }}
                className="mx-auto mt-3 max-h-[30vh] w-auto rounded-xl border-2 border-red-200 object-contain shadow-md"
              />
              <p className="mt-3 text-base font-extrabold text-amber-900">
                “{reveal.meme.caption}”
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Đây không phải tài liệu báo cáo — lật tiếp thôi!
              </p>
              <GoldButton onClick={onClose} className="mt-4">
                Lật tiếp 😤
              </GoldButton>
            </>
          )}
        </Parchment>
      </motion.div>
    </motion.div>
  );
}
