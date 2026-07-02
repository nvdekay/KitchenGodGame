'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * The journey clock, active-play edition. Instead of wall-clock time from the
 * first stage open to the finish, the game counts only seconds the player is
 * ACTUALLY playing: story intros, round switches and message-reading locks
 * don't tick. Each cleared stage stores its play time in
 * stage_completions.play_seconds; the displayed journey total is
 *
 *   sum of saved play_seconds (other stages)  +  this stage's live stopwatch
 *
 * `running` starts/pauses the local stopwatch; pass `stageOrd` from inside a
 * stage so a saved row for the SAME stage is never double-counted alongside
 * the live value. On the map (no active stage) omit both — the total is just
 * the saved sum, static.
 */
export function usePlayClock(
  userId: string,
  opts: { stageOrd?: number; running?: boolean } = {},
): { total: number; stageSeconds: number } {
  const { stageOrd = 0, running = false } = opts;

  const { data: saved } = useQuery({
    queryKey: ['quiz', 'play-seconds', userId],
    queryFn: async () => {
      const { data } = await createClient()
        .from('stage_completions')
        .select('stage_ord,play_seconds')
        .eq('user_id', userId);
      return data ?? [];
    },
  });

  const base = (saved ?? [])
    .filter((r) => r.stage_ord !== stageOrd)
    .reduce((sum, r) => sum + (r.play_seconds ?? 0), 0);

  const [stageSeconds, setStageSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setStageSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  return { total: base + stageSeconds, stageSeconds };
}
