import { createClient } from '@/lib/supabase/client';
import { getAuthUser } from '@/services/profile.service';
import { AppError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import type { AuthUser } from '@/types/auth.types';
import type { LoginInput, SignupInput } from '../schemas/auth.schema';

const log = createLogger('feature:auth');

/**
 * Auth feature service — orchestrates Supabase Auth + profile hydration and
 * announces auth lifecycle on the app event bus. UI components call these and
 * never touch Supabase directly.
 */

/**
 * Resolve the login identifier to an email. If it already looks like an email we
 * use it directly; otherwise we treat it as a username and ask the DB function
 * for the matching email (Supabase Auth can't authenticate by username).
 */
async function resolveEmail(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
): Promise<string | null> {
  if (identifier.includes('@')) return identifier;
  const { data, error } = await supabase.rpc('get_email_for_username', {
    p_username: identifier,
  });
  if (error) log.warn('username resolution failed', { message: error.message });
  return data ?? null;
}

export async function signIn(input: LoginInput): Promise<AuthUser> {
  const supabase = createClient();

  const email = await resolveEmail(supabase, input.identifier.trim());
  // Same generic error whether the username is unknown or the password is wrong
  // — never reveal which usernames/emails exist.
  if (!email) throw new AppError('UNAUTHENTICATED', 'Sai tài khoản hoặc mật khẩu.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error || !data.user) {
    log.warn('sign-in failed', { message: error?.message });
    throw new AppError('UNAUTHENTICATED', 'Sai tài khoản hoặc mật khẩu.');
  }

  const user = await getAuthUser(supabase, {
    id: data.user.id,
    email: data.user.email ?? null,
  });
  if (!user) throw new AppError('NOT_FOUND', 'Profile not found for this account.');

  return user;
}

export async function signUp(input: SignupInput): Promise<void> {
  const supabase = createClient();
  // The DB trigger (see migration 0001) creates the profile + default 'player'
  // role from this metadata, so signup stays a single round-trip. If the email
  // OR username is taken, the insert/trigger fails and Supabase returns an error.
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { username: input.username } },
  });
  if (error) {
    log.warn('sign-up failed', { message: error.message });
    throw new AppError('CONFLICT', 'Email hoặc username đã được sử dụng.');
  }
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
