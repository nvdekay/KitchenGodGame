'use client';

import { useEffect, useRef } from 'react';
import { GameManager } from '../GameManager';
import { useGameBridge } from './useGameBridge';
import { useGameStore } from '@/stores/gameStore';

/**
 * PhaserGame — the React component that hosts the Phaser canvas.
 *
 * Responsibilities are intentionally narrow:
 *  - Provide a DOM container and create/destroy the game against it.
 *  - Activate the event bridge.
 *  - Render a thin React HUD overlay driven by gameStore (NOT by reading Phaser).
 *
 * It must only ever run on the client — it is loaded via `GameCanvas` with
 * `ssr: false`. Never import this directly into a server component.
 */
export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const setPhase = useGameStore((s) => s.setPhase);
  const phase = useGameStore((s) => s.phase);
  const loadProgress = useGameStore((s) => s.loadProgress);

  useGameBridge();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setPhase('booting');
    GameManager.create(el);

    // Full teardown on unmount so navigating away frees WebGL contexts and the
    // StrictMode double-mount in dev doesn't leak a second canvas.
    return () => {
      GameManager.destroy();
      useGameStore.getState().reset();
    };
  }, [setPhase]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* React HUD overlay — reads gameStore only. */}
      {phase !== 'ready' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 text-white">
          {phase === 'error' ? (
            <span>Failed to load game.</span>
          ) : (
            <span>Loading… {Math.round(loadProgress * 100)}%</span>
          )}
        </div>
      )}
    </div>
  );
}
