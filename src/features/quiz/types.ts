/** A stage as listed (no questions). */
export interface StageInfo {
  ord: number;
  title: string;
  description: string | null;
}

/** A stage plus the current player's status (for the stage-select map). */
export interface StageStatus extends StageInfo {
  completed: boolean;
  unlocked: boolean;
  completedAt: string | null;
}
