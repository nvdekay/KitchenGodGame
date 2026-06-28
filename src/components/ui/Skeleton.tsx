import { cn } from '@/utils/cn';

/**
 * Base skeleton block — a pulsing placeholder. Compose these into layout-shaped
 * skeletons so loading states match the real content (no layout shift on load).
 * The pulse stops automatically for users who prefer reduced motion (global CSS).
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded bg-neutral-200/80', className)} />;
}
