import { Trophy } from 'lucide-react';
import { LeaderboardOverview } from '@/features/quiz-tracking';

/** Admin landing page after login: quick stats + the live leaderboard. Access
 *  is enforced by the /admin layout (requireAdmin). */
export default function AdminLeaderboardPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Trophy className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Thống kê & Xếp hạng</h1>
          <p className="text-sm text-neutral-500">Tổng quan người chơi và bảng xếp hạng trực tiếp.</p>
        </div>
      </div>

      <LeaderboardOverview />
    </section>
  );
}
