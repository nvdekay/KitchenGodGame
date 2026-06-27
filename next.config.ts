import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Phaser ships a large client bundle. We never want it on the server, and we
  // keep it out of the main app chunk by lazy-loading the game (see src/game/react).
  // `transpilePackages` is not required for Phaser 3.87+, but pin it here if a
  // future Phaser plugin ships untranspiled ESM.
  experimental: {
    // Keep server actions tight; raise only when a feature needs larger payloads.
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
