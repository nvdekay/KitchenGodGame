'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, BookOpenText, Activity, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Color = 'sky' | 'amber' | 'violet' | 'emerald';

/**
 * Admin sidebar navigation. Add future admin sections here — each is just a
 * route under /admin guarded by the admin layout. Keep this a data-driven list
 * so adding "Analytics" or "Content" later is a one-line change. Each item
 * carries its own accent color so the sidebar reads as a set of distinct
 * sections rather than one flat list.
 */
const NAV_ITEMS: readonly { href: string; label: string; icon: LucideIcon; color: Color }[] = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, color: 'sky' },
  { href: '/admin/leaderboard', label: 'Thống kê & Xếp hạng', icon: Trophy, color: 'amber' },
  { href: '/admin/quiz', label: 'Câu hỏi', icon: BookOpenText, color: 'violet' },
  { href: '/admin/users', label: 'Theo dõi', icon: Activity, color: 'emerald' },
  // { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, color: 'rose' },   // future
];

const COLOR_STYLES: Record<Color, { active: string; icon: string; hover: string }> = {
  sky: {
    active: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
    icon: 'bg-sky-500 text-white',
    hover: 'hover:bg-sky-50/80 hover:text-sky-700',
  },
  amber: {
    active: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    icon: 'bg-amber-500 text-white',
    hover: 'hover:bg-amber-50/80 hover:text-amber-700',
  },
  violet: {
    active: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
    icon: 'bg-violet-500 text-white',
    hover: 'hover:bg-violet-50/80 hover:text-violet-700',
  },
  emerald: {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    icon: 'bg-emerald-500 text-white',
    hover: 'hover:bg-emerald-50/80 hover:text-emerald-700',
  },
};

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1.5 p-4">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const styles = COLOR_STYLES[item.color];
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition',
              active ? styles.active : cn('hover:text-neutral-900', styles.hover),
            )}
          >
            <span
              aria-hidden
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition',
                active ? styles.icon : 'bg-neutral-100 text-neutral-500',
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
