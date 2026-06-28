'use client';

import { useState } from 'react';
import { useStageStatuses } from '../hooks/useQuiz';
import { StageSelect } from './StageSelect';
import { StagePlay } from './StagePlay';

/**
 * Quiz shell mounted on /play. Owns the "which stage is active" navigation and
 * the stage-status query (shared with the select screen and invalidated on a
 * pass). The `key` on StagePlay forces a fresh component per stage so answers /
 * submit state don't leak across stages.
 */
export function QuizGame({ userId }: { userId: string }) {
  const [active, setActive] = useState<number | null>(null);
  const { data: stages, isLoading } = useStageStatuses(userId);
  const total = stages?.length ?? 0;

  return (
    <div className="h-full overflow-auto bg-neutral-50 p-6">
      {active === null ? (
        <StageSelect stages={stages ?? []} loading={isLoading} onPlay={setActive} />
      ) : (
        <StagePlay
          key={active}
          ord={active}
          userId={userId}
          total={total}
          onBack={() => setActive(null)}
          onNext={setActive}
        />
      )}
    </div>
  );
}
