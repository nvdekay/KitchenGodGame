import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/auth.types';
import type { Database, AppRole } from '@/types/database.types';
import { createLogger } from '@/lib/logger';

const log = createLogger('service:profile');

type DB = SupabaseClient<Database>;

/**
 * Profile/role data access. Accepts a Supabase client by dependency injection so
 * the SAME code works on the server (cookie-bound) and the browser (anon) — the
 * caller decides which client to pass. This keeps the service runtime-agnostic.
 */

/**
 * Hydrate the app's canonical AuthUser from auth identity + profile + role.
 * Returns null if there is no profile row yet (e.g. mid-signup).
 */
export async function getAuthUser(
  db: DB,
  identity: { id: string; email: string | null },
): Promise<AuthUser | null> {
  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    db
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', identity.id)
      .maybeSingle(),
    db.from('user_roles').select('role').eq('user_id', identity.id).maybeSingle(),
  ]);

  if (!profile) {
    log.warn('no profile row for authenticated user', { userId: identity.id });
    return null;
  }

  const role: AppRole = roleRow?.role ?? 'player';

  return {
    id: identity.id,
    email: identity.email,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    role,
  };
}
