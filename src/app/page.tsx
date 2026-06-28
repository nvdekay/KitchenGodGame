import Image from 'next/image';
import Link from 'next/link';

/**
 * Landing splash — full-screen game cover (public/home.png). The image is shown
 * at its native 16:9 inside a centered box (sky-blue letterbox fills any gap), so
 * percentage-positioned overlays line up with the artwork.
 *
 * "Bắt đầu" is a transparent hotspot placed over the BẮT ĐẦU button drawn in the
 * image, linking to /play (middleware sends anonymous users to /login first).
 *
 * NOTE: this is the "drop the whole image in" pass. Once the artwork is split
 * into per-Táo / button assets, we'll re-compose them here to animate each piece.
 */
export default function HomePage() {
  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100">
      <div className="relative aspect-[16/9] max-h-full max-w-full">
        <Image
          src="/home.png"
          alt="Các Táo Lên Chầu"
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />

        {/* Start hotspot over the drawn "BẮT ĐẦU" button.
            Position in % of the artwork — tweak if it doesn't sit exactly on it. */}
        <Link
          href="/play"
          aria-label="Bắt đầu"
          className="group absolute left-[62%] top-[71%] h-[9%] w-[16%] -translate-x-1/2 rounded-full"
        >
          <span className="absolute inset-0 rounded-full ring-4 ring-amber-300/40 transition motion-safe:animate-pulse group-hover:ring-amber-400/80 group-hover:ring-offset-2" />
        </Link>
      </div>
    </main>
  );
}
