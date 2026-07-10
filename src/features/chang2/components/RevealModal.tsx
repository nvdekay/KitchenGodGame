'use client';

import { motion } from 'motion/react';
import { cn } from '@/utils/cn';
import { GoldButton, LockedModal, Parchment, useReadLock } from '@/components/ui/game';
import type { MemeDef, PairDef } from '../data';

export type Reveal = { type: 'pair'; pair: PairDef } | { type: 'meme'; meme: MemeDef };

/**
 * Post-flip pop-up, with a read-lock so it can't be clicked through:
 *   • matched pair → educational card, locked 10s while the clock is PAUSED
 *     by the parent (reading the payload is free time).
 *   • meme trap    → locked a full 6s "stun" while the clock KEEPS RUNNING —
 *     that wasted time is the whole punishment.
 * The board is frozen underneath; the CTA counts the lock down and only then
 * becomes pressable (the backdrop never dismisses while locked).
 */
const LOCK_SECONDS = { pair: 10, meme: 6 } as const;

export function RevealModal({ reveal, onClose }: { reveal: Reveal; onClose: () => void }) {
  const isPair = reveal.type === 'pair';

  const { lockLeft, locked } = useReadLock(LOCK_SECONDS[reveal.type]);
  // A matched pair continues only via the CTA; a meme trap can also be dismissed
  // by backdrop/Escape once the stun elapses.
  const dismissible = !isPair && !locked;
  const announce = locked
    ? isPair
      ? 'Đang mở nội dung trang báo cáo, hãy đọc kỹ.'
      : 'Bị choáng vì thẻ meme, chờ một lát.'
    : 'Đã có thể tiếp tục.';

  return (
    <LockedModal
      dismissible={dismissible}
      onDismiss={onClose}
      labelledById="chang2-reveal-title"
      announce={announce}
    >
      <Parchment className="px-5 py-5 text-center sm:px-7 sm:py-6">
        {isPair ? (
          <>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 14 }}
              className="text-4xl"
            >
              📑✨
            </motion.p>
            <h3
              id="chang2-reveal-title"
              className="mt-1 text-lg font-black text-green-700 sm:text-xl"
            >
              Ghép được một trang báo cáo!
            </h3>
            <motion.img
              src={reveal.pair.img}
              alt={reveal.pair.title}
              draggable={false}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mx-auto mt-3 max-h-[32vh] w-auto rounded-xl border-2 border-amber-200 object-contain shadow-md"
            />
            <h4 className="mt-3 text-base font-extrabold text-amber-900 sm:text-lg">
              {reveal.pair.title}
            </h4>
            <p className="mt-2 rounded-2xl bg-amber-100/70 px-4 py-3 text-left text-sm font-medium leading-relaxed text-amber-950 sm:text-[15px]">
              💡 {reveal.pair.content}
            </p>
            <p className="mt-2 text-xs font-semibold text-sky-700">
              ⏸️ Đồng hồ đang tạm dừng, cứ đọc thong thả nhé!
            </p>
            <GoldButton
              onClick={locked ? undefined : onClose}
              disabled={locked}
              className={cn('mt-4', locked && 'opacity-60 saturate-50')}
            >
              {locked ? `📖 Đọc thông điệp… ${lockLeft}s` : 'Tuyệt! Tiếp tục →'}
            </GoldButton>
          </>
        ) : (
          <>
            <motion.p
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 12 }}
              className="text-4xl"
            >
              🙃
            </motion.p>
            <h3
              id="chang2-reveal-title"
              className="mt-1 text-lg font-black text-red-600 sm:text-xl"
            >
              Dính thẻ meme gây nhiễu!
            </h3>
            <motion.img
              src={reveal.meme.img}
              alt={reveal.meme.caption}
              draggable={false}
              initial={{ scale: 0.8, rotate: -4, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 240, damping: 16 }}
              className="mx-auto mt-3 max-h-[30vh] w-auto rounded-xl border-2 border-red-200 object-contain shadow-md"
            />
            <p className="mt-3 text-base font-extrabold text-amber-900">“{reveal.meme.caption}”</p>
            <p className="mt-1 text-sm text-neutral-600">
              Đây không phải tài liệu báo cáo, lật tiếp thôi!
            </p>
            <p className="mt-1 text-xs font-semibold text-red-500">
              ⏰ Đồng hồ vẫn đang chạy đó nha!
            </p>
            <GoldButton
              onClick={locked ? undefined : onClose}
              disabled={locked}
              className={cn('mt-4', locked && 'opacity-60 saturate-50')}
            >
              {locked ? `😵 Bị choáng… ${lockLeft}s` : 'Lật tiếp 😤'}
            </GoldButton>
          </>
        )}
      </Parchment>
    </LockedModal>
  );
}
