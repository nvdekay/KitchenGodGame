'use client';

import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { eventBus, AppEvents } from '@/lib/eventBus';
import { recordLevelProgress } from '../services/progress.service';

/**
 * Bridges gameplay → persistence. Subscribes to the app bus LEVEL_COMPLETED
 * event (emitted by the game bridge) and saves it for the signed-in user.
 *
 * This is the clean seam the architecture is built around: Phaser knows nothing
 * about Supabase; it just announces "level completed", and this React-side
 * listener persists it. Adding analytics/achievements later means adding more
 * listeners here — not touching the game.
 */
export function useTrackProgress() {
  const save = useMutation({
    mutationFn: ({ level, score }: { level: number; score: number }) =>
      recordLevelProgress(createClient(), level, score),
  });

  useEffect(() => {
    return eventBus.on(AppEvents.LEVEL_COMPLETED, ({ level, score }) => {
      save.mutate({ level, score });
    });
    // `save` is stable enough for this fire-and-forget subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
