# 6 · Future Expansion Guide

This foundation is designed so that **adding a system is additive, never a
rewrite**. Each future module touches a predictable set of extension points and
nothing else.

## The extension points at a glance

| You want to add…        | Touch these, nothing more                                              |
| ----------------------- | ---------------------------------------------------------------------- |
| A new **feature/module**| `features/<name>/` (copy `_template`) + a route + a migration          |
| A new **DB table**      | a new `supabase/migrations/00xx_*.sql` + `npm run db:types`            |
| A new **app event**     | a key + payload in `AppEventMap` (`lib/eventBus`)                      |
| A new **game scene**    | a `Phaser.Scene` + register in `scenes/registry.ts`                    |
| A new **game event**    | a key + payload in `GameEventMap` (`game/events/gameEvents`)           |
| A new **admin section** | a route under `app/admin/*` + a link in `AdminNav`                     |
| A new **realtime feed** | a `useRealtimeChannel(...)` call in a feature hook                     |

---

## Walkthrough: adding the **Challenges** module

A representative example covering every layer.

**1. Scaffold the feature**

```bash
cp -r src/features/_template src/features/challenges
```

Rename the example files (`challenge.service.ts`, `useChallenges.ts`,
`ChallengeList.tsx`) and define the public API in `index.ts`.

**2. Add the database (new migration — never edit 0001)**

`supabase/migrations/0002_challenges.sql`:

```sql
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  config jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.challenges enable row level security;
create policy "challenges readable by authenticated"
  on public.challenges for select to authenticated using (true);
-- writes restricted to admins:
create policy "admins manage challenges"
  on public.challenges for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
```

```bash
npm run db:push && npm run db:types
```

**3. Service** (`features/challenges/services/challenge.service.ts`) — accept a
Supabase client, return domain types, throw `AppError`.

**4. Hook** (`features/challenges/hooks/useChallenges.ts`) — React Query wraps the
service for caching/invalidation.

**5. UI** (`features/challenges/components/…`) — composed by a route under
`app/(game)/challenges/page.tsx`.

**6. Events** — if completing a challenge should ripple outward, add to the app
bus:

```ts
// lib/eventBus.ts → AppEventMap
CHALLENGE_COMPLETED: { challengeId: string; score: number };
```

Now an Achievements feature and an Analytics feature can each
`eventBus.on('CHALLENGE_COMPLETED', …)` without Challenges knowing they exist.

**7. Game integration** (if it has gameplay) — add a `ChallengeScene`, register
it, and start it from React via `CMD_START_SCENE` or from another scene.

---

## Patterns for the named future modules

- **Quests / Stages** — same shape as Challenges: table(s) + feature + scene(s).
  Stages often reference a scene key; store it in the row and `scenes().start()`
  it.
- **Leaderboards** — table of scores; a `useRealtimeChannel('leaderboard', {
  event: 'postgres_changes', table: 'scores', onMessage: invalidate })` makes it
  live. No new infra.
- **Achievements** — a *listener* feature: subscribes to app-bus gameplay events,
  writes to an `achievements` table. Owns nothing upstream.
- **Inventory** — table keyed by `user_id`; feature + hooks; gameplay reads via
  service, the scene receives data through scene `init(data)`.
- **Analytics** — a thin subscriber that mirrors app-bus events to an analytics
  sink. Because every meaningful action already flows through the bus, this is
  mostly wiring, not instrumentation sprinkled across the codebase.

## Scaling guidance (be honest about the limits)

This foundation targets ~50 concurrent players. It scales a long way on Vercel +
Supabase as-is. When you genuinely outgrow it, the seams are ready:

- **Game loaders** — replace the single `LoadingScene` with a per-feature
  asset-registration pattern (each feature exports `register(loader)`); the
  registry/bridge don't change.
- **Authoritative multiplayer** — the event-bus + Realtime foundation is the
  client side; add a server (Supabase Edge Functions or a dedicated node) as the
  authority. The bridge already centralizes game↔app messaging.
- **Heavier server state** — promote services behind route handlers / server
  actions; React Query keys stay stable.

## The one rule that keeps it healthy

> A feature must remain **deletable**: removing its folder, its route, and its
> migration should leave the app compiling. If it doesn't, an internal leaked —
> route it through `index.ts`, the event bus, or a shared service instead.
