import { Leaderboard } from '@/features/leaderboard';

/** Leaderboard route (inside the app shell, so it has the header). Public — the
 *  underlying get_leaderboard function is callable by anyone; live updates flow
 *  to authenticated viewers via Realtime. */
export default function LeaderboardPage() {
  return (
    <main className="h-full overflow-auto">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Bảng xếp hạng</h1>
        <p className="mb-4 mt-1 text-sm text-neutral-600">Cập nhật trực tiếp khi có người qua màn.</p>
        <Leaderboard />
      </div>
    </main>
  );
}
