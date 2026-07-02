'use client';

import { motion } from 'motion/react';

/**
 * Route-transition wrapper. Unlike a layout, a `template` re-mounts on every
 * navigation, so this fade-in plays each time the route changes — turning the
 * hard cut between pages into a smooth entrance. Applies to ALL navigation
 * (Link clicks and router.push alike): BẮT ĐẦU → /map, stage select → /play,
 * login → /map, etc.
 *
 * Opacity-only (no transform) so full-bleed pages never flash a gap or clip at
 * the edges during the transition. reducedMotion is handled app-wide by
 * MotionConfig (currently "never", so the transition always plays).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
