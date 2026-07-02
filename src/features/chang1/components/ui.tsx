'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/utils/cn';

/**
 * Shared surfaces for the chặng-1 game, matching the mockup's palette
 * (cream parchment + double gold border). Pure CSS so they scale crisply on
 * any screen and reflow with real text.
 */

/** Cream "báo cáo" parchment panel — question sheet, modals, story & victory cards. */
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
      {/* inner hairline, like the mockup's double border */}
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
