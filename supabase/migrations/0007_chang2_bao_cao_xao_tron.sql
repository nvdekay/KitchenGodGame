-- ─────────────────────────────────────────────────────────────────────────────
-- 0007_chang2_bao_cao_xao_tron.sql
-- Chặng 2 "Báo cáo bị xáo trộn" — the memory-match game (/chang/2).
--
-- The matching mechanic runs client-side (flip pairs among meme distractors),
-- but completion is still recorded server-side through the existing
-- submit_stage() RPC: stage 2 holds a single "completion marker" question that
-- the game answers when the board is cleared. That keeps stage_completions,
-- quiz_runs (finish time = clearing stage 3 = max ord), map unlocking and the
-- realtime admin dashboards working with zero new schema.
--
-- Run AFTER 0006. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

update public.stages
   set title       = 'Chặng 2: Báo cáo bị xáo trộn',
       description = 'Giai đoạn 2016–2024 — cải cách hành chính, chuyển đổi số, tinh gọn bộ máy'
 where ord = 2;

delete from public.questions
 where stage_id = (select id from public.stages where ord = 2);

insert into public.questions (stage_id, ord, type, prompt, options, correct_indices)
values (
  (select id from public.stages where ord = 2),
  1,
  'single'::public.question_type,
  'Đánh dấu hệ thống: hoàn thành trò chơi lật thẻ "Báo cáo bị xáo trộn" (chơi tại /chang/2)',
  '["Đã khôi phục bản báo cáo"]'::jsonb,
  '{0}'::int[]
);
