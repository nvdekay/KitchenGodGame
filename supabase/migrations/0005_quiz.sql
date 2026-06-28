-- ─────────────────────────────────────────────────────────────────────────────
-- 0005_quiz.sql
-- Quiz game: 5 stages, each with mixed-type questions. Clearing a stage unlocks
-- the next; finishing stage 5 stamps a finish time. Admins manage content (CRUD)
-- and track progress live. Run AFTER 0004.
--
-- ANTI-CHEAT: correct answers live in `questions.correct_indices`, which players
-- can NEVER read (no RLS select policy for them). Players fetch questions and
-- submit answers through SECURITY DEFINER functions that grade on the server and
-- stamp completion/finish times with now() — so timings are authoritative.
-- ─────────────────────────────────────────────────────────────────────────────

create type public.question_type as enum ('single', 'multiple', 'boolean');

-- Stages -----------------------------------------------------------------------
create table public.stages (
  id          uuid primary key default gen_random_uuid(),
  ord         int not null unique check (ord >= 1),  -- 1..5
  title       text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Questions (correct_indices is the secret) ------------------------------------
create table public.questions (
  id              uuid primary key default gen_random_uuid(),
  stage_id        uuid not null references public.stages (id) on delete cascade,
  ord             int not null,
  type            public.question_type not null default 'single',
  prompt          text not null,
  options         jsonb not null default '[]'::jsonb,   -- array of option strings
  correct_indices int[] not null default '{}',          -- correct option indices
  created_at      timestamptz not null default now(),
  unique (stage_id, ord)
);

-- One run per user (for total-time ranking) ------------------------------------
create table public.quiz_runs (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  started_at  timestamptz,
  finished_at timestamptz,
  updated_at  timestamptz not null default now()
);

-- Which stage each user has cleared, and when ----------------------------------
create table public.stage_completions (
  user_id       uuid not null references auth.users (id) on delete cascade,
  stage_ord     int not null,
  completed_at  timestamptz not null default now(),
  correct_count int not null default 0,
  total         int not null default 0,
  primary key (user_id, stage_ord)
);

-- Row Level Security -----------------------------------------------------------
alter table public.stages enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_runs enable row level security;
alter table public.stage_completions enable row level security;

-- stages: everyone signed in can read the list; only admins manage.
create policy "stages readable" on public.stages
  for select to authenticated using (true);
create policy "stages admin manage" on public.stages
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- questions: ADMINS ONLY (answers are secret). Players never select directly —
-- they go through get_stage(). All admin CRUD goes through this policy.
create policy "questions admin manage" on public.questions
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- runs + completions: a user reads their own; admins read all. Writes happen via
-- the SECURITY DEFINER functions below (no direct client writes).
create policy "runs read own or admin" on public.quiz_runs
  for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "completions read own or admin" on public.stage_completions
  for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- ── Player RPCs ───────────────────────────────────────────────────────────────

-- Fetch a stage's questions WITHOUT correct answers, only if it's unlocked for
-- the caller. Also stamps the run's started_at on first access.
create or replace function public.get_stage(p_ord int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_stage     public.stages;
  v_unlocked  boolean;
  v_questions jsonb;
begin
  if v_uid is null then raise exception 'unauthenticated'; end if;

  select * into v_stage from public.stages where ord = p_ord;
  if not found then raise exception 'stage not found'; end if;

  v_unlocked := p_ord = 1 or exists (
    select 1 from public.stage_completions
    where user_id = v_uid and stage_ord = p_ord - 1
  );
  if not v_unlocked then raise exception 'stage locked'; end if;

  insert into public.quiz_runs (user_id, started_at, updated_at)
  values (v_uid, now(), now())
  on conflict (user_id) do update
    set started_at = coalesce(quiz_runs.started_at, now()),
        updated_at = now();

  select jsonb_agg(
           jsonb_build_object(
             'id', q.id, 'ord', q.ord, 'type', q.type,
             'prompt', q.prompt, 'options', q.options
           ) order by q.ord
         )
  into v_questions
  from public.questions q
  where q.stage_id = v_stage.id;

  return jsonb_build_object(
    'ord', v_stage.ord,
    'title', v_stage.title,
    'description', v_stage.description,
    'questions', coalesce(v_questions, '[]'::jsonb)
  );
end;
$$;
grant execute on function public.get_stage(int) to authenticated;

-- Grade a submission on the server. p_answers shape: { "<question_id>": [idx,..] }.
-- A stage passes only when EVERY question is exactly correct. On pass we record
-- the completion (keeping the earliest completed_at) and, if this was the last
-- stage, stamp finished_at.
create or replace function public.submit_stage(p_ord int, p_answers jsonb)
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
    insert into public.stage_completions (user_id, stage_ord, completed_at, correct_count, total)
    values (v_uid, p_ord, now(), v_correct, v_total)
    on conflict (user_id, stage_ord) do update
      set correct_count = excluded.correct_count,
          total = excluded.total;  -- keep earliest completed_at

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
grant execute on function public.submit_stage(int, jsonb) to authenticated;

-- Realtime: admins watch stage_completions live.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'stage_completions'
  ) then
    alter publication supabase_realtime add table public.stage_completions;
  end if;
end $$;

-- ── Seed: 5 stages + a few sample questions (admin can edit/replace) ──────────
insert into public.stages (ord, title, description) values
  (1, 'Chặng 1', 'Khởi động'),
  (2, 'Chặng 2', 'Tăng tốc'),
  (3, 'Chặng 3', 'Thử thách'),
  (4, 'Chặng 4', 'Cao trào'),
  (5, 'Chặng 5', 'Về đích');

insert into public.questions (stage_id, ord, type, prompt, options, correct_indices)
select s.id, v.ord, v.type::public.question_type, v.prompt, v.options::jsonb, v.correct::int[]
from public.stages s
join (values
  (1, 1, 'single',   '1 + 1 = ?',                    '["1","2","3"]',                 '{1}'),
  (1, 2, 'boolean',  'Trái Đất quay quanh Mặt Trời?', '["Đúng","Sai"]',                '{0}'),
  (2, 1, 'single',   'Thủ đô của Việt Nam?',          '["Hà Nội","Huế","Đà Nẵng"]',    '{0}'),
  (3, 1, 'multiple', 'Chọn các số chẵn:',             '["2","3","4","5"]',             '{0,2}'),
  (4, 1, 'single',   '10 / 2 = ?',                    '["4","5","6"]',                 '{1}'),
  (5, 1, 'boolean',  'Nước sôi ở 100°C (mực nước biển)?', '["Đúng","Sai"]',            '{0}')
) as v(stage_ord, ord, type, prompt, options, correct) on s.ord = v.stage_ord;
