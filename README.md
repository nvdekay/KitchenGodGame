# 🎏 Các Táo Lên Chầu — KitchenGodGame

Game giáo dục trên nền web cho môn **MLN122 tại Đại học FPT**, kể chuyện các Táo
mang báo cáo lên chầu Ngọc Hoàng nhưng gặp gió lốc làm thất lạc hồ sơ. Người chơi
giúp các Táo khôi phục báo cáo qua **3 chặng mini-game**, mỗi chặng gắn với một
giai đoạn của công cuộc đổi mới đất nước:

| Chặng | Mini-game | Giai đoạn | Nội dung |
| --- | --- | --- | --- |
| 1 · Hồ sơ thất lạc | Chọn thẻ đáp án trôi trên trời (quiz 5 câu) | 1996 – 2015 | Công nghiệp hóa, hiện đại hóa, hội nhập kinh tế quốc tế (WTO, FDI…) |
| 2 · Báo cáo bị xáo trộn | Lật thẻ tìm cặp giống nhau (8 cặp + 5 thẻ meme bẫy) | 2016 – 2024 | Cải cách hành chính, chính phủ điện tử, sáp nhập tinh gọn |
| 3 · Khôi phục báo cáo | Ghép tranh 21 mảnh (kéo thả) + đoán từ khóa | 2025 – nay | **TINH GỌN BỘ MÁY** |

Vượt cả 3 chặng sẽ mở màn **đại kết cục**: 5 Táo cưỡi cá chép lên chầu, kèm tổng
thời gian chơi của cả hành trình.

**Mục đích của repo**: sản phẩm game hóa nội dung học tập (gamified learning) cho
lớp ~50 sinh viên chơi đồng thời trong giờ học — có xếp hạng thời gian để thi đua
và dashboard realtime cho giảng viên theo dõi.

> **Tech:** Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · Supabase
> (Auth · Postgres + RLS · Realtime) · React Query · Zustand · Framer Motion ·
> Zod + React Hook Form · canvas-confetti. Deploy trên Vercel + Supabase.

---

## Luật chơi & thiết kế chính

- **Đăng nhập trước khi chơi** (email + username + mật khẩu; đăng nhập bằng
  username *hoặc* email). Bản đồ mở khóa tuần tự: xong chặng 1 mới mở chặng 2…
- **Mỗi chặng chỉ chơi đúng 1 lần** — chặng đã hoàn thành không thể vào lại
  (chặn cả trên bản đồ lẫn khi gõ thẳng URL).
- **Đồng hồ chỉ tính thời gian chơi thật**: màn cốt truyện/hướng dẫn, lúc đọc
  thông điệp giáo dục đều không tính giờ. Tổng hành trình = cộng thời gian chơi
  3 chặng, dùng để xếp hạng.
- **Chống spam đáp án**: chọn sai ở chặng 1 bị khóa 4 giây; chọn đúng thì dừng
  giờ và khóa 10 giây để đọc giải thích. Chặng 2: ghép đúng cặp dừng giờ 15 giây
  đọc nội dung; dính thẻ meme bị "choáng" 6 giây trong khi đồng hồ vẫn chạy.
- **Chấm điểm phía server** (anti-cheat): đáp án đúng nằm trong Postgres, không
  bao giờ gửi xuống trình duyệt; các RPC `get_stage` / `submit_stage`
  (SECURITY DEFINER) chấm bài và đóng dấu thời gian.
- **Admin theo dõi realtime**: ai đang online, đang ở chặng nào, ma trận
  người chơi × chặng, và bảng xếp hạng tổng thời gian chơi.

---

## Yêu cầu

- **Node.js ≥ 20** và **npm**
- Một project **Supabase** (free tier là đủ) cho auth + database + realtime

## Chạy dự án

```bash
# 1. env: điền thông tin Supabase vào .env.local
cp .env.example .env.local        # rồi sửa file (xem bảng dưới)

# 2. cài đặt
npm install

# 3. database: chạy migrations
npx supabase link --project-ref <your-project-ref>
npm run db:push                   # áp dụng supabase/migrations/*
npm run db:types                  # sinh lại type DB

# 4. chạy
npm run dev                       # http://localhost:3000
```

> **Không dùng Supabase CLI?** Mở **SQL Editor** của Supabase và chạy lần lượt
> từng file trong `supabase/migrations/` theo thứ tự (`0001` → `0009`).

**Giá trị `.env.local`** (lấy từ Supabase → Project Settings → API):

| Biến                            | Lấy ở đâu                      | Public? |
| ------------------------------- | ------------------------------ | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL                    | có      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key              | có      |
| `NEXT_PUBLIC_LOG_LEVEL`         | `debug`                        | có      |
| `SUPABASE_SERVICE_ROLE_KEY`     | service_role key (**bí mật!**) | **không** |

Trong Supabase → **Authentication → URL Configuration**, thêm redirect URL
`http://localhost:3000/auth/callback`; khi test local nên tắt "Confirm email"
để đăng ký xong đăng nhập được ngay.

---

## Database migrations

Chạy theo thứ tự. Mỗi file độc lập và chỉ bổ sung (additive).

