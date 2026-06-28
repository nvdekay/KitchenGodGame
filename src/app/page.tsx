import Image from 'next/image';
import Link from 'next/link';

/**
 * Landing splash — full-screen game cover (public/home.png).
 *
 * The image scales to fit the viewport (capped by max-h/max-w, aspect preserved)
 * and the wrapper shrink-wraps it (`w-fit`), so percentage-positioned overlays
 * line up with the artwork on any screen size. Sky-blue fills any letterbox.
 *
 * "Bắt đầu" is a transparent hotspot over the BẮT ĐẦU button drawn in the image,
 * linking to /play (middleware sends anonymous users to /login first).
 *
 * NOTE: "drop the whole image in" pass — will be re-composed from split assets
 * later to animate each Táo / the button.
 */
export default function HomePage() {
  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100">
      <div className="relative w-fit">
        <Image
          src="/home.png"
          alt="Các Táo Lên Chầu"
          width={1920}
          height={1080}
          priority
          sizes="100vw"
          className="block h-auto max-h-screen w-auto max-w-[100vw] object-contain"
        />

        {/* Start hotspot over the drawn "BẮT ĐẦU" button (position in % of the
            artwork — tweak if it doesn't sit exactly on it). */}
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
