'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/utils/cn';

/**
 * Shared surfaces for the per-stage games (chặng 1, 2, …): the cream parchment
 * panel, the golden CTA, and the fish clock. Pure CSS + one shared sprite so
 * every stage feels like the same world. Lives in components/ui because it is
 * reused across game features (features must not import from each other).
 */

/** Cream "báo cáo" parchment panel — question sheets, modals, story & victory cards. */
export function Parchment({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative rounded-3xl border-[3px] border-[#dfb168] bg-[#fdf7e7] shadow-[0_16px_40px_rgba(21,78,150,0.28)]',
        className,
      )}
    >
      {/* inner hairline, like the mockups' double border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-1.5 rounded-[18px] border-2 border-[#eedbab]/70"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Big golden game CTA. */
export function GoldButton({ className, children, ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      className={cn(
        'rounded-full border-2 border-amber-200/80 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500',
        'px-8 py-3 text-base font-extrabold text-amber-950 shadow-[0_8px_20px_rgba(180,120,0,0.4)]',
        'outline-none transition-[filter] hover:brightness-105 focus-visible:ring-4 focus-visible:ring-amber-300/60',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Golden "Thời gian" fish with the elapsed run time inside its white box
 * (measured region of /game/ca-thoi-gian.webp: L12.9 T33.6 R79.3 B71.6 %).
 * The parent supplies size/position via a wrapping element. The wrapper is a
 * CSS size container so the digits scale with the FISH (cqw), never the
 * viewport — no overflow whether the fish renders at 84px or 200px, and the
 * font steps down for runs past 99 minutes.
 */
export function FishTimer({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const time = `${mm}:${ss}`;

  return (
    <motion.div
      className="relative"
      style={{ containerType: 'inline-size' }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.img
        src="/game/ca-thoi-gian.webp"
        alt=""
        draggable={false}
        className="h-auto w-full drop-shadow-[0_8px_12px_rgba(10,60,120,0.3)]"
      />
      <span
        className="absolute flex items-center justify-center font-black tabular-nums leading-none text-amber-900"
        style={{
          left: '14%',
          right: '22%',
          top: '36%',
          bottom: '31%',
          fontSize: `clamp(10px, ${time.length > 5 ? 14 : 17}cqw, 30px)`,
        }}
        aria-label={`Thời gian: ${mm} phút ${ss} giây`}
      >
        {time}
      </span>
    </motion.div>
  );
}
