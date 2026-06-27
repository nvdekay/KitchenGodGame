'use client';

import { useEffect } from 'react';
import { GameManager } from '../GameManager';
import { GameEvents } from '../events/gameEvents';
import { useGameStore } from '@/stores/gameStore';
import { eventBus, AppEvents } from '@/lib/eventBus';

/**
 * THE BRIDGE. The single, deliberate connection point between the Phaser runtime
 * and React. It subscribes to the game's internal events and translates the few
 * the app cares about into (a) gameStore updates for the UI and (b) app-bus
 * events for the rest of the system (analytics, achievements, …).
 *
 * Everything flows through here so the coupling is explicit and auditable —
 * scenes never import React; React never imports a scene.
 */
export function useGameBridge() {
  const setPhase = useGameStore((s) => s.setPhase);
  const setActiveScene = useGameStore((s) => s.setActiveScene);
  const setLoadProgress = useGameStore((s) => s.setLoadProgress);
  const setLevel = useGameStore((s) => s.setLevel);
  const setScore = useGameStore((s) => s.setScore);

  useEffect(() => {
    const offs = [
      GameManager.on(GameEvents.GAME_BOOTED, () => setPhase('loading')),

      GameManager.on(GameEvents.LOAD_PROGRESS, ({ progress }) => setLoadProgress(progress)),

      GameManager.on(GameEvents.SCENE_STARTED, ({ key }) => {
        setActiveScene(key);
        eventBus.emit(AppEvents.SCENE_LOADED, { sceneKey: key });
      }),

      GameManager.on(GameEvents.SCENE_READY, ({ key }) => {
        setPhase('ready');
        eventBus.emit(AppEvents.GAME_READY, { sceneKey: key });
      }),

      GameManager.on(GameEvents.GAME_ERROR, () => setPhase('error')),

      // Gameplay → HUD store + app bus (analytics/achievements/persistence).
      GameManager.on(GameEvents.LEVEL_STARTED, ({ level }) => setLevel(level)),
      GameManager.on(GameEvents.SCORE_CHANGED, ({ score }) => setScore(score)),
      GameManager.on(GameEvents.LEVEL_COMPLETED, ({ level, score }) => {
        eventBus.emit(AppEvents.LEVEL_COMPLETED, { level, score });
      }),
    ];

    return () => offs.forEach((off) => off());
  }, [setPhase, setActiveScene, setLoadProgress, setLevel, setScore]);
}
