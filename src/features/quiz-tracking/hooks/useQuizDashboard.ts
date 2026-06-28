'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel';
import { getQuizDashboard } from '../services/quiz-tracking.service';

const KEY = ['quiz-dashboard'] as const;

/**
 * Live admin dashboard data. React Query owns the fetch; a Realtime subscription
 * on stage_completions triggers a refresh whenever any player clears a stage.
 *
 * For 50 concurrent players a burst of completions would otherwise fire dozens of
 * refetches per second, so invalidation is DEBOUNCED — a flurry of changes
 * coalesces into a single refetch. A slow `refetchInterval` is a self-healing
 * fallback in case a Realtime message is ever dropped.
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

  const config = useMemo(
    () => ({ event: '*', schema: 'public', table: 'stage_completions' }),
    [],
  );

  useRealtimeChannel('admin:stage_completions', {
    event: 'postgres_changes',
    config,
    onMessage: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => qc.invalidateQueries({ queryKey: KEY }), 500);
    },
  });

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return query;
}
