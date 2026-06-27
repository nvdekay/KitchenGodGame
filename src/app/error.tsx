'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createLogger } from '@/lib/logger';

const log = createLogger('app:error-boundary');

/**
 * Route-segment error boundary. Next.js renders this when a server/client
 * component throws. We log centrally and show a safe message — never the raw
 * error (it may contain internals). Per-feature boundaries can be added by
 * dropping an error.tsx in that route segment.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error('unhandled route error', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-neutral-600">An unexpected error occurred. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
