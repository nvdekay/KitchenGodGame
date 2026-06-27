'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { eventBus, AppEvents } from '@/lib/eventBus';
import { createLogger } from '@/lib/logger';

const log = createLogger('realtime');

/**
 * Generic Supabase Realtime subscription hook — the foundation for any future
 * realtime feature (presence, live leaderboards, co-op, chat). Features build
 * ON this rather than each wiring channels by hand.
 *
 * It manages the channel lifecycle (subscribe on mount, remove on unmount) and
 * announces connection status on the app bus. Pass a stable `event`/`handler`.
 *
 * Example (a future leaderboard feature):
 *   useRealtimeChannel('leaderboard', {
 *     event: 'postgres_changes',
 *     config: { event: '*', schema: 'public', table: 'scores' },
 *     onMessage: (payload) => qc.invalidateQueries({ queryKey: ['leaderboard'] }),
 *   });
 */
interface RealtimeOptions {
  /** Realtime mechanism: 'broadcast' | 'presence' | 'postgres_changes'. */
  event: 'broadcast' | 'presence' | 'postgres_changes';
  config?: Record<string, unknown>;
  onMessage: (payload: unknown) => void;
  enabled?: boolean;
}

export function useRealtimeChannel(channelName: string, options: RealtimeOptions) {
  const { event, config, onMessage, enabled = true } = options;
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel: RealtimeChannel = supabase.channel(channelName);

    // `on` overloads vary by event type; cast keeps this generic wrapper simple.
    (channel.on as (e: string, c: unknown, cb: (p: unknown) => void) => RealtimeChannel)(
      event,
      config ?? {},
      (payload) => handlerRef.current(payload),
    );

    channel.subscribe((status) => {
      log.debug('channel status', { channelName, status });
      if (status === 'SUBSCRIBED') {
        eventBus.emit(AppEvents.REALTIME_CONNECTED, { channel: channelName });
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        eventBus.emit(AppEvents.REALTIME_DISCONNECTED, { channel: channelName });
      }
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelName, event, config, enabled]);
}
