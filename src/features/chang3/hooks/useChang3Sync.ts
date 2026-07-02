'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStageMarkerId, submitStageMarker } from '@/features/quiz';

const STAGE_ORD = 3;

/**
 * Server sync for a chặng-3 run, via the shared completion-marker plumbing.
 * Stage 3 is the LAST stage, so a successful submit also stamps the run's
 * finished_at — freezing the journey clock and entering the player into the
 * admin leaderboard. Unavailable marker (offline / migration 0008 not applied)
 * → the game still plays, it just reports that progress wasn't saved.
 */
export function useChang3Sync(userId: string) {
  const qc = useQueryClient();

  const marker = useQuery({
    queryKey: ['chang3', 'marker-id'],
    queryFn: () => fetchStageMarkerId(STAGE_ORD),
    staleTime: Infinity,
  });

  const submit = useMutation({
    mutationFn: (playSeconds: number) =>
      marker.data
        ? submitStageMarker(STAGE_ORD, marker.data, playSeconds)
        : Promise.resolve(false),
    onSuccess: (passed) => {
      if (passed) {
        // Refresh map statuses + fold the final stage's time into the clock.
        qc.invalidateQueries({ queryKey: ['quiz', 'stages', userId] });
        qc.invalidateQueries({ queryKey: ['quiz', 'play-seconds', userId] });
      }
    },
  });

  return { submit };
}
