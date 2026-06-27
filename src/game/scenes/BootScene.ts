import * as Phaser from 'phaser';
import { SceneKeys } from './keys';
import { GameEvents } from '../events/gameEvents';

/**
 * BootScene — the very first scene. Runs once, fast. Its job is minimal setup
 * that must happen before assets load: registry defaults, scale config, input
 * settings, loading a tiny logo/spinner if you have one. NO gameplay, NO heavy
 * assets here.
 *
 * It announces GAME_BOOTED, then immediately hands off to LoadingScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    // `game.events` is the shared emitter the GameManager/bridge listen on.
    this.game.events.emit(GameEvents.GAME_BOOTED, { at: this.time.now });
    this.scene.start(SceneKeys.Loading);
  }
}
