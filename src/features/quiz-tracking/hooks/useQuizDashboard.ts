'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel';
import { getQuizDashboard } from '../services/quiz-tracking.service';

/**
 * Live admin dashboard data. React Query owns the fetch; a Realtime subscription
 * on stage_completions invalidates it whenever any player clears a stage — which
 * also re-reads quiz_runs (finish times), so both the matrix and the ranking
 * update live, no polling.
 */
export function useQuizDashboard() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['quiz-dashboard'],
    queryFn: () => getQuizDashboard(createClient()),
  });

  const config = useMemo(
    () => ({ event: '*', schema: 'public', table: 'stage_completions' }),
    [],
  );

  useRealtimeChannel('admin:stage_completions', {
    event: 'postgres_changes',
    config,
    onMessage: () => qc.invalidateQueries({ queryKey: ['quiz-dashboard'] }),
  });

  return query;
}
