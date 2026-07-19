import { LayoutDashboard } from 'lucide-react';
import { OnlinePlayers } from '@/features/presence';

/** Admin overview. Live presence card (who's online + their level) plus room for
 *  future dashboard widgets. */
export default function AdminOverviewPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
          <LayoutDashboard className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tổng quan</h1>
          <p className="text-sm text-neutral-500">Theo dõi người chơi đang online theo thời gian thực.</p>
        </div>
      </div>

      <OnlinePlayers />
    </section>
  );
}
