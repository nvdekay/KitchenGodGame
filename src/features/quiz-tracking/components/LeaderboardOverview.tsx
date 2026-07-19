'use client';

import { useQuizDashboard } from '../hooks/useQuizDashboard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { RankingTable } from './RankingTable';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border bg-white p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

/** Admin landing page: quick stats + the finish-time ranking, both driven by
 *  the same live quiz-tracking data as /admin/quiz (username-identified). */
export function LeaderboardOverview() {
  const { data, isLoading, isError, refetch } = useQuizDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">Không tải được dữ liệu thống kê.</p>
        <button onClick={() => refetch()} className="text-sm font-medium text-brand">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Người chơi đã bắt đầu" value={data.players.length} />
        <StatCard label="Đã hoàn thành" value={data.ranking.length} />
      </div>

      <section>
        <h2 className="mb-2 font-semibold">🏆 Bảng xếp hạng</h2>
        <RankingTable ranking={data.ranking} />
      </section>
    </div>
  );
}
