import { cn } from '@/utils/cn';
import type { PlayerRow } from '../services/quiz-tracking.service';

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const RANK_BADGE = [
  'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-sm shadow-amber-300/50',
  'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800',
  'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950',
];

/** Finish-time ranking table: username + total active play time, fastest first. */
export function RankingTable({ ranking }: { ranking: PlayerRow[] }) {
  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
        Chưa ai hoàn thành tất cả các chặng.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-amber-50 to-white text-left text-neutral-500">
            <th className="w-16 px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Người chơi</th>
            <th className="px-4 py-3 font-medium">Tổng thời gian</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {ranking.map((p, i) => (
            <tr key={p.userId} className={cn('transition hover:bg-amber-50/40', i === 0 && 'bg-amber-50/60')}>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    RANK_BADGE[i] ?? 'bg-neutral-100 text-neutral-500',
                  )}
                >
                  {i + 1}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-neutral-800">{p.username}</td>
              <td className="px-4 py-3 tabular-nums text-neutral-600">{formatDuration(p.elapsedMs as number)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
