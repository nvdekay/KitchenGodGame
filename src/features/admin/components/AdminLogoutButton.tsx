'use client';

import { LogOut } from 'lucide-react';
import { useSignOut } from '@/features/auth';

/** Sidebar sign-out action. The game's floating LogoutButton is styled for
 *  the hub screens (fixed pill, gradients, motion) and doesn't fit the flat
 *  admin sidebar, so this reuses just the sign-out logic (useSignOut) with
 *  its own nav-row styling. */
export function AdminLogoutButton() {
  const signOut = useSignOut();

  return (
    <button
      type="button"
      onClick={() => signOut.mutate()}
      disabled={signOut.isPending}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-red-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
        <LogOut className="h-4 w-4" aria-hidden />
      </span>
      {signOut.isPending ? 'Đang thoát…' : 'Đăng xuất'}
    </button>
  );
}
