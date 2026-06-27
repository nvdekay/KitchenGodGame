import { createClient } from '@/lib/supabase/client';
import { getAuthUser } from '@/services/profile.service';
import { AppError } from '@/lib/errors';
import { eventBus, AppEvents } from '@/lib/eventBus';
import { createLogger } from '@/lib/logger';
import type { AuthUser } from '@/types/auth.types';
import type { LoginInput, SignupInput } from '../schemas/auth.schema';

const log = createLogger('feature:auth');

/**
 * Auth feature service — orchestrates Supabase Auth + profile hydration and
 * announces auth lifecycle on the app event bus. UI components call these and
 * never touch Supabase directly.
 */

export async function signIn(input: LoginInput): Promise<AuthUser> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error || !data.user) {
    log.warn('sign-in failed', { message: error?.message });
    throw new AppError('UNAUTHENTICATED', 'Invalid email or password.');
  }

  const user = await getAuthUser(supabase, {
    id: data.user.id,
    email: data.user.email ?? null,
  });
  if (!user) throw new AppError('NOT_FOUND', 'Profile not found for this account.');

  eventBus.emit(AppEvents.USER_LOGIN, { userId: user.id });
  return user;
}

export async function signUp(input: SignupInput): Promise<void> {
  const supabase = createClient();
  // The DB trigger (see migration) creates the profile + default 'player' role
  // from this metadata, so signup stays a single round-trip.
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { username: input.username } },
  });
  if (error) throw new AppError('CONFLICT', error.message);
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  eventBus.emit(AppEvents.USER_LOGOUT, { userId: data.user?.id ?? null });
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
