'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingArea } from '@/components/ui/Spinner';
import { isAppError } from '@/lib/errors';
import { useQuizAdmin, type QuizAdmin } from '../hooks/useQuizAdmin';
import type { AdminQuestion, AdminStage } from '../services/quiz-admin.service';
import { StageForm } from './StageForm';
import { QuestionForm } from './QuestionForm';

const TYPE_LABEL: Record<AdminQuestion['type'], string> = {
  single: '1 đáp án',
  multiple: 'nhiều đáp án',
  boolean: 'đúng-sai',
};

/** Top-level quiz content manager: stages (CRUD) each containing questions (CRUD). */
export function QuizManager() {
  const admin = useQuizAdmin();
  const [addingStage, setAddingStage] = useState(false);

  if (admin.query.isLoading) return <LoadingArea />;
  const stages = admin.query.data ?? [];

  const err =
    admin.createStage.error ||
    admin.updateStage.error ||
    admin.deleteStage.error ||
    admin.createQuestion.error ||
    admin.updateQuestion.error ||
    admin.deleteQuestion.error;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý câu hỏi</h1>
        <Button onClick={() => setAddingStage((v) => !v)}>
          {addingStage ? 'Đóng' : '+ Thêm chặng'}
        </Button>
      </div>

      {err && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {isAppError(err) ? err.message : 'Thao tác thất bại.'}
        </p>
      )}

      {addingStage && (
        <StageForm
          suggestOrd={stages.length + 1}
          pending={admin.createStage.isPending}
          onSubmit={(input) =>
            admin.createStage.mutate(input, { onSuccess: () => setAddingStage(false) })
          }
          onCancel={() => setAddingStage(false)}
        />
      )}

      {stages.map((s) => (
        <StageCard key={s.id} stage={s} admin={admin} typeLabel={TYPE_LABEL} />
      ))}

      {stages.length === 0 && !addingStage && (
        <p className="text-neutral-500">Chưa có chặng nào. Bấm “+ Thêm chặng”.</p>
      )}
    </section>
  );
}

function StageCard({
  stage,
  admin,
  typeLabel,
}: {
  stage: AdminStage;
  admin: QuizAdmin;
  typeLabel: Record<AdminQuestion['type'], string>;
}) {
  const [editing, setEditing] = useState(false);
  const [addingQ, setAddingQ] = useState(false);
  const [editQ, setEditQ] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      {editing ? (
        <StageForm
          initial={stage}
          pending={admin.updateStage.isPending}
          onSubmit={(input) =>
            admin.updateStage.mutate({ id: stage.id, input }, { onSuccess: () => setEditing(false) })
          }
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">
              Chặng {stage.ord}: {stage.title}
            </p>
            {stage.description && <p className="text-sm text-neutral-500">{stage.description}</p>}
          </div>
          <div className="flex gap-3 text-sm">
            <button onClick={() => setEditing(true)} className="text-neutral-600 hover:text-neutral-900">
              Sửa
            </button>
            <button
              onClick={() => {
                if (confirm(`Xoá ${stage.title} và toàn bộ câu hỏi?`)) admin.deleteStage.mutate(stage.id);
              }}
              className="text-red-600"
            >
              Xoá
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {stage.questions.map((q) =>
          editQ === q.id ? (
            <QuestionForm
              key={q.id}
              stageId={stage.id}
              initial={q}
              pending={admin.updateQuestion.isPending}
              onSubmit={(input) =>
                admin.updateQuestion.mutate(
                  { id: q.id, input: { ord: input.ord, type: input.type, prompt: input.prompt, options: input.options, correct_indices: input.correct_indices } },
                  { onSuccess: () => setEditQ(null) },
                )
              }
              onCancel={() => setEditQ(null)}
            />
          ) : (
            <div
              key={q.id}
              className="flex items-start justify-between rounded bg-neutral-50 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">
                  {q.ord}. {q.prompt}
                </span>{' '}
                <span className="text-neutral-400">({typeLabel[q.type]})</span>
                <div className="text-xs text-green-700">
                  Đáp án: {q.correctIndices.map((i) => q.options[i]).filter(Boolean).join(', ') || '—'}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditQ(q.id)} className="text-neutral-600 hover:text-neutral-900">
                  Sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm('Xoá câu hỏi này?')) admin.deleteQuestion.mutate(q.id);
                  }}
                  className="text-red-600"
                >
                  Xoá
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {addingQ ? (
        <QuestionForm
          stageId={stage.id}
          suggestOrd={stage.questions.length + 1}
          pending={admin.createQuestion.isPending}
          onSubmit={(input) =>
            admin.createQuestion.mutate(input, { onSuccess: () => setAddingQ(false) })
          }
          onCancel={() => setAddingQ(false)}
        />
      ) : (
        <button onClick={() => setAddingQ(true)} className="text-sm font-medium text-brand">
          + Thêm câu hỏi
        </button>
      )}
    </div>
  );
}
