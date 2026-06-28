import { QuizDashboard } from '@/features/quiz-tracking';

/** Admin quiz tracking — live progress matrix + fastest-finish ranking.
 *  Access is enforced by the /admin layout (requireAdmin); the data is read with
 *  the admin's client (RLS lets admins read every player's progress). */
export const dynamic = 'force-dynamic';

export default function AdminTrackingPage() {
  return <QuizDashboard />;
}
