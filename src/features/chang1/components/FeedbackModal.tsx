'use client';

import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { GoldButton, LockedModal, Parchment, useReadLock } from '@/components/ui/game';

export type Feedback =
  | { kind: 'correct'; explanation: string; isLast: boolean }
  | { kind: 'wrong'; optionText: string; reason?: string };

/**
 * Post-pick feedback over a dimmed sky (the marquee pauses underneath), with a
 * read-lock so answers can't be spammed through:
 *   • correct → 💡 giải thích. The clock is paused by the parent and the modal
 *     stays locked for 10s so the message actually gets read.
 *   • wrong   → ⚠️ lý do nhiễu, locked for 4s before another pick is allowed
 *     (the clock keeps running — wrong guesses cost time).
 * The CTA counts the lock down and only then becomes pressable; the backdrop
 * never dismisses while locked.
 */
const LOCK_SECONDS = { correct: 10, wrong: 4 } as const;

export function FeedbackModal({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) {
  const correct = feedback.kind === 'correct';

  const { lockLeft, locked } = useReadLock(LOCK_SECONDS[feedback.kind]);
  // Correct answers advance only via the CTA; wrong ones may also be dismissed
  // by backdrop/Escape once the think-again lock elapses.
  const dismissible = !correct && !locked;
  const announce = locked
    ? correct
      ? 'Đang mở nội dung giải thích, hãy đọc kỹ.'
      : 'Tạm khóa để suy nghĩ lại.'
    : 'Đã có thể tiếp tục.';

  return (
    <LockedModal
      dismissible={dismissible}
      onDismiss={onClose}
      labelledById="chang1-feedback-title"
      announce={announce}
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
          id="chang1-feedback-title"
          className={cn(
            'mt-2 text-xl font-black sm:text-2xl',
            correct ? 'text-green-700' : 'text-red-600',
          )}
        >
          {correct ? 'Chính xác!' : 'Chưa đúng rồi!'}
        </h3>

        {correct ? (
          <>
            <p className="mt-3 rounded-2xl bg-amber-100/70 px-4 py-3 text-left text-sm font-medium leading-relaxed text-amber-950 sm:text-base">
              💡 {feedback.explanation}
            </p>
            <p className="mt-2 text-xs font-semibold text-sky-700">
              ⏸️ Đồng hồ đang tạm dừng, cứ đọc thong thả nhé!
            </p>
          </>
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

        <GoldButton
          onClick={locked ? undefined : onClose}
          disabled={locked}
          className={cn('mt-5', locked && 'opacity-60 saturate-50')}
        >
          {locked
            ? correct
              ? `📖 Đọc thông điệp… ${lockLeft}s`
              : `⏳ Suy nghĩ lại đã… ${lockLeft}s`
            : correct
              ? feedback.isLast
                ? 'Hoàn thiện hồ sơ 📜'
                : 'Câu tiếp theo →'
              : 'Tìm tiếp!'}
        </GoldButton>
      </Parchment>
    </LockedModal>
  );
}
