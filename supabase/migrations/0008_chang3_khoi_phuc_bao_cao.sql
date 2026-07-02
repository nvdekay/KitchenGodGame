-- ─────────────────────────────────────────────────────────────────────────────
-- 0008_chang3_khoi_phuc_bao_cao.sql
-- Chặng 3 "Khôi phục báo cáo" — jigsaw + keyword game (/chang/3).
--
-- Same completion-marker pattern as chặng 2 (see 0007): the puzzle/keyword
-- mechanics run client-side, and clearing the stage answers stage 3's single
-- marker question via submit_stage(3). Because stage 3 is the LAST stage
-- (max ord), that submit also stamps quiz_runs.finished_at — which is exactly
-- what the admin dashboard's fastest-finish ranking reads (total time
-- started_at → finished_at across all three chặng).
--
-- Run AFTER 0007. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

update public.stages
   set title       = 'Chặng 3: Khôi phục báo cáo',
       description = 'Giai đoạn 2025 – nay — tinh gọn bộ máy, hiệu năng, hiệu lực, hiệu quả'
 where ord = 3;

delete from public.questions
 where stage_id = (select id from public.stages where ord = 3);

insert into public.questions (stage_id, ord, type, prompt, options, correct_indices)
values (
  (select id from public.stages where ord = 3),
  1,
  'single'::public.question_type,
  'Đánh dấu hệ thống: hoàn thành trò chơi ghép hình & đoán từ khóa "Khôi phục báo cáo" (chơi tại /chang/3)',
  '["Đã khôi phục bức tranh và đoán đúng từ khóa"]'::jsonb,
  '{0}'::int[]
);
