# KitchenGodGame

A **foundation** for a browser-based game platform. The gameplay is intentionally
a placeholder — this repo is the extensible, modular architecture that future
game concepts (challenges, quests, stages, leaderboards, …) plug into without a
rewrite.

> Tech: Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · Phaser 3 ·
> Supabase (Auth · Postgres · Realtime) · Zustand · React Query · Zod · React
> Hook Form. Deploys to Vercel + Supabase.

## Requirements

- **Node.js ≥ 20** (`node -v`)
- **npm** (ships with Node)
- A **Supabase** project — only needed for auth, `/play`, and `/admin`
  (free tier is fine; the engine preview below works without it)

---

## Run it — two ways

### A) Preview the game engine in ~1 minute (no Supabase)

This boots the app and shows the **Phaser canvas** (Boot → Loading → Main scene)
using placeholder env values. Auth-gated pages won't work yet — that's expected.

```bash
# 1. create a local env file (placeholder values are fine for the preview)
cp .env.example .env.local

# 2. install dependencies
npm install

# 3. start the dev server
npm run dev
```

Then open:

- **http://localhost:3000** — landing page
- **http://localhost:3000/sandbox** — 👈 **the game engine running** (dev-only route, no login)

> `/sandbox` exists so you can see the engine before configuring a backend. It
> 404s in production. The real, auth-protected entry point is `/play`.

### B) Full setup with auth + database (≈ 5–10 minutes)

To use login, `/play`, and the `/admin` dashboard you need a Supabase project.

```bash
# 1. env: paste your real Supabase values into .env.local
cp .env.example .env.local        # then edit the file (see table below)

# 2. install
npm install

# 3. database: link your project and apply the foundation migration
npx supabase link --project-ref <your-project-ref>
npm run db:push                   # creates profiles, user_roles, RLS, triggers
npm run db:types                  # regenerate typed DB schema

# 4. run
npm run dev
```

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

| Route       | Access            | What it is                                  |
| ----------- | ----------------- | ------------------------------------------- |
| `/`         | public            | Landing page                                |
| `/sandbox`  | public (dev only) | Engine preview — Phaser canvas, no login    |
| `/login`    | public            | Sign in / sign up                           |
| `/play`     | authenticated     | The game (real entry point)                 |
| `/admin`    | admin role        | Admin dashboard scaffold                    |

## What's here (and what's deliberately NOT)

✅ Provided: project structure, Phaser↔React integration, Supabase wiring, auth
foundation (player/admin), admin scaffolding, typed event bus, Zustand stores,
service layer, env validation, error + logging strategy, realtime foundation,
foundation DB migration, and a copyable feature template.

🚫 Not built (by design): actual gameplay, quests, stages, challenges, inventory,
NPCs, combat, multiplayer. These are **extension points**, not implementations.

## Documentation

| #   | Guide                                                          |
| --- | -------------------------------------------------------------- |
| 1   | [System Architecture](docs/01-system-architecture.md)         |
| 2   | [Folder Structure Guide](docs/02-folder-structure.md)         |
| 3   | [Local Development Guide](docs/03-local-development.md)        |
| 4   | [Supabase Setup Guide](docs/04-supabase-setup.md)             |
| 5   | [Phaser Integration Guide](docs/05-phaser-integration.md)     |
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
