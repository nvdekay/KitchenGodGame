import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import { Chang1Game } from '@/features/chang1';
import { Chang2Game } from '@/features/chang2';

/**
 * Per-stage game route (reached from /map). Chặng 1 = "Hồ sơ thất lạc",
 * chặng 2 = "Báo cáo bị xáo trộn"; chặng 3 shows a placeholder until its game
 * is built. Protected by middleware; the server resolves the signed-in user
 * and hands id + username to the client game (presence + progress tracking).
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

  return (
    <main className="flex h-[100dvh] items-center justify-center bg-gradient-to-b from-sky-300 to-sky-100 p-6 text-center">
      <div className="rounded-3xl bg-white/85 px-8 py-10 shadow-xl backdrop-blur">
        <p className="text-4xl">🚧</p>
        <h1 className="mt-2 text-xl font-black text-sky-900">Chặng {ord} đang được xây dựng…</h1>
        <Link
          href="/map"
          className="mt-4 inline-block font-bold text-sky-700 underline underline-offset-4"
        >
          ← Về bản đồ
        </Link>
      </div>
    </main>
  );
}
