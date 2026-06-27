import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Phaser's ESM build (dist/phaser.esm.js) exposes only NAMED exports — there
  // is no default export — so game code imports it as `import * as Phaser`.
  // Phaser stays out of the server + initial bundle because the game is
  // lazy-loaded via next/dynamic({ ssr: false }) in game/react/GameCanvas.tsx.
  experimental: {
    // Keep server actions tight; raise only when a feature needs larger payloads.
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
