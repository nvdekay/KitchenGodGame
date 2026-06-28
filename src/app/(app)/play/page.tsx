import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/services/profile.service';
import { QuizGame } from '@/features/quiz';

/**
 * Play route — protected by middleware. The quiz is the game: a server component
 * resolves the signed-in user (id + username), then hands them to the client
 * QuizGame (stage select → play → server-graded submit → unlock next). The
 * username is used to publish live presence for the admin dashboard.
 */
export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/play');

  const authUser = await getAuthUser(supabase, { id: user.id, email: user.email ?? null });

  return (
    <main className="h-full w-full">
      <QuizGame userId={user.id} username={authUser?.username ?? 'Player'} />
    </main>
  );
}
