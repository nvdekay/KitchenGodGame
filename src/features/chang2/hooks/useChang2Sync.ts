'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStageMarkerId, submitStageMarker } from '@/features/quiz';

const STAGE_ORD = 2;

/**
 * Server sync for a chặng-2 run, via the shared completion-marker plumbing
 * (see quiz/services/stage-marker.service): the marker id is fetched up front
 * (which also stamps the run's started_at server-side); clearing the board
 * submits it once. When the marker is unavailable (offline / migration 0007
 * not applied) the submit resolves false — the game still plays, it just
 * reports that progress wasn't saved.
 */
export function useChang2Sync(userId: string) {
  const qc = useQueryClient();

  const marker = useQuery({
    queryKey: ['chang2', 'marker-id'],
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
        // Unlock chặng 3 on the map + fold this stage's time into the clock.
        qc.invalidateQueries({ queryKey: ['quiz', 'stages', userId] });
        qc.invalidateQueries({ queryKey: ['quiz', 'play-seconds', userId] });
      }
    },
  });

  return { submit };
}
