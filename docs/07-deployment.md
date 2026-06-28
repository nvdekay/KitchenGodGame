# 7 · Deployment Guide (Vercel + Supabase)

Deploy the frontend to **Vercel** and use your existing **Supabase** project as
the backend. Estimated time: ~15 minutes.

> Prerequisite: code is pushed to GitHub (`nvdekay/KitchenGodGame`) and the local
> build is green (`npm run build`).

---

## Architecture in production

```
Browser ──HTTPS──► Vercel (Next.js: SSR, route handlers, middleware)
                      │  uses NEXT_PUBLIC_* (anon) + SUPABASE_SERVICE_ROLE_KEY (server only)
                      ▼
                   Supabase (Auth · Postgres + RLS · Realtime)
```

Vercel hosts the app; Supabase is unchanged (same project you already use
locally). Security stays in Postgres RLS, so exposing the anon key is fine.

---

## Step 1 — Pre-flight (already done / verify)

- [x] All migrations applied to Supabase (`0001`–`0004`).
- [x] `next` pinned to a patched `15.1.x` (security fix).
- [ ] `npm run build` passes locally (run it once more before deploying).

---

## Step 2 — Import the repo into Vercel

1. Go to <https://vercel.com/new> and **Import** `nvdekay/KitchenGodGame`.
2. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   output handled automatically — no `vercel.json` needed.
3. **Do not deploy yet** — add environment variables first (next step).

## Step 3 — Environment variables on Vercel

Project → **Settings → Environment Variables**. Add these for **Production**
(and Preview if you want PR previews):

| Key                             | Value                                   | Notes                          |
| ------------------------------- | --------------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | your Supabase Project URL               | same as local                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon/public key                    | same as local                  |
| `NEXT_PUBLIC_APP_URL`           | `https://<your-vercel-domain>`          | **the production URL**         |
| `NEXT_PUBLIC_LOG_LEVEL`         | `info`                                  | quieter logs in prod           |
| `SUPABASE_SERVICE_ROLE_KEY`     | your service_role key                   | **Secret — never `NEXT_PUBLIC`** |

> `src/lib/env.ts` validates these at boot, so a missing/misnamed var fails the
> build with a clear message instead of breaking at runtime.

Then click **Deploy**. You'll get a URL like `https://kitchen-god-game.vercel.app`.

If you set `NEXT_PUBLIC_APP_URL` only after the first deploy (because you didn't
know the domain yet), update it and **redeploy** so it takes effect.

## Step 4 — Point Supabase Auth at the production domain

Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL:** `https://<your-vercel-domain>`
- **Redirect URLs:** add `https://<your-vercel-domain>/auth/callback`
  (keep `http://localhost:3000/auth/callback` for local dev too)

Without this, OAuth / email-confirmation callbacks fail in production.

## Step 5 — Smoke test production

1. Open `https://<domain>/signup` → create a test account.
2. `https://<domain>/login` → sign in (username or email).
3. `https://<domain>/play` → clear a level → check `/leaderboard` updates.
4. Sign in as the admin user → `https://<domain>/admin` shows the live
   **online players** card; `/admin/users` shows progress.

`/sandbox` returns **404 in production by design** (it's a dev-only engine
preview) — that's expected, not a bug.

---

## CI/CD (automatic)

Vercel auto-deploys on push: `main` → Production, other branches/PRs → Preview
deployments. No extra setup. Database migrations are **not** auto-applied — when
you add a migration, run it against Supabase yourself (SQL Editor or
`supabase db push`) as part of releasing that change.

## Production checklist

- [ ] Env vars set on Vercel (service role marked Secret).
- [ ] `NEXT_PUBLIC_APP_URL` = real domain; redeployed if changed.
- [ ] Supabase Site URL + Redirect URL include the production domain.
- [ ] Email confirmation setting is what you want (on = users must confirm before
      login; off = instant login after signup).
- [ ] Signup → login → play → leaderboard → admin all work on the live URL.
- [ ] (Recommended) Rotate the service_role key if it was ever shared, and
      confirm it is **not** exposed via any `NEXT_PUBLIC_` var.

## Troubleshooting

| Symptom                                   | Fix                                                      |
| ----------------------------------------- | ------------------------------------------------------- |
| Build fails: "Invalid … environment variables" | A required env var is missing on Vercel.           |
| Redirected to `/login` forever            | `NEXT_PUBLIC_APP_URL` wrong, or Supabase redirect URL not set. |
| Auth callback fails                       | Add `https://<domain>/auth/callback` to Supabase redirect URLs. |
| Leaderboard/presence not live in prod     | Confirm Realtime is enabled and `player_progress` is in the `supabase_realtime` publication (migration 0004). |
| Admin page 403/redirects                  | The signed-in user lacks the `admin` role (see `docs/04`). |
