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
 *  - Hand React-owned data (username, best level) to the engine ONE WAY via the
 *    registry; the engine never reaches back into React.
 *  - Activate the event bridge and render a thin HTML HUD from gameStore.
 *
 * It must only ever run on the client — it is loaded via `GameCanvas` with
 * `ssr: false`. Never import this directly into a server component.
 */
export interface PhaserGameProps {
  username?: string;
  bestLevel?: number;
}

export function PhaserGame({ username = 'Player', bestLevel = 1 }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setPhase = useGameStore((s) => s.setPhase);
  const phase = useGameStore((s) => s.phase);
  const loadProgress = useGameStore((s) => s.loadProgress);
  const level = useGameStore((s) => s.level);
  const score = useGameStore((s) => s.score);

  useGameBridge();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setPhase('booting');
    GameManager.create(el, { username, bestLevel });

    // Full teardown on unmount so navigating away frees WebGL contexts and the
    // StrictMode double-mount in dev doesn't leak a second canvas.
    return () => {
      GameManager.destroy();
      useGameStore.getState().reset();
    };
  }, [setPhase, username, bestLevel]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* React HUD — reads gameStore only (mirrored from Phaser by the bridge). */}
      {phase === 'ready' && (
        <div className="pointer-events-none absolute right-3 top-3 rounded bg-black/60 px-3 py-1 text-sm text-white">
          Màn {level} · Điểm {score}
        </div>
      )}

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
