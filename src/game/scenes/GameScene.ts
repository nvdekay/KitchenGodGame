import * as Phaser from 'phaser';
import { SceneKeys } from './keys';
import { GameEvents } from '../events/gameEvents';

/**
 * GameScene — the actual playable level (no external assets; everything is drawn
 * with primitives so it runs anywhere).
 *
 * Gameplay: move the player (arrows / WASD) and collect every token to clear the
 * level. Each level spawns more tokens; score carries over. The scene OWNS its
 * simulation state and only *announces* outcomes via game events — it never
 * touches React, Zustand, or Supabase. Persistence happens on the React side in
 * response to LEVEL_COMPLETED (see the progress feature).
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private tokens!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private hud!: Phaser.GameObjects.Text;

  private level = 1;
  private score = 0;
  private remaining = 0;

  constructor() {
    super(SceneKeys.Game);
  }

  // Phaser passes the object given to scene.start() into init().
  init(data: { level?: number; score?: number }): void {
    this.level = data.level ?? 1;
    this.score = data.score ?? 0;
  }

  create(): void {
    const { width, height } = this.scale;
    const username = (this.registry.get('username') as string | undefined) ?? 'Player';

    // Player.
    this.player = this.add.rectangle(width / 2, height / 2, 28, 28, 0xffcc00);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    // Tokens — more each level.
    const count = 3 + this.level;
    this.remaining = count;
    this.tokens = this.physics.add.group();
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(80, height - 40);
      const token = this.add.circle(x, y, 10, 0x66ddff);
      this.physics.add.existing(token);
      this.tokens.add(token);
    }

    this.physics.add.overlap(this.player, this.tokens, (_player, token) => {
      (token as Phaser.GameObjects.GameObject).destroy();
      this.score += 10;
      this.remaining -= 1;
      this.game.events.emit(GameEvents.SCORE_CHANGED, { score: this.score });
      this.updateHud(username);
      if (this.remaining <= 0) this.completeLevel();
    });

    // Input.
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;

    // HUD (in-canvas; React also renders an HTML HUD from gameStore).
    this.hud = this.add.text(12, 12, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    });
    this.updateHud(username);

    this.game.events.emit(GameEvents.SCENE_STARTED, { key: SceneKeys.Game });
    this.game.events.emit(GameEvents.LEVEL_STARTED, { level: this.level });
    this.game.events.emit(GameEvents.SCENE_READY, { key: SceneKeys.Game });
  }

  override update(): void {
    if (!this.player.body) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = 240;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    body.setVelocity(
      left ? -speed : right ? speed : 0,
      up ? -speed : down ? speed : 0,
    );
  }

  private completeLevel(): void {
    // Announce; React persists progress and updates the HUD/store.
    this.game.events.emit(GameEvents.LEVEL_COMPLETED, { level: this.level, score: this.score });

    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, `Qua màn ${this.level}!`, {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: '#7CFC00',
      })
      .setOrigin(0.5);

    // Short beat, then restart at the next level carrying the score forward.
    this.time.delayedCall(900, () =>
      this.scene.restart({ level: this.level + 1, score: this.score }),
    );
  }

  private updateHud(username: string): void {
    this.hud.setText(
      `${username}   Màn: ${this.level}   Điểm: ${this.score}   Còn lại: ${this.remaining}`,
    );
  }
}
