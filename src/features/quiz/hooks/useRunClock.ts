'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getMyRun } from '../services/quiz.service';

/**
 * The whole-journey clock: seconds elapsed since the player first opened
 * chặng 1 (quiz_runs.started_at, stamped server-side by get_stage) until now —
 * or frozen at finished_at once all three chặng are cleared. Every stage's
 * fish clock shows this, so the player watches ONE authoritative run time,
 * the same one the admin leaderboard ranks by.
 *
 * While the run hasn't started yet (row not stamped), the query re-polls every
 * few seconds so the clock starts ticking right after the first get_stage.
 */
export function useRunClock(userId: string): number {
  const { data: run } = useQuery({
    queryKey: ['quiz', 'run', userId],
    queryFn: () => getMyRun(createClient(), userId),
    // Poll only until started_at exists; afterwards the row barely changes.
    refetchInterval: (query) => (query.state.data?.startedAt ? 30_000 : 3_000),
  });

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!run?.startedAt) return 0;
  const end = run.finishedAt ? Date.parse(run.finishedAt) : now;
  return Math.max(0, Math.floor((end - Date.parse(run.startedAt)) / 1000));
}
