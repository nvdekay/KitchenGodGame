import { LoginForm } from '@/features/auth';

/** Login route. Thin — it just composes the auth feature's public component.
 *  Route protection (redirect when already signed in) is handled by middleware. */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <LoginForm />
    </main>
  );
}
