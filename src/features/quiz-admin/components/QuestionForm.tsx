'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { QuestionType } from '@/types/database.types';
import type { AdminQuestion, QuestionInput } from '../services/quiz-admin.service';

const BOOL_OPTIONS = ['Đúng', 'Sai'];

const inputClass =
  'rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200';

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
    // Drop any selected index that no longer maps to an option after the switch
    // (e.g. boolean has only 2 options, so a previously-correct index ≥2 must go),
    // then keep at most one for the single-answer types. Otherwise an
    // out-of-range correct_indices reaches the DB and the question has no
    // resolvable correct answer.
    const optCount = t === 'boolean' ? BOOL_OPTIONS.length : options.length;
    setCorrect((c) => {
      const inRange = c.filter((i) => i < optCount);
      return t === 'multiple' ? inRange : inRange.slice(0, 1);
    });
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
    correct.length >= 1 &&
    correct.every((i) => i >= 0 && i < effectiveOptions.length);

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
    <div className="space-y-2.5 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
      <div className="flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => changeType(e.target.value as QuestionType)}
          className={`text-sm ${inputClass}`}
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
        className={`w-full ${inputClass}`}
      />

      <div className="space-y-1.5">
        {effectiveOptions.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type={type === 'multiple' ? 'checkbox' : 'radio'}
              checked={correct.includes(idx)}
              onChange={() => toggleCorrect(idx)}
              className="accent-emerald-600"
              aria-label={`Đáp án đúng ${idx + 1}`}
            />
            {isBool ? (
              <span className="flex-1">{opt}</span>
            ) : (
              <input
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Đáp án ${idx + 1}`}
                className={`flex-1 ${inputClass}`}
              />
            )}
            {!isBool && options.length > 2 && (
              <button
                onClick={() => removeOption(idx)}
                aria-label="Xoá đáp án"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-400 transition hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        ))}
        {!isBool && (
          <button
            onClick={addOption}
            className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Thêm đáp án
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={submit}
          disabled={pending || !valid}
          className="rounded-lg bg-amber-500 hover:bg-amber-600 hover:opacity-100"
        >
          {pending ? 'Đang lưu…' : 'Lưu câu hỏi'}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="rounded-lg">
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
