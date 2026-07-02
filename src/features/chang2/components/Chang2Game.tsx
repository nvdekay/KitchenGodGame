'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { usePresenceTracker } from '@/features/presence';
import { fireConfetti } from '@/lib/confetti';
import { FishTimer } from '@/components/ui/game';
import { cn } from '@/utils/cn';
import { shuffle } from '@/utils/shuffle';
import { MEMES, PAIRS } from '../data';
import { useChang2Sync } from '../hooks/useChang2Sync';
import { MemoryBoard } from './MemoryBoard';
import { RevealModal, type Reveal } from './RevealModal';
import { StoryIntro } from './StoryIntro';
import { VictoryScreen, type SaveState } from './VictoryScreen';

export type Chang2Phase = 'intro' | 'playing' | 'victory';

/** One card on the board: two per pair + one per meme, shuffled each run. */
export interface BoardCard {
  key: string;
  kind: 'pair' | 'meme';
  refId: string;
}

function buildBoard(): BoardCard[] {
  const cards: BoardCard[] = [
    ...PAIRS.flatMap((p): BoardCard[] => [
      { key: `${p.id}-a`, kind: 'pair', refId: p.id },
      { key: `${p.id}-b`, kind: 'pair', refId: p.id },
    ]),
    ...MEMES.map((m): BoardCard => ({ key: `meme-${m.id}`, kind: 'meme', refId: m.id })),
  ];
  return shuffle(cards);
}

/**
 * Chặng 2 — "Báo cáo bị xáo trộn". A memory-match run in three phases:
 *
 *   intro   → story scroll beside a fan of face-down cards
 *   playing → a 21-card board (8 document pairs + 5 meme traps). Flip two
 *             cards a turn: a matched pair stays up, stamps a seal and opens
 *             its educational pop-up; a mismatch flips back; a meme opens the
 *             trap pop-up and flips back. Fish clock counts the run up.
 *   victory → confetti + "Táo Cải Cách" reveal; completion is recorded via the
 *             stage-2 marker question so the map unlocks chặng 3 and the admin
 *             dashboard updates in realtime.
 *
 * `initialPhase` is a dev/testing seam (e.g. screenshot a specific phase).
 */
export function Chang2Game({
  userId,
  username,
  initialPhase = 'intro',
}: {
  userId: string;
  username: string;
  initialPhase?: Chang2Phase;
}) {
  const [phase, setPhase] = useState<Chang2Phase>(initialPhase);
  const [board, setBoard] = useState<BoardCard[]>(buildBoard);
  const [faceUp, setFaceUp] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  const { submit } = useChang2Sync(userId);
  usePresenceTracker({ userId, username, stage: 2 });

  // Warm every card image during the intro so flips reveal instantly.
  useEffect(() => {
    const sources = [
      '/chang2/board-bg.webp',
      '/chang2/card-back.webp',
      ...PAIRS.map((p) => p.img),
      ...MEMES.map((m) => m.img),
    ];
    sources.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Run clock.
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Record the run once on victory.
  useEffect(() => {
    if (phase === 'victory' && !submittedRef.current) {
      submittedRef.current = true;
      submit.mutate();
    }
  }, [phase, submit]);

  // Never leave a resolution timer running after unmount.
  useEffect(() => () => clearTimeout(timeoutRef.current ?? undefined), []);

  const schedule = useCallback((ms: number, fn: () => void) => {
    timeoutRef.current = setTimeout(fn, ms);
  }, []);

  const handleFlip = (card: BoardCard) => {
    if (busy || reveal || phase !== 'playing' || faceUp.includes(card.key)) return;

    if (card.kind === 'meme') {
      const meme = MEMES.find((m) => m.id === card.refId);
      if (!meme) return;
      setFaceUp((f) => [...f, card.key]);
      setBusy(true);
      setMoves((m) => m + 1);
      // Let the flip finish before springing the trap.
      schedule(700, () => setReveal({ type: 'meme', meme }));
      return;
    }

    const openKey = faceUp.find((k) => board.find((b) => b.key === k)?.kind === 'pair');
    setFaceUp((f) => [...f, card.key]);
    if (!openKey) return; // first card of the turn — wait for the second

    setBusy(true);
    setMoves((m) => m + 1);
    const openCard = board.find((b) => b.key === openKey);

    if (openCard && openCard.refId === card.refId) {
      const pair = PAIRS.find((p) => p.id === card.refId);
      schedule(700, () => {
        setMatched((m) => [...m, card.refId]);
        setFaceUp([]);
        if (pair) {
          void fireConfetti();
          setReveal({ type: 'pair', pair });
        }
      });
    } else {
      schedule(950, () => {
        setFaceUp([]);
        setBusy(false);
      });
    }
  };

  const handleRevealClose = () => {
    if (reveal?.type === 'meme') {
      // The trap card flips back down.
      setFaceUp((f) => f.filter((k) => board.find((b) => b.key === k)?.kind === 'pair'));
    }
    setReveal(null);
    setBusy(false);
    if (matched.length === PAIRS.length) schedule(350, () => setPhase('victory'));
  };

  const handleReplay = () => {
    clearTimeout(timeoutRef.current ?? undefined);
    submittedRef.current = false;
    setBoard(buildBoard());
    setFaceUp([]);
    setMatched([]);
    setReveal(null);
    setBusy(false);
    setMoves(0);
    setElapsed(0);
    setPhase('playing');
  };

  const saveState: SaveState =
    submit.isPending || submit.isIdle ? 'saving' : submit.data === true ? 'saved' : 'failed';

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#4aa8ff]">
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
            <StoryIntro onStart={() => setPhase('playing')} />
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div
            key="playing"
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
                  CHẶNG 2 · BÁO CÁO BỊ XÁO TRỘN
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Pair seals */}
                <span
                  className="flex items-center gap-1"
                  aria-label={`Đã ghép ${matched.length}/${PAIRS.length} cặp`}
                >
                  {PAIRS.map((p) => (
                    <motion.span
                      key={p.id}
                      animate={matched.includes(p.id) ? { scale: [1.8, 1], rotate: [-14, 0] } : {}}
                      className={cn(
                        'grid h-4 w-4 place-items-center rounded-full border-2 text-[8px] font-black sm:h-5 sm:w-5 sm:text-[10px]',
                        matched.includes(p.id)
                          ? 'border-red-500 bg-red-500 text-white shadow'
                          : 'border-amber-300/90 bg-amber-100/70 text-transparent',
                      )}
                    >
                      ✓
                    </motion.span>
                  ))}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold text-sky-800 shadow backdrop-blur sm:text-xs">
                  🔄 {moves} lượt
                </span>
                <div className="w-[84px] sm:w-[100px]">
                  <FishTimer seconds={elapsed} />
                </div>
              </div>
            </div>

            {/* Board */}
            <div className="relative z-10 flex-1 overflow-y-auto landscape:flex landscape:items-center landscape:justify-center landscape:overflow-visible">
              <MemoryBoard
                board={board}
                faceUp={faceUp}
                matched={matched}
                busy={busy}
                onFlip={handleFlip}
              />
            </div>
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
            <VictoryScreen
              elapsed={elapsed}
              moves={moves}
              saveState={saveState}
              onReplay={handleReplay}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reveal && <RevealModal reveal={reveal} onClose={handleRevealClose} />}
      </AnimatePresence>
    </main>
  );
}
