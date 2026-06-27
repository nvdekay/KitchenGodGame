'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useSignIn } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { isAppError } from '@/lib/errors';

/**
 * Sign-in form. The single identifier field accepts an email OR a username; the
 * auth service resolves a username to its email before calling Supabase.
 */
export function LoginForm({ justRegistered = false }: { justRegistered?: boolean }) {
  const signIn = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => signIn.mutate(values));

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {justRegistered && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Đăng ký thành công! Đăng nhập để bắt đầu.
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="identifier" className="text-sm font-medium">
          Email hoặc Username
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username"
          className="rounded border px-3 py-2"
          {...register('identifier')}
        />
        {errors.identifier && (
          <p className="text-sm text-red-600">{errors.identifier.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Mật khẩu
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
          {isAppError(signIn.error) ? signIn.error.message : 'Đăng nhập thất bại.'}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting || signIn.isPending}>
        {signIn.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Chưa có tài khoản?{' '}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
