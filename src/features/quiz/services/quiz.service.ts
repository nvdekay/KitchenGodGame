import type { TypedSupabaseClient } from '@/lib/supabase/types';
import { AppError } from '@/lib/errors';
import type { AnswerMap, StageData, StageInfo, SubmitResult } from '../types';

/**
 * Quiz data access (client-safe). Questions and grading go through the server
 * RPCs (get_stage / submit_stage) so correct answers never reach the browser and
 * timings are authoritative; stage list + completions are plain RLS-guarded reads.
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

/** The player's run timestamps (started on first stage open, finished after the
 *  last stage) — the source of the whole-journey clock and the admin ranking. */
export async function getMyRun(
  db: TypedSupabaseClient,
  userId: string,
): Promise<{ startedAt: string | null; finishedAt: string | null }> {
  const { data } = await db
    .from('quiz_runs')
    .select('started_at,finished_at')
    .eq('user_id', userId)
    .maybeSingle();
  return { startedAt: data?.started_at ?? null, finishedAt: data?.finished_at ?? null };
}

export async function getStage(db: TypedSupabaseClient, ord: number): Promise<StageData> {
  const { data, error } = await db.rpc('get_stage', { p_ord: ord });
  if (error) {
    const locked = error.message.includes('locked');
    throw new AppError('FORBIDDEN', locked ? 'Chặng này chưa được mở khoá.' : 'Không tải được chặng.');
  }
  return data as unknown as StageData;
}

export async function submitStage(
  db: TypedSupabaseClient,
  ord: number,
  answers: AnswerMap,
): Promise<SubmitResult> {
  const { data, error } = await db.rpc('submit_stage', { p_ord: ord, p_answers: answers });
  if (error) throw new AppError('VALIDATION', 'Nộp bài thất bại, thử lại.');
  return data as unknown as SubmitResult;
}
