import { GameCanvas } from '@/game';

/**
 * Play route — protected by middleware. Mounts the game via GameCanvas, which
 * loads Phaser client-side only. The page itself is a server component; the
 * client boundary lives inside GameCanvas.
 */
export default function PlayPage() {
  return (
    <main className="h-screen w-screen bg-neutral-900">
      <GameCanvas />
    </main>
  );
}
