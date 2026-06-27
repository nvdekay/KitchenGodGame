import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import type { AuthUser } from '@/types/auth.types';

/**
 * Server-side admin gate. Call at the top of the /admin layout (and any admin
 * server action). Defense in depth: middleware already requires a session, RLS
 * protects the data, and THIS enforces the role before rendering admin UI.
 *
 * Returns the admin user so the layout can greet them without a second fetch.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/admin');

  const authUser = await getAuthUser(supabase, { id: user.id, email: user.email ?? null });
  if (!authUser || authUser.role !== 'admin') redirect('/play');

  return authUser;
}
