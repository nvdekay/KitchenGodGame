'use client';

import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Browser Supabase client (anon key, RLS-enforced).
 *
 * Used by client components, hooks, stores and Realtime subscriptions.
 * Safe to bundle — the anon key is public by design; security lives in RLS.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
