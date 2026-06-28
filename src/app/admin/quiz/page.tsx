import { QuizManager } from '@/features/quiz-admin';

/** Admin quiz content management. Access is enforced by the /admin layout
 *  (requireAdmin) and again by RLS (admin-only writes on stages/questions). */
export default function AdminQuizPage() {
  return <QuizManager />;
}
