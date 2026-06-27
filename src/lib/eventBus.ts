import { createLogger } from './logger';

/**
 * Application-wide, strongly-typed event bus (pub/sub).
 *
 * WHY: decouples producers from consumers. The auth feature can announce
 * USER_LOGIN without knowing the game, analytics, or UI listen for it. New
 * features subscribe; nobody edits the publisher. This is the backbone of the
 * "add features later without refactoring" goal.
 *
 * This is the APP bus (React land, services, stores). Phaser has its OWN bus
 * inside the game instance; the two are bridged deliberately in src/game/react.
 * Keep them separate so game internals never leak React state and vice-versa.
 *
 * HOW TO ADD AN EVENT: add a key to `AppEventMap` below with its payload type.
 * TypeScript then enforces payloads at every emit/subscribe site.
 */

export const AppEvents = {
  // Auth
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  SESSION_REFRESHED: 'SESSION_REFRESHED',
  // Game lifecycle (app-side view of game state — emitted by the bridge)
  GAME_READY: 'GAME_READY',
  SCENE_LOADED: 'SCENE_LOADED',
  LEVEL_COMPLETED: 'LEVEL_COMPLETED',
  // Realtime
  REALTIME_CONNECTED: 'REALTIME_CONNECTED',
  REALTIME_DISCONNECTED: 'REALTIME_DISCONNECTED',
} as const;

export type AppEventName = (typeof AppEvents)[keyof typeof AppEvents];

/**
 * Payload contract per event. Future gameplay events get added HERE first, then
 * the compiler guides you to every place that must handle them.
 * e.g.  CHALLENGE_COMPLETED: { challengeId: string; score: number }
 */
export interface AppEventMap {
  USER_LOGIN: { userId: string };
  USER_LOGOUT: { userId: string | null };
  SESSION_REFRESHED: { userId: string };
  GAME_READY: { sceneKey: string };
  SCENE_LOADED: { sceneKey: string };
  LEVEL_COMPLETED: { level: number; score: number };
  REALTIME_CONNECTED: { channel: string };
  REALTIME_DISCONNECTED: { channel: string };
}

type Handler<E extends AppEventName> = (payload: AppEventMap[E]) => void;

class TypedEventBus {
  private readonly handlers = new Map<AppEventName, Set<Handler<AppEventName>>>();
  private readonly log = createLogger('eventBus');

  /** Subscribe. Returns an unsubscribe function — call it in cleanup. */
  on<E extends AppEventName>(event: E, handler: Handler<E>): () => void {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler as Handler<AppEventName>);
    this.handlers.set(event, set);
    return () => this.off(event, handler);
  }

  off<E extends AppEventName>(event: E, handler: Handler<E>): void {
    this.handlers.get(event)?.delete(handler as Handler<AppEventName>);
  }

  /** Subscribe once; auto-unsubscribes after the first emit. */
  once<E extends AppEventName>(event: E, handler: Handler<E>): () => void {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  emit<E extends AppEventName>(event: E, payload: AppEventMap[E]): void {
    this.log.debug(`emit ${event}`, payload as Record<string, unknown>);
    this.handlers.get(event)?.forEach((h) => {
      try {
        (h as Handler<E>)(payload);
      } catch (err) {
        this.log.error(`handler for ${event} threw`, { err });
      }
    });
  }
}

/** Singleton app bus. */
export const eventBus = new TypedEventBus();
