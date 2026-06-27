import Phaser from 'phaser';
import { SceneKeys } from './keys';
import { GameEvents } from '../events/gameEvents';

/**
 * LoadingScene — central asset preloading. As features add assets, queue them in
 * `preload()` (or, better, let each feature register a loader — see the Future
 * Expansion guide). It forwards Phaser's load progress to React so the UI can
 * render a real progress bar, then transitions to MainScene.
 */
export class LoadingScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Loading);
  }

  preload(): void {
    // Bridge Phaser's loader progress (0..1) to React via the shared emitter.
    this.load.on('progress', (progress: number) => {
      this.game.events.emit(GameEvents.LOAD_PROGRESS, { progress });
    });
    this.load.on('complete', () => {
      this.game.events.emit(GameEvents.ASSETS_LOADED, {});
    });

    // No assets yet — placeholder. Real features enqueue here, e.g.:
    // this.load.image('tiles', '/assets/tiles.png');
  }

  create(): void {
    this.scene.start(SceneKeys.Main);
  }
}
