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
 * MotionConfig `reducedMotion="never"` keeps Framer Motion animations playing
 * app-wide regardless of the OS "reduce motion" setting — the ambient game
 * motion (bouncing Táo, swaying scroll, map arrows) is core to the experience.
 * Switch back to "user" if strict accessibility respect is preferred.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="never">
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </MotionConfig>
  );
}
