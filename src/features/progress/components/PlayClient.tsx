'use client';

import { GameCanvas } from '@/game';
import { useTrackProgress } from '../hooks/useTrackProgress';

/**
 * Client wrapper for the authenticated /play route. It mounts the game (passing
 * the player's identity + best level into the engine) and activates progress
 * tracking so completed levels are persisted. The page stays a server component
 * that fetches data and hands it here.
 */
export function PlayClient({ username, bestLevel }: { username: string; bestLevel: number }) {
  useTrackProgress();
  return <GameCanvas username={username} bestLevel={bestLevel} />;
}
