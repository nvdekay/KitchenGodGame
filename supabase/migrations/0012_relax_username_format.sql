-- ─────────────────────────────────────────────────────────────────────────────
-- 0012_relax_username_format.sql
-- Relax the username format CHECK added in 0011 to allow '@' and a bit more
-- length, so preconfigured handles like "admin@nhom8" are valid.
--
-- Run this AFTER 0011_username_format_check.sql.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  drop constraint profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[A-Za-z0-9_@]{3,32}$')
  not valid;
