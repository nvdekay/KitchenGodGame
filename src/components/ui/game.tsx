'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type HTMLMotionProps } from 'motion/react';
import { fireConfetti } from '@/lib/confetti';
import { cn } from '@/utils/cn';

/** Server-save status shared by every stage victory screen. */
export type SaveState = 'saving' | 'saved' | 'failed';

/** One place for the save-status line; only the "saved" sentence differs per stage. */
export function saveStatusText(state: SaveState, savedMessage: string): string {
  if (state === 'saving') return 'Đang lưu tiến độ…';
  if (state === 'saved') return savedMessage;
  return '⚠ Chưa lưu được tiến độ lên máy chủ.';
}

/**
 * Shared surfaces for the per-stage games (chặng 1, 2, …): the cream parchment
 * panel, the golden CTA, and the fish clock. Pure CSS + one shared sprite so
 * every stage feels like the same world. Lives in components/ui because it is
 * reused across game features (features must not import from each other).
 */

/** Cream "báo cáo" parchment panel — question sheets, modals, story & victory cards. */
export function Parchment({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative rounded-3xl border-[3px] border-[#dfb168] bg-[#fdf7e7] shadow-[0_16px_40px_rgba(21,78,150,0.28)]',
        className,
      )}
    >
      {/* inner hairline, like the mockups' double border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-1.5 rounded-[18px] border-2 border-[#eedbab]/70"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Big golden game CTA. `loading` swaps in a spinning koi-gold ring, keeps the
 * label visible and disables the button — feedback for async actions
 * (navigation, saving) without the layout jumping.
 */
export function GoldButton({
  className,
  children,
  loading = false,
  disabled,
  ...props
}: Omit<HTMLMotionProps<'button'>, 'children'> & {
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileHover={loading ? undefined : { scale: 1.05 }}
      whileTap={loading ? undefined : { scale: 0.93 }}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'rounded-full border-2 border-amber-200/80 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500',
        'px-8 py-3 text-base font-extrabold text-amber-950 shadow-[0_8px_20px_rgba(180,120,0,0.4)]',
        'outline-none transition-[filter] hover:brightness-105 focus-visible:ring-4 focus-visible:ring-amber-300/60',
        'disabled:cursor-not-allowed',
        loading && 'brightness-95',
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading && (
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-900/25 border-t-amber-900"
          />
        )}
        {children}
      </span>
    </motion.button>
  );
}

// The three Táo who take turns hopping in the shared loader.
const LOADER_TAO = ['/home/taodo.webp', '/home/taocam.webp', '/home/taoxanhla.webp'] as const;

/**
 * Game-styled loader: three Táo hopping out of phase (same idle bounce as the
 * splash) above a golden pill label with a trailing animated ellipsis. Drop it
 * inline wherever a plain spinner would break the world.
 */
export function TaoLoader({ label = 'Đang tải' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col items-center gap-4">
      <div className="flex items-end gap-3">
        {LOADER_TAO.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            aria-hidden
            draggable={false}
            className="h-auto w-12 drop-shadow-[0_10px_12px_rgba(0,60,120,0.3)] sm:w-14"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
          />
        ))}
      </div>
      <p
        className={cn(
          'rounded-full border-2 border-amber-200/80 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500',
          'px-6 py-2 text-sm font-extrabold text-amber-950 shadow-[0_8px_20px_rgba(180,120,0,0.35)]',
        )}
      >
        {label}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          >
            .
          </motion.span>
        ))}
      </p>
    </div>
  );
}

/**
 * Full-screen game loader: frosted sky veil + TaoLoader, above everything.
 * Shown between click and route change so every navigation answers instantly.
 */
export function GameLoadingOverlay({ label }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-sky-200/45 backdrop-blur-[3px]"
    >
      <TaoLoader label={label} />
    </motion.div>
  );
}

/**
 * Golden "Thời gian" fish with the elapsed run time inside its white box
 * (measured region of /game/ca-thoi-gian.webp: L12.9 T33.6 R79.3 B71.6 %).
 * The parent supplies size/position via a wrapping element. The wrapper is a
 * CSS size container so the digits scale with the FISH (cqw), never the
 * viewport — no overflow whether the fish renders at 84px or 200px, and the
 * font steps down for runs past 99 minutes.
 */
