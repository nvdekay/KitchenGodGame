'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { QuestionType } from '@/types/database.types';
import type { AdminQuestion, QuestionInput } from '../services/quiz-admin.service';

const BOOL_OPTIONS = ['Đúng', 'Sai'];

/**
 * Create/edit a question of any type. 'boolean' uses fixed Đúng/Sai options;
 * 'single' allows one correct option (radio); 'multiple' allows several
 * (checkbox). Correct answers are chosen by ticking options.
 */
export function QuestionForm({
  stageId,
  initial,
  suggestOrd,
  pending,
  onSubmit,
  onCancel,
}: {
  stageId: string;
  initial?: AdminQuestion;
  suggestOrd?: number;
  pending: boolean;
  onSubmit: (input: QuestionInput) => void;
  onCancel?: () => void;
}) {
  const [type, setType] = useState<QuestionType>(initial?.type ?? 'single');
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [options, setOptions] = useState<string[]>(initial?.options ?? ['', '']);
  const [correct, setCorrect] = useState<number[]>(initial?.correctIndices ?? []);

  const isBool = type === 'boolean';
  const effectiveOptions = isBool ? BOOL_OPTIONS : options;
  const ord = initial?.ord ?? suggestOrd ?? 1;

  const changeType = (t: QuestionType) => {
    setType(t);
    if (t === 'boolean') setCorrect((c) => c.slice(0, 1));
    else if (t === 'single') setCorrect((c) => c.slice(0, 1));
  };

  const toggleCorrect = (idx: number) => {
    if (type === 'multiple') {
      setCorrect((c) => (c.includes(idx) ? c.filter((i) => i !== idx) : [...c, idx]));
    } else {
      setCorrect([idx]);
    }
  };

  const updateOption = (idx: number, val: string) =>
    setOptions((o) => o.map((x, i) => (i === idx ? val : x)));
  const addOption = () => setOptions((o) => [...o, '']);
  const removeOption = (idx: number) => {
    setOptions((o) => o.filter((_, i) => i !== idx));
    setCorrect((c) => c.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)));
  };

  const valid =
    prompt.trim() !== '' &&
    effectiveOptions.length >= 2 &&
    effectiveOptions.every((o) => o.trim() !== '') &&
    correct.length >= 1;

  const submit = () =>
    onSubmit({
      stage_id: stageId,
      ord,
      type,
      prompt: prompt.trim(),
      options: effectiveOptions,
      correct_indices: [...correct].sort((a, b) => a - b),
    });

  return (
    <div className="space-y-2 rounded border border-amber-200 bg-amber-50/40 p-3">
      <div className="flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => changeType(e.target.value as QuestionType)}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="single">1 đáp án</option>
          <option value="multiple">Nhiều đáp án</option>
          <option value="boolean">Đúng / Sai</option>
        </select>
        <span className="text-xs text-neutral-400">Tích vào đáp án ĐÚNG</span>
      </div>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Nội dung câu hỏi"
        className="w-full rounded border px-2 py-1"
      />

      <div className="space-y-1">
        {effectiveOptions.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type={type === 'multiple' ? 'checkbox' : 'radio'}
              checked={correct.includes(idx)}
              onChange={() => toggleCorrect(idx)}
              className="accent-brand"
              aria-label={`Đáp án đúng ${idx + 1}`}
            />
            {isBool ? (
              <span className="flex-1">{opt}</span>
            ) : (
              <input
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Đáp án ${idx + 1}`}
                className="flex-1 rounded border px-2 py-1"
              />
            )}
            {!isBool && options.length > 2 && (
              <button onClick={() => removeOption(idx)} className="text-xs text-red-500" aria-label="Xoá đáp án">
                ✕
              </button>
            )}
          </div>
        ))}
        {!isBool && (
          <button onClick={addOption} className="text-xs text-brand">
            + Thêm đáp án
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending || !valid}>
          {pending ? 'Đang lưu…' : 'Lưu câu hỏi'}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
        )}
      </div>
      {!valid && (
        <p className="text-xs text-neutral-400">
          Cần: nội dung, ≥2 đáp án không trống, và chọn ít nhất 1 đáp án đúng.
        </p>
      )}
    </div>
  );
}
