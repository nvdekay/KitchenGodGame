import type { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * The exact typed Supabase client our factories produce. Derived from the SSR
 * factory so it tracks the library's generic signature automatically (it changed
 * shape across minor versions). Services accept THIS type, so the same code runs
 * against the browser and server clients without manual generic juggling.
 */
export type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;
