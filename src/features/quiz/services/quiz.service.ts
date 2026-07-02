import type { TypedSupabaseClient } from '@/lib/supabase/types';
import type { StageInfo } from '../types';

/**
 * Quiz data access (client-safe). Stage list + completions are plain
 * RLS-guarded reads; the bespoke stage games grade through the server RPCs
 * (get_stage / submit_stage) via chang1.service and stage-marker.service, so
 * correct answers never reach the browser and timings are authoritative.
 */

export async function getStages(db: TypedSupabaseClient): Promise<StageInfo[]> {
  const { data } = await db.from('stages').select('ord,title,description').order('ord');
  return (data ?? []).map((s) => ({ ord: s.ord, title: s.title, description: s.description }));
}

export async function getMyCompletions(
  db: TypedSupabaseClient,
  userId: string,
): Promise<{ stageOrd: number; completedAt: string }[]> {
  const { data } = await db
    .from('stage_completions')
    .select('stage_ord,completed_at')
    .eq('user_id', userId);
  return (data ?? []).map((r) => ({ stageOrd: r.stage_ord, completedAt: r.completed_at }));
}
