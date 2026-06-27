/** Barrel for shared, cross-feature types. Feature-local types live in their
 * own feature folder — only put truly shared types here. */
export type { Database, Json, AppRole } from './database.types';
export type { AuthUser, AuthStatus } from './auth.types';
