'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

/**
 * Landing splash — "Các Táo Lên Chầu".
 *
 * Composited from the separated layers in /public/home (each cropped to its
 * tight bounding box) over the full-frame /public/home/background.webp:
 *
 *   background (object-cover, fills the screen on any aspect ratio)
 *     └─ a centred STAGE (scales with the viewport) that owns every sprite.
 *        Sprites are positioned as % of the stage and centred on their anchor
 *        (translate -50%,-50%), so the scene stays proportioned and aligned.
 *
 * Two layouts, switched purely by CSS orientation variants:
 *   • landscape / desktop → the five Táo in a row, button centred below the
 *     scroll (mirrors the original home.png).
 *   • portrait / phone    → a taller 9:16 stage with the Táo in a 2×2 grid and
 *     the button beneath, so nothing is cramped or clipped.
 *
 * Each Táo bounces on a staggered loop; the scroll sways; "BẮT ĐẦU" pulses and
 * links to /map (middleware redirects anonymous visitors to /login first).
 * The idle loops always run (they're core to the game splash) — they are not
 * gated behind prefers-reduced-motion.
 */

// Position classes carry the portrait (base) layout plus a `landscape:` override.
// `w-*` sets the sprite width (% of stage); height is auto (native aspect kept).
const TAO = [
  {
    key: 'do',
    src: '/home/taodo.webp',
    cls: 'left-[28%] top-[41%] w-[30%] landscape:left-[17%] landscape:top-[70%] landscape:w-[15%]',
    delay: 0,
  },
  {
    key: 'cam',
    src: '/home/taocam.webp',
    cls: 'left-[72%] top-[41%] w-[31%] landscape:left-[34%] landscape:top-[71.5%] landscape:w-[15.5%]',
    delay: 0.15,
  },
  {
    // Slimmer sprite (aspect ~0.6) → narrower width keeps his height in line.
    // Landscape: centre of the row, standing just behind the BẮT ĐẦU button.
    // Portrait: the middle of the 2×2 grid — a playing-card five.
    key: 'hong',
    src: '/home/taohong.webp',
    cls: 'left-1/2 top-[52%] w-[22%] landscape:top-[66.5%] landscape:w-[13%]',
    delay: 0.3,
  },
  {
    key: 'xanhla',
    src: '/home/taoxanhla.webp',
    cls: 'left-[28%] top-[63%] w-[31%] landscape:left-[66%] landscape:top-[71.5%] landscape:w-[15.5%]',
    delay: 0.45,
  },
  {
    key: 'xanhduong',
    src: '/home/taoxanhduong.webp',
    cls: 'left-[72%] top-[63%] w-[30%] landscape:left-[83%] landscape:top-[70%] landscape:w-[15%]',
    delay: 0.6,
  },
] as const;

const TAO_SHADOW = 'drop-shadow-[0_12px_14px_rgba(0,70,140,0.28)]';

export function HomeSplash() {
  // Idle bounce for a Táo: hop up ~7% of its own height on a gentle loop.
  const bounce = (delay: number) => ({
    animate: { y: ['0%', '-7%', '0%'] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const, delay },
  });

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#4aa8ff]">
      {/* Full-bleed sky background */}
      <Image
        src="/home/background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Centred, viewport-fitted stage — 9:16 in portrait, 16:9 in landscape */}
      <div className="absolute left-1/2 top-1/2 aspect-[9/16] w-[min(100vw,calc(100dvh*9/16))] -translate-x-1/2 -translate-y-1/2 landscape:aspect-[16/9] landscape:w-[min(100vw,calc(100dvh*16/9))]">
        {/* Title scroll — gentle sway */}
        <div className="absolute left-1/2 top-[12%] w-[82%] -translate-x-1/2 -translate-y-1/2 landscape:top-[20%] landscape:w-[48%]">
          <motion.img
            src="/home/cactaolentrau.webp"
            alt="Các Táo Lên Chầu"
            className="h-auto w-full drop-shadow-[0_10px_18px_rgba(0,60,120,0.30)]"
            animate={{ y: ['0%', '-2.5%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* The five Táo, each bouncing out of phase */}
        {TAO.map((t) => (
          <div
            key={t.key}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${t.cls}`}
          >
            <motion.img
              src={t.src}
              alt=""
              aria-hidden
              className={`h-auto w-full ${TAO_SHADOW}`}
              {...bounce(t.delay)}
            />
          </div>
        ))}

        {/* Start button → /play */}
        <div className="absolute left-1/2 top-[85%] w-[44%] -translate-x-1/2 -translate-y-1/2 landscape:top-[83%] landscape:w-[21%]">
          <Link href="/map" aria-label="Bắt đầu chơi" className="block outline-none">
            <motion.img
              src="/home/startbutton.webp"
              alt="Bắt đầu"
              className="h-auto w-full cursor-pointer drop-shadow-[0_8px_12px_rgba(0,60,120,0.35)]"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </Link>
        </div>
      </div>
    </main>
  );
}
