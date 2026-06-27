/** Canonical scene keys. Reference these constants — never raw strings — so
 *  renaming a scene is a single-file change and typos are compile errors. */
export const SceneKeys = {
  Boot: 'BootScene',
  Loading: 'LoadingScene',
  Main: 'MainScene',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
