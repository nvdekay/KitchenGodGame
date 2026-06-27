import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { clientEnv, getServerEnv } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Server Supabase client (per-request, cookie-bound, RLS-enforced).
 *
 * Use inside server components, route handlers and server actions. Reads/writes
 * the auth cookie so SSR sees the logged-in user. NEVER import in client code.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` from a Server Component is a no-op (read-only). The
            // middleware refreshes the session cookie, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Privileged client using the service-role key (BYPASSES RLS).
 *
 * Only for trusted server-side admin operations (e.g. listing all users in the
 * admin dashboard). Never expose results without your own authorization check.
 */
export function createAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
