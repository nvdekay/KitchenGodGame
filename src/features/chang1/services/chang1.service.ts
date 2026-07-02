import { createClient } from '@/lib/supabase/client';

/**
 * Chặng-1 server sync. The bespoke game plays entirely client-side for instant
 * feedback, but grading and tracking stay server-authoritative: on open we fetch
 * the stage's question ids via get_stage() (which also stamps the run's
 * started_at for the time ranking), and on victory we submit the player's picks
 * through submit_stage() — the same RPCs as the classic quiz — so
 * stage_completions, quiz_runs and the realtime admin dashboards keep working
 * unchanged.
 */

const STAGE_ORD = 1;

/**
 * question ord → question id, or null when the server content isn't available
 * (offline, or migration 0006 not applied yet). Callers treat null as
 * "playable, but progress can't be saved".
 */
export async function fetchQuestionIds(): Promise<Map<number, string> | null> {
  try {
    const db = createClient();
    const { data, error } = await db.rpc('get_stage', { p_ord: STAGE_ORD });
    if (error || !data) return null;
    const stage = data as unknown as { questions: { id: string; ord: number }[] };
    return new Map(stage.questions.map((q) => [q.ord, q.id]));
  } catch {
    return null;
  }
}

/**
 * Submit the finished run (question ord → picked option index) plus the
 * stage's active play time. Returns true when the server graded it as passed
 * and recorded the completion.
 */
export async function submitRun(
  ids: Map<number, string>,
  picks: Record<number, number>,
  playSeconds: number,
): Promise<boolean> {
  const answers: Record<string, number[]> = {};
  for (const [ord, pick] of Object.entries(picks)) {
    const id = ids.get(Number(ord));
    if (!id) return false;
    answers[id] = [pick];
  }
  try {
    const db = createClient();
    const { data, error } = await db.rpc('submit_stage', {
      p_ord: STAGE_ORD,
      p_answers: answers,
      p_play_seconds: Math.max(0, Math.round(playSeconds)),
    });
    if (error) return false;
    return Boolean((data as { passed?: boolean } | null)?.passed);
  } catch {
    return false;
  }
}
