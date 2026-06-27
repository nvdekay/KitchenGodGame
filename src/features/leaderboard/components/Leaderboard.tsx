'use client';

import { useAuth } from '@/features/auth';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { cn } from '@/utils/cn';

/** Live leaderboard table. Highlights the signed-in player's own row. */
export function Leaderboard() {
  const { data, isLoading, isError } = useLeaderboard();
  const { user } = useAuth();

  if (isLoading) return <p className="text-neutral-500">Đang tải…</p>;
  if (isError) return <p className="text-red-600">Không tải được bảng xếp hạng.</p>;

  const rows = data ?? [];
  if (rows.length === 0) {
    return <p className="text-neutral-500">Chưa có ai ghi điểm. Hãy là người đầu tiên!</p>;
  }

  return (
    <div className="overflow-hidden rounded border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-neutral-100 text-left">
          <tr>
            <th className="w-12 px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Người chơi</th>
            <th className="px-3 py-2 font-medium">Màn</th>
            <th className="px-3 py-2 font-medium">Điểm</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry, i) => {
            const isMe = !!user && entry.username === user.username;
            return (
              <tr
                key={entry.username}
                className={cn('border-t', isMe && 'bg-brand/10 font-medium')}
              >
                <td className="px-3 py-2 text-neutral-500">{i + 1}</td>
                <td className="px-3 py-2">
                  {entry.username}
                  {isMe && <span className="ml-2 text-xs text-brand">(bạn)</span>}
                </td>
                <td className="px-3 py-2">{entry.bestLevel}</td>
                <td className="px-3 py-2">{entry.bestScore}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
