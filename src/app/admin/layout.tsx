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

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-white">
        <div className="border-b p-4">
          <Link href="/admin" className="font-bold">
            Admin
          </Link>
          <p className="truncate text-xs text-neutral-500">{admin.email}</p>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
