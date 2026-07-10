'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { FishTimer, GameLoadingOverlay, TaoLoader } from '@/components/ui/game';
import { cn } from '@/utils/cn';
import type { StageStatus } from '@/features/quiz';

/**
 * Presentational stage-select map (no data fetching — see GameMap for that).
 *
 * Reuses the sky background and composites up to three stages (the Táo from
 * /public/home) over it, each with a padlock badge:
 *   • completed stage → open padlock (unlock.webp)
 *   • not-yet-cleared → closed padlock (lock.webp)
 * Golden arrows (map/right.webp) mark the forward progression 1 → 2 → 3.
 * Only *unlocked, not-yet-completed* stages are interactive; locked ones are
 * dimmed and can't be entered. Layout switches between a landscape row and a
 * portrait column purely via CSS orientation variants.
 */

// Per-stage art + position. `cls` = portrait (base) layout + `landscape:` override.
const STAGE_LAYOUT: Record<number, { tao: string; cls: string; delay: number }> = {
  1: {
    tao: '/home/taodo.webp',
    cls: 'left-1/2 top-[20%] w-[27%] landscape:left-[18%] landscape:top-[60%] landscape:w-[15%]',
    delay: 0,
  },
  2: {
    tao: '/home/taocam.webp',
    cls: 'left-1/2 top-[50%] w-[27%] landscape:left-1/2 landscape:top-[60%] landscape:w-[15%]',
    delay: 0.15,
  },
  3: {
    tao: '/home/taoxanhla.webp',
    cls: 'left-1/2 top-[80%] w-[27%] landscape:left-[82%] landscape:top-[60%] landscape:w-[15%]',
    delay: 0.3,
  },
};

// Directional arrows (landscape only) — both point right, showing the forward
// progression 1 → 2 → 3 (one between each pair of stages).
const ARROWS = [
  { id: '1-2', src: '/map/right.webp', cls: 'left-[34%] top-[57%] w-[13%]', x: [-3, 5], delay: 0 },
  { id: '2-3', src: '/map/right.webp', cls: 'left-[66%] top-[57%] w-[13%]', x: [-3, 5], delay: 0.4 },
] as const;

export function MapView({
  stages,
  loading = false,
  elapsedSeconds = 0,
  enteringOrd = null,
  onSelect,
}: {
  stages: StageStatus[];
  loading?: boolean;
  /** Whole-journey clock (0 until the player has opened chặng 1). */
  elapsedSeconds?: number;
  /** Stage being navigated to — locks the map and shows an entering overlay. */
  enteringOrd?: number | null;
  onSelect: (ord: number) => void;
}) {
  const [leavingHome, setLeavingHome] = useState(false);
  const entering = enteringOrd !== null;
  const mapStages = stages.filter((s) => s.ord <= 3).sort((a, b) => a.ord - b.ord);
  const doneCount = mapStages.filter((s) => s.completed).length;

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#4aa8ff]">
      <Image src="/home/background.webp" alt="" fill priority sizes="100vw" className="object-cover" />

      {/* Back to landing */}
      <Link
        href="/"
        onClick={() => setLeavingHome(true)}
        className="absolute left-4 top-4 z-20 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        ← Trang chủ
      </Link>

      {/* Journey progress */}
      {!loading && mapStages.length > 0 && (
        <span className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-amber-100/90 px-4 py-2 text-xs font-black tracking-wide text-amber-800 shadow-md backdrop-blur sm:text-sm">
          🏁 {doneCount}/{mapStages.length} chặng
        </span>
      )}

      {/* Journey clock — appears once the run has started */}
      {elapsedSeconds > 0 && (
        <div className="absolute right-3 top-3 z-20 w-[clamp(88px,10vw,130px)] sm:right-4">
          <FishTimer seconds={elapsedSeconds} />
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <TaoLoader label="Đang tải bản đồ" />
        </div>
      )}

      {/* Instant feedback while the stage route loads — also blocks re-taps */}
      {entering && <GameLoadingOverlay label={`Đang vào Chặng ${enteringOrd}`} />}
      {leavingHome && !entering && <GameLoadingOverlay label="Đang về trang chủ" />}

      {/* Centred, viewport-fitted stage — 9:16 portrait, 16:9 landscape */}
      <div className="absolute left-1/2 top-1/2 aspect-[9/16] w-[min(100vw,calc(100dvh*9/16))] -translate-x-1/2 -translate-y-1/2 landscape:aspect-[16/9] landscape:w-[min(100vw,calc(100dvh*16/9))]">
        {/* Directional arrows (landscape only) */}
        {!loading &&
          mapStages.length > 0 &&
          ARROWS.map((a) => (
            <div
              key={a.id}
              className={cn('absolute hidden -translate-x-1/2 -translate-y-1/2 landscape:block', a.cls)}
            >
              <motion.img
                src={a.src}
                alt=""
                aria-hidden
                className="h-auto w-full drop-shadow-[0_6px_10px_rgba(0,60,120,0.25)]"
                animate={{ x: [...a.x] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: a.delay }}
              />
            </div>
          ))}

        {/* The three stages — each is played exactly ONCE: completed stages
            show the open padlock but are no longer clickable. */}
        {mapStages.map((s) => {
          const layout = STAGE_LAYOUT[s.ord];
          if (!layout) return null;
          const playable = s.unlocked && !s.completed;
          const badge = s.completed ? '/map/unlock.webp' : '/map/lock.webp';
          // "Chặng 1: Hồ sơ thất lạc" → big "Chặng 1" + small subtitle line.
          const [titleMain, titleSub] = s.title.split(/:\s*/);

          return (
            <div key={s.ord} className={cn('absolute -translate-x-1/2 -translate-y-1/2', layout.cls)}>
              <button
                type="button"
                disabled={!playable || entering}
                onClick={() => playable && onSelect(s.ord)}
                aria-label={`${s.title}${s.completed ? ' — đã hoàn thành' : s.unlocked ? '' : ' — chưa mở khoá'}`}
                className={cn(
                  'group relative block w-full',
                  playable ? 'cursor-pointer' : s.completed ? 'cursor-default' : 'cursor-not-allowed',
                )}
              >
                {/* Padlock badge over the Táo's head */}
                <motion.img
                  src={badge}
                  alt=""
                  aria-hidden
                  className="absolute left-1/2 top-[-16%] z-10 w-[34%] -translate-x-1/2 drop-shadow-[0_6px_8px_rgba(0,60,120,0.3)]"
                />
                <motion.img
                  src={layout.tao}
                  alt=""
                  aria-hidden
                  className={cn(
                    'h-auto w-full drop-shadow-[0_12px_14px_rgba(0,70,140,0.28)] transition',
                    playable && 'group-hover:brightness-105',
                    !s.unlocked && 'opacity-70 brightness-90 grayscale-[0.85]',
                  )}
                  whileHover={playable ? { scale: 1.06 } : undefined}
                  whileTap={playable ? { scale: 0.92 } : undefined}
                  {...(s.unlocked
                    ? {
                        animate: { y: ['0%', '-7%', '0%'] },
                        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: layout.delay },
                      }
                    : {})}
                />
              </button>

              {/* Stage label */}
              <p className="mt-1 text-center text-sm font-bold text-sky-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] sm:text-base landscape:mt-2">
                {titleMain}
              </p>
              {titleSub && (
                <p className="text-center text-[11px] font-semibold text-sky-800/90 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] sm:text-xs">
                  {titleSub}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
