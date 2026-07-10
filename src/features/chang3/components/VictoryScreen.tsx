'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { fireConfetti } from '@/lib/confetti';
import { Parchment, SaveStatusLine, type SaveState } from '@/components/ui/game';
import { FINALE, KEYWORD_WORDS, VICTORY } from '../data';

export type { SaveState };

/**
 * The stage-3 victory: sustained confetti, the guessed keyword, the glowing
 * green Táo, the revealed identity "Táo Tinh Gọn" and the period introduction.
 * The KẾT THÚC button (its own /public/end asset) closes the game and opens
 * the grand finale, where the whole-journey time is stamped.
 */
export function VictoryScreen({
  elapsed,
  saveState,
  onRetry,
  onFinish,
}: {
  elapsed: number;
  saveState: SaveState;
  onRetry: () => void;
  onFinish: () => void;
}) {
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  useEffect(() => {
    void fireConfetti(true);
  }, []);

  return (
    <div className="relative z-10 flex min-h-full items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg">
        <Parchment className="px-6 py-7 text-center sm:px-10">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black tracking-[0.28em] text-amber-600"
          >
            🎉 {VICTORY.period}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
            className="text-[clamp(24px,3.6vw,40px)] font-black text-green-700"
          >
            {VICTORY.heading}
          </motion.h1>

          {/* The guessed keyword, stamped */}
          <motion.p
            initial={{ scale: 1.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 15 }}
            className="mx-auto mt-2 inline-block rounded-xl border-2 border-red-400 px-4 py-1.5 text-lg font-black tracking-widest text-red-500 sm:text-xl"
          >
            {KEYWORD_WORDS.join(' ')}
          </motion.p>

          {/* Glowing Táo reveal */}
          <div className="relative mx-auto mt-3 h-[clamp(130px,20vh,210px)] w-[clamp(130px,20vh,210px)]">
            <motion.div
              aria-hidden
              className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(255,214,90,0.85),rgba(255,214,90,0)_70%)]"
              animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src="/home/taoxanhla.webp"
              alt="Táo Tinh Gọn"
              draggable={false}
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 14 }}
              className="relative h-full w-full object-contain drop-shadow-[0_14px_20px_rgba(120,60,0,0.35)]"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-1 text-xs font-bold uppercase tracking-widest text-amber-700"
          >
            🏛️ {VICTORY.unlockLabel}
          </motion.p>
          <motion.h2
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.85, type: 'spring', stiffness: 240, damping: 15 }}
            className="bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-[clamp(28px,4.5vw,44px)] font-black text-transparent"
          >
            {VICTORY.taoName}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-3 rounded-2xl bg-amber-100/70 px-4 py-3 text-left text-sm leading-relaxed text-amber-950 sm:text-[15px]"
          >
            {VICTORY.intro}
          </motion.p>

          <p className="mt-3 text-sm font-bold text-sky-800">
            🏁 Tổng thời gian chơi cả hành trình: {mm}:{ss}
          </p>
          <SaveStatusLine
            saveState={saveState}
            savedMessage="✓ Đã lưu, bạn đã hoàn thành CẢ BA CHẶNG! Thời gian của bạn đã vào bảng xếp hạng."
            onRetry={onRetry}
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {/* KẾT THÚC — closes the game, opens the grand finale */}
            <motion.button
              type="button"
              onClick={onFinish}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.94 }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, type: 'spring', stiffness: 240, damping: 15 }}
              className="outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
              aria-label="Kết thúc trò chơi"
            >
              <motion.img
                src={FINALE.button}
                alt="Kết thúc"
                draggable={false}
                animate={{ scale: [1, 1.045, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="h-auto w-[clamp(150px,26vw,210px)] drop-shadow-[0_10px_16px_rgba(150,90,0,0.4)]"
              />
            </motion.button>
          </div>
        </Parchment>
      </div>
    </div>
  );
}
