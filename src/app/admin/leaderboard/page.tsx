import { LeaderboardOverview } from '@/features/quiz-tracking';

/** Admin landing page after login: quick stats + the live leaderboard. Access
 *  is enforced by the /admin layout (requireAdmin). */
export default function AdminLeaderboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thống kê & Xếp hạng</h1>
        <p className="mt-1 text-neutral-600">Tổng quan người chơi và bảng xếp hạng trực tiếp.</p>
      </div>

      <LeaderboardOverview />
    </section>
  );
}
