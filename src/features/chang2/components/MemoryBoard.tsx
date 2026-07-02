'use client';

import { FlipCard } from './FlipCard';
import type { BoardCard } from './Chang2Game';
import { PAIRS, MEMES } from '../data';

const pairById = new Map(PAIRS.map((p) => [p.id, p]));
const memeById = new Map(MEMES.map((m) => [m.id, m]));

/**
 * The 21-card grid (8 pairs + 5 memes): 7×3 in landscape (all visible),
 * 3×7 in portrait (the page area scrolls). Width is height-capped in
 * landscape so three rows always fit above the HUD.
 */
export function MemoryBoard({
  board,
  faceUp,
  matched,
  busy,
  onFlip,
}: {
  board: BoardCard[];
  faceUp: string[];
  matched: string[];
  busy: boolean;
  onFlip: (card: BoardCard) => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2 px-3 pb-24 pt-2 sm:gap-3 landscape:max-w-none landscape:w-[min(94vw,72rem,calc((100dvh-13rem)*1.45))] landscape:grid-cols-7 landscape:pb-2">
      {board.map((card, i) => {
        const img =
          card.kind === 'pair' ? pairById.get(card.refId)?.img : memeById.get(card.refId)?.img;
        const alt =
          card.kind === 'pair'
            ? (pairById.get(card.refId)?.title ?? '')
            : (memeById.get(card.refId)?.caption ?? '');
        if (!img) return null;
        return (
          <FlipCard
            key={card.key}
            img={img}
            alt={alt}
            faceUp={faceUp.includes(card.key)}
            matched={card.kind === 'pair' && matched.includes(card.refId)}
            disabled={busy}
            entranceDelay={i * 0.035}
            onFlip={() => onFlip(card)}
          />
        );
      })}
    </div>
  );
}
