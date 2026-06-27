# 5 · Phaser Integration Guide

The single most important architectural decision: **Phaser and React are kept
apart, and meet at exactly one bridge.**

## Why isolation matters

- Phaser owns a 60fps game loop and mutable scene graph. React owns a declarative
  UI tree. Mixing them (rendering game entities through React, or driving Phaser
  from React state) causes performance cliffs and impossible-to-debug coupling.
- Phaser also can't run on the server (it needs `window`/WebGL). It must be
  client-only and lazy-loaded so it never bloats the initial bundle.

## The pieces

```
src/game/
├── config.ts                 # Phaser.Game config factory (needs a DOM parent)
├── GameManager.ts            # singleton: create/destroy + typed event API
├── SceneManager.ts           # thin wrapper over Phaser scene transitions
├── events/gameEvents.ts      # INTERNAL game event contract (typed)
├── scenes/
│   ├── keys.ts               # typed scene keys (no magic strings)
│   ├── registry.ts           # scene REGISTRATION list (add scenes here)
│   ├── BootScene.ts          # one-time setup → Loading
│   ├── LoadingScene.ts       # asset preload + progress → Main
│   └── MainScene.ts          # placeholder "running" scene
├── react/
│   ├── GameCanvas.tsx        # dynamic(ssr:false) loader — pages use THIS
│   ├── PhaserGame.tsx        # mounts canvas, owns lifecycle, HUD overlay
│   └── useGameBridge.ts      # THE bridge: game events → store/app-bus
└── index.ts                  # public API
```

## Client-only loading (how Phaser stays off the server)

Pages import **`GameCanvas`**, which is:

```ts
const PhaserGame = dynamic(() => import('./PhaserGame'), { ssr: false });
```

So Phaser is fetched and executed only when a page mounts the canvas. Nothing
server-rendered touches Phaser.

## Lifecycle

```
PhaserGame mounts ─► GameManager.create(container) ─► new Phaser.Game(config)
                                                          │ scene registry boots
   BootScene ──► LoadingScene ──► MainScene
       │              │ load 'progress'  │ create()
       │              ▼                  ▼
   GAME_BOOTED   LOAD_PROGRESS      SCENE_STARTED / SCENE_READY
       └──────────────┴──────────────────┘
                       ▼  (game.events emitter)
            useGameBridge() translates to:
              • gameStore: phase/activeScene/loadProgress  (UI reads this)
              • app eventBus: SCENE_LOADED, GAME_READY      (rest of app reacts)

PhaserGame unmounts ─► GameManager.destroy() ─► frees WebGL + resets gameStore
```

## Event-based communication (both directions)

Scenes and React never reference each other. They exchange typed events over the
game's shared emitter (`this.game.events`), wrapped by `GameManager`.

**Game → React** (notify): scene emits `GameEvents.SCENE_READY`; the bridge sets
`gameStore.phase = 'ready'` and emits `AppEvents.GAME_READY`.

**React → Game** (command): a **client** component calls
`GameManager.emit(GameEvents.CMD_PAUSE, {})`; a scene listens and pauses. Use the
`CMD_*` events for this.

> `GameManager` statically imports Phaser, so it is **client-only** and is
> deliberately NOT re-exported from `@/game`. Import it directly where needed:
> `import { GameManager } from '@/game/GameManager';`. The `@/game` barrel only
> exposes `GameCanvas` plus the pure-constant `GameEvents`/`SceneKeys`, so a
> server component can import it without dragging Phaser into the server bundle.

Add a new event by extending `GameEventMap` in `events/gameEvents.ts` — the
compiler then enforces payloads everywhere.

## Adding a scene (the extension point)

1. Create `scenes/KitchenScene.ts extends Phaser.Scene` with a key in `keys.ts`.
2. Register it in `scenes/registry.ts`.
3. Transition to it via `GameManager.scenes().start(SceneKeys.Kitchen)` (from
   another scene) or a `CMD_START_SCENE` command from React.

That's the whole change — `GameManager`, the bridge, and pages are untouched.

## Asset loading at scale

Today `LoadingScene.preload()` is empty. As features add assets, either queue
them there or have each feature export a `preload(scene)` registered with the
loading scene (see [`06-future-expansion.md`](06-future-expansion.md)). Progress
already flows to the UI via `LOAD_PROGRESS`.

## Rules (do / don't)

| ✅ Do                                             | 🚫 Don't                                        |
| ------------------------------------------------ | ----------------------------------------------- |
| Mount only via `GameCanvas`                      | Import `PhaserGame`/scenes in a server component |
| Talk across the boundary with typed events       | Read Phaser objects from React render            |
| Keep simulation state inside scenes              | Mirror the game world into Zustand               |
| Add scenes to the registry                       | `new Phaser.Game()` outside `GameManager`        |
| Destroy on unmount (handled in `PhaserGame`)     | Leave canvases/WebGL contexts leaking            |
