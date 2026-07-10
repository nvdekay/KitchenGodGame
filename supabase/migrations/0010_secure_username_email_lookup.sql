-- ─────────────────────────────────────────────────────────────────────────────
-- 0010_secure_username_email_lookup.sql
-- Closes an anonymous email-harvesting leak.
--
-- 0002 granted EXECUTE on get_email_for_username() (SECURITY DEFINER, returns a
-- player's account email) to `anon`. Combined with the public get_leaderboard()
-- — which hands out every ranked player's username — an unauthenticated visitor
-- could enumerate usernames and then resolve each one to its email, harvesting
-- the email of every player.
--
-- Fix: the username→email lookup now happens ONLY server-side, through the
-- service-role client, inside the sign-in server action (never returning the
-- email to the browser). So we revoke the client-facing grants and hand execute
-- to service_role alone. Username login keeps working; direct client/anon calls
-- to this function are now denied.
--
-- Run this AFTER 0002_auth_username_login.sql.
-- ─────────────────────────────────────────────────────────────────────────────

revoke execute on function public.get_email_for_username(text) from anon, authenticated, public;

grant execute on function public.get_email_for_username(text) to service_role;
