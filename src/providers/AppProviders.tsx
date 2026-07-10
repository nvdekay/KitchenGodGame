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
 * MotionConfig `reducedMotion="user"` respects the OS "reduce motion" setting:
 * for those users Framer disables transform/layout animations (the bouncing
 * Táo, swaying scroll, spring pop-ins, sliding entrances) while still animating
 * opacity/colour, so essential fades and loading feedback keep working. The
 * one motion not covered by this — the rAF-driven answer-card drift in chặng 1
 * — is gated separately with `useReducedMotion()` inside CardMarquee.
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
