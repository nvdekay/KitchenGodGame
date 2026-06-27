import { z } from 'zod';

/**
 * Validation schemas live in the feature, next to the forms that use them.
 * One schema, reused by React Hook Form (client) and the service layer, so the
 * rules can never drift.
 */

/**
 * Login accepts EITHER an email OR a username in a single `identifier` field.
 * The service resolves a username to its email before calling Supabase Auth
 * (which only authenticates by email). See auth.service.signIn.
 */
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Nhập email hoặc username.'),
  password: z.string().min(1, 'Nhập mật khẩu.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Signup collects email + username + password. `username` is the canonical
 * display name in-game AND the stable handle admins use to track a player, so
 * we constrain it to URL/handle-safe characters and enforce uniqueness in the DB
 * (case-insensitive — see migration 0002).
 */
export const signupSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  username: z
    .string()
    .min(3, 'Username tối thiểu 3 ký tự.')
    .max(24, 'Username tối đa 24 ký tự.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ gồm chữ, số và dấu gạch dưới.'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự.'),
});

export type SignupInput = z.infer<typeof signupSchema>;
