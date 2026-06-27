'use client';

import { GameCanvas } from '@/game';
import { usePresenceTracker } from '@/features/presence';
import { useTrackProgress } from '../hooks/useTrackProgress';

/**
 * Client wrapper for the authenticated /play route. It mounts the game (passing
 * the player's identity + best level into the engine), persists completed levels
 * (useTrackProgress), and publishes live presence so admins can see who is
 * online and on which level (usePresenceTracker).
 */
export function PlayClient({
  userId,
  username,
  bestLevel,
}: {
  userId: string;
  username: string;
  bestLevel: number;
}) {
  useTrackProgress();
  usePresenceTracker({ userId, username });
  return <GameCanvas username={username} bestLevel={bestLevel} />;
}
