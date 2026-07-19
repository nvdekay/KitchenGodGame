'use client';

import { useQuizDashboard } from '../hooks/useQuizDashboard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { RankingTable } from './RankingTable';

/** Admin tracking: live finish-time ranking + a player × stage progress matrix. */
export function QuizDashboard() {
  const { data, isLoading, isError, refetch } = useQuizDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">Không tải được dữ liệu theo dõi.</p>
        <button onClick={() => refetch()} className="text-sm font-medium text-brand">
          Thử lại
        </button>
      </div>
    );
  }
  const d = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <h1 className="text-2xl font-bold">Theo dõi quiz</h1>
        <span className="text-sm text-neutral-500">· cập nhật trực tiếp</span>
      </div>

      {/* Ranking by total time */}
      <section>
        <h2 className="mb-2 font-semibold">🏆 Hoàn thành nhanh nhất</h2>
        <RankingTable ranking={d.ranking} />
      </section>

      {/* Progress matrix */}
      <section>
        <h2 className="mb-2 font-semibold">Tiến độ theo chặng</h2>
        {d.players.length === 0 ? (
          <p className="text-sm text-neutral-500">Chưa có người chơi nào bắt đầu.</p>
        ) : (
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Người chơi</th>
                  {d.stageOrds.map((ord) => (
                    <th key={ord} className="px-3 py-2 text-center font-medium">
                      C{ord}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium">Xong</th>
                </tr>
              </thead>
              <tbody>
                {d.players.map((p) => (
                  <tr key={p.userId} className="border-t">
                    <td className="px-3 py-2 font-medium">{p.username}</td>
                    {d.stageOrds.map((ord) => {
                      const at = p.completedStages[ord];
                      return (
                        <td key={ord} className="px-3 py-2 text-center">
                          {at ? (
                            <span
                              className="text-green-600"
                              title={new Date(at).toLocaleString('vi-VN')}
                            >
                              ✓
                            </span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      {p.finishedAt ? (
                        <span className="text-green-600">🎉</span>
                      ) : (
                        <span className="text-xs text-neutral-400">
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
