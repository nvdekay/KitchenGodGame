import { createClient } from '@/lib/supabase/client';
import { getAuthUser } from '@/services/profile.service';
import { AppError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import type { AuthUser } from '@/types/auth.types';
import type { SignupInput } from '../schemas/auth.schema';

const log = createLogger('feature:auth');

/**
 * Auth feature service — orchestrates Supabase Auth + profile hydration. UI
 * components call these and never touch Supabase directly.
 *
 * NOTE: sign-in lives in a server action (actions/sign-in.action.ts), not here,
 * so username→email resolution stays server-side and never leaks emails to the
 * browser. This module keeps the operations that are safe on the client.
 */

export async function signUp(input: SignupInput): Promise<void> {
  const supabase = createClient();
  // The DB trigger (see migration 0001) creates the profile + default 'player'
  // role from this metadata, so signup stays a single round-trip. If the email
  // OR username is taken, the insert/trigger fails and Supabase returns an error.
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { username: input.username } },
  });
  if (error) {
    log.warn('sign-up failed', { message: error.message });
    throw new AppError('CONFLICT', 'Email hoặc username đã được sử dụng.');
  }
  // Supabase auto-confirm signs the new account in immediately, but the product
  // flow is "register → log in yourself" (the /login?registered=1 banner).
  // Drop the session so the user isn't left half-signed-in on an auth route —
  // middleware would otherwise bounce a reload of /login over to /map.
  if (data.session) await supabase.auth.signOut();
}

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
