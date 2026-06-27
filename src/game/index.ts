/**
 * PUBLIC API of the game module.
 *
 * App/React code imports from `@/game`:
 *  - GameCanvas: the component to mount the game (loads Phaser client-side only).
 *  - GameEvents / SceneKeys: plain constants (no Phaser runtime) — safe anywhere.
 *
 * `GameManager` is intentionally NOT re-exported here. It statically imports
 * Phaser, so re-exporting it from this barrel would drag Phaser into the SERVER
 * bundle of any (server) page that imports `@/game`. Client components that need
 * it import it directly and explicitly:
 *
 *     import { GameManager } from '@/game/GameManager';   // client components only
 *
 * That keeps the engine genuinely client-only, which is the whole point.
 */
export { GameCanvas } from './react/GameCanvas';
export { GameEvents } from './events/gameEvents';
export { SceneKeys } from './scenes/keys';
export type { SceneKey } from './scenes/keys';
export type { GameEventName, GameEventMap } from './events/gameEvents';
