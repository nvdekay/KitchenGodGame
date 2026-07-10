'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePresenceTracker } from '@/features/presence';
import { usePlayClock, useStageStatuses } from '@/features/quiz';
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
  // Accumulated active-play time of the cleared stages (static on the map).
  const { total: elapsed } = usePlayClock(userId);
  // Ord being navigated to — gives instant feedback and swallows repeat taps
  // while the /chang/[ord] server component resolves.
  const [enteringOrd, setEnteringOrd] = useState<number | null>(null);

  // Publish presence (online, no active stage yet) for the admin dashboard.
  usePresenceTracker({ userId, username, stage: null });

  // Warm the playable stage routes so entering doesn't wait on compile/fetch.
  useEffect(() => {
    stages
      ?.filter((s) => s.unlocked && !s.completed)
      .forEach((s) => router.prefetch(`/chang/${s.ord}`));
  }, [stages, router]);

  return (
    <MapView
      stages={stages ?? []}
      loading={isLoading}
      elapsedSeconds={elapsed}
      enteringOrd={enteringOrd}
      onSelect={(ord) => {
        if (enteringOrd !== null) return;
        setEnteringOrd(ord);
        router.push(`/chang/${ord}`);
      }}
    />
  );
}
