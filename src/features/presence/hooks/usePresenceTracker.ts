'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { PRESENCE_CHANNEL, type PresenceMeta } from '../types';

/**
 * PLAYER side of presence. While mounted (on /play) it joins the shared presence
 * channel and publishes the player's live state — username + current level +
 * active scene — re-publishing whenever the level/scene changes.
 *
 * Presence is pure Realtime (no DB table): each client `track()`s its own state
 * and every subscriber sees the synced set. Leaving the page auto-removes the
 * entry, so "online" reflects real connectivity.
 */
export function usePresenceTracker({ userId, username }: { userId: string; username: string }) {
  const level = useGameStore((s) => s.level);
  const scene = useGameStore((s) => s.activeScene);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: userId } },
    });
    channelRef.current = channel;

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        joinedRef.current = true;
        const s = useGameStore.getState();
        const payload: PresenceMeta = {
          user_id: userId,
          username,
          level: s.level,
          scene: s.activeScene,
        };
        void channel.track(payload);
      }
    });

    return () => {
      joinedRef.current = false;
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [userId, username]);

  // Re-publish on gameplay changes (only once the channel has joined).
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel || !joinedRef.current) return;
    const payload: PresenceMeta = { user_id: userId, username, level, scene };
    void channel.track(payload);
  }, [level, scene, userId, username]);
}
