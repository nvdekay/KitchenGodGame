/**
 * INTERNAL Phaser event contract.
 *
 * This is the game's OWN event vocabulary, separate from the app event bus
 * (`@/lib/eventBus`). Scenes and the GameManager speak these; the React bridge
 * (src/game/react/useGameBridge) translates the few that the UI cares about onto
 * the app bus / gameStore. Keeping two vocabularies means Phaser internals can
 * churn without breaking React, and vice-versa.
 *
 * Two directions:
 *  - OUT  (game → React): lifecycle/progress notifications.
 *  - IN   (React → game): commands the UI issues (start scene, pause, …).
 *
 * Add new gameplay events HERE with a payload in `GameEventMap`. The compiler
 * then enforces every emit/listen site.
 */

export const GameEvents = {
  // OUT — game → React
  GAME_BOOTED: 'game:booted',
  LOAD_PROGRESS: 'game:load-progress',
  ASSETS_LOADED: 'game:assets-loaded',
  SCENE_STARTED: 'game:scene-started',
  SCENE_READY: 'game:scene-ready',
  GAME_ERROR: 'game:error',

  // IN — React → game (commands)
  CMD_START_SCENE: 'cmd:start-scene',
  CMD_PAUSE: 'cmd:pause',
  CMD_RESUME: 'cmd:resume',
} as const;

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];

export interface GameEventMap {
  [GameEvents.GAME_BOOTED]: { at: number };
  [GameEvents.LOAD_PROGRESS]: { progress: number };
  [GameEvents.ASSETS_LOADED]: Record<string, never>;
  [GameEvents.SCENE_STARTED]: { key: string };
  [GameEvents.SCENE_READY]: { key: string };
  [GameEvents.GAME_ERROR]: { message: string };
  [GameEvents.CMD_START_SCENE]: { key: string; data?: Record<string, unknown> };
  [GameEvents.CMD_PAUSE]: Record<string, never>;
  [GameEvents.CMD_RESUME]: Record<string, never>;
}
