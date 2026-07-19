'use client';

import { useState } from 'react';
import { BookOpenText, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
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

const TYPE_BADGE: Record<AdminQuestion['type'], string> = {
  single: 'bg-sky-100 text-sky-700',
  multiple: 'bg-red-100 text-brand',
  boolean: 'bg-amber-100 text-amber-800',
};

/** Top-level quiz content manager: stages (CRUD) each containing questions (CRUD). */
export function QuizManager() {
  const admin = useQuizAdmin();
  const [addingStage, setAddingStage] = useState(false);

  if (admin.query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  const stages = admin.query.data ?? [];

  const err =
    admin.createStage.error ||
    admin.updateStage.error ||
    admin.deleteStage.error ||
    admin.createQuestion.error ||
    admin.updateQuestion.error ||
    admin.deleteQuestion.error;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-brand">
            <BookOpenText className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Câu hỏi</h1>
            <p className="text-sm text-neutral-500">Quản lý các chặng và câu hỏi trong game.</p>
          </div>
        </div>
        <Button onClick={() => setAddingStage((v) => !v)} className="rounded-xl">
          {addingStage ? (
            'Đóng'
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden /> Thêm chặng
            </>
          )}
        </Button>
      </div>

      {err && (
        <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
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
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-neutral-500">
          Chưa có chặng nào. Bấm “+ Thêm chặng”.
        </p>
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
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-bold text-brand">
              {stage.ord}
            </span>
            <div>
              <p className="font-semibold text-neutral-900">{stage.title}</p>
              {stage.description && <p className="text-sm text-neutral-500">{stage.description}</p>}
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setEditing(true)}
              aria-label="Sửa chặng"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-red-50 hover:text-brand"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            <button
              disabled={admin.deleteStage.isPending}
              onClick={() => {
                if (confirm(`Xoá ${stage.title} và toàn bộ câu hỏi?`)) admin.deleteStage.mutate(stage.id);
              }}
              aria-label="Xoá chặng"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
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
              className="flex items-start justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-neutral-800">
                    {q.ord}. {q.prompt}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', TYPE_BADGE[q.type])}>
                    {typeLabel[q.type]}
                  </span>
                </div>
                <div className="text-xs text-emerald-700">
                  Đáp án: {q.correctIndices.map((i) => q.options[i]).filter(Boolean).join(', ') || '—'}
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => setEditQ(q.id)}
                  aria-label="Sửa câu hỏi"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-red-100 hover:text-brand"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  disabled={admin.deleteQuestion.isPending}
                  onClick={() => {
                    if (confirm('Xoá câu hỏi này?')) admin.deleteQuestion.mutate(q.id);
                  }}
                  aria-label="Xoá câu hỏi"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
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
        <button
          onClick={() => setAddingQ(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-brand hover:text-red-900"
        >
          <Plus className="h-4 w-4" aria-hidden /> Thêm câu hỏi
        </button>
      )}
    </div>
  );
}
