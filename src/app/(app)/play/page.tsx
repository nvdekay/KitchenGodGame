import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizGame } from '@/features/quiz';

/**
 * Play route — protected by middleware. The quiz is the real game now: a server
 * component resolves the signed-in user, then hands their id to the client
 * QuizGame (stage select → play → server-graded submit → unlock next).
 *
 * (The Phaser arcade demo still lives at /sandbox.)
 */
export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/play');

  return (
    <main className="h-full w-full">
      <QuizGame userId={user.id} />
    </main>
  );
}
