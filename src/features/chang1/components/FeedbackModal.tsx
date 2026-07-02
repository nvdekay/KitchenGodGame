'use client';

import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { GoldButton, Parchment } from '@/components/ui/game';

export type Feedback =
  | { kind: 'correct'; explanation: string; isLast: boolean }
  | { kind: 'wrong'; optionText: string; reason?: string };

/**
 * Post-pick feedback over a dimmed sky (the marquee pauses underneath).
 * Correct → 💡 giải thích "vỡ ra"; wrong → ⚠️ lý do nhiễu (why the distractor
 * was tempting). Wrong can also be dismissed by tapping the backdrop.
 */
export function FeedbackModal({
  feedback,
  onClose,
}: {
  feedback: Feedback;
  onClose: () => void;
}) {
  const correct = feedback.kind === 'correct';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={correct ? undefined : onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-sky-950/35 p-4 backdrop-blur-[3px]"
    >
      <motion.div
        initial={{ scale: 0.7, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Parchment className="px-6 py-6 text-center sm:px-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 14 }}
            className="text-5xl"
          >
            {correct ? '🎉' : '🌪️'}
          </motion.div>

          <h3
            className={cn(
              'mt-2 text-xl font-black sm:text-2xl',
              correct ? 'text-green-700' : 'text-red-600',
            )}
          >
            {correct ? 'Chính xác!' : 'Chưa đúng rồi!'}
          </h3>

          {correct ? (
            <p className="mt-3 rounded-2xl bg-amber-100/70 px-4 py-3 text-left text-sm font-medium leading-relaxed text-amber-950 sm:text-base">
              💡 {feedback.explanation}
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm font-bold text-amber-800">“{feedback.optionText}”</p>
              {feedback.reason && (
                <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-medium leading-relaxed text-red-800 sm:text-base">
                  ⚠️ {feedback.reason}
                </p>
              )}
            </>
          )}

          <GoldButton onClick={onClose} className="mt-5">
            {correct ? (feedback.isLast ? 'Hoàn thiện hồ sơ 📜' : 'Câu tiếp theo →') : 'Tìm tiếp!'}
          </GoldButton>
        </Parchment>
      </motion.div>
    </motion.div>
  );
}
