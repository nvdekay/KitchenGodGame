import { LoginForm } from '@/features/auth';

/** Login route. Reads `?registered=1` (set after signup) on the server and
 *  passes it down, so the form can show a success banner without useSearchParams.
 *  Route protection (redirect when already signed in) is handled by middleware. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Đăng nhập</h1>
      <LoginForm justRegistered={registered === '1'} />
    </main>
  );
}
