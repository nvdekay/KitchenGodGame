'use client';

import { Users, Trophy, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useQuizDashboard } from '../hooks/useQuizDashboard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { RankingTable } from './RankingTable';

const STAT_COLORS = {
  sky: 'bg-sky-600',
  amber: 'bg-amber-500',
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: keyof typeof STAT_COLORS;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <span
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white',
          STAT_COLORS[color],
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

/** Admin landing page after login: quick stats + the finish-time ranking, both
 *  driven by the same live quiz-tracking data as /admin/quiz (username-identified). */
export function LeaderboardOverview() {
  const { data, isLoading, isError, refetch } = useQuizDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="space-y-2 rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-red-700">Không tải được dữ liệu thống kê.</p>
        <button
          onClick={() => refetch()}
          className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Người chơi đã bắt đầu" value={data.players.length} icon={Users} color="sky" />
        <StatCard label="Đã hoàn thành" value={data.ranking.length} icon={Trophy} color="amber" />
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-800">
          <Trophy className="h-4 w-4 text-amber-500" aria-hidden /> Bảng xếp hạng
        </h2>
        <RankingTable ranking={data.ranking} />
      </section>
    </div>
  );
}
