/**
 * PUBLIC API of the game module.
 *
 * App/React code imports from `@/game` only:
 *  - GameCanvas: the component to mount the game.
 *  - GameManager / GameEvents: for issuing commands or listening (advanced).
 *  - SceneKeys: typed scene identifiers.
 *
 * Scene classes, config, and the bridge internals are private.
 */
export { GameCanvas } from './react/GameCanvas';
export { GameManager } from './GameManager';
export { GameEvents } from './events/gameEvents';
export { SceneKeys } from './scenes/keys';
export type { SceneKey } from './scenes/keys';
