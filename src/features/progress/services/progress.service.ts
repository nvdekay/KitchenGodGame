import type { TypedSupabaseClient } from '@/lib/supabase/types';
import { createLogger } from '@/lib/logger';
import type { MyProgress } from '../types';

const log = createLogger('feature:progress');

/**
 * Player-facing progress data access (client-safe — accepts an injected client).
 * Server code passes the cookie-bound client; client code passes the browser one.
 */

/** Read the current user's own progress (RLS allows reading own row). */
export async function getMyProgress(
  db: TypedSupabaseClient,
  userId: string,
): Promise<MyProgress> {
  const { data } = await db
    .from('player_progress')
    .select('best_level,best_score')
    .eq('user_id', userId)
    .maybeSingle();

  return { bestLevel: data?.best_level ?? 0, bestScore: data?.best_score ?? 0 };
}

/**
 * Persist a completed level for the signed-in user. Delegates the "keep the max"
 * logic to the DB function, which is atomic and uses auth.uid() — so a client
 * can only ever write its own row and never lower an existing value.
 */
export async function recordLevelProgress(
  db: TypedSupabaseClient,
  level: number,
  score: number,
): Promise<void> {
  const { error } = await db.rpc('record_level_progress', {
    p_level: level,
    p_score: score,
  });
  if (error) log.warn('record_level_progress failed', { message: error.message });
}
