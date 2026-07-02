'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as svc from '../services/chang2.service';

/**
 * Server sync for a chặng-2 run: the completion-marker id is fetched up front
 * (which also stamps the run's started_at server-side); clearing the board
 * submits it once. When the marker is unavailable (offline / migration 0007
 * not applied) the submit resolves false — the game still plays, it just
 * reports that progress wasn't saved.
 */
export function useChang2Sync(userId: string) {
  const qc = useQueryClient();

  const marker = useQuery({
    queryKey: ['chang2', 'marker-id'],
    queryFn: svc.fetchMarkerId,
    staleTime: Infinity,
  });

  const submit = useMutation({
    mutationFn: () =>
      marker.data ? svc.submitCompletion(marker.data) : Promise.resolve(false),
    onSuccess: (passed) => {
      // Refresh stage statuses so /map unlocks chặng 3 without a reload.
      if (passed) qc.invalidateQueries({ queryKey: ['quiz', 'stages', userId] });
    },
  });

  return { submit };
}
