# `components/` — Shared, feature-agnostic UI

Presentational building blocks reused across **multiple** features.

- `components/ui/` — design-system primitives (Button, Input, Spinner, Modal).
  Dumb, stateless, no data fetching, no feature knowledge.
- `components/layout/` — app shell pieces (Header, Footer, Container).

**Never put here:** anything that knows about a specific feature's data or
domain (that belongs in `features/<name>/components`), or anything that fetches
from Supabase (that belongs in a service + hook). If a component is used by only
one feature, keep it in that feature until a second consumer appears.
