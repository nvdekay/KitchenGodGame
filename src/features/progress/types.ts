import type { AppRole } from '@/types/database.types';

/** A player's own progress snapshot (for the menu / HUD). */
export interface MyProgress {
  bestLevel: number;
  bestScore: number;
}

/** One row of the admin player-tracking table. */
export interface PlayerOverview {
  userId: string;
  username: string;
  role: AppRole;
  bestLevel: number;
  bestScore: number;
  lastPlayedAt: string | null;
}
