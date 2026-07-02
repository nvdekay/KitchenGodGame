-- ─────────────────────────────────────────────────────────────────────────────
-- 0006_chang1_hoso_thatlac.sql
-- Chặng 1 "Hồ sơ thất lạc" — real content for the per-stage adventure game.
--
-- The game itself is a bespoke client experience (story intro, drifting answer
-- cards, rich right/wrong feedback); this migration keeps the SERVER as the
-- source of truth for grading + tracking by:
--   • trimming the seeded 5-stage skeleton down to the game's 3 chặng
--   • giving stage 1 its real identity (title/description shown on /map)
--   • replacing stage 1's sample questions with the real five
--
-- ⚠ The option ORDER and correct_indices here MUST match
--   src/features/chang1/data.ts — the client submits the player's picks through
--   the existing submit_stage() RPC, which grades against these rows. That is
--   also what keeps stage_completions / quiz_runs / the realtime admin
--   dashboards working unchanged.
--
-- Run AFTER 0005. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- The adventure has 3 chặng; drop the unused seeded stages 4–5 (questions
-- cascade) and any test completions for them.
delete from public.stage_completions where stage_ord > 3;
delete from public.stages where ord > 3;

update public.stages
   set title       = 'Chặng 1: Hồ sơ thất lạc',
       description = 'Giai đoạn 1996–2015 — đẩy mạnh CNH, HĐH và hội nhập kinh tế quốc tế'
 where ord = 1;

-- Replace stage 1's sample questions with the real content.
delete from public.questions
 where stage_id = (select id from public.stages where ord = 1);

insert into public.questions (stage_id, ord, type, prompt, options, correct_indices)
select (select id from public.stages where ord = 1),
       v.ord,
       'single'::public.question_type,
       v.prompt,
       v.options::jsonb,
       v.correct::int[]
from (values
  (1, 'Việt Nam chính thức gia nhập WTO vào năm nào?',
      '["1995","2006","2007","2000","2010","1998"]',
      '{2}'),
  (2, '"Công nghiệp hóa, hiện đại hóa" được Đảng xác định là nhiệm vụ gì?',
      '["Xây dựng nông thôn mới","Phát triển kinh tế biển","Nâng cao năng lực sản xuất","Xuất khẩu nông sản","Thu hút vốn đầu tư","Chuyển đổi số"]',
      '{2}'),
  (3, 'Thu hút FDI (vốn đầu tư nước ngoài) đem lại lợi ích gì cho Việt Nam?',
      '["Tăng thu ngân sách","Thu hút vốn và công nghệ","Tạo thêm việc làm","Xuất khẩu lao động","Phát triển du lịch","Xây dựng hạ tầng"]',
      '{1}'),
  (4, '"Kinh tế nhiều thành phần" trong thời kỳ đổi mới có ý nghĩa gì?',
      '["Nhà nước độc quyền","Các thành phần cùng phát triển","Chỉ phát triển nhà nước","Xóa bỏ kinh tế tư nhân","Tập trung hóa kế hoạch","Bao cấp hoàn toàn"]',
      '{1}'),
  (5, 'Hội nhập kinh tế quốc tế là chủ trương nhằm mục đích gì?',
      '["Đóng cửa thị trường","Mở rộng hợp tác quốc tế","Chỉ xuất khẩu nông sản","Giảm nhập khẩu","Bảo hộ sản xuất trong nước","Tách khỏi thế giới"]',
      '{1}')
) as v(ord, prompt, options, correct);
