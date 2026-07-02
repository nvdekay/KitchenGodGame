import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import { Chang1Game } from '@/features/chang1';
import { Chang2Game } from '@/features/chang2';
import { Chang3Game } from '@/features/chang3';

/**
 * Per-stage game route (reached from /map). Chặng 1 = "Hồ sơ thất lạc",
 * chặng 2 = "Báo cáo bị xáo trộn", chặng 3 = "Khôi phục báo cáo".
 * Protected by middleware; the server resolves the signed-in user and hands
 * id + username to the client game (presence + progress tracking).
 */
export default async function ChangPage({ params }: { params: Promise<{ ord: string }> }) {
  const { ord: raw } = await params;
  const ord = Number(raw);
  if (!Number.isInteger(ord) || ord < 1 || ord > 3) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/chang/${ord}`);

  const authUser = await getAuthUser(supabase, { id: user.id, email: user.email ?? null });

  const username = authUser?.username ?? 'Player';
  if (ord === 1) return <Chang1Game userId={user.id} username={username} />;
  if (ord === 2) return <Chang2Game userId={user.id} username={username} />;
  return <Chang3Game userId={user.id} username={username} />;
}
