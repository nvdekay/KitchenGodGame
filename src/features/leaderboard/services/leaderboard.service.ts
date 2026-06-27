import type { TypedSupabaseClient } from '@/lib/supabase/types';
import type { LeaderboardEntry } from '../types';

/**
 * Reads the leaderboard via the get_leaderboard DB function (a safe projection,
 * callable by anyone — no direct table access). Client-safe: accepts an injected
 * Supabase client.
 */
export async function getLeaderboard(
  db: TypedSupabaseClient,
  limit = 20,
): Promise<LeaderboardEntry[]> {
  const { data, error } = await db.rpc('get_leaderboard', { p_limit: limit });
  if (error || !data) return [];
  return data.map((r) => ({
    username: r.username,
    bestLevel: r.best_level,
    bestScore: r.best_score,
  }));
}
