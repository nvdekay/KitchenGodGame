'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { Parchment } from './ui';
import type { Chang1Question } from '../data';

/**
 * The "báo cáo" sheet: question counter, five progress seals (one stamps in per
 * completed question), and the prompt (cross-fades on question change).
 */
export function QuestionPanel({
  question,
  solvedCount,
  total,
}: {
  question: Chang1Question;
  solvedCount: number;
  total: number;
}) {
  return (
    <Parchment className="mx-auto w-full max-w-3xl px-5 py-4 text-center sm:px-8 sm:py-5">
      <div className="flex items-center justify-center gap-3">
        <span className="text-[11px] font-black tracking-[0.2em] text-amber-700/90 sm:text-xs">
          CÂU {question.ord}/{total}
        </span>
        <span className="flex gap-1.5" aria-label={`Đã hoàn thành ${solvedCount}/${total} câu`}>
          {Array.from({ length: total }, (_, i) => (
            <motion.span
              key={i}
              animate={i < solvedCount ? { scale: [1.9, 1], rotate: [-16, 0] } : {}}
              className={cn(
                'grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] font-black',
                i < solvedCount
                  ? 'border-red-500 bg-red-500 text-white shadow'
                  : 'border-amber-300/80 bg-amber-100/60 text-transparent',
              )}
            >
              ✓
            </motion.span>
          ))}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.h2
          key={question.ord}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }}
          className="mt-2 text-[clamp(15px,2.2vw,24px)] font-extrabold leading-snug text-amber-950"
        >
          {question.prompt}
        </motion.h2>
      </AnimatePresence>
    </Parchment>
  );
}
