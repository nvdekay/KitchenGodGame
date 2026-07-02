'use client';

import { motion } from 'motion/react';
import { cn } from '@/utils/cn';

/**
 * One card on the memory board. A real 3-D flip: the outer button provides
 * perspective, the inner container rotates on Y (transform-only → GPU smooth),
 * and the two faces are backface-hidden — face-down shows the golden-koi
 * card back, face-up shows the document/meme image on a cream card. Matched
 * cards stay face-up with a golden ring + ✓ seal.
 */
export function FlipCard({
  img,
  alt,
  faceUp,
  matched,
  disabled,
  entranceDelay,
  onFlip,
}: {
  img: string;
  alt: string;
  faceUp: boolean;
  matched: boolean;
  disabled: boolean;
  entranceDelay: number;
  onFlip: () => void;
}) {
  const clickable = !disabled && !faceUp && !matched;

  return (
    <motion.button
      type="button"
      onClick={onFlip}
      disabled={!clickable}
      aria-label={faceUp || matched ? alt : 'Thẻ đang úp'}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: entranceDelay, ease: 'easeOut' }}
      whileHover={clickable ? { scale: 1.05 } : undefined}
      whileTap={clickable ? { scale: 0.95 } : undefined}
      className={cn(
        'relative aspect-[604/894] w-full select-none outline-none [perspective:900px]',
        clickable ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        animate={{ rotateY: faceUp || matched ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.32, 1.2, 0.6, 1] }}
      >
        {/* Face-down: golden koi back */}
        <span className="absolute inset-0 [backface-visibility:hidden]">
          <motion.img
            src="/chang2/card-back.webp"
            alt=""
            draggable={false}
            className="h-full w-full rounded-[8%] object-cover shadow-[0_6px_14px_rgba(10,60,120,0.3)]"
          />
        </span>

        {/* Face-up: the document / meme on a cream card */}
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-[8%] border-2 bg-[#fdf7e7] p-[6%]',
            'shadow-[0_6px_14px_rgba(10,60,120,0.3)] [backface-visibility:hidden] [transform:rotateY(180deg)]',
            matched ? 'border-amber-400 ring-2 ring-amber-300/80' : 'border-[#dfb168]',
          )}
        >
          <motion.img
            src={img}
            alt={alt}
            draggable={false}
            className="max-h-full max-w-full rounded-sm object-contain"
          />
        </span>
      </motion.span>

      {/* Matched seal */}
      {matched && (
        <motion.span
          initial={{ scale: 2.2, opacity: 0, rotate: -18 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          className="absolute -right-1 -top-1 z-10 grid h-[26%] w-auto aspect-square place-items-center rounded-full bg-red-500 text-[70%] font-black text-white shadow-md"
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}
