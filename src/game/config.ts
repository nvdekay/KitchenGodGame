import Phaser from 'phaser';
import { sceneRegistry } from './scenes/registry';

/**
 * Phaser game config factory.
 *
 * Factory (not a const) because the config needs a DOM parent element that only
 * exists at mount time, and because Phaser must never be imported on the server.
 * GameManager calls this in the browser with the target container.
 */
export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO, // WebGL with Canvas fallback
    parent,
    backgroundColor: '#1a1a1a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540,
    },
    physics: {
      // Default off; a feature that needs physics flips this on. Keeps the
      // bundle/runtime lean until gameplay actually requires it.
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: sceneRegistry,
    render: { pixelArt: false, antialias: true },
  };
}
