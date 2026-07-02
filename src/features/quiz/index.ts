/** PUBLIC API of the quiz feature. */
export { QuizGame } from './components/QuizGame';
export { useStageStatuses } from './hooks/useQuiz';
export { usePlayClock } from './hooks/usePlayClock';
export { fetchStageMarkerId, submitStageMarker } from './services/stage-marker.service';
export type { StageStatus, StageData, SubmitResult, PlayQuestion } from './types';