| File                                | Thêm gì                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `0001_init_foundation.sql`          | `profiles`, `user_roles`, RLS, trigger tạo profile khi đăng ký     |
| `0002_auth_username_login.sql`      | `get_email_for_username()` (đăng nhập bằng username)               |
| `0003` / `0004`                     | _legacy (không dùng)_ — giữ lại cho lịch sử                        |
| `0005_quiz.sql`                     | `stages`, `questions`, `quiz_runs`, `stage_completions`, RPC chấm bài server, realtime |
| `0006_chang1_hoso_thatlac.sql`      | Nội dung 5 câu hỏi chặng 1                                         |
| `0007_chang2_bao_cao_xao_tron.sql`  | Câu hỏi đánh dấu hoàn thành (marker) chặng 2                       |
| `0008_chang3_khoi_phuc_bao_cao.sql` | Câu hỏi marker chặng 3                                             |
| `0009_play_seconds.sql`             | `stage_completions.play_seconds` — thời gian chơi thật từng chặng, `submit_stage` nhận thêm tham số |

---

## Hướng dẫn admin

**1. Cấp quyền admin.** Sau khi đăng ký tài khoản, chạy trong Supabase SQL Editor
(thay email của bạn):

```sql
update public.user_roles set role = 'admin'
where user_id = (select id from auth.users where email = 'you@example.com');
```

**2. Quản lý nội dung** tại **`/admin/quiz`** — thêm/sửa/xóa chặng và câu hỏi.
Lưu ý: prompt và thứ tự đáp án của chặng 1 phải khớp với
`src/features/chang1/data.ts` (chấm bài server-side so theo index).

**3. Theo dõi người chơi realtime** tại **`/admin/users`** — ma trận người chơi ×
chặng (ai xong gì, lúc nào) + bảng xếp hạng tổng thời gian chơi, cập nhật trực
tiếp không cần refresh. Trang **`/admin`** cho biết ai đang online và đang ở
chặng nào.

---

## Routes

| Route          | Quyền truy cập | Là gì                                              |
| -------------- | -------------- | -------------------------------------------------- |
| `/`            | public         | Màn hình chào — 5 Táo + nút BẮT ĐẦU                |
| `/login`       | public         | Đăng nhập (username hoặc email)                    |
| `/signup`      | public         | Đăng ký (email + username + mật khẩu)              |
| `/map`         | đã đăng nhập   | Bản đồ chọn chặng (khóa/mở theo tiến độ, đồng hồ)  |
| `/chang/[ord]` | đã đăng nhập   | Chặng 1/2/3 — mini-game tương ứng                  |
| `/play`        | đã đăng nhập   | Redirect về `/map` (giữ link cũ)                   |
| `/admin`       | role admin     | Tổng quan — ai đang online                         |
| `/admin/quiz`  | role admin     | CRUD chặng & câu hỏi                               |
| `/admin/users` | role admin     | Tracking realtime: ma trận tiến độ + xếp hạng      |

Phân quyền 3 lớp: middleware (session) → server guard (role) → Postgres RLS (data).

---

## Cấu trúc dự án

```
src/
├── app/                      # routes (App Router): /, map, chang/[ord], (auth)/*, admin/*, play
├── components/ui/            # UI dùng chung (Button, Parchment, GoldButton, FishTimer…)
├── features/                 # vertical slices — mỗi feature tự chứa UI + hooks + services + data
│   ├── home/                 #   splash 5 Táo
│   ├── map/                  #   bản đồ chọn chặng
│   ├── chang1/               #   Hồ sơ thất lạc — thẻ đáp án trôi
│   ├── chang2/               #   Báo cáo bị xáo trộn — lật thẻ tìm cặp
│   ├── chang3/               #   Khôi phục báo cáo — ghép tranh + từ khóa + đại kết cục
│   ├── quiz/                 #   trạng thái chặng, đồng hồ giờ chơi (usePlayClock), marker
│   ├── quiz-admin/           #   admin: CRUD chặng/câu hỏi
│   ├── quiz-tracking/        #   admin: dashboard tiến độ realtime + xếp hạng
│   ├── presence/             #   realtime "ai đang online"
│   ├── auth/                 #   đăng nhập/đăng ký/đăng xuất
│   └── admin/                #   guard + nav khu admin
├── lib/                      # env (zod), logger, errors, supabase clients, confetti
├── hooks/                    # useRealtimeChannel
├── providers/                # React Query + Auth providers
├── services/                 # truy cập dữ liệu liên feature (profiles)
├── stores/                   # Zustand (authStore)
├── types/                    # type dùng chung + type DB sinh tự động
└── utils/                    # helpers thuần (cn, shuffle)
public/                       # asset game theo màn: home/, map/, chang1-3/, game/, end/
supabase/migrations/          # schema + nội dung, chạy theo thứ tự 0001 → 0009
```

---

## Scripts

| Lệnh                | Mục đích                                 |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Dev server                               |
| `npm run build`     | Production build                         |
| `npm run typecheck` | `tsc --noEmit` (strict)                  |
| `npm run lint`      | ESLint                                   |
| `npm run db:push`   | Áp dụng migrations lên Supabase đã link  |
| `npm run db:types`  | Sinh lại `src/types/database.types.ts`   |
| `npm run loadtest`  | Giả lập người chơi đồng thời (tự dọn dẹp) — `npm run loadtest -- --users 50` |

## Tài liệu

| #   | Guide                                                          |
| --- | -------------------------------------------------------------- |
| 1   | [System Architecture](docs/01-system-architecture.md)          |
| 2   | [Folder Structure Guide](docs/02-folder-structure.md)          |
| 3   | [Local Development Guide](docs/03-local-development.md)        |
| 4   | [Supabase Setup Guide](docs/04-supabase-setup.md)              |
| 6   | [Future Expansion Guide](docs/06-future-expansion.md)          |
| 7   | [Deployment Guide (Vercel + Supabase)](docs/07-deployment.md)  |

---

<p align="center">Made by <b>Nguyen Vu Dang Khanh</b></p>
