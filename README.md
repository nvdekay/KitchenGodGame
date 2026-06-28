# KitchenGodGame

A web **quiz game**: 5 stages of mixed-type questions (single answer / multiple
answers / true–false). Clearing a stage unlocks the next; answers are **graded on
the server** (correct answers never reach the browser), with smooth animations,
an admin question editor, and a **realtime** admin dashboard that tracks who has
cleared which stage and who finished all stages fastest. Built for ~50 concurrent
players.

> **Tech:** Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · Supabase
> (Auth · Postgres + RLS · Realtime) · Zustand · React Query · Zod · React Hook
> Form · Framer Motion. Deploys to Vercel + Supabase.

---

## How it works

- **Players** register (email + username + password), then log in with **username
  _or_ email**. The quiz shows 5 stages — stage 1 open, the rest 🔒 locked.
- Answer every question in a stage correctly to **clear it and unlock the next**
  (unlimited retries). Grading happens in a Postgres function, so answers can't be
  inspected client-side and completion times are authoritative.
- Finishing stage 5 records a finish time. Players are ranked by **total time**
  (start of stage 1 → finish of stage 5).
- **Admins** create/edit questions and watch progress update **live** (no refresh).

---

## Requirements

- **Node.js ≥ 20** (`node -v`) and **npm**
- A **Supabase** project (free tier is fine) for auth + database + realtime

## Run it

```bash
# 1. env: paste your Supabase values into .env.local
cp .env.example .env.local        # then edit the file (see table below)

# 2. install
npm install

# 3. database: apply migrations
npx supabase link --project-ref <your-project-ref>
npm run db:push                   # applies supabase/migrations/*
npm run db:types                  # regenerate typed DB schema

# 4. run
npm run dev                       # http://localhost:3000
```

> **No Supabase CLI?** Open the Supabase **SQL Editor** and run each file in
> `supabase/migrations/` in order (`0001` → `0005`).

**`.env.local` values** (from Supabase → Project Settings → API):

| Variable                        | Where                          | Public? |
| ------------------------------- | ------------------------------ | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL                    | yes     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key              | yes     |
| `NEXT_PUBLIC_APP_URL`           | `http://localhost:3000`        | yes     |
| `NEXT_PUBLIC_LOG_LEVEL`         | `debug`                        | yes     |
| `SUPABASE_SERVICE_ROLE_KEY`     | service_role key (**secret!**) | **no**  |

In Supabase → **Authentication → URL Configuration**, add the redirect URL
`http://localhost:3000/auth/callback`, and (for easy local testing) turn **off**
"Confirm email" so signups can log in immediately.

Full setup & troubleshooting: [`docs/03-local-development.md`](docs/03-local-development.md).

---

## Database migrations

Run in order. Each is independent and additive.

| File                              | Adds                                                              |
| --------------------------------- | ---------------------------------------------------------------- |
| `0001_init_foundation.sql`        | `profiles`, `user_roles`, role enum, RLS, signup trigger         |
| `0002_auth_username_login.sql`    | `get_email_for_username()` (login by username), unique usernames  |
| `0003_player_progress.sql`        | _legacy (unused)_ — kept for history                             |
| `0004_leaderboard.sql`            | _legacy (unused)_ — kept for history                             |
| `0005_quiz.sql`                   | `stages`, `questions`, `quiz_runs`, `stage_completions`, server  |
|                                   | grading RPCs (`get_stage`/`submit_stage`), realtime, seed data   |

> `0003`/`0004` belonged to an earlier arcade prototype that was removed. Their
> tables are harmless but unused — drop them later if you want a clean DB.

---

## Admin guide

**1. Become an admin.** After signing up once, run this in the Supabase SQL Editor
(replace the email):

```sql
update public.user_roles set role = 'admin'
where user_id = (select id from auth.users where email = 'you@example.com');
```

**2. Author content** at **`/admin/quiz`** — add/edit/delete stages and questions.
Pick a question type (1 answer / multiple / true–false), add options, and tick the
correct answer(s). `0005` seeds a few sample questions to start from.

**3. Track players live** at **`/admin/users`** — a player × stage matrix (who
cleared what, when) plus a fastest-finish ranking, updating in realtime. The
**`/admin`** overview shows who's currently online and which stage they're on.

---

## Routes

| Route          | Access        | What it is                                       |
| -------------- | ------------- | ------------------------------------------------ |
| `/`            | public        | Landing page                                     |
| `/login`       | public        | Sign in (username or email)                      |
| `/signup`      | public        | Register (email + username + password)           |
| `/play`        | authenticated | The quiz — stage select → play → submit          |
| `/admin`       | admin role    | Overview — who's online                          |
| `/admin/quiz`  | admin role    | Manage stages & questions (CRUD)                 |
| `/admin/users` | admin role    | Live tracking: progress matrix + finish ranking  |

Access is enforced in three layers: middleware (session) → server guard (role) →
Postgres RLS (data).

---

## Project structure

```
src/
├── app/                      # routes (App Router): (app)/play, (auth)/*, admin/*
├── components/               # shared UI (ui/, layout/AppHeader)
├── features/                 # vertical slices — each owns UI+hooks+services+schema
│   ├── auth/                 #   login/signup, session
│   ├── quiz/                 #   player: stage select, play, submit
│   ├── quiz-admin/           #   admin: stage/question CRUD
│   ├── quiz-tracking/        #   admin: realtime progress dashboard
│   ├── presence/             #   realtime "who's online"
│   ├── admin/                #   admin layout guard + nav
│   └── _template/            #   copy this to start a new feature
├── lib/                      # env, logger, errors, eventBus, supabase clients, confetti
├── hooks/                    # shared hooks (useRealtimeChannel)
├── providers/                # React Query + Auth providers
├── services/                 # cross-feature data access (profiles)
├── stores/                   # Zustand (authStore, uiStore)
├── types/                    # shared + generated DB types
└── utils/                    # pure helpers (cn)
```

See [`docs/02-folder-structure.md`](docs/02-folder-structure.md) for the rules of
each folder, and [`src/features/README.md`](src/features/README.md) for how to add
a feature.

---

## Documentation

| #   | Guide                                                          |
| --- | -------------------------------------------------------------- |
| 1   | [System Architecture](docs/01-system-architecture.md)         |
| 2   | [Folder Structure Guide](docs/02-folder-structure.md)         |
| 3   | [Local Development Guide](docs/03-local-development.md)        |
| 4   | [Supabase Setup Guide](docs/04-supabase-setup.md)             |
| 6   | [Future Expansion Guide](docs/06-future-expansion.md)         |
| 7   | [Deployment Guide (Vercel + Supabase)](docs/07-deployment.md) |

## Scripts

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Dev server                               |
| `npm run build`     | Production build                         |
| `npm run typecheck` | `tsc --noEmit` (strict)                  |
| `npm run lint`      | ESLint                                   |
| `npm run db:push`   | Apply migrations to linked Supabase      |
| `npm run db:types`  | Regenerate `src/types/database.types.ts` |
| `npm run loadtest`  | Simulate concurrent players (self-cleaning) — `npm run loadtest -- --users 50` |
