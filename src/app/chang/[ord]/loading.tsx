import Image from 'next/image';
import { TaoLoader } from '@/components/ui/game';

/**
 * Instant loading UI for /chang/[ord] — streams the moment navigation starts,
 * while the server component resolves auth + completion checks. Same sky
 * background + Táo loader as the map, so the transition feels seamless.
 */
export default function ChangLoading() {
  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#4aa8ff]">
      <Image src="/home/background.webp" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 flex items-center justify-center">
        <TaoLoader label="Đang vào chặng" />
      </div>
    </main>
  );
}
