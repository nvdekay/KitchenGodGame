-- ─────────────────────────────────────────────────────────────────────────────
-- 0015_free_text_username.sql
-- Usernames are the in-game display name, not a login handle a player needs
-- to type twice — let players use whatever they like (spaces, accents,
-- digits, symbols, any mix). Replaces the character-class CHECK from 0011/
-- 0012 with a length-only bound; uniqueness (case-insensitive, migration
-- 0002) is unaffected.
--
-- Run this AFTER 0012_relax_username_format.sql.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  drop constraint profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (char_length(username) between 1 and 32)
  not valid;
