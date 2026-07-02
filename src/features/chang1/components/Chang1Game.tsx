'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { usePresenceTracker } from '@/features/presence';
import { usePlayClock } from '@/features/quiz';
import { fireConfetti } from '@/lib/confetti';
import { shuffle } from '@/utils/shuffle';
import { QUESTIONS } from '../data';
import { useChang1Sync } from '../hooks/useChang1Sync';
import { CardMarquee } from './CardMarquee';
import { QuestionPanel } from './QuestionPanel';
import { FishTimer } from '@/components/ui/game';
import { FeedbackModal, type Feedback } from './FeedbackModal';
import { StoryIntro } from './StoryIntro';
import { VictoryScreen, type SaveState } from './VictoryScreen';

export type Chang1Phase = 'intro' | 'playing' | 'victory';

/** Display order of the six answer cards for one question. */
const shuffledIndices = (n: number) => shuffle(Array.from({ length: n }, (_, i) => i));

/**
 * Chặng 1 — "Hồ sơ thất lạc". Orchestrates the three phases:
 *
 *   intro   → story scroll + flustered Táo, CTA starts the run
 *   playing → six hanging answer cards drift across the sky; the player taps
 *             the right one. Wrong picks show their "lý do nhiễu" and grey the
 *             card out; the right pick shows the 💡 explanation, stamps a seal,
 *             and advances. A fish-clock counts the run up.
 *   victory → confetti + "Táo Hội Nhập" identity reveal; the run is submitted
 *             through submit_stage() so the map unlocks chặng 2 and the admin
 *             dashboard sees the completion in realtime.
 *
 * `initialPhase` is a dev/testing seam (e.g. screenshot a specific phase).
 */
export function Chang1Game({
  userId,
  username,
  initialPhase = 'intro',
}: {
  userId: string;
  username: string;
  initialPhase?: Chang1Phase;
}) {
  const [phase, setPhase] = useState<Chang1Phase>(initialPhase);
  const [round, setRound] = useState(() => ({
    qIndex: 0,
    order: shuffledIndices(6),
    wrong: [] as number[],
  }));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  /** question ord → the option index the player answered correctly with. */
  const picksRef = useRef<Record<number, number>>({});
  const submittedRef = useRef(false);

  const { submit } = useChang1Sync(userId);
  // Active-play clock: ticks only while the player is answering — not during
  // the intro, and not while the correct-answer message is on screen.
  const running = phase === 'playing' && feedback?.kind !== 'correct';
  const { total: elapsed, stageSeconds } = usePlayClock(userId, { stageOrd: 1, running });
  const stageSecondsRef = useRef(0);
  stageSecondsRef.current = stageSeconds;
  usePresenceTracker({ userId, username, stage: 1 });

  const question = QUESTIONS[round.qIndex];
  const isLast = round.qIndex === QUESTIONS.length - 1;

  // Warm the sprite cache during the intro so the playfield pops in complete.
  useEffect(() => {
    ['/chang1/answer-card.webp', '/game/ca-thoi-gian.webp', '/chang1/tao-cham-hoi.webp'].forEach(
      (src) => {
        const img = new window.Image();
        img.src = src;
      },
    );
  }, []);

  // Record the run once on victory (picks + this stage's active play time).
  useEffect(() => {
    if (phase === 'victory' && !submittedRef.current) {
      submittedRef.current = true;
      submit.mutate({ picks: picksRef.current, playSeconds: stageSecondsRef.current });
    }
  }, [phase, submit]);

  // qIndex is always within QUESTIONS; this narrows the strict indexed access.
  if (!question) return null;

  const handlePick = (optIdx: number) => {
    const option = question.options[optIdx];
    if (feedback || !option) return;
    if (optIdx === question.correctIndex) {
      picksRef.current[question.ord] = optIdx;
      void fireConfetti();
      setFeedback({ kind: 'correct', explanation: question.explanation, isLast });
    } else {
      setRound((r) => ({ ...r, wrong: [...r.wrong, optIdx] }));
      setFeedback({ kind: 'wrong', optionText: option.text, reason: option.reason });
    }
  };

  const handleModalClose = () => {
    if (feedback?.kind === 'correct') {
      if (isLast) setPhase('victory');
      else setRound((r) => ({ qIndex: r.qIndex + 1, order: shuffledIndices(6), wrong: [] }));
    }
    setFeedback(null);
  };

  const saveState: SaveState =
    submit.isPending || submit.isIdle ? 'saving' : submit.data === true ? 'saved' : 'failed';

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#4aa8ff]">
      <Image
        src="/home/background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="absolute inset-0 overflow-y-auto"
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <StoryIntro onStart={() => setPhase('playing')} />
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div
            key="playing"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Hanging answer cards drifting across the sky */}
            <CardMarquee
              question={question}
              order={round.order}
              wrong={round.wrong}
              paused={feedback !== null}
              onPick={handlePick}
            />

            {/* Question sheet */}
            <div className="relative z-20 mt-[1.5vh] px-3 sm:px-6">
              <QuestionPanel
                question={question}
                solvedCount={round.qIndex + (feedback?.kind === 'correct' ? 1 : 0)}
                total={QUESTIONS.length}
              />
            </div>

            {/* Fish clock */}
            <div className="absolute bottom-2 left-2 z-20 w-[clamp(115px,15vw,200px)] sm:bottom-4 sm:left-4">
              <FishTimer seconds={elapsed} />
            </div>

            {/* The flustered Táo, still searching */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 w-[clamp(105px,13vw,190px)] -translate-x-1/2">
              <motion.img
                src="/chang1/tao-cham-hoi.webp"
                alt=""
                draggable={false}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="h-auto w-full drop-shadow-[0_10px_14px_rgba(10,60,120,0.3)]"
              />
            </div>

            {/* Back to the map */}
            <Link
              href="/map"
              className="absolute bottom-3 right-3 z-20 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-md backdrop-blur transition hover:bg-white sm:bottom-4 sm:right-4"
            >
              🗺️ Bản đồ
            </Link>
          </motion.div>
        )}

        {phase === 'victory' && (
          <motion.div
            key="victory"
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <VictoryScreen elapsed={elapsed} saveState={saveState} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && <FeedbackModal feedback={feedback} onClose={handleModalClose} />}
      </AnimatePresence>
    </main>
  );
}
