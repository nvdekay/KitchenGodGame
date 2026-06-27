# `features/` — Feature modules (the core of the architecture)

Each subfolder is a **self-contained vertical slice** of the product. A feature
owns its UI, state, validation, and data access, and exposes a small public API
via `index.ts`. This is what lets you add Challenges, Quests, Leaderboards, etc.
later **without touching existing features**.

## Anatomy of a feature

```
features/<name>/
  components/    React components for this feature only
  hooks/         React Query hooks + view-model hooks (the feature's React API)
  services/      data access (Supabase/API) — returns domain types, throws AppError
  schemas/       Zod schemas (shared by forms and server validation)
  events/        (optional) feature-specific event names + payloads
  types.ts       (optional) feature-local types
  index.ts       PUBLIC API — the only thing other code may import
```

## The rules that keep it scalable

1. **Import across features only through `index.ts`.** Never
   `@/features/quests/services/foo`. If you need something private, the owning
   feature should export it deliberately.
2. **No feature imports another feature's internals.** Cross-feature
   communication goes through the **event bus** (`@/lib/eventBus`) or shared
   `services/`. This keeps the dependency graph a shallow tree, not a web.
3. **Shared > duplicated, but feature-local > prematurely shared.** Start code
   inside the feature. Promote to `src/components/ui`, `src/services`, or
   `src/lib` only when a *second* consumer appears.
4. **A feature is deletable.** Removing a feature folder + its route + its
   migration should leave the app compiling. If it doesn't, something leaked.

## Adding a new feature (e.g. `leaderboards`)

1. `cp -r src/features/_template src/features/leaderboards`
2. Add its DB tables as a new migration (`supabase/migrations/00xx_leaderboards.sql`)
   — never edit the foundation migration. Regenerate types: `npm run db:types`.
3. Build components/hooks/services; export the public surface from `index.ts`.
4. Add a route under `src/app/...` that composes the feature's components.
5. If it emits domain events, add them to `AppEventMap` in `@/lib/eventBus`.

See `_template/` for a minimal, working skeleton.
