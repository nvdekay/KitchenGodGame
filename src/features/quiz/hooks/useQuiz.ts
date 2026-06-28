'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import * as svc from '../services/quiz.service';
import type { AnswerMap, StageStatus } from '../types';

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

/** Fetch a single stage's questions (only when a stage is active). */
export function useStage(ord: number | null) {
  return useQuery({
    queryKey: ['quiz', 'stage', ord],
    queryFn: () => svc.getStage(createClient(), ord as number),
    enabled: ord !== null,
    staleTime: 0,
  });
}

/** Submit answers; on a pass, refresh the stage statuses so unlocks appear. */
export function useSubmitStage(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ord, answers }: { ord: number; answers: AnswerMap }) =>
      svc.submitStage(createClient(), ord, answers),
    onSuccess: (res) => {
      if (res.passed) qc.invalidateQueries({ queryKey: ['quiz', 'stages', userId] });
    },
  });
}
