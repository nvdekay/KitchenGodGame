/**
 * PUBLIC API of the auth feature.
 *
 * Other parts of the app import from `@/features/auth` ONLY — never reach into
 * `@/features/auth/services/...`. This barrel is the contract; everything not
 * re-exported here is private to the feature and free to change.
 */
export { LoginForm } from './components/LoginForm';
export { LogoutButton } from './components/LogoutButton';
export { useAuth, useSignIn, useSignOut } from './hooks/useAuth';
export { loginSchema } from './schemas/auth.schema';
export type { LoginInput } from './schemas/auth.schema';
