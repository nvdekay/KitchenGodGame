-- ─────────────────────────────────────────────────────────────────────────────
-- 0003_player_progress.sql
-- Tracks how far each player has progressed, so admins can see who is at which
-- level. One row per user. Run AFTER 0001 and 0002.
--
-- Writes go ONLY through record_level_progress() (SECURITY DEFINER), which keeps
-- the "keep the maximum" logic atomic and server-side — clients can't overwrite
-- progress with a lower value or someone else's row.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.player_progress (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  best_level     int not null default 0,         -- highest level cleared
  best_score     int not null default 0,         -- best score in a single run
  last_played_at timestamptz,
  updated_at     timestamptz not null default now()
);

alter table public.player_progress enable row level security;

-- A player reads their own row; admins read everyone's.
create policy "read own progress or admin"
  on public.player_progress for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
-- No INSERT/UPDATE policy on purpose: writes happen via the function below.

-- Record a completed level for the CURRENT user (auth.uid()), keeping the max.
create or replace function public.record_level_progress(p_level int, p_score int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_progress (user_id, best_level, best_score, last_played_at, updated_at)
  values (auth.uid(), p_level, p_score, now(), now())
  on conflict (user_id) do update
    set best_level     = greatest(player_progress.best_level, excluded.best_level),
        best_score     = greatest(player_progress.best_score, excluded.best_score),
        last_played_at = now(),
        updated_at     = now();
end;
$$;

grant execute on function public.record_level_progress(int, int) to authenticated;
