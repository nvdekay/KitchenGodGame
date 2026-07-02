'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, type PanInfo } from 'motion/react';
import { cn } from '@/utils/cn';
import { shuffle } from '@/utils/shuffle';
import { PUZZLE } from '../data';

/** CSS for tile #idx — the illustration is cut virtually via background-position. */
export function tileStyle(idx: number): React.CSSProperties {
  const { img, cols, rows } = PUZZLE;
  const c = idx % cols;
  const r = Math.floor(idx / cols);
  return {
    backgroundImage: `url(${img})`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%`,
  };
}

/** Native aspect ratio of one tile (w/h) as a CSS aspect-ratio string. */
export const TILE_ASPECT = `${PUZZLE.width / PUZZLE.cols} / ${PUZZLE.height / PUZZLE.rows}`;

type Source = { from: 'tray' } | { from: 'cell'; slot: number };

/**
 * The jigsaw, drag-and-drop edition (3 hàng × 7 mảnh = 21 pieces, four corners
 * pre-anchored). DRAG a piece from the tray onto ANY free slot — a wrong slot
 * still accepts it (it just looks off). Fix mistakes by dragging one placed
 * piece onto another to SWAP them, dragging onto a free slot to move, or
 * dropping a tray piece onto an occupied slot (the occupant returns to the
 * tray). Drops outside the board (or on a locked corner) snap back. The board
 * completes when every piece sits in its true cell.
 *
 * Dragging uses transform-only Framer gestures (GPU smooth, touch-friendly via
 * touch-action:none); the drop target is resolved with elementsFromPoint
 * against each cell's data-slot.
 */
export function PuzzleBoard({ onComplete }: { onComplete: () => void }) {
  const { cols, rows } = PUZZLE;
  const total = cols * rows;
  const corners = useMemo(
    () => [0, cols - 1, (rows - 1) * cols, total - 1],
    [cols, rows, total],
  );

  const [game, setGame] = useState(() => ({
    /** cells[slot] = piece index sitting there (right or wrong), or null. */
    cells: Array.from({ length: total }, (_, i): number | null =>
      corners.includes(i) ? i : null,
    ),
    tray: shuffle(Array.from({ length: total }, (_, i) => i).filter((i) => !corners.includes(i))),
  }));
  const [dragging, setDragging] = useState<number | null>(null);

  const done = game.cells.every((piece, slot) => piece === slot);
  const boardFull = game.tray.length === 0;

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onComplete, 1600);
    return () => clearTimeout(t);
  }, [done, onComplete]);

  const dropAt = (piece: number, source: Source, x: number, y: number) => {
    const slotEl = document
      .elementsFromPoint(x, y)
      .find((n): n is HTMLElement => n instanceof HTMLElement && n.dataset.slot !== undefined);
    const target = slotEl ? Number(slotEl.dataset.slot) : null;
    // Outside the board / locked corner / same cell → framer snaps it back.
    if (target === null || corners.includes(target)) return;
    if (source.from === 'cell' && source.slot === target) return;

    setGame((g) => {
      const cells = [...g.cells];
      let tray = [...g.tray];
      const occupant = cells[target] ?? null;
      if (source.from === 'tray') {
        tray = tray.filter((p) => p !== piece);
        if (occupant !== null) tray = [...tray, occupant]; // displaced piece returns
      } else {
        cells[source.slot] = occupant; // swap — or null when the target was free
      }
      cells[target] = piece;
      return { cells, tray };
    });
  };

  const handleDragEnd =
    (piece: number, source: Source) =>
    (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setDragging(null);
      const x = 'clientX' in e ? e.clientX : info.point.x - window.scrollX;
      const y = 'clientY' in e ? e.clientY : info.point.y - window.scrollY;
      dropAt(piece, source, x, y);
    };

  // The board is rounded but NOT overflow-hidden (a dragged piece must fly over
  // its edge), so the four locked corner tiles round themselves to match.
  const cornerRound = (slot: number) =>
    cn(
      slot === 0 && 'rounded-tl-lg',
      slot === cols - 1 && 'rounded-tr-lg',
      slot === (rows - 1) * cols && 'rounded-bl-lg',
      slot === total - 1 && 'rounded-br-lg',
    );

  const renderPiece = (piece: number, source: Source) => (
    <motion.div
      drag={!done}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.12}
      whileDrag={{ scale: 1.08, zIndex: 60, boxShadow: '0 18px 32px rgba(8,40,90,0.45)' }}
      whileHover={!done ? { scale: 1.04 } : undefined}
      onDragStart={() => setDragging(piece)}
      onDragEnd={handleDragEnd(piece, source)}
      initial={{ opacity: 0, scale: 0.65 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      style={{
        ...tileStyle(piece),
        touchAction: 'none',
        ...(source.from === 'tray' ? { aspectRatio: TILE_ASPECT } : {}),
      }}
      className={cn(
        source.from === 'cell'
          ? 'absolute inset-0'
          : 'w-11 shrink-0 rounded-md border-2 border-white/90 shadow-md sm:w-14',
        !done && 'cursor-grab active:cursor-grabbing',
        dragging === piece && 'pointer-events-none',
      )}
      aria-label="Mảnh ghép (kéo và thả)"
    />
  );

  return (
    <div className="flex w-full flex-col items-center">
      {/* Board */}
      <div
        className={cn(
          'relative w-full rounded-xl border-4 shadow-[0_16px_40px_rgba(21,78,150,0.3)] transition-colors duration-700',
          done ? 'border-amber-400' : 'border-[#dfb168] bg-sky-100/40',
        )}
        style={{ aspectRatio: `${PUZZLE.width} / ${PUZZLE.height}` }}
      >
        <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {game.cells.map((piece, slot) => {
            const locked = corners.includes(slot);
            return (
              <div
                key={slot}
                data-slot={slot}
                className={cn(
                  'relative',
                  !done &&
                    piece === null &&
                    'border border-dashed border-sky-400/60 bg-sky-200/25 transition-colors',
                  !done && piece === null && dragging !== null && 'bg-amber-200/50',
                )}
              >
                {piece !== null &&
                  (locked ? (
                    <div
                      style={tileStyle(piece)}
                      className={cn('h-full w-full', cornerRound(slot))}
                    />
                  ) : (
                    renderPiece(piece, { from: 'cell', slot })
                  ))}
              </div>
            );
          })}
        </div>

        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg"
          >
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 15 }}
              className="rounded-full bg-white/90 px-6 py-2.5 text-lg font-black text-green-700 shadow-xl backdrop-blur"
            >
              🧩 Bức tranh hoàn chỉnh!
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Tray + guidance */}
      {!done && (
        <>
          {game.tray.length > 0 && (
            <div className="mt-3 flex min-h-[52px] flex-wrap items-center justify-center gap-2">
              {game.tray.map((piece) => (
                <span key={piece} className="inline-block">
                  {renderPiece(piece, { from: 'tray' })}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-center text-xs font-semibold text-sky-900/90 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] sm:text-sm">
            {boardFull
              ? '⚠️ Còn mảnh sai chỗ — KÉO mảnh này THẢ lên mảnh kia để đổi chỗ!'
              : '🖐️ KÉO và THẢ mảnh ghép vào ô trên tranh · Thả lên mảnh khác để đổi chỗ · Thả nhầm ô vẫn được, sửa sau!'}
          </p>
        </>
      )}
    </div>
  );
}
