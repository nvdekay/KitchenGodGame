'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { GoldButton, Parchment } from '@/components/ui/game';
import { cn } from '@/utils/cn';
import { KEYWORD_NORMALIZED, KEYWORD_WORDS, PUZZLE, normalizeAnswer } from '../data';

/** Letters the player has typed, upper-cased, punctuation/spaces stripped. */
function typedLetters(raw: string): string[] {
  return [...raw.toUpperCase()].filter((ch) => /\p{L}/u.test(ch));
}

/**
 * The keyword-guess step: the restored picture on top, the phrase rendered as
 * grouped letter boxes underneath, and one hidden input driving them (tap the
 * boxes to focus; mobile keyboard pops). Comparison is diacritic-insensitive —
 * "TINH GON BO MAY" and "TINH GỌN BỘ MÁY" both pass. Wrong guesses shake and
 * flash red; there are no hints.
 */
export function KeywordPanel({ onSolved }: { onSolved: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState('');
  const [wrong, setWrong] = useState(false);

  const wordLens = useMemo(() => KEYWORD_WORDS.map((w) => [...w].length), []);
  const totalLetters = wordLens.reduce((a, b) => a + b, 0);
  const letters = typedLetters(raw).slice(0, totalLetters);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGuess = () => {
    if (normalizeAnswer(raw) === KEYWORD_NORMALIZED) {
      onSolved();
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 650);
      inputRef.current?.focus();
    }
  };

  // Running offset so each word group reads its slice of the typed letters.
  let offset = 0;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Parchment className="px-4 py-5 text-center sm:px-8 sm:py-6">
        <motion.img
          src={PUZZLE.img}
          alt="Bức tranh đã khôi phục"
          draggable={false}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto max-h-[30vh] w-auto rounded-xl border-2 border-amber-300 object-contain shadow-md"
        />

        <h2 className="mt-4 text-base font-black tracking-wide text-amber-900 sm:text-xl">
          CỤM TỪ CẦN ĐOÁN LÀ GÌ?
        </h2>

        {/* Letter boxes (tap to type) */}
        <motion.div
          animate={wrong ? { x: [0, -10, 10, -7, 7, 0] } : {}}
          transition={{ duration: 0.45 }}
          onClick={() => inputRef.current?.focus()}
          className="mt-3 flex cursor-text flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          {wordLens.map((len, w) => {
            const start = offset;
            offset += len;
            return (
              <span key={w} className="flex gap-1.5">
                {Array.from({ length: len }, (_, i) => {
                  const ch = letters[start + i];
                  const isNext = start + i === letters.length;
                  return (
                    <span
                      key={i}
                      className={cn(
                        'grid h-10 w-8 place-items-center rounded-lg border-2 bg-white text-lg font-black text-amber-900 shadow-sm sm:h-12 sm:w-10 sm:text-2xl',
                        wrong
                          ? 'border-red-400 bg-red-50'
                          : ch
                            ? 'border-amber-400'
                            : isNext
                              ? 'animate-pulse border-sky-400'
                              : 'border-amber-200',
                      )}
                    >
                      {ch ?? ''}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </motion.div>

        {/* Hidden input drives the boxes */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGuess();
          }}
        >
          <input
            ref={inputRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Nhập cụm từ khóa"
            className="absolute h-0 w-0 opacity-0"
          />
          <p className={cn('mt-2 h-5 text-sm font-bold', wrong ? 'text-red-600' : 'text-transparent')}>
            Chưa đúng rồi — nhìn kỹ bức tranh và thử lại!
          </p>
          <GoldButton className="mt-1" onClick={handleGuess}>
            Đoán! 🔍
          </GoldButton>
        </form>
      </Parchment>
    </div>
  );
}
