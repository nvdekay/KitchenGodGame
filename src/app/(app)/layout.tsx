import { AppHeader } from '@/components/layout/AppHeader';

/**
 * App-shell layout for the in-app pages (currently /play). A persistent header on
 * top, content fills the rest. Route protection per page is still handled by
 * middleware (e.g. /play requires a session).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
