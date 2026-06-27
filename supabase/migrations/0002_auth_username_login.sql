-- ─────────────────────────────────────────────────────────────────────────────
-- 0002_auth_username_login.sql
-- Enables "log in with username OR email".
--
-- Supabase Auth only authenticates by email/phone, so to support username login
-- the client must resolve a username -> email BEFORE calling signInWithPassword.
-- A username is sensitive-ish (it maps to an email), so the lookup runs in a
-- SECURITY DEFINER function rather than exposing auth.users via RLS.
--
-- Run this AFTER 0001_init_foundation.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- Make usernames unique case-insensitively so "Khanh" and "khanh" can't both
-- exist and login-by-username is unambiguous. (0001 already has a case-sensitive
-- unique constraint; this strengthens it.)
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- Resolve a username to its account email. SECURITY DEFINER lets it read
-- auth.users; it returns ONLY the email and is the single sanctioned way the
-- anon (pre-login) client can do this.
create or replace function public.get_email_for_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(p.username) = lower(p_username)
  limit 1;
$$;

grant execute on function public.get_email_for_username(text) to anon, authenticated;
