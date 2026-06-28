import type { QuestionType } from '@/types/database.types';

export type { QuestionType };

/** A stage as listed (no questions). */
export interface StageInfo {
  ord: number;
  title: string;
  description: string | null;
}

/** A question as delivered to the player — NEVER includes the correct answer. */
export interface PlayQuestion {
  id: string;
  ord: number;
  type: QuestionType;
  prompt: string;
  options: string[];
}

/** Full stage payload returned by get_stage(). */
export interface StageData {
  ord: number;
  title: string;
  description: string | null;
  questions: PlayQuestion[];
}

/** Result of submit_stage(). */
export interface SubmitResult {
  passed: boolean;
  correct: number;
  total: number;
}

/** A stage plus the current player's status (for the stage-select screen). */
export interface StageStatus extends StageInfo {
  completed: boolean;
  unlocked: boolean;
  completedAt: string | null;
}

/** Answers a player submits: question id → selected option indices. */
export type AnswerMap = Record<string, number[]>;
