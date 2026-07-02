'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { fireConfetti } from '@/lib/confetti';
import { GoldButton, Parchment } from '@/components/ui/game';
import { KEYWORD_WORDS, VICTORY } from '../data';

export type SaveState = 'saving' | 'saved' | 'failed';

const SAVE_TEXT: Record<SaveState, string> = {
  saving: 'Đang lưu tiến độ…',
  saved: '✓ Đã lưu — bạn đã hoàn thành CẢ BA CHẶNG! Thời gian của bạn đã vào bảng xếp hạng.',
  failed: '⚠ Chưa lưu được tiến độ lên máy chủ.',
};

/**
 * The final victory of the journey: sustained confetti, the guessed keyword,
 * the glowing green Táo, the revealed identity "Táo Tinh Gọn", the period
 * introduction, and the WHOLE-JOURNEY time (the number the admin leaderboard
 * ranks by).
 */
export function VictoryScreen({
  elapsed,
  saveState,
  onReplay,
}: {
  elapsed: number;
  saveState: SaveState;
  onReplay: () => void;
}) {
  const router = useRouter();
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
            🏁 Tổng thời gian cả hành trình: {mm}:{ss}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{SAVE_TEXT[saveState]}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <GoldButton onClick={() => router.push('/map')}>Về bản đồ 🗺️</GoldButton>
            <button
              type="button"
              onClick={onReplay}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-sky-700 underline-offset-4 hover:underline"
            >
              Chơi lại
            </button>
          </div>
        </Parchment>
      </div>
    </div>
  );
}
