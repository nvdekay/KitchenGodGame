import { createClient } from '@/lib/supabase/client';
import { getAuthUser } from '@/services/profile.service';
import type { AuthUser } from '@/types/auth.types';

/**
 * Auth feature service — orchestrates Supabase Auth + profile hydration. UI
 * components call these and never touch Supabase directly.
 *
 * NOTE: sign-in (and account auto-provisioning) lives in a server action
 * (actions/sign-in.action.ts), not here, so the derived credential never
 * reaches the browser. This module keeps the operations that are safe on the
 * client.
 */

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/** Resolve the current user from an existing session, or null. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return getAuthUser(supabase, { id: user.id, email: user.email ?? null });
}
