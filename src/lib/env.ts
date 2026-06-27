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

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
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
  });
  if (!parsed.success) {
    throw new Error(
      `❌ Invalid server environment variables:\n${parsed.error.toString()}`,
    );
  }
  return parsed.data;
}
