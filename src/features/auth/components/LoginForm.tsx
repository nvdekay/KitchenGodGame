'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useSignIn } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { isAppError } from '@/lib/errors';

/**
 * Example feature component wiring the full client stack:
 * React Hook Form + Zod (validation) → feature hook (React Query) → service.
 * Intentionally minimal styling; it demonstrates the data flow, not the design.
 */
export function LoginForm() {
  const signIn = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => signIn.mutate(values));

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="rounded border px-3 py-2"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="rounded border px-3 py-2"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {signIn.isError && (
        <p className="text-sm text-red-600">
          {isAppError(signIn.error) ? signIn.error.message : 'Sign-in failed.'}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting || signIn.isPending}>
        {signIn.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
