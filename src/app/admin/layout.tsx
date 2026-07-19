import Link from 'next/link';
import { requireAdmin } from '@/features/admin/services/admin.guard';
import { AdminNav } from '@/features/admin/components/AdminNav';

/**
 * Admin layout. `requireAdmin()` runs server-side BEFORE any admin UI renders —
 * it redirects non-admins. This is the role-based access enforcement point for
 * the whole /admin subtree, complementing middleware (session) and RLS (data).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const initial = (admin.username ?? admin.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-violet-50/30">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Admin Panel</p>
          <Link href="/admin" className="mt-1 block text-lg font-extrabold leading-snug hover:underline">
            Các Táo Lên Chầu
          </Link>
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {initial}
            </span>
            <p className="truncate text-xs text-white/90">{admin.username ?? admin.email}</p>
          </div>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
