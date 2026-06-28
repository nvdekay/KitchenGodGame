# 2 · Folder Structure Guide

For every folder: **why it exists**, **what belongs**, **what must never go there**.

```
KitchenGodGame/
├── middleware.ts            # Edge auth/session refresh + route protection
├── supabase/
│   ├── config.toml
│   └── migrations/          # versioned SQL; one migration per feature
├── docs/                    # these guides
└── src/
    ├── app/                 # Next.js App Router — routes only
    ├── components/          # shared, dumb UI
    ├── features/            # vertical product slices  ← the core
    ├── hooks/               # shared React hooks
    ├── lib/                 # cross-cutting primitives
    ├── providers/           # root context providers
    ├── services/            # shared data access
    ├── stores/              # Zustand client state
    ├── types/               # shared + generated types
    └── utils/               # pure helpers
```

---

### `src/app/` — Routing & composition

- **Why:** Next.js App Router. The URL-to-UI map and the server/client boundary.
- **Belongs:** `page.tsx`, `layout.tsx`, `route.ts`, `error.tsx`, `loading.tsx`,
  route groups (`(auth)`, `(game)`). Pages stay *thin* — compose feature
  components, do auth/redirect, pass params.
- **Never:** business logic, data-access code, large components, or Phaser
  imports. If a page grows logic, push it into a feature.

### `src/components/` — Shared UI

- **Why:** feature-agnostic, reusable presentation.
- **Belongs:** `ui/` primitives (Button, Input, Modal), `layout/` shell pieces.
- **Never:** feature/domain knowledge, data fetching, Supabase. Single-feature
  components live in that feature until a second consumer appears.

### `src/features/` — Vertical slices ← **the core**

- **Why:** group everything for one capability so it's added/removed as a unit.
- **Belongs:** `components/ hooks/ services/ schemas/ events/ types.ts index.ts`.
  Cross-feature imports go through `index.ts` only.
- **Never:** reach into another feature's internals; dump shared primitives here.
- See [`src/features/README.md`](../src/features/README.md). `_template/` is a
  copyable skeleton.

### `src/hooks/` — Shared hooks

- **Why:** reusable React behaviour used by many features (e.g.
  `useRealtimeChannel`).
- **Belongs:** generic hooks. **Never:** feature-specific hooks (those live in
  `features/<name>/hooks`).

### `src/lib/` — Cross-cutting primitives

- **Why:** foundational, app-agnostic infrastructure.
- **Belongs:** `env`, `logger`, `errors`, `eventBus`, `supabase/` clients.
- **Never:** feature logic, React components, anything domain-specific. `lib`
  may not import from `features/`, `app/`, or `stores/`.

### `src/providers/` — Root context

- **Why:** one place to wire app-wide React context in the right order.
- **Belongs:** `QueryProvider`, `AuthProvider`, `AppProviders` composition.
- **Never:** business logic or per-page providers.

### `src/services/` — Shared data access

- **Why:** the only layer that talks to Supabase; returns domain types.
- **Belongs:** cross-feature services (e.g. `profile.service`). See
  [`src/services/README.md`](../src/services/README.md).
- **Never:** React, Zustand, caching, JSX.

### `src/stores/` — Client state (Zustand)

- **Why:** synchronous client-only state many components read.
- **Belongs:** `authStore`, `uiStore`.
- **Never:** server data (React Query owns it), form state (React Hook Form).

### `src/types/` — Shared & generated types

- **Why:** one home for cross-feature types and the generated DB schema.
- **Belongs:** `database.types.ts` (generated), shared view models, barrels.
- **Never:** feature-local types (keep them in the feature).

### `src/utils/` — Pure helpers

- **Why:** small, pure, dependency-light functions (`cn`, formatters).
- **Never:** side effects, I/O, React, Supabase.

---

## Naming & conventions

- Files: components `PascalCase.tsx`; hooks `useX.ts`; services `x.service.ts`;
  schemas `x.schema.ts`; stores `xStore.ts`.
- Import alias `@/*` → `src/*` (see `tsconfig.json`).
- Each feature/module exposes a public API via `index.ts`; everything else is
  private.
