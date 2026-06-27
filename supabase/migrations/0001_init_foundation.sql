-- ─────────────────────────────────────────────────────────────────────────────
-- 0001_init_foundation.sql
-- Foundation schema ONLY: identity, profiles, roles. NO gameplay tables.
--
-- "users" is Supabase's built-in `auth.users` (managed by Supabase Auth) — we do
-- NOT create or own it. We extend it with a public `profiles` row (1:1) and a
-- `user_roles` row, both keyed by the auth user id.
--
-- Future game modules add their OWN migrations (0002_…, 0003_…) — never edit
-- this file. See docs/06-future-expansion.md.
-- ─────────────────────────────────────────────────────────────────────────────

-- Roles -----------------------------------------------------------------------
create type public.app_role as enum ('player', 'admin');

-- Profiles (public per-user data) ---------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- User roles (1 row per user; default 'player') -------------------------------
create table public.user_roles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        public.app_role not null default 'player',
  created_at  timestamptz not null default now()
);

-- Authorization helper. SECURITY DEFINER so RLS policies can call it without the
-- caller needing direct read access to user_roles.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Auto-provision profile + default role on signup. The username comes from the
-- metadata passed in auth.signUp({ options: { data: { username } } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8))
  );
  insert into public.user_roles (user_id, role) values (new.id, 'player');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security ----------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.user_roles enable row level security;

-- Profiles: anyone authenticated can read (public profiles); you edit only your own.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Roles: a user can read their own role; admins can read all. No client writes
-- (role changes happen via service-role/admin paths only).
create policy "users read own role"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
