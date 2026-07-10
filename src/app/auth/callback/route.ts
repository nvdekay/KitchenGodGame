import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / email-confirmation callback. Supabase redirects here with a `code`
 * which we exchange for a session cookie, then forward the user on. In the
 * Supabase dashboard, add `<your-deployed-origin>/auth/callback` to the Auth
 * redirect URLs (the origin is derived from the request — no env var needed).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Only accept internal, single-slash paths — never an absolute/external URL —
  // so `?redirectTo=@evil.com` (or `//evil.com`) can't turn login into an
  // off-site redirect. Mirrors the login page's guard.
  const rawRedirect = searchParams.get('redirectTo') ?? '/map';
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/map';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
