# KitchenGodGame

A web **quiz game**: 5 stages of mixed-type questions (single / multiple /
true-false), each unlocking the next, with server-side grading, smooth
animations, an admin question editor, and a live admin dashboard that tracks who
has cleared which stage and who finished all stages fastest.

> Tech: Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · Supabase
> (Auth · Postgres + RLS · Realtime) · Zustand · React Query · Zod · React Hook
> Form · Framer Motion. Deploys to Vercel + Supabase.

## Requirements

- **Node.js ≥ 20** (`node -v`)
- **npm** (ships with Node)
- A **Supabase** project (free tier is fine) for auth + database + realtime

---

## Run it

```bash
# 1. env: paste your Supabase values into .env.local
cp .env.example .env.local        # then edit the file (see table below)

# 2. install
npm install

# 3. database: apply migrations (SQL Editor, or the CLI below)
npx supabase link --project-ref <your-project-ref>
npm run db:push                   # applies supabase/migrations/*
npm run db:types                  # regenerate typed DB schema

# 4. run
npm run dev
```

> No CLI? Just paste each file in `supabase/migrations/` (0001 → 0005) into the
> Supabase **SQL Editor** in order and run them.

**`.env.local` values** (from Supabase → Project Settings → API):

| Variable                          | Where                          | Public? |
| --------------------------------- | ------------------------------ | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Project URL                    | yes     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | anon / public key              | yes     |
| `NEXT_PUBLIC_APP_URL`             | `http://localhost:3000`        | yes     |
| `NEXT_PUBLIC_LOG_LEVEL`           | `debug`                        | yes     |
| `SUPABASE_SERVICE_ROLE_KEY`       | service_role key (**secret!**) | **no**  |

In Supabase → Authentication → URL Configuration, add the redirect URL
`http://localhost:3000/auth/callback`.

Then:

1. Open **http://localhost:3000/login** and **sign up**.
2. You're redirected to **/play** — the game, now behind real auth.
3. To access **/admin**, grant your user the `admin` role (SQL in
   [`docs/04-supabase-setup.md`](docs/04-supabase-setup.md)).

Full details & troubleshooting: [`docs/03-local-development.md`](docs/03-local-development.md).

---

## Routes

| Route          | Access         | What it is                                       |
| -------------- | -------------- | ------------------------------------------------ |
| `/`            | public         | Landing page                                     |
| `/login`       | public         | Sign in (username or email)                      |
| `/signup`      | public         | Register (email + username + password)           |
| `/play`        | authenticated  | The quiz — stage select → play → submit          |
| `/admin`       | admin role     | Overview (who's online)                          |
| `/admin/quiz`  | admin role     | Manage stages & questions (CRUD)                 |
| `/admin/users` | admin role     | Live tracking: progress matrix + finish ranking  |

## Features

- Auth: register, login by **username or email**, logout, role-based access.
- Quiz: 5 stages, mixed question types (single / multiple / true-false), each
  stage unlocks the next, **graded on the server** (answers never reach the
  browser), unlimited retries.
- Animations: Framer Motion transitions + confetti (pure web; respects
  reduced-motion).
- Admin: question/stage editor; **realtime** dashboard tracking who cleared which
  stage and who finished all stages fastest; live online presence.

## Documentation

| #   | Guide                                                          |
| --- | -------------------------------------------------------------- |
| 1   | [System Architecture](docs/01-system-architecture.md)         |
| 2   | [Folder Structure Guide](docs/02-folder-structure.md)         |
| 3   | [Local Development Guide](docs/03-local-development.md)        |
| 4   | [Supabase Setup Guide](docs/04-supabase-setup.md)             |
| 6   | [Future Expansion Guide](docs/06-future-expansion.md)         |
| 7   | [Deployment Guide (Vercel + Supabase)](docs/07-deployment.md) |

## Top-level scripts

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Dev server                               |
| `npm run build`     | Production build                         |
| `npm run typecheck` | `tsc --noEmit` (strict)                  |
| `npm run lint`      | ESLint                                   |
| `npm run db:push`   | Apply migrations to linked Supabase      |
| `npm run db:types`  | Regenerate `src/types/database.types.ts` |
