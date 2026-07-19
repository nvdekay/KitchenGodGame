import { z } from 'zod';

/**
 * Centralized, validated environment access.
 *
 * WHY: env vars accessed ad-hoc via `process.env.X` are stringly-typed, can be
 * undefined at runtime, and leak server secrets into client bundles by accident.
 * Here we validate once at module load and expose typed objects. Importing the
 * wrong one (server env in a client component) fails the build.
 *
 * RULE: anything read in the browser MUST be prefixed `NEXT_PUBLIC_`.
 */

// `?? undefined`-style preprocess: deployments sometimes define a var as an
// EMPTY string (Vercel dashboard quirk) — treat that the same as unset so
// optional()/default() apply instead of failing validation and the build.
const emptyAsUndefined = (v: unknown) => (v === '' ? undefined : v);

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  /**
   * OPTIONAL absolute origin override. The app derives its origin from each
   * request (see auth/callback), so deployments (Vercel/preview) don't need to
   * set this — requiring it used to break `next build` on Vercel.
   */
  NEXT_PUBLIC_APP_URL: z.preprocess(emptyAsUndefined, z.string().url().optional()),
  NEXT_PUBLIC_LOG_LEVEL: z.preprocess(
    emptyAsUndefined,
    z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  /**
   * Secret pepper used to deterministically derive the hidden Supabase Auth
   * password from a player's username (see features/auth/actions/sign-in
   * .action). Never exposed to the client; rotating it invalidates every
   * existing player's derived credential (they'd need a new account).
   */
  AUTH_USERNAME_PEPPER: z.string().min(16),
});

// Next.js statically replaces NEXT_PUBLIC_* references, so we must read them
// as explicit property accesses (not via a dynamic loop).
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
});

if (!clientParsed.success) {
  throw new Error(
    `❌ Invalid public environment variables:\n${clientParsed.error.toString()}`,
  );
}

export const clientEnv = clientParsed.data;

/**
 * Server-only env. Lazily validated so client bundles never evaluate it.
 * Call inside server code (route handlers, server actions, server components).
 */
export function getServerEnv() {
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AUTH_USERNAME_PEPPER: process.env.AUTH_USERNAME_PEPPER,
  });
  if (!parsed.success) {
    throw new Error(
      `❌ Invalid server environment variables:\n${parsed.error.toString()}`,
    );
  }
  return parsed.data;
}
