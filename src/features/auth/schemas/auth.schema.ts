import { z } from 'zod';

/**
 * Validation schemas live in the feature, next to the forms that use them.
 * One schema, reused by: React Hook Form (client) AND server-side validation —
 * so the rules can never drift between client and server.
 */

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = loginSchema
  .extend({
    username: z
      .string()
      .min(3, 'At least 3 characters.')
      .max(24)
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;
