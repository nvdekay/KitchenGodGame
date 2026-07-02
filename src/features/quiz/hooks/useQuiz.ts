'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import * as svc from '../services/quiz.service';
import type { StageStatus } from '../types';

/** Stage list merged with the player's completion state (computes lock/unlock). */
export function useStageStatuses(userId: string) {
  return useQuery({
    queryKey: ['quiz', 'stages', userId],
    queryFn: async (): Promise<StageStatus[]> => {
      const db = createClient();
      const [stages, completions] = await Promise.all([
        svc.getStages(db),
        svc.getMyCompletions(db, userId),
      ]);
      const doneAt = new Map(completions.map((c) => [c.stageOrd, c.completedAt]));
      return stages.map((s) => ({
        ...s,
        completed: doneAt.has(s.ord),
        unlocked: s.ord === 1 || doneAt.has(s.ord - 1),
        completedAt: doneAt.get(s.ord) ?? null,
      }));
    },
  });
}
