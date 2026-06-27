'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PRESENCE_CHANNEL, type OnlinePlayer, type PresenceMeta } from '../types';

/**
 * OBSERVER side of presence (the admin dashboard). Subscribes to the presence
 * channel but does NOT track itself, so the observer never appears as a player.
 * Returns the synced list of online players, recomputed on every join/leave/sync.
 */
export function useOnlinePlayers(): OnlinePlayer[] {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);

  useEffect(() => {
    const supabase = createClient();
    // A distinct key + no track() => we observe without joining the player set.
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: 'admin-observer' } },
    });

    const sync = () => {
      const state = channel.presenceState<PresenceMeta>();
      const list: OnlinePlayer[] = [];
      for (const metas of Object.values(state)) {
        const meta = metas.at(-1); // latest meta for this presence key
        if (meta) {
          list.push({
            userId: meta.user_id,
            username: meta.username,
            level: meta.level,
            scene: meta.scene,
          });
        }
      }
      list.sort((a, b) => b.level - a.level || a.username.localeCompare(b.username));
      setPlayers(list);
    };

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return players;
}
