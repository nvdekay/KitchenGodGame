'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { isAppError } from '@/lib/errors';
import { fireConfetti } from '@/lib/confetti';
import { useStage, useSubmitStage } from '../hooks/useQuiz';
import { QuestionCard } from './QuestionCard';
import { StagePlaySkeleton } from './QuizSkeletons';
import type { AnswerMap } from '../types';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

/**
 * Play one stage: render its questions, collect answers, submit for server-side
 * grading. A pass (all correct) unlocks the next stage and fires confetti; a
 * miss shakes the score banner and lets the player retry (unlimited).
 * Confetti/motion respect the user's reduced-motion preference.
 */
export function StagePlay({
  ord,
  userId,
  total,
  onBack,
  onNext,
}: {
  ord: number;
  userId: string;
  total: number;
  onBack: () => void;
  onNext: (ord: number) => void;
}) {
  const { data: stage, isLoading, isError, error } = useStage(ord);
  const submit = useSubmitStage(userId);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [shakeKey, setShakeKey] = useState(0);
  const reduced = useReducedMotion();

  if (isLoading) return <StagePlaySkeleton />;
  if (isError || !stage) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <p className="text-red-600">{isAppError(error) ? error.message : 'Không tải được chặng.'}</p>
        <Button variant="secondary" onClick={onBack}>
          ← Quay lại
        </Button>
      </div>
    );
  }

  const passed = submit.data?.passed ?? false;
  const isLast = ord >= total;
  const allAnswered =
    stage.questions.length > 0 &&
    stage.questions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  const onSubmit = () =>
    submit.mutate(
      { ord, answers },
      {
        onSuccess: (res) => {
          if (res.passed) {
            if (!reduced) void fireConfetti(isLast);
          } else {
            setShakeKey((k) => k + 1);
          }
        },
      },
    );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Các chặng
        </button>
        <h2 className="text-xl font-bold">{stage.title}</h2>
        <span className="w-16" />
      </div>
      {stage.description && <p className="text-neutral-600">{stage.description}</p>}

      {stage.questions.length === 0 ? (
        <p className="rounded border bg-amber-50 p-4 text-amber-700">
          Chặng này chưa có câu hỏi. Admin cần thêm câu hỏi.
        </p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {stage.questions.map((q, i) => (
            <motion.div key={q.id} variants={item}>
              <QuestionCard
                question={q}
                index={i}
                value={answers[q.id] ?? []}
                onChange={(next) => setAnswers((a) => ({ ...a, [q.id]: next }))}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {submit.data && !passed && (
        <motion.p
          key={shakeKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
          className="rounded bg-amber-50 px-3 py-2 text-amber-700"
        >
          Đúng {submit.data.correct}/{submit.data.total}. Chưa đạt — thử lại nhé!
        </motion.p>
      )}

      {passed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="space-y-3 rounded bg-green-50 p-4 text-green-700"
        >
          <p className="font-medium">✓ Chính xác! Bạn đã qua {stage.title}.</p>
          {isLast ? (
            <Button onClick={onBack}>🎉 Hoàn thành! Về danh sách chặng</Button>
          ) : (
            <Button onClick={() => onNext(ord + 1)}>Chặng tiếp theo →</Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          <Button onClick={onSubmit} disabled={submit.isPending || !allAnswered}>
            {submit.isPending ? 'Đang nộp…' : 'Nộp bài'}
          </Button>
          {!allAnswered && stage.questions.length > 0 && (
            <p className="text-xs text-neutral-400">Hãy trả lời tất cả câu hỏi trước khi nộp.</p>
          )}
        </div>
      )}
    </div>
  );
}
