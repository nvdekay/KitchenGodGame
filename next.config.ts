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
  // Game art is content-stable (files are renamed when they change), so let
  // browsers and the Vercel CDN cache it for a year instead of revalidating
  // every navigation — with ~50 concurrent players that skips thousands of
  // 304 round-trips.
  async headers() {
    return [
      {
        source: '/:dir(home|map|game|chang1|chang2|chang3|end)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
