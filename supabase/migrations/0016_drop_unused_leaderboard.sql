-- ─────────────────────────────────────────────────────────────────────────────
-- 0016_drop_unused_leaderboard.sql
-- `player_progress` (0003) and its functions `record_level_progress` /
-- `get_leaderboard` (0004) were never wired into any gameplay client code —
-- confirmed by grepping src/ for every `.from(...)`/`.rpc(...)` call: nothing
-- references them. The admin leaderboard page (/admin/leaderboard) reads the
-- quiz-tracking data (quiz_runs/stage_completions) instead. Dropping the dead
-- table + functions to keep the schema honest.
--
-- Run this AFTER 0015_free_text_username.sql.
-- ─────────────────────────────────────────────────────────────────────────────

drop function if exists public.get_leaderboard(int);
drop function if exists public.record_level_progress(int, int);
drop table if exists public.player_progress;
