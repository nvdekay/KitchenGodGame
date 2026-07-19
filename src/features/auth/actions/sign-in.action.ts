'use server';

import { createHash, createHmac } from 'node:crypto';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import { getServerEnv } from '@/lib/env';
import { createLogger } from '@/lib/logger';
import type { AuthUser } from '@/types/auth.types';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';

const log = createLogger('feature:auth');

/**
 * Passwordless, username-only sign-in that merges registration into login.
 *
 * Supabase Auth only authenticates by email+password, so a hidden credential
 * pair is derived DETERMINISTICALLY from the username (never shown to the
 * player, never stored — recomputed here from a server-only pepper each time):
 *  - email: a hash of the username in a fixed internal domain, so it's always
 *    valid email syntax no matter what characters the username contains.
 *  - password: an HMAC of the username keyed by AUTH_USERNAME_PEPPER.
 *
 * First login with a given username auto-provisions the account (via the
 * service-role admin client, which still runs the migration-0001 trigger that
 * creates the `profiles`/`user_roles` rows) and signs it straight in. This is
 * intentionally NOT real authentication — anyone who knows a username can log
 * in as that player — which was an explicit, agreed tradeoff for this
 * classroom game.
 */
function deriveCredentials(username: string): { email: string; password: string } {
  const key = username.trim().toLowerCase();
  const { AUTH_USERNAME_PEPPER } = getServerEnv();
  const emailLocal = createHash('sha256').update(key).digest('hex').slice(0, 32);
  const email = `p-${emailLocal}@players.internal`;
  const password = createHmac('sha256', AUTH_USERNAME_PEPPER).update(key).digest('hex');
  return { email, password };
}

export type SignInResult = { ok: true; user: AuthUser } | { ok: false; message: string };

export async function signInAction(input: LoginInput): Promise<SignInResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Username không hợp lệ.' };
  }

  const username = parsed.data.username;
  const { email, password } = deriveCredentials(username);

  const supabase = await createClient();
  let signIn = await supabase.auth.signInWithPassword({ email, password });

  if (signIn.error) {
    // Unknown username (or another sign-in failure) — try auto-provisioning.
    // If the account actually exists for another reason, createUser fails
    // with an "already registered" error and we fall through to the generic
    // failure message below.
    const admin = createAdminClient();
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });
    if (createError) {
      log.warn('auto-provision failed', { message: createError.message });
      return { ok: false, message: 'Không thể đăng nhập với username này, thử tên khác.' };
    }
    signIn = await supabase.auth.signInWithPassword({ email, password });
  }

  if (signIn.error || !signIn.data.user) {
    log.warn('sign-in failed', { message: signIn.error?.message });
    return { ok: false, message: 'Không thể đăng nhập với username này, thử tên khác.' };
  }

  const user = await getAuthUser(supabase, {
    id: signIn.data.user.id,
    email: signIn.data.user.email ?? null,
  });
  if (!user) return { ok: false, message: 'Không tìm thấy hồ sơ cho tài khoản này.' };

  return { ok: true, user };
}
