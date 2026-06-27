import { listPlayerOverview } from '@/features/progress/services/progress.admin';

/**
 * Admin player tracking. Lists every player with the level they've reached, best
 * score, and when they last played. Access is guaranteed by the /admin layout
 * (requireAdmin) + the service-role read in listPlayerOverview.
 */
export const dynamic = 'force-dynamic';

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN');
}

export default async function AdminUsersPage() {
  const players = await listPlayerOverview();

  return (
    <section>
      <h1 className="text-2xl font-bold">Người chơi</h1>
      <p className="mt-1 text-sm text-neutral-600">
        {players.length} người chơi · sắp xếp theo màn cao nhất
      </p>

      <div className="mt-4 overflow-x-auto rounded border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Username</th>
              <th className="px-3 py-2 font-medium">Vai trò</th>
              <th className="px-3 py-2 font-medium">Màn cao nhất</th>
              <th className="px-3 py-2 font-medium">Điểm tốt nhất</th>
              <th className="px-3 py-2 font-medium">Chơi lần cuối</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-neutral-500" colSpan={5}>
                  Chưa có người chơi nào.
                </td>
              </tr>
            ) : (
              players.map((p) => (
                <tr key={p.userId} className="border-t">
                  <td className="px-3 py-2 font-medium">{p.username}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        p.role === 'admin'
                          ? 'rounded bg-brand/10 px-2 py-0.5 text-brand'
                          : 'text-neutral-600'
                      }
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="px-3 py-2">{p.bestLevel}</td>
                  <td className="px-3 py-2">{p.bestScore}</td>
                  <td className="px-3 py-2 text-neutral-600">{formatWhen(p.lastPlayedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
