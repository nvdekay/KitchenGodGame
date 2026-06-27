import { create } from 'zustand';
import type { AuthStatus, AuthUser } from '@/types/auth.types';

/**
 * AuthStore — the single source of truth for "who is the current user" on the
 * client. Populated by AuthProvider on mount and by auth state-change events.
 *
 * Keep this lean: identity + status only. No data fetching here (that's React
 * Query's job); no business logic (that's the auth service's job). Components
 * read derived helpers like `isAdmin` instead of comparing roles inline.
 */

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  // actions
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  setUser: (user) =>
    set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
  setStatus: (status) => set({ status }),
  reset: () => set({ user: null, status: 'unauthenticated' }),
}));

// Selectors — import these instead of inlining role checks across the app.
export const selectIsAuthenticated = (s: AuthState) => s.status === 'authenticated';
export const selectIsAdmin = (s: AuthState) => s.user?.role === 'admin';
