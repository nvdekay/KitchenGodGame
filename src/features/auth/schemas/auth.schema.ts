import { z } from 'zod';

/**
 * Validation schemas live in the feature, next to the forms that use them.
 * One schema, reused by React Hook Form (client) and the service layer, so the
 * rules can never drift.
 */

/**
 * Login is username-only: no password, no separate registration step. The
 * server action derives a hidden deterministic credential from the username
 * and auto-provisions the account on first login (see actions/sign-in.action).
 * `username` is also the stable handle admins use to track a player, so it is
 * constrained to URL/handle-safe characters (plus '@' for preconfigured
 * handles like "admin@nhom8") and enforced case-insensitively unique in the DB
 * (migration 0002) with a matching format CHECK (migrations 0011, 0012).
 */
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username tối thiểu 3 ký tự.')
    .max(32, 'Username tối đa 32 ký tự.')
    .regex(/^[a-zA-Z0-9_@]+$/, 'Chỉ gồm chữ, số, dấu gạch dưới và @.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
