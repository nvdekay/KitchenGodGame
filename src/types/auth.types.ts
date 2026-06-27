import type { AppRole } from './database.types';

export type { AppRole };

/**
 * The app's canonical "current user" shape. We deliberately DO NOT pass raw
 * Supabase `User` objects around the app — we map to this lean view model so the
 * rest of the codebase is insulated from auth-provider details.
 */
export interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: AppRole;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
