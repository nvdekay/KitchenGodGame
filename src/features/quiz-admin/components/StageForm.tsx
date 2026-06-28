'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { AdminStage, StageInput } from '../services/quiz-admin.service';

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

  return (
    <div className="space-y-2 rounded border bg-neutral-50 p-3">
      <div className="flex gap-2">
        <input
          type="number"
          value={ord}
          onChange={(e) => setOrd(Number(e.target.value))}
          className="w-20 rounded border px-2 py-1"
          aria-label="Thứ tự"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề chặng"
          className="flex-1 rounded border px-2 py-1"
        />
      </div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả (tuỳ chọn)"
        className="w-full rounded border px-2 py-1"
      />
      <div className="flex gap-2">
        <Button
          onClick={() => onSubmit({ ord, title: title.trim(), description: description.trim() || null })}
          disabled={pending || !title.trim()}
        >
          {pending ? 'Đang lưu…' : 'Lưu'}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
        )}
      </div>
    </div>
  );
}
