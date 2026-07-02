'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { usePresenceTracker } from '@/features/presence';
import { useRunClock } from '@/features/quiz';
import { fireConfetti } from '@/lib/confetti';
import { FishTimer } from '@/components/ui/game';
import { FINALE, PUZZLE } from '../data';
import { useChang3Sync } from '../hooks/useChang3Sync';
import { PuzzleBoard } from './PuzzleBoard';
import { KeywordPanel } from './KeywordPanel';
import { StoryIntro } from './StoryIntro';
import { VictoryScreen, type SaveState } from './VictoryScreen';
import { GrandFinale } from './GrandFinale';

export type Chang3Phase = 'intro' | 'puzzle' | 'keyword' | 'victory' | 'finale';

/**
 * Chặng 3 — "Khôi phục báo cáo". The journey's finale in five phases:
 *
 *   intro   → story scroll beside drifting picture pieces
 *   puzzle  → reassemble the shattered illustration (drag & drop, corners
 *             pre-anchored, swap to fix wrong placements)
 *   keyword → guess the era's key phrase from the restored picture
 *             (diacritic-insensitive, no hints)
 *   victory → confetti + "Táo Tinh Gọn" reveal. Submitting the stage-3 marker
 *             also stamps quiz_runs.finished_at — freezing the whole-journey
 *             clock and entering the player into the admin leaderboard.
 *             Its KẾT THÚC button closes the game →
 *   finale  → the grand celebration composed from /public/end: banner scroll,
 *             five Táo riding koi, confetti volleys, final journey time.
 *
 * `initialPhase` is a dev/testing seam (e.g. screenshot a specific phase).
 */
export function Chang3Game({
  userId,
  username,
  initialPhase = 'intro',
}: {
  userId: string;
  username: string;
  initialPhase?: Chang3Phase;
}) {
  const [phase, setPhase] = useState<Chang3Phase>(initialPhase);
  /** Remounts PuzzleBoard/KeywordPanel with fresh state on replay. */
  const [runKey, setRunKey] = useState(0);
  const submittedRef = useRef(false);

  const { submit } = useChang3Sync(userId);
  // Whole-journey clock (chặng 1 → 3); freezes at finished_at once submitted.
  const elapsed = useRunClock(userId);
  usePresenceTracker({ userId, username, stage: 3 });

  // Warm the two images during the intro.
  useEffect(() => {
    ['/chang2/board-bg.webp', PUZZLE.img].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Warm the finale layers while the player reads the victory screen.
  useEffect(() => {
    if (phase !== 'victory') return;
    [FINALE.banner, ...FINALE.riders].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [phase]);

  // Record the run once on victory.
  useEffect(() => {
    if (phase === 'victory' && !submittedRef.current) {
      submittedRef.current = true;
      submit.mutate();
    }
  }, [phase, submit]);

  const handleKeywordSolved = () => {
    void fireConfetti();
    setPhase('victory');
  };

  const handleReplay = () => {
    submittedRef.current = false;
    setRunKey((k) => k + 1);
    setPhase('puzzle');
  };

  const saveState: SaveState =
    submit.isPending || submit.isIdle ? 'saving' : submit.data === true ? 'saved' : 'failed';

  const inGame = phase === 'puzzle' || phase === 'keyword';

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#4aa8ff]">
      {/* Bright sky board (shared asset from chặng 2, per the one-source rule) */}
      <Image
        src="/chang2/board-bg.webp"
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
            <StoryIntro onStart={() => setPhase('puzzle')} />
          </motion.div>
        )}

        {inGame && (
          <motion.div
            key={`game-${runKey}`}
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* HUD */}
            <div className="relative z-20 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-3 pt-2 landscape:justify-between landscape:px-5">
              <div className="flex items-center gap-2">
                <Link
                  href="/map"
                  className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-sky-700 shadow backdrop-blur transition hover:bg-white sm:text-sm"
                >
                  🗺️ Bản đồ
                </Link>
                <span className="rounded-full bg-amber-100/90 px-3 py-1.5 text-[11px] font-black tracking-wide text-amber-800 shadow sm:text-xs">
                  CHẶNG 3 · {phase === 'puzzle' ? '🧩 GHÉP HÌNH' : '🔤 ĐOÁN TỪ KHÓA'}
                </span>
              </div>
              <div className="w-[84px] sm:w-[100px]">
                <FishTimer seconds={elapsed} />
              </div>
            </div>

            {/* Stage area — m-auto centres when it fits; scrolls on short screens
                (the width floor keeps the board draggable instead of dust-sized). */}
            <div className="relative z-10 flex flex-1 overflow-y-auto px-3 pb-4 pt-2 sm:px-5">
              <AnimatePresence mode="wait">
                {phase === 'puzzle' ? (
                  <motion.div
                    key="puzzle"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                    className="m-auto w-[min(100%,54rem,calc(max(100dvh_-_16rem,24rem)*1.508))]"
                  >
                    <PuzzleBoard onComplete={() => setPhase('keyword')} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="keyword"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="m-auto w-full"
                  >
                    <KeywordPanel onSolved={handleKeywordSolved} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {phase === 'victory' && (
          <motion.div
            key="victory"
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <VictoryScreen
              elapsed={elapsed}
              saveState={saveState}
              onReplay={handleReplay}
              onFinish={() => setPhase('finale')}
            />
          </motion.div>
        )}

        {phase === 'finale' && (
          <motion.div
            key="finale"
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <GrandFinale elapsed={elapsed} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
