-- ─────────────────────────────────────────────────────────────────────────────
-- 0009_play_seconds.sql
-- Per-stage ACTIVE play time. The journey clock no longer runs wall-clock from
-- first open to finish: each stage reports how many seconds the player actually
-- spent PLAYING (story intros, round-switching and message-reading pauses are
-- excluded). The ranked journey time = sum of play_seconds over the stages.
-- Each stage is played once; the first recorded play_seconds is kept forever.
-- Run AFTER 0008.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.stage_completions
  add column if not exists play_seconds int not null default 0;

-- submit_stage grows a p_play_seconds argument (defaulted, so existing 2-arg
-- callers keep working). Postgres treats the arg list as part of the function
-- identity, so drop the old signature first.
drop function if exists public.submit_stage(int, jsonb);

create or replace function public.submit_stage(
  p_ord int,
  p_answers jsonb,
  p_play_seconds int default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_stage    public.stages;
  v_unlocked boolean;
  v_total    int := 0;
  v_correct  int := 0;
  v_selected int[];
  v_passed   boolean;
  v_max_ord  int;
  v_done     int;
  q          record;
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;

  select * into v_stage from public.stages where ord = p_ord;
  if not found then raise exception 'stage not found'; end if;

  v_unlocked := p_ord = 1 or exists (
    select 1 from public.stage_completions
    where user_id = v_uid and stage_ord = p_ord - 1
  );
  if not v_unlocked then raise exception 'stage locked'; end if;

  for q in
    select id, correct_indices from public.questions where stage_id = v_stage.id
  loop
    v_total := v_total + 1;
    v_selected := coalesce(
      (select array(select jsonb_array_elements_text(p_answers -> q.id::text))::int[]),
      '{}'
    );
    if (select array(select unnest(v_selected) order by 1))
       = (select array(select unnest(q.correct_indices) order by 1)) then
      v_correct := v_correct + 1;
    end if;
  end loop;

  v_passed := v_total > 0 and v_correct = v_total;

  if v_passed then
    insert into public.stage_completions
      (user_id, stage_ord, completed_at, correct_count, total, play_seconds)
    values (
      v_uid, p_ord, now(), v_correct, v_total,
      least(greatest(coalesce(p_play_seconds, 0), 0), 21600)  -- clamp 0..6h
    )
    on conflict (user_id, stage_ord) do update
      set correct_count = excluded.correct_count,
          total = excluded.total,
          -- keep earliest completed_at AND the first recorded play time
          play_seconds = case
            when stage_completions.play_seconds > 0 then stage_completions.play_seconds
            else excluded.play_seconds
          end;

    select max(ord) into v_max_ord from public.stages;
    select count(*) into v_done from public.stage_completions where user_id = v_uid;
    if p_ord = v_max_ord and v_done >= v_max_ord then
      update public.quiz_runs
        set finished_at = coalesce(finished_at, now()), updated_at = now()
        where user_id = v_uid;
    end if;
  end if;

  return jsonb_build_object('passed', v_passed, 'correct', v_correct, 'total', v_total);
end;
$$;
grant execute on function public.submit_stage(int, jsonb, int) to authenticated;
