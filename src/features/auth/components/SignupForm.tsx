'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '../schemas/auth.schema';
import { useSignUp } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { isAppError } from '@/lib/errors';

/**
 * Registration form: email + username + password. On success the hook redirects
 * to /login. `username` becomes the in-game display name and the admin-facing
 * player handle, so it is validated as a handle (see signupSchema).
 */
export function SignupForm() {
  const signUp = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit((values) => signUp.mutate(values));

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
          className="rounded-lg border border-sky-200 bg-white px-3 py-2.5 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium">
          Username <span className="text-neutral-400">(tên hiển thị trong game)</span>
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          className="rounded-lg border border-sky-200 bg-white px-3 py-2.5 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          {...register('username')}
        />
        {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="rounded-lg border border-sky-200 bg-white px-3 py-2.5 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          {...register('password')}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {signUp.isError && (
        <p className="text-sm text-red-600">
          {isAppError(signUp.error) ? signUp.error.message : 'Đăng ký thất bại.'}
        </p>
      )}

      <Button type="submit" loading={isSubmitting || signUp.isPending}>
        {signUp.isPending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
