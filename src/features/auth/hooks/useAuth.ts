'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAdmin, selectIsAuthenticated } from '@/stores/authStore';
import * as authService from '../services/auth.service';
import type { LoginInput, SignupInput } from '../schemas/auth.schema';

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

export function useSignIn() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.signIn(input),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries();
      router.push('/play');
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (input: SignupInput) => authService.signUp(input),
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
