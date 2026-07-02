import type { TypedSupabaseClient } from '@/lib/supabase/types';

/**
 * Admin tracking data. Read with the admin's own (cookie-bound) client — RLS lets
 * admins read every player's runs/completions, which also means Realtime delivers
 * all changes to them. No service-role key needed.
 */

export interface PlayerRow {
  userId: string;
  username: string;
  startedAt: string | null;
  finishedAt: string | null;
  /** stage ord → completed_at ISO string. */
  completedStages: Record<number, string>;
  /** Total ACTIVE play time across all stages (ms) once finished, or null.
   *  Falls back to wall-clock started→finished for rows recorded before the
   *  play_seconds migration (0009). */
  elapsedMs: number | null;
}

export interface DashboardData {
  stageOrds: number[];
  players: PlayerRow[]; // everyone who started — for the progress matrix
  ranking: PlayerRow[]; // finished all stages, fastest total time first
}

export async function getQuizDashboard(db: TypedSupabaseClient): Promise<DashboardData> {
  // Run the four reads concurrently (each wrapped so Promise.all sees a clean
  // array): one round-trip of latency instead of four.
  const [stages, profiles, runs, comps] = await Promise.all([
    (async () => (await db.from('stages').select('ord').order('ord')).data ?? [])(),
    (async () => (await db.from('profiles').select('id,username')).data ?? [])(),
    (async () =>
      (await db.from('quiz_runs').select('user_id,started_at,finished_at')).data ?? [])(),
    (async () =>
      (await db.from('stage_completions').select('user_id,stage_ord,completed_at,play_seconds'))
        .data ?? [])(),
  ]);

  const stageOrds = stages.map((s) => s.ord);
  const nameOf = new Map(profiles.map((p) => [p.id, p.username]));
  const runOf = new Map(runs.map((r) => [r.user_id, r]));

  const compsOf = new Map<string, Record<number, string>>();
  const playSecondsOf = new Map<string, number>();
  for (const c of comps) {
    const m = compsOf.get(c.user_id) ?? {};
    m[c.stage_ord] = c.completed_at;
    compsOf.set(c.user_id, m);
    playSecondsOf.set(c.user_id, (playSecondsOf.get(c.user_id) ?? 0) + (c.play_seconds ?? 0));
  }

  const userIds = new Set<string>([
    ...runs.map((r) => r.user_id),
    ...comps.map((c) => c.user_id),
  ]);

  const players: PlayerRow[] = [...userIds].map((uid) => {
    const run = runOf.get(uid);
    const startedAt = run?.started_at ?? null;
    const finishedAt = run?.finished_at ?? null;
    const playMs = (playSecondsOf.get(uid) ?? 0) * 1000;
    const wallMs =
      startedAt && finishedAt ? Date.parse(finishedAt) - Date.parse(startedAt) : null;
    return {
      userId: uid,
      username: nameOf.get(uid) ?? uid.slice(0, 8),
      startedAt,
      finishedAt,
      completedStages: compsOf.get(uid) ?? {},
      // Rank by active play time; pre-0009 rows (no play_seconds) keep wall-clock.
      elapsedMs: finishedAt ? (playMs > 0 ? playMs : wallMs) : null,
    };
  });

  players.sort(
    (a, b) =>
      Object.keys(b.completedStages).length - Object.keys(a.completedStages).length ||
      a.username.localeCompare(b.username),
  );

  const ranking = players
    .filter((p) => p.elapsedMs !== null)
    .sort((a, b) => (a.elapsedMs as number) - (b.elapsedMs as number));

  return { stageOrds, players, ranking };
}
