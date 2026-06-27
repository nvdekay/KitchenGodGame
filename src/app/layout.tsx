import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'KitchenGodGame',
  description: 'Browser-based game platform.',
};

/**
 * Root layout. Server component by default — it only mounts the client provider
 * tree (AppProviders) once around the whole app. Keep heavy/client logic out of
 * here; push it into providers or route-group layouts.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
