'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as svc from '../services/chang1.service';

/**
 * Server sync for a chặng-1 run: question ids fetched up front (also stamps the
 * run's started_at server-side), one submit at the end. When the server content
 * is unreachable or doesn't match (e.g. migration 0006 not applied) the submit
 * resolves false — the game still plays, it just reports that progress wasn't
 * saved.
 */
export function useChang1Sync(userId: string) {
  const qc = useQueryClient();

  const ids = useQuery({
    queryKey: ['chang1', 'question-ids'],
    queryFn: svc.fetchQuestionIds,
    staleTime: Infinity,
  });

  const submit = useMutation({
    mutationFn: ({ picks, playSeconds }: { picks: Record<number, number>; playSeconds: number }) =>
      ids.data ? svc.submitRun(ids.data, picks, playSeconds) : Promise.resolve(false),
    onSuccess: (passed) => {
      if (passed) {
        // Unlock chặng 2 on the map + fold this stage's time into the clock.
        qc.invalidateQueries({ queryKey: ['quiz', 'stages', userId] });
        qc.invalidateQueries({ queryKey: ['quiz', 'play-seconds', userId] });
      }
    },
  });

  return { submit };
}
