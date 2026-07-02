import { LoginForm } from '@/features/auth';

/** Login route. Reads `?registered=1` (set after signup) and `?redirectTo=` (set
 *  by middleware when it bounces an anonymous visitor) on the server and passes
 *  them down — so after signing in the player returns to where they were headed
 *  (default: /map). Route protection is handled by middleware. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; redirectTo?: string }>;
}) {
  const { registered, redirectTo } = await searchParams;

  // Only accept internal, single-slash paths — never an absolute/external URL.
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/map';

  return (
    <>
      <h1 className="mb-5 text-center text-2xl font-extrabold text-sky-900">Đăng nhập</h1>
      <LoginForm justRegistered={registered === '1'} redirectTo={safeRedirect} />
    </>
  );
}
