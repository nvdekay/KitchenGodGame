'use client';

import { Activity, CheckCircle2 } from 'lucide-react';
import { useQuizDashboard } from '../hooks/useQuizDashboard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { RankingTable } from './RankingTable';

/** Admin tracking: live finish-time ranking + a player × stage progress matrix. */
export function QuizDashboard() {
  const { data, isLoading, isError, refetch } = useQuizDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="space-y-2 rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-red-700">Không tải được dữ liệu theo dõi.</p>
        <button
          onClick={() => refetch()}
          className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
        >
          Thử lại
        </button>
      </div>
    );
  }
  const d = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Activity className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Theo dõi quiz</h1>
          <p className="flex items-center gap-1.5 text-sm text-neutral-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Cập nhật trực tiếp
          </p>
        </div>
      </div>

      {/* Ranking by total time */}
      <section>
        <h2 className="mb-3 font-semibold text-neutral-800">🏆 Hoàn thành nhanh nhất</h2>
        <RankingTable ranking={d.ranking} />
      </section>

      {/* Progress matrix */}
      <section>
        <h2 className="mb-3 font-semibold text-neutral-800">Tiến độ theo chặng</h2>
        {d.players.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            Chưa có người chơi nào bắt đầu.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50 text-left text-neutral-500">
                  <th className="px-4 py-3 font-medium">Người chơi</th>
                  {d.stageOrds.map((ord) => (
                    <th key={ord} className="px-3 py-3 text-center font-medium">
                      C{ord}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-medium">Xong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {d.players.map((p) => (
                  <tr key={p.userId} className="transition hover:bg-emerald-50/40">
                    <td className="px-4 py-3 font-medium text-neutral-800">{p.username}</td>
                    {d.stageOrds.map((ord) => {
                      const at = p.completedStages[ord];
                      return (
                        <td key={ord} className="px-3 py-3 text-center">
                          {at ? (
                            <span
                              title={new Date(at).toLocaleString('vi-VN')}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                            >
                              <CheckCircle2 className="h-4 w-4" aria-hidden />
                            </span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      {p.finishedAt ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          🎉 Xong
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-neutral-400">
                          {Object.keys(p.completedStages).length}/{d.stageOrds.length}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
