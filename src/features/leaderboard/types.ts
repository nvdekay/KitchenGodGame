/** One row of the leaderboard (public-safe projection of player progress). */
export interface LeaderboardEntry {
  username: string;
  bestLevel: number;
  bestScore: number;
}
