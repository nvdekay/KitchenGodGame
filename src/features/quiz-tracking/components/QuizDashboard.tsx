'use client';

import { cn } from '@/utils/cn';
import { useQuizDashboard } from '../hooks/useQuizDashboard';

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Admin tracking: live finish-time ranking + a player × stage progress matrix. */
export function QuizDashboard() {
  const { data, isLoading } = useQuizDashboard();

  if (isLoading) return <p className="text-neutral-500">Đang tải…</p>;
  const d = data!;
  const medal = ['🥇', '🥈', '🥉'];

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
        {d.ranking.length === 0 ? (
          <p className="text-sm text-neutral-500">Chưa ai hoàn thành tất cả các chặng.</p>
        ) : (
          <div className="overflow-hidden rounded border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-left">
                <tr>
                  <th className="w-16 px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Người chơi</th>
                  <th className="px-3 py-2 font-medium">Tổng thời gian</th>
                </tr>
              </thead>
              <tbody>
                {d.ranking.map((p, i) => (
                  <tr key={p.userId} className={cn('border-t', i === 0 && 'bg-amber-50')}>
                    <td className="px-3 py-2">{medal[i] ?? i + 1}</td>
                    <td className="px-3 py-2 font-medium">{p.username}</td>
                    <td className="px-3 py-2 tabular-nums">{formatDuration(p.elapsedMs as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
