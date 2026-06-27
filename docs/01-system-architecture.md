# 1 · System Architecture

## Goals that drove every decision

1. **Add features later without refactoring.** New game systems, challenge
   types, admin tools, analytics — each should be an additive change.
2. **Keep two runtimes apart.** React (UI/state) and Phaser (game) are different
   worlds. Coupling them is the #1 way game projects rot. We bridge them at one
   audited seam.
3. **One developer, one week, ~50 players.** Favour clarity and convention over
   infrastructure. No microservices, no event sourcing, no premature scaling.

## The big picture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Next.js 15 App                            │
│                                                                    │
│  app/ (routes)  →  features/ (vertical slices)  →  services/       │
│        │                   │                          │            │
│        │                   ▼                          ▼            │
│        │            stores/ (Zustand)          lib/supabase/       │
│        │            React Query (cache)               │            │
│        │                   │                          ▼            │
│        │                   │                    Supabase           │
│        │                   │              (Auth · DB · Realtime)    │
│        ▼                   ▼                                        │
│   providers/  ◄────►  lib/eventBus  ◄────────────┐                 │
│                       (typed pub/sub)            │                 │
│                            ▲                     │                 │
│  ── React boundary ────────┼─────────────────────┼──────────────── │
│                            │  the BRIDGE          │                 │
│   game/ (Phaser, client-only)  ── game.events ──►─┘                 │
│     GameManager · SceneManager · scenes/                           │
└──────────────────────────────────────────────────────────────────┘
```

## Layers and their single responsibility

| Layer          | Responsibility                                   | May depend on            |
| -------------- | ------------------------------------------------ | ------------------------ |
| `app/`         | Routing, composition, server/client boundary     | features, components, game |
| `features/`    | Vertical product slices (UI+hooks+services+schema)| services, lib, stores, components |
| `components/`  | Shared dumb UI                                    | utils, lib (pure)        |
| `game/`        | Phaser runtime, isolated                          | lib (logger, eventBus, stores via bridge) |
| `services/`    | Data access → domain types                        | lib/supabase, types      |
| `stores/`      | Client state (auth/ui/game-status)                | types                    |
| `providers/`   | Wire context (Query, Auth) at the root            | lib, stores, services    |
| `lib/`         | Cross-cutting primitives (env, logger, errors, bus, supabase) | (nothing app-specific) |
| `types/`       | Shared types incl. generated DB types             | —                        |

**Dependency rule:** arrows point *down/right*. `lib/` never imports a feature;
a feature never imports another feature's internals. This keeps the graph a
shallow tree, so a change in one feature can't ripple sideways.

## Communication patterns (how parts talk without coupling)

- **Event bus (`lib/eventBus`)** — typed pub/sub for cross-cutting facts
  (`USER_LOGIN`, `GAME_READY`). Producers don't know consumers. This is how a
  future analytics or achievements feature listens to everything while owning
  nothing.
- **React Query** — *server* state (anything from Supabase). Caching, retries,
  invalidation. Features never hand-roll fetching/caching in Zustand.
- **Zustand** — *client* state only: who am I (`authStore`), UI chrome
  (`uiStore`), game status mirror (`gameStore`).
- **The bridge (`game/react/useGameBridge`)** — the ONLY link between Phaser's
  internal emitter and React. Game→React events become `gameStore` writes and
  app-bus events; React→Game uses `GameManager` commands.

## State ownership — the rule that prevents chaos

| Kind of state                        | Owner                          |
| ------------------------------------ | ------------------------------ |
| Server data (profiles, scores, …)    | **React Query** (via services) |
| Identity / role                      | `authStore`                    |
| Global UI (theme, toasts, modals)    | `uiStore`                      |
| Game *status* (phase, active scene)  | `gameStore`                    |
| Game *simulation* (entities, physics)| **Inside Phaser scenes** — never React |
| Form state                           | React Hook Form                |

## Cross-cutting strategies

- **Env** — `lib/env.ts` validates with Zod at boot; missing vars fail fast.
- **Errors** — `lib/errors.ts` `AppError` taxonomy → typed handling; route-level
  `app/error.tsx` boundary; services throw, UI maps.
- **Logging** — `lib/logger.ts` scoped, level-gated, single sink (swap for
  Sentry later without touching call sites).
- **Auth/z** — defense in depth: middleware (session) → server guard (role) →
  Postgres RLS (data). No single point of trust.

## Why not heavier tooling?

For 1 dev / 50 players, a typed event bus + feature folders + React Query gives
90% of the decoupling of a full DDD/event-sourced setup at ~5% of the cost. The
extension points (event map, scene registry, feature template, migration-per-
feature) are where scale is bought — incrementally, only when a feature needs it.
