'use client';

import dynamic from 'next/dynamic';

/**
 * GameCanvas — the public entry point pages use to render the game.
 *
 * It dynamically imports PhaserGame with `ssr: false`. This is THE mechanism
 * that keeps Phaser off the server and out of the initial bundle: Phaser only
 * downloads/executes when a page actually mounts the canvas. Pages import this,
 * never PhaserGame directly.
 */
const PhaserGame = dynamic(() => import('./PhaserGame').then((m) => m.PhaserGame), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white">
      Initializing engine…
    </div>
  ),
});

export function GameCanvas() {
  return <PhaserGame />;
}
