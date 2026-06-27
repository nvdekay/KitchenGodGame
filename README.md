# KitchenGodGame

A **foundation** for a browser-based game platform. The gameplay is intentionally
a placeholder — this repo is the extensible, modular architecture that future
game concepts (challenges, quests, stages, leaderboards, …) plug into without a
rewrite.

> Tech: Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · Phaser 3 ·
> Supabase (Auth · Postgres · Realtime) · Zustand · React Query · Zod · React
> Hook Form. Deploys to Vercel + Supabase.

## Quick start

```bash
cp .env.example .env.local          # fill in Supabase keys
npm install
npm run dev                         # http://localhost:3000
```

Full setup, including Supabase, is in [`docs/03-local-development.md`](docs/03-local-development.md).

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

## Top-level scripts

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Dev server                               |
| `npm run build`     | Production build                         |
| `npm run typecheck` | `tsc --noEmit` (strict)                  |
| `npm run lint`      | ESLint                                   |
| `npm run db:push`   | Apply migrations to linked Supabase      |
| `npm run db:types`  | Regenerate `src/types/database.types.ts` |
