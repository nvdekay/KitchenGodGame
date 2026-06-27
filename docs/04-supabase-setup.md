# 4 · Supabase Setup Guide

## What Supabase provides here

- **Auth** — email/password (and OAuth-ready via `/auth/callback`).
- **Postgres + RLS** — `profiles`, `user_roles` foundation; gameplay tables come
  later as new migrations.
- **Realtime** — foundation hook (`useRealtimeChannel`) for future live features.

## Option A — Cloud project (recommended for 1 dev)

1. Create a project at <https://supabase.com>.
2. Copy **Project URL**, **anon key**, **service_role key** into `.env.local`.
3. Link & push migrations:

   ```bash
   npx supabase link --project-ref <ref>
   npm run db:push
   npm run db:types
   ```

4. **Auth settings** (Dashboard → Authentication → URL Configuration):
   - Site URL: `http://localhost:3000` (and your prod URL)
   - Redirect URLs: add `http://localhost:3000/auth/callback`
   - For fast local testing, disable email confirmations.

## Option B — Local stack (Supabase CLI + Docker)

```bash
npx supabase start        # boots Postgres, Auth, Studio, Realtime
npm run db:reset          # applies migrations into the local db
npm run db:types
```

Use the URL/keys the CLI prints in `.env.local`. Studio: <http://localhost:54323>.

## The foundation schema (`0001_init_foundation.sql`)

| Object               | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `auth.users`         | **Supabase-owned** identity table — we don't create it.        |
| `public.app_role`    | Enum: `player` \| `admin`.                                     |
| `public.profiles`    | 1:1 public profile per user (username, display name, avatar).  |
| `public.user_roles`  | 1 row per user; default `player`.                              |
| `has_role()`         | SECURITY DEFINER helper used inside RLS policies.              |
| `handle_new_user()`  | Trigger: auto-creates profile + default role on signup.        |

**RLS posture:** profiles readable by any authenticated user, editable only by
their owner; roles readable by self or admins; role *writes* never happen from
the client — only via the service-role key in trusted server code.

## Granting yourself `admin`

After signing up once, in Studio SQL editor (or `supabase db` shell):

```sql
update public.user_roles
set role = 'admin'
where user_id = (select id from auth.users where email = 'you@example.com');
```

Reload `/admin`.

## How auth flows through the app

```
Browser ─signIn()→ Supabase Auth ─sets cookie→ middleware.updateSession()
   │                                                   │ refreshes token every request
   ▼                                                   ▼
AuthProvider.onAuthStateChange → profile.service.getAuthUser() → authStore
```

- Client client: `lib/supabase/client.ts` (anon, RLS).
- Server client: `lib/supabase/server.ts` (cookie-bound, RLS) +
  `createAdminClient()` (service role, **bypasses RLS** — trusted server only).

## Adding gameplay tables later

Create a **new** migration (`0002_<feature>.sql`) — never edit `0001`. Enable RLS
on every new table from day one, regenerate types (`npm run db:types`), and keep
each feature's tables in its own migration so features stay independently
deletable. Details in [`06-future-expansion.md`](06-future-expansion.md).
