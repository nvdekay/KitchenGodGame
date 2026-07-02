import { SignupForm } from '@/features/auth';

/** Registration route. Thin — composes the auth feature's public component.
 *  Middleware redirects already-signed-in users away. The frosted card + sky
 *  background come from the (auth) layout. */
export default function SignupPage() {
  return (
    <>
      <h1 className="mb-5 text-center text-2xl font-extrabold text-sky-900">Đăng ký</h1>
      <SignupForm />
    </>
  );
}
