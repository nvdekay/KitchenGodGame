import { createClient } from '@/lib/supabase/client';

/**
 * Chặng-2 server sync. The memory-match mechanics run client-side, but the
 * completion is recorded server-side through the same RPCs as every stage:
 * stage 2 holds ONE "completion marker" question (see migration 0007); on
 * opening the game get_stage(2) stamps the run's started_at, and clearing the
 * board answers the marker via submit_stage(2) — keeping stage_completions,
 * quiz_runs, map unlocking and the realtime admin dashboards unchanged.
 */

const STAGE_ORD = 2;

/**
 * The marker question's id, or null when unavailable (offline, stage still
 * locked, or migration 0007 not applied). Callers treat null as "playable, but
 * progress can't be saved".
 */
export async function fetchMarkerId(): Promise<string | null> {
  try {
    const db = createClient();
    const { data, error } = await db.rpc('get_stage', { p_ord: STAGE_ORD });
    if (error || !data) return null;
    const stage = data as unknown as { questions: { id: string; ord: number }[] };
    return stage.questions[0]?.id ?? null;
  } catch {
    return null;
  }
}

/** Answer the completion marker. True when the server recorded the pass. */
export async function submitCompletion(markerId: string): Promise<boolean> {
  try {
    const db = createClient();
    const { data, error } = await db.rpc('submit_stage', {
      p_ord: STAGE_ORD,
      p_answers: { [markerId]: [0] },
    });
    if (error) return false;
    return Boolean((data as { passed?: boolean } | null)?.passed);
  } catch {
    return false;
  }
}
