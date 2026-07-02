import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Các Táo Lên Chầu',
  description:
    'Trò chơi vượt ải cùng các Táo: 3 chặng thử thách kiến thức trên hành trình lên chầu Ngọc Hoàng.',
};

export const viewport: Viewport = {
  themeColor: '#4aa8ff',
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
