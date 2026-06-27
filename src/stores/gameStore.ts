import { create } from 'zustand';

/**
 * GameStore — the REACT-SIDE mirror of high-level game status. This is the
 * bridge surface between Phaser and the UI: HUD overlays, "loading…" spinners,
 * and menus read from here.
 *
 * CRITICAL BOUNDARY: this store holds presentation-level status only
 * (is the game booted? which scene is active?). It must NOT become the home for
 * gameplay simulation state (entities, physics, inventory) — that lives inside
 * Phaser scenes. Mirroring the whole game world into React would wreck
 * performance and couple the two runtimes. When a future gameplay feature needs
 * to surface a value to the UI, the scene emits an event and the bridge writes
 * a small, derived field here.
 */

export type GamePhase = 'idle' | 'booting' | 'loading' | 'ready' | 'error';

interface GameState {
  phase: GamePhase;
  activeScene: string | null;
  /** 0..1 asset load progress, surfaced by LoadingScene via the bridge. */
  loadProgress: number;
  setPhase: (phase: GamePhase) => void;
  setActiveScene: (scene: string | null) => void;
  setLoadProgress: (p: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'idle',
  activeScene: null,
  loadProgress: 0,
  setPhase: (phase) => set({ phase }),
  setActiveScene: (activeScene) => set({ activeScene }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  reset: () => set({ phase: 'idle', activeScene: null, loadProgress: 0 }),
}));
