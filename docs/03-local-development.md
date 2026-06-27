# 3 · Local Development Guide

## Prerequisites

- Node.js ≥ 20 (repo uses 24 fine)
- npm (or pnpm/yarn — adjust commands)
- A Supabase project (cloud) **or** the Supabase CLI for a local stack
- Optional: Docker (only for the local Supabase stack)

## 1. Install

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in from your Supabase project (Settings → API). `src/lib/env.ts` validates
these at boot — a missing/invalid value throws a clear error instead of failing
mysteriously later.

| Var                             | Where to find it             | Exposed to browser? |
| ------------------------------- | ---------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Settings → API → Project URL | yes                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon key    | yes (safe; RLS)     |
| `NEXT_PUBLIC_APP_URL`           | `http://localhost:3000`      | yes                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Settings → API → service_role | **NO — server only** |

## 3. Set up the database

See [`04-supabase-setup.md`](04-supabase-setup.md). Short version (cloud):

```bash
npx supabase link --project-ref <your-ref>
npm run db:push          # applies supabase/migrations/*
npm run db:types         # regenerate src/types/database.types.ts
```

## 4. Run

```bash
npm run dev              # http://localhost:3000
```

Routes to try:

- `/` landing
- `/login` auth form
- `/play` the Phaser game (requires login → middleware redirects)
- `/admin` admin scaffold (requires `admin` role → see setup guide to grant)

## Everyday commands

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Hot-reloading dev server                  |
| `npm run typecheck` | Strict `tsc --noEmit`                     |
| `npm run lint`      | ESLint (next config)                      |
| `npm run format`    | Prettier write                            |
| `npm run build`     | Production build (run before deploying)   |
| `npm run db:push`   | Apply new migrations                      |
| `npm run db:types`  | Regenerate DB types after a migration     |

## Quality gates

TypeScript runs in **strict** mode with `noUncheckedIndexedAccess`. Before a PR:

```bash
npm run typecheck && npm run lint && npm run build
```

## Deployment (overview)

- **Frontend → Vercel.** Import the repo, set the same env vars in Project
  Settings (mark `SUPABASE_SERVICE_ROLE_KEY` as a non-public secret). `npm run
  build` is the build command.
- **Backend → Supabase.** Migrations are the source of truth; apply with
  `db:push` (or wire into CI). Set Auth redirect URL to
  `https://<your-domain>/auth/callback`.

## Troubleshooting

- **"Invalid public environment variables" at boot** → a `NEXT_PUBLIC_*` is
  missing in `.env.local`.
- **Phaser errors on the server / hydration mismatch** → something imported
  `game/` outside `GameCanvas`. Only mount the game via `GameCanvas` (`ssr:false`).
- **Redirected to `/login` on `/play`** → expected when signed out (middleware).
- **`/admin` bounces to `/play`** → your user isn't `admin`; grant the role
  (setup guide).
