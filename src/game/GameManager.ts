import Phaser from 'phaser';
import { createGameConfig } from './config';
import { SceneManager } from './SceneManager';
import { GameEvents, type GameEventMap, type GameEventName } from './events/gameEvents';
import { createLogger } from '@/lib/logger';

const log = createLogger('game:manager');

/**
 * GameManager — the ONLY abstraction the rest of the app uses to touch Phaser.
 *
 * Responsibilities:
 *  - Own the Phaser.Game lifecycle (create / destroy), guaranteeing a single
 *    instance even under React StrictMode's double-mount in dev.
 *  - Expose a typed emit/on API over the game's shared event emitter so React
 *    and scenes communicate without referencing each other.
 *  - Hand out a SceneManager for scene-level control.
 *
 * It is deliberately a small singleton: Phaser is inherently a single global
 * runtime, and a singleton keeps event wiring and teardown unambiguous.
 */
class GameManagerImpl {
  private game: Phaser.Game | null = null;
  private sceneManager: SceneManager | null = null;

  get isRunning(): boolean {
    return this.game !== null;
  }

  /** Create the game inside `parent`. Idempotent — returns the existing game if
   *  already created (handles StrictMode remounts). */
  create(parent: HTMLElement): Phaser.Game {
    if (this.game) {
      log.debug('create() called while running — reusing existing instance');
      return this.game;
    }
    log.info('creating Phaser game');
    this.game = new Phaser.Game(createGameConfig(parent));
    this.sceneManager = new SceneManager(this.game);
    return this.game;
  }

  /** Tear down completely. Call from the React wrapper's cleanup. */
  destroy(): void {
    if (!this.game) return;
    log.info('destroying Phaser game');
    this.game.destroy(true);
    this.game = null;
    this.sceneManager = null;
  }

  scenes(): SceneManager {
    if (!this.sceneManager) throw new Error('GameManager: game not created yet');
    return this.sceneManager;
  }

  // ── Typed event API over game.events ──────────────────────────────────────
  emit<E extends GameEventName>(event: E, payload: GameEventMap[E]): void {
    this.game?.events.emit(event, payload);
  }

  on<E extends GameEventName>(event: E, handler: (payload: GameEventMap[E]) => void): () => void {
    this.game?.events.on(event, handler);
    return () => {
      this.game?.events.off(event, handler);
    };
  }
}

/** Singleton instance used everywhere. */
export const GameManager = new GameManagerImpl();
export { GameEvents };
