'use client';

import type { PlayQuestion } from '../types';

/**
 * Renders one question by type: 'multiple' → checkboxes (any number selected),
 * 'single' / 'boolean' → radios (exactly one). Selection is held by the parent
 * as an array of option indices, so all three types share one value shape.
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
    <div className="rounded border bg-white p-4">
      <p className="font-medium">
        {index + 1}. {question.prompt}
        {multiple && <span className="ml-2 text-xs text-neutral-400">(chọn nhiều)</span>}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {question.options.map((opt, idx) => (
          <label key={idx} className="flex cursor-pointer items-center gap-2">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={question.id}
              checked={value.includes(idx)}
              onChange={() => toggle(idx)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
