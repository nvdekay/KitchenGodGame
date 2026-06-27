import { OnlinePlayers } from '@/features/presence';

/** Admin overview. Live presence card (who's online + their level) plus room for
 *  future dashboard widgets. */
export default function AdminOverviewPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-neutral-600">
          Theo dõi người chơi đang online. Xem chi tiết tiến độ ở mục{' '}
          <span className="font-medium">Người chơi</span>.
        </p>
      </div>

      <OnlinePlayers />
    </section>
  );
}
