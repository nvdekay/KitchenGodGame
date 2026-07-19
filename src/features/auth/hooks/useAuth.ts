'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAdmin, selectIsAuthenticated } from '@/stores/authStore';
import { AppError } from '@/lib/errors';
import * as authService from '../services/auth.service';
import { signInAction } from '../actions/sign-in.action';
import type { LoginInput } from '../schemas/auth.schema';

/**
 * The feature's React surface. Components import ONLY from here (and the
 * feature's index barrel) — never the service directly — so we can change the
 * data layer without touching UI.
 *
 * Split of responsibilities:
 *  - React Query  → async lifecycle (loading/error), cache invalidation.
 *  - Zustand      → synchronous "who am I" snapshot for instant reads in render.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);
  return { user, status, isAuthenticated, isAdmin };
}

export function useSignIn(redirectTo: string = '/map') {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      // Sign-in runs server-side so the username→email lookup never reaches the
      // browser (see signInAction). The auth cookies are set by the action.
      const res = await signInAction(input);
      if (!res.ok) throw new AppError('UNAUTHENTICATED', res.message);
      return res.user;
    },
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries();
      // Admins always land on the stats/leaderboard screen, ignoring any
      // bounced-back `redirectTo` — everyone else goes where they were headed.
      const target = user.role === 'admin' ? '/admin/leaderboard' : redirectTo;
      // Full navigation (not router.push) so the shared browser Supabase client
      // re-initialises from the freshly-set auth cookies — otherwise its
      // in-memory session stays anonymous and RLS-guarded reads on /map fail.
      window.location.assign(target);
    },
  });
}

export function useSignOut() {
  const reset = useAuthStore((s) => s.reset);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      reset();
      qc.clear();
      router.push('/login');
    },
  });
}
