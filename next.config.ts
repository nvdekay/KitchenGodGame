import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep server actions tight; raise only when a feature needs larger payloads.
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
