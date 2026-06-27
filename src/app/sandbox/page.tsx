import { notFound } from 'next/navigation';
import { GameCanvas } from '@/game';

/**
 * Engine preview — DEVELOPMENT ONLY.
 *
 * `/play` is the real, auth-protected entry point. This route mounts the same
 * Phaser canvas WITHOUT authentication so you can see the engine boot
 * (Boot → Loading → Main) before Supabase is configured. It 404s in production,
 * so it never becomes a public, unguarded way into the game.
 */
export default function SandboxPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="h-screen w-screen bg-neutral-900">
      <div className="absolute left-3 top-3 z-10 rounded bg-black/60 px-3 py-1 text-xs text-white">
        Engine preview (dev only · no auth) — real entry is{' '}
        <code className="text-amber-300">/play</code>
      </div>
      <GameCanvas />
    </main>
  );
}
