'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Per-attempt countdown. Ticks down once a second while `running`; resets to
 * `seconds` whenever `resetKey` changes (i.e. a new attempt); fires `onExpire`
 * exactly once when it reaches 0. The latest `onExpire` is always used, so it can
 * close over fresh state without re-arming the timer.
 */
export function useCountdown({
  seconds,
  running,
  resetKey,
  onExpire,
}: {
  seconds: number;
  running: boolean;
  resetKey: unknown;
  onExpire: () => void;
}): number {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const firedRef = useRef(false);

  // New attempt → reset.
  useEffect(() => {
    setRemaining(seconds);
    firedRef.current = false;
  }, [resetKey, seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onExpireRef.current();
      }
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [running, remaining]);

  return remaining;
}
