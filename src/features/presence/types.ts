/** A player currently online, as seen by an observer (the admin dashboard). */
export interface OnlinePlayer {
  userId: string;
  username: string;
  /** Quiz stage the player currently has open, or null if on the stage list. */
  stage: number | null;
}

/** Shape of the presence payload each player tracks on the channel. */
export interface PresenceMeta {
  user_id: string;
  username: string;
  stage: number | null;
}

/** Shared channel name for the online-players presence channel. */
export const PRESENCE_CHANNEL = 'online-players';
