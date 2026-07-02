'use client';

import { useEffect, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAuthUser } from '@/services/profile.service';
import { useAuthStore } from '@/stores/authStore';
import { createLogger } from '@/lib/logger';

const log = createLogger('provider:auth');

/**
 * AuthProvider — hydrates the client auth store from the Supabase session and
 * keeps it in sync via `onAuthStateChange`. Mount once near the app root.
 *
 * It is the bridge between Supabase Auth (the provider) and the rest of the app
 * (which only knows the `AuthStore`). Nothing else subscribes to Supabase auth
 * state directly.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function hydrate(userId: string | undefined, email: string | null) {
      if (!userId) {
        if (active) setUser(null);
        return;
      }
      const authUser = await getAuthUser(supabase, { id: userId, email });
      if (active) setUser(authUser);
    }

    // Initial load.
    supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? 'loading' : 'unauthenticated');
      void hydrate(data.user?.id, data.user?.email ?? null);
    });

    // Keep in sync with sign-in/out/refresh happening anywhere.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      log.debug('auth state change', { event });
      void hydrate(session?.user?.id, session?.user?.email ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setUser, setStatus]);

  return <>{children}</>;
}
