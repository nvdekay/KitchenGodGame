'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { PRESENCE_CHANNEL, type PresenceMeta } from '../types';

/**
 * PLAYER side of presence. While mounted (on /play) it joins the shared presence
 * channel and publishes the player's live state — username + which quiz stage
 * they currently have open — re-publishing whenever the stage changes.
 *
 * Presence is pure Realtime (no DB table): each client `track()`s its own state
 * and every subscriber sees the synced set. Leaving the page auto-removes the
 * entry, so "online" reflects real connectivity.
 */
export function usePresenceTracker({
  userId,
  username,
  stage,
}: {
  userId: string;
  username: string;
  stage: number | null;
}) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const joinedRef = useRef(false);
  const stageRef = useRef(stage);
  stageRef.current = stage;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: userId } },
    });
    channelRef.current = channel;

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        joinedRef.current = true;
        const payload: PresenceMeta = { user_id: userId, username, stage: stageRef.current };
        void channel.track(payload);
      }
    });

    return () => {
      joinedRef.current = false;
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [userId, username]);

  // Re-publish when the open stage changes (only once joined).
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel || !joinedRef.current) return;
    const payload: PresenceMeta = { user_id: userId, username, stage };
    void channel.track(payload);
  }, [stage, userId, username]);
}