export function FishTimer({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const time = `${mm}:${ss}`;

  return (
    <motion.div
      className="relative"
      style={{ containerType: 'inline-size' }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.img
        src="/game/ca-thoi-gian.webp"
        alt=""
        draggable={false}
        className="h-auto w-full drop-shadow-[0_8px_12px_rgba(10,60,120,0.3)]"
      />
      <span
        className="absolute flex items-center justify-center font-black tabular-nums leading-none text-amber-900"
        style={{
          left: '14%',
          right: '22%',
          top: '36%',
          bottom: '31%',
          fontSize: `clamp(10px, ${time.length > 5 ? 14 : 17}cqw, 30px)`,
        }}
        aria-label={`Thời gian: ${mm} phút ${ss} giây`}
      >
        {time}
      </span>
    </motion.div>
  );
}

/**
 * Read-lock countdown shared by the feedback/reveal modals: ticks `seconds`→0
 * once per second. `locked` is true until it reaches 0. Mounts fresh per modal.
 */
export function useReadLock(seconds: number) {
  const [lockLeft, setLockLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLockLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  return { lockLeft, locked: lockLeft > 0 };
}

/**
 * Accessible modal shell for the game's locked pop-ups (feedback, reveal). A
 * real dialog: `role="dialog"` + `aria-modal`, moves focus in on open and
 * restores it on close, traps Tab within, and closes on Escape / backdrop click
 * ONLY when `dismissible` (i.e. the read-lock has elapsed and dismissal is
 * allowed for this variant). Keeps the same backdrop + spring pop so
 * AnimatePresence exit still plays. `announce` is spoken via an aria-live region
 * so screen-reader users hear the lock start and release without per-second spam.
 */
export function LockedModal({
  dismissible,
  onDismiss,
  labelledById,
  announce,
  children,
}: {
  dismissible: boolean;
  onDismiss: () => void;
  labelledById?: string;
  announce?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the dialog on open; restore focus to the trigger on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus?.();
  }, []);

  // Escape closes (when allowed); Tab is trapped within the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dismissible) onDismiss();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) {
        e.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismissible, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={dismissible ? onDismiss : undefined}
      className="fixed inset-0 z-50 grid place-items-center bg-sky-950/40 p-4 backdrop-blur-[3px]"
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        tabIndex={-1}
        initial={{ scale: 0.7, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md outline-none"
      >
        {announce !== undefined && (
          <span className="sr-only" role="status" aria-live="polite">
            {announce}
          </span>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Save-status line for the victory screens: the status text, plus a "Thử lưu
 * lại" retry when the save failed — so a transient network error doesn't force
 * the player to replay the whole stage (completion is server-authoritative).
 */
export function SaveStatusLine({
  saveState,
  savedMessage,
  onRetry,
}: {
  saveState: SaveState;
  savedMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-1 flex flex-col items-center gap-1.5">
      <p
        className={cn(
          'text-xs',
          saveState === 'failed' ? 'font-semibold text-red-600' : 'text-neutral-500',
        )}
      >
        {saveStatusText(saveState, savedMessage)}
      </p>
      {saveState === 'failed' && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm outline-none transition hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          🔁 Thử lưu lại
        </button>
      )}
    </div>
  );
}

/**
 * Shared victory reveal for the mid-journey stages (chặng 1 & 2): confetti, the
 * glowing Táo, the unlocked identity, the period intro, a run-stats line, the
 * save status (with retry), and the "Về bản đồ" button. Chặng 3's finale screen
 * is bespoke (keyword stamp + KẾT THÚC) and stays separate.
 */
export function StageVictory({
  period,
  heading,
  taoImg,
  taoName,
  taoAlt,
  unlockLabel,
  intro,
  timeSeconds,
  statsSuffix,
  saveState,
  savedMessage,
  onRetry,
}: {
  period: string;
  heading: string;
  taoImg: string;
  taoName: string;
  taoAlt: string;
  unlockLabel: string;
  intro: string;
  timeSeconds: number;
  /** Appended after the time, e.g. " · 🔄 12 lượt lật". */
  statsSuffix?: string;
  saveState: SaveState;
  savedMessage: string;
  onRetry: () => void;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const mm = String(Math.floor(timeSeconds / 60)).padStart(2, '0');
  const ss = String(timeSeconds % 60).padStart(2, '0');

  useEffect(() => {
    void fireConfetti(true);
  }, []);

  return (
    <div className="relative z-10 flex min-h-full items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg">
        <Parchment className="px-6 py-7 text-center sm:px-10">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black tracking-[0.28em] text-amber-600"
          >
            🎉 {period}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
            className="text-[clamp(24px,3.6vw,40px)] font-black text-green-700"
          >
            {heading}
          </motion.h1>

          {/* Glowing Táo reveal */}
          <div className="relative mx-auto mt-3 h-[clamp(140px,22vh,220px)] w-[clamp(140px,22vh,220px)]">
            <motion.div
              aria-hidden
              className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(255,214,90,0.85),rgba(255,214,90,0)_70%)]"
              animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src={taoImg}
              alt={taoAlt}
              draggable={false}
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 14 }}
              className="relative h-full w-full object-contain drop-shadow-[0_14px_20px_rgba(120,60,0,0.35)]"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-1 text-xs font-bold uppercase tracking-widest text-amber-700"
          >
            {unlockLabel}
          </motion.p>
          <motion.h2
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.85, type: 'spring', stiffness: 240, damping: 15 }}
            className="bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-[clamp(28px,4.5vw,44px)] font-black text-transparent"
          >
            {taoName}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-3 rounded-2xl bg-amber-100/70 px-4 py-3 text-left text-sm leading-relaxed text-amber-950 sm:text-[15px]"
          >
            {intro}
          </motion.p>

          <p className="mt-3 text-sm font-bold text-sky-800">
            ⏱ Tổng thời gian chơi: {mm}:{ss}
            {statsSuffix}
          </p>
          <SaveStatusLine saveState={saveState} savedMessage={savedMessage} onRetry={onRetry} />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <GoldButton
              loading={leaving}
              onClick={() => {
                setLeaving(true);
                router.push('/map');
              }}
            >
              Về bản đồ 🗺️
            </GoldButton>
          </div>
        </Parchment>
      </div>
    </div>
  );
}
