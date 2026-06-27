# `services/` — Cross-feature data access

A **service** is a thin, framework-agnostic module that talks to an external
system (Supabase, a REST API, Realtime) and returns typed domain objects. It is
the ONLY place allowed to import a Supabase client.

## Rules

- **Pure-ish & UI-free.** No React, no JSX, no Zustand. A service must be
  callable from a server action, a route handler, or a React Query hook alike.
- **Return domain types, not DB rows.** Map `Database['public']['Tables']…Row`
  into the app's view models (e.g. `AuthUser`). The rest of the app never sees a
  raw row, so a schema change ripples through one mapper, not fifty components.
- **Throw typed errors.** Use `AppError` from `@/lib/errors` so callers can map
  to HTTP/UX without string-matching.
- **No caching here.** Caching/retries/optimistic updates are React Query's job
  in the hook layer.

## Where things go

| Concern                                   | Location                                  |
| ----------------------------------------- | ----------------------------------------- |
| Shared, cross-feature services            | `src/services/*` (this folder)            |
| Feature-specific services                 | `src/features/<feature>/services/*`       |
| The React Query hooks that call a service | `src/features/<feature>/hooks/*` or `src/hooks` |

When a feature's service is used by ONLY that feature, keep it inside the
feature. Promote it here only once a second feature needs it.
