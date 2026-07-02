import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Overridable so verification builds (CI, tooling) can run beside a live
  // `next dev` without clobbering its .next cache. Unset in normal use/Vercel.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    // Keep server actions tight; raise only when a feature needs larger payloads.
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
