/** A player currently online, as seen by an observer (the admin dashboard). */
export interface OnlinePlayer {
  userId: string;
  username: string;
  /** Current gameplay level. */
  level: number;
  /** Active Phaser scene key (e.g. 'GameScene' | 'MenuScene') or null. */
  scene: string | null;
}

/** Shape of the presence payload each player tracks on the channel. */
export interface PresenceMeta {
  user_id: string;
  username: string;
  level: number;
  scene: string | null;
}

/** Shared channel name for the online-players presence channel. */
export const PRESENCE_CHANNEL = 'online-players';
