'use client';

import { useRouter } from 'next/navigation';
import { usePresenceTracker } from '@/features/presence';
import { useRunClock, useStageStatuses } from '@/features/quiz';
import { MapView } from './MapView';

/**
 * Data wrapper for the stage-select map. Reads live lock/unlock state for the
 * signed-in player (stages 1–3 + their completions), publishes presence, and
 * hands the presentational MapView a stage list + a select handler. Selecting
 * an unlocked stage enters its game at /chang/[ord].
 */
export function GameMap({ userId, username }: { userId: string; username: string }) {
  const router = useRouter();
  const { data: stages, isLoading } = useStageStatuses(userId);
  // Whole-journey clock — ticks once the player has opened chặng 1.
  const elapsed = useRunClock(userId);

  // Publish presence (online, no active stage yet) for the admin dashboard.
  usePresenceTracker({ userId, username, stage: null });

  return (
    <MapView
      stages={stages ?? []}
      loading={isLoading}
      elapsedSeconds={elapsed}
      onSelect={(ord) => router.push(`/chang/${ord}`)}
    />
  );
}
