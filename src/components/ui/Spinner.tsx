import { cn } from '@/utils/cn';

/** Small accessible loading spinner. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Đang tải"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-brand',
        className,
      )}
    />
  );
}

/** Centered spinner for full-area loading states. */
export function LoadingArea({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-neutral-500">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
