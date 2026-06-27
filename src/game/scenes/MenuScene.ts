import * as Phaser from 'phaser';
import { SceneKeys } from './keys';
import { GameEvents } from '../events/gameEvents';

/**
 * MenuScene — the start screen. Shows the player's name and best level (both
 * injected from React via the game registry — see GameManager.create), then
 * waits for input to launch GameScene.
 *
 * Reading identity from the registry (not importing React) keeps the engine
 * isolated: React owns the data, the scene just renders what it was handed.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const { width, height } = this.scale;
    const username = (this.registry.get('username') as string | undefined) ?? 'Player';
    const bestLevel = (this.registry.get('bestLevel') as number | undefined) ?? 1;

    this.add
      .text(width / 2, height / 2 - 70, 'KitchenGodGame', {
        fontFamily: 'monospace',
        fontSize: '34px',
        color: '#ffcc00',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 20, `Xin chào, ${username}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, `Màn cao nhất: ${bestLevel}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9aa0a6',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(width / 2, height / 2 + 60, 'Bấm SPACE hoặc CLICK để chơi', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#66ddff',
      })
      .setOrigin(0.5);

    // Gentle blink so the prompt reads as interactive.
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    const start = () => this.scene.start(SceneKeys.Game, { level: 1, score: 0 });
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);

    this.game.events.emit(GameEvents.SCENE_STARTED, { key: SceneKeys.Menu });
    this.game.events.emit(GameEvents.SCENE_READY, { key: SceneKeys.Menu });
  }
}
