import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fleetflow/shared-types'],
  // Monorepo: stop Next from picking a parent lockfile outside this repo.
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
