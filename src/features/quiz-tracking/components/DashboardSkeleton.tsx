import { Skeleton } from '@/components/ui/Skeleton';

/** Loading placeholder shaped like the tracking dashboard (ranking + matrix). */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-7 w-48 rounded-xl" />

      <div className="space-y-2">
        <Skeleton className="h-5 w-44 rounded-lg" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    </div>
  );
}
