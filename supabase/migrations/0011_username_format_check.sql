-- ─────────────────────────────────────────────────────────────────────────────
-- 0011_username_format_check.sql
-- Enforce the username rules in the database, not just the client.
--
-- The signup form validates username with zod (3–24 chars, [A-Za-z0-9_]), but
-- handle_new_user() (migration 0001) trusts raw_user_meta_data ->> 'username'
-- verbatim. Since the anon key is public, anyone can call auth.signUp() directly
-- and register an overlong / unicode / whitespace / impersonating handle. This
-- adds a CHECK so the profile insert (and thus the signup) is rejected server-
-- side for a malformed username, matching the client rules.
--
-- Added NOT VALID so it enforces on all new/updated rows without failing the
-- migration on any pre-existing row; run VALIDATE CONSTRAINT separately once the
-- existing data is known to comply.
--
-- Run this AFTER 0001_init_foundation.sql.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[A-Za-z0-9_]{3,24}$')
  not valid;
