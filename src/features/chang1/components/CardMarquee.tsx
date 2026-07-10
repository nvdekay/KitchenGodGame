'use client';

import { useEffect, useRef } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import { AnswerCard } from './AnswerCard';
import type { Chang1Question } from '../data';

/** Horizontal drift speed of the card strip (px/s). */
const SPEED = 130;

/**
 * The strip of six hanging answer cards drifting back and forth across the sky.
 *
 * The drift is a rAF-updated motion value (transform-only → GPU-composited, no
 * React re-renders per frame). Strip/viewport bounds are cached in a ref and
 * refreshed by ResizeObserver, so the frame loop never reads layout. Direction
 * ping-pongs at the edges; `paused` freezes the drift while a feedback modal is
 * open. On question change the old cards fly up & out and the new set drops in
 * (AnimatePresence, per-card stagger inside AnswerCard).
 */
export function CardMarquee({
  question,
  order,
  wrong,
  paused,
  onPick,
}: {
  question: Chang1Question;
  /** Display order — shuffled option indices for this question. */
  order: number[];
  /** Option indices already picked wrongly (disabled + greyed). */
  wrong: number[];
  paused: boolean;
  onPick: (optionIndex: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const minXRef = useRef(0);
  const dirRef = useRef(-1);
  // MotionConfig can't reach this rAF loop (it's not an `animate` prop), so honour
  // reduced-motion here: the cards sit still and stay tappable instead of drifting.
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      const c = containerRef.current;
      const s = stripRef.current;
      if (!c || !s) return;
      minXRef.current = Math.min(0, c.clientWidth - s.scrollWidth);
      if (x.get() < minXRef.current) x.set(minXRef.current);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    if (stripRef.current) ro.observe(stripRef.current);
    return () => ro.disconnect();
  }, [x]);

  useAnimationFrame((_, delta) => {
    if (paused || reduceMotion || minXRef.current === 0) return;
    let nx = x.get() + dirRef.current * SPEED * (delta / 1000);
    if (nx <= minXRef.current) {
      nx = minXRef.current;
      dirRef.current = 1;
    } else if (nx >= 0) {
      nx = 0;
      dirRef.current = -1;
    }
    x.set(nx);
  });

  return (
    <div ref={containerRef} className="relative z-10 w-full overflow-hidden">
      <motion.div ref={stripRef} style={{ x }} className="w-max">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.ord}
            className="flex items-start gap-[2.2vw] px-[3vw] pb-4"
            exit={{ y: -90, opacity: 0, transition: { duration: 0.28, ease: 'easeIn' } }}
          >
            {order.map((optIdx, i) => {
              const option = question.options[optIdx];
              if (!option) return null;
              return (
                <AnswerCard
                  key={optIdx}
                  text={option.text}
                  index={i}
                  disabled={paused}
                  wrong={wrong.includes(optIdx)}
                  onPick={() => onPick(optIdx)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
