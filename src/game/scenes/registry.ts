import type Phaser from 'phaser';
import { BootScene } from './BootScene';
import { LoadingScene } from './LoadingScene';
import { MainScene } from './MainScene';

/**
 * Scene registration system.
 *
 * The single list of scenes the game knows about, in boot order (Phaser starts
 * index 0 first). Adding a gameplay scene later = implement a Phaser.Scene and
 * push it here. Nothing else in the codebase needs to change — GameManager reads
 * this array.
 *
 * Order matters only for the FIRST scene (it auto-starts). Boot → Loading →
 * Main is the standard chain; later scenes are started explicitly by key.
 */
export type SceneClass = new () => Phaser.Scene;

export const sceneRegistry: SceneClass[] = [
  BootScene,
  LoadingScene,
  MainScene,
  // Register future scenes here, e.g. KitchenScene, ChallengeScene, MapScene.
];
