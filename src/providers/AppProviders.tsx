'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';

/**
 * Single composition point for all client-side providers. The root layout wraps
 * the app in this one component, so adding a provider later (theme, i18n,
 * feature flags) is a one-line change here — order matters: outer providers are
 * available to inner ones.
 *
 * MotionConfig `reducedMotion="user"` makes EVERY Framer Motion animation respect
 * the OS "reduce motion" setting app-wide.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </MotionConfig>
  );
}
