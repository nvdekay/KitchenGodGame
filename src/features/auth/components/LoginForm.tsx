'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useSignIn } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { isAppError } from '@/lib/errors';

/**
 * Sign-in form: username only. No password, no separate registration step —
 * an unrecognized username is auto-provisioned server-side on first login
 * (see actions/sign-in.action).
 */
export function LoginForm({ redirectTo = '/map' }: { redirectTo?: string }) {
  const signIn = useSignIn(redirectTo);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => signIn.mutate(values));

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          className="rounded-lg border border-sky-200 bg-white px-3 py-2.5 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          {...register('username')}
        />
        {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
      </div>

      {signIn.isError && (
        <p className="text-sm text-red-600">
          {isAppError(signIn.error) ? signIn.error.message : 'Đăng nhập thất bại.'}
        </p>
      )}

      <Button type="submit" loading={isSubmitting || signIn.isPending}>
        {signIn.isPending ? 'Đang vào game…' : 'Vào game'}
      </Button>
    </form>
  );
}
