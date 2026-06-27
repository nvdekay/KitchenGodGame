import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { clientEnv } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Refreshes the Supabase auth session on every request and (optionally) guards
 * routes. Called from the root middleware.ts. Keeping the logic here keeps the
 * top-level middleware thin and testable.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with Supabase. Do not replace
  // with getSession() for auth decisions — that only reads the (spoofable) cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Route protection rules. Extend as new protected areas are added.
  const isAuthRoute = pathname.startsWith('/login');
  const isProtected =
    pathname.startsWith('/play') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/account');

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/play';
    return NextResponse.redirect(url);
  }

  // NOTE: role-based gating (admin) is enforced in the /admin layout + RLS, not
  // here — middleware should stay fast and not query the profiles table.
  return response;
}
