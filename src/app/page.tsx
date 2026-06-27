import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/** Public landing page. */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">KitchenGodGame</h1>
      <p className="max-w-md text-neutral-600">
        Project foundation — Next.js 15 · Phaser 3 · Supabase. Gameplay is a
        placeholder; this is the extensible platform it grows on.
      </p>
      <div className="flex gap-3">
        <Link href="/play">
          <Button>Play</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </div>
    </main>
  );
}
