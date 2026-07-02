'use client';

import { motion } from 'motion/react';
import { useAuth, useSignOut } from '../hooks/useAuth';

/**
 * Game-styled sign-out pill, pinned to the bottom-left of the hub screens
 * (landing + map — kept out of gameplay to avoid mid-run misclicks). Shows who
 * is signed in, floats gently like the rest of the game chrome, and renders
 * nothing for anonymous visitors.
 */
export function LogoutButton() {
  const { isAuthenticated, user } = useAuth();
  const signOut = useSignOut();

  if (!isAuthenticated) return null;

  return (
    <motion.button
      type="button"
      onClick={() => signOut.mutate()}
      disabled={signOut.isPending}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.93 }}
      aria-label="Đăng xuất khỏi trò chơi"
      className="fixed bottom-3 left-3 z-30 flex items-center gap-2.5 rounded-full border-2 border-white/80 bg-white/85 py-1.5 pl-2 pr-4 text-left shadow-[0_8px_18px_rgba(10,60,120,0.28)] outline-none backdrop-blur transition-colors hover:bg-white focus-visible:ring-4 focus-visible:ring-amber-300/70 disabled:opacity-60 sm:bottom-4 sm:left-4"
    >
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-red-300/70 bg-gradient-to-b from-red-400 to-red-600 text-base shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_2px_5px_rgba(150,30,30,0.4)]"
      >
        🚪
      </span>
      <span>
        <span className="block text-sm font-extrabold leading-tight text-sky-900">
          {signOut.isPending ? 'Đang thoát…' : 'Đăng xuất'}
        </span>
        {user?.username && (
          <span className="block max-w-[30vw] truncate text-[11px] font-semibold leading-tight text-sky-600">
            👤 {user.username}
          </span>
        )}
      </span>
    </motion.button>
  );
}
