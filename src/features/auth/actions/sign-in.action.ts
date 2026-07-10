'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import { createLogger } from '@/lib/logger';
import type { AuthUser } from '@/types/auth.types';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';

const log = createLogger('feature:auth');

/**
 * Server-side sign-in.
 *
 * WHY server-side: username→email resolution must never expose emails to the
 * client. `get_email_for_username` is SECURITY DEFINER; leaving it callable by
 * `anon` let anyone enumerate usernames (via the public leaderboard) and then
 * harvest every player's email. Here the lookup runs through the service-role
 * client, so migration 0010 can revoke the anon grant — the email is resolved
 * and consumed entirely on the server and is never returned to the browser.
 *
 * The sign-in itself uses the request-bound SSR client so the rotated auth
 * cookies are written for middleware/SSR. The client store is hydrated from the
 * returned AuthUser (see useSignIn).
 */
async function resolveEmail(identifier: string): Promise<string | null> {
  const id = identifier.trim();
  if (id.includes('@')) return id;
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_email_for_username', { p_username: id });
  if (error) log.warn('username resolution failed', { message: error.message });
  return data ?? null;
}

export type SignInResult = { ok: true; user: AuthUser } | { ok: false; message: string };

export async function signInAction(input: LoginInput): Promise<SignInResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Thông tin đăng nhập không hợp lệ.' };

  const email = await resolveEmail(parsed.data.identifier);
  // Same generic error whether the username is unknown or the password is wrong
  // — never reveal which usernames/emails exist.
  if (!email) return { ok: false, message: 'Sai tài khoản hoặc mật khẩu.' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    log.warn('sign-in failed', { message: error?.message });
    return { ok: false, message: 'Sai tài khoản hoặc mật khẩu.' };
  }

  const user = await getAuthUser(supabase, { id: data.user.id, email: data.user.email ?? null });
  if (!user) return { ok: false, message: 'Không tìm thấy hồ sơ cho tài khoản này.' };

  return { ok: true, user };
}
