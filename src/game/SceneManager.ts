import type Phaser from 'phaser';
import type { SceneKey } from './scenes/keys';
import { createLogger } from '@/lib/logger';

const log = createLogger('game:scenes');

/**
 * SceneManager — a thin, intention-revealing wrapper over Phaser's scene plugin.
 *
 * WHY wrap it: call sites say `scenes.start('KitchenScene')` instead of poking
 * `game.scene.start(...)` directly, so we can add cross-cutting behavior
 * (logging, analytics on scene change, guard rails) in ONE place as the game
 * grows. Keeps gameplay code declarative.
 */
export class SceneManager {
  constructor(private readonly game: Phaser.Game) {}

  /** Start (or restart) a scene. */
  start(key: SceneKey, data?: Record<string, unknown>): void {
    log.debug('start scene', { key });
    this.game.scene.start(key, data);
  }

  /** Switch from one scene to another (stops `from`, starts `to`). */
  switch(from: SceneKey, to: SceneKey): void {
    log.debug('switch scene', { from, to });
    this.game.scene.switch(from, to);
  }

  /** Run a scene in parallel (e.g. a HUD overlay on top of gameplay). */
  launch(key: SceneKey, data?: Record<string, unknown>): void {
    this.game.scene.run(key, data);
  }

  stop(key: SceneKey): void {
    this.game.scene.stop(key);
  }

  pause(key: SceneKey): void {
    this.game.scene.pause(key);
  }

  resume(key: SceneKey): void {
    this.game.scene.resume(key);
  }

  isActive(key: SceneKey): boolean {
    return this.game.scene.isActive(key);
  }
}
