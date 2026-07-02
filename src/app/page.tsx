import { HomeSplash } from '@/features/home';
import { LogoutButton } from '@/features/auth';

/**
 * Landing page — animated "Các Táo Lên Chầu" splash composited from the
 * separated layers in /public/home. See HomeSplash for the layout/animation.
 * Signed-in visitors also get the fixed sign-out pill (bottom-left).
 */
export default function HomePage() {
  return (
    <>
      <HomeSplash />
      <LogoutButton />
    </>
  );
}
