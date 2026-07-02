import { createClient } from '@/lib/supabase/client';

/**
 * Marker-based completion for the bespoke stage games (chặng 2, 3, …).
 *
 * Those games run their mechanics client-side, but each one's DB stage holds a
 * single "completion marker" question (migrations 0007/0008). Opening the game
 * calls get_stage(ord) — which also stamps quiz_runs.started_at on the very
 * first stage a player opens — and clearing it answers the marker through
 * submit_stage(ord). That keeps stage_completions, quiz_runs (finished_at on
 * the last stage), map unlocking and the realtime admin dashboards working
 * with zero extra schema.
 *
 * Both functions swallow errors into null/false: the games stay playable
 * offline/pre-migration, they just report that progress wasn't saved.
 */

/** The marker question's id for a stage, or null when unavailable. */
export async function fetchStageMarkerId(ord: number): Promise<string | null> {
  try {
    const db = createClient();
    const { data, error } = await db.rpc('get_stage', { p_ord: ord });
    if (error || !data) return null;
    const stage = data as unknown as { questions: { id: string; ord: number }[] };
    return stage.questions[0]?.id ?? null;
  } catch {
    return null;
  }
}

/** Answer a stage's completion marker. True when the server recorded the pass. */
export async function submitStageMarker(ord: number, markerId: string): Promise<boolean> {
  try {
    const db = createClient();
    const { data, error } = await db.rpc('submit_stage', {
      p_ord: ord,
      p_answers: { [markerId]: [0] },
    });
    if (error) return false;
    return Boolean((data as { passed?: boolean } | null)?.passed);
  } catch {
    return false;
  }
}
