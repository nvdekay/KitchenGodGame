import type Phaser from 'phaser';
import { BootScene } from './BootScene';
import { LoadingScene } from './LoadingScene';
import { MenuScene } from './MenuScene';
import { GameScene } from './GameScene';

/**
 * Scene registration system.
 *
 * The single list of scenes the game knows about, in boot order (Phaser starts
 * index 0 first). Adding a gameplay scene later = implement a Phaser.Scene and
 * push it here. Nothing else in the codebase needs to change — GameManager reads
 * this array.
 *
 * Chain: Boot → Loading → Menu → Game. Later scenes are started explicitly by key.
 */
export type SceneClass = new () => Phaser.Scene;

export const sceneRegistry: SceneClass[] = [
  BootScene,
  LoadingScene,
  MenuScene,
  GameScene,
  // Register future scenes here, e.g. ChallengeScene, MapScene.
];
