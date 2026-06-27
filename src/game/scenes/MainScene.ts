import Phaser from 'phaser';
import { SceneKeys } from './keys';
import { GameEvents } from '../events/gameEvents';

/**
 * MainScene — the placeholder "game is running" scene. Today it just renders a
 * label and emits SCENE_READY so the UI knows the game booted end-to-end.
 *
 * This is the seam for real gameplay: future scenes (a kitchen, a challenge, a
 * map) get registered in the scene registry and started from here or via a
 * CMD_START_SCENE command from React. Do NOT cram all gameplay into this one
 * scene — add new Phaser.Scene subclasses and register them.
 */
export class MainScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Main);
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'KitchenGodGame\nMainScene (placeholder)', {
        fontFamily: 'monospace',
        fontSize: '20px',
        align: 'center',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.game.events.emit(GameEvents.SCENE_STARTED, { key: SceneKeys.Main });
    this.game.events.emit(GameEvents.SCENE_READY, { key: SceneKeys.Main });
  }
}
