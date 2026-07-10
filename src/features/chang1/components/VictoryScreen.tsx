'use client';

import { StageVictory, type SaveState } from '@/components/ui/game';
import { VICTORY } from '../data';

export type { SaveState };

/**
 * Chặng 1 victory — "Táo Hội Nhập" is revealed and chặng 2 unlocks. Thin wrapper
 * over the shared StageVictory (see components/ui/game).
 */
export function VictoryScreen({
  elapsed,
  saveState,
  onRetry,
}: {
  elapsed: number;
  saveState: SaveState;
  onRetry: () => void;
}) {
  return (
    <StageVictory
      period={VICTORY.period}
      heading={VICTORY.heading}
      taoImg="/home/taodo.webp"
      taoAlt="Táo Hội Nhập"
      taoName={VICTORY.taoName}
      unlockLabel={VICTORY.unlockLabel}
      intro={VICTORY.intro}
      timeSeconds={elapsed}
      saveState={saveState}
      savedMessage="✓ Tiến độ đã lưu, Chặng 2 đã mở khóa!"
      onRetry={onRetry}
    />
  );
}
