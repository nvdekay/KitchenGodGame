import Image from 'next/image';
import Link from 'next/link';

/**
 * Auth-screen shell (login). Reuses the game's sky background and drops
 * a frosted card in the centre so the auth pages feel like part of the game flow
 * rather than a bare form. Each page just renders its heading + form as children.
 *
 * Centering: a `mx-auto max-w-sm` column (block-level, so it never overflows the
 * viewport) handles the horizontal axis; a flex `items-center min-h` handles the
 * vertical. The background <Image fill> is absolute and sits behind everything.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#4aa8ff]">
      <Image src="/home/background.webp" alt="" fill priority sizes="100vw" className="object-cover" />

      <Link
        href="/"
        className="absolute left-4 top-4 z-20 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        ← Trang chủ
      </Link>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center px-4 py-6">
        {/* Game logo — the title scroll from the landing splash */}
        <Image
          src="/home/cactaolentrau.webp"
          alt="Các Táo Lên Chầu"
          width={1516}
          height={522}
          priority
          className="mb-4 h-auto w-[min(78vw,320px)] drop-shadow-[0_10px_16px_rgba(0,60,120,0.3)]"
        />
        <div className="w-full rounded-3xl border border-white/60 bg-white/85 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
