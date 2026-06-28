'use client';

import { cn } from '@/utils/cn';
import type { PlayQuestion } from '../types';

/**
 * Renders one question by type: 'multiple' → checkboxes (any number selected),
 * 'single' / 'boolean' → radios (exactly one). Options are styled as selectable
 * cards that highlight (with a smooth color transition) when chosen. Selection is
 * held by the parent as an array of option indices, so all three types share one
 * value shape.
 */
export function QuestionCard({
  question,
  index,
  value,
  onChange,
}: {
  question: PlayQuestion;
  index: number;
  value: number[];
  onChange: (next: number[]) => void;
}) {
  const multiple = question.type === 'multiple';

  const toggle = (idx: number) => {
    if (multiple) {
      onChange(value.includes(idx) ? value.filter((i) => i !== idx) : [...value, idx]);
    } else {
      onChange([idx]);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="font-medium">
        {index + 1}. {question.prompt}
        {multiple && <span className="ml-2 text-xs text-neutral-400">(chọn nhiều)</span>}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {question.options.map((opt, idx) => {
          const selected = value.includes(idx);
          return (
            <label
              key={idx}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors',
                selected
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-neutral-200 hover:bg-neutral-50',
              )}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={question.id}
                checked={selected}
                onChange={() => toggle(idx)}
                className="accent-brand"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
