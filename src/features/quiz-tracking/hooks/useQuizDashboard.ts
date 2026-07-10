'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel';
import { getQuizDashboard } from '../services/quiz-tracking.service';

const KEY = ['quiz-dashboard'] as const;

/**
 * Live admin dashboard data. React Query owns the fetch; Realtime subscriptions
 * on BOTH stage_completions (a player cleared a stage) and quiz_runs (a player
 * started or finished the whole run) trigger a refresh — the ranking's start/
 * finish times come from quiz_runs, so watching only completions would miss a
 * run that starts/finishes without a coincident completion until the poll.
 *
 * For 50 concurrent players a burst would otherwise fire dozens of refetches per
 * second, so invalidation is DEBOUNCED — a flurry coalesces into a single
 * refetch. A slow `refetchInterval` is a self-healing fallback if a Realtime
 * message is ever dropped.
 */
export function useQuizDashboard() {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => getQuizDashboard(createClient()),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const scheduleRefetch = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => qc.invalidateQueries({ queryKey: KEY }), 500);
  }, [qc]);

  const completionsConfig = useMemo(
    () => ({ event: '*', schema: 'public', table: 'stage_completions' }),
    [],
  );
  const runsConfig = useMemo(() => ({ event: '*', schema: 'public', table: 'quiz_runs' }), []);

  useRealtimeChannel('admin:stage_completions', {
    event: 'postgres_changes',
    config: completionsConfig,
    onMessage: scheduleRefetch,
  });
  useRealtimeChannel('admin:quiz_runs', {
    event: 'postgres_changes',
    config: runsConfig,
    onMessage: scheduleRefetch,
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return query;
}
