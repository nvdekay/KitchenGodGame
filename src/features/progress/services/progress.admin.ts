import 'server-only';

import { createAdminClient } from '@/lib/supabase/server';
import type { AppRole } from '@/types/database.types';
import type { PlayerOverview } from '../types';

/**
 * Admin-only: list every player with their progress. Uses the service-role
 * client (bypasses RLS) — the caller MUST already be an admin (the /admin layout
 * guarantees this via requireAdmin()).
 *
 * We run three small reads and merge in code rather than relying on PostgREST
 * embedding, since profiles and player_progress have no direct FK between them.
 * Sequential awaits keep it simple; the row counts here are tiny.
 */
export async function listPlayerOverview(): Promise<PlayerOverview[]> {
  const db = createAdminClient();

  const profiles = (await db.from('profiles').select('id,username')).data ?? [];
  const roles = (await db.from('user_roles').select('user_id,role')).data ?? [];
  const progress =
    (await db
      .from('player_progress')
      .select('user_id,best_level,best_score,last_played_at')).data ?? [];

  const roleByUser = new Map<string, AppRole>(roles.map((r) => [r.user_id, r.role]));
  const progByUser = new Map(progress.map((p) => [p.user_id, p]));

  return profiles
    .map((pf) => {
      const prog = progByUser.get(pf.id);
      return {
        userId: pf.id,
        username: pf.username,
        role: roleByUser.get(pf.id) ?? 'player',
        bestLevel: prog?.best_level ?? 0,
        bestScore: prog?.best_score ?? 0,
        lastPlayedAt: prog?.last_played_at ?? null,
      } satisfies PlayerOverview;
    })
    .sort((a, b) => b.bestLevel - a.bestLevel || b.bestScore - a.bestScore);
}
