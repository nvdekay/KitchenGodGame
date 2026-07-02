import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import { GameMap } from '@/features/map';
import { LogoutButton } from '@/features/auth';

/**
 * Map route — the stage-select screen reached from the landing "BẮT ĐẦU".
 * Protected by middleware; a server component resolves the signed-in user and
 * hands id + username to the client GameMap (which reads live lock/unlock state).
 */
export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/map');

  const authUser = await getAuthUser(supabase, { id: user.id, email: user.email ?? null });

  return (
    <>
      <GameMap userId={user.id} username={authUser?.username ?? 'Player'} />
      <LogoutButton />
    </>
  );
}
