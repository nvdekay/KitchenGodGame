/**
 * PUBLIC API of the auth feature.
 *
 * Other parts of the app import from `@/features/auth` ONLY — never reach into
 * `@/features/auth/services/...`. This barrel is the contract; everything not
 * re-exported here is private to the feature and free to change.
 */
export { LoginForm } from './components/LoginForm';
export { SignupForm } from './components/SignupForm';
export { LogoutButton } from './components/LogoutButton';
export { useAuth, useSignIn, useSignUp, useSignOut } from './hooks/useAuth';
export { loginSchema, signupSchema } from './schemas/auth.schema';
export type { LoginInput, SignupInput } from './schemas/auth.schema';
