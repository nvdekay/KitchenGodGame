import { SignupForm } from '@/features/auth';

/** Registration route. Thin — composes the auth feature's public component.
 *  Middleware redirects already-signed-in users away. */
export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Đăng ký</h1>
      <SignupForm />
    </main>
  );
}
