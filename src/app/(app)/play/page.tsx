import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import { getMyProgress, PlayClient } from '@/features/progress';

/**
 * Play route — protected by middleware. Server component: it resolves the player
 * identity + their saved progress, then hands them to the client PlayClient
 * (which mounts the Phaser canvas and tracks progress). The game itself loads
 * client-side only.
 */
export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/play');

  const [authUser, progress] = await Promise.all([
    getAuthUser(supabase, { id: user.id, email: user.email ?? null }),
    getMyProgress(supabase, user.id),
  ]);

  return (
    <main className="h-full w-full bg-neutral-900">
      <PlayClient
        userId={user.id}
        username={authUser?.username ?? 'Player'}
        bestLevel={progress.bestLevel}
      />
    </main>
  );
}
