'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { isAppError } from '@/lib/errors';
import { useStage, useSubmitStage } from '../hooks/useQuiz';
import { QuestionCard } from './QuestionCard';
import type { AnswerMap } from '../types';

/**
 * Play one stage: render its questions, collect answers, submit for server-side
 * grading. A pass (all correct) unlocks the next stage; a miss shows the score
 * and lets the player retry (unlimited).
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

  if (isLoading) return <p className="mx-auto max-w-xl text-neutral-500">Đang tải…</p>;
  if (isError || !stage) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <p className="text-red-600">
          {isAppError(error) ? error.message : 'Không tải được chặng.'}
        </p>
        <Button variant="secondary" onClick={onBack}>
          ← Quay lại
        </Button>
      </div>
    );
  }

  const passed = submit.data?.passed ?? false;
  const isLast = ord >= total;

  const onSubmit = () => submit.mutate({ ord, answers });

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
        stage.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            value={answers[q.id] ?? []}
            onChange={(next) => setAnswers((a) => ({ ...a, [q.id]: next }))}
          />
        ))
      )}

      {submit.data && !passed && (
        <p className="rounded bg-amber-50 px-3 py-2 text-amber-700">
          Đúng {submit.data.correct}/{submit.data.total}. Chưa đạt — thử lại nhé!
        </p>
      )}

      {passed ? (
        <div className="space-y-3 rounded bg-green-50 p-4 text-green-700">
          <p className="font-medium">✓ Chính xác! Bạn đã qua {stage.title}.</p>
          {isLast ? (
            <Button onClick={onBack}>🎉 Hoàn thành! Về danh sách chặng</Button>
          ) : (
            <Button onClick={() => onNext(ord + 1)}>Chặng tiếp theo →</Button>
          )}
        </div>
      ) : (
        <Button onClick={onSubmit} disabled={submit.isPending || stage.questions.length === 0}>
          {submit.isPending ? 'Đang nộp…' : 'Nộp bài'}
        </Button>
      )}
    </div>
  );
}
