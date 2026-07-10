'use client';

import { StageVictory, type SaveState } from '@/components/ui/game';
import { VICTORY } from '../data';

export type { SaveState };

/**
 * Chặng 2 victory — "Táo Cải Cách" is revealed and chặng 3 unlocks. Thin wrapper
 * over the shared StageVictory; adds the moves stat to the run line.
 */
export function VictoryScreen({
  elapsed,
  moves,
  saveState,
  onRetry,
}: {
  elapsed: number;
  moves: number;
  saveState: SaveState;
  onRetry: () => void;
}) {
  return (
    <StageVictory
      period={VICTORY.period}
      heading={VICTORY.heading}
      taoImg="/home/taocam.webp"
      taoAlt="Táo Cải Cách"
      taoName={VICTORY.taoName}
      unlockLabel={VICTORY.unlockLabel}
      intro={VICTORY.intro}
      timeSeconds={elapsed}
      statsSuffix={` · 🔄 ${moves} lượt lật`}
      saveState={saveState}
      savedMessage="✓ Tiến độ đã lưu, Chặng 3 đã mở khóa!"
      onRetry={onRetry}
    />
  );
}
