'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel';
import { getLeaderboard } from '../services/leaderboard.service';

/**
 * Leaderboard data + LIVE updates. React Query owns the fetch/cache; a Supabase
 * Realtime subscription on player_progress invalidates the query whenever anyone
 * records progress, so the board refreshes for every (authenticated) viewer
 * without polling.
 *
 * Building on the generic useRealtimeChannel hook means this feature adds zero
 * realtime plumbing of its own.
 */
export function useLeaderboard(limit = 20) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => getLeaderboard(createClient(), limit),
  });

  // Stable config so the subscription isn't torn down/recreated each render.
  const config = useMemo(
    () => ({ event: '*', schema: 'public', table: 'player_progress' }),
    [],
  );

  useRealtimeChannel('leaderboard:player_progress', {
    event: 'postgres_changes',
    config,
    onMessage: () => qc.invalidateQueries({ queryKey: ['leaderboard'] }),
  });

  return query;
}
