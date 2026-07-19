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

const MEDAL = ['🥇', '🥈', '🥉'];

/** Finish-time ranking table: username + total active play time, fastest first. */
export function RankingTable({ ranking }: { ranking: PlayerRow[] }) {
  if (ranking.length === 0) {
    return <p className="text-sm text-neutral-500">Chưa ai hoàn thành tất cả các chặng.</p>;
  }

  return (
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
          {ranking.map((p, i) => (
            <tr key={p.userId} className={cn('border-t', i === 0 && 'bg-amber-50')}>
              <td className="px-3 py-2">{MEDAL[i] ?? i + 1}</td>
              <td className="px-3 py-2 font-medium">{p.username}</td>
              <td className="px-3 py-2 tabular-nums">{formatDuration(p.elapsedMs as number)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
