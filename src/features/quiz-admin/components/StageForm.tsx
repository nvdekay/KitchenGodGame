'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { AdminStage, StageInput } from '../services/quiz-admin.service';

const inputClass =
  'rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200';

/** Create/edit a stage (order, title, description). */
export function StageForm({
  initial,
  suggestOrd,
  pending,
  onSubmit,
  onCancel,
}: {
  initial?: AdminStage;
  suggestOrd?: number;
  pending: boolean;
  onSubmit: (input: StageInput) => void;
  onCancel?: () => void;
}) {
  const [ord, setOrd] = useState(initial?.ord ?? suggestOrd ?? 1);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  // An empty number input parses to NaN; guard so a NaN/0/negative ord can't be
  // submitted (it would fail opaquely at the DB).
  const ordValid = Number.isInteger(ord) && ord >= 1;
  const canSubmit = title.trim() !== '' && ordValid;

  return (
    <div className="space-y-2.5 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
      <div className="flex gap-2">
        <input
          type="number"
          value={ord}
          onChange={(e) => setOrd(Number(e.target.value))}
          className={`w-20 ${inputClass}`}
          aria-label="Thứ tự"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề chặng"
          className={`flex-1 ${inputClass}`}
        />
      </div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả (tuỳ chọn)"
        className={`w-full ${inputClass}`}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => onSubmit({ ord, title: title.trim(), description: description.trim() || null })}
          disabled={pending || !canSubmit}
          className="rounded-lg bg-violet-600 hover:bg-violet-700 hover:opacity-100"
        >
          {pending ? 'Đang lưu…' : 'Lưu'}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="rounded-lg">
            Huỷ
          </Button>
        )}
      </div>
    </div>
  );
}
