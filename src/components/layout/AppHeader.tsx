'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useSignOut } from '@/features/auth';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

/**
 * App shell header. Shows primary navigation plus the signed-in user's username
 * and a logout button (or a login link when signed out). Lives in
 * components/layout because it is app-chrome reused across authenticated pages;
 * it consumes the auth feature's public API for identity + sign-out.
 */
const NAV = [{ href: '/map', label: 'Chơi' }] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, status } = useAuth();
  const signOut = useSignOut();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-white px-4">
      <nav className="flex items-center gap-4">
        <Link href="/map" className="font-bold text-brand">
          Các Táo Lên Chầu
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm text-neutral-600 hover:text-neutral-900',
              pathname === item.href && 'font-medium text-neutral-900',
            )}
          >
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              'text-sm text-neutral-600 hover:text-neutral-900',
              pathname.startsWith('/admin') && 'font-medium text-neutral-900',
            )}
          >
            Admin
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-3">
        {status === 'loading' ? null : isAuthenticated ? (
          <>
            <span className="flex max-w-[40vw] items-center gap-1 text-sm text-neutral-700 sm:max-w-none">
              <span aria-hidden>👤</span>
              <span className="truncate font-medium">{user?.username}</span>
            </span>
            <Button
              variant="secondary"
              className="px-3 py-1 text-xs"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
            >
              {signOut.isPending ? 'Đang thoát…' : 'Đăng xuất'}
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="secondary" className="px-3 py-1 text-xs">
              Đăng nhập
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
