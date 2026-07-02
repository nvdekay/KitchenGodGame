'use client';

import { motion } from 'motion/react';
import { cn } from '@/utils/cn';

/**
 * One hanging wooden sign in the marquee. The rope is part of the sprite, so
 * the idle sway rotates around the rope anchor (origin-top). The label sits
 * inside khung.webp's measured cream board area (L9.7 T30.4 R89.5 B79.8 %).
 * A wrong pick greys the card out with a ❌ stamp and disables it.
 */
export function AnswerCard({
  text,
  index,
  disabled,
  wrong,
  onPick,
}: {
  text: string;
  index: number;
  disabled: boolean;
  wrong: boolean;
  onPick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPick}
      disabled={disabled || wrong}
      aria-label={text}
      initial={{ opacity: 0, y: -70 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={!wrong ? { scale: 1.06 } : undefined}
      whileTap={!wrong ? { scale: 0.94 } : undefined}
      className={cn(
        'relative w-[clamp(150px,19vw,250px)] shrink-0 select-none outline-none',
        !wrong && 'cursor-pointer',
      )}
    >
      {/* sway around the rope anchor */}
      <motion.span
        className="block origin-top"
        animate={{ rotate: [-1.6, 1.6, -1.6] }}
        transition={{
          duration: 3 + index * 0.35,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.25,
        }}
      >
        <motion.img
          src="/chang1/khung.webp"
          alt=""
          draggable={false}
          className={cn(
            'h-auto w-full drop-shadow-[0_10px_14px_rgba(10,60,120,0.25)] transition',
            wrong && 'opacity-55 grayscale',
          )}
        />
        <span
          className={cn(
            'absolute flex items-center justify-center text-center font-extrabold leading-snug text-amber-950',
            wrong && 'opacity-50',
          )}
          style={{
            left: '12%',
            right: '12.5%',
            top: '32%',
            bottom: '22%',
            fontSize: 'clamp(12px,1.35vw,19px)',
          }}
        >
          {text}
        </span>
        {wrong && (
          <motion.span
            initial={{ scale: 2.4, opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="absolute left-1/2 top-[48%] text-[clamp(26px,3.2vw,44px)] drop-shadow"
          >
            ❌
          </motion.span>
        )}
      </motion.span>
    </motion.button>
  );
}
