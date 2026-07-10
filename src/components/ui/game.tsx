'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/utils/cn';

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
