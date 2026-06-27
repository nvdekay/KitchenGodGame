-- ─────────────────────────────────────────────────────────────────────────────
-- 0004_leaderboard.sql
-- Realtime leaderboard. Run AFTER 0003.
--
-- Progress (level/score only) is non-sensitive and is published by the
-- leaderboard anyway, so we broaden the read policy to any signed-in user. This
-- also lets Supabase Realtime deliver player_progress changes to authenticated
-- subscribers (postgres_changes respects RLS), powering live updates.
-- ─────────────────────────────────────────────────────────────────────────────

-- Broaden read: any authenticated user can read progress (admin still covered).
drop policy if exists "read own progress or admin" on public.player_progress;
create policy "authenticated can read progress"
  on public.player_progress for select
  to authenticated
  using (true);

-- Leaderboard projection: only username + level + score, ordered. SECURITY
-- DEFINER + granted to anon so even a logged-out visitor can see the board.
create or replace function public.get_leaderboard(p_limit int default 20)
returns table (username text, best_level int, best_score int)
language sql
stable
security definer
set search_path = public
as $$
  select p.username, pp.best_level, pp.best_score
  from public.player_progress pp
  join public.profiles p on p.id = pp.user_id
  order by pp.best_level desc, pp.best_score desc, pp.last_played_at asc nulls last
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

grant execute on function public.get_leaderboard(int) to anon, authenticated;

-- Add the table to the realtime publication (idempotent guard).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'player_progress'
  ) then
    alter publication supabase_realtime add table public.player_progress;
  end if;
end $$;
