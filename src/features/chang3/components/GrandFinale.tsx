'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { fireConfetti } from '@/lib/confetti';
import { GoldButton } from '@/components/ui/game';
import { FINALE } from '../data';

/**
 * The grand end-of-game celebration, composed from the separated /public/end
 * layers over the game's sky: the "CHÚC MỪNG — BẠN ĐÃ VƯỢT ẢI" scroll drops in
 * and sways, the five Táo ride their koi in from the left one after another
 * (then bob like they're swimming), confetti keeps bursting, and the final
 * whole-journey time is stamped in the middle.
 */
export function GrandFinale({ elapsed }: { elapsed: number }) {
  const router = useRouter();
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  // A volley of celebration bursts as the screen assembles.
  useEffect(() => {
    void fireConfetti(true);
    const t1 = setTimeout(() => void fireConfetti(), 1300);
    const t2 = setTimeout(() => void fireConfetti(true), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative z-10 flex min-h-full flex-col items-center justify-center gap-3 px-4 py-6">
      {/* Banner scroll */}
      <motion.div
        initial={{ y: -140, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 17 }}
        className="w-[min(92vw,40rem)]"
      >
        <motion.img
          src={FINALE.banner}
          alt="Chúc mừng — bạn đã vượt ải. Các Táo đã lên chầu thành công!"
          draggable={false}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-auto w-full drop-shadow-[0_14px_24px_rgba(10,50,120,0.35)]"
        />
      </motion.div>

      {/* Final journey time */}
      <motion.p
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 240, damping: 15 }}
        className="rounded-full border-2 border-amber-300 bg-white/85 px-5 py-2 text-sm font-black text-sky-900 shadow-lg backdrop-blur sm:text-base"
      >
        🏁 Tổng thời gian cả hành trình: {mm}:{ss}
      </motion.p>

      {/* The five Táo riding home on their koi */}
      <div className="flex w-full max-w-5xl flex-wrap items-end justify-center gap-x-1 gap-y-2">
        {FINALE.riders.map((src, i) => (
          <motion.div
            key={src}
            initial={{ x: -160, y: 70, opacity: 0, rotate: -10 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.45 + i * 0.18, type: 'spring', stiffness: 120, damping: 15 }}
            className="w-[clamp(86px,16vw,190px)]"
          >
            <motion.img
              src={src}
              alt=""
              draggable={false}
              animate={{ y: [0, -10, 0], rotate: [-2.5, 2.5, -2.5] }}
              transition={{
                duration: 2.4 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.22,
              }}
              className="h-auto w-full drop-shadow-[0_12px_16px_rgba(10,50,120,0.3)]"
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="mt-2 flex flex-wrap items-center justify-center gap-3"
      >
        <GoldButton onClick={() => router.push('/')}>Về trang chủ 🏠</GoldButton>
        <button
          type="button"
          onClick={() => router.push('/map')}
          className="rounded-full px-5 py-2.5 text-sm font-bold text-sky-800 underline-offset-4 hover:underline"
        >
          Về bản đồ 🗺️
        </button>
      </motion.div>
    </div>
  );
}
