/**
 * PUBLIC API of the progress feature (CLIENT-SAFE only).
 *
 * The admin listing lives in `services/progress.admin.ts` and is imported
 * directly by the admin page — it is server-only (service-role client), so it is
 * intentionally NOT re-exported here to avoid pulling server code into client
 * bundles.
 */
export { PlayClient } from './components/PlayClient';
export { useTrackProgress } from './hooks/useTrackProgress';
export { getMyProgress, recordLevelProgress } from './services/progress.service';
export type { MyProgress, PlayerOverview } from './types';
