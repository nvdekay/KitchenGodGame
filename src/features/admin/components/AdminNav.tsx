'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

/**
 * Admin sidebar navigation. Add future admin sections here — each is just a
 * route under /admin guarded by the admin layout. Keep this a data-driven list
 * so adding "Analytics" or "Content" later is a one-line change.
 */
const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/leaderboard', label: 'Thống kê & Xếp hạng' },
  { href: '/admin/quiz', label: 'Câu hỏi' },
  { href: '/admin/users', label: 'Theo dõi' },
  // { href: '/admin/analytics', label: 'Analytics' },   // future
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded px-3 py-2 text-sm hover:bg-black/5',
            pathname === item.href && 'bg-black/10 font-medium',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
